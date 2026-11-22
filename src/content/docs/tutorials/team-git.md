---
title: Share a workspace with your team using git
description: Create a workspace in a folder on disk, commit it, open it on a teammate's computer with their own secrets and review a workflow change in a pull request.
sidebar:
  order: 6
---

You will create a workspace in a folder, commit it to git, open it as a teammate and review a change to a workflow in a pull request. The result is workflows your team keeps, reviews and runs from one repository, with no secret in it. You need about 30 minutes, Luvin and git installed, an OpenAPI contract of your own and a Git repository you can push to. A second computer, or a second folder, plays the teammate.

## 1. Create the workspace in a folder

1. On the welcome screen, click **Create a workspace**. If a workspace is already open, open its **Workspace options** menu and choose **Close and switch workspace** first.
2. Type `Shop tests` in **Workspace name**.
3. Read the line **Will be created at**: it shows the folder. To use another place, click **Change location**, then **Change…**, and edit **Folder name** if you want.
4. Click **Create workspace**.

Luvin creates the folder with a file `luvin.yaml` inside. Every change you make from now on is saved in files automatically. See [Workspaces and collections](/workspaces/overview/).

## 2. Create a collection and add content

1. On **Home**, click **Create your first collection**. Type `payments` in **Collection name** and click **Create**.
2. Under **Quick actions**, click **Import Arazzo or contracts** and choose your OpenAPI contract.
3. Click **+** (**Create or import**) and choose **New Arazzo**. Drag two operations onto the canvas, as in [Build your first workflow](/tutorials/first-workflow/).
4. At the top of the sidebar, click the **Environments** icon. In its panel, click **+** (**New environment**), name it `staging`, and set its base URL.
5. In **Variables** add `clientId`, and in **Secrets** add `clientSecret` with its **Value**.

See [Base URLs, variables and secrets](/environments/variables-and-secrets/).

## 3. See what is on disk

1. Open the **Workspace options** menu and choose **Show in Finder** (**Show in file explorer** on Windows).

The folder looks like this:

```text
shop-tests/
├── luvin.yaml
└── payments/
    ├── collection.yaml
    ├── payments.openapi.yaml
    ├── new.arazzo.yaml
    ├── environments/
    │   └── staging.yaml
    └── scenarios/
        └── new.arazzo.yaml
```

| File | What it holds |
|---|---|
| `luvin.yaml` | The workspace: its name and the list of collections. |
| `payments.openapi.yaml` | Your contract, as you imported it. |
| `new.arazzo.yaml` | The workflows. This is the file your team reviews. |
| `environments/staging.yaml` | Base URLs, variables and the **names** of the secrets. |
| `scenarios/new.arazzo.yaml` | The inputs and the custom cases of that Arazzo file. |

Open `environments/staging.yaml` in an editor:

```yaml
name: staging
servers:
  shop: https://staging.api.shop.test
variables:
  clientId: shop-staging-client
secrets:
  - clientSecret
```

The secret has a name and no value. The value is stored encrypted on your computer, never in the files. See [What is on disk](/workspaces/files/).

:::caution[Values in Inputs are saved as typed]
Luvin does not hide the values you type in the **Inputs** tab or in a case: they are written as you typed them in `scenarios/`. If a value is a password or a token, create a secret and write `{{clientSecret}}` instead.
:::

## 4. Commit and push

Use your usual git client, or the **Terminal** tab of **Dev Tools**. In the folder of the workspace:

```bash
git init
git add .
git commit -m "Add the shop workflows"
git remote add origin <your repository>
git push -u origin main
```

There is nothing to put in `.gitignore`: Luvin writes nothing in the folder that you must leave out. See [Keep a workspace in git](/workspaces/git/).

## 5. A teammate opens it

On the teammate's computer:

1. Clone the repository: `git clone <your repository>`.
2. Open Luvin and click **Open a workspace**. Choose the cloned folder, the one with `luvin.yaml`.
3. In the **Environments** panel of the sidebar, open `staging`.
4. In **Secrets**, type the **Value** of `clientSecret`. The name is already listed.
5. In the run bar, choose **Real API** and run a case.

If a value is missing, a notice above the workflow says **Credentials are missing in “staging”**. Click **Fill in** to open the environment.

The teammate's secret stays on their computer, encrypted. Each person uses their own. A good habit is to list in the `README.md` of the workspace which secrets each environment needs and who to ask.

## 6. Change a workflow and open a pull request

1. The teammate creates a branch: `git switch -c add-idempotency-header`.
2. In Luvin, they open a workflow, click a step in **Design** and add a header to it. Luvin saves on its own.
3. In the terminal: `git diff`.

The change is a few lines of the Arazzo file:

```diff
   - stepId: createOrder
     operationId: $sourceDescriptions.shop.createOrder
     parameters:
+      - name: Idempotency-Key
+        in: header
+        value: $inputs.requestId
```

4. They commit, push the branch and open a pull request on your git platform.

The pull request shows what changed, line by line. What the reviewer reads:

| Change | Where it shows |
|---|---|
| A new step, a new connection or a different success criterion | The `*.arazzo.yaml` file |
| New starting inputs or a new custom case | The same file in `scenarios/` |
| A different base URL or variable | `environments/<name>.yaml` |

The reviewer can also check out the branch and open the workspace in Luvin to run the cases. Luvin reads the files when you open a collection and does not watch the folder: after `git pull` or a branch switch, open **Workspace options**, choose **Close and switch workspace** and open the workspace again.

## What you learned

- A workspace in a folder is plain text files, ready for git.
- Secret values never go into the files: only their names do.
- A teammate adds their own secrets after cloning.
- A pull request shows a workflow change as an Arazzo diff.
- Values typed in **Inputs** are saved as typed in `scenarios/`: use a secret for anything sensitive.

## Next

- [What is on disk](/workspaces/files/)
- [Keep a workspace in git](/workspaces/git/)
- [Privacy and security](/reference/privacy/)
