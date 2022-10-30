import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { CreateOrderModalComponent } from '../../../containers/modal/create-order/create-order.component';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import { CosService } from '../../../services/cos.service';
import { NzModalService, NzMessageService, UploadXHRArgs } from 'ng-zorro-antd';
import { formatDate } from '@angular/common';

@Component({
  templateUrl: './report.component.html'
})

export class ReportComponent implements OnInit {

  @ViewChild(CreateOrderModalComponent)
  
  @Output() listchange: EventEmitter<any> = new　EventEmitter();
  private createOrderModal: CreateOrderModalComponent;
  // loading
  loading = true;
  listLoading = false;
  isVisible = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  dateRange = [];
  disabledButton = true;
  disabledButtonDemand = true;
  importData = true;
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  // 数据列表
  list = [];
  expands = {}; // 展开项
  // 分页
  pagination = {
    total_count: null,
    page_size: 10,
    page_index: 1,
  };
  msgHint = {
    key: '',
    isShow: false,
    isSubmitLoading: false,
    flag: 2,
    msg: '',
    reason: ''
  };
  msgHintDemand = {
    key: '',
    isShow: false,
    isSubmitLoading: false,
    flag: 2,
    msg: '',
    reason: ''
  };

  // 判断是否是测试单
  is_test = '0';

  isOrderlVisible;
  isOkLoading;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private message: MessageService,
    private menuService: MenuService,
    private modalService: ModalService,
    public cos: CosService,
    private msg: NzMessageService,
    private modal: NzModalService,
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.route.url.subscribe(urls => {
      if (urls[0].path === 'create') {
        this.is_test = '0';
      } else {
        this.is_test = '1';
      }
      this.getConfig();
    });

