import { Component, OnInit, OnDestroy, ChangeDetectorRef,  ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { FieldType } from '@ngx-formly/core';
import { UploadService } from '../../../services/upload.service';

@Component({
  selector: 'app-field-name-checkbox-component',
  templateUrl: './field-name-checkbox.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host ::ng-deep .ant-checkbox-wrapper + .ant-checkbox-wrapper {
      margin-left: 0px;
    }

    :host ::ng-deep .ant-checkbox-wrapper {
      min-width: 162px;
    }
  `]
})

export class FieldNameCheckboxComponent extends FieldType implements OnInit, OnDestroy  {

  constructor(
    public uploadService: UploadService,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  get lists () {
    if (!(this.to.options instanceof Observable)) {
      return this.to['options'] || [];
    } else {
      return  []
    }

  }

  ngOnInit () {
    if (this.formControl.value) {
      const arr = this.formControl.value.split(',');
      this.to['options'] = (<any[]>this.to['options']).map(item => {
        let checked, indeterminate;
        const children =  item.children.map(res => {
          return {
            ...res,
            checked: arr.some(item => item === res.key)
          };
        });

        if (children.every(item => item.checked === false)) {
          checked = false;
          indeterminate = false;
        } else if (children.every(item => item.checked === true)) {
          checked = true;
          indeterminate = false;
        } else {
          indeterminate = true;
        }
        return {
          ...item,
          checked: checked,
          indeterminate: indeterminate,
          children: children

        };
      });
    }

    this.cd.markForCheck();
  }

  ngOnDestroy () {
    if ((<any[]>this.to['options']).length > 0) {
      this.to['options'] = (<any[]>this.to['options']).map(item => {
        return {
          ...item,
          checked: false,
          children: item.children.map(res => {
            return {
              ...res,
              checked: false
            };
          })
        };
      });
    }
  }

  updateAllChecked(item): void {
    item.indeterminate = false;
    if (item.checked) {
      item.children = item.children.map(item => {
        return {
          ...item,
          checked: true
        };
      });
    } else {
      item.children = item.children.map(item => {
        return {
          ...item,
          checked: false
        };
      });
    }

    this.getCheckValue(item);
    this.cd.markForCheck();
  }

  updateSingleChecked($event, item): void {
    if (item.children.every(item => item.checked === false)) {
      item.checked = false;
      item.indeterminate = false;
    } else if (item.children.every(item => item.checked === true)) {
      item.checked = true;
      item.indeterminate = false;
    } else {
      item.indeterminate = true;
    }

    this.getCheckValue(item);
    this.cd.markForCheck();

  }

  getCheckValue (item) {
    const options = <any[]>this.to['options']
    if (Array.isArray(options)) {
      const value =  options.map(item => {
        return item.children.filter(res => res.checked === true).map(res => res.key).toString()
      }).filter(item => item.length > 0).toString();

      this.model[this.key] = value;
      this.formControl.setValue(value);
    }
    this.cd.markForCheck();
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index;
  }
}
