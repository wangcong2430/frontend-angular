
import { FormGroup } from '@angular/forms';
import { FormlyFormOptions } from '@ngx-formly/core';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-modal-label-classify-mangement',
  templateUrl: './label-classify-mangement.component.html',
  styleUrls: ['./label-classify-mangement.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class LabelClassifyManagementModalComponent implements OnInit {

  isOpen = false;
  isEdit = false;
  loading: Boolean = false;
  nzZIndex = 0;
  id = null;
  list: any = [];

  model = {};

  // 标签编辑弹窗的标题
  labelTitle = '';

  options: FormlyFormOptions = {
    formState: {}
  };

  fields = [
    {
      key: 'id',
      type: 'nz-input',
      templateOptions: {
        label: '标签分类',
        nzLayout: 'fixedwidth',
      },
      hide: true
    },
    {
      key: 'label_category_name',
      type: 'nz-input',
      templateOptions: {
        label: '标签分类',
        nzLayout: 'fixedwidth',
      },
    },
    {
      key: 'label_category_name_en',
      type: 'nz-input',
      templateOptions: {
        label: '英文名称',
        nzLayout: 'fixedwidth',

      },
    },
    {
      key: 'status',
      type: 'nz-radio',
      defaultValue: '1',
      templateOptions: {
        label: '状态',
        nzLayout: 'fixedwidth',
        options: [
          {
            value: 1,
            label: '启用',
          },
          {
            value: 0,
            label: '禁用'
          }
        ]
      },
    },
  ];

  form = new FormGroup({});

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(item => {
      if (item && item['key'] === 'label-classify-management') {
        this.nzZIndex = item['zIndex'];
        this.isOpen = true;
        this.getList();
      }
    });
  }

  // 关闭页面
  modalCancel() {
    this.isOpen = false;
    this.cd.markForCheck();
  }

  // 获取标签分类列表
  getList() {
    this.loading = false;
    this.cd.markForCheck();
    this.http.get('/web/category-attribute/label-category-list').subscribe(results => {
      if (results['code'] === 0) {
        this.list = results['data'];
      }
      this.cd.markForCheck();
    }, err => {
      this.message.error(err.msg);
      this.cd.markForCheck();
    });
  }

  // 编辑标签
  editLabelModel (data) {
    this.labelTitle = '编辑';
    this.model = data;
    this.isEdit = true;
    this.cd.markForCheck();
  }

  // 关闭编辑标签分类的弹窗
  closeLabelModel () {
    this.isEdit = false;
    this.cd.markForCheck();
  }

  // 提交标签编辑
  submitLabel () {
    this.cd.markForCheck();
    this.http.post('web/category-attribute/save-label-category-edit', this.model).subscribe(results => {
      if (results['code'] === 0) {
        this.message.success(results['msg']);
        this.getList();
        this.isEdit = false;
      } else {
        this.message.error(results['msg']);
      }
      this.cd.markForCheck();
    }, err => {
      this.message.success(err['msg']);
      this.cd.markForCheck();
    });
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
