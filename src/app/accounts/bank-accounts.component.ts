import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService, BankAccount } from '../notification.service';

@Component({
  selector: 'app-bank-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Accounts</h1>
          <p class="page-sub">All bank accounts across all users.</p>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="load()">↺ Refresh</button>
      </div>

      <div class="msg error" *ngIf="error">{{ error }}</div>

      <div class="card">
        <div class="table-toolbar">
          <input class="search-input" [(ngModel)]="search" placeholder="Search by account number, type or status…" />
          <span class="count">{{ filtered.length }} accounts</span>
        </div>

        <div class="summary-row" *ngIf="filtered.length > 0">
          <div class="summary-item">
            <span class="summary-label">Total Balance</span>
            <span class="summary-value">{{ totalBalance | currency }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Active</span>
            <span class="summary-value green">{{ activeCount }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Checking</span>
            <span class="summary-value">{{ typeCount('CHECKING') }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Savings</span>
            <span class="summary-value">{{ typeCount('SAVINGS') }}</span>
          </div>
        </div>

        <div class="empty-state" *ngIf="filtered.length === 0 && !loading">
          {{ accounts.length === 0 ? 'No accounts found.' : 'No accounts match your search.' }}
        </div>

        <table class="data-table" *ngIf="filtered.length > 0">
          <thead>
            <tr>
              <th>Account Number</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Currency</th>
              <th>Status</th>
              <th>User ID</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of filtered">
              <td class="mono">{{ a.accountNumber }}</td>
              <td>{{ a.accountType }}</td>
              <td class="bold green">{{ a.balance | currency }}</td>
              <td class="muted">{{ a.currency }}</td>
              <td><span class="badge" [class.badge-green]="a.status === 'ACTIVE'" [class.badge-gray]="a.status !== 'ACTIVE'">{{ a.status }}</span></td>
              <td class="muted">{{ a.userId }}</td>
              <td class="muted">{{ a.createdAt | date:'mediumDate' }}</td>
              <td><button class="btn btn-sm btn-ghost" (click)="viewUser(a.userId!)">View User →</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .page-title { font-size: 28px; font-weight: 700; color: #f1f5f9; }
    .page-sub { color: #64748b; margin-top: 4px; font-size: 14px; }

    .msg { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
    .msg.error { background: #450a0a60; border: 1px solid #ef4444; color: #fca5a5; }

    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; }
    .table-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .search-input { flex: 1; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #e2e8f0; font-size: 14px; outline: none; }
    .search-input:focus { border-color: #3b82f6; }
    .count { font-size: 12px; color: #64748b; white-space: nowrap; }

    .summary-row { display: flex; gap: 24px; padding: 12px 0; margin-bottom: 12px; border-bottom: 1px solid #334155; flex-wrap: wrap; }
    .summary-item { display: flex; flex-direction: column; gap: 2px; }
    .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
    .summary-value { font-size: 16px; font-weight: 700; color: #f1f5f9; }
    .summary-value.green { color: #22c55e; }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table thead { background: #0f172a; }
    .data-table th { padding: 10px 12px; text-align: left; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #334155; }
    .data-table td { padding: 12px; border-bottom: 1px solid #1e293b; font-size: 14px; color: #e2e8f0; }
    .data-table tbody tr:last-child td { border-bottom: none; }

    .bold { font-weight: 600; }
    .green { color: #22c55e; }
    .muted { color: #64748b; font-size: 13px; }
    .mono { font-family: monospace; font-size: 13px; }

    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge-green { background: #052e1660; color: #86efac; border: 1px solid #22c55e40; }
    .badge-gray  { background: #1e293b; color: #64748b; border: 1px solid #334155; }

    .empty-state { text-align: center; padding: 48px 0; color: #475569; font-size: 14px; }

    .btn { padding: 8px 14px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.15s; }
    .btn-ghost { background: transparent; color: #64748b; border: 1px solid #334155; }
    .btn-ghost:hover { color: #94a3b8; border-color: #475569; }
    .btn-sm { padding: 5px 10px; font-size: 12px; }
  `]
})
export class BankAccountsComponent implements OnInit {
  accounts: BankAccount[] = [];
  search = '';
  loading = false;
  error = '';

  constructor(private svc: NotificationService, private router: Router) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getAllAccounts().subscribe({
      next: a => { this.accounts = a; this.loading = false; },
      error: () => { this.error = 'Failed to load accounts'; this.loading = false; }
    });
  }

  get filtered(): BankAccount[] {
    const q = this.search.toLowerCase();
    if (!q) return this.accounts;
    return this.accounts.filter(a =>
      a.accountNumber?.toLowerCase().includes(q) ||
      a.accountType?.toLowerCase().includes(q) ||
      a.status?.toLowerCase().includes(q)
    );
  }

  get totalBalance(): number { return this.accounts.reduce((s, a) => s + (a.balance || 0), 0); }
  get activeCount(): number { return this.accounts.filter(a => a.status === 'ACTIVE').length; }
  typeCount(type: string): number { return this.accounts.filter(a => a.accountType === type).length; }

  viewUser(userId: number) { this.router.navigate(['/users', userId]); }
}
