import { inject, Injectable } from '@angular/core';
import {
  catchError,
  delay,
  map,
  merge,
  scan,
  Subject,
  tap,
  timeout,
  TimeoutError,
} from 'rxjs';
import { Category } from '../models/category';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  http = inject(HttpClient);
  private categoryAddSubject = new Subject<Category>();
  categoryAddAction$ = this.categoryAddSubject.asObservable();

  categories$ = this.http
    .get<Array<Category>>(`${environment.apiUrl}/categories`)
    .pipe(
      timeout(2000),
      tap((categories) => console.log(categories)),
      delay(2000),
      catchError((err) => {
        console.log((err as TimeoutError).name);
        return [];
      })
    );

  categoriesWithAdd$ = merge(this.categories$, this.categoryAddAction$).pipe(
    scan(
      (acc, value) => (value instanceof Array ? [...value] : [...acc, value]),
      [] as Category[]
    )
  );

  postCategory(newCategory: { name: string; active: boolean }) {
    this.http
      .post(`${environment.apiUrl}/categories`, newCategory)
      .pipe(
        timeout(3000),
        tap((res) => console.log(res)),
        map((res) => {
          return {
            categoryId: (res as { id: number }).id,
            name: newCategory.name,
            active: newCategory.active,
          } as Category;
        }),

        catchError((err) => {
          if (err instanceof TimeoutError) {
            console.log({ message: 'Server error' });
          } else {
            console.log((err as HttpErrorResponse).error);
          }
          return [];
        })
      )
      .subscribe((createdCategory) => {
        if (createdCategory) {
          this.categoryAddSubject.next(createdCategory);
        }
      });
    console.log('request completed');
  }
}
