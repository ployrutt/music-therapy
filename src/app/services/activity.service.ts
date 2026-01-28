import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private apiUrl = 'http://localhost:8080/api/activities';
  private favoriteUrl = 'http://localhost:8080/api/favorites';

  constructor(private http: HttpClient) {}

  getActivity(id: string | number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getAllActivities(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getUserFavorites(): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // ต้องส่ง headers เข้าไปด้วยเพื่อให้ Backend รู้ว่าเป็นของ User คนไหน
    return this.http.get<any[]>(this.favoriteUrl, { headers });
  }

  toggleFavorite(id: number | string): Observable<any> {
    const token = localStorage.getItem('token'); // หรือดึงจาก AuthService
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<any>(
      `${this.apiUrl}/${id}/favorite`,
      {},
      { headers },
    );
  }
  
  recordReadingHistory(id: number | string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<any>(`${this.apiUrl}/${id}/read`, {}, { headers });
  }
}
