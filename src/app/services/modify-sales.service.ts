import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ModifySalesService {
  isAddOperation: boolean | undefined;

  addSales() {
    this.isAddOperation = true;
  }
}
