import express, { Request, Response } from 'express';
import cors from "cors";
import block from "./blocks"
import transactions from './transactions'


const app = express();

app.use(cors());

app.get('/', (req: Request, res: Response): Response => {
  return res.status(200).json({message: 'Server is running!!!'})
});

app.use('/', block);
app.use('/', transactions);

export default app;
