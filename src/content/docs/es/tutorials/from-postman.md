---
title: De una colección de Postman o Bruno a un workflow probado
description: Importa una colección que ya tienes, encadena dos requests guardados en un workflow, deja que Luvin sugiera las conexiones y agrega un caso con tus propios datos.
sidebar:
  order: 2
---

Vas a convertir una colección de Postman o Bruno en un workflow que crea una orden y la vuelve a leer, y luego lo probarás con tus propios datos. Necesitas unos 25 minutos, Luvin abierto con un workspace, y una colección exportada de Postman (JSON, v2.0 o v2.1) o la carpeta de una colección de Bruno. No hace falta ningún contrato OpenAPI.

El ejemplo usa una API de tienda con dos requests: **Create order**, y **Get order**, cuya ruta es `/orders/{{order_id}}`. Usa tus propios nombres.

:::caution
El workflow envía los requests de verdad. Apunta el ambiente a un servidor de pruebas, no a producción.
:::

## 1. Importa la colección

1. Haz clic en **+** (**Crear o importar**) a la derecha de las pestañas abiertas, y luego en **Importar de Postman o Bruno**. Si no hay un workspace abierto, Luvin dice **Abre o crea un workspace para importar.** Abre uno primero.
2. Para Postman, haz clic en **Elegir archivos .json** y elige la colección exportada. Elige también sus archivos de ambiente, para traer las variables. Para Bruno, haz clic en **Elegir carpeta** y elige la carpeta de la colección.
3. Lee el resumen: requests, carpetas, ejemplos y ambientes, y cuántos scripts trae. Los scripts de Postman y Bruno se traen completos y corren como en el original: mira [Scripts](/es/requests/scripts/).
4. Cambia el nombre de la colección si quieres y haz clic en **Importar (N requests)**. Si ya existe una colección con ese nombre, el resumen te deja importar una copia o reemplazarla: mira [Cuando la colección ya existe](/es/get-started/import/#cuando-la-colección-ya-existe).

![El diálogo Importar de Postman o Bruno con una tarjeta para Postman y otra para Bruno](/media/es/import-postman.webp)

Luvin crea una colección nueva y la abre. Si tiene scripts, Luvin pregunta **¿Confías en esta colección?** Elige **Confiar** si sabes de dónde viene: mira [Confiar en una colección](/es/requests/scripts/#confiar-en-una-colección). Bruno no guarda el valor de sus secretos: si tu ambiente tiene alguno, llega vacío. Abre el ambiente en el panel **Ambientes** de la barra lateral y escríbelos. Mira [Trae tus propios archivos y requests](/es/get-started/import/).

## 2. Abre un request y envíalo

1. En la barra lateral, abre la colección nueva y haz clic en el request **Create order**.
2. Revisa el ambiente que aparece junto al nombre del request. Debe ser el de pruebas.
3. Haz clic en **Enviar** (o pulsa ⌘/Ctrl + Enter).

La respuesta aparece abajo con su status, su tiempo y su tamaño. Si dice **No se pudo completar el request**, mira [Ayuda de conexión](/es/dev-tools/connection-help/).

Esto también sirve después: Luvin recuerda la última respuesta que recibiste de un request. Mira [Requests sueltos](/es/requests/overview/).

## 3. Crea un workflow

1. Haz clic en **+** (**Crear o importar**) y elige **Nuevo Arazzo**.

Luvin crea `new.arazzo.yaml` en la colección y abre su workflow, **Mi workflow**, en la pestaña **Diseño**. El lienzo dice **Arma tu workflow**.

2. Haz clic en el nombre, escribe `Order and read it` y pulsa Enter.

## 4. Agrega los requests guardados

1. Con el lienzo vacío, haz clic en **Armar con requests de la colección**. Se abre el diálogo **Agregar un paso** con los requests de la colección, por carpeta.
2. Haz clic en **Create order** y luego en **Get order**. Cada uno va al final del workflow, en ese orden.
3. Cierra el diálogo.

También puedes arrastrar un request desde el árbol de la colección, en la barra lateral, al lienzo.

Cada request es un paso con su nombre como título, **Create order** y **Get order**, y con los ids `createOrder` y `getOrder`. Un paso se envía exactamente como su request, con la misma URL, los mismos headers y el mismo body.

Mira la ruta de **Get order**:

- Si el script de **Create order** guarda el id, por ejemplo con `pm.collectionVariables.set("order_id", …)`, Luvin ya lo conectó: `{{order_id}}` viene de `createOrder`. Luvin leyó el script sin ejecutarlo. En la parte 6 no habrá nada que aceptar.
- Si no, `{{order_id}}` queda escrito a mano: Luvin aún no sabe que `createOrder` devuelve ese valor.

Una barra sobre el lienzo dice que los pasos no tienen campos obligatorios marcados. Puedes hacer clic en **Marcar** ahora o después: solo importa para los casos negativos. Mira [Armar desde requests guardados](/es/design/from-requests/).

:::tip[Si tu API necesita un login]
Agrega primero el request de login. Si su script guarda el token (`pm.environment.set("accessToken", …)`) y los demás requests usan `Bearer {{accessToken}}`, Luvin conecta el token a los pasos siguientes por su cuenta y lo dice en un aviso. La tarjeta del login muestra **🔑 inicia sesión**. Mira [Pasa el token del login a los pasos siguientes](/es/authorization/token-from-login/).
:::

## 5. Ejecuta una vez para que Luvin aprenda las respuestas

Un request guardado no dice qué responde la API. Luvin lo aprende en la primera ejecución contra la API real.

1. Abre la pestaña **Casos**. El caso **Camino feliz** está marcado.
2. En la barra de ejecución, elige **API real**. Arriba a la derecha de la ventana, elige el ambiente de pruebas.
3. Haz clic en **Ejecutar**.
4. Luvin avisa que los pasos modifican datos en ese ambiente. Lee el nombre del ambiente y haz clic en **Ejecutar igual**.

Los resultados se abren abajo. Si un paso devuelve una lista que usa un paso posterior, la ejecución se pausa con **Ejecución en pausa**: haz clic en **Continuar con este elemento**. Mira [Elegir un elemento de una lista](/es/test/lists/).

:::tip[Aprender sin ejecutar]
En **Diseño**, haz clic en un paso. Si Luvin no conoce su respuesta, el panel ofrece **Probar este paso**. Para un POST pregunta antes y lo confirmas con **Enviar igual**.
:::

## 6. Acepta las conexiones sugeridas

1. Vuelve a la pestaña **Diseño**. Una barra sobre el lienzo dice **Luvin encontró 1 conexión(es) entre pasos**. Si no hay barra, Luvin ya conectó el id en la parte 4: sigue con la parte 7.
2. Lee la línea: nombra el paso, el valor y de dónde vendría, por ejemplo la ruta de `getOrder` y el `id` de `createOrder`.
3. Haz clic en **Conectar todas** (o en **Conectar** en esa línea).

El paso `getOrder` ahora toma su id de `createOrder`, y su tarjeta en el lienzo dice que ese valor viene de `createOrder`. Luvin no conecta nada hasta que aceptas. **Deshacer** lo revierte. Ejecuta el workflow otra vez: `getOrder` lee la orden que `createOrder` acaba de crear. Mira [Conectar datos entre pasos](/es/design/wire-data/).

## 7. Elige los datos para variar

Los pasos conservan los valores de los requests, así que el workflow parte sin inputs, y un caso no tiene nada que cambiar.

1. En la tarjeta **Inicio**, que dice **sin inputs**, haz clic en **Elegir datos variables…**.
2. En **Datos para variar por caso**, marca los valores que quieres cambiar, por ejemplo el id del cliente en el body de **Create order**. Cada fila muestra dónde está y su valor actual.
3. Haz clic en **Convertir en inputs (N)**.

Cada valor se vuelve un input que conserva su valor actual como valor por defecto, así que el camino feliz no cambia. Abre la pestaña **Inputs** para verlos. Mira [Inputs](/es/test/inputs/).

Ahora que el workflow tiene inputs, abre **Casos**: Luvin también genera casos que envían datos faltantes o inválidos. Mira [Casos](/es/test/cases/).

## 8. Agrega un caso con tus propios datos

1. En la pestaña **Casos**, en el grupo **Casos con datos propios**, haz clic en **+ Nuevo caso con datos**.
2. En **Nombre del caso**, escribe `Cliente desconocido`.
3. En **Paso que se verifica**, elige `createOrder`.
4. En **Status esperado**, escribe el status que devuelve tu API ante un cliente desconocido, por ejemplo `404`.
5. Bajo **Inputs del caso**, cambia el id del cliente por un valor que no existe, por ejemplo `C-0000`.
6. Haz clic en **Agregar caso** y luego en **Ejecutar**.

Los casos con datos propios siempre se ejecutan contra la API real. Si la API responde lo que esperabas, el caso termina como **Pasó**, y el paso que respondió el error se muestra como aprobado porque es lo que prueba el caso. Si responde otra cosa, el caso termina como **No pasó** y dice qué fue distinto. Mira [Casos con datos propios](/es/test/custom-cases/).

## Qué aprendiste

- Una colección de Postman o Bruno se importa como una colección de Luvin, sin contrato.
- Los requests guardados se vuelven pasos que Luvin envía tal como son.
- Lo que guardan los scripts de Postman o Bruno, incluido el token del login, se conecta mientras armas, sin ejecutar los scripts.
- La primera ejecución contra la API real le enseña las respuestas a Luvin, y luego sugiere el resto de las conexiones. Tú decides.
- **Elegir datos variables…** convierte valores fijos en inputs, lo que habilita los casos generados y los propios.

## Siguiente

- [Comprueba que tu API rechaza datos malos](/es/tutorials/negative-cases/)
- [Averigua por qué falló un caso](/es/tutorials/debug-failure/)
- [Requests sueltos](/es/requests/overview/)
