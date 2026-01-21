
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private API_URL = 'http://localhost:8080/api';
  private ADMIN_URL = 'http://localhost:8080/admin';

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
  deleteUser(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.ADMIN_URL}/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
  }
  //---------------------------
  // ส่วนของ Admin (จัดการสมาชิก)
  //---------------------------
  // getProfile(): Observable<any> {
  //   return this.http.get<any>(`${this.API_URL}/profile`, {
  //     headers: this.getAuthHeaders(),
  //   });
  // }

  // updateProfile(data: any): Observable<any> {
  //   return this.http.put<any>(`${this.API_URL}/profile`, data, {
  //     headers: this.getAuthHeaders(),
  //   });
  // }

  // deleteProfileImage(): Observable<any> {
  //   return this.http.delete<any>(`${this.API_URL}/profile/image`, {
  //     headers: this.getAuthHeaders(),
  //   });
  // }
}
