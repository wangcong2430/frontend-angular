import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { CosService } from '../../../services/cos.service';
import { ModalService } from '../../../services/modal.service';

import * as moment from 'moment';
moment.locale('zh-CN');

@Component({
  selector: 'app-modal-delay-remind',
  templateUrl: './delay-remind.component.html',
  styleUrls: ['./delay-remind.component.css']
})

export class DelayRemindModalComponent implements OnInit {
  state = '';
  data = {
    data: {
      name: ''
    }
  };

  notification;
  isVisible

  model = {
    delay_date: null,
    remark: null,
    file_id: null,
    thing_id: [],
    current_workflow: null
  }

  fileList = []

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today

    return moment(current).isBefore(moment(new Date()), 'day') || moment(current).isAfter(moment(new Date()).add(10, 'day'), 'day')
  };

  constructor(
    private http: HttpClient,
    private modal: ModalService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    public cos: CosService,
    private message: NzMessageService
  ) {}

  // 关闭导出
  handleCancel () {
    this.isVisible = false;
    this.cd.markForCheck();
  }

  okLoading = false;

  handleOk () {

    if (!this.model.delay_date) {
      this.message.error('请设置提醒日期');
      return
    }

    if (!this.model.delay_date) {
      this.message.error('请填写延时处理原因');
      return
    }

    this.okLoading = true;
    const messageId = this.message.loading('正在提交中...', { nzDuration: 0 }).messageId;
    this.http.post('/web/thing/set-delay-day', this.model).subscribe(result => {
      this.okLoading = false;
      if (result['code'] === 0) {
        this.message.success('提交成功');
        this.resetModel();
        this.isVisible = false;
      } else {
        this.message.error(result['msg']);
      }
      this.message.remove(messageId);
      this.cd.markForCheck();
    }, error => {
      this.message.error(error['msg'] || '网络异常，请稍后再试')
      this.okLoading = false;
      this.message.remove(messageId);
      this.cd.markForCheck();
    });

  }

  fileChange(info, model): void {
    if (info.type === 'success' || info.type === "removed") {
      info.fileList = [...info.fileList.filter(item => item.uid == info.file.uid)];
      this.fileList = info.fileList;
      this.model.file_id = this.fileList.map(item => item.originFileObj.file_id).join(',')
    }
  }

  resetModel () {
    this.model = {
      delay_date: null,
      remark: null,
      file_id: null,
      thing_id: [],
      current_workflow: null
    }
    this.fileList = [];
  }

  onChange () {
    console.log('onChange')
  }

  ngOnInit(): void {
    this.modal.modal$.subscribe(item => {
      if (item && item['key'] === 'delay-remind') {
        if (item['data']['current_workflow'] && item['data']['thing_id']) {
          this.resetModel();
          this.model.current_workflow = item['data']['current_workflow']
          this.model.thing_id = item['data']['thing_id']
          this.isVisible = true;
        }
      }
    });
  }
}
