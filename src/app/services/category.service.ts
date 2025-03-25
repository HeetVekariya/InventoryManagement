import { inject, Injectable } from '@angular/core';
import {
  catchError,
  map,
  of,
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
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  http = inject(HttpClient);
  parameters: HttpParams = new HttpParams();
  categoriesResponse:
    | {
        totalRecords: number;
        totalPages: number;
        pageNo: number;
        pageSize: number;
        categories: Category[];
      }
    | undefined;
  private toastService = inject(ToastrService);
  private categoriesSubject = new Subject<Category[]>();
  categories$ = this.categoriesSubject.asObservable();
  private categoryAddSubject = new Subject<Category>();
  categoryAddAction$ = this.categoryAddSubject.asObservable();
  private categoryUpdateSubject = new Subject<Category>();
  categoryUpdateAction$ = this.categoryUpdateSubject.asObservable();
  private categoryDeleteSubject = new Subject<number>();
  categoryDeleteAction$ = this.categoryDeleteSubject.asObservable();

  categoriesWithAdd$ = this.categoryAddAction$
    .pipe(
      withLatestFrom(this.categories$),
      map(([newCategory, categories]) => {
        return [...categories, newCategory] as Category[];
      })
    )
    .subscribe((categoriesWithAdd) => {
      if (categoriesWithAdd) {
        // this.getCategories(true).subscribe();
        this.categoriesSubject.next(categoriesWithAdd);
      }
    });

  categoriesWithUpdate$ = this.categoryUpdateAction$
    .pipe(
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

            // this.getCategories(true).subscribe();
            this.categoriesSubject.next(updatedCategories);
            return updatedCategories;
          }
        }
        return categories;
      })
    )
    .subscribe();

  categoriesWithDelete$ = this.categoryDeleteAction$
    .pipe(
      withLatestFrom(this.categories$),
      map(([id, categories]) => {
        const reducedCategories = categories.filter((c) => c.categoryId !== id);
        this.categoriesSubject.next(reducedCategories);
        // this.getCategories(true).subscribe();
        return reducedCategories;
      })
    )
    .subscribe();

  getCategories(isCalledFromCategoriesList: boolean = false) {
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
          this.categoriesResponse = res;
          this.categoriesSubject.next(res.categories);
        }),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.toastService.error('Internal server error.', 'Fail');
          } else if (err instanceof HttpErrorResponse) {
            this.toastService.error(
              `Server responded with code ${err.status}`,
              'Fail'
            );
          } else {
            console.log(err);
          }
          this.categoriesSubject.next([]);
          return [];
        })
      );
  }

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
            this.toastService.error('Internal server error.', 'Fail');
          } else if (err instanceof HttpErrorResponse) {
            if (err.status === 400) {
              this.toastService.error(
                `Category ${newCategory.name} already exists.`,
                'Fail'
              );
            } else {
              this.toastService.error(
                `Server responded with code ${err.status}`,
                'Fail'
              );
            }
          } else {
            console.log(err);
          }
          return [];
        })
      )
      .subscribe((createdCategory) => {
        if (createdCategory) {
          this.categoryAddSubject.next(createdCategory);
          this.toastService.success(
            `Successfully added category ${createdCategory.name}.`,
            'Success'
          );
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
          if (err instanceof TimeoutError) {
            this.toastService.error('Internal server error.', 'Fail');
          } else if (err instanceof HttpErrorResponse && err.status !== 204) {
            if (err.status === 500) {
              this.toastService.error(
                'Each category should have unique name.',
                'Fail'
              );
            } else {
              this.toastService.error(
                `Server responded with code ${err.status}`,
                'Fail'
              );
            }
          } else {
            console.log(err);
          }
          return [];
        })
      )
      .subscribe((updatedCategory) => {
        if (updatedCategory) {
          this.categoryUpdateSubject.next(updatedCategory);
          this.toastService.success(
            'Successfully updated category.',
            'Success'
          );
        }
      });
  }

  deleteCategory(id: number) {
    this.http
      .delete(`${environment.apiUrl}/categories/${id}`)
      .pipe(
        timeout(3000),
        map(() => id),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.toastService.error('Internal server error.', 'Fail');
          } else if (err instanceof HttpErrorResponse) {
            if (err.status === 404) {
              this.toastService.error('Category does not exists.', 'Fail');
            } else {
              this.toastService.error(
                `Server responded with code ${err.status}`,
                'Fail'
              );
            }
          } else {
            console.log(err);
          }
          return [];
        })
      )
      .subscribe((id) => {
        if (id) {
          this.categoryDeleteSubject.next(id);
          this.toastService.success(
            'Successfully deleted category.',
            'Success'
          );
        }
      });
  }
}
