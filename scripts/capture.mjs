// Capturas y videos de la app para esta documentación, recorriendo Luvin como una persona.
// Uso (desde luvin-docs):  npm run media              → inglés y español, y los convierte
//                          node scripts/capture.mjs <en|es> <carpeta de salida> [escena…]
// Las escenas están al final de este archivo y en scripts/scenes/*.mjs (una por tema: diseño, pruebas…).
// Necesita el repositorio de la app al lado (../luvin, o LUVIN_DIR=/ruta) con sus dependencias
// instaladas y su interfaz compilada (npm run build, allá). Abre la app de escritorio (Electron, con
// luvin/e2e/desktop.mjs), limpia en cada escena: nunca toca los datos de la app instalada. Usa los
// ejemplos incluidos, la PokéAPI real y una API local de prueba.
// luvin-architecture: app-architecture/0002 (ADR 0004).
import { existsSync, mkdirSync, readdirSync, renameSync, writeFileSync } from 'node:fs'
import { createServer as createHttp } from 'node:http'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const [localeArg, outArg, ...only] = process.argv.slice(2)
const locale = localeArg === 'es' ? 'es' : 'en'
const ES = locale === 'es'
const here = path.dirname(fileURLToPath(import.meta.url))
// La app: Electron, Playwright y el arranque de la app de escritorio se toman de su repositorio.
const root = path.resolve(process.env.LUVIN_DIR ?? path.join(here, '..', '..', 'luvin'))
if (!existsSync(path.join(root, 'node_modules', 'electron'))) {
  console.error(`No encontré la app de Luvin con sus dependencias en ${root}. Indica su ruta con LUVIN_DIR=…`)
  process.exit(1)
}
const { openApp, requireBuild, noMacWindowButtonsGap, hideScrollbars } = await import(pathToFileURL(path.join(root, 'e2e', 'desktop.mjs')).href)
requireBuild()
const OUT = path.resolve(outArg ?? path.join(here, '..', '.media', locale))
mkdirSync(OUT, { recursive: true })
const T = ES
  ? { createWs: 'Crear un workspace', createWsGo: 'Crear workspace', newCol: 'Nueva colección', create: 'Crear', importFiles: 'Importar Arazzo', newRequest: 'Nuevo request', imp: 'Importar', prefs: 'Preferencias', more: 'Ver más ejemplos', importPm: 'Importar colección', runAnyway: 'Ejecutar igual', report: 'Reporte', del: 'Eliminar contrato' }
  : { createWs: 'Create a workspace', createWsGo: 'Create workspace', newCol: 'New collection', create: 'Create', importFiles: 'Import Arazzo', newRequest: 'New request', imp: 'Import', prefs: 'Preferences', more: 'See more examples', importPm: 'Import collection', runAnyway: 'Run anyway', report: 'Report', del: 'Delete contract' }

// --- API local de prueba (una tienda) ---
const NAMES = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew', 'Kiwi', 'Lemon']
const PRODUCTS = NAMES.map((name, i) => ({ sku: `SKU-${100 + i}`, name, price: 1.5 + i, stock: 40 - i * 3, category: ['fruit', 'berry', 'citrus'][i % 3] }))
const api = createHttp((req, res) => {
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' }
  if (req.method === 'OPTIONS') return res.writeHead(204, cors).end()
  const json = (status, body) => res.writeHead(status, { ...cors, 'content-type': 'application/json' }).end(JSON.stringify(body))
  const url = req.url.split('?')[0]
  if (req.method === 'GET' && url === '/products') return json(200, { total: PRODUCTS.length, items: PRODUCTS })
  if (req.method === 'GET' && url.startsWith('/products/')) return json(200, PRODUCTS.find((p) => url.endsWith(p.sku)) ?? { sku: 'unknown' })
  return json(201, { id: 'ord-1042', status: 'CREATED' })
})
// Un puerto libre cualquiera.
await new Promise((ok) => api.listen(0, '127.0.0.1', ok))
const API = `http://127.0.0.1:${api.address().port}`
const SHOP_OPENAPI = `openapi: 3.0.3
info: { title: Shop, version: 1.0.0 }
servers: [{ url: ${API} }]
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
              schema:
                type: object
                properties:
                  total: { type: integer }
                  items:
                    type: array
                    items:
                      type: object
                      properties: { sku: { type: string }, name: { type: string }, price: { type: number }, stock: { type: integer }, category: { type: string } }
  /products/{sku}:
    get:
      operationId: getProduct
      summary: Product detail
      parameters: [{ name: sku, in: path, required: true, schema: { type: string } }]
      responses: { '200': { description: The product } }
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
      responses: { '201': { description: Created } }
`
const SHOP_ARAZZO = `arazzo: 1.0.1
info: { title: Shop, version: 1.0.0 }
sourceDescriptions: [{ name: shop, url: ./shop.openapi.yaml, type: openapi }]
workflows:
  - workflowId: viewProduct
    summary: View a product
    steps:
      - stepId: listProducts
        operationId: listProducts
        successCriteria: [{ condition: $statusCode == 200 }]
        outputs:
          sku: $response.body#/items/0/sku
      - stepId: getProduct
        operationId: getProduct
        parameters: [{ name: sku, in: path, value: $steps.listProducts.outputs.sku }]
        successCriteria: [{ condition: $statusCode == 200 }]
  - workflowId: orderProducts
    summary: Order products
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
const tmp = path.join(OUT, '_files')
mkdirSync(tmp, { recursive: true })
writeFileSync(path.join(tmp, 'shop.openapi.yaml'), SHOP_OPENAPI)
writeFileSync(path.join(tmp, 'shop.arazzo.yaml'), SHOP_ARAZZO)

const VIEW = { width: 1280, height: 800 }

// Lo que la app "descarga" (reporte HTML o JSON, casos exportados) se queda en la página: la app
// descarga con un <a download> y un blob (lib/browser.ts), y aquí se guarda el blob en vez de dejarlo
// llegar al sistema (que abriría un diálogo de guardar). Corre antes que la app.
function catchDownloads() {
  const blobs = new Map()
  window.__downloads = []
  const create = URL.createObjectURL
  URL.createObjectURL = (blob) => {
    const url = create.call(URL, blob)
    blobs.set(url, blob)
    return url
  }
  const click = HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click = function () {
    if (this.download && blobs.has(this.href)) {
      window.__downloads.push({ name: this.download, blob: blobs.get(this.href) })
      return
    }
    return click.call(this)
  }
}

// En los videos se ve un cursor y una leyenda con lo que se está haciendo (la grabación no trae cursor).
function videoOverlay() {
  const setup = () => {
    if (document.getElementById('demo-cursor')) return
    const style = document.createElement('style')
    style.textContent = `
      #demo-cursor { position: fixed; left: 0; top: 0; z-index: 2147483647; width: 22px; height: 22px; pointer-events: none; transform: translate(-200px, -200px); }
      #demo-ring { position: fixed; left: 0; top: 0; z-index: 2147483646; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%; border: 3px solid #2f8f3f; pointer-events: none; opacity: 0; }
      #demo-ring.on { animation: demo-ring 0.45s ease-out; }
      @keyframes demo-ring { from { opacity: 0.9; transform: scale(0.4); } to { opacity: 0; transform: scale(1.5); } }
      #demo-caption { position: fixed; left: 50%; bottom: 34px; z-index: 2147483645; transform: translateX(-50%); max-width: 78%; padding: 11px 20px; border-radius: 12px; background: rgba(15, 27, 20, 0.94); color: #fff; font: 600 17px/1.35 Inter, system-ui, sans-serif; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,.35); pointer-events: none; opacity: 0; transition: opacity .25s; }
      #demo-caption.on { opacity: 1; }
    `
    document.documentElement.append(style)
    const cursor = document.createElement('div')
    cursor.id = 'demo-cursor'
    cursor.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2l15 9-6.5 1.8L9.2 19.5z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    const ring = document.createElement('div')
    ring.id = 'demo-ring'
    const caption = document.createElement('div')
    caption.id = 'demo-caption'
    document.documentElement.append(ring, cursor, caption)
    window.addEventListener('mousemove', (e) => { cursor.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 2}px)`; ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px' }, true)
    window.addEventListener('mousedown', () => { ring.classList.remove('on'); void ring.offsetWidth; ring.classList.add('on') }, true)
    window.__caption = (text) => { caption.textContent = text; caption.classList.toggle('on', !!text) }
  }
  if (document.documentElement) setup()
  else document.addEventListener('DOMContentLoaded', setup)
}

