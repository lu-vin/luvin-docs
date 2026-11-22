// Escenas del runner: capturas runner-* y videos runner-workflows.mp4 y runner-perf.mp4, en los dos idiomas.
// El runner funcional de workflows usa la Pokédex (PokéAPI real, pocas llamadas). Todo lo de rendimiento
// va SOLO contra una tienda local propia (127.0.0.1, puerto libre) que levanta cada escena: un listado
// rápido, un detalle lento (el cuello de botella) y pedidos que a veces fallan (la pestaña Errores).
import { createServer as createHttp } from 'node:http'

export default (ctx) => {
  const { ES, T, tmp, V, path, writeFileSync, freshPage, moveTo, go, say, saveClip, shot, clip, settle, tab, openPokedex } = ctx
  const L = (es, en) => (ES ? es : en)

  // Textos de la interfaz (src/i18n/locales/{en,es}/ui.ts).
  const U = {
    runWorkflows: L('Ejecutar workflows (runner)', 'Run workflows (runner)'),
    runAll: L('Ejecutar requests (runner)', 'Run requests (runner)'),
    requests: L('Requests', 'Requests'),
    workflows: L('Workflows', 'Workflows'),
    performance: L('Rendimiento', 'Performance'),
    functional: L('Funcional', 'Functional'),
  }

  // --- La tienda local (solo 127.0.0.1) ---
  const NAMES = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon']
  const PRODUCTS = NAMES.map((name, i) => ({ sku: `SKU-${100 + i}`, name, price: 1.5 + i, stock: 40 - i * 3 }))
  let seq = 0
  /** Levanta la tienda en un puerto libre; `/hang/…` no responde nunca (para la prueba sin datos). */
  async function startShop() {
    const hanging = new Set()
    const server = createHttp((req, res) => {
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }
      if (req.method === 'OPTIONS') return res.writeHead(204, cors).end()
      const url = req.url.split('?')[0]
      if (url.startsWith('/hang')) {
        hanging.add(res)
        return
      }
      const json = (status, body) => res.writeHead(status, { ...cors, 'content-type': 'application/json' }).end(JSON.stringify(body))
      const later = (ms, fn) => setTimeout(fn, ms)
      const n = ++seq
      if (req.method === 'GET' && url === '/products') return later(12 + Math.random() * 18, () => json(200, { total: PRODUCTS.length, items: PRODUCTS }))
      if (req.method === 'GET' && url.startsWith('/products/')) return later(110 + Math.random() * 150, () => json(200, PRODUCTS.find((p) => url.endsWith(p.sku)) ?? PRODUCTS[0]))
      if (req.method === 'POST' && url === '/orders') {
        req.resume()
        return later(35 + Math.random() * 45, () => (n % 17 === 0 ? json(503, { error: 'Service unavailable' }) : n % 29 === 0 ? json(429, { error: 'Too many requests' }) : json(201, { id: `ord-${1000 + n}`, status: 'CREATED' })))
      }
      return json(404, { error: 'Not found' })
    })
    await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
    const base = `http://127.0.0.1:${server.address().port}`
    const close = () =>
      new Promise((ok) => {
        for (const r of hanging) r.destroy()
        server.closeAllConnections?.()
        server.close(() => ok())
      })
    return { base, close }
  }
  const shopOpenapi = (base) => `openapi: 3.0.3
info: { title: Shop, version: 1.0.0 }
servers: [{ url: ${base} }]
paths:
  /products:
    get:
      operationId: listProducts
      summary: ${L('Lista los productos', 'List products')}
      responses:
        '200':
          description: The products
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
      parameters: [{ name: sku, in: path, required: true, schema: { type: string, example: SKU-103 } }]
      responses:
        '200':
          description: The product
          content:
            application/json:
              schema:
                type: object
                properties: { sku: { type: string }, name: { type: string }, price: { type: number }, stock: { type: integer } }
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
                lines: { type: array, items: { type: object, properties: { sku: { type: string }, qty: { type: integer } } } }
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema: { type: object, properties: { id: { type: string }, status: { type: string } } }
`
  const SHOP_ARAZZO = `arazzo: 1.0.1
info: { title: Shop, version: 1.0.0 }
sourceDescriptions: [{ name: shop, url: ./shop.openapi.yaml, type: openapi }]
workflows:
  - workflowId: viewProduct
    summary: ${L('Ver un producto', 'View a product')}
    steps:
      - stepId: listProducts
        operationId: listProducts
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          sku: $response.body#/items/3/sku
      - stepId: getProduct
        operationId: getProduct
        parameters: [{ name: sku, in: path, value: $steps.listProducts.outputs.sku }]
        successCriteria: [{ condition: $statusCode == 200 }]
  - workflowId: orderProduct
    summary: ${L('Pedir un producto', 'Order a product')}
    steps:
      - stepId: getProduct
        operationId: getProduct
        parameters: [{ name: sku, in: path, value: SKU-103 }]
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          sku: $response.body#/sku
      - stepId: createOrder
        operationId: createOrder
        requestBody:
          contentType: application/json
          payload:
            customer: Ana
            lines: [{ sku: $steps.getProduct.outputs.sku, qty: 1 }]
        successCriteria: [{ condition: $statusCode == 201 }]
        outputs:
          orderId: $response.body#/id
`
  /** Un workspace con la colección "Shop" contra la tienda local. */
  async function openShopLocal(page, base) {
    writeFileSync(path.join(tmp, 'runner-shop.openapi.yaml'), shopOpenapi(base))
    writeFileSync(path.join(tmp, 'runner-shop.arazzo.yaml'), SHOP_ARAZZO.replace('./shop.openapi.yaml', './runner-shop.openapi.yaml'))
    await page.locator('.welcome-dialog').waitFor()
    await page.locator('.wd-card', { hasText: T.createWs }).click()
    await page.locator('.wd-form input').first().fill('Demo')
    await page.getByRole('button', { name: T.createWsGo }).click()
    await page.locator('.home').waitFor()
    await page.locator('.home-action', { hasText: T.newCol }).click()
    await page.locator('.home-new input').fill('Shop')
    await page.locator('.home-new').getByRole('button', { name: T.create }).click()
    await page.locator('.tree-collection.current', { hasText: 'Shop' }).waitFor()
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.home-action', { hasText: T.importFiles }).click()])
    await chooser.setFiles([path.join(tmp, 'runner-shop.arazzo.yaml'), path.join(tmp, 'runner-shop.openapi.yaml')])
    await page.locator('.tree-step').first().waitFor()
    await settle(page, 600)
  }

  /** El ⋯ de la fila del archivo Arazzo en la barra lateral. */
  async function fileMenu(page) {
    const row = page.locator('.tree-row-wrap', { has: page.locator('.tree-file') }).first()
    await row.hover()
    await row.locator('.row-menu-btn').first().click()
    await page.locator('.row-menu-list').waitFor()
    await settle(page, 300)
  }
  async function openWorkflowsRunner(page) {
    await fileMenu(page)
    await page.locator('.row-menu-list button', { hasText: U.runWorkflows }).click()
    await page.locator('.runner-shell').waitFor()
    await settle(page, 600)
  }

  /** Recorte de una zona, con los límites de la ventana actual. */
  async function cut(page, name, box, pad = 0) {
    await settle(page)
    const vp = ctx.viewport(page)
    const x = Math.max(0, box.x - pad)
    const y = Math.max(0, box.y - pad)
    await ctx.capture(page, path.join(ctx.OUT, `${name}.png`), { x, y, width: Math.min(vp.width - x, box.width + pad * 2), height: Math.min(vp.height - y, box.height + pad * 2) })
    console.log(`  ✓ ${name}`)
  }
  /** Une varias cajas en una. */
  const union = (...bs) => {
    const x = Math.min(...bs.map((b) => b.x))
    const y = Math.min(...bs.map((b) => b.y))
    return { x, y, width: Math.max(...bs.map((b) => b.x + b.width)) - x, height: Math.max(...bs.map((b) => b.y + b.height)) - y }
  }
  /** El menú de una lista nativa es del sistema y no sale en la captura: uno igual con sus opciones reales debajo (como design.mjs). */
  async function showOptions(page, select, highlight) {
    await select.evaluate((el, hl) => {
      document.getElementById('demo-select')?.remove()
      const r = el.getBoundingClientRect()
      const menu = document.createElement('div')
      menu.id = 'demo-select'
      const css = getComputedStyle(document.body)
      Object.assign(menu.style, {
        position: 'fixed', left: `${r.left}px`, top: `${r.bottom + 2}px`, minWidth: `${r.width}px`, zIndex: 2147483600,
        background: 'Canvas', color: 'CanvasText', border: '1px solid rgba(0,0,0,.25)', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,.22)',
        font: `13px/1.35 ${css.fontFamily}`, padding: '4px 0',
      })
      for (const o of el.options) {
        const d = document.createElement('div')
        d.textContent = o.textContent
        Object.assign(d.style, { padding: '4px 12px', whiteSpace: 'nowrap' })
        if (hl ? o.textContent.trim() === hl : o.selected) Object.assign(d.style, { background: '#2f6fde', color: '#fff' })
        menu.append(d)
      }
      document.documentElement.append(menu)
    }, highlight)
    await settle(page, 200)
  }
  const hideOptions = (page) => page.evaluate(() => document.getElementById('demo-select')?.remove())
  /** Elige una opción por su texto. */
  async function choose(select, label) {
    const value = await select.evaluate((el, l) => [...el.options].find((o) => o.textContent.trim() === l)?.value, label)
    if (value === undefined) throw new Error(`no hay opción "${label}"`)
    await select.selectOption(value)
  }
  /** Otro ambiente (copia del activo), desde la pastilla del ambiente arriba a la derecha → Configurar ambiente…; queda activo. */
  async function addEnv(page, name) {
    await page.locator('.app-env').click()
    await page.locator('.context-menu button').last().click()
    await page.locator('.env-add').click()
    await page.locator('.env-name-input').fill(name)
    await page.keyboard.press('Enter')
    await settle(page, 600)
  }
  const runnerTab = (page) => page.locator('.ws-tab', { has: page.locator('.ws-history-tab', { hasText: 'Runner' }) }).first()
  const envSelect = (page) => page.locator('.runner-env select').first()
  const config = (page) => page.locator('.runner-config').first()
  /** Lleva un elemento al principio de la columna de configuración (tiene su propio scroll). */
  const reveal = (loc, block = 'start') => loc.first().evaluate((el, b) => el.scrollIntoView({ block: b }), block)
  /** Sube al principio el panel con scroll que contiene al elemento (los resultados crecen y se desplazan solos). */
  const toTop = (page, selector) =>
    page.evaluate((s) => {
      let el = document.querySelector(s)
      while (el && el !== document.body) {
        if (el.scrollHeight > el.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)) {
          el.scrollTop = 0
          return
        }
        el = el.parentElement
      }
      window.scrollTo(0, 0)
    }, selector)
  /** Espera a que termine lo que corre en el runner. */
  const untilFinished = (page, timeout = 120000) => page.waitForFunction(() => document.querySelector('.runner-results') && !document.querySelector('.runner-progress') && !document.querySelector('.runner-step.pending'), null, { timeout })
  const typeRadio = (page, label) => page.locator('.runner-radio', { hasText: label }).first()
  const source = (page, label) => page.locator('.runner-source .segmented button', { hasText: label }).first()

  /** Configura una prueba de rendimiento (perfil, usuarios, duración en segundos, carga inicial). */
  async function setLoad(page, { profile, users, seconds, initial, think }) {
    const lc = page.locator('.load-config')
    await lc.locator('.load-fields select').first().selectOption(profile)
    await settle(page, 200)
    await lc.locator('.load-fields input[type="number"]').first().fill(String(users))
    await lc.locator('.perf-duration select').selectOption('s')
    await lc.locator('.perf-duration input').fill(String(seconds))
    if (initial !== undefined && (await lc.locator('.perf-initial input').count())) await lc.locator('.perf-initial input').fill(String(initial))
    if (think !== undefined) await lc.locator('.perf-think input').fill(String(think))
    await settle(page, 400)
  }
  /** Los umbrales de "Pasa la prueba si…". */
  async function setPassIf(page, { avg, p95, errors }) {
    const pass = page.locator('.perf-pass')
    if (!(await pass.evaluate((el) => el.open))) await pass.locator('summary').click()
    const rows = pass.locator('.perf-pass-row')
    for (const [i, v] of [[0, avg], [1, p95], [2, errors]]) {
      if (v === undefined) continue
      await rows.nth(i).locator('input[type="checkbox"]').check()
      await rows.nth(i).locator('input[type="number"]').fill(String(v))
    }
    await settle(page, 300)
  }
  /** Marca la confirmación de carga (y escribe el nombre del ambiente si parece producción). */
  async function confirmLoad(page, typed) {
    const safety = page.locator('.load-safety')
    await safety.locator('input[type="checkbox"]').check()
    if (typed) await safety.locator('.load-safety-type input').fill(typed)
    await settle(page, 300)
  }

  const CSV = `pokemon,nickname\npikachu,Sparky\nbulbasaur,Bulby\ncharmander,Flare\n`
  writeFileSync(path.join(tmp, 'pokemon-data.csv'), CSV)

  const scenes = {}

  // ---------------------------------------------------------------- Runner de workflows (Pokédex, API real)
  scenes['runner-workflows'] = async () => {
    const page = await freshPage()
    await openPokedex(page)
    await addEnv(page, 'staging')
    // El ⋯ del archivo Arazzo con "Ejecutar workflows (runner)".
    await fileMenu(page)
    const side = await page.locator('aside').first().boundingBox()
    const menu = await page.locator('.row-menu-list').boundingBox()
    await cut(page, 'runner-open-menu', { x: side.x, y: Math.max(side.y, menu.y - 110), width: Math.max(side.width, menu.x + menu.width - side.x + 10), height: menu.height + 150 })
    await page.locator('.row-menu-list button', { hasText: U.runWorkflows }).click()
    await page.locator('.runner-shell').waitFor()
    await choose(envSelect(page), 'local')
    await settle(page, 800)
    // Más alto: la configuración completa (hasta Ajustes) a la vista.
    await ctx.resize(page, 1280, 1300)
    await shot(page, 'runner-overview')
    await ctx.resize(page, 1280, 800)
    // El ambiente: se elige sin salir del runner.
    await showOptions(page, envSelect(page), 'local')
    const sel = await envSelect(page).boundingBox()
    const opts = await page.locator('#demo-select').boundingBox()
    const envLabel = await page.locator('.runner-env').boundingBox()
    await cut(page, 'runner-environment', union(envLabel, opts), 14)
    await hideOptions(page)
    // Los casos de un workflow: cuáles van, y si van contra la API real o simulados.
    await page.locator('.runner-wf-toggle').first().click()
    await settle(page, 500)
    await cut(page, 'runner-workflows-cases', await page.locator('.runner-order').boundingBox(), 10)
    // La configuración del modo funcional, completa (la página más alta para que entre).
    {
      await ctx.resize(page, 1280, 1400)
      const b = await config(page).boundingBox()
      const bar = await page.locator('.status-bar, footer').first().boundingBox().catch(() => null)
      const bottom = bar ? Math.min(b.y + b.height, bar.y - 12) : b.y + b.height
      await cut(page, 'runner-workflows-setup', { ...b, height: bottom - b.y }, 10)
      await ctx.resize(page, 1280, 800)
    }
    // Un archivo de datos: cada fila es una iteración.
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.runner-config .runner-file').click()])
    await chooser.setFiles(path.join(tmp, 'pokemon-data.csv'))
    await page.locator('.runner-config .runner-data strong').waitFor()
    const dataHead = config(page).locator('h4').nth(2)
    await reveal(dataHead, 'center')
    await settle(page, 400)
    const fill = config(page).locator('p.muted.small', { hasText: /pokemon/ }).first()
    const cfg = await config(page).boundingBox()
    const db = union(await dataHead.boundingBox(), await fill.boundingBox())
    await cut(page, 'runner-data-file', { x: cfg.x, y: db.y, width: cfg.width, height: db.height }, 14)
    // Con el CSV: solo la ficha y el explorador de tipos (pocas llamadas a la PokéAPI).
    const rows = page.locator('.runner-list > li:not(.runner-cases)')
    for (const i of [2, 3]) await rows.nth(i).locator('input[type="checkbox"]').first().uncheck()
    await page.locator('.runner-start').click()
    await page.locator('.runner-results').waitFor()
    await untilFinished(page)
    await settle(page, 1200)
    await shot(page, 'runner-workflows-results')
    await ctx.done()
  }

  // ---------------------------------------------------------------- Runner de requests (tienda local)
  scenes['runner-requests'] = async () => {
    const shop = await startShop()
    try {
      const page = await freshPage()
      await openShopLocal(page, shop.base)
      // Requests desde el contrato.
      const row = page.locator('.tree-list li', { has: page.locator('.tree-contract') }).first()
      await row.hover()
      await row.locator('.tree-gen').click()
      await page.locator('.gen-req').waitFor()
      await page.locator('.gen-req button.primary').click()
      await settle(page, 800)
      // Que se vaya el aviso "Se crearon 3 requests".
      await page.getByText('«Shop»').first().waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})
      await openWorkflowsRunner(page)
      await source(page, U.requests).click()
      await settle(page, 800)
      await shot(page, 'runner-requests-setup')
      const iter = config(page).locator('.runner-iter-field input')
      await iter.fill('3')
      await config(page).locator('.runner-delay input[type="checkbox"]').check()
      await config(page).locator('.runner-delay input[type="number"]').fill('200')
      await reveal(config(page).locator('h4').last(), 'center')
      await settle(page, 400)
      await cut(page, 'runner-requests-settings', await config(page).boundingBox(), 10)
      await page.locator('.runner-start').click()
      await untilFinished(page)
      await settle(page, 1000)
      await shot(page, 'runner-requests-results')
      await ctx.done()
    } finally {
      await shop.close()
    }
  }

  // ---------------------------------------------------------------- Rendimiento (SOLO la tienda local)
  scenes['runner-perf'] = async () => {
    const shop = await startShop()
    try {
      const page = await freshPage()
      await ctx.resize(page, 1440, 1000)
      await openShopLocal(page, shop.base)
      await addEnv(page, 'production')
      await openWorkflowsRunner(page)
      await typeRadio(page, U.performance).click()
      await settle(page, 500)
      await setLoad(page, { profile: 'peak', users: 8, seconds: 24, initial: 1, think: 200 })
      const lc = page.locator('.load-config')
      await reveal(lc)
      await settle(page, 400)
      const card = await page.locator('.perf-preview-card').boundingBox()
      await cut(page, 'runner-perf-setup', union(await lc.boundingBox().then((b) => ({ ...b, height: 10 })), card), 12)
      await setPassIf(page, { avg: 500, p95: 1000, errors: 1 })
      await page.evaluate(() => document.activeElement?.blur())
      await reveal(page.locator('.perf-pass'), 'center')
      await cut(page, 'runner-perf-criteria', await page.locator('.perf-pass').boundingBox(), 8)
      // "production" parece producción: hay que escribir su nombre.
      await confirmLoad(page, 'production')
      await cut(page, 'runner-perf-confirm', await page.locator('.runner-config .runner-startbar').boundingBox(), 6)
      // La prueba de verdad va al ambiente "local" (la misma tienda en 127.0.0.1).
      await choose(envSelect(page), 'local')
      await settle(page, 500)
      await confirmLoad(page)
      await page.locator('.runner-start').click()
      await page.locator('.runner-results').waitFor()
      await settle(page, 4000)
      // Cerrar el runner mientras corre: pregunta.
      await runnerTab(page).locator('.ws-tab-close').click()
      const dlg = page.locator('[role="dialog"]').last()
      await dlg.waitFor()
      await settle(page, 400)
      await cut(page, 'runner-close-busy', await dlg.boundingBox(), 16)
      await dlg.locator('button', { hasText: L('Seguir ejecutando', 'Keep running') }).click()
      await untilFinished(page)
      // Más alta: el veredicto, los números, el gráfico y la tabla con el paso más lento, todo a la vista.
      await ctx.resize(page, 1440, 1300)
      await settle(page, 1500)
      await toTop(page, '.runner-results')
      await settle(page, 400)
      await shot(page, 'runner-perf-results')
      // Un rango del gráfico.
      const chart = await page.locator('.perf-chart-box').boundingBox()
      const y = chart.y + chart.height * 0.45
      await page.mouse.move(chart.x + chart.width * 0.35, y)
      await page.mouse.down()
      await page.mouse.move(chart.x + chart.width * 0.62, y, { steps: 12 })
      await page.mouse.up()
      await page.mouse.move(chart.x + chart.width + 40, chart.y - 40)
      await settle(page, 800)
      await toTop(page, '.runner-results')
      await settle(page, 400)
      await shot(page, 'runner-perf-range')
      await ctx.resize(page, 1440, 1000)
      await page.locator('.perf-tabs button').nth(1).click()
      await settle(page, 600)
      await shot(page, 'runner-perf-errors')
      await ctx.done()
    } finally {
      await shop.close()
    }
  }

  scenes['runner-perf-nodata'] = async () => {
    const shop = await startShop()
    try {
      const page = await freshPage()
      await ctx.resize(page, 1440, 1000)
      // La tienda local, pero en una ruta que nunca responde.
      await openShopLocal(page, `${shop.base}/hang`)
      await openWorkflowsRunner(page)
      await typeRadio(page, U.performance).click()
      await settle(page, 500)
      await setLoad(page, { profile: 'fixed', users: 2, seconds: 5, think: 0 })
      await confirmLoad(page)
      await page.locator('.runner-start').click()
      await untilFinished(page, 60000)
      await settle(page, 1000)
      const res = await page.locator('.runner-results').boundingBox()
      const kpis = await page.locator('.perf-kpis').boundingBox()
      await cut(page, 'runner-perf-nodata', { ...res, height: kpis.y + kpis.height - res.y + 8 })
      await ctx.done()
    } finally {
      await shop.close()
    }
  }

  // ---------------------------------------------------------------- Videos
  const C = ES
    ? {
        w1: 'Abre el runner desde el menú ⋯ del archivo Arazzo', w2: 'Elige qué workflows corren y en qué orden', w3: 'Abre un workflow: sus casos, contra la API real o simulados', w4: 'Un CSV: cada fila es una iteración', w5: 'La columna pokemon llena el input del mismo nombre', w6: 'Ejecuta', w7: 'Un veredicto por workflow, iteración por iteración', w8: 'Abre uno para ver sus casos',
        p1: 'Elige Rendimiento: muchos usuarios a la vez', p2: 'La forma de la carga: perfil, usuarios y duración', p3: 'Arrastra los marcadores para mover cada fase', p4: 'Pasa la prueba si…: los umbrales del veredicto', p5: 'Confirma: van muchos requests a este ambiente', p6: 'Inicia la prueba', p7: 'En vivo: requests por segundo, tiempo, errores y usuarios', p8: 'El veredicto, los números y el paso más lento', p9: 'Arrastra sobre el gráfico para ver un tramo',
      }
    : {
        w1: "Open the runner from the Arazzo file's ⋯ menu", w2: 'Choose which workflows run, and in what order', w3: 'Open a workflow: its cases, against the real API or simulated', w4: 'A CSV: each row is an iteration', w5: 'The pokemon column fills the input with that name', w6: 'Run', w7: 'A verdict per workflow, iteration by iteration', w8: 'Open one to see its cases',
        p1: 'Choose Performance: many users at once', p2: 'The load shape: profile, users and duration', p3: 'Drag the markers to move each phase', p4: 'Pass test if…: the thresholds for the verdict', p5: 'Confirm: many requests will go to this environment', p6: 'Start the test', p7: 'Live: requests per second, response time, errors and users', p8: 'The verdict, the numbers and the slowest step', p9: 'Drag over the chart to look at a time range',
      }

  scenes['clip-runner-workflows'] = async () => {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await openPokedex(page)
    await settle(page, 900)
    const from = Date.now()
    await say(page, C.w1, 300)
    const row = page.locator('.tree-row-wrap', { has: page.locator('.tree-file') }).first()
    await go(page, row, { click: false, pause: 300 })
    await go(page, row.locator('.row-menu-btn').first(), { pause: 700 })
    await go(page, page.locator('.row-menu-list button', { hasText: U.runWorkflows }), { pause: 1200 })
    await page.locator('.runner-shell').waitFor()
    await say(page, C.w2, 300)
    const rows = page.locator('.runner-list > li:not(.runner-cases)')
    for (const i of [1, 2, 3]) await go(page, rows.nth(i).locator('input[type="checkbox"]').first(), { pause: 450 })
    await settle(page, 600)
    await say(page, C.w3, 300)
    await go(page, page.locator('.runner-wf-toggle').first(), { pause: 2600 })
    await say(page, C.w4, 300)
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), go(page, page.locator('.runner-config .runner-file'), { pause: 200 })])
    await chooser.setFiles(path.join(tmp, 'pokemon-data.csv'))
    await page.locator('.runner-config .runner-data strong').waitFor()
    await settle(page, 1200)
    await say(page, C.w5, 300)
    await go(page, config(page).locator('p.muted.small', { hasText: /pokemon/ }).first(), { click: false, pause: 2400 })
    await say(page, C.w6, 300)
    await go(page, page.locator('.runner-start'), { pause: 300 })
    await page.locator('.runner-results').waitFor()
    await untilFinished(page)
    await settle(page, 600)
    await say(page, C.w7, 2600)
    await say(page, C.w8, 300)
    await go(page, page.locator('.runner-results .runner-step-row').nth(1), { pause: 3000 })
    await say(page, '', 400)
    await saveClip(page, 'runner-workflows', started, from)
  }

  scenes['clip-runner-perf'] = async () => {
    const shop = await startShop()
    try {
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openShopLocal(page, shop.base)
      await openWorkflowsRunner(page)
      await settle(page, 800)
      const from = Date.now()
      await say(page, C.p1, 300)
      await go(page, typeRadio(page, U.performance), { pause: 1200 })
      await say(page, C.p2, 300)
      const lc = page.locator('.load-config')
      await reveal(lc)
      await settle(page, 400)
      const profile = lc.locator('.load-fields select').first()
      await go(page, profile, { click: false, pause: 300 })
      await profile.selectOption('peak')
      await settle(page, 900)
      const users = lc.locator('.load-fields input[type="number"]').first()
      await go(page, users, { click: false, pause: 200 })
      await users.fill('6')
      await settle(page, 500)
      await go(page, lc.locator('.perf-duration select'), { click: false, pause: 200 })
      await lc.locator('.perf-duration select').selectOption('s')
      const dur = lc.locator('.perf-duration input')
      await go(page, dur, { click: false, pause: 200 })
      await dur.fill('16')
      await settle(page, 500)
      const initial = lc.locator('.perf-initial input')
      await go(page, initial, { click: false, pause: 200 })
      await initial.fill('1')
      await settle(page, 1000)
      await say(page, C.p3, 300)
      await reveal(page.locator('.perf-preview-card'))
      await settle(page, 300)
      const pin = page.locator('.pv-handle-pin').first()
      const b = await pin.boundingBox()
      await moveTo(page, b.x + b.width / 2, b.y + b.height / 2)
      await page.mouse.down()
      await moveTo(page, b.x + b.width / 2 + 30, b.y + b.height / 2)
      await page.mouse.up()
      await settle(page, 1400)
      await say(page, C.p4, 300)
      const pass = page.locator('.perf-pass')
      await go(page, pass.locator('summary'), { click: false, pause: 200 })
      await pass.locator('summary').click()
      await settle(page, 500)
      for (const i of [1, 2]) {
        const box = pass.locator('.perf-pass-row').nth(i).locator('input[type="checkbox"]')
        await go(page, box, { click: false, pause: 200 })
        await box.check()
        await settle(page, 500)
      }
      await settle(page, 600)
      await say(page, C.p5, 300)
      const ok = page.locator('.load-safety input[type="checkbox"]')
      await go(page, ok, { click: false, pause: 200 })
      await ok.check()
      await settle(page, 1200)
      await say(page, C.p6, 300)
      await go(page, page.locator('.runner-start'), { click: false, pause: 200 })
      await page.locator('.runner-start').click()
      await page.locator('.runner-results').waitFor()
      // Los resultados en vivo arriba del todo (el panel crece y se desplaza).
      await toTop(page, '.runner-results')
      await say(page, C.p7, 300)
      await untilFinished(page)
      await settle(page, 800)
      await toTop(page, '.runner-results')
      await settle(page, 300)
      await say(page, C.p8, 300)
      await go(page, page.locator('.perf-verdict'), { click: false, pause: 1800 })
      await go(page, page.locator('.perf-worst'), { click: false, pause: 1800 })
      await say(page, C.p9, 300)
      const chart = page.locator('.perf-chart-box')
      await chart.evaluate((el) => el.scrollIntoView({ block: 'center' }))
      await settle(page, 400)
      const c = await chart.boundingBox()
      const y = c.y + c.height * 0.45
      await moveTo(page, c.x + c.width * 0.35, y)
      await page.mouse.down()
      await moveTo(page, c.x + c.width * 0.62, y)
      await page.mouse.up()
      await settle(page, 600)
      await moveTo(page, c.x + c.width * 0.5, c.y - 30)
      // Termina con el gráfico (y su rango) arriba y el detalle debajo: es el póster del video.
      await chart.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'smooth' }))
      await settle(page, 3000)
      await say(page, '', 400)
      await saveClip(page, 'runner-perf', started, from)
    } finally {
      await shop.close()
    }
  }

  return scenes
}
