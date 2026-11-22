---
title: Analysis and contract messages
description: What the analysis of an Arazzo file and the check of a contract report, what each message means and what to do about it.
sidebar:
  order: 10
---

Luvin checks your files without running anything. It reads the Arazzo file and reports what is missing, wrong or risky. It does the same for a contract you edit. This page lists those messages and what to do with each.

## Where you see them

| Where | What it shows |
|---|---|
| The **YAML** tab | The bar says how many errors and warnings the file has. Each problem is underlined and listed under the text in **Problems**. Notes with information only are listed in **Notes**. Click one to go to its line. |
| The **Overview** tab of a workflow | **General validation** for the whole file and **Workflow validation** for the open workflow. |
| A step | The problems of that step, in its panel. |
| The editor of a **contract** | Each problem is underlined in the YAML of the contract and listed above the preview, with its line. |

Every message has a level.

| Level | Meaning |
|---|---|
| **Error** | Something is wrong and the workflow, or a step, will not work. |
| **Warning** | It may work, but it is probably not what you want. |
| **Info** | A note. Nothing is wrong. |

![The YAML tab with the Arazzo file and a list of problems below it](/media/en/yaml-editor.webp)

## Messages about the Arazzo file

### The file and its contracts

| Message | Level | What to do |
|---|---|---|
| **Arazzo version "2.0" not recognized; 1.x is expected.** | Warning | Set `arazzo:` to `1.0.1` or `1.1.0`. |
| **The Arazzo is version 1.2; Luvin supports up to 1.1, so some new fields may be ignored.** | Warning | Expect that some fields do nothing. |
| **info.title is missing in the Arazzo document.** | Warning | Add a `title` under `info`. |
| **The Arazzo does not declare sourceDescriptions.** | Error | Add the contracts the workflows use. |
| **The contract for source "x" (url) is missing.** | Error | Add the contract file to the collection. See [Add a contract](/contracts/add/). |
| **Source "x" is of type "arazzo"; only OpenAPI and AsyncAPI contracts are executed.** | Warning | Use an OpenAPI or AsyncAPI contract. |
| **"x" references files that were not loaded: ... Upload them with the contract to resolve those $refs.** | Error | Add the missing files. See [References between files](/contracts/references/#missing-references). |
| **The Arazzo has no workflows.** | Error | Create a workflow. |
| **Duplicate workflowId: "x".** | Error | Give each workflow its own id. |
| **There are AsyncAPI steps. Luvin does not connect to brokers ... yet, so those steps are always simulated ...** | Info | Nothing. See [Messaging steps](/design/messaging/). |
| **Source "auth" is another Arazzo document (auth.arazzo.yaml): its workflows can be used as $sourceDescriptions.auth.<workflowId>.** | Info | Nothing. See [Workflows that use other workflows](/design/dependencies/). |
| **Before this workflow, "a" runs (dependsOn); its outputs are available as $workflows.<id>.outputs.** | Info | Nothing. |
| **The reference ... does not exist in components.** | Error | Create the reusable or fix the name. See [Reusables](/design/reusables/). |

### Steps and operations

| Message | Level | What to do |
|---|---|---|
| **Duplicate stepId: "x".** | Error | Give each step its own id. |
| **Each step must have exactly one of: operationId, operationPath, channelPath or workflowId.** | Error | Keep one of the four. |
| **Operation "x" does not exist in the loaded contracts.** | Error | Fix the `operationId` or load the contract. |
| **"x" is not the standard Arazzo form. It was resolved as GET /pokemon/{name}; change it to "$sourceDescriptions.pokeapi.getPokemon".** | Warning | Use the form it proposes. |
| **"x" exists in several sources; "pokeapi" is used.** | Warning | Use `$sourceDescriptions.<source>.<operationId>`. |
| **The operationPath points to a path that does not exist in the contract; it was resolved as ...** | Warning | Remove the server prefix from the path, as the message says. |
| **The operation for operationPath "x" was not found.** | Error | Fix the path. |
| **Channel "x" was not found in any loaded AsyncAPI.** | Error | Load the AsyncAPI contract or fix the channel. |
| **Channel "x" has more than one operation; the "send" one is used.** | Warning | Write `action: send` or `action: receive` on the step. |
| **Sub-workflow "x" does not exist.** | Error | Fix the `workflowId`. |
| **The step says "action: send", but the AsyncAPI operation is "receive". The step value is used.** | Info | Check which one you want. |
| **"action" and "correlationId" only apply to AsyncAPI steps; they are ignored on an HTTP step.** | Warning | Remove them. |
| **"correlationId" only applies to receive steps; it is ignored on a send.** | Warning | Remove it. |
| **A receive step sends nothing: its requestBody is ignored.** | Warning | Remove the body. |
| **Receive step without "timeout": with a real broker it would wait for the message forever.** | Info | Add a `timeout`. |
| **Only "in: header" parameters are sent with a message; these are ignored: ...** | Warning | Move them to headers. |

### Data between steps

| Message | Level | What to do |
|---|---|---|
| **Uses $steps.a.outputs.id, but step "a" does not exist.** | Error | Fix the step id. |
| **Uses an output of "a", which runs later.** | Warning | Move step "a" before this one. Steps run in order. |
| **Uses $steps.a.outputs.id, but "a" does not declare that output.** | Error | Add the output to step "a". See [Outputs](/design/outputs/). |
| **Uses $inputs.x, which is not defined in the workflow inputs.** | Warning | Add the input in the **Inputs** tab. |
| **The contract requires the query parameter "x" and the step does not send it.** | Warning | Add the parameter. See [Parameters and body](/design/parameters-and-body/). |
| **The contract requires a body and the step does not define requestBody.** | Warning | Add a body. |
| **An "in: querystring" parameter cannot be combined with "in: query" parameters on the same operation.** | Warning | Keep only one kind. |

### Criteria, errors and dependencies

| Message | Level | What to do |
|---|---|---|
| **No successCriteria: any 2xx response will be considered successful.** | Info | Add a criterion if you need a stricter check. See [Success criteria](/reference/criteria/). |
| **successCriteria is empty; Arazzo 1.1 requires at least one criterion when it is declared.** | Warning | Add one, or remove the empty list. |
| **The successCriteria expect 200, but the contract of GET /x only documents 404.** | Warning | Align the Arazzo and the contract. |
| **In ... there are 2 $statusCode == conditions (200, 201). Arazzo requires all of them to hold at once, so they will never be met. Merge them into one: "..."** | Error | Use the merged condition the message gives you. |
| **1 condition(s) are marked as "type: jsonpath" but are simple conditions ...** | Warning | Remove `type: jsonpath` and `context` from them. |
| **Action "x" points to the non-existent step "y".** | Error | Fix the target of `goto`. |
| **Action "x" (retry) points to the non-existent step "y".** | Error | Fix the `stepId` of the `retry` action. |
| **Action "x" points to the workflow "y", which cannot be found. ...** | Error | The sentence at the end says why. Fix the `workflowId` of the action. |
| **"ref" is not a reference to another Arazzo document.** | Error | Write the reference as `$sourceDescriptions.<source>.<workflowId>`. |
| **"ref" uses the source "s", which this Arazzo does not declare in sourceDescriptions.** | Error | Add the source. |
| **"ref" uses the source "s", which is of type "openapi": to call a workflow of another document the source must be of type arazzo.** | Error | Set `type: arazzo` on the source. |
| **"ref" points to ./auth.arazzo.yaml, which is not in the collection: add that Arazzo file.** | Error | Import the file into the same collection. |
| **"ref": the workflow "w" does not exist in auth.arazzo.yaml.** | Error | Fix the workflow id. |
| **Action "x" is of type goto and defines retryLimit/retryAfter, which only apply to type: retry.** | Warning | Remove those fields. |
| **dependsOn mentions step "x", which does not exist in this workflow.** | Error | Fix the name. |
| **dependsOn mentions "x", which runs later. ... move it after "x".** | Warning | Move the step. |
| **dependsOn mentions "x", but workflow "y" does not exist.** | Error | Fix the name. |

The analysis also shows a **Response coverage** table: for each response the contract documents, whether the workflow handles it. See [Success and errors](/design/success-and-errors/).

## Messages about a contract

These come from the editor of an OpenAPI or AsyncAPI contract. They tell you what to fix in the contract.

| Message | Level | What to do |
|---|---|---|
| **The $ref "x" doesn't point to anything in the contract.** | Error | Fix the reference. |
| **The info section is missing (contract title and version).** | Warning | Add `info`. |
| **info.title is missing.** / **info.version is missing.** | Warning | Add it. |
| **This is Swagger 2.0: Luvin works with OpenAPI 3.x; consider migrating it.** | Warning | Convert the contract to OpenAPI 3. |
| **OpenAPI version "x": 3.x is expected.** | Warning | Set `openapi: 3.0.3` or similar. |
| **No servers defined: the base URL comes from the environment.** | Info | Nothing, if the environment has the base URL. |
| **The paths section is missing: the contract has no operations.** | Error | Add `paths`. |
| **The path "x" must start with /.** | Error | Add the `/`. |
| **The operationId "x" is repeated: an Arazzo won't know which one to use.** | Error | Give each operation its own id. |
| **GET /x has no operationId: the Arazzo will have to use operationPath.** | Info | Add an `operationId`. |
| **GET /x doesn't document any response.** | Warning | Document at least the success response. |
| **"x" isn't a valid response code (use 200, 4XX or default).** | Warning | Use a code, `4XX` or `default`. |
| **Incomplete parameter: it needs name and in (query, header, path or cookie).** | Error | Fill both fields. |
| **The path parameter "x" must have required: true.** | Error | Set `required: true`. |
| **The path parameter "x" doesn't appear in "/y".** | Error | Remove it or add it to the path. |
| **GET /y uses {x} in the path but doesn't declare it as a parameter.** | Error | Declare the parameter. |
| **AsyncAPI version "x": 2.x or 3.x is expected.** | Warning | Use a supported version. |
| **The channels section is missing.** | Error | Add `channels`. |
| **The operation "x" needs action: send or receive.** | Error | Add `action`. |
| **The operation "x" needs a channel with a $ref to a channel.** | Error | Add the reference. |

When you change a contract that workflows use, the bar above the preview of the editor lists the new problems that your change causes in those workflows. See [When a change breaks a workflow](/contracts/impact/).

## Related

- [The YAML tab](/design/arazzo-editor/)
- [Edit a contract](/contracts/edit/)
- [Why a step or a case failed](/reference/failure-reasons/)
- [Specification support](/reference/support/)
