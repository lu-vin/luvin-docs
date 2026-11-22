---
title: Glosario
description: Las palabras que usa Luvin, una por concepto.
sidebar:
  order: 6
---

| Palabra | Qué significa |
|---|---|
| **Workflow** | Una secuencia de llamadas a APIs en la que cada paso puede usar datos de los anteriores. |
| **Paso** | Una llamada dentro de un workflow: una operación de una API, un mensaje u otro workflow. |
| **Input** | Un valor con el que empieza el workflow o un caso. |
| **Output** | Un valor que un paso expone a los siguientes, tomado de su respuesta. |
| **Caso** | Una ejecución de un workflow con inputs concretos y un resultado esperado. |
| **Veredicto** | Cómo terminó un caso: pasó, no pasó, advertencia o no concluyente. |
| **Contrato** | Un archivo OpenAPI o AsyncAPI que describe una API. |
| **Arazzo** | El archivo de estándar abierto donde se escribe un workflow. |
| **Ambiente** | Las URLs base, variables y secretos de un lugar, como local o producción. |
| **Colección** | Una carpeta con los contratos, archivos Arazzo, ambientes, casos y requests de un proyecto. |
| **Workspace** | Una carpeta que contiene colecciones. |
| **Request** | Una sola llamada a una API guardada por separado, fuera de un workflow. |
| **Simulación** | Una ejecución que se responde con los ejemplos del contrato, sin llamadas de red. |
| **Secreto** | Una variable cuyo valor nunca se escribe en los archivos del workspace. Solo se escribe su nombre. |
| **API real** | Un modo de ejecución que llama a la API con las URLs base y las credenciales del ambiente activo. |
| **Reutilizable** | Un parámetro o una acción declarados una vez en `components` y usados por referencia desde varios pasos. |
| **dependsOn** | Un workflow que necesita que otro corra primero. Sus outputs quedan disponibles como `$workflows.<id>.outputs`. |
| **Dev Tools** | El panel con las pestañas Console, Network, Performance y Terminal. Mira [Dev Tools](/es/dev-tools/overview/). |
| **Sesión** | Lo que Luvin guarda en este dispositivo cuando trabajas sin workspace, sin credenciales. |
| **Runner** | Ejecuta varios requests o workflows de una colección en orden, una o varias vueltas. La ejecución es **Funcional** (revisa que cada uno responda bien) o de **Rendimiento** (muchos usuarios a la vez). Mira [El runner](/es/runner/overview/). |
| **Vuelta** | Una pasada del runner por los requests o workflows elegidos. Con un archivo de datos CSV o JSON, cada fila es una vuelta. |
| **Usuario virtual** | En una prueba de rendimiento, un usuario simulado que repite la secuencia por su cuenta, con sus propias variables y cookies. La carga sale de tu equipo. Mira [Rendimiento](/es/runner/performance/). |
| **Forma de la carga** | Cómo cambia la cantidad de usuarios virtuales durante una prueba de rendimiento: **Fija**, **Subida gradual**, **Pico repentino** o **Pico sostenido**. |
| **Cuello de botella** | El request o paso de un workflow que es claramente más lento que el resto en una prueba de rendimiento, según su p95. El resultado lo nombra después de **Lo más lento:** y marca su fila como **el más lento**. |
| **Mock server** | Un servidor en tu equipo que responde como tu API, con los ejemplos del contrato, los ejemplos guardados de los requests o las rutas que escribes. Mira [Mock servers](/es/mocks/overview/). |
| **Regla para elegir de una lista** | Qué hacer cuando un paso devuelve una lista y un paso posterior usa un elemento, guardado en el paso del Arazzo como `x-luvin-pick`: usar el que dice el diseño, elegir uno al azar, uno distinto en cada vuelta, el que cumpla una condición sobre un campo, o todos. Con una regla, Luvin no pregunta, tampoco en el runner. Mira [Listas](/es/test/lists/). |
| **Historial** | Los requests que enviaste y las ejecuciones de la colección, incluidas las del runner y las de rendimiento, guardados por colección. Mira [Historial](/es/workspaces/history/). |

## Relacionado

- [Workspaces y colecciones](/es/workspaces/overview/)
- [Soporte de especificaciones](/es/reference/support/)
