import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface User {
  id?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BankAccount {
  id?: number;
  userId?: number;
  accountNumber?: string;
  accountType?: string;
  balance?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id?: number;
  accountId?: number;
  type?: string;
  amount?: number;
  currency?: string;
  description?: string;
  referenceId?: string;
  status?: string;
  createdAt?: string;
}

export interface Payment {
  id?: number;
  userId?: number;
  accountId?: number;
  payee?: string;
  amount?: number;
  currency?: string;
  status?: string;
  scheduledDate?: string;
  processedAt?: string;
  createdAt?: string;
}

export interface BankingStats {
  totalEvents: number;
  deliveredCount: number;
  failedCount: number;
  retryingCount: number;
}

export interface GenerateStatus {
  state: string;
  total?: number;
  concurrency?: number;
  completed?: number;
  failed?: number;
  progressPercent?: string;
  throughputPerSecond?: string;
  elapsedMs?: number;
  errorMessage?: string;
  message?: string;
}

export interface ResendStatus {
  state: string;
  limit?: number;
  actual?: number;
  sent?: number;
  failed?: number;
  progressPercent?: string;
  throughputPerSecond?: string;
  elapsedMs?: number;
  errorMessage?: string;
  message?: string;
}

const MAIN_API = `${environment.apiUrl}/api/users`;
const ACCOUNTS_API = `${environment.apiUrl}/api/accounts`;
const TRANSACTIONS_API = `${environment.apiUrl}/api/transactions`;
const PAYMENTS_API = `${environment.apiUrl}/api/payments`;
const NOTIFICATIONS_API = `${environment.apiUrl}/api/notifications`;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  // --- User Management ---
  registerUser(user: any): Observable<User> {
    return this.http.post<User>(`${MAIN_API}/register`, user);
  }

  getUser(id: string | number): Observable<User> {
    return this.http.get<User>(`${MAIN_API}/${id}`);
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${MAIN_API}/username/${username}`);
  }

  updateUser(id: string | number, user: User): Observable<User> {
    return this.http.put<User>(`${MAIN_API}/${id}`, user);
  }

  deleteUser(id: string | number): Observable<void> {
    return this.http.delete<void>(`${MAIN_API}/${id}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(MAIN_API);
  }

  getAllAccounts(): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(ACCOUNTS_API);
  }

  // --- Bank Account Operations ---
  openAccount(userId: number, accountType: string): Observable<BankAccount> {
    return this.http.post<BankAccount>(ACCOUNTS_API, { userId: userId.toString(), accountType });
  }

  getAccount(id: number): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${ACCOUNTS_API}/${id}`);
  }

  getUserAccounts(userId: number): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${ACCOUNTS_API}/user/${userId}`);
  }

  deposit(accountId: number, amount: number, description: string): Observable<BankAccount> {
    return this.http.post<BankAccount>(`${ACCOUNTS_API}/${accountId}/deposit`, { amount: amount.toString(), description });
  }

  withdraw(accountId: number, amount: number, description: string): Observable<BankAccount> {
    return this.http.post<BankAccount>(`${ACCOUNTS_API}/${accountId}/withdraw`, { amount: amount.toString(), description });
  }

  transfer(fromAccountId: number, toAccountId: number, amount: number): Observable<void> {
    return this.http.post<void>(`${ACCOUNTS_API}/transfer`, {
      fromAccountId: fromAccountId.toString(),
      toAccountId: toAccountId.toString(),
      amount: amount.toString()
    });
  }

  // --- Transactions ---
  getTransactionsByAccount(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${TRANSACTIONS_API}/account/${accountId}`);
  }

  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(TRANSACTIONS_API);
  }

  // --- Payments ---
  submitPayment(userId: number, accountId: number, payee: string, amount: number): Observable<Payment> {
    return this.http.post<Payment>(PAYMENTS_API, {
      userId: userId.toString(),
      accountId: accountId.toString(),
      payee,
      amount: amount.toString()
    });
  }

  schedulePayment(userId: number, accountId: number, payee: string, amount: number, scheduledDate: string): Observable<Payment> {
    return this.http.post<Payment>(`${PAYMENTS_API}/schedule`, {
      userId: userId.toString(),
      accountId: accountId.toString(),
      payee,
      amount: amount.toString(),
      scheduledDate
    });
  }

  getUserPayments(userId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${PAYMENTS_API}/user/${userId}`);
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(PAYMENTS_API);
  }

  // --- Stats & Events ---
  getStats(): Observable<BankingStats> {
    return this.http.get<BankingStats>(`${NOTIFICATIONS_API}/events/stats`);
  }

  generateNotifications(count: number, concurrency: number): Observable<any> {
    return this.http.post(`${NOTIFICATIONS_API}/test/bulk`, null, { params: { count, concurrency } });
  }

  getGenerateStatus(): Observable<GenerateStatus> {
    return this.http.get<GenerateStatus>(`${NOTIFICATIONS_API}/test/bulk/status`);
  }

  startResend(limit: number): Observable<any> {
    return this.http.post(`${NOTIFICATIONS_API}/resend/start`, null, { params: { limit } });
  }

  getResendStatus(): Observable<ResendStatus> {
    return this.http.get<ResendStatus>(`${NOTIFICATIONS_API}/resend/status`);
  }

  sendNotification(data: {
    userId: string;
    email: string;
    eventType: string;
    firstName?: string;
    amount?: number;
    currency?: string;
    accountNumber?: string;
  }): Observable<any> {
    return this.http.post(`${NOTIFICATIONS_API}/test/send-notification`, data);
  }

  triggerUserRegistered(userId: string): Observable<any> {
    return this.http.post(`${NOTIFICATIONS_API}/test/user-registered`, { userId });
  }

  triggerDeposit(userId: string, amount: string): Observable<any> {
    return this.http.post(`${NOTIFICATIONS_API}/test/deposit`, { userId, amount });
  }

  triggerWithdrawal(userId: string, amount: string): Observable<any> {
    return this.http.post(`${NOTIFICATIONS_API}/test/withdrawal`, { userId, amount });
  }

  triggerTransfer(userId: string, amount: string): Observable<any> {
    return this.http.post(`${NOTIFICATIONS_API}/test/transfer`, { userId, amount });
  }

  triggerPayment(userId: string, amount: string): Observable<any> {
    return this.http.post(`${NOTIFICATIONS_API}/test/payment`, { userId, amount });
  }
}
