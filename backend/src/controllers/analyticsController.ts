import Transaction from "../models/Transaction";
import { Request, Response } from "express";

// Get monthly trends (last 6 months)
export const getMonthlyTrends = async (req: Request, res: Response) => {
    try {
        // calculate date 6 months ago
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        // Getting transactions from last 6 months
        const transactions = await Transaction.find({
            date: { $gte: sixMonthsAgo }
        }).sort({ date: 1 }); // Sort by date ascending
        
        // Group by month
        const monthlyData: { [key: string]: { income: number, expense: number } } = {};
        
        transactions.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expense: 0 };
            }
            
            if (transaction.type === 'income') {
                monthlyData[monthKey].income += transaction.amount;
            } else {
                monthlyData[monthKey].expense += transaction.amount;
            }
        });
        
        const result = Object.keys(monthlyData).map(month => ({
            month: month,
            income: monthlyData[month].income,
            expense: monthlyData[month].expense
        }));
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching monthly trends',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get spending by category with optional date filtering
export const getSpendingByCategory = async (req: Request, res: Response) => {
    try {
        // Build filter for expenses
        const filter: any = { type: 'expense' };
        
        // Add date range filter if provided
        if (req.query.startDate || req.query.endDate) {
            filter.date = {};
            
            if (req.query.startDate) {
                filter.date.$gte = new Date(req.query.startDate as string);
            }
            
            if (req.query.endDate) {
                // Set to end of day
                const endDate = new Date(req.query.endDate as string);
                endDate.setHours(23, 59, 59, 999);
                filter.date.$lte = endDate;
            }
        }
        
        // Get expense transactions with filter
        const expenses = await Transaction.find(filter);
        
        // Group by category and sum amounts
        const categoryTotals: { [key: string]: number } = {};
        
        expenses.forEach(transaction => {
            const category = transaction.category;
            if (categoryTotals[category]) {
                categoryTotals[category] += transaction.amount;
            } else {
                categoryTotals[category] = transaction.amount;
            }
        });
        
        // Convert to array format for charts
        const result = Object.keys(categoryTotals).map(category => ({
            category: category,
            total: categoryTotals[category]
        }));
        
        // Sort by total (highest first)
        result.sort((a, b) => b.total - a.total);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching spending by category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get summary statistics with month-over-month comparison
export const getSummaryStats = async (req: Request, res: Response) => {
    try {
        // Get current date info
        const today = new Date();
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        lastMonthEnd.setHours(23, 59, 59, 999);
        
        // Get all transactions
        const allTransactions = await Transaction.find();
        
        // Get this month's transactions
        const thisMonthTransactions = await Transaction.find({
            date: { $gte: currentMonthStart }
        });
        
        // Get last month's transactions
        const lastMonthTransactions = await Transaction.find({
            date: { 
                $gte: lastMonthStart,
                $lte: lastMonthEnd
            }
        });
        
        // Calculate all-time totals
        const totalIncome = allTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpenses = allTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = totalIncome - totalExpenses;
        
        // Calculate this month's totals
        const thisMonthIncome = thisMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const thisMonthExpenses = thisMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate last month's totals
        const lastMonthIncome = lastMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const lastMonthExpenses = lastMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate percentage changes
        const incomeChange = lastMonthIncome === 0 
            ? (thisMonthIncome > 0 ? 100 : 0)
            : ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100;
        
        const expenseChange = lastMonthExpenses === 0 
            ? (thisMonthExpenses > 0 ? 100 : 0)
            : ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
        
        const lastMonthBalance = lastMonthIncome - lastMonthExpenses;
        const thisMonthBalance = thisMonthIncome - thisMonthExpenses;
        const balanceChange = lastMonthBalance === 0
            ? (thisMonthBalance > 0 ? 100 : thisMonthBalance < 0 ? -100 : 0)
            : ((thisMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100;
        
        // Return summary with changes
        res.status(200).json({
            totalIncome,
            totalExpenses,
            balance,
            transactionCount: allTransactions.length,
            thisMonth: {
                income: thisMonthIncome,
                expenses: thisMonthExpenses,
                balance: thisMonthBalance
            },
            lastMonth: {
                income: lastMonthIncome,
                expenses: lastMonthExpenses,
                balance: lastMonthBalance
            },
            changes: {
                income: Math.round(incomeChange * 10) / 10,  // Round to 1 decimal
                expenses: Math.round(expenseChange * 10) / 10,
                balance: Math.round(balanceChange * 10) / 10
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching summary statistics',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get income by category with optional date filtering
export const getIncomeByCategory = async (req: Request, res: Response) => {
    try {
        // Build filter for income
        const filter: any = { type: 'income' };
        
        // Add date range filter if provided
        if (req.query.startDate || req.query.endDate) {
            filter.date = {};
            
            if (req.query.startDate) {
                filter.date.$gte = new Date(req.query.startDate as string);
            }
            
            if (req.query.endDate) {
                // Set to end of day
                const endDate = new Date(req.query.endDate as string);
                endDate.setHours(23, 59, 59, 999);
                filter.date.$lte = endDate;
            }
        }
        
        // Get income transactions with filter
        const incomes = await Transaction.find(filter);
        
        // Group by category and sum amounts
        const categoryTotals: { [key: string]: number } = {};
        
        incomes.forEach(transaction => {
            const category = transaction.category;
            if (categoryTotals[category]) {
                categoryTotals[category] += transaction.amount;
            } else {
                categoryTotals[category] = transaction.amount;
            }
        });
        
        // Convert to array format for charts
        const result = Object.keys(categoryTotals).map(category => ({
            category: category,
            total: categoryTotals[category]
        }));
        
        // Sort by total (highest first)
        result.sort((a, b) => b.total - a.total);
        
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching income by category',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get current month vs previous month comparison
export const getMonthComparison = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        
        // Current month date range
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        
        // Previous month date range
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        
        // Get current month transactions
        const currentTransactions = await Transaction.find({
            date: { $gte: currentMonthStart, $lte: currentMonthEnd }
        });
        
        // Get previous month transactions
        const previousTransactions = await Transaction.find({
            date: { $gte: previousMonthStart, $lte: previousMonthEnd }
        });
        
        // Calculate current month stats
        const currentIncome = currentTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const currentExpenses = currentTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const currentBalance = currentIncome - currentExpenses;
        
        // Calculate previous month stats
        const previousIncome = previousTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const previousExpenses = previousTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const previousBalance = previousIncome - previousExpenses;
        
        // Calculate percentage changes
        const incomeChange = previousIncome > 0 
            ? ((currentIncome - previousIncome) / previousIncome) * 100 
            : 0;
        
        const expenseChange = previousExpenses > 0 
            ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 
            : 0;
        
        const balanceChange = previousBalance !== 0 
            ? ((currentBalance - previousBalance) / Math.abs(previousBalance)) * 100 
            : 0;
        
        const transactionCountChange = previousTransactions.length > 0
            ? ((currentTransactions.length - previousTransactions.length) / previousTransactions.length) * 100
            : 0;
        
        res.status(200).json({
            current: {
                income: currentIncome,
                expenses: currentExpenses,
                balance: currentBalance,
                transactionCount: currentTransactions.length
            },
            previous: {
                income: previousIncome,
                expenses: previousExpenses,
                balance: previousBalance,
                transactionCount: previousTransactions.length
            },
            changes: {
                income: incomeChange,
                expenses: expenseChange,
                balance: balanceChange,
                transactionCount: transactionCountChange
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching month comparison',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};