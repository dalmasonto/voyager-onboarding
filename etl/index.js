"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blocks_1 = __importDefault(require("./blocks/blocks"));
const transactions_1 = __importDefault(require("./transactions/transactions"));
// runBlocks()
// runTransactions()
function runProcesses() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Starting processes...');
            yield (0, blocks_1.default)();
            console.log('runBlocks finished.');
            yield (0, transactions_1.default)();
            console.log('runTransactions finished.');
            console.log('Waiting 1 minute to rerun...');
            setTimeout(runProcesses, 60000); // 1 minute = 60000 milliseconds
        }
        catch (error) {
            console.error('Error running processes:', error);
        }
    });
}
// Start the process loop
runProcesses();
