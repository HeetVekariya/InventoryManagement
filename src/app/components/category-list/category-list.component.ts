import { Category } from './../../models/category';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { PopupFormService } from '../../services/popup-form.service';
import { merge, tap } from 'rxjs';

@Component({
  selector: 'app-category-list',
  imports: [NgIf, CommonModule, HeaderComponent],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent implements OnInit {
  categoryService = inject(CategoryService);
  popupFormService = inject(PopupFormService);
  disableAddCategory = signal(true);

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe();
  }

  categories$ = merge(
    this.categoryService.categoriesWithAdd$,
    this.categoryService.categoriesWithUpdate$,
    this.categoryService.categoriesWithDelete$
  ).pipe(tap(() => this.disableAddCategory.set(!this.disableAddCategory)));

  addCategory() {
    this.popupFormService.addCategoryForm();
  }

  editCategory(category: Category) {
    this.popupFormService.editCategoryForm(category);
  }

  deleteCategory(id: number) {
    this.categoryService.deleteCategory(id);
  }
}
