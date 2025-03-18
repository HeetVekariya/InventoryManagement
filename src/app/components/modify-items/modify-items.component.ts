import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { CommonModule, Location, NgFor, NgIf } from '@angular/common';
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

@Component({
  selector: 'app-modify-items',
  imports: [HeaderComponent, ReactiveFormsModule, NgIf, NgFor, CommonModule],
  templateUrl: './modify-items.component.html',
  styleUrl: './modify-items.component.css',
})
export class ModifyItemsComponent {
  router = inject(Router);
  itemService = inject(ItemService);
  private categoryService = inject(CategoryService);
  categories$ = this.categoryService.categories$.pipe(
    shareReplay(1), // To prevent incorrect rendering
    tap((categories) => console.log(categories))
  );

  constructor() {
    this.categoryService.getCategories().subscribe();
  }

  itemForm = new FormGroup({
    itemName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    categoryName: new FormControl(null, [Validators.required]),
    isAvailable: new FormControl('true', [Validators.required]),
  });

  goToPreviousPage() {
    this.router.navigate(['items']);
  }

  onSubmitAddItem() {
    if (this.itemForm.valid) {
      let newItem = {
        categoryId: this.itemForm.controls.categoryName.value
          ? Number(this.itemForm.controls.categoryName.value)
          : -1, // value is a number,
        name: this.itemForm.controls.itemName.value
          ? this.itemForm.controls.itemName.value
          : '',
        active: this.itemForm.controls.isAvailable?.value === 'true',
      };

      this.itemService.postItem(newItem);
      this.goToPreviousPage();
    }
  }
}
