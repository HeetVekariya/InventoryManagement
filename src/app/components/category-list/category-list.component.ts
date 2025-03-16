import { Component, inject } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { PopupFormService } from '../../services/popup-form.service';

@Component({
  selector: 'app-category-list',
  imports: [NgIf, CommonModule, HeaderComponent],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent {
  categoryService = inject(CategoryService);
  popupFormService = inject(PopupFormService);

  categories$ = this.categoryService.categoriesWithAdd$;

  addCategory() {
    this.popupFormService.openDialogBox();
  }
}
