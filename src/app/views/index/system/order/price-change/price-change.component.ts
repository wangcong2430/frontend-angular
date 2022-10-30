import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { formatDate } from '@angular/common';
import { UploadXHRArgs } from 'ng-zorro-antd';

import { MessageService } from '../../../../../services/message.service';
import { ThingDetailModalComponent } from '../../../../../containers/modal/thing-detail/thing-detail.component';
import { UploadService } from '../../../../../services/upload.service';
import { ModalService } from '../../../../../services/modal.service';
import { ShowImgModalComponent } from '../../../../../containers/modal/show-img/show-img.component';
import { LanguageService } from '../../../../../services/language.service';
import { NzMessageService } from 'ng-zorro-antd';
import { CosService } from '../../../../../services/cos.service';

@Component({
  templateUrl: './price-change.component.html',
  styleUrls: ['./price-change.component.css']
})

export class PriceChangeComponent implements OnInit {
  @ViewChild('nestedTable') nestedTable: ElementRef;

  @ViewChild(ThingDetailModalComponent)
  private thingDetailModal: ThingDetailModalComponent;
  @ViewChild(ShowImgModalComponent)
  private showImgModal: ShowImgModalComponent;

  dateFormat = 'yyyy-MM-dd';

  loading = true;
  listLoading = false;
  isSubmitLoading = false;
  /// 配置项
  columns = [];
  childrenColumns = [];
  disabledButton = true;
  cpAdOptions = [];
  cpAdNames = '';
  // 数据列表
  list = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  checkedNumber = 0;
  indeterminate = false;
  allChecked = false;
  isChildrenDisabled = true;
  expand = {};
  workloadUnitList = [];
  selctPriceModalData = {
    isShow: false,
    data: {}
  };
  breakdownPriceModalData = {
    isShow: false,
    data: {}
  };
  changePassModal = {
    isShow: false,
    title: '',
    changeData: []
  };
  categoryHasProduceGrade: {};
  uploadChangeData;
  msgHint = {
    key: '',
    isShow: false,
    isSubmitLoading: false,
    type: 1,
    msg: ''
  };
  isVisible = false; // 撤回弹出框
  endMakeVisible = false; // 撤回弹出框
  reason = ''; // 撤回原因
  endMakeReason = '';
  withdrawData; // 撤回数据
  cpadChange = {
    key: '',
    isShow: false,
    isSubmitLoading: false,
    type: 1,
    msg: '',
    newAdIds: []
  };
  isFill = false;
  fillForm = {
    quote_unit_price: null,
    quote_workload: null,
    quote_total_price: null,
    change_reason: '',
    change_memo: '',
    quote_complete_date: ''
  };

