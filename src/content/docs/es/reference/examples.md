---
title: Los ejemplos incluidos
description: Los ejemplos de la Pokédex y de pagos con PayPal en detalle, qué muestra cada workflow y qué necesitas para ejecutarlos.
sidebar:
  order: 1
---

Luvin trae dos ejemplos para que pruebes todo sin una API propia. La **Pokédex** corre contra una API pública y no necesita nada. **Pagos con PayPal** muestra autorización, piezas reutilizables y webhooks, y corre en simulación o contra el sandbox de PayPal. Ambos son colecciones de verdad: puedes cambiarlas y ejecutarlas otra vez.

## Abrir un ejemplo

1. En la pantalla de bienvenida, haz clic en **Probar la Pokédex** o en **Probar pagos con PayPal**. **Ver los ejemplos** lista ambos.
2. Luvin abre el ejemplo como una colección de un workspace llamado **Ejemplos**, guardado dentro de Luvin, con su documentación en el panel de la derecha.

La Pokédex se abre en modo **API real**. PayPal se abre en **Simulación**, porque todavía no tiene credenciales. El [tour guiado](/es/get-started/guided-tour/) recorre ambos.

## Pokédex

La Pokédex usa la [PokéAPI](https://pokeapi.co), una API pública de solo lectura. No necesita credenciales, así que corre de verdad desde el primer minuto. El contrato `pokeapi.openapi.yaml` es una PokéAPI reducida con seis operaciones. El ambiente es `local`, con el servidor del contrato.

| Workflow | Qué muestra |
|---|---|
| **Pokemon card** | Cuatro pasos encadenados por sus outputs, criterios con JSONPath y una acción de fin en el 404. |
| **Type explorer** | Tres pasos: un tipo, su primer Pokémon y su especie. El input lista los valores que acepta. |
| **Battle matchup** | Un workflow que depende de otro (`dependsOn`). |
| **Register sighting** | Una llamada HTTP real mezclada con pasos `send` y `receive` de AsyncAPI. |

### Pokemon card

Consulta un Pokémon, luego su especie, a qué es débil su tipo y qué hace su habilidad. Cada paso lee lo que devolvió el anterior.

```yaml
- stepId: getPokemon
  operationId: $sourceDescriptions.pokeapi.getPokemon
  parameters:
    - name: idOrName
      in: path
      value: $inputs.pokemon
  successCriteria:
    - condition: $statusCode == 200
    - context: $response.body
      condition: $.abilities[?(@.is_hidden == false)]
      type: jsonpath
  onFailure:
    - name: pokemonNotFound
      type: end
      criteria:
        - condition: $statusCode == 404
  outputs:
    id: $response.body#/id
    mainType: $response.body#/types/0/type/name
```

El segundo `successCriteria` usa JSONPath para comprobar que el Pokémon tiene una habilidad visible. Si el Pokémon no existe, `onFailure` termina el workflow sin drama. El paso siguiente toma `$steps.getPokemon.outputs.mainType` como parámetro de ruta.

:::note[Se pausa una vez]
El primer paso devuelve listas que usan los pasos siguientes. Una lista con un solo elemento, como `types` de Pikachu, no pausa la ejecución. `abilities` tiene dos elementos, así que la ejecución se pausa una vez para preguntar con cuál seguir: elígelo y pulsa **Continuar con este elemento**. El runner nunca pregunta: usa el elemento del diseño o una regla guardada en el paso. Mira [Listas](/es/test/lists/).
:::

### Type explorer

El input `type` solo acepta los nombres de los tipos de Pokémon:

```yaml
inputs:
  type: object
  required: [type]
  properties:
    type:
      type: string
      enum: [normal, fire, water, grass, electric]
      example: fire
```

(El archivo lista los dieciocho tipos.) El primer paso lee el tipo, y los dos siguientes usan el primer Pokémon que devuelve.

### Battle matchup

No declara ningún input. Depende de **Type explorer**, que corre primero, y usa sus outputs:

```yaml
- workflowId: battleMatchup
  dependsOn: [typeExplorer]
  steps:
    - stepId: getRivalType
      operationId: $sourceDescriptions.pokeapi.getType
      parameters:
        - name: idOrName
          in: path
          value: $workflows.typeExplorer.outputs.strongAgainst
```

### Register sighting

Mezcla una llamada real con dos eventos, simulados a partir de `pokedex-events.asyncapi.yaml`. Los eventos son ficticios y nunca salen de tu computador. El paso que espera usa un `correlationId` y un `timeout` en milisegundos:

```yaml
- stepId: awaitConfirmation
  channelPath: '{$sourceDescriptions.pokedexEvents.url}#/channels/sightingConfirmed'
  action: receive
  correlationId: $inputs.correlationId
  timeout: 5000
```

### Cosas para probar

1. Abre **Pokemon card** y pulsa **Ejecutar**.
2. En **Inputs**, cambia `pokemon` por `charizard`, `150` o `mewtwo`.
3. En **Casos**, ejecuta los casos generados: camino feliz, inputs faltantes o inválidos y un caso por acción, como «el Pokémon no existe».
4. En **Diseño**, arrastra otra operación del contrato al lienzo. El YAML se escribe solo.

La PokéAPI pide un uso razonable: no ejecutes los casos en un bucle.

## Pagos con PayPal

Este ejemplo usa una **Orders API v2** de PayPal reducida, para el **sandbox** (`api-m.sandbox.paypal.com`), sus webhooks como AsyncAPI y OAuth 2.0 por API. El sandbox no mueve dinero real.

| Workflow | Qué muestra |
|---|---|
| **Create order** | Parámetros reutilizables (`PayPal-Request-Id` y `Prefer`) y acciones de fallo reutilizables para el 400 y el 401. |
| **Capture order** | Verifica que el pedido esté `APPROVED`, captura el pago y espera el webhook `PAYMENT.CAPTURE.COMPLETED`. |
| **Order receipt** | `dependsOn: [createOrder]`, con el id del pedido que devolvió **Create order**. |

### Piezas reutilizables

El archivo declara parámetros y acciones una sola vez, en `components`, y los pasos apuntan a ellos:

```yaml
components:
  parameters:
    requestId:
      name: PayPal-Request-Id
      in: header
      value: '{{$randomUUID}}'
  failureActions:
    notApproved:
      name: notApproved
      type: end
      criteria:
        - condition: $statusCode == 422
```

```yaml
parameters:
  - reference: $components.parameters.requestId
onFailure:
  - reference: $components.failureActions.invalidRequest
```

Si el comprador no aprobó el pedido, PayPal responde 422 y **Capture order** termina ahí, mediante la acción `notApproved`.

### Capture order y el webhook

El último paso espera el evento que PayPal envía cuando la captura se completa:

```yaml
- stepId: awaitCaptureEvent
  channelPath: '{$sourceDescriptions.paypalEvents.url}#/channels/captureCompleted'
  action: receive
  correlationId: $inputs.orderId
  timeout: 5000
```

Los webhooks siempre se simulan. Luvin no recibe eventos de PayPal.

### Order receipt

```yaml
- workflowId: orderReceipt
  dependsOn: [createOrder]
  steps:
    - stepId: receipt
      operationId: $sourceDescriptions.paypal.showOrderDetails
      parameters:
        - name: id
          in: path
          value: $workflows.createOrder.outputs.orderId
```

### Autorización

PayPal pide un token OAuth 2.0 en cada llamada. No está dentro del Arazzo: se define por API en la pestaña **Autorización** de los workflows y se guarda en `flow-auth.yaml`:

```yaml
apis:
  paypal:
    type: oauth2
    grantType: client_credentials
    accessTokenUrl: https://api-m.sandbox.paypal.com/v1/oauth2/token
    clientId: '{{clientId}}'
    clientSecret: '{{clientSecret}}'
```

Luvin pide el token, lo renueva y lo envía en cada request. Mira [Autorización de un workflow](/es/authorization/workflow/) y [OAuth 2.0](/es/authorization/oauth2/).

### Simulación o sandbox

| | Simulación | Sandbox (API real) |
|---|---|---|
| Credenciales | Ninguna. | Un **Client ID** y un **Secret** de una app del sandbox. |
| Qué responde | Los ejemplos del contrato, webhook incluido. | El sandbox de PayPal. El webhook sigue simulado. |
| Úsalo para | Ver funcionar los tres workflows. | Comprobar respuestas reales. |

En simulación no se ejecutan los casos de rechazo ni los de datos propios. Mira [Simulación](/es/test/simulation/).

Para ejecutar contra el sandbox:

1. Ve a [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard/), **Apps & Credentials**, pestaña **Sandbox**, y crea una app. Es gratis.
2. En Luvin, abre el ambiente de arriba a la derecha de la ventana y elige **Configurar ambiente…**.
3. En el ambiente **Sandbox**, pega el Client ID como la variable `clientId` y el Secret como el secreto `clientSecret`. El secreto queda cifrado en tu computador.
4. Cambia a **API real** y ejecuta **Create order**. El pedido queda `CREATED`.
5. Para capturarlo, abre el `approveUrl` del resultado con una **cuenta de comprador del sandbox** (**Testing Tools**, **Sandbox Accounts**) y aprueba el pago.
6. Ejecuta **Capture order**, con ese `orderId` en **Inputs**.

:::caution
`PayPal-Request-Id` usa `{{$randomUUID}}`, así que ejecutar un caso otra vez crea otro pedido. Usa un valor fijo para reintentar sin duplicados.
:::

## Siguiente

- [Inicio rápido](/es/get-started/quick-start/)
- [Ejecutar un workflow](/es/test/run/)
- [URLs base, variables y secretos](/es/environments/variables-and-secrets/)
