import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ItemService } from '../../services/item.service';
import { shareReplay, tap } from 'rxjs';
import { SalesService } from '../../services/sales.service';
import { ModifySalesService } from '../../services/modify-sales.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-modify-sales',
  imports: [HeaderComponent, ReactiveFormsModule, NgIf, NgFor, CommonModule],
  templateUrl: './modify-sales.component.html',
  styleUrl: './modify-sales.component.css',
})
export class ModifySalesComponent {
  router = inject(Router);
  private itemService = inject(ItemService);
  salesService = inject(SalesService);
  modifySalesService = inject(ModifySalesService);
  toastService = inject(ToastrService);
  isAddOperation = this.modifySalesService.isAddOperation;
  updateSales = this.modifySalesService.updateSales;

  items$ = this.itemService.items$.pipe(
    shareReplay(1),
    tap((items) => console.log(items))
  );

  constructor() {
    this.itemService.getItems().subscribe();
  }

  salesForm = new FormGroup({
    itemId: new FormControl(
      this.isAddOperation ? null : this.updateSales?.itemId,
      [Validators.required]
    ),
    price: new FormControl(
      this.isAddOperation ? null : this.updateSales?.price,
      [Validators.required]
    ),
    quantity: new FormControl(
      this.isAddOperation ? null : this.updateSales?.quantity,
      [Validators.required]
    ),
    salesAmount: new FormControl(
      this.isAddOperation ? null : this.updateSales?.salesAmount,
      [Validators.required]
    ),
    salesDate: new FormControl(
      this.isAddOperation ? null : this.updateSales?.salesDate,
      [Validators.required]
    ),
  });

  goToSalesPage() {
    this.router.navigate(['sales']);
  }

  onSubmitAddSales() {
    if (this.salesForm.valid) {
      const newSales = {
        itemId: this.salesForm.controls.itemId.value
          ? Number(this.salesForm.controls.itemId.value)
          : -1,
        price: this.salesForm.controls.price.value
          ? Number(this.salesForm.controls.price.value)
          : 0,
        quantity: this.salesForm.controls.quantity.value
          ? Number(this.salesForm.controls.quantity.value)
          : 0,
        salesAmount: this.salesForm.controls.salesAmount.value
          ? Number(this.salesForm.controls.salesAmount.value)
          : 0,
        salesDate: this.salesForm.controls.salesDate.value
          ? new Date(this.salesForm.controls.salesDate.value)
          : new Date(),
      };

      this.salesService.postSales(newSales);
    }
  }

  onSubmitEditSales() {
    if (this.salesForm.valid) {
      if (
        Number(this.salesForm.controls.itemId.value) ===
          this.updateSales?.itemId &&
        this.salesForm.controls.price.value === this.updateSales?.price &&
        this.salesForm.controls.quantity.value === this.updateSales?.quantity &&
        this.salesForm.controls.salesAmount.value ===
          this.updateSales?.salesAmount &&
        this.salesForm.controls.salesDate.value === this.updateSales?.salesDate
      ) {
        this.toastService.info('No changes has been made.', 'Info');
      } else {
        const updatedSale = {
          salesId: this.updateSales?.salesId ? this.updateSales?.salesId : -1,
          itemId: this.salesForm.controls.itemId.value
            ? Number(this.salesForm.controls.itemId.value)
            : -1,
          price: this.salesForm.controls.price.value
            ? this.salesForm.controls.price.value
            : 0,
          quantity: this.salesForm.controls.quantity.value
            ? this.salesForm.controls.quantity.value
            : 0,
          salesAmount: this.salesForm.controls.salesAmount.value
            ? this.salesForm.controls.salesAmount.value
            : 0,
          salesDate: this.salesForm.controls.salesDate.value
            ? this.salesForm.controls.salesDate.value
            : new Date(),
          insertedDate: this.updateSales?.insertedDate
            ? this.updateSales.insertedDate
            : new Date(),
        };
        this.salesService.updateSales(updatedSale);
      }
    }
  }
}
