import { RpcProvider } from "starknet";
import db from "@voyager/database";
import { BlockSqlTableType, transformObjectToSqlInsert } from "@voyager/common"
import { config } from "dotenv";

config()

const RPC_NODE_URL = process.env.RPC_NODE_URL

const provider = new RpcProvider({ nodeUrl: RPC_NODE_URL })


const syncBlockRange = async (start: number, end: number) => {
	for (
		let current_block = end;
		current_block > start && current_block <= end;
		current_block--
	) {
		console.log(`Syncing block: ${current_block}`)
		const latestBlockDetails: any = await provider.getBlockWithTxs(current_block);

		const insertSqlBlock: BlockSqlTableType = {
			status: latestBlockDetails.status,
			block_hash: latestBlockDetails.block_hash,
			parent_hash: latestBlockDetails.parent_hash,
			block_number: latestBlockDetails.block_number,
			new_root: latestBlockDetails.new_root,
			timestamp: latestBlockDetails.timestamp,
			sequence_address: latestBlockDetails.sequencer_address,
			starknet_version: latestBlockDetails.starknet_version,
			l1_da_mode: latestBlockDetails.l1_da_mode,
			l1_data_gas_price_price_in_fri: latestBlockDetails?.l1_data_gas_price?.price_in_fri,
			l1_data_gas_price_price_in_wei: latestBlockDetails?.l1_data_gas_price?.price_in_wei,
			l1_gas_price_price_in_fri: latestBlockDetails?.l1_gas_price?.price_in_fri,
			l1_gas_price_price_in_wei: latestBlockDetails?.l1_gas_price?.price_in_wei,
		}

		const { columns, values } = transformObjectToSqlInsert(insertSqlBlock)

		db.run(`INSERT INTO blocks (${columns}) VALUES(${values})`, undefined, (err) => {
			if (err)
				console.error("failed to insert data", err);
		})
	}
}

const CHUNK_SIZE = 100;
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
const DEFAULT_START = 64500;
const runBlocks = async () => {

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
// runBlocks()
export default runBlocks
