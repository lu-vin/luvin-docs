---
title: Find out why a case failed
description: Read the verdict and its reason, see the failure on the canvas, check the request in Dev Tools, repeat it in a terminal with cURL, try another value in a pause and fix the input.
sidebar:
  order: 5
---

A case ended as **Failed** and you need to know why: your workflow, your data or the API? You will cause a failure on purpose in the Pokédex example, and follow it from the verdict down to the exact request. You need about 20 minutes, Luvin open with the Pokédex example, an internet connection and, for step 5, a terminal.

## 1. Cause a failure

1. Open **Pokemon card** and click the **Inputs** tab.
2. Type `missingno` in `pokemon`. That Pokémon does not exist.
3. Click the **Cases** tab and click **None** to untick every case. Tick **Happy path**.
4. In the run bar, choose **Real API** and click **Run**.

The results open at the bottom and the case ends as **Failed**.

## 2. Read the verdict and the reason

![A case that did not pass, with the failed step open and the reason in plain words](/media/en/results-failed.webp)

1. Look at the header of the results. The counter ✕ says 1.
2. Click the case in the list on the left. The detail shows its verdict, **Failed**, and these rows:

| Row | What it says here |
|---|---|
| **Expected** | Every step meets its criteria. |
| **Result** | The reason in plain words. It starts with *Failed at step "getPokemon"* and says *The API responded 404 Not Found.* |

You already know where it broke (the first step) and what happened (the API did not find the Pokémon). See [Read the results](/test/results/).

## 3. Open the failed step

Under the detail, each step is a card. The failed one is already open.

1. Read its header: the status **Failed**, the method and path, and the HTTP status `404`.
2. Read the note under the header. It names the kind of problem, **Error returned by the API**, and the action that fired, *End of workflow (action "pokemonNotFound")*.
3. Click the tab **Criteria**. Each success criterion says **Met** or **Not met**. The status criterion is not met.
4. Click **Request** to see the URL, headers and body that were sent. The path ends in `/pokemon/missingno`.
5. Click **Response** to see what the API answered.

The steps after it say **Not run**, because the workflow stopped. See [Read a step result](/test/step-results/).

### The same failure on the canvas

1. Click the **Design** tab. The canvas shows the run: the card of `getPokemon` is red and says **✕ 404 → ends**, its 404 route says **taken**, and the other steps say **did not run**.
2. Click the card of `getPokemon` and open the **Response** tab of its panel.
3. Under **Why it failed**, `$statusCode == 200` says **was 404**. Under **What it received**, `idOrName` is `"missingno"`.

![The canvas after the failed run: the card of getPokemon says ✕ 404 → ends, and its Response tab says why it failed and that idOrName was "missingno"](/media/en/test-canvas-failed-response.webp)

The diagram tells you the same as the results, without leaving the workflow. See [Results on the canvas](/test/run-on-canvas/).

### When the label is "Criterion not met"

Here the API answered with an error. When the API answers 200 but a value is wrong, the label is **Criterion not met** and the note compares two values. For example, in a shop API:

```text
status
Expected   "ACTIVE"
Received   "INACTIVE"
```

Press **See in the response**. The **Response** tab opens with that field highlighted in the body. Compare the field with what you expected: the API may have changed, or your data is not what you thought.

## 4. Look at the real request in Dev Tools

Dev Tools lists every request Luvin sent, with secrets masked.

1. Click **Dev Tools** in the bar at the bottom of the window, and open the **Network** tab.
2. Find the row with a red status `404`. Failed rows are highlighted. Type `missingno` in **Filter by URL, step or status…** to find it faster.
3. Click the row. A panel opens with the summary: **Status**, **Time**, **Size**, **Step** and **Case**.
4. Click **Request** and then **Response** to read the headers and the body of each.

![Dev Tools: the Network tab with a request selected](/media/en/devtools-network.webp)

If you do not see **Dev Tools**, you are in the **Simple** interface. Switch to the full one in **Preferences**. See [The interface](/get-started/interface/).

## 5. Repeat it in a terminal

If the same request fails outside Luvin, the problem is not in the workflow.

1. In the detail of the request, click **Copy as cURL**. The button shows **✓ Copied**.
2. Paste it in a terminal and press Enter. Add `-i` after `curl` to see the status line.

```bash
curl -i 'https://pokeapi.co/api/v2/pokemon/missingno'
```

The terminal also answers 404. So the workflow is correct and the data is wrong. Secrets in the command appear as `<secret>`: replace them by the real values. See [Network](/dev-tools/network/).

## 6. Try the operation alone

You can call one operation without the rest of the workflow.

1. In the sidebar, under **Pokemon card**, click its first step, the `GET` of `getPokemon`. A tab opens with the step.
2. Click **▶ Try alone**. A tab opens with the operation.
3. Choose **Real API**, check the environment and click **Send**.

The status and the body appear. Change the path parameter to `pikachu` and send again: you get 200. Now you know the operation works and only the value was wrong. See [Try one operation](/contracts/try-it-out/).

## 7. When the API does not answer

Not every failure is an answer. If the step has **Network** as its label and there is no status, the API did not respond. A panel titled **Could not reach the API** appears above the results, with the number of cases affected and the servers that did not answer.

1. Click **Open https://… ↗** to try the address in your browser. If it does not load, the problem is the server or the address.
2. Click **Review environment** and check the base URL.
3. If the address loads but the run still fails, check [Preferences → Network](/get-started/network/): a proxy, a client certificate or the request timeout.
4. Click **Try in simulation** to keep working while it is fixed.

See [Connection help](/dev-tools/connection-help/).

## 8. Try another value without changing the input

Before you change the input, check that another value works, from the same step.

1. In the **Design** tab, click the card of `getPokemon` and press **F9**. The card shows **⏸ pause**.
2. Click **Run**. The run stops before `getPokemon`, and the bar at the bottom of the canvas says **⏸ Paused before step 1**.
3. In the panel, under **Receives**, `idOrName` says `missingno`. Type `pikachu` and click **▷ Continue**.
4. If the run pauses to choose from a list, click **Continue with this item** each time.

The case ends as **Passed**, and the chip of `idOrName` says `= "pikachu" ✎`. The **Inputs** tab still says `missingno`: the value you typed applied only to that run. Press **F9** on the card again to remove the pause. See [Debug a workflow](/test/debug/).

## 9. Fix the input and run again

1. Click the **Inputs** tab and type `pikachu` in `pokemon`.
2. Click the **Cases** tab and click **Run**.

If the run pauses with **Run paused**, click **Continue with this item** each time. The case ends as **Passed**. See [Choose an item from a list](/test/lists/).

## What you learned

- The **Result** row says in plain words where the case broke and why.
- The label of a failed step tells the kind of problem: the API returned an error, a criterion was not met, there was no response, and so on.
- **See in the response** highlights the field that differs.
- Dev Tools **Network** shows the exact request, and **Copy as cURL** repeats it in a terminal.
- In the **Design** tab, the canvas shows the failed step in red, and its **Response** tab says why it failed.
- A pause (**F9**) lets you try another value in one step without changing the inputs.
- **▶ Try alone** tests one operation without the rest of the workflow.
- The connection panel helps when the API does not answer.

## Next

- [Prove your API rejects bad data](/tutorials/negative-cases/)
- [Debug a workflow](/test/debug/)
- [Network](/dev-tools/network/)
- [Why a step or a case failed](/reference/failure-reasons/)
