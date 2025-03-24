import { Sales } from './../models/sales';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  delay,
  map,
  of,
  Subject,
  tap,
  timeout,
  TimeoutError,
  withLatestFrom,
} from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  http = inject(HttpClient);
  router = inject(Router);
  private salesSubject = new Subject<Sales[]>();
  sales$ = this.salesSubject.asObservable();
  private salesAddSubject = new Subject<Sales>();
  salesAddAction$ = this.salesAddSubject.asObservable();
  private salesUpdateSubject = new Subject<Sales>();
  salesUpdateAction$ = this.salesUpdateSubject.asObservable();
  private salesDeleteSubject = new Subject<number>();
  salesDeleteAction$ = this.salesDeleteSubject.asObservable();

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

  salesWithUpdate$ = this.salesUpdateAction$.pipe(
    withLatestFrom(this.sales$),
    map(([updatedSale, sales]) => {
      if (updatedSale) {
        const updateSalesIndex = sales.findIndex(
          (sale) => sale.salesId === updatedSale.salesId
        );

        if (updateSalesIndex !== -1) {
          const updatedSales = [
            ...sales.slice(0, updateSalesIndex),
            updatedSale,
            ...sales.slice(updateSalesIndex + 1),
          ];

          this.salesSubject.next(updatedSales);
          return updatedSales;
        }
      }
      return sales;
    })
  );

  salesWithDelete$ = this.salesDeleteAction$
    .pipe(
      withLatestFrom(this.sales$),
      map(([id, sales]) => {
        const reducedSales = sales.filter((sale) => sale.salesId !== id);
        this.salesSubject.next(reducedSales);
        return reducedSales;
      })
    )
    .subscribe();

  getSales() {
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

  updateSales(sales: Sales) {
    this.http
      .patch(`${environment.apiUrl}/sales`, sales, {
        params: new HttpParams().set('id', sales.salesId),
      })
      .pipe(
        timeout(3000),
        map(() => sales),
        catchError((err) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status !== 204) {
              console.log('HTTP response err:', err.status);
              of({ error: 'An error occurred while updating the sales.' });
            }
          }
          return of(err);
        })
      )
      .subscribe((salesOrError) => {
        if (salesOrError && !(salesOrError instanceof Error)) {
          this.salesUpdateSubject.next(sales);
          this.router.navigate(['sales']);
          console.log('req completed');
        }
      });
  }

  deleteSales(id: number) {
    this.http
      .delete(`${environment.apiUrl}/sales/${id}`)
      .pipe(
        timeout(3000),
        catchError((err) => {
          if (err instanceof HttpErrorResponse) {
            console.log('HTTP response err:', err.status);
            of({ error: 'An error occurred while deleting the sales.' });
          }
          return of(err);
        })
      )
      .subscribe((res) => {
        if (!(res instanceof Error)) {
          this.salesDeleteSubject.next(id);
        }
      });
  }
}
