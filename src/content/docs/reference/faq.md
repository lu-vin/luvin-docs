---
title: Frequently asked questions
description: Short answers to the questions testers and product people ask most, each with a link to the page that explains it in full.
sidebar:
  order: 11
---

Short answers, each with a link to the page that goes deeper.

## About Luvin

### What is Luvin for?

Luvin tests a chain of API calls, called a **workflow**, where each call uses data from the earlier ones. You design the workflow from your contracts, run it and read a verdict in plain words. It is not an automation or orchestration tool. See [What is Luvin](/get-started/welcome/).

### What does Luvin not do?

- **It is not an automation or orchestration tool.** Luvin is for designing, debugging and demonstrating API workflows. It does not run integrations in production.
- **It is not a CI runner.** Its runner runs workflows and requests inside the app, on your computer. The Arazzo files it writes are what you take to your pipeline, with any Arazzo runner.
- **It does not replace your API client.** Luvin sends single requests to help you debug one step. Keep your API client for single requests and use Luvin for the chain.
- **It is not a hosted service.** Everything runs on your computer. There is no backend and no account.
- **It does not connect to message brokers yet.** Messaging steps are simulated. See [Known limitations](/reference/limitations/).

### Do I need an account?

No. Luvin has no backend and no account. You open it and work. See [Privacy and security](/reference/privacy/).

### Is my data sent anywhere?

No. Everything runs on your computer. The only traffic is the requests you run against your own APIs, and the contracts you choose to download from a URL. See [Privacy and security](/reference/privacy/).

### What is Arazzo?

Arazzo is an open standard of the OpenAPI Initiative for describing a sequence of API calls in a file. Luvin writes it for you when you design a workflow, and reads it when you open one. See [The Arazzo file view](/design/arazzo-file/) and the [Glossary](/reference/glossary/).

### Which versions of the specifications does it support?

Arazzo 1.0 and 1.1, OpenAPI 3.x, and AsyncAPI 2.x and 3.x. See [Specification support](/reference/support/).

### Can I use Luvin in Spanish?

Yes. The interface, the messages and the HTML report are in English and Spanish. Change the language in **Preferences**. See [A tour of the interface](/get-started/interface/).

## Getting started

### Can I use it without OpenAPI?

Yes. Drag saved requests onto the canvas instead of contract operations. You can create requests from scratch, import a cURL command, or import a Postman or Bruno collection. See [Build from saved requests](/design/from-requests/) and [Bring your own files and requests](/get-started/import/).

### Does Luvin run my Postman or Bruno scripts?

Yes. Pre-request and post-response scripts come over whole when you import, and run as in Postman or Bruno, with the same `pm.*` and `bru.*` API, once you trust the collection. They run when you send a request, in the runner and in load tests, but not in workflow steps. See [Scripts](/requests/scripts/).

### Do I have to write YAML?

No. You design on the canvas and Luvin writes the Arazzo file. See [Design a workflow](/design/overview/).

### Can I edit the YAML by hand?

Yes. The **YAML** tab is the same file the canvas edits. What you write by hand is kept, and the tab validates it as you type. While the text can't be read, **Run** is disabled until you fix it. See [The YAML tab](/design/arazzo-editor/).

### Where are my files stored?

In the workspace folder you choose: a folder with one subfolder for each collection, all plain files. Without a workspace, the session is saved on this device. See [What is on disk](/workspaces/files/) and [Use Luvin without a workspace](/workspaces/without-workspace/).

### Can I work with my team in git?

Yes. A workspace is a folder of plain files and secret values are not in them, so you can commit it. See [Keep a workspace in git](/workspaces/git/).

## Running and results

### What is the difference between Real API and Simulation?

**Real API** sends the requests to the URLs of the active environment. **Simulation** answers from the examples in the contract, with no network and no credentials. See [Simulation](/test/simulation/).

### Why does the run pause with a dialog about a list?

A step returned a list and a later step uses it, so Luvin asks which item to continue with. Against the **Real API** it asks even when the list has one item. In **Simulation** it asks only when the list has more than one. Under **Next times:** you can save a rule, such as a random item, so it does not ask again. The runner never asks: it uses the saved rule, or the item in the design. See [Choose an item from a list](/test/lists/).

### Why did a case end in Warning?

A **Warning** case is a data validation case where the API answered a status other than the one Luvin suggested, usually by accepting data the contract says it should reject. The workflow still works. See [Why a step or a case failed](/reference/failure-reasons/).

### Why is a case Inconclusive?

Luvin could not judge it: the API did not answer, or the workflow stopped before the step the case checks. Fix the earlier problem and run again. See [Read the results](/test/results/).

### Why did a step fail when the API answered 200?

A [success criterion](/reference/criteria/) of the step was not met, for example a field with another value. Open the step: the reason says what was expected and what arrived. With no criteria, any 2xx passes.

### Will a real run change data in my API?

It can. Steps with POST, PUT, PATCH or DELETE send real requests to the environment, and Luvin asks you to confirm before it runs them. Choose a test environment or use Simulation. See [Run](/test/run/).

### Can I run several workflows at once, or with data from a file?

Yes, with the runner. It runs the chosen workflows in order, one or more iterations. With a CSV or JSON file, each row is an iteration: columns named like an input replace it. See [The runner](/runner/overview/).

### Can I test without the real API?

Yes, in two ways. **Simulation** answers from the contract examples, with no network. A [mock server](/mocks/overview/) answers on your computer like your API, so requests and workflows go over the network without touching the real one.

### Can Luvin run load or performance tests?

Yes. In the runner, choose **Performance**: many virtual users repeat the requests, or the happy path of each workflow, for a while. The load comes from your computer, so it is meant for tens or about a hundred users. It measures only the real API, and Luvin asks you to confirm before it starts. If the environment looks like production, you type its name to confirm. See [Performance](/runner/performance/).

### How do I share the results?

Press **Report** in the header of the results to get a self-contained HTML report without credentials, or **JSON** to export the results. See [Reports](/test/reports/).

## Secrets, environments and limits

### Where are secrets stored?

Only the names of secrets are written in the workspace files. The values are encrypted on your computer, with the system keychain. See [Base URLs, variables and secrets](/environments/variables-and-secrets/).

### Does it support OAuth 2.0?

Yes. Set it per API or per workflow without changing the Arazzo; the token is fetched once and reused. See [OAuth 2.0](/authorization/oauth2/).

### Does it support Kafka, AMQP or MQTT?

Not yet. AsyncAPI steps work, but they are always simulated from the contract examples, also in a real run. See [Messaging steps](/design/messaging/) and [Known limitations](/reference/limitations/).

### Can I run it in CI?

Luvin is a tool to design, debug and show workflows. It is not a CI runner. The Arazzo files it writes can be taken to a tool that runs Arazzo in CI, such as Redocly Respect. See [Known limitations](/reference/limitations/).

### How do I generate random data, such as a new email each run?

Write a template such as `{{email}}` or `{{$randomUUID}}` in a value. See [Dynamic variables](/environments/dynamic-variables/) and [Runtime expressions](/reference/expressions/).

## Related

- [Troubleshooting](/get-started/troubleshooting/)
- [Specification support](/reference/support/)
- [Glossary](/reference/glossary/)
