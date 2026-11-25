# luvin-docs

Documentación de Luvin: cómo diseñar, ejecutar y compartir workflows de APIs. En inglés (`/`) y español (`/es/`), hecha con [Starlight](https://starlight.astro.build), el framework de documentación de Astro (el mismo stack que `luvin-web`). Todo es estático y trae buscador sin servicios externos.

## Comandos

```bash
npm install
npm start         # compila y sirve el sitio como en producción, con el buscador: http://localhost:4321
npm run dev       # para escribir: recarga al guardar, pero sin buscador (dice que solo funciona en producción)
npm run build     # genera el sitio estático en dist/, con el índice del buscador
npm run preview   # sirve dist/ ya compilado
npm run media     # vuelve a capturar las imágenes y los videos de la app, en los dos idiomas
npm run verify-recipes   # ejecuta los ejemplos (recetas) con el motor de Luvin contra las APIs reales
npm run check-links      # revisa que ningún enlace interno de dist/ esté roto (después de build)
npm run deploy           # compila y publica en Cloudflare (docs.lu-vin.com)
```

Requiere Node.js 20.19+ o 22.12+.

## Dónde está cada cosa

| Qué | Dónde |
|---|---|
| Páginas en inglés | `src/content/docs/<sección>/<página>.md` (o `.mdx` si usa componentes) |
| Páginas en español | `src/content/docs/es/<sección>/<página>.md` (misma sección y mismo nombre) |
| Portada (buscador, accesos rápidos, tarjetas) | `src/content/docs/index.mdx` y `es/index.mdx` |
| Secciones de la barra lateral, idiomas, dominio | `astro.config.mjs` |
| Piezas propias (ver abajo) | `src/components/` |
| Colores y tipografía de la marca | `src/styles/luvin.css` |
| Capturas y videos de la app | `public/media/en` y `public/media/es` |
| Scripts que capturan y convierten esos medios | `scripts/` |

## Piezas propias

Starlight deja reemplazar sus componentes (`components` en `astro.config.mjs`). Los de aquí:

| Componente | Qué hace |
|---|---|
| `Search.astro` | El buscador: una paleta propia sobre el índice de Pagefind, con resultados por sección, flechas, recientes y sugerencias (⌘K o "/"). |
| `Header.astro` | La cabecera de Starlight más el menú horizontal con las secciones (salen de la barra lateral; se marca la actual). |
| `Sidebar.astro` | La barra lateral muestra solo la sección en la que estás, con su nombre como título. |
| `TableOfContents.astro` | "En esta página" como una cadena de pasos: lo leído queda en verde, el título actual se ilumina y un punto de datos recorre la cadena. |
| `PageTitle.astro` | La sección sobre el título, la descripción, "Copiar página" (en Markdown), "Copiar enlace" y los minutos de lectura. |
| `Hero.astro` y `ChainArt.astro` | La portada: buscador grande, accesos rápidos y la ilustración animada de una cadena de llamadas. |
| `Head.astro` | Visor de capturas a tamaño completo y el botón de reproducir sobre los videos. |
| `TopicCard.astro`, `TopicGrid.astro` | Las tarjetas de la portada. |

Las listas numeradas del contenido se dibujan como pasos unidos por una línea (en `src/styles/luvin.css`).

## Secciones

Cada carpeta de `src/content/docs/` es una sección del menú horizontal y de la barra lateral:

| Carpeta | Sección |
|---|---|
| `get-started` | Empieza aquí |
| `tutorials` | Tutoriales |
| `design` | Diseñar workflows |
| `test` | Probar workflows |
| `requests` | Enviar requests |
| `contracts` | Contratos |
| `environments` | Ambientes y autorización |
| `workspaces` | Workspaces |
| `dev-tools` | Dev Tools |
| `reference` | Referencia |

## Agregar una página

1. Crea el archivo en inglés en la carpeta de su sección, con esta cabecera:

   ```md
   ---
   title: Título de la página
   description: Una frase que dice qué cubre.
   sidebar:
     order: 4
   ---
   ```

   `sidebar.order` es su posición dentro de la sección. El nombre en la barra lateral sale del `title`.
2. Crea el mismo archivo en `src/content/docs/es/<sección>/`. Si falta, la página en español muestra la versión en inglés con un aviso.
3. Si el `title` o la `description` llevan dos puntos (`:`), van entre comillas.

Los enlaces internos llevan la ruta completa y terminan en barra: `/design/add-steps/` en inglés y `/es/design/add-steps/` en español.

## Cómo se escribe

La documentación tiene que entenderse sin ayuda. Las reglas con las que se escribió:

- **Nada inventado.** Cada botón, comportamiento, límite y valor por defecto se comprueba en el código de la app. Los textos de la interfaz salen de `src/i18n/locales/{en,es}/{ui,core}.ts` (la misma clave da el nombre exacto en cada idioma). Lo que no se puede confirmar, no se escribe.
- **Empieza por para qué sirve**: una o dos frases que digan qué es y cuándo se necesita.
- **Pasos numerados** para todo lo que hace la persona, una acción por paso, y qué debe ver después.
- **Los nombres de la interfaz, tal como aparecen en la app y en negrita.**
- **Frases cortas**, sin lenguaje de venta, con un ejemplo concreto para lo abstracto (la Pokédex, PayPal o una tienda genérica; nunca datos reales de una empresa).
- **Una palabra por concepto**, igual que en la app: workflow (nunca "journey" ni "flujo"), inputs, casos, Ejecutar para workflows y casos (Enviar solo para un request), paso, contrato, ambiente, colección, workspace, request.
- Un campo que sale de una lista se nombra sin su posición: `cards/bank`.

## Capturas y videos

`npm run media` recorre la app de escritorio real (Electron), en inglés y en español, y deja en `public/media/<idioma>/` las capturas (`.webp`) y los videos (`.mp4` con su póster). Necesita:

- El repositorio de la app al lado (`../luvin`, o `LUVIN_DIR=/ruta`) con sus dependencias instaladas. `npm run media` compila su interfaz antes de capturar; si corres `capture.mjs` a mano, antes `npm run build` allá.
- Conexión a internet: usa la PokéAPI real. Para las listas levanta una API local de prueba.

Las capturas y los videos muestran siempre la ventana completa de la app, nunca un recorte de una zona: para señalar algo se usa el cursor o una leyenda.

Mientras captura se abre una ventana de Luvin: no muevas el mouse ni escribas en ella. Cada escena abre la app limpia (datos en una carpeta temporal) y la cierra al terminar.

Los mock servers encendidos y las Preferencias con red, proxy y certificados salen de `scripts/capture-desktop.mjs`; `npm run media` también lo corre. Las pruebas de rendimiento de las escenas usan solo servidores locales (127.0.0.1), nunca una API pública.

Para rehacer solo una parte: `node scripts/capture.mjs es .media/es requests clip-quick-start` y luego `node scripts/convert.mjs .media/es public/media/es`.

Las escenas están al final de `scripts/capture.mjs` y en `scripts/scenes/` (un archivo por tema: `design.mjs` para Diseñar workflows, `test.mjs` para Probar workflows). Cada archivo de `scenes/` exporta una función que recibe las herramientas de la captura (abrir los ejemplos, mover el cursor, poner leyendas, capturar) y devuelve sus escenas; sus capturas llevan el prefijo del tema (`design-…`, `test-…`). Los videos son las escenas que empiezan con `clip-` y llevan un cursor y una leyenda por paso, en los dos idiomas. La API local de prueba usa un puerto libre, así se pueden grabar varias tandas a la vez.

En una página, una captura es `![Qué muestra](/media/en/builder.webp)` y un video:

```html
<video controls muted playsinline preload="metadata" poster="/media/en/quick-start.webp" src="/media/en/quick-start.mp4"></video>
```

Las páginas en español usan `/media/es/`. Al hacer clic en una captura se abre a tamaño completo.

## Ejemplos que se pueden ejecutar (recetas)

Cada receta es una carpeta de `public/recipes/<nombre>/` con su contrato y su Arazzo (los que se descargan desde la página) y una página en `src/content/docs/recipes/` y `es/recipes/`. Usan APIs públicas sin cuenta (DummyJSON, PokéAPI, JSONPlaceholder).

`npm run verify-recipes` ejecuta cada workflow con el motor real de Luvin contra la API real y dice si pasa. Ninguna receta se publica sin pasar. Opcionales en la carpeta: `inputs.json` (valores de los inputs por workflow) y `expect.json` (`"failed"` para los workflows que deben terminar en fallo a propósito). Necesita el repositorio de la app al lado con sus dependencias; escribe una prueba temporal en la app y la borra al terminar.

## Subtemas

Los subtemas de cada sección (los grupos plegables de la barra lateral) están en `astro.config.mjs`, en la lista `sidebar`. Una página que no esté en ningún subtema aparece igual, al final de su sección.

## Publicar

El sitio se publica en Cloudflare Workers, en `https://docs.lu-vin.com` (un subdominio de `lu-vin.com`, que ya está en Cloudflare). La configuración está en `wrangler.jsonc`.

**Automático (CI/CD).** `.github/workflows/ci.yml` corre en GitHub Actions:

- En cada pull request a `main`: compila el sitio (falla si una página tiene un error) y revisa que no haya enlaces rotos (`npm run check-links`).
- En cada push a `main`: lo mismo y, si todo pasa, publica.

Necesita dos secretos en el repositorio (Settings → Secrets and variables → Actions), los mismos que usa `luvin-web`: `CLOUDFLARE_API_TOKEN` (un token con la plantilla "Edit Cloudflare Workers") y `CLOUDFLARE_ACCOUNT_ID`. La primera publicación crea el Worker `luvin-docs` y conecta el subdominio, con su DNS y su certificado.

**A mano.** `npx wrangler login` una vez y luego `npm run deploy`.

Las recetas (`npm run verify-recipes`) no corren en la CI porque necesitan el repositorio de la app al lado: ejecútalas en tu equipo antes de cambiar una.
