// El menú de métodos del request: cada uno con su color y, al final, «Escribe otro método» (QUERY…).
export default (ctx) => {
  const { ES, T, freshPage, shot, settle, openPokedex } = ctx
  return {
    async 'request-methods'() {
      const page = await freshPage()
      await openPokedex(page)
      await page.locator('.tree-add', { hasText: T.newRequest }).click()
      await page.locator('.nr-card[data-kind="http"]').click()
      await page.locator('.rq-url').fill('https://pokeapi.co/api/v2/pokemon/pikachu')
      await page.locator('.rq-method').click()
      await page.locator('.method-list').waitFor()
      await page.locator('.method-list .mp-custom input').fill(ES ? 'query' : 'query')
      await settle(page, 400)
      await shot(page, 'request-methods')
    },
  }
}
