import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {MessageService} from '../../../services/message.service';
import {TranslateService} from '@ngx-translate/core';
import {FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-modal-product-budget-adjust',
  templateUrl: './product-budget-adjust.component.html',
  styleUrls: ['./product-budget-adjust.component.css']
})

export class ProductBudgetAdjustModalComponent implements OnInit {
  isOpen;
  loading = false;
  pullLoading = false;
  changeLoading = true;
  isSubmitLoading = false;
  dataModal;
  dataList = [];
  isSave = false;
  fromData = {
    id: '',
  };
  constructor(private route: ActivatedRoute
    , private router: Router
    , private http: HttpClient
    , private message: MessageService
    , private translate: TranslateService
    , private fb: FormBuilder) {
  }

  ngOnInit() {
  }

  // 开打弹窗前先获取项目及预算
  openModal(item) {
    this.dataModal = item;
    this.isOpen = true;
    this.changeLoading = true;
    this.isSubmitLoading = false;
    this.getInfo();
  }
  modalCancel() {
    this.isOpen = false;
  }

  // 初始化数据
  getInfo() {
    this.fromData = {
      id: this.dataModal['id']
    };
    this.dataList = [];
    // 获取数据
    this.loading = true;
    this.http.get('web/project-budget/get-product-budget-all', {
      params: {
        'id': this.fromData['id'],
        'is_show_approve': '2'
      },
    }).subscribe(results => {
      this.loading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return;
      }
      results['data'].forEach(data => {
        data['old_budget_available_sum'] = parseFloat(data['brand_available']) + parseFloat(data['product_available']);
        data['old_brand_available'] = data['brand_available'];
        data['old_product_available'] = data['product_available'];
        this.dataList.push(data);
      });
      this.isSave = results['isSave'];
    });
  }

  handleOk() {
    let params;
    params = {
      id: this.fromData['id'],
      data: []
    };
    this.dataList.forEach(data => {
      if (data['id']) {
        params.data.push(data);
      } else {
        if (data['budget_sum'] !== '' && data['brand_budget'] !== '') {
          params.data.push(data);
        }
      }
    });
    if (params.data.length === 0) {
      this.message.error('设置立项费用需要填写费用金额');
      return;
    }
    this.isSubmitLoading = true;
    this.http.post('web/project-budget/product-adjust-submit', params).subscribe(results => {
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return;
      }
      this.message.success(results['msg']);
      this.getInfo();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.isSubmitLoading = false;
    });
  }


  getPrice(value, item, key) {
    if (!item['product_available'] || item['product_available'] === '') {
      item['product_available'] = 0;
    }
    if (!item['brand_available'] || item['brand_available'] === '') {
      item['brand_available'] = 0;
    }
    if (key === 'brand_available') {
      item['product_available'] = (parseFloat(item['old_budget_available_sum']) - value).toFixed(2);
    } else if (key === 'product_available') {
      item['brand_available'] = (parseFloat(item['old_budget_available_sum']) - value).toFixed(2);
    }
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
