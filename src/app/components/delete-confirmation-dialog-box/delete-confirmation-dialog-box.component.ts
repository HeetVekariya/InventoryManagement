import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-confirmation-dialog-box',
  imports: [NgIf],
  templateUrl: './delete-confirmation-dialog-box.component.html',
  styleUrl: './delete-confirmation-dialog-box.component.css',
})
export class DeleteConfirmationDialogBoxComponent {
  dialogRef = inject(MatDialogRef<DeleteConfirmationDialogBoxComponent>);

  warningMessage: string | undefined;
}
