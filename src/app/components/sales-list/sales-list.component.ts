import { Component, inject, OnInit } from '@angular/core';
import { SalesService } from '../../services/sales.service';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { tap } from 'rxjs';

@Component({
  selector: 'app-sales-list',
  imports: [NgIf, CommonModule, HeaderComponent],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.css',
})
export class SalesListComponent implements OnInit {
  salesService = inject(SalesService);

  ngOnInit(): void {
    this.salesService.getSales().subscribe();
  }

  sales$ = this.salesService.salesWithItems$;
}
