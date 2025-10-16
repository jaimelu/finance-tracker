import { Routes } from '@angular/router';
import { TransactionList} from './components/transaction-list/transaction-list';
import { AddTransaction } from './components/add-transaction/add-transaction';

export const routes: Routes = [
  { path: '', redirectTo: '/transactions', pathMatch: 'full' },
  { path: 'transactions', component: TransactionList },
  { path: 'add', component: AddTransaction },
  { path: '**', redirectTo: '/transactions' }
];
