# Aragon SDK

This repository contains the SDK for the JavaScript/TypeScript language.

Please, see in the respective folder for all details.

## Available scripts

### Javascript

- `yarn build`
  - `yarn turbo run build`
- `yarn clean`
  - `rm -Rf node_modules ./modules/*/node_modules ./modules/*/dist`
- `yarn lint`
  - `tsdx lint modules/*/src`
- `yarn test`
  - `tsdx test`

## Pull Request Labels

To handle certain automated tasks, you can add labels to your pull requests. Here is an overview of the available labels and their meaning.

### JavaScript

| Label             | Meaning                                                                                             | Remarks                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `<component>:fix`        | This label triggers a new NPM patch version of the corresponding JS package | Don't add any other &lt;component&gt;:\* label                    |
| `<component>:feature`    | This label triggers a new NPM minor version of the corresponding JS package | Don't add any other &lt;component&gt;:\* label                    |
| `<component>:breaking`   | This label triggers a new NPM major version of the corresponding JS package | Don't add any other &lt;component&gt;:\* label                    |

The available components and labels are:
- `client`
  - `client:fix`, `client:feature`, `client:breaking`
- `common`
  - `common:fix`, `common:feature`, `common:breaking`


### General

| Label             | Meaning                                                                                             | Remarks                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | 
| javascript        | This label indicates that something in a javascript package has changed                             | This labels gets added automatically by the automation |
| javascript:client | This label indicates that something in the javascript client package has changed                    | This labels gets added automatically by the automation |
| javascript:common | This label indicates that something in the javascript common package has changed                    | This labels gets added automatically by the automation |
