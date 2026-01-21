import { Routes } from '@angular/router';

import { adminGuard } from './guards/admin.guard';
import { memberGuard } from './guards/member.guard';

import { NavbarComponent } from './pages/layouts/navbar/navbar.component';

// import { HomeComponent } from './pages/public/home/home.component';
import { LoginComponent } from './pages/public/login/login.component';
import { RegisterComponent } from './pages/public/register/register.component';
import { ActivityComponent } from './pages/public/activity/activity.component';
import { AboutUsComponent } from './pages/public/about-us/about-us.component';
import { ResearchComponent } from './pages/public/research/research.component';

import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminCreateActivityComponent } from './pages/admin/admin-create-activity/admin-create-activity.component';
import { AdminListActivityComponent } from './pages/admin/admin-list-activity/admin-list-activity.component';
import { AdminLogoutComponent } from './pages/admin/admin-logout/admin-logout.component';
import { AdminListMemberComponent } from './pages/admin/admin-list-member/admin-list-member.component';

import { MemberDashboardComponent } from './pages/member/member-dashboard/member-dashboard.component';
import { MemberProfileComponent } from './pages/member/member-profile/member-profile.component';
import { AdminNavbarComponent } from './pages/admin/admin-navbar/admin-navbar.component';
import { AdminEditActivityComponent } from './pages/admin/admin-edit-activity/admin-edit-activity.component';
import { ActivityDetailComponent } from './pages/public/activity-detail/activity-detail.component';


export const routes: Routes = [


  {
    path: '',
    component: NavbarComponent,
    children: [

      { path: '', component:ActivityComponent }, 
      // { path: 'home', component: HomeComponent }, 
      
      { path: 'activity', component: ActivityComponent },
      { path: 'activity/:id', component: ActivityDetailComponent },
      { path: 'about-us', component: AboutUsComponent },
      { path: 'research', component: ResearchComponent },

      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'admin-navbar', component: AdminNavbarComponent }, 
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'activity-list', component: AdminListActivityComponent },
       { path: 'member-list', component: AdminListMemberComponent },
      { path: 'create-activity', component: AdminCreateActivityComponent },
      {path:'edit-activity/:id', component:AdminEditActivityComponent},
      { path: 'logout', component: AdminLogoutComponent }
    ]
  },
  {
    path: 'member',
    component: NavbarComponent,
    canActivate: [memberGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
      { path: 'dashboard', component: MemberDashboardComponent },
      { path: 'profile', component: MemberProfileComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];