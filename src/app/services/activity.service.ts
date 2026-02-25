import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private apiUrl = `${environment.apiUrl}/api/activities`;
  private favoriteUrl = `${environment.apiUrl}/api/favorites`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getActivity(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getAllActivities(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUserFavorites(): Observable<any[]> {
    return this.http.get<any[]>(this.favoriteUrl, {
      headers: this.getHeaders(),
    });
  }

  toggleFavorite(id: number | string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${id}/favorite`,
      {},
      { headers: this.getHeaders() },
    );
  }

  recordReadingHistory(id: number | string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${id}/read`,
      {},
      { headers: this.getHeaders() },
    );
  }

// 1. เพิ่มตัวแปร ADMIN_URL (ถ้ายังไม่มี) ให้ตรงกับ Router
private ADMIN_URL = `${environment.apiUrl}/admin`;

// 2. แก้ไขฟังก์ชัน getAdminDashboard ให้ตรงกับ Path ใน Go
getAdminDashboard(startDate?: string, endDate?: string): Observable<any> {
  let params = '';
  if (startDate && endDate) {
    params = `?start=${startDate}&end=${endDate}`;
  }
  
  // แก้ไข Path เป็น /dashboard/stats ตาม admin.GET("/dashboard/stats") ใน Go
  // และใช้ getHeaders() ตามชื่อฟังก์ชันเดิมที่มีอยู่ในไฟล์ของคุณ
  return this.http.get<any>(`${this.ADMIN_URL}/dashboard/stats${params}`, {
    headers: this.getHeaders() 
  });
}
}
