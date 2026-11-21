// Escenas de las listas: un paso devuelve una lista y la ejecución pausa una vez para elegir con qué
// elemento sigue (list-pick, captura y video) y la regla para las próximas veces (list-pick-rule).
// Rehacen list-pick con la interfaz de ahora; las claves `lists` y `clip-list-pick` de capture.mjs son
// las anteriores. Usan la colección "Shop" de capture.mjs (la API local de prueba).
export default (ctx) => {
  const { ES, path, freshPage, go, say, saveClip, shot, settle, tab, openShop, untilDone, V } = ctx

  /**
   * El menú de una lista nativa (<select>) es del sistema y no sale en la captura: se muestra uno igual,
   * con sus opciones reales. Se abre hacia arriba, como hace Chromium cuando abajo no hay lugar.
   */
  async function showOptions(page, select, highlight) {
    await select.evaluate((el, hl) => {
      document.getElementById('demo-select')?.remove()
      const r = el.getBoundingClientRect()
      const menu = document.createElement('div')
      menu.id = 'demo-select'
      const css = getComputedStyle(document.body)
      Object.assign(menu.style, {
        position: 'fixed', left: `${r.left}px`, bottom: `${window.innerHeight - r.top + 2}px`, minWidth: `${r.width}px`, zIndex: 2147483600,
        background: 'Canvas', color: 'CanvasText', border: '1px solid rgba(0,0,0,.25)', borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,.22)',
        font: `13px/1.35 ${css.fontFamily}`, padding: '4px 0',
      })
      for (const o of el.options) {
        const d = document.createElement('div')
        d.textContent = o.textContent
        const on = hl ? o.textContent.trim() === hl : o.selected
        Object.assign(d.style, { padding: '3px 12px', whiteSpace: 'nowrap', ...(on ? { background: '#2f6fde', color: '#fff' } : {}) })
        menu.append(d)
      }
      document.documentElement.append(menu)
    }, highlight)
  }

  const scenes = {}

  scenes['lists-new'] = async () => {
    const page = await freshPage()
    await openShop(page)
    await page.locator('[data-journey="viewProduct"]').click()
    await tab(page, 'cases').click()
    await page.locator('.ws-runbar .segmented button').nth(0).click()
    await page.locator('.ws-run').click()
    const dlg = page.locator('.lp-dialog')
    await dlg.waitFor({ timeout: 15000 })
    await dlg.locator('tbody tr').nth(3).click()
    await settle(page, 500)
    await shot(page, 'list-pick')
    // La regla para las próximas veces: sus opciones, y el pie del diálogo.
    const rule = dlg.locator('.lp-rule select').first()
    await rule.scrollIntoViewIfNeeded()
    await showOptions(page, rule, ES ? 'El que cumpla…' : 'The one where…')
    await settle(page, 400)
    {
      const d = await dlg.boundingBox()
      const r = await dlg.locator('.lp-rule').boundingBox()
      const m = await page.locator('#demo-select').boundingBox()
      const top = Math.min(r.y, m.y) - 16
      const bottom = d.y + d.height + 12
      await ctx.capture(page, path.join(ctx.OUT, 'list-pick-rule.png'), { x: d.x - 12, y: top, width: d.width + 24, height: bottom - top })
      console.log('  ✓ list-pick-rule')
    }
    await page.evaluate(() => document.getElementById('demo-select')?.remove())
    await dlg.locator('button.primary').click()
    await untilDone(page)
    await ctx.done()
  }

  const C = ES
    ? { l1: 'Ejecuta los casos', l2: 'El paso devolvió 10 productos: la ejecución pausa una vez', l3: 'Las columnas marcadas «se usa» pasan al paso siguiente', l4: 'Elige con cuál probar y continúa', l5: 'El paso deja anotado lo que elegiste', l6: 'El siguiente paso usó ese producto' }
    : { l1: 'Run the cases', l2: 'The step returned 10 products: the run pauses once', l3: 'The columns marked "used" go to the next step', l4: 'Choose which one to test with and continue', l5: 'The step records what you chose', l6: 'The next step used that product' }

  scenes['clip-list-pick-new'] = async () => {
    const started = Date.now()
    const page = await freshPage({ video: V })
    await openShop(page)
    await page.locator('[data-journey="viewProduct"]').click()
    await tab(page, 'cases').click()
    await page.locator('.ws-runbar .segmented button').nth(0).click()
    await settle(page, 900)
    const from = Date.now()
    await say(page, C.l1)
    await go(page, page.locator('.ws-run'), { pause: 300 })
    await page.locator('.lp-dialog').waitFor({ timeout: 15000 })
    await say(page, C.l2, 2400)
    await say(page, C.l3, 400)
    await go(page, page.locator('.lp-dialog thead th.used').first(), { click: false, pause: 1800 })
    await say(page, C.l4, 400)
    await go(page, page.locator('.lp-dialog tbody tr').nth(3).locator('td').nth(2), { pause: 1300 })
    await go(page, page.locator('.lp-dialog button.primary'), { pause: 300 })
    await untilDone(page)
    await settle(page, 600)
    await say(page, C.l5, 500)
    await go(page, page.locator('.note.n-pick').first(), { click: false, pause: 2800 })
    await say(page, C.l6, 500)
    await go(page, page.locator('.ws-results .step-result .step-head').nth(1), { pause: 3200 })
    await say(page, '', 400)
    await saveClip(page, 'list-pick', started, from)
  }

  return scenes
}
