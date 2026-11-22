---
title: Arma tu primer workflow desde el contrato
description: Crea un workflow en el ejemplo de la Pokédex arrastrando dos operaciones al lienzo, ejecútalo en Simulación y contra la API real, y lee el archivo Arazzo que escribió Luvin.
sidebar:
  order: 1
---

Vas a armar un workflow que busca un Pokémon y luego su especie, lo ejecutarás de dos maneras y leerás los resultados. Necesitas unos 15 minutos, Luvin abierto y, para la ejecución real, conexión a internet. No hacen falta credenciales.

<video controls muted playsinline preload="metadata" poster="/media/es/design-workflow.webp" src="/media/es/design-workflow.mp4"></video>

## 1. Abre el ejemplo

1. Abre Luvin y haz clic en **Probar con el ejemplo** en la pantalla de bienvenida. Si ya abriste un workspace antes, haz clic en **Ver los ejemplos** y después en **Probar la Pokédex**.
2. Luvin abre la colección **Pokédex** y su primer workflow, **Pokemon card**. Lo dejarás como está y crearás un workflow nuevo al lado.

Si todavía no ejecutaste el ejemplo, el [Inicio rápido](/es/get-started/quick-start/) lo muestra paso a paso.

## 2. Crea un workflow nuevo

1. En la barra lateral, haz clic en **Pokemon card** y abre la pestaña **Diseño**.
2. Haz clic en **+ Workflow** en la barra de herramientas sobre el lienzo.

Se agrega un workflow llamado **Nuevo workflow** al mismo archivo y se abre en **Diseño**. El lienzo dice **Arrastra aquí la primera operación**.

3. Haz clic en el nombre, escribe `Species lookup` y pulsa Enter. Una línea debajo del campo muestra **id en el Arazzo:** `speciesLookup`.

Mira [Crear un workflow](/es/design/create/) para saber más sobre nombres y descripciones.

## 3. Agrega el primer paso

La paleta **Operaciones**, a la izquierda, lista las operaciones del contrato `pokeapi`.

1. Escribe `pokemon` en **Buscar operación…**.
2. Arrastra `GET /pokemon/{idOrName}` al lienzo.

El lienzo muestra un paso llamado `getPokemon`. Nada en el workflow provee el valor `idOrName`, así que Luvin creó un input con ese nombre. La tarjeta **Inicio** ahora lista `idOrName`, y el paso lo usa. Un *input* es un valor que entregas al ejecutar.

![La pestaña Diseño: la paleta de operaciones, el lienzo con pasos conectados y el panel de un paso](/media/es/builder.webp)

## 4. Agrega el segundo paso y mira la conexión

1. Busca `species` y arrastra `GET /pokemon-species/{idOrName}` debajo de `getPokemon`.
2. Haz clic en el paso nuevo, `getPokemonSpecies`. Su panel se abre a la derecha.
3. En **Parámetros**, mira **Ruta**. El valor `idOrName` dice `? getPokemon › id`.

Luvin conectó el `id` que devuelve `getPokemon` con la ruta del segundo paso, y agregó el output `id` a `getPokemon`. La línea punteada del lienzo es ese dato viajando. La `?` significa que Luvin está menos seguro de esa regla. Aquí acierta. [Conectar datos entre pasos](/es/design/wire-data/) lista las reglas.

## 5. Agrega un paso que necesita una elección

1. Busca `type` y arrastra `GET /type/{idOrName}` debajo de `getPokemonSpecies`.
2. Haz clic en el paso nuevo, `getType`. Su `idOrName` dice `? getPokemonSpecies › id`. Eso está mal: un tipo no es el id de una especie.
3. Abre la lista bajo `idOrName` (**Origen**) y elige `types/type/name (de una lista: eliges cuál al ejecutar)`, bajo `getPokemon`.

La `?` desaparece. Un Pokémon puede tener varios tipos, así que Luvin no puede elegir uno por ti: te preguntará cuando ejecutes.

## 6. Define el input

1. Haz clic en la pestaña **Inputs**.
2. En **Obligatorios**, escribe `pikachu` en `idOrName`.

La insignia de arriba dice **Obligatorios completos**. Mira [Inputs](/es/test/inputs/).

## 7. Ejecuta en Simulación

