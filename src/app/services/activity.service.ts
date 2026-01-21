import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private apiUrl = 'http://localhost:8080/api/activities';

  constructor(private http: HttpClient) {}

  getActivity(id: string | number = '34'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getAllActivities(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