let current // La app abierta (openApp): { page, context, close… }. Una por escena.
const meta = new WeakMap() // page → { cdp, size, scale, rec, t0 }
let recordings = 0

/**
 * La app de escritorio recién abierta, limpia, en el idioma y el tema pedidos: el rol ya elegido, el
 * aviso del tour cerrado. Con `video`, graba la pantalla desde el principio (la grabación empieza al
 * resolverse). La página mide `size` px CSS, a 2x para capturas y a 1x para videos.
 */
async function freshPage({ theme = 'light', video, size = VIEW } = {}) {
  if (current) await done()
  const scale = video ? 1 : 2
  current = await openApp({
    lang: ES ? 'es-CL' : 'en-US',
    width: size.width,
    height: size.height,
    scale,
    colorScheme: theme,
    storage: { 'luvin.locale': locale, theme, 'tourHint.dismissed': '1', profile: JSON.stringify({ role: 'developer', purposes: ['journeys'] }) },
    // Sin el espacio vacío de los botones de la ventana de Mac (no salen en la captura) ni barras de scroll.
    initScripts: [noMacWindowButtonsGap, hideScrollbars, catchDownloads, ...(video ? [videoOverlay] : [])],
    onPageError: (e) => console.log('  PAGEERROR', String(e).slice(0, 200)),
  })
  const page = current.page
  // La sesión CDP que fijó el tamaño y la densidad: por ella van los cambios de tamaño y las capturas.
  const m = { cdp: current.cdp, size: { ...size }, scale }
  if (video) {
    m.rec = path.join(OUT, `_rec-${++recordings}.webm`)
    await page.screencast.start({ path: m.rec, size: { ...size } })
    m.t0 = Date.now()
  }
  meta.set(page, m)
  return page
}
/** Cierra la app abierta (y borra su carpeta temporal). Cada escena termina así. */
async function done() {
  const app = current
  current = undefined
  await app?.close()
}
/** El tamaño de la página, en px CSS. */
const viewport = (page) => meta.get(page).size
/** Cambia el tamaño de la página (como agrandar la ventana), sin cambiar la densidad de píxeles. */
async function resize(page, width, height) {
  const m = meta.get(page)
  await m.cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: m.scale, mobile: false })
  m.size = { width, height }
  await page.waitForTimeout(250)
}
/**
 * Captura la ventana entera de la app, en píxeles reales (2x en las capturas). Las capturas y los videos
 * de las docs siempre muestran la ventana completa: si una escena pasa una zona, se ignora.
 */
async function capture(page, file, _box) {
  const m = meta.get(page)
  const { data } = await m.cdp.send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(file, Buffer.from(data, 'base64'))
}
/** Hace `action` (que descarga algo en la app) y guarda lo descargado en `file`. Devuelve la ruta. */
async function download(page, action, file) {
  const before = await page.evaluate(() => window.__downloads.length)
  await action()
  await page.waitForFunction((n) => window.__downloads.length > n, before, { timeout: 10000 })
  writeFileSync(file, await page.evaluate(() => window.__downloads.at(-1).blob.text()))
  return file
}
/** Muestra un archivo local (un reporte) en la ventana de la app. Solo al final de una escena: la app se va. */
const showFile = (page, file) => page.goto(pathToFileURL(file).href)

