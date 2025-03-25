import { Component, inject, signal } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { combineLatest, map, tap } from 'rxjs';
import { ModifyItemsService } from '../../services/modify-items.service';
import { HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { DeleteConfirmationService } from '../../services/delete-confirmation.service';
import { AuthGuardService } from '../../services/auth-guard.service';

@Component({
  selector: 'app-item-list',
  imports: [NgIf, CommonModule, HeaderComponent, RouterModule, FormsModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css',
})
export class ItemListComponent {
  itemService = inject(ItemService);
  categoryService = inject(CategoryService);
  authService = inject(AuthGuardService);
  confirmationDialogService = inject(DeleteConfirmationService);
  categories: Category[] = [];
  router = inject(Router);
  route = inject(ActivatedRoute);
  disableAddItem = signal(true);
  modifyItemService = inject(ModifyItemsService);
  isActive = '';
  categoryId = -1;
  page = 1;
  sortBy = 'itemId';
  pageSize = '10';
  sortOrder = 'asc';
  disableNextPage = signal(false);

  private getParameters(): HttpParams {
    return new HttpParams()
      .set('page', this.page)
      .set('isActive', this.isActive)
      .set('categoryId', Number(this.categoryId))
      .set('sortBy', this.sortBy)
      .set('pageSize', Number(this.pageSize))
      .set('sortOrder', this.sortOrder)
      .set('calledFromItemList', Boolean(true));
  }

  constructor() {
    this.categoryService.getCategories().subscribe();
    this.itemService.parameters = this.getParameters();
    this.itemService.getItems(true).subscribe();
  }

  onSort(sortBy: string) {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
    }

    this.filterItems();
  }

  filterItems() {
    let parameters = this.getParameters();

    this.itemService.parameters = parameters;
    this.itemService
      .getItems(true)
      .pipe(
        tap(() => {
          this.itemService.itemsResponse?.totalPages
            ? this.page >= this.itemService.itemsResponse.totalPages
              ? this.disableNextPage.set(true)
              : this.disableNextPage.set(false)
            : null;
        })
      )
      .subscribe();
  }

  goToPreviousPage() {
    this.page--;
    this.filterItems();
  }

  goToNextPage() {
    if (!this.disableNextPage()) {
      this.page++;
      this.filterItems();
    }
  }

  itemsWithCategories$ = combineLatest([
    this.categoryService.categories$,
    this.itemService.items$,
  ]).pipe(
    map(([categories, items]) => {
      this.categories = categories;
      return items.map((item) => {
        return {
          ...item,
          category: categories.find((c) => c.categoryId === item.categoryId)
            ?.name,
        };
      });
    }),
    tap(() => this.disableAddItem.set(!this.disableAddItem))
  );

  getCategoriesList(): Category[] {
    return this.categories;
  }

  redirectToAddPage() {
    this.modifyItemService.addItem();
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  redirectToEditPage(item: {
    category: string | undefined;
    itemId: number;
    categoryId: number;
    name: string;
    active: boolean;
  }) {
    this.authService.hasValidEditAccess = true;
    this.modifyItemService.editItem(item);
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  deleteItem(id: number) {
    this.confirmationDialogService
      .openConfirmationDialogBox(
        'All the sales records related to this item will be lost.'
      )
      .subscribe((result) => {
        if (result) {
          this.itemService.deleteItem(id);
        }
      });
  }
}
