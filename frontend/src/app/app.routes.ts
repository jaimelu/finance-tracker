import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionList} from './components/transaction-list/transaction-list';
import { AddTransaction } from './components/add-transaction/add-transaction';
import { Dashboard } from './components/dashboard/dashboard';
import { BudgetManagementComponent } from './components/budget-management/budget-management.component';
import { BudgetOverviewComponent } from './components/budget-overview/budget-overview.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },  
  { path: 'dashboard', component: Dashboard },  
  { path: 'transactions', component: TransactionList },
  { path: 'add', component: AddTransaction },
  { path: 'edit/:id', component: AddTransaction },
  { path: 'budgets', component: BudgetManagementComponent },
  { path: 'budget-overview', component: BudgetOverviewComponent },  
  { path: '**', redirectTo: '/dashboard' },
  
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
