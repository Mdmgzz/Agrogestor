// src/app/features/landing/hero/hero.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterModule],     
  templateUrl: './hero.component.html',
})
export class HeroComponent {}