// --- Videos: mover el cursor como una persona, hacer clic y poner leyendas ---
let at = { x: 640, y: 420 }
async function moveTo(page, x, y) {
  const d = Math.hypot(x - at.x, y - at.y)
  const n = Math.max(12, Math.min(46, Math.round(d / 14)))
  for (let i = 1; i <= n; i++) {
    const k = i / n
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2 // acelera y frena
    await page.mouse.move(at.x + (x - at.x) * e, at.y + (y - at.y) * e)
    await page.waitForTimeout(13)
  }
  at = { x, y }
}
/** Lleva el cursor a un elemento y hace clic (o solo lo señala). */
async function go(page, locator, { click = true, pause = 700, dx = 0, dy = 0 } = {}) {
  await locator.first().scrollIntoViewIfNeeded().catch(() => {})
  const b = await locator.first().boundingBox()
  if (!b) throw new Error('no se ve el elemento para el video')
  await moveTo(page, b.x + b.width / 2 + dx, b.y + b.height / 2 + dy)
  await page.waitForTimeout(260)
  if (click) {
    // Una lista nativa (<select>) abriría el menú del sistema, que tapa la ventana y no sale en el
    // video: se marca el clic (el anillo) sin abrirla; la opción se elige aparte.
    if (await locator.first().evaluate((el) => el.tagName === 'SELECT').catch(() => false)) {
      await page.evaluate(() => window.dispatchEvent(new MouseEvent('mousedown')))
    } else {
      await page.mouse.down()
      await page.waitForTimeout(80)
      await page.mouse.up()
    }
  }
  await page.waitForTimeout(pause)
}
const say = (page, text, ms = 900) => page.evaluate((x) => window.__caption?.(x), text).then(() => page.waitForTimeout(ms))
/**
 * Termina la grabación, la deja con su nombre y cierra la app. `from`: el momento desde el que va el
 * video (lo anterior es preparación); lo que pasó antes de que empezara la grabación no cuenta.
 */
async function saveClip(page, name, _started, from = 0) {
  const m = meta.get(page)
  await page.screencast.stop()
  renameSync(m.rec, path.join(OUT, `${name}.webm`))
  writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify({ skip: Math.max(0, from - m.t0) / 1000 }))
  await done()
  console.log(`  ✓ ${name} (video)`)
}
const V = path.join(OUT, '_video')
const C = ES
  ? {
      qs1: 'Abre el ejemplo: una Pokédex contra la PokéAPI real', qs2: 'Abre un workflow: cada paso es una llamada a la API', qs3: 'Sus casos ya están generados', qs4: 'Ejecuta contra la API real', qs5: 'Un paso devolvió una lista: confirma con qué elemento sigue', qs6: 'Cada caso termina con un veredicto', qs7: 'Abre un paso para ver su request y su respuesta',
      d1: 'Crea un workflow nuevo', d2: 'Agrega operaciones desde la paleta', d3: 'Luvin conecta los datos: el segundo paso recibe el id del primero', d4: 'Lo que nadie entrega se vuelve un input del workflow', d5: 'Todo queda escrito en un archivo Arazzo estándar',
      r1: 'Elige Simulación: responde con los ejemplos del contrato', r2: 'Ejecuta los casos', r3: 'Cada caso termina con un veredicto y su razón', r4: 'Este caso espera un error 404, y lo obtiene', r5: 'Abre el paso para ver lo que respondió',
      l1: 'Ejecuta el caso', l2: 'El paso devolvió 10 productos: elige con cuál probar', l3: 'Las columnas marcadas «se usa» pasan al paso siguiente', l4: 'Continúa con el elemento elegido', l5: 'El paso deja anotado lo que elegiste', l6: 'El siguiente paso usó ese producto',
      c1: 'Crea un request', c2: 'Pega un cURL', c3: 'Luvin convierte método, URL y cabeceras', c4: 'Envía el request', c5: 'Lee la respuesta',
      e1: 'Abre el ambiente activo', e2: 'Crea otro ambiente: empieza como copia del activo', e3: 'Cambia lo que difiere, por ejemplo la URL base', e4: 'Elige con qué ambiente ejecutas, arriba a la derecha',
    }
  : {
      qs1: 'Open the example: a Pokédex against the real PokéAPI', qs2: 'Open a workflow: each step is an API call', qs3: 'Its cases are already generated', qs4: 'Run against the real API', qs5: 'A step returned a list: confirm which item it continues with', qs6: 'Every case ends with a verdict', qs7: 'Open a step to see its request and response',
      d1: 'Create a new workflow', d2: 'Add operations from the palette', d3: 'Luvin wires the data: the second step receives the id of the first', d4: 'What nobody provides becomes an input of the workflow', d5: 'Everything is written to a standard Arazzo file',
      r1: 'Choose Simulation: it answers from the contract examples', r2: 'Run the cases', r3: 'Every case ends with a verdict and its reason', r4: 'This case expects a 404 error, and gets it', r5: 'Open the step to see what it answered',
      l1: 'Run the case', l2: 'The step returned 10 products: choose which one to test with', l3: 'The columns marked "used" go to the next step', l4: 'Continue with the chosen item', l5: 'The step records what you chose', l6: 'The next step used that product',
      c1: 'Create a request', c2: 'Paste a cURL', c3: 'Luvin converts the method, URL and headers', c4: 'Send the request', c5: 'Read the response',
      e1: 'Open the active environment', e2: 'Create another environment: it starts as a copy of the active one', e3: 'Change what differs, for example the base URL', e4: 'Choose which environment you run with, at the top right',
    }
const untilDone = (page) => page.waitForFunction(() => !document.querySelector('.lp-dialog') && document.querySelector('.case-nav-item') && !document.querySelector('.case-nav-item .sd-running, .case-nav-item .sd-pending'), null, { timeout: 45000 })

const settle = (page, ms = 600) => page.waitForTimeout(ms)
/** Una zona de la página recortada a lo que se ve. */
function within(page, box, pad = 0) {
  const vp = viewport(page)
  const x = Math.max(0, box.x - pad)
  const y = Math.max(0, box.y - pad)
  return { x, y, width: Math.min(vp.width - x, box.x + box.width + pad - x), height: Math.min(vp.height - y, box.y + box.height + pad - y) }
}
/** Captura la ventana entera; con `target`, antes lleva ese elemento a la vista. */
async function shot(page, name, target) {
  await settle(page)
  let box
  if (target) {
    await target.first().scrollIntoViewIfNeeded().catch(() => {})
    box = await target.first().boundingBox()
    if (!box) throw new Error(`no se ve el elemento de ${name}`)
    box = within(page, box)
  }
  await capture(page, path.join(OUT, `${name}.png`), box)
  console.log(`  ✓ ${name}`)
}
/** Antes recortaba una zona; ahora captura la ventana entera, como todas las capturas. */
async function clip(page, name, box, pad = 12) {
  await settle(page)
  await capture(page, path.join(OUT, `${name}.png`), within(page, box, pad))
  console.log(`  ✓ ${name}`)
}
const tab = (page, id) => page.locator(`[role="tab"][data-tab="${id}"]`).first()

