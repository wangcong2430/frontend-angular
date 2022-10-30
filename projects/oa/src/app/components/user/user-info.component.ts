import {
  Component, ChangeDetectorRef, OnChanges,
  ChangeDetectionStrategy, OnInit, OnDestroy,  Input, Output, EventEmitter, SimpleChanges, ViewEncapsulation
} from '@angular/core';
import { Subject} from 'rxjs';
import { filterOption } from '../../utils/utils';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class UserInfoComponent implements OnInit, OnDestroy {
  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  @Input() user: string = null;

  collapsed: boolean = true;

  get userList(): any {
		return this.user.split(';').filter(user => user && user.split('(')[0]).map(item => {
      return {
        name: item.split('(')[0],
        user: item
      }
    });
  }
  filterOption = filterOption

  ngOnInit () {
    // 如果model 有数据, 则使用model, 否则使用options
  }

  isCollapsed ($event) {
    $event.stopPropagation();
    this.collapsed = !this.collapsed;
    console.log(this.collapsed)
    this.cd.markForCheck();
  }

  isNaNFn (str) {
    return isNaN(str)
  }

  ngOnDestroy() { }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; 
  }
}
