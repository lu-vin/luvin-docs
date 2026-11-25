---
title: Averigua por qué falló un caso
description: Lee el veredicto y su motivo, mira la falla en el lienzo, revisa el request en Dev Tools, repítelo en una terminal con cURL, prueba otro valor en una pausa y corrige el input.
sidebar:
  order: 5
---

Un caso terminó como **No pasó** y necesitas saber por qué: ¿tu workflow, tus datos o la API? Vas a provocar una falla a propósito en el ejemplo de la Pokédex y la seguirás desde el veredicto hasta el request exacto. Necesitas unos 20 minutos, Luvin abierto con el ejemplo de la Pokédex, conexión a internet y, para el paso 5, una terminal.

## 1. Provoca una falla

1. Abre **Pokemon card** y haz clic en la pestaña **Inputs**.
2. Escribe `missingno` en `pokemon`. Ese Pokémon no existe.
3. Haz clic en la pestaña **Casos** y en **Ninguno** para desmarcar todos los casos. Marca **Camino feliz**.
4. En la barra de ejecución, elige **API real** y haz clic en **Ejecutar**.

Los resultados se abren abajo y el caso termina como **No pasó**.

## 2. Lee el veredicto y el motivo

![Un caso que no pasó, con el paso que falló abierto y el motivo en palabras simples](/media/es/results-failed.webp)

1. Mira el encabezado de los resultados. El contador ✕ dice 1.
2. Haz clic en el caso de la lista de la izquierda. El detalle muestra su veredicto, **No pasó**, y estas filas:

| Fila | Qué dice aquí |
|---|---|
| **Esperado** | Todos los pasos cumplen sus criterios. |
| **Resultado** | El motivo en palabras simples. Empieza con *Falló en el paso "getPokemon"* y dice *La API respondió 404 Not Found.* |

Ya sabes dónde se rompió (el primer paso) y qué pasó (la API no encontró el Pokémon). Mira [Lee los resultados](/es/test/results/).

## 3. Abre el paso que falló

Bajo el detalle, cada paso es una tarjeta. La que falló ya está abierta.

1. Lee su encabezado: el estado **Falló**, el método y la ruta, y el status HTTP `404`.
2. Lee la nota bajo el encabezado. Nombra el tipo de problema, **Error devuelto por la API**, y la acción que se activó, *Fin del workflow (acción "pokemonNotFound")*.
3. Haz clic en la pestaña **Criterios**. Cada criterio de éxito dice **Se cumple** o **No se cumple**. El criterio del status no se cumple.
4. Haz clic en **Petición** para ver la URL, los headers y el body que se enviaron. La ruta termina en `/pokemon/missingno`.
5. Haz clic en **Respuesta** para ver qué contestó la API.

Los pasos siguientes dicen **No ejecutado**, porque el workflow se detuvo. Mira [Lee el resultado de un paso](/es/test/step-results/).

### La misma falla en el lienzo

1. Haz clic en la pestaña **Diseño**. El lienzo muestra la ejecución: la tarjeta de `getPokemon` está en rojo y dice **✕ 404 → termina**, su ruta del 404 dice **tomada** y los demás pasos dicen **no se ejecutó**.
2. Haz clic en la tarjeta de `getPokemon` y abre la pestaña **Respuesta** de su panel.
3. En **Por qué falló**, `$statusCode == 200` dice **fue 404**. En **Lo que recibió**, `idOrName` es `"missingno"`.

![El lienzo después de la ejecución que falló: la tarjeta de getPokemon dice ✕ 404 → termina, y su pestaña Respuesta dice por qué falló y que idOrName era "missingno"](/media/es/test-canvas-failed-response.webp)

El diagrama te dice lo mismo que los resultados, sin salir del workflow. Mira [Resultados en el lienzo](/es/test/run-on-canvas/).

### Cuando la etiqueta es "Criterio no cumplido"

Aquí la API respondió con un error. Cuando la API responde 200 pero un valor es incorrecto, la etiqueta es **Criterio no cumplido** y la nota compara dos valores. Por ejemplo, en una API de tienda:

```text
status
Esperado   "ACTIVE"
Recibido   "INACTIVE"
```

Pulsa **Ver en la respuesta**. Se abre la pestaña **Respuesta** con ese campo resaltado en el body. Compara el campo con lo que esperabas: puede que la API haya cambiado, o que tus datos no sean lo que pensabas.

## 4. Mira el request real en Dev Tools

Dev Tools lista cada request que envió Luvin, con los secretos tapados.

1. Haz clic en **Dev Tools** en la barra de abajo de la ventana y abre la pestaña **Network**.
2. Busca la fila con el status `404` en rojo. Las filas que fallaron aparecen resaltadas. Escribe `missingno` en **Filtrar por URL, paso o status…** para encontrarla más rápido.
3. Haz clic en la fila. Se abre un panel con el resumen: **Status**, **Tiempo**, **Tamaño**, **Paso** y **Caso**.
4. Haz clic en **Petición** y luego en **Respuesta** para leer los headers y el body de cada una.

