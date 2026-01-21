import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListMemberComponent } from './admin-list-member.component';

describe('AdminListMemberComponent', () => {
  let component: AdminListMemberComponent;
  let fixture: ComponentFixture<AdminListMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminListMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminListMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
