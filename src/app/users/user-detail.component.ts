import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NotificationService, User, BankAccount, Transaction, Payment } from '../notification.service';

type AccountTab = 'deposit' | 'withdraw' | 'transfer' | 'history';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">

      <!-- Loading / not found -->
      <div class="empty-state" *ngIf="!user && !loadError">Loading…</div>
      <div class="msg error" *ngIf="loadError">{{ loadError }}</div>

      <ng-container *ngIf="user">

        <!-- Header -->
        <div class="header-row">
          <a routerLink="/users" class="back-link">← Users</a>
          <div class="user-card">
            <div class="avatar">{{ initials }}</div>
            <div class="user-info">
              <div class="user-name">{{ fullName }}</div>
              <div class="user-meta">
                <span class="mono">&#64;{{ user.username }}</span>
                <span>{{ user.email }}</span>
                <span *ngIf="user.phoneNumber">{{ user.phoneNumber }}</span>
              </div>
            </div>
            <span class="badge" [class.badge-green]="user.status === 'ACTIVE'" [class.badge-red]="user.status !== 'ACTIVE'">
              {{ user.status }}
            </span>
          </div>
          <div class="header-stats">
            <div class="hstat">
              <div class="hstat-value">{{ accounts.length }}</div>
              <div class="hstat-label">Accounts</div>
            </div>
            <div class="hstat">
              <div class="hstat-value">{{ totalBalance | currency }}</div>
              <div class="hstat-label">Total Balance</div>
            </div>
            <div class="hstat">
              <div class="hstat-value">{{ payments.length }}</div>
              <div class="hstat-label">Payments</div>
            </div>
          </div>
        </div>

        <!-- Global message -->
        <div class="msg success" *ngIf="msg?.type === 'success'">{{ msg!.text }}</div>
        <div class="msg error"   *ngIf="msg?.type === 'error'">{{ msg!.text }}</div>

        <!-- ── EDIT PROFILE ── -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Profile</h2>
            <button class="btn btn-edit btn-sm" (click)="showEditProfile = !showEditProfile">
              {{ showEditProfile ? 'Cancel' : 'Edit Profile' }}
            </button>
          </div>

          <div class="inline-form edit-form-panel" *ngIf="showEditProfile">
            <div class="form-group">
              <label>Email</label>
              <input [(ngModel)]="editForm.email" placeholder="e.g. john@example.com" />
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input [(ngModel)]="editForm.phoneNumber" placeholder="e.g. +1234567890" />
            </div>
            <div class="form-group">
              <label>First Name</label>
              <input [(ngModel)]="editForm.firstName" placeholder="John" />
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input [(ngModel)]="editForm.lastName" placeholder="Doe" />
            </div>
            <div class="inline-form-actions">
              <button class="btn btn-blue" (click)="saveProfile()" [disabled]="loading">
                {{ loading ? 'Saving…' : 'Save Changes' }}
              </button>
              <button class="btn btn-ghost" (click)="showEditProfile = false">Cancel</button>
            </div>
          </div>
        </div>

        <!-- ── ACCOUNTS ── -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Accounts</h2>
            <button class="btn btn-blue btn-sm" (click)="showOpenAccount = !showOpenAccount">
              {{ showOpenAccount ? 'Cancel' : '+ Open Account' }}
            </button>
          </div>

          <div class="inline-form" *ngIf="showOpenAccount">
            <div class="form-group">
              <label>Account Type</label>
              <select [(ngModel)]="newAccountType">
                <option>CHECKING</option>
                <option>SAVINGS</option>
                <option>BUSINESS</option>
              </select>
            </div>
            <button class="btn btn-blue" (click)="openAccount()" [disabled]="loading">Create</button>
            <button class="btn btn-ghost" (click)="showOpenAccount = false">Cancel</button>
          </div>

          <div class="accounts-grid" *ngIf="accounts.length > 0">
            <div class="account-card" *ngFor="let a of accounts"
                 [class.selected]="selectedAccount?.id === a.id"
                 (click)="selectAccount(a)">
              <div class="account-top">
                <span class="account-type">{{ a.accountType }}</span>
                <span class="badge badge-sm" [class.badge-green]="a.status === 'ACTIVE'" [class.badge-gray]="a.status !== 'ACTIVE'">{{ a.status }}</span>
              </div>
              <div class="account-number">{{ a.accountNumber }}</div>
              <div class="account-balance">{{ a.balance | currency }}</div>
              <div class="account-currency">{{ a.currency }}</div>
            </div>
          </div>

          <div class="empty-state" *ngIf="accounts.length === 0">
            No accounts yet. Open one using the button above.
          </div>

          <!-- Action panel -->
          <div class="action-panel" *ngIf="selectedAccount">
            <div class="action-panel-header">
              <div class="selected-label">
                <span class="selected-dot"></span>
                {{ selectedAccount.accountType }} · {{ selectedAccount.accountNumber }}
                <span class="selected-balance">{{ selectedAccount.balance | currency }}</span>
              </div>
              <div class="tabs">
                <button class="tab" [class.active]="activeTab === 'deposit'"  (click)="setTab('deposit')">Deposit</button>
                <button class="tab" [class.active]="activeTab === 'withdraw'" (click)="setTab('withdraw')">Withdraw</button>
                <button class="tab" [class.active]="activeTab === 'transfer'" (click)="setTab('transfer')" *ngIf="accounts.length > 1">Transfer</button>
                <button class="tab" [class.active]="activeTab === 'history'"  (click)="setTab('history')">History</button>
              </div>
            </div>

            <!-- Deposit -->
            <div class="tab-content" *ngIf="activeTab === 'deposit'">
              <div class="form-row">
                <div class="form-group">
                  <label>Amount ($)</label>
                  <input type="number" [(ngModel)]="depositForm.amount" placeholder="0.00" min="0.01" />
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <input [(ngModel)]="depositForm.description" placeholder="Optional note" />
                </div>
              </div>
              <button class="btn btn-green" (click)="deposit()" [disabled]="loading || !depositForm.amount">
                Deposit
              </button>
            </div>

            <!-- Withdraw -->
            <div class="tab-content" *ngIf="activeTab === 'withdraw'">
              <div class="form-row">
                <div class="form-group">
                  <label>Amount ($)</label>
                  <input type="number" [(ngModel)]="withdrawForm.amount" placeholder="0.00" min="0.01" />
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <input [(ngModel)]="withdrawForm.description" placeholder="Optional note" />
                </div>
              </div>
              <button class="btn btn-yellow" (click)="withdraw()" [disabled]="loading || !withdrawForm.amount">
                Withdraw
              </button>
            </div>

            <!-- Transfer -->
            <div class="tab-content" *ngIf="activeTab === 'transfer'">
              <div class="form-row">
                <div class="form-group">
                  <label>To Account</label>
                  <select [(ngModel)]="transferForm.toAccountId">
                    <option [ngValue]="null">Select target account</option>
                    <option *ngFor="let a of otherAccounts" [ngValue]="a.id">
                      {{ a.accountType }} · {{ a.accountNumber }} ({{ a.balance | currency }})
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Amount ($)</label>
                  <input type="number" [(ngModel)]="transferForm.amount" placeholder="0.00" min="0.01" />
                </div>
              </div>
              <button class="btn btn-blue" (click)="transfer()" [disabled]="loading || !transferForm.toAccountId || !transferForm.amount">
                Transfer
              </button>
            </div>

            <!-- History -->
            <div class="tab-content" *ngIf="activeTab === 'history'">
              <div class="loading-row" *ngIf="txLoading">Loading transactions…</div>
              <table class="data-table" *ngIf="!txLoading && transactions.length > 0">
                <thead><tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr></thead>
                <tbody>
                  <tr *ngFor="let tx of transactions">
                    <td class="muted">{{ tx.createdAt | date:'short' }}</td>
                    <td><span class="tx-type" [class]="'tx-' + tx.type?.toLowerCase()">{{ tx.type }}</span></td>
                    <td class="muted">{{ tx.description || '—' }}</td>
                    <td [class.pos]="tx.amount! > 0" [class.neg]="tx.amount! < 0">
                      {{ tx.amount! > 0 ? '+' : '' }}{{ tx.amount | currency }}
                    </td>
                    <td class="muted">{{ tx.status }}</td>
                  </tr>
                </tbody>
              </table>
              <div class="empty-state sm" *ngIf="!txLoading && transactions.length === 0">
                No transactions for this account.
              </div>
            </div>
          </div>
        </div>

        <!-- ── PAYMENTS ── -->
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">Payments</h2>
            <button class="btn btn-blue btn-sm" (click)="showPaymentForm = !showPaymentForm">
              {{ showPaymentForm ? 'Cancel' : '+ New Payment' }}
            </button>
          </div>

          <div class="inline-form" *ngIf="showPaymentForm">
            <div class="form-group">
              <label>Account</label>
              <select [(ngModel)]="paymentForm.accountId">
                <option [ngValue]="null">Select account</option>
                <option *ngFor="let a of accounts" [ngValue]="a.id">
                  {{ a.accountType }} · {{ a.accountNumber }} ({{ a.balance | currency }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Payee</label>
              <input [(ngModel)]="paymentForm.payee" placeholder="e.g. Electric Company" />
            </div>
            <div class="form-group">
              <label>Amount ($)</label>
              <input type="number" [(ngModel)]="paymentForm.amount" placeholder="0.00" min="0.01" />
            </div>
            <div class="inline-form-actions">
              <button class="btn btn-blue" (click)="submitPayment()" [disabled]="loading || !paymentForm.accountId || !paymentForm.payee || !paymentForm.amount">
                Submit Payment
              </button>
              <button class="btn btn-ghost" (click)="showPaymentForm = false">Cancel</button>
            </div>
          </div>

          <table class="data-table" *ngIf="payments.length > 0">
            <thead><tr>
              <th>Date</th>
              <th>Payee</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Processed</th>
            </tr></thead>
            <tbody>
              <tr *ngFor="let p of payments">
                <td class="muted">{{ p.createdAt | date:'short' }}</td>
                <td class="bold">{{ p.payee }}</td>
                <td>{{ p.amount | currency }}</td>
                <td><span class="badge badge-sm" [class.badge-green]="p.status === 'PROCESSED'" [class.badge-yellow]="p.status === 'PENDING'" [class.badge-red]="p.status === 'FAILED'">{{ p.status }}</span></td>
                <td class="muted">{{ p.processedAt ? (p.processedAt | date:'short') : '—' }}</td>
              </tr>
            </tbody>
          </table>

          <div class="empty-state" *ngIf="payments.length === 0">
            No payments yet.
          </div>
        </div>

      </ng-container>
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }

    .empty-state { text-align: center; padding: 48px 0; color: #475569; font-size: 14px; }
    .empty-state.sm { padding: 24px 0; }
    .loading-row { color: #64748b; font-size: 14px; padding: 12px 0; }

    .msg { padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; font-size: 14px; font-weight: 500; }
    .msg.success { background: #052e1660; border: 1px solid #22c55e; color: #86efac; }
    .msg.error   { background: #450a0a60; border: 1px solid #ef4444; color: #fca5a5; }

    /* Header */
    .back-link { color: #64748b; text-decoration: none; font-size: 13px; display: inline-block; margin-bottom: 16px; transition: color 0.15s; }
    .back-link:hover { color: #94a3b8; }

    .header-row { margin-bottom: 28px; }
    .user-card { display: flex; align-items: center; gap: 16px; background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px 24px; margin-bottom: 12px; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: #2563eb; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .user-info { flex: 1; }
    .user-name { font-size: 20px; font-weight: 700; color: #f1f5f9; }
    .user-meta { display: flex; gap: 16px; margin-top: 4px; font-size: 13px; color: #64748b; flex-wrap: wrap; }
    .mono { font-family: monospace; }

    .header-stats { display: flex; gap: 16px; }
    .hstat { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px 20px; text-align: center; }
    .hstat-value { font-size: 22px; font-weight: 700; color: #f1f5f9; }
    .hstat-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

    /* Section */
    .section { margin-bottom: 36px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-title { font-size: 18px; font-weight: 600; color: #f1f5f9; }

    /* Accounts */
    .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; }
    .account-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 18px; cursor: pointer; transition: all 0.15s; }
    .account-card:hover { border-color: #475569; }
    .account-card.selected { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6; }
    .account-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .account-type { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; }
    .account-number { font-size: 12px; color: #94a3b8; font-family: monospace; margin-bottom: 10px; word-break: break-all; }
    .account-balance { font-size: 22px; font-weight: 700; color: #22c55e; }
    .account-currency { font-size: 11px; color: #475569; margin-top: 2px; }

    /* Action panel */
    .action-panel { background: #0f172a; border: 1px solid #3b82f6; border-radius: 12px; margin-top: 16px; overflow: hidden; }
    .action-panel-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid #1e293b; flex-wrap: wrap; gap: 10px; }
    .selected-label { font-size: 13px; color: #94a3b8; display: flex; align-items: center; gap: 8px; font-family: monospace; }
    .selected-dot { width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; }
    .selected-balance { color: #22c55e; font-weight: 600; }
    .tabs { display: flex; gap: 2px; }
    .tab { background: transparent; border: none; padding: 6px 14px; color: #64748b; cursor: pointer; font-size: 13px; font-weight: 500; border-radius: 6px; transition: all 0.15s; }
    .tab:hover { color: #94a3b8; background: #1e293b; }
    .tab.active { background: #1e293b; color: #f1f5f9; }
    .tab-content { padding: 20px; }

    /* Inline forms */
    .inline-form { display: flex; gap: 12px; align-items: flex-end; background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .inline-form-actions { display: flex; gap: 8px; align-items: flex-end; }
    .form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 12px; color: #94a3b8; font-weight: 500; }
    .form-group input, .form-group select { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; color: #e2e8f0; font-size: 14px; outline: none; transition: border-color 0.15s; width: 100%; }
    .form-group input:focus, .form-group select:focus { border-color: #3b82f6; }
    .form-group select option { background: #1e293b; }

    /* Table */
    .data-table { width: 100%; border-collapse: collapse; background: #1e293b; border: 1px solid #334155; border-radius: 10px; overflow: hidden; }
    .data-table thead { background: #0f172a; }
    .data-table th { padding: 10px 14px; text-align: left; font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #334155; }
    .data-table td { padding: 12px 14px; font-size: 14px; color: #e2e8f0; border-bottom: 1px solid #0f172a; }
    .data-table tbody tr:last-child td { border-bottom: none; }

    .bold { font-weight: 600; color: #f1f5f9; }
    .muted { color: #64748b; font-size: 13px; }
    .pos { color: #22c55e; font-weight: 600; }
    .neg { color: #ef4444; font-weight: 600; }

    .tx-type { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; padding: 2px 6px; border-radius: 4px; }
    .tx-deposit    { background: #052e1640; color: #86efac; }
    .tx-withdrawal { background: #45190040; color: #fcd34d; }
    .tx-transfer   { background: #1e3a5f40; color: #93c5fd; }

    /* Badges */
    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge-sm { padding: 2px 6px; font-size: 10px; }
    .badge-green  { background: #052e1660; color: #86efac; border: 1px solid #22c55e40; }
    .badge-yellow { background: #45190060; color: #fcd34d; border: 1px solid #f59e0b40; }
    .badge-red    { background: #450a0a60; color: #fca5a5; border: 1px solid #ef444440; }
    .badge-gray   { background: #1e293b; color: #64748b; border: 1px solid #334155; }

    /* Buttons */
    .btn { padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.15s; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-blue   { background: #2563eb; color: #fff; }
    .btn-green  { background: #16a34a; color: #fff; }
    .btn-yellow { background: #d97706; color: #fff; }
    .btn-blue:hover:not(:disabled)   { background: #1d4ed8; }
    .btn-green:hover:not(:disabled)  { background: #15803d; }
    .btn-yellow:hover:not(:disabled) { background: #b45309; }
    .btn-ghost { background: transparent; color: #64748b; border: 1px solid #334155; }
    .btn-ghost:hover { color: #94a3b8; border-color: #475569; }
    .btn-edit { background: transparent; color: #a78bfa; border: 1px solid #a78bfa40; }
    .btn-edit:hover { background: #1e104060; border-color: #a78bfa; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .edit-form-panel { background: #0f172a; border-color: #a78bfa40; }
  `]
})
export class UserDetailComponent implements OnInit {
  userId!: number;
  user: User | null = null;
  accounts: BankAccount[] = [];
  payments: Payment[] = [];
  loadError = '';

  selectedAccount: BankAccount | null = null;
  activeTab: AccountTab = 'deposit';
  transactions: Transaction[] = [];
  txLoading = false;

  depositForm  = { amount: '', description: '' };
  withdrawForm = { amount: '', description: '' };
  transferForm: { toAccountId: number | null, amount: string } = { toAccountId: null, amount: '' };

  showEditProfile = false;
  editForm = { email: '', phoneNumber: '', firstName: '', lastName: '' };

  showOpenAccount = false;
  newAccountType = 'CHECKING';

  showPaymentForm = false;
  paymentForm: { accountId: number | null, payee: string, amount: string } = { accountId: null, payee: '', amount: '' };

  loading = false;
  msg: { type: 'success' | 'error', text: string } | null = null;

  constructor(private route: ActivatedRoute, private svc: NotificationService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.loadError = 'Invalid user ID'; return; }
    this.userId = +id;
    this.svc.getUser(this.userId).subscribe({
      next: u => {
        this.user = u;
        this.editForm = { email: u.email || '', phoneNumber: u.phoneNumber || '', firstName: u.firstName || '', lastName: u.lastName || '' };
        this.loadAccounts();
        this.loadPayments();
      },
      error: () => this.loadError = 'User not found'
    });
  }

  saveProfile() {
    this.loading = true;
    this.svc.updateUser(this.userId, this.editForm).subscribe({
      next: updated => {
        this.loading = false;
        this.user = updated;
        this.showEditProfile = false;
        this.showMsg('success', 'Profile updated successfully');
      },
      error: err => {
        this.loading = false;
        this.showMsg('error', err?.error?.message || 'Failed to update profile');
      }
    });
  }

  loadAccounts() {
    this.svc.getUserAccounts(this.userId).subscribe({
      next: accounts => {
        this.accounts = accounts;
        if (this.selectedAccount) {
          const refreshed = accounts.find(a => a.id === this.selectedAccount!.id);
          if (refreshed) this.selectedAccount = refreshed;
        }
      }
    });
  }

  loadPayments() {
    this.svc.getUserPayments(this.userId).subscribe({
      next: payments => this.payments = payments,
      error: () => {}
    });
  }

  selectAccount(account: BankAccount) {
    if (this.selectedAccount?.id === account.id) {
      this.selectedAccount = null;
      return;
    }
    this.selectedAccount = account;
    this.activeTab = 'deposit';
    this.transactions = [];
    this.depositForm  = { amount: '', description: '' };
    this.withdrawForm = { amount: '', description: '' };
    this.transferForm = { toAccountId: null, amount: '' };
  }

  setTab(tab: AccountTab) {
    this.activeTab = tab;
    if (tab === 'history' && this.selectedAccount?.id && this.transactions.length === 0) {
      this.txLoading = true;
      this.svc.getTransactionsByAccount(this.selectedAccount.id).subscribe({
        next: txs => { this.transactions = txs; this.txLoading = false; },
        error: ()  => { this.txLoading = false; }
      });
    }
  }

  deposit() {
    if (!this.selectedAccount?.id || !this.depositForm.amount) return;
    this.loading = true;
    this.svc.deposit(this.selectedAccount.id, +this.depositForm.amount, this.depositForm.description || 'Deposit').subscribe({
      next: updated => {
        this.loading = false;
        this.showMsg('success', `Deposited ${(+this.depositForm.amount).toFixed(2)} successfully`);
        this.updateAccount(updated);
        this.depositForm = { amount: '', description: '' };
      },
      error: err => { this.loading = false; this.showMsg('error', err?.error?.message || 'Deposit failed'); }
    });
  }

  withdraw() {
    if (!this.selectedAccount?.id || !this.withdrawForm.amount) return;
    this.loading = true;
    this.svc.withdraw(this.selectedAccount.id, +this.withdrawForm.amount, this.withdrawForm.description || 'Withdrawal').subscribe({
      next: updated => {
        this.loading = false;
        this.showMsg('success', `Withdrew ${(+this.withdrawForm.amount).toFixed(2)} successfully`);
        this.updateAccount(updated);
        this.withdrawForm = { amount: '', description: '' };
      },
      error: err => { this.loading = false; this.showMsg('error', err?.error?.message || 'Withdrawal failed'); }
    });
  }

  transfer() {
    if (!this.selectedAccount?.id || !this.transferForm.toAccountId || !this.transferForm.amount) return;
    this.loading = true;
    this.svc.transfer(this.selectedAccount.id, this.transferForm.toAccountId, +this.transferForm.amount).subscribe({
      next: () => {
        this.loading = false;
        this.showMsg('success', `Transferred ${(+this.transferForm.amount).toFixed(2)} successfully`);
        this.transferForm = { toAccountId: null, amount: '' };
        this.loadAccounts();
      },
      error: err => { this.loading = false; this.showMsg('error', err?.error?.message || 'Transfer failed'); }
    });
  }

  openAccount() {
    this.loading = true;
    this.svc.openAccount(this.userId, this.newAccountType).subscribe({
      next: account => {
        this.loading = false;
        this.accounts.push(account);
        this.showOpenAccount = false;
        this.newAccountType = 'CHECKING';
        this.showMsg('success', `Account ${account.accountNumber} opened`);
      },
      error: err => { this.loading = false; this.showMsg('error', err?.error?.message || 'Failed to open account'); }
    });
  }

  submitPayment() {
    if (!this.paymentForm.accountId || !this.paymentForm.payee || !this.paymentForm.amount) return;
    this.loading = true;
    this.svc.submitPayment(this.userId, this.paymentForm.accountId, this.paymentForm.payee, +this.paymentForm.amount).subscribe({
      next: payment => {
        this.loading = false;
        this.payments.unshift(payment);
        this.showPaymentForm = false;
        this.paymentForm = { accountId: null, payee: '', amount: '' };
        this.loadAccounts();
        this.showMsg('success', `Payment to ${payment.payee} submitted`);
      },
      error: err => { this.loading = false; this.showMsg('error', err?.error?.message || 'Payment failed'); }
    });
  }

  updateAccount(updated: BankAccount) {
    const i = this.accounts.findIndex(a => a.id === updated.id);
    if (i >= 0) this.accounts[i] = updated;
    if (this.selectedAccount?.id === updated.id) this.selectedAccount = updated;
  }

  get otherAccounts(): BankAccount[] {
    return this.accounts.filter(a => a.id !== this.selectedAccount?.id);
  }

  get totalBalance(): number {
    return this.accounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  }

  get fullName(): string {
    if (!this.user) return '';
    const n = [this.user.firstName, this.user.lastName].filter(Boolean).join(' ');
    return n || this.user.username || '';
  }

  get initials(): string {
    if (!this.user) return '?';
    if (this.user.firstName && this.user.lastName) return (this.user.firstName[0] + this.user.lastName[0]).toUpperCase();
    return this.user.username?.[0]?.toUpperCase() || '?';
  }

  showMsg(type: 'success' | 'error', text: string) {
    this.msg = { type, text };
    setTimeout(() => this.msg = null, 4000);
  }
}
