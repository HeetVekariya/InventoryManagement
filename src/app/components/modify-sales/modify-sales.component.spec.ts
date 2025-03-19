import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifySalesComponent } from './modify-sales.component';

describe('ModifySalesComponent', () => {
  let component: ModifySalesComponent;
  let fixture: ComponentFixture<ModifySalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifySalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifySalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
