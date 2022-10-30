import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject} from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { NzMessageService, UploadXHRArgs } from 'ng-zorro-antd';
import { MessageService } from '../../../services/message.service';
import { UploadService} from '../../../services/upload.service';
import { MenuService} from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { CosService } from '../../../services/cos.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils'
import { CommonFunctionService } from '../../../services/common-function.service';

@Component({
  selector: 'app-modal-create-contract',
  templateUrl: './create-contract.component.html',
  styleUrls  : ['./create-contract.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class CreateContractModalComponent implements OnInit, OnDestroy {
  searchChange$ = new BehaviorSubject('');
  isOpen: Boolean = false;
  nzZIndex = 800;
  loading = true;
  isSubmitLoading = false;
  dataModal;
  cateContractList = [];
  deptCoaTree = [];
  deptChidrenCoaTree = [];
  categorytreeOptions = [];
  categoryWorkloadUnit = [];
  produceBreakdownObj = {};
  produceGradeObj = {};
  workloadUnitOptions = [];
  orderApproveOptions = [];
  coaCodeOptions = [];
  cateData = {
    'is_add': true,
    'all_category_id': '',
    'produce_breakdown_id': '0',
    'produce_grade_id': '0',
    'price_lower': '',
    'price_upper': '',
    'workload_unit_id': '0',
    'limit': '',
    'remark': '',
    'coa_code': '',
    'cooperation_status': '1'
  };
  requiredArr = [];
  contract_type = null;
  where = { 'add': true, 'edit': false, 'contract_type': false, contract_type_2: false,  contract_type_1: true };

  optionSearchs = { 'vendor_id': [] };
  isSearchSelect = { 'vendor_id': false };
  contractOptions = [];
  contractInfo = {};
  category_name_list = {};
  orgList = [];
  importFile = {
    isVisible: false,
    msg: '',
    percent: 1
  };
  formConfig = [];
  tax_rate_list = null;
  hideNode;
  id = null;
  showType = 'add';  // 显示状态: 新建: add , 编辑: update, 复制: copy
  title = '新建合同';

  // epo 下拉参数
  epoCodeOptions = [];

  // 决策单号
  dec_order_code_options = [];


  constructor(
    private http: HttpClient,
    private message: MessageService,
    public menuService: MenuService,
    private modalService: ModalService,
    private msg: NzMessageService,
    public uploadService: UploadService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder,
    public cos: CosService,
    public commonFunctionService: CommonFunctionService
  ) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(item => {
      if (item && item['key'] === 'create-contract') {
        if (item['data']['params']) {
          this.title = item['data']['params']['title'];
        }

        // 数据初始化
        this.epoCodeOptions = [];
        const messageId = this.message.loading('正在请求数据中...', { nzDuration: 0 }).messageId;
        this.http.get('web/contract/contract-save-config', {
          params: item['data']['params']
        }).subscribe(result => {
          this.message.remove(messageId);
          if (result['code'] === 0) {
            this.isOpen = true;
            this.loading = true;
            this.nzZIndex = item['zIndex'];
            this.dataModal = result['data'];
            this.dec_order_code_options = this.dataModal['dec_order_code_options'];
            this.initData();
          } else {
            this.message.error(result['msg']);
          }
        }, err => {
          this.message.remove(messageId);
          this.message.error(err['message']);
        });
      }
    });



    // 搜索
    const optionsList$ =  this.searchChange$.asObservable().pipe(debounceTime(100));
    optionsList$.subscribe(key => {
      if (!this.dataModal) {
        return;
      }

      if ( this.dataModal['supplier_id']
          && this.dataModal['contract_code']
          && this.dataModal['contract_type']
          && (this.dataModal['epo_code'] || this.dataModal['contract_type'] === '1' ||  this.dataModal['contract_type'] === '3')) {

          this.cd.markForCheck();
          this.http.get('web/contract/get-contract-info', { params: {
            supplier_id:   this.dataModal.supplier_id,
            contract_code: this.dataModal.contract_code,
            epo_code:      this.dataModal.epo_code,
            contract_type: this.dataModal.contract_type,
            contract_source:  this.dataModal.contract_source,
          } }).subscribe(result => {
            this.message.isAllLoading = false;
            if (result['code'] === 0) {
                this.dataModal['valid_time']      = result['data']['validity_time_text'] || '';
                this.dataModal['org_name']        = result['data']['org_name'] || '';
                this.dataModal['currency_name']   = result['data']['currency_name'] || '';

                this.dataModal['contract_price']  = this.commonFunctionService.numberFormat(result['data']['amount']);
                this.dataModal['epo_term_id']     = result['data']['epo_term_id'];
                this.contractOptions              = result['data']['body_data'];
                if (result['data']['epo_pay_terms_list']) {
                  this.dataModal['pay_terms_info_list'] = result['data']['epo_pay_terms_list'];
                }
                this.setContractOptions();
            } else {
              this.dataModal['valid_time']      =  null;
              this.dataModal['org_name']        = null;
              this.dataModal['currency_name']   = null;
              this.dataModal['contract_price']  = null;
              this.dataModal['epo_term_id']     = null;
              this.contractOptions              = [];
              this.message.error(result['msg']);
            }
            this.setFormConfig();
            this.cd.markForCheck();
          }, () => {
            this.message.error('网络异常，请稍后再试');
            this.message.isAllLoading = false;
            this.cd.markForCheck();
          });
      } else {
        this.setFormConfig();
        this.cd.markForCheck();
      }
    });
  }


  filterOption = filterOption

  filter = (i, p) => {
    return p.some(o => {
      const label = o.label;
      return !!label && label.trim().toLowerCase().indexOf(i.trim().toLowerCase()) !== -1;
    })
  }

  initData() {
    if (this.dataModal['supplier_id']) {
      this.getSupplierEpo(this.dataModal['supplier_id']);
    }

    if (this.dataModal['id']) {
      this.id = this.dataModal['id'];
      //this.dataModal['supplier_id'] = this.dataModal['id']

      this.showType = 'edit';
    } else {
      this.showType = 'add';
    }

    this.loading              = false;
    this.contractInfo         = {};
    this.contract_type        = this.dataModal['contract_type'];
    this.dataModal['contract_code'] = this.dataModal['contract_number'];
    // 合同号下拉参数
    this.contractOptions      = this.dataModal['body_data'] ?  this.dataModal['body_data'] : [];
    this.tax_rate_list        = this.dataModal['tax_rate_list'];
    this.categorytreeOptions  = this.dataModal['categorytreeOptions'] ? this.dataModal['categorytreeOptions'] : [];
    this.produceBreakdownObj  = this.dataModal['produceBreakdown'] ? this.dataModal['produceBreakdown'] : null;
    this.produceGradeObj      = this.dataModal['produceGrade'] ? this.dataModal['produceGrade'] : {};
    this.workloadUnitOptions  = this.dataModal['workloadUnitOptions'] ? this.dataModal['workloadUnitOptions'] : [];
    this.orderApproveOptions  = [];
    this.deptCoaTree          = this.dataModal['deptCoaTree'] ? this.dataModal['deptCoaTree'] : [];
    this.deptChidrenCoaTree   = this.dataModal['deptCoaTree'] ? this.dataModal['deptCoaTree'] : [];
    this.requiredArr          = [];
    this.coaCodeOptions       = this.dataModal['coaCodeOptions'] ? this.dataModal['coaCodeOptions'] : [];
    this.categoryWorkloadUnit = this.dataModal['categoryWorkloadUnit'] ? this.dataModal['categoryWorkloadUnit'] : [];
    this.orgList              = this.dataModal['orgList'] && this.dataModal['orgList'].length > 0 ? this.dataModal['orgList'] : [{}];

    // 合同明细
    this.cateContractList     = this.dataModal['price_librarys'] && this.dataModal['price_librarys'].length > 0
      ? this.dataModal['price_librarys'] : [{...this.cateData}];

    // 我方主体明细
    this.setContractOptions();

    // 表单配置
    this.setFormConfig();

    // 合同限制范围
    this.treeLimit();

    this.cd.markForCheck();
  }

  setFormConfig () {
    this.formConfig = [
      {
        key: 'supplier_id',
        label: '供应商名称',
        type: 'select',
        required: true,
        showWhere: 'add',
        hide: this.showType === 'edit',
        span: 6,
        options: this.dataModal['spplierOptions'] ?  this.dataModal['spplierOptions'] : []
      },
      {
        key: 'supplier_name',
        label: '供应商名称',
        showWhere: 'edit',
        hide: this.showType === 'add',
        span: 6
      },
      {
        key: 'contract_type',
        label: '合同类型',
        type: 'select',
        required: true,
        span: 6,
        default: '',
        options: [
          {'label': '框架协议', 'value': '1'},
          {'label': '单笔协议', 'value': '2'},
          {'label': '限框协议', 'value': '3'},
        ]
      },
      {
        key: 'contract_code',
        label: '合同号',
        disabled: false,
        showWhere: 'add',
        hide: this.showType === 'edit',
        type: 'input',
        span: 6
      },
      {
        key: 'contract_code',
        label: '合同号',
        disabled: false,
        showWhere: 'edit',
        hide: this.showType === 'add',
        span: 6
      },
      {
        key: 'contract_source',
        label: '合同来源',
        type: 'select',
        span: 6,
        hide: !(this.dataModal['contract_type'] === '2'
          && (this.showType !== 'edit' || (this.showType === 'edit' && (this.contract_type === '1' || this.contract_type === '3') ))), /// 编辑模式, 单笔合同 不显示
        options: [
          {'label': 'EPO', 'value': '0'},
          {'label': 'BFC', 'value': '1'},
    ]
      },
      {
        key: 'contract_source_str',
        label: '合同来源',
        hide: !(this.dataModal['contract_type'] === '2'
          && (this.showType === 'edit' && this.contract_type === '2')), // 编辑模式, 单笔合同 显示
        span: 6,
      },
      {
        key: 'epo_code',
        label: 'EPO信息',
        type: 'select',
        btn: '拉取',
        span: 6,
        hide: !(this.dataModal['contract_type'] === '2'
              && (this.showType !== 'edit' || (this.showType === 'edit' && (this.contract_type === '1' || this.contract_type === '3') ))), /// 编辑模式, 单笔合同 不显示
        options: this.epoCodeOptions.filter(option => option.contract_code === this.dataModal['contract_code'])
      },
      {
        key: 'epo_code',
        label: 'EPO信息',
        hide: !(this.dataModal['contract_type'] === '2'
                && (this.showType === 'edit' && this.contract_type === '2')), // 编辑模式, 单笔合同 显示
        span: 6,
      },

      {
        key: 'org_name',
        label: '合同我方主体',
        span: 6
      },

      {
        key: 'tax_type',
        label: '含税/不含税',
        type: 'select',
        required: true,
        span: 6,
        default: '',
        options: [
          {'label': '含税', 'value': '1'},
          {'label': '不含税', 'value': '2'},
        ]
      },
      {
        key: 'tax_rate_value',
        label: '税率',
        type: 'select',
        required: true,
        serverSearch: true,
        span: 6,
        default: '',
        hide:  this.dataModal['tax_type'] === '2' ? false : true,
        options: this.dataModal['tax_rate_list'] ? this.tax_rate_list.map(value => {
          return {
            label: value,
            value: value
          };
        }) : []
      },
      {
        key: 'valid_time',
        label: '合同有效期',
        span: 6
      },
      {
        key: 'currency_name',
        label: '合同币种',
        span: 6
      },
      {
        key: 'approval_id',
        label: '审批人',
        type: 'select',
        nzMode: 'multiple',
        required: true,
        span: 6,
        options: this.dataModal['orderApproveOptions'] ? this.dataModal['orderApproveOptions'] : []
      },
      {
        key: 'contract_price',
        label: '合同金额/已用',
        span: 6,
      },
      {
        key: 'contract_tag',
        label: '合作模式',//基地合同标识
        type: 'select',
        required: true,
        span: 6,
        default: '',
        options: [
          {'label': '画师', 'value': '2'},
          {'label': '基地', 'value': '1'},
          {'label': '常规', 'value': '0'},
        ]
      },
      {
        key: 'upload_file_id',
        label: '合同附件',
        type: 'upload-file',
        dataName: 'upload_file_name',
        required: false,
        span: 6
      },
      {
        key: 'epo_term_id',
        label: '付款类型',
        type: 'select',
        span: 6,
        // hide: this.showType === 'edit',
        hide: this.dataModal['contract_type'] === '2',
        disabled: !!this.dataModal['is_edit_pay_trem'],
        required: true,
        options: this.dataModal['pay_terms_info_list'] ? this.dataModal['pay_terms_info_list'] : []
      },
      // {
      //   key: 'epo_term_name',
      //   label: '付款类型',
      //   span: 6,
      //   hide: this.showType === 'add',
      // },
      {
        key: 'select_reason',
        label: '供应商选择方法',
        type: 'select',
        span: 6,
        // hide: this.showType === 'edit',
        required: true,
        options: this.dataModal['select_reason_options'] ? this.dataModal['select_reason_options'] : []
      },
      {
        key: 'status',
        label: '合同状态',
        type: 'select',
        span: 6,
         hide: this.showType === 'add',
        required: true,
        options: this.dataModal['status_option'] ? this.dataModal['status_option'] : []
      },
      {
        key: 'limit',
        label: '合同限制范围',
        type: 'tree-select',
        span: 24,
        default: '',
        options: this.deptCoaTree
      },
      {
        key: 'remark',
        label: '合同说明',
        type: 'textarea',
        required: false,
        span: 24
      },
    ];

    this.requiredArr = [];
    this.formConfig.forEach(item => {
      // 默认值
      if (!this.dataModal[item.key]) {
        this.dataModal[item.key] = item['default'] || '';
      }
      if (item['required'] && !item['hide']) {
        this.requiredArr.push({
          'field': item.key,
          'label': item.label
        });
      }
    });

    this.cd.markForCheck();
  }

  setContractOptions () {
    this.category_name_list = [];
    this.contractOptions.map(item => {
      this.category_name_list[item.org_id] = item.category_name_list;
    });
    this.contractOptions.map(item => {
      this.contractInfo[item.org_id] = item;
      item.category_name_list.map(category => {
        if (!this.contractInfo[item.org_id].categoryObj) {
          this.contractInfo[item.org_id].categoryObj = {};
        }
        this.contractInfo[item.org_id].categoryObj[category.category_id] = category;

        category.account_list.map(accounts => {
          if (!this.contractInfo[item.org_id].categoryObj[category.category_id].accountObj) {
            this.contractInfo[item.org_id].categoryObj[category.category_id].accountObj = {};
          }
          this.contractInfo[item.org_id].categoryObj[category.category_id].accountObj[accounts.vendor_site_id] = accounts;
        });
      });
    });
    this.cd.markForCheck();
  }

  onSearch ($event, item = {}) {
    if (item['key'] === 'tax_rate_value' && $event) {
      item['options'] = this.tax_rate_list.map(item => {
        return {
          label: item,
          value: item
        };
      }).concat([{
        label: $event,
        value: $event
      }]);
      this.dataModal[item['key']] = $event;
      this.cd.markForCheck();
    }
  }

  // 开打弹窗前先获取项目及预算
  openModal(item, tab = 0) {
    this.dataModal = item;
    this.dataModal['contract_code'] = this.dataModal['contract_number'];
  }

  modalCancel() {
    this.isOpen = false;
    this.cd.markForCheck();
  }

  treeNodeAddLeaf (nodes) {
    if (nodes && nodes.length > 0) {
      nodes.forEach(node => {
        if (node && node.children && node.children.length > 0) {
          this.treeNodeAddLeaf(node.children);
        } else {
          node.isLeaf = true;
        }
      });
    }
  }

  modalSubmit() {
    if (!this.isSubmitLoading) {
      let isError, params, url;
      isError = false;

      this.requiredArr.forEach(data => {
        if (data.required && (!this.dataModal[data.field] || this.dataModal[data.field] === '')
                && data.field !== 'limit' && (data.field !== 'tax_rate_value')) {
            this.message.error(data.label + '不能为空');
            isError = true;
            return false;
        }
      });

      if (this.dataModal['contract_type'] === '2' ) {
        if (Array.isArray(this.dataModal['limit']) && this.dataModal['limit'].length === 0) {
          this.message.error('合同限制范围 不能为空');
          isError = true;
          return false;
        }
      }

      // 人员信息必填项检测
      this.cateContractList.forEach((data, index) => {
        if (!data['category_id'] || data['category_id'] === '') {
          this.message.error('品类明细，第' + (index + 1) + '行：品类 不能为空');
          isError = true;
          return false;
        }
        if (!data['produce_breakdown_id'] || data['produce_breakdown_id'] === '') {
          this.message.error('品类明细，第' + (index + 1) + '行：制作明细 不能为空');
          isError = true;
          return false;
        }
        if (!data['produce_grade_id'] || data['produce_grade_id'] === '') {
          this.message.error('品类明细，第' + (index + 1) + '行：制作等级 不能为空');
          isError = true;
          return false;
        }
        if (!data['workload_unit_id'] || data['workload_unit_id'] === '') {
          this.message.error('品类明细，第' + (index + 1) + '行：工作单位 不能为空');
          isError = true;
          return false;
        }
      });
      if (isError) {
        return false;
      }
      params = {
        ...this.dataModal,
        'categoryList': this.cateContractList,
      };
      params['orderApproveOptions'] = '';
      params['spplierOptions'] = '';
      params['price_librarys'] = '';
      params['categorytreeOptions'] = '';
      params['produceBreakdown'] = '';
      params['produceGrade'] = '';
      params['supplierList'] = '';
      params['workloadUnitOptions'] = '';
      params['deptCoaTree'] = '';

      params['contract_code'] = this.dataModal['contract_code'];
      params['orgList'] = this.orgList;

      params['dec_order_data'] = this.dataModal['dec_order_data'];

      this.isSubmitLoading = true;

      if (this.dataModal['id'] && this.dataModal['id'] !== '' && this.dataModal['id'] !== 0) {
        url = 'web/contract/contract-price-edit';
      } else {
        url = 'web/contract/contract-price-add';
      }
      this.cd.markForCheck();
      this.http.post(url, params).subscribe(results => {
        this.isSubmitLoading = false;

        if (results['code'] === 0) {
          this.message.success(results['msg']);
          this.modalService.complete('create-contract', {
            code: 0,
            data: results['data']
          });
          this.isOpen = false;
          this.cd.markForCheck();
        } else {
          this.message.error(results['msg']);
        }
        this.cd.markForCheck();
      }, (err) => {
        this.isSubmitLoading = false;
        this.message.error(err.error['message'] || '操作异常，请稍后再试或者联系管理员！');
        this.cd.markForCheck();
      });
    }

  }

  // 我方主体添加一行
  addTableRowBody(type) {
    if (type === 1) {
      this.orgList.push({});
      this.cd.markForCheck();
    }
  }

  // 我方主体删除一行
  delTableRowBody(type, index) {
    if (type === 1) {
      if (this.orgList.length === 1) {
        this.message.error('最少保留一行');
        return false;
      }
      this.orgList.splice(index, 1);
      this.cd.markForCheck();
    }
  }

  // 合同明细添加一行
  addTableRow(type) {
    if (type === 1) {
      this.cateContractList.push(JSON.parse(JSON.stringify(this.cateData)));
      this.cd.markForCheck();
    }
  }

  // 合同明细删除一行
  delTableRow(type, index) {
    if (type === 1) {
      if (this.cateContractList.length === 1) {
        this.message.error('最少保留一行');
        return false;
      }
      this.cateContractList.splice(index, 1);
      this.cd.markForCheck();
    }
  }

  // 搜索
  onSearchChange(value, key, url) {
    // this.isSearchSelect[key] = true;
    // let nItem;
    // nItem = { value: value, key: key, url: url };
    // this.searchChange$.next(nItem);
  }

  // 选中事件
  onSelectChange(value, key, item = {}) {
    if (key === 'supplier_id') {
      this.getSupplierEpo(value);
      this.searchChange$.next('supplier_id');
    } else if (key === 'epo_code') {
      this.searchChange$.next('epo_code');
      this.cd.markForCheck();
    } else if (key === 'all_category_id') {
      if (value) {
        item['category_id'] = value[value.length - 1];
        item['produce_breakdown_id'] = '0';
        item['produce_grade_id'] = '0';
        const categoryWorkloadUnitObj = this.categoryWorkloadUnit.find(el => el['category_id'] === value[value.length - 1]);
        item['workload_unit_id'] = categoryWorkloadUnitObj ? categoryWorkloadUnitObj['workload_unit_id'] : '0';
      }
    } else if (key === 'contract_type') {
      this.searchChange$.next('contract_type');
    } else if (key === 'tax_rate_value') {
    } else if (key === 'tax_type') {
      this.formConfig.forEach(data => {
        if (data.key === 'tax_rate_value') {
          data.hide = value === '2' ? false : true;
        }
      });
    } else if (key === 'produce_breakdown') {
      if (value === 0) {
        const categoryWorkloadUnitObj = this.categoryWorkloadUnit.find(el => el['category_id'] === item['category_id']);
        item['workload_unit_id'] = categoryWorkloadUnitObj ? categoryWorkloadUnitObj['workload_unit_id'] : '0';
      } else {
        if (this.produceBreakdownObj[item['category_id']]) {
          this.produceBreakdownObj[item['category_id']].forEach(data => {
            if (data.value === value.toString()) {
              item['workload_unit_id'] = data.workload_unit_id;
            }
          });
        }
      }
    }
    this.cd.markForCheck();
  }

  // treeSelect
  onTreeSelectChange (value, key, item = {}) {
    this.dataModal.limit = value;
    this.treeLimit();
  }

  //
  treeLimit () {
    const value = this.dataModal.limit;
    let tree = [];
    if (value && Array.isArray(value) && value.length === 0) {
      tree = this.deptCoaTree;
    } else {
      this.deptCoaTree.forEach(data => {
        if (value.indexOf(data.key) >= 0) {
          tree.push(data);
        } else {
          data.children = data.children ? data.children : [];
          data.children.forEach(data2 => {
            if (value.indexOf(data2.key) >= 0) {
              tree.push(data2);
            } else {
              if (data2.children && Array.isArray(data2.children)) {
                data2.children.forEach(data3 => {
                  if (value.indexOf(data3.key) >= 0) {
                    tree.push(data3);
                  } else {
                    if (data3.children && Array.isArray(data3.children)) {
                      data3.children.forEach(data4 => {
                        if (value.indexOf(data4.key) >= 0) {
                          tree.push(data4);
                        }
                      });
                    }
                  }
                });
              }
            }
          });
        }
      });
    }
    this.deptChidrenCoaTree = tree;
    this.cd.markForCheck();
  }

  // 获取EPO跟合同
  getEpoAndContract (contract_code, epo_order_code) {
    this.http.get('web/contract/get-epo-and-contract', {
      params: {
        contract_code: contract_code,
        epo_order_code: epo_order_code
      }
    }).subscribe(result => {
      this.message.isAllLoading = false;
      if (result['code'] === 0) {
        this.dataModal['valid_time'] = result['data']['validity_time_text'] || '';
        this.dataModal['contract_price'] = this.commonFunctionService.numberFormat(result['data']['amount']) || '';
        this.contractOptions = result['data']['body_data'];

        this.setContractOptions();
      }
      this.cd.markForCheck();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.cd.markForCheck();
    });
  }


  onBtn(key) {
    if (key === 'epo_code') {
      if (this.dataModal['contract_source'] === null || this.dataModal['contract_source'] === "") {
        this.message.error('请选择单笔合同的来源系统');
        this.message.isAllLoading = false;
        return false;
      }
      console.log(this.dataModal['contract_source']);
      this.message.isAllLoading = true;
      this.http.get('web/contract/pull-supplier-epo', {params: {
        id:  this.dataModal['supplier_id'],
        contract_source:  this.dataModal['contract_source'],
      }}).subscribe(result => {
        this.message.isAllLoading = false;
        if (result['code'] === 0) {
          this.getSupplierEpo(this.dataModal['supplier_id']);
        }
        this.cd.markForCheck();
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
        this.message.isAllLoading = false;
        this.cd.markForCheck();
      });
    }
  }

  addDesInfo(list, {}) {
    this.dataModal.dec_order_data =  [ {status: 1}, ...this.dataModal.dec_order_data]
  }

  decOrderCodeChange (code, item) {
    const dec_order = this.dec_order_code_options.find(item => item.dec_order_code == code)
    if (dec_order) {
      item.dec_project_name = dec_order.dec_project_name
      item.dec_type = dec_order.dec_type
      item.dec_id = dec_order.dec_id
      item.dec_type_name = dec_order.dec_type_name
    }
  }

  // 获取供应商EPO
  getSupplierEpo(id) {
    this.message.isAllLoading = true;
    this.cd.markForCheck();

    // paramsFilter(this.dataModal['contract_code'])
    if (this.dataModal['contract_code']) {
      this.dataModal['contract_code'] = this.dataModal['contract_code'].trim()
    }
    this.http.get('web/contract/get-supplier-epo', { params: {
      id: id,
      contract_code: this.dataModal['contract_code']
    }}).subscribe(result => {
      this.message.isAllLoading = false;
      if (result['code'] === 0) {
        this.epoCodeOptions = result['data'] || [];
      } else {
        this.epoCodeOptions = [];
      }
      this.cd.markForCheck();
      this.setFormConfig();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.cd.markForCheck();
    });
  }

  // 分片上传
  customBigReq = (item: UploadXHRArgs) => {
    // this.isChangeThing = true;
    const id = this.msg.loading('正在上传中', { nzDuration: 0 }).messageId;
    this.uploadService.uploadBig(item, 1700, data => {
      this.msg.remove(id);
      this.dataModal['upload_file_id'] = data['id'];
      this.dataModal['upload_file_name'] = data['file_name'];
    });
  }

  delUploadFile() {
    this.dataModal['upload_file_id'] = 0;
    this.dataModal['upload_file_name'] = '';
  }

  onContractSearch ($e) {
    this.http.get('web/contract/pull-supplier-epo').subscribe(result => {
      this.message.isAllLoading = false;
      if (result['code'] === 0) {
        this.getSupplierEpo(this.dataModal['supplier_id']);
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }


  // 我方主体发生变化时
  onOrgIdChange (id, item) {
    if (id && this.category_name_list[id]) {
      item['id'] = null;
      item['account_supplier_bank'] = null;
      item['vendor_site_id'] = null;
      item['vendor_site_id'] = null;
      this.cd.markForCheck();
    }
  }

  onCategoryChange (category_id, item) {
    const  account_options = this.contractInfo[item.org_id].categoryObj[category_id].account_list;
    if (category_id && account_options && account_options.length === 1) {
      item['id'] = account_options[0].id;
      item['vendor_site_id'] = account_options[0].vendor_site_id;
    } else {
      item['id'] = null;
      item['vendor_site_id'] = null;
    }
    this.cd.markForCheck();
  }

  accountBankChange ($event, item) {
    if ($event && item.org_id && item.category_id) {
      item.id = this.contractInfo[item.org_id].categoryObj[item.category_id].accountObj[$event].id;
      item.vendor_site_id = this.contractInfo[item.org_id].categoryObj[item.category_id].accountObj[$event].vendor_site_id;
      this.cd.markForCheck();
    }
  }

  inputModelChange (item, model) {
    if (item.key !== 'contract_code' || !model[item.key]) {
      return;
    }

    if (!model['supplier_id']) {
      this.message.error('请先选择供应商');
      return;
    }

    this.searchChange$.next('contract_code');
    this.cd.markForCheck();
  }

  uploadChange ($event, data) {
    if ($event.type === 'success' && $event.file && $event.file.originFileObj) {
      this.dataModal['upload_file_id'] = $event.file.originFileObj.file_id;
      this.dataModal['upload_file_name'] = $event.file.name;
    }
  }


  // 决策附件上传
  decUploadChange ($event, data) {
    if ($event.type === 'success' && $event.file && $event.file.originFileObj) {
      data['dec_file_id'] = $event.file.originFileObj.file_id;
      data['dec_file_name'] = $event.file.name;
    }
  }

  decDelFile (data) {
    data['dec_file_id'] = '';
    data['dec_file_name'] = '';
  }


  delDecRowBody(index) {
    console.log(this.dataModal.dec_order_data)
    if (this.dataModal.dec_order_data) {
      this.dataModal.dec_order_data = this.dataModal.dec_order_data.filter((arr, i) => i != index)
    }

  }

    trackByFn(index, item) {
      return item.id ? item.id : index; // or item.id
    }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    // this.removeStyle()
  }
}
