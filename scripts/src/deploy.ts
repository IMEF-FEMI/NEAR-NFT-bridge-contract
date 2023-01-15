import fs from 'fs'
require('dotenv').config()
import * as nearAPI from "near-api-js"
import { parseSeedPhrase } from 'near-seed-phrase'




async function deploy() {
    const { secretKey } = parseSeedPhrase(process.env.NFT_BRIDGE_SEED || "")

    const NETWORK = process.env.NETWORK_ID || ""
    const CONTRACT_NAME = process.env.CONTRACT_NAME || ""
    const myKeyStore = new nearAPI.keyStores.InMemoryKeyStore()

    await myKeyStore.setKey(NETWORK, CONTRACT_NAME, nearAPI.KeyPair.fromString(secretKey));

    const connectionConfig: nearAPI.ConnectConfig = {
        // walletUrl: "https://wallet.testnet.near.org",
        // helperUrl: "https://helper.testnet.near.org",
        // explorerUrl: "https://explorer.testnet.near.org",
        // contractName: process.env.CONTRACT_NAME,
        nodeUrl: "https://rpc.testnet.near.org",
        networkId: NETWORK,
        headers: {},
        keyStore: myKeyStore,
    }
    const nearConnection = await nearAPI.connect(connectionConfig);
    const contractAccount = await nearConnection.account(CONTRACT_NAME);
    //deploy
    const response = await contractAccount.deployContract(fs.readFileSync('out/bridge_contract.wasm'));
    console.log(response);

    //initialize contract
    try {
        await contractAccount.functionCall({
            contractId: CONTRACT_NAME,
            methodName: "new_default_meta",
            args: {
                owner_id: contractAccount.accountId,

            }
        })
        console.log(`Contract initialized on ${NETWORK}...`);

    } catch (error) {
        console.log((error as any).kind.ExecutionError);
    }


}
deploy().then(
    () => process.exit(),
    err => {
        console.error(err);
        process.exit(-1);
    },
);