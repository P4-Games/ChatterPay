![](https://img.shields.io/badge/Next.js-informational?style=flat&logo=next.js&logoColor=white&color=6aa6f8)
![](https://img.shields.io/badge/Typescript-informational?style=flat&logo=typescript&logoColor=white&color=6aa6f8)
![](https://img.shields.io/badge/scss-informational?style=flat&logo=scss&logoColor=white&color=6aa6f8)
![](https://img.shields.io/badge/mui-informational?style=flat&logo=mui&logoColor=white&color=6aa6f8)
![](https://img.shields.io/badge/react.js-informational?style=flat&logo=react&logoColor=white&color=6aa6f8)

# ChatterPay

Chatterpay is a Wallet for WhatsApp that integrates AI and Account Abstraction, enabling any user to use blockchain easily and securely without technical knowledge.

> Built for: [Level Up Hackathon - Ethereum Argentina 2024](https://ethereumargentina.org/) 

> Build By: [mpefaur](https://github.com/mpefaur), [tomasfrancizco](https://github.com/tomasfrancizco), [TomasDmArg](https://github.com/TomasDmArg), [gonzageraci](https://github.com/gonzageraci),  [dappsar](https://github.com/dappsar)

__Components__:

- Landing Page ([product](https://chatterpay-front-ylswtey2za-uc.a.run.app/), [source code](https://github.com/P4-Games/ChatterPay))  (this Repo)
- User Dashboard Website ([product](https://chatterpay-front-ylswtey2za-uc.a.run.app/dashboard), [source code](https://github.com/P4-Games/ChatterPay))  (this Repo)
- Backend API ([source code](https://github.com/P4-Games/ChatterPay-Backend)) 
- Smart Contracts ([source code](https://github.com/P4-Games/ChatterPay-SmartContracts))
- Data Indexing (Subgraph) ([source code](https://github.com/P4-Games/ChatterPay-Subgraph))
- Bot AI (Chatizalo) ([product](https://chatizalo.com/))
- Bot AI Admin Dashboard Website ([product](https://app.chatizalo.com/))


# About this repo

This repository contains the source code for the landing page and user dashboard.

__Build With__:

- Framework: [Next.js 14](https://nextjs.org/14)
- Language: [TypeScript](https://www.typescriptlang.org)
- database: [mongodb](https://www.mongodb.com)
- Styling: [CSS]
- Components: [MUI v5](https://mui.com/)
- State Management: [React Context API](https://react.dev/reference/react/useContext)
- Authentication: cellphone + MFA whatsapp
- Authorization: [jwt](https://jwt.io/)
- Routing: [React router v6](https://reactrouter.com/en/main/start/overview)
- Linting: [ESLint](https://eslint.org)
- Formatting: [Prettier](https://prettier.io)

__deploy with__:

- Landing Page (static): [ICP](https://internetcomputer.org/)
- User Dashboard: [Google Cloud](https://cloud.google.com/)

# Getting Started

__1. Install these Requirements__:

- [git](https://git-scm.com/)
- [nvm](https://github.com/nvm-sh/nvm) (allows you to quickly install and use different versions of node via the command line.)
- node js & npm (insalled with nvm)
- [mongoDb](https://www.mongodb.com/docs/manual/installation/)

__2. Clone repository__:

```bash
   git clone https://github.com/P4-Games/ChatterPay
   cd ChatterPay
```

__3. Complete .env file__: 

Create a .env file in the root folder and populate it with the following keys and values:

```sh
SKIP_PREFLIGHT_CHECK=true
GENERATE_SOURCEMAP=false
npm_config_user_agent=yarn
PORT=3000

# server-side
NODE_ENV='development'
APP_ENV='development'
BOT_API_TOKEN={api token}
BOT_API_URL=http://localhost:3000
BOT_API_WAPP_ENABLED=TRUE
MONGODB='mongodb://localhost:27017'
MONGODB_BOT='BOT mongo db url'
NODE_PROVIDER_SEPOLIA_URL='https://sepolia.infura.io/v3/YOUR_API_KEY'
NODE_PROVIDER_MUMBAI_URL='https://stylish-dawn-bush.bsc-testnet.quiknode.pro/YOUR_API_KEY/'
NODE_PROVIDER_SCROLL_URL='https://lb.drpc.org/ogrpc?network=scroll-sepolia&dkey=YOUR_API_KEY'
HANDLE_VERCEL_FREE_PLAN_TIMEOUT=true
API3_ENABLED=false

# client side
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_UI_URL=http://localhost:3000
NEXT_PUBLIC_ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_FROM_ICP=true
```

__4. Install Dependencies__:


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

__5. Start App__:

```sh
npm run dev / yarn dev
```

Then, open brower in: `http://localhost:3000`.


__6. Deploy to ICP__: 

To deploy the landing (static code) to the [Internet Computer (ICP)](https://internetcomputer.org/), you can follow the steps described in the [Deployment Guidelines](./.doc/deployment/deploy-guidelines).

URL of the deployed app on ICP: https://cilxj-yiaaa-aaaag-alkxq-cai.icp0.io/


# Additional Info

## Contribution

Thank you for considering helping out with the source code! We welcome contributions from anyone on the internet, and are grateful for even the smallest of fixes!

If you'd like to contribute to ChatterPay, please fork, fix, commit and send a pull request for the maintainers to review and merge into the main code base. If you wish to submit more complex changes though, please check up with the [core devs](https://github.com/P4-Games/chatterPay/graphs/contributors) first to ensure those changes are in line with the general philosophy of the project and/or get some early feedback which can make both your efforts much lighter as well as our review and merge procedures quick and simple.

Please make sure your contributions adhere to our [coding guidelines](./.doc/development/coding-guidelines.md).

## Contributors

[P4Troy](https://github.com/mpefaur) - [dappsar](https://github.com/dappsar) - [tomasDmArg](https://github.com/TomasDmArg)

see more in: <https://github.com/P4-Games/chatterPay/graphs/contributors>


## Maintenance

- [Maintenance Scripts](./.doc/maintenance/maintenance-scripts.md)
