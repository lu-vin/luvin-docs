---
title: Privacidad y seguridad
description: Dónde viven tus datos, cómo se guardan los secretos y a qué puede y a qué no puede llegar Luvin.
sidebar:
  order: 5
---

Luvin corre en tu equipo. Esta página dice dónde vive cada tipo de dato y qué lo protege.

- Todo corre **en tu equipo**. No hay backend ni cuenta.
- **Los secretos nunca van a los archivos del workspace.** Los archivos de ambiente solo guardan los nombres de los secretos. Los valores quedan **cifrados en este equipo**: con el llavero del sistema operativo.
- Los tokens, contraseñas y API keys van **tapados** en resultados, reportes, exportaciones, Dev Tools y cada cURL.
- Luvin solo lee y escribe dentro de las carpetas que elegiste, y su interfaz no tiene acceso directo al sistema de archivos. La terminal abre tu propio shell, solo en una carpeta del workspace o en tu carpeta personal.
- Sin workspace, la sesión guardada deja fuera las credenciales y cualquier input cuyo nombre parezca sensible (`token`, `password`, `secret`…).
- **El historial queda en este equipo**, en el almacenamiento de la app (IndexedDB), nunca en los archivos del workspace. Los secretos del ambiente, las credenciales y los valores que un request guarda como secretos van tapados en él. Puedes apagarlo en **Preferencias**. Mira [Historial](/es/workspaces/history/).
- **Los mock servers escuchan solo en `127.0.0.1`.** Los demás equipos no pueden llegar a ellos. Desde un navegador, solo una página servida desde `localhost` o `127.0.0.1` puede leer sus respuestas, y una llamada que usa cualquier otro nombre de host recibe `403`. Mira [Rutas y respuestas](/es/mocks/routes/).

## Dónde vive cada tipo de dato

| Dato | Dónde | ¿En los archivos? |
|---|---|---|
| Contratos, archivos Arazzo, casos, requests | La carpeta del workspace. | Sí. |
| Nombres de secretos, URLs base, variables | `environments/*.yaml`. | Sí. |
| Valores de secretos y credenciales | Cifrados en este equipo. | No. |
| La sesión sin workspace | El almacenamiento de la app, en este equipo. | No. |
| Preferencias como el tema, la interfaz y el tamaño de los paneles | Este equipo. | No. |
| Historial de requests y ejecuciones, con los secretos tapados | Este equipo, en el almacenamiento de la app (IndexedDB). | No. |
| Mock servers: nombre, puerto, fuente y rutas propias | `mocks/*.mock.yaml`. | Sí. |
| El Log de un mock | La memoria. Se vacía cuando la app se recarga. | No. |
| Las listas de Console y de Network | La memoria. Desaparecen cuando cierras la app. | No. |

Si el llavero del sistema operativo no está disponible, Luvin no guarda los valores de los secretos, en vez de guardarlos a la vista. Los vuelves a escribir.

## Qué conviene seguir cuidando

:::caution[Los inputs se escriben tal como los tecleas]
Los valores que escribes en **Inputs** y en los casos se guardan en los archivos `scenarios/` del workspace, tal cual. No pongas ahí una contraseña real. Usa un secreto y escribe `{{clientSecret}}`.
:::

:::tip[Compartir un workspace]
Como los valores secretos no están en los archivos, puedes subir un workspace a git. Cada persona agrega sus propios secretos en su equipo. Mira [Llevar un workspace en git](/es/workspaces/git/).
:::

## Relacionado

- [URLs base, variables y secretos](/es/environments/variables-and-secrets/)
- [Qué hay en el disco](/es/workspaces/files/)
- [Usar Luvin sin workspace](/es/workspaces/without-workspace/)
- [Historial](/es/workspaces/history/)
- [Mock servers](/es/mocks/overview/)
