import { Sales } from './../models/sales';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
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
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  http = inject(HttpClient);
  router = inject(Router);
  parameters: HttpParams = new HttpParams();
  salesResponse:
    | {
        totalRecords: number;
        totalPages: number;
        pageNo: number;
        pageSize: number;
        sales: Sales[];
      }
    | undefined;
  private toastService = inject(ToastrService);
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

  getSales(isCalledFromSalesList: boolean = false) {
    return this.http
      .get<{
        totalRecords: number;
        totalPages: number;
        pageNo: number;
        pageSize: number;
        sales: Sales[];
      }>(
        `${environment.apiUrl}/sales`,
        isCalledFromSalesList
          ? { params: this.parameters }
          : { params: new HttpParams().set('calledFromSalesList', false) }
      )
      .pipe(
        timeout(3000),
        tap((res) => {
          console.log(res);
          this.salesResponse = res;
          this.salesSubject.next(res.sales);
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
            this.toastService.error('Internal server error.', 'Fail');
          } else if (err instanceof HttpErrorResponse) {
            this.toastService.error(
              `Server responded with code ${err.status}`,
              'Fail'
            );
          } else {
            console.log(err);
          }
          return [];
        })
      )
      .subscribe((createdSales) => {
        if (createdSales) {
          this.salesAddSubject.next(createdSales);
          this.router.navigate(['sales']);
          this.toastService.success(
            `Successfully created new sales record.`,
            'Success'
          );
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
          if (err instanceof TimeoutError) {
            this.toastService.error('Internal server error.', 'Fail');
          } else if (err instanceof HttpErrorResponse && err.status !== 204) {
            this.toastService.error(
              `Server responded with code ${err.status}`,
              'Fail'
            );
          } else {
            console.log(err);
          }
          return [];
        })
      )
      .subscribe((salesOrError) => {
        if (salesOrError && !(salesOrError instanceof Error)) {
          this.salesUpdateSubject.next(sales);
          this.router.navigate(['sales']);
          this.toastService.success(
            `Successfully updated sales record.`,
            'Success'
          );
        }
      });
  }

  deleteSales(id: number) {
    this.http
      .delete(`${environment.apiUrl}/sales/${id}`)
      .pipe(
        timeout(3000),
        map(() => id),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.toastService.error('Internal server error.', 'Fail');
          } else if (err instanceof HttpErrorResponse) {
            if (err.status === 404) {
              this.toastService.error('Sales record does not exists.', 'Fail');
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
          this.salesDeleteSubject.next(id);
          this.toastService.success(
            `Successfully deleted sales record.`,
            'Success'
          );
        }
      });
  }
}
