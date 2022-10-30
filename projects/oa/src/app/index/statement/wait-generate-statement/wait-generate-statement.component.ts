import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService} from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service'
import { MenuService } from '../../../services/menu.service';
import { BehaviorSubject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { create, all } from 'mathjs';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';

const config = {
  // Default type of number
  // Available options: 'number' (default), 'BigNumber', or 'Fraction'
  number: 'Fraction',

  // Number of significant digits for BigNumbers
  precision: 20
};

const math = create(all, config);

@Component({
  templateUrl: './wait-generate-statement.component.html',
  styles: [
    `
    ::ng-deep .ant-form-item label{
      margin-bottom: 0;
    }

    ::ng-deep .ant-form-item{
      margin-bottom: 12px;
    }
  `]
})

export class WaitGenerateStatementComponent implements OnInit {

  // loading
  contract;
  loading = true;
  listLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  disabledButton = true;
  // Model 参数配置
  isModelVisible = false;
  title = 'title';
  isOkLoading = false;
  isPullLoading = false;
  // 弹框数据加载中
  dialogLoading = true;
  // 数据列表
  list = [];
  expands = {}; // 展开项
  isVisible = false; // 驳回弹出框
  reason = ''; // 驳回原因
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  orgList = [];
  vendor_site_list = [];
  vendor_site = {
    category_name: '',
    account_number: '',
    account_bank: '',
    account_name: ''
  };
  dialogDataModel = {
    thing_num: 0,
    thing_price: 0,
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
    memo: '',
    receiver_ids: [],
    select_supplier_reason: '',
    currency_symbol: '',
    contract_tax_type: '',
    tax_type: '',
    tax_value: '',
  };
  skipDialog = 0;

  handleDepartmentList = [];
  handleCenterList = [];

  departmentCodeList = [];
  costCenterList = [];
  optionCostCenter = [];
  chooseReason = [];

  searchOaChange$ = new BehaviorSubject('');
  isSearchSelect = true;
  optionSearchs = [];

  postThingId = [];

  // 推送验收审批
  isPushAcceptanceModelVisible: Boolean = false;
  dataSet = [];
  thingtotal = 0;

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
    this.getList();

    this.searchOaChange$ = new BehaviorSubject('');
    this.isSearchSelect = true;
    this.optionSearchs = [];
    this.searchOaChange$.asObservable().pipe(debounceTime(500))
      .subscribe((value) => {
        let options;
        options = {
          params: {
            'enName': value ? value : '',
          }
        };
        this.isSearchSelect = true;
        this.http.get('web/user/search-names', options).subscribe(data2 => {
          this.optionSearchs = data2['data'];
          this.isSearchSelect = false;
        });
      });
  }


  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/acceptance-approval/wait-generate-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['children_columns'];
      this.queryFields     = result['search_form'];
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


  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);

    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      'group_by': '1',
      ...this.searchFormData
    };
    this.http.get('web/acceptance-approval/wait-generate-list', {params: params}).subscribe(result => {
      this.listLoading            = false;
      if (result['code'] == 0) {
        this.pagination.total_count = result['pager']['itemCount'];
        this.pagination.page_index  = result['pager']['page'];
        this.pagination.page_size   = result['pager']['pageSize'];
        if (this.expands && result['list']) {
          result['list'] = result['list'].map(item => {
            if (this.expands[item.id]) {
              item['expand'] = this.expands[item.id];
            }
            if (item.children && item.children.length > 10) {
              item['expand'] = true;
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
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
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
          this.contract = result['data']['contract'];
          this.dialogDataModel = result['data']['dialogModel'];
          this.skipDialog = result['skip_dialog'];
          this.vendor_site = result['data']['vendor_site'];
          this.vendor_site_list = result['data']['vendor_site_list'];
          this.optionSearchs = result['data']['receiver'];
          if (this.dialogDataModel.department_code !== '') {
            this.changeDepartmentCode(this.dialogDataModel.department_code);
          }

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
          this.submit();
        }
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  pushingAcceptance () {
    const data = this.list.filter(item => item.checked || item.indeterminate).map((item, index) => {
      const ids = item.children.filter(thing => thing.checked).map(thing => thing.id);
      const total_price_cny = item.children
        .filter(thing => thing.checked)
        .map(res => Number(res.total_price_cny) + Number(res.tax_price_cny))
        .reduce((total, num) => math.add(math.fraction(total), math.fraction(num)));
      return {
        product_name: item.product_name,
        pr_name: item.pr_name,
        director: item.director,
        bmp: item.bmp,
        thing_ids: ids,
        project_id: item.project_id,
        project_product_budget_id: item.project_product_budget_id,
        total_price_cny: total_price_cny,
        category_type: item.category_type
      };
    });
    this.thingtotal = data.map(item => item.thing_ids.length).reduce((total, item) => total + item);
    this.isPushAcceptanceModelVisible = true;
    this.dataSet = data;
  }

  // 关闭推送验收审批
  closePushAcceptanceModel () {
    this.isPushAcceptanceModelVisible = false;
  }

  submitPushAcceptance () {
    this.isOkLoading = true;
    this.http.post('web/acceptance-approval/push-acceptance-audit', this.dataSet).subscribe(result => {
      this.isOkLoading = false;
      if (result['code'] === 0) {
        this.isPushAcceptanceModelVisible = false;
        this.message.success(result['msg']);
        this.getList();
        this.menuService.getBacklog();
      } else {
        this.message.error(result['msg']);
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });

  }

  changeDepartment(option) {
    option['handle_center'] = '';
  }

  submit() {
    if (this.postThingId.length == 0) {
      this.message.error('请选择物件');
      return false;
    }
    if (this.skipDialog === 0) {
      if (this.dialogDataModel.org_id === '0') {
        this.message.error('请选择我方主体');
        return false;
      }
      // if (this.dialogDataModel.vendor_site_id == 0) {
      //   this.message.error('没有VendorSiteId不能提交');
      //   return false;
      // }
      if (this.dialogDataModel.handle_department === '0' || this.dialogDataModel.handle_department === '') {
        this.message.error('请选择经办部门');
        return false;
      }
      if (this.dialogDataModel.memo === '') {
        this.message.error('合同/订单说明不能为空');
        return false;
      }
    }

    const param = {
      thing_id: this.postThingId,
      data: this.dialogDataModel,
      skipDialog: this.skipDialog
    };
    this.isOkLoading = true;
    this.http.post('/web/acceptance-approval/generate', param).subscribe(result => {
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

  purchaseSubmit(optionType) {
    const thing_id = this.list.map(item => {
      if (item.expand != undefined) {
        this.expands[item.id] = item.expand;
      }
      return item;
    }).filter(item => item.indeterminate || item.checked).map((items, index) =>
      items['children'].filter(item => item.checked).map(item => item.id)
    ).reduce((acc, val) => acc.concat(val), []);
    this.message.isAllLoading = true;
    let url = '/web/acceptance-approval/';
    if (optionType === 'reject') {
      url += 'generate-' + optionType;
    } else if (optionType === 'process_end') {
      url += 'process-end';
    }
    this.http.post(url, {
      thing_id: thing_id,
      reason: this.reason
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

  changeDepartmentCode(departmentCode: string) {
    this.optionCostCenter = this.departmentCodeList.filter(item => {
      if (item['dept_code'] === departmentCode) {
        return item['children'];
      }
    });
  }

  changeServerCategory(siteId) {
    const item = this.vendor_site_list.find(item => item.vendor_site_id === siteId);
    if (item) {
      this.vendor_site.account_number = item['account_number'];
      this.vendor_site.category_name = item['category_name'];
      this.vendor_site.account_bank = item['account_bank'];
      this.vendor_site.account_name = item['account_name'];
    }
  }

  onOaSearch(value = '') {
    this.searchOaChange$.next(value);
  }

  clickEvent(event) {
    if (event.key === 'order_code') {
      this.modalService.open('order', {...event.item, id: event.item.order_id})
    } else if (event.key === 'thing_code' || event.key === 'thing_name' ) {
      this.modalService.open('thing', event.item);
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
        this.message.success(result['msg']);
      } else {
        this.message.error(result['msg']);
      }

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

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
  delayNotice() {
    let thing_id;
    thing_id = [];
    this.list.forEach((items) => {
      if ((items.checked || items.indeterminate) && items.children) {
        items.children.forEach(thing => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });
    //显示弹框
    this.modalService.open('delay-remind', {
      current_workflow: 11500,
      thing_id: thing_id
    });
  }
}
