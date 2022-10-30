import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormlyFieldRadio } from './radio.component';

describe('RadioComponent', () => {
  let component: FormlyFieldRadio;
  let fixture: ComponentFixture<FormlyFieldRadio>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormlyFieldRadio ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormlyFieldRadio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
