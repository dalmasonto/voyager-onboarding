import sqlite3 from "sqlite3";

const db = new sqlite3.Database("../sqlite_db/sqlite.db")

const blockTableCreationQuery = `
	CREATE TABLE IF NOT EXISTS blocks (
		block_hash VARCHAR(66) PRIMARY KEY,
		status TEXT,
		parent_hash VARCHAR(66),
		block_number INT,
		new_root VARCHAR(66),
		timestamp DATETIME,
		sequence_address VARCHAR(66),
		starknet_version TEXT,
		l1_da_mode TEXT,
		l1_data_gas_price_price_in_fri TEXT,
		l1_data_gas_price_price_in_wei TEXT,
		l1_gas_price_price_in_fri TEXT, 
		l1_gas_price_price_in_wei TEXT
	)
`
 
const transactionTableCreationQuery = `
	CREATE TABLE IF NOT EXISTS transactions (
		transaction_hash VARCHAR(66) PRIMARY KEY,  
		type TEXT,
        version VARCHAR(10),
        nonce VARCHAR(66),
        sender_address VARCHAR(66),
        signature TEXT,
        calldata TEXT,
        resource_bounds TEXT,
        tip VARCHAR(66),
        paymaster_data TEXT,
        account_deployment_data TEXT,
        nonce_data_availability_mode VARCHAR(4),
        fee_data_availability_mode VARCHAR(4),
        max_fee TEXT
	)
`

// Load Tables here
db.serialize(() => {
	db.run(blockTableCreationQuery, undefined, (err) => {
		if (err != null) {
			console.error("table creation error:", err)
			throw new Error("Failed to create blocks table")
		}
	})
	db.run(transactionTableCreationQuery, undefined, (err) => {
		if (err != null) {
			console.error("table creation error:", err)
			throw new Error("Failed to create transactions table")
		}
	})
})

export default db
