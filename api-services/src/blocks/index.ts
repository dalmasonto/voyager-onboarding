import express, { Router } from "express";
import database_connection from "@voyager/database";
import { BlockSqlTableType, transformObjectToSqlInsert, type Block, pageSizeOptions } from "@voyager/common";
import z from "zod";

import { RpcProvider } from "starknet";
import db from "@voyager/database";
import { config } from "dotenv";

config()

const RPC_NODE_URL = process.env.RPC_NODE_URL

const provider = new RpcProvider({ nodeUrl: RPC_NODE_URL })

const transactionParamsSchema = z.object({
  block_number: z.number(),
})

const transactionHashParamsSchema = z.object({
  block_hash: z.string(),
})


const transactionsParamsSchema = z.object({
  p: z.number().default(1),
  ps: pageSizeOptions.default(10)
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

router.get("/blocks", async (req, res, next) => {
  const schemaRes = transactionsParamsSchema.safeParse({ p: Number(req.query.p), ps: Number(req.query.ps) })

  if (!schemaRes.success) {
    res.status(400).json(schemaRes.error)
    return
  }

  const { ps, p } = schemaRes.data

  const page = p - 1;
  const pageSize = ps;

  if (isNaN(page) || isNaN(pageSize)) {
    res.status(400).json({ error: "failed to parse pageSize or page" })
    return
  }

  const query = `SELECT * FROM blocks ORDER BY block_number DESC LIMIT ${pageSize} OFFSET ${page * pageSize}`
  const countQuery = `SELECT COUNT(*) AS total FROM blocks`;
  const latestItemQuery = `SELECT * FROM blocks ORDER BY block_number DESC LIMIT 1`;

  try {
    const [rows, countResult, latesBlockResult] = await Promise.all([
      runQuery(query),
      runSingleQuery(countQuery),
      runSingleQuery(latestItemQuery)
    ]);

    if (!rows) {
      res.status(404).json({ error: `no blocks present in the db` });
      return;
    }
    let countResult_: any = countResult
    const totalBlocks = countResult_.total;
    const totalPages = Math.ceil(totalBlocks / pageSize);

    res.status(200).json({
      blocks: rows,
      meta: {
        totalPages,
        latesBlock: latesBlockResult
      }
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({ error: "failed to load data from db" });
  }

})

async function getMissingBlock(block_number: number) {
  const latestBlockDetails: any = await provider.getBlockWithTxs(block_number);

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
  };

  const { columns, values } = transformObjectToSqlInsert(insertSqlBlock);

  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO blocks (${columns}) VALUES(${values})`, undefined, (err) => {
      if (err) {
        console.error("Failed to insert data", err);
        return reject(err);
      }
      resolve({ message: "Block successfully fetched and inserted" });
    });
  });
}
 
router.get("/block/:block_number", async (req, res, next) => {
  const block_number = req.params.block_number;

  const schemaRes = transactionParamsSchema.safeParse({ block_number: parseInt(block_number) })

  if (!schemaRes.success) {
    res.status(400).json(schemaRes.error)
    return
  }

  const query = `SELECT * FROM blocks WHERE block_number = ${schemaRes.data.block_number}`

  database_connection.get(query, undefined, async (err, row: Block) => {
    if (err != null) {
      console.log(err);
      return res.status(404).json({ error: "failed to load data from db" });
    }

    if (!row) {
      try {
        const result = await getMissingBlock(Number(block_number));

        // After successfully fetching and inserting the block, query the block again
        database_connection.get(query, undefined, (err, row: Block) => {
          if (err != null) {
            console.log(err);
            return res.status(404).json({ error: "failed to load data from db" });
          }

          if (!row) {
            return res.status(404).json({ error: `no block number ${block_number} present in the db` });
          }

          return res.status(200).json(row);
        });
      } catch (fetchErr) {
        console.log("Fetching error", fetchErr);
        return res.status(404).json({ error: "failed to fetch and insert missing block" });
      }
      return;
    }

    return res.status(200).json(row);
  });
})


router.get("/block_hash/:block_hash", async (req, res, next) => {
  const block_hash = req.params.block_hash;

  const schemaRes = transactionHashParamsSchema.safeParse({ block_hash: block_hash })

  if (!schemaRes.success) {
    res.status(400).json(schemaRes.error)
    return
  }

  const query = `SELECT * FROM blocks WHERE block_hash = '${schemaRes.data.block_hash}' ORDER BY block_number`

  database_connection.get(query, undefined, (err, row: Block) => {
    if (err != null) {
      console.log(err)
      res.status(404).json({ error: "failed to load data from db" })
      return;
    }
    if (!row) {
      res.status(404).json({ error: `no block hash ${block_hash} present in the db` })
      return;
    }
    res.status(200).json(row)
    return;
  })
})

export default router
