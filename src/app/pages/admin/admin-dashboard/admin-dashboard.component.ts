import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { UserService } from '../../../services/user.service';
import { ActivityService } from '../../../services/activity.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [AdminNavbarComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
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
  charts: Chart[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private activityService: ActivityService,
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
      role_id: [null, Validators.required],
      date_of_birth: ['', Validators.required],
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe((data) => {
      this.users = data;
    });
  }

  loadActivityData() {
    this.activityService.getAllActivities().subscribe((acts) => {
      this.activities = acts;
      this.activityService.getAdminDashboard().subscribe({
        next: (data) => {
          setTimeout(() => this.initCharts(data), 0);
        },
        error: (err) => {
          console.error('ดึงข้อมูล Dashboard ล้มเหลว:', err);
        }
      });
    });
  }

  initCharts(dashboardData: any) {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];

    if (!dashboardData) return;

    const monthData = this.calculateMonthlyViews();
    this.charts.push(
      new Chart(this.lineCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: monthData.labels,
          datasets: [
            {
              label: 'ยอดเข้าชมรวม',
              data: monthData.values,
              borderColor: '#0ec2a4',
              backgroundColor: 'rgba(14, 194, 164, 0.1)',
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      }),
    );

    this.charts.push(
      new Chart(this.barCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: dashboardData.top_fav_activities.map((a: any) => a.title),
          datasets: [
            {
              label: 'จำนวนรายการโปรด',
              data: dashboardData.top_fav_activities.map((a: any) => a.fav_count),
              backgroundColor: '#f78cba',
              borderRadius: 8,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      }),
    );

    this.charts.push(
      new Chart(this.goalCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: dashboardData.top_read_goals.map((g: any) => g.name),
          datasets: [
            {
              label: 'ยอดการอ่าน',
              data: dashboardData.top_read_goals.map((g: any) => g.total_read),
              backgroundColor: '#0ec2a4',
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
        },
      }),
    );

    this.charts.push(
      new Chart(this.categoryCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: dashboardData.top_fav_categories.map((c: any) => c.name),
          datasets: [
            {
              data: dashboardData.top_fav_categories.map((c: any) => c.count),
              backgroundColor: [
                '#4dbdff',
                '#0ec2a4',
                '#f78cba',
                '#ffcd56',
                '#9966ff',
              ],
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      }),
    );
  }

  onDeleteUser(id: number) {
    if (confirm('ยืนยันการลบสมาชิก? หากลบแล้วข้อมูลจะไม่สามารถกู้คืนได้')) {
      this.userService.deleteUser(id).subscribe(() => {
        alert('ลบสมาชิกเรียบร้อยแล้ว');
        this.loadUsers();
      });
    }
  }

  onSubmitMember() {
    if (this.memberForm.valid) {
      const rawData = this.memberForm.value;
      const payload = {
        ...rawData,
        role_id: Number(rawData.role_id),
        date_of_birth: new Date(rawData.date_of_birth).toISOString(),
      };

      this.userService.addMember(payload).subscribe({
        next: (res) => {
          this.showModal = false;
          this.memberForm.reset({ role_id: 2 });
          alert('บันทึกข้อมูลสมาชิกใหม่เรียบร้อยแล้ว');
          this.loadUsers();
        },
        error: (err) => {
          console.error('Add member error:', err);
          alert('เกิดข้อผิดพลาด: ' + (err.error?.error || 'ข้อมูลไม่ถูกต้องหรือใส่ไม่ครบ'));
        },
      });
    }
  }

  private calculateMonthlyViews() {
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    const values = new Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    this.activities.forEach((act) => {
      const date = new Date(act.updated_at || act.created_at);
      if (date.getFullYear() === currentYear) {
        values[date.getMonth()] += act.view_count || 0;
      }
    });

    return { labels: months, values };
  }
}