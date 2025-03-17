import { Category } from './../models/category';
import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormComponent } from '../components/popup-form/popup-form.component';

@Injectable({
  providedIn: 'root',
})
export class PopupFormService {
  dialogBox = inject(MatDialog);
  isAddOperation: boolean | undefined;
  updateCategory: Category | undefined;

  addCategoryForm() {
    this.isAddOperation = true;
    this.dialogBox.open(PopupFormComponent, {
      panelClass: 'form-dialog-box',
    });
  }

  editCategoryForm(category: Category) {
    this.isAddOperation = false;
    this.updateCategory = category;
    this.dialogBox.open(PopupFormComponent, {
      panelClass: 'form-dialog-box',
    });
  }
}
