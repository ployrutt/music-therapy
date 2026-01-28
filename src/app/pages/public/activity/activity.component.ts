import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../../../services/activity.service';
import { AuthService } from '../../../services/auth.service';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; 
import { catchError, of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css',
})
export class ActivityComponent implements OnInit {
  allActivities: any[] = [];
  filteredActivities: any[] = [];
  isLoading: boolean = true;
  searchQuery: string = '';
  selectedCategory: string = 'ทั้งหมด';
  favoriteIds: number[] = []; // เก็บเป็น Array ของตัวเลขเพื่อการเปรียบเทียบที่แม่นยำ

  categories: string[] = [
    'พัฒนาการทางสติปัญญา', 'พัฒนาการทางร่างกาย', 'พัฒนาการทางอารมณ์',
    'พัฒนาการทางสังคม', 'การร้องเพลง', 'การฟัง',
    'การเคลื่อนไหว', 'การบรรเลงเครื่องดนตรี',
  ];

  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // หมายเหตุ: ไม่ต้องส่ง Headers แล้วเพราะ authInterceptor จะดึง token จาก localStorage ให้เอง
    forkJoin({
      activities: this.activityService.getAllActivities().pipe(catchError(() => of([]))),
      favorites: this.http.get<any[]>('http://localhost:8080/api/favorites').pipe(
        catchError((err) => {
          console.warn('Favorite API Error:', err.status);
          return of([]);
        })
      )
    }).subscribe({
      next: (res) => {
        // 1. จัดการข้อมูล Favorite IDs: ดึงเฉพาะ ID มาเก็บไว้เป็น Array ของตัวเลข
        this.favoriteIds = res.favorites.map((f: any) => {
          // ตรวจสอบทุกรูปแบบที่ ID อาจจะอยู่ (f.activity_id หรือ f.ActivityID หรือในก้อน activity)
          const id = f.activity_id || f.id || (f.activity ? f.activity.id : null);
          return id ? Number(id) : null;
        }).filter(id => id !== null) as number[];

        console.log('Processed Favorite IDs:', this.favoriteIds);

        const rawActivities = Array.isArray(res.activities) ? res.activities : [];
        
        // 2. แมปข้อมูล Activity หลัก และตรวจสอบสถานะ Favorite ทันที
        this.allActivities = rawActivities.map((activity: any) => {
          const currentId = Number(activity.activity_id || activity.id);
          return {
            ...activity,
            activity_id: currentId, // บังคับให้เป็นชื่อเดียวกันเพื่อใช้ใน HTML
            is_favorite: this.favoriteIds.includes(currentId)
          };
        });

        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Fatal load error:', err);
        this.isLoading = false;
      }
    });
  }

  toggleFavorite(activity: any): void {
    if (!this.authService.isLoggedIn()) {
      alert('กรุณาเข้าสู่ระบบก่อนเลือกรายการโปรด');
      return;
    }

    const id = Number(activity.activity_id || activity.id);
    const url = `http://localhost:8080/api/activities/${id}/favorite`;

    // Optimistic Update: เปลี่ยนสถานะที่หน้าจอทันทีเพื่อความรวดเร็ว
    const previousState = activity.is_favorite;
    activity.is_favorite = !activity.is_favorite;

    // ส่ง Request ไปยัง Backend (Interceptor จะแนบ Token ให้เอง)
    this.http.post(url, {}).subscribe({
      next: () => {
        console.log(`Updated favorite for activity ${id}`);
        // อัปเดตในลิสต์หลัก allActivities ให้ข้อมูลตรงกัน
        const mainItem = this.allActivities.find(a => Number(a.activity_id) === id);
        if (mainItem) mainItem.is_favorite = activity.is_favorite;
      },
      error: (err) => {
        console.error('Toggle failed:', err);
        // หาก API ล้มเหลว ให้เปลี่ยนสถานะกลับคืน (Rollback)
        activity.is_favorite = previousState;
        if (err.status === 401) alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
      }
    });
  }

  applyFilters(): void {
    this.filteredActivities = this.allActivities.filter((activity) => {
      const title = (activity.title || '').toLowerCase();
      const matchesSearch = title.includes(this.searchQuery.toLowerCase());
      
      const allTags = [
        ...(activity.selected_sub_goals?.map((g: any) => g.sub_goal_name) || []),
        ...(activity.selected_sub_categories?.map((c: any) => c.sub_category_name) || []),
      ];

      const matchesCategory = this.selectedCategory === 'ทั้งหมด' || allTags.includes(this.selectedCategory);
      
      return matchesSearch && matchesCategory;
    });
  }

  onSearch(event: any): void {
    this.searchQuery = event.target?.value || '';
    this.applyFilters();
  }

  selectCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? 'ทั้งหมด' : category;
    this.applyFilters();
  }
}