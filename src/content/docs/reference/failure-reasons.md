---
title: Why a step or a case failed
description: A lookup table of every reason Luvin gives when a step or a case does not pass, what each one means and what to do about it.
sidebar:
  order: 9
---

When a step does not work, Luvin names the reason in one short label and explains it in a sentence. This page lists them. Find the label or the sentence you see in the results, then read what it means and what to do.

Two things are judged separately. A **step** can be successful, have a warning, fail or not run. A **case** gets a verdict: **Passed**, **Failed**, **Warning** or **Inconclusive**. A case is judged from the steps it ran. See [Read the results](/test/results/).

## Reason labels of a step

| Label | What it means | What to do |
|---|---|---|
| **Criterion not met** | The API answered, with a status below 400, but a [success criterion](/reference/criteria/) did not hold. | Open the step. The sentence says what was expected and what arrived. Fix the criterion or report the difference. |
| **Error returned by the API** | The API answered 400 or more. The message of the API, if it sent one, is shown. | Read the message. Check the inputs of the case and the data of the earlier steps. |
| **Authentication** | The API answered 401 or 403. | Check the credential of the environment or of the workflow. See [Authorization of a workflow](/authorization/workflow/). |
| **Data not available** | A value the step needed was missing, so the request was sent incomplete. | See the section below. |
| **Network** | There was no answer from the API: the connection failed, the URL is missing, the step timed out or the run was cancelled. | Use [Connection help](/dev-tools/connection-help/). |
| **Operation not found** | The step points to an operation that is not in the loaded contracts. | Load the contract or fix the `operationId` in the YAML tab. |
| **Not run** | The step was skipped because of an earlier step or a dependency. | Fix the step that failed first. |
| **Response out of contract** | The step met its criteria, but the response does not match what the contract documents. It is a **warning**, not a failure. | Compare the response with the contract. Ask who builds the API, or fix the contract. |
| **Output not captured** | The step worked, but an output that later steps use could not be taken from the response. It is a **warning**. | Check the output expression against the response. See [Outputs](/design/outputs/). |
| **Messaging** | A messaging step did not get a message in time, or was simulated. | See the messages below. |

The order of the checks matters. A 401 or 403 is always reported as **Authentication**. Missing data is reported before a generic API error.

## Messages you may see in a step

### The API answered, but...

| Message | What it means | What to do |
|---|---|---|
| **Expected a 2xx, but it is 404** | The step has no criteria, so any 2xx was needed. | Add a criterion or fix the request. |
| **The API responded 401. Check the credential.** The same with **Check the credential for ...** and a name | The credential is missing, wrong or expired. | Fill the credential in the environment. A message from the API is shown in quotes. |
| **The API responded 401: the request was sent without credentials (as the test case requires).** | You are running a **Without credentials** case. | Nothing: this is expected. |
| **Could not resolve $steps.a.outputs.id; the request was sent incomplete and the API responded 404.** | An earlier step did not give the value. | Look at the earlier step and its outputs. |
| **Could not resolve ...: a path value was missing, so ... was called** | A part of the URL was empty, so another resource was called. The real URL is shown. | Give the input a value, or fix the output that feeds it. |
| **The API responded 500 Internal Server Error: "message". Expected ...** | The API answered 400 or more. The message of the API comes first, then the criterion that was not met. | Read the message of the API. |
| **A criterion was not met.** | A criterion did not hold and gave no detail. | Open the criteria of the step. |
| **The API responded 200 and the criteria were met, but the response does not match the contract: ...** | The warning **Response out of contract**. The first difference is named. | See above. |
| **Could not capture "id" from the response, and later steps use it.** | The warning **Output not captured**. | See above. |

### The API did not answer

| Message | What it means | What to do |
|---|---|---|
| **There is no server URL for source "pokeapi". Set it on the parameters screen.** | The environment has no base URL for that contract. | Add the base URL in the environment. See [Base URLs](/environments/base-urls/). |
| **Could not connect to the API (...). Check the environment URL and that the server is reachable from this computer.** | The desktop app could not reach the server. | Check the URL and your network or VPN. |
| **The API did not answer within 3000 ms (step timeout).** | The step has a `timeout` and the API was slower. | Raise the `timeout` or check the API. |
| **The run was cancelled.** | You pressed stop. | Run again. |
| **Unexpected error while running: ...** | Something unforeseen. The detail follows. | Copy the detail when you ask for help. See [Specification support](/reference/support/). |

### Steps that did not run

