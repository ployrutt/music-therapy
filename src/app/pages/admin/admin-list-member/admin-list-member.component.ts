import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { UserService } from '../../../services/user.service';
@Component({
  selector: 'app-admin-list',
  imports: [CommonModule, AdminNavbarComponent],
  templateUrl: './admin-list-member.component.html',
  styleUrls: ['./admin-list-member.component.css'],
})
export class AdminListMemberComponent implements OnInit {
viewDetails(arg0: any) {
throw new Error('Method not implemented.');
}
  users: any[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        // ตรวจสอบว่า data เป็น array หรือไม่ (ป้องกันกรณี API ส่ง object มาหุ้ม)
        this.users = Array.isArray(data) ? data : (data as any).data || [];
      },
      error: (err) => {
        console.error('โหลดข้อมูลไม่สำเร็จ:', err);
        if (err.status === 401) alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
      },
    });
  }
calculateAge(birthDateString: string): number | string {
    if (!birthDateString || birthDateString.startsWith('0001')) {
      return '-'; // กรณีไม่มีข้อมูลวันเกิด
    }

    const birthDate = new Date(birthDateString);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // ถ้ายังไม่ถึงเดือนเกิด หรือถึงเดือนเกิดแล้วแต่ยังไม่ถึงวันที่เกิด ให้ลบอายุออก 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
