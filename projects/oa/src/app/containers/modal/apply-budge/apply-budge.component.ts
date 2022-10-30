import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../services/message.service';
import { UploadXHRArgs } from 'ng-zorro-antd';
import { UploadService } from '../../../services/upload.service';
import { CosService } from '../../../services/cos.service';
import { filterOption } from '../../../utils/utils';

@Component({
  selector: 'app-modal-apply-budge',
  templateUrl: './apply-budge.component.html',
  styleUrls  : ['./apply-budge.component.css']
})

export class ApplyBudgeModalComponent implements OnInit {
  isOpen;
  loading = false;
  changeLoading = true;
  isSubmitLoading = false;
  isMSH = false;
  dataModal;
  info = {};
  applying = {};
  fileList = [];
  changeList = {
    list: '',
    columns: {},
    page_size: 5,
    page_index: 1,
    count: 0,
  };
  fromData = {
    id: '',
    project_budget_id: '',
    apply_type: '2',
    product_available: '0',
    brand_available: '0',
    product_budget: '0',
    brand_budget: '0',
    product_change_sum: '0',
    brand_change_sum: '0',
    msh_code: '',
    apply_memo: '',
    year: '',
    file_id: '',
  };
  filterOption = filterOption
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private message: MessageService,
    private translate: TranslateService,
    public uploadService: UploadService,
    private fb: FormBuilder,
    public cos: CosService
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

  // 提交预算
  modalOk() {
    this.isSubmitLoading = true;
    if (this.fromData['product_change_sum'].length === 0) {
      this.fromData['product_change_sum'] = '0';
    }
    if (this.fromData['brand_change_sum'].length === 0) {
      this.fromData['brand_change_sum'] = '0';
    }
    if (parseInt(this.fromData['product_change_sum']) === 0 && parseInt(this.fromData['brand_change_sum']) === 0) {
      this.message.error('品牌预算与产品预算必须有一个不为空');
      this.isSubmitLoading = false;
      return false;
    }

    if (this.isMSH) {
      if (this.fromData['msh_code'].length === 0) {
        this.message.error('MSH单号不能为空');
        this.isSubmitLoading = false;
        return false;
      }
      if (this.fromData['file_id'].length === 0) {
        this.message.error('请上传附件');
        this.isSubmitLoading = false;
        return false;
      }
    }

    this.isSubmitLoading = true;
    this.http.post('web/project-budget/apply-budget-submit', this.fromData).subscribe(results => {
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.getInfo();
    });
  }

  // 撤回预算
  modalWithdraw() {
    this.isSubmitLoading = true;
    this.http.post('web/project-budget/apply-budget-withdraw', this.fromData).subscribe(results => {
      this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.getInfo();
    });
  }

  modalCancel() {
    this.isOpen = false;
  }

  // 初始化数据
  getInfo() {
    this.info = {};
    this.applying = {};
    this.fileList = [];
    this.isMSH = false;
    this.fromData = {
      id: this.dataModal['id'],
      project_budget_id: '',
      apply_type: '2',
      product_available: '0',
      brand_available: '0',
      product_budget: '0',
      brand_budget: '0',
      product_change_sum: '0',
      brand_change_sum: '0',
      msh_code: '',
      apply_memo: '',
      year: '',
      file_id: '',
    };
    this.changeList = {
      list: '',
      columns: {},
      page_size: 5,
      page_index: 1,
      count: 0,
    };
    const myDate = new Date();
    this.fromData['year'] = (myDate.getFullYear()) + '';
    // 获取数据
    this.loading = true;
    forkJoin([
      this.http.get('web/project-budget/apply-budget', {
        params: {
          'id': this.fromData['id'],
        },
      })
    ]).subscribe(results => {
      this.loading = false;
      const [ info ] = results;
      this.info = info['info'];
      this.applying = info['applying'];
      if (this.applying && this.applying['year']) {
        this.selectYearChange(this.applying['year']);
      } else {
        this.selectYearChange(this.fromData['year']);
      }
      this.getChangeList();
    });
  }

  // 年度预算选择
  selectYearChange(value) {
    this.info['projectBudget'].forEach((item) => {
      if (item.year === value) {
        this.fromData.project_budget_id = item.id;
        this.fromData.product_available = item.product_available;
        this.fromData.brand_available = item.brand_available;
        this.fromData.product_budget = item.product_budget;
        this.fromData.brand_budget = item.brand_budget;
      }
    });
  }

  // 预算历史记录
  getChangeList(reset: Boolean = false) {
    if (reset) {
      this.changeList.page_index = 1;
    }

    this.changeLoading = true;
    this.http.get('web/project-budget/apply-budget-change', {
      params: {
        'id': this.fromData['id'].toString(),
        'page_index': this.changeList.page_index.toString(),
        'page_size': this.changeList.page_size.toString(),
      }
    }).subscribe(result => {
      this.changeLoading = false;
      this.changeList.columns = result['columns'];
      this.changeList.count = parseInt(result['pager']['itemCount']);
      if (this.changeList.count === 0) {
        this.changeList.list = '';
        return false;
      }
      this.changeList.list = result['list'];
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  // 上传附件
  // customBigReq = (item: UploadXHRArgs) => {
  //   this.uploadService.uploadBig(item, 600, data => {
  //     this.fileList = [];
  //     this.fileList.push({
  //       id: data['id'],
  //       name: data['file_name'],
  //       status: 'done',
  //     });
  //     this.fromData.file_id = data['id'];
  //   });
  // }

  beforeUploadImg = (file: File) => {
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJPG) {
      this.message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 50;
    if (!isLt2M) {
      this.message.error('Image must smaller than 100MB!');
    }
    return isJPG && isLt2M;
  }

  numberChange(val, key) {
    let num;
    if (key === 'product_change_sum') {
      num = parseFloat(this.fromData.brand_change_sum) + parseFloat(val);
    } else {
      num = parseFloat(this.fromData.product_change_sum) + parseFloat(val);
    }
    this.isMSH = (num >= 500000);
  }

  uploadChange ($event, data) {
    if ($event.type === 'success' && $event.file && $event.file.originFileObj) {
      this.fileList = [];
      this.fileList.push({
        id: $event.file.originFileObj.file_id,
        name: $event.file.name,
        status: 'done',
      });
      this.fromData.file_id = data['id'];
    }
  }


  closefile() {
    this.fromData.file_id = '';
    this.fileList = [];
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
