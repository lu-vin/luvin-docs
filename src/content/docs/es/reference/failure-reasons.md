---
title: Por qué falló un paso o un caso
description: Una tabla de consulta con cada motivo que Luvin da cuando un paso o un caso no pasa, qué significa cada uno y qué hacer.
sidebar:
  order: 9
---

Cuando un paso no funciona, Luvin nombra el motivo con una etiqueta corta y lo explica en una frase. Esta página los lista. Busca la etiqueta o la frase que ves en los resultados, y lee qué significa y qué hacer.

Se juzgan dos cosas por separado. Un **paso** puede ser exitoso, tener una advertencia, fallar o no ejecutarse. Un **caso** recibe un veredicto: **Pasó**, **No pasó**, **Advertencia** o **No concluyente**. Un caso se juzga a partir de los pasos que ejecutó. Mira [Lee los resultados](/es/test/results/).

## Etiquetas de motivo de un paso

| Etiqueta | Qué significa | Qué hacer |
|---|---|---|
| **Criterio no cumplido** | La API respondió, con un status menor que 400, pero un [criterio de éxito](/es/reference/criteria/) no se cumplió. | Abre el paso. La frase dice qué se esperaba y qué llegó. Corrige el criterio o reporta la diferencia. |
| **Error devuelto por la API** | La API respondió 400 o más. Se muestra el mensaje de la API, si envió uno. | Lee el mensaje. Revisa los inputs del caso y los datos de los pasos anteriores. |
| **Autenticación** | La API respondió 401 o 403. | Revisa la credencial del ambiente o del workflow. Mira [Autorización de un workflow](/es/authorization/workflow/). |
| **Dato no disponible** | Faltaba un valor que el paso necesitaba, así que el request se envió incompleto. | Mira la sección más abajo. |
| **Red o CORS** | No hubo respuesta de la API: falló la conexión, falta la URL, el paso superó su tiempo o se canceló la ejecución. | Usa la [Ayuda de conexión](/es/dev-tools/connection-help/). |
| **Operación no encontrada** | El paso apunta a una operación que no está en los contratos cargados. | Carga el contrato o corrige el `operationId` en la pestaña YAML. |
| **No ejecutado** | El paso se omitió por un paso anterior o por una dependencia. | Corrige primero el paso que falló. |
| **Respuesta fuera de contrato** | El paso cumplió sus criterios, pero la respuesta no coincide con lo que documenta el contrato. Es una **advertencia**, no una falla. | Compara la respuesta con el contrato. Consulta a quien construye la API, o corrige el contrato. |
| **Output no capturado** | El paso funcionó, pero no se pudo tomar de la respuesta un output que usan pasos posteriores. Es una **advertencia**. | Revisa la expresión del output contra la respuesta. Mira [Outputs](/es/design/outputs/). |
| **Mensajería** | Un paso de mensajería no recibió un mensaje a tiempo, o se simuló. | Mira los mensajes más abajo. |

El orden de las revisiones importa. Un 401 o 403 siempre se informa como **Autenticación**. Un dato faltante se informa antes que un error genérico de la API.

## Mensajes que puedes ver en un paso

### La API respondió, pero...

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| **Se esperaba un 2xx, pero vale 404** | El paso no tiene criterios, así que se necesitaba cualquier 2xx. | Agrega un criterio o corrige el request. |
| **La API respondió 401. Revisa la credencial.** También con **Revisa la credencial de ...** y un nombre | La credencial falta, está mal o venció. | Completa la credencial en el ambiente. Un mensaje de la API aparece entre comillas. |
| **La API respondió 401: la petición se envió sin credenciales (como pide el caso de prueba).** | Estás ejecutando un caso **Sin credenciales**. | Nada: es lo esperado. |
| **No se pudo resolver $steps.a.outputs.id; la petición se envió incompleta y la API respondió 404.** | Un paso anterior no entregó el valor. | Mira el paso anterior y sus outputs. |
| **No se pudo resolver ...: faltaba un dato de la ruta, así que se llamó a ...** | Una parte de la URL quedó vacía, así que se llamó a otro recurso. Se muestra la URL real. | Dale valor al input, o corrige el output que lo alimenta. |
| **La API respondió 500 Internal Server Error: "mensaje". Se esperaba ...** | La API respondió 400 o más. Primero va el mensaje de la API, luego el criterio que no se cumplió. | Lee el mensaje de la API. |
| **Un criterio no se cumplió.** | Un criterio no se cumplió y no dio detalle. | Abre los criterios del paso. |
| **La API respondió 200 y se cumplieron los criterios, pero la respuesta no cumple el contrato: ...** | La advertencia **Respuesta fuera de contrato**. Se nombra la primera diferencia. | Mira arriba. |
| **No se pudo capturar "id" de la respuesta, y lo usan pasos posteriores.** | La advertencia **Output no capturado**. | Mira arriba. |

