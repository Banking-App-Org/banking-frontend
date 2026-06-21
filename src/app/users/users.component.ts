import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService, User } from '../notification.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Users</h1>
          <p class="page-sub">Manage all registered users and their banking profiles.</p>
        </div>
        <button class="btn btn-blue" (click)="showRegister = !showRegister">
          {{ showRegister ? 'Cancel' : '+ Register User' }}
        </button>
      </div>

      <div class="msg success" *ngIf="msg?.type === 'success'">{{ msg!.text }}</div>
      <div class="msg error"   *ngIf="msg?.type === 'error'">{{ msg!.text }}</div>

      <div class="card edit-card" *ngIf="editingUser">
        <div class="card-title-row">
          <h2 class="card-title">Edit User — {{ fullName(editingUser) }}</h2>
          <button class="btn btn-ghost btn-sm" (click)="cancelEdit()">✕ Cancel</button>
        </div>
        <div class="form-grid">
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
        </div>
        <button class="btn btn-blue" (click)="saveEdit()" [disabled]="loading">
          {{ loading ? 'Saving…' : 'Save Changes' }}
        </button>
      </div>

      <div class="card" *ngIf="showRegister">
        <h2 class="card-title">Register New User</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>Username *</label>
            <input [(ngModel)]="form.username" placeholder="e.g. john123" />
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input [(ngModel)]="form.email" placeholder="e.g. john@example.com" />
          </div>
          <div class="form-group">
            <label>Password *</label>
            <input type="password" [(ngModel)]="form.password" placeholder="••••••••" />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input [(ngModel)]="form.phoneNumber" placeholder="e.g. +1234567890" />
          </div>
          <div class="form-group">
            <label>First Name</label>
            <input [(ngModel)]="form.firstName" placeholder="John" />
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input [(ngModel)]="form.lastName" placeholder="Doe" />
          </div>
        </div>
        <button class="btn btn-blue" (click)="register()" [disabled]="loading">
          {{ loading ? 'Registering…' : 'Register User' }}
        </button>
      </div>

      <div class="card">
        <div class="table-toolbar">
          <input class="search-input" [(ngModel)]="search" placeholder="Search by name, username or email…" />
          <span class="count">{{ filtered.length }} users</span>
        </div>

        <div class="empty-state" *ngIf="filtered.length === 0 && !loading">
          {{ users.length === 0 ? 'No users yet. Register one above.' : 'No users match your search.' }}
        </div>

        <table class="data-table" *ngIf="filtered.length > 0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of filtered" class="clickable" (click)="open(u)">
              <td class="muted">{{ u.id }}</td>
              <td class="bold">{{ fullName(u) }}</td>
              <td class="mono">&#64;{{ u.username }}</td>
              <td>{{ u.email }}</td>
              <td><span class="badge" [class.badge-green]="u.status === 'ACTIVE'" [class.badge-red]="u.status !== 'ACTIVE'">{{ u.status }}</span></td>
              <td class="muted">{{ u.createdAt | date:'mediumDate' }}</td>
              <td class="actions-cell" (click)="$event.stopPropagation()">
                <ng-container *ngIf="confirmDeleteId !== u.id">
                  <button class="btn btn-sm btn-ghost" (click)="open(u)">View →</button>
                  <button class="btn btn-sm btn-edit" (click)="startEdit(u)">Edit</button>
                  <button class="btn btn-sm btn-danger" (click)="confirmDeleteId = u.id ?? null">Delete</button>
                </ng-container>
                <ng-container *ngIf="confirmDeleteId === u.id">
                  <span class="confirm-text">Delete {{ fullName(u) }}?</span>
                  <button class="btn btn-sm btn-danger-solid" (click)="deleteUser(u)" [disabled]="loading">Confirm</button>
                  <button class="btn btn-sm btn-ghost" (click)="confirmDeleteId = null">Cancel</button>
                </ng-container>
              </td>
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
    .msg.success { background: #052e1660; border: 1px solid #22c55e; color: #86efac; }
    .msg.error   { background: #450a0a60; border: 1px solid #ef4444; color: #fca5a5; }

    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
    .card-title { font-size: 16px; font-weight: 600; color: #f1f5f9; margin-bottom: 18px; }

    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 12px; color: #94a3b8; font-weight: 500; }
    .form-group input { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 10px 12px; color: #e2e8f0; font-size: 14px; outline: none; transition: border-color 0.15s; }
    .form-group input:focus { border-color: #3b82f6; }

    .table-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .search-input { flex: 1; background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 8px 12px; color: #e2e8f0; font-size: 14px; outline: none; }
    .search-input:focus { border-color: #3b82f6; }
    .count { font-size: 12px; color: #64748b; white-space: nowrap; }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table thead { background: #0f172a; }
    .data-table th { padding: 10px 12px; text-align: left; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid #334155; }
    .data-table td { padding: 12px; border-bottom: 1px solid #1e293b; font-size: 14px; color: #e2e8f0; }
    .data-table tbody tr.clickable { cursor: pointer; transition: background 0.1s; }
    .data-table tbody tr.clickable:hover { background: #0f172a; }
    .actions-cell { display: flex; gap: 6px; align-items: center; flex-wrap: nowrap; }
    .confirm-text { font-size: 12px; color: #fca5a5; white-space: nowrap; }
    .btn-danger { background: transparent; color: #ef4444; border: 1px solid #ef444440; }
    .btn-danger:hover { background: #450a0a60; border-color: #ef4444; }
    .btn-danger-solid { background: #dc2626; color: #fff; border: none; }
    .btn-danger-solid:hover:not(:disabled) { background: #b91c1c; }
    .btn-danger-solid:disabled { opacity: 0.5; cursor: not-allowed; }

    .bold { font-weight: 600; color: #f1f5f9; }
    .muted { color: #64748b; }
    .mono { font-family: monospace; font-size: 13px; }

    .badge { padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
    .badge-green { background: #052e1660; color: #86efac; border: 1px solid #22c55e40; }
    .badge-red   { background: #450a0a60; color: #fca5a5; border: 1px solid #ef444440; }

    .empty-state { text-align: center; padding: 48px 0; color: #475569; font-size: 14px; }

    .btn { padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.15s; }
    .btn-blue { background: #2563eb; color: #fff; }
    .btn-blue:hover:not(:disabled) { background: #1d4ed8; }
    .btn-blue:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-ghost { background: transparent; color: #64748b; border: 1px solid #334155; }
    .btn-ghost:hover { color: #94a3b8; border-color: #475569; }
    .btn-edit { background: transparent; color: #a78bfa; border: 1px solid #a78bfa40; }
    .btn-edit:hover { background: #1e1040; border-color: #a78bfa; }
    .btn-sm { padding: 6px 12px; font-size: 12px; }

    .edit-card { border-color: #a78bfa60; }
    .card-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .card-title-row .card-title { margin-bottom: 0; }
  `]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  search = '';
  showRegister = false;
  loading = false;
  confirmDeleteId: string | null = null;
  msg: { type: 'success' | 'error', text: string } | null = null;

  form = { username: '', email: '', password: '', phoneNumber: '', firstName: '', lastName: '' };

  editingUser: User | null = null;
  editForm = { email: '', phoneNumber: '', firstName: '', lastName: '' };

  constructor(private svc: NotificationService, private router: Router) {}

  ngOnInit() { this.load(); }

  load() {
    this.svc.getAllUsers().subscribe({
      next: users => this.users = users,
      error: () => this.showMsg('error', 'Failed to load users')
    });
  }

  get filtered(): User[] {
    const q = this.search.toLowerCase();
    if (!q) return this.users;
    return this.users.filter(u =>
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      this.fullName(u).toLowerCase().includes(q)
    );
  }

  fullName(u: User): string {
    const n = [u.firstName, u.lastName].filter(Boolean).join(' ');
    return n || u.username || '';
  }

  register() {
    if (!this.form.username || !this.form.email || !this.form.password) {
      this.showMsg('error', 'Username, email and password are required');
      return;
    }
    this.loading = true;
    this.svc.registerUser(this.form).subscribe({
      next: user => {
        this.loading = false;
        this.showMsg('success', `User "${user.username}" registered successfully`);
        this.users.unshift(user);
        this.showRegister = false;
        this.form = { username: '', email: '', password: '', phoneNumber: '', firstName: '', lastName: '' };
      },
      error: err => {
        this.loading = false;
        this.showMsg('error', err?.error?.message || 'Registration failed');
      }
    });
  }

  deleteUser(user: User) {
    this.loading = true;
    this.svc.deleteUser(user.id!).subscribe({
      next: () => {
        this.loading = false;
        this.users = this.users.filter(u => u.id !== user.id);
        this.confirmDeleteId = null;
        this.showMsg('success', `User "${this.fullName(user)}" deleted`);
      },
      error: err => {
        this.loading = false;
        this.confirmDeleteId = null;
        this.showMsg('error', err?.error?.message || 'Failed to delete user');
      }
    });
  }

  startEdit(user: User) {
    this.editingUser = user;
    this.editForm = {
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      firstName: user.firstName || '',
      lastName: user.lastName || ''
    };
    this.showRegister = false;
  }

  cancelEdit() {
    this.editingUser = null;
    this.editForm = { email: '', phoneNumber: '', firstName: '', lastName: '' };
  }

  saveEdit() {
    if (!this.editingUser?.id) return;
    this.loading = true;
    this.svc.updateUser(this.editingUser.id, this.editForm).subscribe({
      next: updated => {
        this.loading = false;
        const i = this.users.findIndex(u => u.id === updated.id);
        if (i >= 0) this.users[i] = updated;
        this.cancelEdit();
        this.showMsg('success', `User "${updated.username}" updated successfully`);
      },
      error: err => {
        this.loading = false;
        this.showMsg('error', err?.error?.message || 'Failed to update user');
      }
    });
  }

  open(user: User) {
    this.router.navigate(['/users', user.id]);
  }

  showMsg(type: 'success' | 'error', text: string) {
    this.msg = { type, text };
    setTimeout(() => this.msg = null, 4000);
  }
}
