import {Component, EventEmitter, OnInit, Output, ElementRef, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {MessageService} from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-modal-product-budget',
  templateUrl: './product-budget.component.html',
  styleUrls: ['./product-budget.component.css']
})

export class ProductBudgetModalComponent implements OnInit {
  @ViewChild('productBudget') productBudget: ElementRef;

  isOpen;
  nzZIndex = 700;
  loading = false;
  pullLoading = false;
  changeLoading = true;
  isSubmitLoading = false;
  dataModal;
  dataList = [];
  dataObj = {};
  isSave = false;
  isMsh = false;
  isSaveStatus = false;
  projNo = '';
  searchProjectValue = '';
  fromData = {
    id: '',
  };
  infoModal = {
    isShow: false,
    loading: false,
    isSubmitLoading: false,
    title: '',
    msg: '',
    list: []
  };
  mapOfExpandData: { [key: string]: boolean } = {};

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService,
  ) {}

  ngOnInit() {
    this.modalService.modal$.subscribe(item => {
      if (item && item['key'] === 'product_budget') {
        this.nzZIndex = item['zIndex'];

        this.productBudget['container']['overlayElement'].style.zIndex = this.nzZIndex;
        this.openModal(item['data']);
      }
    });
  }

  // 开打弹窗前先获取项目及预算
  openModal(item) {
    this.dataModal = item;
    this.isOpen = true;
    this.changeLoading = true;
    this.isSubmitLoading = false;
    this.searchProjectValue = '';
    this.projNo = '';
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
    this.dataObj = {};
    // 获取数据
    this.loading = true;
    this.http.get('web/project-budget/get-product-budget-all', {
      params: {
        'id': this.fromData['id'],
      },
    }).subscribe(results => {
      this.loading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return;
      }
      results['data'].forEach(data => {
        data['old_budget_sum'] = data['budget_sum'];
        data['old_brand_budget'] = data['brand_budget'];
        data['old_product_budget'] = data['product_budget'];
        this.dataList.push(data);
        this.dataObj[data['pr_number']] = 1;
      });

      this.isMsh        = results['isMsh'];
      this.isSave       = results['isSave'];
      this.isSaveStatus = results['isSaveStatus'];
      this.projNo       = results['projNo'];
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
        if (data['budget_sum'] !== '' || data['brand_budget'] !== '') {
          params.data.push(data);
        }
      }
    });
    if (params.data.length === 0) {
      this.message.error('设置立项费用需要填写费用金额');
      return;
    }
    this.isSubmitLoading = true;
    this.http.post('web/project-budget/product-budget-submit', params).subscribe(results => {
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

  // 拉取项目预算
  pullProjectProduct() {
    this.pullLoading = true;
    let params;
    params =  {
      'id': this.fromData['id'],
    };
    this.pullApi(params);
  }
  // 搜索立项信息
  searchProjectProduct() {
   if (this.searchProjectValue == '') {
     this.message.error('请输入要搜索的立项单号');
     return;
   }
    this.pullLoading = true;
    let params;
    params =  {
      'id': this.fromData['id'],
      'pr_number': this.searchProjectValue.trim()
    };
    this.pullApi(params);
  }
  // 接口获取
  pullApi(params) {
    this.http.get('web/project-budget/pull-project-product', {
      params: params,
    }).subscribe(results => {
      this.pullLoading = false;
      if (results['code'].toString() === '10') {
        this.message.success(results['msg']);
        this.getInfo();
        return;
      }
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return;
      }
      this.message.success(results['msg']);
      this.searchProjectValue = '';
      if (results['data'] && Array.isArray(results['data'])) {
        results['data'].forEach(data => {
          if (!this.dataObj[data['pr_number']]) {
            data['old_budget_sum'] = data['budget_sum'];
            data['old_brand_budget'] = data['brand_budget'];
            data['old_product_budget'] = data['product_budget'];
            this.dataList.push(data);
            this.dataObj[data['pr_number']] = 1;
          }
        });
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.pullLoading = false;
    });
  }

  // 查看立项申请记录
  openInfoModal(item) {
    this.infoModal.title = item['pr_number'];
    this.infoModal.isShow = true;
    this.infoModal.loading = true;
    this.http.get('web/project-budget/budget-change-log', {
      params: {
        'pr_number': item['pr_number'],
        'project_id': item['project_id'],
      },
    }).subscribe(results => {
      this.infoModal.loading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return;
      }
      this.infoModal.list = results['data'];
      this.infoModal.msg = results['approve_user'];
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.infoModal.loading = false;
    });
  }

  getPrice(value, item, key) {
    if (value === '') {
      value = 0;
    }
    if (!item['product_budget'] || item['product_budget'] === '') {
      item['product_budget'] = 0;
    }
    if (!item['brand_budget'] || item['brand_budget'] === '') {
      item['brand_budget'] = 0;
    }
    if (key === 'brand_budget' && parseFloat(item['product_budget']) >= 0) {
      item['budget_sum'] = (value + parseFloat(item['product_budget'])).toFixed(2);
    } else if (key === 'product_budget' && parseFloat(item['brand_budget']) >= 0) {
      item['budget_sum'] = (parseFloat(item['brand_budget']) + value).toFixed(2);
    }
  }

  // 修改状态
  statusInfo(item, key) {
    this.http.post('web/project-budget/edit-status', {
      'id': item['id'],
      'status': key,
    }).subscribe(results => {
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return;
      }
      this.message.success(results['msg']);
      this.getInfo();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  // 修改锁定状态
  lockInfo(item, key) {
    this.http.post('web/project-budget/edit-lock', {
      'id': item['id'],
      'lock': key,
    }).subscribe(results => {
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return;
      }
      this.message.success(results['msg']);
      this.getInfo();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  openThingList(item, key) {
    this.modalService.open('budget', {
      data: item,
      key: key
    });
  }
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
