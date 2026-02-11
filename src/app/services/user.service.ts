import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = `${environment.apiUrl}/api`;
  private ADMIN_URL = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/profile`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/profile`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteProfileImage(): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/profile/image`, {
      headers: this.getAuthHeaders(),
    });
  }
  //---------------------------
  // ส่วนของ Admin (จัดการสมาชิก)
  //---------------------------
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.ADMIN_URL}/users`, {
      headers: this.getAuthHeaders(),
    });
  }
  // แก้ไข: ใช้ /admin/roles สำหรับลบ
  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.ADMIN_URL}/roles/${userId}`, { headers: this.getAuthHeaders() });
  }

  // เพิ่ม: ใช้ /admin/roles สำหรับเพิ่มสมาชิก
  addMember(userData: any): Observable<any> {
    return this.http.post<any>(`${this.ADMIN_URL}/roles`, userData, { headers: this.getAuthHeaders() });
  }

  getReadHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/read-history`, {
      headers: this.getAuthHeaders(),
    });
  }

  getFavorites(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/favorites`, {
      headers: this.getAuthHeaders(),
    });
  }

  
}
