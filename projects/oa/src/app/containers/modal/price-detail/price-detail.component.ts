import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { isArray } from 'ngx-bootstrap';

@Component({
  selector: 'app-modal-price-detail',
  templateUrl: './price-detail.component.html',
  styleUrls  : ['./price-detail.component.css']
})

export class PriceDetailModalComponent implements OnInit {
  @ViewChild('priceDetail') priceDetail: ElementRef;
  nzZIndex = 800;
  workloadUnitList = null;
  modalWidth = 600;
  selectPriceModalData = {
    isShow: false,
    isShowPriceColumn: false,   // 显示价格列
    is_show_pre_workload: true, // 显示预估工作量
    countPrice: 0,
    price_type: '1',
    showCountPrice: true,
    type: '0',
    data: [],
    agency_fees : '0',
    //radioValue : '0',
    is_separate:'0',
    flow_step_name:null,
    first_category_id:null
    // attentHide: false
  };
  currency_symbol = '';
  modelClass='1'//默认是从非核价页面点开
  type = 1 // 1 默认情况, 2. 预估工作量
  title ="价格详情"
  pre_workload_title = '需求明细数量及单位'

  currency= {
    symbol: 'CNY',
    title: '人民币'
  }
  //默认是分包
  radioValue = '1';

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(item => {
      if (item && item['key'] === 'price-detail') {
        this.nzZIndex = item['zIndex'];
        this.priceDetail['container']['overlayElement'].style.zIndex = this.nzZIndex;
        this.openModal(item['data']['item'], item['data']['key'], item['data']['showCountPrice'], item['data']['workLoadInfo'], item['data']['type'],item['data']['modelClass']);
      }
    });
  }

  // 开打弹窗
  openModal(item, key, showCountPrice = true, workLoadInfo=[], type = 1,modelClass) { 
    console.log(item) 
    if (!type) {
      type = 1
    }
    if (!modelClass) {
      modelClass = '1'
    }
    this.type = type
    this.modelClass=modelClass
    if (type == 1) {
      this.title = '价格详情';
      this.pre_workload_title = '需求明细数量及单位';
    } else if (type == 2) {;
      this.title = '预估工作量详情';
      this.pre_workload_title = '需求明细数量及单位';
    }

    this.selectPriceModalData = {
      isShow: false,
      isShowPriceColumn: false,
      countPrice: 0,
      price_type: '1',
      showCountPrice: true,
      is_show_pre_workload: true,
      type: '0',
      data: [],
      agency_fees : '0',
      //radioValue :item[key][0]['isSeparatContract']?item[key][0]['isSeparatContract']:'0',
      is_separate:item.thing&&item.thing.is_separate?item.thing.is_separate:item.is_separate,
      flow_step_name:item.flow_step_name?item.flow_step_name:null,
      first_category_id:item.thing?item.thing.first_category_id:item.first_category_id?item.first_category_id:''
      // attentHide: false
    };
  

    // this.currency = item.currency
    // if (!this.currency) {
    //   this.currency = {
    //     title: "人民币",
    //     symbol: "CNY"
    //   }
    // }

    this.modalWidth = 600;
    this.selectPriceModalData.showCountPrice = showCountPrice;
    this.currency_symbol = item['currency_symbol'] ? item['currency_symbol'] : '';

    if (!item['price_type'] || item['price_type'].toString() === '4') {
      return;
    }

    if (item.agency_fees && item.agency_fees != null && item.agency_fees > 0) {
      this.selectPriceModalData.agency_fees = item.agency_fees;
    }
    this.selectPriceModalData.data = [];
    if (!Array.isArray(item[key]) && !Array.isArray(JSON.parse(item[key]))  && item[key] && item[key] !== '') {
      JSON.parse(item[key]).forEach(data => {
        if (data.value && parseFloat(data.value) > 0) {
          this.selectPriceModalData.data.push(data);
          //this.selectPriceModalData.radioValue=data['isSeparatContract']?data['isSeparatContract']:'0'
          //this.selectPriceModalData.is_separate=item.thing.is_separate;
        }
      });
    } else {
      if (!Array.isArray(item[key]) && Array.isArray(JSON.parse(item[key]))) {
          item[key] = JSON.parse(item[key]);
          //console.log(item[key])
         //this.selectPriceModalData.radioValue=item[key][0]['isSeparatContract']?item[key][0]['isSeparatContract']:'0'
         //this.selectPriceModalData.is_separate=item.thing.is_separate
      }
      const modelData = item[key].map(data => {
          if (workLoadInfo && workLoadInfo.length > 0) {
           // console.log(workLoadInfo)                                            
            let workLoadvalue = null;                  
            const workLoad = workLoadInfo.find(res => res.id === data.id);
            workLoadvalue = workLoad && workLoad.value ? workLoad.value : null;
            this.selectPriceModalData.type = '1';
            return {...data, workLoadvalue: workLoadvalue };
          } else {
            return data;
          }
      });

      workLoadInfo = workLoadInfo.filter(i => !modelData.find(res => res.id === i.id)).map(res => {
        return {
          label: res.label,
          id: res.id,
          workLoadvalue: res.value,
          count_price: 'NA',
          workload_unit_id: 'NA',
          file_id: '',
          // id: '9',
          price: 'NA',
          remark: 'NA',
          value: 0
        };
      });
      this.selectPriceModalData.data = [...modelData, ...workLoadInfo];
      //console.log(this.selectPriceModalData.radioValue)
      //console.log(this.selectPriceModalData.is_separate)
    }

    if (this.selectPriceModalData.data.length == 0) {
      this.message.error('没有明细');
      return false;
    }
    this.selectPriceModalData.price_type = item['price_type'].toString();
    this.selectPriceModalData.isShow = true;
    this.getInfo();
  }

  getInfo() {
    if (!this.workloadUnitList) {
      this.http.get('web/workload-unit/list').subscribe(result => {
        if (result['code'] === 0) {
          this.workloadUnitList = {};
          result['data'].forEach(data => {
            this.workloadUnitList[data['value'].toString()] = data['label'];
          });
        }
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
      });
    }
    if (this.selectPriceModalData.price_type !== '1') {
      this.selectPriceModalData.countPrice = 0;
      this.selectPriceModalData.data.forEach(data => {
        if (data.count_price && parseFloat(data.count_price) >= 0) {
          if (!this.selectPriceModalData.isShowPriceColumn) {
            this.selectPriceModalData.isShowPriceColumn = true;
            this.modalWidth = 850;
          }
          this.selectPriceModalData.countPrice = parseFloat(data.count_price) + this.selectPriceModalData.countPrice;
        }
      });
    }
  }

  selectPriceModalCancel() {
    this.selectPriceModalData.isShow = false;
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
