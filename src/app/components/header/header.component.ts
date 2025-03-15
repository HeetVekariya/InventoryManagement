import { CommonModule, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-header',
  imports: [RouterModule, NgIf, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  authService = inject(AuthService);
  route = inject(Router);

  isDataRoute(): boolean {
    if (
      this.route.url === '/categories' ||
      this.route.url === '/items' ||
      this.route.url === '/sales'
    ) {
      return true;
    } else {
      return false;
    }
  }
}
