import { Component, inject, signal } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { combineLatest, map, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ModifySalesService } from '../../services/modify-sales.service';
import { ItemService } from '../../services/item.service';
import { HttpParams } from '@angular/common/http';
import { Item } from '../../models/item';
import { FormsModule } from '@angular/forms';
import { DeleteConfirmationService } from '../../services/delete-confirmation.service';
import { AuthGuardService } from '../../services/auth-guard.service';

@Component({
  selector: 'app-sales-list',
  imports: [NgIf, CommonModule, HeaderComponent, FormsModule],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.css',
})
export class SalesListComponent {
  salesService = inject(SalesService);
  itemService = inject(ItemService);
  confirmationDialogService = inject(DeleteConfirmationService);
  authService = inject(AuthGuardService);
  items: Item[] = [];
  router = inject(Router);
  route = inject(ActivatedRoute);
  modifySalesService = inject(ModifySalesService);
  disableAddSale = signal(true);
  itemId = -1;
  startDate: Date | undefined;
  endDate: Date | undefined;
  page = 1;
  sortBy = 'salesId';
  pageSize = '10';
  sortOrder = 'asc';
  disableNextPage = signal(false);

  private getParameters(): HttpParams {
    return new HttpParams()
      .set('page', this.page)
      .set('itemId', Number(this.itemId))
      .set('sortBy', this.sortBy)
      .set('pageSize', Number(this.pageSize))
      .set('sortOrder', this.sortOrder)
      .set('calledFromSalesList', Boolean(true));
  }

  constructor() {
    this.itemService.getItems().subscribe();
    this.salesService.parameters = this.getParameters();
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

    if (this.startDate !== undefined) {
      parameters = parameters.set('startDate', this.startDate.toString());
    }

    if (this.endDate !== undefined) {
      parameters = parameters.set('endDate', this.endDate.toString());
    }

    this.salesService.parameters = parameters;
    this.salesService
      .getSales(true)
      .pipe(
        tap(() => {
          this.salesService.salesResponse?.totalPages
            ? this.page >= this.salesService.salesResponse.totalPages
              ? this.disableNextPage.set(true)
              : this.disableNextPage.set(false)
            : null;
        })
      )
      .subscribe();
  }

  goToPreviousPage() {
    this.page--;
    this.filterSales();
  }

  goToNextPage() {
    if (!this.disableNextPage()) {
      this.page++;
      this.filterSales();
    }
  }

  salesWithItems$ = combineLatest([
    this.itemService.items$,
    this.salesService.sales$,
  ]).pipe(
    map(([items, sales]) => {
      this.items = items;
      return sales.map((sale) => {
        return {
          ...sale,
          item: items.find((item) => item.itemId === sale.itemId)?.name,
        };
      });
    }),
    tap(() => this.disableAddSale.set(!this.disableAddSale))
  );

  getItemsList(): Item[] {
    return this.items;
  }

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
    this.authService.hasValidEditAccess = true;
    this.modifySalesService.editSales(sales);
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  deleteSales(id: number) {
    this.confirmationDialogService
      .openConfirmationDialogBox()
      .subscribe((result) => {
        if (result) {
          this.salesService.deleteSales(id);
        }
      });
  }
}
