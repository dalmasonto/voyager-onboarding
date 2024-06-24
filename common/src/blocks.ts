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

export const transaction = z.object({
	transaction_hash: z.string(),
	type: z.string(),
	version: z.string(),
	nonce: z.string(),
	sender_address: z.string(),
	signature: z.string(),
	calldata: z.string(),
	resource_bounds: z.string(),
	tip: z.string(),
	paymaster_data: z.string(),
	account_deployment_data: z.string(),
	nonce_data_availability_mode: z.string(),
	fee_data_availability_mode: z.string(),
	max_fee: z.string()
})

export const blocksMeta = z.object({
	latesBlock: block,
	totalPages: z.number()
})

export const transactionsMeta = z.object({
	totalPages: z.number()
})

export const blocksResult = z.object({
	blocks: z.array(block),
	meta: blocksMeta
})

export const transactionssResult = z.object({
	transactions: z.array(transaction),
	meta: transactionsMeta
})

export type IPageSize = '5' | '10' | '25' | '50' | '100'
export const PageSizeArray = ['5', '10', '25', '50', '100']
export type Block = z.infer<typeof block>
export type BlocksResult = z.infer<typeof blocksResult>
export type Transaction = z.infer<typeof transaction>
export type TransactionsResult = z.infer<typeof transactionssResult>

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

export type TransactionSqlTableType = {
	transaction_hash: string,
	type: string,
	version: string,
	nonce: string,
	sender_address: string,
	signature: string,
	calldata: string,
	resource_bounds: string,
	tip: string,
	paymaster_data: string,
	account_deployment_data: string,
	nonce_data_availability_mode: string,
	fee_data_availability_mode: string,
	max_fee: string
}

export const transformObjectToSqlInsert = (obj: any) => {
	return {
		columns: Object.keys(obj).join(", "),
		values: Object.values(obj).map(v => `'${v}'`).join(", ")
	}
}
