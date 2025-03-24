import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteConfirmationDialogBoxComponent } from './delete-confirmation-dialog-box.component';

describe('DeleteConfirmationDialogBoxComponent', () => {
  let component: DeleteConfirmationDialogBoxComponent;
  let fixture: ComponentFixture<DeleteConfirmationDialogBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteConfirmationDialogBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteConfirmationDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
