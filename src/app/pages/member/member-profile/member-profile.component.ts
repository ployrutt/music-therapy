import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { ActivityService } from '../../../services/activity.service';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  readHistory: any[] = [];
  favorites: any[] = [];

  constructor(
    private fb: FormBuilder, 
    private userService: UserService, 
    public authService: AuthService,      // public เพื่อให้ HTML เข้าถึงได้
    private activityService: ActivityService, // ฉีดเพื่อเรียก recordReadingHistory
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      phone_number: ['']
    });

    this.loadUserProfile();
    if (this.authService.getRole() === 'member') {
      this.loadMemberActivities();
    }
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
      error: (err: any) => console.error('Load Profile Error:', err)
    });
  }

  loadMemberActivities(): void {
    forkJoin({
      history: this.userService.getReadHistory().pipe(catchError(() => of([]))),
      favs: this.userService.getFavorites().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        this.readHistory = res.history;
        this.favorites = res.favs;
      },
      error: (err: any) => console.error('Load Activities Error:', err)
    });
  }

  // ฟังก์ชันเดียวสำหรับนำทาง + บันทึกการอ่าน
  goToActivity(id: any): void {
    if (!id) return;

    if (this.authService.isLoggedIn() && this.authService.getRole() === 'member') {
      // ยิง API บันทึกประวัติก่อนเปลี่ยนหน้า
      this.activityService.recordReadingHistory(id).subscribe({
        next: () => {
          this.router.navigate(['/activity', id]);
        },
        error: (err: any) => {
          console.error('Recording reading history failed:', err);
          // ถึงแม้ API จะพลาด ก็ยังให้ไปหน้ากิจกรรมต่อได้
          this.router.navigate(['/activity', id]);
        }
      });
    } else {
      this.router.navigate(['/activity', id]);
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.profileImagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  onRemoveImage(): void {
    this.userService.deleteProfileImage().subscribe({
      next: () => {
        this.profileImageUrl = '';
        this.profileImagePreview = null;
        this.selectedFile = null;
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
        this.router.navigate(['/member/profile']).then(() => window.location.reload());
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/activity']);
  }
}