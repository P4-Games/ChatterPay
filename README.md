![](https://img.shields.io/badge/NextJs-informational?style=flat&logo=next&logoColor=white&color=6aa6f8)
![](https://img.shields.io/badge/Typescript-informational?style=flat&logo=typescript&logoColor=white&color=6aa6f8)
![](https://img.shields.io/badge/scss-informational?style=flat&logo=scss&logoColor=white&color=6aa6f8)

# ChatterPay

Crypto just a message away!

# Introduction

## Build With

- Framework - [Next.js 14](https://nextjs.org/14)
- Language - [TypeScript](https://www.typescriptlang.org)
- database - [mongodb](https://www.mongodb.com)
- Styling - [CSS]
- Components - [MUI v5](https://mui.com/)
- State Management - [React Context API](https://react.dev/reference/react/useContext)
- Authentication - *TBD*
- Authorization - *TBD*
- Routing - [React router v6](https://reactrouter.com/en/main/start/overview)
- Linting - [ESLint](https://eslint.org)
- Formatting - [Prettier](https://prettier.io)

## Live demo

- <https://chatterpay.vercel.app>

# Requirements

## Software

This App requires:

- [nvm](https://github.com/nvm-sh/nvm) (allows you to quickly install and use different versions of node via the command line.)
- node js & npm (insalled with nvm)
- [mongo db](https://www.mongodb.com/docs/manual/installation/) (It will be used for endpoints that are consumed from the discord bot)

## Environment variables

Create a .env file running the command in terminal

```sh
touch .env
```

The environment variables bellow needs to be set in the .env file when project is running locally:

```sh
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
npm_config_user_agent=yarn
PORT=3000

# server-side
NODE_ENV='development'
APP_ENV='development'
MONGODB='mongodb://localhost:27017'
BOT_API_TOKEN={api token}

# client side
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_UI_URL=http://localhost:3000
NEXT_PUBLIC_BOT_API_URL=http://localhost:3000
NEXT_PUBLIC_ALLOWED_ORIGINS=http://localhost:3000
```

## Quick commands

### Install dependencies

```sh
- yarn install # with yarn
- npm i # with npm
```

If you have troubles with dependencies, try this:

```sh
set http_proxy=
set https_proxy=
npm config rm https-proxy
npm config rm proxy
npm config set registry "https://registry.npmjs.org"
yarn cache clean
yarn config delete proxy
yarn --network-timeout 100000
```

### Run App

```sh
npm run dev / yarn dev
```

### Use App

```sh
Open browser in http://localhost:3000/
```

# Contribution

Thank you for considering helping out with the source code! We welcome contributions from anyone on the internet, and are grateful for even the smallest of fixes!

If you'd like to contribute to ChatterPay, please fork, fix, commit and send a pull request for the maintainers to review and merge into the main code base. If you wish to submit more complex changes though, please check up with the [core devs](https://github.com/P4-Games/chatterPay/graphs/contributors) first to ensure those changes are in line with the general philosophy of the project and/or get some early feedback which can make both your efforts much lighter as well as our review and merge procedures quick and simple.

Please make sure your contributions adhere to our [coding guidelines](./.doc/development/coding-guidelines.md).

## Contributors

[P4Troy](https://github.com/mpefaur) - [dappsar](https://github.com/dappsar) - [tomasDmArg](https://github.com/TomasDmArg)

see more in: <https://github.com/P4-Games/chatterPay/graphs/contributors>

# Maintenance

- [Maintenance Scripts](./.doc/maintenance/maintenance-scripts.md)
