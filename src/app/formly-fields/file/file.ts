import {Component, ElementRef, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {FileUploader} from 'ng2-file-upload';
import {UtilsService} from '../../services/utils.service';

@Component({
    selector: 'formly-field-file',
    template: `
        <div class="fileupload-default">
            <div class="fileupload-label">{{to.label}}<span *ngIf="to.required" class="text-danger"> *</span></div>
            <div class="fileupload-btn btn btn-primary flat" [ngClass]="{'btn-danger': showError && to.required, 'disabled': to.data && (uploader.queue.length+oldValue.length) >= to.data.queueLimit}" (click)="fileInput.click()">
                <i class="fa fa-cloud-upload"></i>
                <span>{{(to.data && to.data.btnText) || '上传文档'}}</span>
                <input type="file"
                       #fileInput
                       hidden
                       ng2FileSelect
                       multiple
                       [uploader]="uploader"
                       (response)="fileOverAnother($event)"
                       (change)="change()"
                       [disabled]="to.data && (uploader.queue.length+oldValue.length) >= to.data.queueLimit"
                       [formlyAttributes]="field">
            </div>
            <div class="fileupload-content" *ngIf="!to.disabled">
                <div class="fileupload-btn btn btn-primary flat" [ngClass]="{'btn-danger': showError && to.required, 'disabled': to.data && (uploader.queue.length+oldValue.length) >= to.data.queueLimit}" (click)="fileInput.click()">
                    <i class="fa fa-cloud-upload"></i>
                    <span>{{(to.data && to.data.btnText) || '上传文档'}}</span>
                    <input type="file"
                           #fileInput
                           hidden
                           ng2FileSelect
                           multiple
                           [uploader]="uploader"
                           (response)="fileOverAnother($event)"
                           (change)="change()"
                           [disabled]="to.data && (uploader.queue.length+oldValue.length) >= to.data.queueLimit"
                           [formlyAttributes]="field">
                </div>
                <div class="fileupload-template" *ngIf="to.data && to.data.tempUrl && to.data.tempName">
                    <span class="mr-2">参考模板</span>
                    <a href="{{to.data.tempUrl}}" target="_blank" class="text-primary">{{to.data.tempName}}</a>
                </div>
                <ul class="fileupload-list">
                    <li class="fileupload-item" *ngFor="let item of oldValue;let i = index;">
                        <div class="file-detail">
                            <i class="fa fa-file-text"></i><a class="file-name">{{item.label}}</a>
                        </div>
                        <div class="file-delete" (click)="delOldValue(i, item)"><i class="fa fa-trash-o"></i></div>
                    </li>
                    <li class="fileupload-item" *ngFor="let item of uploader.queue;let i = index;">
                        <div class="file-detail">
                            <i class="fa fa-file-text"></i><a class="file-name">{{item?.file?.name}}</a>
                        </div>
                        <div class="upload-status" *ngIf="!item['isFinish'] && autoUpload">
                            <span *ngIf="item.progress<100">文档上传中({{item.progress}}%)<i class="fa fa-spinner fa-spin ml-2"></i></span>
                            <span *ngIf="item.progress===100 && item.isUploaded" class="text-danger">文件过大，上传失败</span>
                        </div>
                        <div class="file-delete" (click)="deleteFile(i, item)"><i class="fa fa-trash-o"></i></div>
                    </li>
                </ul>
                <!--<span class="text-muted bottom" *ngIf="to.desc" [innerHTML]="to.desc"></span>-->
            </div>
            <div class="fileupload-content" *ngIf="to.disabled">
                <div class="formly-field-text" *ngFor="let item of oldValue">{{item.label}}</div>
            </div>
        </div>
  `,
})
export class FormlyFieldFile extends FieldType implements OnInit{
    public uploader: FileUploader = new FileUploader({
        url: 'web/file/upload',
        autoUpload: true
    });
    autoUpload = true;
    oldValue = [];

    constructor(private service: UtilsService, private el: ElementRef) {
        super();
    }

    ngOnInit() {
        if(this.to.data){
            this.uploader = new FileUploader({
                url: this.to.data.uploadUrl || 'web/file/upload',
                autoUpload: this.to.data.autoUpload === false ? false : true,
                queueLimit: this.to.data.queueLimit || 999
            });
            this.autoUpload === false ? false : true
        }
        let vm = this;
        this.uploader.onCompleteItem = (item, response) => {
            try {
                response = JSON.parse(response);
            } catch(error) {
                item['isFinish'] = false;
            } finally {
                if (response && response['ret_code'] === 0) {
                    if (!(vm.model[vm.key] instanceof Array)) {
                        vm.model[vm.key] = [];
                    }
                    item['isFinish'] = true;
                    item['responseData'] = response['data'];
                    this.updateForm();
                } else {
                    if (response && response['ret_code'] === -1){
                        this.service.message(response['message'], false);
                    }
                }
            }
        };
        this.init();
    }

    init() {
        this.model[this.key] = [];
        if(this.autoUpload === true){
          if (this.to.options && (this.to.options instanceof Array) && this.to.options.length){
                this.oldValue = this.to.options;
                this.to.options.forEach(item => {
                    this.model[this.key].push({
                        file_id: item.value
                    });
                })
            }
        }
        this.updateForm();
    }

    delOldValue(i, item){
        this.oldValue.splice(i,1);
        this.updateForm();
    }

    change() {
        if(this.autoUpload === false){
            this.model[this.key] = this.uploader.queue;
            this.updateForm();
        }
    }

    getFileSize(limit) {
        let size = '';
        if ( limit < 0.1 * 1024 ) {
            size = limit + 'B';
        } else if (limit < 0.1 * 1024 * 1024 ) {
            size = (limit / 1024).toFixed(2) + 'KB';
        } else if (limit < 0.1 * 1024 * 1024 * 1024) {
            size = (limit / (1024 * 1024)).toFixed(2) + 'MB';
        } else {
            size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
        }
        return size;
    }

    deleteFile(index) {
        this.uploader.queue.splice(index, 1);
        this.updateForm();
    }

    updateForm() {
        if(this.autoUpload !== false){
            this.model[this.key] = [];
            for (let item of this.oldValue) {
                this.model[this.key].push({
                    file_id: item.value
                });
            }
            for (let item of this.uploader.queue) {
                if(item['isFinish']){
                    this.model[this.key].push(item['responseData']);
                }
            }
        }
        if (this.form.get(this.key)) {
            this.form.get(this.key).setValue(this.model[this.key]);
        }
    }

    fileOverAnother($event) {
    }
}
