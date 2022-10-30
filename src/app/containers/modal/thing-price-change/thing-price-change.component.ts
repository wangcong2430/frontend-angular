import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpRequest, HttpEventType, HttpEvent, HttpResponse } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';

@Component({
  selector: 'app-modal-thing-price-change',
  templateUrl: './thing-price-change.component.html',
  styleUrls  : ['./thing-price-change.component.css']
})

export class ThingPriceChangeModalComponent implements OnInit {
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  dateFormat = 'yyyy-MM-dd';
  isOpen;
  loading = false;
  isSubmitLoading = false;
  dataModal;
  data  = {
    list: null,
    columns: {},
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private message: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {}

  // 开打弹窗前先获取项目及预算
  openModal(item) {
    this.dataModal = item;
    this.isOpen = true;
    this.isSubmitLoading = false;
    this.getInfo();
  }


  modalCancel() {
    this.isOpen = false;
  }

  // 提交
  modalOk() {
    const params = [];
    let error = false;
    this.data.list.forEach(item => {
      let errorHint = '';
      if (!item['reason'] || item['reason'] === '') {
        errorHint += ',变更原因不能为空';
      }
      if (!item['memo'] || item['memo'] === '') {
        errorHint += ',变更详情不能为空';
      }
      if (!item['new_workload'] || item['new_workload'] === '') {
        errorHint += ',数量不能为空';
      }
      if (!item['new_unit_price'] || item['new_unit_price'] === '') {
        errorHint += ',单价不能为空';
      }
      if (!item['new_total_price'] || item['new_total_price'] === '') {
        errorHint += ',总价不能为空';
      }
      if (!item['new_committed_delivery_date'] || item['new_committed_delivery_date'] === '') {
        errorHint += ',承诺交付日期不能为空';
      }
      if (errorHint && errorHint !== '') {
        this.message.error('物件: ' + item['thing_code'] + errorHint);
        error = true;
        return false;
      }
      params.push(item);
    });
    if (error) {
      return false;
    }
    this.isSubmitLoading = true;
    this.http.post('web/price/price-change-apply', {params: params}).subscribe(results => {
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.modalCancel();
      this.getList.emit();
    });
  }

  // 初始化数据
  getInfo() {
    this.data = {
      list: null,
      columns: {},
    };
    // 获取数据
    this.loading = true;
    forkJoin([
      this.http.get('web/price/price-change-check', {
        params: {
          'id': this.dataModal['id'].join(','),
        },
      })
    ]).subscribe(results => {
      this.loading = false;
      const [ info ] = results;
      if (info['code'].toString() !== '0') {
        this.modalCancel();
        this.message.error(info['msg']);
        return false;
      }
      this.data.list    = info['data']['list'];
      this.data.columns = info['data']['columns'];
    });
  }

  // 价格计算
  getPrice(item, key) {
    let workload, unit_price, total_price;
    workload = 0;
    unit_price = 0;
    total_price = 0;
    if (item['new_workload']) {
      workload = parseFloat(item['new_workload']);
    }
    if (item['new_unit_price']) {
      unit_price = parseFloat(item['new_unit_price']);
    }
    if (item['new_total_price']) {
      total_price = parseFloat(item['new_total_price']);
    }
    if (key === 'new_workload') {
      if (unit_price) {
        total_price = (unit_price * workload);
      } else if (total_price && workload > 0) {
        unit_price = (total_price / workload);
      }
    } else if (key === 'new_unit_price') {
      if (workload) {
        total_price = (unit_price * workload);
      } else if (total_price && unit_price > 0) {
        workload = (total_price / unit_price);
      }
    } else if (key === 'new_total_price') {
      if (unit_price && unit_price > 0) {
        workload = (total_price / unit_price);
      } else if (workload && workload > 0) {
        unit_price = (total_price / workload);
      }
    }
    item['new_workload']    = workload.toFixed(3);
    item['new_unit_price']  = unit_price.toFixed(2);
    item['new_total_price'] = total_price.toFixed(2);
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
