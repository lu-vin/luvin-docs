---
title: Mensajes del análisis y del contrato
description: Qué informan el análisis de un archivo Arazzo y la revisión de un contrato, qué significa cada mensaje y qué hacer con él.
sidebar:
  order: 10
---

Luvin revisa tus archivos sin ejecutar nada. Lee el archivo Arazzo e informa qué falta, qué está mal o qué es riesgoso. Hace lo mismo con un contrato que editas. Esta página lista esos mensajes y qué hacer con cada uno.

## Dónde los ves

| Dónde | Qué muestra |
|---|---|
| La pestaña **YAML** | La barra dice cuántos errores y advertencias tiene el archivo. Cada problema aparece subrayado y listado bajo el texto en **Problemas**. Las notas que solo informan aparecen en **Notas**. Haz clic en una para ir a su línea. |
| La pestaña **Resumen** de un workflow | **Validación general** para todo el archivo y **Validación del workflow** para el workflow abierto. |
| Un paso | Los problemas de ese paso, en su panel. |
| El editor de un **contrato** | Cada problema aparece subrayado en el YAML del contrato y listado sobre la vista previa, con su línea. |

Cada mensaje tiene un nivel.

| Nivel | Significado |
|---|---|
| **Error** | Algo está mal y el workflow, o un paso, no va a funcionar. |
| **Advertencia** | Puede funcionar, pero probablemente no es lo que quieres. |
| **Info** | Una nota. No hay nada mal. |

![La pestaña YAML con el archivo Arazzo y una lista de problemas debajo](/media/es/yaml-editor.webp)

## Mensajes sobre el archivo Arazzo

### El archivo y sus contratos

