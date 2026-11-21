// Escenas de "Diseñar workflows" sobre las ramas y los pasos que se agregan con un + en el lienzo:
// el menú "Si responde 404", otro status, el diálogo para elegir el paso, el resultado (el camino
// feliz termina con ✓), el + de una flecha, y un Arazzo que no se puede leer (aviso en el lienzo,
// Ejecutar desactivado y la marca en la barra lateral). Usan un catálogo de prueba propio contra la
// API local de capture.mjs, con un segundo contrato (soporte) para mandar el 404 a otra API.
export default (ctx) => {
  const { ES, T, tmp, API, V, path, writeFileSync, freshPage, moveTo, go, say, saveClip, shot, settle, tab } = ctx
  const L = (es, en) => (ES ? es : en)

  // --- Archivos del catálogo de prueba (nombres propios: no se pisan con los de otras escenas) ---
  const CATALOG_OPENAPI = `openapi: 3.0.3
info: { title: Catalog, version: 1.0.0 }
servers: [{ url: ${API} }]
paths:
  /products:
    get:
      operationId: listProducts
      summary: ${L('Lista los productos', 'List products')}
      responses:
        '200':
          description: ${L('Los productos', 'The products')}
          content:
            application/json:
              schema:
                type: object
                properties:
                  total: { type: integer }
                  items:
                    type: array
                    items:
                      type: object
                      properties: { sku: { type: string }, name: { type: string }, price: { type: number }, stock: { type: integer } }
  /products/{sku}:
    get:
      operationId: getProduct
      summary: ${L('Detalle de un producto', 'Product detail')}
      parameters: [{ name: sku, in: path, required: true, schema: { type: string } }]
      responses:
        '200':
          description: ${L('El producto', 'The product')}
          content:
            application/json:
              schema:
                type: object
                properties: { sku: { type: string }, name: { type: string }, price: { type: number }, stock: { type: integer } }
        '404': { description: ${L('No existe', 'Not found')} }
  /orders:
    post:
      operationId: createOrder
      summary: ${L('Crea un pedido', 'Create an order')}
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                customer: { type: string, example: Ana }
                lines: { type: array, items: { type: object, properties: { sku: { type: string }, qty: { type: integer, example: 1 } } } }
      responses:
        '201':
          description: ${L('Pedido creado', 'Order created')}
          content:
            application/json:
              schema: { type: object, properties: { id: { type: string }, status: { type: string } } }
        '409': { description: ${L('Sin stock', 'Out of stock')} }
`
  const SUPPORT_OPENAPI = `openapi: 3.0.3
info: { title: Support, version: 1.0.0 }
servers: [{ url: ${API} }]
paths:
  /tickets:
    post:
      operationId: openTicket
      summary: ${L('Abre un ticket de soporte', 'Open a support ticket')}
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                subject: { type: string, example: ${L('Producto no encontrado', 'Product not found')} }
                sku: { type: string }
      responses:
        '201':
          description: ${L('Ticket abierto', 'Ticket opened')}
          content:
            application/json:
              schema: { type: object, properties: { id: { type: string } } }
  /notifications:
    post:
      operationId: notifyTeam
      summary: ${L('Avisa al equipo', 'Notify the team')}
      requestBody:
        content:
          application/json:
            schema: { type: object, properties: { message: { type: string } } }
      responses:
        '202': { description: ${L('Aviso enviado', 'Notification sent')} }
`
  const CATALOG_ARAZZO = `arazzo: 1.0.1
info: { title: Catalog, version: 1.0.0 }
sourceDescriptions:
  - { name: catalog, url: ./catalog.openapi.yaml, type: openapi }
  - { name: support, url: ./support.openapi.yaml, type: openapi }
workflows:
  - workflowId: buyProduct
    summary: ${L('Elige un producto, lo consulta y lo pide', 'Pick a product, read it and order it')}
    steps:
      - stepId: listProducts
        operationId: $sourceDescriptions.catalog.listProducts
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          sku: $response.body#/items/0/sku
      - stepId: getProduct
        operationId: $sourceDescriptions.catalog.getProduct
        parameters: [{ name: sku, in: path, value: $steps.listProducts.outputs.sku }]
        successCriteria: [{ condition: $statusCode == 200 }]
      - stepId: createOrder
        operationId: $sourceDescriptions.catalog.createOrder
        requestBody:
          contentType: application/json
          payload:
            customer: Ana
            lines: [{ sku: $steps.listProducts.outputs.sku, qty: 1 }]
        successCriteria: [{ condition: $statusCode == 201 }]
        outputs:
          orderId: $response.body#/id
`
  // Un Arazzo con un error de sintaxis (una llave sin cerrar): la barra lateral lo marca.
  const BROKEN_ARAZZO = `arazzo: 1.0.1
info: { title: Returns, version: 1.0.0
sourceDescriptions:
  - { name: catalog, url: ./catalog.openapi.yaml, type: openapi }
workflows:
  - workflowId: returnProduct
    steps:
      - stepId: getProduct
        operationId: $sourceDescriptions.catalog.getProduct
`
  const files = {
    'catalog.openapi.yaml': CATALOG_OPENAPI,
    'support.openapi.yaml': SUPPORT_OPENAPI,
    'catalog.arazzo.yaml': CATALOG_ARAZZO,
    'returns.arazzo.yaml': BROKEN_ARAZZO,
  }
  for (const [name, text] of Object.entries(files)) writeFileSync(path.join(tmp, name), text)
  const fixture = (...names) => names.map((n) => path.join(tmp, n))

  // --- Ayudas (las mismas ideas que scenes/design.mjs) ---
  const wide = (page, w = 470) => page.evaluate((x) => localStorage.setItem('builder.detailWidth', String(x)), w)
  /** Un workspace con una colección "Catalog" y los archivos indicados. */
  async function openCatalog(page, names = ['catalog.arazzo.yaml', 'catalog.openapi.yaml', 'support.openapi.yaml']) {
    await wide(page)
    await page.locator('.welcome-dialog').waitFor()
    await page.locator('.wd-card', { hasText: T.createWs }).click()
    await page.locator('.wd-form input').first().fill('Demo')
    await page.getByRole('button', { name: T.createWsGo }).click()
    await page.locator('.home').waitFor()
    await page.locator('.home-action', { hasText: T.newCol }).click()
    await page.locator('.home-new input').fill('Catalog')
    await page.locator('.home-new').getByRole('button', { name: T.create }).click()
    await page.locator('.tree-collection.current', { hasText: 'Catalog' }).waitFor()
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.home-action', { hasText: T.importFiles }).click()])
    await chooser.setFiles(fixture(...names))
    await page.locator('.tree-step').first().waitFor()
    await settle(page, 600)
  }
  async function design(page, id) {
    await page.locator(`[data-journey="${id}"]`).first().click()
    await tab(page, 'design').click()
    await page.locator('.builder .graph').waitFor()
    await page.locator('.builder .step-node').first().waitFor()
    await settle(page, 700)
  }
  const node = (page, name) => page.locator('.builder .step-node', { hasText: name }).first()
  const big = (page) => ctx.resize(page, 1600, 1000)
  async function cut(page, name, box, pad = 0) {
    await settle(page)
    const vp = ctx.viewport(page)
    const x = Math.max(0, box.x - pad)
    const y = Math.max(0, box.y - pad)
    await ctx.capture(page, path.join(ctx.OUT, `${name}.png`), { x, y, width: Math.min(vp.width - x, box.width + pad * 2), height: Math.min(vp.height - y, box.height + pad * 2) })
    console.log(`  ✓ ${name}`)
  }
  async function palette(page, show) {
    const btn = page.locator(show ? '.bl-palette-collapsed .icon-btn' : '.bl-palette-head .icon-btn').first()
    if (await btn.count()) await btn.click()
    await settle(page, 300)
  }
  /** Mueve el lienzo (arrastrando el fondo) para que la tarjeta quede a `top` px del borde de arriba. */
  async function bring(page, name, top = 70) {
    const n = name === 'start' ? page.locator('.builder .start-node') : name === 'end' ? page.locator('.builder .end-node') : node(page, name)
    const canvas = page.locator('.builder .graph')
    for (let i = 0; i < 10; i++) {
      const [b, c] = await Promise.all([n.boundingBox(), canvas.boundingBox()])
      if (!b || !c) break
      const dy = b.y - c.y - top
      if (Math.abs(dy) < 8) break
      const step = Math.max(-(c.height - 200), Math.min(c.height - 200, dy))
      const y0 = step > 0 ? c.y + c.height - 70 : c.y + 70
      const x0 = await page.evaluate(([cx, cw, y]) => {
        for (let x = cx + cw - 20; x > cx + 10; x -= 12) {
          const el = document.elementFromPoint(x, y)
          if (el && el.classList.contains('react-flow__pane')) return x
        }
        return cx + cw - 20
      }, [c.x, c.width, y0])
      await page.mouse.move(x0, y0)
      await page.mouse.down()
      await page.mouse.move(x0, y0 - step, { steps: 8 })
      await page.mouse.up()
      await settle(page, 150)
    }
    await settle(page, 300)
  }
  /** Las filas "Si falla" de una tarjeta, por su status (404, success…). */
  const actionRow = (page, step, status) => node(page, step).locator('.sn-action', { has: page.locator('.sn-status', { hasText: new RegExp(`^${status}$`) }) }).first()
  /**
   * Los títulos (title="…") son del sistema y no salen en la captura: se muestra uno igual, con el texto
   * real del elemento, junto al cursor (como aparece al dejarlo encima).
   */
  async function showTitle(page, locator, { below = true, dx = 0 } = {}) {
    await locator.first().evaluate(
      (el, [b, d]) => {
        document.getElementById('demo-title')?.remove()
        const r = el.getBoundingClientRect()
        const tip = document.createElement('div')
        tip.id = 'demo-title'
        tip.textContent = el.getAttribute('title') || el.getAttribute('aria-label') || ''
        Object.assign(tip.style, {
          position: 'fixed', zIndex: 2147483600, left: `${r.left + r.width / 2 + 6 + d}px`, top: b ? `${r.bottom + 8}px` : `${r.top - 32}px`, maxWidth: '360px',
          padding: '4px 8px', background: '#f5f5f5', color: '#1a1a1a', border: '1px solid rgba(0,0,0,.22)', borderRadius: '5px',
          boxShadow: '0 3px 10px rgba(0,0,0,.18)', font: '12px/1.35 -apple-system, system-ui, sans-serif', whiteSpace: 'normal', pointerEvents: 'none',
        })
        document.documentElement.append(tip)
      },
      [below, dx],
    )
  }
  /** Cierra el panel del paso (clic en un lugar vacío del lienzo). */
  async function deselect(page) {
    const b = await page.locator('.builder .graph').boundingBox()
    const x = await page.evaluate(([cx, cw, y]) => {
      for (let x = cx + cw - 20; x > cx + 10; x -= 12) if (document.elementFromPoint(x, y)?.classList.contains('react-flow__pane')) return x
      return cx + cw - 20
    }, [b.x, b.width, b.y + 30])
    await page.mouse.click(x, b.y + 30)
    await settle(page, 400)
  }
  const hideTitle = (page) => page.evaluate(() => document.getElementById('demo-title')?.remove())
  const unionBox = (...boxes) => {
    const x = Math.min(...boxes.map((b) => b.x))
    const y = Math.min(...boxes.map((b) => b.y))
    return { x, y, width: Math.max(...boxes.map((b) => b.x + b.width)) - x, height: Math.max(...boxes.map((b) => b.y + b.height)) - y }
  }
  /** Rompe el YAML del archivo abierto (pestaña YAML) y vuelve a Diseño. */
  async function breakYaml(page) {
    await tab(page, 'yaml').click()
    await page.locator('.cm-content').first().waitFor()
    await settle(page, 800)
    await page.locator('.cm-line', { hasText: 'info:' }).first().click()
    await page.keyboard.press('End')
    await page.keyboard.type(' }}: [', { delay: 20 })
    await page.keyboard.press('Escape')
    await settle(page, 2000)
  }

  const scenes = {}

  // Capturas: el menú de una rama, otro status, elegir el paso, el resultado y el + de una flecha.
  scenes['design-branches'] = async () => {
    const page = await freshPage()
    await big(page)
    await openCatalog(page)
    await design(page, 'buyProduct')
    await palette(page, false)
    // El + de la flecha entre listProducts y getProduct, con su ayuda.
    await bring(page, 'listProducts', 60)
    const plus = page.locator('.sn-insert[data-after="listProducts"]').first()
    await plus.hover()
    await showTitle(page, plus)
    await settle(page, 400)
    {
      const a = await node(page, 'listProducts').boundingBox()
      const p = await plus.boundingBox()
      const g = await node(page, 'getProduct').boundingBox()
      await cut(page, 'design-insert-step', { x: a.x - 40, y: a.y + a.height - 120, width: a.width + 240, height: g.y + 150 - (a.y + a.height - 120) })
      void p
    }
    await hideTitle(page)
    // El menú de la rama: el + junto al 404 de getProduct.
    await bring(page, 'getProduct', 60)
    await actionRow(page, 'getProduct', 404).locator('.sn-branch-btn').click()
    await page.locator('.sn-branch-menu').waitFor()
    await settle(page, 400)
    {
      const card = await node(page, 'getProduct').boundingBox()
      const menu = await page.locator('.sn-branch-menu').boundingBox()
      await cut(page, 'design-branch-menu', unionBox(card, menu), 24)
    }
    await page.keyboard.press('Escape')
    await settle(page, 300)
    // Otro status que el contrato no declara: 429.
    await node(page, 'getProduct').locator('button.sn-branch-other').click()
    await node(page, 'getProduct').locator('form.sn-branch-other input').pressSequentially('429', { delay: 60 })
    await settle(page, 300)
    {
      const card = await node(page, 'getProduct').boundingBox()
      await cut(page, 'design-branch-other', card, 24)
    }
    await node(page, 'getProduct').locator('form.sn-branch-other input').press('Escape')
    await settle(page, 300)
    // Un paso nuevo para el 404: el diálogo con la paleta.
    await actionRow(page, 'getProduct', 404).locator('.sn-branch-btn').click()
    await page.locator('.sn-branch-menu .primary-item').click()
    const dlg = page.locator('.welcome-dialog.rq-dialog').first()
    await dlg.waitFor()
    await dlg.locator('.bl-op', { has: page.locator('.bl-op-path', { hasText: '/tickets' }) }).first().hover()
    await settle(page, 500)
    await shot(page, 'design-branch-pick', dlg)
    await dlg.locator('.bl-op', { has: page.locator('.bl-op-path', { hasText: '/tickets' }) }).first().click()
    await settle(page, 1500)
    // El resultado: el 404 va al paso nuevo y el camino feliz termina antes (✓).
    for (let i = 0; i < 2; i++) {
      await page.locator('.react-flow__controls-zoomout').click()
      await settle(page, 400)
    }
    await bring(page, 'getProduct', 30)
    await cut(page, 'design-branch-done', await page.locator('.bl-main').boundingBox())
    await ctx.done()
  }

  // Un YAML que no se puede leer: el aviso en Diseño, Ejecutar desactivado y la barra lateral.
  scenes['design-broken'] = async () => {
    let page = await freshPage()
    await big(page)
    await openCatalog(page)
    await design(page, 'buyProduct')
    await breakYaml(page)
    await tab(page, 'design').click()
    await page.locator('.ws-yaml-broken').waitFor()
    await settle(page, 800)
    {
      const body = await page.locator('.ws-center-body').boundingBox()
      await cut(page, 'design-yaml-broken', { ...body, height: 130 })
    }
    // Ejecutar, desactivado, con su explicación.
    const runBtn = page.locator('.ws-run').first()
    await runBtn.hover({ force: true })
    await showTitle(page, runBtn, { dx: -300 })
    await settle(page, 400)
    {
      const seg = await page.locator('.ws-runbar .segmented').first().boundingBox()
      const btn = await runBtn.boundingBox()
      const tip = await page.locator('#demo-title').boundingBox()
      await cut(page, 'design-run-disabled', unionBox(seg, btn, tip), 18)
    }
    await hideTitle(page)
    await ctx.done()
    // Un Arazzo que ya llega roto: la barra lateral lo marca y no carga sus workflows.
    page = await freshPage()
    await big(page)
    await openCatalog(page, ['catalog.arazzo.yaml', 'returns.arazzo.yaml', 'catalog.openapi.yaml', 'support.openapi.yaml'])
    const row = page.locator('.tree-file-broken').first()
    await row.waitFor()
    await settle(page, 600)
    {
      const side = await page.locator('aside').first().boundingBox()
      const contracts = await page.locator('aside .tree-row-wrap, aside li', { hasText: 'support' }).last().boundingBox()
      await cut(page, 'sidebar-broken-arazzo', { ...side, height: contracts.y + contracts.height + 24 - side.y }, 0)
    }
    await ctx.done()
  }

  // --------------------------------------------------------------------------------------------
  const C = ES
    ? {
        b1: 'getProduct puede responder 404: hoy no hace nada', b2: 'El + junto al 404: qué hacer si responde eso', b3: 'Un paso nuevo…', b4: 'Elige el paso: abrir un ticket en la API de soporte', b5: 'El 404 ahora va al paso nuevo', b6: 'El camino feliz termina antes de llegar a él: fin ✓',
      }
    : {
        b1: 'getProduct can respond 404: today it does nothing', b2: 'The + next to 404: what to do if it responds that', b3: 'A new step…', b4: 'Pick the step: open a ticket in the support API', b5: 'The 404 now goes to the new step', b6: 'The happy path ends before reaching it: end ✓',
      }

  scenes['clip-design-branch'] = async () => {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await wide(page, 360)
    await openCatalog(page)
    await design(page, 'buyProduct')
    await palette(page, false)
    await bring(page, 'getProduct', 60)
    const from = Date.now()
    await say(page, C.b1, 300)
    await go(page, actionRow(page, 'getProduct', 404), { click: false, pause: 1800 })
    await say(page, C.b2, 300)
    await go(page, actionRow(page, 'getProduct', 404).locator('.sn-branch-btn'), { pause: 1600 })
    await say(page, C.b3, 300)
    await go(page, page.locator('.sn-branch-menu .primary-item'), { pause: 900 })
    const dlg = page.locator('.welcome-dialog.rq-dialog').first()
    await dlg.waitFor()
    await say(page, C.b4, 300)
    const item = dlg.locator('.bl-op', { has: page.locator('.bl-op-path', { hasText: '/tickets' }) }).first()
    await go(page, item, { pause: 1400 })
    // Más lugar para el lienzo: se cierra el panel del paso nuevo.
    await deselect(page)
    await page.locator('.react-flow__controls-zoomout').click()
    await settle(page, 400)
    await bring(page, 'getProduct', 40)
    await say(page, C.b5, 300)
    await go(page, actionRow(page, 'getProduct', 404), { click: false, pause: 2200 })
    await bring(page, 'createOrder', 40)
    await say(page, C.b6, 300)
    await go(page, actionRow(page, 'createOrder', L('éxito', 'success')), { click: false, pause: 2600 })
    await moveTo(page, 1150, 560)
    await settle(page, 1600)
    // Sin leyenda al final: el póster es el último segundo.
    await say(page, '', 1500)
    await saveClip(page, 'design-branch', started, from)
  }

  return scenes
}
