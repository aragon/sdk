# Aragon SDK

This repository contains the SDK for the JavaScript/TypeScript language.

Please, see in the respective folder for all details.

## Available scripts

- `yarn build`
  - `yarn turbo run build`
- `yarn clean`
  - `rm -Rf node_modules ./modules/*/node_modules ./modules/*/dist`
- `yarn lint`
  - `tsdx lint modules/*/src`
- `yarn test`
  - `tsdx test`

## Pull Request Labels

To handle certain automated tasks, you can add labels to your pull requests.  
Here is an overview of the available labels and their meaning:

| Label             | Meaning                                                                                             | Important                                              | When to use                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| client:fix        | This labels triggers the automation to release a new patch version of the javascript client package | Don't add any other client:\* label                    | When you want to release a new patch version of the javascript client package |
| client:feature    | This labels triggers the automation to release a new minor version of the javascript client package | Don't add any other client:\* label                    | When you want to release a new minor version of the javascript client package |
| client:breaking   | This labels triggers the automation to release a new major version of the javascript client package | Don't add any other client:\* label                    | When you want to release a new major version of the javascript client package |
| common:fix        | This labels triggers the automation to release a new patch version of the common package            | Don't add any other common:\* label                    | When you want to release a new patch version of the common package            |
| common:feature    | This labels triggers the automation to release a new minor version of the common package            | Don't add any other common:\* label                    | When you want to release a new minor version of the common package            |
| common:breaking   | This labels triggers the automation to release a new major version of the common package            | Don't add any other common:\* label                    | When you want to release a new major version of the common package            |
| javascript        | This label indicates that something in a javascript package has changed                             | This labels gets added automatically by the automation | You don't need to add this label by yourself                                  |
| javascript:client | This label indicates that something in the javascript client package has changed                    | This labels gets added automatically by the automation | You don't need to add this label by yourself                                  |
| javascript:common | This label indicates that something in the javascript common package has changed                    | This labels gets added automatically by the automation | You don't need to add this label by yourself                                  |
