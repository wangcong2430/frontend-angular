import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  templateUrl: './purchasingScore.component.html',
})

export class PurchasingScoreComponent implements OnInit {

  @ViewChild('purchaseScore') purchaseScore: ElementRef;

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
  isVisible = false;
  isHandleOk = null;
  isOpen = false;
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
  popQueryFields = [] //pop
  popSelect = []//pop
  theAllList = [] //pop 存放所有的列表用来做筛选
  hasSearch=false //弹窗是否有页面筛选
  hasDropdownChange=false
  hasTishi=false //弹窗是否有提示文字
  showCheckbox=false
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
    this.http.get('web/perf-score/pm-score-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.list                   = result['list'];
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
    var through1 = false
    if (this.list.length>0) {
      this.list.forEach((value,index) => {
        var allComply = true
        value.score_options.forEach(item=>{
          if(typeof item.score_option.score =='number'&& item.score_option.score>=0&&item.score_option.score<=100&&item.score_option.score%5==0){
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
      this.list.forEach((value,index)=>{
        if(value.annotation&&value.annotation.length>200){
          through1 = true
          this.list.splice(index,1)
          this.list.unshift(value)
        }
        this.list = [...this.list]
      })
      if(through||through1){
        through1&&this.notification.error('提交失败', '有评语超出200字符',{nzStyle:{top:'75px'}})
        // this.message.error('有评分未填写或者填写不是0~100内5的倍数');
        through&&this.notification.error('提交失败', '有评分未填写或者填写不是0~100内5的倍数',{nzStyle:{top:'75px'}})
        return
      }
      this.message.isAllLoading = true;
      this.http.post('web/perf-score/pm-submit-score', { params: this.list }).subscribe(result => {
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
  //批量评分
  batchScoring(){
    this.showModal('batchScoring')
  }
  //明细弹窗相关
  showModal(id:any): void {
    this.isVisible = true;
    if(id=="batchScoring"){
      this.showCheckbox = true
      this.hasTishi = true
      this.hasSearch=false
      this.hasDropdownChange=false
      this.isHandleOk='确定'
      this.getBatchScoringConf()
    }else{
      this.showCheckbox = false
      this.hasTishi = false
      this.hasSearch=true
      this.hasDropdownChange=true
      this.isHandleOk=null
      this.getPopConfig(id)
    }
    this.purchaseScore['container']['overlayElement'].style.zIndex = 790;
  }

  handleOk(): void {
    var clearList = true
    var allRight = true
    this.popList.forEach(value => {
      value.children.forEach(item=>{
        if(item.annotation&&item.annotation.length<200){
          this.list.forEach(theValue=>{
            if(value.score_id_list.includes(theValue.id)){
              theValue.annotation=item.annotation
            }
          })
        }else if(item.annotation.length>200){
          clearList = false
          allRight = false
          this.notification.error('提交失败','有评语超出200字符')
        }
        value.children[0].score_options.forEach(item1=>{
          if(item1.score>=0&&item1.score<=100&&item1.score%5==0){
                    this.list.forEach(theValue=>{
                      if(value.score_id_list.includes(theValue.id)){
                        theValue.score_options.forEach(theItem=>{
                          if(typeof item1.score =='number'&&theItem.acceptance_evaluate_id==item1.acceptance_evaluate_id&&theItem.acceptance_evaluate_process_id==item1.acceptance_evaluate_process_id){
                            theItem.score_option.score=item1.score
                          }
                        })
                      }
                    })
                    item1.complyRule='yes'
            }else{
              clearList = false
              allRight = false
              this.notification.error('提交失败', '有评分不是0~100内5的倍数',{nzStyle:{top:'75px'}})
              item1.complyRule='no'
            }
        })

      })
    });
    if(allRight){
      this.isVisible = false
    }
    if(clearList){
      this.popList = []
    }
    this.popSelect = []
  }

  handleCancel(): void {
    this.popList = []
    this.isVisible = false;
    this.popSelect = []
  }
  // 获取页面配置
  getPopConfig(id:string) {
    this.popLoading = true;
    this.http.get('web/perf-score/demand-detail', { params: {
      id:id,
      type:'11200'
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
  //获取批量评分配置
  getBatchScoringConf() {
    this.popLoading = true;
    this.http.get('web/perf-score/batch-perf-score-config', { params: {

    }}).subscribe(result => {

      var columns = []
      var childrenColumns = []
      result['columns'].forEach(item=>{
        if(item.key=="supplier_subset"){
          childrenColumns=item.option
        }else{
          item.show = true
          columns.push(item)
        }

      })
      childrenColumns.forEach(item=>{
        item.show = true
      })
      this.popLoading          = false;
      this.popColumns          = columns;
      this.popChildrenColumns  = childrenColumns;
      this.popSelect =     result['search_form']
      // this.popList                   = result['data'];
      this.popTitle             =result['title']
      this.getBatchScoringList()
    });
  }
  //筛选批量评分列表
  selectBatchScoringList(value?){
    if(!value){
      this.popList = this.theAllList
    }else{
      this.popList  = this.theAllList.filter((item)=>{
        return item.supplier_id == value
      })
    }

  }
  //获取批量评分列表
  getBatchScoringList() {
    this.popLoading = true;
    this.http.get('web/perf-score/batch-pm-score-list', { params: {

    }}).subscribe(result => {

      this.theAllList                   = result['list'];
      this.popLoading = false
      this.selectBatchScoringList()
    });
  }

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
      node: '11200',
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



