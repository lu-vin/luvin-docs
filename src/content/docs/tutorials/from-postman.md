---
title: From a Postman or Bruno collection to a tested workflow
description: Import a collection you already have, chain two saved requests into a workflow, let Luvin suggest the wiring and add a case with your own data.
sidebar:
  order: 2
---

You will turn a Postman or Bruno collection into a workflow that creates an order and reads it back, and then test it with your own data. You need about 25 minutes, Luvin open with a workspace, and a collection exported from Postman (JSON, v2.0 or v2.1) or a Bruno collection folder. It needs no OpenAPI contract.

The example uses a shop API with two requests: **Create order**, and **Get order**, whose path is `/orders/{{order_id}}`. Use your own names.

:::caution
The workflow sends the requests for real. Point the environment at a test server, not at production.
:::

## 1. Import the collection

1. Click **+** (**Create or import**) to the right of the open tabs, then **Import collection (Luvin, Postman or Bruno)**. If no workspace is open, Luvin says **Open or create a workspace to import.** Open one first.
2. For Postman, click **Choose .json files** and pick the exported collection. Pick its environment files too, to bring the variables. For Bruno, click **Choose folder** and pick the collection folder.
3. Read the summary: requests, folders, examples and environments, and how many scripts come over. Postman and Bruno scripts come over whole and run as in the original: see [Scripts](/requests/scripts/).
4. Change the collection name if you want, then click **Import (N requests)**. If a collection with that name already exists, the summary lets you import a copy or replace it: see [When the collection already exists](/get-started/import/#when-the-collection-already-exists).

![The Import collection dialog with a card for Luvin, one for Postman and one for Bruno](/media/en/import-postman.webp)

Luvin creates a new collection and opens it. If it has scripts, Luvin asks **Do you trust this collection?** Choose **Trust** if you know where it comes from: see [Trust a collection](/requests/scripts/#trust-a-collection). Bruno does not save the value of its secrets: if your environment has some, they arrive empty. Open the environment in the **Environments** panel of the sidebar and type them. See [Import your existing work](/get-started/import/).

## 2. Open a request and send it

1. In the sidebar, open the new collection and click the request **Create order**.
2. Check the environment shown next to the request name. It must be the test one.
3. Click **Send** (or press ⌘/Ctrl + Enter).

The response appears below with its status, time and size. If it says **The request couldn’t complete**, see [Connection help](/dev-tools/connection-help/).

This also helps later: Luvin remembers the last response you received from a request. See [Single requests](/requests/overview/).

## 3. Create a workflow

1. Click **+** (**Create or import**) and choose **New Arazzo**.

Luvin creates `new.arazzo.yaml` in the collection and opens its workflow, **My workflow**, in the **Design** tab. The canvas says **Build your workflow**.

2. Click the name, type `Order and read it` and press Enter.

## 4. Add the saved requests

1. On the empty canvas, click **Build from the collection's requests**. The **Add a step** dialog opens with the requests of the collection, by folder.
2. Click **Create order**, then **Get order**. Each one goes at the end of the workflow, in that order.
3. Close the dialog.

You can also drag a request from the collection tree in the sidebar onto the canvas.

Each request is a step titled with its name, **Create order** and **Get order**, with the ids `createOrder` and `getOrder`. A step is sent exactly like its request, with the same URL, headers and body.

Look at the path of **Get order**:

- If the script of **Create order** saves the id, for example with `pm.collectionVariables.set("order_id", …)`, Luvin already connected it: `{{order_id}}` comes from `createOrder`. Luvin read the script without running it. Part 6 will have nothing to accept.
- If not, `{{order_id}}` stays written by hand: Luvin does not know yet that `createOrder` returns that value.

A bar above the canvas says the steps have no required fields marked. You can click **Mark** now or later: it only matters for the negative cases. See [Build from saved requests](/design/from-requests/).

:::tip[If your API needs a login]
Add the login request first. If its script saves the token (`pm.environment.set("accessToken", …)`) and the other requests use `Bearer {{accessToken}}`, Luvin connects the token to the next steps by itself and says so in a notice. The login card shows **🔑 signs in**. See [Pass the login token to the next steps](/authorization/token-from-login/).
:::

## 5. Run once so Luvin learns the responses

A saved request does not say what the API answers. Luvin learns it from the first run against the real API.

1. Open the **Cases** tab. The **Happy path** case is ticked.
2. In the run bar, choose **Real API**. At the top right of the window, choose the test environment.
3. Click **Run**.
4. Luvin warns that the steps modify data in that environment. Read the name of the environment and click **Run anyway**.

The results open at the bottom. If a step returns a list that a later step uses, the run pauses with **Run paused**: click **Continue with this item**. See [Choose an item from a list](/test/lists/).

:::tip[Learn without running]
In **Design**, click a step. If Luvin does not know its response, the panel offers **Try this step**. For a POST it asks first and you confirm with **Send anyway**.
:::

## 6. Accept the suggested wiring

1. Go back to the **Design** tab. A bar above the canvas says **Luvin found 1 connection(s) between steps**. If there is no bar, Luvin already connected the id in part 4: go to part 7.
2. Read the line: it names the step, the value and where it would come from, for example the path of `getOrder` and the `id` of `createOrder`.
3. Click **Connect all** (or **Connect** on that line).

The step `getOrder` now takes its id from `createOrder`, and its card on the canvas names `createOrder` as the source of that value. Luvin connects nothing until you accept. **Undo** reverts it. Run the workflow again: `getOrder` reads the order that `createOrder` just made. See [Connect data between steps](/design/wire-data/).

## 7. Choose the data to vary

The steps keep the values of the requests, so the workflow starts with no inputs, and a case has nothing to change.

1. On the **Start** card, which says **no inputs**, click **Choose variable data…**.
2. In **Data to vary per case**, tick the values you want to change, for example the customer id in the body of **Create order**. Each row shows where it is and its current value.
3. Click **Turn into inputs (N)**.

Each value becomes an input that keeps its current value as the default, so the happy path does not change. Open the **Inputs** tab to see them. See [Inputs](/test/inputs/).

Now that the workflow has inputs, open **Cases**: Luvin also generates cases that send missing or invalid data. See [Cases](/test/cases/).

## 8. Add a case with your own data

1. In the **Cases** tab, in the group **Custom data cases**, click **+ New data case**.
2. In **Case name**, type `Unknown customer`.
3. In **Step to check**, choose `createOrder`.
4. In **Expected status**, type the status your API returns for an unknown customer, for example `404`.
5. Under **Case inputs**, change the customer id to a value that does not exist, for example `C-0000`.
6. Click **Add case**, then **Run**.

Custom data cases always run against the real API. If the API answers what you expected, the case ends as **Passed**, and the step that answered the error is shown as passed because it is what the case tests. If it answers something else, the case ends as **Failed** and says what was different. See [Custom data cases](/test/custom-cases/).

## What you learned

- A Postman or Bruno collection imports as a Luvin collection, without a contract.
- Saved requests become steps that Luvin sends as they are.
- What the Postman or Bruno scripts save, including the login token, is wired while you build, without running the scripts.
- The first run against the real API teaches Luvin the responses, and then it suggests the rest of the wiring. You decide.
- **Choose variable data…** turns fixed values into inputs, which unlocks generated and custom cases.

## Next

- [Prove your API rejects bad data](/tutorials/negative-cases/)
- [Find out why a case failed](/tutorials/debug-failure/)
- [Single requests](/requests/overview/)
