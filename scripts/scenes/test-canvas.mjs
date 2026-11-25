// Escenas de los resultados sobre el lienzo (Probar workflows): ejecutar desde Diseño, la respuesta de un
// paso que falló, comparar con la ejecución anterior, probar una ruta, la cobertura, la pausa y ejecutar
// una parte. Capturas test-canvas-*, test-probe-route, test-coverage-menu, test-pause*, test-run-range y
// el video test-canvas-run, en los dos idiomas, siempre de la ventana completa.
// La Pokédex va en simulación (sin red), salvo la falla de "missingno", contra la PokéAPI real (como el
// tutorial). La tienda va SOLO contra un servidor local propio (127.0.0.1, puerto libre).
import { createServer as createHttp } from 'node:http'

export default (ctx) => {
  const { ES, T, tmp, V, path, writeFileSync, freshPage, go, say, saveClip, shot, settle, tab, openPokedex, focusStep } = ctx
  const L = (es, en) => (ES ? es : en)

  // Textos de la interfaz (src/i18n/locales/{en,es}/ui.ts).
  const U = {
    happy: L('Camino feliz', 'Happy path'),
    none: L('Ninguno', 'None'),
    resp: L('Respuesta', 'Response'),
    datos: L('Datos', 'Data'),
  }

  // --- La tienda local (solo 127.0.0.1): productos conocidos, sus reseñas y carritos ---
  const PRODUCTS = { 'SKU-103': { sku: 'SKU-103', name: 'Date', price: 4.5, stock: 31 }, 'SKU-104': { sku: 'SKU-104', name: 'Elderberry', price: 5.5, stock: 28 } }
  async function startShop() {
    const server = createHttp((req, res) => {
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }
      if (req.method === 'OPTIONS') return res.writeHead(204, cors).end()
      const json = (status, body) => setTimeout(() => res.writeHead(status, { ...cors, 'content-type': 'application/json' }).end(JSON.stringify(body)), 40 + Math.random() * 60)
      const url = req.url.split('?')[0]
      let m
      if (req.method === 'GET' && (m = /^\/products\/([^/]+)\/reviews$/.exec(url))) return PRODUCTS[m[1]] ? json(200, { sku: m[1], rating: 4.6, count: 128 }) : json(404, { error: 'not_found' })
      if (req.method === 'GET' && (m = /^\/products\/([^/]+)$/.exec(url))) return PRODUCTS[m[1]] ? json(200, PRODUCTS[m[1]]) : json(404, { error: 'not_found', message: 'The product does not exist' })
      if (req.method === 'POST' && url === '/carts') {
        req.resume()
        return json(201, { id: 'cart-2001', status: 'OPEN' })
      }
      return json(404, { error: 'not_found' })
    })
    await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
    const base = `http://127.0.0.1:${server.address().port}`
    const close = () => new Promise((ok) => (server.closeAllConnections?.(), server.close(() => ok())))
    return { base, close }
  }
  const shopOpenapi = (base) => `openapi: 3.0.3
info: { title: Shop, version: 1.0.0 }
servers: [{ url: ${base} }]
paths:
  /products/{sku}:
    get:
      operationId: getProduct
      summary: ${L('Detalle de un producto', 'Product detail')}
      parameters: [{ name: sku, in: path, required: true, schema: { type: string } }]
      responses:
        '200':
          description: The product
          content:
            application/json:
              schema: { type: object, properties: { sku: { type: string }, name: { type: string }, price: { type: number }, stock: { type: integer } } }
              example: { sku: SKU-103, name: Date, price: 4.5, stock: 31 }
        '404': { description: The product does not exist }
  /products/{sku}/reviews:
    get:
      operationId: getReviews
      summary: ${L('Reseñas de un producto', 'Product reviews')}
      parameters: [{ name: sku, in: path, required: true, schema: { type: string } }]
      responses:
        '200':
          description: The reviews
          content:
            application/json:
              schema: { type: object, properties: { sku: { type: string }, rating: { type: number }, count: { type: integer } } }
              example: { sku: SKU-103, rating: 4.6, count: 128 }
  /carts:
    post:
      operationId: createCart
      summary: ${L('Crear el carrito', 'Create the cart')}
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                customer: { type: string }
                products: { type: array, items: { type: object, properties: { sku: { type: string }, quantity: { type: integer } } } }
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema: { type: object, properties: { id: { type: string }, status: { type: string } } }
              example: { id: cart-2001, status: OPEN }
`
  const SHOP_ARAZZO = `arazzo: 1.0.1
info: { title: Shop, version: 1.0.0 }
sourceDescriptions: [{ name: shop, url: ./canvas-shop.openapi.yaml, type: openapi }]
workflows:
  - workflowId: checkProduct
    summary: ${L('Revisar un producto', 'Check a product')}
    inputs:
      type: object
      required: [sku]
      properties:
        sku: { type: string, example: SKU-103 }
    steps:
      - stepId: getProduct
        operationId: getProduct
        parameters: [{ name: sku, in: path, value: $inputs.sku }]
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          sku: $response.body#/sku
      - stepId: getReviews
        operationId: getReviews
        parameters: [{ name: sku, in: path, value: $steps.getProduct.outputs.sku }]
        successCriteria: [{ condition: $statusCode == 200 }]
  - workflowId: buyProduct
    summary: ${L('Comprar un producto', 'Buy a product')}
    steps:
      - stepId: getProduct
        operationId: getProduct
        parameters: [{ name: sku, in: path, value: SKU-103 }]
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          sku: $response.body#/sku
      - stepId: createCart
        operationId: createCart
        requestBody:
          contentType: application/json
          payload:
            customer: ana@example.com
            products: [{ sku: $steps.getProduct.outputs.sku, quantity: 1 }]
        successCriteria: [{ condition: $statusCode == 201 }]
        outputs:
          cartId: $response.body#/id
`
  async function openShopLocal(page, base) {
    writeFileSync(path.join(tmp, 'canvas-shop.openapi.yaml'), shopOpenapi(base))
    writeFileSync(path.join(tmp, 'canvas-shop.arazzo.yaml'), SHOP_ARAZZO)
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
    await chooser.setFiles([path.join(tmp, 'canvas-shop.arazzo.yaml'), path.join(tmp, 'canvas-shop.openapi.yaml')])
    await page.locator('.tree-step').first().waitFor()
    await settle(page, 600)
  }

  /** Abre un workflow en la pestaña Diseño, con el lienzo listo. */
  async function openDesign(page, id) {
    await page.locator(`[data-journey="${id}"]`).click()
    await tab(page, 'design').click()
    await page.locator('.builder .step-node').first().waitFor()
    await settle(page, 900)
  }
  const node = (page, stepId) => page.locator('.builder .step-node', { hasText: stepId }).first()
  /** Elige el modo (0 API real, 1 simulación) y pulsa Ejecutar (con "Ejecutar igual" si pregunta). */
  async function runCanvas(page, mode) {
    await page.locator('.ws-runbar .segmented button').nth(mode).click()
    await page.locator('.ws-run').click()
    await settle(page, 500)
    const anyway = page.locator('.ws-strip.warn button', { hasText: T.runAnyway })
    if (await anyway.count()) await anyway.first().click()
  }
  /** Espera a que termine lo que corre en el lienzo; si una lista pregunta, sigue con lo propuesto. Con `pause`, hasta la pausa. */
  async function finish(page, { pause = false } = {}) {
    await page.locator('.canvas-runbar').waitFor({ timeout: 30000 })
    for (let i = 0; i < 200; i++) {
      await settle(page, 300)
      const pick = page.locator('.lp-dialog button.primary')
      if (await pick.count()) {
        await pick.first().click()
        continue
      }
      const state = await page.evaluate(() => {
        const bar = document.querySelector('.canvas-runbar')
        if (!bar) return 'none'
        if (bar.querySelector('.rb-head.warn')) return 'paused'
        if (bar.querySelector('.rb-head.muted, .rb-case.v-running, .rb-case.v-pending')) return 'busy'
        return 'done'
      })
      if (pause ? state === 'paused' : state === 'done') break
    }
    await settle(page, 1200)
  }
  /** Aleja el lienzo `out` veces y lo arrastra (por el fondo) hasta que la tarjeta del paso quede arriba, entera a la vista. */
  async function frame(page, stepId, { out = 1, top = 90 } = {}) {
    for (let i = 0; i < out; i++) {
      await page.locator('.zoom-bar .icon-btn').first().click()
      await settle(page, 300)
    }
    const canvas = page.locator('.builder .graph')
    for (let i = 0; i < 4; i++) {
      const [n, c] = await Promise.all([node(page, stepId).boundingBox(), canvas.boundingBox()])
      if (!n || !c) break
      const dy = n.y - (c.y + top)
      if (Math.abs(dy) < 8) break
      const x = c.x + 8
      const y0 = dy > 0 ? c.y + c.height - 110 : c.y + 150
      const y1 = Math.max(c.y + 20, Math.min(c.y + c.height - 20, y0 - dy))
      await page.mouse.move(x, y0)
      await page.mouse.down()
      await page.mouse.move(x, y1, { steps: 10 })
      await page.mouse.up()
      await settle(page, 250)
    }
  }
  /** Cierra el panel del paso: la barra de resultado queda entera. */
  async function closePanel(page) {
    const x = page.locator('.bl-side .icon-btn[title*="(Esc)"]').first()
    if (await x.count()) await x.click()
    await settle(page, 400)
  }
  /** Saca el puntero del lienzo (que no quede un tooltip). */
  const away = (page) => page.mouse.move(640, 60)

  const scenes = {}

  // ---------------------------------------------------------------- La Pokédex, en simulación
  scenes['test-canvas-pokedex'] = async () => {
    const page = await freshPage()
    await openPokedex(page)
    await openDesign(page, 'pokemonCard')
    // ▷ Probar en la ruta 404 de getPokemon, antes de ejecutar nada.
    await node(page, 'getPokemon').locator('.sn-probe').first().click()
    await finish(page)
    await frame(page, 'getPokemon', { out: 2, top: 70 })
    await away(page)
    await shot(page, 'test-probe-route')
    // Los dos casos en simulación.
    await runCanvas(page, 1)
    await finish(page)
    await closePanel(page)
    await frame(page, 'getPokemon', { out: 0 })
    await away(page)
    await shot(page, 'test-canvas-run')
    // El menú de la cobertura.
    await page.locator('.cov-chip').click()
    await page.locator('.cov-menu').waitFor()
    await settle(page, 400)
    await shot(page, 'test-coverage-menu')
    await page.keyboard.press('Escape')
    await settle(page, 300)
    // Clic derecho en un paso: ejecutar solo, hasta o desde aquí.
    await focusStep(page, 'getSpecies')
    await frame(page, 'getSpecies', { out: 0, top: 70 })
    await node(page, 'getSpecies').locator('.sn-title').first().click({ button: 'right' })
    await page.locator('.context-menu').waitFor()
    await settle(page, 400)
    await shot(page, 'test-run-range')
    await page.keyboard.press('Escape')
    await settle(page, 300)
    // La pausa antes de getSpecies: el panel del paso, "⏸ Pausar aquí", y ejecutar.
    await focusStep(page, 'getSpecies')
    await page.locator('.bl-pause-btn').click()
    await settle(page, 300)
    await runCanvas(page, 1)
    await finish(page, { pause: true })
    const field = page.locator('.bl-pause-field input').first()
    await field.fill('150')
    await away(page)
    await shot(page, 'test-pause')
    await ctx.done()
  }

  // ---------------------------------------------------------------- La falla de "missingno" (PokéAPI real, como el tutorial)
  scenes['test-canvas-failed'] = async () => {
    const page = await freshPage()
    await openPokedex(page)
    await page.locator('[data-journey="pokemonCard"]').click()
    await tab(page, 'inputs').click()
    const input = page.locator('.ws-view .field-grid input').first()
    await input.fill('missingno')
    await input.press('Tab')
    // Solo el camino feliz.
    await tab(page, 'cases').click()
    await page.getByRole('button', { name: U.none, exact: true }).first().click()
    await page.locator('.case-row', { has: page.locator('strong', { hasText: U.happy }) }).first().locator('input[type="checkbox"]').first().check()
    await tab(page, 'design').click()
    await page.locator('.builder .step-node').first().waitFor()
    await runCanvas(page, 0)
    await finish(page)
    // El paso que falló, en su pestaña Respuesta.
    const panelTab = page.locator('.bl-tabs [role="tab"]', { hasText: U.resp }).first()
    if (!(await panelTab.count())) await focusStep(page, 'getPokemon')
    await page.locator('.bl-tabs [role="tab"]', { hasText: U.resp }).first().click()
    await settle(page, 600)
    await frame(page, 'getPokemon', { out: 2, top: 70 })
    // Desde "Por qué falló", arriba del panel.
    await page.locator('.bl-resp h5.bl-sub').first().evaluate((el) => el.scrollIntoView({ block: 'start' }))
    await away(page)
    await shot(page, 'test-canvas-failed-response')
    await ctx.done()
  }

  // ---------------------------------------------------------------- La tienda local: comparar y la pausa con un body JSON
  scenes['test-canvas-shop'] = async () => {
    const shop = await startShop()
    try {
      const page = await freshPage()
      await openShopLocal(page, shop.base)
      // Revisar un producto: una ejecución con SKU-103, otra con un producto que no existe, y Comparar.
      await openDesign(page, 'checkProduct')
      await runCanvas(page, 0)
      await finish(page)
      await tab(page, 'inputs').click()
      const sku = page.locator('.ws-view .field-grid input').first()
      await sku.fill('SKU-999')
      await sku.press('Tab')
      await tab(page, 'design').click()
      await page.locator('.builder .step-node').first().waitFor()
      await runCanvas(page, 0)
      await finish(page)
      await page.locator('.rb-compare').click()
      await settle(page, 600)
      // Sin el panel: la barra entera, y los dos pasos con lo que hicieron antes.
      await closePanel(page)
      await frame(page, 'getProduct', { out: 2, top: 70 })
      await away(page)
      await shot(page, 'test-canvas-compare')
      // Comprar un producto: la pausa antes de "Crear el carrito", con quantity en 500.
      await openDesign(page, 'buyProduct')
      await focusStep(page, 'createCart')
      await page.locator('.bl-pause-btn').click()
      await settle(page, 300)
      await runCanvas(page, 0)
      await finish(page, { pause: true })
      const qty = page.locator('.bl-pause-field', { hasText: 'quantity' }).locator('input').first()
      await qty.fill('500')
      await away(page)
      await shot(page, 'test-pause-body')
      await ctx.done()
    } finally {
      await shop.close()
    }
  }

  // ---------------------------------------------------------------- Video: ejecutar en el lienzo
  const C = ES
    ? { c1: 'En Diseño: elige Simulación y ejecuta', c2: 'Cada tarjeta dice cómo terminó el paso', c3: 'La barra de abajo: cómo terminó y un chip por caso', c4: 'Elige el caso del 404: su recorrido en el lienzo', c5: 'El paso falló y la ruta del 404 terminó el workflow', c6: 'Su pestaña Respuesta dice por qué' }
    : { c1: 'In Design: choose Simulation and run', c2: 'Each card says how its step ended', c3: 'The bar at the bottom: how it ended and one chip per case', c4: 'Choose the 404 case: its path on the canvas', c5: 'The step failed and the 404 route ended the workflow', c6: 'Its Response tab says why' }

  scenes['clip-test-canvas-run'] = async () => {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await openPokedex(page)
    await openDesign(page, 'pokemonCard')
    // La leyenda va encima de la barra de resultado, no sobre ella: el video la señala.
    await page.addStyleTag({ content: '#demo-caption { bottom: 104px !important; }' })
    const from = Date.now()
    await say(page, C.c1, 300)
    await go(page, page.locator('.ws-runbar .segmented button').nth(1), { pause: 700 })
    await go(page, page.locator('.ws-run'), { pause: 300 })
    await finish(page)
    await frame(page, 'getPokemon', { out: 2, top: 70 })
    await say(page, C.c2, 300)
    await go(page, node(page, 'getPokemon').locator('.sn-run-line').first(), { click: false, pause: 2200 })
    await say(page, C.c3, 300)
    await go(page, page.locator('.canvas-runbar .rb-head'), { click: false, pause: 2200 })
    await say(page, C.c4, 300)
    await go(page, page.locator('.canvas-runbar .rb-case').nth(1), { pause: 1600 })
    await say(page, C.c5, 300)
    await go(page, node(page, 'getPokemon').locator('.sn-run-line').first(), { click: false, pause: 2400 })
    await say(page, C.c6, 300)
    await go(page, page.locator('.bl-tabs [role="tab"]', { hasText: U.resp }).first(), { pause: 2800 })
    await say(page, '', 400)
    await saveClip(page, 'test-canvas-run', started, from)
  }

  return scenes
}
