import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { filter, debounceTime } from 'rxjs/operators';
import { filterOption } from '../../../utils/utils';

@Component({
  selector: 'app-modal-push-epo',
  templateUrl: './push-epo.component.html',
  styleUrls: ['./push-epo.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PushEpoModalComponent implements OnInit, OnDestroy {
  @ViewChild('pushEpo') pushEpo: ElementRef;

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService,
    private cd: ChangeDetectorRef
  ) {}


  isVisible;

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

  reason = ''; // 驳回原因
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1',
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
    mba_item_id: ''
  };
  skipDialog = 0;
  filterOption = filterOption

  handleDepartmentList = [];
  handleCenterList = [];
  // 筛选
  searchFormData = {};
  departmentCodeList = [];
  costCenterList = [];
  optionCostCenter = [];
  costCenterOptions = [];

  searchOaChange$ = new BehaviorSubject('');
  isSearchSelect = true;
  optionSearchs = [];

  vendor_site_ids = null;
  postThingId = [];
  newChooseReason = [];
  chooseReason;
  thingId;

  orderId;
  epoStatementId;
  ids; // 物件id

  model$;
  push_type;

  zIndex;
  andPush;

  ngOnInit() {
    this.model$ = this.modalService.modal$.pipe(filter(item => item && item['key'] === 'push-epo')).subscribe((item: any) => {

      this.syncGenerateEpoOrder(item.data);
      this.zIndex = item.zIndex;
      this.push_type = item.data.push_type;
      if (item.data.andPush) {
        this.andPush = item.data.andPush;
      }
    });

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
        });
      });
  }

  // 开打弹窗前先获取项目及预算
  closeModel() {
    this.modalService.complete('push-epo', {
      code: 0,
      data: this.dialogDataModel
    });
    this.isModelVisible = false;
    this.cd.markForCheck()
  }

  syncGenerateEpoOrder(item) {
    let options;
    options = {
      'order_id': item.id,
      'thing_id': item.thing_ids
    };
    const messageId = this.message.loading('正在生成推送EPO订单...', { nzDuration: 0 }).messageId;
    forkJoin(
      this.http.post('web/acceptance-approval/order-search-dialog', options),
      this.http.get('web/ajax-check/user-department'),
      this.http.get('web/acceptance-approval/wait-generate-config')
    ).subscribe(res => {
      this.message.remove(messageId);
      const [result, options, config] = res;
      this.dialogLoading = false;

      if (options['code'] === 0) {
        this.dialogDataModel.handle_department = options['data']['deptId'];
        this.dialogDataModel.handle_center = options['data']['centerId'];
      }
      if (config['code'] !== -1) {
        this.orgList = config['org_list'];

        // this.orgList = vendor_site_list
        this.handleDepartmentList = config['handle_department'];
        if (this.handleDepartmentList) {
          let obj;
          obj = {};
          this.handleDepartmentList.forEach(data => {
            obj[data['id'].toString()] = data['children'] ? data['children'] : [];
          });
          this.handleCenterList    = obj;
        }
        this.departmentCodeList = config['department_code_list'];
        this.costCenterList = config['cost_center_list'];
        this.chooseReason = config['choose_reason'];
      }
      if (result['code'] === 0) {
        this.openModel();
        this.vendor_site_ids = null;
        this.vendor_site_item = [];
        this.contract = result['data']['contract'];
        this.dialogDataModel = result['data']['dialogModel'];
        this.dialogDataModel.tax_list_options_temp = this.dialogDataModel.tax_list_options;
        this.vendor_site = result['data']['vendor_site'];
        this.vendor_site_list = result['data']['vendor_site_list'];
        this.optionSearchs = result['data']['receiver'];
        this.newChooseReason = result['data']['dialogModel']['choose_reason'];
        this.thingId = result['data']['thing_id'];
        this.orderId = result['data']['order_id'];
        this.epoStatementId = result['data']['epo_statement'];
        this.costCenterOptions = result['data']['cost_center_options'];
        this.mba_resources = result['data']['mba_resources'];
        this.mba_has_resources = result['data']['mba_has_resources'];
        if (this.dialogDataModel.department_code !== '') {
          this.changeDepartmentCode(this.dialogDataModel.department_code);
        }
        if (this.dialogDataModel.org_id !== '0') {
          this.changeOrg(this.dialogDataModel['org_id']);
        }
        this.cd.markForCheck();
      } else {
        this.message.error(result['msg']);
        this.cd.markForCheck();
      }

    }, (err) => {
      this.message.remove(messageId);
      this.message.error('网络异常，请稍后再试');
      this.cd.markForCheck();
    });
  }


  changeDepartmentCode(departmentCode: string) {
    this.optionCostCenter = this.departmentCodeList.filter(item => {
      if (item['dept_code'] === departmentCode) {
        return item['children'];
      }
    });
  }

  onOaSearch(value = '') {
    this.searchOaChange$.next(value);
  }

  openModel() {
    this.isModelVisible = true;
  }

  // 税率类型
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

  // 税率值
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

  // 我方主题
  changeOrg(orgId) {
    const vendor_category_list = this.vendor_site_list.filter(item => item.org_id == orgId);

    if (vendor_category_list.length === 1) {
      this.vendor_category_list = vendor_category_list;
    } else {
      const result = [];
      const obj = [];
      for (const i of vendor_category_list) {
        if (i  && !obj[i.category_id]) {
          result.push(i);
          obj[i.category_id] = true;
        }
      }
      this.vendor_category_list = result;
    }

    // 如果有不变，没有默认第一个

    if (!this.vendor_category_list.some(item => item.category_id === this.dialogDataModel.vendor_category_id)) {
      this.dialogDataModel.vendor_category_id = this.vendor_category_list[0].category_id;
    }

    this.changeServerCategory(this.dialogDataModel.vendor_category_id);
  }

  // 服务商供应品类
  changeServerCategory(category_id) {

    this.vendor_site_item = this.vendor_site_list
                              .filter(item => {
                                return item.category_id === category_id && item.org_id === this.dialogDataModel.org_id;
                              }).map(item => {
                                return { ...item, label : item.account_number + item.account_name + item.account_bank };
                              });

    // 默认选第一个
    this.dialogDataModel.vendor_site_id = this.vendor_site_item[0].vendor_site_id;
    this.vendor_site['account_bank'] = this.vendor_site_item[0].account_bank;
    this.vendor_site['account_name'] = this.vendor_site_item[0].account_name;
    this.vendor_site['account_number'] = this.vendor_site_item[0].account_number;
    this.vendor_site['category_name'] = this.vendor_site_item[0].category_name;

  }

  // 拉取供应商服务品类
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
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  // 经办部门
  changeDepartment () {
    this.dialogDataModel.handle_center  = null;
  }

  // 生成验收对账单
  submit() {
    if (!this.thingId || (this.thingId && this.thingId.length === 0)) {
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

    if (this.andPush) {
      param['andPush'] = this.andPush;
    }

    this.isOkLoading = true;
    this.http.post('/web/order/sync-generate-blanket-epo-code', param).subscribe(result => {
      this.isOkLoading = false;
      if (result['code'] === 0) {
        this.message.success(result['msg']);
        this.closeModel();
      } else {
        this.message.error(result['msg']);
        this.cd.markForCheck();
      }
    }, (err) => {
      this.isOkLoading = false;
      this.message.error('网络异常，请稍后再试');
      this.cd.markForCheck();
    });
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    // this.model$.unsubscribe()
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

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
