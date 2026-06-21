import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificationService, BankingStats } from '../notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-sub">System overview and event controls.</p>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="loadStats()">↺ Refresh</button>
      </div>

      <div class="msg error" *ngIf="error">{{ error }}</div>

      <div class="stats-grid" *ngIf="stats">
        <div class="stat-card">
          <div class="stat-value">{{ stats.totalEvents }}</div>
          <div class="stat-label">Total Events</div>
        </div>
        <div class="stat-card green">
          <div class="stat-value">{{ stats.deliveredCount }}</div>
          <div class="stat-label">Delivered</div>
        </div>
        <div class="stat-card red">
          <div class="stat-value">{{ stats.failedCount }}</div>
          <div class="stat-label">Failed</div>
        </div>
        <div class="stat-card yellow">
          <div class="stat-value">{{ stats.retryingCount }}</div>
          <div class="stat-label">Retrying</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Trigger Test Events</h2>
          <div class="form-group">
            <label>User ID</label>
            <input [(ngModel)]="eventUserId" placeholder="e.g. 1" style="width:120px" />
          </div>
        </div>
        <div class="event-grid">
          <button class="event-btn blue" (click)="trigger('user-registered')" [disabled]="loading">
            <span class="event-icon">👤</span>
            <span class="event-name">User Registered</span>
          </button>
          <button class="event-btn green" (click)="trigger('deposit')" [disabled]="loading">
            <span class="event-icon">💹</span>
            <span class="event-name">Deposit</span>
          </button>
          <button class="event-btn yellow" (click)="trigger('withdrawal')" [disabled]="loading">
            <span class="event-icon">💸</span>
            <span class="event-name">Withdrawal</span>
          </button>
          <button class="event-btn purple" (click)="trigger('transfer')" [disabled]="loading">
            <span class="event-icon">🔄</span>
            <span class="event-name">Transfer</span>
          </button>
          <button class="event-btn red" (click)="trigger('payment')" [disabled]="loading">
            <span class="event-icon">💳</span>
            <span class="event-name">Payment</span>
          </button>
        </div>
        <div class="msg success" *ngIf="result?.type === 'success'">{{ result!.text }}</div>
        <div class="msg error"   *ngIf="result?.type === 'error'">{{ result!.text }}</div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Generate Test Notifications</h2>
          <span class="pipeline-badge">Bulk inserts records with resent = false</span>
        </div>
        <div class="loadtest-row">
          <div class="notif-field" style="max-width:160px">
            <label>Count</label>
            <input [(ngModel)]="generateCount" type="number" min="1" max="1000000" />
          </div>
          <div class="notif-field" style="max-width:140px">
            <label>Concurrency</label>
            <input [(ngModel)]="generateConcurrency" type="number" min="1" max="200" />
          </div>
          <button class="btn btn-load" (click)="startGenerate()">⚡ Generate</button>
        </div>
        <div class="msg success" *ngIf="generateResult?.type === 'success'">{{ generateResult!.text }}</div>
        <div class="msg error"   *ngIf="generateResult?.type === 'error'">{{ generateResult!.text }}</div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Resend Unsent Notifications</h2>
          <span class="pipeline-badge">Sends records where resent = false via MailHog</span>
        </div>
        <div class="loadtest-row">
          <div class="notif-field" style="max-width:160px">
            <label>Limit</label>
            <input [(ngModel)]="resendLimit" type="number" min="1" max="1000000" />
          </div>
          <button class="btn btn-resend" (click)="startResend()">📨 Start Resend</button>
        </div>
        <div class="msg success" *ngIf="resendResult?.type === 'success'">{{ resendResult!.text }}</div>
        <div class="msg error"   *ngIf="resendResult?.type === 'error'">{{ resendResult!.text }}</div>
      </div>

      <div class="hint-card">
        <span class="hint-icon">💡</span>
        <span>To register users or manage accounts, go to <a routerLink="/users" class="hint-link">Users →</a></span>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 900px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .page-title { font-size: 28px; font-weight: 700; color: #f1f5f9; }
    .page-sub { color: #64748b; margin-top: 4px; font-size: 14px; }

    .msg { padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; }
    .msg.success { background: #052e1660; border: 1px solid #22c55e; color: #86efac; margin-top: 16px; }
    .msg.error   { background: #450a0a60; border: 1px solid #ef4444; color: #fca5a5; margin-top: 16px; }

    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
    .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; }
    .stat-card.green  { border-color: #22c55e40; background: #052e1640; }
    .stat-card.red    { border-color: #ef444440; background: #450a0a40; }
    .stat-card.yellow { border-color: #f59e0b40; background: #45190040; }
    .stat-value { font-size: 36px; font-weight: 700; color: #f1f5f9; }
    .stat-label { font-size: 11px; color: #64748b; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }

    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .card-title { font-size: 16px; font-weight: 600; color: #f1f5f9; }

    .form-group { display: flex; align-items: center; gap: 8px; }
    .form-group label { font-size: 12px; color: #94a3b8; white-space: nowrap; }
    .form-group input { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #e2e8f0; font-size: 14px; outline: none; }
    .form-group input:focus { border-color: #3b82f6; }

    .event-grid { display: flex; gap: 12px; flex-wrap: wrap; }
    .event-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 20px; border: none; border-radius: 12px; cursor: pointer; color: #fff; font-weight: 600; min-width: 120px; transition: all 0.15s; }
    .event-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
    .event-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .event-icon { font-size: 24px; }
    .event-name { font-size: 13px; }
    .event-btn.blue   { background: #2563eb; }
    .event-btn.green  { background: #16a34a; }
    .event-btn.yellow { background: #d97706; }
    .event-btn.purple { background: #7c3aed; }
    .event-btn.red    { background: #dc2626; }

    .pipeline-badge { font-size: 11px; color: #475569; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 4px 10px; }

    .notif-field { display: flex; flex-direction: column; gap: 6px; }
    .notif-field label { font-size: 12px; color: #94a3b8; }
    .notif-field input { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #e2e8f0; font-size: 14px; outline: none; }
    .notif-field input:focus { border-color: #3b82f6; }

    .loadtest-row { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }

    .btn { padding: 8px 14px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.15s; }
    .btn-ghost { background: transparent; color: #64748b; border: 1px solid #334155; }
    .btn-ghost:hover { color: #94a3b8; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .btn-load { background: #7c3aed; color: #fff; white-space: nowrap; padding: 10px 20px; margin-top: 4px; }
    .btn-load:hover { background: #6d28d9; }
    .btn-resend { background: #2563eb; color: #fff; white-space: nowrap; padding: 10px 20px; margin-top: 4px; }
    .btn-resend:hover { background: #1d4ed8; }

    .hint-card { display: flex; align-items: center; gap: 10px; background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #64748b; }
    .hint-icon { font-size: 16px; }
    .hint-link { color: #3b82f6; text-decoration: none; }
    .hint-link:hover { text-decoration: underline; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: BankingStats | null = null;
  error = '';
  loading = false;
  result: { type: 'success' | 'error', text: string } | null = null;
  eventUserId = '1';

  generateCount = 100000;
  generateConcurrency = 20;
  generateResult: { type: 'success' | 'error', text: string } | null = null;

  resendLimit = 100000;
  resendResult: { type: 'success' | 'error', text: string } | null = null;

  constructor(private svc: NotificationService) {}
  ngOnInit() { this.loadStats(); }

  loadStats() {
    this.svc.getStats().subscribe({
      next: s => { this.stats = s; this.error = ''; },
      error: () => { this.stats = null; this.error = 'Backend unreachable — make sure banking-server is running on port 8082.'; }
    });
  }

  startGenerate() {
    this.generateResult = null;
    this.svc.generateNotifications(this.generateCount, this.generateConcurrency).subscribe({
      next: () => {
        this.generateResult = { type: 'success', text: `Seed job started — ${this.generateCount.toLocaleString()} notifications queued on the server.` };
      },
      error: err => {
        this.generateResult = { type: 'error', text: err?.error?.error || 'Could not reach backend' };
      }
    });
  }

  startResend() {
    this.resendResult = null;
    this.svc.startResend(this.resendLimit).subscribe({
      next: () => {
        this.resendResult = { type: 'success', text: `Resend job started — up to ${this.resendLimit.toLocaleString()} notifications will be sent via MailHog.` };
      },
      error: err => {
        this.resendResult = { type: 'error', text: err?.error?.error || 'Could not reach backend' };
      }
    });
  }

  trigger(type: string) {
    this.loading = true;
    this.result = null;

    const uid = this.eventUserId || '1';
    const call$ = type === 'user-registered' ? this.svc.triggerUserRegistered(uid)
                : type === 'deposit'          ? this.svc.triggerDeposit(uid, '1000')
                : type === 'withdrawal'       ? this.svc.triggerWithdrawal(uid, '500')
                : type === 'transfer'         ? this.svc.triggerTransfer(uid, '250')
                :                               this.svc.triggerPayment(uid, '100');

    call$.subscribe({
      next: () => {
        this.loading = false;
        this.result = { type: 'success', text: `Event "${type}" sent for user ${uid}` };
        this.loadStats();
      },
      error: err => {
        this.loading = false;
        this.result = { type: 'error', text: err?.error?.message || 'Could not reach backend' };
      }
    });
  }
}
