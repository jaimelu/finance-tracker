import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetService } from '../../services/budget.service';
import { BudgetStatus, BudgetOverview } from '../../models/budget.model';

@Component({
  selector: 'app-budget-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budget-overview.component.html',
  styleUrls: ['./budget-overview.component.css']
})
export class BudgetOverviewComponent implements OnInit {
  budgetStatuses: BudgetStatus[] = [];
  budgetOverview: BudgetOverview | null = null;
  loading = true;

  constructor(private budgetService: BudgetService) {}

  ngOnInit(): void {
    this.loadBudgetData();
  }

  loadBudgetData(): void {
    this.loading = true;

    // Load budget statuses
    this.budgetService.getBudgetStatus().subscribe({
      next: (statuses) => {
        this.budgetStatuses = statuses;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading budget statuses:', error);
        this.loading = false;
      }
    });

    // Load budget overview
    this.budgetService.getBudgetOverview().subscribe({
      next: (overview) => {
        this.budgetOverview = overview;
      },
      error: (error) => {
        console.error('Error loading budget overview:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'safe':
        return 'status-safe';
      case 'warning':
        return 'status-warning';
      case 'exceeded':
        return 'status-exceeded';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'safe':
        return 'On Track';
      case 'warning':
        return 'Warning';
      case 'exceeded':
        return 'Over Budget';
      default:
        return status;
    }
  }

  getProgressBarColor(status: string): string {
    switch (status) {
      case 'safe':
        return '#4CAF50';
      case 'warning':
        return '#ff9800';
      case 'exceeded':
        return '#f44336';
      default:
        return '#ccc';
    }
  }

  formatCurrency(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }

  getPeriodLabel(period: string): string {
    return period.charAt(0).toUpperCase() + period.slice(1);
  }

  refreshData(): void {
    this.loadBudgetData();
  }
}