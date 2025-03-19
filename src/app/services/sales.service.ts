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
import { Sales } from '../models/sales';
import { environment } from '../../environments/environment';
import { ItemService } from './item.service';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  http = inject(HttpClient);
  itemService = inject(ItemService);
  salesSubject = new Subject<Sales[]>();
  sales$ = this.salesSubject.asObservable();

  salesWithItems$ = combineLatest([
    this.itemService.itemsWithCategories$,
    this.sales$,
  ]).pipe(
    map(([items, sales]) => {
      return sales.map((sale) => {
        return {
          ...sale,
          item: items.find((item) => item.itemId === sale.itemId)?.name,
        };
      });
    })
  );

  getSales() {
    this.itemService.getItems().subscribe();
    return this.http.get<Array<Sales>>(`${environment.apiUrl}/sales`).pipe(
      timeout(3000),
      tap((sales) => {
        this.salesSubject.next(sales);
        console.log(sales);
      }),
      delay(2000),
      catchError((err) => {
        console.log((err as TimeoutError).name);
        this.salesSubject.next([]);
        return [];
      })
    );
  }
}
