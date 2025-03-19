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

  items$ = this.itemService.itemsWithCategories$.pipe(
    shareReplay(1),
    tap((items) => console.log(items))
  );

  constructor() {
    this.itemService.getItems().subscribe();
  }

  salesForm = new FormGroup({
    itemId: new FormControl(null, [Validators.required]),
    price: new FormControl(null, [Validators.required]),
    quantity: new FormControl(null, [Validators.required]),
    salesAmount: new FormControl(null, [Validators.required]),
    salesDate: new FormControl(null, [Validators.required]),
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
}
