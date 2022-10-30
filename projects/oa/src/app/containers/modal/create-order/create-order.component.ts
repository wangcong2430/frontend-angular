import { Component, EventEmitter, OnInit, Output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService} from '../../../services/menu.service';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { filterOption } from '../../../utils/utils';

@Component({
  selector: 'app-order-modal-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CreateOrderModalComponent implements OnInit {
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  isOpen;
  columns;
  fromFields;
  loading = false;
  isSubmitLoading = false;
  thingIds;
  thingList;
  supplier = {};
  deptData = {};
  deptOptions;
  x = 0;
  y = 0;
  m = 0;
  nzColumn = { xxl: 4, xl: 4, lg: 4, md: 4, sm: 4, xs: 4 }
  today = new Date();
  configFields = {
    'order_name' : true,
    'agent' : true,
    'handling_center' : true,
    'handling_department' : true,
    'select_reason' : true,
    'deadline_day' : true,
    'order_note' : true,
    'tax_type' : true,
    'tax_value' : true,
  };

  receiverOptions = [
    { label: '供应商商务', value: 'cp', checked: true },
    { label: '采购经理', value: 'spm', checked: true },
    { label: '采购助理', value: 'spma', checked: true },
  ];
  account_bank_list = [];
  mba_resources = [];

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private menuService: MenuService,
    private cd: ChangeDetectorRef,
  ) {}

  isSearchSelect;
  searchOaChange$ = new BehaviorSubject('');
  addTaxValue$ = new BehaviorSubject('');
  optionSearchs;

  org_list;
  vendor_site_list;
  receivers;
  category_name_list;
  searchFormData;
  cost_center_options;

  filterOption = filterOption

  ngOnInit() {
    this.getDeptOptions();

    this.searchOaChange$.asObservable().pipe(debounceTime(200))
    .subscribe((val) => {
      let options;
      options = {
        params: {
          'enName': val ? val : '',
        }
      };
      this.isSearchSelect = true;
      this.http.get('web/user/search-names', options).subscribe(data2 => {
        this.optionSearchs = data2['data'];
        this.isSearchSelect = false;
        this.cd.markForCheck();
      });
    });
  }

  onOaSearch(value = '') {
    this.searchOaChange$.next(value);
  }

  isPullLoading = false;

  // 拉取供应商服务品类
  pullSupplierSite($event, data) {
    this.isPullLoading = true;
    this.http.post('web/acceptance-approval/pull-supplier-site', {
      contract_number: data.contract['contract_number'],
      org_id: data.modal.org_id
    }).subscribe(result => {
      this.isPullLoading = false;
      if (result['code'] === 0) {
        this.vendor_site_list = result['data'];
        this.orgIdChange(data.modal.org_id, data);
        this.message.success(result['msg']);
      } else {
        this.message.error(result['msg']);
      }
    });
  }

  // 开打弹窗前先获取项目及预算
  openModal(item, searchFormData = {}) {
    this.searchFormData = searchFormData;
    this.columns = {};
    this.fromFields = {};
    this.supplier = {};
    this.thingList = {};
    this.x = 0;
    this.y = 0;
    this.m = 0;
    this.configFields = {
      'order_name' : true,
      'agent' : true,
      'handling_center' : true,
      'handling_department' : true,
      'select_reason' : true,
      'deadline_day' : true,
      'order_note' : true,
      'tax_type' : true,
      'tax_value' : true,

    };

    this.thingIds = JSON.parse(JSON.stringify(item));

    this.loading = true;
    this.message.isAllLoading = true;

    this.org_list = null;
    this.vendor_site_list = [];
    this.receivers = null;
    this.category_name_list = null;
    this.account_bank_list = null;
    this.cost_center_options = null;

    this.cd.markForCheck();

    forkJoin({
      result: this.http.post('web/order/create-order-check', {
        thing_ids: item.join(','),
        ...searchFormData
      }),
      options: this.http.post('web/acceptance-approval/sync-create-po-order', {
        thing_id: item,
        supplier_id: searchFormData['supplier_id'],
        contract_id: searchFormData['contract_id'],
        type: searchFormData['type']
      })
    }).subscribe(res => {
      const result = res.result;
      const options = res.options;

      this.loading                       = false;
      this.message.isAllLoading          = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      if (options['code'] === -1) {
        this.message.error(options['msg']);
        return false;
      }
      this.isOpen = true;
      this.columns                       = result['columns'];
      this.fromFields                    = result['froms'];
      this.thingList                     = result['list'];
      this.m = this.thingList.length;
      if (searchFormData['type'] === 'pushEpo') {
        this.mba_resources                 = options['mba_resources'].map(item => {
          return {value: item.itemId, label: item.itemName};
        });

        this.org_list = options['org_list'];

        this.vendor_site_list = options['vendor_site_list'].sort((a, b) => b.is_default - a.is_default);
        this.receivers = options['receiver'];
        this.cost_center_options = options['cost_center_options'];
      }



      this.optionSearchs = options['receiver'];
      this.thingList.forEach(data => {
        data.expand                        = true;
        data.modal                         = {};
        data.modal.is_auto_payment         = data['is_auto_payment'];
        data.modal.tax_type                = data['tax_type'];
        data.modal.tax_value               = data['contract_tax_rate_value'];
        data.modal.tax_value_option        = data['tax_rate_value_option'];
        data.modal.tax_value_options        = data['tax_rate_value_option'];
        data.modal.deadline_day = 3;
        data.modal.vendor_site_id          = null;
        data.modal.order_name              = null;
        // data.modal.vendor_category_id      = data['vendor_category_id']

        data.modal.memo                    = options['memo'];
        data.modal.mba_has_resources       = options['mba_has_resources'];
        data.modal.mba_has_resources       = options['mba_has_resources'];

        data.modal.notice_crowd_id         = ['cp', 'spm', 'spma'];
        data.modal.receiver_ids            = options['receiver'] ? options['receiver'].map(item => item.value) : [];
        data.modal.cost_center_code        = options['cost_center_code'];
        data.modal.org_id                  = data['org_id']
        data.modal.vendor_category_id      = data['vendor_category_id'];
        data.modal.account_bank            = data['account_bank'];

        this.y                             = this.y + parseInt(data['thing_count']);
        if (!this.supplier[data['supplier_id']]) {
          this.x ++;
        }

        if (data.modal.org_id && this.searchFormData.type) {
          this.orgIdChange(data.modal.org_id, data);
        }

        this.supplier[data['supplier_id']] = true;
        if (data.curr_id && data.pm_list.some(item => item.value + '' === data.curr_id + '')) {
          data.modal.agent = data.curr_id + '';
          this.getUserDept(data.curr_id + '', data.modal);
        }
      this.cd.markForCheck();

      });

    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.loading = false;
      this.cd.markForCheck();
    });
  }

  getDeptOptions() {
    this.http.get('web/department/department-options').subscribe(result => {
      if (result['code'] === 0 && result['data']) {
        this.deptOptions = result['data'];
        let obj = {};
        this.deptOptions.forEach(data => {
          obj[data['id'].toString()] = data['children'] ? data['children'] : [];
        });
        this.deptData = obj;
        this.cd.markForCheck();
      }
    });
  }

  modalCancel() {
    this.isOpen = false;
  }

  // 获取数据列表
  getTableList() {
    this.getList.emit();
  }

  // 提交
  modalOk() {
    this.isSubmitLoading = true;
    let isError = false;
    let params;
    params = [];

    this.thingList.forEach((item, index, array) => {
      const key = index + 1;
      if (!item.modal['agent']) {
        this.message.error(`订单序号${key}:经办人不能为空`);
        isError = true;
        return false;
      }
      if (!item.modal['handling_center']) {
        this.message.error(`订单序号${key}:经办中心不能为空`);
        isError = true;
        return false;
      }
      if (!(item.modal['deadline_day'] || item.modal['deadline_day'] === '0' || item.modal['deadline_day'] === 0)) {
        this.message.error(`订单序号${key}:接收订单天数不能为空`);
        isError = true;
        return false;
      }

      if (!item.modal['handling_department']) {
        this.message.error(`订单序号${key}:经办部门不能为空`);
        isError = true;
        return false;
      }
      if (!item.modal['select_reason']) {
        this.message.error(`订单序号${key}:选择理由不能为空`);
        isError = true;
        return false;
      }

      if (this.searchFormData.type === 'pushEpo') {
        if (!item.modal['org_id'] || item.modal['org_id'] === '0') {
          this.message.error(`订单序号${key}: 我方主体不能为空`);
          isError = true;
          return false;
        }
        // if (!item.modal['vendor_category_id']) {
        //   this.message.error(`订单序号${key}: 供应商服务品类不能为空`);
        //   isError = true;
        //   return false;
        // }
        // if (!item.modal['account_bank']) {
        //   this.message.error(`订单序号${key}: 供应商银行账号不能为空`);
        //   isError = true;
        //   return false;
        // }
        if (!item.modal['mba_item_id'] && item.modal.mba_has_resources === 1) {
          // this.message.error(`订单序号${key}: 物料选择不能为空`);
          // isError = true;
          // return false;
        }
      }

      /*if (typeof(item.modal['deadline_date']) === 'undefined' || item.modal['deadline_date'].length === 0) {
        this.message.error(`订单序号${key}:接收截止日期不能为空`);
        isError = true;
        return false;
      }*/
      params.push({thing_ids: item.thing_ids, modal: item.modal});
    });

    if (isError) {
      this.isSubmitLoading = false;
      return false;
    }

    this.cd.markForCheck()
    this.http.post('web/order/create-order-submit', {
      params: params,
      type:  this.searchFormData && this.searchFormData.type ? this.searchFormData.type : null
    }).subscribe(results => {
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.modalCancel();
      this.getTableList();
      this.menuService.getBacklog();
      this.cd.markForCheck();
    }, (err) => {
      this.isSubmitLoading = false;
      this.cd.markForCheck();
    });
  }

  changeDepartment(option) {
    if (option['handling_department']
          && this.deptData[option['handling_department']]
          && this.deptData[option['handling_department']].length === 1) {
      option['handling_center'] = this.deptData[option['handling_department']][0].id;
    } else {
      option['handling_center'] = null;
    }
    this.deptData[option['handling_department']];
    this.cd.markForCheck();
  }

  // 税金调整
  changeTax(item, type = 1) {
    if (type === 1) {
      item['modal']['tax_value'] = '';
    }
    if (item['modal']['tax_type']) {
      let tax_value;
      if (!item['modal']['tax_value'] || item['modal']['tax_value'] === '') {
        tax_value = 0;
      } else {
        tax_value = parseFloat(item['modal']['tax_value']);
      }
      let order_tax_amount = 0;
      if (item['modal']['tax_type'] === 1 || item['modal']['tax_type'] === 2) {
        order_tax_amount = parseFloat(item['order_amount']) + parseFloat(item['order_amount']) * tax_value;
        item['order_tax_amount'] = order_tax_amount.toFixed(2) + ' ' + item['currency_symbol'];
      } else if (item['modal']['tax_type'] === 3) {
        order_tax_amount = parseFloat(item['order_amount']) + parseFloat(tax_value);
        item['order_tax_amount'] = order_tax_amount.toFixed(2) + ' ' + item['currency_symbol'];
      }
    }
  }


  // 获取经办中心 和 部门
  getUserDept(value, data) {
    data['handling_department'] = '';
    data['handling_department_id'] = '';
    data['handling_center'] = '';
    data['handling_center_id'] = '';
    this.http.get('web/ajax-check/user-department', {params: {user_id: value} }).subscribe(results => {
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        this.cd.markForCheck();
        return false;
      }
      let isAdd;
      isAdd = true;
      this.deptOptions.forEach(data2 => {
        if (data2['id'].toString() === results['data']['deptId'].toString()) {
          isAdd = false;
          if (!this.deptData[data2['id'].toString()]) {
            this.deptData[data2['id'].toString()] = [];
            this.deptData[data2['id'].toString()].push({
              id:   results['data']['centerId'].toString(),
              name: results['data']['centerName'],
            });
          }
        }
      });
      if (isAdd) {
        this.deptOptions.push({
          id:   results['data']['deptId'].toString(),
          name: results['data']['deptName'],
        });
        this.deptData[results['data']['deptId'].toString()] = [];
        this.deptData[results['data']['deptId']].push({
          id: results['data']['centerId'].toString(),
          name: results['data']['centerName'],
        });
      }

      if (results['data']['centerId'].toString() !== '0') {
        data['handling_department'] = results['data']['deptId'].toString();
        data['handling_center'] = results['data']['centerId'].toString();
      }
      this.cd.markForCheck();
    });
    this.cd.markForCheck();

  }

  noticeChange ($event, data) {
    if ($event instanceof Array) {
      data.notice_crowd_id = $event.filter(item => item.checked).map(item => item.value);
    }
  }

  // 我方主体
  orgIdChange (id, data) {

    const category_obj = {};
    const list =  this.vendor_site_list.filter(item => item.org_id === id)
                         .sort((a, b) => (a.is_default - b.is_default))
                         .map(item => {
                            return {
                              category_id: item.category_id,
                              category_name: item.category_name,
                              is_default: item.is_default,
                              vendor_site_state: item.vendor_site_state
                            };
                          })
                         .map(item => { category_obj[item.category_id] = item; return item; });


    data['category_list'] = Object.values(category_obj);

    const vendor_category = data['category_list'].sort((a, b) => (b.vendor_site_state - a.vendor_site_state))
                                                 .find(item => item.is_default === '1' );

    data['modal'].vendor_category_id = id && vendor_category && vendor_category.category_id ? vendor_category.category_id : null;

    this.categoryChange(data['modal'].vendor_category_id, data);
  }

  categoryChange (category_id, data) {
    data.account_list = this.vendor_site_list
      .filter(item => item.org_id === data['modal'].org_id && item.category_id === category_id )
      .map(item => {
        return {
          org_id: item.org_id,
          category_id: item.category_id,
          value:  item.vendor_site_id,
          label:  item.account_number + item.account_name + item.account_bank,
          vendor_site_id: item.vendor_site_id,
          is_default: item.is_default,
          vendor_site_state: item.vendor_site_state
        };
      });
    const account  = data.account_list.find(item => item.vendor_site_state === '1');
    const vendor_site_id = category_id && account && account.vendor_site_id ? account.vendor_site_id : null;
    this.changeAccountBank(vendor_site_id, data);
    this.cd.markForCheck();

  }

  changeAccountBank (value, data) {
    const account_bank = data.account_list.find(item => item.value === value);
    data['modal'].vendor_site_id = account_bank && account_bank.vendor_site_id ? account_bank.vendor_site_id : null;
    data['modal'].account_bank = data['modal'].vendor_site_id;
    this.cd.markForCheck();
  }


  addTaxValue ($event, field, data) {
    if ($event) {
      data['modal']['tax_value_option'] = data['modal']['tax_value_options'].concat([{
        label: $event,
        value: $event
      }]);
      data['modal']['tax_value'] = $event;
    }
    this.cd.markForCheck();

  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}

