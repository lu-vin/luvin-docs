// Escenas de la sección "Diseñar workflows" con una tienda de prueba propia ("Store", contra la API local
// de capture.mjs): login con token, errores documentados, un body con objetos y listas, una exportación
// que hay que esperar y un segundo archivo Arazzo para usar sus workflows desde otro.
// Este archivo también exporta `helpers` (abrir la tienda, elegir pasos, mover el lienzo…) para las
// demás escenas de diseño (design-*.mjs). Todas las capturas y videos muestran la ventana entera:
// para señalar algo se usa el cursor o una leyenda, nunca un recorte.

/** Las ayudas de las escenas de diseño, sobre las herramientas de capture.mjs. */
export function helpers(ctx) {
  const { ES, T, tmp, path, settle, tab, go, moveTo } = ctx
  const L = (es, en) => (ES ? es : en)
  const fixture = (...names) => names.map((n) => path.join(tmp, n))

  /** Un workspace con una colección (por defecto "Store") y los archivos indicados (ninguno: vacía). */
  async function openStore(page, names = ['store.arazzo.yaml', 'auth.arazzo.yaml', 'store.openapi.yaml'], collection = 'Store') {
    await page.locator('.welcome-dialog').waitFor()
    await page.locator('.wd-card', { hasText: T.createWs }).click()
    await page.locator('.wd-form input').first().fill('Demo')
    await page.getByRole('button', { name: T.createWsGo }).click()
    await page.locator('.home').waitFor()
    await page.locator('.home-action', { hasText: T.newCol }).click()
    await page.locator('.home-new input').fill(collection)
    await page.locator('.home-new').getByRole('button', { name: T.create }).click()
    await page.locator('.tree-collection.current', { hasText: collection }).waitFor()
    if (!names.length) return
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.home-action', { hasText: T.importFiles }).click()])
    await chooser.setFiles(fixture(...names))
    await page.locator('.tree-step').first().waitFor()
    await settle(page, 600)
  }
  /** Abre un workflow en la pestaña Diseño. */
  async function design(page, id) {
    await page.locator(`[data-journey="${id}"]`).first().click()
    await tab(page, 'design').click()
    await page.locator('.builder .graph').waitFor()
    await page.locator('.builder .step-node').first().waitFor()
    await settle(page, 900)
  }
  /** La tarjeta de un paso, por su id (la línea "getPokemon · fuente pokeapi" de la tarjeta). */
  const node = (page, id) =>
    page
      .locator('.builder .react-flow__node-step .step-node')
      .filter({ has: page.locator('.sn-meta', { hasText: new RegExp(`(^|\\s)${id}(\\s|$)`) }) })
      .first()
  const start = (page) => page.locator('.builder .start-node').first()
  const end = (page) => page.locator('.builder .end-node').first()
  const side = (page) => page.locator('.bl-side').first()
  /** Una pestaña del panel del paso: 0 Datos, 1 Éxito y rutas, 2 Autorización, 3 Respuesta. */
  const panelTab = (page, i) => page.locator('.bl-side .bl-tabs [role="tab"]').nth(i)
  /** El + de la barra de pestañas (Crear o importar). */
  const plusBtn = (page) => page.locator('.ws-tabs-tools > .ws-tab-plus').last()

  /** Un punto vacío del fondo del lienzo, a la altura `y` (ni tarjeta, ni línea, ni panel). */
  async function emptyX(page, y) {
    const c = await page.locator('.builder .graph').boundingBox()
    return page.evaluate(
      ([cx, cw, yy]) => {
        for (let x = cx + 20; x < cx + cw - 10; x += 12) {
          const el = document.elementFromPoint(x, yy)
          if (el && el.classList.contains('react-flow__pane')) return x
        }
        return cx + 20
      },
      [c.x, c.width, y],
    )
  }
  /** Mueve el lienzo (arrastrando el fondo) para que `loc` quede a `top` px del borde de arriba del lienzo. */
  async function bring(page, loc, top = 70) {
    const canvas = page.locator('.builder .graph')
    for (let i = 0; i < 10; i++) {
      const [b, c] = await Promise.all([loc.boundingBox(), canvas.boundingBox()])
      if (!b || !c) break
      const dy = b.y - c.y - top
      if (Math.abs(dy) < 8) break
      const step = Math.max(-(c.height - 220), Math.min(c.height - 220, dy))
      const y0 = step > 0 ? c.y + c.height - 90 : c.y + 90
      const x0 = await emptyX(page, y0)
      await page.mouse.move(x0, y0)
      await page.mouse.down()
      await page.mouse.move(x0, y0 - step, { steps: 8 })
      await page.mouse.up()
      await settle(page, 150)
    }
    await settle(page, 300)
  }
  /** Elige un paso: lo trae a la vista y abre su panel. */
  async function select(page, id, top = 150) {
    await bring(page, node(page, id), top)
    await node(page, id).locator('.sn-title').first().click()
    await side(page).locator('.bl-tabs').waitFor()
    await settle(page, 700)
  }
  /** Abre el panel de Inicio o del Fin. */
  async function selectFlow(page, which, top = 90) {
    const loc = which === 'start' ? start(page) : end(page)
    await bring(page, loc, top)
    await loc.click({ position: { x: 40, y: 14 } })
    await settle(page, 700)
  }
  /** Cierra el panel (clic en un lugar vacío del lienzo). */
  async function deselect(page) {
    const c = await page.locator('.builder .graph').boundingBox()
    const y = c.y + c.height - 140
    await page.mouse.click(await emptyX(page, y), y)
    await settle(page, 400)
  }
  /** Lleva una sección del panel a la vista (el panel tiene su propio scroll). */
  const panelScroll = async (page, loc, block = 'start') => {
    await loc.first().evaluate((el, b) => el.scrollIntoView({ block: b }), block)
    await settle(page, 300)
  }
  /** Aleja (n < 0) o acerca (n > 0) el lienzo con la barra de zoom. */
  async function zoom(page, n) {
    const btn = page.locator('.zoom-bar button.icon-btn').nth(n < 0 ? 0 : 1)
    for (let i = 0; i < Math.abs(n); i++) {
      await btn.click()
      await settle(page, 400)
    }
  }
  /** ＋ Paso: busca `query` y elige la primera fila que la contiene. */
  async function addFromQuick(page, query, { pick } = {}) {
    await page.locator('.bl-add-step').click()
    const quick = page.locator('.bl-quick')
    await quick.waitFor()
    await quick.locator('input').first().fill(query)
    await settle(page, 400)
    await quick.locator('.bl-op', { hasText: pick ?? query }).first().click()
    await settle(page, 1200)
  }
  /** Un Arazzo nuevo desde el + de las pestañas. */
  async function newArazzo(page) {
    await plusBtn(page).click()
    await page.locator('.context-menu [role="menuitem"]', { hasText: L('Nuevo Arazzo', 'New Arazzo') }).first().click()
    await page.locator('.builder .graph').waitFor()
    await settle(page, 1200)
  }
  /** El editor de la pestaña YAML (CodeMirror). */
  const cmView = (page) => page.locator('.cm-content').first()
  /** Cambia el YAML del workflow abierto (en la pestaña YAML) y vuelve a Diseño. */
  async function editYaml(page, change, back = true) {
    await tab(page, 'yaml').click()
    await cmView(page).waitFor()
    await settle(page, 600)
    await cmView(page).evaluate((el, src) => {
      const view = el.cmTile?.view ?? el.cmView?.view ?? el.cmView?.rootView?.view
      const text = view.state.doc.toString()
      // eslint-disable-next-line no-new-func
      const next = new Function('text', `return (${src})(text)`)(text)
      view.dispatch({ changes: { from: 0, to: text.length, insert: next } })
    }, change.toString())
    await settle(page, 1500)
    if (back) {
      await tab(page, 'design').click()
      await page.locator('.builder .graph').waitFor()
      await settle(page, 1000)
    }
  }

  /**
   * El menú de una lista nativa (<select>) es del sistema y no sale en la captura: se muestra uno igual,
   * con sus opciones reales (los mismos textos y grupos) debajo de la lista, como se ve al abrirla.
   */
  async function showOptions(page, select, highlight) {
    await select.scrollIntoViewIfNeeded().catch(() => {})
    await select.evaluate((el, hl) => {
      document.getElementById('demo-select')?.remove()
      const r = el.getBoundingClientRect()
      const menu = document.createElement('div')
      menu.id = 'demo-select'
      const css = getComputedStyle(document.body)
      const below = window.innerHeight - r.bottom - 12
      Object.assign(menu.style, {
        position: 'fixed', left: `${r.left}px`, top: `${r.bottom + 2}px`, minWidth: `${r.width}px`, maxWidth: '420px', zIndex: 2147483600,
        background: 'Canvas', color: 'CanvasText', border: '1px solid rgba(0,0,0,.25)', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,.22)',
        font: `13px/1.35 ${css.fontFamily}`, padding: '4px 0', maxHeight: `${Math.max(160, below)}px`, overflow: 'hidden',
      })
      const row = (text, opts = {}) => {
        const d = document.createElement('div')
        d.textContent = text
        Object.assign(d.style, { padding: opts.group ? '5px 10px 2px' : `3px 10px 3px ${opts.inGroup ? 22 : 10}px`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: opts.group ? '700' : '400', opacity: opts.group ? 0.75 : 1 })
        if (opts.on) Object.assign(d.style, { background: '#2f6fde', color: '#fff' })
        menu.append(d)
      }
      for (const child of el.children) {
        if (child.tagName === 'OPTGROUP') {
          row(child.label, { group: true })
          for (const o of child.children) row(o.textContent, { inGroup: true, on: hl ? o.textContent.trim().startsWith(hl) || o.value === hl : o.selected })
        } else row(child.textContent, { on: hl ? child.textContent.trim().startsWith(hl) || child.value === hl : child.selected })
      }
      document.documentElement.append(menu)
      // Si no cabe debajo, se abre hacia arriba, como el menú del sistema.
      const m = menu.getBoundingClientRect()
      if (below < 220 && r.top > below) Object.assign(menu.style, { top: 'auto', bottom: `${window.innerHeight - r.top + 2}px`, maxHeight: `${r.top - 12}px` })
    }, highlight)
    await settle(page, 300)
  }
  const hideOptions = (page) => page.evaluate(() => document.getElementById('demo-select')?.remove())
  /** Elige una opción de una lista nativa por su texto (sin video). */
  async function choose(select, label) {
    const value = await select.evaluate((el, l) => [...el.options].find((o) => o.textContent.trim() === l || o.textContent.includes(l))?.value, label)
    if (value === undefined) throw new Error(`no hay opción "${label}"`)
    await select.selectOption(value)
  }
  /** En un video: abre la lista, lleva el cursor a la opción y la elige. */
  async function pick(page, select, label, { pause = 900 } = {}) {
    await go(page, select, { pause: 250 })
    await showOptions(page, select)
    await settle(page, 400)
    const item = page.locator('#demo-select div', { hasText: label }).first()
    await item.evaluate((d) => d.scrollIntoView({ block: 'nearest' })).catch(() => {})
    const b = await item.boundingBox()
    if (b) {
      await moveTo(page, b.x + Math.min(b.width / 2, 120), b.y + b.height / 2)
      await item.evaluate((d) => Object.assign(d.style, { background: '#2f6fde', color: '#fff' }))
      await settle(page, 350)
      await page.mouse.down()
      await page.mouse.up()
    }
    await hideOptions(page)
    await choose(select, label)
    await settle(page, pause)
  }
  /**
   * Los títulos (title="…") son del sistema y no salen en la captura: se muestra uno igual, con el texto
   * real del elemento, junto a él (como aparece al dejar el mouse encima).
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
          position: 'fixed', zIndex: 2147483600, left: `${Math.min(r.left + r.width / 2 + 6 + d, window.innerWidth - 370)}px`, top: b ? `${r.bottom + 8}px` : `${r.top - 32}px`, maxWidth: '360px',
          padding: '4px 8px', background: '#f5f5f5', color: '#1a1a1a', border: '1px solid rgba(0,0,0,.22)', borderRadius: '5px',
          boxShadow: '0 3px 10px rgba(0,0,0,.18)', font: '12px/1.35 -apple-system, system-ui, sans-serif', whiteSpace: 'pre-line', pointerEvents: 'none',
        })
        document.documentElement.append(tip)
      },
      [below, dx],
    )
    await settle(page, 200)
  }
  const hideTitle = (page) => page.evaluate(() => document.getElementById('demo-title')?.remove())
  /** Una línea del YAML (CodeMirror solo dibuja las que se ven: se baja hasta encontrarla). */
  async function yamlLine(page, text) {
    const scroller = page.locator('.editor-code .cm-scroller, .cm-scroller').first()
    await scroller.evaluate((el) => el.scrollTo(0, 0))
    for (let i = 0; i < 60; i++) {
      const line = page.locator('.cm-line', { hasText: text }).first()
      if (await line.count()) {
        await line.evaluate((el) => el.scrollIntoView({ block: 'center' }))
        await settle(page, 200)
        return line
      }
      await scroller.evaluate((el) => el.scrollBy(0, el.clientHeight * 0.7))
      await settle(page, 120)
    }
    throw new Error(`no encontré "${text}" en el YAML`)
  }
  /** La fila de una ruta o un status en la sección Si falla de una tarjeta. */
  const failRow = (page, id, status) => node(page, id).locator('.sn-action', { has: page.locator('.sn-status', { hasText: new RegExp(`^${status}$`) }) }).first()
  /** El editor de rutas abierto. */
  const routeDialog = (page) => page.locator('.route-dialog').first()
  /** En el editor de rutas: escribe el status (si hay campo) y elige qué hacer (por su texto). */
  async function routeKind(page, kind) {
    await routeDialog(page).locator(`.rd-kind[data-kind="${kind}"]`).first().click()
    await settle(page, 400)
  }
  async function routeStatus(page, status) {
    const input = routeDialog(page).locator('#rd-status').first()
    await input.fill(String(status))
    await settle(page, 300)
  }
  /** Confirma el editor de rutas (Agregar o Guardar). */
  async function routeSubmit(page) {
    await routeDialog(page).locator('.rd-actions button.primary').click()
    await settle(page, 900)
    await closeNotice(page)
  }
  /** Cierra el aviso de arriba del lienzo (ruta agregada, token conectado…), si hay uno. */
  async function closeNotice(page) {
    const x = page.locator('.bl-token-notice .icon-btn')
    while (await x.count()) {
      await x.first().click()
      await settle(page, 300)
    }
  }
  const undoBtn = (page) => page.locator('.bl-toolbar .icon-btn').first()

  return { L, closeNotice, fixture, openStore, design, node, start, end, side, panelTab, plusBtn, emptyX, bring, select, selectFlow, deselect, panelScroll, zoom, addFromQuick, newArazzo, editYaml, showOptions, hideOptions, choose, pick, showTitle, hideTitle, yamlLine, failRow, routeDialog, routeKind, routeStatus, routeSubmit, undoBtn }
}

