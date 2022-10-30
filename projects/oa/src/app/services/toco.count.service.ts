import { EventEmitter } from '@angular/core';

export class TodoCountService {
  public releaseTodoCount$: EventEmitter<number>;
  public faultTodoCount$: EventEmitter<number>;
  public changeTodoCount$: EventEmitter<number>;

  constructor() {
    this.releaseTodoCount$ = new EventEmitter();
    this.faultTodoCount$ = new EventEmitter();
    this.changeTodoCount$ = new EventEmitter();
  }

  public updateReleaseCount(count) {
    this.releaseTodoCount$.emit(count);
  }

  public updateFaultCount(count) {
    this.faultTodoCount$.emit(count);
  }

  public updateChangeCount(count) {
    this.changeTodoCount$.emit(count);
  }
}
