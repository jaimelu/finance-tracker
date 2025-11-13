import { Router } from "express";
import {
    getAllBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetStatus,
    getBudgetOverview,
    getCategoryBudget
} from "../controllers/budgetController";

const router = Router();

// Budget CRUD routes
router.get('/', getAllBudgets);              // Get all budgets
router.get('/:id', getBudgetById);           // Get budget by ID
router.post('/', createBudget);              // Create new budget
router.put('/:id', updateBudget);            // Update budget
router.delete('/:id', deleteBudget);         // Delete budget

// Budget analytics routes
router.get('/status/all', getBudgetStatus);            // Get all budget statuses
router.get('/overview/summary', getBudgetOverview);    // Get budget overview
router.get('/category/:category', getCategoryBudget);  // Get budget for specific category

export default router;