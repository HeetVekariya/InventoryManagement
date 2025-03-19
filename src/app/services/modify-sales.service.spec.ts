import { TestBed } from '@angular/core/testing';

import { ModifySalesService } from './modify-sales.service';

describe('ModifySalesService', () => {
  let service: ModifySalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModifySalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
