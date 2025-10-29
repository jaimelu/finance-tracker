import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Transaction } from '../../models/transaction.model';
import { TransactionService } from '../../services/transaction';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css'
})

export class TransactionList implements OnInit {
  transactions: Transaction[] = [];
  loading: boolean = false;
  error: string | null = null;

  // Filter properties
  filterType: string = 'all';
  selectedCategories: Set<string> = new Set();

  // Available Categories
  categories: string[] = [
    'Salary',
    'Freelance',
    'Investment',
    'Other Income',
    'Rent',
    'Groceries',
    'Dining',
    'Utilities',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Other Expense'
  ]

  constructor(
    private transactionService : TransactionService,
    private cdr: ChangeDetectorRef
  ) {}
   
  // lifecycle method that Angular calls automatically
  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.loading = true;
    console.log('Loading transactions with filters:', {
      type: this.filterType,
      categories: Array.from(this.selectedCategories)
    });

    // Build filter object
    const filters: any = {};
    
    if (this.filterType !== 'all') {
      filters.type = this.filterType;
    }
    
    if (this.selectedCategories.size > 0) {
      filters.categories = Array.from(this.selectedCategories);
    }

    this.transactionService.getAllTransactions(filters).subscribe({
      next: (data) => {
        console.log('Transactions loaded:', data);
        this.transactions = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Error loading:', err);
        this.error = 'Error loading transactions';
        this.loading = false;
        console.error('Error:', err);
        this.cdr.detectChanges();
      }
    });
  }

  // Toggle category section
  toggleCategory(category: string): void {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
    } else {
      this.selectedCategories.add(category);
    }
    this.applyFilters();
  }

  // Check if category is selected
  isCategorySelected(category: string): boolean {
    return this.selectedCategories.has(category);
  }

  // Apply filters when user changes them
  applyFilters(): void {
    this.loadTransactions();
  }

  // Reset Filters
  resetFilters(): void {
    this.filterType = 'all';
    this.selectedCategories.clear();
    this.loadTransactions();
  }

  deleteTransaction(id: string): void {
  if (confirm('Are you sure you want to delete this transaction?')) {
    console.log('Deleting transaction:', id);  
    
    this.transactionService.deleteTransaction(id).subscribe({
      next: () => {
        console.log('Delete successful, refreshing...');  
        this.loadTransactions();
      },
      error: (err) => {
        console.log('Delete error:', err);  
        this.error = 'Error deleting transaction';
        console.error('Error:', err);
      }
    });
  }
}

getTotalIncome(): number {
  return this.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

getTotalExpense(): number {
    return this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpense();
  }

}
