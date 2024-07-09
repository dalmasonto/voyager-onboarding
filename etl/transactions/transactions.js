"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_START = void 0;
const starknet_1 = require("starknet");
const database_1 = __importDefault(require("@voyager/database"));
const common_1 = require("@voyager/common");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const RPC_NODE_URL = process.env.RPC_NODE_URL;
const provider = new starknet_1.RpcProvider({ nodeUrl: RPC_NODE_URL });
const CHUNK_SIZE = 100;
const syncTransactionsForBlock = (blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    try {
        const latestBlockDetails = yield provider.getBlockWithTxs(blockNumber);
        console.log("Syncing transactions for block: ", blockNumber);
        for (let i = 0; i < latestBlockDetails.transactions.length; i++) {
            const tx = latestBlockDetails.transactions[i];
            const insertSqlTransaction = {
                transaction_hash: tx.transaction_hash,
                type: tx.type,
                version: tx.version,
                nonce: tx.nonce,
                sender_address: tx.sender_address,
                signature: JSON.stringify((_a = tx.signature) !== null && _a !== void 0 ? _a : []),
                calldata: JSON.stringify((_b = tx.calldata) !== null && _b !== void 0 ? _b : []),
                resource_bounds: JSON.stringify((_c = tx.resource_bounds) !== null && _c !== void 0 ? _c : []),
                tip: tx.tip,
                paymaster_data: JSON.stringify((_d = tx.paymaster_data) !== null && _d !== void 0 ? _d : []),
                account_deployment_data: JSON.stringify((_e = tx.account_deployment_data) !== null && _e !== void 0 ? _e : []),
                nonce_data_availability_mode: tx.nonce_data_availability_mode,
                fee_data_availability_mode: tx.fee_data_availability_mode,
                max_fee: tx.max_fee,
                block_number: blockNumber,
            };
            const { columns, values } = (0, common_1.transformObjectToSqlInsert)(insertSqlTransaction);
            yield database_1.default.run(`INSERT INTO transactions (${columns}) VALUES(${values})`, undefined);
            console.log(`Successfully inserted transaction: ${tx.transaction_hash}`);
        }
    }
    catch (error) {
        console.error(`Error syncing transactions for block ${blockNumber}:`, error);
    }
});
const syncTransactionRange = (start, end) => __awaiter(void 0, void 0, void 0, function* () {
    if (start > end)
        return;
    try {
        yield syncTransactionsForBlock(start);
        yield syncTransactionRange(start + 1, end);
    }
    catch (error) {
        console.error(`Error syncing transaction range (${start}, ${end}):`, error);
    }
});
const runTransactions = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (startBlock = 0) {
    try {
        const latestBlockNumber = yield provider.getBlockNumber();
        console.log("Latest onchain block", latestBlockNumber);
        const MAXIMUM_SELECTOR = 'MAX(block_number)';
        const query = `SELECT ${MAXIMUM_SELECTOR} FROM transactions`;
        const row = yield new Promise((resolve, reject) => {
            database_1.default.get(query, undefined, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
        const latestSyncedBlock = row[MAXIMUM_SELECTOR];
        console.log("Sync transactions from-to", `(${latestSyncedBlock !== null && latestSyncedBlock !== void 0 ? latestSyncedBlock : startBlock}, ${latestBlockNumber})`);
        yield syncTransactionRange(latestSyncedBlock ? latestSyncedBlock + 1 : startBlock, latestBlockNumber);
    }
    catch (error) {
        console.error("Error in runTransactions:", error);
    }
});
// Setting default start in case of no db it will sync block upto default block.
// Make it 0 if want to sync all blocks
exports.DEFAULT_START = 79540;
exports.default = runTransactions;
