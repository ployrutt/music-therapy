import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityService } from '../../../services/activity.service';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { catchError, of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css',
})
export class ActivityComponent implements OnInit {
  allActivities: any[] = [];
  filteredActivities: any[] = [];
  isLoading: boolean = true;
  searchQuery: string = '';
  selectedCategory: string = 'ทั้งหมด';

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
    public authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  isMember(): boolean {
    return this.authService.getRole() === 'member';
  }

  loadData(): void {
    this.isLoading = true;

    const requests = {
      activities: this.activityService
        .getAllActivities()
        .pipe(catchError(() => of([]))),
      favorites: this.authService.isLoggedIn()
        ? this.activityService.getUserFavorites().pipe(catchError(() => of([])))
        : of([]),
    };

    forkJoin(requests).subscribe({
      next: (res) => {
        console.log('ข้อมูล Favorites จาก API:', res.favorites);

        const favoriteIds = res.favorites
          .map((f: any) => {
            const id =
              f.activity_id || f.id || (f.activity ? f.activity.id : null);
            return id ? Number(id) : null;
          })
          .filter((id) => id !== null);

        this.allActivities = res.activities.map((activity: any) => {
          const currentId = Number(activity.activity_id || activity.id);
          return {
            ...activity,
            activity_id: currentId,
            is_favorite: favoriteIds.includes(currentId),
          };
        });

        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Load error:', err);
        this.isLoading = false;
      },
    });
  }

  onReadActivity(activity: any): void {
    const id = activity.activity_id || activity.id;

    if (this.authService.isLoggedIn() && this.isMember()) {
      this.activityService.recordReadingHistory(id).subscribe({
        next: () => {
          console.log(`บันทึกประวัติการอ่านกิจกรรมที่ ${id} สำเร็จ`);

          this.router.navigate(['/activity', id]);
        },
        error: (err) => {
          console.error('ไม่สามารถบันทึกประวัติการอ่านได้:', err);

          this.router.navigate(['/activity', id]);
        },
      });
    } else {
      this.router.navigate(['/activity', id]);
    }
  }

  toggleFavorite(activity: any): void {
    if (!this.authService.isLoggedIn() || !this.isMember()) {
      alert('เฉพาะสมาชิกที่เข้าสู่ระบบเท่านั้นที่สามารถกดรายการโปรดได้');
      return;
    }

    const id = activity.activity_id;
    const previousState = activity.is_favorite;

    activity.is_favorite = !activity.is_favorite;

    this.activityService.toggleFavorite(id).subscribe({
      next: () => {
        console.log(`Updated favorite for activity ${id}`);
      },
      error: (err) => {
        console.error('Toggle failed:', err);
        activity.is_favorite = previousState;
        if (err.status === 401) alert('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
      },
    });
  }

  applyFilters(): void {
    this.filteredActivities = this.allActivities.filter((activity) => {
      const matchesSearch = activity.title
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase());

      if (this.selectedCategory === 'ทั้งหมด') {
        return matchesSearch;
      }

      const matchesGoal = activity.selected_sub_goals?.some((subGoal: any) => {
        if (this.selectedCategory === 'พัฒนาการทางสติปัญญา')
          return subGoal.goal_id === 1;
        if (this.selectedCategory === 'พัฒนาการทางร่างกาย')
          return subGoal.goal_id === 2;
        if (this.selectedCategory === 'พัฒนาการทางอารมณ์')
          return subGoal.goal_id === 3;
        if (this.selectedCategory === 'พัฒนาการทางสังคม')
          return subGoal.goal_id === 4;
        return false;
      });

      const matchesMainCat = activity.selected_sub_categories?.some(
        (subCat: any) => {
          if (this.selectedCategory === 'การร้องเพลง')
            return subCat.category_id === 1;
          if (this.selectedCategory === 'การฟัง')
            return subCat.category_id === 2;
          if (this.selectedCategory === 'การเคลื่อนไหว')
            return subCat.category_id === 3;
          if (this.selectedCategory === 'การบรรเลงเครื่องดนตรี')
            return subCat.category_id === 4;
          return false;
        },
      );

      return matchesSearch && (matchesGoal || matchesMainCat);
    });
  }
  onSearch(event: any): void {
    this.searchQuery = event.target?.value || '';
    this.applyFilters();
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  filterByTag(tagName: string): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.selectedCategory = tagName;
    this.applyFilters();
  }
}
