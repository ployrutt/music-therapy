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
import { ActivatedRoute, Router } from '@angular/router';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-edit-activity',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminNavbarComponent],
  templateUrl: './admin-edit-activity.component.html',
  styleUrls: ['./admin-edit-activity.component.css'],
})
export class AdminEditActivityComponent implements OnInit {
  activityForm!: FormGroup;
  masterGoals: any[] = [];
  masterCategories: any[] = [];
  activityId!: string | null;
  previews: { [key: string]: string } = {};

  private readonly API_URL = 'http://localhost:8080';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.activityId = this.route.snapshot.paramMap.get('id');
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

  private loadMasterData() {
    this.http
      .get<any[]>(`${this.API_URL}/api/master-goals`)
      .subscribe((res) => {
        this.masterGoals = res;
        this.loadActivityData();
      });
    this.http
      .get<any[]>(`${this.API_URL}/api/master-categories`)
      .subscribe((res) => (this.masterCategories = res));
  }

  private loadActivityData() {
    if (!this.activityId) return;

    this.http
      .get<any>(`${this.API_URL}/api/activities/${this.activityId}`)
      .subscribe((data) => {
        this.activityForm.patchValue({
          title: data.title,
          goal_description: data.goal_description,
          equipment: data.equipment,
          process: data.process,
          observable_behavior: data.observable_behavior,
          suggestion: data.suggestion,
          song: data.song,
        });

        if (data.cover_image) this.previews['cover_image'] = data.cover_image;
        if (data.song_image) this.previews['song_image'] = data.song_image;
        if (data.qr_1) this.previews['qr_1'] = data.qr_1;
        if (data.qr_2) this.previews['qr_2'] = data.qr_2;

        // จัดการ Checkbox เดิม
        const goalArray = this.activityForm.get(
          'selected_sub_goals'
        ) as FormArray;
        data.sub_goals?.forEach((g: any) => goalArray.push(this.fb.control(g)));

        const catArray = this.activityForm.get(
          'selected_sub_categories'
        ) as FormArray;
        data.sub_categories?.forEach((c: any) =>
          catArray.push(this.fb.control(c))
        );
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

  onSubmit() {
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched();
      return;
    }
    const formValues = this.activityForm.getRawValue();
    const payload = {
      title: formValues.title,
      goal_description: formValues.goal_description,
      sub_goal_ids: formValues.selected_sub_goals.map(
        (g: any) => g.sub_goal_id
      ),
      sub_category_ids: formValues.selected_sub_categories.map(
        (c: any) => c.sub_category_id
      ),
      cover_image: this.previews['cover_image'] || '',
      equipment: formValues.equipment,
      process: formValues.process,
      observable_behavior: formValues.observable_behavior,
      suggestion: formValues.suggestion,
      song: formValues.song,
      song_image: this.previews['song_image'] || '',
      qr_1: this.previews['qr_1'] || '',
      qr_2: this.previews['qr_2'] || '',
    };

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    this.http
      .put(`${this.API_URL}/admin/activities/${this.activityId}`, payload, {
        headers,
      })
      .subscribe({
        next: () => {
          alert('แก้ไขกิจกรรมสำเร็จ!');
          this.router.navigate(['/admin/activity-list']);
        },
        error: (err) =>
          alert('แก้ไขไม่สำเร็จ: ' + (err.error?.error || 'Bad Request')),
      });
  }

  // Helper Methods
  isInvalid(controlName: string) {
    const control = this.activityForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubGoalChange(event: any, subGoal: any) {
    const formArray = this.activityForm.get('selected_sub_goals') as FormArray;
    if (event.target.checked) formArray.push(this.fb.control(subGoal));
    else {
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
    if (event.target.checked) formArray.push(this.fb.control(subCategory));
    else {
      const index = formArray.controls.findIndex(
        (x) => x.value.sub_category_id === subCategory.sub_category_id
      );
      if (index !== -1) formArray.removeAt(index);
    }
  }

  isSubGoalSelected(id: number) {
    return (
      this.activityForm.get('selected_sub_goals') as FormArray
    ).value.some((x: any) => x.sub_goal_id === id);
  }

  isSubCategorySelected(id: number) {
    return (
      this.activityForm.get('selected_sub_categories') as FormArray
    ).value.some((x: any) => x.sub_category_id === id);
  }

  onCancel() {
    this.router.navigate(['/admin/activity-list']);
  }
}
