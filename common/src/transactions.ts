import * as z from "zod";

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
	max_fee: z.string(),
	block_number: z.number()
})

export const transactionsMeta = z.object({
	totalPages: z.number()
})

export const transactionssResult = z.object({
	transactions: z.array(transaction),
	meta: transactionsMeta
})


export type Transaction = z.infer<typeof transaction>
export type TransactionsResult = z.infer<typeof transactionssResult>


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
	block_number: number
}