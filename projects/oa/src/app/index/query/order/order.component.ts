import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { ModalService } from '../../../services/modal.service';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  
import { NzModalRef, NzModalService } from 'ng-zorro-antd';


@Component({
  templateUrl: './order.component.html',
})

export class OrderComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private modalService: ModalService,
    private message: MessageService,
    private modal: NzModalService
  ) {}

  // Model 参数配置
  isModelVisible = false;
  title = 'title';
  isOkLoading = false;
  dialogLoading = false;
  isPullLoading = false;

  isOpen = false;
  can = false;
  admin = false;
  is_not_only_needrole = false;
  isPm = false;
  // loading
  loading = false;
  listLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields: [];
  disabledButton = true;
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  // 数据列表
  list = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  searchLoading = false;

  orgList = [];
  contract;
  vendor_site_item = [];
  vendor_site_list = [];
  vendor_category_list = [];
  vendor_bank_list = [];
  vendor_site = {
    category_name: '',
    account_number: '',
    account_bank: '',
    account_name: ''
  };
  mba_has_resources = 0;
  mba_resources = [];
  dialogDataModel = {
    statement_id: 0,
    acceptance_code: '',
    thing_num: 0,
    thing_tax_price: 0,
    thing_total_price: 0,
    thing_tax_total_price: 0,
    epo_code: '',
    pr_number: [],
    pr_number_count: 0,
    contract_type: 0,
    handle_department: '',
    handle_center: '',
    project_product_budget_code: '',
    purchase_type: '',
    purchase_type_name: '',
    contract_category: 0,
    contract_category_name: '',
    org_id: '0',
    contract_org_name: '',
    project_org_name: '',
    department_code: '',
    cost_center_code: '',
    cost_center_name: '',
    product_code: '',
    product_name: '',
    vendor_site_id: 0,
    vendor_category_id: 0,
    memo: '',
    receiver_ids: [],
    currency_symbol: '',
    contract_tax_type: '',
    tax_type: '',
    tax_value: '',
    tax_type_options: [],
    tax_list_options: [],
    mba_item_id: ''
  };

  handleDepartmentList = [];
  handleCenterList = [];

  departmentCodeList = [];
  costCenterList = [];
  optionCostCenter = [];
  costCenterOptions = [];

  searchOaChange$ = new BehaviorSubject('');
  isSearchSelect = true;
  optionSearchs = [];

  thingId = [];
  orderId = 0;
  isVisible = false; // 驳回弹出框
  reason = '';
  order_withdraw_id = 0;
  ngOnInit() {
    // 获取列表配置
    this.getConfig();

    // 获取列表信息
    this.searchOaChange$ = new BehaviorSubject('');
    this.searchOaChange$.asObservable().pipe(debounceTime(500))
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
        });
      });

    this.modalService.complete$.pipe(filter(item => item && item['key'] === 'push-epo')).subscribe(() => {
      this.getList();
      this.menuService.getBacklog();
    });
  }

  chooseReason = [];
  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/order/order-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      this.queryFields     = result['search_form'];
      this.can             = result['can'];
      this.admin          = result['admin'];
      this.is_not_only_needrole  = result['is_not_only_needrole'];
      this.isPm = result['is_pm'];
    });

    // 弹窗信息下拉数据补全
    /*
    this.http.get('web/acceptance-approval/wait-generate-config').subscribe(result => {
      this.orgList = result['org_list'];
      this.handleDepartmentList = result['handle_department'];
      if (this.handleDepartmentList) {
        let obj;
        obj = {};
        this.handleDepartmentList.forEach(data => {
          obj[data['id'].toString()] = data['children'] ? data['children'] : [];
        });
        this.handleCenterList    = obj;
      }
      this.departmentCodeList = result['department_code_list'];
      this.costCenterList = result['cost_center_list'];
      this.chooseReason = result['choose_reason'];
    });
     */
  }
  //到处物件耗时
  exportOrderNew(){
    this.modalService.open('export', {
      url: 'web/thing/special-export',
      type: '1000'
    })
  }
  // 获取数据列表
  getList(pagination?: null) {
    this.searchLoading = true;
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/order/order-list', { params: params }).subscribe(result => {
      this.searchLoading = false;
      this.listLoading            = false;
      this.list                   = result['data']['list'];
      this.pagination.total_count = result['data']['pager']['itemCount'];
      this.pagination.page_index  = result['data']['pager']['page'];
      this.pagination.page_size   = result['data']['pager']['pageSize'];
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.searchLoading = false;
      this.listLoading            = false;
    });
  }

  getListSyncEpo(pagination?: null) {
    this.searchLoading = true;
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/order/order-list-sync-epo-order', { params: params }).subscribe(result => {
      this.searchLoading = false;
      this.listLoading            = false;
      this.list                   = result['data']['list'];
      this.pagination.total_count = result['data']['pager']['itemCount'];
      this.pagination.page_index  = result['data']['pager']['page'];
      this.pagination.page_size   = result['data']['pager']['pageSize'];
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.searchLoading = false;
      this.listLoading            = false;
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    } else if (event.key === 'order_code') {
      this.modalService.open('order', event.item);
    } else if (event.key === 'sync_epo_order') {
      // this.message.error('暂时不能使用，调试中');
       this.syncGenerateEpoOrder(event.item);
      // this.modalService.open("push-epo", event.item)
    }else if(event.key === 'order_can_withdraw') {
      this.order_withdraw_id = event.item.id;
      this.isVisible = true;
    }
  }

  // 按钮事件
  confirmationSubmit(optionType): void {
    if (this.order_withdraw_id === 0) {
      this.message.error('请选择订单');
      return;
    }
    let options;
    options = {
      'order_id': this.order_withdraw_id,
      'reason': this.reason,
    };
    this.http.post('web/order/order-withdraw', options).subscribe(result => {
      if (result['code'] === 0) {
        this.message.success(result['msg']);
      } else {
        this.message.error(result['msg']);
      }
      this.isVisible = false;
      this.getList();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.isVisible = false;
    });

  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  syncEpoOrderSearch() {
    this.getListSyncEpo();
  }

  // 导出订单
  exportOrder () {
    this.modalService.open('order-export', {});
  }

  vendor_site_ids = null;
  newChooseReason = [];
  epoStatementId = 0;
  syncGenEpoOrder = 0;

  syncGenerateEpoOrder(item) {
    let options;
    options = {
      'order_id': item.id,
      'thing_id': item.thing_ids
    };

    this.http.post('web/acceptance-approval/order-search-dialog', options).subscribe(result => {
      this.dialogLoading = false;
      if (result['code'] === 0) {
        this.openModel();
        this.vendor_site_ids = null;
        this.vendor_site_item = [];
        this.contract = result['data']['contract'];
        this.dialogDataModel = result['data']['dialogModel'];
        this.vendor_site = result['data']['vendor_site'];
        this.vendor_site_list = result['data']['vendor_site_list'];
        this.optionSearchs = result['data']['receiver'];
        this.newChooseReason = result['data']['dialogModel']['choose_reason'];
        this.thingId = result['data']['thing_id'];
        this.orderId = result['data']['order_id'];
        this.epoStatementId = result['data']['epo_statement_id'];
        this.syncGenEpoOrder = result['data']['sync_gen_epo_order'];
        this.costCenterOptions = result['data']['cost_center_options'];
        this.mba_resources = result['data']['mba_resources'];
        this.mba_has_resources = result['data']['mba_has_resources'];
        if (this.dialogDataModel.department_code !== '') {
          this.changeDepartmentCode(this.dialogDataModel.department_code);
        }
        if (this.dialogDataModel.org_id !== '0') {
          this.changeOrg(this.dialogDataModel['org_id']);
        }

        // 查询当前用户所属部门和中心
        this.http.get('web/ajax-check/user-department').subscribe(res => {
          if (res['code'] === 0) {
            this.dialogDataModel.handle_department = res['data']['deptId'];
            this.dialogDataModel.handle_center = res['data']['centerId'];
          }
        });
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  changeDepartmentCode(departmentCode: string) {
    this.optionCostCenter = this.departmentCodeList.filter(item => {
      if (item['dept_code'] === departmentCode) {
        return item['children'];
      }
    });
  }

  openModel() {
    this.isModelVisible = true;
  }

  changeOrg(orgId) {
    let vendor_category_list;
    vendor_category_list = this.vendor_site_list.filter(item => item.org_id == orgId);
    if (vendor_category_list.length == 1) {
      this.vendor_category_list = vendor_category_list;
    } else {
      const result = [];
      const obj = [];
      for (let i of vendor_category_list) {
        if (!obj[i.category_id]) {
          result.push(i);
          obj[i.category_id] = true;
        }
      }
      this.vendor_category_list = result;
    }
    if (this.vendor_category_list.length == 1) {
      this.dialogDataModel.vendor_category_id = this.vendor_category_list[0].category_id;
    } else {
      this.dialogDataModel.vendor_category_id = null;
    }
    this.changeServerCategory(this.dialogDataModel.vendor_category_id);

  }

  changeServerCategory(category_id) {
    this.vendor_site_item = this.vendor_site_list.filter(item => (item.category_id == category_id && item.org_id == this.dialogDataModel.org_id)).map(item => {
      return {...item, label : item.account_number + item.account_name + item.account_bank};
    });
    if (this.vendor_site_item.length == 1) {
      this.dialogDataModel.vendor_site_id = this.vendor_site_item[0].vendor_site_id;
      this.vendor_site['account_bank'] = this.vendor_site_item[0].account_bank;
      this.vendor_site['account_name'] = this.vendor_site_item[0].account_name;
      this.vendor_site['account_number'] = this.vendor_site_item[0].account_number;
      this.vendor_site['category_name'] = this.vendor_site_item[0].category_name;
    } else {
      this.dialogDataModel.vendor_site_id = null;
      this.vendor_site['account_bank'] = '';
      this.vendor_site['account_name'] = '';
      this.vendor_site['account_number'] = '';
      this.vendor_site['category_name'] = '';
    }
  }

  onOaSearch(value = '') {
    this.searchOaChange$.next(value);
  }

  changeDepartment () {
    this.dialogDataModel.handle_center  = null;
  }

  changeServerTax(siteId) {
    this.dialogDataModel.tax_value = '';
    let thing_total_price, thing_tax_price;
    thing_total_price = this.dialogDataModel.thing_total_price;
    thing_tax_price = this.dialogDataModel.thing_tax_price;
    if (typeof(thing_total_price) === 'string') {
      thing_total_price = parseFloat(thing_total_price);
    }
    if (typeof(thing_tax_price) === 'string') {
      thing_tax_price = parseFloat(thing_tax_price);
    }
    this.dialogDataModel.thing_tax_total_price = thing_total_price + thing_tax_price;
  }

  changeServerTaxValue(siteId) {
    let tax_type, tax_value;
    tax_type = this.dialogDataModel.tax_type;

    if (tax_type) {
      if (!this.dialogDataModel.tax_value || this.dialogDataModel.tax_value == '') {
        tax_value = 0;
      } else {
        tax_value = parseFloat(this.dialogDataModel.tax_value);
      }
      let thing_total_price;
      thing_total_price = this.dialogDataModel.thing_total_price;
      if (typeof(thing_total_price) === 'string') {
        thing_total_price = parseFloat(thing_total_price);
      }
      if (tax_type == 1 || tax_type == 2) {
        this.dialogDataModel.thing_tax_total_price  = (thing_total_price + thing_total_price * tax_value).toFixed(2);
      } else if (tax_type == 3) {
        this.dialogDataModel.thing_tax_total_price = (thing_total_price + parseFloat(tax_value)).toFixed(2);
      }
    }
  }

  pullSupplierSite() {
    this.isPullLoading = true;
    this.http.post('web/acceptance-approval/pull-supplier-site', {
      contract_number: this.contract['contract_number'],
      org_id: this.dialogDataModel.org_id
    }).subscribe(result => {
      this.isPullLoading = false;
      if (result['code'] === 0) {
        this.vendor_site_list = result['data'];
        this.changeOrg(this.dialogDataModel.org_id);
        this.message.success(result['msg']);
      } else {
        this.message.error(result['msg']);
      }

    });
  }

  closeModel() {
    this.vendor_site.category_name = '';
    this.vendor_site.account_number = '';
    this.vendor_site.account_name = '';
    this.dialogDataModel.vendor_site_id = 0;
    this.thingId = [];
    this.orderId = 0;
    this.epoStatementId = 0;
    this.isModelVisible = false;
  }

  // 生成验收对账单
  submit() {
    if (!this.thingId || (this.thingId && this.thingId.length == 0)) {
      this.message.error('请选择物件');
      return false;
    }
    if (this.dialogDataModel.org_id === '0') {
      this.message.error('请选择我方主体');
      return false;
    }

    if (this.dialogDataModel.handle_department === '0' || this.dialogDataModel.handle_department === '') {
      this.message.error('请选择经办部门');
      return false;
    }
    if (this.dialogDataModel.memo == '') {
      this.message.error('合同/订单说明不能为空');
      return false;
    }
    if (this.mba_has_resources == 1) {
      if (!this.dialogDataModel.mba_item_id) {
        this.message.error('MBA 立项必须选择物料');
        return false;
      }
    }
    const param = {
      order_id : this.orderId,
      thing_id: this.thingId,
      epo_statement_id: this.epoStatementId,
      data: this.dialogDataModel,
    };
    this.isOkLoading = true;
    this.http.post('/web/order/sync-generate-blanket-epo-code-v2', param).subscribe(result => {
      this.isOkLoading = false;
      if (result['code'] === 0) {
        this.closeModel();
        this.message.success(result['msg']);
        this.getList();
        this.menuService.getBacklog();
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.isOkLoading = false;
      this.message.error('网络异常，请稍后再试');
    });
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
