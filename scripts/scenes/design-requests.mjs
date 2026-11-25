// Escenas de "Diseñar workflows" a partir de requests guardados (sin contrato): la búsqueda de ＋ Paso con
// los requests, los campos obligatorios, probar un paso, las conexiones que sugiere Luvin, un workflow vacío,
// y dos colecciones de Postman con scripts: una guarda el id del pedido (Luvin lo conecta sin enviar nada)
// y otra con un login cuyo script guarda el token (Luvin lo pasa a los pasos siguientes).
import { helpers } from './design.mjs'

export default (ctx) => {
  const { ES, T, API, V, tmp, path, writeFileSync, freshPage, shot, settle, done, go, say, saveClip, moveTo } = ctx
  const h = helpers(ctx)
  const { L, openStore, node, side, panelTab, panelScroll, bring, select, deselect, closeNotice } = h

  // --- Dos colecciones de Postman contra la API local de prueba ---
  const json = { header: [{ key: 'Content-Type', value: 'application/json' }] }
  const ORDERS = {
    info: { name: 'Orders', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
    variable: [{ key: 'baseUrl', value: API }],
    item: [
      {
        name: 'Create order',
        event: [{ listen: 'test', script: { type: 'text/javascript', exec: ['pm.collectionVariables.set("order_id", pm.response.json().id);'] } }],
        request: { method: 'POST', ...json, url: '{{baseUrl}}/orders', body: { mode: 'raw', raw: '{\n  "customer": "Ana",\n  "currency": "EUR"\n}', options: { raw: { language: 'json' } } } },
      },
      { name: 'Get order', request: { method: 'GET', header: [], url: '{{baseUrl}}/orders/{{order_id}}' } },
    ],
  }
  const SHOP = {
    info: { name: 'Shop API', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
    auth: { type: 'bearer', bearer: [{ key: 'token', value: '{{accessToken}}', type: 'string' }] },
    variable: [{ key: 'baseUrl', value: API }, { key: 'accessToken', value: '' }],
    item: [
      {
        name: '01 - Login',
        event: [{ listen: 'test', script: { type: 'text/javascript', exec: ['const body = pm.response.json();', 'pm.collectionVariables.set("accessToken", body.accessToken);'] } }],
        request: { method: 'POST', auth: { type: 'noauth' }, ...json, url: '{{baseUrl}}/login', body: { mode: 'raw', raw: '{\n  "username": "ana",\n  "password": "secret"\n}', options: { raw: { language: 'json' } } } },
      },
      {
        name: '02 - Create order',
        event: [{ listen: 'test', script: { type: 'text/javascript', exec: ['pm.collectionVariables.set("order_id", pm.response.json().id);'] } }],
        request: { method: 'POST', ...json, url: '{{baseUrl}}/orders', body: { mode: 'raw', raw: '{\n  "customer": "Ana"\n}', options: { raw: { language: 'json' } } } },
      },
      { name: '03 - Get order', request: { method: 'GET', header: [], url: '{{baseUrl}}/orders/{{order_id}}' } },
    ],
  }
  writeFileSync(path.join(tmp, 'orders.postman_collection.json'), JSON.stringify(ORDERS, null, 2))
  writeFileSync(path.join(tmp, 'shop.postman_collection.json'), JSON.stringify(SHOP, null, 2))

  /** Un workspace con una colección de Postman importada (y sus scripts aceptados). */
  async function openPostman(page, file) {
    await page.locator('.welcome-dialog').waitFor()
    await page.locator('.wd-card', { hasText: T.createWs }).click()
    await page.locator('.wd-form input').first().fill('Demo')
    await page.getByRole('button', { name: T.createWsGo }).click()
    await page.locator('.home').waitFor()
    await page.locator('.home-action', { hasText: T.importPm }).click()
    await page.locator('.import-sources').waitFor()
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.import-card button.primary').first().click()])
    await chooser.setFiles([path.join(tmp, file)])
    await page.locator('.import-dialog .curl-actions button.primary').click()
    // ¿Confías en esta colección? Sí: sus scripts son de este ejemplo.
    const trust = page.locator('.welcome-dialog').filter({ has: page.locator('button.primary') }).last()
    await trust.waitFor()
    await trust.locator('button.primary').last().click()
    await page.locator('.tree-add', { hasText: L('Nuevo workflow', 'New workflow') }).first().waitFor()
    await settle(page, 600)
  }
  /** Un workflow nuevo en la colección: el lienzo vacío con «Arma tu workflow». */
  async function newWorkflow(page, v = false) {
    const add = page.locator('.tree-add', { hasText: L('Nuevo workflow', 'New workflow') }).first()
    if (v) await go(page, add, { pause: 400 })
    else await add.click()
    await page.locator('.builder .graph').waitFor()
    await page.locator('.empty-card').waitFor()
    await settle(page, 900)
  }
  const quickOp = (page, name) => page.locator('.bl-quick .bl-op', { hasText: name }).first()

  /** Crea un request desde un cURL y le pone nombre. */
  async function curlRequest(page, curl, name) {
    await page.locator('.tree-add', { hasText: T.newRequest }).first().click()
    await page.locator('.nr-dialog').waitFor()
    await page.locator('.nr-curl-btn[data-kind="curl"]').click()
    await page.locator('.nr-curl textarea').fill(curl)
    await page.locator('.nr-dialog').getByRole('button', { name: T.imp }).click()
    await page.locator('.rq').waitFor()
    const nm = page.locator('.rq-name')
    await nm.fill(name)
    await nm.press('Enter')
    await settle(page, 500)
  }
  const CREATE = L('Crear pedido', 'Create order')
  const GET = L('Consultar pedido', 'Get order')
  const createId = L('crearPedido', 'createOrder')

  const scenes = {}

  // Requests creados desde un cURL, sin scripts: la búsqueda, campos obligatorios, probar un paso y las conexiones.
  scenes['design-requests'] = async () => {
    const page = await freshPage()
    await openStore(page, [])
    await curlRequest(page, `curl -X POST '${API}/orders' -H 'content-type: application/json' -d '{"customer":"Ana","currency":"EUR"}'`, CREATE)
    await curlRequest(page, `curl '${API}/orders/{{order_id}}'`, GET)
    await newWorkflow(page)
    await shot(page, 'design-empty-workflow')
    // Agregar el primer paso: la búsqueda, con los requests de la colección.
    await page.locator('.empty-card .ec-opt.main').click()
    const quick = page.locator('.bl-quick')
    await quick.waitFor()
    await quick.locator('.bl-group', { has: page.locator('.bl-op', { hasText: CREATE }) }).first().evaluate((el) => el.scrollIntoView({ block: 'start' }))
    await settle(page, 500)
    await shot(page, 'design-requests-palette')
    // Crear pedido: Luvin todavía no sabe qué responde, y faltan sus campos obligatorios.
    await quickOp(page, CREATE).click()
    await settle(page, 1500)
    await shot(page, 'design-request-step')
    await deselect(page)
    await shot(page, 'design-required-bar')
    // Marcar: ¿qué exige la API?
    await page.locator('.bl-connect.bl-required button').first().click()
    const dlg = page.locator('.req-fields').first()
    await dlg.waitFor()
    await dlg.locator('.vary-row', { hasText: 'customer' }).locator('input').check()
    await settle(page, 400)
    await shot(page, 'design-required-fields')
    await dlg.locator('.curl-actions button.primary').click()
    await settle(page, 600)
    // Consultar pedido, al final.
    await page.locator('.bl-add-step').click()
    await quickOp(page, GET).click()
    await settle(page, 1500)
    // Probar Crear pedido: es un POST, pide confirmar.
    await select(page, createId)
    await page.locator('.bl-detail-stack button', { hasText: L('Probar este paso', 'Try this step') }).click()
    await settle(page, 400)
    await shot(page, 'design-try-step')
    await page.locator('.bl-detail-stack button', { hasText: L('Enviar igual', 'Send anyway') }).click()
    await page.locator('.bl-connect').filter({ hasNot: page.locator('.bl-reqnote') }).first().waitFor({ timeout: 15000 })
    await settle(page, 800)
    await deselect(page)
    await shot(page, 'design-connections-bar')
    await done()
  }

  // Una colección de Postman cuyo script guarda el id: Consultar pedido ya lo toma de Crear pedido.
  scenes['design-script-wiring'] = async () => {
    const page = await freshPage()
    await openPostman(page, 'orders.postman_collection.json')
    await newWorkflow(page)
    await page.locator('.empty-card .ec-opt').nth(1).click()
    await page.locator('.bl-quick').waitFor()
    for (const n of ['Create order', 'Get order']) {
      await quickOp(page, n).click()
      await settle(page, 1300)
    }
    await page.keyboard.press('Escape')
    await settle(page, 500)
    await select(page, 'getOrder', 160)
    await shot(page, 'design-script-wiring')
    await done()
  }

  // El login de una colección de Postman: Luvin lee su script y pasa el token a los pasos siguientes.
  scenes['design-token-script'] = async () => {
    const page = await freshPage()
    await openPostman(page, 'shop.postman_collection.json')
    await newWorkflow(page)
    await page.locator('.empty-card .ec-opt').nth(1).click()
    await page.locator('.bl-quick').waitFor()
    for (const n of ['01 - Login', '02 - Create order', '03 - Get order']) {
      await quickOp(page, n).click()
      await settle(page, 1300)
    }
    await page.keyboard.press('Escape')
    await settle(page, 500)
    await closeNotice(page)
    // La pestaña Autorización de 02 - Create order, con el parámetro en Arazzo a la vista.
    await select(page, 'createOrder', 160)
    await panelTab(page, 2).click()
    await settle(page, 500)
    await side(page).locator('.bl-auth-arazzo summary').first().click()
    await settle(page, 500)
    await panelScroll(page, side(page).locator('.bl-auth').first())
    await shot(page, 'auth-step-token')
    await done()
  }

  // --------------------------------------------------------------------------------------------
  const C = ES
    ? {
        q1: 'Dos requests de Postman: Create order guarda el id en su script', q2: 'Un workflow nuevo: Armar con requests de la colección', q3: 'Elige los requests en orden', q4: 'Get order usa {{order_id}}: Luvin lo toma del paso anterior, sin enviar nada', q5: 'Create order entrega order_id: lo leyó del script',
        t1: 'Una colección de Postman: el script del login guarda el token', t2: 'Un workflow nuevo, con los requests de la colección', t3: 'Primero el login…', t4: '…y luego un paso que necesita autorización', t5: 'Luvin conectó el token: lo leyó del script del login, sin correrlo', t6: 'El siguiente paso también lo usa', t7: 'El login inicia sesión; los otros pasos llevan 🔑',
      }
    : {
        q1: 'Two Postman requests: Create order saves the id in its script', q2: 'A new workflow: Build from the collection’s requests', q3: 'Pick the requests in order', q4: 'Get order uses {{order_id}}: Luvin takes it from the step before, without sending anything', q5: 'Create order gives order_id: Luvin read it from the script',
        t1: 'A Postman collection: the login script saves the token', t2: 'A new workflow, with the collection’s requests', t3: 'First the login…', t4: '…then a step that needs authorization', t5: 'Luvin connected the token: it read it from the login script, without running it', t6: 'The next step uses it too', t7: 'The login signs in; the other steps carry 🔑',
      }

  scenes['clip-design-from-requests'] = async () => {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await openPostman(page, 'orders.postman_collection.json')
    const from = Date.now()
    await say(page, C.q1, 300)
    await go(page, page.locator('.tree-request, .tree-row-wrap', { hasText: 'Create order' }).first(), { click: false, pause: 2000 })
    await say(page, C.q2, 300)
    await newWorkflow(page, true)
    await go(page, page.locator('.empty-card .ec-opt').nth(1), { pause: 900 })
    await page.locator('.bl-quick').waitFor()
    await say(page, C.q3, 300)
    await go(page, quickOp(page, 'Create order'), { pause: 1300 })
    await go(page, quickOp(page, 'Get order'), { pause: 1300 })
    await page.keyboard.press('Escape')
    await settle(page, 500)
    await deselect(page)
    await bring(page, node(page, 'getOrder'), 160)
    await say(page, C.q4, 300)
    await go(page, node(page, 'getOrder').locator('.xchip.x-step').first(), { click: false, pause: 2600 })
    await bring(page, node(page, 'createOrder'), 160)
    await say(page, C.q5, 300)
    await go(page, node(page, 'createOrder').locator('.sn-section.outputs .sn-row').first(), { click: false, pause: 2600 })
    await say(page, '', 400)
    await saveClip(page, 'design-from-requests', started, from)
  }

  scenes['clip-token-from-script'] = async () => {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await openPostman(page, 'shop.postman_collection.json')
    const from = Date.now()
    await say(page, C.t1, 300)
    await go(page, page.locator('.tree-request, .tree-row-wrap', { hasText: '01 - Login' }).first(), { click: false, pause: 2000 })
    await say(page, C.t2, 300)
    await newWorkflow(page, true)
    await go(page, page.locator('.empty-card .ec-opt').nth(1), { pause: 900 })
    await page.locator('.bl-quick').waitFor()
    await say(page, C.t3, 300)
    await go(page, quickOp(page, '01 - Login'), { pause: 1300 })
    await say(page, C.t4, 300)
    await go(page, quickOp(page, '02 - Create order'), { pause: 900 })
    await page.locator('.bl-token-notice').waitFor({ timeout: 10000 })
    await say(page, C.t6, 300)
    await go(page, quickOp(page, '03 - Get order'), { pause: 900 })
    await page.keyboard.press('Escape')
    await settle(page, 500)
    await say(page, C.t5, 300)
    await go(page, page.locator('.bl-token-notice').first(), { click: false, pause: 3200 })
    await deselect(page)
    await bring(page, node(page, 'createOrder'), 160)
    await say(page, C.t7, 300)
    await go(page, node(page, 'createOrder').locator('.sn-token-value').first(), { click: false, pause: 2600 })
    await moveTo(page, 1150, 600)
    await say(page, '', 1200)
    await saveClip(page, 'token-from-script', started, from)
  }

  return scenes
}
