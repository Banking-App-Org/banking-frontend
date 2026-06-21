import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { UserDetailComponent } from './users/user-detail.component';
import { BankAccountsComponent } from './accounts/bank-accounts.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { PaymentsComponent } from './payments/payments.component';

export const routes: Routes = [
  { path: '',           redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard',  component: DashboardComponent },
  { path: 'users',      component: UsersComponent },
  { path: 'users/:id',  component: UserDetailComponent },
  { path: 'accounts',   component: BankAccountsComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'payments',   component: PaymentsComponent },
];
