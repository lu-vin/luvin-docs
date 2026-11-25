// Escenas de las variables y comprobaciones de un request (después de la respuesta, sin scripts):
// capturas request-vars*, request-checks y response-checks-*, en los dos idiomas.
// La importación de una colección de Postman con scripts está en scripts.mjs (import-scripts-summary).
// Los requests van a la API local de prueba de capture.mjs (la tienda "Shop").
export default (ctx) => {
  const { ES, T, API, freshPage, shot, settle, openShop } = ctx

  // Textos de la interfaz que las escenas buscan (los mismos de src/i18n/locales/{en,es}/ui.ts).
  const L = ES
    ? { vars: 'Variables', checks: 'Comprobaciones', addVar: 'Variable', addCheck: 'Comprobación', gt: 'es mayor que', home: 'Inicio' }
    : { vars: 'Variables', checks: 'Checks', addVar: 'Variable', addCheck: 'Check', gt: 'is greater than', home: 'Home' }

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
      // El cursor señala el resumen de las comprobaciones, junto al status.
      const chip = await page.locator('.rq-checks-chip').boundingBox()
      await page.mouse.move(chip.x + chip.width / 2, chip.y + chip.height / 2)
      await shot(page, 'response-checks-chip')
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
  }
}
