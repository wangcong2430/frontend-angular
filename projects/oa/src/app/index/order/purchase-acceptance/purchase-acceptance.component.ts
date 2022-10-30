import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { UploadXHRArgs, NzModalRef, NzModalService } from 'ng-zorro-antd';
import { mergeMap } from 'rxjs/operators';
import { concat, of, throwError, Observable, Observer } from 'rxjs';

import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { UploadService } from '../../../services/upload.service';
import { ModalService } from '../../../services/modal.service';

import { ShowImgModalComponent } from '../../../containers/modal/show-img/show-img.component';
import { AcceptanceRateComponent } from '../../../containers/modal/acceptance-rate/acceptance-rate.component';
import { CacheService } from '../../../services/cache.service';
import { CosService } from '../../../services/cos.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import { isArray } from 'ngx-bootstrap';

@Component({
  templateUrl: './purchase-acceptance.component.html',
  styleUrls: ['./purchase-acceptance.component.css']
})

export class PurchaseAcceptanceComponent implements OnInit {
  @ViewChild('nestedTable') nestedTable: ElementRef;

  @ViewChild(ShowImgModalComponent)
  private showImgModal: ShowImgModalComponent;
  @ViewChild(AcceptanceRateComponent)
  private acceptanceRateModal: AcceptanceRateComponent;
 //默认是分包
 radioValue = '0';
  // loading
  loading = true;
  listLoading = false;
  isSubmitLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  disabledButton = true;
  isNewAcceptance = false;
  //驳回不显示弹框
  optionType=null;
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  // 数据列表
  list = [];
  expands = {}; // 展开项
  // 分页
  pagination = {
    total_count: null,
    page_size: 5,
    page_index: 1,
  };
  checkedNumber = 0;
  indeterminate = false;
  allChecked = false;
  isChildrenDisabled = true;
  expand = {};
  selctPriceModalData = {
    isShow: false,
    data: {}
  };
  breakdownPriceModalData = {
    isShow: false,
    currency_symbol: '',
    is_price_disabled: false,
    data: {},
    radioValue:'0',
    is_separate:'0'
  };
  changePassModal = {
    isShow: false,
    title: '',
  };
  pass_degree = {};
  // 修改价格制作明细，对应制作等级数据的价格库
  workloadUnitList = [];
  editPriceModel = {};
  editPriceModalVisible = false;
  priceLibrary = [];
  tdColspan = 1;

  // 通过评分相关数据
  newVersion=null;
  acceptanceScore = [];
  evaluateDetail=false;
  acceptanceScoreTemp = [];
  msgHint = {
    key: '',
    isShow: false,
    isSubmitLoading: false,
    type: 1,
    msg: '',
    is_skip_score: true
  };
  uploadChangeData;
  rejectParam = {
    isShow: false,
    isSubmitLoading: false,
    options: [],
    optionValue: '',
    rejectReason: ''
  };
  //评分详情

  // 驳回原因
  rejectVisible = false;
  rejectReason = '';
  isFill = false;
  fillForm = {
    quote_unit_price: null,
    quote_workload: null,
    quote_total_price: null,
    save_reason: ''
  };
  isSearchDropdown = false;
  isColumnDropdown = false;
  filterValue = '';
  serviceData;

  dateFormat = 'yyyy-MM-dd';

  thingArr = null;

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService,
    private uploadService: UploadService,
    private modal: ModalService,
    private router: Router,
    private cache: CacheService,
    private modalService: NzModalService,
    private cos: CosService
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
    this.getList();

