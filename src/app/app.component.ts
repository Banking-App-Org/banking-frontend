import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="layout">
      <nav class="sidebar">
        <div class="brand">
          <div class="brand-logo">B</div>
          <span class="brand-text">Banking Admin</span>
        </div>

        <div class="nav-body">
          <div class="nav-group">
            <span class="nav-label">Overview</span>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Dashboard
            </a>
          </div>

          <div class="nav-group">
            <span class="nav-label">Users</span>
            <a routerLink="/users" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              All Users
            </a>
          </div>

          <div class="nav-group">
            <span class="nav-label">Banking</span>
            <a routerLink="/accounts" routerLinkActive="active" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
              Accounts
            </a>
            <a routerLink="/transactions" routerLinkActive="active" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              Transactions
            </a>
            <a routerLink="/payments" routerLinkActive="active" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Payments
            </a>
          </div>
        </div>

        <div class="sidebar-footer">
          <span class="footer-label">External Tools</span>
          <a href="http://localhost:8090" target="_blank" class="ext-link">Kafka UI ↗</a>
          <a href="http://localhost:3000" target="_blank" class="ext-link">Grafana ↗</a>
          <a href="http://localhost:9090" target="_blank" class="ext-link">Prometheus ↗</a>
        </div>
      </nav>

      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }

    .sidebar {
      width: 240px;
      background: #0f172a;
      border-right: 1px solid #1e293b;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      overflow-y: auto;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 20px 16px;
      border-bottom: 1px solid #1e293b;
    }
    .brand-logo {
      width: 32px; height: 32px;
      background: #2563eb;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 16px; color: #fff;
      flex-shrink: 0;
    }
    .brand-text { font-size: 15px; font-weight: 700; color: #f1f5f9; }

    .nav-body { flex: 1; padding: 12px 0; }

    .nav-group { margin-bottom: 4px; padding: 0 12px; }
    .nav-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 10px 8px 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      color: #64748b;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      border-radius: 7px;
      margin-bottom: 1px;
      transition: all 0.15s;
      border-left: 2px solid transparent;
    }
    .nav-item svg { flex-shrink: 0; }
    .nav-item:hover { background: #1e293b; color: #94a3b8; }
    .nav-item.active {
      background: #1e3a5f;
      color: #93c5fd;
      border-left-color: #3b82f6;
    }

    .sidebar-footer {
      padding: 14px 20px;
      border-top: 1px solid #1e293b;
    }
    .footer-label { display: block; font-size: 10px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .ext-link {
      display: block;
      color: #475569;
      text-decoration: none;
      font-size: 12px;
      padding: 3px 0;
      transition: color 0.15s;
    }
    .ext-link:hover { color: #64748b; }

    .content { margin-left: 240px; flex: 1; padding: 36px 40px; min-height: 100vh; }
  `]
})
export class AppComponent {}
