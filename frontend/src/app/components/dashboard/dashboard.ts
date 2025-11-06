import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

interface SummaryStats {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  thisMonth?: {
    income: number;
    expenses: number;
    balance: number;
  };
  lastMonth?: {
    income: number;
    expenses: number;
    balance: number;
  };
  changes?: {
    income: number;
    expenses: number;
    balance: number;
  };
}

interface CategoryData {
    category: string;
    total: number;
}

interface MonthlyTrend {
    month: string;
    income: number;
    expense: number;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
    @ViewChild('spendingChart') spendingChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('trendsChart') trendsChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('incomeChart') incomeChartRef!: ElementRef<HTMLCanvasElement>;

    incomeData: CategoryData[] = [];
    incomeChart: Chart | null = null;
    selectedIncomeTimeFilter: string = 'all';
    customIncomeStartDate: string = '';
    customIncomeEndDate: string = '';

    monthlyTrends: MonthlyTrend[] = []
    trendsChart: Chart | null = null;

    Math = Math;

    stats: SummaryStats = {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0
    };

    categoryData: CategoryData[] = [];
    spendingChart: Chart | null = null;

    loading: boolean = false;
    error: string | null = null;
    viewInitialized: boolean = false;

    // Date filter properties
selectedTimeFilter: string = 'all';
customStartDate: string = '';
customEndDate: string = '';

timeFilterOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'last6Months', label: 'Last 6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

    constructor(private http: HttpClient) { }

    ngOnInit(): void {
        this.loadStats();
        this.loadCategoryData();
        this.loadMonthlyTrends();
        this.loadIncomeData();
    }

    ngAfterViewInit(): void {
        this.viewInitialized = true;

        if (this.categoryData.length > 0) {
            setTimeout(() => this.createSpendingChart(), 0);
        }

        if (this.incomeData.length > 0) {
            setTimeout(() => this.createIncomeChart(), 0);
        }

        if (this.monthlyTrends.length > 0) {
            setTimeout(() => this.createTrendsChart(), 0);
        }
    }

    loadStats(): void {
        this.loading = true;
        this.error = null;

        this.http.get<SummaryStats>('http://localhost:3000/api/analytics/summary')
            .subscribe({
                next: (data) => {
                    this.stats = data;
                    this.loading = false;
                    console.log('Stats loaded:', data);
                },
                error: (err) => {
                    this.error = 'Error loading statistics';
                    this.loading = false;
                    console.error('Error:', err);
                }
            });
    }

   loadCategoryData(): void {
  const dateRange = this.getDateRange();
  let url = 'http://localhost:3000/api/analytics/spending-by-category';
  
  // Add query parameters if date range is specified
  const params = new URLSearchParams();
  if (dateRange.startDate) params.append('startDate', dateRange.startDate);
  if (dateRange.endDate) params.append('endDate', dateRange.endDate);
  
  if (params.toString()) {
    url += '?' + params.toString();
  }
  
  console.log('Loading category data from:', url);

  this.http.get<CategoryData[]>(url)
    .subscribe({
      next: (data) => {
        this.categoryData = data;
        console.log('Category data loaded:', data);
        
        if (this.viewInitialized) {
          setTimeout(() => this.createSpendingChart(), 0);
        }
      },
      error: (err) => {
        console.error('Error loading category data:', err);
      }
    });
}

    createSpendingChart(): void {
        console.log('Attempting to create chart...');
        console.log('Category data length:', this.categoryData.length);
        console.log('Chart ref:', this.spendingChartRef);

        if (this.categoryData.length === 0) {
            console.log('No category data available for chart');
            return;
        }

        if (!this.spendingChartRef) {
            console.log('Chart reference not available yet');
            return;
        }

        const ctx = this.spendingChartRef.nativeElement.getContext('2d');
        if (!ctx) {
            console.log('Could not get canvas context');
            return;
        }

        // Destroy existing chart if it exists
        if (this.spendingChart) {
            this.spendingChart.destroy();
        }

        // Prepare data for chart
        const labels = this.categoryData.map(item => item.category);
        const data = this.categoryData.map(item => item.total);

        console.log('Chart labels:', labels);
        console.log('Chart data:', data);

        // Generate colors for each category
        const backgroundColors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ];

        const config: ChartConfiguration = {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors.slice(0, data.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };

        this.spendingChart = new Chart(ctx, config);
        console.log('Chart created successfully!');
    }

    loadMonthlyTrends(): void {
        this.http.get<MonthlyTrend[]>('http://localhost:3000/api/analytics/monthly-trends')
            .subscribe({
                next: (data) => {
                    this.monthlyTrends = data;
                    console.log('Monthly trends loaded:', data);

                    if (this.viewInitialized) {
                        setTimeout(() => this.createTrendsChart(), 0);
                    }
                },
                error: (err) => {
                    console.error('Error loading monthly trends:', err);
                }
            });
    }

