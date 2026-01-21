import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})

export class RegisterComponent {
  registerData = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    date_of_birth: '',
    profile: null as File | null,
  };

  previewImage: string | null = null;

  private API_URL = 'http://localhost:8080/auth/register';

  constructor(private http: HttpClient, private router: Router) {}

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.registerData.profile = file;

      const reader = new FileReader();
      reader.onload = () => (this.previewImage = reader.result as string);
      reader.readAsDataURL(file);
    }
  }
  onSubmit() {
    const dob = new Date(this.registerData.date_of_birth);

    const dateOfBirthRFC3339 =
      dob.getUTCFullYear() +
      '-' +
      String(dob.getUTCMonth() + 1).padStart(2, '0') +
      '-' +
      String(dob.getUTCDate()).padStart(2, '0') +
      'T00:00:00Z';

    const payload = {
      first_name: this.registerData.first_name,
      last_name: this.registerData.last_name,
      email: this.registerData.email,
      password: this.registerData.password,
      phone_number: this.registerData.phone_number,
      date_of_birth: dateOfBirthRFC3339,
    };

    this.http.post(this.API_URL, payload).subscribe({
      next: () => alert('สมัครสมาชิกสำเร็จ'),
      error: (err) => console.error(err),
    });
    this.router.navigate(['/home']);
  }
}