async function openPokedex(page) {
  await page.locator('.welcome-dialog').waitFor()
  await page.locator('.wd-featured').click()
  await page.locator('.tree-step').first().waitFor()
}
async function openPaypal(page) {
  await page.locator('.welcome-dialog').waitFor()
  await page.locator('.wd-profile .link', { hasText: T.more }).click()
  await page.locator('.wd-example', { hasText: /PayPal/ }).click()
  await page.locator('.tree-step').first().waitFor()
}
/** Un workspace (en una carpeta temporal de la app) con la colección "Shop" (la API local de prueba). */
async function openShop(page) {
  await page.locator('.welcome-dialog').waitFor()
  await page.locator('.wd-card', { hasText: T.createWs }).click()
  await page.locator('.wd-form input').first().fill('Demo')
  await page.getByRole('button', { name: T.createWsGo }).click()
  await page.locator('.home').waitFor()
  await page.locator('.home-action', { hasText: T.newCol }).click()
  await page.locator('.home-new input').fill('Shop')
  await page.locator('.home-new').getByRole('button', { name: T.create }).click()
  await page.locator('.tree-collection.current', { hasText: 'Shop' }).waitFor()
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.home-action', { hasText: T.importFiles }).click()])
  await chooser.setFiles([path.join(tmp, 'shop.arazzo.yaml'), path.join(tmp, 'shop.openapi.yaml')])
  await page.locator('.tree-step').first().waitFor()
}
async function focusStep(page, name) {
  const node = page.locator('.builder .step-node', { hasText: name }).first()
  const canvas = page.locator('.builder .graph')
  for (let i = 0; i < 8; i++) {
    const [n, c] = await Promise.all([node.boundingBox(), canvas.boundingBox()])
    if (!n || !c || n.y - c.y < 150) break
    const from = { x: c.x + 24, y: c.y + c.height - 120 }
    const dy = Math.min(n.y - c.y - 60, c.height - 220)
    await page.mouse.move(from.x, from.y)
    await page.mouse.down()
    await page.mouse.move(from.x, from.y - dy, { steps: 8 })
    await page.mouse.up()
    await settle(page, 200)
  }
  await node.locator('.sn-title').first().click()
  await settle(page, 900)
}
/** Ejecuta el workflow abierto y espera a que terminen los casos (o a que aparezca el pop-up de lista). */
async function run(page, { mode = 0, wait = true } = {}) {
  await page.locator('.ws-runbar .segmented button').nth(mode).click()
  await page.locator('.ws-run').click()
  await settle(page, 500)
  const go = page.locator('button', { hasText: T.runAnyway })
  if (await go.count()) await go.first().click()
  if (!wait) return
  // Contra la API real, un paso que devuelve una lista pausa la ejecución: se sigue con lo propuesto.
  for (let i = 0; i < 120; i++) {
    await settle(page, 400)
    const dialog = page.locator('.lp-dialog button.primary')
    if (await dialog.count()) {
      await dialog.click()
      continue
    }
    const busy = await page.evaluate(() => !document.querySelector('.case-nav-item') || !!document.querySelector('.case-nav-item .sd-running, .case-nav-item .sd-pending'))
    if (!busy) break
  }
  await page.locator('.ws-results .step-result').first().waitFor({ timeout: 15000 })
  await settle(page, 1200)
}