    const key = this.router.url + 'expand';
    this.expand = sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)) : this.expand;

    this.modal.complete$.subscribe(item => {
      if (item['key'] === 'thing-label') {
        this.getList();
        this.changeDisabledButton(true);
      }
    });
  }

  checkModelChange () {
    this.queryFields = [...this.queryFields]
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = 1;
      this.getList();
    }
  }
  selectPass ($event, id) {
    this.pass_degree[id] = $event;
  }

  // 显示展开按钮
  expandChange(data) {
    data.expand = !data.expand;
    if (data.id) {
      this.expand[data.id] = data.expand;
      const key = this.router.url + 'expand';
      sessionStorage.setItem(key, JSON.stringify(this.expand));
    }
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/acceptance/purchasing-manager-acceptance-config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.childrenColumns  = result['childrenColumns'];
      this.childrenColumns.forEach(item => {
        item.show = true;
        if(item.key=='demand_acceptance_score') {
          item.type='evaluateDetail'
        }
      });

      this.queryFields      = result['search_form'];
      this.workloadUnitList = result['workloadUnitList'];
      //this.acceptanceScore = result['acceptanceScore'];
      //console.log(this.acceptanceScore)
      //this.acceptanceScoreTemp = result['acceptanceScore'];
    });
  }

  stopPropagation ($event, type) {
    if (type) {
      $event.stopPropagation()
    }
  }

  sort(e, list, index) {
    const compare = function (prop, type) {
      return function (obj1, obj2) {
        const val1 = obj1[prop];
        const val2 = obj2[prop];
          if ( type === 'descend' ) {
            return val1 > val2 ? 1 : -1;
          } else {
            return val1 > val2 ? -1 : 1;
          }
      };
    };

    list = list.sort(compare(e.key, e.value));

    this.list[index].children = [...list]
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
      ...this.searchFormData
    };
    this.http.get('web/acceptance/purchasing-manager-acceptance-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.list                   = result['data']['list'];
      this.pagination.total_count = result['data']['pager']['itemCount'];
      this.pagination.page_index  = result['data']['pager']['page'];
      this.pagination.page_size   = result['data']['pager']['pageSize'];

      if (this.list) {
        this.list.forEach(item => {
          item['expand'] =  false;

          if (item.children && item.children.length > 10) {
            item['expand'] = true;
          }

          if (item.id && this.expand.hasOwnProperty(item.id)) {
            item.expand = this.expand[item.id];
          }
        });
      }
      this.getDropdown();
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 获取点击事件
  getClickEvent(key, item) {
    this.clickEvent({key: key, item: item});
  }

  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modal.open('thing', event.item);
    } else if (event.key === 'operation') {
      window.open(event.item.operation_id);
    } else if (event.key === 'thumb') {
      this.modal.open('photo', {
        url: event.item.img
      });
    } else if (event.key === 'order_code') {
      event.item.id = event.item.order_id;
      this.modal.open('order', event.item);
    }
  }

  fileList1 = [];
  fileList2 = [];
  fileList3 = [];
  fileList4 = [];

  handleChange({ file, fileList, event}, list): void {
    if (file.status === 'done') {
      this.message.success('上传成功');
    }
    if (!this[list].some(item => item.uid === file.uid)) {
      this[list].push(file);
    }
  }

  uploadingId;
  beforeUpload = (file: File) => {
    return new Observable((observer: Observer<boolean>) => {
      // const isLt10G = file.size >  1024  * 1024 * 1024 * 10;
      // if (isLt10G) {
      //   this.message.error('附件大小不能大于10G');
      //   observer.complete();
      //   return;
      // }
      this.uploadingId = this.message.loading('正在上传中', { nzDuration: 0 }).messageId;
      observer.next(true);
    });
  }

  // 失去焦点事件
  blurEvent(event) {
    if (event.key === 'producer_name') {
    }
  }

  preview (url, name = null) {
    this.modal.open('photo', {
      title: name,
      url: url
    });
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
        const allChecked2 = item.children.every(value => value.checked === true);
        const allUnChecked2 = item.children.every(value => !value.checked);
        item.indeterminate = (!allChecked2) && (!allUnChecked2);
        checkedNumber = checkedNumber + item.children.filter(value => value.checked).length;
      }
      // 计算总金额
      if (item['children'].some(item => item.checked)) {
        item.content_order_amount = item['children']
          .filter(item => item.checked)
          .map(item => Number(item.total_price) + Number(item.tax_price))
          .reduce((total, num) => Number(total) + Number(num))
          .toFixed(2) + " " + item.currency_symbol;
      } else {
        item.content_order_amount = 0;
      }
    });

    this.checkedNumber = checkedNumber;
    let flag;
    flag = !(checkedNumber > 0);
    this.changeDisabledButton(flag);
    this.isCheckAll();
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
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
    this.pagination.page_index = 1;
    this.getTableList();
  }

  // 获取数据列表
  getTableList() {
    this.getList();
  }
  handleOk(): void {
    this.editPriceModalVisible = false;
  }

  handleCancel(): void {
    this.editPriceModalVisible = false;
  }

  noFullOnlineProcess = {
    isVisible: false,
    list: []
  }

  // 全在线判断
  isFullOnlineProcess (): void {

    // 获取改价物件
    let rePriceThing = this.spmSavePrice();

    // 改价验证是否有错误 有则停止
    if (rePriceThing['error']) {
      return ;
    }

    // 非全在线, 是否参与线上作品交付, 价格提升
    this.noFullOnlineProcess.list =   this.list.filter(item => item.checked || item.indeterminate).map(item => {
      const things = item.children.filter(i => i.is_reduce_process == '1' && i.order_online_make_order == '0' && Number(i.quote_total_price) > Number(i.first_total_price))

      return {
        order_id: item.order_id,
        order_code: item.order_code,
        order_name: item.order_name,
        budget_available: item.budget_available,
        children: things,
        new_order_total_price: things.length > 0 ? things.map(item => item.quote_total_price).reduce((total, num) => Number(total) + Number(num)) : 0,
        order_total_price: things.length > 0 ? things.map(item => item.first_total_price).reduce((total, num) => Number(total) + Number(num)) : 0,
        currency: item.currency ? item.currency.symbol : '',
        file_id: null
      }
    }).filter(item => item.children.length)

    if (!this.noFullOnlineProcess.list.every(item => Number(item.budget_available) > Number(item.new_order_total_price))) {
      this.noFullOnlineProcess.list.map(item => {
        if (Number(item.budget_available) <  Number(item.new_order_total_price) && item.category_type == '2') {
          this.message.error(item.order_code + ': 可用产品预算不足');
          return;
        }
      })
    }

    if (this.noFullOnlineProcess.list.length > 0) {
      this.noFullOnlineProcess.isVisible = true
    } else {
      this.purchaseAcceptanceSubmit('pass')
    }
  }

  noFullOnlinehandleOk () {

    if (!this.noFullOnlineProcess.list.every(item => item.file_id)) {
      this.noFullOnlineProcess.list.map(item => {
        if (!item.file_id) {
          this.message.error(item.order_code + ': 审批邮件不能为空')
        }
      })
      return
    }

    this.http.post('web/acceptance/add-order-remake', {
      file_list: this.noFullOnlineProcess.list.map(item => {
        return {
          order_id: item.order_id,
          attachment_id: item.file_id,
        }
      })
    }).subscribe(res => {
      if (res['code'] == 0) {
        this.noFullOnlineProcess.isVisible = false
        console.log(1233333)
        this.purchaseAcceptanceSubmit('pass')
      } else {
        this.message.error(res['msg'])
      }
    }, err => {
      this.message.error(err.msg)
    })
  }

  noFullOnlineCancel () {
    this.noFullOnlineProcess.isVisible = false
  }

  // 通过 驳回
  purchaseAcceptanceSubmit(optionType) {
    let thing_id, is_skip_score, edit_price_id;
    thing_id = [];
    edit_price_id = [];
    is_skip_score = true;

    this.list.forEach((story, storyIndex) => {
      if (story.expand != undefined) {
        this.expands[story.id] = story.expand;
      }
      if (story['children']) {
        story['children'].forEach((thing, thingIndex) => {
          if (thing.checked) {
            thing_id.push(thing.id);
            if (!thing['is_skip_score'] || thing['is_skip_score'].toString() === '0') {
              is_skip_score = false;
            }
            if (thing['total_price'] != thing['quote_total_price']) {
              edit_price_id.push(thing.id);
            }
            return;
          }
        });
      }
    });

    this.http.get('web/acceptance/get-acceptance-score', {
      params: {
        thing_id: thing_id.toString(),
        current_workflow: '11200',
      }
    }).subscribe(res => {
      if (res['code'] === 0) {
        if (res['data'].length > 0) {
          this.isNewAcceptance = true;
          this.acceptanceScore = res['data'];          
          this.newVersion=res['version'];
          this.optionType=optionType
        } else if(res['data'].length == 0){
          this.acceptanceScore = res['data'];
          this.isNewAcceptance = false;
          //this.acceptanceScore = this.acceptanceScoreTemp;
        }
        
        if (optionType == 'pass') {
          this.passThing();
          return;
        } else {
          this.message.isAllLoading = true;
          this.http.post('/web/acceptance/purchase-acceptance-reject-check', {thing_id: thing_id}).subscribe(result => {
            this.message.isAllLoading = false;
            if (result['code'] === 0) {
              this.rejectParam.options = result['data']['options'];
              this.rejectParam.optionValue = result['data']['optionValue'];
              this.rejectParam.isShow = true;
              this.rejectParam.rejectReason = '';
            } else {
              this.message.error(result['msg']);
            }
          }, (err) => {
            this.message.isAllLoading = false;
            this.message.error('网络异常，请稍后再试');
          });
          return;
        }
      } else {
        this.message.error(res['msg']);
        return false;
      }
    }, err => {
      this.message.error('网络异常, 请稍后再试');
    });
  }
  // 通过 驳回 不需要评分
  purchaseAcceptanceSubmit2(optionType, editPrice = []) {
    let thing_id;
    thing_id = [];
    this.list.forEach((story, storyIndex) => {
      if (story['children']) {
        story['children'].forEach((thing, thingIndex) => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });

    this.message.isAllLoading = true;
    this.http.post('/web/acceptance/purchase-acceptance-' + optionType, {
      thing_id: thing_id,
      edit_price: editPrice,
      reject_param: this.rejectParam,
    }).subscribe(result => {
      this.message.isAllLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.rejectParam.isShow = false;
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.rejectVisible = false;
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

    if (item['pre_produce_breakdown']) {
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
    console.log(item)
    this.breakdownPriceModalData.isShow = true;
    this.breakdownPriceModalData.currency_symbol = item.currency_symbol;
    this.breakdownPriceModalData.is_price_disabled = item.is_price_disabled;
    this.breakdownPriceModalData.data = {
      thing_id:  0,
      workload:  1,
      unit_price:  0,
      total_price:  0,
      quote_total_price:  0,
      agency_fees:  "0",
      produce_breakdown_list:  [],
      isEmpty: false,
    };
    this.breakdownPriceModalData.data['quote_total_price']  = item['quote_total_price'] ? item['quote_total_price'] : 0;
    this.breakdownPriceModalData.data['agency_fees']  = item['agency_fees'] ? item['agency_fees'] : "0";
    this.breakdownPriceModalData.is_separate=item.thing&&item.thing.is_separate?item.thing.is_separate:item.is_separate
    //console.log("11111111111111111111");
    //console.log(this.breakdownPriceModalData.data['agency_fees']);
    if (item['contract_groups']) {
      this.breakdownPriceModalData.data['thing_id']         = item['id'];

      let contract_groups;
      contract_groups = JSON.parse(JSON.stringify(item['contract_groups']));
      contract_groups.forEach(data => {
        //获取是否分包的值
        if (data.isSeparatContract) {
              this.breakdownPriceModalData.radioValue=data.isSeparatContract
        }else {
              this.breakdownPriceModalData.radioValue='0'
        }
        // 获取工作单位
        if (data.workload_unit_list) {
          data.workload_unit_list.forEach(data2 => {
            let workload_unit_data;
            workload_unit_data = data['workload_unit_data'][data2['value']];
            // 价格提示
            workload_unit_data.tooltipTitle = '';
            if (parseFloat(workload_unit_data['price_upper']) > 0
              && parseFloat(workload_unit_data['price_upper']) !== parseFloat(workload_unit_data['price_lower'])
            ) {
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
          this.breakdownPriceModalEmpty();
        }
      } else {
        this.breakdownPriceModalData.data['workload']    = item['quote_workload'];
        this.breakdownPriceModalData.data['unit_price']  = item['quote_unit_price'];
        this.breakdownPriceModalData.data['total_price'] = item['quote_total_price'];
      }
    }
    this.calculatePriceModal();
    this.breakdownPriceModalData.data['isEmpty']         = isEmpty;
    //console.log(this.breakdownPriceModalData.radioValue)
    //console.log(this.breakdownPriceModalData.is_separate)
  }

  breakdownPriceModalCancel() {
    this.breakdownPriceModalData.isShow = false;
    this.refreshStatus(false);
  }
  calculatePriceModal() {
    let total = 0.00;
    this.breakdownPriceModalData.data['produce_breakdown_list'].forEach(data => {
      if (data.value && data.price) {
        let value, price;
        value = parseFloat(data.value);
        price = parseFloat(data.price);
        data.count_price = (value * price).toFixed(2);
        total = total + parseFloat(data.count_price);
      } else if (data.value === 0 || data.price === 0) {
        // total = 0
        data.count_price = 0;
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
  confirm(file_id){
    //console.log(file_id)
    //file_id=null;
    //require_attachment=1;
    //console.log(this.breakdownPriceModalData.data['produce_breakdown_list'])
     this.breakdownPriceModalData.data['produce_breakdown_list']=this.breakdownPriceModalData.data['produce_breakdown_list'].map((item)=>{
       if(isArray(item.file_id.split(','))){
         let newFileid=item.file_id.split(',').filter((idm)=>{
          return idm!=file_id
         
         })
         //console.log(newFileid)
         item.file_id=newFileid.join(',')        
         if(item.file_id==''){
           //console.log(item.fileLists)
           item.require_attachment=item.require_attachmentPlus
         }        
       }

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
    //console.log(this.breakdownPriceModalData.data['produce_breakdown_list'][0])

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
            price_upper = data['workload_unit_data'][data['workload_unit_id']]['price_upper'] ?
              parseFloat(data['workload_unit_data'][data['workload_unit_id']]['price_upper']) : 0;
            if (price_upper !== 0 && data.price > price_upper) {
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
            thing['quote_total_price'] = this.breakdownPriceModalData.data['total_price'];
            thing['total_price'] = thing['quote_total_price'];
            if (parseFloat(this.breakdownPriceModalData.data['total_price']) > 0) {
              if (thing['quote_unit_price'] != 0) {
                thing['quote_workload'] =
                      (Number(this.breakdownPriceModalData.data['total_price']) / (Number(thing['quote_unit_price']))).toFixed(3);
              } else if (thing['quote_workload'] != 0) {
                thing['quote_unit_price'] =
                  (Number(this.breakdownPriceModalData.data['total_price']) / (Number(thing['quote_workload']))).toFixed(3);
              }
              // 固定税率
              if (thing['tax_type'] && (thing['tax_type'] == 1 || thing['tax_type'] == 2)) {
                thing['tax_price'] = (thing['quote_total_price'] * thing['tax_value']).toFixed(2);
              }
            } else if (parseFloat(this.breakdownPriceModalData.data['total_price']) === 0 ) {
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
                if (data2.count_price || parseFloat(data2.count_price) === 0) {
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
    } else if (this.msgHint.type === 10) {
      // 通过
      this.passThing();
    } else if (this.msgHint.type === 20) {
      // 驳回
      this.purchaseAcceptanceSubmit2('reject');
      this.msgHintModalCancel();
    }
  }
  // 物件通过 + 物件改价
  passThing() {
    let thing_id, is_skip_score, exitPriceThing;
    thing_id = [];
    const things = [];
    const storys = new Set();
    is_skip_score = true;

    this.list.forEach((story, storyIndex) => {
      if (story['children']) {
        story['children'].forEach((thing, thingIndex) => {
          if (thing.checked) {
            thing_id.push(thing.id);
            storys.add(story.id);
            things.push(thing);
            if (!thing['is_skip_score'] || thing['is_skip_score'].toString() === '0') {
              is_skip_score = false;
            }
          }
        });
      }
    });
    // 获取改价物件
    let rePriceThing;
    rePriceThing = this.spmSavePrice();

    // 改价验证是否有错误 有则停止
    if (rePriceThing['error']) {
      return false;
    }
    exitPriceThing = rePriceThing['item'] || [];
    // return false
    if (!is_skip_score) {
      this.acceptanceRateModal.openModal('/web/acceptance/purchase-acceptance-pass',
        thing_id, [], exitPriceThing, null, null , storys, things, this.acceptanceScore, this.isNewAcceptance);
    } else {
      this.purchaseAcceptanceSubmit2('pass', exitPriceThing);
    }

    this.msgHintModalCancel();
  }
  msgHintModalCancel() {
    this.msgHint.msg = '';
    this.msgHint.isShow = false;
  }

  // 采购经理改价
  spmSavePrice(isSubmit = true) {
    let item, total, isError, thing_id;
    item  = [];
    thing_id = [];
    total = 0;

    this.list.forEach(data => {
      if (data.children && data.children.length > 0) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            thing_id.push(data2.id);
            let oldThing = [];
            let newThing = [];
            if (data2 && data2.contract_groups && data2.contract_groups.length > 0) {
              oldThing = data2.contract_groups.filter(item => item.count_price != '0').map(item => {
                return {
                  produce_breakdown_id:item.produce_breakdown_id,
                  price: item.price,
                  value: item.value,
                  count_price: item.count_price,
                  workload_unit_id:item.workload_unit_id,
                };
              });
            }

            if (data2 && data2.quote_produce_breakdown && data2.quote_produce_breakdown.length > 0) {
              newThing = data2.quote_produce_breakdown.filter(item => item.count_price != '0').map(item => {
                return {
                  produce_breakdown_id:item.produce_breakdown_id,
                  price: item.price,
                  value: item.value,
                  count_price: item.count_price,
                  workload_unit_id:item.workload_unit_id,
                };
              });
            }
            //#20220117 这里不清楚为什么当初判断不用oldthing,newthing，而直接判断金额, 现在测试需要区分单位，专门写个只判断单位的boolean
            let is_diff_workload = false;
            if ( newThing.map((item)=>{return item.produce_breakdown_id+"-"+item.workload_unit_id + '-' + parseFloat(item.price) + '-' + parseFloat(item.count_price)}).sort().join("#")
              != oldThing.map((item)=>{return item.produce_breakdown_id+"-"+item.workload_unit_id + '-' + parseFloat(item.price) + '-' + parseFloat(item.count_price)}).sort().join("#")){
              is_diff_workload = true;
            }

            if (parseFloat(data2['total_price']) !== parseFloat(data2['quote_total_price'])
              || parseFloat(data2['thing_quote_total_price']) !== parseFloat(data2['quote_total_price'])
              || parseFloat(data2['thing_quote_unit_price']) !== parseFloat(data2['quote_unit_price'])
              || parseFloat(data2['thing_quote_total_price']) > parseFloat(data2['first_total_price']) ||is_diff_workload) {
                let errorTitle, isThingError;
                errorTitle = '物件单号' + data2['thing_code'];
                isThingError = false;
                total = total + parseFloat(data2.quote_total_price);
                if (data2['price_type'].toString() !== '1') {
                  if ((data2['price_type'].toString() === '4'
                    || data2['price_type'].toString() === '3')
                    && data2.quote_workload_unit_id.toString() === '') {
                    isThingError = true;
                    isError = true;
                    errorTitle += ' ，未选择单位';
                  }
                  if (parseFloat(data2.quote_total_price) < 0) {
                    isThingError = true;
                    isError = true;
                    errorTitle += ' ，没有价格信息';
                  }
                  if (!data2['save_reason'] || data2['save_reason'].toString() === '') {
                    isThingError = true;
                    isError = true;
                    errorTitle += ' ，未添加修改原因';
                  }
                  if (data2.tax_type && data2.tax_type == 3 && (parseFloat(data2.tax_price) < 0 ||　data2.tax_price === '')) {
                    isThingError = true;
                    isError = true;
                    errorTitle += ' ，不含税合同必须要有税金';
                  }
                }

              // 不是简化流程
              if (data2['is_reduce_process'].toString() !== '1') {
                if (parseFloat(data2['first_total_price']) > 0
                  && parseFloat(data2.quote_total_price) > parseFloat(data2['first_total_price'])
                ) {
                  isThingError = true;
                  isError = true;
                  errorTitle += ' ，价格不能超过 ' + data2['first_total_price'];
                }
                if (parseFloat(data2['tax_price']) > 0
                  && parseFloat(data2['tax_price']) > parseFloat(data2['thing_quote_tax_price'])
                ) {
                  isThingError = true;
                  isError = true;
                  errorTitle += ' ，新的税金不能超过 ' + data2['thing_quote_tax_price'];
                }
              }

              if (data2['is_reduce_process'].toString() === '1' && data2['order_online_make_order'].toString() === '1') {
                if (parseFloat(data2['first_total_price']) > 0
                  && parseFloat(data2.quote_total_price) > parseFloat(data2['first_total_price'])
                ) {
                  isThingError = true;
                  isError = true;
                  errorTitle += ' ，价格不能超过 ' + data2['first_total_price'];
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
                save_reason:             data2.save_reason,
                tax_price:               data2.tax_price,
              });
            } else if (parseFloat(data2['thing_quote_tax_price']) != parseFloat(data2['tax_price'])
             || parseFloat(data2['thing_quote_total_price']) !== parseFloat(data2['quote_total_price'])) {
              let errorTitle, isThingError;
              errorTitle = '物件单号' + data2['thing_code'];
              isThingError = false;
              total = total + parseFloat(data2.quote_total_price);

              // 不是简化流程
              if (parseFloat(data2['tax_price']) > 0 && parseFloat(data2['tax_price']) > parseFloat(data2['thing_quote_tax_price'])
              ) {
                isThingError = true;
                isError = true;
                errorTitle += ' ，新的税金不能超过 ' + data2['thing_quote_tax_price'];
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
                save_reason:             data2.save_reason,
                tax_price:               data2.tax_price,
              });
            }
          }
        });
      }
    });
    if (isError) {
      return {'error': isError};
    }

    return {'error': isError, item: item};
  }

  getPrice(item, key, isdisabled ?: false) {
    // 锁定总价
    if (isdisabled) {
      if (key === 'quote_workload') {
        if (item['quote_workload'] || item['quote_workload'] === 0 ) {
          if (item['quote_total_price'] && item['quote_workload'] !== 0) {
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          } else {
            item['quote_unit_price'] = '';
          }
        }
      } else if (key === 'quote_unit_price') {
        if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
          if (item['quote_total_price'] && item['quote_unit_price'] !== 0){
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
      }
    } else {
      if (key === 'quote_workload') {
        if (item['quote_workload'] || item['quote_workload'] === 0) {
          if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
            item['quote_total_price'] = (item['quote_unit_price'] * item['quote_workload']).toFixed(2);
          } else  if (item['quote_total_price'] && item['quote_workload'] != 0) {
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          }
        }
      } else if (key === 'quote_unit_price') {
        if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
          if (item['quote_workload'] || item['quote_workload'] === 0) {
            item['quote_total_price'] = (item['quote_unit_price'] * item['quote_workload']).toFixed(2);
          } else if (item['quote_total_price'] &&  item['quote_unit_price'] != 0)  {
            item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
          }
        }
      } else if (key === 'quote_total_price') {
        if (item['quote_total_price'] || item['quote_total_price'] === 0) {
          if (item['quote_total_price'] && item['quote_unit_price'] != 0) {
            item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
          } else if (item['quote_total_price'] && item['quote_workload'] != 0) {
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          } else if (item['quote_total_price'] === 0) {
            item['quote_workload'] = 0;
          }
        }
      }
    }

    // 金额
    item['total_price'] = item['quote_total_price'];
    // 固定税率
    if (item['tax_type'] && (item['tax_type'] == 1 || item['tax_type'] == 2)) {
      if (item['quote_total_price'] !== '') {
        // 税率金额
        item['tax_price'] = (item['quote_total_price'] * Number(item['tax_value'])).toFixed(2);
      }
    }
  }

  getFillPrice(key) {
    let workload = null, unit_price = null, total_price = null;

    if (this.fillForm['quote_workload'] || this.fillForm['quote_workload'] === 0) {
      workload = parseFloat(this.fillForm['quote_workload']);
    }
    if (this.fillForm['quote_unit_price'] || this.fillForm['quote_unit_price'] === 0) {
      unit_price = parseFloat(this.fillForm['quote_unit_price']);
    }
    if (this.fillForm['quote_total_price'] || this.fillForm['quote_total_price'] === 0) {
      total_price = parseFloat(this.fillForm['quote_total_price']);
    }

    if (key === 'quote_workload') {
      if (workload) {
        if (unit_price || unit_price === 0) {
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
        if (workload || workload === 0) {
          total_price = (unit_price * workload).toFixed(2);
        } else if (total_price)  {
          workload = (total_price / unit_price).toFixed(3);
        }
      } else if (unit_price === 0 && workload) {
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
        this.message.error('单价、数量、总价不可填写0，请使用“批量归零”按钮');
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

    if (this.fillForm['quote_workload'] && this.fillForm['quote_unit_price'] && this.fillForm['quote_total_price']
        || (!this.fillForm['quote_workload'] && !this.fillForm['quote_unit_price'] && !this.fillForm['quote_total_price'])
    ) {
      this.list.forEach(item => {
        item.children.forEach(data => {
          if (data.checked) {
            data['save_reason']  = this.fillForm['save_reason'] || data['save_reason'];
            if (!data['is_disabled'] && (data.price_type == 4 || data.price_type == 3)) {
              data['quote_workload']    = this.fillForm['quote_workload'] || data['quote_workload'];
              data['quote_unit_price']  = this.fillForm['quote_unit_price'] || data['quote_unit_price'];
              data['quote_total_price'] = this.fillForm['quote_total_price'] || data['quote_total_price'];
              data['total_price'] =  data['quote_total_price'];
            }
          }
        });
      });
      this.isFill = false;
      for (const key in this.fillForm) {
        if (key) {
          this.fillForm[key] = '';
        }
      }
      this.refreshStatus();
    }
  }


  uploadChange($event, data) {
    if ($event.type === 'success' && $event.file && $event.file.originFileObj) {
      //data.file_id = $event.file.originFileObj.file_id;


      this.breakdownPriceModalData.data['produce_breakdown_list'].map((item)=>{
        if(item.id==data.id){
                
         if(!data.fileLists){
       
          data.fileLists=[]
          if(isArray(data.fileLists)){
            data.fileLists.push( {
              'file_id':$event.file.originFileObj.file_id,
              'file_name': $event.file.originFileObj.name,  
            })
            
              let newFileid =data.file_id?data.file_id.split(','):[]
              newFileid.push($event.file.originFileObj.file_id) 
              data.file_id=newFileid.join(',')                                  
          }   

         }else if(data.fileLists){
         
          if(isArray(data.fileLists)){
            data.fileLists.push( {
              'file_id':$event.file.originFileObj.file_id,  
              'file_name': $event.file.originFileObj.name,          
            })
            let newFileid =data.file_id?data.file_id.split(','):[]
            newFileid.push($event.file.originFileObj.file_id) 
            data.file_id=newFileid.join(',')
            
          }         
         }        
        }                    
      })                    
      //console.log(data)  
     
      data.is_upload=true
    }
  }


  purchaseAcceptanceReject() {
    let thing_id;
    thing_id = [];
    this.list.forEach((story, storyIndex) => {
      if (story['children']) {
        story['children'].forEach((thing, thingIndex) => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });
    this.http.post('/web/acceptance/purchase-acceptance-reject-check', {
      thing_id: thing_id,
    }).subscribe(result => {
      this.message.isAllLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }

  rejectModalCancel () {
    this.rejectParam.isShow = false;
  }

  rejectModalOk () {

  }

  equals(x, y) {
    const f1 = x instanceof Object;
    const f2 = y instanceof Object;
    if (!f1 || !f2) {
        return x === y;
    }
    if (Object.keys(x).length !== Object.keys(y).length) {
        return false;
    }

    if (x instanceof Array && x[0] instanceof Object) {
      const keys = Object.keys(x[0]);
      x = x.sort((a, b) => { return a[keys[0]] - b[keys[0]]})
      y = y.sort((a, b) => { return a[keys[0]] - b[keys[0]]})
    }

    const newX = Object.keys(x);
    for (let p in newX) {
      if (p) {
        p = newX[p];
        const a = x[p] instanceof Object;
        const b = y[p] instanceof Object;
        if (a && b) {
           const equal = this.equals(x[p], y[p]);
           if (!equal) {
              return equal;
           }
        } else if (x[p] != y[p]) {
            return false;
        }
      }
    }
    return true;
  }

  isHidden(hidden_category, category_type) {
    if (hidden_category && hidden_category instanceof Array && hidden_category.length > 0  && category_type) {
      return hidden_category.some(item => item === category_type);
    } else {
      return false;
    }
  }

  dropdownChange(bol, type) {
    if (bol == false) {
      this.closeDropdown(type);
    }
  }
  // 设置已选择缓存
  closeDropdown(type) {
    if (type === 'search') {
      let searchList = {};
      if (localStorage.getItem('searchDropdown')) {
        searchList = JSON.parse(localStorage.getItem('searchDropdown'));
        searchList[this.router.url] = []
      } else {
        searchList = {
          [this.router.url]: []
        };
      }
      this.isSearchDropdown = false;
      this.queryFields.forEach(item => {
        searchList[this.router.url].push({
          key: item.key,
          show: item.show
        });
      });
      localStorage.setItem('searchDropdown', JSON.stringify(searchList));
    } else if (type === 'column') {
      this.isColumnDropdown = false;
      let columnList = {};
      if (localStorage.getItem('columnDropdown')) {
        columnList = JSON.parse(localStorage.getItem('searchDropdown'));
        columnList[this.router.url] = [];
      } else {
        columnList = {
          [this.router.url]: []
        };
      }
      this.childrenColumns.forEach(item => {
        columnList[this.router.url].push({
          key: item.key,
          show: item.show
        });
      });
      localStorage.setItem('columnDropdown', JSON.stringify(columnList));
    }
  }
  // 获取缓存
  getDropdown() {
    const url = this.router.url;
    if (localStorage.getItem('searchDropdown')) {
      const searchList = JSON.parse(localStorage.getItem('searchDropdown'));
      if (searchList[url]) {
        this.queryFields.forEach(item => {
          searchList[url].forEach(search => {
            if (item.key === search.key) {
              item.show = search.show;
            }
          });
        });
      }
    }
    if (localStorage.getItem('columnDropdown')) {
      const columnList = JSON.parse(localStorage.getItem('columnDropdown'));
      if (columnList[url]) {
        this.childrenColumns.forEach(item => {
          columnList[url].forEach(column => {
            if (item.key === column.key) {
              item.show = column.show;
            }
          });
        });
      }
    }
  }

  // 页面过滤
  searchData() {
    if (this.filterValue) {
      this.filterValue = this.filterValue.toString().trim().toUpperCase();
    } else {
      this.message.error('请输入查询的值');
      return;
    }

    if (!this.serviceData) {
      this.serviceData = JSON.parse(JSON.stringify(this.list));
    }
    if (!this.filterValue) {
      this.list = this.serviceData;
      return;
    }
    this.list = JSON.parse(JSON.stringify(this.serviceData)).filter(item => {
      item.children = item.children.filter(child => {
        for (let i = 0; i < this.childrenColumns.length; i++) {
          if (this.childrenColumns[i].show &&
              child[this.childrenColumns[i].key] &&
              child[this.childrenColumns[i].key].toString().indexOf(this.filterValue) !== -1) {
            return child;
          }
        }
      });
      return item.children.length > 0;
    });
  }

  batchUpdataLabel () {
    const ids = this.list.map(item => item.children)
      .reduce((pre, cur) => pre.concat(cur), [])
      .filter(item => item.checked)
      .map(item => {
        return item.id;
      }).join(',');

    if (!ids)  {
      this.message.error('请选择物件');
      return;
    }

    this.modal.open('thing-label', {
      title: '获取物件变更记录',
      params: {
        id: ids
      },
      getUrl: '/web/thing/thing-label-edit',
      postUrl: ''
    });
  }

  // 更改物件标签
  updateLabel () {

    const attributeList = this.list.map(item => item.children)
      .reduce((pre, cur) => pre.concat(cur), [])
      .filter(item => item.checked)
      .map(item => {
        return {
          id: item.id,
          attribute: item.attribute,
          attribute_check: item.attribute_check,
          thing_name: item.thing_name
        };
      });

    let error = false;

    attributeList.forEach(item2 => {
      item2.attribute.map((item3, index3) => {
        if (item3.is_required == '1') {
          if (item3.attr_type == '1') {
            if (item3.form_num == '1') {
              if (!item3.value) {
                this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
                error = true;
                return false;
              }
            } else {
              if (item3.options.some(item => item.value == null)) {
                this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
                error = true;
                return false;
              }
              // if (item3.scope && item3.options[0].value && (item3.options[0].value > item3.options[1].value)) {
              //   this.message.error(item2.thing_name + ': ' + item3.title + '最低值不可高于最高值');
              //   error = true;
              //   return false;
              // }

              // if (item3.scope
              //       && (item3.options[0].value
              //             && (((item3.options[1].value - item3.options[0].value) / item3.options[0].value) > item3.scope))
              //                   || (item3.options[0].value == 0 && item3.options[1].value > 100)) {
              //   this.message.error(item2.thing_name + ': ' + item3.title + '不符合要求');
              //   error = true;
              //   return false;
              // }
            }
          } else if (item3.attr_type == '2') {
            if (!item3.value) {
              this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
              error = true;
              return false;
            }
          }
        }
      });
    });

    if (error) {
      return;
    }


    this.http.post('/web/acceptance/purchasing-manager-edit-label', {
      data: attributeList
    }).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }


  batchZero (tplContent) {
    this.fillForm['save_reason'] = null;
    this.thingArr = this.list.map(item => item.children)
      .reduce((pre, cur) => pre.concat(cur), [])
      .filter(item => item.checked)
      .map(item => {
        return item.id;
      });

    this.modalService.create({
      nzTitle: '提示',
      nzContent: tplContent,
      nzClosable: false,
      nzOnOk: () => {
        this.list.forEach(items => {
          if ((items.checked || items.indeterminate) && items.children) {
            items.children.forEach(item => {
              if (item.checked) {
                item['save_reason'] = this.fillForm['save_reason'] || item['save_reason'];
                if (item.price_type == '1') {
                  // 固定明细价格不做处理
                } else if (item.price_type == '2') {
                  item.quote_total_price = '0.00';
                  item.total_price = 0;
                  item.tax_price = '0.00';

                  if (item.value && item.price) {
                    if (!item['workload_unit_data'][item['workload_unit_id']]['isPriceDisabled']) {
                      item.price = '0';
                    }
                    item.value = '0';
                    item.count_price = '0';
                  }

                  if (item.contract_groups instanceof Array) {
                    item.contract_groups.forEach(quote => {
                      quote.value = 0;
                      quote.count_price = '0';
                    });
                  }
                  item['quote_produce_breakdown_cache'] = null;
                  item['quote_produce_breakdown'] = [];
                } else if (item.price_type == '3') {
                                      item['quote_produce_breakdown'] = [];
                  item.quote_total_price = '0.00';
                  item.price = 0;
                  item.total_price = 0;
                  item.tax_price = '0.00';
                  item.quote_workload = 0;
                  if (item.value && item.price) {
                    if (!item['workload_unit_data'][item['workload_unit_id']]['isPriceDisabled']) {
                      item.price = '0';
                    }
                    item.value = '0';
                    item.count_price = '0';
                  }
                  if (item.contract_groups instanceof Array) {
                    item.contract_groups.forEach(quote => {
                      quote.value = 0;
                      quote.count_price = '0';
                    });
                  }
                  item['quote_produce_breakdown_cache'] = null;
                  item['quote_produce_breakdown'] = [];
                } else if (item.price_type == '4') {
                  item.quote_workload = 0;
                  item.quote_total_price = '0.00';
                  item.tax_price = '0.00';
                }
              }
            });
          }
        });
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
    return item && item.id ? item.id : index; // or item.id
  }

  delayNotice() {
    let thing_id;
    thing_id = [];
    this.list.forEach((items) => {
      if ((items.checked || items.indeterminate) && items.children) {
        this.expands[items.id] = items.expand;
        items.children.forEach(thing => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });
    //显示弹框
    this.modal.open('delay-remind', {
      current_workflow: 11200,
      thing_id: thing_id
    });
  }



}
