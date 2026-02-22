import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-admin-list-activity',
  imports: [CommonModule, AdminNavbarComponent, RouterLink],
  templateUrl: './admin-list-activity.component.html',
  styleUrl: './admin-list-activity.component.css',
})
export class AdminListActivityComponent implements OnInit {
  activities: any[] = [];
  private readonly API_URL = `${environment.apiUrl}/api/activities`;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchActivities();
  }

  fetchActivities() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(this.API_URL, { headers }).subscribe({
      next: (res) => {
        this.activities = res.sort((a, b) => {
          const dateA = new Date(a.updated_at).getTime();
          const dateB = new Date(b.updated_at).getTime();
          return dateB - dateA;
        });
      },
      error: (err) => console.error('Error fetching activities:', err),
    });
  }

  onEdit(id: number) {
    this.router.navigate(['/admin/edit-activity', id]);
  }

  onDelete(id: number) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?')) {
      const token = localStorage.getItem('token');
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http
        .delete(`${environment.apiUrl}/admin/activities/${id}`, { headers })
        .subscribe({
          next: () => {
            alert('ลบข้อมูลสำเร็จ');
            this.fetchActivities();
          },
          error: (err) => alert('ไม่สามารถลบข้อมูลได้'),
        });
    }
  }
}
