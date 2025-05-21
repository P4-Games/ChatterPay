![](https://img.shields.io/badge/Next.js-informational?style=flat&logo=next.js&logoColor=white&color=6aa6f8)
![](https://img.shields.io/badge/Typescript-informational?style=flat&logo=typescript&logoColor=white&color=6aa6f8)
![](https://img.shields.io/badge/scss-informational?style=flat&logo=scss&logoColor=white&color=6aa6f8)
![](https://img.shields.io/badge/mui-informational?style=flat&logo=mui&logoColor=white&color=6aa6f8)
![](https://img.shields.io/badge/react.js-informational?style=flat&logo=react&logoColor=white&color=6aa6f8)

# ChatterPay

[Chatterpay](https://chatterpay.net) is a Wallet for WhatsApp that integrates AI and Account Abstraction, enabling any user to use blockchain easily and securely without technical knowledge.

> Create Wallet, Transfer, Swap, and mint NFTs — directly from WhatsApp!

> Built for: [Level Up Hackathon - Ethereum Argentina 2024](https://ethereumargentina.org/) & [Ethereum Uruguay 2024](https://www.ethereumuruguay.org/)

> Build By: [mpefaur](https://github.com/mpefaur), [tomasfrancizco](https://github.com/tomasfrancizco), [TomasDmArg](https://github.com/TomasDmArg), [gonzageraci](https://github.com/gonzageraci), [dappsar](https://github.com/dappsar)


**Get started with our Bot 🤖**:

[![WhatsApp Bot](https://img.shields.io/badge/Start%20on%20WhatsApp-25D366.svg?style=flat&logo=whatsapp&logoColor=white)](https://wa.me/5491164629653)


**Components**:

- Landing Page ([product](https://chatterpay.net), [source code](https://github.com/P4-Games/ChatterPay)) (this Repo)
- User Dashboard Website ([product](https://chatterpay.net/dashboard), [source code](https://github.com/P4-Games/ChatterPay)) (this Repo)
- Backend API ([source code](https://github.com/P4-Games/ChatterPay-Backend))
- Smart Contracts ([source code](https://github.com/P4-Games/ChatterPay-SmartContracts))
- Data Indexing (Subgraph) ([source code](https://github.com/P4-Games/ChatterPay-Subgraph))
- Bot AI (Chatizalo) ([product](https://chatizalo.com/))
- Bot AI Admin Dashboard Website ([product](https://app.chatizalo.com/))

<p>&nbsp;</p>

![Components Interaction](https://github.com/P4-Games/ChatterPay-Backend/blob/develop/.doc/technical-overview/chatterpay-architecture-conceptual-view.jpg?raw=true)

# About this repo

This repository contains the source code for the landing page and user dashboard.

**Build With**:

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
- Analytics: [Google Analytics](https://analytics.google.com/) [MS Clarity](https://clarity.microsoft.com/)

**deploy with**:

- Landing Page (static): [ICP](https://internetcomputer.org/)
- User Dashboard: [Google Cloud](https://cloud.google.com/)

# Getting Started

**1. Install these Requirements**:

- [git](https://git-scm.com/)
- [nvm](https://github.com/nvm-sh/nvm) (allows you to quickly install and use different versions of node via the command line.)
- node js & npm (insalled with nvm)
- [mongoDb](https://www.mongodb.com/docs/manual/installation/)

**2. Clone repository**:

```bash
   git clone https://github.com/P4-Games/ChatterPay
   cd ChatterPay
```

**3. Complete .env file**:

Create a .env file in the root folder and populate it with keys and values described in [example_env file](./example_env).

**4. Install Dependencies**:

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

**5. Start App**:

```sh
npm run dev / yarn dev
```

Then, open brower in: `http://localhost:3000`.

**6. Deploy to ICP**:

To deploy the landing (static code) to the [Internet Computer (ICP)](https://internetcomputer.org/), you can follow the steps described in the [Deployment Guidelines](./.doc/deployment/deploy-guidelines).

URL of the deployed app on ICP: https://cilxj-yiaaa-aaaag-alkxq-cai.icp0.io/

# Additional Info

**Technical Documentation**:

If you would like to explore more details about the source code, you can review this [link](.doc/content.md).

**Contribution**:

Thank you for considering helping out with the source code! We welcome contributions from anyone on the internet, and are grateful for even the smallest of fixes!

If you'd like to contribute to ChatterPay, please fork, fix, commit and send a pull request for the maintainers to review and merge into the main code base. If you wish to submit more complex changes though, please check up with the [core devs](https://github.com/P4-Games/chatterPay/graphs/contributors) first to ensure those changes are in line with the general philosophy of the project and/or get some early feedback which can make both your efforts much lighter as well as our review and merge procedures quick and simple.

Please make sure your contributions adhere to our [coding guidelines](./.doc/development/coding-guidelines.md).

_Contributors_:

- [P4Troy](https://github.com/mpefaur) - [dappsar](https://github.com/dappsar) - [tomasDmArg](https://github.com/TomasDmArg)

- See more in: <https://github.com/P4-Games/chatterPay/graphs/contributors>

<p>&nbsp;</p>

---

[![X](https://img.shields.io/badge/X-%231DA1F2.svg?style=flat&logo=twitter&logoColor=white)](https://x.com/chatterpay)
[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?style=flat&logo=instagram&logoColor=white)](https://www.instagram.com/chatterpayofficial)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/chatterpay)
[![Facebook](https://img.shields.io/badge/Facebook-%231877F2.svg?style=flat&logo=facebook&logoColor=white)](https://www.facebook.com/chatterpay)
[![YouTube](https://img.shields.io/badge/YouTube-%23FF0000.svg?style=flat&logo=youtube&logoColor=white)](https://www.youtube.com/@chatterpay)
[![WhatsApp Community](https://img.shields.io/badge/WhatsApp%20Community-25D366.svg?style=flat&logo=whatsapp&logoColor=white)](https://chat.whatsapp.com/HZJrBEUYyoF8FtchfJhzmZ)
