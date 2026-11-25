---
title: Novedades
description: Qué puede hacer Luvin, versión por versión, agrupado por fecha y escrito para quienes lo usan.
sidebar:
  order: 12
---

Esta página lista qué puede hacer Luvin y cuándo llegó cada capacidad. Lo más nuevo va primero. La versión actual es la **0.2.0-beta.10**.

## 25 de noviembre de 2026 · versión 0.2.0-beta.10

**El lienzo del workflow, rediseñado.**

- **Tarjetas completas y un lienzo más amplio.** Cada paso se ve entero, con controles para minimizarlo; el workflow empieza en **Inicio** y termina en **Fin del workflow**, y una falla se ve en rojo. **＋ Paso** reemplaza la columna de la paleta, y el panel del paso se abre sobre el lienzo, con pestañas. Mira [Diseñar workflows](/es/design/overview/).
- **Los datos en chips, sin flechas.** Cada dato que recibe un paso dice de dónde viene; la línea aparece solo al elegir o pasar sobre un paso. Mira [Conectar datos entre pasos](/es/design/wire-data/).
- **Todas las rutas de Arazzo en el lienzo**, con un color por escenario, un selector para cada acción (`goto`, `retry`, `end`) y un panel **Rutas** para ordenarlas, editarlas y quitarlas.
- **Por revisar** lee el Arazzo como lo haría la ejecución y marca lo que el esquema no ve, como una condición JSONPath escrita como comparación, que nunca se cumple.
- **Ejecuta y depura sobre el lienzo.** Cada tarjeta muestra si pasó, con una comparación con la ejecución anterior. Pausa antes de un paso, cambia lo que recibe (también los campos del body JSON) y sigue; o ejecuta solo un paso, hasta un paso o desde un paso. Mira [Ejecutar sobre el lienzo](/es/test/run-on-canvas/) y [Depurar](/es/test/debug/).
- **Prueba cada ruta sin tu API.** Luvin simula la respuesta que lleva a cada ruta, y la cobertura muestra cuáles faltan, qué hizo cada caso y qué errores no tienen ruta. Mira [Probar rutas y cobertura](/es/test/probe-routes/).
- **Copia, pega, duplica y extrae pasos.** Los pasos elegidos se copian a otro workflow, y unos pasos seguidos se extraen a un workflow nuevo con una vista previa.
- **Patrones de Arazzo desde ＋ Paso:** recorrer todas las páginas, esperar hasta que termine, e iniciar sesión y usar el token. También con los requests de una colección.
- **El YAML al lado del lienzo**, y un minimapa.
- **Corrección al armar desde requests:** los datos se conectan según lo que guardan los scripts de Postman, un id nunca se toma de un paso que habla de otra cosa, los datos generados como `{{$randomFirstName}}` se respetan, y un request que espera un error pasa con ese error. Mira [Armar desde requests guardados](/es/design/from-requests/).

## 24 de noviembre de 2026 · versiones 0.2.0-beta.8 y 0.2.0-beta.9

**El token del login pasa a los otros pasos, y un workflow que se lee de un vistazo.**

- **El token del login, en los pasos siguientes.** Cada paso dice de dónde sale su autorización: del ambiente, del token de un paso o de ninguna. Luvin reconoce el token leyendo el script del login, sin ejecutarlo, y lo conecta al armar el workflow, escrito en Arazzo estándar. Mira [Autorización de un workflow](/es/authorization/workflow/).
- **Pasos con el nombre que les diste.** Un paso armado desde un request se titula con el nombre del request y recibe un id corto y legible. Los contratos generados con la misma URL base son una sola API.
- **Campos obligatorios sin ventanas.** Se marcan en el mismo panel del paso.
- **La colección, en pestañas como Postman**, con la documentación de Luvin al lado. Mira [El resumen de la colección](/es/workspaces/collection-overview/).
- **El runner lista los tests y comprobaciones de cada request**, como el runner de Postman.
- **Una colección de Postman con variables secretas** corre como en Postman, y sus valores guardados se ven y se editan en las dos vistas de variables.
- **Abrir una carpeta que no es un workspace** ya no crea uno sin avisar.

