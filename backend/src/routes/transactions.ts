import {Router} from "express";
import { getAllTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction, } from "../controllers/transactionController";

const router = Router();

// Route defintions for HTTP methods to controller functions
router.get('/', getAllTransactions)        // Get all
router.get('/:id', getTransactionById)     // Get one by ID
router.post('/', createTransaction)        // Create new
router.put('/:id', updateTransaction)      // Update by ID
router.delete('/:id', deleteTransaction)   // Delete by ID

export default router;