  // 提示语
  noItemSelect;
  plaseSelectObject;
  ITEM_NUMBER;
  CONFIGURE_PRODUCER;
  NO_DEADLINE_ADDED;
  NO_QUOTATION_GIVEN_CHANGE;
  NO_UNIT_CHOSEN;
  limitJPG = '';
  limit100M = '';
  limit10G = '';
  FileUploading = '';
  fileSuccess = '';
  fileFails = '';
  constructor(
    private modal: ModalService,
    private http: HttpClient,
    private message: NzMessageService,
    private uploadService: UploadService,
    private translate: TranslateService,
    private language: LanguageService,
    private cos: CosService
  ) {
    this.translate.use(this.language.language);

    this.translate.get('NO_ITEM_SELECTED').subscribe(result => {
      this.noItemSelect = result;
    });
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

    // 未添加承诺交付时间，
    this.translate.get('NO_DEADLINE_ADDED').subscribe(result => {
      this.NO_DEADLINE_ADDED = result;
    });

    // 未进行报价
    this.translate.get('NO_QUOTATION_GIVEN_CHANGE').subscribe(result => {
      this.NO_QUOTATION_GIVEN_CHANGE = result;
    });

    // 未选择单位
    this.translate.get('NO_UNIT_CHOSEN').subscribe(result => {
      this.NO_UNIT_CHOSEN = result;
    });

    this.translate.get('PLEASE_SELECT_OBJECT').subscribe(result => {
      this.plaseSelectObject = result;
    });

    this.translate.get('LIMIT_JPG').subscribe(result => {
      this.limitJPG = result;
    });

    this.translate.get('LIMIT_100M').subscribe(result => {
      this.limit100M = result;
    });

    this.translate.get('LIMIT_10G').subscribe(result => {
      this.limit10G = result;
    });

    this.translate.get('FILE_UPLOADING').subscribe(result => {
      this.FileUploading = result;
    });

    this.translate.get('FILE_SUCCESS').subscribe(result => {
      this.fileSuccess = result;
    });

    this.translate.get('FILE_FAILS').subscribe(result => {
      this.fileFails = result;
    });
  }

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/order/price-change-configs').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.childrenColumns  = result['childrenColumns'];
      this.workloadUnitList = result['workloadUnitList'];
      this.cpAdOptions      = result['cpAdOptions'] || [];
      this.cpAdNames        = result['cpAdNames'] || '';
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
    let params;
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
    };
    this.http.get('web/order/price-change-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.pagination.total_count = result['pager']['itemCount'];
      this.pagination.page_index  = result['pager']['page'];
      this.pagination.page_size   = result['pager']['pageSize'];
      this.list                   = result['list'] ? result['list'] : [];
      // this.cpAdNames
      if (this.list) {
        this.list.forEach(data => {
          this.expand[data.id] = true;
          if (data.children) {
            data.children.forEach(data2 => {
              if (this.cpAdNames && data2.cp_producer_text == '') {
                data2.cp_producer_text = this.cpAdNames;
              }
            });
          }
        });
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

  // 结束制作
  endMake() {
    let item;
    item = [];
    this.list.forEach(data => {
      if (data.children && data.children.length > 0) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            item.push(data2.id);
          }
        });
      }
    });
    if (item.length === 0) {
      this.message.error('未选择需要结束制作的物件');
      //this.message.error(this.NO_ITEM_SELECTED)
      return false;
    }

    if (!this.reason) {
      this.message.error('请选择结束制作的原因');
      return false;
    }
    if(this.reason == '供方原因' && !this.endMakeReason){
      this.message.error('请填写具体变更的原因');
      return false;
    }

    this.isSubmitLoading = true;
    this.http.post('web/order/end-make-option', {thing_quote_ids: item, reason: this.reason,endMakeReason:this.endMakeReason}).subscribe(results => {
      this.endMakeVisible = false;
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.reason = null;
      this.endMakeReason = null;
      this.message.success(results['msg']);
      this.getList();
      //this.menuService.getBacklog();
    });
  }

  // 查看报价信息
  selctPriceModal(item) {
    this.selctPriceModalData.isShow = true;
    this.selctPriceModalData.data = {
      list:  [],
      price:  '',
      sample_package_url:  '',
      sketch_map_url:  '',
    };

    if (item['quote_produce_breakdown']) {
      this.selctPriceModalData.data = {
        list:               JSON.parse(JSON.stringify(item['quote_produce_breakdown'])),
        price:              item['quote_total_price'],
        sample_package_url: item['sample_package_url'],
        sketch_map_url:     item['sketch_map_url'],
      };
    }
  }
  selctPriceModalCancel() {
    this.selctPriceModalData.isShow = false;
  }

  // 明细报价
  breakdownPriceModal(item, isEmpty, isDisabled) {
    this.breakdownPriceModalData.isShow = true;
    this.breakdownPriceModalData.data = {
      thing_id:  0,
      workload:  1,
      currency_symbol:'',
      unit_price:  0,
      total_price:  0,
      quote_total_price:  0,
      produce_breakdown_list:  [],
      isEmpty: false,
    };
    this.breakdownPriceModalData.data['quote_total_price']  = item['quote_total_price'] ? item['quote_total_price'] : 0;
    this.breakdownPriceModalData.data['currency_symbol']  = item['currency_symbol'] ? item['currency_symbol'] : '';
    console.log(this.breakdownPriceModalData);
    if (item['contract_groups']) {
      this.breakdownPriceModalData.data['thing_id']         = item['id'];

      let contract_groups;
      contract_groups = JSON.parse(JSON.stringify(item['contract_groups']));
      contract_groups.forEach(data => {
        // 获取工作单位
        if (data.workload_unit_list) {
          data.workload_unit_list.forEach(data2 => {
            let workload_unit_data;
            workload_unit_data = data['workload_unit_data'][data2['value']];
            // 价格提示
            workload_unit_data.tooltipTitle = '';
            if (parseFloat(workload_unit_data['price_upper']) > 0
              && parseFloat(workload_unit_data['price_upper'])
              !== parseFloat(workload_unit_data['price_lower'])) {
              workload_unit_data.tooltipTitle = parseFloat(workload_unit_data['price_lower'])
                + '~' + parseFloat(workload_unit_data['price_upper']);
            }
            data['workload_unit_data'][data2['value']] = workload_unit_data;
          });
        }
        this.breakdownPriceModalData.data['produce_breakdown_list'].push(data);
      });
    }
    if (item['quote_produce_breakdown_cache']) {
      this.breakdownPriceModalData.data['produce_breakdown_list'] = JSON.parse(JSON.stringify(item['quote_produce_breakdown_cache']));
      if (isEmpty) {
        this.breakdownPriceModalData.data['total_price'] = item['quote_total_price'];
        this.breakdownPriceModalData.data['isEmpty']     = true;
        if (!isDisabled) {
          // this.breakdownPriceModalEmpty();
        }
      } else {
        this.breakdownPriceModalData.data['workload']    = item['quote_workload'];
        this.breakdownPriceModalData.data['unit_price']  = item['quote_unit_price'];
        this.breakdownPriceModalData.data['total_price'] = item['quote_total_price'];
      }
    }
    this.calculateCountPriceModa();
    this.breakdownPriceModalData.data['isEmpty']         = isEmpty;
  }
  breakdownPriceModalCancel() {
    this.breakdownPriceModalData.isShow = false;
  }
  workloadUnitChange(item) {
    item.value              = 0;
    item.count_price        = 0;
    item.price              = item['workload_unit_data'][item['workload_unit_id']]['price'] || 0;
    item.workload_unit_name = item['workload_unit_data'][item['workload_unit_id']]['workload_unit_name'] || '';
    item.price_upper        = item['workload_unit_data'][item['workload_unit_id']]['price_upper'] || 0;
    item.price_lower        = item['workload_unit_data'][item['workload_unit_id']]['price_lower'] || 0;
    item.isPriceDisabled    = item['workload_unit_data'][item['workload_unit_id']]['isPriceDisabled'] || false;
    this.calculateCountPriceModa();
  }
  calculatePriceModa(item, key) {
    if (key == 'value') {
      if (item['value'] || item['value'] === 0) {
        if (item['price'] || item['price'] === 0) {
          item['count_price'] = (item['price'] * item['value']).toFixed(2);
        } else  if (item['count_price'] && item['value'] != 0) {
          item['value'] = (item['count_price'] / item['value']).toFixed(2);
        }
      }
    } else if (key == 'price') {
      if (item['price'] || item['price'] === 0) {
        if (item['value'] || item['value'] === 0) {
          item['count_price'] = (item['price'] * item['value']).toFixed(2);
        } else if (item['count_price'] &&  item['price'] != 0)  {
          item['value'] = (item['count_price'] / item['price']).toFixed(3);
        }
      }
    } else if (key == 'count_price') {
      if (item['count_price'] || item['count_price'] === 0) {
        if (item['count_price'] && item['price'] != 0) {
          item['value'] = (item['count_price'] / item['price']).toFixed(3);
        } else if (item['count_price'] && item['value'] != 0){
          item['price'] = (item['count_price'] / item['value']).toFixed(2);
        } else if (item['count_price'] === 0) {
          item['value'] = 0
        }
      }
    }

    this.calculateCountPriceModa();
  }
  calculateCountPriceModa() {
    let total = 0.00;
    this.breakdownPriceModalData.data['produce_breakdown_list'].forEach(data => {
      if (data.value && data.price && data.count_price) {
        total = total + parseFloat(data.count_price);
      }
    });
    this.breakdownPriceModalData.data['total_price'] = total.toFixed(2);
  }
  breakdownPriceModalEmpty() {
    this.breakdownPriceModalData.data['total_price'] = 0;
    this.breakdownPriceModalData.data['quote_total_price'] = 0;
    this.breakdownPriceModalData.data['produce_breakdown_list'].forEach(data => {
      if (data.value && data.price) {
        if (!data['workload_unit_data'][data['workload_unit_id']]['isPriceDisabled']) {
          data.price = '0';
        }
        data.value = '0';
        data.count_price = '0';
      }
    });
    if (this.breakdownPriceModalData.data['isEmpty']) {
      this.list.forEach(data => {
        data.children.forEach(thing => {
          if (thing['id'] === this.breakdownPriceModalData.data['thing_id']) {
            thing['is_disabled']       = false;
            thing['quote_workload']    = '';
            thing['quote_unit_price']  = '';
            thing['quote_total_price'] = '';
            thing['quote_produce_breakdown'] = [];
            thing['quote_produce_breakdown_cache'] = null;
          }
        });
      });
    }
  }
  breakdownPriceModalOk(isHint = false) {
    if (this.breakdownPriceModalData.data['thing_id']) {
      // 检查数据完整性
      let isError, isChange;
      isError = false;
      isChange = false;
      this.breakdownPriceModalData.data['produce_breakdown_list'].forEach(data => {
        if (data.value || data.price) {
          let value, price, price_upper;
          value = data.value ? parseFloat(data.value) : 0;
          price = data.price ? parseFloat(data.price) : 0;
          if (value >= 0 || price >= 0) {
            if (!isChange) {
              isChange = true;
            }
            if (value < 0 || value === '') {
              this.message.error(data.label + ' 数量不能为空');
              isError = true;
              return false;
            }
            if (price < 0 || value === '') {
              this.message.error(data.label + ' 单价不能为空');
              isError = true;
              return false;
            }
            if (!data['workload_unit_id'] || data['workload_unit_id'] === '') {
              this.message.error(data.label + ' 单位不能为空');
              isError = true;
              return false;
            }
            price_upper = data['workload_unit_data'][data['workload_unit_id']]['price_upper']
              ? parseFloat(data['workload_unit_data'][data['workload_unit_id']]['price_upper']) : 0;
            if (value !== 0 && price_upper !== 0 && data.price > price_upper) {
              this.message.error(data.label + ' 单价不能超过合同上限 ' + price_upper);
              isError = true;
              return false;
            }
          }
        }
      });
      if (isError) {
        return false;
      }
      // 明细总价必须大于0
      if (
        !isHint &&
        this.breakdownPriceModalData.data['quote_total_price'] !== '' &&
        parseFloat(this.breakdownPriceModalData.data['quote_total_price']) !== 0 &&
        parseFloat(this.breakdownPriceModalData.data['quote_total_price']) !==  parseFloat(this.breakdownPriceModalData.data['total_price'])
      ) {
        this.msgHint.isShow = true;
        this.msgHint.type   = 1;
        this.msgHint.msg    = '明细总价（' + this.breakdownPriceModalData.data['total_price']
          + '）不等于当前总价（' + this.breakdownPriceModalData.data['quote_total_price'] + '）, 是否替换当前总价';
        return false;
      }
      // 赋值
      this.list.forEach(data => {
        data.children.forEach(thing => {
          if (thing['id'] === this.breakdownPriceModalData.data['thing_id']) {
            // thing['quote_workload']    = '';
            // thing['quote_unit_price']  = '';
            // thing['quote_total_price'] = '';
            thing['quote_total_price'] = this.breakdownPriceModalData.data['total_price'];
            if (parseFloat(this.breakdownPriceModalData.data['total_price']) > 0) {
              // thing['quote_workload'] = 1;
              // thing['quote_unit_price'] = this.breakdownPriceModalData.data['total_price'];
              if (thing['quote_unit_price'] != 0) {
                thing['quote_workload'] = (Number(this.breakdownPriceModalData.data['total_price']) / (Number(thing['quote_unit_price']))).toFixed(3);
              } else if (thing['quote_workload'] != 0) {
                thing['quote_unit_price'] = (Number(this.breakdownPriceModalData.data['total_price']) / (Number(thing['quote_workload']))).toFixed(3);
              }
            } else if(parseFloat(this.breakdownPriceModalData.data['total_price']) === 0){
              thing['quote_workload'] = 0
            }
            thing['quote_produce_grade_id'] = this.breakdownPriceModalData.data['produce_grade_id'];
            thing['quote_produce_breakdown_cache'] = null;
            let quote_produce_breakdown;
            quote_produce_breakdown = [];
            if (this.breakdownPriceModalData.data['produce_breakdown_list']) {
              thing['quote_produce_breakdown_cache']
                = JSON.parse(JSON.stringify(this.breakdownPriceModalData.data['produce_breakdown_list']));
              this.breakdownPriceModalData.data['produce_breakdown_list'].forEach(data2 => {
                if (data2.count_price && parseFloat(data2.count_price) > 0) {
                  quote_produce_breakdown.push({
                    'label'               : data2.label,
                    'value'               : data2.value,
                    'price'               : data2.price,
                    'count_price'         : data2.count_price,
                    'id'                  : data2.produce_breakdown_id,
                    'produce_breakdown_id': data2.produce_breakdown_id,
                    'produce_grade_id'    : data2.produce_grade_id,
                    'workload_unit_id'    : data2.workload_unit_id,
                    'workload_unit_name'  : data2.workload_unit_name,
                    'price_upper'         : data2.price_upper || 0,
                    'price_lower'         : data2.price_lower || 0,
                    'isPriceDisabled'     : data2.isPriceDisabled,
                    'price_contract_library_id': data2['workload_unit_data'][data2.workload_unit_id]['id'],
                    'file_id'             : data2.file_id || '',
                    'remark'              : data2.remark || '',
                  });
                }
              });
            }
            thing['quote_produce_breakdown'] = JSON.parse(JSON.stringify(quote_produce_breakdown));
            if (this.breakdownPriceModalData.data['isEmpty']) {
              if (isChange) {
                thing['is_disabled'] = true;
              } else {
                thing['is_disabled'] = false;
              }
            }
          }
        });
      });
      this.breakdownPriceModalCancel();
    } else {
      this.message.error('报价信息有误，请关闭后重新报价。');
    }
  }
  msgHintModalOk() {
    if (this.msgHint.type === 1) {
      this.breakdownPriceModalOk(true);
      this.msgHintModalCancel();
    }
  }
  msgHintModalCancel() {
    this.msgHint.msg = '';
    this.msgHint.isShow = false;
  }

  // 通过按钮
  changePass(isSubmit) {
    let item, total, isError;
    item  = [];
    total = 0;
    this.changePassModal.changeData = [];

    this.list.forEach((data, orderIndex) => {
      let isChange;
      isChange = false;
      if ((data.checked || data.indeterminate) && data.children && data.children.length > 0) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            isChange = true;
            let errorTitle, isThingError;
            errorTitle = this.ITEM_NUMBER + data2['thing_code'];
            isThingError = false;
            total = total + parseFloat(data2.quote_total_price);
            if (data2.quote_complete_date.toString() === '') {
              isThingError = true;
              isError = true;
              errorTitle += '，' + this.NO_DEADLINE_ADDED;
            }
            if (data2['price_type'].toString() !== '1') {
              if ((data2['price_type'].toString() === '4' || data2['price_type'].toString() === '3')
                  && data2.quote_workload_unit_id.toString() === '') {
                isThingError = true;
                isError = true;
                errorTitle += ' ，' + this.NO_UNIT_CHOSEN;
              }
              if (data2.quote_total_price.toString() === '' || parseFloat(data2.quote_total_price) <= 0) {
                isThingError = true;
                isError = true;
                errorTitle += ' ,' + this.NO_QUOTATION_GIVEN_CHANGE;
              }
              if (data2.change_reason.toString() === '' || parseFloat(data2.change_reason) <= 0) {
                isThingError = true;
                isError = true;
                errorTitle += ' ，未选择变更原因';
              }
              if (data2.change_memo.toString() === '' || parseFloat(data2.change_memo) <= 0) {
                isThingError = true;
                isError = true;
                errorTitle += ' ，未输入变更详情';
              }
            }
            if (isThingError) {
              this.message.error(errorTitle);
              return false;
            }
            item.push({
              id: data2.id,
              quote_workload:          data2.quote_workload,
              quote_unit_price:        data2.quote_unit_price,
              quote_total_price:       data2.quote_total_price,
              quote_workload_unit_id:  data2.quote_workload_unit_id,
              quote_produce_breakdown: data2.quote_produce_breakdown,
              quote_complete_date:     data2.quote_complete_date,
              change_reason:           data2.change_reason,
              change_memo:             data2.change_memo,
            });

            this.changePassModal.changeData.push({
              order_code: data2.order_code,
              thing_code: data2.thing_code,
              thing_name: data2.thing_name,
              old_price: data2.total_price,
              new_price: data2.quote_total_price,
            });
          }
        });
      }
    });
    if (isError) {
      return false;
    }
    if (item.length === 0) {
      // this.message.error('未选择需要执行的物件');
      this.message.error(this.noItemSelect)
      return false;
    }
    if (!isSubmit) {
      this.changePassModal.isShow = true;
      this.changePassModal.title = '是否对选中物件进行物件变更？';
      return false;
    }
    this.isSubmitLoading = true;
    this.http.post('web/order/price-change-submit', {params: item}).subscribe(results => {
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.changePassModal.isShow = false;
      this.message.success(results['msg']);
      this.getList();
    });
  }

  // 变更制作人
  changeProducer(isSubmit = false) {
    this.cpadChange.newAdIds = [];
    this.cpadChange.isShow   = true;
  }

  // 点击结束制作
  clickEndMake() {
    this.endMakeVisible   = true;
    this.reason = null;
    this.endMakeReason = null;
  }

  cpadChangeModalCancel() {
    this.cpadChange.isShow = false;
  }
  cpadChangeModalOk() {
    let item, params, errorMsg;
    errorMsg = '';
    item  = [];

    this.list.forEach((data, orderIndex) => {
      data.children.forEach(data2 => {
        if (data2.checked) {
          if (!Array.isArray(this.cpadChange.newAdIds) || (Array.isArray(this.cpadChange.newAdIds)
            && this.cpadChange.newAdIds.length === 0)) {
            errorMsg += this.ITEM_NUMBER + data2.thing_code + ',' + this.CONFIGURE_PRODUCER;
          }
          item.push({
            id: data2.id,
            cp_producer_ids: this.cpadChange.newAdIds || []
          });
        }
      });
    });

    if (item.length === 0) {
      // this.message.error('请选择物件(Please select object)');
      this.message.error(this.plaseSelectObject);

      return;
    }
    if (errorMsg != '') {
      this.message.error(errorMsg);
      return;
    }
    params = {
      params: item
    };
    this.cpadChange.isSubmitLoading = true;
    this.http.post('web/order/producer-change-submit', params).subscribe(result => {
      this.cpadChange.isSubmitLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.cpadChange.isShow = false;
    });
  }

  // 获取点击事件
  getClickEvent(key, item, img = false) {
    if (img) {
      this.modal.open('photo', {
        url: img
      });
    } else {
      this.clickEvent({key: key, item: item});
    }
  }

  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.thingDetailModal.openModal(event.item);
    }

    if (event.key === 'can_withdraw') {
      this.isVisible = true;
      this.withdrawData = event.item;
    }
  }

  // 失去焦点事件
  blurEvent(event) {
    if (event.key === 'producer_name') {
    }
  }

  // 表格复选
  refreshStatus(notSet ?: boolean): void {
    let checkedNumber = 0;
    this.indeterminate = false;
    this.list.forEach(item => {
      if (item.children && item.children.length > 0) {
        if (notSet) {
          item.children.forEach(data => data.checked = item.checked);
        }
        if (item.children.length === item.children.filter(value => value.checked).length) {
          item.checked = true;
        } else {
          item.checked = false;
        }
        // 计算总金额
        if (item['children'].some(item => item.checked)) {
          item.content_order_amount =
            item['children'].filter(item => item.checked)
            .map(item => Number(item.total_price))
            .reduce((total, num) => Number(total) + Number(num)).toFixed(2) + ' ' + item['currency_symbol'];
        } else {
          item.content_order_amount = 0;
        }
        const allChecked2 = item.children.every(value => value.checked === true);
        const allUnChecked2 = item.children.every(value => !value.checked);
        item.indeterminate = (!allChecked2) && (!allUnChecked2);
        checkedNumber = checkedNumber + item.children.filter(value => value.checked).length;
      }
    });
    this.checkedNumber = checkedNumber;
    let flag = !(checkedNumber > 0);
    this.changeDisabledButton(flag);
    // this.disabledButton = !this.list.some(value => value.checked);
    this.isCheckAll();
  }

  refreshChildrenStatus(val, itemId) {
    this.refreshStatus(false);
  }

  isCheckAll() {
    const allChecked = this.list.every(value => value.checked === true);
    const allUnChecked = this.list.every(value => !value.checked);
    this.allChecked = allChecked;
    this.indeterminate = (!allChecked) && (!allUnChecked);
  }

  // 表格全选
  checkAll(value: boolean): void {
    this.list.forEach(data => data.checked = value);
    this.refreshStatus(true);
  }

  // 页码改变时
  pageIndexChange(page_index) {
    this.pagination.page_index = page_index;
    this.getTableList();
  }

  // 每页显示数改变时
  pageSizeChange(page_size) {
    this.pagination.page_size  = page_size;
    this.pagination.page_index = '1';
    this.getTableList();
  }

  // 显示展开按钮
  expandChange($event, data) {
    data.expand = !data['expand'];
    this.expand[data.id] = !$event;
  }

  // 获取数据列表
  getTableList() {
    this.getList();
  }

  getPrice(item, key, isdisabled ?: false) {
    // 锁定总价
    if (isdisabled) {
      if (key === 'quote_workload') {
        if (item['quote_workload'] || item['quote_workload'] === 0 ) {
          if (item['quote_total_price'] && item['quote_workload'] !== 0) {
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          } else {
            item['quote_unit_price'] = ''
          }
        }
      } else if (key === 'quote_unit_price') {
        if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
          if (item['quote_total_price'] && item['quote_unit_price'] !== 0){
            item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
          } else {
            item['quote_workload'] = ''
          }
        }
      } else if (key === 'quote_total_price') {
        if (item['quote_total_price'] === 0) {
          item['quote_workload'] = 0
        } else if (item['quote_unit_price'] !== 0 && item['quote_unit_price'] > 0) {
          item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
        } else if (item['quote_workload'] !== 0 && item['quote_workload'] > 0) {
          item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
        }
      }
    } else {
      if (key == 'quote_workload') {
        if (item['quote_workload'] || item['quote_workload'] === 0) {
          if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
            item['quote_total_price'] = (item['quote_unit_price'] * item['quote_workload']).toFixed(2);
          } else  if (item['quote_total_price'] && item['quote_workload'] != 0) {
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          }
        }
      } else if (key == 'quote_unit_price') {
        if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
          if (item['quote_workload'] || item['quote_workload'] === 0) {
            item['quote_total_price'] = (item['quote_unit_price'] * item['quote_workload']).toFixed(2);
          } else if (item['quote_total_price'] &&  item['quote_unit_price'] != 0)  {
            item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
          }
        }
      } else if (key == 'quote_total_price') {
        if (item['quote_total_price'] || item['quote_total_price'] === 0) {
          if (item['quote_total_price'] && item['quote_unit_price'] != 0) {
            item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
          } else if (item['quote_total_price'] && item['quote_workload'] != 0){
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          } else if (item['quote_total_price'] === 0) {
            item['quote_workload'] = 0
          }
        }
      }
    }

    // item['total_price'] = item['quote_total_price'];
    // 固定税率
    if (item['tax_type'] && (item['tax_type'] == 1 || item['tax_type'] == 2)) {
      if (item['quote_total_price'] !== '') {
        item['tax_price'] = (item['quote_total_price'] * Number(item['tax_value'])).toFixed(2);
      }
    }
  }

  getFillPrice(key) {
    let workload = null, unit_price = null, total_price = null;

    if (this.fillForm['quote_workload']) {
      workload = parseFloat(this.fillForm['quote_workload']);
    }
    if (this.fillForm['quote_unit_price']) {
      unit_price = parseFloat(this.fillForm['quote_unit_price']);
    }
    if (this.fillForm['quote_total_price']) {
      total_price = parseFloat(this.fillForm['quote_total_price']);
    }

    // if (key === 'quote_workload' && workload !== '') {
    //   if (unit_price !== '' && workload > 0) {
    //     total_price = (unit_price * workload).toFixed(2);
    //   } else if (total_price !== '') {
    //     unit_price = (total_price / workload).toFixed(2);
    //   }
    // } else if (key === 'quote_unit_price' && unit_price !== '') {
    //   if (workload !== '' && unit_price > 0) {
    //     total_price = (unit_price * workload).toFixed(2);
    //   } else if (total_price !== '') {
    //     workload = (total_price / unit_price).toFixed(3);
    //   }
    // } else if (key === 'quote_total_price' && unit_price !== '') {
    //   if (unit_price !== '' && unit_price > 0) {
    //     workload = (total_price / unit_price).toFixed(3);
    //   } else if (workload !== '' && workload > 0) {
    //     unit_price = (total_price / workload).toFixed(2);
    //   }
    // }

    if (key === 'quote_workload') {
      if (workload) {
        if (unit_price) {
          total_price = (unit_price * workload).toFixed(2);
        } else  if (total_price) {
          unit_price = (total_price / workload).toFixed(2);
        }
      } else if (workload === 0) {
        total_price = 0;
      } else if (workload === null) {
        total_price = null;
      }
    } else if (key === 'quote_unit_price') {
      if (unit_price) {
        if (workload) {
          total_price = (unit_price * workload).toFixed(2);
        } else if (total_price)  {
          workload = (total_price / unit_price).toFixed(3);
        }
      } else if (unit_price === 0) {
        total_price = 0;
      } else if (unit_price === null) {
        total_price = null;
      }
    } else if (key === 'quote_total_price') {
      if (total_price) {
        if (unit_price) {
          workload = (total_price / unit_price).toFixed(3);
        } else if (workload) {
          unit_price = (total_price / workload).toFixed(2);
        }
      } else if (total_price === 0) {
        workload = 0;
      }
    }

    this.fillForm['quote_workload']    = workload;
    this.fillForm['quote_unit_price']  = unit_price;
    this.fillForm['quote_total_price'] = total_price;
  }
  fillAll() {

    if (this.fillForm['quote_workload'] === 0
      || this.fillForm['quote_unit_price'] === 0
      || this.fillForm['quote_total_price'] === 0 ) {
        this.message.error('单价、数量、总价不可填写0');
        return;
    }

    if (this.fillForm['quote_workload'] && this.fillForm['quote_unit_price'] === null && this.fillForm['quote_unit_price'] === null) {
      this.message.error('请填写单价和总价');
      return;
    }

    if (this.fillForm['quote_unit_price'] && this.fillForm['quote_workload'] === null && this.fillForm['quote_total_price'] === null) {
      this.message.error('请填写数量和总价');
      return;
    }

    if (this.fillForm['quote_total_price'] && this.fillForm['quote_unit_price'] === null && this.fillForm['quote_workload'] === null) {
      this.message.error('请填写单价和数量');
      return;
    }

    if (this.fillForm['quote_workload'] && this.fillForm['quote_unit_price']  && !this.fillForm['quote_unit_price']) {
      this.message.error('请填写单价');
      return;
    }

    if (this.fillForm['quote_unit_price'] && !this.fillForm['quote_workload'] && this.fillForm['quote_total_price']) {
      this.message.error('请填写数量');
      return;
    }

    if (!this.fillForm['quote_total_price']  && this.fillForm['quote_unit_price'] && this.fillForm['quote_workload']) {
      this.message.error('请填写总价');
      return;
    }

    if (this.fillForm['quote_workload'] && this.fillForm['quote_unit_price'] && this.fillForm['quote_total_price'] || (
      !this.fillForm['quote_workload'] && !this.fillForm['quote_unit_price'] && !this.fillForm['quote_total_price']
    )) {
      this.list.forEach(item => {
        item.children.forEach(data => {
          if (data.checked) {
            data['change_reason']  = this.fillForm['change_reason'] || data['change_reason'];
            data['change_memo'] = this.fillForm['change_memo'] || data['change_memo'];
            data['quote_complete_date'] = this.fillForm['quote_complete_date'] || data['quote_complete_date'];

            if (!data['is_disabled'] && (data.price_type == 4 || data.price_type == 3)) {
              if (this.fillForm['quote_workload']) {
                data['quote_workload'] = this.fillForm['quote_workload'];
              }

              if ( this.fillForm['quote_unit_price']) {
                data['quote_unit_price']  = this.fillForm['quote_unit_price'];
              }

              if (this.fillForm['quote_total_price']) {
                data['quote_total_price']  = this.fillForm['quote_total_price'];
                data['total_price']       = data['quote_total_price'];
              }
            }
          }
        });
      });
      this.isFill = false;
      this.fillForm = {
        quote_unit_price: '',
        quote_workload: '',
        quote_total_price: '',
        change_reason: '',
        change_memo: '',
        quote_complete_date: ''
      };
      this.refreshStatus(false);
    } else {
      this.message.error('请填写完整的价格数据');
    }

  }

  changePicker(value, data) {
    data['isChangePicker'] = data['committed_delivery_date'] !== formatDate(value, this.dateFormat, 'zh-Hans');
  }

  // 分片上传
  customBigReq = (item: UploadXHRArgs) => {
    this.uploadService.uploadBig(item, 1200, data => {
      this.uploadChangeData['file_id'] = data['id'];
    });
  }

  customReqs = (item: UploadXHRArgs) => {
    const messageId = this.message.loading('文件正在上传中...', {nzDuration: 0}).messageId;
    return this.cos.uploadFile(item).subscribe(
      (event) => {
        // 处理成功
        this.message.remove(messageId);
        this.message.success(this.fileSuccess);
        item.onSuccess(event, item.file, event);
      }, err => {
        // 处理失败
        this.message.remove(messageId);
        this.message.error(this.fileFails);
        item.onError(err, item.file);
      }
    );
  }

  preview (url, name = null) {
    this.modal.open('photo', {
      title: name,
      url: url
    });
  }

  uploadChange($event, data) {
    if ($event.type === 'success') {
      data.file_id = $event.file.originFileObj.file_id;
    }
  }

  // 撤回
  withdraw() {
    this.isVisible = false;
    this.http.post('web/order/price-change-withdraw', {
      order_id: [this.withdrawData.order_id],
      reason: this.reason
    }).subscribe(result => {
      this.reason = '';
      if (result['code'] == 0) {
        this.message.success(result['msg']);
        this.getList();
      } else {
        this.message.error(result['msg']);
      }
    });
  }

  moveX = null

  dragstart($event) {
    this.moveX = null
  }

  dragmove($event) {
    if (this.moveX) {
      this.nestedTable['tableBodyElement'].nativeElement.scrollLeft -= ($event.pointerPosition.x - this.moveX)
      this.moveX = $event.pointerPosition.x
    } else {
      this.moveX = $event.pointerPosition.x
    }
  }


  trackByFn(index, item) {
    return item && item.id ? item.id : index;
  }
}
