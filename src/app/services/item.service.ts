import { Item } from './../models/item';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  combineLatest,
  delay,
  map,
  Observable,
  Subject,
  tap,
  timeout,
  TimeoutError,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  http = inject(HttpClient);
  categoryService = inject(CategoryService);
  itemsSubject = new Subject<Item[]>();
  items$ = this.itemsSubject.asObservable();

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
}
