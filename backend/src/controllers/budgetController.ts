import Budget from "../models/Budget";
import Transaction from "../models/Transaction";
import { Request, Response } from "express";

// Get all budgets
export const getAllBudgets = async (req: Request, res: Response) => {
    try {
        const budgets = await Budget.find().sort({ startDate: -1 });
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching budgets',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get budget by ID
export const getBudgetById = async (req: Request, res: Response) => {
    try {
        const budget = await Budget.findById(req.params.id);

        if (!budget) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching budget',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Create new budget
export const createBudget = async (req: Request, res: Response) => {
    try {
        const budget = new Budget(req.body);
        await budget.save();
        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({
            message: 'Error creating budget',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Update budget
export const updateBudget = async (req: Request, res: Response) => {
    try {
        const budget = await Budget.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!budget) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({
            message: 'Error updating budget',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Delete budget
export const deleteBudget = async (req: Request, res: Response) => {
    try {
        const budget = await Budget.findByIdAndDelete(req.params.id);

        if (!budget) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        res.status(200).json({ message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(500).json({
            message: 'Error deleting budget',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get budget status with actual spending
export const getBudgetStatus = async (req: Request, res: Response) => {
    try {
        const budgets = await Budget.find({ isActive: true });

        const budgetStatus = await Promise.all(
            budgets.map(async (budget) => {
                // Get actual spending for this category within the budget period
                const expenses = await Transaction.find({
                    type: 'expense',
                    category: budget.category,
                    date: {
                        $gte: budget.startDate,
                        $lte: budget.endDate
                    }
                });

                const spent = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
                const remaining = budget.amount - spent;
                const percentageUsed = (spent / budget.amount) * 100;

                // Determine status
                let status: 'safe' | 'warning' | 'exceeded';
                if (percentageUsed >= 100) {
                    status = 'exceeded';
                } else if (percentageUsed >= 80) {
                    status = 'warning';
                } else {
                    status = 'safe';
                }

                return {
                    _id: budget._id,
                    category: budget.category,
                    budgetAmount: budget.amount,
                    spent: spent,
                    remaining: remaining,
                    percentageUsed: Math.round(percentageUsed * 10) / 10,
                    status: status,
                    period: budget.period,
                    startDate: budget.startDate,
                    endDate: budget.endDate
                };
            })
        );

        res.status(200).json(budgetStatus);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching budget status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get budget overview summary
export const getBudgetOverview = async (req: Request, res: Response) => {
    try {
        const budgets = await Budget.find({ isActive: true });

        let totalBudgeted = 0;
        let totalSpent = 0;
        let categoriesOverBudget = 0;
        let categoriesOnTrack = 0;

        await Promise.all(
            budgets.map(async (budget) => {
                const expenses = await Transaction.find({
                    type: 'expense',
                    category: budget.category,
                    date: {
                        $gte: budget.startDate,
                        $lte: budget.endDate
                    }
                });

                const spent = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
                
                totalBudgeted += budget.amount;
                totalSpent += spent;

                if (spent > budget.amount) {
                    categoriesOverBudget++;
                } else {
                    categoriesOnTrack++;
                }
            })
        );

        const totalRemaining = totalBudgeted - totalSpent;
        const overallPercentage = totalBudgeted > 0 
            ? (totalSpent / totalBudgeted) * 100 
            : 0;

        res.status(200).json({
            totalBudgeted,
            totalSpent,
            totalRemaining,
            overallPercentage: Math.round(overallPercentage * 10) / 10,
            categoriesOverBudget,
            categoriesOnTrack,
            totalCategories: budgets.length
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching budget overview',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get current period budget for a specific category
export const getCategoryBudget = async (req: Request, res: Response) => {
    try {
        const { category } = req.params;
        const today = new Date();

        // Find active budget for this category that includes today's date
        const budget = await Budget.findOne({
            category: category,
            isActive: true,
            startDate: { $lte: today },
            endDate: { $gte: today }
        });

        if (!budget) {
            res.status(404).json({ 
                message: 'No active budget found for this category' 
            });
            return;
        }

        // Get spending for this budget period
        const expenses = await Transaction.find({
            type: 'expense',
            category: budget.category,
            date: {
                $gte: budget.startDate,
                $lte: budget.endDate
            }
        });

        const spent = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
        const remaining = budget.amount - spent;
        const percentageUsed = (spent / budget.amount) * 100;

        let status: 'safe' | 'warning' | 'exceeded';
        if (percentageUsed >= 100) {
            status = 'exceeded';
        } else if (percentageUsed >= 80) {
            status = 'warning';
        } else {
            status = 'safe';
        }

        res.status(200).json({
            budget: budget,
            spent: spent,
            remaining: remaining,
            percentageUsed: Math.round(percentageUsed * 10) / 10,
            status: status
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching category budget',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};