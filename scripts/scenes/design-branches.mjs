// Escenas de "Diseñar workflows" sobre las rutas y los pasos que se agregan con un + en el lienzo:
// un paso nuevo para el 404 (el editor de rutas y la búsqueda del paso), el resultado (el camino
// feliz termina con ✓), el + de una flecha, y un Arazzo que no se puede leer (aviso en el lienzo,
// Ejecutar desactivado y la marca en la barra lateral). Usan un catálogo de prueba propio contra la
// API local de capture.mjs, con un segundo contrato (soporte) para mandar el 404 a otra API.
import { helpers } from './design.mjs'

export default (ctx) => {
  const { ES, API, V, tmp, path, writeFileSync, freshPage, moveTo, go, say, saveClip, shot, settle, tab, done, openPokedex } = ctx
  const h = helpers(ctx)
  const { L, openStore, design, node, bring, deselect, zoom, showTitle, hideTitle, failRow, routeDialog } = h

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

  const catalog = ['catalog.arazzo.yaml', 'catalog.openapi.yaml', 'support.openapi.yaml']
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
  /** El 404 de getSpecies (Pokédex): el editor de rutas, Ir a otro paso y «o un paso nuevo…». */
  async function newStepFor404(page, v = false) {
    const click = (loc, pause = 900) => (v ? go(page, loc, { pause }) : loc.first().click())
    await click(failRow(page, 'getSpecies', 404).locator('.sn-branch-btn'))
    await routeDialog(page).waitFor()
    await click(routeDialog(page).locator('.rd-kind[data-kind="goto"]'))
    await click(routeDialog(page).locator('.rd-row .link', { hasText: L('paso nuevo', 'new step') }))
    await page.locator('.bl-quick').waitFor()
    await settle(page, 600)
  }
  const listPokemon = (page) => page.locator('.bl-quick .bl-op', { has: page.locator('.bl-op-path', { hasText: /^\/pokemon$/ }) }).first()

  const scenes = {}

  // Capturas: el + de una flecha, un paso nuevo para el 404 y el resultado.
  scenes['design-branches'] = async () => {
    const page = await freshPage()
    await openPokedex(page)
    await design(page, 'pokemonCard')
    // El + de la flecha entre Inicio y getPokemon, con su ayuda.
    await bring(page, page.locator('.builder .start-node'), 120)
    const plus = page.locator('.sn-insert').first()
    await plus.hover()
    await showTitle(page, plus)
    await settle(page, 400)
    await shot(page, 'design-insert-step')
    await hideTitle(page)
    // Un paso nuevo para el 404: la búsqueda con las operaciones de los contratos.
    await bring(page, node(page, 'getSpecies'), 90)
    await newStepFor404(page)
    await page.locator('.bl-quick input').first().fill('pokemon')
    await settle(page, 400)
    await listPokemon(page).hover()
    await shot(page, 'design-branch-pick')
    await listPokemon(page).click()
    await settle(page, 1500)
    // El resultado: el 404 va al paso nuevo y el camino feliz termina antes (Fin).
    await deselect(page)
    await zoom(page, -3)
    await bring(page, node(page, 'getAbility'), 110)
    await shot(page, 'design-branch-done')
    await done()
  }

  // Un YAML que no se puede leer: el aviso en Diseño, Ejecutar desactivado y la barra lateral.
  scenes['design-broken'] = async () => {
    let page = await freshPage()
    await openStore(page, catalog, 'Catalog')
    await design(page, 'buyProduct')
    await breakYaml(page)
    await tab(page, 'design').click()
    await page.locator('.ws-yaml-broken, .bl-broken').first().waitFor()
    await settle(page, 800)
    await shot(page, 'design-yaml-broken')
    // Ejecutar, desactivado, con su explicación.
    const runBtn = page.locator('.ws-run').first()
    await runBtn.hover({ force: true })
    await showTitle(page, runBtn, { dx: -300 })
    await settle(page, 400)
    await shot(page, 'design-run-disabled')
    await hideTitle(page)
    await done()
    // Un Arazzo que ya llega roto: la barra lateral lo marca y no carga sus workflows.
    page = await freshPage()
    await openStore(page, ['catalog.arazzo.yaml', 'returns.arazzo.yaml', 'catalog.openapi.yaml', 'support.openapi.yaml'], 'Catalog')
    await page.locator('.tree-file-broken').first().waitFor()
    await settle(page, 600)
    await shot(page, 'sidebar-broken-arazzo')
    await done()
  }

  // --------------------------------------------------------------------------------------------
  const C = ES
    ? {
        b1: 'getSpecies puede responder 404: hoy no hay ruta y el workflow falla', b2: 'Elegir qué hacer con ese 404', b3: 'Ir a otro paso… o un paso nuevo', b4: 'Elige el paso: listar los Pokémon', b5: 'El 404 ahora va al paso nuevo', b6: 'El camino feliz termina antes de llegar a él: Fin',
      }
    : {
        b1: 'getSpecies can respond 404: today there is no route and the workflow fails', b2: 'Choose what to do on that 404', b3: 'Go to another step… or a new step', b4: 'Pick the step: list the Pokémon', b5: 'The 404 now goes to the new step', b6: 'The happy path ends before reaching it: End',
      }

  scenes['clip-design-branch'] = async () => {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await openPokedex(page)
    await design(page, 'pokemonCard')
    await bring(page, node(page, 'getSpecies'), 90)
    const from = Date.now()
    await say(page, C.b1, 300)
    await go(page, failRow(page, 'getSpecies', 404), { click: false, pause: 1800 })
    await say(page, C.b2, 300)
    await go(page, failRow(page, 'getSpecies', 404).locator('.sn-branch-btn'), { pause: 1200 })
    await routeDialog(page).waitFor()
    await say(page, C.b3, 300)
    await go(page, routeDialog(page).locator('.rd-kind[data-kind="goto"]'), { pause: 900 })
    await go(page, routeDialog(page).locator('.rd-row .link', { hasText: L('paso nuevo', 'new step') }), { pause: 900 })
    await page.locator('.bl-quick').waitFor()
    await say(page, C.b4, 300)
    await go(page, listPokemon(page), { pause: 1400 })
    // Más lugar para el lienzo: se cierra el panel del paso nuevo.
    await deselect(page)
    await zoom(page, -2)
    await bring(page, node(page, 'getSpecies'), 90)
    await say(page, C.b5, 300)
    await go(page, failRow(page, 'getSpecies', 404), { click: false, pause: 2200 })
    await bring(page, node(page, 'getAbility'), 90)
    await say(page, C.b6, 300)
    await go(page, node(page, 'getAbility').locator('.sn-action').first(), { click: false, pause: 2600 })
    await moveTo(page, 1150, 560)
    await settle(page, 1200)
    // Sin leyenda al final: el póster es el último segundo.
    await say(page, '', 1500)
    await saveClip(page, 'design-branch', started, from)
  }

  return scenes
}
