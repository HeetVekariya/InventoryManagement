import { Component, inject } from '@angular/core';
import { ItemService } from '../../service/item.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-item-list',
  imports: [NgIf, CommonModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css',
})
export class ItemListComponent {
  itemService = inject(ItemService);

  items$ = this.itemService.getItems();
}
