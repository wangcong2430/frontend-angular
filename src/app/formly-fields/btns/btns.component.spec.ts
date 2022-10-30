import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyFieldBtns } from './btns.component';

describe('BtnsComponent', () => {
  let component: FormlyFieldBtns;
  let fixture: ComponentFixture<FormlyFieldBtns>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormlyFieldBtns ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyFieldBtns);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
