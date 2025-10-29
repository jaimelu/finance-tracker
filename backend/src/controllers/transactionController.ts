import Transaction from "../models/Transaction";
import {Request, Response } from "express";

// Get all transactions
export const getAllTransactions = async(req: Request, res: Response) => {
    try {
        // Build filter object from query parameters
        const filter: any = {};
        
        // Filter by type (income or expense)
        if (req.query.type) {
            filter.type = req.query.type;
        }
        
        // Filter by category / categories
        if (req.query.category) {
            const categories = Array.isArray(req.query.category) 
                ? req.query.category 
                : [req.query.category];
            
            if (categories.length > 0) {
                filter.category = { $in: categories };
            }
        }
        
        // Filter by date range
        if (req.query.startDate || req.query.endDate) {
            filter.date = {};
            
            if (req.query.startDate) {
                filter.date.$gte = new Date(req.query.startDate as string);
            }
            
            if (req.query.endDate) {
                filter.date.$lte = new Date(req.query.endDate as string);
            }
        }
        
        // Fetch transactions with filters applied, sorted by date (newest first)
        const transactions = await Transaction.find(filter).sort({date: -1});

        // Return transactions as JSON
        res.status(200).json(transactions);
    } catch (error) {
        // Handle errors
        res.status(500).json({
            message: 'Error fetching transactions',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const getTransactionById = async(req: Request, res: Response) => {
    try{
        // Fetch Transaction with specified ID
        const transaction = await Transaction.findById(req.params.id);

        // Check if transaction exists
        if (!transaction) {
            res.status(404).json({
            message: 'Transaction not found' });
            return;
        }

        // Return as JSON
        res.status(200).json(transaction)
    } catch(error){
        res.status(500).json({
            message: 'Error fetching transaction',
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

export const createTransaction = async(req: Request, res: Response) => {
    try{
        const transaction = new Transaction(req.body)
        await transaction.save()
        res.status(201).json(transaction) // 201 = created
    } catch(error){
        res.status(500).json({
            message: 'Error creating transaction',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const updateTransaction = async(req: Request, res: Response) => {
    try{
        const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {new: true});

        // Check if transaction exists
        if (!transaction) {
            res.status(404).json({
            message: 'Transaction not found' });
            return;
        }

        res.status(200).json(transaction);
    }catch(error){
        res.status(500).json({
            message: 'Error updating transaction',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const deleteTransaction = async(req: Request, res: Response) => {
    try{
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        
        // Check if transaction exists
        if (!transaction) {
            res.status(404).json({
            message: 'Transaction not found' });
            return;
        }
        
        res.status(200).json({
            message: "Transaction deleted sucessfully"
        })
    } catch(error){
        res.status(500).json({
            message: 'Error deleting transaction',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}