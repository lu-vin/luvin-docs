// Escenas de "Diseñar workflows" con la Pokédex: el lienzo, la tarjeta de un paso, su panel, ＋ Paso,
// los chips de datos, el YAML al lado, elegir varios pasos, un Arazzo nuevo, los avisos «por revisar»
// y las rutas. Todas las capturas muestran la ventana entera; para señalar algo se usa el cursor o una leyenda.
import { helpers } from './design.mjs'

export default (ctx) => {
  const { ES, freshPage, shot, settle, openPokedex, done } = ctx
  const h = helpers(ctx)
  const { L, design, node, select, deselect, bring, panelTab, panelScroll, showOptions, hideOptions, showTitle, hideTitle, zoom, plusBtn, newArazzo, addFromQuick, editYaml, routeDialog, routeStatus, routeKind, closeNotice } = h
  const scenes = {}

  // El lienzo, una tarjeta, el panel del paso y ＋ Paso.
  scenes['design-pokedex'] = async () => {
    const page = await freshPage()
    await openPokedex(page)
    await design(page, 'pokemonCard')
    await shot(page, 'design-canvas-overview')
    // El paso 1 elegido, con su panel abierto encima del lienzo.
    await select(page, 'getPokemon')
    await shot(page, 'builder')
    // Lo que entrega: la sección Entrega del panel.
    await panelScroll(page, page.locator('.bl-side .bl-section', { has: page.locator('.bl-out-row') }).first())
    await shot(page, 'step-outputs')
    // El paso 2 recibe el id del paso 1 (chip ← id · de 1).
    await select(page, 'getSpecies')
    await shot(page, 'step-panel')
    // Sus criterios de éxito, en la pestaña Éxito y rutas.
    await panelTab(page, 1).click()
    await settle(page, 600)
    await shot(page, 'design-criteria-panel')
    await deselect(page)
    // Una tarjeta completa, con todas sus partes: se aleja un poco para que quepa entera.
    await zoom(page, -1)
    await bring(page, node(page, 'getPokemon'), 75)
    await shot(page, 'design-card')
    // Todas las tarjetas minimizadas, desde Ver.
    await zoom(page, +1)
    await bring(page, page.locator('.builder .start-node'), 70)
    await page.locator('.gf-cards').click()
    await settle(page, 800)
    await shot(page, 'design-card-minimized')
    await page.locator('.gf-cards').click()
    await settle(page, 600)
    // Los chips: al pasar el mouse por uno se ve de dónde sale y su línea.
    await bring(page, node(page, 'getWeakness'), 110)
    const chip = node(page, 'getWeakness').locator('.xchip.x-step').first()
    await chip.hover()
    await showTitle(page, chip)
    await settle(page, 700)
    await shot(page, 'design-data-chips')
    await hideTitle(page)
    // Ver › Datos: cuándo se ven las líneas.
    await page.locator('.gf-data').click()
    await settle(page, 500)
    await shot(page, 'design-view-data')
    await page.keyboard.press('Escape')
    await settle(page, 300)
    // ＋ Paso, sin ningún paso elegido: sugeridos, patrones y operaciones.
    await deselect(page)
    await page.locator('.bl-add-step').click()
    await page.locator('.bl-quick').waitFor()
    await settle(page, 600)
    await shot(page, 'design-palette')
    await page.keyboard.press('Escape')
    await settle(page, 300)
    // El YAML al lado: el paso 2 elegido marca sus líneas.
    await select(page, 'getSpecies')
    await page.locator('.gf-yaml').click()
    await page.locator('.yaml-peek').waitFor()
    await settle(page, 900)
    await shot(page, 'design-yaml-peek')
    await page.locator('.yaml-peek .yp-head .icon-btn').last().click()
    await settle(page, 400)
    await deselect(page)
    // Varios pasos: el 3 y, con Shift, el 4. La barra y luego Extraer a un workflow.
    await zoom(page, -1)
    await bring(page, node(page, 'getWeakness'), 90)
    await node(page, 'getWeakness').locator('.sn-title').click()
    await settle(page, 400)
    await node(page, 'getAbility').locator('.sn-title').click({ modifiers: ['Shift'] })
    await page.locator('.bl-multi').waitFor()
    await settle(page, 600)
    await shot(page, 'design-multi-bar')
    await page.locator('.bl-multi button').nth(2).click()
    await page.locator('.extract-dialog').waitFor()
    await page.locator('.extract-dialog .ex-name input, .extract-dialog input').first().fill(L('Debilidad y habilidad', 'Weakness and ability'))
    await settle(page, 600)
    await shot(page, 'design-extract-dialog')
    await page.keyboard.press('Escape')
    await done()
  }

  // Dependencias y mensajería: Battle matchup y Register sighting.
  scenes['design-pokedex2'] = async () => {
    const page = await freshPage()
    await openPokedex(page)
    await design(page, 'battleMatchup')
    // La tarjeta Depende de, arriba de Inicio, y los dos pasos que usan sus outputs.
    await zoom(page, -1)
    await bring(page, page.locator('.builder .deps-node').first(), 75)
    await shot(page, 'builder-depends')
    await design(page, 'registerSighting')
    await select(page, 'publishSighting')
    await shot(page, 'messaging-step')
    await select(page, 'awaitConfirmation')
    await shot(page, 'design-messaging-receive')
    await done()
  }

  // Un Arazzo nuevo: el + de las pestañas, el nombre, dos pasos conectados solos y el origen de un valor.
  scenes['design-pokedex-new'] = async () => {
    const page = await freshPage()
    await openPokedex(page)
    await design(page, 'pokemonCard')
    await plusBtn(page).click()
    await page.locator('.context-menu').waitFor()
    await settle(page, 400)
    await shot(page, 'design-plus-menu')
    await page.keyboard.press('Escape')
    await newArazzo(page)
    await shot(page, 'design-new-arazzo')
    // Cambiar el nombre: aparece el id que tendrá en el Arazzo.
    await page.locator('.journey-title .jt-edit').first().click()
    await page.locator('.jt-name').fill(L('Ficha rápida', 'Quick card'))
    await settle(page, 400)
    await shot(page, 'design-rename')
    await page.locator('.jt-name').press('Enter')
    await settle(page, 600)
    // Dos operaciones: la segunda se conecta sola con la primera.
    await addFromQuick(page, 'pokemon/{')
    await addFromQuick(page, 'pokemon-species/{')
    await shot(page, 'design-new-step-panel')
    await deselect(page)
    await zoom(page, -2)
    await bring(page, page.locator('.builder .start-node'), 75)
    await shot(page, 'design-auto-wired')
    await zoom(page, +2)
    // Un tercer paso: la lista de orígenes de idOrName.
    await addFromQuick(page, '/type/{')
    const src = page.locator('.bl-side .bl-prow', { has: page.locator('.bl-prow-name', { hasText: /^idOrName/ }) }).locator('select').first()
    await showOptions(page, src)
    await shot(page, 'design-source-options')
    await hideOptions(page)
    await done()
  }

  // Por revisar: un criterio JSONPath que nunca se cumple (escrito a mano en el YAML), el menú y el arreglo.
  scenes['design-review'] = async () => {
    const page = await freshPage()
    await openPokedex(page)
    await design(page, 'pokemonCard')
    await editYaml(page, (text) => text.replace('          - condition: $response.body#/capture_rate >= 0', '          - context: $response.body\n            condition: $.capture_rate >= 0\n            type: jsonpath'))
    await page.locator('.review-chip').click()
    await settle(page, 600)
    await shot(page, 'design-review-menu')
    // El aviso lleva al paso, a la pestaña donde se arregla.
    await page.locator('.review-menu-item, [role="menuitem"]').filter({ hasText: 'capture_rate' }).first().click()
    await settle(page, 1000)
    await shot(page, 'design-review-fix')
    await done()
  }

  // El editor de rutas: reintentar un 503 de getPokemon, y la fila nueva en la tarjeta.
  scenes['design-pokedex-routes'] = async () => {
    const page = await freshPage()
    await openPokedex(page)
    await design(page, 'pokemonCard')
    await zoom(page, -1)
    await bring(page, node(page, 'getPokemon'), 75)
    await node(page, 'getPokemon').locator('.sn-section.failures .sn-add-route').click()
    await routeDialog(page).waitFor()
    await routeStatus(page, 503)
    await routeKind(page, 'retry')
    const limit = routeDialog(page).locator('#rd-limit, .rd-num').last()
    await limit.fill('2')
    await settle(page, 500)
    await shot(page, 'design-route-dialog')
    await routeDialog(page).locator('.rd-actions button.primary').click()
    await settle(page, 900)
    await closeNotice(page)
    await bring(page, node(page, 'getPokemon'), 75)
    await shot(page, 'design-route-card')
    await done()
  }

  return scenes
}
