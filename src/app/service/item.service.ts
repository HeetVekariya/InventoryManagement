import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { item } from '../models/item';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  http = inject(HttpClient);
  itemsSubject = new Subject<item>();
  itemsObject = this.itemsSubject.asObservable();

  getItems(): Observable<item[]> {
    return this.http
      .get<Array<item>>(`${environment.apiUrl}/items`)
      .pipe(tap((items) => console.log(items)));
  }
}
