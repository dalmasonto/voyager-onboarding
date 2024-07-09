import { RpcProvider } from "starknet";
import db from "@voyager/database";
import { BlockSqlTableType, transformObjectToSqlInsert } from "@voyager/common"
import { config } from "dotenv";

config()

const RPC_NODE_URL = process.env.RPC_NODE_URL

const provider = new RpcProvider({ nodeUrl: RPC_NODE_URL })

const syncBlockRange = async (start: number, end: number) => {
	if (start > end) return;

	try {
		const latestBlockDetails: any = await provider.getBlockWithTxs(start);

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

		await db.run(`INSERT INTO blocks (${columns}) VALUES(${values})`, undefined);
		console.log(`Successfully inserted block: ${start}`);

		await syncBlockRange(start + 1, end);
	} catch (error) {
		console.error(`Error syncing block ${start}:`, error);
	}
}

const runBlocks = async (startBlock: number = 0) => {
	try {
		const latestBlockNumber = await provider.getBlockNumber()
		console.log("Latest onchain block", latestBlockNumber)

		const MAXIMUM_SELECTOR = 'MAX(block_number)';

		const query = `SELECT ${MAXIMUM_SELECTOR} FROM blocks`
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
		console.log("Sync blocks from-to", `(${latestSyncedBlock ?? startBlock}, ${latestBlockNumber})`);

		await syncBlockRange(latestSyncedBlock ? latestSyncedBlock + 1 : startBlock, latestBlockNumber);
	} catch (error) {
		console.error("Error in runBlocks:", error);
	}
}

const DEFAULT_START = 79540;

export { DEFAULT_START }
export default runBlocks