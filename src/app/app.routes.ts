import { Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => {
      return import('./components/landing-page/landing-page.component').then(
        (c) => c.LandingPageComponent
      );
    },
    canActivate: [AuthGuardService],
  },
  {
    path: 'home',
    loadComponent: () => {
      return import('./components/home/home.component').then(
        (c) => c.HomeComponent
      );
    },
    canActivate: [AuthGuardService],
  },
  {
    path: 'categories',
    loadComponent: () => {
      return import('./components/category-list/category-list.component').then(
        (c) => c.CategoryListComponent
      );
    },
    canActivate: [AuthGuardService],
  },
  {
    path: 'items',
    loadComponent: () => {
      return import('./components/item-list/item-list.component').then(
        (c) => c.ItemListComponent
      );
    },
    canActivate: [AuthGuardService],
  },
  {
    path: 'items/add',
    loadComponent: () => {
      return import('./components/modify-items/modify-items.component').then(
        (c) => c.ModifyItemsComponent
      );
    },
    canActivate: [AuthGuardService],
  },
  {
    path: 'items/edit',
    loadComponent: () => {
      return import('./components/modify-items/modify-items.component').then(
        (c) => c.ModifyItemsComponent
      );
    },
    canActivate: [AuthGuardService],
  },
  {
    path: 'sales',
    loadComponent: () => {
      return import('./components/sales-list/sales-list.component').then(
        (c) => c.SalesListComponent
      );
    },
    canActivate: [AuthGuardService],
  },
  {
    path: 'sales/add',
    loadComponent: () => {
      return import('./components/modify-sales/modify-sales.component').then(
        (c) => c.ModifySalesComponent
      );
    },
    canActivate: [AuthGuardService],
  },
  {
    path: '**',
    loadComponent: () => {
      return import('./components/not-found/not-found.component').then(
        (c) => c.NotFoundComponent
      );
    },
  },
];
