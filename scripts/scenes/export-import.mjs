// Escenas de exportar e importar una colección (luvin-architecture: app 0009): la revisión antes de
// guardar, el diálogo de importar con el archivo de Luvin y el aviso de los secretos que faltan.
// Con el ejemplo Pokédex, más un request con un token pegado (y una llave en un script) para que la
// revisión tenga qué mostrar, y un secreto en el ambiente.
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'

export default (ctx) => {
  const { ES, tmp, path, writeFileSync, freshPage, shot, settle, openPokedex, appHome } = ctx
  const L = ES
    ? { export: 'Exportar colección', save: 'Guardar…', last: 'Tu último workspace', imp: /Importar/, trust: 'Confiar', trustQ: '¿Confías en esta colección?', close: 'Cerrar' }
    : { export: 'Export collection', save: 'Save…', last: 'Your last workspace', imp: /Import/, trust: 'Trust', trustQ: 'Do you trust this collection?', close: 'Close' }
  const FILE = path.join(tmp, `Pokedex-${ES ? 'es' : 'en'}.luvin.json`)
  const JWT = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkb2NzIn0.ZmlybWEtZGUtcHJ1ZWJhLWRvY3MtbHV2aW4'

  /** La carpeta de la colección Pokédex en el workspace de ejemplo. */
  async function pokedexDir(page) {
    await page.locator('.app-ws-btn').click()
    const root = await page.locator('.app-ws-head [title]').getAttribute('title')
    await page.keyboard.press('Escape')
    return path.join(root, readdirSync(root, { withFileTypes: true }).find((e) => e.isDirectory() && existsSync(path.join(root, e.name, 'collection.yaml'))).name)
  }

  async function drop(page, name, text) {
    await page.evaluate(([name, text]) => {
      const dt = new DataTransfer()
      dt.items.add(new File([text], name, { type: 'application/json' }))
      const shell = document.querySelector('.ws-shell')
      for (const type of ['dragenter', 'dragover', 'drop']) shell.dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true }))
    }, [name, text])
  }

  return {
    async 'export-collection'() {
      const page = await freshPage()
      await openPokedex(page)
      const dir = await pokedexDir(page)
      const env = path.join(dir, 'environments', readdirSync(path.join(dir, 'environments'))[0])
      writeFileSync(env, `${readFileSync(env, 'utf8').trimEnd()}\nsecrets: [apiKey]\n`)
      mkdirSync(path.join(dir, 'requests'), { recursive: true })
      writeFileSync(
        path.join(dir, 'requests', 'my-trainer.request.yaml'),
        `version: 2\nname: ${ES ? 'Mi entrenador' : 'My trainer'}\nkind: http\nmethod: GET\nurl: https://pokeapi.co/api/v2/pokemon/25\nheaders:\n  - key: Authorization\n    value: Bearer ${JWT}\nscripts:\n  after: |-\n    pm.environment.set("gh", "ghp_docsExampleKey1234567890");\n`,
      )
      await page.reload()
      if (await page.locator('.welcome-dialog').isVisible({ timeout: 3000 }).catch(() => false)) await page.getByText(L.last).click()
      await page.locator('.tree-step').first().waitFor()
      // El request nuevo trae un script: se confía en la colección (es la nuestra).
      const trust = page.locator('[role="dialog"]', { hasText: L.trustQ })
      if (await trust.waitFor({ timeout: 4000 }).then(() => true, () => false)) await trust.getByRole('button', { name: L.trust, exact: true }).click()
      const row = page.locator('.tree-collection-row').first()
      await row.hover()
      await row.locator('.row-menu-btn').click()
      await page.locator('.row-menu-list button, .row-menu-list [role="menuitem"]', { hasText: L.export }).first().click()
      const dialog = page.locator('.export-dialog')
      await dialog.locator('.export-part.review').waitFor()
      await settle(page, 400)
      await shot(page, 'export-collection')
      // El archivo, para la escena de importar.
      writeFileSync(path.join(appHome(), 'next-save.txt'), FILE)
      await dialog.getByRole('button', { name: L.save }).click()
      await dialog.locator('.export-saved').waitFor()
    },

    async 'import-collection-luvin'() {
      if (!existsSync(FILE)) throw new Error('Falta el archivo: corre antes la escena export-collection')
      const page = await freshPage()
      await openPokedex(page)
      await drop(page, path.basename(FILE), readFileSync(FILE, 'utf8'))
      await page.locator('.import-dialog .import-luvin').waitFor()
      await settle(page, 400)
      await shot(page, 'import-luvin')
      await page.locator('.import-dialog').getByRole('button', { name: L.imp }).click()
      // Si pregunta por la confianza (scripts de la colección), se confía para ver el aviso de los secretos.
      const trust = page.locator('[role="dialog"]', { hasText: L.trustQ })
      if (await trust.waitFor({ timeout: 4000 }).then(() => true, () => false)) await trust.getByRole('button', { name: L.trust, exact: true }).click()
      await page.locator('.ws-missing-secrets').waitFor()
      await settle(page, 600)
      await shot(page, 'import-missing-secrets')
    },
  }
}
