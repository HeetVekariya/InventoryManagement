import { Component, inject } from '@angular/core';
import { PopupFormService } from '../../services/popup-form.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-popup-form',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './popup-form.component.html',
  styleUrl: './popup-form.component.css',
})
export class PopupFormComponent {
  popupFormService = inject(PopupFormService);
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
        categoryName: this.categoryForm.controls.categoryName.value,
        isActive: this.categoryForm.controls.isAvailable.value === 'true',
      };
      console.log('Form Submitted !', newCategory);
    }
    this.closeDialogBox();
  }
}
