import mongoose, { Schema, Document, model } from 'mongoose';

// Budget Interface
interface IBudget extends Document {
    category: string;
    amount: number;
    period: 'monthly' | 'quarterly' | 'yearly';
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
}

// Mongoose Schema
const BudgetSchema = new Schema<IBudget>({
    category: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    period: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        required: true,
        default: 'monthly'
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Calculate endDate based on period before saving
BudgetSchema.pre('save', function(next) {
    if (!this.endDate) {
        const start = new Date(this.startDate);
        const end = new Date(start);
        
        switch(this.period) {
            case 'monthly':
                end.setMonth(end.getMonth() + 1);
                break;
            case 'quarterly':
                end.setMonth(end.getMonth() + 3);
                break;
            case 'yearly':
                end.setFullYear(end.getFullYear() + 1);
                break;
        }
        
        this.endDate = end;
    }
    next();
});

const Budget = model<IBudget>('Budget', BudgetSchema);

export default Budget;