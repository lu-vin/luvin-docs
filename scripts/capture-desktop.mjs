// Capturas de la app de escritorio (Electron): mock servers y preferencias de red, en inglés o español.
// Uso (desde luvin-docs):  node scripts/capture-desktop.mjs <en|es> <carpeta de salida> [escena…]
//                          node scripts/convert.mjs <carpeta de salida> public/media/<idioma>
// Necesita la app al lado (../luvin, o LUVIN_DIR=/ruta) con sus dependencias y su interfaz construida
// (npx vite build → dist/). Abre Electron con una carpeta de datos nueva y temporal (--user-data-dir):
// nunca toca los datos de la app instalada. Los workspaces también van a esa carpeta temporal.
// Sin red: el contrato de ejemplo apunta a api.example.com (nunca se llama) y el mock solo se llama
// en 127.0.0.1.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const [localeArg, outArg, ...only] = process.argv.slice(2)
const locale = localeArg === 'es' ? 'es' : 'en'
const ES = locale === 'es'
const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(process.env.LUVIN_DIR ?? path.join(here, '..', '..', 'luvin'))
if (!existsSync(path.join(root, 'node_modules', 'electron')) || !existsSync(path.join(root, 'dist', 'index.html'))) {
  console.error(`No encontré la app de Luvin con Electron y dist/ en ${root}. Instala sus dependencias y corre "npx vite build" ahí, o indica su ruta con LUVIN_DIR=…`)
  process.exit(1)
}
const appRequire = createRequire(path.join(root, 'package.json'))
const { _electron } = appRequire('playwright-core')
const electronBin = appRequire('electron')
const OUT = path.resolve(outArg ?? path.join(here, '..', '.media', `desktop-${locale}`))
mkdirSync(OUT, { recursive: true })
const VIEW = { width: 1280, height: 800 }

// Textos de la interfaz que se buscan (los mismos de src/i18n/locales/{en,es}/ui.ts).
const T = ES
  ? { createWs: 'Crear un workspace', createWsGo: 'Crear workspace', newCol: 'Nueva colección', create: 'Crear', importFiles: 'Importar Arazzo', prefs: 'Preferencias', proxyCustom: 'Usar un proxy propio', addCert: 'Agregar certificado' }
  : { createWs: 'Create a workspace', createWsGo: 'Create workspace', newCol: 'New collection', create: 'Create', importFiles: 'Import Arazzo', prefs: 'Preferences', proxyCustom: 'Use custom proxy', addCert: 'Add certificate' }

// --- Una tienda de ejemplo: contrato OpenAPI con ejemplos (también uno de 404) y un Arazzo que lo usa ---
const SHOP_OPENAPI = `openapi: 3.0.3
info: { title: Shop, version: 1.0.0 }
servers: [{ url: https://api.example.com/v1 }]
paths:
  /products:
    get:
      operationId: listProducts
      summary: List products
      responses:
        '200':
          description: The products
          content:
            application/json:
              example:
                total: 3
                items:
                  - { sku: SKU-101, name: Apple, price: 1.5, stock: 40 }
                  - { sku: SKU-102, name: Banana, price: 2.5, stock: 37 }
                  - { sku: SKU-103, name: Cherry, price: 3.5, stock: 34 }
  /products/{sku}:
    get:
      operationId: getProduct
      summary: Product detail
      parameters: [{ name: sku, in: path, required: true, schema: { type: string } }]
      responses:
        '200':
          description: The product
          content:
            application/json:
              example: { sku: SKU-102, name: Banana, price: 2.5, stock: 37 }
        '404':
          description: Product not found
          content:
            application/json:
              example: { error: not_found, message: The product does not exist }
  /orders:
    post:
      operationId: createOrder
      summary: Create an order
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                customer: { type: string }
                lines: { type: array, items: { type: object, properties: { sku: { type: string }, qty: { type: integer } } } }
      responses:
        '201':
          description: Order created
          content:
            application/json:
              example: { id: ord-1042, status: CREATED }
        '422':
          description: Not enough stock
          content:
            application/json:
              example: { error: out_of_stock, sku: SKU-103 }
`
const SHOP_ARAZZO = `arazzo: 1.0.1
info: { title: Shop, version: 1.0.0 }
sourceDescriptions: [{ name: shop, url: ./shop.openapi.yaml, type: openapi }]
workflows:
  - workflowId: orderProduct
    summary: Order a product
    steps:
      - stepId: listProducts
        operationId: listProducts
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          sku: $response.body#/items/0/sku
      - stepId: createOrder
        operationId: createOrder
        requestBody:
          contentType: application/json
          payload:
            customer: Ana
            lines: [{ sku: $steps.listProducts.outputs.sku, qty: 1 }]
        successCriteria: [{ condition: $statusCode == 201 }]
`