| Mensaje | Nivel | Qué hacer |
|---|---|---|
| **Versión de Arazzo "2.0" no reconocida; se espera 1.x.** | Advertencia | Pon `arazzo:` en `1.0.1` o `1.1.0`. |
| **El Arazzo es de la versión 1.2; Luvin soporta hasta la 1.1, así que algunos campos nuevos pueden ignorarse.** | Advertencia | Ten en cuenta que algunos campos no hacen nada. |
| **Falta info.title en el documento Arazzo.** | Advertencia | Agrega un `title` en `info`. |
| **El Arazzo no declara sourceDescriptions.** | Error | Agrega los contratos que usan los workflows. |
| **Falta el contrato de la fuente "x" (url).** | Error | Agrega el archivo del contrato a la colección. Mira [Agregar un contrato](/es/contracts/add/). |
| **La fuente "x" es de tipo "arazzo"; solo se ejecutan contratos OpenAPI y AsyncAPI.** | Advertencia | Usa un contrato OpenAPI o AsyncAPI. |
| **"x" referencia archivos que no se cargaron: ... Súbelos junto con el contrato para resolver esos $ref.** | Error | Agrega los archivos que faltan. Mira [Referencias entre archivos](/es/contracts/references/#referencias-que-faltan). |
| **El Arazzo no tiene workflows.** | Error | Crea un workflow. |
| **workflowId duplicado: "x".** | Error | Dale a cada workflow su propio id. |
| **Hay pasos de AsyncAPI. Luvin todavía no se conecta a brokers ..., así que esos pasos siempre se simulan ...** | Info | Nada. Mira [Pasos de mensajería](/es/design/messaging/). |
| **La fuente "auth" es otro documento Arazzo (auth.arazzo.yaml): sus workflows se pueden usar como $sourceDescriptions.auth.<workflowId>.** | Info | Nada. Mira [Workflows que usan otros workflows](/es/design/dependencies/). |
| **Antes de este workflow se ejecuta "a" (dependsOn); sus outputs quedan en $workflows.<id>.outputs.** | Info | Nada. |
| **La referencia ... no existe en components.** | Error | Crea el reutilizable o corrige el nombre. Mira [Reutilizables](/es/design/reusables/). |

### Pasos y operaciones

| Mensaje | Nivel | Qué hacer |
|---|---|---|
| **stepId duplicado: "x".** | Error | Dale a cada paso su propio id. |
| **Cada paso debe tener exactamente uno de: operationId, operationPath, channelPath o workflowId.** | Error | Deja uno de los cuatro. |
| **La operación "x" no existe en los contratos cargados.** | Error | Corrige el `operationId` o carga el contrato. |
| **"x" no es la forma estándar de Arazzo. Se resolvió como GET /pokemon/{name}; corrígelo a "$sourceDescriptions.pokeapi.getPokemon".** | Advertencia | Usa la forma que propone. |
| **"x" existe en varias fuentes; se usa "pokeapi".** | Advertencia | Usa `$sourceDescriptions.<fuente>.<operationId>`. |
| **El operationPath apunta a una ruta que no existe en el contrato; se resolvió como ...** | Advertencia | Quita el prefijo del servidor de la ruta, como dice el mensaje. |
| **No se encontró la operación de operationPath "x".** | Error | Corrige la ruta. |
| **No se encontró el canal "x" en ningún AsyncAPI cargado.** | Error | Carga el contrato AsyncAPI o corrige el canal. |
| **El canal "x" tiene más de una operación; se usa la de tipo "send".** | Advertencia | Escribe `action: send` o `action: receive` en el paso. |
| **El sub-workflow "x" no existe.** | Error | Corrige el `workflowId`. |
| **El paso dice "action: send", pero la operación del AsyncAPI es "receive". Se usa la del paso.** | Info | Revisa cuál quieres. |
| **"action" y "correlationId" solo aplican a pasos de AsyncAPI; en un paso HTTP se ignoran.** | Advertencia | Quítalos. |
| **"correlationId" solo aplica a pasos receive; en un send se ignora.** | Advertencia | Quítalo. |
| **Un paso receive no envía nada: su requestBody se ignora.** | Advertencia | Quita el body. |
| **Paso receive sin "timeout": con un broker real esperaría el mensaje indefinidamente.** | Info | Agrega un `timeout`. |
| **En un mensaje solo se envían parámetros "in: header"; se ignoran: ...** | Advertencia | Pásalos a headers. |

### Datos entre pasos

| Mensaje | Nivel | Qué hacer |
|---|---|---|
| **Usa $steps.a.outputs.id, pero el paso "a" no existe.** | Error | Corrige el id del paso. |
| **Usa un output de "a", que se ejecuta después.** | Advertencia | Mueve el paso "a" antes de este. Los pasos corren en orden. |
| **Usa $steps.a.outputs.id, pero "a" no declara ese output.** | Error | Agrega el output al paso "a". Mira [Outputs](/es/design/outputs/). |
| **Usa $inputs.x, que no está definido en inputs del workflow.** | Advertencia | Agrega el input en la pestaña **Inputs**. |
| **El contrato exige el parámetro query "x" y el paso no lo envía.** | Advertencia | Agrega el parámetro. Mira [Parámetros y body](/es/design/parameters-and-body/). |
| **El contrato exige un body y el paso no define requestBody.** | Advertencia | Agrega un body. |
| **Un parámetro "in: querystring" no puede combinarse con parámetros "in: query" en la misma operación.** | Advertencia | Deja solo un tipo. |

### Criterios, errores y dependencias

| Mensaje | Nivel | Qué hacer |
|---|---|---|
| **Sin successCriteria: se considerará exitoso cualquier respuesta 2xx.** | Info | Agrega un criterio si necesitas una revisión más estricta. Mira [Criterios de éxito](/es/reference/criteria/). |
| **successCriteria está vacío; Arazzo 1.1 exige al menos un criterio si se declara.** | Advertencia | Agrega uno, o quita la lista vacía. |
| **Los successCriteria esperan 200, pero el contrato de GET /x solo documenta 404.** | Advertencia | Alinea el Arazzo y el contrato. |
| **En ... hay 2 condiciones $statusCode == (200, 201). Arazzo exige que se cumplan todas a la vez, así que nunca se cumplirán. Únelas en una sola: "..."** | Error | Usa la condición unida que te da el mensaje. |
| **1 condición(es) están marcadas como "type: jsonpath" pero son condiciones simples ...** | Advertencia | Quita `type: jsonpath` y `context` en ellas. |
| **La acción "x" apunta al paso inexistente "y".** | Error | Corrige el destino del `goto`. |
| **La acción "x" (retry) apunta al paso inexistente "y".** | Error | Corrige el `stepId` de la acción `retry`. |
| **La acción "x" apunta al workflow "y", que no se encuentra. ...** | Error | La frase del final dice por qué. Corrige el `workflowId` de la acción. |
| **"ref" no es una referencia a otro documento Arazzo.** | Error | Escribe la referencia como `$sourceDescriptions.<fuente>.<workflowId>`. |
| **"ref" usa la fuente "s", que este Arazzo no declara en sourceDescriptions.** | Error | Agrega la fuente. |
| **"ref" usa la fuente "s", que es de tipo "openapi": para llamar a un workflow de otro documento la fuente tiene que ser de tipo arazzo.** | Error | Pon `type: arazzo` en la fuente. |
| **"ref" apunta a ./auth.arazzo.yaml, que no está en la colección: agrega ese archivo Arazzo.** | Error | Importa el archivo a la misma colección. |
| **"ref": el workflow "w" no existe en auth.arazzo.yaml.** | Error | Corrige el id del workflow. |
| **La acción "x" es de tipo goto y define retryLimit/retryAfter, que solo aplican a type: retry.** | Advertencia | Quita esos campos. |
| **dependsOn menciona el paso "x", que no existe en este workflow.** | Error | Corrige el nombre. |
| **dependsOn menciona "x", que se ejecuta después. ... muévelo después de "x".** | Advertencia | Mueve el paso. |
| **dependsOn menciona "x", pero el workflow "y" no existe.** | Error | Corrige el nombre. |

El análisis también muestra una tabla de **Cobertura de respuestas**: para cada respuesta que documenta el contrato, si el workflow la maneja. Mira [Éxito y errores](/es/design/success-and-errors/).

## Mensajes sobre un contrato

Vienen del editor de un contrato OpenAPI o AsyncAPI. Te dicen qué corregir en el contrato.

| Mensaje | Nivel | Qué hacer |
|---|---|---|
| **El $ref «x» no apunta a nada dentro del contrato.** | Error | Corrige la referencia. |
| **Falta la sección info (título y versión del contrato).** | Advertencia | Agrega `info`. |
| **Falta info.title.** / **Falta info.version.** | Advertencia | Agrégalo. |
| **Es Swagger 2.0: Luvin trabaja con OpenAPI 3.x; conviene migrarlo.** | Advertencia | Convierte el contrato a OpenAPI 3. |
| **Versión de OpenAPI «x»: se espera 3.x.** | Advertencia | Pon `openapi: 3.0.3` o similar. |
| **No define servers: la URL base se toma del ambiente.** | Info | Nada, si el ambiente tiene la URL base. |
| **Falta la sección paths: el contrato no tiene operaciones.** | Error | Agrega `paths`. |
| **La ruta «x» debe empezar con /.** | Error | Agrega el `/`. |
| **El operationId «x» está repetido: un Arazzo no sabrá cuál usar.** | Error | Dale a cada operación su propio id. |
| **GET /x no tiene operationId: el Arazzo tendrá que usar operationPath.** | Info | Agrega un `operationId`. |
| **GET /x no documenta ninguna respuesta.** | Advertencia | Documenta al menos la respuesta exitosa. |
| **«x» no es un código de respuesta válido (usa 200, 4XX o default).** | Advertencia | Usa un código, `4XX` o `default`. |
| **Parámetro incompleto: necesita name e in (query, header, path o cookie).** | Error | Completa los dos campos. |
| **El parámetro de ruta «x» debe tener required: true.** | Error | Pon `required: true`. |
| **El parámetro de ruta «x» no aparece en «/y».** | Error | Quítalo o agrégalo a la ruta. |
| **GET /y usa {x} en la ruta pero no lo declara como parámetro.** | Error | Declara el parámetro. |
| **Versión de AsyncAPI «x»: se espera 2.x o 3.x.** | Advertencia | Usa una versión soportada. |
| **Falta la sección channels.** | Error | Agrega `channels`. |
| **La operación «x» necesita action: send o receive.** | Error | Agrega `action`. |
| **La operación «x» necesita channel con un $ref a un canal.** | Error | Agrega la referencia. |

Cuando cambias un contrato que usan workflows, la barra sobre la vista previa del editor lista los problemas nuevos que tu cambio causa en ellos. Mira [Cuando un cambio rompe un workflow](/es/contracts/impact/).

## Relacionado

- [La pestaña YAML](/es/design/arazzo-editor/)
- [Editar un contrato](/es/contracts/edit/)
- [Por qué falló un paso o un caso](/es/reference/failure-reasons/)
- [Soporte de especificaciones](/es/reference/support/)
