import { inject, Injectable } from '@angular/core';
import { Observable, Subject, tap } from 'rxjs';
import { category } from '../models/category';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  http = inject(HttpClient);

  private categoriesUrl = 'https://localhost:7288/api/categories';
  categoriesSubject = new Subject<category>();
  categoriesObject = this.categoriesSubject.asObservable();

  getCategories(): Observable<category[]> {
    return this.http
      .get<Array<category>>(this.categoriesUrl)
      .pipe(tap((categories) => console.log(categories)));
  }
}
