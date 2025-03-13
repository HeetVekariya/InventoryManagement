import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => {
            return import('./components/landing-page/landing-page.component').then(c => c.LandingPageComponent);
        }
    },
    {
        path: 'home',
        loadComponent: () => {
            return import('./components/home/home.component').then(c => c.HomeComponent);
        }
    },
    {
        path: 'categories',
        loadComponent: () => {
            return import('./components/category-list/category-list.component').then(c => c.CategoryListComponent);
        }
    },
    {
        path: 'items',
        loadComponent: () => {
            return import('./components/item-list/item-list.component').then(c => c.ItemListComponent);
        }
    },
    {
        path: 'sales',
        loadComponent: () => {
            return import('./components/sales-list/sales-list.component').then(c => c.SalesListComponent);
        }
    },
    {
        path: '**',
        loadComponent: () => {
            return import('./components/not-found/not-found.component').then(c => c.NotFoundComponent);
        }
    },

];
