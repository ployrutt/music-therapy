import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-create-activity',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavbarComponent],
  templateUrl: './admin-create-activity.component.html',
  styleUrls: ['./admin-create-activity.component.css'],
})
export class AdminCreateActivityComponent implements OnInit {
  activityForm!: FormGroup;
  masterGoals: any[] = [];
  masterCategories: any[] = [];
  previews: { [key: string]: string } = {};

  private readonly API_URL = 'http://localhost:8080';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMasterData();
  }

  private initForm() {
    this.activityForm = this.fb.group({
      title: ['', [Validators.required]],
      goal_description: ['', [Validators.required]],
      equipment: ['', [Validators.required]],
      process: ['', [Validators.required]],
      observable_behavior: ['', [Validators.required]],
      suggestion: ['', [Validators.required]],
      song: [''],
      selected_sub_goals: this.fb.array([]),
      selected_sub_categories: this.fb.array([]),
    });
  }

  onFileSelected(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previews[fieldName] = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.activityForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private loadMasterData() {
    this.http
      .get<any[]>(`${this.API_URL}/api/master-goals`)
      .subscribe((res) => (this.masterGoals = res));
    this.http
      .get<any[]>(`${this.API_URL}/api/master-categories`)
      .subscribe((res) => (this.masterCategories = res));
  }

  onSubGoalChange(event: any, subGoal: any) {
    const formArray = this.activityForm.get('selected_sub_goals') as FormArray;
    if (event.target.checked) {
      formArray.push(this.fb.control(subGoal));
    } else {
      const index = formArray.controls.findIndex(
        (x) => x.value.sub_goal_id === subGoal.sub_goal_id
      );
      if (index !== -1) formArray.removeAt(index);
    }
  }

  onSubCategoryChange(event: any, subCategory: any) {
    const formArray = this.activityForm.get(
      'selected_sub_categories'
    ) as FormArray;
    if (event.target.checked) {
      formArray.push(new FormControl(subCategory));
    } else {
      const index = formArray.controls.findIndex(
        (x) => x.value.sub_category_id === subCategory.sub_category_id
      );
      if (index !== -1) formArray.removeAt(index);
    }
  }

  onSubmit() {
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched();

      const firstInvalidControl = document.querySelector('.error-border');
      if (firstInvalidControl) {
        firstInvalidControl.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
      return;
    }

    const formValues = this.activityForm.getRawValue();
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const payload = {
      title: formValues.title,
      goal_description: formValues.goal_description,
      equipment: formValues.equipment,
      process: formValues.process,
      observable_behavior: formValues.observable_behavior,
      suggestion: formValues.suggestion,
      song: formValues.song,
      sub_goal_ids: formValues.selected_sub_goals.map(
        (g: any) => g.sub_goal_id
      ),
      sub_category_ids: formValues.selected_sub_categories.map(
        (c: any) => c.sub_category_id
      ),

      cover_image: this.previews['cover_image'] || '',
      song_image: this.previews['song_image'] || '',
      qr_1: this.previews['qr_1'] || '',
      qr_2: this.previews['qr_2'] || '',
    };

    this.http
      .post(`${this.API_URL}/admin/activities`, payload, { headers })
      .subscribe({
        next: () => {
          alert('สร้างกิจกรรมสำเร็จ!');
          this.router.navigate(['/admin/activity-list']);
        },
        error: (err) => {
          console.error('Submit Error:', err);
          alert(
            'สร้างกิจกรรมไม่สำเร็จ: ' + (err.error?.error || 'Unknown Error')
          );
        },
      });
  }

  isSubGoalSelected(id: number): boolean {
    return (
      this.activityForm.get('selected_sub_goals') as FormArray
    ).value.some((x: any) => x.sub_goal_id === id);
  }

  isSubCategorySelected(id: number): boolean {
    return (
      this.activityForm.get('selected_sub_categories') as FormArray
    ).value.some((x: any) => x.sub_category_id === id);
  }

  onCancel() {
    this.router.navigate(['/admin/dashboard']);
  }

  resetForm() {
    this.activityForm.reset();
    (this.activityForm.get('selected_sub_goals') as FormArray).clear();
    (this.activityForm.get('selected_sub_categories') as FormArray).clear();
    this.previews = {};
    this.activityForm.markAsPristine();
    this.activityForm.markAsUntouched();
  }
}
