import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Location } from '@angular/common';
import { ActivityService } from '../../../services/activity.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-activity-detail',
  imports: [CommonModule],
  templateUrl: './activity-detail.component.html',
  styleUrl: './activity-detail.component.css',
})
export class ActivityDetailComponent implements OnInit {
  fav() {
    throw new Error('Method not implemented.');
  }

  activity: any = null;

  constructor(
    private http: HttpClient,
    private location: Location,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get(`http://localhost:8080/api/activities/${id}`).subscribe({
        next: (data) => {
          this.activity = data;
          console.log('Activity Data:', data); 
        },
        error: (err) => {
          console.error('ไม่สามารถดึงข้อมูลได้', err);
        },
      });
    }
  }

  
  isValidImage(img: string | null): boolean {
    return !!img && img !== '0' && img !== '';
  }

  goBack(): void {
    this.location.back();
  }

}
