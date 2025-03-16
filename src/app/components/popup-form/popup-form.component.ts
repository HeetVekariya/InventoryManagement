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

@Component({
  selector: 'app-popup-form',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './popup-form.component.html',
  styleUrl: './popup-form.component.css',
})
export class PopupFormComponent {
  popupFormService = inject(PopupFormService);
  categoryService = inject(CategoryService);

  categoryForm = new FormGroup({
    categoryName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    isAvailable: new FormControl('true', [Validators.required]),
  });

  closeDialogBox() {
    this.popupFormService.dialogBox.closeAll();
  }

  onSubmit() {
    if (this.categoryForm.valid) {
      let newCategory = {
        name: this.categoryForm.controls.categoryName.value
          ? this.categoryForm.controls.categoryName.value
          : '',
        active: this.categoryForm.controls.isAvailable.value === 'true',
      };
      console.log('Form Submitted !', newCategory);
      this.categoryService.postCategory(newCategory);
    }
    this.closeDialogBox();
  }
}
