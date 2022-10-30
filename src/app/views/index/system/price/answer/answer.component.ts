import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { UploadXHRArgs, NzModalService } from 'ng-zorro-antd';

import { MessageService } from '../../../../../services/message.service';
import { ThingDetailModalComponent } from '../../../../../containers/modal/thing-detail/thing-detail.component';
import { MenuService } from '../../../../../services/menu.service';
import { UploadService } from '../../../../../services/upload.service';
import { ModalService } from '../../../../../services/modal.service';
import { LanguageService } from '../../../../../services/language.service';
import { NzMessageService } from 'ng-zorro-antd';
import { CosService } from '../../../../../services/cos.service';
import { isArray } from 'ngx-bootstrap';

@Component({
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.css']
})

export class AnswerComponent implements OnInit {
  @ViewChild('nestedTable') nestedTable: ElementRef;
  @ViewChild(ThingDetailModalComponent)
  private thingDetailModal: ThingDetailModalComponent;
  dateFormat = 'yyyy-MM-dd';
  // loading
  loading = true;
  listLoading = false;
  isSubmitLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  disabledButton = true;
  // 数据列表
  list = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: 20,
    page_index: 1,
  };
  checkedNumber = 0;
  indeterminate = false;
  allChecked = false;
  isChildrenDisabled = true;
  expand = {};
  workloadUnitList = [];
  selctPriceModalData = {
    produce_breakdown_price_list: [],
    isShow: false,
    data: {}
  };
  breakdownPriceModalData = {
    isShow: false,
    is_show_pre_workload: '1',
    data: {}
  };
  changePassModal = {
    isShow: false,
    title: '',
    loading: false
  };
  msgHint = {
    key: '',
    isShow: false,
    isSubmitLoading: false,
    type: 1,
    msg: ''
  };
  demand = {
    type: 0,//需求子类
    price: 0 //代理费
  };
  uploadChangeData;
  categoryHasProduceGrade: {};
  // 测试单/正式单 默认是正式单
  is_test = '0';
  crumbTitle = '';
  isVisible = false;
  reason = '';
  currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'zh-Hans');
  isFill = false;
  fillForm = {
    quote_unit_price: null,
    quote_workload: null,
    quote_total_price: null,
    quote_complete_date: '',
    quote_remark: '',
    not_pass_percent: '0.00',
    agency_fees: '0.00'
  };
  currency_symbol = '';

  // 提示语
  NO_ITEM_SELECTED;
  ITEM_NUMBER;
  NO_DEADLINE_ADDED;
  NO_QUOTATION_GIVEN;
  NO_UNIT_CHOSEN;
  DETAILS_CANT_BE_EMPTY;
  UPLOAD_QUOTATION_TEMPLATE;
  limitJPG = '';
  limit100M = '';
  limit10G = '';
  FileUploading = '';
  fileSuccess = '';
  fileFails = '';
  DownloadVideoQuoteTemplateData = {
    contractUploadFileId: '',
    contractUniversalUploadFileId: ''
  };
  DownloadVideoQuoteTemplateIsShow = false;

  constructor(
    private route: ActivatedRoute,
    private modal: ModalService,
    private http: HttpClient,
    private modalService: NzModalService,
    private message: NzMessageService,
    private menuService: MenuService,
    private uploadService: UploadService,
    private translate: TranslateService,
    private language: LanguageService,
    private cos: CosService
  ) {
    this.translate.use(this.language.language)

    // 未选择需要执行的物件
    this.translate.get('NO_ITEM_SELECTED').subscribe(result => {
      this.NO_ITEM_SELECTED = result;
    });

    // 物件单号
    this.translate.get('ITEM_NUMBER').subscribe(result => {
      this.ITEM_NUMBER = result;
    });

    // 未添加承诺交付时间，
    this.translate.get('NO_DEADLINE_ADDED').subscribe(result => {
      this.NO_DEADLINE_ADDED = result;
    });

    //
    this.translate.get('NO_UNIT_CHOSEN').subscribe(result => {
      this.NO_UNIT_CHOSEN = result;
    });

    // 明细报价内容不能为空
    this.translate.get('DETAILS_CANT_BE_EMPTY').subscribe(result => {
      this.DETAILS_CANT_BE_EMPTY = result;
    });

    // 未进行报价
    this.translate.get('NO_QUOTATION_GIVEN').subscribe(result => {
      this.NO_QUOTATION_GIVEN = result;
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
    this.translate.get('UPLOAD_QUOTATION_TEMPLATE').subscribe(result => {
      this.UPLOAD_QUOTATION_TEMPLATE = result;
    });
  }

  ngOnInit() {
    // 获取页面配置
    this.route.url.subscribe(urls => {

      if (urls[0].path == 'answer') {
        this.is_test = '0';
        this.translate.get('DEADLINE_TIP').subscribe(res => {
          this.crumbTitle = '(' + res + ')';
        });
      } else {
        this.is_test = '1';
        // this.crumbTitle = '(以下物件为测试单，请阅读测试规则后进行报价; 不通过结算比例：若不通过测试，则按此比例结算 请留意报价截止日期，若逾期将视为放弃报价)'
        this.translate.get('TEST_TIP').subscribe(res => {
          this.crumbTitle = '(' + res + ')';
        });
      }
      this.getConfig();
    });
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/price/quotation-configs?is_test=' + this.is_test).subscribe(result => {
      this.loading = false;
      this.columns = result['columns'];
      this.childrenColumns = result['childrenColumns'];
      this.workloadUnitList = result['workloadUnitList'];
      // 获取列表
      this.getList();
    });
  }

  formatterPercent = (value: number) => `${value} %`;
  parserPercent = (value: string) => value.replace(' %', '');
  formatterDollar = (value: number) => `$ ${value}`;
  parserDollar = (value: string) => value.replace('$ ', '');
  formatterAgencyFees = (value: number) => {
    if (value == null || value == undefined) return `0.00 %`;
    return `${value} %`;
  }
  parserAgencyFees = (value: string) => value.replace(' %', '');

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;

    if (pagination) {
      this.pagination = pagination;
    }

    this.http.get('web/price/quotation-list', {
      params: {
        page_index: this.pagination.page_index + '',
        page_size: this.pagination.page_size + '',
        is_test: this.is_test
      }
    }).subscribe(result => {
      this.listLoading = false;
      if (result['code'] === 0) {
        this.list = result['list'];

        if (this.list) {
          this.list.forEach(data => {
            this.expand[data.id] = true;
          });
          this.showStoryPrice();
        }

        if (result['pager']) {
          this.pagination.total_count = result['pager']['itemCount'];
          this.pagination.page_index = result['pager']['page'];
        }
        this.changeDisabledButton(true);

        if (result['categoryHasProduceGrade']) {
          this.categoryHasProduceGrade = {};
          result['categoryHasProduceGrade'].forEach(data2 => {
            this.categoryHasProduceGrade[data2['category_id']] = data2['children'];
          });
        }
      } else {
        this.message.error(result['msg']);
      }

    }, err => {
      this.listLoading = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 通过按钮
  changePass(isSubmit) {
    let item, total, isError;
    item = [];
    total = 0;

    this.list.forEach(data => {
      if (data.children && data.children.length > 0) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            let errorTitle, isThingError;
            errorTitle = this.ITEM_NUMBER + data2['thing_code'];
            isThingError = false;
            total = total + parseFloat(data2.quote_total_price);
            if (data2.quote_complete_date.toString() === '') {
              isThingError = true;
              isError = true;
              errorTitle += ',' + this.NO_DEADLINE_ADDED;
            }
            if (data2['price_type'].toString() !== '1') {
              if ((data2['price_type'].toString() === '4' || data2['price_type'].toString() === '3')
                && data2.quote_workload_unit_id.toString() === '') {
                isThingError = true;
                isError = true;
                errorTitle += ',' + this.NO_UNIT_CHOSEN;
              }
              if (data2['price_type'].toString() === '3' && data2.quote_produce_breakdown.length === 0) {
                isThingError = true;
                isError = true;
                errorTitle += ',' + this.DETAILS_CANT_BE_EMPTY;
              }
              if (data2.quote_total_price.toString() === '' || parseFloat(data2.quote_total_price) <= 0) {
                isThingError = true;
                isError = true;
                errorTitle += ',' + this.NO_QUOTATION_GIVEN;
              }
              if (this.is_test == '1' && (data2.not_pass_percent.toString() === '' || parseFloat(data2.not_pass_percent) < 0)) {
                isThingError = true;
                isError = true;
                errorTitle += ' ，未填写"不通过结算比例"  ';
              }
              if (data2['must_upload_price_template'] === 1 && data2['file_id'] <= 0) {
                isThingError = true;
                isError = true;
                errorTitle += ',' + this.UPLOAD_QUOTATION_TEMPLATE;
              }
            }
            if (isThingError) {
              this.message.error(errorTitle);
              return false;
            }
            item.push({
              id: data2.id,
              thing_quote_id: data2.thing_quote_id,
              quote_workload: data2.quote_workload,
              quote_unit_price: data2.quote_unit_price,
              quote_total_price: data2.quote_total_price,
              quote_workload_unit_id: data2.quote_workload_unit_id,
              quote_produce_breakdown: data2.quote_produce_breakdown,
              quote_remark: data2.quote_remark,
              quote_complete_date: data2.quote_complete_date,
              not_pass_percent: data2.not_pass_percent,
              is_test: data2.is_test,
              file_id: data2.file_id?data2.file_id:'0',
              agency_fees: data2.agency_fees,
              isSeparatContract: data2.isSeparatContract?data2.isSeparatContract:'',
              thing_is_separate:data2.thing_is_separate?data2.thing_is_separate:''
            });
          }
        });
      }
    });


    if (isError) {
      return false;
    }

    if (item.length === 0) {
      this.message.error(this.NO_ITEM_SELECTED);
      return false;
    }

    if (!isSubmit) {
      this.changePassModal.loading = false;
      this.changePassModal.isShow = true;
      this.changePassModal.title = '是否对选中物件进行报价？';
      return false;
    }
    this.changePassModal.loading = true;
    this.http.post('web/price/quotation-submit', { params: item }).subscribe(results => {
      this.changePassModal.loading = false;
      if (results['code'] === 0) {
        this.changePassModal.isShow = false;
        this.message.success(results['msg']);
        this.getList();
        this.menuService.getBacklog();
      } else {
        this.message.error(results['msg']);
      }
    }, err => {
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 驳回按钮
  changeReject() {
    let item;
    item = [];
    this.list.forEach(data => {
      if (data.children && data.children.length > 0) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            item.push(data2.thing_quote_id);
          }
        });
      }
    });
    if (item.length === 0) {
      // this.message.error('未选择需要执行的物件');
      this.message.error(this.NO_ITEM_SELECTED)
      return false;
    }

    if (!this.reason) {
      this.message.error('请填写放弃报价的原因');
      return false;
    }

    this.isSubmitLoading = true;
    this.http.post('web/price/quotation-reject', { thing_quote_ids: item, reason: this.reason }).subscribe(results => {
      this.isVisible = false;
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.getList();
      this.menuService.getBacklog();
    });
  }

  // 查看报价信息
  selctPriceModal(item) {
    this.selctPriceModalData.isShow = true;
    this.selctPriceModalData.produce_breakdown_price_list = []
    this.selctPriceModalData.data = {
      list: [],
      price: '',
      sample_package_url: '',
      sketch_map_url: '',
    };

    if (item['quote_produce_breakdown']) {
      this.selctPriceModalData.data = {
        list: JSON.parse(JSON.stringify(item['quote_produce_breakdown'])),
        price: item['quote_total_price'],
        sample_package_url: item['sample_package_url'],
        sketch_map_url: item['sketch_map_url'],
      };
    }
  }
  selctPriceModalCancel() {
    this.selctPriceModalData.isShow = false;
  }

  // 明细报价
  breakdownPriceModal(item, isEmpty, isDisabled) {
    console.log(item)
    this.breakdownPriceModalData.isShow = true;
    this.currency_symbol = item.currency_symbol ? item.currency_symbol : '';
    this.breakdownPriceModalData.data = {
      thing_id: 0,
      workload: 1,
      unit_price: 0,
      total_price: 0,
      quote_total_price: 0,
      produce_breakdown_price_list: [],
      produce_breakdown_list: [],
      isEmpty: false,
      isSeparatContract: item.isSeparatContract ? item.isSeparatContract : '0',
      thing_is_separate:item.thing_is_separate?item.thing_is_separate:'0',
      first_category_id:item?item.first_category_id:''
    };
    this.breakdownPriceModalData.is_show_pre_workload = item.is_show_pre_workload,
      //console.log(item)
    this.demand = {
      type: item['demand_type'],
      price: item['agency_fees']
    }

    this.breakdownPriceModalData.data['quote_total_price'] = item['quote_total_price'] ? item['quote_total_price'] : 0;
    if (item['contract_groups']) {
      this.breakdownPriceModalData.data['thing_id'] = item['id'];

      let contract_groups;
      contract_groups = JSON.parse(JSON.stringify(item['contract_groups']));
      contract_groups.forEach(data => {
        //data.fileList=[]
        // 获取工作单位
        if (data.workload_unit_list) {
          data.workload_unit_list.forEach(data2 => {
            let workload_unit_data;
            workload_unit_data = data['workload_unit_data'][data2['value']];
            data['workload_unit_data'][data2['value']] = workload_unit_data;
          });
        }
        data.require_attachmentPlus=data.require_attachment
        this.breakdownPriceModalData.data['produce_breakdown_list'].push(data);        
        //console.log(this.breakdownPriceModalData.data['produce_breakdown_list'])
      });
    }
    if (item['quote_produce_breakdown_cache']) {
      this.breakdownPriceModalData.data['produce_breakdown_list'] = JSON.parse(JSON.stringify(item['quote_produce_breakdown_cache']));
      if (isEmpty) {
        this.breakdownPriceModalData.data['total_price'] = item['quote_total_price'];
        this.breakdownPriceModalData.data['isEmpty'] = true;
        if (!isDisabled) {
          this.breakdownPriceModalEmpty();
        }
      } else {
        this.breakdownPriceModalData.data['workload'] = item['quote_workload'];
        this.breakdownPriceModalData.data['unit_price'] = item['quote_unit_price'];
        this.breakdownPriceModalData.data['total_price'] = item['quote_total_price'];
      }
    }
    this.breakdownPriceModalData.data['isEmpty'] = isEmpty;
    this.calculateCountPriceModa();


    // produce_breakdown_id

    this.http.get('web/price/get-price-library?thing_id=' + item.id).subscribe(results => {
      if (results['code'] === 0) {
        this.selctPriceModalData.produce_breakdown_price_list = results['data']
      } else {
        this.message.error(results['msg']);
      }
    }, err => {
      this.message.error(err['msg']);
    });
  }

  breakdownPriceModalCancel() {
    this.breakdownPriceModalData.isShow = false;
  }

  DownloadVideoQuoteTemplate(item) {
    if (item['contract_upload_file_id'] && item['contract_upload_file_id'] != '') {
      //this.contractUploadFileId = item['contract_upload_file_id'];
      this.DownloadVideoQuoteTemplateData.contractUploadFileId = item['contract_upload_file_id'];
      this.DownloadVideoQuoteTemplateIsShow = true;
    }
    if (item['contract_universal_upload_file_id'] && item['contract_universal_upload_file_id'] != '') {
      //this.contractUniversalUploadFileId = item['contract_universal_upload_file_id'];
      this.DownloadVideoQuoteTemplateData.contractUniversalUploadFileId = item['contract_universal_upload_file_id'];
      this.DownloadVideoQuoteTemplateIsShow = true;
    }
  }
  DownloadVideoQuoteTemplateCancel() {
    this.DownloadVideoQuoteTemplateIsShow = false;
  }
  workloadUnitChange(item) {
    // item.value              = 0;
    item.count_price = 0;

    console.log(item)
    item.price = item['workload_unit_data'][item['workload_unit_id']]['price'] || 0;
    item.workload_unit_name = item['workload_unit_data'][item['workload_unit_id']]['workload_unit_name'] || '';
    item.price_upper = item['workload_unit_data'][item['workload_unit_id']]['price_upper'] || 0;
    item.price_lower = item['workload_unit_data'][item['workload_unit_id']]['price_lower'] || 0;
    item.isPriceDisabled = item['workload_unit_data'][item['workload_unit_id']]['isPriceDisabled'] || false;
    item.disabled = item['workload_unit_data'][item['workload_unit_id']]['isPriceDisabled'] || false;


    // 固定价
    if (this.selctPriceModalData.produce_breakdown_price_list.some(item => item.produce_breakdown_id == item.produce_breakdown_id)) {

      const produce_breakdown_price_list = this.selctPriceModalData.produce_breakdown_price_list.find(i => i.produce_breakdown_id === item.produce_breakdown_id)
      const workload_unit = produce_breakdown_price_list.list.find(i => i.value == item.workload_unit_id)

      console.log(workload_unit)
      let default_value = item.workload_unit_data[item.workload_unit_id]['unit_price']
      if (workload_unit && default_value) {
        item.price = default_value
        item.disabled = true
      }
    }


    this.calculateCountPriceModa();
    this.calculatePriceModa(item, 'price');
  }

  calculatePriceModa(item, key) {
    if (key === 'value') {
      if (item['value'] || item['value'] === 0) {
        if (item['price'] || item['price'] === 0) {
          item['count_price'] = (item['price'] * item['value']).toFixed(2);
        } else if (item['count_price'] && item['value'] != 0) {
          item['value'] = (item['count_price'] / item['value']).toFixed(2);
        }
      }
    } else if (key === 'price') {
      if (item['price'] || item['price'] === 0) {
        if (item['value'] || item['value'] === 0) {
          item['count_price'] = (item['price'] * item['value']).toFixed(2);
        } else if (item['count_price'] && item['price'] != 0) {
          item['value'] = (item['count_price'] / item['price']).toFixed(3);
        }
      }
    } else if (key === 'count_price') {
      if (item['count_price'] || item['count_price'] === 0) {
        if (item['count_price'] && item['price'] != 0) {
          item['value'] = (item['count_price'] / item['price']).toFixed(3);
        } else if (item['count_price'] && item['value'] != 0) {
          item['price'] = (item['count_price'] / item['value']).toFixed(2);
        } else if (item['count_price'] === 0) {
          item['value'] = 0;
        }
      }
    } else if (key === "agency_fees") {
      item['agency_fees'] = (item['price']).toFixed(2);
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
    this.breakdownPriceModalData.data['agency_fees'] = this.demand.price;
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
            thing['is_disabled'] = false;
            thing['quote_workload'] = '';
            thing['quote_unit_price'] = '';
            thing['quote_total_price'] = '';
            thing['quote_produce_breakdown'] = [];
            thing['quote_produce_breakdown_cache'] = null;
          }
        });
      });
    }
    this.showStoryPrice();
  }
  isSeparatContract(event) {
    //console.log(event)
    this.breakdownPriceModalData.data['isSeparatContract'] = event
    this.breakdownPriceModalData.data['thing_is_separate'] = event
  }
  //删除上传的文件
  confirm(file_id){
       //console.log(file_id,require_attachment)
       //file_id=null;
       //require_attachment=1;
       //console.log(this.breakdownPriceModalData.data['produce_breakdown_list'])
        this.breakdownPriceModalData.data['produce_breakdown_list']=this.breakdownPriceModalData.data['produce_breakdown_list'].map((item)=>{
          if(isArray(item.fileLists)){
            item.fileLists=item.fileLists.filter((idm)=>{
              return idm.file_id!=file_id
            })
            if(item.fileLists.length==0){
              //console.log(item.fileLists)
              item.require_attachment=item.require_attachmentPlus
            }
          }                    
           return item
       })
       console.log(this.breakdownPriceModalData.data['produce_breakdown_list'])

  }
  breakdownPriceModalOk(isHint = false) {
    //console.log(this.breakdownPriceModalData.data['produce_breakdown_list'])
    if (this.breakdownPriceModalData.data['thing_id']) {
      // 检查数据完整性
      let isError, isChange;
      isError = false;
      isChange = false;
      //console.log(this.breakdownPriceModalData.data)
      if (!this.breakdownPriceModalData.data['isSeparatContract']) {
        this.message.error('请选择是否分包');
        isError = true;
        return false
      }
      this.breakdownPriceModalData.data['produce_breakdown_list'].forEach(data => {
        //console.log(data)
        if(isArray(data.fileLists)){
          if(data.require_attachment==1&&data.fileLists.length==0){
            this.message.error(data.label + '未上传附件');
            isError = true;
            return false;
          }
        }
        if(data.require_attachment==1&&!data.fileLists){
          this.message.error(data.label + '未上传附件');
          isError = true;
          return false;
        }
        if(!data.remark&&data.require_desc==1){
          this.message.error(data.label + '未填写备注');
          isError = true;
          return false;
        }
        if (data.value || data.price) {
          let value, price, price_upper;
          value = data.value ? parseFloat(data.value) : 0;
          price = data.price ? parseFloat(data.price) : 0;
          if (value > 0 || price > 0) {            
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
            if (data.remark && data.remark.length > 0 && data.remark.length > 200) {
              this.message.error(data.label + ' 备注信息不能超过200个字符');
              isError = true;
              return false;
            }
            if (price > 0 && value > 0 && data.label === '其他' && (!data.remark || data.remark.length === 0)) {
              this.message.error(data.label + ' 明细需要填写备注信息');
              isError = true;
              return false;
            }
            if (price > 0 && value > 0 && data.label === '其他' && data.require_attachment==1) {
              this.message.error(data.label + '未上传附件');
              isError = true;
              return false;
            }
            price_upper = data['workload_unit_data'][data['workload_unit_id']]['price_upper']
              ? parseFloat(data['workload_unit_data'][data['workload_unit_id']]['price_upper']) : 0;
            if (value !== 0 && price_upper !== 0 && data.price > price_upper) {
              this.message.error(data.label + ' 单价不能超过合同上限' + price_upper);
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
        parseFloat(this.breakdownPriceModalData.data['quote_total_price']) !== parseFloat(this.breakdownPriceModalData.data['total_price'])
      ) {
        this.msgHint.isShow = true;
        this.msgHint.type = 1;
        this.msgHint.msg = '明细总价（' + this.breakdownPriceModalData.data['total_price']
          + '）不等于当前总价（' + this.breakdownPriceModalData.data['quote_total_price'] + '）, 是否替换当前总价';
        return false;
      }
      // 赋值
      this.list.forEach(data => {
        //console.log(data)
        data.children.forEach(thing => {
          if (thing['id'] === this.breakdownPriceModalData.data['thing_id']) {
            // thing['quote_workload']    = '';
            // thing['quote_unit_price']  = '';
            // thing['quote_total_price'] = '';
            thing['isSeparatContract'] = this.breakdownPriceModalData.data['isSeparatContract']
            thing['thing_is_separate'] = this.breakdownPriceModalData.data['thing_is_separate']
            thing['quote_total_price'] = this.breakdownPriceModalData.data['total_price'];
            thing['agency_fees'] = this.breakdownPriceModalData.data['agency_fees'];
            if (parseFloat(this.breakdownPriceModalData.data['total_price']) > 0 && thing['quote_unit_price']) {
              // thing['quote_workload'] = 1;
              // thing['quote_unit_price'] = this.breakdownPriceModalData.data['total_price'];
              if (thing['quote_unit_price'] != 0) {
                thing['quote_workload'] =
                  (Number(this.breakdownPriceModalData.data['total_price']) / (Number(thing['quote_unit_price']))).toFixed(3);
              } else if (thing['quote_workload'] != 0) {
                thing['quote_unit_price'] =
                  (Number(this.breakdownPriceModalData.data['total_price']) / (Number(thing['quote_workload']))).toFixed(3);
              }
            } else if (parseFloat(this.breakdownPriceModalData.data['total_price']) === 0) {
              thing['quote_total_price'] = 0;
              thing['quote_workload'] = 0;
            }
            thing['quote_produce_grade_id'] = this.breakdownPriceModalData.data['produce_grade_id'];
            thing['quote_produce_breakdown_cache'] = null;
            let quote_produce_breakdown;
            quote_produce_breakdown = [];
            if (this.breakdownPriceModalData.data['produce_breakdown_list']) {
              thing['quote_produce_breakdown_cache'] =
                JSON.parse(JSON.stringify(this.breakdownPriceModalData.data['produce_breakdown_list']));
              this.breakdownPriceModalData.data['produce_breakdown_list'].forEach(data2 => {
                if (data2.count_price && parseFloat(data2.count_price) > 0) {
                  var file_ids=null
                  if (data2.fileLists&&data2.fileLists.length>0) {
                    for (let index = 0; index < data2.fileLists.length; index++) {
                      file_ids=file_ids+data2.fileLists[index].file_id+','        
                    }
                    file_ids=file_ids.slice(0,file_ids.length-1)
                  }
                 
                  quote_produce_breakdown.push({
                    'label': data2.label,
                    'value': data2.value,
                    'price': data2.price,
                    'count_price': data2.count_price,
                    'id': data2.produce_breakdown_id,
                    'produce_breakdown_id': data2.produce_breakdown_id,
                    'produce_grade_id': data2.produce_grade_id,
                    'workload_unit_id': data2.workload_unit_id,
                    'workload_unit_name': data2.workload_unit_name,
                    'price_upper': data2.price_upper || 0,
                    'price_lower': data2.price_lower || 0,
                    'isPriceDisabled': data2.isPriceDisabled,
                    'disabled': data2.isPriceDisabled,
                    'price_contract_library_id': data2['workload_unit_data'][data2.workload_unit_id]['id'],
                    'file_id': file_ids || '',
                    'remark': data2.remark || '',
                    'require_attachment':data2.require_attachment,
                    'isSeparatContract':this.breakdownPriceModalData.data['isSeparatContract']
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
        //console.log(data)
      });
      this.breakdownPriceModalCancel();
    } else {
      this.message.error('报价信息有误，请关闭后重新报价。');
    }
    this.showStoryPrice();
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

  // 更新当前报价金额
  showStoryPrice() {
    if (this.list) {
      this.list.forEach(data => {
        let price;
        price = 0;
        data.children.forEach(data2 => {
          if (data2.quote_total_price) {
            price = price + parseFloat(data2.quote_total_price);
          }
        });
        data.count_price = price;
      });
    }
  }

  // 获取点击事件
  getClickEvent(key, item) {
    this.clickEvent({ key: key, item: item });
  }
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.thingDetailModal.openModal(event.item);
    }
  }

  // 失去焦点事件
  blurEvent(event) {
    if (event.key === 'producer_name') {
    }
  }

  // 显示展开按钮
  expandChange($event, data) {
    data.expand = !data['expand'];
    this.expand[data.id] = !$event;
  }

  // 表格复选
  refreshStatus(notSet?: boolean): void {
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
        if (item.children.some(item => item.checked)) {
          item['content_order_amount'] = item['children'].filter(item => item.checked)
            .map(item => Number(item.quote_total_price))
            .reduce((total, num) => Number(total) + Number(num)).toFixed(2);
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
    let flag;
    flag = !(checkedNumber > 0);
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
    this.pagination.page_size = page_size;
    this.pagination.page_index = 1;
    this.getTableList();
  }

  // 获取数据列表
  getTableList() {
    this.getList();
  }

  getPrice(item, key, isdisabled = false) {
    // 锁定总价
    if (isdisabled) {
      if (key === 'quote_workload') {
        if (item['quote_workload'] || item['quote_workload'] === 0) {
          if (item['quote_total_price'] && item['quote_workload'] !== 0) {
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          } else {
            item['quote_unit_price'] = '';
          }
        }
      } else if (key === 'quote_unit_price') {
        if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
          if (item['quote_total_price'] && item['quote_unit_price'] !== 0) {
            item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
          } else {
            item['quote_workload'] = '';
          }
        }
      } else if (key === 'quote_total_price') {
        if (item['quote_total_price'] === 0) {
          item['quote_workload'] = 0;
        } else if (item['quote_unit_price'] !== 0 && item['quote_unit_price'] > 0) {
          item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
        } else if (item['quote_workload'] !== 0 && item['quote_workload'] > 0) {
          item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
        }
      } else if (key === 'workload_unit') {
        // console.log('workload_unit1', item['quote_total_price']);
        const unit_price = item['contract_price_groups'] ?
          item['contract_price_groups']['workload_unit_data'] ?
            item['contract_price_groups']['workload_unit_data'][item['quote_workload_unit_id']] ?
              item['contract_price_groups']['workload_unit_data'][item['quote_workload_unit_id']]['quote_unit_price'] : '' : '' : '';
        if (item['quote_total_price'] === 0 || item['quote_total_price'] == '') {
          item['quote_unit_price'] = unit_price;
        } else {
          if (unit_price) {
            item['quote_unit_price'] = unit_price;
          } else {
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          }
        }
        this.getPrice(item, 'quote_unit_price', true);
      }
    } else {
      if (key == 'quote_workload') {
        if (item['quote_workload'] || item['quote_workload'] === 0) {
          if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
            item['quote_total_price'] = (item['quote_unit_price'] * item['quote_workload']).toFixed(2);
          } else if (item['quote_total_price'] && item['quote_workload'] != 0) {
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          }
        }
      } else if (key == 'quote_unit_price') {
        if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
          if (item['quote_total_price'] && item['quote_unit_price'] != 0) {
            item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
          } else if (item['quote_workload'] || item['quote_workload'] === 0) {
            item['quote_total_price'] = (item['quote_unit_price'] * item['quote_workload']).toFixed(2);
          }
        }
      } else if (key == 'quote_total_price') {
        if (item['quote_total_price'] || item['quote_total_price'] === 0) {
          if (item['quote_total_price'] && item['quote_unit_price'] != 0) {
            item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
          } else if (item['quote_total_price'] && item['quote_workload'] != 0) {
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          } else if (item['quote_total_price'] === 0) {
            item['quote_workload'] = 0;
          }
        }
      } else if (key === 'workload_unit') {
        const unit_price = item['contract_price_groups'] ?
          item['contract_price_groups']['workload_unit_data'] ?
            item['contract_price_groups']['workload_unit_data'][item['quote_workload_unit_id']] ?
              item['contract_price_groups']['workload_unit_data'][item['quote_workload_unit_id']]['quote_unit_price'] : '' : '' : '';
        if (item['quote_total_price'] === 0 || item['quote_total_price'] == '') {
          item['quote_unit_price'] = unit_price;
        } else {
          if (unit_price) {
            item['quote_unit_price'] = unit_price;
          } else {
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          }
        }
        this.getPrice(item, 'quote_unit_price', true);
      } else if (key === "agency_fees") {
        item['agency_fees'] = item['agency_fees'].toFixed(2);
      }
    }

    // 固定税率
    if (item['tax_type'] && (item['tax_type'] == 1 || item['tax_type'] == 2)) {
      if (item['quote_total_price'] !== '') {
        item['quote_total_price'] = (item['quote_total_price'] * (1 + Number(item['tax_value']))).toFixed(2);
        item['tax_price'] = (item['quote_total_price'] * Number(item['tax_value'])).toFixed(2);
      }
    }
  }


  getFillPrice(key) {
    let workload = null, unit_price = null, total_price = null, agency_fees = null;

    if (this.fillForm['quote_workload']) {
      workload = parseFloat(this.fillForm['quote_workload']);
    }
    if (this.fillForm['quote_unit_price']) {
      unit_price = parseFloat(this.fillForm['quote_unit_price']);
    }
    if (this.fillForm['quote_total_price']) {
      total_price = parseFloat(this.fillForm['quote_total_price']);
    }
    if (this.fillForm['agency_fees']) {
      agency_fees = parseFloat(this.fillForm['agency_fees']).toFixed(2);
    }

    if (key === 'quote_workload') {
      if (workload) {
        if (unit_price) {
          total_price = (unit_price * workload).toFixed(2);
        } else if (total_price) {
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
        } else if (total_price) {
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
    } else if (key === "agency_fees") {
      // agency_fees = agency_fees.toFixed(2);
    }

    this.fillForm['quote_workload'] = workload;
    this.fillForm['quote_unit_price'] = unit_price;
    this.fillForm['quote_total_price'] = total_price;
    this.fillForm['agency_fees'] = agency_fees;
  }

  fillAll() {

    if (this.fillForm['quote_workload'] === 0
      || this.fillForm['quote_unit_price'] === 0
      || this.fillForm['quote_total_price'] === 0) {
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

    if (this.fillForm['quote_workload'] && this.fillForm['quote_unit_price'] && !this.fillForm['quote_unit_price']) {
      this.message.error('请填写单价');
      return;
    }

    if (this.fillForm['quote_unit_price'] && !this.fillForm['quote_workload'] && this.fillForm['quote_total_price']) {
      this.message.error('请填写数量');
      return;
    }

    if (!this.fillForm['quote_total_price'] && this.fillForm['quote_unit_price'] && this.fillForm['quote_workload']) {
      this.message.error('请填写总价');
      return;
    }

    if (this.fillForm['quote_workload'] && this.fillForm['quote_unit_price'] && this.fillForm['quote_total_price'] || (
      !this.fillForm['quote_workload'] && !this.fillForm['quote_unit_price'] && !this.fillForm['quote_total_price']
    )) {
      this.list.forEach(item => {
        item.children.forEach(data => {
          if (data.checked) {
            data['quote_complete_date'] = this.fillForm['quote_complete_date'] || data['quote_complete_date'];
            data['quote_remark'] = this.fillForm['quote_remark'] || data['quote_remark'];

            if (this.is_test == '1') {
              data['not_pass_percent'] = this.fillForm['not_pass_percent'] || data['not_pass_percent'];
            }

            if (!data['is_disabled'] && (data.price_type == 3 || data.price_type == 4)) {
              data['quote_workload'] = this.fillForm['quote_workload'] || data['quote_workload'];
              data['quote_unit_price'] = this.fillForm['quote_unit_price'] || data['quote_unit_price'];
              data['quote_total_price'] = this.fillForm['quote_total_price'] || data['quote_total_price'];
              data['total_price'] = data['quote_total_price'];
            }
            if (data['demand_type'] && (data.demand_type == 2 || data.demand_type == "画师") && (data.price_type == 3 || data.price_type == 4)) {
              data['agency_fees'] = this.fillForm['agency_fees'];
            }
          }
        });
      });
      this.isFill = false;
      for (const key in this.fillForm) {
        if (key) {
          this.fillForm[key] = '';
          if (this.is_test == '1') {
            this.fillForm['not_pass_percent'] = '0.00';
          }
        }
      }
      this.refreshStatus(false);
    } else {
      this.message.error('请填写完整的价格数据');
    }


  }

  // 分片上传
  customBigReq = (item: UploadXHRArgs) => {
    this.uploadService.uploadBig(item, 1200, data => {
      this.uploadChangeData['file_id'] = data['id'];
    });
  }

  customReqs = (item: UploadXHRArgs) => {
    return this.cos.uploadFile(item).subscribe(
      (event) => {
        // 处理成功
        this.message.success(this.fileSuccess);
        item.onSuccess(event, item.file, event);
      }, err => {
        // 处理失败
        this.message.error(this.fileFails);
        item.onError(err, item.file);
      }
    );
  }

  beforeUploadFile = (file: File) => {

    const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png');

    const isLt2M = file.size < 1024 * 1024 * 24;
    if (isJPG && !isLt2M) {
      this.message.error('JPG/PNG 等预览图片大小不超过32MB、宽高不超过30000像素且总像素不超过2.5亿像素!');
      return false;
    }

    const fileTypes = ['xls', 'xlsx'];
    const fileNames = file.name.split('.');
    const isFILE = fileTypes.some(type => fileNames[fileNames.length - 1] == type);
    if (!isFILE) {
      this.message.error(file.name + `格式不对，格式要求：xls,xlsx`);
    }
    // const isLt10G = file.size < 1024 * 1024 * 1024 * 10;
    // if (!isLt10G) {
    //   this.message.error(file.name + this.limit10G);
    //   return false
    // }
    return isFILE;
  }

  uploadPreview = (item) => {
    if (item.url.indexOf('.jpg') === -1 && item.url.indexOf('.png') === -1 && item.url.indexOf('.gif') === -1) {
      return window.open(item.url, '_blank');
    } else {
      return this.modal.open('photo', {
        title: item,
        url: item.url,
      });
    }
  }

  download(id) {
    window.open('web/file/' + id, '_blank');
  }

  uploadDel(id) {
    this.modalService.create({
      nzTitle: '提示',
      nzContent: '确认删除文件',
      nzClosable: false,
      nzOnOk: () => new Promise((resolve, reject) => {
        this.http.post('web/cos/del-file', { file_id: id })
          .subscribe(results => {
            if (results['code'] === 0) {
              this.message.success(results['msg']);
              resolve();
              this.getList();
            } else {
              this.message.error(results['msg']);
              reject()
            }
          }, err => {
            this.message.error(err['msg']);
            reject();
          });
      })
    });
  }

  
  uploadChange($event, data,  column = null) {         
    if ($event.type === 'success') {
      data.file_id = $event.file.originFileObj.file_id;
      data.file_name = $event.file.originFileObj.name;      
      this.breakdownPriceModalData.data['produce_breakdown_list'].map((item)=>{
        if(item.id==data.id){
        
         if(!data.fileLists){
       
          data.fileLists=[]
          if(isArray(data.fileLists)){
            data.fileLists.push( {
              'file_id':$event.file.originFileObj.file_id,
              'file_name': $event.file.originFileObj.name,  
            })
          }   

         }else if(data.fileLists){
         
          if(isArray(data.fileLists)){
            data.fileLists.push( {
              'file_id':$event.file.originFileObj.file_id,  
              'file_name': $event.file.originFileObj.name,          
            })
          }         
         }        
        }                    
      })                    
     // console.log(data.fileLists)  
     
      data.is_upload=true
      
    }
   
  }

  // preview (thing) {
  //   this.modal.open('photo', {
  //     title: thing.thing_name,
  //     url: thing.img,
  //   });
  // }

  preview(url, name = null) {
    this.modal.open('photo', {
      title: name,
      url: url
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

