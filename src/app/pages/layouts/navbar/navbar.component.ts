
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {

  user: any = null;
  isDropdownOpen = false;
  private userSub!: Subscription; // เก็บตัวติดตามข้อมูล

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // ดักฟังข้อมูล User จาก Service: ถ้าใน Service มีการอัปเดต (เช่น หลัง Login)
    // ตัวแปร user ในนี้จะเปลี่ยนตามทันทีโดยไม่ต้องรีเฟรช
    this.userSub = this.authService.user$.subscribe(userData => {
      this.user = userData;
    });
  }

  ngOnDestroy() {
    // ยกเลิกการติดตามเมื่อปิด Navbar เพื่อประหยัด Memory
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  goToAdmin() {
  this.isDropdownOpen = false; // ปิด dropdown ก่อนไป
  this.router.navigate(['/admin']); // ใส่ path admin ของคุณที่นี่
}

  goToProfile() {
    this.isDropdownOpen = false;
    this.router.navigate(['/member/profile']);
  }

  logout() {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      this.isDropdownOpen = false;
      this.authService.logout();
      this.router.navigate(['/home']);
    }
  }
}