import { Component, inject, OnInit, signal } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { CommonModule, NgIf } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';

@Component({
  selector: 'app-item-list',
  imports: [NgIf, CommonModule, HeaderComponent, RouterModule],
  templateUrl: './item-list.component.html',
  styleUrl: './item-list.component.css',
})
export class ItemListComponent implements OnInit {
  itemService = inject(ItemService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  disableAddItem = signal(true);

  ngOnInit(): void {
    this.itemService.getItems().subscribe();
  }

  items$ = this.itemService.itemsWithCategories$.pipe(
    tap(() => this.disableAddItem.set(!this.disableAddItem))
  );

  redirectToAddPage() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }
}