    createTrendsChart(): void {
        console.log('Attempting to create trends chart...');

        if (this.monthlyTrends.length === 0) {
            console.log('No monthly trend data available');
            return;
        }

        if (!this.trendsChartRef) {
            console.log('Trends chart reference not available yet');
            return;
        }

        const ctx = this.trendsChartRef.nativeElement.getContext('2d');
        if (!ctx) return;

        if (this.trendsChart) {
            this.trendsChart.destroy();
        }

        // Format month labels (e.g., "2024-10" -> "Oct 2024")
        const labels = this.monthlyTrends.map(item => {
            const [year, month] = item.month.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });

        const incomeData = this.monthlyTrends.map(item => item.income);
        const expenseData = this.monthlyTrends.map(item => item.expense);

        const config: ChartConfiguration = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y || 0;
                                return `${label}: $${value.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => '$' + value
                        }
                    }
                }
            }
        };

        this.trendsChart = new Chart(ctx, config);
        console.log('Trends chart created successfully!');
    }

    getDateRange(): { startDate?: string, endDate?: string } {
  const today = new Date();
  const result: { startDate?: string, endDate?: string } = {};

  

  switch (this.selectedTimeFilter) {
    case 'all':
      // No date filter
      break;

    case 'thisMonth':
      result.startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      result.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      break;

    case 'lastMonth':
      result.startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
      result.endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
      break;

    case 'last3Months':
      result.startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().split('T')[0];
      result.endDate = today.toISOString().split('T')[0];
      break;

    case 'last6Months':
      result.startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1).toISOString().split('T')[0];
      result.endDate = today.toISOString().split('T')[0];
      break;

    case 'thisYear':
      result.startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      result.endDate = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
      break;

    case 'lastYear':
      result.startDate = new Date(today.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
      result.endDate = new Date(today.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
      break;

    case 'custom':
      if (this.customStartDate) result.startDate = this.customStartDate;
      if (this.customEndDate) result.endDate = this.customEndDate;
      break;
  }

  return result;
}

onTimeFilterChange(): void {
  console.log('Time filter changed to:', this.selectedTimeFilter);
  this.loadCategoryData();
  this.loadIncomeData();
}

loadIncomeData(): void {
  const dateRange = this.getDateRange();
  let url = 'http://localhost:3000/api/analytics/income-by-category';
  
  // Add query parameters if date range is specified
  const params = new URLSearchParams();
  if (dateRange.startDate) params.append('startDate', dateRange.startDate);
  if (dateRange.endDate) params.append('endDate', dateRange.endDate);
  
  if (params.toString()) {
    url += '?' + params.toString();
  }
  
  console.log('Loading income data from:', url);

  this.http.get<CategoryData[]>(url)
    .subscribe({
      next: (data) => {
        this.incomeData = data;
        console.log('Income data loaded:', data);
        
        if (this.viewInitialized) {
          setTimeout(() => this.createIncomeChart(), 0);
        }
      },
      error: (err) => {
        console.error('Error loading income data:', err);
      }
    });
}

createIncomeChart(): void {
  console.log('Attempting to create income chart...');
  
  if (this.incomeData.length === 0) {
    console.log('No income data available');
    return;
  }

  if (!this.incomeChartRef) {
    console.log('Income chart reference not available yet');
    return;
  }

  const ctx = this.incomeChartRef.nativeElement.getContext('2d');
  if (!ctx) return;

  if (this.incomeChart) {
    this.incomeChart.destroy();
  }

  // Prepare data for chart
  const labels = this.incomeData.map(item => item.category);
  const data = this.incomeData.map(item => item.total);
  
  console.log('Income chart labels:', labels);
  console.log('Income chart data:', data);
  
  // Generate green-themed colors for income
  const backgroundColors = [
    '#28a745', '#20c997', '#17a2b8', '#6610f2', '#6f42c1',
    '#fd7e14', '#ffc107', '#198754', '#0dcaf0', '#6c757d'
  ];

  const config: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors.slice(0, data.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 15,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: $${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  };

  this.incomeChart = new Chart(ctx, config);
  console.log('Income chart created successfully!');
}

getFilterLabel(): string {
  const option = this.timeFilterOptions.find(opt => opt.value === this.selectedTimeFilter);
  
  if (this.selectedTimeFilter === 'custom' && this.customStartDate && this.customEndDate) {
    return `${this.customStartDate} to ${this.customEndDate}`;
  }
  
  return option ? option.label : 'All Time';
}

getChangeIcon(change: number): string {
  if (change > 0) return '↑';
  if (change < 0) return '↓';
  return '→';
}

getChangeClass(change: number, isExpense: boolean = false): string {
  // For expenses, increase is bad (red), decrease is good (green)
  // For income and balance, increase is good (green), decrease is bad (red)
  
  if (change === 0) return 'text-secondary';
  
  if (isExpense) {
    return change > 0 ? 'text-danger' : 'text-success';
  } else {
    return change > 0 ? 'text-success' : 'text-danger';
  }
}

hasChangeData(): boolean {
  return !!this.stats.changes;
}


}
