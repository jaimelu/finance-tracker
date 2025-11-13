import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, BudgetStatus, BudgetOverview } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = 'http://localhost:3000/api/budgets';

  constructor(private http: HttpClient) {}

  // Get all budgets
  getAllBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  // Get budget by ID
  getBudgetById(id: string): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`);
  }

  // Create new budget
  createBudget(budget: Budget): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, budget);
  }

  // Update budget
  updateBudget(id: string, budget: Partial<Budget>): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/${id}`, budget);
  }

  // Delete budget
  deleteBudget(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Get budget status for all categories
  getBudgetStatus(): Observable<BudgetStatus[]> {
    return this.http.get<BudgetStatus[]>(`${this.apiUrl}/status/all`);
  }

  // Get budget overview summary
  getBudgetOverview(): Observable<BudgetOverview> {
    return this.http.get<BudgetOverview>(`${this.apiUrl}/overview/summary`);
  }

  // Get budget for specific category
  getCategoryBudget(category: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/category/${category}`);
  }
}