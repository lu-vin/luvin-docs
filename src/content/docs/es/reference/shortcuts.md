---
title: Atajos de teclado
description: Todos los atajos de teclado que tiene Luvin, en macOS y en Windows.
sidebar:
  order: 2
---

Esta página lista los atajos de teclado que tiene Luvin. En macOS la tecla principal es **⌘**. En Windows es **Ctrl**.

**Preferencias**, en su sección **Atajos**, lista los principales en tres grupos: **General** (ejecutar o enviar, guardar, buscar, abrir Preferencias, cerrar diálogos y menús), **Pestañas** y **Canvas de un workflow** (deshacer y rehacer).

## Los primeros que conviene aprender

| Atajo | Qué hace |
|---|---|
| **⌘K** (**Ctrl+K**) | Abre el buscador. Púlsalo otra vez para cerrarlo. |
| **⌘Enter** (**Ctrl+Enter**) | Ejecuta los casos marcados del workflow abierto, o envía el request abierto. |
| **⌘S** (**Ctrl+S**) | Guarda al instante. Luvin también guarda solo. |
| **⌘,** (**Ctrl+,**) | Abre **Preferencias**. |
| **Esc** | Cierra el diálogo, menú o buscador que está abierto. |

## Buscador

**⌘K** (**Ctrl+K**) abre un cuadro de búsqueda. Escribe para encontrar un workflow, paso, ambiente, contrato, request, mock server o colección, o una acción.

| Tecla | Qué hace |
|---|---|
| **↑** y **↓** | Se mueven por los resultados. |
| **Enter** | Abre el resultado seleccionado. |
| **Esc** | Cierra el buscador. |

También puedes hacer clic en **Buscar** en la barra inferior.

### Acciones

El primer grupo del buscador, **Acciones**, reúne cosas que no son un archivo. Escribe una palabra de su nombre, como `historial` o `mock`, para encontrarlas.

| Acción | Qué hace |
|---|---|
| **Ejecutar requests** | Abre el runner con los requests de la colección. Mira [El runner](/es/runner/overview/). |
| **Ejecutar workflows** | Abre el runner con los workflows de la colección. Aparece solo cuando la colección tiene workflows. |
| **Abrir el historial** | Abre el historial de la colección: requests y ejecuciones anteriores. Mira [Historial](/es/workspaces/history/). |
| **Nuevo request** | Crea un request. |
| **Nuevo mock server** | Crea un mock server. Mira [Mock servers](/es/mocks/overview/). |

![La búsqueda abierta con ⌘K sin escribir nada: primero el grupo Acciones (Ejecutar requests, Ejecutar workflows, Abrir el historial, Nuevo request, Nuevo mock server), después Workflows y Pasos](/media/es/search-actions.webp)

## Ejecutar y guardar

| Atajo | Dónde | Qué hace |
|---|---|---|
| **⌘Enter** (**Ctrl+Enter**) | En cualquier parte | Ejecuta los casos marcados del workflow abierto. No hace nada mientras el YAML del workflow no se puede leer. |
| **⌘Enter** (**Ctrl+Enter**) | En cualquier parte de un request abierto: la URL, los headers, el body | Envía el request. Los requests WebSocket son la excepción. |
| **Enter** | La URL de un request HTTP, GraphQL o gRPC | Envía el request. Si hay una lista de sugerencias de `{{` abierta, Enter elige la sugerencia. |
| **⌘Enter** (**Ctrl+Enter**) | En **Try it out** de un contrato | Envía esa operación. No ejecuta el workflow que hay detrás. |
| **⌘Enter** (**Ctrl+Enter**) | En el cuadro de **Importar desde cURL** | Importa el comando pegado. |
| **⌘Enter** (**Ctrl+Enter**) | En **Editar como JSON** del body de un request, en la pestaña Diseño | Aplica el JSON. |
| **⌘S** (**Ctrl+S**) | En cualquier parte | Guarda ahora el workspace abierto. Sin workspace no hace nada. |

Con un diálogo abierto, como **Preferencias** o un request nuevo, **⌘Enter** es de ese diálogo y no ejecuta el workflow que queda detrás.

## Pestaña Diseño

En el lienzo. Presiona **?**, o elige **Atajos de teclado** en **⋯**, para ver esta lista en la app.

