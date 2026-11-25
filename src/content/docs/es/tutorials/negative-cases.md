---
title: Comprueba que tu API rechaza datos malos
description: Ejecuta los casos de rechazo que genera Luvin, elige qué status debe devolver cada uno, agrega un caso con tus propios datos, prueba la ruta de error en el lienzo y comparte los resultados como reporte HTML.
sidebar:
  order: 4
---

Una buena API acepta lo válido y rechaza lo que no lo es. Vas a ejecutar los casos que comprueban la segunda mitad en el ejemplo de la Pokédex, decidirás qué significa "rechazado" para tu API, agregarás un caso propio y exportarás un reporte. Necesitas unos 20 minutos y conexión a internet. No hacen falta credenciales.

## 1. Conoce los casos de rechazo

Luvin genera estos casos a partir del contrato y del workflow. Están en la pestaña **Casos**, en los grupos **Validación de datos** y **Seguridad**.

| Caso | Qué envía | Cuándo existe |
|---|---|---|
| **Sin el input obligatorio "…"** | Deja fuera un input obligatorio. | Un input obligatorio que no va en la ruta de la URL. |
| **"…" con …** | Un valor incorrecto: fuera de las opciones permitidas, un texto en lugar de un número, o un valor que no cumple el patrón. | Un input con opciones permitidas, de tipo número o sí/no, o con un patrón. |
| **Sin credenciales** | Ninguna credencial. El primer paso protegido que no es un inicio de sesión debe responder 401 o 403. | Al menos un paso envía credenciales: un contrato lo protege, o su API tiene una autorización puesta en Luvin. |

Todos necesitan la **API real**: en Simulación Luvin no valida lo que envías, así que muestran **No se ejecutará**. Mira [Casos](/es/test/cases/).

La Pokédex no tiene credenciales y sus inputs van en la ruta de la URL, así que solo genera el segundo tipo. El ejemplo de PayPal genera los tres: **Create order** tiene un `amount` obligatorio en el body y una API protegida. Mira [Prueba un flujo de pago con OAuth 2.0](/es/tutorials/oauth-payment/).

## 2. Abre un workflow con un caso de rechazo

1. Abre el ejemplo de la Pokédex. Mira el [Inicio rápido](/es/get-started/quick-start/).
2. Haz clic en **Type explorer** en la barra lateral y abre la pestaña **Casos**.

Su input `type` solo permite 18 nombres de tipo. Luvin generó el caso **"type" con un valor fuera del enum** en el grupo **Validación de datos**. Junto a él ves **Se espera rechazo** y **API real**.

![La pestaña Casos con los casos generados en sus grupos](/media/es/cases.webp)

## 3. Elige el status que debe devolver

Bajo el caso, la línea **Status que debe responder «getType»:** lista los status que cuentan como rechazo.

1. Mira los status. Un punto marca los que el contrato documenta para ese paso. Para `getType` documenta 404, así que Luvin lo sugiere.
2. Lee la línea de al lado: **Si responde otra cosa: advertencia**. Luvin sugirió el status, así que una respuesta distinta no hace fallar el caso.
3. Haz clic en `404`. La línea cambia a **Si responde otra cosa: error**.

Ahora decidiste tú: es lo que afirmas de tu API. Si no eliges nada, vale cualquier 4xx. Un status que no está en la lista se escribe en **Otro (Enter)**. **Volver a lo sugerido** deshace tu elección. Mira [Ajusta un caso](/es/test/adjust-cases/).

| Quién eligió el status | Si la API responde otra cosa |
|---|---|
| Luvin, en un caso de **Validación de datos** | **Advertencia**: el workflow igual funciona, pero conviene revisarlo. |
| Tú | **No pasó** |
| **Sin credenciales** | **No pasó** |

## 4. Ejecuta el caso de rechazo

1. Haz clic en **Ninguno**, arriba a la derecha, para desmarcar todos los casos.
2. Marca **"type" con un valor fuera del enum**.
3. En la barra de ejecución, elige **API real** y haz clic en **Ejecutar**.

Los resultados se abren abajo y el caso termina como **Pasó**.

## 5. Lee por qué pasó

1. Haz clic en el caso de la lista. La fila **Qué prueba** dice qué hace distinto el caso: envía un valor inválido en `type`.
2. Haz clic en **Ver valores enviados** para ver el valor que se envió.
3. Bajo el detalle, abre la tarjeta `getType`.

La tarjeta muestra la etiqueta **Respondió 404 (esperado)** y una nota, **Es lo que prueba el caso**, con el mensaje de la API después de **La API dijo:**. El paso se muestra como aprobado porque el error es lo que el caso quiere. Los pasos siguientes dicen que no se ejecutaron, y por qué. Mira [Lee el resultado de un paso](/es/test/step-results/).

