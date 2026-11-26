// Escenas del «⋯» del lienzo (luvin-architecture: app 0008, ADRs 0011 y 0012): el menú abierto, con
// Disposición y Exportar, y Pokemon card en la disposición horizontal.
export default (ctx) => {
  const { ES, freshPage, shot, settle, tab, openPokedex } = ctx
  const L = ES ? { horizontal: 'Horizontal' } : { horizontal: 'Horizontal' }

  async function pokemonCard(page) {
    await openPokedex(page)
    await page.locator('[data-journey="pokemonCard"]').first().click()
    await tab(page, 'design').click()
    await page.locator('.builder .step-node').first().waitFor()
    await settle(page, 900)
  }

  return {
    async 'canvas-layout'() {
      const page = await freshPage()
      await pokemonCard(page)
      await page.locator('.gf-more').click()
      await page.locator('.context-menu .context-menu-group').first().waitFor()
      await shot(page, 'canvas-more-menu')
      await page.locator('.context-menu').getByRole('menuitem', { name: L.horizontal }).click()
      await settle(page, 1200)
      await shot(page, 'canvas-horizontal')
    },
  }
}
