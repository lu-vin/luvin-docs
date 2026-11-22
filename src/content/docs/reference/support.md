---
title: Specification support
description: What Luvin supports of Arazzo 1.0 and 1.1, OpenAPI 3.x and AsyncAPI 2.x and 3.x.
sidebar:
  order: 3
---

Luvin works with **Arazzo 1.0 and 1.1**, **OpenAPI 3.x** and **AsyncAPI 2.x and 3.x**.

| Feature | Status |
|---|---|
| `operationId` (plain and `$sourceDescriptions.x.opId`) | Supported |
| `operationPath` | Supported |
| Steps with `workflowId` (sub-workflows) | Supported, of this file or of another Arazzo file (`$sourceDescriptions.<source>.<workflowId>`, source of `type: arazzo`) |
| Path, query and header parameters | Supported |
| `in: querystring` parameters (1.1) | Supported |
| `requestBody` with `payload` and `replacements` | Supported (JSON Pointer, JSONPath and XPath on XML payloads) |
| `requestBody` content types in workflow steps | JSON, `application/x-www-form-urlencoded`, `multipart/form-data` (payload fields only, no files) and plain text |
| `successCriteria`: simple, regex and JSONPath | Supported (jsonpath-plus syntax) |
| `successCriteria` and selectors: XPath | XPath 1.0 on XML responses |
| `onSuccess` / `onFailure`: `end`, `goto`, `retry` | Supported. `goto` and `retry` accept `stepId` or `workflowId`, also of another Arazzo file. `retry` with `stepId` runs that step once before each retry |
| `parameters` on success and failure actions (1.1) | Supported for `goto` and `retry` with `workflowId` |
| Selector Object in outputs, parameters and payloads (1.1) | Supported (JSONPath, JSON Pointer and XPath) |
| `components` (parameters, successActions, failureActions, inputs) | Supported |
| AsyncAPI sources (1.1): `channelPath`, `action`, `correlationId`, `$message` | Supported, always simulated |
| Step `timeout` (1.1) | Supported |
| Step `dependsOn` (1.1) | Checked in the analysis and before each step; steps run in document order |
| Workflow `dependsOn` | Dependencies run first (once per run) and their outputs are available as `$workflows.<id>.outputs`; cycles are detected. It can name a workflow of another Arazzo file of the collection (`$sourceDescriptions.<source>.<workflowId>`) |
| External `$ref` in OpenAPI, AsyncAPI and Arazzo files | Between loaded files, and next to a contract downloaded from its URL |

## Related

- [Known limitations](/reference/limitations/)
- [The bundled examples](/reference/examples/)
