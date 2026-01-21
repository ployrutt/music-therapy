import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../../../services/activity.service';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-activity',
  standalone: true, // เพิ่ม standalone หากคุณใช้ Angular 17+
  imports: [CommonModule, RouterLink],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css',
})
export class ActivityComponent implements OnInit {
  // เก็บข้อมูลทั้งหมดที่โหลดมาจาก API
  allActivities: any[] = [];

  // ข้อมูลที่ผ่านการกรองแล้วเพื่อแสดงผล
  filteredActivities: any[] = [];

  // สถานะการโหลด
  isLoading: boolean = true;

  // สถานะการกรอง
  searchQuery: string = '';
  selectedCategory: string = 'ทั้งหมด';

  // รายการหมวดหมู่สำหรับปุ่ม Filter
  categories: string[] = [
    'พัฒนาการทางสติปัญญา',
    'พัฒนาการทางร่างกาย',
    'พัฒนาการทางอารมณ์',
    'พัฒนาการทางสังคม',
    'การร้องเพลง',
    'การฟัง',
    'การเคลื่อนไหว',
    'การบรรเลงเครื่องดนตรี',
  ];

  constructor(
    private activityService: ActivityService,
    private route: ActivatedRoute // เพิ่มบรรทัดนี้ใน constructor
  ) {}

  ngOnInit(): void {
    this.loadActivitiesFromApi(); // เรียกฟังก์ชันโหลดข้อมูล
  }

  loadActivitiesFromApi(): void {
    this.isLoading = true;
    // เรียกใช้ getAllActivities เพื่อให้ได้ข้อมูลแบบ Array
    this.activityService.getAllActivities().subscribe({
      next: (data) => {
        this.allActivities = data; // ข้อมูลที่ได้จะเป็นรายการกิจกรรมทั้งหมด
        this.filteredActivities = [...this.allActivities];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('โหลดข้อมูลไม่สำเร็จ:', err);
        this.isLoading = false;
      },
    });
  }

  // --- ส่วน Logic การ Filter (เหมือนเดิมแต่ย้ายมาเช็คข้อมูลจาก API) ---
  onSearch(event: any): void {
    this.searchQuery = event.target.value.toLowerCase();
    this.applyFilters();
  }

  selectCategory(category: string): void {
    this.selectedCategory =
      this.selectedCategory === category ? 'ทั้งหมด' : category;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredActivities = this.allActivities.filter((activity) => {
      // 1. ตรวจสอบเงื่อนไขการค้นหา (Title)
      const matchesSearch = activity.title
        ?.toLowerCase()
        .includes(this.searchQuery);

      // 2. ตรวจสอบเงื่อนไขหมวดหมู่ (Tags)
      const allTags = [
        ...(activity.selected_sub_goals?.map((g: any) => g.sub_goal_name) ||
          []),
        ...(activity.selected_sub_categories?.map(
          (c: any) => c.sub_category_name
        ) || []),
      ];

      const matchesCategory =
        this.selectedCategory === 'ทั้งหมด' ||
        allTags.includes(this.selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }
}
