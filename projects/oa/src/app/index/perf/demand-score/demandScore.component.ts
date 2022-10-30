import { Component,ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import {NzNotificationService} from 'ng-zorro-antd'
import { ModalService } from '../../../services/modal.service';
import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';


@Component({
  templateUrl: './demandScore.component.html',
})

export class DemandScoreComponent implements OnInit {
  @ViewChild('demandScore') demandScore: ElementRef;
  @ViewChild(SaveModalComponent)
  private saveModal: SaveModalComponent;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private translate: TranslateService,
    private fb: FormBuilder,
    private message: MessageService,
    private notification: NzNotificationService,
    private modalService: ModalService
  ) {}
  // Model 参数配置
  isModelVisible = false;
  title = 'title';
  isOkLoading = false;

  isOpen = false;
  isVisible = false
  formData;
  // loading
  loading = false;

  listLoading = false;

  // 配置项
  form = {};
  columns = [];

  childrenColumns = [];

  disabledButton = true;
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  queryFields = [];
  // 数据列表

  popExpands = {};
  list = [];
  treeSelect = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };

  //弹窗相关数据
  popLoading = false //pop
  popListLoading = false //pop
  popColumns = [] //pop
  popChildrenColumns = [] //pop
  popList=[] //pop
  popTitle=null //pop
  //分页 pop
  popPagination ={
    total_count: null,
    page_size: '20',
    page_index: '1'
  }

  model: any = {};
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
  };

  // 转交
  forward = {
    isVisible: false,
    id: '',
    userId: '',
    remark: '',
    optionList: []
  }

  ngOnInit() {
    // 获取列表配置
    this.getConfig();

    // 获取列表信息
    this.getList();
  }
  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/perf-score/perf-score-config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.form             = result['form'];
      this.queryFields      = result['search_form'];
    });
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
    this.http.get('web/perf-score/demand-person-score-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.list                   = result['list'];
      // this.list.forEach(item=>{
      //   item.score_options.forEach(item1=>{
      //     item1.score_option.score = ''
      //   })
      // })
      this.pagination.total_count = result['pager']['itemCount'];
      this.pagination.page_index  = result['pager']['page'];
      this.pagination.page_size   = result['pager']['pageSize'];
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    }
    if (event.key === 'update') {
      this.openModal(event.item);
    }else if(event.key == 'thing_detail'){
      this.showModal(event.item.thing_detail)
    }
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  // 编辑 or 新建 弹窗
  openModal(item = {}) {
    this.saveModal.openModal(this.form, item);
  }

  // 编辑框
  submitSaveForm(value=null): void {
    // const params = [];
    // this.list.forEach(value => {
    //   if (value.checked) {
    //     params.push(value);
    //   }
    // });
    var through = false;
    if (this.list.length>0) {
      this.list.forEach((value,index) => {
        var allComply = true
        value.score_options.forEach(item=>{
          if(typeof item.score_option.score =='number'&&item.score_option.score>=0&&item.score_option.score<=100&&item.score_option.score%5==0){
            item.complyRule='yes'
          }else{
            item.complyRule='no'
            allComply = false
            through = true
          }
        })
        if(!allComply){
          this.list.splice(index,1)
          this.list.unshift(value)
        }
        this.list = [...this.list]
      });
      if(through){
        this.notification.error('提交失败', '有评分未填写或者填写不是0~100内5的倍数',{nzStyle:{top:'75px'}})
        // this.message.error('有评分未填写或者填写不是0~100内5的倍数');
        return
      }
      this.message.isAllLoading = true;
      this.http.post('web/perf-score/dm-submit-score', { params: this.list }).subscribe(result => {
        this.message.isAllLoading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.saveModal.cancelModal();
        this.getList();
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
        this.message.isAllLoading = false;
      });
    }else{
      this.message.error('没有需要提交的单据');
      return
    }
  }
  //明细弹窗相关
  showModal(id:string): void {
    this.isVisible = true;
    this.getPopConfig(id)
    this.demandScore['container']['overlayElement'].style.zIndex = 790;
  }

  handleOk(): void {
    this.isVisible = false;
  }

  handleCancel(): void {
    this.isVisible = false;
  }
  // 获取页面配置
  getPopConfig(id:string) {
    this.popLoading = true;
    this.http.get('web/perf-score/demand-detail', { params: {
      id:id,
      type:'11000'
    }}).subscribe(result => {
      if(result['code']=='-1'){
        this.notification.error('获取失败', result['msg'],{nzStyle:{top:'75px'}})
        this.popLoading          = false;
        return
      }
      result['colum'].forEach(item=>{
        item.show = true
      })
      result['childrenColum'].forEach(item=>{
        item.show = true
      })
      //让子表格默认收起
      result['data'].forEach(item=>{
        item.expand = true
      })
      this.popLoading          = false;
      this.popColumns          = result['colum'];
      this.popChildrenColumns  = result['childrenColum'];
      this.queryFields      = result['search_form'];
      this.popList                   = result['data'];
      this.popTitle             =result['title']
    });
  }
