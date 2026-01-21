
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { ActivityService } from '../../../services/activity.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-activity-detail',
  imports: [CommonModule],
  templateUrl: './activity-detail.component.html',
  styleUrl: './activity-detail.component.css'
})
export class ActivityDetailComponent implements OnInit {
  // activity: any = null;

  // // เพิ่ม route ใน constructor
  // constructor(
  //   private http: HttpClient, 
  //   private location: Location,
  //   private route: ActivatedRoute 
  // ) {}

  // ngOnInit(): void {
  //   // 1. ดึง ID จาก URL parameter (เช่น /activity/26)
  //   const id = this.route.snapshot.paramMap.get('id');

  //   if (id) {
  //     // 2. ใช้ Template Literal (backticks) เพื่อใส่ id เข้าไปใน URL
  //     this.http.get(`http://localhost:8080/api/activities/${id}`).subscribe({
  //       next: (data) => {
  //         this.activity = data;
  //       },
  //       error: (err) => {
  //         console.error('ไม่สามารถดึงข้อมูลได้', err);
  //       }
  //     });
  //   }
  // }

  // goBack(): void {
  //   this.location.back();
  // }

  activity: any = null;

  constructor(
    private http: HttpClient, 
    private location: Location,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get(`http://localhost:8080/api/activities/${id}`).subscribe({
        next: (data) => {
          this.activity = data;
          console.log('Activity Data:', data); // ตรวจสอบข้อมูลที่ได้จาก API
        },
        error: (err) => {
          console.error('ไม่สามารถดึงข้อมูลได้', err);
        }
      });
    }
  }

  // ฟังก์ชันช่วยเช็คว่า string ของรูปภาพใช้งานได้จริงหรือไม่
  isValidImage(img: string | null): boolean {
    return !!img && img !== '0' && img !== '';
  }

  goBack(): void {
    this.location.back();
  }
}