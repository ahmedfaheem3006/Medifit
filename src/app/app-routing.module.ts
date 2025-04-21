import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerificationComponent } from './verification/verification.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { HomeComponent } from './home/home.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { Home2Component } from './home2/home2.component';
import { AboutComponent } from './about/about.component';
import { FiltersComponent } from './filters/filters.component';
import { AdminComponent } from './admin/admin.component';



const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verification', component: VerificationComponent },
  { path: 'new-password', component: NewPasswordComponent },
  { path: 'home', component: HomeComponent },
  { path: 'home2', component: Home2Component },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'filters', component: FiltersComponent },
  { path: 'admin', component: AdminComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
