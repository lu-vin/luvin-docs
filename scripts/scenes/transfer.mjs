// Escenas de pasar requests y workflows a otra colección (luvin-architecture: app 0010): el árbol con la
// colección como cubo, WORKFLOWS y REQUESTS y los pasos numerados; el menú «Copiar a otra colección ▸»
// con su submenú, y el diálogo con lo que va, lo que se queda y lo que hay que revisar.
export default (ctx) => {
  const { ES, T, API, freshPage, shot, settle, openShop, done } = ctx
  const L = ES ? { copy: 'Copiar a otra colección', target: 'Partners' } : { copy: 'Copy to another collection', target: 'Partners' }

  return {
    async transfer() {
      const page = await freshPage()
      await openShop(page)
      // Un request en «Shop», importado de un cURL, para que la sección REQUESTS tenga algo.
      await page.locator('.tree-add', { hasText: T.newRequest }).click()
      await page.locator('.nr-dialog').waitFor()
      await page.locator('.nr-curl-btn[data-kind="curl"]').click()
      await page.locator('.nr-curl textarea').fill(`curl '${API}/products'`)
      await page.locator('.nr-dialog').getByRole('button', { name: T.imp }).click()
      await page.locator('.rq').waitFor()
      // Otra colección en el workspace: «Partners».
      await page.locator('.ws-home-tab button').first().click()
      await page.locator('.home-action', { hasText: T.newCol }).click()
      await page.locator('.home-new input').fill(L.target)
      await page.locator('.home-new').getByRole('button', { name: T.create }).click()
      await page.locator('.tree-collection.current', { hasText: L.target }).waitFor()
      // De vuelta en «Shop», con un workflow desplegado.
      await page.locator('.tree-collection', { hasText: 'Shop' }).locator('xpath=..').locator('.tree-twisty').click()
      await page.locator('.tree-step').first().waitFor()
      await page.mouse.move(900, 500)
      await settle(page, 600)
      await shot(page, 'sidebar-tree')
      // El menú del archivo Arazzo, con el submenú de las colecciones.
      const file = page.locator('.tree-file').first()
      await file.hover()
      await file.locator('xpath=..').locator('.row-menu-btn').click()
      await page.locator('[role="menuitem"]', { hasText: L.copy }).click()
      await page.locator('.row-menu-sub').waitFor()
      await settle(page, 300)
      await shot(page, 'transfer-menu')
      // El diálogo, antes de confirmar.
      await page.locator('.row-menu-sub [role="menuitem"]', { hasText: L.target }).click()
      await page.locator('.transfer-dialog .export-part.goes').waitFor()
      await settle(page, 400)
      await shot(page, 'transfer-dialog')
      await page.keyboard.press('Escape')
      await done()
    },
  }
}
