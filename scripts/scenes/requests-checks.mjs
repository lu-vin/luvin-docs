// Escenas de las variables y comprobaciones de un request (después de la respuesta, sin scripts):
// capturas request-vars*, request-checks, response-checks-* e import-checks-summary, en los dos idiomas.
// Los requests van a la API local de prueba de capture.mjs (la tienda "Shop").
export default (ctx) => {
  const { ES, T, API, tmp, path, writeFileSync, freshPage, shot, clip, settle, openShop } = ctx

  // Textos de la interfaz que las escenas buscan (los mismos de src/i18n/locales/{en,es}/ui.ts).
  const L = ES
    ? { vars: 'Variables', checks: 'Comprobaciones', addVar: 'Variable', addCheck: 'Comprobación', gt: 'es mayor que', home: 'Inicio' }
    : { vars: 'Variables', checks: 'Checks', addVar: 'Variable', addCheck: 'Check', gt: 'is greater than', home: 'Home' }

  // Una colección de Postman inventada, con tests y variables en sus scripts: Luvin convierte lo común
  // (pm.test, pm.expect, pm.environment.set) y avisa de lo que no puede convertir.
  const POSTMAN = {
    info: { name: 'Shop API', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
    variable: [{ key: 'baseUrl', value: 'https://shop.example.com' }],
    item: [
      {
        name: 'Products',
        item: [
          {
            name: 'List products',
            request: { method: 'GET', url: { raw: '{{baseUrl}}/products' } },
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'const data = pm.response.json();',
                    'pm.test("Status 200", function () {',
                    '  pm.response.to.have.status(200);',
                    '});',
                    'pm.test("Has products", function () {',
                    '  pm.expect(data.items).to.be.an("array");',
                    '  pm.expect(data.total).to.be.above(0);',
                    '});',
                    'pm.environment.set("sku", data.items[0].sku);',
                  ],
                },
              },
            ],
          },
          {
            name: 'Product detail',
            request: { method: 'GET', url: { raw: '{{baseUrl}}/products/{{sku}}' } },
            event: [
              {
                listen: 'test',
                script: {
                  exec: [
                    'const data = pm.response.json();',
                    'pm.test("Same product", () => {',
                    '  pm.expect(data.sku).to.eql(pm.environment.get("sku"));',
                    '  pm.expect(pm.response.responseTime).to.be.below(800);',
                    '});',
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        name: 'Create order',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          url: { raw: '{{baseUrl}}/orders' },
          body: { mode: 'raw', raw: '{"customer":"Ana","lines":[{"sku":"{{sku}}","qty":1}]}', options: { raw: { language: 'json' } } },
        },
        event: [
          { listen: 'prerequest', script: { exec: ['pm.environment.set("ts", Date.now());'] } },
          {
            listen: 'test',
            script: {
              exec: [
                'pm.test("Created", function () {',
                '  pm.response.to.have.status(201);',
                '  pm.expect(pm.response.json().status).to.eql("CREATED");',
                '});',
                'pm.environment.set("orderId", pm.response.json().id);',
              ],
            },
          },
        ],
      },
    ],
  }
  writeFileSync(path.join(tmp, 'shop.postman_collection.json'), JSON.stringify(POSTMAN, null, 2))

  /** Un menú dibujado con las opciones reales de un <select> (el nativo es del sistema y no sale en la captura). */
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
      for (const o of el.options) {
        const d = document.createElement('div')
        d.textContent = o.textContent
        Object.assign(d.style, { padding: '3px 10px', whiteSpace: 'nowrap' })
        if (hl ? o.textContent.trim() === hl : o.selected) Object.assign(d.style, { background: '#2f6fde', color: '#fff' })
        menu.append(d)
      }
      document.documentElement.append(menu)
    }, highlight)
  }
  const hideOptions = (page) => page.evaluate(() => document.getElementById('demo-select')?.remove())

  /** Una pestaña del request (no la de la respuesta, que en español se llama igual). */
  const reqTab = (page, label) => page.locator('.rq-req-tabs [role="tab"]', { hasText: label }).first()

  async function send(page) {
    await page.locator('.rq-send').click()
    await page.locator('.rq-status').waitFor({ timeout: 15000 })
    await settle(page, 800)
  }

  /** Más alto el request (el divisor con la respuesta, hacia abajo). */
  async function tallRequest(page, dy) {
    const handle = await page.locator('.rq-split-handle').first().boundingBox()
    if (!handle) return
    await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
    await page.mouse.down()
    await page.mouse.move(handle.x + handle.width / 2, handle.y + dy, { steps: 8 })
    await page.mouse.up()
    await settle(page, 300)
  }

  return {
    async 'checks-request'() {
      const page = await freshPage()
      await openShop(page)
      await page.locator('.tree-add', { hasText: T.newRequest }).click()
      await page.locator('.nr-dialog').waitFor()
      await page.locator('.nr-curl-btn[data-kind="curl"]').click()
      await page.locator('.nr-curl textarea').fill(`curl '${API}/products' -H 'accept: application/json'`)
      await page.locator('.nr-dialog').getByRole('button', { name: T.imp }).click()
      await page.locator('.rq').waitFor()
      // Un primer envío: con la última respuesta, el editor muestra el valor de cada expresión.
      await send(page)

      // Variables: el SKU del primer producto, para los requests siguientes.
      await reqTab(page, L.vars).click()
      await page.locator('.checks-add button', { hasText: L.addVar }).first().click()
      const v = page.locator('.checks-row').last()
      await v.locator('.checks-name').fill('firstSku')
      await v.locator('.checks-expr').fill('res.body.items[0].sku')
      await page.locator('.checks-add button', { hasText: L.addVar }).first().click()
      const v2 = page.locator('.checks-row').last()
      await v2.locator('.checks-name').fill('total')
      await v2.locator('.checks-expr').fill('res.body.total')
      await page.evaluate(() => document.activeElement?.blur?.())
      await page.mouse.move(900, 120)
      await shot(page, 'request-vars')

      // Comprobaciones: status, cantidad, tiempo y una que no se cumple (el stock del primero es 40).
      await reqTab(page, L.checks).click()
      const rows = [
        ['res.status', 'eq', '200'],
        ['res.body.items.length', 'eq', '10'],
        ['res.responseTime', 'lt', '1000'],
        ['res.body.items[0].stock', 'gt', '50'],
      ]
      for (const [expr, op, value] of rows) {
        await page.locator('.checks-add button', { hasText: L.addCheck }).first().click()
        const r = page.locator('.checks-row').last()
        await r.locator('.checks-expr').fill(expr)
        await r.locator('.checks-op').selectOption(op)
        await r.locator('.checks-value').fill(value)
      }
      await tallRequest(page, 120)
      await page.evaluate(() => document.activeElement?.blur?.())
      await page.mouse.move(900, 120)
      await showOptions(page, page.locator('.checks-row').last().locator('.checks-op'), L.gt)
      await shot(page, 'request-checks')
      await hideOptions(page)

      // Enviar: el resumen junto al status y la pestaña de la respuesta.
      await send(page)
      await page.locator('.rq-checks-chip').waitFor()
      await page.mouse.move(900, 120)
      const meta = await page.locator('.rq-res-meta').first().boundingBox()
      await clip(page, 'response-checks-chip', { x: meta.x, y: meta.y, width: Math.min(560, meta.width), height: meta.height }, 6)
      await page.locator('.rq-checks-chip').click()
      // Más alta la respuesta, para ver todas las comprobaciones (y luego se deja como estaba).
      await tallRequest(page, -330)
      await page.mouse.move(900, 120)
      await shot(page, 'response-checks-tab')
      await tallRequest(page, 330)

      // El valor de la variable después de enviar: "Guardadas ahora" en la pestaña Variables.
      await reqTab(page, L.vars).click()
      await settle(page, 500)
      await shot(page, 'request-vars-runtime')
      await ctx.done()
    },

    async 'checks-import'() {
      const page = await freshPage()
      await openShop(page)
      await page.locator('.ws-home-tab button').first().click()
      await page.locator('.home-action', { hasText: T.importPm }).click()
      await page.locator('.import-sources').waitFor()
      await page.locator('.import-dialog input[type="file"][accept]').setInputFiles(path.join(tmp, 'shop.postman_collection.json'))
      await page.locator('.import-result').waitFor()
      await shot(page, 'import-checks-summary', page.locator('.import-dialog'))
      await ctx.done()
    },
  }
}
