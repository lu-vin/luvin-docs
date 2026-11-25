---
title: Build your first workflow from the contract
description: Create a workflow in the Pokédex example by adding operations to the canvas, run it in Simulation and against the real API, and read the Arazzo file Luvin wrote.
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
2. Click **+** (**Create or import**) to the right of the open tabs, and choose **New workflow in this file**.

A workflow called **New workflow** is added to the same file and opens in **Design**. The canvas shows the card **Build your workflow**.

3. Click the name, type `Species lookup` and press Enter. A line under the field shows **id in the Arazzo:** `speciesLookup`.

See [Create a workflow](/design/create/) for more on names and descriptions.

## 3. Add the first step

The empty canvas shows the card **Build your workflow**.

1. Click **Add the first step**, or **＋ Step** at the top left. A search opens with the operations of the contract `pokeapi`.
2. Type `pokemon/{` in **Search operation…** and click `GET /pokemon/{idOrName}`.

The canvas shows a step called `getPokemon`. Nothing in the workflow provides the value `idOrName`, so Luvin created an input with that name. **Start** now says **1 input**, and the step shows the chip **← idOrName · Start**. An *input* is a value you give when you run.

![The Design tab: the canvas with the step cards and the panel of a step open over the right side](/media/en/builder.webp)

## 4. Add the second step and see the wiring

1. With `getPokemon` selected, click **＋ Step**, type `species` and click `GET /pokemon-species/{idOrName}`. The step goes right after `getPokemon`.
2. Look at the card of the new step, `getPokemonSpecies`. Under **Parameters**, `idOrName` shows the chip **← id · from 1**, with a `?` in front.

Luvin connected the `id` that `getPokemon` returns to the path of the second step, and added the output `id` to `getPokemon`. With the step selected, a line on the right of the cards goes from that output to the parameter. The `?` means Luvin is less sure about this rule. Here it is right. [Connect data between steps](/design/wire-data/) lists the rules.

## 5. Add a step that needs a choice

1. With `getPokemonSpecies` selected, click **＋ Step**, type `type` and click `GET /type/{idOrName}`.
2. Click the new step, `getType`. Its `idOrName` shows **← id · from 2**, with a `?`. That is wrong: a type is not a species id.
3. In the **Data** tab of its panel, open the list under `idOrName` (**Source**) and choose `types/type/name (from a list: you choose which at run time)`, under `getPokemon`.

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

This is the file Luvin wrote while you added the steps. It is standard [Arazzo](https://spec.openapis.org/arazzo/latest.html). The part for your first two steps looks like this:

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

- Adding an operation creates a step that is already filled in from the contract.
- Luvin connects the data between steps by rules and marks with `?` the one it is less sure about.
- A value nobody provides becomes an input.
- **Simulation** answers from the contract. **Real API** calls the service, and pauses to ask you when a step returns a list that later steps use.
- The **YAML** tab shows the standard Arazzo behind the canvas.

## Next

- [From a Postman or Bruno collection to a tested workflow](/tutorials/from-postman/)
- [Prove your API rejects bad data](/tutorials/negative-cases/)
- [Add steps](/design/add-steps/)
