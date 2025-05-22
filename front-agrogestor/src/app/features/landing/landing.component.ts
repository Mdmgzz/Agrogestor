// src/app/features/landing/landing.component.ts
import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroComponent } from './hero/hero.component';
import { FeaturesComponent } from './features/features.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    FeaturesComponent,
    FooterComponent,
  ],
  templateUrl: './landing.component.html'
})
export class LandingComponent {}
