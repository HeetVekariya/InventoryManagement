import { Item } from './../models/item';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  map,
  Subject,
  tap,
  timeout,
  TimeoutError,
  withLatestFrom,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  http = inject(HttpClient);
  router = inject(Router);
  parameters: HttpParams = new HttpParams();
  itemsResponse:
    | {
        totalRecords: number;
        totalPages: number;
        pageNo: number;
        pageSize: number;
        items: Item[];
      }
    | undefined;
  private toastService = inject(ToastrService);
  private itemsSubject = new Subject<Item[]>();
  items$ = this.itemsSubject.asObservable();
  private itemAddSubject = new Subject<Item>();
  itemAddAction$ = this.itemAddSubject.asObservable();
  private itemUpdateSubject = new Subject<Item>();
  itemUpdateAction$ = this.itemUpdateSubject.asObservable();
  private itemDeleteSubject = new Subject<number>();
  itemDeleteAction$ = this.itemDeleteSubject.asObservable();

  itemsWithAdd$ = this.itemAddAction$
    .pipe(
      withLatestFrom(this.items$),
      map(([newItem, items]) => {
        return [...items, newItem] as Item[];
      })
    )
    .subscribe((itemsWithAdd) => {
      if (itemsWithAdd) {
        this.itemsSubject.next(itemsWithAdd);
      }
    });

  itemWithUpdate$ = this.itemUpdateAction$.pipe(
    withLatestFrom(this.items$),
    map(([updatedItem, items]) => {
      if (updatedItem) {
        const updateItemIndex = items.findIndex(
          (i) => i.itemId === updatedItem.itemId
        );

        if (updateItemIndex !== -1) {
          const updatedItems = [
            ...items.slice(0, updateItemIndex),
            updatedItem,
            ...items.slice(updateItemIndex + 1),
          ];

          this.itemsSubject.next(updatedItems);
          return updatedItems;
        }
      }
      return items;
    })
  );

  itemsWithDelete$ = this.itemDeleteAction$
    .pipe(
      withLatestFrom(this.items$),
      map(([id, items]) => {
        const reducedItems = items.filter((item) => item.itemId !== id);
        this.getItems(true).subscribe();
        // this.itemsSubject.next(reducedItems);
        return reducedItems;
      })
    )
    .subscribe();

  getItems(isCalledFromItemList: boolean = false) {
    return this.http
      .get<{
        totalRecords: number;
        totalPages: number;
        pageNo: number;
        pageSize: number;
        items: Item[];
      }>(
        `${environment.apiUrl}/items`,
        isCalledFromItemList
          ? { params: this.parameters }
          : { params: new HttpParams().set('calledFromItemList', false) }
      )
      .pipe(
        timeout(3000),
        tap((res) => {
          console.log(res);
          this.itemsResponse = res;
          this.itemsSubject.next(res.items);
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
          this.itemsSubject.next([]);
          return [];
        })
      );
  }

  postItem(newItem: { categoryId: number; name: string; active: boolean }) {
    this.http
      .post(`${environment.apiUrl}/items`, newItem)
      .pipe(
        timeout(3000),
        map((res) => {
          return {
            itemId: (res as { id: number }).id,
            ...newItem,
          } as Item;
        }),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.toastService.error('Internal server error.', 'Fail');
          } else if (err instanceof HttpErrorResponse) {
            if (err.status === 400) {
              this.toastService.error(
                `Cannot have duplicate items in the same category.`,
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
      .subscribe((createdItem) => {
        if (createdItem) {
          this.itemAddSubject.next(createdItem);
          this.router.navigate(['items']);
          this.toastService.success(
            `Successfully added item ${createdItem.name}.`,
            'Success'
          );
        }
      });
  }

  updateItem(item: Item) {
    this.http
      .patch(`${environment.apiUrl}/items`, item, {
        params: new HttpParams().set('id', item.itemId),
      })
      .pipe(
        timeout(3000),
        map(() => item),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.toastService.error('Internal server error.', 'Fail');
          } else if (err instanceof HttpErrorResponse && err.status !== 204) {
            if (err.status === 500) {
              // this condition needs to be corrected
              this.toastService.error(
                'Cannot have duplicate items in the same category.',
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
      .subscribe((updatedItem) => {
        if (updatedItem) {
          this.itemUpdateSubject.next(updatedItem);
          this.router.navigate(['items']);
          this.toastService.success(`Successfully updated item.`, 'Success');
        }
      });
  }

  deleteItem(id: number) {
    this.http
      .delete(`${environment.apiUrl}/items/${id}`)
      .pipe(
        timeout(3000),
        map(() => id),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.toastService.error('Internal server error.', 'Fail');
          } else if (err instanceof HttpErrorResponse) {
            if (err.status === 404) {
              this.toastService.error('Item does not exists.', 'Fail');
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
          this.itemDeleteSubject.next(id);
          this.toastService.success(`Successfully deleted item.`, 'Success');
        }
      });
  }
}
