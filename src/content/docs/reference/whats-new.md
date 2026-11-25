---
title: What's new
description: What Luvin can do, release by release, grouped by date and written for the people who use it.
sidebar:
  order: 12
---

This page lists what Luvin can do and when each capability arrived. The newest is first. The current version is **0.2.0-beta.10**.

## 25 November 2026 · version 0.2.0-beta.10

**The workflow canvas, redesigned.**

- **Full step cards and a roomier canvas.** Every step shows in full, with controls to minimize it; the workflow starts at **Start** and ends at **End of workflow**, and a failure shows in red. **＋ Step** replaces the palette column, and the step panel opens over the canvas, with tabs. See [Design workflows](/design/overview/).
- **Data as chips, without arrows.** Each value a step receives says where it comes from; its line appears only when you pick or hover a step. See [Wire data between steps](/design/wire-data/).
- **Every Arazzo route on the canvas**, one color per scenario, with a selector for each action (`goto`, `retry`, `end`) and a **Routes** panel to order, edit and remove them.
- **To review** reads the Arazzo the way a run would and flags what the schema can't see, such as a JSONPath condition written as a comparison, which never matches.
- **Run and debug on the canvas.** Each card shows whether it passed, compared with the previous run. Pause before a step, change what it receives (JSON body fields too) and continue; or run only a step, up to a step or from a step. See [Run on the canvas](/test/run-on-canvas/) and [Debug](/test/debug/).
- **Test every route without your API.** Luvin simulates the response that leads to each route, and coverage shows which are missing, what each case did and which errors have no route. See [Probe routes and coverage](/test/probe-routes/).
- **Copy, paste, duplicate and extract steps.** Picked steps copy to another workflow, and consecutive steps extract to a new workflow with a preview.
- **Arazzo patterns from ＋ Step:** go through every page, wait until it finishes, and sign in and use the token. Also with a collection's requests.
- **The YAML beside the canvas**, and a minimap.
- **A fix when building from requests:** data is wired from what the Postman scripts save, an id is never taken from a step about something else, generated data such as `{{$randomFirstName}}` is kept, and a request that expects an error passes with that error. See [Build from saved requests](/design/from-requests/).

## 24 November 2026 · versions 0.2.0-beta.8 and 0.2.0-beta.9

**The login token goes to the other steps, and a workflow that reads at a glance.**

- **The login token, in the next steps.** Each step says where its authorization comes from: the environment, a step's token or none. Luvin recognizes the token by reading the login's script, without running it, and connects it while you build, written in standard Arazzo. See [Workflow authorization](/authorization/workflow/).
- **Steps named the way you named them.** A step built from a request is titled with the request's name and gets a short, readable id. Generated contracts with the same base URL are one API.
- **Required fields without a dialog.** They're marked in the step panel itself.
- **The collection, in tabs like Postman**, with Luvin's documentation on the side. See [Collection overview](/workspaces/collection-overview/).
- **The runner lists each request's tests and checks**, like Postman's runner.
- **A Postman collection with secret variables** runs as in Postman, and its saved values show and edit in both variable views.
- **Opening a folder that isn't a workspace** no longer creates one silently.

## 23 November 2026 · versions 0.2.0-beta.5 and 0.2.0-beta.6

**Variables on four levels, Postman and Bruno scripts, and the desktop app only.**

- **Luvin is a desktop app for macOS and Windows.** The examples and the tour live in the app data folder. See [Install and open Luvin](/get-started/install/).
- **Four variable levels, as in Bruno:** the workspace's global environment, the collection's environment, collection variables and request variables, resolved in one order. The **Variables** panel shows them all, like Postman's "All variables", and a variable's card creates or moves it with **Add to**. See [Where a variable lives](/environments/variable-levels/).
- **The global and the collection environment, together** in one split pill, as in Bruno.
- **Variables in the body editor**, created with their value; JSON bodies with comments; and a panel with the request's variables. See [Parameters, headers and body](/requests/params-headers-body/).
- **Scripts before the request and after the response**, as in Postman: on the request, the folder or the collection, with the `pm.*` API and Bruno's (`bru.*`), `pm.sendRequest` and Postman's libraries, in an isolated sandbox. They also run in the runner and in performance tests. Scripts of a collection you didn't write wait until you trust it. See [Scripts](/requests/scripts/).
- **Importing brings scripts over whole.** Postman and Bruno scripts are kept as they are and run as in the original; they're no longer converted. Each variable lands on its level, and if the collection already exists, Luvin asks whether to import a copy or replace it. See [Bring your own files and requests](/get-started/import/).
- **Resizable panels**, as in Postman: the request/response split, the collections sidebar and the side panels.
- **Other improvements:** renaming a workspace renames its folder; dropping a Postman or Bruno file takes it to the importer, even with no collection open; and ⌘Q saves pending changes before quitting.

