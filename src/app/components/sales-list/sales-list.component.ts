import { Component, inject, OnInit, signal } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ModifySalesService } from '../../services/modify-sales.service';

@Component({
  selector: 'app-sales-list',
  imports: [NgIf, CommonModule, HeaderComponent],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.css',
})
export class SalesListComponent implements OnInit {
  salesService = inject(SalesService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  modifySalesService = inject(ModifySalesService);
  disableAddSale = signal(true);

  ngOnInit(): void {
    this.salesService.getSales().subscribe();
  }

  sales$ = this.salesService.salesWithItems$.pipe(
    tap(() => this.disableAddSale.set(!this.disableAddSale()))
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
