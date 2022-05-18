# Aragon SDK

This repository contains the Softward Development Kit to interact with the Aragon protocol.

It currently provides support for JavaScript and TypeScript. [Learn more](./javascript). 

## Pull Request Labels

To handle certain automated tasks, you can add labels to your pull requests. Here is an overview of the available labels and their meaning.

### JavaScript tags

| Label               | Meaning                                                          | Remarks                                          |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| `<component>:patch` | Triggers a new NPM patch version of the corresponding JS package | Don't add any other `&lt;component&gt;:\*` label |
| `<component>:minor` | Triggers a new NPM minor version of the corresponding JS package | Don't add any other `&lt;component&gt;:\*` label |
| `<component>:major` | Triggers a new NPM major version of the corresponding JS package | Don't add any other `&lt;component&gt;:\*` label |

The available components and labels are:

- Client package
  - `client:patch`, `client:minor`, `client:major`
- Common pagkage
  - `common:patch`, `common:minor`, `common:major`

### General tags

| Label             | Meaning                                                                          | Remarks                                                |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| javascript        | This label indicates that something in a javascript package has changed          | This labels gets added automatically by the automation |
| javascript:client | This label indicates that something in the javascript client package has changed | This labels gets added automatically by the automation |
| javascript:common | This label indicates that something in the javascript common package has changed | This labels gets added automatically by the automation |
