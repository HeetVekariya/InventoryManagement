import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyItemsComponent } from './modify-items.component';

describe('ModifyItemsComponent', () => {
  let component: ModifyItemsComponent;
  let fixture: ComponentFixture<ModifyItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