// ---------------------------------------------------------------------------------------------
const scenes = {
  async welcome() {
    const page = await freshPage()
    await page.locator('.welcome-dialog').waitFor()
    await shot(page, 'welcome')
    await done()
  },

  async pokedex() {
    const page = await freshPage()
    await openPokedex(page)
    // Diseño
    await page.locator('[data-journey="pokemonCard"]').click()
    await tab(page, 'design').click()
    await page.locator('.builder .step-node').first().waitFor()
    await focusStep(page, 'getSpecies')
    await shot(page, 'builder')
    const detail = page.locator('.bl-detail')
    await clip(page, 'step-panel', await detail.boundingBox(), 0)
    // Outputs y errores: el final del panel.
    await detail.evaluate((el) => el.scrollTo(0, el.scrollHeight))
    await clip(page, 'step-outputs', await detail.boundingBox(), 0)
    await page.locator('[data-journey="battleMatchup"]').click()
    await tab(page, 'design').click()
    await page.locator('.builder .step-node').first().waitFor()
    await focusStep(page, 'getRivalType')
    await shot(page, 'builder-depends')
    // Inputs y casos
    await page.locator('[data-journey="pokemonCard"]').click()
    await tab(page, 'inputs').click()
    await shot(page, 'inputs')
    await tab(page, 'cases').click()
    await shot(page, 'cases')
    // Resultados
    await run(page)
    await shot(page, 'results')
    await shot(page, 'interface')
    // Reporte HTML: se descarga aquí y se fotografía al final de la escena.
    let report
    try {
      report = await download(page, () => page.locator('.ws-results button, .results-panel button', { hasText: T.report }).first().click(), path.join(tmp, `report-${locale}.html`))
    } catch (e) {
      console.log('  ✕ report', String(e.message).split('\n')[0])
    }
    // YAML
    await tab(page, 'yaml').click()
    await page.locator('.cm-content').first().waitFor()
    await page.locator('.rp-toggle').click()
    await shot(page, 'yaml-editor')
    await page.locator('.rp-toggle').click()
    // Dev Tools
    await page.locator('.status-btn', { hasText: 'Dev Tools' }).click()
    await page.locator('.dev-tabs [role="tab"]', { hasText: 'Network' }).click()
    await page.locator('.dev-table tbody tr').first().click().catch(() => {})
    await shot(page, 'devtools-network')
    await page.locator('.dev-tabs [role="tab"]', { hasText: 'Console' }).click()
    await shot(page, 'devtools-console')
    await page.locator('.status-btn', { hasText: 'Dev Tools' }).click()
    // Ambiente: el panel de ambientes de la barra lateral (ícono de arriba) y "Configurar" en el activo.
    await page.locator('.sb-rail-btn[data-panel="envs"]').click()
    await page.locator('.tree-list li.active .link.small').first().click()
    await shot(page, 'environment')
    await page.locator('.sb-rail-btn[data-panel="collections"]').click()
    // Contrato con Swagger UI
    await page.locator('.tree-contract', { hasText: 'pokeapi' }).first().click()
    await page.locator('.swagger-ui .opblock').first().waitFor({ timeout: 25000 })
    await shot(page, 'contract')
    // Generar requests desde el contrato
    const row = page.locator('.tree-list li', { hasText: 'pokeapi' }).first()
    await row.hover()
    await row.locator('.tree-gen').click()
    await page.locator('.gen-req').waitFor()
    await shot(page, 'generate-requests', page.locator('.gen-req'))
    await page.keyboard.press('Escape')
    // Menú ⋯ de una fila
    await row.hover()
    await row.locator('.row-menu-btn').click()
    await settle(page, 300)
    const side = await page.locator('aside').first().boundingBox()
    const menu = await page.locator('.row-menu-list').boundingBox()
    await clip(page, 'sidebar-menu', { x: side.x, y: menu.y - 170, width: Math.max(side.width, menu.x + menu.width - side.x + 10), height: 300 }, 0)
    await page.keyboard.press('Escape')
    // Inicio del workspace
    await page.locator('.ws-home-tab button').first().click()
    await shot(page, 'home')
    // Buscador ⌘K
    await page.keyboard.press('Meta+k')
    await page.locator('.palette input').fill('get')
    await shot(page, 'command-palette')
    await page.keyboard.press('Escape')
    // Preferencias: la captura sale de scripts/capture-desktop.mjs (la app de escritorio muestra
    // todos sus grupos, red y certificados incluidos); aquí ya no se toma para no pisarla.
    // Importar de Postman o Bruno
    await page.locator('.home-action', { hasText: T.importPm }).click()
    await page.locator('.import-sources').waitFor()
    await shot(page, 'import-postman')
    await page.keyboard.press('Escape')
    if (report) {
      await showFile(page, report)
      await shot(page, 'report')
    }
    await done()
  },

  async failed() {
    // Un caso que no pasa: el camino feliz con un Pokémon que no existe, contra la PokéAPI real.
    const page = await freshPage()
    await openPokedex(page)
    await page.locator('[data-journey="pokemonCard"]').click()
    await tab(page, 'inputs').click()
    const input = page.locator('.ws-view .field-grid input').first()
    await input.fill('not-a-pokemon')
    await input.press('Tab')
    await tab(page, 'cases').click()
    await run(page)
    await page.locator('.case-nav-item').first().click()
    await shot(page, 'results-failed')
    await done()
  },

  async paypal() {
    const page = await freshPage()
    await openPaypal(page)
    await tab(page, 'auth').click()
    await page.locator('.flow-auth').waitFor()
    await shot(page, 'workflow-auth')
    // El body de un paso (Crear un pedido es un POST).
    await page.locator('[data-journey="createOrder"]').click()
    await tab(page, 'design').click()
    await page.locator('.builder .step-node').first().waitFor()
    await focusStep(page, 'createOrder')
    const detail = page.locator('.bl-detail')
    const body = detail.locator('.bl-body, .bl-group', { hasText: /body/i }).first()
    await body.scrollIntoViewIfNeeded().catch(() => {})
    await clip(page, 'step-body', await detail.boundingBox(), 0)
    await done()
  },

  async requests() {
    const page = await freshPage()
    await openPokedex(page)
    await page.locator('.tree-add', { hasText: T.newRequest }).click()
    await page.locator('.nr-dialog').waitFor()
    await page.locator('.nr-curl-btn[data-kind="curl"]').click()
    await page.locator('.nr-curl textarea').fill(`curl 'https://pokeapi.co/api/v2/pokemon/pikachu' -H 'accept: application/json'`)
    await shot(page, 'import-curl', page.locator('.nr-dialog'))
    await page.locator('.nr-dialog').getByRole('button', { name: T.imp }).click()
    await page.locator('.rq').waitFor()
    await page.locator('.rq-send').click()
    await page.locator('.rq-status').waitFor({ timeout: 20000 })
    await settle(page, 1500)
    await shot(page, 'request')
    await page.locator('.rq [role="tab"]', { hasText: /auth|autoriz/i }).first().click()
    await shot(page, 'request-auth')
    await done()
  },

  async lists() {
    const page = await freshPage()
    await openShop(page)
    await page.locator('[data-journey="viewProduct"]').click()
    await tab(page, 'cases').click()
    await run(page, { wait: false })
    await page.locator('.lp-dialog').waitFor({ timeout: 15000 })
    await page.locator('.lp-dialog tbody tr').nth(3).click()
    await page.locator('.lp-dialog button.primary').click()
    await page.locator('.ws-results .step-result').first().waitFor()
    await page.locator('[data-journey="orderProducts"]').click()
    await tab(page, 'cases').click()
    await run(page, { wait: false })
    await page.locator('.lp-dialog').waitFor({ timeout: 15000 })
    await page.locator('.lp-dialog tbody tr').nth(2).click()
    await page.locator('.lp-dialog tbody tr').nth(5).click()
    await shot(page, 'list-pick-many')
    await page.locator('.lp-dialog button.primary').click()
    await done()
  },

}

