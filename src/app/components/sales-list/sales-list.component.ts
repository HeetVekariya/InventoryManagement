import { Component, inject } from '@angular/core';
import { SalesService } from '../../service/sales.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-sales-list',
  imports: [NgIf, CommonModule],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.css',
})
export class SalesListComponent {
  salesService = inject(SalesService);

  sales$ = this.salesService.getSales();
}
