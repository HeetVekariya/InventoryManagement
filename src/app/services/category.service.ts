import { inject, Injectable } from '@angular/core';
import {
  catchError,
  delay,
  map,
  merge,
  of,
  scan,
  Subject,
  tap,
  timeout,
  TimeoutError,
  withLatestFrom,
} from 'rxjs';
import { Category } from '../models/category';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  http = inject(HttpClient);
  parameters: HttpParams = new HttpParams();
  private categoriesSubject = new Subject<Category[]>();
  categories$ = this.categoriesSubject.asObservable();
  private categoryAddSubject = new Subject<Category>();
  categoryAddAction$ = this.categoryAddSubject.asObservable();
  private categoryUpdateSubject = new Subject<Category>();
  categoryUpdateAction$ = this.categoryUpdateSubject.asObservable();
  private categoryDeleteSubject = new Subject<number>();
  categoryDeleteAction$ = this.categoryDeleteSubject.asObservable();

  getCategories(isCalledFromCategoriesList: boolean = false) {
    console.log(this.parameters);

    return this.http
      .get<{
        totalRecords: number;
        totalPages: number;
        pageNo: number;
        pageSize: number;
        categories: Category[];
      }>(
        `${environment.apiUrl}/categories`,
        isCalledFromCategoriesList
          ? { params: this.parameters }
          : { params: new HttpParams().set('calledFromCategoryList', false) }
      )
      .pipe(
        timeout(3000),
        tap((res) => {
          console.log(res);
          this.categoriesSubject.next(res.categories);
        }),
        delay(2000),
        catchError((err) => {
          console.log((err as TimeoutError).name);
          this.categoriesSubject.next([]);
          return [];
        })
      );
  }

  categoriesWithAdd$ = merge(this.categories$, this.categoryAddAction$).pipe(
    scan((acc, value) => {
      if (value instanceof Array) {
        return [...value];
      } else {
        const categories = [...acc, value];
        this.categoriesSubject.next(categories);
        return categories;
      }
    }, [] as Category[])
  );

  categoriesWithUpdate$ = this.categoryUpdateAction$.pipe(
    withLatestFrom(this.categories$),
    map(([updatedCategory, categories]) => {
      if (updatedCategory) {
        const updatedCategoryIndex = categories.findIndex(
          (c) => c.categoryId === updatedCategory.categoryId
        );

        if (updatedCategoryIndex !== -1) {
          const updatedCategories = [
            ...categories.slice(0, updatedCategoryIndex),
            updatedCategory,
            ...categories.slice(updatedCategoryIndex + 1),
          ];

          this.categoriesSubject.next(updatedCategories);
          return updatedCategories;
        }
      }
      return categories;
    })
  );

  categoriesWithDelete$ = this.categoryDeleteAction$.pipe(
    withLatestFrom(this.categories$),
    map(([id, categories]) => {
      const reducedCategories = categories.filter((c) => c.categoryId !== id);
      this.categoriesSubject.next(reducedCategories);
      return reducedCategories;
    }),
    tap((categories) => console.log(categories.length))
  );

  postCategory(newCategory: { name: string; active: boolean }) {
    this.http
      .post(`${environment.apiUrl}/categories`, newCategory)
      .pipe(
        timeout(3000),
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
  }

  updateCategory(category: Category) {
    this.http
      .patch(`${environment.apiUrl}/categories`, category, {
        params: new HttpParams().set('id', category.categoryId),
      })
      .pipe(
        timeout(3000),
        map(() => category),
        catchError((err) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status !== 204) {
              console.log('HTTP response err:', err.status);
              of({ error: 'An error occurred while updating the category.' });
            }
          }
          return of(err);
        })
      )
      .subscribe((categoryOrError) => {
        if (categoryOrError && !(categoryOrError instanceof Error)) {
          this.categoryUpdateSubject.next(categoryOrError);
        }
      });
  }

  deleteCategory(id: number) {
    this.http
      .delete(`${environment.apiUrl}/categories/${id}`)
      .pipe(
        timeout(3000),
        catchError((err) => {
          if (err instanceof HttpErrorResponse) {
            console.log('HTTP response err:', err.status);
            of({ error: 'An error occurred while deleting the category.' });
          }
          return of(err);
        })
      )
      .subscribe((res) => {
        if (!(res instanceof Error)) {
          console.log(res);
          this.categoryDeleteSubject.next(id);
        }
      });
  }
}
