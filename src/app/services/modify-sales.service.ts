import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModifySalesService {
  isAddOperation: boolean | undefined;
  updateSales:
    | {
        salesId: number;
        item: string | undefined;
        itemId: number;
        quantity: number;
        price: number;
        salesAmount: number;
        salesDate: Date;
        insertedDate: Date;
      }
    | undefined;

  addSales() {
    this.isAddOperation = true;
  }

  editSales(sales: {
    salesId: number;
    item: string | undefined;
    itemId: number;
    quantity: number;
    price: number;
    salesAmount: number;
    salesDate: Date;
    insertedDate: Date;
  }) {
    this.isAddOperation = false;
    this.updateSales = sales;
  }
}
