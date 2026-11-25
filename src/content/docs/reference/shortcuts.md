---
title: Keyboard shortcuts
description: Every keyboard shortcut Luvin has, on macOS and on Windows.
sidebar:
  order: 2
---

This page lists the keyboard shortcuts that Luvin has. On macOS the main key is **⌘**. On Windows it is **Ctrl**.

**Preferences**, in its **Shortcuts** section, lists the main ones in three groups: **General** (run or send, save, search, open Preferences, close dialogs and menus), **Tabs** and **Workflow canvas** (undo and redo).

## The ones to learn first

| Shortcut | What it does |
|---|---|
| **⌘K** (**Ctrl+K**) | Opens the search. Press it again to close it. |
| **⌘Enter** (**Ctrl+Enter**) | Runs the selected cases of the open workflow, or sends the open request. |
| **⌘S** (**Ctrl+S**) | Saves right now. Luvin also saves by itself. |
| **⌘,** (**Ctrl+,**) | Opens **Preferences**. |
| **Esc** | Closes the dialog, menu or search that is open. |

## Search

**⌘K** (**Ctrl+K**) opens a search box. Type to find a workflow, step, environment, contract, request, mock server or collection, or an action.

| Key | What it does |
|---|---|
| **↑** and **↓** | Move through the results. |
| **Enter** | Opens the selected result. |
| **Esc** | Closes the search. |

You can also click **Search** in the bottom bar.

### Actions

The first group of the search, **Actions**, holds things that are not a file. Type a word of their name, such as `history` or `mock`, to find them.

| Action | What it does |
|---|---|
| **Run requests** | Opens the runner with the requests of the collection. See [The runner](/runner/overview/). |
| **Run workflows** | Opens the runner with the workflows of the collection. It shows only when the collection has workflows. |
| **Open history** | Opens the history of the collection: past requests and runs. See [History](/workspaces/history/). |
| **New request** | Creates a request. |
| **New mock server** | Creates a mock server. See [Mock servers](/mocks/overview/). |

![The search opened with ⌘K and nothing typed: the Actions group first (Run requests, Run workflows, Open history, New request, New mock server), then Workflows and Steps](/media/en/search-actions.webp)

## Run and save

| Shortcut | Where | What it does |
|---|---|---|
| **⌘Enter** (**Ctrl+Enter**) | Anywhere | Runs the selected cases of the open workflow. It does nothing while the YAML of the workflow can't be read. |
| **⌘Enter** (**Ctrl+Enter**) | Anywhere in an open request: the URL, the headers, the body | Sends the request. WebSocket requests are the exception. |
| **Enter** | The URL of an HTTP, GraphQL or gRPC request | Sends the request. While a `{{` suggestion list is open, Enter picks the suggestion instead. |
| **⌘Enter** (**Ctrl+Enter**) | In **Try it out** of a contract | Sends that operation. It does not run the workflow behind it. |
| **⌘Enter** (**Ctrl+Enter**) | In the box of **Import from cURL** | Imports the pasted command. |
| **⌘Enter** (**Ctrl+Enter**) | In **Edit as JSON** of a request body in the Design tab | Applies the JSON. |
| **⌘S** (**Ctrl+S**) | Anywhere | Saves the open workspace now. Without a workspace it does nothing. |

While a dialog is open, such as **Preferences** or a new request, **⌘Enter** belongs to that dialog and does not run the workflow behind it.

## Design tab

On the canvas. Press **?**, or choose **Keyboard shortcuts** in **⋯**, to see this list in the app.

| Shortcut | What it does |
|---|---|
| **↑ ↓** | Move between steps |
| **Enter** | Open the step |
| **Esc** | Close the panel or stop selecting |
| **/** | Add a step |
| **⌘Enter (Ctrl+Enter)** | Run |
| **⇧Enter (Shift+Enter)** | Run only the selected step. See [Debug](/test/debug/). |
| **⌘F (Ctrl+F)** | Search the canvas |
| **⌘Z (Ctrl+Z)** | Undo the last change to the workflow. The same as **Undo**. |
| **⇧⌘Z (Ctrl+Shift+Z)** | Redo it. The same as **Redo**. |
| **⌥↑ ⌥↓ (Alt+↑ Alt+↓)** | Move the step |
| **⌘D (Ctrl+D)** | Duplicate the step |
| **⌫ (Delete)** | Remove the step |
| **F9** | Pause before the step. See [Debug](/test/debug/). |
| **R** | Step routes |
| **M** | Minimize the step |
| **⇧ click (Shift+click)** | Select several steps |
| **⌘A (Ctrl+A)** | Select every step |
| **⌘C ⌘V (Ctrl+C Ctrl+V)** | Copy and paste steps |
| **⇧1 (Shift+1)** | Fit the zoom |
| **?** | See these shortcuts |

They work when the focus is not in a text field. Inside a field, **⌘Z** undoes the text you typed, as in any program.

The history of **Undo** is kept when you go to another tab of the workflow, such as YAML or Cases, and come back. If you edited the YAML in between, it starts again.

| Key | Where | What it does |
|---|---|---|
| **Esc** | The route editor, or a menu on a step card | Closes it. See [Add or change a route](/design/branch-menu/). |

## Tabs


| Shortcut | What it does |
|---|---|
| **⌘N** (**Ctrl+N**) | **New Arazzo**: creates a new Arazzo file. |
| **⌘W** (**Ctrl+W**) | **Close**: closes the current tab. |
| **⇧⌘W** (**Ctrl+Shift+W**) | **Close All**: closes all the tabs that can be closed. |

## Menus, dialogs and fields

| Key | Where | What it does |
|---|---|---|
| **Esc** | Dialogs, menus and the search | Closes them. This includes **Preferences**, the welcome screen, the **⋯** menus and the workspace menu. |
| **Esc** | A field you are renaming | Cancels the change and keeps the old name. |
| **Enter** | A field you are renaming, such as an environment or a collection | Saves the new name. |
| **Enter** | The field **Other (Enter)** of the expected status in a case | Adds that status. |
| **Enter** | The dialog to choose an item of a list | Continues with your choice. See [Lists](/test/lists/). |
| **↑** and **↓** | A `{{` suggestion list | Move through the suggestions. |
| **Enter** or **Tab** | A `{{` suggestion list | Inserts the selected suggestion. |
| **Esc** | A `{{` suggestion list | Closes the suggestions. |
| **↑** and **↓** | The method picker of a request | Move through the methods. |
| **Esc** | The sidebar search | Closes it. |

## The guided tour

| Key | What it does |
|---|---|
| **→** | Next step of the tour. |
| **←** | Previous step. |
| **Esc** | Closes the section picker. |

## Resize with the keyboard

Each divider can take the focus with **Tab**. Then:

| Divider | Keys |
|---|---|
| The results panel (**Resize the results panel**) | **↑** and **↓** change its height by 40 pixels. |
| The operations panel and the step detail panel of the Design tab | **←** and **→** change the width by 12 pixels. Add **Shift** for 40. |
| The request and its response | **↑** and **↓** move the line. **Home** and **End** send it to one side. |

Double-click a divider to bring it back to its default.

## Next

- [The interface](/get-started/interface/)
- [Run a workflow](/test/run/)
