import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService, Payment } from '../notification.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Payments</h1>
          <p class="page-sub">All payments across all users.</p>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="load()">↺ Refresh</button>
      </div>

      <div class="msg error" *ngIf="error">{{ error }}</div>

      <div class="card">
        <div class="table-toolbar">
          <input class="search-input" [(ngModel)]="search" placeholder="Search by payee…" />
          <select class="filter-select" [(ngModel)]="statusFilter">
            <option value="">All statuses</option>
            <option>PROCESSED</option>
            <option>PENDING</option>
            <option>FAILED</option>
          </select>
          <span class="count">{{ filtered.length }} payments</span>
        </div>

        <div class="summary-row" *ngIf="payments.length > 0">
          <div class="summary-item">
            <span class="summary-label">Total Paid</span>
            <span class="summary-value">{{ totalAmount | currency }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Processed</span>
            <span class="summary-value green">{{ statusCount('PROCESSED') }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Pending</span>
            <span class="summary-value yellow">{{ statusCount('PENDING') }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Failed</span>
            <span class="summary-value red">{{ statusCount('FAILED') }}</span>
          </div>
        </div>

        <div class="empty-state" *ngIf="filtered.length === 0 && !loading">
          {{ payments.length === 0 ? 'No payments yet.' : 'No payments match your filter.' }}
        </div>

        <table class="data-table" *ngIf="filtered.length > 0">
          <thead>
            <tr>
              <th>Date</th>
              <th>User ID</th>
              <th>Payee</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Processed At</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filtered">
              <td class="muted">{{ p.createdAt | date:'short' }}</td>
              <td class="muted">{{ p.userId }}</td>
              <td class="bold">{{ p.payee }}</td>
              <td class="bold">{{ p.amount | currency }}</td>
              <td class="muted">{{ p.currency }}</td>
              <td>
                <span class="badge"
                  [class.badge-green]="p.status === 'PROCESSED'"
                  [class.badge-yellow]="p.status === 'PENDING'"
                  [class.badge-red]="p.status === 'FAILED'">
                  {{ p.status }}
                </span>
              </td>
              <td class="muted">{{ p.processedAt ? (p.processedAt | date:'short') : '—' }}</td>
              <td><button class="btn btn-sm btn-ghost" (click)="viewUser(p.userId!)">View User →</button></td>
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

    .msg.error { background: #450a0a60; border: 1px solid #ef4444; color: #fca5a5; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; }

    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; }
    .table-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
    .search-input { flex: 1; min-width: 200px; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #e2e8f0; font-size: 14px; outline: none; }
    .search-input:focus { border-color: #3b82f6; }
    .filter-select { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #e2e8f0; font-size: 14px; outline: none; }
    .count { font-size: 12px; color: #64748b; white-space: nowrap; }

    .summary-row { display: flex; gap: 24px; padding: 12px 0; margin-bottom: 12px; border-bottom: 1px solid #334155; flex-wrap: wrap; }
    .summary-item { display: flex; flex-direction: column; gap: 2px; }
    .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; }
    .summary-value { font-size: 16px; font-weight: 700; color: #f1f5f9; }
    .summary-value.green  { color: #22c55e; }
    .summary-value.yellow { color: #f59e0b; }
    .summary-value.red    { color: #ef4444; }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table thead { background: #0f172a; }
    .data-table th { padding: 10px 12px; text-align: left; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #334155; }
    .data-table td { padding: 12px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #e2e8f0; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table tbody tr:hover { background: #0f172a40; }

    .bold { font-weight: 600; }
    .muted { color: #64748b; }

    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge-green  { background: #052e1660; color: #86efac; border: 1px solid #22c55e40; }
    .badge-yellow { background: #45190060; color: #fcd34d; border: 1px solid #f59e0b40; }
    .badge-red    { background: #450a0a60; color: #fca5a5; border: 1px solid #ef444440; }

    .empty-state { text-align: center; padding: 48px 0; color: #475569; font-size: 14px; }

    .btn { padding: 8px 14px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.15s; }
    .btn-ghost { background: transparent; color: #64748b; border: 1px solid #334155; }
    .btn-ghost:hover { color: #94a3b8; border-color: #475569; }
    .btn-sm { padding: 5px 10px; font-size: 12px; }
  `]
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  search = '';
  statusFilter = '';
  loading = false;
  error = '';

  constructor(private svc: NotificationService, private router: Router) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getAllPayments().subscribe({
      next: p => { this.payments = p; this.loading = false; },
      error: () => { this.error = 'Failed to load payments'; this.loading = false; }
    });
  }

  get filtered(): Payment[] {
    return this.payments.filter(p => {
      const q = this.search.toLowerCase();
      const matchesSearch = !q || p.payee?.toLowerCase().includes(q);
      const matchesStatus = !this.statusFilter || p.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  get totalAmount(): number { return this.payments.filter(p => p.status === 'PROCESSED').reduce((s, p) => s + (p.amount || 0), 0); }
  statusCount(s: string): number { return this.payments.filter(p => p.status === s).length; }
  viewUser(userId: number) { this.router.navigate(['/users', userId]); }
}
