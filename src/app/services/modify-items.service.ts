import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModifyItemsService {
  isAddOperation: boolean | undefined = true;
  updateItem:
    | {
        category: string | undefined;
        itemId: number;
        categoryId: number;
        name: string;
        active: boolean;
      }
    | undefined;

  addItem() {
    this.isAddOperation = true;
  }

  editItem(item: {
    category: string | undefined;
    itemId: number;
    categoryId: number;
    name: string;
    active: boolean;
  }) {
    this.isAddOperation = false;
    this.updateItem = item;
  }
}
