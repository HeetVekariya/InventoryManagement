import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, Observable, Subject, tap } from 'rxjs';
import { sales } from '../models/sales';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  http = inject(HttpClient);
  salesSubject = new Subject<sales>();
  salesObject = this.salesSubject.asObservable();

  getSales(): Observable<sales[]> {
    return this.http.get<Array<sales>>(`${environment.apiUrl}/sales`).pipe(
      tap((sales) => console.log(sales)),
      delay(2000)
    );
  }
}
