import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, Observable, Subject, tap } from 'rxjs';
import { Item } from '../models/item';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  http = inject(HttpClient);
  itemsSubject = new Subject<Item>();
  itemsObject = this.itemsSubject.asObservable();

  getItems(): Observable<Item[]> {
    return this.http.get<Array<Item>>(`${environment.apiUrl}/items`).pipe(
      tap((items) => console.log(items)),
      delay(2000)
    );
  }
}
