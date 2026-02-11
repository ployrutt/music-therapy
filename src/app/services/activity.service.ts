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

  // POST: บันทึกประวัติการอ่าน/นับจำนวนการอ่าน
  recordReadingHistory(id: number | string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${id}/read`,
      {},
      { headers: this.getHeaders() },
    );
  }
}
