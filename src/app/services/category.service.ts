import { inject, Injectable } from '@angular/core';
import { delay, Observable, Subject, tap } from 'rxjs';
import { category } from '../models/category';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  http = inject(HttpClient);
  categoriesSubject = new Subject<category>();
  categoriesObject = this.categoriesSubject.asObservable();

  getCategories(): Observable<category[]> {
    console.log(`${environment.apiUrl}/categories`);

    return this.http
      .get<Array<category>>(`${environment.apiUrl}/categories`)
      .pipe(
        tap((categories) => console.log(categories)),
        delay(2000)
      );
  }
}
