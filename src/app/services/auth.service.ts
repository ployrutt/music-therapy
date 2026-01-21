import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private API_URL = 'http://localhost:8080/auth';
  private PROFILE_API = 'http://localhost:8080/api/profile';

  private token: string | null = null;
  private roleSubject = new BehaviorSubject<string | null>(null);


  private userSubject = new BehaviorSubject<any>(null);

  role$ = this.roleSubject.asObservable();
 
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap((res) => {
          this.token = res.token;
          this.roleSubject.next(res.role);
          localStorage.setItem('token', res.token);
          localStorage.setItem('role', res.role);

         
          this.getUserProfile().subscribe();
        })
      );
  }


  getUserProfile(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<any>(this.PROFILE_API, { headers }).pipe(
      tap((user) => {

        this.userSubject.next(user);
      })
    );
  }

  getProfile(): Observable<any> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(this.PROFILE_API, { headers });
  }

  private loadFromStorage() {
    this.token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    this.roleSubject.next(savedRole);


    if (this.token) {
      this.getUserProfile().subscribe();
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getRole(): string | null {
    return this.roleSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  logout() {
    this.token = null;
    this.roleSubject.next(null);
    this.userSubject.next(null);
    localStorage.clear();
  }
}
