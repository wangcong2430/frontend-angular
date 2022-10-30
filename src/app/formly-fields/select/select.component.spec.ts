import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyFieldSelect } from './select.component';

describe('SelectComponent', () => {
  let component: FormlyFieldSelect;
  let fixture: ComponentFixture<FormlyFieldSelect>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormlyFieldSelect ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyFieldSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