| Atajo | Qué hace |
|---|---|
| **↑ ↓** | Moverse entre pasos |
| **Enter** | Abrir el paso |
| **Esc** | Cerrar el panel o dejar de elegir |
| **/** | Agregar un paso |
| **⌘Enter (Ctrl+Enter)** | Ejecutar |
| **⇧Enter (Shift+Enter)** | Ejecutar solo el paso elegido. Mira [Depurar](/es/test/debug/). |
| **⌘F (Ctrl+F)** | Buscar en el lienzo |
| **⌘Z (Ctrl+Z)** | Deshacer el último cambio del workflow. Igual que **Deshacer**. |
| **⇧⌘Z (Ctrl+Shift+Z)** | Rehacerlo. Igual que **Rehacer**. |
| **⌥↑ ⌥↓ (Alt+↑ Alt+↓)** | Mover el paso |
| **⌘D (Ctrl+D)** | Duplicar el paso |
| **⌫ (Supr)** | Quitar el paso |
| **F9** | Pausar antes del paso. Mira [Depurar](/es/test/debug/). |
| **R** | Rutas del paso |
| **M** | Minimizar el paso |
| **⇧ clic (Shift+clic)** | Elegir varios pasos |
| **⌘A (Ctrl+A)** | Elegir todos los pasos |
| **⌘C ⌘V (Ctrl+C Ctrl+V)** | Copiar y pegar pasos |
| **⇧1 (Shift+1)** | Ajustar el zoom |
| **?** | Ver estos atajos |

Funcionan cuando el foco no está en un campo de texto. Dentro de un campo, **⌘Z** deshace el texto que escribiste, como en cualquier programa.

El historial de **Deshacer** se conserva cuando vas a otra pestaña del workflow, como YAML o Casos, y vuelves. Si editaste el YAML entre medio, empieza de nuevo.

| Tecla | Dónde | Qué hace |
|---|---|---|
| **Esc** | El editor de rutas, o un menú en la tarjeta de un paso | Lo cierra. Mira [Agregar o cambiar una ruta](/es/design/branch-menu/). |

## Pestañas


| Atajo | Qué hace |
|---|---|
| **⌘N** (**Ctrl+N**) | **Nuevo Arazzo**: crea un archivo Arazzo nuevo. |
| **⌘W** (**Ctrl+W**) | **Cerrar**: cierra la pestaña actual. |
| **⇧⌘W** (**Ctrl+Shift+W**) | **Cerrar todas**: cierra todas las pestañas que se pueden cerrar. |

## Menús, diálogos y campos

| Tecla | Dónde | Qué hace |
|---|---|---|
| **Esc** | Diálogos, menús y el buscador | Los cierra. Incluye **Preferencias**, la pantalla de bienvenida, los menús **⋯** y el menú del workspace. |
| **Esc** | Un campo que estás renombrando | Cancela el cambio y conserva el nombre anterior. |
| **Enter** | Un campo que estás renombrando, como un ambiente o una colección | Guarda el nombre nuevo. |
| **Enter** | El campo **Otro (Enter)** del status esperado de un caso | Agrega ese status. |
| **Enter** | El diálogo para elegir un elemento de una lista | Continúa con tu elección. Mira [Listas](/es/test/lists/). |
| **↑** y **↓** | Una lista de sugerencias de `{{` | Se mueven por las sugerencias. |
| **Enter** o **Tab** | Una lista de sugerencias de `{{` | Inserta la sugerencia seleccionada. |
| **Esc** | Una lista de sugerencias de `{{` | Cierra las sugerencias. |
| **↑** y **↓** | El selector de método de un request | Se mueven por los métodos. |
| **Esc** | La búsqueda de la barra lateral | La cierra. |

## El tour guiado

| Tecla | Qué hace |
|---|---|
| **→** | Siguiente paso del tour. |
| **←** | Paso anterior. |
| **Esc** | Cierra el selector de secciones. |

## Cambiar tamaños con el teclado

Cada divisor puede recibir el foco con **Tab**. Entonces:

| Divisor | Teclas |
|---|---|
| El panel de resultados (**Cambiar el ancho del panel de resultados**) | **↑** y **↓** cambian su altura en 40 píxeles. |
| El panel de operaciones y el panel de detalle del paso, en la pestaña Diseño | **←** y **→** cambian el ancho en 12 píxeles. Con **Shift**, en 40. |
| El request y su respuesta | **↑** y **↓** mueven la línea. **Inicio** y **Fin** la llevan a un extremo. |

Haz doble clic en un divisor para devolverlo a su tamaño original.

## Siguiente

- [La interfaz](/es/get-started/interface/)
- [Ejecutar un workflow](/es/test/run/)
