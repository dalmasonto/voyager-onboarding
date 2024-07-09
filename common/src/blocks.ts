import * as z from "zod";

export const block = z.object({
	block_number: z.number(),
	block_hash: z.string(),
	status: z.string(),
	parent_hash: z.string(),
	new_root: z.string(),
	timestamp: z.string(),
	sequence_address: z.string(),
	starknet_version: z.string(),
	l1_da_mode: z.string(),
	l1_data_gas_price_price_in_fri: z.string(),
	l1_data_gas_price_price_in_wei: z.string(),
	l1_gas_price_price_in_fri: z.string(),
	l1_gas_price_price_in_wei: z.string()
})



export const blocksMeta = z.object({
	latesBlock: block,
	totalPages: z.number()
})

export const blocksResult = z.object({
	blocks: z.array(block),
	meta: blocksMeta
})


export type Block = z.infer<typeof block>
export type BlocksResult = z.infer<typeof blocksResult>


export type BlockSqlTableType = {
	status: string,
	block_hash: string,
	parent_hash: string,
	block_number: number,
	new_root: string,
	timestamp: number,
	sequence_address: string,
	starknet_version: string,
	l1_da_mode: string,
	l1_data_gas_price_price_in_fri: string,
	l1_data_gas_price_price_in_wei: string,
	l1_gas_price_price_in_fri: string,
	l1_gas_price_price_in_wei: string,
}