// --- Todo lo de esta corrida vive en una carpeta temporal nueva ---
const tmpRoot = mkdtempSync(path.join(os.tmpdir(), 'luvin-docs-desktop-'))
const userData = path.join(tmpRoot, 'user-data')
const wsParent = path.join(tmpRoot, 'workspaces')
const files = path.join(tmpRoot, 'files')
for (const d of [userData, wsParent, files]) mkdirSync(d, { recursive: true })
// Con una lista de workspaces ya creada, la app no trae la de Arazzo Studio (su nombre anterior).
writeFileSync(path.join(userData, 'workspaces.json'), JSON.stringify({ roots: [] }))
writeFileSync(path.join(files, 'shop.openapi.yaml'), SHOP_OPENAPI)
writeFileSync(path.join(files, 'shop.arazzo.yaml'), SHOP_ARAZZO)

/** Un puerto libre en 127.0.0.1 a partir de `from` (el mock propone 4010). */
async function freePort(from) {
  for (let port = from; port < from + 50; port++) {
    const ok = await new Promise((done) => {
      const s = net.createServer()
      s.once('error', () => done(false))
      s.listen(port, '127.0.0.1', () => s.close(() => done(true)))
    })
    if (ok) return port
  }
  throw new Error('sin puertos libres')
}

const env = { ...process.env }
for (const k of Object.keys(env)) if (k === 'ELECTRON_RUN_AS_NODE' || k === 'LUVIN_DEV_URL' || /^(https?|all|no)_proxy$/i.test(k)) delete env[k]
const electronApp = await _electron.launch({
  executablePath: electronBin,
  // --use-mock-keychain: los secretos no tocan el llavero del sistema.
  args: [`--user-data-dir=${userData}`, '--use-mock-keychain', '--force-device-scale-factor=2', root],
  cwd: root,
  env,
})
// Antes de cualquier otra cosa: la app tiene que estar usando la carpeta temporal, no la real.
const usedData = await electronApp.evaluate(({ app }) => app.getPath('userData'))
if (!existsSync(usedData) || realpathSync(usedData) !== realpathSync(userData)) {
  electronApp.process().kill('SIGKILL')
  console.error(`ABORTADO: la app usa ${usedData} y no la carpeta temporal ${userData}.`)
  process.exit(2)
}
console.log(`Capturas de escritorio (${locale}) → ${OUT}`)

// Los workspaces nuevos se proponen dentro de la carpeta temporal (no en Documentos/Luvin).
await electronApp.evaluate(({ ipcMain }, dir) => {
  ipcMain.removeHandler('ws:defaultLocation')
  ipcMain.handle('ws:defaultLocation', () => dir)
}, wsParent)

const page = await electronApp.firstWindow()
page.on('pageerror', (e) => console.log('  PAGEERROR', String(e).slice(0, 200)))
await page.waitForLoadState('domcontentloaded')
await electronApp.evaluate(({ BrowserWindow }, v) => {
  const w = BrowserWindow.getAllWindows()[0]
  w.setContentSize(v.width, v.height)
  w.center()
}, VIEW)
// Idioma, tema y perfil como en scripts/capture.mjs.
await page.evaluate(
  ([loc, th]) => {
    localStorage.clear()
    localStorage.setItem('luvin.locale', loc)
    localStorage.setItem('theme', th)
    localStorage.setItem('tourHint.dismissed', '1')
    localStorage.setItem('profile', JSON.stringify({ role: 'developer', purposes: ['journeys'] }))
  },
  [locale, 'light'],
)
await page.reload()
await page.waitForLoadState('domcontentloaded')
const size = await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio])
console.log(`  ventana ${size[0]}×${size[1]} @${size[2]}x`)

const settle = (ms = 600) => page.waitForTimeout(ms)
/**
 * Captura la ventana entera de la app. Las capturas de las docs siempre muestran la ventana completa:
 * `target` solo se lleva a la vista antes de capturar.
 */
