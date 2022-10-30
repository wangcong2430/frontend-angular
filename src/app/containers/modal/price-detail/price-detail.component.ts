import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpRequest, HttpEventType, HttpEvent, HttpResponse } from '@angular/common/http';
import { UploadXHRArgs } from 'ng-zorro-antd';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-modal-price-detail',
  templateUrl: './price-detail.component.html',
  styleUrls  : ['./price-detail.component.css']
})

export class PriceDetailModalComponent implements OnInit {
  workloadUnitList = null;
  selectPriceModalData = {
    isShow: false,
    currency_symbol: 'CNY',
    isShowPriceColumn: false,
    countPrice: 0,
    price_type: '1',
    showCountPrice: true,
    data: []
  };
  currency = {
    symbol: "CNY",
    title: "人民币"
  }
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private message: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {}

  // 开打弹窗
  openModal(item, key, showCountPrice = true) {
    this.selectPriceModalData = {
      isShow: false,
      currency_symbol: 'CNY',
      isShowPriceColumn: false,
      countPrice: 0,
      price_type: '1',
      showCountPrice: true,
      data: [],
    };
    // this.currency = item.currency

    // if (!this.currency) {
    //   this.currency.symbol = item.currency_symbol
    // }

    this.selectPriceModalData.showCountPrice = showCountPrice;

    if (!item['price_type'] || item['price_type'].toString() === '4') {
      return;
    }

    this.selectPriceModalData.data = [];
    if (!Array.isArray(item[key]) && item[key] && item[key] !== '') {
      JSON.parse(item[key]).forEach(data => {
        if (data.value && parseFloat(data.value) > 0) {
          this.selectPriceModalData.data.push(data);
        }
      });
    } else {
      item[key].forEach(data => {
        if (data.value && parseFloat(data.value) > 0) {
          this.selectPriceModalData.data.push(data);
        }
      });
    }

    if (this.selectPriceModalData.data.length == 0) {
      this.message.error('没有明细');
      return false;
    }
    this.selectPriceModalData.price_type = item['price_type'].toString();
    this.selectPriceModalData.currency_symbol = item['currency_symbol'];
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
      });
    }
    if (this.selectPriceModalData.price_type !== '1') {
      this.selectPriceModalData.countPrice = 0;
      this.selectPriceModalData.data.forEach(data => {
        if (data.count_price && parseFloat(data.count_price) > 0) {
          if (!this.selectPriceModalData.isShowPriceColumn) {
            this.selectPriceModalData.isShowPriceColumn = true;
          }
          this.selectPriceModalData.countPrice = parseFloat(data.count_price) + this.selectPriceModalData.countPrice;
        }
      });
    }
  }

  selectPriceModalCancel() {
    this.selectPriceModalData.isShow = false;
  }
}