//获取弹窗数据列表
  // getPopList(popPagination?: null) {
  //   this.popListLoading = true;
  //   if (popPagination) {
  //     this.popPagination = popPagination;
  //   }
  //   let params;
  //   this.searchFormData = paramsFilter(this.searchFormData);
  //   params = {
  //     page_index:  1,
  //     page_size:  10,
  //     is_test: 0,
  //     ...this.searchFormData
  //   };
  //   this.http.get('web/order/create-order-list', { params: params }).subscribe(result => {
  //     this.popListLoading            = false;
  //     if (result['code'] === 0) {
  //       this.popPagination.total_count = result['pager']['itemCount'];
  //       this.popPagination.page_index  = result['pager']['page'];
  //       this.popPagination.page_size   = result['pager']['pageSize'];
  //       this.popPagination.total_count = result['list'].length;
  //       if (this.popExpands && result['list']) {
  //         result['list'] = result['list'].map(item => {
  //           if (item.children && item.children.length > 10) {
  //             item['expand'] = true;
  //           }
  //           if (this.popExpands[item.id]) {
  //             item['expand'] = this.popExpands[item.id];
  //           }
  //           return item;
  //         });
  //       }
  //       this.popList                   = result['list'];
  //       console.log("popList",this.popList)
  //     } else {
  //       this.message.error(result['msg']);
  //     }
  //   }, err => {
  //     this.popListLoading            = false;
  //     this.message.error(err['msg']);
  //   });
  // }

    // 创建转交记录
    createForward () {
      this.forward = {
        id: '',
        isVisible: false,
        userId: '',
        remark: '',
        optionList: []
      }
      this.forward.id = this.list.filter(item => item.checked).map(item => item.id).join(',')

      this.http.get('web/perf-score/get-transfer-user-list', { params: {
        id: this.forward.id,
        node: '11300',
      }}).subscribe(result => {
        if (result['code'] === 0) {
          this.forward.optionList = result['data']
          this.forward.isVisible = true
        } else {
          this.message.error(result['msg'] || '网络异常, 请稍后再试')
        }
      }, err => {
        this.message.error(err['msg'] || '网络异常, 请稍后再试')
      });
    }

    // 提交转交
    submitForward () {
      this.http.post('web/perf-score/transfer-save', {
        id: this.forward.id,
        userId: this.forward.userId,
        remark: this.forward.remark,
        node: '11000',
      }).subscribe(result => {
        if (result['code'] === 0) {
          this.forward.isVisible = false
          this.message.success(result['msg'])
        } else {
          this.message.error(result['msg'] || '网络异常, 请稍后再试')
        }
      }, err => {
        this.message.error(err['msg'] || '网络异常, 请稍后再试')
      });
    }

    cancelForward () {
      this.forward = {
        id: '',
        isVisible: false,
        userId: '',
        remark: '',
        optionList: []
      }
    }
}
