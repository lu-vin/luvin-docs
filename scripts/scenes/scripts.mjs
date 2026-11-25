// Escenas de los scripts de Postman (antes del request y después de la respuesta) y de importar una
// colección que los trae: capturas request-scripts-tab, response-tests-tab, response-console-tab,
// scripts-before-failed, scripts-trust-dialog, folder-scripts-dialog, collection-scripts-tab,
// variables-current-value, runner-requests-tests, import-scripts-summary e import-duplicate.
// Todo va contra una tienda local propia (127.0.0.1, puerto libre) que levanta cada escena.
import { createServer as createHttp } from 'node:http'

export default (ctx) => {
  const { ES, T, tmp, path, writeFileSync, freshPage, shot, settle } = ctx
  const L = (es, en) => (ES ? es : en)

  // Textos de la interfaz que se buscan (src/i18n/locales/{en,es}/ui.ts).
  const U = {
    scripts: 'Scripts',
    after: L('Después de la respuesta', 'After response'),
    tests: L('Pruebas', 'Tests'),
    console: L('Consola', 'Console'),
    trust: L('Confiar', 'Trust'),
    folderScripts: /^Scripts/,
    runRequests: L('Ejecutar requests', 'Run requests'),
  }

  // --- La tienda local (solo 127.0.0.1): login con token, un cliente y sus pedidos ---
  async function startShop() {
    const server = createHttp((req, res) => {
      const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }
      if (req.method === 'OPTIONS') return res.writeHead(204, cors).end()
      const json = (status, body) => res.writeHead(status, { ...cors, 'content-type': 'application/json' }).end(JSON.stringify(body))
      const url = req.url.split('?')[0]
      req.resume()
      if (req.method === 'POST' && url === '/login') return json(200, { accessToken: 'demo-token-123', expiresIn: 3600, user: { id: 42, name: 'Ana' } })
      const authed = /Bearer demo-token-123/.test(req.headers.authorization ?? '')
      if (!authed) return json(401, { error: 'Missing or invalid token' })
      if (req.method === 'GET' && url === '/customers/me') return json(200, { id: 42, name: 'Ana', email: 'ana@example.com', tier: 'gold' })
      if (req.method === 'GET' && url === '/orders')
        return json(200, {
          total: 3,
          items: [
            { id: 'ord-1040', status: 'DELIVERED', total: 12.5 },
            { id: 'ord-1041', status: 'DELIVERED', total: 7 },
            { id: 'ord-1042', status: 'PENDING', total: 4.5 },
          ],
        })
      return json(404, { error: 'Not found' })
    })
    await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
    const base = `http://127.0.0.1:${server.address().port}`
    const close = () => new Promise((ok) => (server.closeAllConnections?.(), server.close(() => ok())))
    return { base, close }
  }

  /** Una colección de Postman inventada, con scripts en la colección, en una carpeta y en sus requests. */
  function postmanFile(base) {
    const folder = L('Clientes', 'Customers')
    const collection = {
      info: { name: 'Shop API', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
      variable: [{ key: 'baseUrl', value: base }],
      event: [
        {
          listen: 'prerequest',
          script: {
            exec: [
              'if (!pm.collectionVariables.get("token") && pm.info.requestName !== "Log in") {',
              '  throw new Error(\'Missing token. Send "Log in" first.\');',
              '}',
            ],
          },
        },
      ],
      item: [
        {
          name: 'Log in',
          request: {
            method: 'POST',
            header: [{ key: 'Content-Type', value: 'application/json' }],
            url: { raw: '{{baseUrl}}/login' },
            body: { mode: 'raw', raw: '{\n  "email": "ana@example.com",\n  "password": "demo"\n}', options: { raw: { language: 'json' } } },
          },
          event: [
            {
              listen: 'test',
              script: {
                exec: [
                  'const body = pm.response.json();',
                  '',
                  'pm.test("status is 200", () => {',
                  '  pm.response.to.have.status(200);',
                  '});',
                  'pm.test("returns a token", () => {',
                  '  pm.expect(body.accessToken).to.be.a("string");',
                  '});',
                  '',
                  'pm.collectionVariables.set("token", body.accessToken);',
                  'console.log("Logged in as", body.user.name);',
                ],
              },
            },
          ],
        },
        {
          name: folder,
          event: [
            {
              listen: 'prerequest',
              script: { exec: ['pm.request.headers.upsert({ key: "X-Request-Id", value: pm.variables.replaceIn("{{$guid}}") });', 'console.info("Request id added");'] },
            },
          ],
          item: [
            {
              name: 'Get customer',
              request: { method: 'GET', header: [{ key: 'Authorization', value: 'Bearer {{token}}' }], url: { raw: '{{baseUrl}}/customers/me' } },
              event: [
                {
                  listen: 'test',
                  script: {
                    exec: [
                      'pm.test("status is 200", () => pm.response.to.have.status(200));',
                      'pm.test("has an email", () => {',
                      '  pm.expect(pm.response.json().email).to.include("@");',
                      '});',
                      'console.log("Customer:", pm.response.json().name);',
                    ],
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'Get orders',
          request: { method: 'GET', header: [{ key: 'Authorization', value: 'Bearer {{token}}' }], url: { raw: '{{baseUrl}}/orders' } },
          event: [
            {
              listen: 'test',
              script: {
                exec: [
                  'const orders = pm.response.json().items;',
                  'pm.test("status is 200", () => pm.response.to.have.status(200));',
                  'pm.test("every order is delivered", () => {',
                  '  orders.forEach((o) => pm.expect(o.status).to.eql("DELIVERED"));',
                  '});',
                  'console.log("Orders:", orders.length);',
                ],
              },
            },
          ],
        },
      ],
    }
    const file = path.join(tmp, 'shop-api.postman_collection.json')
    writeFileSync(file, JSON.stringify(collection, null, 2))
    return file
  }

  /** Un workspace vacío (en la carpeta temporal de la app), en su inicio. */
  async function openWorkspace(page) {
    await page.locator('.welcome-dialog').waitFor()
    await page.locator('.wd-card', { hasText: T.createWs }).click()
    await page.locator('.wd-form input').first().fill('Demo')
    await page.getByRole('button', { name: T.createWsGo }).click()
    await page.locator('.home').waitFor()
    await settle(page, 400)
  }
  /** Importar de Postman desde el inicio del workspace, hasta el resumen. */
  async function importSummary(page, file) {
    const home = page.locator('.ws-home-tab button').first()
    if (await home.count()) await home.click()
    await page.locator('.home-action', { hasText: T.importPm }).click()
    await page.locator('.import-sources').waitFor()
    await page.locator('.import-dialog input[type="file"][accept]').first().setInputFiles(file)
    await page.locator('.import-result').waitFor()
    await page.mouse.move(1270, 790)
    await settle(page, 400)
  }
  const trustDialog = (page) => page.locator('[role="dialog"]', { hasText: L('¿Confías en esta colección?', 'Do you trust this collection?') }).last()
  /** Importa la colección (con el resumen ya abierto) y confía en ella cuando lo pregunta. */
  async function importAndTrust(page, { shotTrust = false } = {}) {
    await page.locator('.import-dialog button.primary', { hasText: L('Importar', 'Import') }).last().click()
    await trustDialog(page).waitFor({ timeout: 15000 })
    await settle(page, 500)
    if (shotTrust) await shot(page, 'scripts-trust-dialog')
    await trustDialog(page).locator('button.primary').click()
    await settle(page, 600)
  }
  const openRequest = async (page, name) => {
    await page.locator('.tree-request', { hasText: name }).first().click()
    await page.locator('.rq').waitFor()
    await settle(page, 500)
  }
  const reqTab = (page, label) => page.locator('.rq-req-tabs [role="tab"]', { hasText: label }).first()
  const resTab = (page, label) => page.locator('.rq-res-tabs [role="tab"]', { hasText: label }).first()
  async function send(page) {
    await page.locator('.rq-send').click()
    await page.locator('.rq-res-body, .rq-res-error').first().waitFor({ timeout: 15000 })
    await settle(page, 900)
  }
  /** Abre la carpeta si está cerrada. */
  async function openFolder(page, name) {
    const row = page.locator('.tree-rfolder-row', { hasText: name }).first()
    if ((await row.getAttribute('aria-expanded')) !== 'true') await row.click()
    await settle(page, 300)
  }

  /** Si algo desplazó la ventana hacia un lado (la vista del request es más ancha que la ventana), la vuelve a su lugar. */
  const unscroll = (page) =>
    page.evaluate(() => {
      for (const el of [document.scrollingElement, ...document.querySelectorAll('body *')]) if (el && el.scrollLeft > 0 && !el.closest?.('.cm-editor')) el.scrollLeft = 0
    })

  const scenes = {}

  // ---------------------------------------------------------------- Importar una colección con scripts
  scenes['scripts-import'] = async () => {
    const shop = await startShop()
    try {
      const file = postmanFile(shop.base)
      const page = await freshPage()
      await openWorkspace(page)
      await importSummary(page, file)
      await shot(page, 'import-scripts-summary')
      await importAndTrust(page, { shotTrust: true })
      // La misma colección otra vez: ya existe una con ese nombre.
      await importSummary(page, file)
      await page.locator('.import-duplicate').waitFor()
      await shot(page, 'import-duplicate')
      await page.keyboard.press('Escape')
      await ctx.done()
    } finally {
      await shop.close()
    }
  }

  // ---------------------------------------------------------------- Scripts de un request, carpeta y colección
  scenes['scripts-request'] = async () => {
    const shop = await startShop()
    try {
      const file = postmanFile(shop.base)
      const page = await freshPage()
      await openWorkspace(page)
      await importSummary(page, file)
      await importAndTrust(page)
      const folder = L('Clientes', 'Customers')
      await openFolder(page, folder)

      // Sin token: el script de la colección (antes del request) detiene "Get orders".
      await openRequest(page, 'Get orders')
      await send(page)
      await page.locator('.rq-res-error .scripts-failed').waitFor()
      await page.mouse.move(1270, 790)
      await unscroll(page)
      await shot(page, 'scripts-before-failed')

      // "Log in": su script de después de la respuesta guarda el token; la pestaña Pruebas de la respuesta.
      await openRequest(page, 'Log in')
      await reqTab(page, U.scripts).click()
      await page.locator('.scripts-nav [role="tab"]', { hasText: U.after }).click()
      await page.locator('.scripts .cm-content').first().waitFor()
      await send(page)
      await resTab(page, U.tests).click()
      await settle(page, 400)
      await page.mouse.move(1270, 790)
      await unscroll(page)
      await shot(page, 'response-tests-tab')

      // El valor actual que guardó el script de "Log in": la tarjeta de {{token}} en los headers de "Get customer".
      await openRequest(page, 'Get customer')
      await reqTab(page, 'Headers').click()
      await settle(page, 400)
      const mark = page.locator('.rq .tpl-mark[data-name="token"]').first()
      await mark.waitFor({ state: 'attached' })
      await mark.evaluate((el) => el.closest('tr, .tpl-input')?.scrollIntoView({ block: 'center' }))
      await unscroll(page)
      await settle(page, 300)
      // El {{token}} se dibuja detrás del campo: se lleva el mouse a su lugar (sin desplazar la ventana).
      const mb = await mark.boundingBox()
      await page.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2, { steps: 4 })
      await page.locator('.tpl-card').first().waitFor()
      await settle(page, 500)
      await shot(page, 'variables-current-value')
      await page.mouse.move(1270, 790)
      await settle(page, 400)

      // Su pestaña Scripts dice que también corren los de la colección y la carpeta (el panel, arriba del todo).
      await reqTab(page, U.scripts).click()
      await page.evaluate(() => document.querySelectorAll('.rq-req, .rq-req *').forEach((el) => el.scrollTop > 0 && !el.closest('.cm-editor') && (el.scrollTop = 0)))
      await page.locator('.scripts-nav [role="tab"]', { hasText: U.after }).click()
      await page.locator('.scripts .cm-content').first().waitFor()
      await settle(page, 600)
      await page.mouse.move(1270, 790)
      await unscroll(page)
      await shot(page, 'request-scripts-tab')
      // La consola: una línea del script de la carpeta (antes) y otra del request (después).
      await send(page)
      await resTab(page, U.console).click()
      await settle(page, 400)
      await unscroll(page)
      await shot(page, 'response-console-tab')

      // Los scripts de una carpeta: su menú ⋯ en la barra lateral → Scripts • …
      const row = page.locator('.tree-row-wrap', { has: page.locator('.tree-rfolder-row', { hasText: folder }) }).first()
      await row.hover()
      await row.locator('.row-menu-btn').first().click()
      await page.locator('.row-menu-list').waitFor()
      await page.locator('.row-menu-list button', { hasText: U.folderScripts }).click()
      const dlg = page.locator('[role="dialog"]', { hasText: folder }).last()
      await dlg.waitFor()
      await dlg.locator('.cm-content').first().waitFor()
      await settle(page, 600)
      await page.mouse.move(1270, 790)
      await unscroll(page)
      await shot(page, 'folder-scripts-dialog')
      await page.keyboard.press('Escape')
      await settle(page, 400)

      // Los de la colección: su pestaña Scripts.
      await page.locator('.tree-collection.current').click()
      await page.locator('.collection-overview').waitFor()
      await page.locator('.collection-overview [role="tab"][data-tab="scripts"]').click()
      await page.locator('#collection-scripts .cm-content').first().waitFor()
      await settle(page, 600)
      await page.mouse.move(1270, 790)
      await unscroll(page)
      await shot(page, 'collection-scripts-tab')

      // El runner de requests: las pruebas de cada request junto a sus comprobaciones.
      await page.keyboard.press('Meta+k')
      await page.locator('.palette input').fill(U.runRequests)
      await page.locator('.palette-list [role="option"], .palette-list button', { hasText: U.runRequests }).first().click()
      await page.locator('.runner-shell').waitFor()
      await settle(page, 600)
      await page.locator('.runner-start').click()
      await page.locator('.runner-results').waitFor()
      await page.waitForFunction(() => document.querySelector('.runner-results') && !document.querySelector('.runner-progress') && !document.querySelector('.runner-step.pending'), null, { timeout: 60000 })
      await settle(page, 1200)
      await page.mouse.move(1270, 790)
      await unscroll(page)
      await shot(page, 'runner-requests-tests')
      await ctx.done()
    } finally {
      await shop.close()
    }
  }

  return scenes
}
