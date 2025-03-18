import { Component, inject, OnInit } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-item-list',
  imports: [NgIf, CommonModule, HeaderComponent],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css',
})
export class ItemListComponent implements OnInit {
  itemService = inject(ItemService);

  ngOnInit(): void {
    this.itemService.getItems().subscribe();
  }
  items$ = this.itemService.itemsWithCategories$;
}