export default (ctx) => {
  const { ES, API, tmp, path, writeFileSync, freshPage, shot, settle, tab, done } = ctx
  const h = helpers(ctx)
  const { L, closeNotice, openStore, design, node, start, end, side, panelTab, bring, select, selectFlow, deselect, panelScroll, zoom, addFromQuick, showOptions, hideOptions, choose, yamlLine, failRow, routeDialog, routeKind, routeStatus, routeSubmit, undoBtn } = h

  // --- Archivos de la tienda de prueba ---
  const STORE_OPENAPI = `openapi: 3.0.3
info: { title: Store, version: 1.0.0 }
servers: [{ url: ${API} }]
security: [{ bearerAuth: [] }]
paths:
  /login:
    post:
      operationId: login
      summary: ${L('Inicia sesión', 'Log in')}
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [username, password]
              properties:
                username: { type: string, example: ana }
                password: { type: string, example: secret }
      responses:
        '200':
          description: ${L('Sesión iniciada', 'Logged in')}
          content:
            application/json:
              schema:
                type: object
                properties:
                  accessToken: { type: string }
                  expiresIn: { type: integer }
        '401': { description: ${L('Usuario o clave incorrectos', 'Wrong user or password')} }
  /products:
    get:
      operationId: listProducts
      summary: ${L('Lista los productos', 'List products')}
      parameters:
        - { name: limit, in: query, schema: { type: integer, example: 10 } }
        - { name: offset, in: query, schema: { type: integer, example: 0 } }
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
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [customer]
              properties:
                customer: { type: string, example: Ana }
                currency: { type: string, example: EUR }
                address:
                  type: object
                  properties: { city: { type: string, example: Madrid }, zip: { type: string, example: '28001' } }
                lines:
                  type: array
                  items: { type: object, properties: { sku: { type: string }, qty: { type: integer, example: 1 } } }
      responses:
        '201':
          description: ${L('Pedido creado', 'Order created')}
          content:
            application/json:
              schema:
                type: object
                properties: { id: { type: string }, status: { type: string } }
        '400': { description: ${L('Datos inválidos', 'Invalid data')} }
        '401': { description: ${L('Sin sesión', 'Not logged in')} }
        '409': { description: ${L('Sin stock', 'Out of stock')} }
        '429': { description: ${L('Demasiadas solicitudes', 'Too many requests')} }
  /orders/{orderId}:
    get:
      operationId: getOrder
      summary: ${L('Consulta un pedido', 'Get an order')}
      parameters:
        - { name: orderId, in: path, required: true, schema: { type: string } }
      responses:
        '200':
          description: ${L('El pedido', 'The order')}
          content:
            application/json:
              schema:
                type: object
                properties: { id: { type: string }, status: { type: string }, total: { type: number } }
        '404': { description: ${L('No existe', 'Not found')} }
        '429': { description: ${L('Demasiadas solicitudes', 'Too many requests')} }
  /exports:
    post:
      operationId: startExport
      summary: ${L('Inicia una exportación', 'Start an export')}
      security: []
      responses:
        '202':
          description: ${L('Exportación iniciada', 'Export started')}
          content:
            application/json:
              schema: { type: object, properties: { id: { type: string }, status: { type: string } } }
  /exports/{id}:
    get:
      operationId: getExport
      summary: ${L('Consulta la exportación', 'Get the export')}
      security: []
      parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
      responses:
        '200':
          description: ${L('La exportación', 'The export')}
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: { type: string }
                  status: { type: string, enum: [pending, done] }
                  url: { type: string }
components:
  securitySchemes:
    bearerAuth: { type: http, scheme: bearer }
`
  const STORE_ARAZZO = `arazzo: 1.0.1
info: { title: Store, version: 1.0.0 }
sourceDescriptions:
  - { name: store, url: ./store.openapi.yaml, type: openapi }
  - { name: auth, url: ./auth.arazzo.yaml, type: arazzo }
workflows:
  - workflowId: placeOrder
    summary: ${L('Inicia sesión, crea un pedido y lo consulta', 'Log in, create an order and read it back')}
    inputs:
      type: object
      required: [username, password]
      properties:
        username: { type: string, example: ana }
        password: { type: string, example: secret }
    steps:
      - stepId: login
        operationId: $sourceDescriptions.store.login
        requestBody:
          contentType: application/json
          payload: { username: $inputs.username, password: $inputs.password }
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          token: $response.body#/accessToken
      - stepId: listProducts
        operationId: $sourceDescriptions.store.listProducts
        parameters:
          - { name: Authorization, in: header, value: 'Bearer {$steps.login.outputs.token}' }
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          sku: $response.body#/items/0/sku
      - stepId: createOrder
        operationId: $sourceDescriptions.store.createOrder
        parameters:
          - { name: Authorization, in: header, value: 'Bearer {$steps.login.outputs.token}' }
        requestBody:
          contentType: application/json
          payload:
            customer: Ana
            currency: EUR
            address: { city: Madrid, zip: '28001' }
            lines: [{ sku: $steps.listProducts.outputs.sku, qty: 1 }]
        successCriteria: [{ condition: $statusCode == 201 }]
        outputs:
          orderId: $response.body#/id
      - stepId: getOrder
        operationId: $sourceDescriptions.store.getOrder
        parameters:
          - { name: orderId, in: path, value: $steps.createOrder.outputs.orderId }
          - { name: Authorization, in: header, value: 'Bearer {$steps.login.outputs.token}' }
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          status: $response.body#/status
    outputs:
      orderId: $steps.createOrder.outputs.orderId
  - workflowId: quickOrder
    summary: ${L('Inicia sesión y crea un pedido', 'Log in and create an order')}
    inputs:
      type: object
      required: [username, password]
      properties:
        username: { type: string, example: ana }
        password: { type: string, example: secret }
    steps:
      - stepId: login
        operationId: $sourceDescriptions.store.login
        requestBody:
          contentType: application/json
          payload: { username: $inputs.username, password: $inputs.password }
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          token: $response.body#/accessToken
      - stepId: listProducts
        operationId: $sourceDescriptions.store.listProducts
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          sku: $response.body#/items/0/sku
      - stepId: createOrder
        operationId: $sourceDescriptions.store.createOrder
        requestBody:
          contentType: application/json
          payload:
            customer: Ana
            lines: [{ sku: $steps.listProducts.outputs.sku, qty: 1 }]
        successCriteria: [{ condition: $statusCode == 201 }]
  - workflowId: browseProducts
    summary: ${L('Lista los productos y abre uno', 'List the products and open one')}
    inputs:
      type: object
      required: [limit]
      properties:
        limit: { type: integer, example: 5 }
    steps:
      - stepId: listProducts
        operationId: $sourceDescriptions.store.listProducts
        parameters: [{ name: limit, in: query, value: $inputs.limit }]
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          sku: $response.body#/items/0/sku
      - stepId: getProduct
        operationId: $sourceDescriptions.store.getProduct
        parameters: [{ name: sku, in: path, value: $steps.listProducts.outputs.sku }]
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          price: $response.body#/price
    outputs:
      sku: $steps.listProducts.outputs.sku
      price: $steps.getProduct.outputs.price
  - workflowId: exportProducts
    summary: ${L('Exporta los productos', 'Export the products')}
    steps:
      - stepId: startExport
        operationId: $sourceDescriptions.store.startExport
        successCriteria: [{ condition: $statusCode == 202 }]
        outputs:
          id: $response.body#/id
`
  const AUTH_ARAZZO = `arazzo: 1.0.1
info: { title: Auth, version: 1.0.0 }
sourceDescriptions:
  - { name: store, url: ./store.openapi.yaml, type: openapi }
workflows:
  - workflowId: login
    summary: ${L('Inicia sesión y devuelve el token', 'Log in and return the token')}
    inputs:
      type: object
      properties:
        username: { type: string, example: ana }
        password: { type: string, example: secret }
    steps:
      - stepId: login
        operationId: $sourceDescriptions.store.login
        requestBody:
          contentType: application/json
          payload: { username: $inputs.username, password: $inputs.password }
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          token: $response.body#/accessToken
    outputs:
      token: $steps.login.outputs.token
`
  const files = { 'store.openapi.yaml': STORE_OPENAPI, 'store.arazzo.yaml': STORE_ARAZZO, 'auth.arazzo.yaml': AUTH_ARAZZO }
  for (const [name, text] of Object.entries(files)) writeFileSync(path.join(tmp, name), text)

  const scenes = {}

  // Datos de un paso: el body como JSON, parámetros opcionales, outputs, el Fin, dependencias y llamar a otro workflow.
  scenes['design-store'] = async () => {
    const page = await freshPage()
    await openStore(page)
    await design(page, 'placeOrder')
    // Body: editar como JSON.
    await select(page, 'createOrder')
    await side(page).getByRole('button', { name: L('Editar como JSON', 'Edit as JSON') }).first().click()
    await settle(page, 500)
    await panelScroll(page, side(page).locator('textarea').first())
    await shot(page, 'design-body-json')
    await side(page).getByRole('button', { name: L('Cancelar', 'Cancel') }).first().click()
    await settle(page, 300)
    // Valores fijos: → input junto a currency.
    await deselect(page)
    await bring(page, node(page, 'createOrder'), 170)
    await node(page, 'createOrder').locator('.sn-row', { hasText: 'currency' }).first().hover()
    await settle(page, 500)
    await shot(page, 'design-promote-one')
    // Elegir varios a la vez desde Inicio.
    await bring(page, start(page), 120)
    await start(page).locator('.sp-promote').click()
    const dlg = page.locator('.welcome-dialog.rq-dialog').first()
    await dlg.waitFor()
    await dlg.locator('.vary-row', { hasText: 'currency' }).locator('input').check()
    await dlg.locator('.vary-row', { hasText: 'address/city' }).locator('input').check()
    await settle(page, 400)
    await shot(page, 'design-pick-data')
    await dlg.locator('button.primary').click()
    await settle(page, 900)
    await selectFlow(page, 'start', 120)
    await shot(page, 'design-promoted')
    await undoBtn(page).click()
    await settle(page, 600)
    await deselect(page)
    // listProducts: los parámetros opcionales sin enviar, desplegados.
    await select(page, 'listProducts')
    await side(page).locator('.bl-unsent .link').first().click()
    await settle(page, 400)
    await shot(page, 'design-optional-params-open')
    // Sus outputs: los campos de la respuesta, con la lista entera.
    await side(page).locator('.bl-head-row .link', { hasText: 'Output' }).first().click()
    await settle(page, 400)
    await panelScroll(page, side(page).locator('.bl-chip').first(), 'center')
    await shot(page, 'design-list-outputs')
    await deselect(page)
    // Fin del workflow: sus outputs.
    await selectFlow(page, 'end', 260)
    await shot(page, 'design-workflow-outputs')
    // Inicio: depender de otro workflow, de este archivo o de otro.
    await selectFlow(page, 'start', 120)
    const dep = side(page).locator('.bl-section select').first()
    await showOptions(page, dep, 'Login')
    await shot(page, 'design-depends-options')
    await hideOptions(page)
    await choose(dep, L('Login · Inicia', 'Login · Log in'))
    await settle(page, 900)
    await deselect(page)
    await bring(page, page.locator('.builder .deps-node').first(), 160)
    await shot(page, 'design-depends-card')
    await undoBtn(page).click()
    await settle(page, 600)
    // Llamar a otro workflow como paso: browseProducts al final, y sus pasos en la tarjeta.
    await addFromQuick(page, 'browseProducts')
    await shot(page, 'design-call-workflow')
    await deselect(page)
    const called = page.locator('.builder .step-node', { has: page.locator('.sn-sub-toggle') }).first()
    await bring(page, called, 120)
    await called.locator('.sn-sub-toggle').click()
    await settle(page, 600)
    await shot(page, 'design-sub-steps')
    await undoBtn(page).click()
    await settle(page, 600)
    // Cobertura de respuestas en la pestaña Resumen.
    await tab(page, 'overview').click()
    const cov = page.locator('.section', { hasText: L('Cobertura de respuestas', 'Response coverage') }).first()
    await cov.waitFor()
    if (!(await cov.locator('table').count())) await cov.locator('.section-toggle').first().click()
    await cov.locator('table').waitFor()
    await cov.evaluate((el) => el.scrollIntoView({ block: 'start' }))
    await settle(page, 600)
    await shot(page, 'design-coverage')
    await done()
  }

  // Organizar: datos que faltan, el orden, quitar un paso, el menú del archivo y el YAML.
  scenes['design-store2'] = async () => {
    const page = await freshPage()
    await openStore(page)
    await design(page, 'placeOrder')
    // Lo que falta: se borra un input que un paso usa.
    await selectFlow(page, 'start', 120)
    await side(page).locator('.bl-output-custom', { hasText: 'username' }).locator('.icon-btn.danger').click()
    await settle(page, 900)
    await deselect(page)
    await bring(page, start(page), 160)
    await shot(page, 'design-gaps-bar')
    await page.locator('.bl-gaps button.primary').click()
    await settle(page, 800)
    // Orden: getOrder sube por encima de createOrder (⌥↑).
    await select(page, 'getOrder', 300)
    await page.keyboard.press('Alt+ArrowUp')
    await settle(page, 900)
    await deselect(page)
    await bring(page, node(page, 'getOrder'), 160)
    await shot(page, 'design-order-warning')
    await page.locator('.callout.warn .link').first().click()
    await settle(page, 500)
    const closeWarn = page.locator('.callout.warn .link')
    if (await closeWarn.count()) await closeWarn.last().click()
    await settle(page, 400)
    // Quitar un paso que otros usan: primero pregunta.
    await bring(page, node(page, 'listProducts'), 120)
    await node(page, 'listProducts').locator('.sn-win-remove').click()
    await page.locator('.remove-dialog').waitFor()
    await settle(page, 400)
    await shot(page, 'design-remove-confirm')
    await page.locator('.remove-dialog .remove-actions button.danger').click()
    await settle(page, 900)
    await bring(page, node(page, 'createOrder'), 200)
    await shot(page, 'design-dangling')
    await undoBtn(page).click()
    await settle(page, 600)
    // Menú del archivo en la barra lateral.
    const fileRow = page.locator('.tree-row-wrap', { has: page.locator('.tree-file', { hasText: 'store.arazzo.yaml' }) }).first()
    await fileRow.hover()
    await fileRow.locator('.row-menu-btn').first().click()
    await settle(page, 400)
    await shot(page, 'design-file-menu')
    await page.keyboard.press('Escape')
    // YAML: autocompletar después de $steps. y un error.
    await tab(page, 'yaml').click()
    await page.locator('.cm-content').first().waitFor()
    await settle(page, 800)
    const line = await yamlLine(page, 'value: $steps.createOrder.outputs.orderId')
    await line.click()
    await page.keyboard.press('End')
    // La línea es un mapa en una línea ({ name: …, value: … }): se salta la llave del final.
    await page.keyboard.press('ArrowLeft')
    for (let i = 0; i < 'createOrder.outputs.orderId'.length + 1; i++) await page.keyboard.press('Backspace')
    await page.keyboard.type('.', { delay: 80 })
    await page.locator('.cm-tooltip-autocomplete').waitFor({ timeout: 5000 }).catch(() => {})
    await settle(page, 600)
    await shot(page, 'design-yaml-autocomplete')
    await page.keyboard.press('Escape')
    await page.keyboard.type('createOrdr.outputs.orderId', { delay: 20 })
    await page.keyboard.press('Escape')
    await settle(page, 2500)
    await shot(page, 'design-yaml-problems')
    await done()
  }

  // Rutas de createOrder: los status sin ruta, ir a otro paso (la línea), el orden, las reglas de Inicio,
  // seguir en otro workflow y un reutilizable.
  scenes['design-store-routes'] = async () => {
    const page = await freshPage()
    await openStore(page)
    await design(page, 'placeOrder')
    // Los status del contrato sin ruta, con sus tres botones, en Éxito y rutas.
    await select(page, 'createOrder')
    await panelTab(page, 1).click()
    await settle(page, 600)
    await panelScroll(page, side(page).locator('.rs-unhandled').first())
    await shot(page, 'design-route-unhandled')
    // 409: ir a listProducts. La línea roja punteada va por la izquierda hasta ese paso.
    await deselect(page)
    await bring(page, node(page, 'createOrder'), 40)
    await failRow(page, 'createOrder', 409).locator('.sn-branch-btn').click()
    await routeDialog(page).waitFor()
    await routeKind(page, 'goto')
    await choose(routeDialog(page).locator('#rd-to'), L('Lista los productos', 'List products'))
    await settle(page, 400)
    await routeSubmit(page)
    // 429: reintentar (con los valores de fábrica).
    await failRow(page, 'createOrder', 429).locator('.sn-branch-btn').click()
    await routeDialog(page).waitFor()
    await routeKind(page, 'retry')
    await routeSubmit(page)
    await deselect(page)
    await zoom(page, -2)
    await bring(page, node(page, 'listProducts'), 150)
    await shot(page, 'design-jump-line')
    await zoom(page, +2)
    // Las rutas en el panel, en orden.
    await select(page, 'createOrder')
    await panelTab(page, 1).click()
    await settle(page, 600)
    await panelScroll(page, side(page).locator('.bl-routes').first())
    await shot(page, 'design-routes-panel')
    // Reglas para todos los pasos: un 401 termina el workflow.
    await selectFlow(page, 'start', 120)
    await side(page).locator('.bl-add-rule').click()
    await routeDialog(page).waitFor()
    await routeStatus(page, 401)
    await routeKind(page, 'end')
    await routeSubmit(page)
    await selectFlow(page, 'start', 120)
    await panelScroll(page, side(page).locator('.bl-rules').first())
    await shot(page, 'design-start-rules')
    // Seguir en otro workflow: el 404 de getOrder sigue en browseProducts. La caja de salida, bajo el Fin.
    await deselect(page)
    await bring(page, node(page, 'getOrder'), 40)
    await failRow(page, 'getOrder', 404).locator('.sn-branch-btn').click()
    await routeDialog(page).waitFor()
    await routeKind(page, 'flow')
    await choose(routeDialog(page).locator('#rd-flow'), 'rowse')
    await settle(page, 400)
    await routeSubmit(page)
    await deselect(page)
    await bring(page, end(page), 260)
    await shot(page, 'design-route-exit')
    await done()
  }

  // El token del login: compartirlo desde el login, el lienzo, la pestaña de un paso y la del workflow.
  scenes['design-auth'] = async () => {
    const page = await freshPage()
    await openStore(page)
    await design(page, 'quickOrder')
    await select(page, 'login')
    await panelScroll(page, side(page).locator('.bl-signin').first())
    await side(page).locator('.bl-signin button').first().click()
    await page.locator('.bl-token-notice').waitFor()
    await settle(page, 600)
    await shot(page, 'auth-token-share')
    // El lienzo: 🔑 inicia sesión, 🔑 en los otros pasos y Autorización encendida en Ver.
    await closeNotice(page)
    await deselect(page)
    const authChip = page.locator('.graph-float.right button', { hasText: L('Autorización', 'Authorization') }).first()
    if (await authChip.count()) await authChip.click()
    await settle(page, 400)
    await bring(page, node(page, 'login'), 150)
    await shot(page, 'auth-token-canvas')
    if (await authChip.count()) await authChip.click()
    // La pestaña Autorización de un paso sale de design-requests.mjs (el login de una colección de Postman).
    // La pestaña Autorización del workflow: el token de un paso de este workflow.
    await tab(page, 'auth').click()
    await page.locator('.flow-auth').waitFor()
    await settle(page, 600)
    const scope = page.locator('.flow-auth').getByText(L('Solo este workflow', 'This workflow only')).first()
    if (await scope.count()) await scope.click()
    await settle(page, 400)
    const type = page.locator('.flow-auth select').filter({ has: page.locator('option', { hasText: L('Token de un paso de este workflow', 'Token from a step of this workflow') }) }).first()
    await choose(type, L('Token de un paso de este workflow', 'Token from a step of this workflow'))
    await settle(page, 800)
    await shot(page, 'auth-token-tab')
    await done()
  }

  // Patrones: Esperar hasta que termine, aplicado a GET /exports/{id}.
  scenes['design-patterns'] = async () => {
    const page = await freshPage()
    await openStore(page)
    await design(page, 'exportProducts')
    await select(page, 'startExport')
    await page.locator('.bl-add-step').click()
    const quick = page.locator('.bl-quick')
    await quick.waitFor()
    await quick.locator('.bl-op-pattern', { hasText: L('Esperar hasta que termine', 'Wait until it finishes') }).click()
    await settle(page, 600)
    await shot(page, 'design-patterns-menu')
    await quick.locator('.bl-op', { hasText: '/exports/{id}' }).first().click()
    await settle(page, 1500)
    await deselect(page)
    await zoom(page, -1)
    await bring(page, node(page, 'getExport'), 150)
    await shot(page, 'design-pattern-poll')
    await done()
  }

  return scenes
}
