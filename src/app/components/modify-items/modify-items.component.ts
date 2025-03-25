import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { shareReplay, tap } from 'rxjs';
import { ItemService } from '../../services/item.service';
import { Router } from '@angular/router';
import { Item } from '../../models/item';
import { ModifyItemsService } from '../../services/modify-items.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modify-items',
  imports: [HeaderComponent, ReactiveFormsModule, NgIf, NgFor, CommonModule],
  templateUrl: './modify-items.component.html',
  styleUrl: './modify-items.component.css',
})
export class ModifyItemsComponent {
  router = inject(Router);
  itemService = inject(ItemService);
  modifyItemService = inject(ModifyItemsService);
  toastService = inject(ToastrService);
  isAddOperation = this.modifyItemService.isAddOperation;
  updateItem = this.modifyItemService.updateItem;

  private categoryService = inject(CategoryService);
  categories$ = this.categoryService.categories$.pipe(
    shareReplay(1) // To let the categories available immediately
  );

  constructor() {
    this.categoryService.getCategories().subscribe();
  }

  itemForm = new FormGroup({
    itemName: new FormControl(
      this.isAddOperation ? '' : this.updateItem?.name,
      [Validators.required, Validators.minLength(3)]
    ),
    categoryId: new FormControl(
      this.isAddOperation ? null : this.updateItem?.categoryId,
      [Validators.required]
    ),
    isAvailable: new FormControl('true', [Validators.required]),
  });

  goToItemsPage() {
    this.router.navigate(['items']);
  }

  onSubmitAddItem() {
    if (this.itemForm.valid) {
      let newItem = {
        categoryId: this.itemForm.controls.categoryId.value
          ? Number(this.itemForm.controls.categoryId.value)
          : -1,
        name: this.itemForm.controls.itemName.value
          ? this.itemForm.controls.itemName.value
          : '',
        active: this.itemForm.controls.isAvailable?.value === 'true',
      };

      this.itemService.postItem(newItem);
    }
  }

  onSubmitEditItem() {
    if (this.itemForm.valid) {
      if (
        this.itemForm.controls.itemName.value === this.updateItem?.name &&
        Number(this.itemForm.controls.categoryId.value) ===
          this.updateItem?.categoryId &&
        this.itemForm.controls.isAvailable.value ===
          String(this.updateItem?.active)
      ) {
        this.toastService.info('No changes has been made.', 'Info');
      } else {
        const updatedItem: Item = {
          itemId: this.updateItem?.itemId ? this.updateItem?.itemId : -1,
          categoryId: this.itemForm.controls.categoryId.value
            ? Number(this.itemForm.controls.categoryId.value)
            : -1,
          name: this.itemForm.controls.itemName.value
            ? this.itemForm.controls.itemName.value
            : '',
          active: this.itemForm.controls.isAvailable.value === 'true',
        };
        this.itemService.updateItem(updatedItem);
      }
    }
  }
}
