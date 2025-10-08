import mongoose, {Schema, Document, model, Types} from 'mongoose';

// Transaction Interface
interface ITransaction extends Document{
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: Date;
    description?: string;
}

// Mongoose Schema
const TransactionSchema = new Schema<ITransaction>({
    amount: {type: Number, required: true},
    type: {type: String, enum:['income', 'expense'], required: true},
    category: {type: String, required: true},
    date: {type: Date, required: true, default: Date.now,}, 
    description: {type: String, required: false},
}, { timestamps: true})

const Transaction = model<ITransaction>('Transaction', TransactionSchema)

// Explorting Mongoose model
export default Transaction