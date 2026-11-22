---
title: Preguntas frecuentes
description: Respuestas cortas a las preguntas que más hacen testers y gente de producto, cada una con un enlace a la página que la explica completa.
sidebar:
  order: 11
---

Respuestas cortas, cada una con un enlace a la página que profundiza.

## Sobre Luvin

### ¿Para qué sirve Luvin?

Luvin prueba una cadena de llamadas a APIs, llamada **workflow**, donde cada llamada usa datos de las anteriores. Diseñas el workflow a partir de tus contratos, lo ejecutas y lees un veredicto en palabras simples. No es una herramienta de automatización ni de orquestación. Mira [Qué es Luvin](/es/get-started/welcome/).

### ¿Qué no hace Luvin?

- **No es una herramienta de automatización ni de orquestación.** Luvin sirve para diseñar, depurar y demostrar workflows de APIs. No ejecuta integraciones en producción.
- **No es un runner de CI.** Su runner ejecuta workflows y requests dentro de la app, en tu equipo. Lo que llevas a tu pipeline son los archivos Arazzo que escribe, con cualquier runner de Arazzo.
- **No reemplaza a tu cliente de APIs.** Luvin envía requests sueltos para ayudarte a depurar un paso. Conserva tu cliente de APIs para los requests sueltos y usa Luvin para la cadena.
- **No es un servicio en la nube.** Todo corre en tu equipo. No hay backend ni cuenta.
- **Todavía no se conecta a brokers de mensajería.** Los pasos de mensajería se simulan. Mira [Limitaciones conocidas](/es/reference/limitations/).

### ¿Necesito una cuenta?

No. Luvin no tiene backend ni cuenta. Lo abres y trabajas. Mira [Privacidad y seguridad](/es/reference/privacy/).

### ¿Mis datos se envían a algún lado?

No. Todo corre en tu equipo. El único tráfico son los requests que ejecutas contra tus propias APIs y los contratos que decides descargar desde una URL. Mira [Privacidad y seguridad](/es/reference/privacy/).

### ¿Qué es Arazzo?

Arazzo es un estándar abierto de la OpenAPI Initiative para describir una secuencia de llamadas a APIs en un archivo. Luvin lo escribe por ti cuando diseñas un workflow, y lo lee cuando abres uno. Mira [La vista del archivo Arazzo](/es/design/arazzo-file/) y el [Glosario](/es/reference/glossary/).

### ¿Qué versiones de las especificaciones soporta?

Arazzo 1.0 y 1.1, OpenAPI 3.x, y AsyncAPI 2.x y 3.x. Mira [Soporte de especificaciones](/es/reference/support/).

### ¿Puedo usar Luvin en español?

Sí. La interfaz, los mensajes y el reporte HTML están en español y en inglés. Cambia el idioma en **Preferencias**. Mira [Recorrido por la interfaz](/es/get-started/interface/).

## Para empezar

### ¿Puedo usarlo sin OpenAPI?

Sí. Arrastra requests guardados al canvas en lugar de operaciones de un contrato. Puedes crear requests desde cero, importar un comando cURL o importar una colección de Postman o Bruno. Mira [Armar desde requests guardados](/es/design/from-requests/) y [Trae tus propios archivos y requests](/es/get-started/import/).

### ¿Tengo que escribir YAML?

No. Diseñas en el canvas y Luvin escribe el archivo Arazzo. Mira [Diseñar un workflow](/es/design/overview/).

### ¿Puedo editar el YAML a mano?

Sí. La pestaña **YAML** es el mismo archivo que edita el canvas. Lo que escribes a mano se conserva, y la pestaña lo valida mientras escribes. Mientras el texto no se puede leer, **Ejecutar** queda desactivado hasta que lo corrijas. Mira [La pestaña YAML](/es/design/arazzo-editor/).

### ¿Dónde se guardan mis archivos?

En la carpeta del workspace que elijas: una carpeta con una subcarpeta por colección, todo en archivos de texto. Sin workspace, la sesión se guarda en este dispositivo. Mira [Qué hay en el disco](/es/workspaces/files/) y [Usar Luvin sin workspace](/es/workspaces/without-workspace/).

### ¿Puedo trabajar con mi equipo en git?

Sí. Un workspace es una carpeta de archivos de texto y los valores de los secretos no están en ellos, así que puedes hacer commit. Mira [Llevar un workspace en git](/es/workspaces/git/).

## Ejecutar y resultados

### ¿Cuál es la diferencia entre API real y Simulación?

**API real** envía los requests a las URLs del ambiente activo. **Simulación** responde con los ejemplos del contrato, sin red y sin credenciales. Mira [Simulación](/es/test/simulation/).

### ¿Por qué la ejecución se pausa con un diálogo sobre una lista?

