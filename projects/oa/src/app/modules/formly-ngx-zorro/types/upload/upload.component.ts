// 创建需求 - 上传模块
import { Component, OnDestroy, OnInit, ChangeDetectorRef,  ChangeDetectionStrategy } from '@angular/core';
import { UploadXHRArgs } from 'ng-zorro-antd';
import { FieldArrayType, FormlyFormBuilder } from '@ngx-formly/core';
import { UploadService } from '../../../../services/upload.service';
import { MessageService } from '../../../../services/message.service';
import { takeUntil, filter, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, Observer } from 'rxjs';
import { CosService } from '../../../../services/cos.service';


@Component({
  selector: 'app-upload-component',
  templateUrl: './upload.component.html',
  providers          : [ UploadService ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
        margin-bottom: 30px;
    }

    :host ::ng-deep .upload-list-inline{
        display: flex;
    }

    :host ::ng-deep .ant-upload-select{
        width: 100px;
    }

    :host ::ng-deep .ant-upload-list{
        display: flex;
        flex-wrap: wrap;
        width: calc(100% - 100px);
        flex: 1;
    }

    :host ::ng-deep .ant-upload-list .ant-upload-list-item {
      max-width: 25%;
    }

    :host ::ng-deep .ant-upload-list .ant-upload-list-item .ant-upload-list-item-name {
      padding-right: 8px;
    }

    :host ::ng-deep .ant-upload-disabled .ant-btn {
      color: rgba(0,0,0,.25);
      background-color: #f5f5f5;
      border-color: #d9d9d9;
      text-shadow: none;
      box-shadow: none;
    }

    :host ::ng-deep .ant-upload-disabled .ant-upload-list-item:hover .ant-upload-list-item-info {
      background-color: white;
    }

    :host ::ng-deep .upload-disabled .anticon-close{
      display: none;
    }
    `
  ]
})

export class NzUploadComponent extends FieldArrayType implements OnDestroy, OnInit {
  constructor(
    builder: FormlyFormBuilder,
    private http: HttpClient,
    private msg: MessageService,
    public uploadService: UploadService,
    private cd: ChangeDetectorRef,
    public cos: CosService
  ) {
    super(builder);
  }

  onDestroy$ = new Subject<void>();


  get objtype () {
    return this.to['key'] ? this.to['key'] : '1025'
  }

  fileList?: any[];

  handleChange({ file, fileList, event}): void {
    if (this.to['nzMultiple'] === false && this.to['nzLimit'] === 1) {
      if (file.status === 'uploading') {
        this.fileList = [file];
      }
      if (file.status === 'done') {
        // this.formControl.patchValue(this.fileList);
      }
    } else {
      console.log(fileList)

      const data = fileList.filter(item => item.status == 'done').map(file => {
        return {
          uid: file.originFileObj.file_id,
          name: file.name,
          url: file.response.Location,
          status: file.status
        }
      })

      if (data.length) {
        this.formControl.patchValue(data);
      }
    }

    if (fileList.length === 0) {
      this.formControl.setValue(null);
    }

    if (typeof this.to['nzChange'] === 'function' ) {
      this.to.nzChange(fileList, file, event);
    }
    this.cd.markForCheck();
  }


  ngOnInit () {
    this.formControl.valueChanges
      .pipe(distinctUntilChanged())
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(item => {
        if (item && item.length && item instanceof Array) {
          this.fileList = item
        } else {
          this.fileList = []
        }
        this.cd.markForCheck();
      });

    this.cd.markForCheck();
  }

  ngOnDestroy() {
    // 组件销毁时, 删除循环的列表
    if (this.field.fieldGroup && this.field.fieldGroup.length > 0) {
      this.field.fieldGroup.map((item, index) => {
        super.remove(index);
      });
    }

    this.onDestroy$.next();
    this.cd.markForCheck();
  }
}
