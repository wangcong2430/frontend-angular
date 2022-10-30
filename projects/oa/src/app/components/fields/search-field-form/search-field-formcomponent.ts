import { ChangeDetectorRef,  ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions  } from '@ngx-formly/core';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-search-field-form',
  templateUrl: './search-field-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
    :host::ng-deep .search-bar::deep- .ant-col-6:nth-child(n+4){
        display: block;
    }
    :host::ng-deep .search-bar .ant-col-6:last-child{
        display: block;
    }

    /* 如果是 */
    :host::ng-deep .search-bar.iscollapse .ant-col-6:nth-child(n+4){
        display: none !important;
    }
    :host::ng-deep .search-bar.iscollapse .ant-col-6:last-child{
        display: block !important;
    }

    :host::ng-deep .search-bar .ant-card-body{
        padding-top: 8px;
        padding-bottom: 0;
    }

    :host::ng-deep .search-results .ant-card-body{
        padding: 16px;
        padding-top: 8px;
    }

    :host::ng-deep .search-bar .ant-card-body .ant-form-item-label {
        padding-bottom: 0 !important;
    }

    `
  ]
})

export class SearchFieldFormComponent implements OnInit {

  @Input()
  set model(model: any) { this._model = model; }
  get model() { return this._model; }

  @Input()
  set fields(fields: FormlyFieldConfig[]) { this._fields = fields; }
  get fields() { return this._fields; }

  @Output() submit = new EventEmitter<any>();

  form: FormGroup | FormArray = new FormGroup({});
  options: FormlyFormOptions;
  isCollapse: Boolean;

  private _model: any;
  private _fields: FormlyFieldConfig[];

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,

  ) {}

  ngOnInit() {

  }

  ngSubmit ($event) {
    this.submit.emit(Object.assign({}, this.model));
    this.cd.markForCheck();
  }

  toggleCollapse(): void {
    this.isCollapse = this.fields.length > 3 ? !this.isCollapse : this.isCollapse;
    this.cd.markForCheck();
  }
}
