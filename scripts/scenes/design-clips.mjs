// Videos de "Diseñar workflows" (clip-design-*): la ventana entera, con el cursor y una leyenda por paso.
// Cada uno empieza a contar después de preparar (abrir el ejemplo o crear el workspace).
// clip-design-workflow reemplaza al de capture.mjs (mismo nombre): el lienzo cambió y ese ya no corre.
import { helpers } from './design.mjs'

export default (ctx) => {
  const { ES, V, freshPage, settle, tab, go, say, saveClip, moveTo, openPokedex } = ctx
  const h = helpers(ctx)
  const { L, closeNotice, openStore, design, node, start, end, side, panelTab, bring, deselect, panelScroll, zoom, pick, yamlLine, failRow, routeDialog, undoBtn } = h

  const C = ES
    ? {
        n1: 'Crea un workflow nuevo', n2: 'Agrega el primer paso: busca la operación', n3: '＋ Paso agrega el siguiente', n4: 'Luvin conecta los datos: el segundo paso recibe el id del primero', n5: 'Lo que nadie entrega se vuelve un input del workflow', n6: 'Todo queda escrito en un archivo Arazzo estándar',
        w1: 'Agrega tres operaciones con ＋ Paso', w2: 'Luvin conecta cada valor con un paso anterior', w3: 'El ? avisa que Luvin no está seguro: aquí propuso el id del paso anterior', w4: 'Abre el paso y elige de dónde sale el valor', w5: 'El tipo sale de getPokemon: types/type/name', w6: 'La tarjeta muestra el origen nuevo, sin el ?',
        p1: 'createOrder envía valores fijos', p2: '→ input vuelve un valor fijo un input del workflow', p3: 'Inicio tiene el input nuevo, con el valor de antes', p4: 'Para elegir varios a la vez: Volver input otro valor fijo', p5: 'Marca los datos que quieres variar en los casos', p6: 'Y de vuelta: elige Valor fijo… en el origen', p7: 'Escribe el valor', p8: 'Borra el input que ya nadie usa',
        e1: 'createOrder puede fallar: el contrato documenta cada error', e2: 'Sin ruta, el workflow falla: elige qué hacer', e3: '401: termina el workflow (un resultado conocido)', e4: '429: reintenta, con espera y un límite', e5: '409: vuelve a listar los productos', e6: 'La tarjeta muestra qué pasa con cada respuesta',
        o1: 'Abre el paso', o2: '＋ Output: marca los campos de la respuesta que quieres exponer', o3: 'El output aparece en la tarjeta, listo para otro paso', o4: 'Fin del workflow: lo que el workflow devuelve', o5: 'Marca lo que quieres devolver', o6: 'Cámbiale el nombre si quieres',
        d1: 'Abre el Inicio', d2: 'Depende de: elige un workflow de este archivo o de otro', d3: 'Corre antes, y sus outputs quedan para cualquier paso', d4: 'O llama a un workflow como un paso más', d5: 'Sus inputs se conectan como parámetros del paso', d6: 'Y la tarjeta puede mostrar sus pasos',
        r1: 'createOrder reintenta cuando responde 429', r2: 'Guárdalo como reutilizable', r3: 'Ponle un nombre', r4: 'En otro paso, el editor de rutas ofrece el reutilizable', r5: 'Los dos pasos usan el mismo: se edita en un solo lugar', r6: 'Inicio lista los reutilizables del archivo',
        g1: 'Borra un input que un paso todavía usa', g2: 'El lienzo avisa: falta un dato', g3: 'Completar lo declara de nuevo, sin rehacer los pasos', g4: 'Deshacer lo revierte',
        y1: 'La pestaña YAML es el mismo archivo', y2: 'Escribe a mano algo que el lienzo no edita: un timeout', y3: 'Vuelve a Diseño y cambia otra cosa', y4: 'Tu línea sigue ahí: el YAML guarda lo que escribes',
        m1: 'Sube un paso con ⌥↑', m2: 'getOrder ahora corre antes del paso que le da su dato: Luvin avisa', m3: 'Deshacer lo deja como estaba', m4: 'Quita un paso: Luvin dice primero qué se rompe', m5: 'Los que usaban sus datos muestran el error', m6: '⌘Z lo trae de vuelta',
      }
    : {
        n1: 'Create a new workflow', n2: 'Add the first step: search for the operation', n3: '＋ Step adds the next one', n4: 'Luvin wires the data: the second step receives the id of the first', n5: 'What nobody provides becomes an input of the workflow', n6: 'Everything is written to a standard Arazzo file',
        w1: 'Add three operations with ＋ Step', w2: 'Luvin wires each value to an earlier step', w3: 'The ? says Luvin is not sure: it proposed the id of the previous step', w4: 'Open the step and choose where the value comes from', w5: 'The type comes from getPokemon: types/type/name', w6: 'The card shows the new source, without the ?',
        p1: 'createOrder sends fixed values', p2: '→ input turns a fixed value into a workflow input', p3: 'Start has the new input, with the value it had', p4: 'To pick several at once: Turn another fixed value into an input', p5: 'Tick the data you want to vary in cases', p6: 'And back: choose Fixed value… as the source', p7: 'Type the value', p8: 'Delete the input nobody uses now',
        e1: 'createOrder can fail: the contract documents each error', e2: 'Without a route, the workflow fails: choose what to do', e3: '401: end the workflow (a known outcome)', e4: '429: retry, with a wait and a limit', e5: '409: list the products again', e6: 'The card shows what happens on each response',
        o1: 'Open the step', o2: '＋ Output: tick the response fields you want to expose', o3: 'The output appears on the card, ready for another step', o4: 'End of workflow: what the workflow returns', o5: 'Tick what you want to return', o6: 'Rename it if you like',
        d1: 'Open Start', d2: 'Depends on: pick a workflow of this file or another one', d3: 'It runs first, and its outputs are there for any step', d4: 'Or call a workflow as one more step', d5: 'Its inputs are wired as parameters of the step', d6: 'And the card can show its steps',
        r1: 'createOrder retries when it responds 429', r2: 'Save it as a reusable', r3: 'Give it a name', r4: 'In another step, the route editor offers the reusable', r5: 'Both steps use the same one: you edit it in one place', r6: 'Start lists the reusables of the file',
        g1: 'Delete an input a step still uses', g2: 'The canvas warns: data is missing', g3: 'Complete declares it again, without redoing the steps', g4: 'Undo reverts it',
        y1: 'The YAML tab is the same file', y2: 'Type by hand something the canvas does not edit: a timeout', y3: 'Go back to Design and change something else', y4: 'Your line is still there: the YAML keeps what you type',
        m1: 'Move a step up with ⌥↑', m2: 'getOrder now runs before the step that gives it data: Luvin warns', m3: 'Undo puts it back', m4: 'Remove a step: Luvin first says what breaks', m5: 'The steps that used its data show the error', m6: '⌘Z brings it back',
      }

  const video = async () => {
    const started = Date.now()
    const page = await freshPage({ video: V })
    return { page, started }
  }
  /** ＋ Paso, escribe y elige la fila (con el cursor). */
  async function addStep(page, query, { first = false } = {}) {
    if (first) await go(page, page.locator('.empty-card .ec-opt.main'), { pause: 500 })
    else await go(page, page.locator('.bl-add-step'), { pause: 500 })
    const quick = page.locator('.bl-quick')
    await quick.waitFor()
    await quick.locator('input').first().pressSequentially(query, { delay: 60 })
    await settle(page, 500)
    await go(page, quick.locator('.bl-op', { hasText: query }).first(), { pause: 1300 })
  }
  /** Lleva el cursor al título de un paso y lo abre. */
  async function openStep(page, id, top = 150, pause = 900) {
    await bring(page, node(page, id), top)
    await go(page, node(page, id).locator('.sn-title'), { pause })
    await side(page).locator('.bl-tabs').waitFor()
  }
  async function openFlow(page, which, top = 160) {
    const loc = which === 'start' ? start(page) : end(page)
    await bring(page, loc, top)
    await go(page, loc, { dx: -60, dy: -10, pause: 900 })
  }
  const prow = (page, name) => side(page).locator('.bl-prow', { has: page.locator('.bl-prow-name', { hasText: new RegExp(`^${name.replace(/[/$]/g, '\\$&')}$`) }) }).first()

  const scenes = {}

  scenes['clip-design-workflow'] = async () => {
    const { page, started } = await video()
    await openPokedex(page)
    await settle(page, 800)
    const from = Date.now()
    await say(page, C.n1, 300)
    await go(page, page.locator('.tree-add', { hasText: L('Nuevo workflow', 'New workflow') }).first(), { pause: 400 })
    await page.locator('.empty-card').waitFor()
    await settle(page, 900)
    await say(page, C.n2, 300)
    await addStep(page, '/pokemon/{', { first: true })
    await say(page, C.n3, 300)
    await addStep(page, '/pokemon-species/{')
    await deselect(page)
    await bring(page, node(page, 'getPokemonSpecies'), 160)
    await say(page, C.n4, 300)
    await go(page, node(page, 'getPokemonSpecies').locator('.xchip.x-step').first(), { click: false, pause: 2600 })
    await bring(page, start(page), 160)
    await say(page, C.n5, 300)
    await go(page, start(page), { click: false, pause: 2400 })
    await say(page, C.n6, 300)
    await go(page, tab(page, 'yaml'), { pause: 900 })
    await page.locator('.cm-content').first().waitFor()
    await page.locator('.cm-scroller').first().evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }))
    await settle(page, 3000)
    await say(page, '', 400)
    await saveClip(page, 'design-workflow', started, from)
  }

  scenes['clip-design-wire'] = async () => {
    const { page, started } = await video()
    await openPokedex(page)
    await h.newArazzo(page)
    const from = Date.now()
    await say(page, C.w1, 400)
    await addStep(page, '/pokemon/{', { first: true })
    await addStep(page, '/pokemon-species/{')
    await addStep(page, '/type/{')
    await deselect(page)
    await say(page, C.w2, 1800)
    await bring(page, node(page, 'getType'), 160)
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
    await bring(page, node(page, 'createOrder'), 170)
    const from = Date.now()
    await say(page, C.p1, 1600)
    const currency = node(page, 'createOrder').locator('.sn-row', { hasText: 'currency' }).first()
    await go(page, currency, { click: false, pause: 400 })
    await say(page, C.p2, 300)
    await go(page, currency.locator('.sn-promote'), { pause: 1200 })
    await bring(page, start(page), 160)
    await say(page, C.p3, 2000)
    await say(page, C.p4, 300)
    await go(page, start(page).locator('.sp-promote'), { pause: 900 })
    const dlg = page.locator('.welcome-dialog.rq-dialog').first()
    await dlg.waitFor()
    await say(page, C.p5, 300)
    await go(page, dlg.locator('.vary-row', { hasText: 'address/city' }).locator('input'), { pause: 700 })
    await go(page, dlg.locator('button.primary'), { pause: 1500 })
    await say(page, C.p6, 300)
    await openStep(page, 'createOrder', 170, 600)
    await panelScroll(page, prow(page, 'currency'), 'center')
    await pick(page, prow(page, 'currency').locator('select'), L('Valor fijo…', 'Fixed value…'), { pause: 500 })
    await say(page, C.p7, 300)
    const lit = prow(page, 'currency').locator('input').first()
    await go(page, lit, { pause: 200 })
    await lit.pressSequentially('EUR', { delay: 90 })
    await lit.press('Enter')
    await settle(page, 800)
    await say(page, C.p8, 300)
    await openFlow(page, 'start')
    await go(page, side(page).locator('.bl-output-custom', { hasText: 'currency' }).locator('.icon-btn.danger'), { pause: 1800 })
    await say(page, '', 300)
    await saveClip(page, 'design-promote', started, from)
  }

  scenes['clip-design-errors'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    await zoom(page, -1)
    const card = node(page, 'createOrder')
    await bring(page, card.locator('.sn-section.failures'), 200)
    const from = Date.now()
    await say(page, C.e1, 300)
    await go(page, card.locator('.sn-section.failures'), { click: false, pause: 2000 })
    await say(page, C.e2, 300)
    // 401: Terminar el workflow.
    await go(page, failRow(page, 'createOrder', 401).locator('.sn-branch-btn'), { pause: 900 })
    await routeDialog(page).waitFor()
    await say(page, C.e3, 300)
    await go(page, routeDialog(page).locator('.rd-kind[data-kind="end"]'), { pause: 1000 })
    await go(page, routeDialog(page).locator('.rd-actions button.primary'), { pause: 900 })
    await closeNotice(page)
    // 429: Reintentar.
    await say(page, C.e4, 300)
    await go(page, failRow(page, 'createOrder', 429).locator('.sn-branch-btn'), { pause: 900 })
    await go(page, routeDialog(page).locator('.rd-kind[data-kind="retry"]'), { pause: 1400 })
    await go(page, routeDialog(page).locator('.rd-actions button.primary'), { pause: 900 })
    await closeNotice(page)
    // 409: ir a listProducts.
    await say(page, C.e5, 300)
    await go(page, failRow(page, 'createOrder', 409).locator('.sn-branch-btn'), { pause: 900 })
    await go(page, routeDialog(page).locator('.rd-kind[data-kind="goto"]'), { pause: 800 })
    await pick(page, routeDialog(page).locator('#rd-to'), L('Lista los productos', 'List products'), { pause: 600 })
    await go(page, routeDialog(page).locator('.rd-actions button.primary'), { pause: 900 })
    await closeNotice(page)
    await bring(page, card.locator('.sn-section.failures'), 200)
    await say(page, C.e6, 300)
    await go(page, card.locator('.sn-section.failures'), { click: false, pause: 3000 })
    await say(page, '', 300)
    await saveClip(page, 'design-errors', started, from)
  }

  scenes['clip-design-outputs'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    const from = Date.now()
    await say(page, C.o1, 300)
    await openStep(page, 'getOrder', 150, 700)
    await say(page, C.o2, 300)
    await go(page, side(page).locator('.bl-head-row .link').first(), { pause: 700 })
    const chip = side(page).locator('.bl-chip', { hasText: 'total' }).first()
    await panelScroll(page, chip, 'center')
    await go(page, chip, { pause: 1200 })
    await say(page, C.o3, 300)
    await go(page, node(page, 'getOrder').locator('.sn-section.outputs .sn-row', { hasText: 'total' }).first(), { click: false, pause: 1800 })
    await say(page, C.o4, 300)
    await openFlow(page, 'end', 260)
    await say(page, C.o5, 300)
    await go(page, side(page).locator('.bl-chip', { hasText: 'getOrder › total' }).first(), { pause: 1000 })
    await say(page, C.o6, 300)
    const name = side(page).locator('.bl-output-name').last()
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
    await openFlow(page, 'start')
    await say(page, C.d2, 300)
    await pick(page, side(page).locator('.bl-section select').first(), L('Login · Inicia', 'Login · Log in'), { pause: 1200 })
    await deselect(page)
    await bring(page, page.locator('.builder .deps-node').first(), 160)
    await say(page, C.d3, 300)
    await go(page, page.locator('.builder .deps-node').first(), { click: false, pause: 2400 })
    await say(page, C.d4, 300)
    await go(page, page.locator('.bl-add-step'), { pause: 500 })
    const quick = page.locator('.bl-quick')
    await quick.locator('input').first().pressSequentially('browse', { delay: 70 })
    await settle(page, 400)
    await go(page, quick.locator('.bl-op', { hasText: 'browseProducts' }).first(), { pause: 1500 })
    await say(page, C.d5, 300)
    await go(page, side(page).locator('.bl-pgroup').first(), { click: false, pause: 2200 })
    await deselect(page)
    const called = page.locator('.builder .step-node', { has: page.locator('.sn-sub-toggle') }).first()
    await bring(page, called, 160)
    await say(page, C.d6, 300)
    await go(page, called.locator('.sn-sub-toggle'), { pause: 2400 })
    await say(page, '', 300)
    await saveClip(page, 'design-depends', started, from)
  }

  scenes['clip-design-reusables'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    // Preparación: createOrder ya reintenta un 429, con una ruta llamada on429. «Guardar como
    // reutilizable» busca la ruta por ese nombre (las que crea la app se llaman retry429 y fallan).
    await h.editYaml(page, (text) =>
      text.replace(
        '        successCriteria: [{ condition: $statusCode == 201 }]\n        outputs:\n          orderId: $response.body#/id',
        '        successCriteria: [{ condition: $statusCode == 201 }]\n        onFailure:\n          - name: on429\n            type: retry\n            retryAfter: 2\n            retryLimit: 3\n            criteria: [{ condition: $statusCode == 429 }]\n        outputs:\n          orderId: $response.body#/id',
      ),
    )
    const from = Date.now()
    await say(page, C.r1, 300)
    await openStep(page, 'createOrder', 150, 500)
    await go(page, panelTab(page, 1), { pause: 600 })
    const route = side(page).locator('.rs-route', { hasText: '429' }).first()
    await panelScroll(page, route, 'center')
    await say(page, C.r2, 300)
    await go(page, route.locator('.link', { hasText: L('reutilizable', 'reusable') }).first(), { pause: 500 })
    await say(page, C.r3, 300)
    const nameBox = route.locator('.rs-save input')
    await nameBox.press('Meta+a')
    await nameBox.pressSequentially('tooManyRequests', { delay: 60 })
    await go(page, route.locator('.rs-save button'), { pause: 1200 })
    await deselect(page)
    await say(page, C.r4, 300)
    await bring(page, failRow(page, 'getOrder', 429), 300)
    await go(page, failRow(page, 'getOrder', 429).locator('.sn-branch-btn'), { pause: 900 })
    await routeDialog(page).waitFor()
    await go(page, routeDialog(page).locator('.rd-reusables button').first(), { pause: 1400 })
    await closeNotice(page)
    await say(page, C.r5, 300)
    await go(page, failRow(page, 'getOrder', 429), { click: false, pause: 2000 })
    await say(page, C.r6, 300)
    await openFlow(page, 'start')
    await panelScroll(page, side(page).locator('.bl-reusables').first())
    await go(page, side(page).locator('.bl-reusables').first(), { click: false, pause: 2600 })
    await say(page, '', 300)
    await saveClip(page, 'design-reusables', started, from)
  }

  scenes['clip-design-gaps'] = async () => {
    const { page, started } = await video()
    await openStore(page)
    await design(page, 'placeOrder')
    const from = Date.now()
    await say(page, C.g1, 300)
    await openFlow(page, 'start')
    await go(page, side(page).locator('.bl-output-custom', { hasText: 'username' }).locator('.icon-btn.danger'), { pause: 900 })
    await deselect(page)
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
    await page.locator('.builder .step-node').first().waitFor()
    await bring(page, failRow(page, 'createOrder', 401), 300)
    await go(page, failRow(page, 'createOrder', 401).locator('.sn-branch-btn'), { pause: 900 })
    await go(page, routeDialog(page).locator('.rd-kind[data-kind="end"]'), { pause: 900 })
    await go(page, routeDialog(page).locator('.rd-actions button.primary'), { pause: 900 })
    await closeNotice(page)
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
    await zoom(page, -1)
    const from = Date.now()
    await say(page, C.m1, 300)
    await openStep(page, 'getOrder', 300, 600)
    await page.keyboard.press('Alt+ArrowUp')
    await settle(page, 900)
    await say(page, C.m2, 300)
    await go(page, page.locator('.callout.warn').first(), { click: false, pause: 2400 })
    await say(page, C.m3, 300)
    await go(page, page.locator('.callout.warn .link').first(), { pause: 600 })
    const closeWarn = page.locator('.callout.warn .link')
    if (await closeWarn.count()) await go(page, closeWarn.last(), { pause: 900 })
    else await settle(page, 900)
    await deselect(page)
    await say(page, C.m4, 300)
    await bring(page, node(page, 'listProducts'), 160)
    await go(page, node(page, 'listProducts').locator('.sn-win-remove'), { pause: 900 })
    await page.locator('.remove-dialog').waitFor()
    await settle(page, 1800)
    await go(page, page.locator('.remove-dialog .remove-actions button.danger'), { pause: 900 })
    await bring(page, node(page, 'createOrder'), 200)
    await say(page, C.m5, 300)
    await go(page, node(page, 'createOrder').locator('.sn-meta').first(), { click: false, pause: 2200 })
    await say(page, C.m6, 300)
    await page.keyboard.press('Meta+z')
    await settle(page, 2200)
    await say(page, '', 300)
    await saveClip(page, 'design-organize', started, from)
  }

  return scenes
}
