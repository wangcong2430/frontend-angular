import { Component, ChangeDetectorRef,  ChangeDetectionStrategy, OnDestroy, OnInit} from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, debounceTime, switchMap, skip, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { trim } from 'lodash';
import { isArray } from 'ngx-bootstrap';

@Component({
  selector: 'app-multiple-select-component',
  templateUrl: './multiple-select.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    ::ng-deep .ant-select-dropdown-menu-item {
      overflow: auto;
      text-overflow: unset;
    }
  `]
})

export class MultipleSelectComponent extends FieldType implements OnInit,  OnDestroy {

  constructor(
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  ngOnInit() {
    this.formControl.valueChanges.subscribe(data => {
      //console.log(data)


    });
  }

  trackByFn(index, item) {
    return item.id ? item.id : index; // or item.id
  }

  modelChange () {
    if (this.model[this.key] && this.model[this.key].length > 0) {
      this.model[this.key] = this.model[this.key].map(item => {
        if (item.attr_type === '1' && item.form_num > 1 && item.options && item.options.length > 0) {
          if (item.options.every(res => res.value === null)) {
            item.value = null;
          } else {
            item.value = item.options.map(res => res.value).filter(x => x).join('|');
          }
        }
        if(item.attr_type == '2'&& item.form_num ==1&& item.options && item.options.length > 0){
          //console.log(item.value)
          if(isArray(item.value)){
            item.value = item.value.filter(x => x)
          }
          //console.log(item.value)        
        }
        return item;
      }).filter(x=>x);
    }
    //console.log(this.model[this.key])
    this.formControl.patchValue(this.model[this.key])
    this.cd.markForCheck();
  }

}
