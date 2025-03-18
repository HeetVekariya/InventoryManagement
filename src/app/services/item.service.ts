import { Item } from './../models/item';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  combineLatest,
  delay,
  map,
  Subject,
  tap,
  timeout,
  TimeoutError,
  withLatestFrom,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  http = inject(HttpClient);
  categoryService = inject(CategoryService);
  private itemsSubject = new Subject<Item[]>();
  items$ = this.itemsSubject.asObservable();
  private itemAddSubject = new Subject<Item>();
  itemAddAction$ = this.itemAddSubject.asObservable();

  itemsWithCategories$ = combineLatest([
    this.categoryService.categories$,
    this.items$,
  ]).pipe(
    map(([categories, items]) => {
      return items.map((item) => {
        return {
          ...item,
          category: categories.find((c) => c.categoryId === item.categoryId)
            ?.name,
        };
      });
    })
  );

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

  getItems() {
    this.categoryService.getCategories().subscribe();
    return this.http.get<Array<Item>>(`${environment.apiUrl}/items`).pipe(
      timeout(3000),
      tap((items) => {
        this.itemsSubject.next(items);
        console.log(items);
      }),
      delay(2000),
      catchError((err) => {
        console.log((err as TimeoutError).name);
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
            console.log({ message: 'Server error' });
          } else {
            console.log((err as HttpErrorResponse).message);
          }
          return [];
        })
      )
      .subscribe((createdItem) => {
        if (createdItem) {
          this.itemAddSubject.next(createdItem);
        }
      });
  }
}
