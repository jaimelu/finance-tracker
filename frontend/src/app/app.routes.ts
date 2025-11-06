import { Routes } from '@angular/router';
import { TransactionList} from './components/transaction-list/transaction-list';
import { AddTransaction } from './components/add-transaction/add-transaction';
import { Dashboard } from './components/dashboard/dashboard'

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },  
  { path: 'dashboard', component: Dashboard },  
  { path: 'transactions', component: TransactionList },
  { path: 'add', component: AddTransaction },
  { path: 'edit/:id', component: AddTransaction },
  { path: '**', redirectTo: '/dashboard' }  
];
