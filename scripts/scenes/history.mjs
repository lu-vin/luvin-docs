// Escenas del historial de la colección: capturas history-*.png, en los dos idiomas.
// Todo contra la API local de prueba de capture.mjs (la tienda "Shop"): unos requests, dos ejecuciones
// de workflows y una prueba de rendimiento corta (3 usuarios, 5 segundos), siempre en 127.0.0.1.
export default (ctx) => {
  const { ES, T, API, freshPage, shot, settle, tab, openShop, run } = ctx

  // Textos de la interfaz que las escenas buscan (los mismos de src/i18n/locales/{en,es}/ui.ts).
  const L = ES
    ? { runRequests: 'Ejecutar requests', performance: 'Rendimiento', seeAll: 'Ver todo', history: 'Historial', runs: 'Ejecuciones', requests: 'Requests', prefs: 'Preferencias', saveHistory: 'Guardar historial', stop: 'Detener' }
    : { runRequests: 'Run requests', performance: 'Performance', seeAll: 'See all', history: 'History', runs: 'Runs', requests: 'Requests', prefs: 'Preferences', saveHistory: 'Save history', stop: 'Stop' }

  /** Un request nuevo desde un cURL, enviado. */
  async function sendCurl(page, curl) {
    await page.locator('.tree-add', { hasText: T.newRequest }).click()
    await page.locator('.nr-dialog').waitFor()
    await page.locator('.nr-curl-btn[data-kind="curl"]').click()
    await page.locator('.nr-curl textarea').fill(curl)
    await page.locator('.nr-dialog').getByRole('button', { name: T.imp }).click()
    await page.locator('.rq').waitFor()
    await page.locator('.rq-send').click()
    await page.locator('.rq-status').waitFor({ timeout: 15000 })
    await settle(page, 500)
  }

  /** La tienda con actividad: requests enviados, dos ejecuciones y una prueba de rendimiento. */
  async function withActivity(page, { perf = true } = {}) {
    await openShop(page)
    await sendCurl(page, `curl '${API}/products' -H 'accept: application/json'`)
    await sendCurl(page, `curl '${API}/products/SKU-103' -H 'accept: application/json'`)
    await sendCurl(page, `curl -X POST '${API}/orders' -H 'content-type: application/json' --data '{"customer":"Ana","lines":[{"sku":"SKU-103","qty":2}]}'`)
    await page.locator('[data-journey="orderProducts"]').click()
    await tab(page, 'cases').click()
    await run(page)
    await page.locator('[data-journey="viewProduct"]').click()
    await tab(page, 'cases').click()
    await run(page)
    if (perf) await perfTest(page)
  }

  /** Una prueba de rendimiento corta de los requests GET, contra la API local. */
  async function perfTest(page) {
    await page.keyboard.press('Meta+k')
    await page.locator('.palette input').fill(L.runRequests)
    await page.locator('.palette-list [role="option"], .palette-list button', { hasText: L.runRequests }).first().click()
    await page.locator('.runner-setup').waitFor()
    // Solo los GET: el POST se saca de la lista.
    const post = page.locator('.runner-list li', { hasText: 'POST' }).locator('input[type="checkbox"]').first()
    if (await post.count()) await post.uncheck()
    await page.locator('.runner-radio', { hasText: L.performance }).click()
    // 3 usuarios durante 5 segundos (la unidad primero: por defecto viene en minutos).
    await page.locator('.perf-duration select').selectOption('s')
    const fields = page.locator('.load-fields input[type="number"]')
    await fields.nth(0).fill('3')
    await fields.nth(1).fill('5')
    await page.locator('.perf-think input').fill('200')
    await page.locator('.load-safety input[type="checkbox"]').check()
    await page.locator('.runner-start').click()
    await page.locator('.runner-results').waitFor()
    await settle(page, 2000)
    await page.waitForFunction((stop) => ![...document.querySelectorAll('.runner-results button')].some((b) => b.textContent.trim() === stop), L.stop, { timeout: 30000 })
    await settle(page, 1000)
  }

  /** Abre una entrada desde la lista del historial en la barra lateral. */
  async function openFromSidebar(page, name) {
    await page.locator('.tree-history .tree-history-row', { hasText: name }).first().click()
    await page.locator('.hist').waitFor()
    await settle(page, 1200)
  }

  return {
    async history() {
      const page = await freshPage()
      await withActivity(page)
      // El panel Historial de la barra lateral (un panel a la vez: se elige arriba, en sus iconos).
      await page.locator('.sb-rail-btn[data-panel="history"]').click()
      await page.locator('.tree-history').waitFor()
      await settle(page, 400)
      // La sección Historial de la barra lateral (el cursor, en un lugar vacío: sin tooltips del gráfico).
      await page.mouse.move(200, 760)
      await shot(page, 'history-sidebar')
      // Las entradas se abren desde ese mismo panel; al final se vuelve al de colecciones.
      await openFromSidebar(page, 'GET SKU-103')
      await shot(page, 'history-request')
      await openFromSidebar(page, 'View product')
      await shot(page, 'history-run')
      await openFromSidebar(page, 'Shop')
      await shot(page, 'history-perf')
      // Apagar el historial en Preferencias: la vista lo avisa.
      await page.getByRole('button', { name: L.prefs }).click()
      await page.locator('.prefs-modal').waitFor()
      await page.locator(`.prefs-modal [role="switch"][aria-label="${L.saveHistory}"]`).click()
      await settle(page, 600)
      await page.keyboard.press('Escape')
      await settle(page, 600)
      if (await page.locator('.prefs-modal').count()) await page.locator('.prefs-modal .icon-btn').first().click()
      await page.locator('.hist-off').waitFor()
      await openFromSidebar(page, 'POST orders')
      await shot(page, 'history-off')
      await page.locator('.sb-rail-btn[data-panel="collections"]').click()
      await ctx.done()
    },
  }
}
