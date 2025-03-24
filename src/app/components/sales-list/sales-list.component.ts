import { Component, inject, signal } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { combineLatest, map, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ModifySalesService } from '../../services/modify-sales.service';
import { ItemService } from '../../services/item.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-sales-list',
  imports: [NgIf, CommonModule, HeaderComponent],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.css',
})
export class SalesListComponent {
  salesService = inject(SalesService);
  itemService = inject(ItemService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  modifySalesService = inject(ModifySalesService);
  disableAddSale = signal(true);
  page = 1;
  sortBy = 'salesId';
  pageSize = '10';
  sortOrder = 'asd';

  private getParameters(): HttpParams {
    return new HttpParams()
      .set('page', this.page)
      .set('sortBy', this.sortBy)
      .set('pageSize', Number(this.pageSize))
      .set('sortOrder', this.sortOrder)
      .set('calledFromSalesList', Boolean(true));
  }

  constructor() {
    this.itemService.getItems().subscribe();
    this.salesService.getSales(true).subscribe();
  }

  onSort(sortBy: string) {
    if (this.sortBy === sortBy) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
    }

    this.filterSales();
  }

  filterSales() {
    let parameters = this.getParameters();

    this.salesService.parameters = parameters;
    this.salesService.getSales(true).subscribe();
  }

  salesWithItems$ = combineLatest([
    this.itemService.items$,
    this.salesService.sales$,
  ]).pipe(
    map(([items, sales]) => {
      return sales.map((sale) => {
        return {
          ...sale,
          item: items.find((item) => item.itemId === sale.itemId)?.name,
        };
      });
    }),
    tap(() => this.disableAddSale.set(!this.disableAddSale))
  );

  redirectToAddPage() {
    this.modifySalesService.addSales();
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  redirectToEditPage(sales: {
    salesId: number;
    item: string | undefined;
    itemId: number;
    quantity: number;
    price: number;
    salesAmount: number;
    salesDate: Date;
    insertedDate: Date;
  }) {
    this.modifySalesService.editSales(sales);
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  deleteSales(id: number) {
    this.salesService.deleteSales(id);
  }
}