// --- Capturas que pidieron las páginas: ayuda de conexión, contrato sin cargar, mensajería, reutilizables ---
Object.assign(scenes, {
  async auth() {
    // Autorización de un request: los campos de OAuth 2.0, AWS Signature v4 y API Key. La de la colección
    // está en la escena `collection`.
    const page = await freshPage()
    await openPokedex(page)
    const typeOf = (scope) => page.locator(`${scope} select`).filter({ has: page.locator('option[value="awsv4"]') }).first()
    // Un request: los campos de dos tipos de autorización.
    await page.locator('.tree-add', { hasText: T.newRequest }).click()
    await page.locator('.nr-dialog').waitFor()
    await page.locator('.nr-curl-btn[data-kind="curl"]').click()
    await page.locator('.nr-curl textarea').fill(`curl 'https://httpbin.org/get'`)
    await page.locator('.nr-dialog').getByRole('button', { name: T.imp }).click()
    await page.locator('.rq').waitFor()
    await page.locator('.rq [role="tab"]', { hasText: /auth|autoriz/i }).first().click()
    // Más espacio para el request: el divisor con la respuesta, hacia abajo.
    const handle = await page.locator('.rq-split-handle').first().boundingBox()
    if (handle) {
      await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2)
      await page.mouse.down()
      await page.mouse.move(handle.x + handle.width / 2, handle.y + 230, { steps: 8 })
      await page.mouse.up()
    }
    for (const type of ['oauth2', 'awsv4', 'apikey']) {
      await typeOf('.rq').selectOption(type)
      await settle(page, 500)
      await shot(page, `auth-${type}`)
    }
    await done()
  },

  async views() {
    // La vista de un archivo Arazzo y la pestaña Resumen de un workflow (con la cobertura de respuestas).
    const page = await freshPage()
    await openPokedex(page)
    await page.locator('.tree-file').first().click()
    await page.locator('.file-view').waitFor()
    await settle(page, 900)
    await shot(page, 'arazzo-file')
    await page.locator('[data-journey="pokemonCard"]').click()
    await tab(page, 'overview').click()
    await settle(page, 900)
    await shot(page, 'overview-tab')
    await done()
  },

  async extras() {
    // Un paso de mensajería (AsyncAPI) en el lienzo: "Register sighting" de la Pokédex.
    let page = await freshPage()
    await openPokedex(page)
    await page.locator('[data-journey="registerSighting"]').click()
    await tab(page, 'design').click()
    await page.locator('.builder .step-node').first().waitFor()
    await focusStep(page, 'publishSighting')
    await shot(page, 'messaging-step')
    // La API no responde: el panel de ayuda de conexión.
    await page.locator('.sb-rail-btn[data-panel="envs"]').click()
    await page.locator('.tree-list li.active .link.small').first().click()
    const base = page.locator('.ws-view .field-grid .field input').first()
    await base.fill('http://127.0.0.1:9/api/v2')
    await base.press('Tab')
    await settle(page, 600)
    await page.locator('.sb-rail-btn[data-panel="collections"]').click()
    await page.locator('[data-journey="pokemonCard"]').click()
    await tab(page, 'cases').click()
    await page.locator('.ws-runbar .segmented button').nth(0).click()
    await page.locator('.ws-run').click()
    await page.locator('.conn-help').waitFor({ timeout: 30000 })
    // La cabecera fija de los resultados taparía el borde de arriba del panel en la captura.
    await page.addStyleTag({ content: '.results-panel > .rp-head { position: static !important; }' })
    await page.locator('.conn-help').evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await shot(page, 'connection-help', page.locator('.conn-help'))
    await done()
    // Reutilizables: un paso de PayPal con parámetros y ramas de error guardados como componentes.
    page = await freshPage()
    await openPaypal(page)
    await page.locator('[data-journey="createOrder"]').click()
    await tab(page, 'design').click()
    await page.locator('.builder .step-node').first().waitFor()
    await focusStep(page, 'createOrder')
    await page.locator('.bl-reusable').first().scrollIntoViewIfNeeded()
    await clip(page, 'reusables', await page.locator('.bl-detail').boundingBox(), 0)
    await done()
    // Un contrato que no cargó: el Arazzo sin su contrato, con la marca ✕ y "Adjuntar".
    page = await freshPage()
    await page.locator('.welcome-dialog').waitFor()
    await page.locator('.wd-card', { hasText: T.createWs }).click()
    await page.locator('.wd-form input').first().fill('Demo')
    await page.getByRole('button', { name: T.createWsGo }).click()
    await page.locator('.home').waitFor()
    await page.locator('.home-action', { hasText: T.newCol }).click()
    await page.locator('.home-new input').fill('Pokédex')
    await page.locator('.home-new').getByRole('button', { name: T.create }).click()
    await page.locator('.tree-collection.current').waitFor()
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.home-action', { hasText: T.importFiles }).click()])
    await chooser.setFiles([path.join(root, 'examples', 'pokemon', 'pokemon.arazzo.yaml')])
    await page.locator('.tree-step').first().waitFor()
    await settle(page, 900)
    const side = await page.locator('aside').first().boundingBox()
    await clip(page, 'contract-missing', { x: side.x, y: side.y, width: side.width, height: side.height }, 0)
    await done()
  },
})

// --- La colección (sus pestañas), los ambientes globales, la tarjeta de una variable y abrir una carpeta ---
/** Deja sin scroll horizontal lo que se haya corrido al llevar un elemento a la vista (la ventana entera, siempre). */
const unscroll = (page) =>
  page.evaluate(() => {
    for (const el of [document.scrollingElement, ...document.querySelectorAll('body *')]) if (el && el.scrollLeft > 0 && !el.closest?.('.cm-editor')) el.scrollLeft = 0
  })
