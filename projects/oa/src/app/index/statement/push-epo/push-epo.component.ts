import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { ModalService } from '../../../services/modal.service';
import { NzMessageService } from 'ng-zorro-antd';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { ActivatedRoute, Router} from '@angular/router';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import {it} from "@angular/core/testing/src/testing_internal";

@Component({
  templateUrl: './push-epo.component.html',
  styles: [
      `
      :host ::ng-deep .ant-table-placeholder {
        border-bottom: none;
      }
      ::ng-deep .ant-form-item label{
        margin-bottom: 0;
      }

      ::ng-deep .ant-form-item{
        margin-bottom: 12px;
      }
    `
  ]
})

export class PushEpoComponent implements OnInit, OnDestroy {

  loading = true;
  listLoading = false;
  isModelVisible = false;
  isOkLoading = false;
  dialogLoading = false;
  isPullLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  disabledButton = true;
  // 数据列表
  list = [];
  expands = [];
  isVisible = false; // 驳回弹出框
  workflow_node = ''; // 驳回节点类型
  reason = ''; // 驳回原因
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };

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
    tax_list_options_temp: [],
    mba_item_id: '',
    is_new_contract: 0,
    is_auto_payment: 0,
    order_id: 0,
    epo_statement_id: 0
  };
  skipDialog = 0;

  handleDepartmentList = [];
  handleCenterList = [];
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  departmentCodeList = [];
  costCenterList = [];
  optionCostCenter = [];
  costCenterOptions = [];

  searchOaChange$ = new BehaviorSubject('');
  onDestroy$ = null;
  isSearchSelect = true;
  optionSearchs = [];
  is_error = 0;
  vendor_site_ids = null;
  postThingId = [];
  newChooseReason = [];
  chooseReason = [];

  pushEpo$;

  auth;
  terms_name = '';
  showModal = {
    isOpen: false,
    loading: false,
    supplier_name: '',
    contract_number: '',
    contract_list: [],
    radioValue: 0,
    thing_id: []
  };

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService,
    private modal: ModalService,
    private msg: NzMessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.searchOaChange$ = new BehaviorSubject('');
    this.onDestroy$ = new Subject<void>();
    this.isSearchSelect = true;
    this.optionSearchs = [];

    this.route.url
      .pipe(takeUntil(this.onDestroy$))
      .pipe(debounceTime(60))
      .subscribe(urls => {
        if (urls[0].path === 'pushEpoCreatePoError') {
          this.is_error = 1;
        } else {
          this.is_error = 0;
        }
        this.init();
      });

    this.modal.complete$
      .pipe(takeUntil(this.onDestroy$))
      .pipe(debounceTime(120))
      .pipe(filter(item => item && (item['key'] === 'push-epo' || item['key'] === 'statement-push-epo' )))
      .subscribe(() => {
        this.getList();
        this.menuService.getBacklog();
      });

    this.searchOaChange$.asObservable()
      .pipe(takeUntil(this.onDestroy$))
      .pipe(debounceTime(500))
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
  }

  init () {
    // 获取页面配置
    this.getConfig();
    this.getList();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/acceptance-approval/wait-push-epo-config').subscribe(result => {
      this.loading = false;
      this.columns = result['columns'];
      this.queryFields      = result['searchForm'];
      this.childrenColumns = result['columnsChildren'];
      this.auth = result['auth'];
    });

    // 弹窗信息下拉数据补全
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
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    // const id = this.msg.loading('正在查询数据中', { nzDuration: 0 }).messageId;
    if (pagination) {
      this.pagination = pagination;
    }
    this.searchFormData = paramsFilter(this.searchFormData);

    this.http.get('web/acceptance-approval/wait-push-epo-list', {
      params: {
        'page_index':  this.pagination.page_index.toString(),
        'page_size':  this.pagination.page_size.toString(),
        group_by: '1',
        is_error: this.is_error.toString(),
        ...this.searchFormData
      }
    }).subscribe(result => {
      this.listLoading = false;
      // this.msg.remove(id);
      if (result['code'] === 0) {
        this.pagination.total_count = result['pager']['itemCount'];
        this.pagination.page_index = result['pager']['page'];
        this.pagination.page_size = result['pager']['pageSize'];
        this.list = result['list'];
        console.log(this.list)
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.listLoading = false;
      // this.msg.remove(id);
      this.message.error('网络错误，请刷新后重试，多次失败请联系管理员');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modal.open('thing', event.item);
    } else if (event.key === 'order_code') {
      this.modal.open('order', event.item);
    } else if (event.key === 'sync_epo_order') {
      // this.syncGenerateEpoOrder(event.item);
      this.modal.open('push-epo', Object.assign({}, event.item, {andPush: 1}));
    } else if (event.key === 'update_contract') {
      console.log(event);
      this.openUpdateContract(event.item['thing_ids']);
    }
  }

  // 推验收
  generateStatementDialog() {

    this.postThingId = [];
    this.list.forEach((item, itemIndex) => {
      if (item.checked || item.indeterminate) {
        item.children.forEach((thing, thingIndex) => {
          if (thing.checked) {
            this.postThingId.push(thing.id);
          }
        });
      }
    });


    this.http.post('web/acceptance-approval/wait-generate-dialog', {thing_id: this.postThingId}).subscribe(result => {
      this.dialogLoading = false;
      if (result['code'] === 0) {
        if (result['skip_dialog'] === 0) {
          this.openModel();
          this.vendor_site_ids = null;
          this.vendor_site_item = [];
          this.contract = result['data']['contract'];
          this.dialogDataModel = result['data']['dialogModel'];
          this.dialogDataModel.tax_list_options_temp = this.dialogDataModel.tax_list_options;
          this.skipDialog = result['skip_dialog'];
          this.vendor_site = result['data']['vendor_site'];

          this.optionSearchs = result['data']['receiver'];
          this.newChooseReason = result['data']['dialogModel']['choose_reason'];
          this.mba_has_resources = result['data']['mba_has_resources'];
          this.mba_resources = result['data']['mba_resources'];
          this.costCenterOptions = result['data']['cost_center_options'];
          if ( result['data']['vendor_site_list'] &&  result['data']['vendor_site_list'].length > 0) {
            this.vendor_site_list = result['data']['vendor_site_list'].sort((a, b) => b.is_default - a.is_default);
          }

          if (this.dialogDataModel.department_code !== '') {
            this.changeDepartmentCode(this.dialogDataModel.department_code);
          }
          if (this.dialogDataModel.org_id !== '0') {
            this.changeOrg(this.dialogDataModel['org_id']);
          }
          this.terms_name = result['data']['terms_name'];

          // 查询当前用户所属部门和中心
          this.http.get('web/ajax-check/user-department').subscribe(res =>{
            if (res['code'] === 0) {
              this.dialogDataModel.handle_department = res['data']['deptId'];
              this.dialogDataModel.handle_center = res['data']['centerId'];
            }
          });
        } else {
          // this.message.success('同步EPO订单，直接推验收');
          this.skipDialog = result['skip_dialog'];
          this.approvalSubmit('pass');
        }
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }


  pushEpo () {

    this.postThingId = [];
    this.list.forEach((item, itemIndex) => {
      if (item.checked || item.indeterminate) {
        item.children.forEach((thing, thingIndex) => {
          if (thing.checked) {
            this.postThingId.push(thing.id);
          }
        });
      }
    });
    this.modal.open('statement-push-epo', { thingIds: this.postThingId});
  }

  // 生成验收对账单
  submit() {
    if (this.postThingId.length === 0) {
      this.message.error('请选择物件');
      return false;
    }
    if (this.skipDialog === 0) {
      if (this.dialogDataModel.org_id === '0') {
        this.message.error('请选择我方主体');
        return false;
      }
      // if (!this.dialogDataModel.vendor_site_id || this.dialogDataModel.vendor_site_id == 0) {
      //   this.message.error('没有VendorSiteId不能提交');
      //   return false;
      // }
      if (this.dialogDataModel.handle_department === '0' || this.dialogDataModel.handle_department === '') {
        this.message.error('请选择经办部门');
        return false;
      }
      if (this.dialogDataModel.memo === ''){
        this.message.error('合同/订单说明不能为空');
        return false;
      }
      if (this.mba_has_resources === 1) {
        if (this.dialogDataModel.mba_item_id  === '') {
          this.message.error('MBA 立项必须选择物料');
          return false;
        }
      }
    }

    const param = {
      thing_id: this.postThingId,
      data: this.dialogDataModel,
      skipDialog: this.skipDialog,
      order_id : this.dialogDataModel.order_id,
      epo_statement_id: this.dialogDataModel.epo_statement_id
    };
    let url = '/web/acceptance-approval/generate';
    if (this.dialogDataModel.epo_statement_id != 0) {
      url = '/web/order/sync-generate-blanket-epo-code-v2';
    }
    this.isOkLoading = true;
    this.http.post(url, param).subscribe(result => {
      this.isOkLoading = false;
      if (result['code'] === 0) {
        if (this.skipDialog === 0) {
          this.closeModel();
        }
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

  // 推送epo，生成订单
  approvalSubmit(optionType) {
    const thing_id = this.list.filter(item => item.indeterminate || item.checked).map((items, index) =>
      items['children'].filter(item => item.checked).map(item => item.id)
    ).reduce((acc, val) => acc.concat(val), []);

    let url = '/web/acceptance-approval/wait-push-epo-' + optionType;
    if (optionType === 'pass') {
      url = '/web/acceptance-approval/sync-create-epo-push-epo';
    }
    this.message.isAllLoading = true;
    this.http.post(url, {
      thing_id: thing_id,
      reason: this.reason,
      option_type: optionType,
      workflow_node: this.workflow_node,
      skip_dialog: this.skipDialog
    }).subscribe(result => {
      this.message.isAllLoading = false;
      this.isVisible = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.reason = '';
      this.message.success(result['msg']);
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.isVisible = false;
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }

  openModel() {
    this.isModelVisible = true;
  }

  closeModel() {
    this.postThingId = [];
    this.vendor_site.category_name = '';
    this.vendor_site.account_number = '';
    this.vendor_site.account_name = '';
    this.dialogDataModel.vendor_site_id = 0;
    this.isModelVisible = false;
  }

  clickGenerateEpoOrder(value) {
    const key = value.key;
    const item = value.item;
    if (key === 'generate_epo_order') {
      let options;
      options = {
        params: {
          'statement_id': item.id,
        }
      };
      this.http.get('/web/acceptance-approval/generate-epo-order-dialog', options).subscribe(result => {
        this.dialogLoading = false;
        if (result['code'] === 0) {
          if (result['skip_dialog'] === 0) {
            this.orgList = result['org_list'];
            this.handleDepartmentList = result['handle_department'];
            if (this.handleDepartmentList) {
              let obj;
              obj = {};
              this.handleDepartmentList.forEach(data => {
                obj[data['id'].toString()] = data['children'] ? data['children'] : [];
              });
              this.handleCenterList = obj;
            }
            this.departmentCodeList = result['department_code_list'];
            this.costCenterList = result['cost_center_list'];

            this.openModel();
            this.contract = result['data']['contract'];
            this.dialogDataModel = result['data']['dialogModel'];
            this.vendor_site = result['data']['vendor_site'];
            this.vendor_site_list = result['data']['vendor_site_list'];
            this.optionSearchs = result['data']['receiver'];

            // 查询当前用户所属部门和中心
            this.http.get('web/ajax-check/user-department').subscribe(res => {
              if (res['code'] === 0) {
                this.dialogDataModel.handle_department = res['data']['deptId'];
                this.dialogDataModel.handle_center = res['data']['centerId'];
              }
            });
          } else {
            this.message.success('同步EPO订单，直接生成验收对账单');
            this.skipDialog = result['skip_dialog'];
            this.submitGenerateEpoOrder();
          }
        } else {
          this.message.error(result['msg']);
        }
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
      });
    } else if (key === 'thing_code' || key === 'thing_name') {
      this.modal.open('thing', item)
    } else if (key === 'order_code') {
      this.modal.open('order', {...item, id: item.order_id})
    }
  }

  changeDepartmentCode(departmentCode: string) {
    this.optionCostCenter = this.departmentCodeList.filter(item => {
      if (item['dept_code'] === departmentCode) {
        return item['children'];
      }
    });
  }

  changeDepartment () {
    this.dialogDataModel.handle_center  = null;
  }

  onOaSearch(value = '') {
    this.searchOaChange$.next(value);
  }

  //双驳回按钮
  rejectedButton(value = '') {
    this.isVisible = true;
    this.workflow_node = value;
  }


  changeServerTax() {
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

  changeServerTaxValue() {
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

  submitGenerateEpoOrder() {
    if (this.skipDialog === 0) {
      if (this.dialogDataModel.handle_department === '0' || this.dialogDataModel.handle_department === '') {
        this.message.error('请选择经办部门');
        return false;
      }
      if (this.dialogDataModel.memo == ''){
        this.message.error('合同/订单说明不能为空');
        return false;
      }
    }

    const param = {
      statement_id: this.dialogDataModel.statement_id,
      data: this.dialogDataModel,
      skip_dialog: this.skipDialog
    };
    this.isOkLoading = true;
    this.http.post('/web/acceptance-approval/generate-epo-order', param).subscribe(result => {
      this.isOkLoading = false;
      if (result['code'] === 0) {
        if (this.skipDialog === 0) {
          this.closeModel();
        }
        this.message.success(result['msg']);
        this.menuService.getBacklog();
        this.getList();
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.isOkLoading = false;
      this.message.error('网络异常，请稍后再试');
    });
  }

  pullSupplierSite() {
    this.isPullLoading = true;
    this.http.post('web/acceptance-approval/pull-supplier-site',
      {
        contract_number: this.contract['contract_number'],
        org_id: this.dialogDataModel.org_id
      }
    ).subscribe(result => {
      this.isPullLoading = false;
      if (result['code'] === 0) {
        this.vendor_site_list = result['data'].map((a, b) => b.is_default - a.is_default);
        this.changeOrg(this.dialogDataModel.org_id);
        this.message.success(result['msg']);
      } else {
        this.message.error(result['msg']);
      }

    });
  }

  // 我方主体
  changeOrg(orgId) {

    const category_obj = {};
    const list =  this.vendor_site_list.filter(item => item.org_id === orgId)
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
    this.vendor_category_list = Object.values(category_obj);

    const vendor_category = this.vendor_category_list.sort((a, b) => (b.vendor_site_state - a.vendor_site_state))
                                                 .find(item => item.is_default === '1' );

    this.dialogDataModel.vendor_category_id = orgId && vendor_category && vendor_category.category_id ? vendor_category.category_id : null;

    this.changeServerCategory(this.dialogDataModel.vendor_category_id);

    // console.log(data);
    // this.categoryChange(data['modal'].vendor_category_id, data);

    // this.dialogDataModel.

    // let vendor_category_list = this.vendor_site_list.filter(item => item.org_id == orgId);

    // if(vendor_category_list.length == 1){
    //   this.vendor_category_list = vendor_category_list;
    // }else{
    //   let result = [];
    //   let obj = [];
    //   for (let i of vendor_category_list){
    //     if(!obj[i.category_id]){
    //       result.push(i);
    //       obj[i.category_id] = true;
    //     }
    //   }
    //   this.vendor_category_list = result;
    // }

    // if (this.vendor_category_list.length == 1) {
    //   this.dialogDataModel.vendor_category_id = this.vendor_category_list[0].category_id;
    // }

    // if (this.vendor_category_list && this.vendor_category_list.length) {
    //   if (!this.vendor_category_list.some(item => item.category_id === this.dialogDataModel.vendor_category_id)) {
    //     this.dialogDataModel.vendor_category_id = this.vendor_category_list[0].category_id;
    //   }
    // } else {
    //   this.dialogDataModel.vendor_category_id = null;
    // }

    // this.changeServerCategory(this.dialogDataModel.vendor_category_id);
  }

  // 服务商供应品类
  changeServerCategory(category_id) {

    // this.vendor_site_item = this.vendor_site_list
    // .filter(item => item.category_id === category_id && item.org_id === this.dialogDataModel.org_id)
    // .map(item => {
    //   return {...item, label : item.account_number + item.account_name + item.account_bank };
    // });

    // if (this.vendor_site_item.length) {
    //   this.dialogDataModel.vendor_site_id = this.vendor_site_item[0].vendor_site_id;
    //   this.vendor_site['account_bank'] = this.vendor_site_item[0].account_bank;
    //   this.vendor_site['account_name'] = this.vendor_site_item[0].account_name;
    //   this.vendor_site['account_number'] = this.vendor_site_item[0].account_number;
    //   this.vendor_site['category_name'] = this.vendor_site_item[0].category_name;
    // } else {
    //   this.dialogDataModel.vendor_site_id = null;
    //   this.vendor_site['account_bank'] = '';
    //   this.vendor_site['account_name'] = '';
    //   this.vendor_site['account_number'] = '';
    //   this.vendor_site['category_name'] = '';
    // }

    this.vendor_site_item = this.vendor_site_list
      .filter(item => item.org_id === this.dialogDataModel.org_id && item.category_id === category_id )
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

    const account = this.vendor_site_item.find(item => item.vendor_site_state === '1');
    const vendor_site_id = category_id && account && account.vendor_site_id ? account.vendor_site_id : null;

    if (account) {
      this.vendor_site['account_bank'] = account.account_bank;
      this.vendor_site['account_name'] = account.account_name;
      this.vendor_site['account_number'] = account.account_number;
      this.vendor_site['category_name'] = account.category_name;
      this.dialogDataModel.vendor_site_id = vendor_site_id;
    } else {
      this.vendor_site['account_bank'] = null;
      this.vendor_site['account_name'] = null;
      this.vendor_site['account_number'] = null;
      this.vendor_site['category_name'] = null;
      this.dialogDataModel.vendor_site_id = null;
    }
  }

  addTaxValue ($event) {
    if ($event && !this.dialogDataModel.tax_list_options_temp.some(item => item.value === $event)) {
      this.dialogDataModel.tax_list_options = this.dialogDataModel.tax_list_options_temp.concat([{
        label: $event,
        value: $event
      }]);
    }
    if ($event) {
      this.dialogDataModel.tax_value = $event;
    }
  }

  openUpdateContract(thingId) {
    this.http.post('web/acceptance-approval/create-po-update-contract-dialog',
      {
        thing_id: thingId,
      }
    ).subscribe(result => {
      if (result['code'] === 0) {
          this.showModal.supplier_name = result['data']['supplier_name'];
          this.showModal.contract_number = result['data']['contract_number'];
          this.showModal.contract_list = result['data']['contract_list'];
          this.showModal.thing_id = result['data']['thing_id'];
          this.showModal.isOpen = true;
      } else {
        this.message.error(result['msg']);
      }
    });
  }

  closeUpdateContractDialog() {
    this.showModal.isOpen = false;
    this.showModal.supplier_name = '';
    this.showModal.contract_number = '';
    this.showModal.contract_list = [];
    this.showModal.thing_id = [];
    this.showModal.radioValue = 0;
  }

  updateContractSubmit() {
      if (this.showModal.contract_list.some(value => value.checked === true)) {
        let contract_id = 0;
        this.showModal.contract_list.forEach((item, i) => {
          if (item.checked) {
            contract_id = item['id'];
          }
        });
      this.http.post('web/acceptance-approval/create-po-update-contract',
        {
          contract_id: contract_id,
          thing_id: this.showModal.thing_id,
        }
      ).subscribe(result => {
        this.closeUpdateContractDialog();
        if (result['code'] === 0) {
          this.message.success(result['msg']);
            this.getList();
        } else {
          this.message.error(result['msg']);
        }
      });
    } else {
        this.message.error('请选择合同');
        return false;
      }
  }

  selectContract(index) {
    let contractList = this.showModal.contract_list;
    if (contractList && contractList.length > 0) {
      contractList.forEach((item, i) => {
        if(i != index) {
          item.checked = false;
        }
      });
      contractList[index].checked = !contractList[index].checked;
    }
  }

  showContractInfo(item) {
    this.modal.open('contract-price-info', {
      id: item['id'],
    });
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
  ngOnDestroy () {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  purchaseSubmit() {
    // 获取选择物件
    const thing_id = this.list.filter(item => item.indeterminate || item.checked).map((items, index) =>
      items['children'].filter(item => item.checked).map(item => item.id)
    ).reduce((acc, val) => acc.concat(val), []);

    this.message.isAllLoading = true;

    // 提交数据
    this.http.post( '/web/acceptance-approval/wait-push-epo-end', {
      thing_id: thing_id,
    }).subscribe(result => {
      this.isVisible = false;
      this.message.isAllLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.menuService.getBacklog();
    }, () => {
      this.isVisible = false;
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }

  delayNotice() {
    const thing_id = this.list.filter(item => item.indeterminate || item.checked).map((items, index) =>
      items['children'].filter(item => item.checked).map(item => item.id)
    ).reduce((acc, val) => acc.concat(val), []);
    //显示弹框
    this.modal.open('delay-remind', {
      current_workflow: 11800,
      thing_id: thing_id
    });
  }
}
