import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';



@Component({
  templateUrl: './acceptance-evaluate.component.html',
  styles: [`
    :host ::ng-deep .table-content {
      min-height: 200px;
    }

    :host ::ng-deep .ant-spin-nested-loading > div > .ant-spin {
      min-height: 100px;
    }

    ::ng-deep .acceptance-evaluate  .ant-form-item {
      margin-bottom: 8px;
    }
  `]
})



export class AcceptanceEvaluateComponent implements OnInit {

  checked=true;
  loading = true;
  listLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  disabledButton1 = false;
  scoreOptions=[]
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  // 数据列表
  list = [];
  expands = {}; // 展开项
  isVisible = false; // 新增弹出框
  isConfirmLoading = false;
  reason = ''; // 驳回原因
  id = '';
  error: '';
  validateForm: FormGroup;
  categoryOption: [];
  socreOption:['较差','非常棒']
  radioValue = '0';
  acceptanceProcessArr: [];
  statusArr: [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  msgHint = {
    isShow: false,
    isSubmitLoading: false,
    flag: 2,
    msg: ''
  };
  //周期指标评分数据
  dataSet = [
    {
      id: 1,
      title: null,
      options: null,
      sort:null,
    },
    {
      id: 2,
      title: null,
      options:null,
      sort:null,
    },
  ];
  model = {
    options:[],
    id: null,
    name: null,
    target_full_mark: null,
    target_describe: null,
    category: ['0'],
    star_describe1: null,
    star_describe2: null,
    star_describe3: null,
    star_describe4: null,
    star_describe5: null,
    acceptanceProcess: [{weight: null, acceptance_process: null}],
    status: null,
    type: 0,
    dataSet:this.dataSet,
  };
   //新增-验收评价-周期指标数据
  keyValue: any[] =this.model.dataSet.map((item)=>{ return item.id}).sort();
  i=this.keyValue.length?this.keyValue[this.keyValue.length-1]:0

  addRow(){

    this.model.dataSet = [
      ...this.model.dataSet,
      {
        id: this.i+1,
        title: null,
        options: null,
        sort:null,
      }
    ];
    this.keyValue=this.model.dataSet.map((item)=>{ return item.id}).sort();
    this.i=this.keyValue.length?this.keyValue[this.keyValue.length-1]:this.i+1
    //console.log(this.keyValue)
    //console.log(this.i)
    //console.log(this.model.dataSet)
  }

  deleteRow(id: number): void {
    //console.log(id)
    //console.log(this.model.dataSet)
    this.model.dataSet = this.model.dataSet.filter(d => d.id !== id);
    //console.log(this.model.dataSet)
  }
  addOnBeforeTemplate = {};

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: ModalService,
    private menuService: MenuService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/acceptance/acceptance-evaluate-configs').subscribe(result => {
      this.loading = false;
      this.columns = result['columns'];
      this.childrenColumns = result['childrenColumns'];
      this.queryFields = result['search_form'];
      this.categoryOption = result['category'];
      this.acceptanceProcessArr = result['acceptanceProcess'];
      this.statusArr = result['statusArr'];
      this.getList();
      this.scoreOptions=Object.values(result['scoreOptions'])
      console.log(this.scoreOptions)
      //console.log(this.categoryOption)
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }

    this.searchFormData = paramsFilter(this.searchFormData);

