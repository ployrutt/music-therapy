import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListActivityComponent } from './admin-list-activity.component';

describe('AdminListActivityComponent', () => {
  let component: AdminListActivityComponent;
  let fixture: ComponentFixture<AdminListActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminListActivityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminListActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
