import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../../../services/message.service';
import { ThingDetailModalComponent } from '../../../../../containers/modal/thing-detail/thing-detail.component';
import { MenuService } from '../../../../../services/menu.service';
import { LanguageService } from '../../../../../services/language.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  templateUrl: './distribute.component.html',

})

export class DistributeComponent implements OnInit {
  @ViewChild(ThingDetailModalComponent)
  private thingDetailModal: ThingDetailModalComponent;

  // loading
  loading = true;
  listLoading = false;
  submitLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  disabledButton = true;
  // 数据列表
  list = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  isVisible = false;
  reason = '';

  // 是否显示批量选择制作人
  isSelectProducer: Boolean = false;
  producerOptions = [];
  producerOptionsFlg = false;//是否存在于白名单
  allChecked;
  indeterminate;

  // 提示语
  plaseSelectObject;
  ITEM_NUMBER;
  CONFIGURE_PRODUCER;

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private menuService: MenuService,
    private language: LanguageService,
    private translate: TranslateService
  ) {
    this.translate.use(this.language.language);
    this.translate.get('PLEASE_SELECT_OBJECT').subscribe(result => {
      this.plaseSelectObject = result;
    });

    // 物件单号
    this.translate.get('ITEM_NUMBER').subscribe(result => {
      this.ITEM_NUMBER = result;
    });

    // 请配置制作人
    this.translate.get('CONFIGURE_PRODUCER').subscribe(result => {
      this.CONFIGURE_PRODUCER = result;
    });

  }

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/order/receive-order-configs').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['childrenColumns'];
      // 获取列表
      this.getList();

    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }

    this.http.get('web/order/receive-order-list', { params: {
      page_index: this.pagination.page_index.toString(),
      page_size: this.pagination.page_size.toString()
    }}).subscribe(result => {
      this.listLoading            = false;
      this.pagination.total_count = result['pager']['itemCount'];
      this.pagination.page_index  = result['pager']['page'];
      this.pagination.page_size   = result['pager']['pageSize'];
      this.list                   = result['list'];
      this.producerOptionsFlg = result['has_supplier_login'];
      if (result['list'] && result['list'][0] && result['list'][0].children[0]) {
        this.producerOptions = result['list'][0].children[0].cp_producer_ids_options;
      }
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 按钮事件
  receiveOrder() {
    let item, params, errorMsg;
    item = [];
    errorMsg = '';

    this.list.forEach(data => {
      if (data.checked || data.indeterminate) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            if (!Array.isArray(data2.cp_producer_ids) || (Array.isArray(data2.cp_producer_ids) && data2.cp_producer_ids.length === 0)) {
              errorMsg += this.ITEM_NUMBER + ': ' + data2.thing_code  + ', ' + this.CONFIGURE_PRODUCER;
            }
            item.push({
              id: data2.id,
              cp_producer_ids: data2.cp_producer_ids || []
            });
          }
        });
      }
    });

    if (errorMsg !== '') {
      this.message.error(errorMsg);
      return;
    }
    params = {
      params: item
    };
    this.submitLoading = true;
    this.http.post('web/order/receive-order-submit', params).subscribe(result => {
      this.submitLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.menuService.getBacklog();
    });
  }

  // 放弃接收订单
  giveUpReceiveOrder() {
    let item, params;
    item = [];

    this.list.forEach(data => {
      if (data.checked || data.indeterminate) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            item.push(data2.id);
          }
        });
      }
    });
    if (item.length === 0) {
      // this.message.error('请选择物件(Please select object)');
      this.message.error(this.plaseSelectObject);

      return;
    }
    params = {
      ids: item,
      reason: this.reason
    };
    this.submitLoading = true;
    this.http.post('web/order/give-up-receive-order-submit', params).subscribe(result => {
      this.isVisible = false;
      this.submitLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.menuService.getBacklog();
    });
  }

  blurEvent(event) {
    let params;
    if (event.key === 'producer_name') {
      params = {
        id: event.item['id'],
        name: event.item['producer_name'],
      };
      this.http.post('web/order/add-thing-producer', params).subscribe(result => {});
    }
  }

  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.thingDetailModal.openModal(event.item);
    }
  }

  selectProducer () {
    this.isSelectProducer = true;
  }

  selectProducerCancel () {
    this.isSelectProducer = false;
  }

  selectProducerOk () {
    const cp_producer_ids = this.producerOptions.filter(item => item.checked).map(item => item.value);
    this.list.forEach(data => {
      if (data.checked || data.indeterminate) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            data2.cp_producer_ids = cp_producer_ids;
          }
        });
      }
    });
    this.isSelectProducer = false;
  }


  updateAllChecked(): void {
    this.indeterminate = false;
    if (this.allChecked) {
      this.producerOptions = this.producerOptions.map(item => {
        return {
          ...item,
          checked: true
        };
      });
    } else {
      this.producerOptions = this.producerOptions.map(item => {
        return {
          ...item,
          checked: false
        };
      });
    }
  }

  updateSingleChecked(): void {
    if (this.producerOptions.every(item => item.checked === false)) {
      this.allChecked = false;
      this.indeterminate = false;
    } else if (this.producerOptions.every(item => item.checked === true)) {
      this.allChecked = true;
      this.indeterminate = false;
    } else {
      this.indeterminate = true;
    }
  }
}
