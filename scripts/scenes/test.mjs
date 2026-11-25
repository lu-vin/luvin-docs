// Escenas de la sección "Probar workflows": capturas test-*.png y videos test-*.mp4, en los dos idiomas.
// Usan la Pokédex (PokéAPI real), PayPal (sin red: solo casos y simulación) y una tienda de pedidos
// propia contra la API local de prueba de capture.mjs, que acepta cualquier pedido: así se ven de
// verdad los veredictos de advertencia y de falla.
export default (ctx) => {
  const { ES, T, tmp, API, V, path, writeFileSync, freshPage, go, say, saveClip, shot, settle, tab, openPokedex, openPaypal, focusStep, run, untilDone } = ctx

  // Textos de la interfaz que las escenas buscan (los mismos de src/i18n/locales/{en,es}/ui.ts).
  const L = ES
    ? { happy: 'Camino feliz', own: 'Casos con datos propios', data: 'Validación de datos', security: 'Seguridad', byResponse: 'Casos por respuesta', newCase: 'Nuevo caso con datos', addCase: 'Agregar caso', omit: 'Omitir', reset: 'Restablecer', closeInputs: 'Cerrar inputs', real: 'API real', simulated: 'Simulado', importCases: 'Importar casos', exportCases: 'Exportar casos', curl: 'Copiar como cURL', showOptional: 'Mostrar opcionales', backToSuggestion: 'Volver a lo sugerido', simulation: 'Simulación' }
    : { happy: 'Happy path', own: 'Custom data cases', data: 'Data validation', security: 'Security', byResponse: 'Cases by response', newCase: 'New data case', addCase: 'Add case', omit: 'Omit', reset: 'Reset', closeInputs: 'Close inputs', real: 'Real API', simulated: 'Simulated', importCases: 'Import cases', exportCases: 'Export cases', curl: 'Copy as cURL', showOptional: 'Show optional', backToSuggestion: 'Back to the suggestion', simulation: 'Simulation' }

  // --- Una tienda de pedidos contra la API local (responde 200 a un producto y 201 a cualquier pedido) ---
  const ORDERS_OPENAPI = `openapi: 3.0.3
info: { title: Shop orders, version: 1.0.0 }
servers: [{ url: ${API} }]
components:
  securitySchemes:
    bearer: { type: http, scheme: bearer }
paths:
  /products/{sku}:
    get:
      operationId: getProduct
      summary: Product detail
      parameters: [{ name: sku, in: path, required: true, schema: { type: string } }]
      responses:
        '200':
          description: The product
          content:
            application/json:
              schema:
                type: object
                properties: { sku: { type: string }, name: { type: string }, price: { type: number }, stock: { type: integer } }
              example: { sku: SKU-103, name: Date, price: 4.5, stock: 31 }
        '404': { description: The product does not exist }
  /orders:
    post:
      operationId: createOrder
      summary: Create an order
      security: [{ bearer: [] }]
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                customer: { type: string }
                delivery: { type: string }
                lines: { type: array, items: { type: object, properties: { sku: { type: string }, qty: { type: integer } } } }
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema: { type: object, properties: { id: { type: string }, status: { type: string } } }
              example: { id: ord-1042, status: CREATED }
        '400': { description: Invalid data }
        '401': { description: Missing or invalid credentials }
        '422': { description: Not enough stock }
`
  const ORDERS_ARAZZO = `arazzo: 1.0.1
info: { title: Shop orders, version: 1.0.0 }
sourceDescriptions: [{ name: shop, url: ./orders.openapi.yaml, type: openapi }]
workflows:
  - workflowId: placeOrder
    summary: Place an order
    inputs:
      type: object
      required: [sku, quantity, email]
      properties:
        sku: { type: string, pattern: '^SKU-[0-9]+$', example: SKU-103 }
        quantity: { type: integer, minimum: 1, example: 2 }
        email: { type: string, format: email, example: '{{$randomEmail}}' }
        delivery: { type: string, enum: [standard, express], default: standard }
    steps:
      - stepId: getProduct
        operationId: getProduct
        parameters: [{ name: sku, in: path, value: $inputs.sku }]
        successCriteria:
          - condition: $statusCode == 200
          - condition: $response.body#/sku == $inputs.sku
        onFailure:
          - name: productNotFound
            type: end
            criteria: [{ condition: $statusCode == 404 }]
        outputs:
          name: $response.body#/name
          price: $response.body#/price
      - stepId: createOrder
        operationId: createOrder
        requestBody:
          contentType: application/json
          payload:
            customer: $inputs.email
            delivery: $inputs.delivery
            lines: [{ sku: $inputs.sku, qty: $inputs.quantity }]
        successCriteria:
          - condition: $statusCode == 201
          - condition: $response.body#/status == 'CREATED'
        onFailure:
          - name: outOfStock
            type: end
            criteria: [{ condition: $statusCode == 422 }]
        outputs:
          orderId: $response.body#/id
    outputs:
      orderId: $steps.createOrder.outputs.orderId
      product: $steps.getProduct.outputs.name
`
  // Casos propios para importar: uno que falla (la tienda no responde 404) y uno inconcluso.
  const ORDERS_CASES = `version: 1
cases:
  - workflow: placeOrder
    name: ${ES ? 'Producto que no existe' : 'Unknown product'}
    inputs: { sku: SKU-999 }
    expect: { step: getProduct, status: [404], action: productNotFound }
  - workflow: placeOrder
    name: ${ES ? 'Pedido de un producto que no existe' : 'Order an unknown product'}
    inputs: { sku: SKU-999 }
    expect: { step: createOrder, status: [201] }
`
  writeFileSync(path.join(tmp, 'orders.openapi.yaml'), ORDERS_OPENAPI)
  writeFileSync(path.join(tmp, 'orders.arazzo.yaml'), ORDERS_ARAZZO)
  writeFileSync(path.join(tmp, 'orders.cases.yaml'), ORDERS_CASES)

  /** Un workspace con la colección "Shop" y el workflow Place an order. */
  async function openOrders(page) {
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
    await chooser.setFiles([path.join(tmp, 'orders.arazzo.yaml'), path.join(tmp, 'orders.openapi.yaml')])
    await page.locator('.tree-step').first().waitFor()
    await page.locator('[data-journey="placeOrder"]').click()
    await tab(page, 'cases').click()
    await settle(page, 500)
  }
  const group = (page, title) => page.locator('.case-group', { has: page.locator('.case-group-head strong', { hasText: title }) }).first()
  async function openGroup(page, title) {
    const g = group(page, title)
    if (!(await g.evaluate((el) => el.classList.contains('open')))) await g.locator('.case-group-head').click()
    await settle(page, 300)
    return g
  }
  const caseRow = (page, text) => page.locator('.case-row', { has: page.locator('strong', { hasText: text }) }).first()
  async function importCases(page, file) {
    await page.locator('.ws-view-head .row-menu-btn').click()
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.row-menu-list button', { hasText: L.importCases }).click()])
    await chooser.setFiles(file)
    await page.locator('.callout', { hasText: ES ? 'Casos importados' : 'Imported cases' }).waitFor()
  }
  // Títulos de los casos que genera Luvin (src/i18n/locales/*/core.ts).
  const CT = ES
    ? { missingQty: 'Sin el input obligatorio "quantity"', qtyNumber: '"quantity" con un texto', noAuth: 'Sin credenciales', notFound: 'productNotFound', unknown: 'Producto que no existe', unknownOrder: 'Pedido de un producto que no existe', enumType: '"type" con' }
    : { missingQty: 'Without the required input "quantity"', qtyNumber: '"quantity" with text', noAuth: 'Without credentials', notFound: 'productNotFound', unknown: 'Unknown product', unknownOrder: 'Order an unknown product', enumType: '"type" with' }
  // Leyendas de los videos.
  const C = ES
    ? {
        o1: 'Inputs: los valores con los que parte cada caso', o2: 'Casos: Luvin ya los generó desde el contrato y el diseño', o3: 'Primero en Simulación: sin llamar a la API', o4: 'Cada caso termina con un veredicto', o5: 'Ahora contra la API real, en el ambiente activo: el de arriba a la derecha', o6: 'Un paso devolvió una lista: confirma con qué elemento sigue', o7: 'Abre un paso: request, respuesta y criterios', o8: 'Exporta el reporte para compartirlo',
        i1: 'Los inputs obligatorios tienen *', i2: 'Un dato fijo: el mismo en cada ejecución', i3: 'Escribe {{ para ver las sugerencias', i4: 'Un generador da un valor nuevo en cada ejecución', i5: 'Un input con opciones se elige de una lista',
        k1: 'Camino feliz: el workflow normal, de punta a punta', k2: 'Validación de datos: falta un input obligatorio…', k3: '…o lleva un valor que el contrato no permite', k4: 'Seguridad: el paso protegido sin credenciales', k5: 'Casos por respuesta: qué hace el workflow ante cada error documentado', k6: 'Casos con datos propios: los que agregas tú', k7: 'La línea de arriba dice qué hará Ejecutar',
        s1: 'Luvin sugiere los status que documenta el contrato', s2: 'Si la API responde otra cosa, es una advertencia', s3: 'Elige tú el status: no cumplirlo será un error', s4: 'Un status que no está en la lista: escríbelo', s5: 'Vuelve a lo sugerido cuando quieras',
        a1: 'Inputs de un caso: cambian solo ese caso', a2: 'Cambia un valor', a3: 'Omitir: el caso no envía ese input', a4: 'Restablecer vuelve al valor por defecto',
        r1: 'Este caso simula el 404', r2: 'Pásalo a la API real: dale datos que causen ese error', r3: 'Un Pokémon que no existe', r4: 'Ejecuta solo este caso', r5: 'La API respondió 404 y se activó pokemonNotFound',
        n1: 'Agrega un caso con tus propios datos', n2: 'Un nombre que diga qué prueba', n3: 'Lo que debe pasar: la acción y el status', n4: 'Los datos que causan esa situación', n5: 'Ejecútalo contra la API real',
        v1: 'Ejecuta todos los casos', v2: 'Un resumen en palabras y un veredicto por caso', v3: 'Pasó: hizo lo que esperaba', v4: 'Falló: la tienda aceptó un pedido sin credenciales', v5: 'Advertencia: aceptó un dato que el contrato dice que rechaza', v6: 'Inconcluso: el workflow se detuvo antes del paso que se revisa',
        f1: 'Abre el caso que falló', f2: 'Esperado y recibido, en palabras', f3: 'El paso dice qué respondió la API', f4: 'Petición: lo que se envió de verdad', f5: 'Cópialo como cURL para reproducirlo', f6: 'Los secretos quedan como <secret>',
        e1: 'Exporta el reporte HTML', e2: 'Un archivo que se abre en cualquier navegador', e3: 'Contadores, ambiente y un resumen de cada caso', e4: 'Y el detalle de cada caso, paso por paso',
        c1: 'Exporta los casos a un archivo YAML', c2: 'Impórtalos en otro equipo o desde git', c3: 'Luvin dice cuántos agregó', c4: 'Los casos con datos propios ya están aquí',
      }
    : {
        o1: 'Inputs: the values every case starts with', o2: 'Cases: Luvin generated them from the contract and the design', o3: 'First in Simulation: no calls to the API', o4: 'Every case ends with a verdict', o5: 'Now against the real API, in the active environment: the one at the top right', o6: 'A step returned a list: confirm which item it continues with', o7: 'Open a step: request, response and criteria', o8: 'Export the report to share it',
        i1: 'Required inputs have a *', i2: 'Fixed data: the same on every run', i3: 'Type {{ to see the suggestions', i4: 'A generator gives a new value on every run', i5: 'An input with options is chosen from a list',
        k1: 'Happy path: the normal workflow, end to end', k2: 'Data validation: a required input is missing…', k3: '…or has a value the contract does not allow', k4: 'Security: the protected step without credentials', k5: 'Cases by response: what the workflow does on each documented error', k6: 'Custom data cases: the ones you add', k7: 'The line at the top says what Run will do',
        s1: 'Luvin suggests the statuses the contract documents', s2: 'If the API answers something else, it is a warning', s3: 'Choose the status yourself: missing it will be an error', s4: 'A status that is not in the list: type it', s5: 'Go back to the suggestion whenever you want',
        a1: 'Inputs of a case: they change that case only', a2: 'Change a value', a3: 'Omit: the case does not send that input', a4: 'Reset goes back to the default value',
        r1: 'This case simulates the 404', r2: 'Switch it to the real API: give it data that causes that error', r3: 'A Pokémon that does not exist', r4: 'Run only this case', r5: 'The API answered 404 and pokemonNotFound fired',
        n1: 'Add a case with your own data', n2: 'A name that says what it tests', n3: 'What must happen: the action and the status', n4: 'The data that causes that situation', n5: 'Run it against the real API',
        v1: 'Run every case', v2: 'A summary in plain words and a verdict per case', v3: 'Passed: it did what it expected', v4: 'Failed: the shop accepted an order without credentials', v5: 'Warning: it accepted data the contract says it rejects', v6: 'Inconclusive: the workflow stopped before the step it checks',
        f1: 'Open the case that failed', f2: 'Expected and received, in plain words', f3: 'The step says what the API answered', f4: 'Request: what was really sent', f5: 'Copy it as cURL to reproduce it', f6: 'Secrets stay as <secret>',
        e1: 'Export the HTML report', e2: 'One file that opens in any browser', e3: 'Counters, environment and a summary of every case', e4: 'And the detail of every case, step by step',
        c1: 'Export the cases to a YAML file', c2: 'Import them on another computer or from git', c3: 'Luvin says how many it added', c4: 'The custom data cases are here now',
      }

  /** Más alto el panel de resultados (el divisor se mueve con las flechas). */
  async function tallResults(page, n = 10) {
    const s = page.locator('.ws-hsplitter').first()
    if (!(await s.count())) return
    await s.focus()
    for (let i = 0; i < n; i++) await page.keyboard.press('ArrowUp')
    await settle(page, 300)
  }
  /** Lleva un elemento arriba de su panel con scroll, dejando a la vista lo que tapa la cabecera fija. */
  async function toTop(locator, gap = 70) {
    await locator.evaluate((el, g) => {
      el.scrollIntoView({ block: 'start' })
      let p = el.parentElement
      while (p && !(p.scrollHeight > p.clientHeight && /(auto|scroll)/.test(getComputedStyle(p).overflowY))) p = p.parentElement
      p?.scrollBy(0, -g)
    }, gap)
    await settle(locator.page(), 300)
  }
  const navCase = (page, text) => page.locator('.case-nav-item', { hasText: text }).first()
  const paramRow = (scope, name) => scope.locator('.param-item', { has: scope.page().locator('.param-name code', { hasText: new RegExp(`^${name}$`) }) }).first()
  const inputField = (page, name) => page.locator('.ws-view .field', { has: page.locator('label', { hasText: new RegExp(`^\\s*${name}\\b`) }) }).first()
  /** Ejecuta un caso con ▶ y espera su veredicto. */
  async function runOne(page, row) {
    await row.locator('button.icon').click()
    await untilDone(page)
    await settle(page, 1000)
  }
  /** Descarga el reporte HTML de los resultados y lo deja en un archivo. */
  function downloadReport(page, name) {
    return ctx.download(page, () => page.locator('.ws-results .rp-head button', { hasText: T.report }).first().click(), path.join(tmp, name))
  }
  /** Cases → modo real → elige al ejecutar el primer elemento de cada lista. */
  async function continueLists(page, { cursor = false } = {}) {
    for (let i = 0; i < 8; i++) {
      const open = await page.locator('.lp-dialog').waitFor({ timeout: 4000 }).then(() => true, () => false)
      if (!open) break
      await settle(page, cursor ? 1400 : 300)
      if (cursor) await go(page, page.locator('.lp-dialog button.primary'), { pause: 700 })
      else await page.locator('.lp-dialog button.primary').click()
    }
  }

  return {
    // ---------------------------------------------------------------- Capturas: la tienda de pedidos
    async 'test-orders'() {
      const page = await freshPage()
      await openOrders(page)
      // Inputs
      await tab(page, 'inputs').click()
      await settle(page, 600)
      await shot(page, 'test-inputs-types')
      const email = inputField(page, 'email').locator('input').first()
      await email.click()
      await email.press('Meta+a')
      await email.pressSequentially('{{$randomE', { delay: 30 })
      await settle(page, 600)
      await page.locator('.tpl-suggest').waitFor()
      await shot(page, 'test-inputs-generators')
      await email.press('Meta+a')
      await email.pressSequentially('{{$randomEmail}}', { delay: 5 })
      await email.press('Escape')
      await email.press('Tab')
      // Casos: los grupos
      await tab(page, 'cases').click()
      await settle(page, 500)
      await openGroup(page, L.data)
      await toTop(page.locator('.cases-overview'), 20)
      await shot(page, 'test-case-groups')
      // Inputs de un caso: uno cambiado y uno omitido
      const happy = caseRow(page, L.happy)
      await happy.locator('.row button', { hasText: 'Inputs' }).click()
      await paramRow(happy, 'quantity').locator('input').first().fill('5')
      await paramRow(happy, 'delivery').locator('button', { hasText: L.omit }).click()
      await settle(page, 400)
      await shot(page, 'test-case-inputs', happy)
      await happy.locator('.case-params-head button', { hasText: ES ? 'Restablecer todo' : 'Reset all' }).click()
      await happy.locator('.row button', { hasText: L.closeInputs }).click()
      // El status que debe responder un rechazo: lo sugerido y lo elegido
      const qty = caseRow(page, CT.qtyNumber)
      await qty.scrollIntoViewIfNeeded()
      await shot(page, 'test-status-suggested', qty)
      await qty.locator('.status-chip', { hasText: /^400/ }).click()
      await settle(page, 300)
      await shot(page, 'test-status-chosen', qty)
      await qty.locator('.expected-status button.link').click()
      // En Simulación: los casos que no corren y por qué
      await openGroup(page, L.security)
      await page.locator('.ws-runbar .segmented button').nth(1).click()
      await settle(page, 500)
      await toTop(page.locator('.cases-overview'), 20)
      await shot(page, 'test-wont-run')
      await page.locator('.ws-runbar .segmented button').nth(0).click()
      // Antes de ejecutar: el aviso de los pasos que modifican datos
      await importCases(page, path.join(tmp, 'orders.cases.yaml'))
      await page.locator('.ws-run').click()
      await page.locator('.ws-strip.warn button', { hasText: T.runAnyway }).click()
      await untilDone(page)
      await settle(page, 1500)
      await tallResults(page)
      await shot(page, 'test-verdicts')
      const results = page.locator('.ws-results')
      for (const [name, text] of [['test-verdict-passed', CT.notFound], ['test-verdict-failed', CT.noAuth], ['test-verdict-warning', CT.qtyNumber], ['test-verdict-inconclusive', CT.unknownOrder], ['test-verdict-mismatch', CT.unknown]]) {
        await navCase(page, text).click()
        await settle(page, 600)
        await toTop(results.locator('.case-detail'))
        await shot(page, name, results)
      }
      // La falla de "Producto que no existe", con su petición y Copiar como cURL
      await navCase(page, CT.unknown).click()
      const step = page.locator('.ws-results .step-result').first()
      if (!(await step.evaluate((el) => el.classList.contains('open')))) await step.locator('.step-head').click()
      await step.locator('[role="tab"][data-tab="peticion"]').click()
      await settle(page, 400)
      await step.scrollIntoViewIfNeeded()
      await shot(page, 'test-step-request', results)
      await step.locator('[role="tab"][data-tab="respuesta"]').click()
      await settle(page, 400)
      await shot(page, 'test-step-response', results)
      // Reporte HTML y JSON
      const file = await downloadReport(page, `orders-report-${ctx.locale}.html`)
      await ctx.download(page, () => page.locator('.ws-results .rp-head button', { hasText: 'JSON' }).click(), path.join(tmp, `orders-report-${ctx.locale}.json`))
      // Exportar los casos: el archivo queda para revisarlo
      await tab(page, 'cases').click()
      await page.locator('.ws-view-head .row-menu-btn').click()
      await ctx.download(page, () => page.locator('.row-menu-list button', { hasText: L.exportCases }).click(), path.join(tmp, `orders-exported-${ctx.locale}.yaml`))
      // El reporte, abierto en la ventana (al final: la app se va).
      await ctx.showFile(page, file)
      await shot(page, 'test-report')
      await page.locator('h2').nth(1).evaluate((el) => el.scrollIntoView())
      await shot(page, 'test-report-cases')
      await ctx.done()
    },

    // ---------------------------------------------------------------- Capturas: la Pokédex
    async 'test-pokedex'() {
      const page = await freshPage()
      await openPokedex(page)
      await page.locator('[data-journey="pokemonCard"]').click()
      // Resumen: cobertura de respuestas (antes de ejecutar, sin el panel de resultados)
      await tab(page, 'overview').click()
      const covTitle = ES ? 'Cobertura de respuestas' : 'Response coverage'
      await page.locator('.section-toggle', { hasText: covTitle }).click()
      await settle(page, 600)
      const cov = page.locator('.section', { has: page.locator('.section-title', { hasText: covTitle }) })
      await toTop(cov, 10)
      await shot(page, 'test-coverage', cov)
      // Un caso con datos propios: el formulario
      await tab(page, 'cases').click()
      await settle(page, 500)
      await page.locator('.add-case').click()
      const form = page.locator('.new-case')
      await form.locator('.field input').first().fill(ES ? 'Pokémon que no existe' : 'Unknown Pokémon')
      await form.locator('.field select').nth(0).selectOption('getPokemon')
      await form.locator('.field select').nth(1).selectOption('pokemonNotFound')
      await form.locator('.field input').nth(1).fill('404')
      await paramRow(form, 'pokemon').locator('input').first().fill('missingno')
      await settle(page, 400)
      await toTop(form, 20)
      await shot(page, 'test-new-data-case', form)
      await form.locator('button.primary').click()
      // Un caso por respuesta contra la API real
      await openGroup(page, L.byResponse)
      const resp = caseRow(page, 'pokemonNotFound')
      await resp.locator('.segmented button').nth(1).click()
      await settle(page, 400)
      await toTop(resp, 20)
      await shot(page, 'test-response-needs-data', resp)
      await paramRow(resp, 'pokemon').locator('input').first().fill('missingno')
      await settle(page, 400)
      await shot(page, 'test-response-real', resp)
      await runOne(page, resp)
      await tallResults(page)
      await shot(page, 'test-response-real-result', page.locator('.ws-results'))
      // El caso con datos propios, contra la PokéAPI
      await runOne(page, caseRow(page, ES ? 'Pokémon que no existe' : 'Unknown Pokémon'))
      await shot(page, 'test-data-case-result', page.locator('.ws-results'))
      // El camino feliz en simulación
      await run(page, { mode: 1 })
      await navCase(page, L.happy).click()
      await settle(page, 500)
      await shot(page, 'test-simulation-results', page.locator('.ws-results'))
      // Explorar un tipo: un rechazo que pasa (la PokéAPI responde 404 a un tipo que no existe)
      await page.locator('[data-journey="typeExplorer"]').click()
      await tab(page, 'cases').click()
      await page.locator('.ws-runbar .segmented button').nth(0).click()
      await openGroup(page, L.data)
      await runOne(page, caseRow(page, CT.enumType))
      await shot(page, 'test-rejection-passed', page.locator('.ws-results'))
      // Preparar un combate en simulación: Preparación con el workflow del que depende
      await page.locator('[data-journey="battleMatchup"]').click()
      await tab(page, 'cases').click()
      await run(page, { mode: 1 })
      await tallResults(page)
      await page.locator('.prelude-row').first().click()
      await settle(page, 500)
      await shot(page, 'test-preparation', page.locator('.ws-results'))
      // La barra de ejecución (el ambiente ya no está en ella: se elige arriba a la derecha, en .app-env)
      await page.locator('[data-journey="pokemonCard"]').click()
      await page.locator('.ws-runbar .segmented button').nth(0).click()
      await settle(page, 500)
      await shot(page, 'test-runbar', page.locator('.ws-runbar'))
      await ctx.done()
    },

    // ---------------------------------------------------------------- Capturas: PayPal (sin llamar a la API)
    async 'test-paypal'() {
      const page = await freshPage()
      await openPaypal(page)
      await page.locator('[data-journey="createOrder"]').click()
      await tab(page, 'cases').click()
      await page.locator('.ws-runbar .segmented button').nth(0).click()
      await settle(page, 500)
      await page.locator('.ws-run').click()
      await page.locator('.ws-strip.warn').waitFor()
      await settle(page, 400)
      await shot(page, 'test-run-confirm')
      await page.locator('.ws-strip.warn button.link').click()
      for (const g of [L.data, L.security, L.byResponse]) await openGroup(page, g)
      await toTop(group(page, L.security), 10)
      await shot(page, 'test-paypal-cases')
      await ctx.done()
    },

    // ---------------------------------------------------------------- Videos
    async 'clip-test-loop'() {
      // La vuelta completa con la Pokédex: inputs → casos → simulación → API real → resultados → reporte.
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openPokedex(page)
      await page.locator('[data-journey="pokemonCard"]').click()
      await settle(page, 900)
      const from = Date.now()
      await say(page, C.o1, 300)
      await go(page, tab(page, 'inputs'), { pause: 2000 })
      await say(page, C.o2, 300)
      await go(page, tab(page, 'cases'), { pause: 2200 })
      await say(page, C.o3, 300)
      await go(page, page.locator('.ws-runbar .segmented button').nth(1), { pause: 600 })
      await go(page, page.locator('.ws-run'), { pause: 300 })
      await untilDone(page)
      await say(page, C.o4, 2400)
      await say(page, C.o5, 300)
      await go(page, page.locator('.ws-runbar .segmented button').nth(0), { pause: 500 })
      await go(page, page.locator('.app-env-coll'), { click: false, pause: 1400 })
      await go(page, page.locator('.ws-run'), { pause: 300 })
      await page.locator('.lp-dialog').waitFor({ timeout: 25000 })
      await say(page, C.o6, 1800)
      await continueLists(page, { cursor: true })
      await untilDone(page)
      await settle(page, 800)
      await say(page, C.o7, 300)
      await go(page, page.locator('.ws-results .step-result .step-head').first(), { pause: 2600 })
      await say(page, C.o8, 300)
      await go(page, page.locator('.ws-results .rp-head button', { hasText: T.report }), { pause: 2000 })
      await say(page, '', 400)
      await saveClip(page, 'test-loop', started, from)
    },

    async 'clip-test-inputs'() {
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openOrders(page)
      await tab(page, 'inputs').click()
      await settle(page, 900)
      const from = Date.now()
      await say(page, C.i1, 300)
      await go(page, inputField(page, 'sku'), { click: false, pause: 1800 })
      await say(page, C.i2, 300)
      const qty = inputField(page, 'quantity').locator('input').first()
      await go(page, qty, { pause: 200 })
      await qty.press('Meta+a')
      await qty.pressSequentially('3', { delay: 120 })
      await settle(page, 1200)
      await say(page, C.i3, 300)
      const email = inputField(page, 'email').locator('input').first()
      await go(page, email, { pause: 200 })
      await email.press('Meta+a')
      await email.pressSequentially('{{$rand', { delay: 110 })
      await settle(page, 2200)
      await say(page, C.i4, 300)
      await email.pressSequentially('omEmail}}', { delay: 90 })
      await email.press('Escape')
      await settle(page, 1800)
      await say(page, C.i5, 300)
      const delivery = inputField(page, 'delivery').locator('select').first()
      await go(page, delivery, { pause: 300 })
      await delivery.selectOption('express')
      await settle(page, 1800)
      await say(page, '', 400)
      await saveClip(page, 'test-edit-inputs', started, from)
    },

    async 'clip-test-case-kinds'() {
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openOrders(page)
      await settle(page, 900)
      const from = Date.now()
      await say(page, C.k1, 300)
      await go(page, caseRow(page, L.happy).locator('strong').first(), { click: false, pause: 2200 })
      await say(page, C.k2, 300)
      await go(page, group(page, L.data).locator('.case-group-head strong'), { pause: 900 })
      await go(page, caseRow(page, CT.missingQty).locator('strong').first(), { click: false, pause: 2000 })
      await say(page, C.k3, 300)
      await go(page, caseRow(page, CT.qtyNumber).locator('strong').first(), { click: false, pause: 2000 })
      await go(page, group(page, L.data).locator('.case-group-head strong'), { pause: 600 })
      await say(page, C.k4, 300)
      await go(page, group(page, L.security).locator('.case-group-head strong'), { pause: 900 })
      await go(page, caseRow(page, CT.noAuth).locator('strong').first(), { click: false, pause: 2200 })
      await go(page, group(page, L.security).locator('.case-group-head strong'), { pause: 600 })
      await say(page, C.k5, 300)
      await go(page, group(page, L.byResponse).locator('.case-group-head strong'), { pause: 900 })
      await go(page, caseRow(page, CT.notFound).locator('strong').first(), { click: false, pause: 2400 })
      await go(page, group(page, L.byResponse).locator('.case-group-head strong'), { pause: 600 })
      await say(page, C.k6, 300)
      await go(page, page.locator('.add-case'), { click: false, pause: 2000 })
      await say(page, C.k7, 300)
      await go(page, page.locator('.cases-overview'), { click: false, pause: 2600 })
      await say(page, '', 400)
      await saveClip(page, 'test-case-kinds', started, from)
    },

    async 'clip-test-expected-status'() {
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openOrders(page)
      await openGroup(page, L.data)
      const row = caseRow(page, CT.qtyNumber)
      await row.scrollIntoViewIfNeeded()
      await settle(page, 900)
      const from = Date.now()
      await say(page, C.s1, 300)
      await go(page, row.locator('.expected-status'), { click: false, pause: 2000 })
      await say(page, C.s2, 300)
      await go(page, row.locator('.miss-tone'), { click: false, pause: 2000 })
      await say(page, C.s3, 300)
      await go(page, row.locator('.status-chip', { hasText: /^400/ }), { pause: 1800 })
      await say(page, C.s4, 300)
      const other = row.locator('.status-other')
      await go(page, other, { pause: 200 })
      await other.pressSequentially('409', { delay: 140 })
      await other.press('Enter')
      await settle(page, 1800)
      await say(page, C.s5, 300)
      await go(page, row.locator('.expected-status button.link'), { pause: 2000 })
      await say(page, '', 400)
      await saveClip(page, 'test-choose-status', started, from)
    },

    async 'clip-test-case-inputs'() {
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openOrders(page)
      await settle(page, 900)
      const from = Date.now()
      const happy = caseRow(page, L.happy)
      await say(page, C.a1, 300)
      await go(page, happy.locator('.row button', { hasText: 'Inputs' }), { pause: 1600 })
      await say(page, C.a2, 300)
      const qty = paramRow(happy, 'quantity').locator('input').first()
      await go(page, qty, { pause: 200 })
      await qty.press('Meta+a')
      await qty.pressSequentially('50', { delay: 140 })
      await settle(page, 1800)
      await say(page, C.a3, 300)
      await go(page, paramRow(happy, 'delivery').locator('button', { hasText: L.omit }), { pause: 2000 })
      await say(page, C.a4, 300)
      await go(page, paramRow(happy, 'delivery').locator('button', { hasText: L.reset }), { pause: 1800 })
      await say(page, '', 400)
      await saveClip(page, 'test-adjust-inputs', started, from)
    },

    async 'clip-test-response-real'() {
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openPokedex(page)
      await page.locator('[data-journey="pokemonCard"]').click()
      await tab(page, 'cases').click()
      await openGroup(page, L.byResponse)
      await settle(page, 900)
      const from = Date.now()
      const row = caseRow(page, 'pokemonNotFound')
      await say(page, C.r1, 300)
      await go(page, row.locator('strong').first(), { click: false, pause: 1800 })
      await say(page, C.r2, 300)
      await go(page, row.locator('.segmented button').nth(1), { pause: 1800 })
      await say(page, C.r3, 300)
      const input = paramRow(row, 'pokemon').locator('input').first()
      await go(page, input, { pause: 200 })
      await input.press('Meta+a')
      await input.pressSequentially('missingno', { delay: 110 })
      await settle(page, 1200)
      await say(page, C.r4, 300)
      await go(page, row.locator('button.icon'), { pause: 300 })
      await untilDone(page)
      await settle(page, 600)
      await say(page, C.r5, 300)
      await go(page, page.locator('.ws-results .step-result .step-head').first(), { click: false, pause: 3000 })
      await say(page, '', 400)
      await saveClip(page, 'test-response-real-run', started, from)
    },

    async 'clip-test-data-case'() {
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openPokedex(page)
      await page.locator('[data-journey="pokemonCard"]').click()
      await tab(page, 'cases').click()
      await settle(page, 900)
      const from = Date.now()
      await say(page, C.n1, 300)
      await go(page, page.locator('.add-case'), { pause: 900 })
      const form = page.locator('.new-case')
      await say(page, C.n2, 300)
      const name = form.locator('.field input').first()
      await go(page, name, { pause: 200 })
      await name.pressSequentially(ES ? 'Pokémon que no existe' : 'Unknown Pokémon', { delay: 60 })
      await settle(page, 500)
      await say(page, C.n3, 300)
      await go(page, form.locator('.field select').nth(0), { pause: 200 })
      await form.locator('.field select').nth(0).selectOption('getPokemon')
      await go(page, form.locator('.field select').nth(1), { pause: 200 })
      await form.locator('.field select').nth(1).selectOption('pokemonNotFound')
      const status = form.locator('.field input').nth(1)
      await go(page, status, { pause: 200 })
      await status.press('Meta+a')
      await status.pressSequentially('404', { delay: 140 })
      await settle(page, 900)
      await say(page, C.n4, 300)
      const input = paramRow(form, 'pokemon').locator('input').first()
      await go(page, input, { pause: 200 })
      await input.press('Meta+a')
      await input.pressSequentially('missingno', { delay: 110 })
      await settle(page, 900)
      await go(page, form.locator('button.primary'), { pause: 1000 })
      await say(page, C.n5, 300)
      const row = caseRow(page, ES ? 'Pokémon que no existe' : 'Unknown Pokémon')
      await go(page, row.locator('button.icon'), { pause: 300 })
      await untilDone(page)
      await settle(page, 600)
      await go(page, page.locator('.ws-results .case-summary'), { click: false, pause: 3000 })
      await say(page, '', 400)
      await saveClip(page, 'test-data-case', started, from)
    },

    async 'clip-test-verdicts'() {
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openOrders(page)
      await importCases(page, path.join(tmp, 'orders.cases.yaml'))
      await page.locator('.callout button.link').click()
      // La confirmación de los pasos que modifican datos ya se dio: el video empieza en Ejecutar.
      await page.locator('.ws-run').click()
      await page.locator('.ws-strip.warn button', { hasText: T.runAnyway }).click()
      await untilDone(page)
      await tallResults(page)
      await settle(page, 900)
      const from = Date.now()
      await say(page, C.v1, 300)
      await go(page, page.locator('.ws-results .rp-rerun'), { pause: 300 })
      await untilDone(page)
      await settle(page, 600)
      await say(page, C.v2, 2400)
      for (const [caption, text] of [[C.v3, CT.notFound], [C.v4, CT.noAuth], [C.v5, CT.qtyNumber], [C.v6, CT.unknownOrder]]) {
        await say(page, caption, 300)
        await go(page, navCase(page, text), { pause: 600 })
        await go(page, page.locator('.ws-results .case-summary .kv'), { click: false, pause: 2600 })
      }
      await say(page, '', 400)
      await saveClip(page, 'test-verdicts-tour', started, from)
    },

    async 'clip-test-failure'() {
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openOrders(page)
      await importCases(page, path.join(tmp, 'orders.cases.yaml'))
      await page.locator('.callout button.link').click()
      await page.locator('.ws-run').click()
      await page.locator('.ws-strip.warn button', { hasText: T.runAnyway }).click()
      await untilDone(page)
      await tallResults(page)
      await settle(page, 900)
      const from = Date.now()
      await say(page, C.f1, 300)
      await go(page, navCase(page, CT.unknown), { pause: 900 })
      await say(page, C.f2, 300)
      await go(page, page.locator('.ws-results .case-summary .kv'), { click: false, pause: 2600 })
      await say(page, C.f3, 300)
      const step = page.locator('.ws-results .step-result').first()
      await go(page, step.locator('.step-notes'), { click: false, pause: 2600 })
      if (!(await step.evaluate((el) => el.classList.contains('open')))) await go(page, step.locator('.step-head'), { pause: 500 })
      await say(page, C.f4, 300)
      await go(page, step.locator('[role="tab"][data-tab="peticion"]'), { pause: 1800 })
      await say(page, C.f5, 300)
      await go(page, step.locator('.curl-actions button').first(), { pause: 1800 })
      await say(page, '', 400)
      await saveClip(page, 'test-read-failure', started, from)
    },

    async 'clip-test-report'() {
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openOrders(page)
      await importCases(page, path.join(tmp, 'orders.cases.yaml'))
      await page.locator('.callout button.link').click()
      await page.locator('.ws-run').click()
      await page.locator('.ws-strip.warn button', { hasText: T.runAnyway }).click()
      await untilDone(page)
      await settle(page, 900)
      const from = Date.now()
      await say(page, C.e1, 300)
      const file = await ctx.download(page, () => go(page, page.locator('.ws-results .rp-head button', { hasText: T.report }), { pause: 1200 }), path.join(tmp, `orders-report-video-${ctx.locale}.html`))
      await ctx.showFile(page, file)
      await settle(page, 600)
      await say(page, C.e2, 2000)
      await say(page, C.e3, 300)
      await page.mouse.wheel(0, 520)
      await settle(page, 2400)
      await say(page, C.e4, 300)
      await page.locator('h2').nth(2).evaluate((el) => el.scrollIntoView({ behavior: 'smooth' }))
      await settle(page, 1500)
      await go(page, page.locator('.toolbar button').first(), { pause: 600 }).catch(() => {})
      await page.mouse.wheel(0, 400)
      await settle(page, 2400)
      await say(page, '', 400)
      await saveClip(page, 'test-export-report', started, from)
    },

    async 'clip-test-cases-file'() {
      const started = Date.now()
      const page = await freshPage({ video: V })
      await openOrders(page)
      await settle(page, 900)
      const from = Date.now()
      await say(page, C.c1, 300)
      await go(page, page.locator('.ws-view-head .row-menu-btn'), { pause: 700 })
      await ctx.download(page, () => go(page, page.locator('.row-menu-list button', { hasText: L.exportCases }), { pause: 900 }), path.join(tmp, `orders-exported-video-${ctx.locale}.yaml`))
      await say(page, C.c2, 300)
      await go(page, page.locator('.ws-view-head .row-menu-btn'), { pause: 700 })
      const [chooser] = await Promise.all([page.waitForEvent('filechooser'), go(page, page.locator('.row-menu-list button', { hasText: L.importCases }), { pause: 300 })])
      await chooser.setFiles(path.join(tmp, 'orders.cases.yaml'))
      await page.locator('.callout').first().waitFor()
      await say(page, C.c3, 300)
      await go(page, page.locator('.callout').first(), { click: false, pause: 2200 })
      await say(page, C.c4, 300)
      await go(page, group(page, L.own).locator('.case-row strong').first(), { click: false, pause: 2600 })
      await say(page, '', 400)
      await saveClip(page, 'test-cases-file', started, from)
    },
  }
}
