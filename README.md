# Aragon SDK

This repository contains the SDK for the JavaScript/TypeScript language.

Please, see in the respective folder for all details.

## Pull Request Labels

To handle certain automated tasks, you can add labels to your pull requests. Here is an overview of the available labels and their meaning.

### JavaScript

| Label               | Meaning                                                                     | Remarks                                        |
| ------------------- | --------------------------------------------------------------------------- | ---------------------------------------------- |
| `<component>:patch` | This label triggers a new NPM patch version of the corresponding JS package | Don't add any other &lt;component&gt;:\* label |
| `<component>:minor` | This label triggers a new NPM minor version of the corresponding JS package | Don't add any other &lt;component&gt;:\* label |
| `<component>:major` | This label triggers a new NPM major version of the corresponding JS package | Don't add any other &lt;component&gt;:\* label |

The available components and labels are:

- `client`
  - `client:patch`, `client:minor`, `client:major`
- `common`
  - `common:patch`, `common:minor`, `common:major`

### General

| Label             | Meaning                                                                          | Remarks                                                |
| ----------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| javascript        | This label indicates that something in a javascript package has changed          | This labels gets added automatically by the automation |
| javascript:client | This label indicates that something in the javascript client package has changed | This labels gets added automatically by the automation |
| javascript:common | This label indicates that something in the javascript common package has changed | This labels gets added automatically by the automation |
