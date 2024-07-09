import { RpcProvider } from "starknet";
import db from "@voyager/database";
import { TransactionSqlTableType, transformObjectToSqlInsert } from "@voyager/common"
import { config } from "dotenv";

config()

const RPC_NODE_URL = process.env.RPC_NODE_URL

const provider = new RpcProvider({ nodeUrl: RPC_NODE_URL })

const CHUNK_SIZE = 100;

const syncTransactionsForBlock = async (blockNumber: number) => {
  try {
    const latestBlockDetails: any = await provider.getBlockWithTxs(blockNumber);
	console.log("Syncing transactions for block: ", blockNumber)

    for (let i = 0; i < latestBlockDetails.transactions.length; i++) {
      const tx = latestBlockDetails.transactions[i];
      const insertSqlTransaction: TransactionSqlTableType = {
        transaction_hash: tx.transaction_hash,
        type: tx.type,
        version: tx.version,
        nonce: tx.nonce,
        sender_address: tx.sender_address,
        signature: JSON.stringify(tx.signature ?? []),
        calldata: JSON.stringify(tx.calldata ?? []),
        resource_bounds: JSON.stringify(tx.resource_bounds ?? []),
        tip: tx.tip,
        paymaster_data: JSON.stringify(tx.paymaster_data ?? []),
        account_deployment_data: JSON.stringify(tx.account_deployment_data ?? []),
        nonce_data_availability_mode: tx.nonce_data_availability_mode,
        fee_data_availability_mode: tx.fee_data_availability_mode,
        max_fee: tx.max_fee,
        block_number: blockNumber,
      }

      const { columns, values } = transformObjectToSqlInsert(insertSqlTransaction)

      await db.run(`INSERT INTO transactions (${columns}) VALUES(${values})`, undefined);
      console.log(`Successfully inserted transaction: ${tx.transaction_hash}`);
    }
  } catch (error) {
    console.error(`Error syncing transactions for block ${blockNumber}:`, error);
  }
}

const syncTransactionRange = async (start: number, end: number) => {
  if (start > end) return;

  try {
    await syncTransactionsForBlock(start);
    await syncTransactionRange(start + 1, end);
  } catch (error) {
    console.error(`Error syncing transaction range (${start}, ${end}):`, error);
  }
}

const runTransactions = async (startBlock: number = 0) => {
  try {
    const latestBlockNumber = await provider.getBlockNumber()
    console.log("Latest onchain block", latestBlockNumber)

    const MAXIMUM_SELECTOR = 'MAX(block_number)';

    const query = `SELECT ${MAXIMUM_SELECTOR} FROM transactions`
    const row: any = await new Promise((resolve, reject) => {
      db.get(query, undefined, (err: any, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    const latestSyncedBlock = row[MAXIMUM_SELECTOR]
    console.log("Sync transactions from-to", `(${latestSyncedBlock ?? startBlock}, ${latestBlockNumber})`);

    await syncTransactionRange(latestSyncedBlock ? latestSyncedBlock + 1 : startBlock, latestBlockNumber);
  } catch (error) {
    console.error("Error in runTransactions:", error);
  }
}

// Setting default start in case of no db it will sync block upto default block.
// Make it 0 if want to sync all blocks
export const DEFAULT_START = 79540;

export default runTransactions