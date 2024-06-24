import { RpcProvider } from "starknet";
import db from "@voyager/database";
import { TransactionSqlTableType, transformObjectToSqlInsert } from "@voyager/common"
import { config } from "dotenv";

config()

const RPC_NODE_URL = process.env.RPC_NODE_URL

const provider = new RpcProvider({ nodeUrl: RPC_NODE_URL })

console.log(provider)
const syncBlockRange = async (start: number, end: number) => {
	for (
		let current_block = end;
		current_block > start && current_block <= end;
		current_block--
	) {
		console.log(`Syncing block: ${current_block}`)
		const latestBlockDetails: any = await provider.getBlockWithTxs(current_block);

		for (let i = 0; i < latestBlockDetails.transactions.length; i++) {
			let tx = latestBlockDetails.transactions[i]

			const insertSqlBlock: TransactionSqlTableType = {
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
				max_fee: tx.max_fee
			}

			const { columns, values } = transformObjectToSqlInsert(insertSqlBlock)

			db.run(`INSERT INTO transactions (${columns}) VALUES(${values})`, undefined, (err) => {
				if (err)
					console.error("failed to insert data", err);
			})
		}

	}
}

const CHUNK_SIZE = 10;
const chunking = async (start: number, end: number) => {
	const tasks: Promise<any>[] = []
	console.log(start, end)
	if (start >= end) return;

	console.log("Start Chunking")

	let task_index = end;
	if (end - start > CHUNK_SIZE) {
		for (; task_index > start; task_index -= CHUNK_SIZE) {
			tasks.push(syncBlockRange(task_index - CHUNK_SIZE, task_index))
		}
	}
	if (task_index <= 0) {
		// "PROCESS REST RANGE", 0, CHUNK_SIZE + task_index
		tasks.push(syncBlockRange(0, task_index + CHUNK_SIZE))
	}
	if (end - start <= CHUNK_SIZE) {
		tasks.push(syncBlockRange(start, end))
	}
	console.log(tasks.length, task_index)
	await Promise.all(tasks)
	console.log("Finished all processes")
}


// Setting default start in case of no db it will sync block upto default block.
// Make it 0 if want to sync all blocks
const DEFAULT_START = 0;
const runTransactions = async () => {

	const latestBlockNumber = await provider.getBlockNumber()
	console.log("Latest onchain block", latestBlockNumber)

	const MAXIMUM_SELECTOR = 'MAX(block_number)';

	const query = `SELECT ${MAXIMUM_SELECTOR} FROM blocks`
	db.get(query, undefined, (err: any, row: any) => {
		if (err)
			console.log(err)
		const latestSyncedBlock = row[MAXIMUM_SELECTOR]
		console.log("Sync blocks from-to", `(${latestSyncedBlock}, ${latestBlockNumber})`)
		chunking(latestSyncedBlock ?? DEFAULT_START, latestBlockNumber);
	})
}
// runTransactions()
export default runTransactions
