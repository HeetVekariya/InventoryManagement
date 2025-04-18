import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { filter, map, Observable, pairwise, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  private authService = inject(AuthService);
  hasValidEditAccess = false;
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map((isAuthenticated) => {
        if (isAuthenticated) {
          if (state.url === '/') {
            this.router.navigate(['/home']);
            return false;
          }

          if (state.url === '/items/edit' || state.url === '/sales/edit') {
            if (this.hasValidEditAccess) {
              return true;
            } else {
              this.router.navigate(['/home']);
              return false;
            }
          }

          return true;
        } else {
          if (state.url === '/') {
            return true;
          }

          this.router.navigate(['/']);
          return false;
        }
      })
    );
  }
}