    this.modalService.complete$.pipe(filter((item: any) => item.key === 'new-create-order')).subscribe(res => {
      this.getList();
      this.menuService.getBacklog();
    });
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = 1;
      this.getList();
    }
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/applets/config', { params: {
      is_test: this.is_test
    }}).subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.childrenColumns  = result['childrenColumns'];
      this.queryFields      = result['search_form'];
      this.getList();
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);
    params = {
      page_index:  this.pagination.page_index.toString(),
      page_size:  this.pagination.page_size.toString(),
      is_test: this.is_test,
      ...this.searchFormData
    };
    this.http.get('web/order/create-order-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      if (result['code'] === 0) {
        this.pagination.total_count = result['pager']['itemCount'];
        this.pagination.page_index  = result['pager']['page'];
        this.pagination.page_size   = result['pager']['pageSize'];
        this.pagination.total_count = result['list'].length;
        if (this.expands && result['list']) {
          result['list'] = result['list'].map(item => {
            if (item.children && item.children.length > 10) {
              item['expand'] = true;
            }
            if (this.expands[item.id]) {
              item['expand'] = this.expands[item.id];
            }
            return item;
          });
        }
        this.list                   = result['list'];
      } else {
        this.message.error(result['msg']);
      }
    }, err => {
      this.listLoading            = false;
      this.message.error(err['msg']);
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
    this.disabledButtonDemand = value;
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    }
  }

  // 按钮事件
  createOrder(type = null) {
    let item, itemIds;
    item = [];
    itemIds = [];

    this.list.forEach(data => {
      if (data.expand !== undefined) {
        this.expands[data.id] = data.expand;
      }
      if (data.children) {
        let tempItem, isChecked;
        tempItem = {
          'supplier_name'      : data.supplier_name,
          'contract_number'    : data.contract_number,
          'project_name'       : data.project_name,
          'first_category_name': data.first_category_name,
          'thing_ids'          : [],
          'thing_count'        : 0,
          'is_test'            : data.is_test,
          'currency_id'        : data.currency_id,
          'supplier_id'        : data.supplier_id,
          'project_id'         : data.project_id,
          'contract_id'        : data.contract_id,
          'first_category_id'  : data.first_category_id,
        };
        data.children.forEach(data2 => {
          if (data2.checked) {
            tempItem.thing_ids.push(data2.id);
            tempItem.thing_count++;
            itemIds.push(data2.id);
            isChecked = true;
          }
        });
        if (isChecked) {
          item.push(tempItem);
        }
      }
    });
    if (itemIds.length === 0) {
     this.message.error('请选择要生成订单的物件');
     return;
    }

    const searchFormData = Object.assign({}, this.searchFormData, {
      contract_id: item[0].contract_id,
      supplier_id: item[0].supplier_id,
      type: type
    });

    this.createOrderModal.openModal(itemIds, searchFormData);
  }

  // 驳回核价
  rejectOrder(hintFlag) {
    let item;
    item = [];

    this.list.forEach(data => {
      if (data.children) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            item.push(data2.id);
          }
        });
      }
    });
    if (item.length === 0) {
      this.message.error('请选择要驳回核价的物件');
      return;
    }
    this.msgHint.key = 'reject';
    if (!hintFlag) {
      this.msgHint.isShow = true;
      this.msgHint.msg = this.is_test === '0' ? '确定要驳回选中物件到核价？' : '确定要驳回选中物件到测试单核价？';
      return;
    }
    // 驳回
    this.msgHint.isSubmitLoading = true;
    this.message.isAllLoading = true;
    this.http.post('web/order/create-order-reject', {thing_id: item, reason: this.msgHint.reason}).subscribe(results => {
      this.message.isAllLoading = false;
      this.msgHint.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.handleCancel();
      this.message.success(results['msg']);
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.msgHint.isSubmitLoading = false;
    });
  }
  // 驳回到需求草稿
  rejectOrderDemand(hintFlag) {
    let item;
    item = [];

    this.list.forEach(data => {
      if (data.children) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            item.push(data2.id);
          }
        });
      }
    });
    if (item.length === 0) {
      this.message.error('请选择要驳回核价的物件');
      return;
    }
    this.msgHintDemand.key = 'reject';
    if (!hintFlag) {
      this.msgHintDemand.isShow = true;
      this.msgHintDemand.msg = '确定要驳回到需求草稿';
      return;
    }
    // 驳回
    this.msgHintDemand.isSubmitLoading = true;
    this.message.isAllLoading = true;
    this.http.post('web/order/create-order-reject-to-draft', {thing_id: item, reason: this.msgHintDemand.reason}).subscribe(results => {
      this.message.isAllLoading = false;
      this.msgHintDemand.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.handleCancelDemand();
      this.message.success(results['msg']);
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.msgHintDemand.isSubmitLoading = false;
    });
  }

  handleOk() {
    if (this.msgHint.key === 'reject') {
      this.rejectOrder(true);
    }
  }

  handleCancel(): void {
    this.msgHint.isShow = false;
    this.msgHint.isSubmitLoading = false;
  }

  handleOkDemand() {
    if (this.msgHintDemand.key === 'reject') {
      this.rejectOrderDemand(true);
    }
  }

  handleCancelDemand(): void {
    this.msgHintDemand.isShow = false;
    this.msgHintDemand.isSubmitLoading = false;
  }

  // 表格全选
  checkAll(value: boolean): void {
    this.list.forEach((data, index) => {
      if ((this.pagination.page_index - 1 ) * this.pagination.page_size <= index
        && this.pagination.page_index * this.pagination.page_size > index) {


        data.checked = value;
        data.indeterminate = false;
        if (data.children) {
          data.children.forEach(data2 => data2.checked = value);
        }
        data.order_amount = 0;
        data.product_price = 0;
        data.brand_price = 0;
        if (data.indeterminate || data.checked) {
          if (data.children.some(item => item.checked)) {
            data.order_amount = data.children.filter(item => item.checked)
              .map(item => item.new_total_price)
              .reduce((total, num) => Number(total) + Number(num));

            if (data.children.some(item => item.checked && item.budget_type === '2')) {
                data.product_price = data.children.filter(item => item.checked && item.budget_type === '2')
                  .map(item => item.new_total_price)
                  .reduce((total, num) => Number(total) + Number(num));
            }
            if (data.children.some(item => item.checked && item.budget_type === '1')) {
              data.brand_price = data.children.filter(item => item.checked && item.budget_type === '1')
                .map(item => item.new_total_price)
                .reduce((total, num) => Number(total) + Number(num));
            }
          }
        }
      }
    });

    this.changeDisabledButton(false);

  }

  checkReverse(): void {
    let checkedNumber = 0;
    this.list.forEach((data, index) => {
      if ((this.pagination.page_index - 1 ) * this.pagination.page_size <= index
      && this.pagination.page_index * this.pagination.page_size > index) {
      data.checked = !data.checked;
      if (data.children) {
        data.children.forEach(data2 => data2.checked = !data2.checked);
      }
      data.order_amount = 0;
      data.product_price = 0;
      data.brand_price = 0;
      if (data.indeterminate || data.checked) {
        checkedNumber = checkedNumber + data.children.filter(value => value.checked).length;
        if (data.children.some(item => item.checked)) {
          data.order_amount = data.children.filter(item => item.checked)
                                           .map(item => item.new_total_price)
                                           .reduce((total, num) => Number(total) + Number(num));
          if (data.children.some(item => item.checked && item.budget_type === '2')) {
            data.product_price = data.children.filter(item => item.checked && item.budget_type === '2')
                                              .map(item => item.new_total_price)
                                              .reduce((total, num) => Number(total) + Number(num));
          }
          if (data.children.some(item => item.checked && item.budget_type === '1')) {
            data.brand_price = data.children.filter(item => item.checked && item.budget_type === '1')
                                            .map(item => item.new_total_price)
                                            .reduce((total, num) => Number(total) + Number(num));
          }
        }
      }
    } });
    const flag = !(checkedNumber > 0);
    this.changeDisabledButton(flag);
  }

  createOrder1 () {
    this.isOrderlVisible = true;
    this.isOkLoading = false;
  }

  closeOrder () {
    this.isOrderlVisible = false;
  }

  submitOrder () {
    this.isOrderlVisible = false;
  }

  // 新的推送 epo 订单
  newCreateOrder () {
    const thing_ids = this.list
      .filter((item, index) => {
        return (this.pagination.page_index - 1 ) * this.pagination.page_size <= index
        && this.pagination.page_index * this.pagination.page_size > index;
      })
      .map(item => item.children)
      .reduce((a, b) => a.concat(b))
      .filter(item => item.checked)
      .map(item => item.id);

    if (!thing_ids) {
      return;
    }

    this.modalService.open('new-create-order', {
      thing_ids: thing_ids
    });
  }

  delayNotice() {
    let thing_ids;
    thing_ids = [];

    this.list.forEach(data => {
      if (data.children) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            thing_ids.push(data2.id);
          }
        });
      }
    });
    //显示弹框
    this.modalService.open('delay-remind', {
      current_workflow: 10600,
      thing_id: thing_ids
    })
  }

  epoUploadChange ($event) {
    if ($event.file && $event.file.status === 'done') {
      const messageId = this.msg.loading('上传成功,数据正在打包中...', { nzDuration: 0 }).messageId;
      this.http.get('/applets/main/epo-import',  {
        params: {
          file_id: $event.file.originFileObj.file_id
        },
      }).subscribe(results => {
        this.msg.remove(messageId);
        if (results['code'] === 0) {
          this.message.success(results['msg']);
        } else {
          this.message.error(results['msg']);
        }
      }, () => {
        this.msg.remove(messageId);
        this.message.error('导入异常! 请稍后再试, 或联系管理员');
      });
    }
  }

 BfcUploadChange($event) {
    if ($event.file && $event.file.status === 'done') {
      const messageId = this.msg.loading('上传成功,数据正在打包中...', { nzDuration: 0 }).messageId;
      this.http.get('/applets/main/bfc-import',  {
        params: {
          file_id: $event.file.originFileObj.file_id
        },
      }).subscribe(results => {
        this.msg.remove(messageId);
        if (results['code'] === 0) {
          this.message.success(results['msg']);
        } else {
          this.message.error(results['msg']);
        }
      }, () => {
        this.msg.remove(messageId);
        this.message.error('导入异常! 请稍后再试, 或联系管理员');
      });
    }
  }

  BfcUploadChange2($event) {
    if ($event.file && $event.file.status === 'done') {
      const messageId = this.msg.loading('上传成功,数据正在打包中...', { nzDuration: 0 }).messageId;
      this.http.get('/applets/main/bfc-import2',  {
        params: {
          file_id: $event.file.originFileObj.file_id
        },
      }).subscribe(results => {
        this.msg.remove(messageId);
        if (results['code'] === 0) {
          this.message.success(results['msg']);
        } else {
          this.message.error(results['msg']);
        }
      }, () => {
        this.msg.remove(messageId);
        this.message.error('导入异常! 请稍后再试, 或联系管理员');
      });
    }
  }
  downloadTemplate() {
    
  }

  //wbp导入
  submitReject() {
    if (!this.dateRange) {
      this.message.error('请选择导入时间段');
    }
    
    this.dateRange[0] = formatDate(this.dateRange[0], 'yyyy-MM-dd', 'zh');
    this.dateRange[1] = formatDate(this.dateRange[1], 'yyyy-MM-dd', 'zh');
    const messageId = this.msg.loading('正在导入WBP数据...', { nzDuration: 0 }).messageId;
      this.http.get('/applets/main/wbp-import',  {
        params: {
          start_time: this.dateRange[0],
          end_time: this.dateRange[1]
        },
      }).subscribe(results => {
        this.msg.remove(messageId);
        if (results['code'] === 0) {
          this.isVisible = false;
          this.message.success(results['msg']);
        } else {
          this.message.error(results['msg']);
        }
      }, () => {
        this.msg.remove(messageId);
        this.message.error('导入异常! 请稍后再试, 或联系管理员');
      });
  }
  isVisibleShow() {
    this.isVisible = true;
  }
  submit () {
    
  }

  export() {
    window.open("/applets/main/export");
  }
}
