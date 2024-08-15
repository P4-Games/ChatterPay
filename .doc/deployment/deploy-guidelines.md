# Deploy Guidelines

## Upload Frontend to ICP

To deploy the landing (static code) to the [Internet Computer (ICP)](https://internetcomputer.org/), you need to set it up as a frontend canister (also known as an asset canister).  This canister will store and serve your static assets (HTML, CSS, JavaScript, etc.) directly on the decentralized ICP network.

The steps to accomplish this are described below.

### Steps to Deploy (local and cloud)

1. __Install ICP SDK__

Install the ICP SDK by following the instructions [here](https://github.com/dfinity/sdk).

2. __Start the Local Replica__

Start the local ICP replica in the background with a clean slate by running the following command:
   
```bash
dfx start --clean --background
```

3. __Deploy the Canisters Locally__

Once the local replica is running, deploy the canisters:

```bash
dfx deploy
```

4. __Deploy to ICP Hosting__

To deploy a canisters onto the ICP mainnet, you must have cycles. Cycles are used to pay for the resources that a canister uses.

The next [link](https://internetcomputer.org/docs/current/developer-docs/getting-started/cycles/cycles-faucet) explains how to use the cycles faucet to acquire 10T free cycles that can be used to deploy your dapps on the mainnet.

Once you have obtained cycles, you can deploy to the actual ICP network using the following command:

```bash
dfx deploy --network=ic
```

After a successful deployment, you will receive a URL similar to this:
https://cilxj-yiaaa-aaaag-alkxq-cai.icp0.io/

Your frontend will be accessible via the provided URL on the Internet Computer (ICP).
