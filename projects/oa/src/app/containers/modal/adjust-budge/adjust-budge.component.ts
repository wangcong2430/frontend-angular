import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { filterOption } from '../../../utils/utils';

@Component({
  selector: 'app-modal-adjust-budge',
  templateUrl: './adjust-budge.component.html',
})

export class AdjustBudgeModalComponent implements OnInit {
  isOpen;
  loading = false;
  changeLoading = true;
  isSubmitLoading = false;
  dataModal;
  info = {};
  fromData = {
    id: '',
    product_change_sum: '0',
    brand_change_sum: '0',
  };
  filterOption = filterOption
  constructor(
    private http: HttpClient,
    private message: MessageService,
  ) {}

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
    this.info = {};
    this.fromData = {
      id: this.dataModal['id'],
      product_change_sum: '0',
      brand_change_sum: '0',
    };
    let myDate;
    myDate = new Date();
    this.fromData['year'] = (myDate.getFullYear()) + '';
    // 获取数据
    this.loading = true;
    this.http.get('web/project-budget/adjust-budget-info', {
      params: {
        'id': this.fromData['id'],
      },
    }).subscribe(results => {
      this.loading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return;
      }
      this.info = results['data'];
    });
  }

  handleOk() {
    let brand_change_sum, product_change_sum, brand_available, product_available, params;
    brand_change_sum   = parseFloat(this.fromData.brand_change_sum);
    product_change_sum = parseFloat(this.fromData.product_change_sum);
    if (brand_change_sum === 0 && product_change_sum === 0) {
      this.message.error('调整金额为0无法提交');
      return;
    }
    brand_available   = this.info['budget_list'][this.info['curr_year']]['brand_available'];
    product_available = this.info['budget_list'][this.info['curr_year']]['product_available'];
    if (brand_change_sum > parseFloat(product_available)) {
      this.message.error('产品预算不足无法调整');
      return;
    }
    if (product_change_sum > parseFloat(brand_available)) {
      this.message.error('品牌预算不足无法调整');
      return;
    }
    params = {
      project_id: this.dataModal['id'],
      year: this.info['curr_year'],
      product_change_sum: brand_change_sum,
        brand_change_sum: product_change_sum,
    };
    this.isSubmitLoading = true;
    this.http.post('web/project-budget/adjust-budget-submit', params).subscribe(results => {
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return;
      }
      this.message.success(results['msg']);
      this.getInfo();
    });
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }

  numberChange(val, key) {
    let num;
    num = (0 - parseFloat(val));
    if (key === 'product_change_sum') {
      this.fromData.brand_change_sum = num;
    } else {
      this.fromData.product_change_sum = num;
    }
  }

}