## 23 de noviembre de 2026 · versiones 0.2.0-beta.5 y 0.2.0-beta.6

**Variables en cuatro niveles, scripts de Postman y Bruno, y solo la app de escritorio.**

- **Luvin es una app de escritorio para macOS y Windows.** Los ejemplos y el tour viven en la carpeta de datos de la app. Mira [Instalar y abrir Luvin](/es/get-started/install/).
- **Cuatro niveles de variables, como Bruno:** ambiente global del workspace, ambiente de la colección, variable de la colección y variable del request, con un solo orden para resolverlas. El panel **Variables** las muestra todas, como "All variables" de Postman, y la tarjeta de una variable la crea o la mueve con **Agregar a**. Mira [Dónde vive una variable](/es/environments/variable-levels/).
- **Los ambientes globales y el de la colección, juntos** en una píldora dividida, como en Bruno.
- **Variables en el editor del body**, creadas con su valor; bodies JSON con comentarios; y un panel con las variables del request. Mira [Parámetros, headers y body](/es/requests/params-headers-body/).
- **Scripts antes del request y después de la respuesta**, como en Postman: en el request, la carpeta o la colección, con la API `pm.*` y la de Bruno (`bru.*`), `pm.sendRequest` y las librerías de Postman, en un entorno aislado. También corren en el runner y en las pruebas de rendimiento. Los scripts de una colección que no escribiste esperan a que confíes en ella. Mira [Scripts](/es/requests/scripts/).
- **Importar trae los scripts completos.** Los scripts de Postman y Bruno se guardan tal cual y corren como en el original, ya no se convierten. Cada variable llega a su nivel, y si la colección ya existe, Luvin pregunta si importar una copia o reemplazarla. Mira [Trae tus propios archivos y requests](/es/get-started/import/).
- **Paneles que cambian de tamaño**, como en Postman: la división entre request y respuesta, la barra de colecciones y los paneles laterales.
- **Otras mejoras:** renombrar un workspace renombra su carpeta; soltar un archivo de Postman o Bruno lo lleva al importador, aunque no haya una colección abierta; y ⌘Q guarda los cambios pendientes antes de cerrar.

## 19 de noviembre de 2026 · versiones 0.1.4 y 0.1.5

**Runner, pruebas de rendimiento, mock servers, historial y red.**

