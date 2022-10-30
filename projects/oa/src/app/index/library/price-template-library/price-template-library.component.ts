import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService, UploadFile } from 'ng-zorro-antd';

import * as moment from 'moment';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  
moment.locale('zh-CN');

@Component({
  templateUrl: './price-template-library.component.html',
  styles: [ `
    .login-form {
      max-width: 640px;
    }
    .login-form-forgot {
      float: right;
    }

    .login-form-button {
      width: 100%;
    }
  `
  ]
})

export class PriceTemplateLibraryComponent implements OnInit {
  // loading
  loading = true;
  listLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  disabledButton = true;
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  // 数据列表
  list = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  modalData;
  ModalListData = {
    categoryList: [],
    workloadUnitList: [],
    produceBreakdownList: [],
    produceGradeList: []
  };

  dateFormat = 'yyyy-MM-dd';

  constructor(
    private http: HttpClient,
    private message: NzMessageService,
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getModalConfig();
    this.getConfig();
    this.getModalListData();
  }

  // 获取 弹窗制作明细、弹窗制作等级 数据
  typeSelect($event) {
    this.http.get('web/price-library/category-change', {
      params: {
        category_id: $event
      },
      observe: 'response',
    }).subscribe(response => {
      // 给数据换个格式，前端好显示
      let temp;
      temp = {};
      for (let i = 0; i < response['body']['data'].produceBreakdownList.length; i++) {
        let key;
        key = response['body']['data']['produceBreakdownList'][i]['value'];
        temp[key] = response['body']['data']['produceBreakdownList'][i];
      }
      this.ModalListData.produceBreakdownList =  temp; // 弹窗制作明细数据
      // 给数据换个格式，前端好显示

      this.ModalListData.produceGradeList = response['body']['data'].produceGradeList; // 弹窗制作等级数据
      if (!this.modalData['isEdit'] ) {
        // 新建进入, 以制作明细为主，给下标赋值
        let data;
        data = [];
        let run;
        for (let i = 0; i < this.ModalListData.produceBreakdownList.length; i++) {
            run = {};
            run['value'] = 0;
            run['isNeed'] = false;
            run['id'] = this.ModalListData.produceBreakdownList[i].value;
            run['label'] = this.ModalListData.produceBreakdownList[i].label;
            run['produce_breakdown_id'] = this.ModalListData.produceBreakdownList[i].value; // value就是produce_breakdown_id
            data.push(run);
        }
        this.modalData['data'].children = data;
      } else {
        // 编辑进入 ， 以children为主，给isNeed赋值
        for (let i = 0; i < this.modalData['data']['children'].length; i++) {
          this.modalData['data']['children'][i]['isNeed'] = true;
        }
        this.modalData['isVisible'] = true;
      }
    });
  }


  // Upload Files
  handleChange({ file, fileList }): void {
    const status = file.status;
    const response = file.response;
    if (status === 'removed') {
      this.modalData['file'] = [];
      this.modalData['data']['template_example'] = 0;
    }
    if (status === 'done' && response.code === 0) {
      this.message.success(`${file.name} file uploaded successfully.`);
      this.modalData['data']['template_example'] = response.data; // 模板上传成功后，更新模板id
    } else if (status === 'error') {
      this.message.error(`${file.name} file upload failed.`);
    }
  }

  // Upload open file
  handleOpen = (file: UploadFile) => {
    alert('下载、打开file');
  }

  // Upload 显示图像
  handlePreview = (img: UploadFile) => {
    this.modalData['previewImage'] = img.url || img.thumbUrl;
    this.modalData['previewVisible'] = true;
  }

  beforeUpload = (img: File) => {
    const isJPG = img.type === 'image/jpeg';
    const isPNG = img.type === 'image/png';
    const isGIF = img.type === 'image/gif';
    const isICON = img.type === 'image/x-icon';
    if (!isJPG && !isPNG && !isGIF && !isICON) {
      this.message.error('图片类型错误');
    }
    const isLt2M = img.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      this.message.error('图片最大可上传2M');
    }
    return true;
  }

