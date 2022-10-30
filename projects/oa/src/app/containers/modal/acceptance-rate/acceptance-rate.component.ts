import { Component, EventEmitter, Input, OnInit, Output,OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '../../../services/message.service';
import { FormBuilder } from '@angular/forms';
import { MenuService } from '../../../services/menu.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import {logger} from "codelyzer/util/logger";

@Component({
  selector: 'app-order-modal-acceptance-rate',
  templateUrl: './acceptance-rate.component.html',
})

export class AcceptanceRateComponent implements OnInit {
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @Input() score;
  @Input() version;
  @Input()optionType;
  scoreLabel = ['', '(不可接受)', '(比较差)', '(一般般)', '(干得不错)', '(非常赞)'];
  scoreLabelTemp = ['', '(不可接受)', '(比较差)', '(一般般)', '(干得不错)', '(非常赞)'];
  thingId = [];
  submitUrl = '';
  passDegree = [];
  passReason = {};
  acceptance_reason = {};
  settlement_ratio = {};
  editPrice = [];
  acceptanceVisible = false;
  isAcceptanceLoading = false;
  acceptanceRemark = '';
  storys = null;
  isNewAcceptance = false;
  things = [];
  things_label=null;
  isNogood=false;
  isGood=false;
  isSuccess=true;
  //无数据确认弹框
  is_SurePrice=false;
  amount=null;
    // 评分相关变量
  acceptanceScore =null;
  acceptanceScoreTemp = [];
  options=[];
  optionsNogood=[];
  optionsNogood2=[];
  optionsSuccess=[];
  optionsSuccess2=[]
  optionsGood=[];
  optionsGood2=[];
  optionsName='达标';
  type=1;
  inputContent='';
  newVersion=null;
  optionScore:any={
    key:39,
    version:2,
    selectValue:[],
    inputValue:[{key:null,value:null}],
    is_required:null,
  };
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modalService: NzModalService,
    private menuService: MenuService,
  ) {}

  ngOnInit() {


  }
  ngOnChanges(){
    //console.log(this.is_SurePrice)
    //console.log(this.score)
    this.newVersion=this.version
    //console.log(this.version)
    //console.log(this.newVersion)

    if (this.score.length > 0&&this.newVersion=='2') {
      //console.log(this.score)
      this.isNewAcceptance = true;
      this.acceptanceScore = this.score;
      //console.log(this.acceptanceScore)
      this.acceptanceScore[1].options.sort(function(a,b){ return a.key<b.key? -1:1})
      this.optionsSuccess=this.acceptanceScore[1].options.filter((item,index)=>{return item.type=='select'})
      this.optionsSuccess2=this.acceptanceScore[1].options.filter((item,index)=>{return item.type=='input'})
      this.acceptanceScore[2].options.sort(function(a,b){ return a.key<b.key? -1:1})
      this.optionsNogood=this.acceptanceScore[2].options.filter((item,index)=>{return item.type=='select'})
      this.optionsNogood2=this.acceptanceScore[2].options.filter((item,index)=>{return item.type=='input'})
      this.acceptanceScore[0].options.sort(function(a,b){ return a.key<b.key? -1:1})
      this.optionsGood=this.acceptanceScore[0].options.filter((item,index)=>{return item.type=='select'})
      this.optionsGood2=this.acceptanceScore[0].options.filter((item,index)=>{return item.type=='input'})
      localStorage.removeItem('thing_id')
    }  else if(this.score.length > 0&&this.newVersion=='0'&&this.optionType!='reject'){
      //console.log(this.score)
      this.acceptanceVisible = true;
      this.isNewAcceptance = true;
      this.is_SurePrice=false;
    }else if(this.score.length > 0&&this.newVersion=='0'&&this.optionType=='reject'){
      //console.log(this.score)
      this.acceptanceVisible = false;
      this.isNewAcceptance = true;
      this.is_SurePrice=false;
    }
    else if(this.score.length ==0){
      //console.log(this.score)
      this.acceptanceVisible = false;
      this.isNewAcceptance = true;
      //this.is_SurePrice=true;
    }
  }
  openModal(submitUrl, thing, passDegree, editPrice = [], passReason = null, acceptance_reason = null, storys = null, things = [], scoreLabel = null, isNewAcceptance= false, settlement_ratio = null, things_label = null) {
    if(this.score.length>0){
      //console.log(this.score)
      this.acceptanceVisible = true;
      this.is_SurePrice=false;
    }else if(this.score.length==0){
      //console.log(this.score)
      this.acceptanceVisible = false;
      this.is_SurePrice=true;
    }

    this.acceptanceRemark = '';
    //console.log(this.score)
    this.score.forEach((item, index) => {
      item['value'] = 0;
    });
    this.submitUrl = submitUrl;
    this.thingId = thing;
    this.passDegree = passDegree;
    this.passReason = passReason;
    this.acceptance_reason = acceptance_reason;
    this.settlement_ratio = settlement_ratio;
    this.editPrice = editPrice;
    this.storys = storys;
    this.things_label = things_label;
    this.things = things;
    if (this.things && this.things.length > 0) {
      this.amount = this.things.map(item => item.quote_total_price).reduce((n, t) => Number(n) + Number(t));
    }
    //console.log(this.amount)
    if (isNewAcceptance) {
      this.scoreLabel = scoreLabel;
    } else {
      this.scoreLabel = this.scoreLabelTemp;
    }
    this.isNewAcceptance = isNewAcceptance;
  }
  change(event){
    ///console.log(event)
    if (event===1) {
      this.optionsName='达标'
      //this.optionScore.version=this.acceptanceScore[0].version
      this.optionScore.key=this.acceptanceScore[1]. acceptance_evaluate_id
      this.optionScore.is_required= this.acceptanceScore[1].is_required
      this.isSuccess=true
      this.type=1
      this.isNogood=false
      this.isGood=false
      this.options.length=0
      this.optionsNogood.filter((item,index)=>{return item.checked=false})
      this.optionsGood.filter((item,index)=>{return item.checked=false})
      this.optionsNogood2.filter((item,index)=>{return item.checked=false})
      this.optionsGood2.filter((item,index)=>{return item.checked=false})
      ////console.log(this.optionsNogood)

    }else if(event==2){
      this.optionsName='较差'
      //this.optionScore.version=this.acceptanceScore[1].version
      this.optionScore.key=this.acceptanceScore[2]. acceptance_evaluate_id
      this.optionScore.is_required= this.acceptanceScore[2].is_required
      this.isNogood=true
      this.type=2
      this.isGood=false
      this.isSuccess=false
      this.options.length=0
      this.optionsGood.filter((item,index)=>{return item.checked=false})
      this.optionsSuccess.filter((item,index)=>{return item.checked=false})
      this.optionsGood2.filter((item,index)=>{return item.checked=false})
      this.optionsSuccess2.filter((item,index)=>{return item.checked=false})
    }else if(event==0){
      this.optionsName='非常棒'
      //this.optionScore.version=this.acceptanceScore[2].version
      this.optionScore.key=this.acceptanceScore[0]. acceptance_evaluate_id
      this.optionScore.is_required= this.acceptanceScore[0].is_required
      this.isGood=true
      this.type=0
      this.isNogood=false
      this.isSuccess=false
      this.options.length=0
      this.optionsNogood.filter((item,index)=>{return item.checked=false})
      this.optionsSuccess.filter((item,index)=>{return item.checked=false})
      this.optionsNogood2.filter((item,index)=>{return item.checked=false})
      this.optionsSuccess2.filter((item,index)=>{return item.checked=false})
    }
  }
  changeContent(i,key,event){
     ////console.log(event.target.value)
     ////console.log(key)
     this.optionScore.inputValue[i].key=key
     this.optionScore.inputValue[i].value=event.target.value
  }
    //较差显示
    noGood(event){
      ////console.log(event.target.name)
      this.optionsName=event.target.name
      this.isNogood=true
      this.type=2
      this.isGood=false
      this.isSuccess=false
      this.options.length=0
      ////console.log(event.target.checked)
    }
    //非常棒显示
    Good(event){
      ////console.log(event.target.name)
      this.optionsName=event.target.name
      this.isGood=true
      this.type=0
      this.isNogood=false
      this.isSuccess=false
      this.options.length=0
    }
    //达标显示
    Success(event){
      ////console.log(event.target.name)
      this.optionsName=event.target.name
      this.isSuccess=true
      this.type=1
      this.isNogood=false
      this.isGood=false
      this.options.length=0
    }
    saveKey(key,clickEvent){
      if(clickEvent==true){
        if(this.options .indexOf(key)==-1){
          this.options .push(key)

        }
        this.options .sort()
        this.optionScore.selectValue=this.options
        //console.log(this.options )
      }else if(clickEvent==false){
        this.options.splice(this.options .indexOf(key),1)
        this.options.sort()
        this.optionScore.selectValue=this.options
        //console.log(this.options )
      }
    }
  acceptanceHandleCancel() {
    this.acceptanceVisible = false;
    this.isAcceptanceLoading = false;
    this.type=1;
    this.isNogood=false;
    this.isGood=false;
    this.isSuccess=true;
  }
  acceptanceHandleOk() {
    let isSubmit = true;
    //console.log(this.score)
    this.score.forEach((item, index) => {
      console.log(item)
      if (item['value'] == 0&&item['version']=="0") {
        isSubmit = false;
        return false;
      }
    });
    //if (this.options.length==0&&this.optionsName=='较差'||this.options.length==0&&this.optionsName=='非常棒') {
      //this.message.error('至少选择一项指标');
       //return false;
     //}
     if( this.type != 1 && this.optionScore.selectValue.length==0&&this.version==2){
      this.message.error('至少选择一项指标');
       return false;
     }
    if (!isSubmit) {
     this.message.error('请完善评分数据');
      return false;
    }
    if (this.things && this.things.length > 0) {
      let amount = this.things.map(item => item.quote_total_price).reduce((n, t) => Number(n) + Number(t));
      this.modalService.create({
        nzTitle: '提示',
        nzContent: `您选择了${this.storys.size}个订单的${this.thingId.length}个物件，总金额${amount ? Number(amount).toFixed(2) : amount}。是否确认？`,
        nzClosable: false,
        nzOnOk: () => {
          this.sumbit();
        }
      });
    } else {
      this.sumbit();
    }

  }


  surePriceOK(){
    if (this.things && this.things.length > 0) {
      this.amount = this.things.map(item => item.quote_total_price).reduce((n, t) => Number(n) + Number(t));
          this.sumbit();
    }
    this.is_SurePrice=false
  }
  surePriceCancel(){
    this.is_SurePrice=false;
  }
  sumbit () {
    this.isAcceptanceLoading = true;
    this.message.isAllLoading = true;
    this.http.post(this.submitUrl, {
      thing_id: this.thingId,
      pass_degree: this.passDegree,
      pass_reason: this.passReason,
      acceptance_reason: this.acceptance_reason,
      settlement_ratio: this.settlement_ratio,
      score: this.score,
      remark: this.acceptanceRemark,
      edit_price: this.editPrice,
      things_label: this.things_label,
      //optionsName:this.optionsName,
      //options:this.options,
      //inputContent:this.inputContent,
      optionScore:this.optionScore,
      version:this.version
    }).subscribe(result => {
      this.isAcceptanceLoading = false;
      this.message.isAllLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }else if(result['code'] == 0){
        this.optionScore={
          key:39,
          version:2,
          selectValue:[],
          inputValue:[{key:null,value:null}],
          is_required:null,
        };
      this.acceptanceVisible = false;
      this.type=1;
      this.isNogood=false;
      this.isGood=false;
      this.isSuccess=true;

      this.message.success(result['msg']);
      this.getTableList();
      this.menuService.getBacklog();
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.isAcceptanceLoading = false;
    });
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }

  // 获取数据列表
  getTableList() {
    this.getList.emit();
    //console.log(658)
  }

}
