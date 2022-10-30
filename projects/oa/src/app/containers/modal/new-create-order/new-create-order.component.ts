import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { MessageService } from '../../../services/message.service';
import { MenuService} from '../../../services/menu.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ModalService } from '../../../services/modal.service';
import { filterOption } from '../../../utils/utils';

@Component({
  selector: 'app-modal-new-create-order',
  templateUrl: './new-create-order.component.html',
  styleUrls: ['./new-create-order.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NewCreateOrderModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  columns;
  fromFields;
  loading = false;
  isSubmitLoading = false;
  isCategoryEmpty = false;
  thingIds;
  list;
  supplier = {};
  deptData = {};
  deptOptions;
  x = 0;
  y = 0;
  m = 0;
  nzColumn = { xxl: 4, xl: 4, lg: 4, md: 4, sm: 4, xs: 4 };
  okDisabled = false;

  receiverOptions = [
    { label: '供应商商务', value: 'cp', checked: true },
    { label: '采购经理', value: 'spm', checked: true },
    { label: '采购助理', value: 'spma', checked: true },
  ];
  account_bank_list = [];
  mba_resources = [];
  timer = 0;
  filterOption = filterOption
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private menuService: MenuService,
    private cd: ChangeDetectorRef,
    private modal: ModalService,
    private modalService: NzModalService
  ) {}

  isSearchSelect;
  searchOaChange$ = new BehaviorSubject('');
  addTaxValue$ = new BehaviorSubject('');
  onDestroy$ = new Subject<void>();
  optionSearchs;

  org_list;
  vendor_site_list;
  receivers;
  category_name_list;
  searchFormData;
  cost_center_options;
  isPullLoading = false;
  index = 0;

  ngOnInit() {

    this.modal.modal$.pipe(takeUntil(this.onDestroy$)).subscribe(item => {
      if (item && item['key'] === 'new-create-order') {
        this.loading = true;
        this.isOpen = false;
        this.timer = 0;
        this.cd.markForCheck();
        const messageId = this.message.loading('正在获取数据中...', { nzDuration: 0 }).messageId;
        this.http.post('web/order/create-order-check-v2', {
          thing_ids: item['data']['thing_ids']
        }).subscribe(result => {
          this.message.remove(messageId);
          this.loading = false;
          if (result['code'] === 0) {
            this.isOpen = true;
            this.columns                       = result['columns'];
            this.fromFields                    = result['froms'];
            this.list                          = result['data_list'].map(item => {
              return {
                ...item,
                category_list: []
              };
            });
            //
            this.vendor_site_list              = result['config_data']['org_list'];
            if (result['config_data']) {
              this.receivers = result['config_data']['receiver'];
              this.optionSearchs = result['config_data']['receiver'];
              this.cost_center_options = result['config_data']['cost_center_options'];
              this.deptOptions = result['config_data']['department_tree'];
              const obj = {};
              this.deptOptions.map(data => {
                obj[data['id'].toString()] = data['children'] ? data['children'] : [];
              });
              this.deptData = obj;
            }
            this.list.forEach(data => {
              data.receiverOptions = [
                { label: '供应商商务', value: 'cp', checked: true },
                { label: '采购经理', value: 'spm', checked: true },
                { label: '采购助理', value: 'spma', checked: true },
              ];

              data.notice_crowd_id = ['cp', 'spm', 'spma'];
              //如果有供应商不支持在线操作
              let is_not_online = this.list.some(item=>{return item['supplier_is_online'] === '0'})
              if(is_not_online){
                data['orgIdMsg'] = '供应商暂不支持线上操作，请自行驳回到询价';
                this.okDisabled = true;
              }
              // this.orgIdChange(data.org_id, data);
              let category_obj = {};

              if (data.vendor_site_list) {
                data.vendor_site_list
                  .filter(item => item.org_id === data.org_id)
                  .map(item => {
                    category_obj[item.category_id] = item;
                    return item;
                  });
                if (Object.keys(category_obj).length == 0) {
                  this.isCategoryEmpty = true;
                } else {
                  this.isCategoryEmpty = false;
                }
                data['category_list'] = Object.values(category_obj);

                data.account_list = data.vendor_site_list
                  .filter(item => item.org_id === data.org_id && item.category_id === data.vendor_category_id)
                  .map(item => {
                    return {
                      ...item,
                      value:  item.vendor_site_id,
                      label:  item.account_number + item.account_name + item.account_bank,
                    };
                  });
                }
            });
            this.cd.markForCheck();
          } else {
            this.isOpen = false;
            this.message.error(result['msg']);
          }
          this.cd.markForCheck();
        }, err => {
          this.message.remove(messageId);
          this.loading = false;
          this.cd.markForCheck();
        });
      }
    });

    // 搜索
    this.searchOaChange$
      .asObservable()
      .pipe(debounceTime(200))
      .subscribe((val) => {
        this.isSearchSelect = true;
        this.http.get('web/user/search-names', {
          params: {
            'enName': val ? val : '',
          }
        }).subscribe(res => {
          this.optionSearchs = res['data'];
          this.isSearchSelect = false;
          this.cd.markForCheck();
        });
      });
  }

  onOaSearch(value = '') {
    this.searchOaChange$.next(value);
  }

  // 拉取供应商服务品类
  pullSupplierSite($event, data) {
    this.isPullLoading = true;
    this.http.post('web/acceptance-approval/pull-supplier-site', {
      contract_number: data.contract['contract_number'],
      org_id: data.org_id
    }).subscribe(result => {
      this.isPullLoading = false;
      if (result['code'] === 0) {
        this.vendor_site_list = result['data'];
        this.message.success(result['msg']);
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, err => {
      this.message.error(err['msg']);
      this.cd.markForCheck();
    });
  }

  modalCancel() {
    this.isOpen = false;
    if (this.timer) {
      this.modal.complete('new-create-order', {
        code: 0,
      });
    }
    this.cd.markForCheck();
  }

  checkSubmit(){
    this.list = this.list.filter(item => item.hide !== true);
    if (this.list.length < 1) {
      return;
    }
    var msg = ""
    this.list.forEach((item,index) => {
      let whole_secrecy = item.secrecy_codes.sort().join(",")
      let diff_num = 0;
      for(let i in item.secrecys_detail){
          if(whole_secrecy != i){
            diff_num += item.secrecys_detail[i].length;
          }
      }
      let num = index + 1;
      if(diff_num && Object.keys(item.secrecys_detail).length != 1){
        msg += "No"+num+"所选择的单据中有"+diff_num.toString()+"个物件的保密范围与当前保密范围不一致，若继续将会重新统一保密配置<br/><br/>"
      }
    })

    if(msg){
      this.modalService.confirm({
        nzTitle:"保密配置不一致提醒",
        nzContent:msg,
        nzOnOk:()=>{
          this.modalOk()
        }
      })
    }else{
      this.modalOk()
    }
  }
  // 提交
  modalOk() {
    this.list = this.list.filter(item => item.hide !== true);
    if (this.list.length < 1) {
      return;
    }

    let error = false;
    this.list.forEach(item => {
      if(item['is_set_secrecy'] && item['secrecy_codes'].length === 0){
        this.message.error('请输入保密范围');
        item.errMsg = '请输入保密范围';
        error = true;
        return;
      }
      if (!item['agent']) {
        this.message.error('经办人不能为空');
        item.errMsg = '经办人不能为空';
        error = true;
        return;
      }
      if (!item['handling_department']) {
        this.message.error('经办部门不能为空');
        item.errMsg = '经办部门不能为空';
        error = true;
        return;
      }
      if (!item['handling_center']) {
        this.message.error('经办中心不能为空');
        item.errMsg = '经办中心不能为空';
        error = true;
        return;
      }
      if (!item['tax_value_type'] && item['contract_tax_type'] && item['contract_tax_type'] == 2) {
        this.message.error('税率类型不能为空');
        item.errMsg = '税率类型不能为空';
        error = true;
        return;
      }
      if (!item['select_supplier_reason']) {
        this.message.error('供应商选择方法不能为空');
        item.errMsg = '供应商选择方法不能为空';
        error = true;
        return;
      }
      if (!item['deadline_day']) {
        this.message.error('订单天数不能为空');
        item.errMsg = '订单天数不能为空';
        error = true;
        return;
      }

      if (item['sync_gen_epo_order']) {
        if (!item['org_id']) {
          this.message.error('我方主体不能为空');
          item.errMsg = '我方主体不能为空';
          error = true;
          return;
        }
        if (!item['vendor_category_id']) {
          this.message.error('服务品类不能为空');
          item.errMsg = '服务品类不能为空';
          error = true;
          return;
        }
        if (!item['vendor_site_id']) {
          this.message.error('供应商银行账号不能为空');
        item.errMsg = '供应商银行账号不能为空';
          error = true;
          return;
        }
        if (!item['cost_center_code']) {
          this.message.error('成本中心不能为空');
        item.errMsg = '成本中心不能为空';
          error = true;
          return;
        }
        if (!item['is_auto_payment'] && item['is_auto_payment'] != 0) {
          this.message.error('是否自动发起付款不能为空');
          item.errMsg = '是否自动发起付款不能为空';
          error = true;
        }
        if (!item['receiver']) {
          this.message.error('验收人不能为空');
          item.errMsg = '验收人不能为空';
          error = true;
          return;
        }

        // if (Number(item.prepayments_amount) > Number((Number(item.order_tax_amount_contain_tax)  * 0.3).toFixed(3))) {
        //   this.message.warning(`预付款金额不可超过订单金额的30% (${(Number(item.order_tax_amount_contain_tax)  * 0.3).toFixed(3)}) ${item.contract_symbol}`);
        //   item.errMsg = `预付款金额不可超过订单金额的30% (${(Number(item.order_tax_amount_contain_tax)  * 0.3).toFixed(3)})${item.contract_symbol}`;
        // }

        if (item['orgIdMsg']) {
          //this.message.error(item['orgIdMsg']);
        }
      }
    });

    if (error) {
      return;
    }

    if (this.list.some(item => item.orgIdMsg)) {
      this.modalService.create({
        nzTitle: '警告',
        nzContent: this.list.find(item => item.orgIdMsg).orgIdMsg,
        nzClosable: false,
        nzOnOk: () => {
          this.isSubmitLoading = true;
          this.index = 0;
          this.orderSubmit();
        }
      });
    } else {
      this.isSubmitLoading = true;
      this.index = 0;
      this.orderSubmit();
    }
  }

  orderSubmit () {
    this.timer++;
    this.http.post('web/order/create-order-submit-v2', {
      params: this.list[this.index],
    }).subscribe(results => {
      if (results['code'] === 0) {
        this.list[this.index]['hide'] = true;
        this.message.success(results['msg']);
      } else {
        this.list[this.index]['errMsg'] = results['msg'];
        this.list[this.index]['hide'] = false;
        this.message.error(results['msg']);
      }

      if (this.index < this.list.length - 1) {
        this.index = this.index + 1;
        this.orderSubmit();
      } else {
        this.isSubmitLoading = false;
        const len = this.list.filter(item => item.hide !== true).length;
        if (len === 0) {
          this.modalCancel();
        }
      }
      this.cd.markForCheck();
    }, (err) => {
      this.message.error(err['msg'] || err['message']);
      this.list[this.index]['errMsg'] = err['msg'] || err['message'];

      if (this.index < this.list.length - 1) {
        this.index = this.index + 1;
        this.orderSubmit();
      } else {
        this.isSubmitLoading = false;
        // this.modalCancel();
      }
      this.cd.markForCheck();
    });
    this.cd.markForCheck();
  }

  changeDepartment(option) {
    if (option['handling_department']
          && this.deptData[option['handling_department']]
          && this.deptData[option['handling_department']].length === 1) {
      option['handling_center'] = this.deptData[option['handling_department']][0].id;
    } else {
      option['handling_center'] = null;
    }
    this.cd.markForCheck();
  }

  prepaymentsChange ($event, item) {
    // if (Number(item.prepayments_amount) > Number((Number(item.order_tax_amount_contain_tax)  * 0.3).toFixed(3))) {
    //   item.errMsg = `预付款金额不可超过订单金额的30% (${(Number(item.order_tax_amount_contain_tax)  * 0.3).toFixed(3)})${item.contract_symbol}`;
    // } else {
    //   item.errMsg = '';
    // }
  }

  // 税金调整
  changeTax(item, type = 1) {
    // contract_tax_type 1. 含税, 2 是不含税
    if (item.contract_tax_type === 1) {
      item['tax_value'] = '';
    } else {
      const tax_value = item['tax_value'] ? parseFloat(item['tax_value']) : 0;
      let order_tax_amount_contain_tax = 0;
      if (item['tax_value_type'] === 1 || item['tax_value_type'] === 2) {
        order_tax_amount_contain_tax = parseFloat(item['order_tax_amount']) + parseFloat(item['order_tax_amount']) * tax_value;
        item['order_tax_amount_contain_tax'] = order_tax_amount_contain_tax.toFixed(2);
      } else if (item['tax_value_type'] === 3) {
        order_tax_amount_contain_tax = parseFloat(item['order_tax_amount']) + tax_value;
        item['order_tax_amount_contain_tax'] = order_tax_amount_contain_tax.toFixed(2);
      }
    }
    this.cd.markForCheck();
  }

  // 获取经办中心 和 部门
  getUserDept(value, data, index) {
    data['handling_department'] = '';
    data['handling_department_id'] = '';
    data['handling_center'] = '';
    data['handling_center_id'] = '';
    this.http.get('web/ajax-check/user-department', {params: {user_id: value} }).subscribe(results => {
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
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

      if (results['receiver']) {
        data['receiver'] = results['receiver']['receiver'];
        data['receiver_options'] = results['receiver']['receiver_options'];
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
      this.cd.markForCheck();
    }
  }

  // 我方主体
  orgIdChange (id, data) {

    if (id && data.vendor_site_list) {
      const category_obj = {};

      data.vendor_site_list
        .filter(item => item.org_id === id)
        .sort((a, b) => (a.is_default - b.is_default))
        .map(item => {
          return {
            category_id: item.category_id,
            category_name: item.category_name,
            is_default: item.is_default,
            vendor_site_state: item.vendor_site_state
          };
        })
        .map(item => {
          category_obj[item.category_id] = item;
          return item;
        });
      if (Object.keys(category_obj).length == 0) {
        this.isCategoryEmpty = true;
      } else {
        this.isCategoryEmpty = false;
      }
      data['category_list'] = Object.values(category_obj);

      const vendor_category = data['category_list'].sort((a, b) => (b.vendor_site_state - a.vendor_site_state))
                                                    .find(item => item.is_default === '1' );


      data.vendor_category_id = id && vendor_category && vendor_category.category_id ? vendor_category.category_id : null;
      this.categoryChange(data.vendor_category_id, data);

      if (id) {
        this.http.post('/web/order/check-order-company', {
          supplier_id: data.supplier_id,
          contract_id: data.contract_id,
          org_id: id,
        }).subscribe(result => {
          if (result['code'] === -1) {
            data.orgIdMsg = result['msg'];
          } else {
            data.orgIdMsg = '';
          }
          this.cd.markForCheck();
        })
      }
      this.cd.markForCheck();
    }
  }

  categoryChange (category_id, data) {
    data.account_list = data.vendor_site_list
      .filter(item => item.org_id === data.org_id && item.category_id === category_id )
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
    data.vendor_site_id = account_bank && account_bank.vendor_site_id ? account_bank.vendor_site_id : null;
    data.account_bank = data.vendor_site_id;
    this.cd.markForCheck();
  }


  addTaxValue ($event, field, data) {
    if ($event && data['tax_rate_value_option']) {
      data['tax_rate_value_option'] = data['tax_rate_value_option'].concat([{
        label: $event,
        value: $event
      }]);
      data['tax_value'] = $event;
    }
    this.cd.markForCheck();
  }

    trackByFn(index, item) {
      return item.id ? item.id : index; // or item.id
    }

  ngOnDestroy() {
    // 组件销毁时, 删除循环的列表
    this.onDestroy$.next(null);
    this.onDestroy$.complete();
  }
}