// Upload Img
  imgHandleChange({ file, fileList }): void {
    const status = file.status;
    const response = file.response;
    if (status === 'removed') {
      this.modalData['img'] = [];
      this.modalData['data']['render_pic'] = 0;
    }

    if (status === 'done' && response.code === 0) {
      this.message.success(`${file.name} img uploaded successfully.`);
      this.modalData['data']['render_pic'] = response.data; // 图片上传成功后，更新模板id
    } else if (status === 'error') {
      this.message.error(`${file.name} img upload failed.`);
    }
  }

  // 请求modal列表 类别、工作量数据
  getModalListData() {
    this.http.post('web/price-library/create-dialog-config', {}, {
      params: {},
      observe: 'response',
    }).subscribe(response => {
      this.ModalListData.categoryList = response.body['data'].categoryList; // 弹窗类别数据
      this.ModalListData.workloadUnitList = response.body['data'].workloadUnitList; // 弹窗工作量数据
    });
  }


  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }
  // 获取modal页面配置
  getModalConfig() {
    this.modalData = {
      // modal页面绑定数据
      data: {},
      // Upload file
      file: [
        /*{
          id: -1,
          name: 'xxx.png',
          status: 'done',
          url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
        }*/
      ],
      // Upload img
      img: [
        /*{
          id: -1,
          name: 'xxx.png',
          status: 'done',
          url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
        }*/
      ],
      previewImage: '',
      previewVisible: false,
      isVisible: false,
      nzOkLoading: false,
      title: '',
      isEdit: false, // 是否是编辑模式
      limitData: {},
    };
    this.ModalListData.produceBreakdownList = []; // 每次清空
  }

  // modal 系列

  // 新建、编辑模板价格库
  showModal(data): void {
    this.listLoading = true;
    // 模板价格库获取产品信息
    this.http.get('web/price-library/price-library-template-config', {}).subscribe(response => {
      if (response['data'].length > 0) {
          response['data'].splice(0, 1); // 去除第一条 为空的数据
      }
      this.modalData['limitData'] = response['data'];

      if (data.item !== undefined) {
        // 编辑进入
        this.modalData['title'] = '编辑';
        this.modalData['isEdit'] = true;
        this.http.get('web/price-library/edit-price-library-template', {
          params: {
            id: data.item['price_template_library_id'],
          }
        }).subscribe(result => {
          if (result['code'] === 0) {
            if (result['data']['limit_range'] === '' || result['data']['limit_range'] === undefined) {
              // 给限制项目字段结构初始化
                result['data']['limit_range'] = [];
            }
            if (0 < result['data']['file'].length) {
              this.modalData.file = result['data']['file']; // 给模板list赋值
            }
            if (0 < result['data']['img'].length) {
              this.modalData.img = result['data']['img']; // 给img list赋值
            }
            this.modalData['data'] = result['data'];
            this.modalData['data']['category_id'] = this.modalData['data']['category_id'].toString(); // 类别id转类型
            this.modalData['data'].date_range = [this.modalData['data'].start_date, this.modalData['data'].end_date]; // 时间数据格式处理一下，避免报错
            let produceBreakdownList;
            produceBreakdownList = this.findList(data['item']['price_template_library_id']);
            this.typeSelect(produceBreakdownList['category_id']);
          } else {
            this.message.error(result['msg']);
            this.modalData['isVisible'] = false;
          }
        });

        this.http.get('web/price-library/category-change', {
          params: {
            category_id: this.findList(data['item']['price_template_library_id']) // 查询list里面的等于id的数据
          },
          observe: 'response',
        }).subscribe(res => {
          this.ModalListData.produceGradeList = res.body['data'].produceGradeList; // 弹窗制作等级数据
        });
      } else {
        // 新建进入
        this.modalData['isVisible'] = true;
        this.modalData['isEdit'] = false;
        this.modalData['title'] = '新建';
      }
      this.listLoading = false;
    });
  }

  // 遍历list里ID相等的对象返回
  findList(id): any {
    const list = this.list;
    for (let i = 0; i < list.length; i++) {
      if (list[i]['id'] === id.toString()) {
        return list[i];
      }
    }
  }
  // 获取页面配置
  getConfig() {
    this.loading = true;
    setTimeout(() => {
      // 黑色头部栏目信息
      this.columns   = [
        {
          'key' : 'price_code',
          'label': '价格库编码'
        },
        {
          'key' : 'title',
          'label': '名称'
        },
        {
          'key' : 'category_title',
          'label': '类别'
        },
        {
          'key' : 'unit_price',
          'label': '单价'
        },
        {
          'key' : 'start_date',
          'label': '开始时间'
        },
        {
          'key' : 'end_date',
          'label': '结束时间'
        }
      ];

      // 子栏目信息
      this.childrenColumns   = [
        {
          'key' : 'price_template_library_id',
          'label': 'id'
        },
        {
          'type' : 'click', // 需要点击事件
          'key' : 'produce_breakdown_title',
          'label': '制作明细'
        },
        {
          'key' : 'produce_grade_title',
          'label': '制作等级'
        },
        {
          'key' : 'workload_unit_name',
          'label': '工作量单位'
        }
      ];

      // 搜索框信息
      this.http.get('web/price-library/library-template-configs', { params: this.searchFormData }).subscribe(result => {
        this.loading          = false;
        this.queryFields      = result['search_form'];
        this.getList();
      });
    }, 1000);
  }

  // 新建、编辑提交
  handleOk(): void {
    let length;
    try {
      length = this.modalData['data']['children'].length;
      if (length <= 0) {
        this.message.error('制作明细不可为空');
        this.modalData.nzOkLoading = false;
        return;
      }
    } catch (e) {
      this.message.error('制作明细不可为空');
      this.modalData.nzOkLoading = false;
      return;
    }
    let detailData; // 需要提交的明细数据
    detailData = [];

    let Data; // 需要提交的数据
    Data = this.modalData['data'];
    for (let i = 0; i < length; i++) {
      if (this.modalData['data']['children'][i]['isNeed']) {
        detailData.push(this.modalData['data']['children'][i]);
      }
    }
    // 判断提交的数据是否有
    if (detailData.length <= 0) {
      this.message.error('制作明细不可为空');
      this.modalData.nzOkLoading = false;
      return;
    }
    // 判断名称、有效期、渲染图、模板是否有上传
    if (!Data['title']) {
      this.message.error('名称不可为空');
      return;
    }
    if (!Data['date_range']) {
      this.message.error('请选择有效期!');
      return;
    }
    if (!Data['render_pic']) {
      this.message.error('请上传渲染图!');
      return;
    }
    if (!Data['template_example']) {
      this.message.error('请上传模板!');
      return;
    }
    this.modalData.nzOkLoading = true;
    // 提交数据
    this.http.post('web/price-library/save-price-library-template', {
      price_library: Data,
      price_library_detail: detailData // 制作明细数据
    }).subscribe(response => {
      if (response['code'].toString() === '0') {
        this.modalData['isVisible'] = false;
        this.message.success(response['msg']);
        this.getModalConfig(); // 关闭modal，清空数据避免脏数据
        this.getList();
      } else if (response['code'].toString() === '-1') {
        this.message.error(response['msg']);
      }
      this.modalData['nzOkLoading'] = false;
    }, error => {
      this.message.error(error.message);
      this.modalData.nzOkLoading = false;
    });
  }

  handleCancel(): void {
    this.getModalConfig(); // 关闭modal，清空数据避免脏数据
    this.modalData['isVisible'] = false;
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);

    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/price-library/price-library-template-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.pagination.total_count = result['pager']['itemCount'];
      this.pagination.page_index  = result['pager']['page'];
      this.pagination.page_size   = result['pager']['pageSize'];
      this.list                   = result['list'];
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }


  // 失去焦点事件
  blurEvent(event) {
    if (event.key === 'producer_name') {
    }
  }

  isNeed($event, i) {}

  detailInput($event, i) {
    this.modalData['data'].children[i].value = $event;
  }

  makeDetailSelect($event, i) {
    this.modalData['data'].children[i].produce_breakdown_id = $event;
  }

  makeLevelSelect($event, i) {
    this.modalData['data'].children[i].produce_grade_id = $event;
  }

  workSelect($event, i) {
    this.modalData['data'].children[i].workload_unit_id = $event;
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
    return item.id ? item.id : index; // or item.id
  }
}
