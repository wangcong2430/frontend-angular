import { Component, Injectable, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { FormlyFieldConfig} from '@ngx-formly/core';
import * as moment from 'moment';
import { filterOption } from '../../../utils/utils';

moment.locale('zh-CN');

@Injectable()
@Component({
  templateUrl: './price-library.component.html',
  styles  : [
    `
      .example-input .ant-input {
        width: 200px;
        margin: 0 8px 8px 0;
      }
    `
  ]
})

export class PriceLibraryComponent implements OnInit {
  validateForm: FormGroup;
  isVisible = false; // 弹窗是否显示
  isOkLoading = false; // 是否加载状态
  dataSet = {}; // table数据
  modelClass = 'PriceLibrary'; // model名字， 用于获取table数据
  modalData; // 编辑时数据带入弹窗
  ModalListData = {
    categoryList: [],
    workloadUnitList: [],
    produceBreakdownList: [],
    produceGradeList: []
  };
  pagination = {
    previous_text: 'previous',
    next_text: 'next',
    total_count: null,
    page_size: 20,
    page_index: '1',
    nzLoading: false,
  };
  queryFields: FormlyFieldConfig[];
  columns;
  filterOption = filterOption
  constructor(
    private http: HttpClient,
    private message: MessageService,
  ) {}

  ngOnInit() {
    this.getDataSet();
    this.getModalListData();
    this.getModalData();
  }

  // 页码改变时
  pageIndexChange(page_index) {
    this.pagination.page_index = page_index;
    this.getDataSet();
  }

  // 每页显示数改变时
  pageSizeChange(page_size) {
    this.pagination.page_size  = page_size;
    this.pagination.page_index = '1';
    this.getDataSet();
  }

  getModalData () {
    this.modalData = {
      title: '',
      category_id: '0',
      start_date: '',
      end_date: '',
      date_range: [],
    };
  }
  // 显示modal
  showModal(data) {
    this.isVisible = true;
    if (data != null) {
      // 编辑进入
      this.modalData = data;
      this.modalData.title = '编辑';
      this.modalData.date_range = [this.modalData.start_date, this.modalData.end_date]; // 时间数据格式处理一下，避免报错
      this.modalData.category_id = this.modalData.category_id.toString();
      this.typeSelect(this.modalData.category_id); // 编辑时，帮制作等级、制作明细数据加载
    } else {
      // 新建进入
      this.modalData.title = '新建';
    }
  }

  // modal确定按钮
  handleOk(): void {
    const data = this.modalData;
    if (!data.category_id) {
      this.message.error('请选择类别');
      return ;
    }
    if (!data.produce_breakdown_id) {
      this.message.error('请选择明细');
      return ;
    }
    /*if (!data.produce_grade_id) {
      this.message.error('请选择制作等级');
      return ;
    }*/
    if (!data.workload_unit_id) {
      this.message.error('请选择工作量单位');
      return ;
    }
    if (!data.unit_price) {
      this.message.error('请填写单价');
      return ;
    }
    if (data.date_range !== undefined && data.date_range.length > 0) {
      data.start_date = data.date_range[0];
      data.end_date = data.date_range[1];
    } else {
      this.message.error('选择有效期');
      return ;
    }
    this.isOkLoading = true; // loading
    this.http.post('web/price-library/save-price-library', {
      data: data
    }, {
      observe: 'response'
    }).subscribe(response => {
      this.isOkLoading = false;
      if (response.body['code'] === 0) {
        // 新建、保存成功
        this.isVisible = false;
        this.message.success(response.body['msg']);
        this.getDataSet();
      } else {
        this.message.error(response.body['msg']);
      }
    }, error => {
      this.message.error(error.message);
      this.isOkLoading = false;
    });
  }

  // modal 取消按钮
  handleCancel(): void {
    this.getModalData(); // 每次关闭modal，数据清除。避免脏数据
    this.isVisible = false;
  }

  // 请求table数据
  getDataSet() {
    this.http.post('web/price-library/price-library-list', {}, {
      params: {
        'modelClass': this.modelClass.toString(),
        'page_index': this.pagination.page_index.toString(),
        'page_size': this.pagination.page_size.toString(),
      },
      observe: 'response',
    }).subscribe(response => {
      this.dataSet = response.body['list'];
      this.pagination.total_count = response.body['pager']['itemCount'];
      this.pagination.page_index  = response.body['pager']['page'];
      this.pagination.page_size   = response.body['pager']['pageSize'];
    });
  }

  // 请求modal列表 类别、工作量数据
  getModalListData() {
    this.http.post('web/price-library/create-dialog-config', {}, {
      params: {},
      observe: 'response',
    }).subscribe(response => {
      this.ModalListData.categoryList = response.body['data']['categoryList']; // 弹窗类别数据
      this.ModalListData.workloadUnitList = response.body['data']['workloadUnitList']; // 弹窗工作量数据
    });
  }

  typeSelect($event) {
    this.http.get('web/price-library/category-change', {
      params: {
        category_id: $event
      },
      observe: 'response',
    }).subscribe(response => {
      if (response.body['data']['produceBreakdownList'].length < 2) {
        this.modalData.produce_breakdown_id = 0;
      }
      if (response.body['data']['produceGradeList'].length < 2) {
        this.modalData.produce_grade_id = 0;
      }
      this.ModalListData.produceBreakdownList = response.body['data']['produceBreakdownList']; // 弹窗制作明细数据
      this.ModalListData.produceGradeList = response.body['data']['produceGradeList']; // 弹窗制作等级数据


    });
  }

  makeDetailSelect($event) {

  }

  makeLevelSelect($event) {

  }

  workSelect($event) {

  }

  rangPickerModelChange (dates, model) {
    if (dates && moment(dates[0]).second() != 0) {
      dates[0] = moment(dates[0]).startOf('day').format();
    }

    if (dates && moment(dates[1]).second() != 59) {
      dates[1] = moment(dates[1]).endOf('day').format();
    }
    model = dates;
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }

}
