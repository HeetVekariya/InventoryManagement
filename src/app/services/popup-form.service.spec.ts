import { TestBed } from '@angular/core/testing';

import { PopupFormService } from './popup-form.service';

describe('PopupFormService', () => {
  let service: PopupFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PopupFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
