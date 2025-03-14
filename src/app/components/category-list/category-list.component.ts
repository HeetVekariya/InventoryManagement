import { Component, inject } from '@angular/core';
import { CategoryService } from '../../service/category.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-category-list',
  imports: [NgIf, CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent {
  categoryService = inject(CategoryService);

  categories$ = this.categoryService.getCategories();
}
