---
title: The bundled examples
description: The Pokédex and PayPal payments examples in detail, what each workflow shows and what you need to run them.
sidebar:
  order: 1
---

Luvin ships with two examples so you can try everything without your own API. The **Pokédex** runs against a public API and needs nothing. **PayPal payments** shows authorization, reusable pieces and webhooks, and runs in simulation or against the PayPal sandbox. Both are real collections: you can change them and run them again.

## Open an example

1. On the welcome screen, click **Try the Pokédex** or **Try PayPal payments**. **See the examples** lists both.
2. Luvin opens the example as a collection of a workspace called **Examples**, saved inside Luvin, with its documentation in the panel on the right.

The Pokédex opens in **Real API** mode. PayPal opens in **Simulation**, because it has no credentials yet. The [guided tour](/get-started/guided-tour/) walks through both.

## Pokédex

The Pokédex uses the [PokéAPI](https://pokeapi.co), a public read-only API. It needs no credentials, so it runs for real from the first minute. The contract `pokeapi.openapi.yaml` is a trimmed PokéAPI with six operations. The environment is `local`, with the server of the contract.

| Workflow | What it demonstrates |
|---|---|
| **Pokemon card** | Four steps chained by their outputs, JSONPath criteria and an end action on 404. |
| **Type explorer** | Three steps: a type, its first Pokémon and its species. The input lists the values it accepts. |
| **Battle matchup** | A workflow that depends on another one (`dependsOn`). |
| **Register sighting** | A real HTTP call mixed with AsyncAPI `send` and `receive` steps. |

### Pokemon card

It gets a Pokémon, then its species, what its type is weak to and what its ability does. Each step reads what the previous one returned.

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

The second `successCriteria` uses JSONPath to check that the Pokémon has a visible ability. If the Pokémon does not exist, `onFailure` ends the workflow cleanly. The next step takes `$steps.getPokemon.outputs.mainType` as its path parameter.

:::note[It pauses once]
The first step returns lists that later steps use. A list with a single item, like `types` for Pikachu, doesn't pause the run. `abilities` has two items, so the run pauses once to ask which one to continue with: pick it and press **Continue with this item**. The Runner never asks: it uses the design's item or a rule saved in the step. See [Lists](/test/lists/).
:::

### Type explorer

The input `type` only accepts the names of the Pokémon types:

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

(The file lists all eighteen types.) The first step reads the type, and the next two use the first Pokémon it returns.

### Battle matchup

It does not declare an input. It depends on **Type explorer**, which runs first, and uses its outputs:

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

It mixes one real call with two events, simulated from `pokedex-events.asyncapi.yaml`. The events are fictional and never leave your computer. The step that waits uses a `correlationId` and a `timeout` in milliseconds:

```yaml
- stepId: awaitConfirmation
  channelPath: '{$sourceDescriptions.pokedexEvents.url}#/channels/sightingConfirmed'
  action: receive
  correlationId: $inputs.correlationId
  timeout: 5000
```

### Things to try

1. Open **Pokemon card** and press **Run**.
2. In **Inputs**, change `pokemon` to `charizard`, `150` or `mewtwo`.
3. In **Cases**, run the generated cases: happy path, missing or invalid inputs and one case per action, such as "the Pokémon does not exist".
4. In **Design**, drag another operation from the contract to the canvas. The YAML writes itself.

The PokéAPI asks for fair use: do not run the cases in a loop.

## PayPal payments

This example uses a trimmed PayPal **Orders API v2** for the **sandbox** (`api-m.sandbox.paypal.com`), its webhooks as AsyncAPI, and OAuth 2.0 per API. The sandbox moves no real money.

| Workflow | What it demonstrates |
|---|---|
| **Create order** | Reusable parameters (`PayPal-Request-Id` and `Prefer`) and reusable failure actions for 400 and 401. |
| **Capture order** | Checks the order is `APPROVED`, captures the payment and waits for the `PAYMENT.CAPTURE.COMPLETED` webhook. |
| **Order receipt** | `dependsOn: [createOrder]`, using the order id that **Create order** returned. |

### Reusable pieces

The file declares parameters and actions once, in `components`, and the steps point to them:

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

If the buyer did not approve the order, PayPal answers 422 and **Capture order** ends there, through the `notApproved` action.

### Capture order and the webhook

The last step waits for the event that PayPal sends when the capture is complete:

```yaml
- stepId: awaitCaptureEvent
  channelPath: '{$sourceDescriptions.paypalEvents.url}#/channels/captureCompleted'
  action: receive
  correlationId: $inputs.orderId
  timeout: 5000
```

Webhooks are always simulated. Luvin does not receive PayPal events.

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

### Authorization

PayPal wants an OAuth 2.0 token on every call. It is not inside the Arazzo: it is set per API in the **Authorization** tab of the workflows and saved in `flow-auth.yaml`:

```yaml
apis:
  paypal:
    type: oauth2
    grantType: client_credentials
    accessTokenUrl: https://api-m.sandbox.paypal.com/v1/oauth2/token
    clientId: '{{clientId}}'
    clientSecret: '{{clientSecret}}'
```

Luvin requests the token, refreshes it and sends it with every request. See [Authorization of a workflow](/authorization/workflow/) and [OAuth 2.0](/authorization/oauth2/).

### Simulation or sandbox

| | Simulation | Sandbox (Real API) |
|---|---|---|
| Credentials | None. | A **Client ID** and a **Secret** of a sandbox app. |
| What answers | The examples of the contract, webhook included. | The PayPal sandbox. The webhook stays simulated. |
| Use it for | Seeing the three workflows work. | Checking real answers. |

In simulation, the rejection cases and your own data cases are not run. See [Simulation](/test/simulation/).

To run against the sandbox:

1. Go to [developer.paypal.com/dashboard](https://developer.paypal.com/dashboard/), **Apps & Credentials**, **Sandbox** tab, and create an app. It is free.
2. In Luvin, open the environment at the top right of the window and choose **Configure environment…**.
3. In the **Sandbox** environment, paste the Client ID as the variable `clientId` and the Secret as the secret `clientSecret`. The secret stays encrypted on your computer.
4. Switch to **Real API** and run **Create order**. The order is `CREATED`.
5. To capture it, open the `approveUrl` from the result with a **sandbox buyer account** (**Testing Tools**, **Sandbox Accounts**) and approve the payment.
6. Run **Capture order**, with that `orderId` in **Inputs**.

:::caution
`PayPal-Request-Id` uses `{{$randomUUID}}`, so running a case again creates another order. Use a fixed value to retry without duplicates.
:::

## Next

- [Quick start](/get-started/quick-start/)
- [Run a workflow](/test/run/)
- [Base URLs, variables and secrets](/environments/variables-and-secrets/)