![Dev Tools: la pestaña Network con un request seleccionado](/media/es/devtools-network.webp)

Si no ves **Dev Tools**, estás en la interfaz **Simple**. Cambia a la completa en **Preferencias**. Mira [Recorrido por la interfaz](/es/get-started/interface/).

## 5. Repítelo en una terminal

Si el mismo request falla fuera de Luvin, el problema no está en el workflow.

1. En el detalle del request, haz clic en **Copiar como cURL**. El botón muestra **✓ Copiado**.
2. Pégalo en una terminal y pulsa Enter. Agrega `-i` después de `curl` para ver la línea de status.

```bash
curl -i 'https://pokeapi.co/api/v2/pokemon/missingno'
```

La terminal también responde 404. Entonces el workflow está bien y el dato es incorrecto. Los secretos del comando aparecen como `<secret>`: reemplázalos por los valores reales. Mira [Network](/es/dev-tools/network/).

## 6. Prueba la operación sola

Puedes llamar a una operación sin el resto del workflow.

1. En la barra lateral, bajo **Pokemon card**, haz clic en su primer paso, el `GET` de `getPokemon`. Se abre una pestaña con el paso.
2. Haz clic en **▶ Probar sola**. Se abre una pestaña con la operación.
3. Elige **API real**, revisa el ambiente y haz clic en **Enviar**.

Aparecen el status y el body. Cambia el parámetro de la ruta a `pikachu` y envía otra vez: obtienes 200. Ahora sabes que la operación funciona y que solo el valor estaba mal. Mira [Probar una operación](/es/contracts/try-it-out/).

## 7. Cuando la API no responde

No toda falla es una respuesta. Si el paso tiene la etiqueta **Red** y no hay status, la API no respondió. Un panel con el título **No se pudo conectar con la API** aparece sobre los resultados, con la cantidad de casos afectados y los servidores que no respondieron.

1. Haz clic en **Abrir https://… ↗** para probar la dirección en tu navegador. Si no carga, el problema es el servidor o la dirección.
2. Haz clic en **Revisar ambiente** y comprueba la URL base.
3. Si la dirección carga pero la ejecución sigue fallando, revisa [Preferencias → Red](/es/get-started/network/): un proxy, un certificado de cliente o el tiempo máximo de espera.
4. Haz clic en **Probar en simulación** para seguir trabajando mientras se arregla.

Mira [Ayuda de conexión](/es/dev-tools/connection-help/).

## 8. Prueba otro valor sin cambiar el input

Antes de cambiar el input, comprueba que otro valor funciona, desde el mismo paso.

1. En la pestaña **Diseño**, haz clic en la tarjeta de `getPokemon` y pulsa **F9**. La tarjeta muestra **⏸ pausa**.
2. Haz clic en **Ejecutar**. La ejecución se detiene antes de `getPokemon`, y la barra de abajo del lienzo dice **⏸ En pausa antes del paso 1**.
3. En el panel, en **Recibe**, `idOrName` dice `missingno`. Escribe `pikachu` y haz clic en **▷ Continuar**.
4. Si la ejecución se pausa para elegir de una lista, haz clic en **Continuar con este elemento** cada vez.

El caso termina como **Pasó**, y el chip de `idOrName` dice `= "pikachu" ✎`. La pestaña **Inputs** sigue diciendo `missingno`: el valor que escribiste valió solo para esa ejecución. Pulsa **F9** otra vez en la tarjeta para quitar la pausa. Mira [Depurar un workflow](/es/test/debug/).

## 9. Corrige el input y ejecuta otra vez

1. Haz clic en la pestaña **Inputs** y escribe `pikachu` en `pokemon`.
2. Haz clic en la pestaña **Casos** y luego en **Ejecutar**.

Si la ejecución se pausa con **Ejecución en pausa**, haz clic en **Continuar con este elemento** cada vez. El caso termina como **Pasó**. Mira [Elegir un elemento de una lista](/es/test/lists/).

## Qué aprendiste

- La fila **Resultado** dice en palabras simples dónde se rompió el caso y por qué.
- La etiqueta de un paso que falló dice el tipo de problema: la API devolvió un error, no se cumplió un criterio, no hubo respuesta, etcétera.
- **Ver en la respuesta** resalta el campo que difiere.
- **Network** de Dev Tools muestra el request exacto, y **Copiar como cURL** lo repite en una terminal.
- En la pestaña **Diseño**, el lienzo muestra en rojo el paso que falló, y su pestaña **Respuesta** dice por qué falló.
- Una pausa (**F9**) te deja probar otro valor en un paso sin cambiar los inputs.
- **▶ Probar sola** prueba una operación sin el resto del workflow.
- El panel de conexión ayuda cuando la API no responde.

## Siguiente

- [Comprueba que tu API rechaza datos malos](/es/tutorials/negative-cases/)
- [Depurar un workflow](/es/test/debug/)
- [Network](/es/dev-tools/network/)
- [Por qué falló un paso o un caso](/es/reference/failure-reasons/)
