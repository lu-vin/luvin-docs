---
title: Known limitations
description: What Luvin does not do yet.
sidebar:
  order: 4
---

These are the things Luvin does not do yet. Check them before you plan a test, so a missing feature does not surprise you.

- **Messaging steps are simulated.** Luvin does not connect to Kafka, AMQP or MQTT yet; the app says so before running.
- **Unsigned desktop installers**, tested on macOS. The Windows build has not been tested yet.
- **gRPC** needs the `.proto` (no server reflection yet) and client-streaming and bidirectional methods send a single message.
- **No custom WebSocket headers** (Luvin opens the connection like a browser does). Pass a token in the URL instead, for example `?token={{token}}`.
- **Workflow steps send payload fields, not files.** A step with a `multipart/form-data` body is sent as multipart: each payload field is a part, a list gives one part per item, and an object is sent as JSON. A step cannot attach a file. Single requests do support files and binary bodies: see [Send a file](/requests/send-files/).
- **Swagger UI for OpenAPI only.** AsyncAPI contracts use Luvin's own preview.
- **XPath 1.0.** Functions specific to XPath 2.0 or 3.0 are not available.
- **Performance tests run from your computer.** The load comes from this machine: up to 500 virtual users and 60 minutes per test, limited by what your computer and network can send. See [Performance](/runner/performance/).
- **Performance tests measure only the real API.** In **Simulation** there is nothing to measure. To test without the API, point the environment at a mock server. For workflows, the test repeats one case per workflow: the happy path among the checked ones, or the first.
- **WebSocket requests are not part of the runner.**
- **Scripts run in HTTP and GraphQL requests, not in workflow steps.** They run when you send a request, in the runner and in load tests of requests. Some Postman and Bruno members are not available, such as `pm.execution.setNextRequest` or `pm.vault`: see [The script API](/requests/scripts-api/#what-is-not-available).
- **No hosted version yet.** Luvin is a desktop app: it runs on your computer.

## Related

- [Specification support](/reference/support/)
- [Install](/get-started/install/)
