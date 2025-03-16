import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormComponent } from '../components/popup-form/popup-form.component';

@Injectable({
  providedIn: 'root',
})
export class PopupFormService {
  dialogBox = inject(MatDialog);

  openDialogBox() {
    this.dialogBox.open(PopupFormComponent, {
      panelClass: 'form-dialog-box',
    });
  }
}