| Message | What it means |
|---|---|
| **Not run because step "a" failed.** | An earlier step failed, so the run stopped. |
| **Not run because the workflow stopped.** | The workflow ended on an error or an action. |
| **Not run: the workflow ended earlier due to an end/goto action.** | A failure action ended the workflow or jumped. |
| **Not run because it depends on "a", which did not finish successfully (dependsOn).** | A step it depends on did not succeed. |
| **Operation "x" was not found in the loaded contracts.** | The step cannot be built. |
| **Too many levels of nested sub-workflows.** | Workflows call each other too deeply. |
| **Sub-workflow "x" failed.** or **failed at step "y": ...** | A workflow called as a step failed. The step and reason inside are named. |
| **The run was stopped: possible infinite loop of goto/retry actions.** | The actions jump back forever. Review the `goto` and `retry` actions. |

### Retries and actions

These are notes, not errors: **Retry 1 of 3 (action "...")**, **The 3 retries were exhausted**, **Goes to step "..."**, **Continues in workflow "..."**, **End of workflow (action "...")**, **Retry 1 of 2: runs step "login" first (action "loginAndRetry")**. The last one means a `retry` action ran the step it names before trying again. See [Success and errors](/design/success-and-errors/).

### Workflows that depend on others

| Message | What to do |
|---|---|
| **The workflows depend on each other in a circle: a → b → a.** | Break the circle in `dependsOn`. |
| **dependsOn mentions the workflow "x", which does not exist in this Arazzo.** | Fix the name. |
| **The workflow "x" that this step calls was not found.** | Check the `workflowId` of the step. For a workflow of another file, check the source and that the file is in the collection. |
| **The workflow could not be prepared: the workflow "x" it depends on failed.** | Fix that workflow first. |

### Messaging steps

| Message | What it means |
|---|---|
| **No message arrived on "channel" within 5000 ms (timeout).** | A **receive** step got no message. |
| **A message arrives on the channel** | What a receive step expects. |
| **The message was sent to "channel"** / **A message arrived from "channel"** | The step worked. |
| **Simulated: Luvin does not connect to brokers yet, so this step uses the AsyncAPI examples.** | A messaging step ran in simulation, also in a real run. See [Messaging steps](/design/messaging/). |
| **The message does not match the contract: ...** | A warning, like a response out of contract. |
| **The criterion failed and data needed to build it is missing: ...** | Data of an earlier step is missing. |

## Data not available

This label appears when an expression in the step had no value. The usual causes:

1. **An input has no value.** Fill it in the **Inputs** tab or in the case.
2. **An earlier step did not capture its output.** Open that step and check its outputs.
3. **The earlier step returned a list**, and the step needs one item. See [Choose an item from a list](/test/lists/).

## How a case is explained

Each case ends with a verdict and a sentence.

| Sentence | Verdict | What it means |
|---|---|---|
| **Every step met its criteria.** | Passed | The happy path worked. |
| **The workflow finished successfully, with warnings in: "a".** | Passed | It worked, but those steps have warnings. |
| **Failed at step "a": ...** | Failed | The first failed step and its reason follow. |
| **Failed at step "a" ...** when the reason is **Network** | Inconclusive | No answer from the API, so the case cannot be judged. |
| **"a" rejected the request with 400, as expected.** | Passed | A rejection case: the API said no. |
| **"a" accepted the request (200) when it should have rejected it with 400.** | Warning or Failed | See below. |
| **"a" responded 500; 400 was expected.** | Warning or Failed | The API rejected it with another status. |
| **"a" responded 200 and 404 was expected** | Failed | A case with its own expected status. |
| **With response 404, "a" triggered "notFound" (end), as expected.** | Passed | A case for an `onFailure` or `onSuccess` action. |
| **... triggered "x" instead of "y". Check the order or the criteria of the actions** | Failed | The first action whose criteria hold is the one used. |
| **... no action of "a" matched, so "y" was not triggered.** | Failed | Check the criteria of the actions. |
| **"b" was not reached: the workflow stopped at "a" (...).** | Inconclusive | An earlier step failed. The sentence adds a hint to check the earlier steps. |
| **The workflow stopped earlier, at "a" (...), so "b" could not be checked.** | Inconclusive | The same, for a rejection case. |
| **There was no response from the API.** | Inconclusive | The step did not get an answer. |
| **"b" was never run.** | Inconclusive | The workflow ended before. |

### Why a case ends in Warning

A case ends in **Warning** only when it is a **Data validation** case with the status Luvin suggested, and the API answered something else, usually by accepting data the contract says it should reject. The workflow still works. Review it with the people who build the API. If you choose the expected status yourself, the same difference is **Failed**. See [Adjust a case](/test/adjust-cases/).

## Related

- [Success criteria](/reference/criteria/)
- [Read the results](/test/results/)
- [Find out why a case failed](/tutorials/debug-failure/)
- [Troubleshooting](/get-started/troubleshooting/)
