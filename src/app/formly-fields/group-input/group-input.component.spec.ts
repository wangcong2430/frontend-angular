import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupInputComponent } from './group-input.component';

describe('GroupInputComponent', () => {
  let component: GroupInputComponent;
  let fixture: ComponentFixture<GroupInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