### La API no respondió

| Mensaje | Qué significa | Qué hacer |
|---|---|---|
| **No hay URL de servidor para la fuente "pokeapi". Defínela en la pantalla de parámetros.** | El ambiente no tiene URL base para ese contrato. | Agrega la URL base en el ambiente. Mira [URLs base](/es/environments/base-urls/). |
| **No se pudo conectar con la API (...). Verifica la URL del ambiente y que el servidor sea accesible desde este equipo.** | La app de escritorio no llegó al servidor. | Revisa la URL y tu red o VPN. |
| **La API no respondió en 3000 ms (timeout del paso).** | El paso tiene un `timeout` y la API fue más lenta. | Sube el `timeout` o revisa la API. |
| **La ejecución fue cancelada.** | Detuviste la ejecución. | Ejecuta de nuevo. |
| **Error inesperado al ejecutar: ...** | Algo imprevisto. Sigue el detalle. | Copia el detalle cuando pidas ayuda. Mira [Soporte de especificaciones](/es/reference/support/). |

### Pasos que no se ejecutaron

| Mensaje | Qué significa |
|---|---|
| **No se ejecutó porque el paso "a" falló.** | Un paso anterior falló, así que la ejecución se detuvo. |
| **No se ejecutó porque el workflow se detuvo.** | El workflow terminó por un error o una acción. |
| **No se ejecutó: el workflow terminó antes por una acción end/goto.** | Una acción de falla terminó el workflow o saltó a otro paso. |
| **No se ejecutó porque depende de "a", que no terminó bien (dependsOn).** | Un paso del que depende no tuvo éxito. |
| **No se encontró la operación "x" en los contratos cargados.** | El paso no se puede armar. |
| **Demasiados niveles de sub-workflows anidados.** | Los workflows se llaman unos a otros con demasiada profundidad. |
| **El sub-workflow "x" falló.** o **falló en el paso "y": ...** | Falló un workflow llamado como paso. Se nombran el paso y el motivo de adentro. |
| **Se detuvo la ejecución: posible ciclo infinito de acciones goto/retry.** | Las acciones saltan hacia atrás sin fin. Revisa las acciones `goto` y `retry`. |

### Reintentos y acciones

Son avisos, no errores: **Reintento 1 de 3 (acción "...")**, **Se agotaron los 3 reintentos**, **Va al paso "..."**, **Continúa en el workflow "..."**, **Fin del workflow (acción "...")**, **Reintento 1 de 2: antes corre el paso "login" (acción "loginAndRetry")**. La última significa que una acción `retry` ejecutó el paso que nombra antes de volver a intentar. Mira [Éxito y errores](/es/design/success-and-errors/).

### Workflows que dependen de otros

| Mensaje | Qué hacer |
|---|---|
| **Los workflows dependen unos de otros en círculo: a → b → a.** | Rompe el círculo en `dependsOn`. |
| **dependsOn menciona el workflow "x", que no existe en este Arazzo.** | Corrige el nombre. |
| **No se encontró el workflow "x" que llama este paso.** | Revisa el `workflowId` del paso. Si es un workflow de otro archivo, revisa la fuente y que el archivo esté en la colección. |
| **No se pudo preparar el workflow: el workflow "x" del que depende falló.** | Corrige primero ese workflow. |

### Pasos de mensajería

