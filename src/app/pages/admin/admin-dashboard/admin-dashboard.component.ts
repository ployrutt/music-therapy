import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AdminNavbarComponent } from "../admin-navbar/admin-navbar.component";
import { UserService } from '../../../services/user.service';
import { ActivityService } from '../../../services/activity.service';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// นำเข้า Chart.js และลงทะเบียน Modules
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  imports: [AdminNavbarComponent,CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  users: any[] = [];
  activitiesCount: number = 0;
  
  // เก็บ Instance ของ Chart ไว้เพื่อสั่ง Update ข้อมูล
  visitChart: any;
  favoriteChart: any;

  @ViewChild('visitChart') visitChartRef!: ElementRef;
  @ViewChild('favoriteChart') favoriteChartRef!: ElementRef;

  constructor(
    private userService: UserService,
    private activityService: ActivityService
  ) {}

  ngOnInit(): void {
    this.loadUsersData();
  }

  ngAfterViewInit(): void {
    // สร้างโครงกราฟเปล่าๆ ไว้ก่อน
    this.initCharts();
    // โหลดข้อมูลจาก API มาใส่ในกราฟ
    this.loadChartData();
  }

  loadUsersData() {
    this.userService.getAllUsers().subscribe(res => {
      this.users = res;
    });
  }

  initCharts() {
    // กราฟสถิติการเข้าอ่าน (Line Chart)
    this.visitChart = new Chart(this.visitChartRef.nativeElement, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'จำนวนครั้งที่อ่าน', data: [], borderColor: '#0ec2a4', tension: 0.4 }] },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // กราฟกิจกรรมยอดนิยม (Bar Chart)
    this.favoriteChart = new Chart(this.favoriteChartRef.nativeElement, {
      type: 'bar',
      data: { labels: [], datasets: [{ label: 'จำนวนการถูกใจ', data: [], backgroundColor: '#3182ce' }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  loadChartData() {
    // 1. ดึงประวัติการอ่านมาทำกราฟเส้น
    this.userService.getReadHistory().subscribe((history: any[]) => {
      // Logic: นับจำนวนครั้งที่อ่านแยกตามวัน (สมมติว่าใน data มี field 'read_at')
      const stats = this.groupByDate(history);
      this.visitChart.data.labels = stats.labels;
      this.visitChart.data.datasets[0].data = stats.data;
      this.visitChart.update();
    });

    // 2. ดึงกิจกรรมทั้งหมดเพื่อดูยอด Favorite (สมมติว่ากิจกรรมมี field 'favorite_count' หรือ 'favorites')
    this.activityService.getAllActivities().subscribe((activities: any[]) => {
      this.activitiesCount = activities.length;
      
      // เรียงลำดับตัวที่ยอดไลก์เยอะสุด 5 อันดับแรก
      const topActivities = activities
        .sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0))
        .slice(0, 5);

      this.favoriteChart.data.labels = topActivities.map(a => a.title);
      this.favoriteChart.data.datasets[0].data = topActivities.map(a => a.favorite_count || 0);
      this.favoriteChart.update();
    });
  }

  // ฟังก์ชันช่วยจัดกลุ่มวันที่สำหรับกราฟเส้น
  groupByDate(history: any[]) {
    const counts: any = {};
    history.forEach(item => {
      // ตัดเอาแค่วันที่ (YYYY-MM-DD)
      const date = new Date(item.read_at).toLocaleDateString('th-TH');
      counts[date] = (counts[date] || 0) + 1;
    });
    return {
      labels: Object.keys(counts),
      data: Object.values(counts)
    };
  }

  onAddMember() {
    // Logic ไปหน้าเพิ่มสมาชิก
  }

  onDeleteUser(id: number) {
    if (confirm('ยืนยันการลบผู้ใช้?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsersData());
    }
  }
}