async function shot(name, target) {
  if (target) await target.first().scrollIntoViewIfNeeded().catch(() => {})
  await settle()
  await page.screenshot({ path: path.join(OUT, `${name}.png`) })
  console.log(`  ✓ ${name}`)
}

/** Un workspace en la carpeta temporal con la colección "Shop" (contrato + Arazzo). */
async function openShop() {
  await page.locator('.welcome-dialog').waitFor()
  await page.locator('.wd-card', { hasText: T.createWs }).click()
  await page.locator('.wd-form input').first().fill('Demo')
  await page.getByRole('button', { name: T.createWsGo }).click()
  await page.locator('.home').waitFor()
  // Seguridad: el workspace quedó dentro de la carpeta temporal.
  const roots = JSON.parse(readFileSync(path.join(userData, 'workspaces.json'), 'utf8')).roots ?? []
  if (!roots.length || roots.some((r) => !path.resolve(r).startsWith(path.resolve(wsParent)))) throw new Error(`workspace fuera de la carpeta temporal: ${roots.join(', ')}`)
  await page.locator('.home-action', { hasText: T.newCol }).click()
  await page.locator('.home-new input').fill('Shop')
  await page.locator('.home-new').getByRole('button', { name: T.create }).click()
  await page.locator('.tree-collection.current', { hasText: 'Shop' }).waitFor()
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.home-action', { hasText: T.importFiles }).click()])
  await chooser.setFiles([path.join(files, 'shop.arazzo.yaml'), path.join(files, 'shop.openapi.yaml')])
  await page.locator('.tree-step').first().waitFor()
  await settle(900)
}

/** Muestra un panel de la barra lateral con su ícono de arriba (collections, envs, history o mocks). */
async function sidebarPanel(name) {
  await page.locator(`.sb-rail-btn[data-panel="${name}"]`).click()
  await settle(300)
}
/** El panel "Mock servers" de la barra lateral (se abre con su ícono). */
async function mocksSection() {
  await sidebarPanel('mocks')
  return page.locator('.tree-section').filter({ has: page.locator('.tree-mocks') })
}
let port

