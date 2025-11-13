// might delete this page

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, BudgetStatus } from '../models/budget.model';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = 'http://localhost:3000/api/budgets';

  constructor(private http: HttpClient) {}

  // Get all budgets (optionally filtered by month/year)
  getAllBudgets(month?: number, year?: number): Observable<Budget[]> {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toString());
    if (year) params = params.set('year', year.toString());
    
    return this.http.get<Budget[]>(this.apiUrl, { params });
  }

  // Get budget status (actual spending vs budget)
  getBudgetStatus(month: number, year: number): Observable<BudgetStatus[]> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());
    
    return this.http.get<BudgetStatus[]>(`${this.apiUrl}/status`, { params });
  }

  // Get single budget by ID
  getBudgetById(id: string): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`);
  }

  // Create new budget
  createBudget(budget: Budget): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, budget);
  }

  // Update existing budget
  updateBudget(id: string, budget: Budget): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/${id}`, budget);
  }

  // Delete budget
  deleteBudget(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}