// Escenas de la sección "Diseñar workflows": capturas (design-*) y videos (clip-design-*).
// Usan la Pokédex, PayPal y una tienda de prueba propia ("Store", contra la API local de capture.mjs)
// con lo que hace falta para mostrar cada caso: login con token, errores documentados, un body con
// objetos y listas, y un segundo archivo Arazzo para usar sus workflows desde otro.
export default (ctx) => {
  const { ES, T, tmp, API, V, path, writeFileSync, freshPage, moveTo, go, say, saveClip, shot, clip, settle, tab, openPokedex, openPaypal, focusStep } = ctx
  const L = (es, en) => (ES ? es : en)

  // --- Archivos de la tienda de prueba ---
  const STORE_OPENAPI = `openapi: 3.0.3
info: { title: Store, version: 1.0.0 }
servers: [{ url: ${API} }]
paths:
  /login:
    post:
      operationId: login
      summary: ${L('Inicia sesión', 'Log in')}
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
      parameters:
        - { name: Authorization, in: header, required: true, schema: { type: string, example: Bearer <token> } }
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
        - { name: Authorization, in: header, required: true, schema: { type: string } }
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
  const files = {
    'store.openapi.yaml': STORE_OPENAPI,
    'store.arazzo.yaml': STORE_ARAZZO,
    'auth.arazzo.yaml': AUTH_ARAZZO,
  }
  for (const [name, text] of Object.entries(files)) writeFileSync(path.join(tmp, name), text)
  const fixture = (...names) => names.map((n) => path.join(tmp, n))

  // --- Ayudas ---
  /** Un workspace con una colección "Store" y los archivos indicados. */
  async function openStore(page, names = ['store.arazzo.yaml', 'auth.arazzo.yaml', 'store.openapi.yaml']) {
    await wide(page)
    if (!names.length) {
      // Solo el workspace y una colección vacía (para trabajar con requests, sin contratos).
      await page.locator('.welcome-dialog').waitFor()
      await page.locator('.wd-card', { hasText: T.createWs }).click()
      await page.locator('.wd-form input').first().fill('Demo')
      await page.getByRole('button', { name: T.createWsGo }).click()
      await page.locator('.home').waitFor()
      await page.locator('.home-action', { hasText: T.newCol }).click()
      await page.locator('.home-new input').fill('Store')
      await page.locator('.home-new').getByRole('button', { name: T.create }).click()
      await page.locator('.tree-collection.current', { hasText: 'Store' }).waitFor()
      return
    }
    await page.locator('.welcome-dialog').waitFor()
    await page.locator('.wd-card', { hasText: T.createWs }).click()
    await page.locator('.wd-form input').first().fill('Demo')
    await page.getByRole('button', { name: T.createWsGo }).click()
    await page.locator('.home').waitFor()
    await page.locator('.home-action', { hasText: T.newCol }).click()
    await page.locator('.home-new input').fill('Store')
    await page.locator('.home-new').getByRole('button', { name: T.create }).click()
    await page.locator('.tree-collection.current', { hasText: 'Store' }).waitFor()
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.home-action', { hasText: T.importFiles }).click()])
    await chooser.setFiles(fixture(...names))
    await page.locator('.tree-step').first().waitFor()
    await settle(page, 600)
  }
  /** Un panel del paso más ancho que el de fábrica (se puede arrastrar en la app): se lee mejor en las capturas. */
  const wide = (page, w = 470) => page.evaluate((x) => localStorage.setItem('builder.detailWidth', String(x)), w)
  /** Abre un workflow en la pestaña Diseño. */
  async function design(page, id) {
    await page.locator(`[data-journey="${id}"]`).first().click()
    await tab(page, 'design').click()
    await page.locator('.builder .graph').waitFor()
    await page.locator('.builder .step-node').first().waitFor()
    await settle(page, 700)
  }
  const node = (page, name) => page.locator('.builder .step-node', { hasText: name }).first()
  /** El + de la barra de pestañas (Crear o importar): el último botón de sus herramientas; las flechas y la lista de pestañas solo aparecen si no caben. */
  const plusBtn = (page) => page.locator('.ws-tabs-tools > .ws-tab-plus').last()
  const detail = (page) => page.locator('.bl-detail').first()
  const detailBox = async (page) => (await page.locator('.bl-detail-stack, .bl-detail').first().boundingBox())

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
      Object.assign(menu.style, {
        position: 'fixed', left: `${r.left}px`, top: `${r.bottom + 2}px`, minWidth: `${r.width}px`, maxWidth: '420px', zIndex: 2147483600,
        background: 'Canvas', color: 'CanvasText', border: '1px solid rgba(0,0,0,.25)', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,.22)',
        font: `13px/1.35 ${css.fontFamily}`, padding: '4px 0', maxHeight: `${Math.max(160, window.innerHeight - r.bottom - 16)}px`, overflow: 'hidden',
      })
      const row = (text, opts = {}) => {
        const d = document.createElement('div')
        d.textContent = text
        Object.assign(d.style, { padding: opts.group ? '5px 10px 2px' : `3px 10px 3px ${opts.inGroup ? 22 : 10}px`, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: opts.group ? '700' : '400', opacity: opts.group ? 0.75 : 1 })
        if (opts.on) Object.assign(d.style, { background: '#2f6fde', color: '#fff' })
        if (opts.value !== undefined) d.dataset.value = opts.value
        menu.append(d)
      }
      for (const child of el.children) {
        if (child.tagName === 'OPTGROUP') {
          row(child.label, { group: true })
          for (const o of child.children) row(o.textContent, { inGroup: true, value: o.value, on: hl ? o.textContent.trim() === hl || o.value === hl : o.selected })
        } else row(child.textContent, { value: child.value, on: hl ? child.textContent.trim() === hl || child.value === hl : child.selected })
      }
      document.documentElement.append(menu)
    }, highlight)
  }
  const hideOptions = (page) => page.evaluate(() => document.getElementById('demo-select')?.remove())
  /** En un video: abre la lista, lleva el cursor a la opción y la elige. `label`: el texto de la opción. */
  async function pick(page, select, label, { pause = 900 } = {}) {
    await go(page, select, { pause: 250 })
    await showOptions(page, select)
    await settle(page, 450)
    const item = page.locator('#demo-select div', { hasText: label }).first()
    // Si la opción queda bajo el borde del menú, el menú se desplaza hasta ella (si no, el clic caería detrás).
    await item.evaluate((d) => d.scrollIntoView({ block: 'nearest' })).catch(() => {})
    await settle(page, 200)
    const b = await item.boundingBox()
    if (b) {
      await moveTo(page, b.x + Math.min(b.width / 2, 120), b.y + b.height / 2)
      await item.evaluate((d) => Object.assign(d.style, { background: '#2f6fde', color: '#fff' }))
      await settle(page, 350)
      await page.mouse.down()
      await page.mouse.up()
    }
    await hideOptions(page)
    const value = await select.evaluate((el, l) => [...el.options].find((o) => o.textContent.trim() === l || o.textContent.includes(l))?.value, label)
    if (value === undefined) throw new Error(`no hay opción "${label}"`)
    await select.selectOption(value)
    await settle(page, pause)
  }
  /** Elige una opción sin video (por su texto). */
  async function choose(select, label) {
    const value = await select.evaluate((el, l) => [...el.options].find((o) => o.textContent.trim() === l || o.textContent.includes(l))?.value, label)
    if (value === undefined) throw new Error(`no hay opción "${label}"`)
    await select.selectOption(value)
  }
  /** La fila de un parámetro o campo en el panel del paso. */
  const prow = (page, name) => detail(page).locator('.bl-prow', { has: page.locator('.bl-prow-name', { hasText: new RegExp(`^${name.replace(/[/$]/g, '\\$&')}$`) }) }).first()
  /** La fila de un error en el panel. */
  const branch = (page, status) => detail(page).locator('.bl-branch-row', { has: page.locator('strong', { hasText: new RegExp(`^${status}$`) }) }).first()

  /** Para las capturas (no los videos): una ventana más grande que la de los videos. */
  const big = (page) => ctx.resize(page, 1600, 1000)
  /** Recorte de una zona, con los límites de la ventana actual. */
  async function cut(page, name, box, pad = 0) {
    await settle(page)
    const vp = ctx.viewport(page)
    const x = Math.max(0, box.x - pad)
    const y = Math.max(0, box.y - pad)
    await ctx.capture(page, path.join(ctx.OUT, `${name}.png`), { x, y, width: Math.min(vp.width - x, box.width + pad * 2), height: Math.min(vp.height - y, box.height + pad * 2) })
    console.log(`  ✓ ${name}`)
  }
  /** Recorte del panel derecho entero. */
  async function clipDetail(page, name) {
    const box = await detailBox(page)
    // Sin el blanco de abajo cuando el contenido es más corto que el panel.
    const bottom = await page.locator('.bl-detail-stack, .bl-detail').first().evaluate((el) => {
      let b = 0
      const parts = [...el.children].flatMap((c) => (c.classList.contains('bl-detail') && c !== el ? [...c.children] : [c]))
      for (const c of el.classList.contains('bl-detail') ? [...el.children] : parts) {
        const r = c.getBoundingClientRect()
        if (r.height && r.width) b = Math.max(b, r.bottom)
      }
      const menu = document.getElementById('demo-select')
      if (menu) b = Math.max(b, menu.getBoundingClientRect().bottom)
      return b
    })
    const height = Math.min(box.height, Math.max(120, bottom - box.y + 14))
    await cut(page, name, { ...box, height })
  }
  /** El lienzo con su barra (sin la paleta ni el panel). */
  const clipCanvas = async (page, name) => cut(page, name, await page.locator('.bl-main').boundingBox())
  /** Pliega o despliega la paleta de operaciones. */
  async function palette(page, show) {
    const btn = page.locator(show ? '.bl-palette-collapsed .icon-btn' : '.bl-palette-head .icon-btn').first()
    if (await btn.count()) await btn.click()
    await settle(page, 300)
  }
  /** Mueve el lienzo (arrastrando el fondo) para que la tarjeta quede arriba, a `top` px del borde. */
  async function bring(page, name, top = 70) {
    const n = name === 'start' ? page.locator('.builder .start-node') : name === 'end' ? page.locator('.builder .end-node') : name === 'deps' ? page.locator('.builder .deps-node') : node(page, name)
    const canvas = page.locator('.builder .graph')
    for (let i = 0; i < 10; i++) {
      const [b, c] = await Promise.all([n.boundingBox(), canvas.boundingBox()])
      if (!b || !c) break
      const dy = b.y - c.y - top
      if (Math.abs(dy) < 8) break
      // Se arrastra desde un punto vacío del fondo (ni tarjeta, ni línea, ni botones).
      const step = Math.max(-(c.height - 200), Math.min(c.height - 200, dy))
      const y0 = step > 0 ? c.y + c.height - 70 : c.y + 70
      const x0 = await page.evaluate(([cx, cw, y]) => {
        for (let x = cx + cw - 20; x > cx + 10; x -= 12) {
          const el = document.elementFromPoint(x, y)
          if (el && el.classList.contains('react-flow__pane')) return x
        }
        return cx + cw - 20
      }, [c.x, c.width, y0])
      const from = { x: x0, y: y0 }
      await page.mouse.move(from.x, from.y)
      await page.mouse.down()
      await page.mouse.move(from.x, from.y - step, { steps: 8 })
      await page.mouse.up()
      await settle(page, 150)
    }
    await settle(page, 300)
  }
  /** Elige un paso: lo trae a la vista y abre su panel. */
  async function select(page, name) {
    await bring(page, name)
    await node(page, name).locator('.sn-title').first().click()
    await settle(page, 700)
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
  /** Lleva una sección del panel a la vista (el panel tiene su propio scroll). */
  const reveal = (loc) => loc.first().evaluate((el) => el.scrollIntoView({ block: 'start' }))

  const scenes = {}
  // Capturas de la tienda: token en una cabecera, body, errores, outputs, dependencias, orden.
  scenes['design-store'] = async () => {
    const page = await freshPage()
    await big(page)
    await openStore(page)
    await design(page, 'placeOrder')
    // Palette con workflows de este archivo y de otros archivos.
    await cut(page, 'design-palette-workflows', await page.locator('.bl-palette').boundingBox())
    // El token del login en la cabecera de createOrder.
    await focusStep(page, 'createOrder')
    await reveal(detail(page).locator('.bl-pgroup', { hasText: L('Headers', 'Headers') }))
    await clipDetail(page, 'design-token-header')
    // Body: editar como JSON.
    await detail(page).getByRole('button', { name: L('Editar como JSON', 'Edit as JSON') }).click()
    await detail(page).locator('.bl-body-json textarea').evaluate((el) => (el.style.height = `${el.scrollHeight + 4}px`))
    await reveal(detail(page).locator('.bl-pgroup', { hasText: 'Body' }))
    await clipDetail(page, 'design-body-json')
    await detail(page).getByRole('button', { name: L('Cancelar', 'Cancel') }).first().click()
    // Errores: terminar, reintentar y saltar.
    await choose(branch(page, 401).locator('select'), L('Terminar el workflow', 'End the workflow'))
    await settle(page, 300)
    await choose(branch(page, 429).locator('select'), L('Reintentar', 'Retry'))
    await settle(page, 300)
    await choose(branch(page, 409).locator('select'), 'List products')
    await settle(page, 500)
    await reveal(detail(page).locator('.bl-section', { has: page.locator('.bl-branch-row') }))
    await clipDetail(page, 'design-error-actions')
    await palette(page, false)
    await deselect(page)
    await focusStep(page, 'createOrder')
    await deselect(page)
    await clipCanvas(page, 'design-actions-canvas')
    // Cobertura de respuestas en la pestaña Resumen.
    await tab(page, 'overview').click()
    const diagram = page.locator('.section', { hasText: L('Diagrama del workflow', 'Workflow diagram') }).first()
    await diagram.waitFor()
    await diagram.locator('.section-toggle').first().click()
    await settle(page, 400)
    const cov = page.locator('.section', { hasText: L('Cobertura de respuestas', 'Response coverage') }).first()
    await cov.waitFor()
    if (!(await cov.locator('table').count())) await cov.locator('.section-toggle').first().click()
    await cov.locator('table').waitFor()
    await cov.evaluate((el) => el.scrollIntoView({ block: 'start' }))
    await settle(page, 500)
    await cut(page, 'design-coverage', await cov.boundingBox())
    // listProducts: parámetros opcionales sin enviar y outputs que salen de una lista.
    await tab(page, 'design').click()
    await page.locator('.builder .step-node').first().waitFor()
    await settle(page, 1500)
    // La línea naranja del salto de createOrder (409) a listProducts.
    await palette(page, false)
    for (let i = 0; i < 2; i++) {
      await page.locator('.react-flow__controls-zoomout').click()
      await settle(page, 500)
    }
    await bring(page, 'listProducts', 30)
    await clipCanvas(page, 'design-jump-line')
    await palette(page, true)
    await select(page, 'listProducts')
    await detail(page).locator('.bl-unsent .link').first().click()
    await settle(page, 300)
    await clipDetail(page, 'design-optional-params-open')
    await reveal(detail(page).locator('.bl-section', { hasText: 'Outputs' }).last())
    await clipDetail(page, 'design-list-outputs')
    // Fin del workflow: sus outputs.
    await bring(page, 'end', 200)
    await page.locator('.builder .end-node .sn-title').click()
    await settle(page, 500)
    await clipDetail(page, 'design-workflow-outputs')
    // Inicio: depender de otro workflow, de este archivo o de otro.
    await bring(page, 'start')
    await page.locator('.builder .start-node .sn-title').click()
    await settle(page, 500)
    const dep = detail(page).locator('.bl-section select').last()
    await showOptions(page, dep, 'Login · ')
    await clipDetail(page, 'design-depends-options')
    await hideOptions(page)
    await choose(dep, L('Login · Inicia', 'Login · Log in'))
    await settle(page, 800)
    await deselect(page)
    await bring(page, 'deps', 30)
    const cv = await page.locator('.bl-main').boundingBox()
    await cut(page, 'design-depends-card', { ...cv, height: Math.min(cv.height, 640) })
    await page.locator('.bl-toolbar button', { hasText: L('Deshacer', 'Undo') }).click()
    await settle(page, 500)
    // Llamar a otro workflow como paso: browseProducts al final.
    await palette(page, true)
    await page.locator('.bl-op-workflow', { hasText: 'browseProducts' }).locator('.icon-btn').click()
    await settle(page, 2500)
    await clipDetail(page, 'design-call-workflow')
    await page.locator('.bl-toolbar button', { hasText: L('Deshacer', 'Undo') }).click()
    await settle(page, 500)
    await ctx.done()
  }

  /** Una línea del YAML (CodeMirror solo dibuja las que se ven: se baja hasta encontrarla). */
  async function yamlLine(page, text) {
    const scroller = page.locator('.editor-code .cm-scroller').first()
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
  const undoBtn = (page) => page.locator('.bl-toolbar button', { hasText: L('Deshacer', 'Undo') })
  /** La zona de arriba del lienzo (barras de aviso y las primeras tarjetas). */
  async function clipTop(page, name, height = 520) {
    const cv = await page.locator('.bl-main').boundingBox()
    await cut(page, name, { ...cv, height: Math.min(cv.height, height) })
  }

  // Más capturas de la tienda: datos que faltan, orden, borrar, volver inputs, YAML, archivo nuevo.
  scenes['design-store2'] = async () => {
    const page = await freshPage()
    await big(page)
    await openStore(page)
    await design(page, 'placeOrder')
    await palette(page, false)
    // Volver inputs datos fijos: un valor (→ input) y el diálogo para elegir varios.
    await bring(page, 'createOrder', 20)
    const row = node(page, 'createOrder').locator('.sn-row', { hasText: 'currency' }).first()
    await row.hover()
    await settle(page, 300)
    const card = await node(page, 'createOrder').boundingBox()
    const cv = await page.locator('.bl-main').boundingBox()
    await cut(page, 'design-promote-one', { x: card.x - 20, y: cv.y + 140, width: card.width + 140, height: Math.min(card.y + 560, cv.y + cv.height) - (cv.y + 140) })
    await bring(page, 'start', 40)
    await page.locator('.builder .start-node .sn-start-more, .builder .start-node .sn-start-promote').first().click()
    const dlg = page.locator('.welcome-dialog.rq-dialog').first()
    await dlg.waitFor()
    await dlg.locator('.vary-row', { hasText: 'currency' }).locator('input').check()
    await dlg.locator('.vary-row', { hasText: 'address/city' }).locator('input').check()
    await shot(page, 'design-pick-data', dlg)
    await dlg.locator('button.primary').click()
    await settle(page, 800)
    await bring(page, 'start', 40)
    await clipTop(page, 'design-promoted', 560)
    // Y de vuelta: el valor vuelve a ser fijo y se borra el input.
    await undoBtn(page).click()
    await settle(page, 500)
    // Lo que falta: se borra un input que un paso usa.
    await page.locator('.builder .start-node .sn-title').click()
    await settle(page, 400)
    await detail(page).locator('.bl-output-custom', { hasText: 'username' }).locator('.icon-btn.danger').click()
    await settle(page, 900)
    await deselect(page)
    await clipTop(page, 'design-gaps-bar', 420)
    await page.locator('.bl-gaps button.primary').click()
    await settle(page, 700)
    // Orden: getOrder antes que createOrder.
    await select(page, 'getOrder')
    await detail(page).locator('.bl-detail-head .icon-btn').first().click()
    await settle(page, 700)
    await deselect(page)
    await clipTop(page, 'design-order-warning', 300)
    await page.locator('.callout.warn .link', { hasText: L('Deshacer', 'Undo') }).click()
    await settle(page, 400)
    // Deshacer ya puede cerrar el aviso: "Cerrar" solo si sigue ahí.
    const closeWarn = page.locator('.callout.warn .link', { hasText: L('Cerrar', 'Close') })
    if (await closeWarn.count()) await closeWarn.click()
    await settle(page, 400)
    // Borrar un paso que otros usan.
    await select(page, 'listProducts')
    await detail(page).locator('.bl-detail-head .icon-btn.danger').click()
    await settle(page, 800)
    await bring(page, 'createOrder', 140)
    await clipTop(page, 'design-dangling', 560)
    await undoBtn(page).click()
    await settle(page, 600)
    // Menú del archivo en la barra lateral.
    const fileRow = page.locator('.tree-row-wrap', { has: page.locator('.tree-file', { hasText: 'store.arazzo.yaml' }) }).first()
    await fileRow.hover()
    await fileRow.locator('.row-menu-btn').first().click()
    await settle(page, 400)
    const side = await page.locator('aside').first().boundingBox()
    const menu = await page.locator('.row-menu-list').boundingBox()
    await cut(page, 'design-file-menu', { x: side.x, y: Math.max(side.y, menu.y - 120), width: Math.max(side.width, menu.x + menu.width - side.x + 10), height: menu.height + 150 })
    await page.keyboard.press('Escape')
    // YAML: autocompletar después de $steps. y un error.
    await tab(page, 'yaml').click()
    await page.locator('.cm-content').first().waitFor()
    await settle(page, 800)
    const line = await yamlLine(page, 'value: $steps.createOrder.outputs.orderId')
    await line.click()
    await page.keyboard.press('End')
    await page.keyboard.press('ArrowLeft')
    for (let i = 0; i < 'createOrder.outputs.orderId'.length + 1; i++) await page.keyboard.press('Backspace')
    await page.keyboard.type('.', { delay: 80 })
    await page.locator('.cm-tooltip-autocomplete').waitFor({ timeout: 5000 }).catch(() => {})
    await settle(page, 600)
    await shot(page, 'design-yaml-autocomplete', page.locator('.editor').first())
    await page.keyboard.press('Escape')
    await page.keyboard.type('createOrdr.outputs.orderId', { delay: 20 })
    await page.keyboard.press('Escape')
    await settle(page, 2500)
    await shot(page, 'design-yaml-problems', page.locator('.editor').first())
    // YAML que no se puede leer: el lienzo lo dice.
    await page.keyboard.type(' }}: [', { delay: 20 })
    await settle(page, 2000)
    await tab(page, 'design').click()
    // Con el YAML roto, Diseño ya no dibuja el lienzo: muestra el aviso arriba (como en design-branches.mjs).
    await page.locator('.ws-yaml-broken').waitFor()
    await settle(page, 800)
    const body = await page.locator('.ws-center-body').boundingBox()
    await cut(page, 'design-yaml-broken', { ...body, height: 130 })
    await ctx.done()
  }

  // Pokédex: crear un Arazzo, nombre, pasos nuevos con datos conectados, el origen de un valor.
  scenes['design-pokedex'] = async () => {
    const page = await freshPage()
    await big(page)
    await wide(page)
    await openPokedex(page)
    await design(page, 'pokemonCard')
    // La paleta.
    await cut(page, 'design-palette', await page.locator('.bl-palette').boundingBox())
    // Un paso con criterios extra (la especie).
    await select(page, 'getSpecies')
    await reveal(detail(page).locator('.bl-section', { has: page.locator('.bl-chips') }).first())
    await clipDetail(page, 'design-criteria-panel')
    // Una tarjeta con todas sus partes.
    await deselect(page)
    await palette(page, false)
    await bring(page, 'getPokemon', 20)
    const card = await node(page, 'getPokemon').boundingBox()
    await cut(page, 'design-card', { x: card.x - 30, y: card.y - 14, width: card.width + 170, height: card.height + 28 })
    await palette(page, true)
    // Crear un Arazzo nuevo desde el + de las pestañas.
    await plusBtn(page).click()
    await settle(page, 400)
    const menu = await page.locator('.context-menu').boundingBox()
    const plus = await plusBtn(page).boundingBox()
    {
      // El + y su menú juntos (el menú puede abrirse hacia la izquierda si el + está cerca del borde).
      const x = Math.min(menu.x, plus.x) - 16
      const right = Math.max(menu.x + menu.width, plus.x + plus.width) + 16
      await cut(page, 'design-plus-menu', { x, y: plus.y - 8, width: Math.max(right - x, 300), height: menu.y + menu.height - plus.y + 24 })
    }
    await page.locator('.context-menu [role="menuitem"], .context-menu button', { hasText: L('Nuevo Arazzo', 'New Arazzo') }).first().click()
    await page.locator('.builder .graph').waitFor()
    await settle(page, 1200)
    await shot(page, 'design-new-arazzo')
    // Cambiar el nombre: aparece el id que tendrá en el Arazzo.
    await page.locator('.journey-title .jt-edit').first().click()
    await page.locator('.jt-name').fill(L('Ficha rápida', 'Quick card'))
    await settle(page, 300)
    const title = await page.locator('.journey-title').boundingBox()
    await cut(page, 'design-rename', { x: title.x - 12, y: title.y - 10, width: 560, height: title.height + 20 })
    await page.locator('.jt-name').press('Enter')
    await settle(page, 600)
    // Dos operaciones: la segunda se conecta sola con la primera.
    const add = async (opPath) => {
      await page.locator('.bl-op', { has: page.locator('.bl-op-path', { hasText: opPath }) }).first().locator('.icon-btn').click()
      await settle(page, 900)
    }
    await add('/pokemon/{idOrName}')
    await add('/pokemon-species/{idOrName}')
    await clipDetail(page, 'design-new-step-panel')
    await deselect(page)
    await palette(page, false)
    await bring(page, 'start', 30)
    await clipCanvas(page, 'design-auto-wired')
    await palette(page, true)
    // Un tercer paso: el ? de /type y la lista de orígenes.
    await add('/type/{idOrName}')
    const src = prow(page, 'idOrName').locator('select')
    await showOptions(page, src)
    await clipDetail(page, 'design-source-options')
    await hideOptions(page)
    await ctx.done()
  }

  // --------------------------------------------------------------------------------------------
  // Videos. Cada uno empieza a contar después de preparar (abrir el ejemplo o crear el workspace).
  const C = ES
    ? {
        w1: 'Agrega tres operaciones con +', w2: 'Luvin conecta cada valor con un paso anterior', w3: 'El ? avisa que Luvin no está seguro: aquí propuso el id del paso anterior', w4: 'Abre el paso y elige de dónde sale el valor', w5: 'El tipo sale de getPokemon: types/type/name', w6: 'La tarjeta muestra el origen nuevo, sin el ?',
        p1: 'createOrder envía valores fijos', p2: '→ input vuelve un valor fijo un input del workflow', p3: 'Inicio tiene el input nuevo, con el valor de antes', p4: 'Para elegir varios a la vez: Convertir otro valor fijo en input', p5: 'Marca los datos que quieres variar en los casos', p6: 'Y de vuelta: elige Valor fijo… en el origen', p7: 'Escribe el valor', p8: 'Borra el input que ya nadie usa',
        e1: 'Abre el paso que puede fallar', e2: 'Cada error que documenta el contrato tiene su lista', e3: '401: termina el workflow (un resultado conocido)', e4: '429: reintenta hasta 3 veces', e5: '409: salta a otro paso', e6: 'La tarjeta muestra qué pasa con cada respuesta',
        o1: 'Abre el paso', o2: 'Marca los campos de la respuesta que quieres exponer', o3: 'El output aparece en la tarjeta, listo para otro paso', o4: 'Fin del workflow: lo que el workflow devuelve', o5: 'Marca lo que quieres devolver', o6: 'Cámbiale el nombre si quieres',
        d1: 'Abre el Inicio', d2: 'Depende de: elige un workflow de este archivo o de otro', d3: 'Corre antes, y sus outputs quedan para cualquier paso', d4: 'O llama a un workflow como un paso más', d5: 'Sus inputs se conectan como parámetros del paso', d6: 'Y sus outputs son outputs del paso',
        r1: 'Elige qué hacer con un 429', r2: 'Guárdalo como reutilizable', r3: 'Ponle un nombre', r4: 'En otro paso, el 429 ofrece el reutilizable', r5: 'Ábrelo: se edita en un solo lugar', r6: 'Lo usan los dos pasos',
        q1: 'Un request guardado: Crear pedido', q2: 'Prueba el paso: Luvin aprende qué responde', q3: 'Otro request usa {{order_id}} en la ruta', q4: 'Crea un workflow y arrastra tus requests', q5: '¿Qué exige la API? Márcalo una vez por request', q6: 'Luvin ve que order_id sale del paso anterior', q7: 'Conecta: el valor ahora viene de crearPedido',
        g1: 'Borra un input que un paso todavía usa', g2: 'El lienzo avisa: falta un dato', g3: 'Completar lo declara de nuevo, sin rehacer los pasos', g4: 'Deshacer lo revierte',
        y1: 'La pestaña YAML es el mismo archivo', y2: 'Escribe a mano algo que el lienzo no edita: un timeout', y3: 'Vuelve a Diseño y cambia otra cosa', y4: 'Tu línea sigue ahí: el YAML guarda lo que escribes',
        m1: 'Sube un paso con la flecha ↑', m2: 'getOrder ahora corre antes del paso que le da su dato: Luvin avisa', m3: 'Deshacer lo deja como estaba', m4: 'Borra un paso: los que usaban sus datos muestran el error', m5: '⌘Z lo trae de vuelta',
      }
    : {
        w1: 'Add three operations with +', w2: 'Luvin wires each value to an earlier step', w3: 'The ? says Luvin is not sure: it proposed the id of the previous step', w4: 'Open the step and choose where the value comes from', w5: 'The type comes from getPokemon: types/type/name', w6: 'The card shows the new source, without the ?',
        p1: 'createOrder sends fixed values', p2: '→ input turns a fixed value into a workflow input', p3: 'Start has the new input, with the value it had', p4: 'To pick several at once: Turn another fixed value into an input', p5: 'Tick the data you want to vary in cases', p6: 'And back: choose Fixed value… as the source', p7: 'Type the value', p8: 'Delete the input nobody uses now',
        e1: 'Open the step that can fail', e2: 'Each error the contract documents has its own list', e3: '401: end the workflow (a known outcome)', e4: '429: retry up to 3 times', e5: '409: jump to another step', e6: 'The card shows what happens on each response',
        o1: 'Open the step', o2: 'Tick the response fields you want to expose', o3: 'The output appears on the card, ready for another step', o4: 'End of workflow: what the workflow returns', o5: 'Tick what you want to return', o6: 'Rename it if you like',
        d1: 'Open Start', d2: 'Depends on: pick a workflow of this file or another one', d3: 'It runs first, and its outputs are there for any step', d4: 'Or call a workflow as one more step', d5: 'Its inputs are wired as parameters of the step', d6: 'And its outputs become outputs of the step',
        r1: 'Choose what to do on a 429', r2: 'Save it as a reusable', r3: 'Give it a name', r4: 'In another step, the 429 offers the reusable', r5: 'Open it: you edit it in one place', r6: 'Both steps use it',
        q1: 'A saved request: Create order', q2: 'Try the step: Luvin learns what it answers', q3: 'Another request has {{order_id}} in its path', q4: 'Create a workflow and drag your requests in', q5: 'What does the API require? Tick it once per request', q6: 'Luvin sees that order_id comes from the previous step', q7: 'Connect: the value now comes from createOrder',
        g1: 'Delete an input a step still uses', g2: 'The canvas warns: data is missing', g3: 'Complete declares it again, without redoing the steps', g4: 'Undo reverts it',
        y1: 'The YAML tab is the same file', y2: 'Type by hand something the canvas does not edit: a timeout', y3: 'Go back to Design and change something else', y4: 'Your line is still there: the YAML keeps what you type',
        m1: 'Move a step up with the ↑ arrow', m2: 'getOrder now runs before the step that gives it data: Luvin warns', m3: 'Undo puts it back', m4: 'Delete a step: the ones that used its data show the error', m5: '⌘Z brings it back',
      }
  const video = async () => {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await wide(page, 360)
    return { page, started }
  }
  const addOp = async (page, opPath, pause = 1300) => {
    const op = page.locator('.bl-op', { has: page.locator('.bl-op-path', { hasText: opPath }) }).first()
    await go(page, op, { click: false, pause: 250 })
    await go(page, op.locator('.icon-btn'), { pause })
  }
  /** Lleva el cursor al título de un paso y lo abre. */
  const openStep = async (page, name, pause = 900) => {
    await bring(page, name)
    await go(page, node(page, name).locator('.sn-title'), { pause })
  }

  scenes['clip-design-wire'] = async () => {
    const { page, started } = await video()
    await openPokedex(page)
    await plusBtn(page).click()
    await page.locator('.context-menu [role="menuitem"], .context-menu button', { hasText: L('Nuevo Arazzo', 'New Arazzo') }).first().click()
    await page.locator('.builder .graph').waitFor()
    await settle(page, 900)
    const from = Date.now()
    await say(page, C.w1, 400)
    await addOp(page, '/pokemon/{idOrName}')
    await addOp(page, '/pokemon-species/{idOrName}')
    await addOp(page, '/type/{idOrName}', 1500)
    await deselect(page)
    await say(page, C.w2, 1800)
    await bring(page, 'getType', 60)
    await say(page, C.w3, 400)
    await go(page, node(page, 'getType').locator('.sn-row', { hasText: 'idOrName' }).locator('.sn-value'), { click: false, pause: 2600 })
    await say(page, C.w4, 300)
    await go(page, node(page, 'getType').locator('.sn-title'), { pause: 800 })
    await pick(page, prow(page, 'idOrName').locator('select'), 'types/type/name', { pause: 600 })
    await say(page, C.w5, 2000)
    await say(page, C.w6, 300)
    await go(page, node(page, 'getType').locator('.sn-row', { hasText: 'idOrName' }).locator('.sn-value'), { click: false, pause: 2600 })
    await say(page, '', 300)
    await saveClip(page, 'design-wire', started, from)
  }

  scenes['clip-design-promote'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    await palette(page, false)
    await bring(page, 'createOrder', 40)
    const from = Date.now()
    await say(page, C.p1, 1600)
    const currency = node(page, 'createOrder').locator('.sn-row', { hasText: 'currency' }).first()
    await go(page, currency, { click: false, pause: 400 })
    await say(page, C.p2, 300)
    await go(page, currency.locator('.sn-promote'), { pause: 1200 })
    await bring(page, 'start', 40)
    await say(page, C.p3, 2000)
    await say(page, C.p4, 300)
    await go(page, page.locator('.builder .start-node .sn-start-more, .builder .start-node .sn-start-promote').first(), { pause: 900 })
    const dlg = page.locator('.welcome-dialog.rq-dialog').first()
    await dlg.waitFor()
    await say(page, C.p5, 300)
    await go(page, dlg.locator('.vary-row', { hasText: 'address/city' }).locator('input'), { pause: 700 })
    await go(page, dlg.locator('button.primary'), { pause: 1500 })
    await say(page, C.p6, 300)
    await openStep(page, 'createOrder', 600)
    await reveal(prow(page, 'currency'))
    await settle(page, 400)
    await pick(page, prow(page, 'currency').locator('select'), L('Valor fijo…', 'Fixed value…'), { pause: 500 })
    await say(page, C.p7, 300)
    // Un campo opcional vacío se pliega con los no enviados: "Editar" lo muestra.
    if (!(await prow(page, 'currency').count())) await go(page, detail(page).locator('.bl-pgroup', { hasText: 'Body' }).locator('.bl-unsent .link'), { pause: 500 })
    const lit = prow(page, 'currency').locator('input')
    await go(page, lit, { pause: 200 })
    await lit.pressSequentially('EUR', { delay: 90 })
    await settle(page, 800)
    await say(page, C.p8, 300)
    await bring(page, 'start', 40)
    await go(page, page.locator('.builder .start-node .sn-title'), { pause: 900 })
    await go(page, detail(page).locator('.bl-output-custom', { hasText: 'currency' }).locator('.icon-btn.danger'), { pause: 1800 })
    await say(page, '', 300)
    await saveClip(page, 'design-promote', started, from)
  }

  scenes['clip-design-errors'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    await palette(page, false)
    const from = Date.now()
    await say(page, C.e1, 300)
    await openStep(page, 'createOrder', 700)
    await reveal(detail(page).locator('.bl-section', { has: page.locator('.bl-branch-row') }))
    await settle(page, 400)
    await say(page, C.e2, 1600)
    await say(page, C.e3, 200)
    await pick(page, branch(page, 401).locator('select'), L('Terminar el workflow', 'End the workflow'))
    await say(page, C.e4, 200)
    await pick(page, branch(page, 429).locator('select'), L('Reintentar', 'Retry'))
    await say(page, C.e5, 200)
    await pick(page, branch(page, 409).locator('select'), 'List products')
    await say(page, C.e6, 300)
    const fail = node(page, 'createOrder').locator('.sn-section.failures')
    await fail.evaluate((el) => el.scrollIntoView({ block: 'center' })).catch(() => {})
    await bring(page, 'createOrder', -260)
    await go(page, fail, { click: false, pause: 3000 })
    await say(page, '', 300)
    await saveClip(page, 'design-errors', started, from)
  }

  scenes['clip-design-outputs'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    await palette(page, false)
    const from = Date.now()
    await say(page, C.o1, 300)
    await openStep(page, 'getOrder', 700)
    const outs = detail(page).locator('.bl-section', { hasText: 'Outputs' }).last()
    await reveal(outs)
    await settle(page, 300)
    await say(page, C.o2, 300)
    await go(page, outs.locator('.bl-chip', { hasText: 'total' }).first(), { pause: 1200 })
    await say(page, C.o3, 300)
    await go(page, node(page, 'getOrder').locator('.sn-row', { hasText: 'total' }).last(), { click: false, pause: 1800 })
    await say(page, C.o4, 300)
    await bring(page, 'end', 220)
    await go(page, page.locator('.builder .end-node .sn-title'), { pause: 900 })
    await say(page, C.o5, 300)
    await go(page, detail(page).locator('.bl-chip', { hasText: 'getOrder › status' }), { pause: 1000 })
    await go(page, detail(page).locator('.bl-chip', { hasText: 'getOrder › total' }), { pause: 1000 })
    await say(page, C.o6, 300)
    const name = detail(page).locator('.bl-output-name').last()
    await go(page, name, { pause: 200 })
    await name.press('Meta+a')
    await name.pressSequentially('orderTotal', { delay: 70 })
    await name.press('Enter')
    await settle(page, 1800)
    await say(page, '', 300)
    await saveClip(page, 'design-outputs', started, from)
  }

  scenes['clip-design-depends'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    const from = Date.now()
    await say(page, C.d1, 300)
    await bring(page, 'start', 40)
    await go(page, page.locator('.builder .start-node .sn-title'), { pause: 800 })
    await say(page, C.d2, 300)
    await pick(page, detail(page).locator('.bl-section select').last(), L('Login · Inicia', 'Login · Log in'), { pause: 1200 })
    await deselect(page)
    await bring(page, 'deps', 40)
    await say(page, C.d3, 300)
    await go(page, page.locator('.builder .deps-node'), { click: false, pause: 2400 })
    await say(page, C.d4, 300)
    const wf = page.locator('.bl-op-workflow', { hasText: 'browseProducts' }).first()
    await go(page, wf, { click: false, pause: 300 })
    await go(page, wf.locator('.icon-btn'), { pause: 1500 })
    await say(page, C.d5, 300)
    await go(page, detail(page).locator('.bl-pgroup').first(), { click: false, pause: 2200 })
    await say(page, C.d6, 300)
    await go(page, detail(page).locator('.bl-section', { hasText: 'Outputs' }).last().locator('.bl-chips'), { click: false, pause: 2200 })
    await say(page, '', 300)
    await saveClip(page, 'design-depends', started, from)
  }

  scenes['clip-design-reusables'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    await palette(page, false)
    const from = Date.now()
    await openStep(page, 'createOrder', 500)
    await reveal(detail(page).locator('.bl-section', { has: page.locator('.bl-branch-row') }))
    await say(page, C.r1, 200)
    await pick(page, branch(page, 429).locator('select'), L('Reintentar', 'Retry'))
    await say(page, C.r2, 300)
    await go(page, branch(page, 429).locator('.bl-save-reusable'), { pause: 500 })
    await say(page, C.r3, 200)
    const nameBox = branch(page, 429).locator('.bl-inline-form input')
    await nameBox.press('Meta+a')
    await nameBox.pressSequentially('tooManyRequests', { delay: 60 })
    await go(page, branch(page, 429).locator('.bl-inline-form button.primary'), { pause: 1200 })
    await say(page, C.r4, 300)
    await openStep(page, 'getOrder', 500)
    await reveal(detail(page).locator('.bl-section', { has: page.locator('.bl-branch-row') }))
    await settle(page, 300)
    await pick(page, branch(page, 429).locator('select'), 'tooManyRequests', { pause: 1200 })
    await say(page, C.r5, 300)
    await go(page, branch(page, 429).locator('.bl-reusable'), { pause: 1200 })
    await say(page, C.r6, 300)
    await go(page, detail(page).locator('.bl-section').last(), { click: false, pause: 2600 })
    await say(page, '', 300)
    await saveClip(page, 'design-reusables', started, from)
  }

  scenes['clip-design-gaps'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    await palette(page, false)
    const from = Date.now()
    await say(page, C.g1, 300)
    await bring(page, 'start', 40)
    await go(page, page.locator('.builder .start-node .sn-title'), { pause: 700 })
    await go(page, detail(page).locator('.bl-output-custom', { hasText: 'username' }).locator('.icon-btn.danger'), { pause: 900 })
    await say(page, C.g2, 300)
    await go(page, page.locator('.bl-gaps'), { click: false, pause: 2400 })
    await say(page, C.g3, 300)
    await go(page, page.locator('.bl-gaps button.primary'), { pause: 2000 })
    await say(page, C.g4, 300)
    await go(page, undoBtn(page), { pause: 1600 })
    await say(page, '', 300)
    await saveClip(page, 'design-gaps', started, from)
  }

  scenes['clip-design-yaml'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    const from = Date.now()
    await say(page, C.y1, 300)
    await go(page, tab(page, 'yaml'), { pause: 1200 })
    await say(page, C.y2, 300)
    const line = await yamlLine(page, 'operationId: $sourceDescriptions.store.createOrder')
    const b = await line.boundingBox()
    await moveTo(page, b.x + 520, b.y + b.height / 2)
    await page.mouse.click(b.x + 520, b.y + b.height / 2)
    await page.keyboard.press('End')
    await page.keyboard.press('Escape')
    await page.keyboard.press('Enter')
    // La sangría exacta de los campos del paso (8 espacios), sin depender de la sangría automática.
    await page.keyboard.press('Shift+Home')
    await page.keyboard.type('        ', { delay: 10 })
    await page.keyboard.type('timeout: 3000', { delay: 90 })
    await page.keyboard.press('Escape')
    await settle(page, 1800)
    await say(page, C.y3, 300)
    await go(page, tab(page, 'design'), { pause: 900 })
    await openStep(page, 'createOrder', 500)
    await reveal(detail(page).locator('.bl-section', { has: page.locator('.bl-branch-row') }))
    await pick(page, branch(page, 401).locator('select'), L('Terminar el workflow', 'End the workflow'), { pause: 900 })
    await say(page, C.y4, 300)
    await go(page, tab(page, 'yaml'), { pause: 600 })
    const kept = await yamlLine(page, 'timeout: 3000')
    await go(page, kept, { click: false, pause: 3000 })
    await say(page, '', 300)
    await saveClip(page, 'design-yaml', started, from)
  }

  scenes['clip-design-organize'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    await palette(page, false)
    await bring(page, 'getOrder', 120)
    const from = Date.now()
    await say(page, C.m1, 300)
    await go(page, node(page, 'getOrder').locator('.sn-head'), { click: false, pause: 300 })
    await go(page, node(page, 'getOrder').locator('.sn-move .icon-btn').first(), { pause: 1200 })
    await say(page, C.m2, 300)
    await go(page, page.locator('.callout.warn'), { click: false, pause: 2400 })
    await say(page, C.m3, 300)
    await go(page, page.locator('.callout.warn .link', { hasText: L('Deshacer', 'Undo') }), { pause: 600 })
    const closeWarn = page.locator('.callout.warn .link', { hasText: L('Cerrar', 'Close') })
    if (await closeWarn.count()) await go(page, closeWarn, { pause: 900 })
    else await settle(page, 900)
    await say(page, C.m4, 300)
    await openStep(page, 'listProducts', 500)
    await go(page, detail(page).locator('.bl-detail-head .icon-btn.danger'), { pause: 900 })
    await deselect(page)
    await bring(page, 'createOrder', 60)
    await go(page, node(page, 'createOrder').locator('.sn-meta.err'), { click: false, pause: 2200 })
    await say(page, C.m5, 300)
    await page.keyboard.press('Meta+z')
    await settle(page, 2200)
    await say(page, '', 300)
    await saveClip(page, 'design-organize', started, from)
  }

  // PayPal (reutilizables) y la Pokédex (un paso que espera un mensaje).
  scenes['design-extras'] = async () => {
    let page = await freshPage()
    await big(page)
    await wide(page)
    await openPaypal(page)
    await design(page, 'createOrder')
    const group = page.locator('.bl-group', { hasText: L('Reutilizables', 'Reusables') }).first()
    await group.evaluate((el) => el.scrollIntoView({ block: 'start' }))
    await settle(page, 300)
    const pb = await page.locator('.bl-palette').boundingBox()
    const gb = await group.boundingBox()
    await cut(page, 'design-reusables-palette', { x: pb.x, y: gb.y - 8, width: pb.width, height: gb.height + 16 })
    await group.locator('.bl-op-component', { hasText: 'unauthorized' }).first().click()
    await settle(page, 700)
    await clipDetail(page, 'design-reusable-panel')
    await ctx.done()
    page = await freshPage()
    await big(page)
    await wide(page)
    await openPokedex(page)
    await design(page, 'registerSighting')
    await select(page, 'awaitConfirmation')
    await clipDetail(page, 'design-messaging-receive')
    await ctx.done()
  }

  // --- Construir desde requests guardados (sin contrato) ---
  /** Crea un request desde un cURL y le pone nombre. `send`: lo envía para que Luvin conozca su respuesta. */
  async function curlRequest(page, curl, name, { send = false, v = false } = {}) {
    const click = (loc, pause = 600) => (v ? go(page, loc, { pause }) : loc.first().click())
    await click(page.locator('.tree-add', { hasText: T.newRequest }).first())
    await page.locator('.nr-dialog').waitFor()
    await click(page.locator('.nr-curl-btn[data-kind="curl"]'))
    const ta = page.locator('.nr-curl textarea')
    if (v) await ta.pressSequentially(curl, { delay: 8 })
    else await ta.fill(curl)
    await click(page.locator('.nr-dialog').getByRole('button', { name: T.imp }))
    await page.locator('.rq').waitFor()
    const nm = page.locator('.rq-name')
    await nm.fill(name)
    await nm.press('Enter')
    await settle(page, 500)
    if (send) {
      await click(page.locator('.rq-send'), 300)
      await page.locator('.rq-status').waitFor({ timeout: 20000 })
      await settle(page, v ? 1400 : 600)
    }
  }
  const CREATE_CURL = `curl -X POST '${API}/orders' -H 'content-type: application/json' -d '{"customer":"Ana","currency":"EUR"}'`
  const GET_CURL = `curl '${API}/orders/{{order_id}}'`
  async function newArazzo(page, v = false) {
    if (v) await go(page, plusBtn(page), { pause: 400 })
    else await plusBtn(page).click()
    const item = page.locator('.context-menu [role="menuitem"], .context-menu button', { hasText: L('Nuevo Arazzo', 'New Arazzo') }).first()
    if (v) await go(page, item, { pause: 300 })
    else await item.click()
    await page.locator('.builder .graph').waitFor()
    await settle(page, 900)
  }
  const reqDialog = (page) => page.locator('.req-fields').first()

  scenes['design-requests'] = async () => {
    const page = await freshPage()
    await big(page)
    await openStore(page, [])
    await curlRequest(page, CREATE_CURL, L('Crear pedido', 'Create order'))
    await curlRequest(page, GET_CURL, L('Consultar pedido', 'Get order'))
    await newArazzo(page)
    await cut(page, 'design-requests-palette', await page.locator('.bl-palette').boundingBox())
    await page.locator('.bl-op', { hasText: L('Crear pedido', 'Create order') }).locator('.icon-btn').click()
    await reqDialog(page).waitFor()
    await reqDialog(page).locator('label', { hasText: 'customer' }).locator('input').check()
    await settle(page, 300)
    await shot(page, 'design-required-fields', reqDialog(page))
    await reqDialog(page).getByRole('button', { name: L('Guardar', 'Save') }).click()
    await settle(page, 600)
    await page.locator('.bl-op', { hasText: L('Consultar pedido', 'Get order') }).locator('.icon-btn').click()
    await reqDialog(page).waitFor()
    await reqDialog(page).getByRole('button', { name: L('Guardar', 'Save') }).click()
    await settle(page, 1200)
    // Luvin todavía no sabe qué responde Crear pedido: el panel lo dice y ofrece probarlo.
    await select(page, L('crearPedido', 'createOrder'))
    await clipDetail(page, 'design-request-step')
    await page.locator('.bl-detail-stack button', { hasText: L('Probar este paso', 'Try this step') }).click()
    await settle(page, 300)
    const note = await page.locator('.bl-detail-stack').first().boundingBox()
    await cut(page, 'design-try-step', { ...note, height: 260 })
    await page.locator('.bl-detail-stack button', { hasText: L('Enviar igual', 'Send anyway') }).click()
    await page.locator('.bl-connect').first().waitFor({ timeout: 15000 })
    await settle(page, 800)
    await deselect(page)
    await clipTop(page, 'design-connections-bar', 380)
    await ctx.done()
  }

  scenes['clip-design-from-requests'] = async () => {
    const { page, started } = await video()
    await openStore(page, [])
    await settle(page, 600)
    const from = Date.now()
    await say(page, C.q1, 300)
    await curlRequest(page, CREATE_CURL, L('Crear pedido', 'Create order'), { v: true })
    await say(page, C.q3, 300)
    await curlRequest(page, GET_CURL, L('Consultar pedido', 'Get order'))
    await settle(page, 1600)
    await say(page, C.q4, 300)
    await newArazzo(page, true)
    const a = page.locator('.bl-op', { hasText: L('Crear pedido', 'Create order') })
    await go(page, a, { click: false, pause: 200 })
    await go(page, a.locator('.icon-btn'), { pause: 700 })
    await reqDialog(page).waitFor()
    await say(page, C.q5, 300)
    await go(page, reqDialog(page).locator('label', { hasText: 'customer' }).locator('input'), { pause: 600 })
    await go(page, reqDialog(page).getByRole('button', { name: L('Guardar', 'Save') }), { pause: 900 })
    const b = page.locator('.bl-op', { hasText: L('Consultar pedido', 'Get order') })
    await go(page, b.locator('.icon-btn'), { pause: 700 })
    await reqDialog(page).waitFor()
    await go(page, reqDialog(page).getByRole('button', { name: L('Guardar', 'Save') }), { pause: 1200 })
    // Más lugar para el lienzo: la paleta se pliega.
    await go(page, page.locator('.bl-palette-head .icon-btn').first(), { pause: 600 })
    await say(page, C.q2, 300)
    await openStep(page, L('crearPedido', 'createOrder'), 600)
    await go(page, page.locator('.bl-detail-stack button', { hasText: L('Probar este paso', 'Try this step') }), { pause: 900 })
    await go(page, page.locator('.bl-detail-stack button', { hasText: L('Enviar igual', 'Send anyway') }), { pause: 300 })
    await page.locator('.bl-connect').first().waitFor({ timeout: 15000 })
    await settle(page, 600)
    await say(page, C.q6, 300)
    await go(page, page.locator('.bl-connect').first(), { click: false, pause: 2200 })
    await say(page, C.q7, 300)
    await go(page, page.locator('.bl-connect button.primary').first(), { pause: 1200 })
    await deselect(page)
    await bring(page, L('consultarPedido', 'getOrder'), 120)
    await go(page, node(page, L('consultarPedido', 'getOrder')).locator('.sn-row').first(), { click: false, pause: 2600 })
    await say(page, '', 300)
    await saveClip(page, 'design-from-requests', started, from)
  }

  return scenes
}
