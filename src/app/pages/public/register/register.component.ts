// import { HttpClient } from '@angular/common/http';
// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import {
//   Router,
//   RouterLink,
//   RouterLinkActive,
//   RouterOutlet,
// } from '@angular/router';
// import { environment } from '../../../../environments/environment';
// @Component({
//   selector: 'app-register',
//   imports: [CommonModule, FormsModule,RouterLink],
//   templateUrl: './register.component.html',
//   styleUrl: './register.component.css',
// })

// export class RegisterComponent {
//   registerData = {
//     first_name: '',
//     last_name: '',
//     email: '',
//     password: '',
//     phone_number: '',
//     date_of_birth: '',
//     profile: null as File | null,
//   };

//   showPassword = false;
//   previewImage: string | null = null;

//   private API_URL = `${environment.apiUrl}/auth/register`;

//   constructor(private http: HttpClient, private router: Router) {}

//   onFileSelected(event: Event) {
//     const file = (event.target as HTMLInputElement).files?.[0];
//     if (file) {
//       this.registerData.profile = file;

//       const reader = new FileReader();
//       reader.onload = () => (this.previewImage = reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   }
//   onSubmit() {
//     const dob = new Date(this.registerData.date_of_birth);

//     const dateOfBirthRFC3339 =
//       dob.getUTCFullYear() +
//       '-' +
//       String(dob.getUTCMonth() + 1).padStart(2, '0') +
//       '-' +
//       String(dob.getUTCDate()).padStart(2, '0') +
//       'T00:00:00Z';

//     const payload = {
//       first_name: this.registerData.first_name,
//       last_name: this.registerData.last_name,
//       email: this.registerData.email,
//       password: this.registerData.password,
//       phone_number: this.registerData.phone_number,
//       date_of_birth: dateOfBirthRFC3339,
//     };

//     this.http.post(this.API_URL, payload).subscribe({
//       next: () => alert('สมัครสมาชิกสำเร็จ'),
//       error: (err) => console.error(err),
//     });
//     this.router.navigate(['/home']);
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  submitError = '';
  previewImage: string | null = null;
  selectedFile: File | null = null;

  private API_URL = `${environment.apiUrl}/auth/register`;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    // สร้างฟอร์มพร้อมเงื่อนไข Validate
    this.registerForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phone_number: ['', Validators.required],
      date_of_birth: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  // Getter สำหรับดึง control ไปเช็คใน HTML ง่ายๆ (เหมือนหน้า Login)
  get f() {
    return this.registerForm.controls;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewImage = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.submitError = '';

    // ถ้าฟอร์มไม่ถูกต้อง ให้ Mark เป็น Touched เพื่อโชว์ Error ในหน้าเว็บ
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const rawData = this.registerForm.value;
    
    // แปลงวันที่เป็น RFC3339 สำหรับ Backend Go
    const dob = new Date(rawData.date_of_birth);
    const payload = {
      ...rawData,
      date_of_birth: dob.toISOString(),
    };

    this.http.post(this.API_URL, payload).subscribe({
      next: () => {
        alert('สมัครสมาชิกสำเร็จ');
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        // จัดการ Error เหมือนหน้า Login
        if (error.status === 409) {
          this.submitError = 'อีเมลนี้ถูกใช้งานไปแล้ว';
        } else {
          this.submitError = error.error?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
        }
      },
    });
  }
}