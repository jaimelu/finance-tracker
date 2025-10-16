import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Transaction } from '../../models/transaction.model';
import { TransactionService } from '../../services/transaction';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-transaction.html',
  styleUrl: './add-transaction.css'
})
export class AddTransaction {
  transaction: Transaction = {
    amount: 0,
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    description: ''
  };

  loading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private transactionService: TransactionService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Reset messages
    this.error = null;
    this.successMessage = null;

    // Validation
    if (!this.transaction.amount || this.transaction.amount <= 0) {
      this.error = 'Please enter a valid amount';
      return;
    }

    if (!this.transaction.category) {
      this.error = 'Please select a category';
      return;
    }

    if (!this.transaction.date) {
      this.error = 'Please select a date';
      return;
    }

    // Create transaction
    this.loading = true;
    this.transactionService.createTransaction(this.transaction).subscribe({
      next: (response) => {
        this.successMessage = 'Transaction added successfully!';
        this.loading = false;
        
        // Reset form
        this.transaction = {
          amount: 0,
          type: 'expense',
          category: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        };

        // Optional: Navigate to transactions list after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/transactions']);
        }, 2000);
      },
      error: (err) => {
        this.error = 'Error creating transaction. Please try again.';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }
}