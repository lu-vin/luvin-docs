// Escenas de "Diseñar workflows" con el ejemplo de PayPal: el body de un paso y los reutilizables
// (parámetros y rutas de error guardados como componentes). Ventana entera, como todas las capturas.
import { helpers } from './design.mjs'

export default (ctx) => {
  const { freshPage, shot, settle, openPaypal, done } = ctx
  const h = helpers(ctx)
  const { design, side, select, selectFlow, panelScroll } = h
  const scenes = {}

  scenes['design-paypal'] = async () => {
    const page = await freshPage()
    await openPaypal(page)
    await design(page, 'createOrder')
    // El body del paso, en la pestaña Datos, con sus botones.
    await select(page, 'createOrder')
    const body = side(page).locator('.bl-pgroup', { hasText: /body/i }).first()
    await panelScroll(page, body)
    await shot(page, 'step-body')
    // Sus cabeceras usan reutilizables (♻).
    const reusable = side(page).locator('.bl-pgroup', { hasText: /header/i }).first()
    await panelScroll(page, reusable)
    await shot(page, 'reusables')
    // Inicio lista los reutilizables del archivo.
    await selectFlow(page, 'start', 150)
    await panelScroll(page, side(page).locator('.bl-reusables').first())
    await shot(page, 'design-reusables-start')
    // Uno abierto: una ruta de error para el 401, y dónde se usa.
    await side(page).locator('.bl-reusable-item', { hasText: 'unauthorized' }).first().click()
    await settle(page, 700)
    await shot(page, 'design-reusable-panel')
    await done()
  }

  return scenes
}
