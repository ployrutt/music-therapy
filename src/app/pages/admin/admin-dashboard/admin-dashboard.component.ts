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
  @ViewChild('goalCanvas') goalCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryCanvas') categoryCanvas!: ElementRef<HTMLCanvasElement>;

  users: any[] = [];
  activities: any[] = [];
  showModal = false;
  memberForm!: FormGroup;
  
  // Chart Instances
  charts: Chart[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
  }

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
    this.userService.getAllUsers().subscribe(data => {
      // กรองเฉพาะ Member เท่านั้น
      this.users = data.filter((u: any) => u.role_name === 'member');
    });
  }

  loadActivityData() {
    this.activityService.getAllActivities().subscribe({
      next: (data) => {
        this.activities = data;
        setTimeout(() => this.initCharts(), 0);
      }
    });
  }

  initCharts() {
    // ล้างกราฟเก่าก่อนสร้างใหม่
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    if (this.activities.length === 0) return;

    // 1. กราฟเส้น: ยอดการเข้าชมแยกตามเดือน (ปีปัจจุบัน)
    const monthData = this.calculateMonthlyViews();
    this.charts.push(new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: monthData.labels,
        datasets: [{
          label: 'ยอดเข้าชมรวม',
          data: monthData.values,
          borderColor: '#0ec2a4',
          backgroundColor: 'rgba(14, 194, 164, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    }));

    // 2. กราฟแท่ง: กิจกรรมที่ถูกใจสูงสุด (Favorite)
    const topFavs = [...this.activities].sort((a,b) => (b.favorite_count || 0) - (a.favorite_count || 0)).slice(0, 5);
    this.charts.push(new Chart(this.barCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: topFavs.map(a => a.title),
        datasets: [{
          label: 'จำนวนรายการโปรด',
          data: topFavs.map(a => a.favorite_count || 0),
          backgroundColor: '#f78cba',
          borderRadius: 8
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    }));

    // 3. กราฟเป้าหมายกิจกรรม (Goal Analysis) - Stacked Bar
    const goalStats = this.aggregateMetadata('sub_goals', 'sub_goal_name');
    this.charts.push(new Chart(this.goalCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: goalStats.labels,
        datasets: [
          { label: 'ยอดอ่าน', data: goalStats.views, backgroundColor: '#0ec2a4' },
          { label: 'รายการโปรด', data: goalStats.favs, backgroundColor: '#4dbdff' }
        ]
      },
      options: { 
        indexAxis: 'y', 
        responsive: true, 
        maintainAspectRatio: false,
        scales: { x: { stacked: true }, y: { stacked: true } }
      }
    }));

    // 4. กราฟหมวดหมู่กิจกรรม (Category Analysis) - Doughnut
    const catStats = this.aggregateMetadata('sub_categories', 'sub_category_name');
    this.charts.push(new Chart(this.categoryCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: catStats.labels,
        datasets: [{
          data: catStats.favs,
          backgroundColor: ['#4dbdff', '#0ec2a4', '#f78cba', '#ffcd56', '#9966ff']
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    }));
  }

  // Helper: คำนวณยอดเข้าชมแยกตามเดือน
  private calculateMonthlyViews() {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const values = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    this.activities.forEach(act => {
      // ใช้ field updated_at หรือ created_at เป็นตัวอ้างอิงเวลา (ขึ้นอยู่กับข้อมูล API)
      const date = new Date(act.updated_at);
      if (date.getFullYear() === currentYear) {
        values[date.getMonth()] += (act.view_count || 0);
      }
    });

    return { labels: months, values };
  }

  // Helper: สรุปข้อมูลตามเป้าหมายหรือหมวดหมู่
  private aggregateMetadata(arrayKey: string, nameKey: string) {
    const map = new Map<string, { views: number, favs: number }>();

    this.activities.forEach(act => {
      const items = act[arrayKey] || [];
      items.forEach((item: any) => {
        const name = item[nameKey];
        const current = map.get(name) || { views: 0, favs: 0 };
        map.set(name, {
          views: current.views + (act.view_count || 0),
          favs: current.favs + (act.favorite_count || 0)
        });
      });
    });

    const sorted = Array.from(map.entries()).sort((a,b) => b[1].favs - a[1].favs).slice(0, 5);
    return {
      labels: sorted.map(s => s[0]),
      views: sorted.map(s => s[1].views),
      favs: sorted.map(s => s[1].favs)
    };
  }

  onDeleteUser(id: number) {
    if (confirm('ยืนยันการลบสมาชิก?')) {
      this.userService.deleteUser(id).subscribe(() => {
        alert('ลบสำเร็จ');
        this.loadUsers();
      });
    }
  }

  onSubmitMember() {
    if (this.memberForm.valid) {
      this.userService.addMember(this.memberForm.value).subscribe(() => {
        alert('บันทึกสำเร็จ');
        this.showModal = false;
        this.memberForm.reset({ role_id: 2 });
        this.loadUsers();
      });
    }
  }
}