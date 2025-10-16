import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Transaction } from '../../models/transaction.model';
import { TransactionService } from '../../services/transaction';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css'
})

export class TransactionList implements OnInit {
  transactions: Transaction[] = [];
  loading: boolean = false;
  error: string | null = null;

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
    console.log('Starting to load transactions...');

    this.transactionService.getAllTransactions().subscribe({
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
}
