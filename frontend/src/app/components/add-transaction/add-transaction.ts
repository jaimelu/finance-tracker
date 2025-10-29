import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Transaction } from '../../models/transaction.model';
import { TransactionService } from '../../services/transaction';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-transaction.html',
  styleUrl: './add-transaction.css'
})
export class AddTransaction implements OnInit {
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
  
  // Edit mode properties
  isEditMode: boolean = false;
  transactionId: string | null = null;

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute  // Add ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode by looking for an ID in the route
    this.transactionId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.transactionId;
    
    if (this.isEditMode && this.transactionId) {
      this.loadTransaction(this.transactionId);
    }
  }

  loadTransaction(id: string): void {
    this.loading = true;
    this.transactionService.getTransactionById(id).subscribe({
      next: (transaction) => {
        // Populate form with transaction data
        this.transaction = {
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: new Date(transaction.date).toISOString().split('T')[0],
          description: transaction.description || ''
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading transaction. Please try again.';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

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

    this.loading = true;

    if (this.isEditMode && this.transactionId) {
      // Update existing transaction
      this.transactionService.updateTransaction(this.transactionId, this.transaction).subscribe({
        next: (response) => {
          this.successMessage = 'Transaction updated successfully!';
          this.loading = false;
          
          // Navigate to transactions list after 1.5 seconds
          setTimeout(() => {
            this.router.navigate(['/transactions']);
          }, 1500);
        },
        error: (err) => {
          this.error = 'Error updating transaction. Please try again.';
          this.loading = false;
          console.error('Error:', err);
        }
      });
    } else {
      // Create new transaction
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

          // Navigate to transactions list after 2 seconds
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
}