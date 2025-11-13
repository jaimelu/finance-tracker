import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import { Budget } from '../../models/budget.model';

@Component({
  selector: 'app-budget-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budget-management.component.html',
  styleUrls: ['./budget-management.component.css']
})
export class BudgetManagementComponent implements OnInit {
  budgets: Budget[] = [];
  budgetForm: FormGroup;
  isEditing = false;
  editingBudgetId: string | null = null;
  showForm = false;

  categories = [
    'Groceries',
    'Rent',
    'Utilities',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Dining Out',
    'Shopping',
    'Other'
  ];

  periods: Array<'monthly' | 'quarterly' | 'yearly'> = ['monthly', 'quarterly', 'yearly'];

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService
  ) {
    this.budgetForm = this.fb.group({
      category: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      period: ['monthly', Validators.required],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.budgetService.getAllBudgets().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
      },
      error: (error) => {
        console.error('Error loading budgets:', error);
        alert('Failed to load budgets');
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  onSubmit(): void {
  if (this.budgetForm.valid) {
    const budgetData = this.budgetForm.value;

    if (this.isEditing && this.editingBudgetId) {
      // Update existing budget
      this.budgetService.updateBudget(this.editingBudgetId, budgetData).subscribe({
        next: (updatedBudget) => {
          // Find and update the budget in the array
          const index = this.budgets.findIndex(b => b._id === this.editingBudgetId);
          if (index !== -1) {
            this.budgets[index] = updatedBudget;
          }
          
          alert('Budget updated successfully!');
          this.resetForm();
        },
        error: (error) => {
          console.error('Error updating budget:', error);
          alert('Failed to update budget');
        }
      });
    } else {
      // Create new budget
      this.budgetService.createBudget(budgetData).subscribe({
        next: (newBudget) => {
          // Add the new budget to the array immediately
          this.budgets.push(newBudget);
          
          alert('Budget created successfully!');
          this.resetForm();
        },
        error: (error) => {
          console.error('Error creating budget:', error);
          alert('Failed to create budget');
        }
      });
    }
  }
}

  editBudget(budget: Budget): void {
    this.isEditing = true;
    this.editingBudgetId = budget._id || null;
    this.showForm = true;

    // Format date for input field
    const startDate = new Date(budget.startDate);
    const formattedDate = startDate.toISOString().split('T')[0];

    this.budgetForm.patchValue({
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
      startDate: formattedDate,
      isActive: budget.isActive
    });
  }

  deleteBudget(id: string | undefined): void {
  if (!id) return;
  if (confirm('Are you sure you want to delete this budget?')) {
    this.budgetService.deleteBudget(id).subscribe({
      next: () => {
        // Remove the budget from the array immediately
        this.budgets = this.budgets.filter(b => b._id !== id);
        
        alert('Budget deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting budget:', error);
        alert('Failed to delete budget');
      }
    });
  }
}

  resetForm(): void {
    this.budgetForm.reset({
      category: '',
      amount: 0,
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
    this.isEditing = false;
    this.editingBudgetId = null;
    this.showForm = false;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }

  getPeriodLabel(period: string): string {
    return period.charAt(0).toUpperCase() + period.slice(1);
  }
}