import runBlocks, {DEFAULT_START} from "./blocks/blocks";
import runTransactions, {DEFAULT_START as Transaction_Start_Bloc} from "./transactions/transactions";


// runBlocks()
// runTransactions()
async function runProcesses() {
    try {
        console.log('Starting processes...');
        await runBlocks(DEFAULT_START);
        console.log('runBlocks finished.');
        await runTransactions(Transaction_Start_Bloc);
        console.log('runTransactions finished.');
        console.log('Waiting 1 minute to rerun...');
        setTimeout(runProcesses, 60000); // 1 minute = 60000 milliseconds
    } catch (error) {
        console.error('Error running processes:', error);
    }
}

// Start the process loop
runProcesses();