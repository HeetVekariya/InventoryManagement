import { Component, inject } from '@angular/core';
import { PopupFormService } from '../../services/popup-form.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-popup-form',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './popup-form.component.html',
  styleUrl: './popup-form.component.css',
})
export class PopupFormComponent {
  popupFormService = inject(PopupFormService);
  categoryService = inject(CategoryService);
  toastService = inject(ToastrService);
  isAddOperation = this.popupFormService.isAddOperation;

  categoryForm = new FormGroup({
    categoryName: new FormControl(
      this.isAddOperation ? '' : this.popupFormService.updateCategory?.name,
      [Validators.required, Validators.minLength(3)]
    ),
    isAvailable: new FormControl(
      this.isAddOperation
        ? 'true'
        : String(this.popupFormService.updateCategory?.active),
      [Validators.required]
    ),
  });

  closeDialogBox() {
    this.popupFormService.dialogBox.closeAll();
  }

  onSubmitAddCategory() {
    if (this.categoryForm.valid) {
      let newCategory = {
        name: this.categoryForm.controls.categoryName.value
          ? this.categoryForm.controls.categoryName.value
          : '',
        active: this.categoryForm.controls.isAvailable.value === 'true',
      };
      this.categoryService.postCategory(newCategory);
    }
    this.closeDialogBox();
  }

  onSubmitEditCategory() {
    if (this.categoryForm.valid) {
      if (
        this.popupFormService.updateCategory?.name ===
          this.categoryForm.controls.categoryName.value &&
        String(this.popupFormService.updateCategory?.active) ===
          this.categoryForm.controls.isAvailable.value
      ) {
        this.toastService.info('No changes has been made.', 'Info');
      } else {
        const updatedCategory: Category = {
          categoryId: this.popupFormService.updateCategory
            ? this.popupFormService.updateCategory.categoryId
            : -1,
          name: this.categoryForm.controls.categoryName.value
            ? this.categoryForm.controls.categoryName.value
            : '',
          active: this.categoryForm.controls.isAvailable.value === 'true',
        };
        this.categoryService.updateCategory(updatedCategory);
      }
    }
    this.closeDialogBox();
  }
}