1. Haz clic en la pestaña **Casos**. Luvin generó los casos a partir de tu workflow. **Camino feliz**, la ejecución normal, está marcado.
2. En la barra de ejecución, elige **Simulación**. La simulación no llama a nada: Luvin responde con los ejemplos escritos en el contrato.
3. Haz clic en **Ejecutar** (o pulsa ⌘ Enter, Ctrl+Enter en Windows).

Los resultados se abren abajo. El caso termina como **Pasó**, con la etiqueta **Sim**, y cada paso muestra **Exitoso**. Si aparece un diálogo con el título **Ejecución en pausa**, una lista tenía más de un elemento: elige uno y haz clic en **Continuar con este elemento**. Mira [Simulación](/es/test/simulation/).

## 8. Ejecuta contra la API real

1. En la barra de ejecución, elige **API real**. El ambiente de arriba a la derecha de la ventana muestra `local`.
2. Haz clic en **Ejecutar**.

Luvin llama a pokeapi.co. Después de `getPokemon`, se abre un diálogo con el título **Ejecución en pausa**: el paso devolvió la lista `types`, y `getType` necesita uno de sus elementos. Contra la API real el diálogo aparece **aunque la lista tenga un solo elemento**. Pikachu tiene un solo tipo.

3. Haz clic en **Continuar con este elemento**.

La ejecución sigue. Mira [Elegir un elemento de una lista](/es/test/lists/) para ver qué ofrece el diálogo.

## 9. Lee los resultados

![Los resultados de una ejecución: la lista de casos a la izquierda y los pasos de un caso que pasó a la derecha](/media/es/results.webp)

1. En el encabezado de los resultados, revisa los contadores: un caso pasó.
2. Haz clic en el caso **Camino feliz** de la lista de la izquierda. El detalle muestra su veredicto, lo **Esperado**, el **Resultado** en palabras simples y los **Inputs** usados.
3. Bajo el detalle, haz clic en la tarjeta `getPokemon`. Sus pestañas son **Criterios**, **Petición**, **Respuesta**, **Contrato** y **Outputs**. Abre **Petición** para ver la URL real, con `pikachu` en la ruta.
4. Abre la tarjeta `getType`. Una nota, **Elegido al ejecutar**, dice qué elemento elegiste y qué valor recibió el paso.

[Lee los resultados](/es/test/results/) explica cada parte.

## 10. Abre el archivo Arazzo

1. Haz clic en la pestaña **YAML**.

Este es el archivo que Luvin fue escribiendo mientras arrastrabas. Es [Arazzo](https://spec.openapis.org/arazzo/latest.html) estándar. La parte de tus dos primeros pasos se ve así:

```yaml
- workflowId: speciesLookup
  summary: Species lookup
  inputs:
    type: object
    required: [idOrName]
    properties:
      idOrName:
        type: string
  steps:
    - stepId: getPokemon
      operationId: $sourceDescriptions.pokeapi.getPokemon
      parameters:
        - name: idOrName
          in: path
          value: $inputs.idOrName
      successCriteria:
        - condition: $statusCode == 200
      outputs:
        id: $response.body#/id
    - stepId: getPokemonSpecies
      operationId: $sourceDescriptions.pokeapi.getPokemonSpecies
      parameters:
        - name: idOrName
          in: path
          value: $steps.getPokemon.outputs.id
      successCriteria:
        - condition: $statusCode == 200
```

Tu archivo tiene más líneas, por el tercer paso. Puedes editarlo aquí y la pestaña **Diseño** lo sigue. Mira [La pestaña YAML](/es/design/arazzo-editor/).

:::note
La Pokédex es un ejemplo guardado dentro de Luvin. Para tener tus propios workflows en archivos que puedas subir a git, crea un workspace en una carpeta. Mira [Comparte un workspace con git](/es/tutorials/team-git/).
:::

## Qué aprendiste

- Arrastrar una operación crea un paso que ya viene completado desde el contrato.
- Luvin conecta los datos entre pasos con reglas y marca con `?` la que le da menos seguridad.
- Un valor que nadie provee se vuelve un input.
- **Simulación** responde desde el contrato. **API real** llama al servicio y se pausa para preguntarte cuando un paso devuelve una lista que usan los pasos siguientes.
- La pestaña **YAML** muestra el Arazzo estándar que hay detrás del lienzo.

## Siguiente

- [De una colección de Postman o Bruno a un workflow probado](/es/tutorials/from-postman/)
- [Comprueba que tu API rechaza datos malos](/es/tutorials/negative-cases/)
- [Agregar pasos](/es/design/add-steps/)