Un paso devolvió una lista y un paso posterior la usa, así que Luvin pregunta con qué elemento continuar. Contra la **API real** pregunta incluso cuando la lista tiene un solo elemento. En **Simulación** pregunta solo cuando la lista tiene más de uno. En **Las próximas veces:** puedes guardar una regla, como un elemento al azar, para que no vuelva a preguntar. El runner nunca pregunta: usa la regla guardada o el elemento que dice el diseño. Mira [Elige un elemento de una lista](/es/test/lists/).

### ¿Por qué un caso terminó en Advertencia?

Un caso en **Advertencia** es un caso de validación de datos donde la API respondió un status distinto del que sugirió Luvin, normalmente aceptando datos que el contrato dice que debía rechazar. El workflow sigue funcionando. Mira [Por qué falló un paso o un caso](/es/reference/failure-reasons/).

### ¿Por qué un caso es No concluyente?

Luvin no pudo juzgarlo: la API no respondió, o el workflow se detuvo antes del paso que el caso revisa. Corrige el problema anterior y ejecuta de nuevo. Mira [Lee los resultados](/es/test/results/).

### ¿Por qué falló un paso si la API respondió 200?

No se cumplió un [criterio de éxito](/es/reference/criteria/) del paso, por ejemplo un dato con otro valor. Abre el paso: el motivo dice qué se esperaba y qué llegó. Sin criterios, cualquier 2xx pasa.

### ¿Una ejecución real cambia datos en mi API?

Puede hacerlo. Los pasos con POST, PUT, PATCH o DELETE envían requests reales al ambiente, y Luvin te pide confirmar antes de ejecutarlos. Elige un ambiente de pruebas o usa Simulación. Mira [Ejecutar](/es/test/run/).

### ¿Puedo ejecutar varios workflows a la vez, o con datos de un archivo?

Sí, con el runner. Ejecuta los workflows elegidos en orden, una o varias vueltas. Con un archivo CSV o JSON, cada fila es una vuelta: las columnas con el nombre de un input lo reemplazan. Mira [El runner](/es/runner/overview/).

### ¿Puedo probar sin la API real?

Sí, de dos formas. **Simulación** responde con los ejemplos del contrato, sin red. Un [mock server](/es/mocks/overview/) responde en tu equipo como tu API, así los requests y los workflows van por la red sin tocar la real.

### ¿Luvin hace pruebas de carga o de rendimiento?

Sí. En el runner, elige **Rendimiento**: muchos usuarios virtuales repiten los requests, o el camino feliz de cada workflow, durante un tiempo. La carga sale de tu equipo, así que sirve para decenas o un centenar de usuarios. Solo mide la API real, y Luvin te pide confirmar antes de empezar. Si el ambiente parece producción, escribes su nombre para confirmar. Mira [Rendimiento](/es/runner/performance/).

### ¿Cómo comparto los resultados?

Pulsa **Reporte** en el encabezado de los resultados para obtener un reporte HTML autocontenido y sin credenciales, o **JSON** para exportar los resultados. Mira [Reportes](/es/test/reports/).

## Secretos, ambientes y límites

### ¿Dónde se guardan los secretos?

En los archivos del workspace solo se escriben los nombres de los secretos. Los valores quedan cifrados en tu equipo, con el llavero del sistema. Mira [URLs base, variables y secretos](/es/environments/variables-and-secrets/).

### ¿Soporta OAuth 2.0?

Sí. Se configura por API o por workflow sin cambiar el Arazzo; el token se obtiene una vez y se reutiliza. Mira [OAuth 2.0](/es/authorization/oauth2/).

### ¿Soporta Kafka, AMQP o MQTT?

Todavía no. Los pasos de AsyncAPI funcionan, pero siempre se simulan con los ejemplos del contrato, también en una ejecución real. Mira [Pasos de mensajería](/es/design/messaging/) y [Limitaciones conocidas](/es/reference/limitations/).

### ¿Puedo ejecutarlo en CI?

Luvin es una herramienta para diseñar, depurar y mostrar workflows. No es un runner de CI. Los archivos Arazzo que escribe se pueden llevar a una herramienta que ejecute Arazzo en CI, como Redocly Respect. Mira [Limitaciones conocidas](/es/reference/limitations/).

### ¿Cómo genero datos aleatorios, como un email nuevo en cada ejecución?

Escribe una plantilla como `{{email}}` o `{{$randomUUID}}` en un valor. Mira [Variables dinámicas](/es/environments/dynamic-variables/) y [Expresiones de runtime](/es/reference/expressions/).

## Relacionado

- [Solución de problemas](/es/get-started/troubleshooting/)
- [Soporte de especificaciones](/es/reference/support/)
- [Glosario](/es/reference/glossary/)