const scenes = {
  async mocks() {
    await openShop()
    // Crear un mock: nombre y de dónde salen sus respuestas (el contrato).
    await (await mocksSection()).locator('.tree-head .icon-btn').click()
    const dialog = page.locator('.rq-dialog').filter({ has: page.locator('.mock-new') })
    await dialog.waitFor()
    await dialog.locator('.mock-new-source').nth(1).click()
    await page.mouse.move(5, 5)
    await shot('mocks-new-dialog', dialog)
    await dialog.locator('button[type="submit"]').click()
    await page.locator('.mock').waitFor()
    // El puerto propuesto (4010), o el siguiente libre si otro programa lo usa.
    port = await freePort(4010)
    const portInput = page.locator('.mock-settings .rq-field').first().locator('input')
    if (Number(await portInput.inputValue()) !== port) {
      await portInput.fill(String(port))
      await portInput.press('Enter')
    }
    await page.locator('.mock-head button.primary').click()
    await page.locator('.mock-url').waitFor({ timeout: 10000 })
    if (!(await page.locator('.mock-url').innerText()).startsWith('http://127.0.0.1:')) throw new Error('el mock no está en 127.0.0.1')
    await page.mouse.move(5, 5)
    await shot('mocks-running')

    // Una respuesta alternativa (el 404 del contrato) se pide con x-mock-response-code.
    const sourceGroup = page.locator('.mock-group').nth(1)
    await shot('mocks-alt-response', sourceGroup)

    // Una ruta propia, con valores del request en la respuesta.
    await page.locator('.mock-group').first().locator('.mock-group-head button').click()
    const edit = page.locator('.mock-edit')
    await edit.waitFor()
    await edit.locator('.mock-edit-row input').first().fill('/v1/promotions')
    await edit.locator(':scope > label.rq-field input').first().fill(ES ? 'Promociones de la semana' : 'Weekly promotions')
    const cm = edit.locator('.cm-content')
    await cm.click()
    await page.keyboard.press('Meta+a')
    await page.keyboard.insertText('{\n  "page": "{{request.query.page}}",\n  "items": [{ "sku": "SKU-101", "discount": 15 }]\n}')
    await page.locator('.mock-own .mock-route-main').first().hover()
    await settle(400)
    await page.mouse.move(5, 5)
    await shot('mocks-own-route', page.locator('.mock-group').first())

    // El menú ⋯ del mock en la barra lateral.
    const row = page.locator('.tree-mock-row').first()
    await row.scrollIntoViewIfNeeded()
    await row.hover()
    await row.locator('.row-menu-btn').click()
    await settle(300)
    // Se ven los íconos de los paneles (el de mocks con su punto verde) y el menú abierto.
    await shot('mocks-sidebar-menu')
    await page.keyboard.press('Escape')
    await page.mouse.click(VIEW.width - 40, VIEW.height - 120)
    await settle(300)

    // Llamadas al mock (solo 127.0.0.1) y su log.
    const base = `http://127.0.0.1:${port}`
    const call = (p, init = {}) => fetch(`${base}${p}`, init).then((r) => r.text())
    await call('/v1/products')
    await call('/v1/products/SKU-102')
    await call('/v1/products/SKU-999', { headers: { 'x-mock-response-code': '404' } })
    await call('/v1/promotions?page=2')
    await call('/v1/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customer: 'Ana', lines: [{ sku: 'SKU-102', qty: 2 }] }) })
    await call('/v1/customers')
    await settle(800)
    await page.locator('.mock-tabs [role="tab"]').nth(1).click()
    await page.locator('.mock-log-row').first().waitFor()
    await page.locator('.mock-log-row').filter({ hasText: '/v1/orders' }).first().click()
    await page.mouse.move(5, 5)
    await shot('mocks-log')

    // Un ambiente que apunta al mock: se crea desde el mock y queda activo.
    // Se ve en la pastilla del ambiente (arriba a la derecha) y en el panel de ambientes.
    await page.locator('.mock-env button').click()
    await settle(800)
    await sidebarPanel('envs')
    await page.locator('.tree-list li.active .link.small').first().click()
    await page.locator('.ws-view .field-grid').first().waitFor()
    await page.mouse.move(5, 5)
    await shot('mocks-env')
  },

  async prefs() {
    if (!(await page.locator('.home, .ws-home-tab, .tree-collection').count())) await openShop()
    await page.getByRole('button', { name: T.prefs }).first().click()
    const modal = page.locator('.prefs-modal')
    await modal.waitFor()
    await page.mouse.move(5, 5)
    await shot('preferences')
    // General: el resto de la sección (requests, aplicación, workspaces, historial).
    await page.locator('.prefs-body').evaluate((el) => el.scrollTo(0, el.scrollHeight))
    await shot('prefs-general', modal)
    // Certificados: el formulario para agregar uno, con un host de ejemplo.
    await page.locator('.prefs-nav button').nth(3).click()
    await page.locator('.prefs-body button', { hasText: T.addCert }).first().click()
    await page.locator('.prefs-form').waitFor()
    await page.locator('.prefs-form .prefs-host input').first().fill('api.example.com')
    await page.locator('.prefs-form .prefs-host input.prefs-port').fill('443')
    await page.locator('.prefs-form h4').click()
    await shot('prefs-certificates', modal)
    await page.locator('.prefs-form .prefs-actions button').nth(1).click()
    // Proxy: uno propio, ficticio.
    await page.locator('.prefs-nav button').nth(4).click()
    await page.locator(`.prefs-body .switch[aria-label="${T.proxyCustom}"]`).click()
    const host = page.locator('.prefs-sub .prefs-host input').first()
    await host.waitFor()
    await host.fill('proxy.example.internal')
    await host.press('Enter')
    await page.locator('.prefs-body-head h2').click()
    await settle(800)
    await page.locator('.prefs-body').evaluate((el) => el.scrollTo(0, 0))
    await shot('prefs-proxy', modal)
    await page.keyboard.press('Escape')
  },
}

try {
  for (const [name, scene] of Object.entries(scenes)) {
    if (only.length && !only.includes(name)) continue
    try {
      await scene()
    } catch (e) {
      console.log(`  ✕ escena ${name}: ${String(e.message ?? e).split('\n')[0]}`)
      await page.screenshot({ path: path.join(OUT, `_fail-${name}.png`) }).catch(() => {})
    }
  }
} finally {
  await electronApp.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().forEach((w) => w.destroy())).catch(() => {})
  await electronApp.close().catch(() => electronApp.process().kill())
  rmSync(tmpRoot, { recursive: true, force: true })
}
