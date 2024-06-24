import express, { Router } from "express";
import database_connection from "@voyager/database";
import { PageSizeArray, Transaction, TransactionSqlTableType, transformObjectToSqlInsert } from "@voyager/common";
import z from "zod";

import { RpcProvider } from "starknet";
import db from "@voyager/database";
import { config } from "dotenv";

config()

const RPC_NODE_URL = process.env.RPC_NODE_URL

const provider = new RpcProvider({ nodeUrl: RPC_NODE_URL })

const transactionHashParamsSchema = z.object({
  tx_hash: z.string(),
})

const blocksParamsSchema = z.object({
  p: z.string().default('0'),
  ps: z.enum(['1', ...PageSizeArray]).default('10')
})

const router: Router = express.Router();

const runQuery = (sql: string) => {
  return new Promise((resolve, reject) => {
    database_connection.all(sql, undefined, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const runSingleQuery = (sql: string) => {
  return new Promise((resolve, reject) => {
    database_connection.get(sql, undefined, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

router.get("/transactions", async (req, res, next) => {
  const schemaRes = blocksParamsSchema.safeParse({ p: req.query.p, ps: req.query.ps })

  if (!schemaRes.success) {
    res.status(400).json(schemaRes.error)
    return
  }

  const { ps, p } = schemaRes.data

  const page = parseInt(p);
  const pageSize = parseInt(ps);

  if (isNaN(page) || isNaN(pageSize)) {
    res.status(400).json({ error: "failed to parse pageSize or page" })
    return
  }

  // const query = `SELECT * FROM transactions ORDER BY transactions DESC LIMIT ${pageSize} OFFSET ${page * pageSize}`
  const query = `SELECT * FROM transactions LIMIT ${pageSize} OFFSET ${page * pageSize}`
  const countQuery = `SELECT COUNT(*) AS total FROM transactions`;

  try {
    const [rows, countResult] = await Promise.all([
      runQuery(query),
      runSingleQuery(countQuery),
    ]);

    if (!rows) {
      res.status(404).json({ error: `no transactions present in the db` });
      return;
    }
    let countResult_: any = countResult
    const totalTransactions = countResult_.total;
    const totalPages = Math.ceil(totalTransactions / pageSize) - 1;

    res.status(200).json({
      transactions: rows,
      meta: {
        totalPages
      }
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: "failed to load data from db" });
  }

})

async function getMissingTransaction(hash: string) {
  const tx: any = await provider.getTransaction(hash);
  console.log("Transaction: ", tx)
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
  };

  const { columns, values } = transformObjectToSqlInsert(insertSqlBlock);

  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO transactions (${columns}) VALUES(${values})`, undefined, (err) => {
      if (err) {
        console.error("Failed to insert data", err);
        return reject(err);
      }
      resolve({ message: "Transaction successfully fetched and inserted" });
    });
  });
}



router.get("/transactions/:tx_hash", async (req, res, next) => {
  const tx_hash = req.params.tx_hash;

  const schemaRes = transactionHashParamsSchema.safeParse({ tx_hash })

  if (!schemaRes.success) {
    res.status(400).json(schemaRes.error)
    return
  }

  const query = `SELECT * FROM transactions WHERE transaction_hash = ?`;

  database_connection.get(query, [schemaRes.data.tx_hash.toString()], async (err, row) => {
    if (err != null) {
      console.log(err);
      return res.status(404).json({ error: `failed to load data from db: ${err}` });
    }

    if (!row) {
      try {

        const result = await getMissingTransaction(tx_hash);

        // After successfully fetching and inserting the transaction, query the tx again
        database_connection.get(query, undefined, (err, row: Transaction) => {
          if (err != null) {
            console.log(err);
            return res.status(404).json({ error: "failed to load data from db" });
          }

          if (!row) {
            return res.status(404).json({ error: `no transaction hash ${tx_hash} present in the db` });
          }

          return res.status(200).json(row);
        });
      } catch (fetchErr) {
        console.log("Fetching error", fetchErr);
        return res.status(404).json({ error: "failed to fetch and insert missing transaction" });
      }
      return;
    }

    return res.status(200).json(row);
  });
})

export default router