- **Runner de requests y de workflows.** Ejecuta varios requests o workflows en orden, una o varias vueltas, con un archivo de datos CSV o JSON. En los workflows ves y eliges los casos de cada uno, y las listas se eligen solas con una regla guardada en el paso. Mira [El runner](/es/runner/overview/).
- **Pruebas de rendimiento** para requests y workflows: usuarios virtuales, formas de carga (fija, subida gradual, pico repentino, pico sostenido), criterios para pasar y resultados por paso con el cuello de botella. Mira [Pruebas de rendimiento](/es/runner/performance/).
- **Mock servers locales** por colección, con las rutas de los ejemplos guardados o de un contrato, plantillas y respuestas alternativas. Mira [Mock servers](/es/mocks/overview/).
- **Historial** de requests y ejecuciones por colección, con búsqueda y para volver a ejecutar. Mira [Historial](/es/workspaces/history/).
- **Variables y comprobaciones después de la respuesta**, sin scripts. Al importar de Postman o Bruno, sus tests se convierten. Mira [Variables y comprobaciones](/es/requests/variables-and-checks/).
- **Red en la app de escritorio:** proxy, certificados de cliente y ajustes de los requests en las Preferencias. gRPC, WebSocket y el inicio de sesión OAuth usan los mismos ajustes. Mira [Ajustes de red](/es/get-started/network/).
- **En el diseño, un + para cada rama y entre los pasos.** "Si responde 404, ir a un paso nuevo" se arma desde la tarjeta del paso, y el (+) de cada flecha inserta un paso ahí. Mira [Éxito y errores](/es/design/success-and-errors/).
- **El tour guiado va por secciones cortas**, empezando por los workflows. Mira [El tour guiado](/es/get-started/guided-tour/).
- **Un error de escritura en el YAML ya no rompe la colección.** El archivo aparece como "no se puede leer", Ejecutar queda bloqueado y, al corregirlo, vuelven sus workflows con sus casos.
- **La simulación se nota.** Cada caso dice si se ejecutó contra tu API o en simulación, y el resumen avisa cuando nada llamó a tu API, para que un caso simulado que pasa no se lea como uno real. Mira [Resultados](/es/test/results/).
- **El ambiente siempre a la vista, y la barra lateral con paneles.** El ambiente activo se ve arriba a la derecha de la ventana, de su color (verde de Luvin por defecto), donde también lo cambias. Unos íconos arriba de la barra lateral cambian entre colecciones, ambientes, historial y mock servers. Cuando hay más pestañas de las que caben, unas flechas y una lista de todas las pestañas abiertas te llevan a ellas, y el + siempre se ve. Mira [Recorrido por la interfaz](/es/get-started/interface/) y [La barra lateral](/es/get-started/sidebar/).
- **Más seguro:** los secretos que guarda un request no aparecen en el historial ni en Network; un mock server solo responde a tu equipo; una respuesta comprimida gigante ya no llena la memoria; una redirección de https a http no lleva la autorización.
- **Ambientes más seguros y contratos que se quedan.** Cambiar de ambiente borra los valores guardados por los requests, los tokens de OAuth 2.0 y las cookies, así un token de `local` nunca llega a `production`. Un `{{nombre}}` que el ambiente activo no tiene muestra una franja amarilla en el request antes de enviarlo. En un workspace, un archivo que adjuntas para un contrato que falta se guarda en la carpeta de la colección, y los contratos descargados se vuelven a descargar al abrirla. Los inputs nuevos copian las reglas del contrato (`enum`, `pattern`, `format`, límites), así sus casos aparecen de inmediato. Mira [Ambientes](/es/environments/overview/) y [Contratos remotos y referencias](/es/contracts/remote-and-refs/).
- **Los contratos nuevos se usan de inmediato.** Un contrato que ningún archivo de workflow lista todavía (○) tiene sus operaciones en la paleta, y usar una lo suma al archivo. Un contrato que tenía un error de YAML carga apenas lo corriges, y la documentación del contrato empieza autorizada con un token de OAuth 2.0 pegado. Mira [Un contrato agregado después del archivo de workflow](/es/contracts/add/#un-contrato-agregado-después-del-archivo-de-workflow).
- **Renombrar una colección renombra su carpeta.** La carpeta del disco, `luvin.yaml`, sus secretos y su historial siguen al nombre nuevo. Mira [Renombrar una colección](/es/workspaces/collections/#renombrar-una-colección).
- **Eliminar casos generados, y más casos de seguridad.** Un caso generado que no quieres se puede eliminar; queda guardado en el archivo de escenarios y se restaura desde ⋯. **Sin credenciales** también cubre los pasos armados desde requests y las APIs con autorización puesta en Luvin. Contra la API real, una lista de un solo elemento también pregunta antes de seguir. Mira [Casos](/es/test/cases/).
- **El runner muestra con qué elemento sigue cada lista.** En el runner, **Listas en las respuestas** muestra, en ejecuciones funcionales y de rendimiento, cada lista que usan los pasos siguientes y el elemento con que sigue cada vuelta: la regla guardada o el que dice el diseño. Los resultados de una prueba de rendimiento cuentan los elementos usados de cada lista. Mira [Listas en el runner](/es/runner/workflows-lists/) y [Elementos usados de las listas](/es/runner/performance-results/#elementos-usados-de-las-listas).
- **Diseño: datos de outputs que son objetos, Supr y clic derecho en el lienzo.** Un parámetro puede tomar un dato de un objeto que devuelve un paso anterior o un workflow llamado, elegido en el diseño. Las listas que devuelve un workflow llamado preguntan el elemento al ejecutar. Las líneas de datos seleccionadas se quitan con Supr, y los pasos, las líneas y el fondo tienen menú de clic derecho. Mira [Conectar datos entre pasos](/es/design/wire-data/) y [Organizar un workflow](/es/design/organize/).
- **Las operaciones de AsyncAPI en la paleta.** Las operaciones que envían y reciben se arrastran al lienzo como cualquier operación. Luvin escribe el paso de mensajería: `action`, el header de correlación y el payload cableado desde los pasos anteriores, y en uno que recibe, el mismo id de correlación que el envío anterior y un tiempo límite. Mira [Pasos de mensajería](/es/design/messaging/#agrega-un-paso-de-mensajería).
- **Otras mejoras:** Enter en la URL envía el request y ⌘/Ctrl+Enter lo envía desde cualquier parte; deshacer en el diseño sobrevive al cambiar de pestaña; un Arazzo en JSON sigue en JSON; la paleta ⌘K tiene acciones y mock servers.

## 18 de noviembre de 2026 · versiones 0.1.2 y 0.1.3

**Más de 70 correcciones de los testers.**

- **Variables dentro de variables.** Una variable cuyo valor nombra otra, como `Bearer {{token}}` o `{{host}}/v1`, también se resuelve, como en Postman, en vez de salir tal cual. Mira [Usar variables](/es/environments/use-variables/).
- **Variables de ruta con su propio valor** en los requests, y sugerencias para crearlas.
- **Ejecución más fiel:** los bucles de `goto` y `retry` entre workflows se detienen, nunca se envía un request con un parámetro de ruta vacío, se usan los servidores que declara una operación, los filtros JSONPath siguen la especificación (RFC 9535) y un valor que la respuesta no trae ya no pasa una comprobación.
- **Autorización:** AWS SigV4, OAuth 2.0 (credenciales de cliente y refresh), Digest y NTLM corregidos.
- **Requests:** las respuestas binarias se descargan intactas, las cookies de una redirección se guardan, los números JSON grandes no pierden precisión y el body de un GET se envía.
- **Diseño:** las anclas y alias de YAML se respetan, y renombrar pasos, outputs, componentes o workflows actualiza lo que los usa, también en otros archivos Arazzo.
- **Workspaces, ambientes y secretos:** cada ambiente conserva su archivo, un archivo que no se puede leer nunca se sobrescribe, los cambios pendientes se guardan antes de cerrar y los secretos siguen a cada ambiente y request aunque cambien de nombre.

## 17 de noviembre de 2026

**Workflows de otros archivos Arazzo, retry con un paso y multipart.**

- **Usa un workflow de otro archivo Arazzo.** Declara el archivo como fuente con `type: arazzo` y usa `$sourceDescriptions.<fuente>.<workflowId>` en `dependsOn`, en un paso o en una acción `goto` o `retry`. En la pestaña **Diseño**, **Depende de** lista los workflows de los otros archivos y la paleta **Operaciones** tiene el grupo **De otros archivos Arazzo**. Mira [Workflows que usan otros workflows](/es/design/dependencies/) y [Usa un workflow de otro archivo Arazzo](/es/recipes/cross-document/).
- **`retry` con `stepId` ahora se ejecuta.** Ante una falla, Luvin ejecuta el paso que nombras y luego vuelve a intentar el paso que falló. Mira [Vuelve a iniciar sesión y reintenta](/es/recipes/retry-step/).
- **Los pasos de un workflow envían `multipart/form-data`.** Cada campo del payload es una parte. Un paso de workflow no envía archivos.
- **Un workflow llamado como paso toma sus valores por defecto** para los inputs que el paso no pasa.
- **Los archivos para tu equipo y tus herramientas están en inglés, sea cual sea el idioma de la app.** El reporte en JSON (`cases`, `verdict`, `steps`), los archivos de `scenarios/` (`defaults`, `cases`, `name`, `expect`) y el comentario al inicio de cada archivo del workspace. Los archivos de escenarios con las claves en español de versiones anteriores se siguen leyendo. Mira [Reportes](/es/test/reports/) y [Archivos de un workspace](/es/workspaces/files/).

**Pruebas con listas y un workspace más tranquilo.**

- **Elige con qué elemento de una lista continúa un caso.** Cuando un paso devuelve una lista que usan pasos posteriores, la ejecución se pausa y pregunta. Puedes elegir un elemento, varios o enviar la lista completa. Mira [Elige un elemento de una lista](/es/test/lists/).
- **Los datos de una lista se nombran sin su posición.** El builder muestra `cards/bank`, no `cards/0/bank`.
- **Edita el body de un paso en el diseñador** y alimenta sus datos desde inputs. Mira [Parámetros y body](/es/design/parameters-and-body/).
- **Genera los requests de una colección a partir de un contrato OpenAPI** y úsalos en un workflow. Mira [Generar requests desde un contrato](/es/requests/generate-from-contract/).
- **Detecta y completa lo que le falta a un workflow**, y decide qué campos de un request son obligatorios. Mira [Completa los datos que faltan](/es/design/complete-gaps/).
- **Empieza desde el ejemplo.** La pantalla de bienvenida abre el ejemplo Pokédex con menos decisiones.
- **Pantallas de inicio, barra lateral, casos y colección más claras.** Los resultados esperan en una barra abajo, y lo que abres con un clic ocupa una sola pestaña de vista previa.
- **Suelta contratos y archivos Arazzo en cualquier parte de un workspace.**
- **Elimina** workflows, contratos y ambientes desde la barra lateral, y **renombra** workflows. Una vista nueva muestra el resumen del archivo Arazzo.
- **El diagrama se abre con un zoom legible**, y un paso que agregas queda a la vista.
- **Una palabra por concepto** en toda la interfaz: workflow, input, caso, Ejecutar.
- **Una corrección:** un paso que responde el error esperado ahora se lee como que pasó en todos los tipos de caso, y un parámetro de ruta ya no recibe un caso de "input faltante", porque sin él la URL apunta a otro recurso.

## 16 de noviembre de 2026

**Un espacio de trabajo para requests e importaciones.**

- **Requests sueltos al nivel de Postman y Bruno**: la URL y sus parámetros query se mantienen sincronizados, y Luvin inicia sesión antes de enviar. Mira [Requests sueltos](/es/requests/overview/).
- **Importa colecciones de Postman y Bruno.** Mira [Trae tus propios archivos y requests](/es/get-started/import/).
- **Diseña workflows a partir de los requests de una colección.** Mira [Armar desde requests guardados](/es/design/from-requests/).
- **Elige el status esperado de un caso** y lee resultados sin contradicciones. Mira [Ajusta un caso](/es/test/adjust-cases/).
- **Resultados acoplados abajo**, e inicio de sesión automático antes de una ejecución.
- **Corrección en escritorio:** los requests pasan firewalls que rechazan clientes desconocidos, y los inicios de sesión conservan la identidad propia de Luvin.

## 15 de noviembre de 2026

**Luvin, con el builder visual.**

- **Nuevo nombre y logo:** la app ahora se llama Luvin.
- **Diseña workflows arrastrando.** Las operaciones del contrato se vuelven pasos y Luvin conecta los datos por reglas, sin IA. El diagrama es el canvas. Mira [Diseñar un workflow](/es/design/overview/).
- **Reutilizables**: guarda parámetros y acciones de error una vez y úsalos en varios pasos. Mira [Reutilizables](/es/design/reusables/).
- **Llama a un workflow como paso**, define outputs del workflow y `dependsOn` en el builder. Mira [Workflows que usan otros workflows](/es/design/dependencies/).
- **Clientes de requests, gRPC y WebSocket**, importación desde cURL y muchos tipos de autorización. Mira [Requests sueltos](/es/requests/overview/).
- **Autorización por API y por workflow** en una ejecución. Mira [Autorización de un workflow](/es/authorization/workflow/).
- **El ejemplo PayPal** con OAuth 2.0 y un webhook, y un tour guiado más largo. Mira [Los ejemplos incluidos](/es/reference/examples/).
- **Los ejemplos se abren como colecciones reales**, con documentación y un selector en la pantalla de bienvenida.
- **Resultados en palabras simples, un modo de interfaz simple y una elección de rol** para gente de producto.
- **Las plantillas `{{variable}}` y `{{$generador}}` se resuelven** dentro de los valores del Arazzo. Mira [Expresiones de runtime](/es/reference/expressions/).

## 14 de noviembre de 2026

**La app de escritorio y los workspaces.**

- **La app de escritorio.** Los instaladores no están firmados y se probaron en macOS. Mira [Instalar y abrir Luvin](/es/get-started/install/).
- **Un workspace en disco**, con colecciones que guardan varios archivos Arazzo, **ambientes** con colores, **variables y secretos**. Mira [Workspaces y colecciones](/es/workspaces/overview/).
- **Dev Tools** con Console, Network y Performance, y una **Terminal** integrada. Mira [Dev Tools](/es/dev-tools/overview/).
- **Edita contratos** junto a una vista previa de Swagger UI, **prueba una operación** y mira qué workflows afecta un cambio. Mira [Contratos](/es/contracts/overview/).
- **El ejemplo Pokédex** contra la PokéAPI pública y un **tour guiado** sobre él. Mira [El tour guiado](/es/get-started/guided-tour/).
- **Resumen de la colección** con versión, estadísticas y documentación generada.
- **Una interfaz simple** que oculta Dev Tools y la terminal.
- **`dependsOn` de workflows**, cookies en la app de escritorio y soporte de XPath 1.0.
- **Soporte de Arazzo 1.1, AsyncAPI y `$ref` externos.** Mira [Soporte de especificaciones](/es/reference/support/).
- **El editor del Arazzo** con validación en vivo y un diagrama que se puede arrastrar. Mira [La pestaña YAML](/es/design/arazzo-editor/).
- **Una corrección:** un input de ruta faltante ahora espera un 400 o 404 y muestra la URL a la que se llamó de verdad.

## 23 de octubre de 2026

**Casos, ambientes y fallas más claras.**

- **Por qué falla un criterio, dato por dato**, y una comparación entre el valor esperado y el recibido. Mira [Criterios de éxito](/es/reference/criteria/).
- **Ayuda cuando la API no responde**, con los headers de CORS que necesita. Mira [Ayuda de conexión](/es/dev-tools/connection-help/).
- **Se distinguen** una falla de conexión, una URL que falta y una ejecución cancelada.
- **Ambientes** (DEV, QA, UAT...) con sus propias URLs y credenciales, y el ambiente se muestra en el reporte.
- **Copia cualquier request como cURL**, con la API key de la query tapada.
- **Inputs anidados editados dato por dato**, con avisos mientras escribes cuando un valor no cumple el contrato.
- **Elige qué workflows probar**, con nombres legibles en casos, resultados y reportes.
- **Avance de una ejecución** con el caso actual y el tiempo restante, y una sesión que puedes continuar cuando vuelves.

## 22 de octubre de 2026

**La primera versión.**

- **Español e inglés** en la interfaz, los mensajes y los resultados, con un selector de idioma.
- **Un primer flujo para cargar contratos y archivos Arazzo**, ver los workflows y su diagrama, y generar casos de prueba.

## Relacionado

- [Los ejemplos incluidos](/es/reference/examples/)
- [Limitaciones conocidas](/es/reference/limitations/)
- [Soporte de especificaciones](/es/reference/support/)
