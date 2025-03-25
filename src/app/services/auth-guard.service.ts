import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  RoutesRecognized,
} from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { filter, map, Observable, pairwise, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  private previousRoute = '/home';

  private setPreviousRoute(): void {
    this.router.events
      .pipe(
        filter((evt: any) => evt instanceof RoutesRecognized),
        pairwise()
      )
      .subscribe((events: RoutesRecognized[]) => {
        this.previousRoute = events[0].urlAfterRedirects;
      });
  }

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

          this.setPreviousRoute();

          if (state.url === '/items/edit' && this.previousRoute !== '/items') {
            this.router.navigate(['/home']);
            return false;
          } else if (
            state.url === '/sales/edit' &&
            this.previousRoute !== '/sales'
          ) {
            this.router.navigate(['/home']);
            return false;
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
