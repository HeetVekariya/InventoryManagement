import { TestBed } from '@angular/core/testing';

import { ModifyItemsService } from './modify-items.service';

describe('ModifyItemsService', () => {
  let service: ModifyItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModifyItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
