---
title: Privacy and security
description: Where your data lives, how secrets are kept and what Luvin can and cannot reach.
sidebar:
  order: 5
---

Luvin runs on your machine. This page says where each kind of data lives and what protects it.

- Everything runs **on your machine**. There is no backend and no account.
- **Secrets never go into the workspace files.** Environment files only keep secret names. Values are stored **encrypted on this computer**: with the operating system's keychain.
- Tokens, passwords and API keys are **masked** in results, reports, exports, Dev Tools and every cURL.
- Luvin only reads and writes inside folders you chose, and its interface has no direct access to the file system. The terminal opens your own shell, only in a workspace folder or your home folder.
- Without a workspace, the saved session leaves out credentials and any input whose name looks sensitive (`token`, `password`, `secret`…).
- **History stays on this device**, in the storage of the app (IndexedDB), never in the workspace files. Environment secrets, credentials and the values a request saves as secret are masked in it. You can turn it off in **Preferences**. See [History](/workspaces/history/).
- **Mock servers listen only on `127.0.0.1`.** Other computers cannot reach them. From a browser, only a page served from `localhost` or `127.0.0.1` can read their responses, and a call that uses any other host name gets `403`. See [Routes and responses](/mocks/routes/).

## Where each kind of data lives

| Data | Where | In the files? |
|---|---|---|
| Contracts, Arazzo files, cases, requests | The workspace folder. | Yes. |
| Names of secrets, base URLs, variables | `environments/*.yaml`. | Yes. |
| Values of secrets and credentials | Encrypted on this computer. | No. |
| The session without a workspace | The storage of the app, on this computer. | No. |
| Preferences such as theme, interface and panel sizes | This computer. | No. |
| History of requests and runs, with secrets masked | This computer, in the storage of the app (IndexedDB). | No. |
| Mock servers: name, port, source and own routes | `mocks/*.mock.yaml`. | Yes. |
| The Log of a mock | Memory. It is emptied when the app reloads. | No. |
| The Console and the Network lists | Memory. They disappear when you close the app. | No. |

If the operating system keychain is not available, Luvin does not store secret values, rather than store them in the open. You type them again.

## What you should still watch

:::caution[Inputs are written as you type them]
The values you type in **Inputs** and in the cases are saved in the `scenarios/` files of the workspace, as written. Do not put a real password there. Use a secret and write `{{clientSecret}}`.
:::

:::tip[Sharing a workspace]
Because secret values are not in the files, you can commit a workspace to git. Each person adds their own secrets on their computer. See [Keep a workspace in git](/workspaces/git/).
:::

## Related

- [Base URLs, variables and secrets](/environments/variables-and-secrets/)
- [What is on disk](/workspaces/files/)
- [Use Luvin without a workspace](/workspaces/without-workspace/)
- [History](/workspaces/history/)
- [Mock servers](/mocks/overview/)