/** Una pestaña de la vista de la colección. */
const coTab = (page, id) => page.locator(`.collection-overview [role="tab"][data-tab="${id}"]`).first()
Object.assign(scenes, {
  async collection() {
    // La colección "Shop": Resumen, Autorización (Bearer), Variables (apiVersion = v2) y la documentación.
    const page = await freshPage()
    await openShop(page)
    await page.locator('.tree-collection.current').click()
    await page.locator('.collection-overview').waitFor()
    // La documentación: una colección nueva no tiene; se abre el panel y se genera desde los Arazzo.
    await page.locator('.home-docs-rail').click()
    await page.locator('.home-docs-empty button').last().click()
    await page.locator('.home-docs-edit textarea').waitFor()
    await settle(page, 600)
    await shot(page, 'collection-docs-edit')
    await page.locator('.home-docs-edit button.primary').click()
    await page.locator('.home-docs-body').waitFor()
    await settle(page, 900)
    await shot(page, 'collection-overview')
    await coTab(page, 'auth').click()
    const type = page.locator('#collection-auth select').filter({ has: page.locator('option[value="awsv4"]') }).first()
    await type.selectOption('bearer')
    await settle(page, 500)
    await shot(page, 'collection-auth')
    await type.selectOption('none')
    await coTab(page, 'variables').click()
    await page.locator('#collection-variables .add-case').click()
    const row = page.locator('#collection-variables .co-vars-table tbody tr').last()
    await row.locator('input').nth(0).fill('apiVersion')
    await row.locator('input').nth(1).fill('v2')
    await page.evaluate(() => document.activeElement?.blur?.())
    await settle(page, 600)
    await shot(page, 'collection-variables')
    await coTab(page, 'overview').click()
    // Un ambiente global, desde la mitad derecha de la pastilla: el primero se llama como el de la colección.
    await page.locator('.app-env-glob').click()
    await page.locator('.context-menu [role="menuitem"]').first().click()
    await settle(page, 600)
    if (await page.locator('.ws-vars-toggle.active').count()) await page.locator('.ws-vars-toggle').click()
    await settle(page, 400)
    // La pastilla de dos mitades, con el menú del ambiente global abierto.
    await page.locator('.app-env-glob').click()
    await page.locator('.context-menu').waitFor()
    await shot(page, 'env-pill-split')
    await page.keyboard.press('Escape')
    await settle(page, 300)
    // El panel Ambientes de la barra lateral: los globales, los de la colección y las variables de la colección.
    await page.locator('.sb-rail-btn[data-panel="envs"]').click()
    await page.locator('.tree-globals').waitFor()
    await page.mouse.move(900, 500)
    await shot(page, 'sidebar-envs-globals')
    await page.locator('.sb-rail-btn[data-panel="collections"]').click()
    await done()
  },

  async 'request-body'() {
    // El body JSON de un login: una variable que no existe (su tarjeta) y los comentarios con Beautify.
    const page = await freshPage()
    await openShop(page)
    await page.locator('.tree-add', { hasText: T.newRequest }).click()
    await page.locator('.nr-dialog').waitFor()
    await page.locator('.nr-curl-btn[data-kind="curl"]').click()
    await page.locator('.nr-curl textarea').fill(`curl -X POST '${API}/login' -H 'content-type: application/json' --data '{"email": "{{loginEmail}}", "password": "demo-password"}'`)
    await page.locator('.nr-dialog').getByRole('button', { name: T.imp }).click()
    await page.locator('.rq').waitFor()
    await page.locator('.rq-req-tabs [role="tab"][data-tab="body"]').first().click()
    const editor = page.locator('.rq-body .cm-content').first()
    await editor.waitFor()
    await editor.click()
    await page.keyboard.press('Meta+a')
    await page.keyboard.insertText('{\n  "email": "{{loginEmail}}",\n  "password": "demo-password"\n}')
    await settle(page, 600)
    const mark = page.locator('.rq-body .cm-tpl[data-tpl-name="loginEmail"]').first()
    await mark.waitFor()
    await page.mouse.move(900, 600)
    await unscroll(page)
    await settle(page, 300)
    const at = await mark.boundingBox()
    await page.mouse.move(at.x + at.width / 2, at.y + at.height / 2, { steps: 4 })
    await page.locator('.tpl-card').waitFor()
    await settle(page, 500)
    await shot(page, 'var-card-missing')
    // Comentarios en el body, y una coma que falta: Beautify no cambia nada y lo dice.
    await page.mouse.move(900, 120)
    await page.keyboard.press('Escape')
    await editor.click()
    await page.keyboard.press('Meta+a')
    await page.keyboard.insertText('{\n  // the test customer of the shop\n  "customerId": 42,\n  "items": [\n    { "sku": "TSHIRT-M", "qty": 2 } /* add more later */\n  ]\n  "note": "gift"\n}')
    await settle(page, 400)
    await page.locator('.rq-beautify').click()
    await page.locator('.rq-beautify-err').waitFor()
    await page.mouse.move(900, 120)
    await unscroll(page)
    await shot(page, 'json-body-comments')
    await done()
  },

  async 'open-folder'() {
    // Abrir una carpeta que no es un workspace: tiene un Arazzo y su contrato, pero no luvin.yaml.
    const page = await freshPage()
    await page.locator('.welcome-dialog').waitFor()
    const folder = path.join(current.home, ES ? 'pruebas' : 'tests')
    mkdirSync(folder, { recursive: true })
    writeFileSync(path.join(folder, 'shop.openapi.yaml'), SHOP_OPENAPI)
    writeFileSync(path.join(folder, 'shop.arazzo.yaml'), SHOP_ARAZZO)
    // Sin diálogo nativo: la app de prueba toma la carpeta "elegida" de este archivo (electron/main.mjs).
    writeFileSync(path.join(current.home, 'next-pick.txt'), folder)
    await page.locator('.wd-card', { hasText: ES ? 'Abrir un workspace' : 'Open a workspace' }).click()
    await page.locator('.wd-pick').waitFor()
    await settle(page, 600)
    await shot(page, 'open-folder-not-workspace')
    await done()
  },
})

