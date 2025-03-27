import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-landing-page',
  imports: [HeaderComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent {
  authService = inject(AuthService);
}