:::tip[Una advertencia no es un bug]
Si el caso termina como **Advertencia**, la API respondió otro status que el sugerido, a menudo porque aceptó datos que el contrato dice que debería rechazar. Si eso está bien en tu API, pulsa **Está bien así: no volver a probarlo** o elige el status que devuelve tu API.
:::

## 6. Agrega un caso con tus propios datos

Los casos generados no conocen tus reglas de negocio. Agrega uno para una situación propia.

1. Abre **Pokemon card** y su pestaña **Casos**.
2. En el grupo **Casos con datos propios**, haz clic en **+ Nuevo caso con datos**.
3. En **Nombre del caso**, escribe `Pokémon desconocido`.
4. En **Paso que se verifica**, elige `getPokemon`.
5. En **Acción esperada (opcional)**, elige `pokemonNotFound (end)`, y en **Status esperado**, escribe `404`.
6. Bajo **Inputs del caso**, escribe `QA-{{number:6}}` en `pokemon`.
7. Haz clic en **Agregar caso**.

`{{number:6}}` es un generador: Luvin lo reemplaza por seis dígitos aleatorios en cada ejecución, así que el nombre nunca se repite. Lo mismo vale para `{{uuid}}` y `{{$randomEmail}}`. Mira [Casos con datos propios](/es/test/custom-cases/).

Desmarca los otros casos y haz clic en **Ejecutar**. Un caso con datos propios siempre se ejecuta contra la API real. Termina como **Pasó** cuando `getPokemon` responde 404 y se activa la acción `pokemonNotFound`. Haz clic en **Ver valores enviados** para ver el valor que produjo el generador.

## 7. Prueba la ruta de error en el lienzo

Los casos de rechazo revisan tu API. Las rutas revisan tu workflow: qué hace cuando un paso responde un error. Puedes recorrerlas sin que la API falle.

1. En **Pokemon card**, haz clic en la pestaña **Diseño**.
2. En la tarjeta de `getPokemon`, busca la fila de la ruta del 404 y haz clic en **▷ Probar**.
3. La barra de abajo del lienzo dice **Probada: 404 → pokemonNotFound · terminó el workflow con error**, y la fila dice **✓ probada**. No se envió nada: el 404 se simula desde el contrato.
4. En la barra de herramientas del lienzo, haz clic en **◎ Rutas probadas 1/1**. En **Errores sin ruta**, el menú lista el 404 de `getSpecies`, `getWeakness` y `getAbility`: el contrato lo documenta y el workflow no lo maneja.
5. Haz clic en **Elegir qué hacer** en uno de ellos. El lienzo elige ese paso, para que decidas qué ruta agregar.

![Después de ▷ Probar en la ruta del 404 de getPokemon: la fila dice tomada y ✓ probada, y la barra dice Probada: 404 → pokemonNotFound](/media/es/test-probe-route.webp)

Mira [Probar rutas y cobertura](/es/test/probe-routes/).

## 8. Exporta el reporte

1. En el encabezado de los resultados, haz clic en **Reporte**.
2. Luvin descarga un archivo llamado `report-<título>-<fecha>.html`.

![El reporte HTML exportado, abierto en un navegador](/media/es/report.webp)

El archivo tiene un resumen en palabras simples, los contadores, el ambiente, una tabla de casos y el detalle de cada uno. Es un solo archivo: quien lo recibe lo abre en cualquier navegador, sin Luvin. Los secretos y los campos sensibles aparecen como `••••`, pero los demás datos de los requests y las respuestas están en el reporte tal como se enviaron. Léelo antes de enviarlo fuera de tu equipo. Mira [Reportes](/es/test/reports/).

## Qué aprendiste

- Los casos de rechazo comprueban que la API rechaza un input faltante, un valor inválido y un request sin credenciales.
- Necesitan la **API real**.
- Un status sugerido por Luvin da una **Advertencia** cuando la API difiere. Un status que eliges tú da **No pasó**.
- Un paso que responde el error esperado se muestra como aprobado.
- Los casos con datos propios y los generadores cubren tus reglas.
- **▷ Probar** recorre una ruta de error del workflow sin que la API falle, y **◎ Rutas probadas** lista los errores sin ruta.
- **Reporte** exporta todo como un solo archivo HTML.

## Siguiente

- [Averigua por qué falló un caso](/es/tutorials/debug-failure/)
- [Casos](/es/test/cases/)
- [Probar rutas y cobertura](/es/test/probe-routes/)
- [Reportes](/es/test/reports/)
