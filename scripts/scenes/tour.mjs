// Escenas del tour guiado (por secciones, los workflows primero) y del buscador ⌘K con sus acciones.
// tour-new rehace la captura "tour" (la clave `tour` de capture.mjs es la del tour anterior, de una tira).
export default (ctx) => {
  const { ES, freshPage, shot, settle, openPokedex } = ctx
  const L = (es, en) => (ES ? es : en)

  /** Abre el tour desde la bienvenida: empieza en la sección Workflows. */
  async function startTour(page) {
    await page.locator('.welcome-dialog').waitFor()
    await page.locator('.wd-card', { hasText: L('Tour guiado', 'Guided tour') }).click()
    await page.locator('.tour-card').waitFor()
    await page.locator('[data-journey="pokemonCard"]').waitFor({ timeout: 20000 })
    await page.locator('.tour-card button.primary:not([disabled])').waitFor({ timeout: 20000 })
    await settle(page, 600)
  }
  /** "Siguiente" en la tarjeta del tour; si una ejecución contra la PokéAPI pregunta por una lista, sigue con lo propuesto. */
  async function next(page) {
    const before = await page.locator('.tour-progress span').first().textContent()
    // Un paso que ejecuta contra la PokéAPI deja el botón deshabilitado un rato («Preparando…»).
    await page.locator('.tour-card button.primary').click({ timeout: 90000 })
    for (let i = 0; i < 150; i++) {
      await settle(page, 300)
      const pick = page.locator('.lp-dialog button.primary')
      if (await pick.count()) {
        // El diálogo puede estar cerrándose: si ya no se deja hacer clic, se sigue esperando.
        await pick.click({ timeout: 3000 }).catch(() => {})
        continue
      }
      const now = await page.locator('.tour-progress span').first().textContent()
      const ready = await page.locator('.tour-card button.primary:not([disabled])').count()
      const busy = await page.locator('.tour-card', { hasText: L('Preparando', 'Getting ready') }).count()
      if (now !== before && ready && !busy) break
    }
    await settle(page, 900)
  }

  const scenes = {}

  scenes['tour-new'] = async () => {
    const page = await freshPage()
    await startTour(page)
    // Paso 2 de la sección: la barra lateral con colecciones, workflows y pasos.
    await next(page)
    await page.locator('.tour-spot').waitFor({ timeout: 20000 })
    await shot(page, 'tour')
    // Hasta el final de la sección: la siguiente, todas las secciones o terminar.
    for (let i = 0; i < 5; i++) await next(page)
    await page.locator('.tour-actions', { hasText: L('Ver las secciones', 'All sections') }).waitFor({ timeout: 30000 })
    await shot(page, 'tour-section-end')
    // Todas las secciones: Workflows queda marcada como vista.
    await page.locator('.tour-actions button', { hasText: L('Ver las secciones', 'All sections') }).click()
    await page.locator('.tour-sections').waitFor()
    await shot(page, 'tour-sections')
    await ctx.done()
  }

  scenes['search-actions'] = async () => {
    const page = await freshPage()
    await openPokedex(page)
    await page.locator('[data-journey="pokemonCard"]').click()
    await settle(page, 600)
    await page.keyboard.press('Meta+k')
    await page.locator('.palette input').waitFor()
    await shot(page, 'search-actions')
    await ctx.done()
  }

  return scenes
}
