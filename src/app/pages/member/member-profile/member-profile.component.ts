import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service'; // ตรวจสอบ Path นี้ให้ดี
import { Router } from '@angular/router';

@Component({
  selector: 'app-member-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.css']
})
export class MemberProfileComponent implements OnInit {
  profileForm!: FormGroup;
  profileImageUrl: string = ''; 
  profileImagePreview: string | ArrayBuffer | null = null; 
  selectedFile: File | null = null; 

  constructor(
    private fb: FormBuilder, 
    private userService: UserService, 
    private router: Router
  ) {}
  ngOnInit(): void {
    this.profileForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      phone_number: ['']
    });
    this.loadUserProfile();
  }
  loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: (profile: any) => {
        this.profileForm.patchValue({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_number: profile.phone_number
        });
        this.profileImageUrl = profile.profile;
        this.profileImagePreview = null;
      },
      error: (err: any) => console.error('Load Error:', err)
    });
  }
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
  onRemoveImage(): void {
    this.userService.deleteProfileImage().subscribe({
      next: () => {
        this.profileImageUrl = '';
        this.profileImagePreview = null;
        this.selectedFile = null;
        console.log('Deleted successfully');
      },
      error: (err: any) => {
        console.error('Delete Error:', err);
        alert('ลบรูปภาพไม่สำเร็จ');
      }
    });
  }
  onSave(): void {
    const body = {
      ...this.profileForm.value,
      profile: this.profileImagePreview || this.profileImageUrl || '' 
    };
    this.userService.updateProfile(body).subscribe({
      next: () => {
        alert('บันทึกข้อมูลสำเร็จ');
        this.router.navigate(['/activity']).then(() => {
          window.location.reload(); 
        });
      },
      error: (err: any) => {
        alert('บันทึกไม่สำเร็จ: ' + (err.error?.message || err.message));
      }
    });
  }
  onCancel(): void {
    this.router.navigate(['/activity']);
  }
}