    this.http.get('web/acceptance/acceptance-evaluate-list', {params: {
      page_index: this.pagination.page_index.toString(),
      page_size: this.pagination.page_size.toString(),
      ...this.searchFormData
    }}).subscribe(result => {
      result = result['data'];
      this.listLoading = false;
      this.pagination.total_count = result['pager']['itemCount'];
      this.pagination.page_index = result['pager']['page'];
      this.pagination.page_size = result['pager']['pageSize'];
      if (this.expands && result['list']) {
        result['list'] = result['list'].map(item => {
          if (item.children && item.children.length > 10) {
            item['expand'] = true;
          }
          if (this.expands[item.id]) {
            item['expand'] = this.expands[item.id];
          }
          return item;
        });
      }
      this.list = result['list'];
    }, err => {
      this.listLoading = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
  }
  //保存评价等级的对应参考指标的key值
  saveKey(key,clickEvent){
    //console.log(key)
    //console.log(clickEvent)
    if(clickEvent==true){
      if(this.model.options .indexOf(key)==-1){
        this.model.options .push(key)
      }
      this.model.options .sort()
      //console.log(this.model.options )
    }else if(clickEvent==false){
      this.model.options.splice(this.model.options .indexOf(key),1)
      this.model.options.sort()
      //console.log(this.model.options )
    }
  }
  // 按钮事件
  addAcceptanceEvaluate(optionType): void {
    this.isVisible = true;
    this.message.isAllLoading = true;
    this.http.post('web/acceptance-approve/acceptance-evaluate', {
        thing_ids: optionType,
        reason: this.reason
      }
    ).subscribe(result => {
      this.isVisible = false;
      this.message.isAllLoading = false;

      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.isVisible = false;
    });
  }

  // 点击事件
  clickEvent(event) {
    //console.log(event);
    //console.log(123)
    if (event.key === 'acceptance_update') {

      this.http.post('/web/acceptance/add-acceptance-evaluate', event.item).subscribe(result => {

        if (result['code'] === 0) {
          this.isVisible = true;
          result = result['data'];
          this.model.id               = result['id'];
          this.model.name             = result['name'];
          this.model.target_full_mark = result['target_full_mark'];
          this.model.target_describe  = result['target_describe'];
          this.model.star_describe1   = result['star_describe1'];
          this.model.star_describe2   = result['star_describe2'];
          this.model.star_describe3   = result['star_describe3'];
          this.model.star_describe4   = result['star_describe4'];
          this.model.star_describe5   = result['star_describe5'];
          this.model.acceptanceProcess = result['acceptanceProcess'];
          this.model.category         = result['category'];
          this.model.status           = result['status'];
          this.model.type             = result['type'];

          if(result['options']){
            this.scoreOptions.map((item)=>{if(item.checked){item.checked=false}})
            //console.log(result['options'])
            //console.log(this.scoreOptions)
            this.scoreOptions.map((item,index)=>{
              result['options'].map((idm,i)=>{
                if(idm==item.key){
                  item.checked=true
                }
              })
            })
            //console.log(this.scoreOptions)
          }
          if(result['data_set']){
            this.model.dataSet=result['data_set']
          }else {
            this.model.dataSet=this.dataSet
          }
        } else {
          this.message.error(result['msg']);
          this.isConfirmLoading = false;
        }
      }, () => {
        this.message.error('error');
      });
    }
  }

  showModal(): void {
    //console.log(122)
    this.isVisible = true;
    this.model.id = null;
    this.model.name = null;
    this.model.target_full_mark = null;
    this.model.target_describe = null;
    this.model.star_describe1 = null;
    this.model.star_describe2 = null;
    this.model.star_describe3 = null;
    this.model.star_describe4 = null;
    this.model.star_describe5 = null;
    this.model.acceptanceProcess = [{weight: null, acceptance_process: null}];
    this.model.category = ['0'];
    this.model.status = '0';
    this.model.dataSet=this.dataSet;
    this.scoreOptions.map((item)=>{if(item.checked){item.checked=false}})
  }

  handleOk(): void {
    this.isConfirmLoading = true;
    setTimeout(() => {
      this.isVisible = false;
      this.isConfirmLoading = false;
    }, 3000);
  }

  handleCancel(): void {
    this.isVisible = false;
    this.isConfirmLoading = false;
    this.disabledButton1 = false;
  }

  add() {
    this.model.acceptanceProcess = [...this.model.acceptanceProcess, {
      weight: null,
      acceptance_process: null
    }];
  }

  del(i) {
    if (this.model.acceptanceProcess.length > 1) {
      this.model.acceptanceProcess.splice(i, 1);
    }
  }

  // 属性弹窗保存
  AcceptanceEvaluateSaveAcceptance() {

    if (!this.model.name) {
      this.message.error('验收评分指标不能为空');
      return;
    }

    if (!this.model.target_full_mark) {
      this.message.error('指标满分不能为空');
      return;
    }

    if (!this.model.category) {
      this.message.error('服务品类不能为空');
      return;
    }

    if (!this.model.category) {
      this.message.error('服务品类不能为空');
      return;
    }

    if (!this.model.status) {
      this.message.error('状态不能为空');
      return;
    }

    let status = true;
    if (this.model.acceptanceProcess) {
      this.model.acceptanceProcess.forEach(item => {
        if (!item.acceptance_process) {
          status = false;
          this.message.error('验收流程不能为空');
          return;
        }
        if (!item.weight) {
          status = false;
          this.message.error('验收权重不能为空');
          return;
        }
      });
    }

    if (!status) {
      return;
    }

    this.isConfirmLoading = true;
    this.disabledButton1 = true;
    this.http.post('/web/acceptance/save-acceptance-evaluate', this.model).subscribe(res => {
      this.isConfirmLoading = false;
      this.disabledButton1 = false;
      if (res['code'] === 0) {
        this.message.success('保存成功');
        this.isVisible = false;
        this.getList();
      } else {
        this.message.error(res['msg']);
      }
    }, () => {
      this.isConfirmLoading = false;
      this.disabledButton1 = false;
      this.message.error('error');
    });
  }
}


