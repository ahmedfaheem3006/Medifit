import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { AboutOneComponent } from './about-one/about-one.component';
import { AboutTwoComponent } from './about-two/about-two.component';
import { AdminComponent } from './admin/admin.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { FiltersComponent } from './filters/filters.component';
import { FooterComponent } from './footer/footer.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { HeaderComponent } from './header/header.component';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { HomeComponent } from './home/home.component';
import { Home2Component } from './home2/home2.component';
import { LoginComponent } from './login/login.component';
import { NewPasswordComponent } from './new-password/new-password.component';
import { RegisterComponent } from './register/register.component';
import { Sec1ContactComponent } from './sec1-contact/sec1-contact.component';
import { Sec1Home2Component } from './sec1-home2/sec1-home2.component';
import { Sec2ContactComponent } from './sec2-contact/sec2-contact.component';
import { Sec3ContactComponent } from './sec3-contact/sec3-contact.component';
import { Sec2Home2Component } from './sec2-home2/sec2-home2.component';
import { Sec3Home2Component } from './sec3-home2/sec3-home2.component';
import { Sec4Home2Component } from './sec4-home2/sec4-home2.component';
import { Section2HomeComponent } from './section2-home/section2-home.component';
import { Section3HomeComponent } from './section3-home/section3-home.component';
import { Section4HomeComponent } from './section4-home/section4-home.component';
import { VerificationComponent } from './verification/verification.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    AboutOneComponent,
    AboutTwoComponent,
    AdminComponent,
    ContactUsComponent,
    FiltersComponent,
    FooterComponent,
    ForgotPasswordComponent,
    HeaderComponent,
    HeroSectionComponent,
    HomeComponent,
    Home2Component,
    LoginComponent,
    NewPasswordComponent,
    RegisterComponent,
    Sec1ContactComponent,
    Sec1Home2Component,
    Sec2ContactComponent,
    Sec3ContactComponent,
    Sec2Home2Component,
    Sec3Home2Component,
    Sec4Home2Component,
    Section2HomeComponent,
    Section3HomeComponent,
    Section4HomeComponent,
    VerificationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
