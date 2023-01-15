"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const nearAPI = __importStar(require("near-api-js"));
const format_1 = require("near-api-js/lib/utils/format");
const near_seed_phrase_1 = require("near-seed-phrase");
function deploy() {
    return __awaiter(this, void 0, void 0, function* () {
        const { secretKey } = (0, near_seed_phrase_1.parseSeedPhrase)(process.env.NFT_BRIDGE_SEED || "");
        const NETWORK = process.env.NETWORK_ID || "";
        const CONTRACT_NAME = process.env.CONTRACT_NAME || "";
        const myKeyStore = new nearAPI.keyStores.InMemoryKeyStore();
        yield myKeyStore.setKey(NETWORK, CONTRACT_NAME, nearAPI.KeyPair.fromString(secretKey));
        const connectionConfig = {
            // walletUrl: "https://wallet.testnet.near.org",
            // helperUrl: "https://helper.testnet.near.org",
            // explorerUrl: "https://explorer.testnet.near.org",
            // contractName: process.env.CONTRACT_NAME,
            nodeUrl: "https://rpc.testnet.near.org",
            networkId: NETWORK,
            headers: {},
            keyStore: myKeyStore,
        };
        const nearConnection = yield nearAPI.connect(connectionConfig);
        const contractAccount = yield nearConnection.account(CONTRACT_NAME);
        // mint nft
        try {
            yield contractAccount.functionCall({
                contractId: CONTRACT_NAME,
                methodName: "nft_mint",
                args: {
                    token_id: "3",
                    receiver_id: contractAccount.accountId,
                    token_metadata: {
                        title: 'Paw Paw NFT',
                        description: "Paw Paw NFT",
                        media: "https://pbs.twimg.com/media/Fj4w5HiX0AIqk40?format=jpg&name=small",
                    }
                },
                attachedDeposit: (0, format_1.parseNearAmount)("0.01")
            });
            // console.log(`Contract initialized on ${NETWORK}...`);
        }
        catch (error) {
            console.log(error.kind.ExecutionError);
        }
    });
}
deploy().then(() => process.exit(), err => {
    console.error(err);
    process.exit(-1);
});