// ---------------------------------------------------------------------------------------------
Object.assign(scenes, {
  async 'clip-quick-start'() {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await page.locator('.welcome-dialog').waitFor()
    await settle(page, 900)
    await say(page, C.qs1)
    await go(page, page.locator('.wd-featured'), { pause: 400 })
    await page.locator('.tree-step').first().waitFor()
    await settle(page, 1100)
    await say(page, C.qs2)
    await go(page, page.locator('[data-journey="pokemonCard"]'), { pause: 2200 })
    await say(page, C.qs3)
    await go(page, tab(page, 'cases'), { pause: 1800 })
    await say(page, C.qs4)
    await go(page, page.locator('.ws-run'), { pause: 300 })
    await page.locator('.lp-dialog').waitFor({ timeout: 25000 })
    await say(page, C.qs5, 2600)
    // El paso devuelve dos listas (tipos y habilidades): una pregunta por cada una.
    for (let i = 0; i < 6; i++) {
      await go(page, page.locator('.lp-dialog button.primary'), { pause: 900 })
      const again = await page.locator('.lp-dialog').waitFor({ timeout: 2500 }).then(() => true, () => false)
      if (!again) break
      await settle(page, 1500)
    }
    await untilDone(page)
    await say(page, C.qs6, 2400)
    await say(page, C.qs7, 600)
    await go(page, page.locator('.ws-results .step-result .step-head').first(), { pause: 3200 })
    await say(page, '', 400)
    await saveClip(page, 'quick-start', started, started)
  },

  async 'clip-design-workflow'() {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await openPokedex(page)
    await settle(page, 800)
    const from = Date.now()
    await say(page, C.d1)
    await go(page, page.locator('.tree-add', { hasText: ES ? 'Nuevo workflow' : 'New workflow' }), { pause: 400 })
    await page.locator('.builder').waitFor()
    await settle(page, 1200)
    await say(page, C.d2)
    const add = async (opPath) => {
      const op = page.locator('.bl-op', { has: page.locator('.bl-op-path', { hasText: opPath }) }).first()
      await go(page, op, { click: false, pause: 350 })
      await go(page, op.locator('.icon-btn'), { pause: 1500 })
    }
    await add('/pokemon/{idOrName}')
    await add('/pokemon-species/{idOrName}')
    await page.locator('.step-node', { hasText: 'getPokemonSpecies' }).waitFor()
    await say(page, C.d3, 600)
    await go(page, page.locator('.bl-detail .bl-picker select').first(), { click: false, pause: 3000 })
    await say(page, C.d4, 600)
    await go(page, page.locator('.start-node').first(), { click: false, pause: 2600 })
    await say(page, C.d5, 500)
    await go(page, tab(page, 'yaml'), { pause: 900 })
    // El workflow nuevo queda al final del archivo de la Pokédex: el editor baja hasta él.
    await page.locator('.cm-content').first().waitFor()
    await page.locator('.editor-code .cm-scroller').first().evaluate((el) => el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }))
    await settle(page, 3000)
    await say(page, '', 400)
    await saveClip(page, 'design-workflow', started, from)
  },

  async 'clip-run-cases'() {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await openPokedex(page)
    await page.locator('[data-journey="pokemonCard"]').click()
    await tab(page, 'cases').click()
    await settle(page, 900)
    const from = Date.now()
    await say(page, C.r1)
    await go(page, page.locator('.ws-runbar .segmented button').nth(1), { pause: 1300 })
    await say(page, C.r2, 500)
    await go(page, page.locator('.ws-run'), { pause: 300 })
    await untilDone(page)
    await say(page, C.r3, 2600)
    await say(page, C.r4, 500)
    await go(page, page.locator('.case-nav-item').nth(1), { pause: 2400 })
    await say(page, C.r5, 500)
    await go(page, page.locator('.ws-results .step-result .step-head').first(), { pause: 3200 })
    await say(page, '', 400)
    await saveClip(page, 'run-cases', started, from)
  },


  async 'clip-request-from-curl'() {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await openPokedex(page)
    await settle(page, 800)
    const from = Date.now()
    await say(page, C.c1)
    await go(page, page.locator('.tree-add', { hasText: T.newRequest }), { pause: 900 })
    await say(page, C.c2, 400)
    await go(page, page.locator('.nr-curl-btn[data-kind="curl"]'), { pause: 600 })
    await go(page, page.locator('.nr-curl textarea'), { pause: 200 })
    await page.locator('.nr-curl textarea').pressSequentially(`curl 'https://pokeapi.co/api/v2/pokemon/pikachu' -H 'accept: application/json'`, { delay: 16 })
    await settle(page, 700)
    await go(page, page.locator('.nr-dialog').getByRole('button', { name: T.imp }), { pause: 400 })
    await page.locator('.rq').waitFor()
    await say(page, C.c3, 2400)
    await say(page, C.c4, 400)
    await go(page, page.locator('.rq-send'), { pause: 300 })
    await page.locator('.rq-status').waitFor({ timeout: 20000 })
    await say(page, C.c5, 600)
    await go(page, page.locator('.rq-res-content').first(), { click: false, pause: 3200 })
    await say(page, '', 400)
    await saveClip(page, 'request-from-curl', started, from)
  },

  async 'clip-environments'() {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await openPokedex(page)
    await settle(page, 800)
    const from = Date.now()
    // El ambiente activo es la pastilla de arriba a la derecha: su menú lleva a la configuración.
    await say(page, C.e1)
    await go(page, page.locator('.app-env-coll'), { pause: 700 })
    await go(page, page.locator('.context-menu [role="menuitem"]', { hasText: ES ? 'Configurar ambiente' : 'Configure environment' }), { pause: 1800 })
    await say(page, C.e2, 500)
    await go(page, page.locator('.env-add'), { pause: 500 })
    await page.locator('.env-name-input').pressSequentially('staging', { delay: 70 })
    await page.keyboard.press('Enter')
    await settle(page, 1500)
    await say(page, C.e3, 500)
    const base = page.locator('.ws-view .field-grid .field input').first()
    await go(page, base, { pause: 300 })
    await base.press('Meta+a')
    await base.pressSequentially('https://staging.example.com/api/v2', { delay: 28 })
    await settle(page, 1500)
    await say(page, C.e4, 500)
    await go(page, page.locator('.app-env-coll'), { pause: 1200 })
    await go(page, page.locator('.context-menu [role="menuitem"]').first(), { pause: 2400 })
    await say(page, '', 400)
    await saveClip(page, 'environments', started, from)
  },
})

// Escenas de scripts/scenes/: cada archivo exporta una función que recibe estas herramientas y devuelve sus escenas.
const sceneDir = path.join(here, 'scenes')
if (existsSync(sceneDir))
  for (const f of readdirSync(sceneDir).filter((n) => n.endsWith('.mjs')).sort()) {
    // Un archivo de escenas que no carga (a medio escribir) no frena a los demás.
    const mod = await import(pathToFileURL(path.join(sceneDir, f)).href).catch((e) => {
      console.log(`  ✕ ${f} no carga: ${String(e.message ?? e).split('\n')[0]}`)
    })
    if (!mod?.default) continue
    Object.assign(scenes, mod.default({ ES, locale, T, OUT, tmp, root, API, VIEW, V, path, writeFileSync, appHome: () => current?.home, freshPage, done, viewport, resize, capture, download, showFile, moveTo, go, say, saveClip, shot, clip, settle, tab, openPokedex, openPaypal, openShop, focusStep, run, untilDone }))
  }

console.log(`Capturas (${locale}) → ${OUT}`)
for (const [name, scene] of Object.entries(scenes)) {
  if (only.length && !only.includes(name)) continue
  try {
    await scene()
  } catch (e) {
    console.log(`  ✕ escena ${name}: ${String(e.message ?? e).split('\n')[0]}`)
    if (current) await capture(current.page, path.join(OUT, `_fail-${name}.png`)).catch(() => {})
    await done().catch(() => {})
  }
}
await done()
api.close()
