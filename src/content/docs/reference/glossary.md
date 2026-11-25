---
title: Glossary
description: The words Luvin uses, one per concept.
sidebar:
  order: 6
---

| Word | Meaning |
|---|---|
| **Workflow** | A sequence of API calls where each step can use data from the previous ones. |
| **Step** | One call in a workflow: an API operation, a message, or another workflow. |
| **Input** | A value the workflow or a case starts with. |
| **Output** | A value a step exposes to the next ones, taken from its response. |
| **Case** | One run of a workflow with specific inputs and an expected outcome. |
| **Verdict** | How a case ended: passed, failed, warning or inconclusive. |
| **Contract** | An OpenAPI or AsyncAPI file that describes an API. |
| **Arazzo** | The open standard file where a workflow is written. |
| **Environment** | The base URLs, variables and secrets for one place, such as local or production. |
| **Collection** | A folder with the contracts, Arazzo files, environments, cases and requests of one project. |
| **Workspace** | A folder that holds collections. |
| **Request** | A single API call saved on its own, outside a workflow. |
| **Simulation** | A run answered from the contract examples, with no network calls. |
| **Script** | JavaScript that runs before a request is sent or after its response, as in Postman and Bruno. It can be in a request, a folder or the collection. See [Scripts](/requests/scripts/). |
| **Current value** | The value a script (or you, by hand) gives a variable on this computer. It wins over the value in the file and never reaches git. |
| **Secret** | A variable whose value is never written to the workspace files. Only its name is. |
| **Real API** | A run mode that calls the API with the base URLs and credentials of the active environment. |
| **Reusable** | A parameter or an action declared once in `components` and used by reference from several steps. |
| **dependsOn** | A workflow that needs another one to run first. Its outputs are available as `$workflows.<id>.outputs`. |
| **Dev Tools** | The panel with the Console, Network, Performance and Terminal tabs. See [Dev Tools](/dev-tools/overview/). |
| **Session** | What Luvin saves on this device when you work without a workspace, without credentials. |
| **Runner** | Runs several requests or workflows of a collection in order, one or more iterations. The run is **Functional** (checks that each one answers well) or **Performance** (many users at once). See [The runner](/runner/overview/). |
| **Iteration** | One pass of the runner through the chosen requests or workflows. With a CSV or JSON data file, each row is an iteration. |
| **Virtual user** | In a performance test, a simulated user that repeats the sequence on its own, with its own variables and cookies. The load comes from your computer. See [Performance](/runner/performance/). |
| **Load profile** | How the number of virtual users changes during a performance test: **Fixed**, **Ramp up**, **Spike** or **Peak**. |
| **Bottleneck** | The request or workflow step that is clearly slower than the rest in a performance test, by its p95. The result names it after **Slowest:** and marks its row **slowest**. |
| **Mock server** | A server on your computer that answers like your API, from the contract examples, the saved examples of the requests or routes you write. See [Mock servers](/mocks/overview/). |
| **Pick rule** | What to do when a step returns a list and a later step uses one item, saved in the Arazzo step as `x-luvin-pick`: use the item in the design, pick one at random, a different one each iteration, the one where a field meets a condition, or all of them. With a rule, Luvin does not ask, also in the runner. See [Lists](/test/lists/). |
| **History** | The requests you sent and the runs of the collection, including runner and performance runs, kept per collection. See [History](/workspaces/history/). |

## Related

- [Workspaces and collections](/workspaces/overview/)
- [Specification support](/reference/support/)
