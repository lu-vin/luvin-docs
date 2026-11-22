---
title: Build your first workflow from the contract
description: Create a workflow in the Pokédex example by dragging two operations onto the canvas, run it in Simulation and against the real API, and read the Arazzo file Luvin wrote.
sidebar:
  order: 1
---

You will build a workflow that looks up a Pokémon and then its species, run it two ways and read the results. You need about 15 minutes, Luvin open and, for the real run, an internet connection. No credentials are needed.

<video controls muted playsinline preload="metadata" poster="/media/en/design-workflow.webp" src="/media/en/design-workflow.mp4"></video>

## 1. Open the example

1. Open Luvin and click **Try the example** on the welcome screen. If you opened a workspace before, click **See the examples** and then **Try the Pokédex**.
2. Luvin opens the **Pokédex** collection and its first workflow, **Pokemon card**. You will leave it as it is and create a new workflow next to it.

If you have not run the example yet, the [Quick start](/get-started/quick-start/) shows it step by step.

## 2. Create a new workflow

1. In the sidebar, click **Pokemon card** and open the **Design** tab.
2. Click **+ Workflow** in the toolbar above the canvas.

A workflow called **New workflow** is added to the same file and opens in **Design**. The canvas says **Drag the first operation here**.

3. Click the name, type `Species lookup` and press Enter. A line under the field shows **id in the Arazzo:** `speciesLookup`.

See [Create a workflow](/design/create/) for more on names and descriptions.

## 3. Add the first step

The **Operations** palette, on the left, lists the operations of the contract `pokeapi`.

1. Type `pokemon` in **Search operation…**.
2. Drag `GET /pokemon/{idOrName}` onto the canvas.

The canvas shows a step called `getPokemon`. Nothing in the workflow provides the value `idOrName`, so Luvin created an input with that name. The **Start** card now lists `idOrName`, and the step uses it. An *input* is a value you give when you run.

![The Design tab: the operations palette, the canvas with connected steps and the panel of a step](/media/en/builder.webp)

## 4. Add the second step and see the wiring

1. Search `species` and drag `GET /pokemon-species/{idOrName}` below `getPokemon`.
2. Click the new step, `getPokemonSpecies`. Its panel opens on the right.
3. Under **Parameters**, look at **Path**. The value `idOrName` reads `? getPokemon › id`.

Luvin connected the `id` that `getPokemon` returns to the path of the second step, and added the output `id` to `getPokemon`. The dashed line on the canvas is that data travelling. The `?` means Luvin is less sure about this rule. Here it is right. [Connect data between steps](/design/wire-data/) lists the rules.

## 5. Add a step that needs a choice

1. Search `type` and drag `GET /type/{idOrName}` below `getPokemonSpecies`.
2. Click the new step, `getType`. Its `idOrName` reads `? getPokemonSpecies › id`. That is wrong: a type is not a species id.
3. Open the list under `idOrName` (**Source**) and choose `types/type/name (from a list: you choose which at run time)`, under `getPokemon`.

The `?` disappears. A Pokémon can have several types, so Luvin cannot choose one for you: it will ask when you run.

## 6. Set the input

1. Click the **Inputs** tab.
2. Under **Required**, type `pikachu` in `idOrName`.

The badge at the top says **Required complete**. See [Inputs](/test/inputs/).

## 7. Run in Simulation

1. Click the **Cases** tab. Luvin generated the cases from your workflow. **Happy path**, the normal run, is ticked.
2. In the run bar, choose **Simulation**. Simulation calls nothing: Luvin answers with the examples written in the contract.
3. Click **Run** (or press ⌘ Enter, Ctrl+Enter on Windows).

The results open at the bottom. The case ends as **Passed**, with a **Sim** badge, and every step shows **Succeeded**. If a dialog titled **Run paused** appears, a list had more than one item: choose one and click **Continue with this item**. See [Simulation](/test/simulation/).

## 8. Run against the real API

1. In the run bar, choose **Real API**. The environment at the top right of the window shows `local`.
2. Click **Run**.

Luvin calls pokeapi.co. After `getPokemon`, a dialog titled **Run paused** opens: the step returned the list `types`, and `getType` needs one of its items. Against the real API the dialog appears **even when the list has a single item**. Pikachu has one type.

3. Click **Continue with this item**.

The run goes on. See [Choose an item from a list](/test/lists/) for what the dialog offers.

## 9. Read the results

![The results of a run: the case list on the left and the steps of a passed case on the right](/media/en/results.webp)

1. In the header of the results, check the counters: one case passed.
2. Click the case **Happy path** in the list on the left. The detail shows its verdict, **Expected**, the **Result** in plain words and the **Inputs** used.
3. Under the detail, click the card `getPokemon`. Its tabs are **Criteria**, **Request**, **Response**, **Contract** and **Outputs**. Open **Request** to see the real URL, with `pikachu` in the path.
4. Open the card `getType`. A note, **Chosen at run time**, says which item you chose and which value the step received.

[Read the results](/test/results/) explains every part.

## 10. Open the Arazzo file

1. Click the **YAML** tab.

This is the file Luvin wrote while you dragged. It is standard [Arazzo](https://spec.openapis.org/arazzo/latest.html). The part for your first two steps looks like this:

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

Your file has more lines, for the third step. You can edit it here and the **Design** tab follows. See [The YAML tab](/design/arazzo-editor/).

:::note
The Pokédex is an example saved inside Luvin. To keep your own workflows in files you can commit, create a workspace in a folder. See [Share a workspace with git](/tutorials/team-git/).
:::

## What you learned

- Dragging an operation creates a step that is already filled in from the contract.
- Luvin connects the data between steps by rules and marks with `?` the one it is less sure about.
- A value nobody provides becomes an input.
- **Simulation** answers from the contract. **Real API** calls the service, and pauses to ask you when a step returns a list that later steps use.
- The **YAML** tab shows the standard Arazzo behind the canvas.

## Next

- [From a Postman or Bruno collection to a tested workflow](/tutorials/from-postman/)
- [Prove your API rejects bad data](/tutorials/negative-cases/)
- [Add steps](/design/add-steps/)