## 19 November 2026 · versions 0.1.4 and 0.1.5

**Runner, performance tests, mock servers, history and network.**

- **Requests and workflows runner.** Run several requests or workflows in order, one or more iterations, with a CSV or JSON data file. For workflows you see and choose each one's cases, and lists are picked by a rule saved in the step. See [The Runner](/runner/overview/).
- **Performance tests** for requests and workflows: virtual users, load profiles (fixed, ramp up, spike, peak), pass criteria and per-step results with the bottleneck. See [Performance tests](/runner/performance/).
- **Local mock servers** per collection, with routes from saved examples or a contract, templates and alternative responses. See [Mock servers](/mocks/overview/).
- **History** of requests and runs per collection, searchable and ready to run again. See [History](/workspaces/history/).
- **Post-response variables and checks**, without scripts. Postman and Bruno tests are converted on import. See [Variables and checks](/requests/variables-and-checks/).
- **Network in the desktop app:** proxy, client certificates and request settings in Preferences. gRPC, WebSocket and OAuth login use the same settings. See [Network settings](/get-started/network/).
- **In the designer, a + for each branch and between steps.** "If it responds 404, go to a new step" is built from the step card, and the (+) on each arrow inserts a step there. See [Success and errors](/design/success-and-errors/).
- **The guided tour comes in short sections**, starting with workflows. See [The guided tour](/get-started/guided-tour/).
- **A YAML typo no longer breaks the collection.** The file shows as "can't be read", Run is blocked and, once fixed, its workflows come back with their cases.
- **Simulation is labelled as such.** Each case says whether it ran against your API or in simulation, and the summary says when nothing called your API, so a simulated pass isn't read as a real one. See [Results](/test/results/).
- **The environment is always in view, and the sidebar has panels.** The active environment shows at the top right of the window, in its color (Luvin green by default), where you also switch it. Icons at the top of the sidebar switch between collections, environments, history and mock servers. When there are more tabs than fit, arrows and a list of every open tab let you reach them, and the + stays visible. See [A tour of the interface](/get-started/interface/) and [The sidebar](/get-started/sidebar/).
- **Safer:** secrets saved by a request don't show in history or Network; a mock server only answers your machine; a huge compressed response no longer fills the memory; an https to http redirect doesn't carry the authorization.
- **Safer environments and contracts that stay.** Switching environments clears the values saved by requests, the OAuth 2.0 tokens and the cookies, so a token from `local` never reaches `production`. A `{{name}}` that the active environment doesn't have shows a yellow strip in the request before you send it. In a workspace, a file you attach for a missing contract is saved in the collection folder, and downloaded contracts are downloaded again when it opens. New inputs copy the contract's rules (`enum`, `pattern`, `format`, limits), so their cases appear right away. See [Environments](/environments/overview/) and [Remote contracts and references](/contracts/remote-and-refs/).
- **New contracts are ready to use.** A contract no workflow file lists yet (○) has its operations in the palette, and using one adds it to the file. A contract that had a YAML error loads as soon as you fix it, and the contract documentation starts authorized with a pasted OAuth 2.0 token. See [A contract added after the workflow file](/contracts/add/#a-contract-added-after-the-workflow-file).
- **Renaming a collection renames its folder.** The folder on disk, `luvin.yaml`, its secrets and its history follow the new name. See [Rename a collection](/workspaces/collections/#rename-a-collection).
- **Delete generated cases, and more security cases.** A generated case you don't want can be deleted; it is saved in the scenarios file and restored from ⋯. **Without credentials** also covers steps built from requests and APIs with an authorization set in Luvin. Against the real API, a list of one item also asks before going on. See [Cases](/test/cases/).
- **The Runner shows which item each list goes on with.** In the Runner, **Lists in the responses** shows, for functional and performance runs, each list later steps use and the item each iteration takes: the saved rule or the one in the design. The results of a performance test count the items used from each list. See [Lists in the Runner](/runner/workflows-lists/) and [Items used from the lists](/runner/performance-results/#items-used-from-the-lists).
- **Design: fields of object outputs, Delete and right-click on the canvas.** A parameter can take one field of an object a previous step or a called workflow returns, chosen in the design. Lists returned by a called workflow ask for the item when you run. Selected data lines are removed with Delete, and steps, lines and the background have a right-click menu. See [Connect data between steps](/design/wire-data/) and [Organize a workflow](/design/organize/).
- **AsyncAPI operations in the palette.** Send and receive operations are dragged onto the canvas like any operation. Luvin writes the messaging step: `action`, the correlation header and the payload wired from earlier steps, and for a receive, the same correlation id as the send before it and a timeout. See [Messaging steps](/design/messaging/#add-a-messaging-step).
- **Other improvements:** Enter in the URL sends the request and ⌘/Ctrl+Enter sends it from anywhere; undo in the designer survives switching tabs; a JSON Arazzo stays JSON; the ⌘K palette has actions and mock servers.

## 18 November 2026 · versions 0.1.2 and 0.1.3

**More than 70 fixes from testers.**

- **Variables inside variables.** A variable whose value names another one, such as `Bearer {{token}}` or `{{host}}/v1`, is resolved too, as in Postman, instead of going out literally. See [Use variables](/environments/use-variables/).
- **Path variables with their own value** in requests, and suggestions to create them.
- **More faithful runs:** `goto` and `retry` loops across workflows stop, a request is never sent with an empty path parameter, the servers an operation declares are used, JSONPath filters follow the specification (RFC 9535) and a value the response doesn't have no longer passes a check.
- **Authorization:** AWS SigV4, OAuth 2.0 (client credentials and refresh), Digest and NTLM fixed.
- **Requests:** binary responses download intact, cookies set during a redirect are kept, large JSON numbers stay exact and a GET body is sent.
- **Design:** YAML anchors and aliases are respected, and renaming steps, outputs, components or workflows updates what uses them, also in other Arazzo files.
- **Workspaces, environments and secrets:** each environment keeps its own file, an unreadable file is never overwritten, pending changes are saved before closing, and secrets follow each environment and request even when renamed.

## 17 November 2026

**Workflows of other Arazzo files, retry with a step, and multipart.**

- **Use a workflow of another Arazzo file.** Declare the file as a source with `type: arazzo`, then use `$sourceDescriptions.<source>.<workflowId>` in `dependsOn`, in a step or in a `goto` or `retry` action. In the **Design** tab, **Depends on** lists the workflows of the other files and the **Operations** palette has the group **From other Arazzo files**. See [Workflows that use other workflows](/design/dependencies/) and [Use a workflow from another Arazzo file](/recipes/cross-document/).
- **`retry` with `stepId` now runs.** On a failure, Luvin runs the step you name and then tries the failed step again. See [Log in again and retry](/recipes/retry-step/).
- **Workflow steps send `multipart/form-data`.** Each payload field is a part. Files are not sent from a workflow step.
- **A workflow called as a step takes its default values** for the inputs the step does not pass.
- **Files for your team and your tools are in English, whatever the app language.** The JSON report (`cases`, `verdict`, `steps`), the `scenarios/` files (`defaults`, `cases`, `name`, `expect`) and the comment at the top of each workspace file. Scenario files with the Spanish keys of earlier versions are still read. See [Reports](/test/reports/) and [Files of a workspace](/workspaces/files/).

**Test with lists, and a calmer workspace.**

- **Choose which item of a list a case continues with.** When a step returns a list that later steps use, the run pauses and asks. You can pick one item, several, or send the whole list. See [Choose an item from a list](/test/lists/).
- **Fields of a list are named without their position.** The builder shows `cards/bank`, not `cards/0/bank`.
- **Edit a step's body in the designer** and feed its fields from inputs. See [Parameters and body](/design/parameters-and-body/).
- **Generate the requests of a collection from an OpenAPI contract**, and use them in a workflow. See [Generate requests from a contract](/requests/generate-from-contract/).
- **Find and complete what a workflow is missing**, and decide which fields of a request are required. See [Complete missing data](/design/complete-gaps/).
- **Start from the example.** The welcome screen opens the Pokédex example with fewer decisions.
- **A clearer home, sidebar, cases and collection screens.** Results wait in a bar at the bottom, and what you open with one click takes a single preview tab.
- **Drop contracts and Arazzo files anywhere in a workspace.**
- **Delete** workflows, contracts and environments from the sidebar, and **rename** workflows. A new overview shows the Arazzo file.
- **The diagram opens at a readable zoom**, and a step you add stays in view.
- **One word per concept** across the interface: workflow, input, case, Run.
- **A fix:** a step that answers the expected error now reads as passed in every kind of case, and a path parameter no longer gets a "missing input" case, because without it the URL points to another resource.

## 16 November 2026

**A request workbench and imports.**

- **Single requests on a par with Postman and Bruno**: the URL and its query parameters stay in sync, and Luvin logs in before sending. See [Single requests](/requests/overview/).
- **Import collections from Postman and Bruno.** See [Bring your own files and requests](/get-started/import/).
- **Design workflows from the requests of a collection.** See [Build from saved requests](/design/from-requests/).
- **Choose the expected status of a case** and read results without contradictions. See [Adjust a case](/test/adjust-cases/).
- **Results docked below**, and automatic login before a run.
- **Desktop fix:** requests get past firewalls that reject unknown clients, and logins keep Luvin's own identity.

## 15 November 2026

**Luvin, with the visual builder.**

- **New name and logo:** the app is now called Luvin.
- **Design workflows by dragging.** Operations from the contract become steps and Luvin wires the data by rules, without AI. The diagram is the canvas. See [Design a workflow](/design/overview/).
- **Reusables**: save parameters and error actions once and use them in several steps. See [Reusables](/design/reusables/).
- **Call a workflow as a step**, set workflow outputs and `dependsOn` in the builder. See [Workflows that use other workflows](/design/dependencies/).
- **Requests, gRPC and WebSocket clients**, import from cURL, and many authorization types. See [Single requests](/requests/overview/).
- **Authorization per API and per workflow** in a run. See [Authorization of a workflow](/authorization/workflow/).
- **The PayPal example** with OAuth 2.0 and a webhook, and a longer guided tour. See [The bundled examples](/reference/examples/).
- **Examples open as real collections**, with documentation and a picker in the welcome screen.
- **Results in plain words, a simple interface mode and a role selection** for product people.
- **`{{variable}}` and `{{$generator}}` templates are resolved** inside Arazzo values. See [Runtime expressions](/reference/expressions/).

## 14 November 2026

**The desktop app and workspaces.**

- **The desktop app.** The installers are not signed, and have been tested on macOS. See [Install and open Luvin](/get-started/install/).
- **A workspace on disk**, with collections that hold several Arazzo files, **environments** with colors, **variables and secrets**. See [Workspaces and collections](/workspaces/overview/).
- **Dev Tools** with Console, Network and Performance, and an integrated **Terminal**. See [Dev Tools](/dev-tools/overview/).
- **Edit contracts** next to a Swagger UI preview, **try an operation**, and see which workflows a change affects. See [Contracts](/contracts/overview/).
- **The Pokédex example** against the public PokéAPI and a **guided tour** over it. See [The guided tour](/get-started/guided-tour/).
- **Collection overview** with version, statistics and generated documentation.
- **A simple interface** that hides Dev Tools and the terminal.
- **Workflow `dependsOn`**, cookies in the desktop app and XPath 1.0 support.
- **Arazzo 1.1, AsyncAPI and external `$ref`** support. See [Specification support](/reference/support/).
- **The Arazzo editor** with live validation and a draggable diagram. See [The YAML tab](/design/arazzo-editor/).
- **A fix:** a missing path input now expects a 400 or 404 and shows the URL that was really called.

## 23 October 2026

**Cases, environments and clearer failures.**

- **Why a criterion fails, field by field**, and a comparison of the expected and the received value. See [Success criteria](/reference/criteria/).
- **Help when the API does not answer**, with the CORS headers it needs. See [Connection help](/dev-tools/connection-help/).
- **Tell apart** a connection failure, a missing URL and a cancelled run.
- **Environments** (DEV, QA, UAT...) with their own URLs and credentials, and the environment shown in the report.
- **Copy any request as cURL**, with the API key in the query masked.
- **Nested inputs edited field by field**, with warnings as you type when a value does not fit the contract.
- **Choose which workflows to test**, with readable names in cases, results and reports.
- **Progress of a run** with the current case and the time left, and a session that you can continue when you return.

## 22 October 2026

**The first version.**

- **English and Spanish** for the interface, the messages and the results, with a language selector.
- **A first flow to load contracts and Arazzo files**, see the workflows and their diagram, and generate test cases.

## Related

- [The bundled examples](/reference/examples/)
- [Known limitations](/reference/limitations/)
- [Specification support](/reference/support/)
