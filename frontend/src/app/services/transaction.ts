import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})

export class TransactionService {
  private apiUrl = 'http://localhost:3000/api/transactions'

  constructor(private http: HttpClient) {}

  getAllTransactions(filters: {
    type?: string;
    categories?: string[];
    startDate?: string;
    endDate?: string;
  }): Observable<Transaction[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.type) {
        params = params.set('type', filters.type);
      }
      if (filters.categories && filters.categories.length > 0) {
        filters.categories.forEach(category => {
          params = params.append('category', category);
        });
      }
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate);
      }
    }
    
    return this.http.get<Transaction[]>(this.apiUrl, { params }); 
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  createTransaction(transaction: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  updateTransaction(id: string, transaction: Transaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, transaction)
  }

  deleteTransaction(id: string): Observable<any> {
    return this.http.delete<Transaction>(`${this.apiUrl}/${id}`);
  }



}


