import { Component, inject, OnInit, signal } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { ModifyItemsService } from '../../services/modify-items.service';
import { HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-list',
  imports: [NgIf, CommonModule, HeaderComponent, RouterModule, FormsModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css',
})
export class ItemListComponent implements OnInit {
  itemService = inject(ItemService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  disableAddItem = signal(true);
  modifyItemService = inject(ModifyItemsService);
  isActive = '';
  sortBy = 'itemId';
  pageSize = '10';
  sortOrder = 'asc';

  private getParameters(): HttpParams {
    return new HttpParams()
      .set('isActive', this.isActive)
      .set('sortBy', this.sortBy)
      .set('pageSize', Number(this.pageSize))
      .set('sortOrder', this.sortOrder)
      .set('calledFromItemList', Boolean(true));
  }

  ngOnInit(): void {
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
    this.itemService.getItems(true).subscribe();
  }

  items$ = this.itemService.itemsWithCategories$.pipe(
    tap(() => this.disableAddItem.set(!this.disableAddItem))
  );

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
    this.modifyItemService.editItem(item);
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  deleteItem(id: number) {
    this.itemService.deleteItem(id);
  }
}
