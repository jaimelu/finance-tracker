export interface Transaction {
  _id?: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string | Date;
  description?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}