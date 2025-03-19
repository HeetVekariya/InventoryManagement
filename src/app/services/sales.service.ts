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
import { Sales } from '../models/sales';
import { environment } from '../../environments/environment';
import { ItemService } from './item.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  http = inject(HttpClient);
  router = inject(Router);
  itemService = inject(ItemService);
  private salesSubject = new Subject<Sales[]>();
  sales$ = this.salesSubject.asObservable();
  private salesAddSubject = new Subject<Sales>();
  salesAddAction$ = this.salesAddSubject.asObservable();

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

  salesWithAdd$ = this.salesAddAction$
    .pipe(
      withLatestFrom(this.sales$),
      map(([newSales, sales]) => {
        return [...sales, newSales] as Sales[];
      })
    )
    .subscribe((salesWithAdd) => {
      if (salesWithAdd) {
        this.salesSubject.next(salesWithAdd);
      }
    });

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

  postSales(newSales: {
    itemId: number;
    price: number;
    quantity: number;
    salesAmount: number;
    salesDate: Date;
  }) {
    this.http
      .post(`${environment.apiUrl}/sales`, newSales)
      .pipe(
        timeout(3000),
        map((res) => {
          return {
            salesId: (
              res as {
                id: number;
                insertedDate: Date;
              }
            ).id,
            insertedDate: (
              res as {
                id: number;
                insertedDate: Date;
              }
            ).insertedDate,
            ...newSales,
          } as Sales;
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
      .subscribe((createdSales) => {
        if (createdSales) {
          this.salesAddSubject.next(createdSales);
          this.router.navigate(['sales']);
        }
      });
  }
}
