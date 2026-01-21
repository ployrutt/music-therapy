import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  submitError = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get f(): any {
    return this.loginForm.controls;
  }

  togglePassword() {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit() {
    this.submitError = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        const userRole = res.role;

        if (userRole === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/activity']);
        }
      },

      error: (error: HttpErrorResponse) => {
        switch (error.status) {
          case 404:
            this.submitError = 'ไม่พบอีเมลนี้ในระบบ';
            break;
          case 401:
            this.submitError = 'รหัสผ่านไม่ถูกต้อง';
            break;
          case 400:
            this.submitError = 'ข้อมูลไม่ถูกต้อง';
            break;
          default:
            this.submitError = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
        }
      },
    });
  }
}
