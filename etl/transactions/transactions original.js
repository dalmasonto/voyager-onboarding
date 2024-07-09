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
const starknet_1 = require("starknet");
const database_1 = __importDefault(require("@voyager/database"));
const common_1 = require("@voyager/common");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const RPC_NODE_URL = process.env.RPC_NODE_URL;
const provider = new starknet_1.RpcProvider({ nodeUrl: RPC_NODE_URL });
console.log(provider);
const syncBlockRange = (start, end) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    for (let current_block = end; current_block > start && current_block <= end; current_block--) {
        console.log(`Syncing block: ${current_block}`);
        const latestBlockDetails = yield provider.getBlockWithTxs(current_block);
        for (let i = 0; i < latestBlockDetails.transactions.length; i++) {
            let tx = latestBlockDetails.transactions[i];
            const insertSqlBlock = {
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
                block_number: current_block,
            };
            const { columns, values } = (0, common_1.transformObjectToSqlInsert)(insertSqlBlock);
            database_1.default.run(`INSERT INTO transactions (${columns}) VALUES(${values})`, undefined, (err) => {
                if (err)
                    console.error("failed to insert data", err);
            });
        }
    }
});
const CHUNK_SIZE = 10;
const chunking = (start, end) => __awaiter(void 0, void 0, void 0, function* () {
    const tasks = [];
    console.log(start, end);
    if (start >= end)
        return;
    console.log("Start Chunking");
    let task_index = end;
    if (end - start > CHUNK_SIZE) {
        for (; task_index > start; task_index -= CHUNK_SIZE) {
            tasks.push(syncBlockRange(task_index - CHUNK_SIZE, task_index));
        }
    }
    if (task_index <= 0) {
        // "PROCESS REST RANGE", 0, CHUNK_SIZE + task_index
        tasks.push(syncBlockRange(0, task_index + CHUNK_SIZE));
    }
    if (end - start <= CHUNK_SIZE) {
        tasks.push(syncBlockRange(start, end));
    }
    console.log(tasks.length, task_index);
    yield Promise.all(tasks);
    console.log("Finished all processes");
});
// Setting default start in case of no db it will sync block upto default block.
// Make it 0 if want to sync all blocks
const DEFAULT_START = 70000;
const runTransactions = () => __awaiter(void 0, void 0, void 0, function* () {
    const latestBlockNumber = yield provider.getBlockNumber();
    console.log("Latest onchain block", latestBlockNumber);
    const MAXIMUM_SELECTOR = 'MAX(block_number)';
    const query = `SELECT ${MAXIMUM_SELECTOR} FROM blocks`;
    database_1.default.get(query, undefined, (err, row) => {
        if (err)
            console.log(err);
        const latestSyncedBlock = row[MAXIMUM_SELECTOR];
        console.log("Sync blocks from-to", `(${latestSyncedBlock}, ${latestBlockNumber})`);
        chunking(latestSyncedBlock !== null && latestSyncedBlock !== void 0 ? latestSyncedBlock : DEFAULT_START, latestBlockNumber);
    });
});
// runTransactions()
exports.default = runTransactions;
