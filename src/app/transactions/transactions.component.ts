import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, Transaction } from '../notification.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Transactions</h1>
          <p class="page-sub">All transactions across all accounts.</p>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="load()">↺ Refresh</button>
      </div>

      <div class="msg error" *ngIf="error">{{ error }}</div>

      <div class="card">
        <div class="table-toolbar">
          <input class="search-input" [(ngModel)]="search" placeholder="Search by type, description, reference…" />
          <select class="filter-select" [(ngModel)]="typeFilter">
            <option value="">All types</option>
            <option>DEPOSIT</option>
            <option>WITHDRAWAL</option>
            <option>TRANSFER</option>
          </select>
          <span class="count">{{ filtered.length }} transactions</span>
        </div>

        <div class="empty-state" *ngIf="filtered.length === 0 && !loading">
          {{ transactions.length === 0 ? 'No transactions yet.' : 'No transactions match your filter.' }}
        </div>

        <table class="data-table" *ngIf="filtered.length > 0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Account ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let tx of filtered">
              <td class="muted">{{ tx.createdAt | date:'short' }}</td>
              <td class="muted">{{ tx.accountId }}</td>
              <td><span class="tx-type" [class]="'tx-' + tx.type?.toLowerCase()">{{ tx.type }}</span></td>
              <td class="muted">{{ tx.description || '—' }}</td>
              <td [class.pos]="tx.amount! > 0" [class.neg]="tx.amount! < 0" class="bold">
                {{ tx.amount! > 0 ? '+' : '' }}{{ tx.amount | currency }}
              </td>
              <td class="muted">{{ tx.currency }}</td>
              <td class="muted">{{ tx.status }}</td>
              <td class="mono muted">{{ tx.referenceId ? tx.referenceId.substring(0, 8) + '…' : '—' }}</td>
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

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table thead { background: #0f172a; }
    .data-table th { padding: 10px 12px; text-align: left; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #334155; }
    .data-table td { padding: 11px 12px; border-bottom: 1px solid #1e293b; font-size: 13px; color: #e2e8f0; }
    .data-table tbody tr:last-child td { border-bottom: none; }
    .data-table tbody tr:hover { background: #0f172a40; }

    .bold { font-weight: 600; }
    .muted { color: #64748b; }
    .mono { font-family: monospace; }
    .pos { color: #22c55e; }
    .neg { color: #ef4444; }

    .tx-type { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 2px 7px; border-radius: 4px; }
    .tx-deposit    { background: #052e1640; color: #86efac; }
    .tx-withdrawal { background: #45190040; color: #fcd34d; }
    .tx-transfer   { background: #1e3a5f40; color: #93c5fd; }

    .empty-state { text-align: center; padding: 48px 0; color: #475569; font-size: 14px; }

    .btn { padding: 8px 14px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; }
    .btn-ghost { background: transparent; color: #64748b; border: 1px solid #334155; }
    .btn-ghost:hover { color: #94a3b8; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
  `]
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  search = '';
  typeFilter = '';
  loading = false;
  error = '';

  constructor(private svc: NotificationService) {}
  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.svc.getAllTransactions().subscribe({
      next: txs => { this.transactions = txs; this.loading = false; },
      error: () => { this.error = 'Failed to load transactions'; this.loading = false; }
    });
  }

  get filtered(): Transaction[] {
    return this.transactions.filter(tx => {
      const q = this.search.toLowerCase();
      const matchesSearch = !q ||
        tx.type?.toLowerCase().includes(q) ||
        tx.description?.toLowerCase().includes(q) ||
        tx.referenceId?.toLowerCase().includes(q);
      const matchesType = !this.typeFilter || tx.type === this.typeFilter;
      return matchesSearch && matchesType;
    });
  }
}
