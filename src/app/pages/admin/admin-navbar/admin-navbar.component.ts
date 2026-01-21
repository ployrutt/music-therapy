import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Route } from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-admin-navbar',
  imports: [RouterLink,CommonModule],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.css',
})
export class AdminNavbarComponent {
  constructor(private router: Router) {}

  onLogout(event: Event) {
    event.preventDefault();

    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  }
}
