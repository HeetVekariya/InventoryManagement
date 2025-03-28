import { Category } from './../../models/category';
import { Component, inject, signal } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { PopupFormService } from '../../services/popup-form.service';
import { tap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DeleteConfirmationService } from '../../services/delete-confirmation.service';

@Component({
  selector: 'app-category-list',
  imports: [NgIf, CommonModule, HeaderComponent, FormsModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent {
  categoryService = inject(CategoryService);
  popupFormService = inject(PopupFormService);
  confirmationDialogService = inject(DeleteConfirmationService);
  disableAddCategory = signal(true);
  isActive = '';
  page = 1;
  sortBy = 'categoryId';
  pageSize = '10';
  sortOrder = 'asc';
  disableNextPage = signal(false);

  private getParameters(): HttpParams {
    return new HttpParams()
      .set('page', this.page)
      .set('sortBy', this.sortBy)
      .set('pageSize', Number(this.pageSize))
      .set('sortOrder', this.sortOrder)
      .set('calledFromCategoryList', Boolean(true));
  }

  constructor() {
    this.categoryService.parameters = this.getParameters();
    this.categoryService.getCategories(true).subscribe();
  }

  onSort(sortBy: string) {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
    }
    this.filterCategories();
  }

  filterCategories() {
    let parameters = this.getParameters();

    if (this.isActive !== undefined) {
      parameters = parameters.set('isActive', this.isActive);
    }

    this.categoryService.parameters = parameters;
    this.categoryService
      .getCategories(true)
      .pipe(
        tap(() => {
          this.categoryService.categoriesResponse?.totalPages
            ? this.page >= this.categoryService.categoriesResponse?.totalPages
              ? this.disableNextPage.set(true)
              : this.disableNextPage.set(false)
            : null;
        })
      )
      .subscribe();
  }

  goToPreviousPage() {
    this.page--;
    this.filterCategories();
  }

  goToNextPage() {
    if (!this.disableNextPage()) {
      this.page++;
      this.filterCategories();
    }
  }

  categories$ = this.categoryService.categories$.pipe(
    tap(() => this.disableAddCategory.set(false))
  );

  addCategory() {
    this.popupFormService.addCategoryForm();
  }

  editCategory(category: Category) {
    this.popupFormService.editCategoryForm(category);
  }

  deleteCategory(id: number) {
    this.confirmationDialogService
      .openConfirmationDialogBox(
        'All the items and sales records related to this category will be lost.'
      )
      .subscribe((result) => {
        if (result) {
          this.categoryService.deleteCategory(id);
        }
      });
  }
}
