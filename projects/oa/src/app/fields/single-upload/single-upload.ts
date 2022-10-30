import {Component, ElementRef, OnInit} from '@angular/core';
import {FieldType} from '@ngx-formly/core';
import {FileItem, FileUploader} from 'ng2-file-upload';

@Component({
  selector: 'formly-field-single-upload',
  templateUrl: './single-upload.html'
})

export class SingleUploadComponent extends FieldType implements OnInit{
  public uploader: FileUploader = new FileUploader({
    url: '/web/ajax-check/upload-file',
    itemAlias: 'Upload[file]',
    autoUpload: true,
    queueLimit: 1,
  });
  autoUpload = true;
  oldValue = [];
  constructor(private el: ElementRef){
    super();
  }

  ngOnInit(){
    if (this.to.data){
      this.uploader = new FileUploader({
        url: this.to.data.uploadUrl || '/web/ajax-check/upload-file',
        itemAlias: 'Upload[file]',
        autoUpload: this.to.data.autoUpload === false ? false : true,
        queueLimit: this.to.data.queueLimit || 999
      });
      this.autoUpload === false ? false : true
    }

    let vm = this;
    this.uploader.onAfterAddingFile = (item => {
      item.withCredentials = false;
    })
    this.uploader.onCompleteItem = (item, response) => {
      try {
        response = JSON.parse(response);
      } catch (error) {
        item['isFinish'] = false;
      } finally {
        if (response && response['code'] === 0) {
          if (!(vm.model[vm.key] instanceof Array)){
            vm.model[vm.key] = [];
          }
          item['isFinish'] = true;
          item['responseData'] = response['data'];
          this.updateForm();
        }
      }
    };
    this.init();
  }

  init() {
    this.model[this.key] = [];
    if (this.autoUpload === true) {
      if (this.to.options && (this.to.options instanceof Array) && this.to.options.length) {
        this.oldValue = this.to.options;
        this.to.options.forEach(item => {
          this.model[this.key].push({
            file_id: item.value
          });
        });
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
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
