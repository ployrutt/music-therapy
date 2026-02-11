import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminNavbarComponent } from "../admin-navbar/admin-navbar.component";
import { UserService } from '../../../services/user.service';
import { ActivityService } from '../../../services/activity.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AdminNavbarComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;

  users: any[] = [];
  activities: any[] = [];
  showModal = false;
  memberForm!: FormGroup;
  
  lineChart: any;
  barChart: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
  }

  // ใช้ AfterViewInit เพื่อให้มั่นใจว่า Canvas พร้อมใช้งานก่อนวาดกราฟ
  ngAfterViewInit(): void {
    this.loadActivityData();
  }

  initForm() {
    this.memberForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone_number: ['', Validators.required],
      role_id: [2, Validators.required],
      date_of_birth: ['', Validators.required]
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(data => this.users = data);
  }

  loadActivityData() {
    this.activityService.getAllActivities().subscribe({
      next: (data) => {
        this.activities = data;
        // ใช้ setTimeout เพื่อรอให้ DOM อัปเดตข้อมูลจาก API ก่อนเริ่มวาดกราฟ
        setTimeout(() => this.initCharts(), 0);
      }
    });
  }

  initCharts() {
    if (this.lineChart) this.lineChart.destroy();
    if (this.barChart) this.barChart.destroy();
    if (!this.lineCanvas || this.activities.length === 0) return;

    // กราฟเส้น - ยอดการเข้าชม
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: this.activities.slice(0, 7).map(a => a.title),
        datasets: [{
          label: 'ยอดการเข้าชม',
          data: this.activities.slice(0, 7).map(a => a.view_count || 0),
          borderColor: '#0ec2a4',
          backgroundColor: 'rgba(14, 194, 164, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // กราฟแท่ง - กิจกรรมยอดนิยม
    const topFavs = [...this.activities].sort((a,b) => (b.favorite_count || 0) - (a.favorite_count || 0)).slice(0, 5);
    this.barChart = new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: topFavs.map(a => a.title),
        datasets: [{
          label: 'รายการโปรด',
          data: topFavs.map(a => a.favorite_count || 0),
          backgroundColor: '#f78cba',
          borderRadius: 8
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  onDeleteUser(id: number) {
    if (confirm('ยืนยันการลบสมาชิก?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }

  onSubmitMember() {
    if (this.memberForm.valid) {
      this.userService.addMember(this.memberForm.value).subscribe(() => {
        this.showModal = false;
        this.memberForm.reset({ role_id: 2 });
        this.loadUsers();
      });
    }
  }
}