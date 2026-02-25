import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormControl,
  FormsModule
} from '@angular/forms';
import { Route,RouterLink } from '@angular/router';
@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule,ReactiveFormsModule,FormsModule,RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})

export class ForgotPasswordComponent implements OnInit {
  // ข้อมูลฟอร์ม
  email: string = '';
  token: string = '';
  newPassword: string = '';
  
  // สถานะหน้าจอ
  step: number = 1; // 1: ขอ Token, 2: ตั้งรหัสใหม่
  isLoading: boolean = false;
  message: string = '';
  error: string = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ตรวจสอบว่ามี Token แนบมากับ URL หรือไม่ (เช่น ?token=xxxx)
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
        this.step = 2; // ถ้ามี token ให้ข้ามไปหน้าตั้งรหัสใหม่ทันที
      }
    });
  }

  // ขั้นตอนที่ 1: ส่งคำขอไปที่ API /auth/forgot-password
  onSendEmail() {
    this.isLoading = true;
    this.error = '';
    this.message = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.message = res.message;
        this.isLoading = false;
        // สำหรับการทดสอบ: API ของคุณส่ง Token กลับมาให้เลย
        if (res.token) {
          console.log('Test Token (Copy this):', res.token);
          this.message += " (Token ถูกแสดงใน Console สำหรับการทดสอบ)";
        }
      },
      error: (err) => {
        this.error = err.error?.error || 'เกิดข้อผิดพลาดในการส่งอีเมล';
        this.isLoading = false;
      }
    });
  }

  // ขั้นตอนที่ 2: ส่งคำขอไปที่ API /auth/reset-password
  onResetPassword() {
    if (this.newPassword.length < 8) {
      this.error = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (res) => {
        alert('เปลี่ยนรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error?.error || 'รหัสรีเซ็ตไม่ถูกต้องหรือหมดอายุ';
        this.isLoading = false;
      }
    });
  }

  setStep(s: number) {
    this.step = s;
    this.error = '';
    this.message = '';
  }
}