| Mensaje | Qué significa |
|---|---|
| **No llegó ningún mensaje a "canal" en 5000 ms (timeout).** | Un paso **receive** no recibió ningún mensaje. |
| **Llega un mensaje al canal** | Lo que espera un paso receive. |
| **Se envió el mensaje a "canal"** / **Llegó un mensaje de "canal"** | El paso funcionó. |
| **Simulado: Luvin todavía no se conecta a brokers, así que este paso usa los ejemplos del AsyncAPI.** | Un paso de mensajería se ejecutó en simulación, también en una ejecución real. Mira [Pasos de mensajería](/es/design/messaging/). |
| **El mensaje no cumple el contrato: ...** | Una advertencia, como una respuesta fuera de contrato. |
| **El criterio no se cumplió y faltan datos para armarlo: ...** | Faltan datos de un paso anterior. |

## Dato no disponible

Esta etiqueta aparece cuando una expresión del paso no tuvo valor. Las causas habituales:

1. **Un input no tiene valor.** Complétalo en la pestaña **Inputs** o en el caso.
2. **Un paso anterior no capturó su output.** Abre ese paso y revisa sus outputs.
3. **El paso anterior devolvió una lista**, y el paso necesita un elemento. Mira [Elige un elemento de una lista](/es/test/lists/).

## Cómo se explica un caso

Cada caso termina con un veredicto y una frase.

| Frase | Veredicto | Qué significa |
|---|---|---|
| **Todos los pasos cumplieron sus criterios.** | Pasó | El camino feliz funcionó. |
| **El workflow terminó bien, con advertencias en: "a".** | Pasó | Funcionó, pero esos pasos tienen advertencias. |
| **Falló en el paso "a": ...** | No pasó | Sigue el primer paso que falló y su motivo. |
| **Falló en el paso "a" ...** cuando el motivo es **Red o CORS** | No concluyente | No hubo respuesta de la API, así que el caso no se puede juzgar. |
| **"a" rechazó la petición con 400, como se esperaba.** | Pasó | Un caso de rechazo: la API dijo que no. |
| **"a" aceptó la petición (200) cuando debía rechazarla con 400.** | Advertencia o No pasó | Mira más abajo. |
| **"a" respondió 500; se esperaba 400.** | Advertencia o No pasó | La API la rechazó con otro status. |
| **"a" respondió 200 y se esperaba 404** | No pasó | Un caso con su propio status esperado. |
| **Con la respuesta 404, "a" activó "notFound" (end), como se esperaba.** | Pasó | Un caso para una acción `onFailure` o `onSuccess`. |
| **... activó "x" en lugar de "y". Revisa el orden o los criterios de las acciones** | No pasó | Se usa la primera acción cuyos criterios se cumplen. |
| **... ninguna acción de "a" coincidió, así que no se activó "y".** | No pasó | Revisa los criterios de las acciones. |
| **No se llegó a "b": el workflow se detuvo en "a" (...).** | No concluyente | Falló un paso anterior. La frase agrega una pista para revisar los pasos anteriores. |
| **El workflow se detuvo antes, en "a" (...), así que no se pudo comprobar "b".** | No concluyente | Lo mismo, para un caso de rechazo. |
| **No hubo respuesta de la API.** | No concluyente | El paso no recibió respuesta. |
| **No se llegó a ejecutar "b".** | No concluyente | El workflow terminó antes. |

### Por qué un caso termina en Advertencia

Un caso termina en **Advertencia** solo cuando es un caso de **Validación de datos** con el status que sugirió Luvin, y la API respondió otra cosa, normalmente aceptando datos que el contrato dice que debía rechazar. El workflow sigue funcionando. Revísalo con quienes construyen la API. Si tú eliges el status esperado, la misma diferencia es **No pasó**. Mira [Ajusta un caso](/es/test/adjust-cases/).

## Relacionado

- [Criterios de éxito](/es/reference/criteria/)
- [Lee los resultados](/es/test/results/)
- [Depura un workflow que falla](/es/tutorials/debug-failure/)
- [Solución de problemas](/es/get-started/troubleshooting/)
