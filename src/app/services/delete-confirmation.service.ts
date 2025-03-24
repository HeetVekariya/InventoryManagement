import { inject, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { map, Observable } from 'rxjs';
import { DeleteConfirmationDialogBoxComponent } from '../components/delete-confirmation-dialog-box/delete-confirmation-dialog-box.component';

@Injectable({
  providedIn: 'root',
})
export class DeleteConfirmationService {
  confirmationDialogBox = inject(MatDialog);

  openConfirmationDialogBox(message?: string) {
    const dialogRef = this.confirmationDialogBox.open(
      DeleteConfirmationDialogBoxComponent,
      {
        panelClass: 'confirmation-dialog-box',
        disableClose: false,
      }
    );

    if (message) {
      dialogRef.componentInstance.warningMessage = message;
    }

    return dialogRef
      .afterClosed()
      .pipe(map((result) => (result ? true : false)));
  }
}
