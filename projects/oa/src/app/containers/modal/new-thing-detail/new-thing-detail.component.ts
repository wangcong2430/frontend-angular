import { Component, OnInit, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2} from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpEvent, HttpResponse } from '@angular/common/http';
import { UploadXHRArgs } from 'ng-zorro-antd';
import { MessageService } from '../../../services/message.service';
import { UploadService } from '../../../services/upload.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { CosService } from '../../../services/cos.service';
import { Observable } from 'rxjs';
import { isArray } from 'ngx-bootstrap';
@Component({
  selector: 'app-modal-new-thing-detail',
  templateUrl: './new-thing-detail.component.html',
  styleUrls  : ['./new-thing-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class NewThingDetailModalComponent implements OnInit {
  @ViewChild('thingDetail') thingDetail: ElementRef;
  @ViewChild('thingDetailRemark') thingDetailRemark: ElementRef;

  distance = {
    x: 0,
    y: 0
  }
  isShowDetail2=true;
  isShowDetail3=true;
  isOpen: Boolean = false;
  nzZIndex = 800;
  tabsetIndex = 0;
  isChangeThing = false;
  loading = false;
  isSubmitLoading = false;
  acceptance_evaluate_type = 0;
  acceptance_evaluate_total_score = 0;
  set_total_score = 0;
  dataModal;
  info = null;
  fileList = [];
  thingId = null;
  quoteList = {
    list: [],
    columns: [],
  };
  isEvalute=true;
  isScore_detail=false;
  score_detail=null;
  score_type=null;
  attachment = {
    list: {},
    columns: [],
    columns2: [],
    final_work_uploadfile_exts:[],
    show_figure_uploadfile_exts:[]
  };
  remarkModalData = {
    submitLoading: false,
    isShow: false,
    remark: '',
    file_id: '',
    file_name: '',
    fileList: []
  };
  changeData = {
    changeLoading: false,
    changeList: [],
    changeColumns: [],
    changePagination: {},
    quoteLoading: false,
    quoteList: [],
    quoteColumns: [],
    quotePagination: {},
    remarkLoading: false,
    remarkList: [],
    isAddRemark: '',
    remarkColumns: [],
    remarkPagination: {},
  };
  delayChangeData = {
    delayChangeLoading: false,
    delayChangeList: [],
    delayChangeColumns: [],
    delayChangePagination: {},
  };
  uploadModal = {
    isShow: false,
    percent: 0,
    msg: ''
  };
  syncModal = {
    isShow: false,
    list: [],
    isRecommend: false,
    onList: []
  };

  // 测试单 弹窗
  testModal = {
    id: '',
    isVisible: false,
    pass_reason: '',
    file_id: null,
    FileList: []
  };

  urlList = [];

  showUploadList = {
    showPreviewIcon: true,
    showRemoveIcon: true,
    hidePreviewIconInNonImage: true
  };

  thing_quote=null;
  thingQuote=null;
  //区分是否是核价页面
  modelClass=null
  // 计数器
  timer = 0;
  constructor(
    private http: HttpClient,
    private message: MessageService,
    public uploadService: UploadService,
    public menuService: MenuService,
    private modalService: ModalService,
    private cd: ChangeDetectorRef,
    public cos: CosService,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.modalService.modal$.subscribe((item:any) => {  
      console.log(item)
      //this.modelClass=item.data.modelClass 
      
      //this.thing_quote=item.data.thing_quote
      //console.log( this.thing_quote)
      if (item && item['key'] === 'thing' && item['data'].id) {
        this.isOpen = true;
        this.timer = 0;
        this.nzZIndex = item['zIndex'];
        this.thingDetail['container']['overlayElement'].style.zIndex = this.nzZIndex;

        let tab = 0;
        this.thingId = item['data'].id;
        this.modelClass=item.data.modelClass
        //console.log(this.modelClass) 
        if(item.data.thing_quote){
          this.thing_quote=item.data.thing_quote          
        }
        else if(item.data.thingQuote){
          this.thingQuote=item.data.thingQuote
          this.thingQuote.price_type=item.data.price_type?item.data.price_type:null
          this.thingQuote.produce_breakdown=item.data.produce_breakdown?item.data.produce_breakdown:null                   
        }else{
          this.thingQuote=item.data?item.data:null
          
          if(item.data&&item.data.produce_breakdown&&item.data.produce_breakdown!=""){         
            if(!isArray(item.data.produce_breakdown)){
              this.thingQuote.produce_breakdown=JSON.parse(item.data.produce_breakdown)              
            }else{
              this.thingQuote.produce_breakdown=item.data.produce_breakdown             
            }           
          }                                       
        }
        
        
        if (item['data']['status'] === 'upload') {
          tab = 2;
        }
        this.initModal(item['data'], tab);
        //console.log(this.modelClass)
      }
      //console.log(this.modelClass)
    });
    

    this.modalService.complete$.subscribe(item => {
      if (item['key'] === 'thing-label') {
        this.getInfo();
      }
    });

  }
  

  getList () {
    this.modalService.complete('thing', {
      code: 0
    });
  }

  // 开打弹窗前先获取项目及预算
  initModal(item, tab = 0) {
    this.tabsetIndex = tab;
    this.dataModal = item;
    this.isSubmitLoading = false;
    this.loading = true;
    this.info = {};
    this.cd.markForCheck();
    this.getInfo();
  }

  modalCancel() {
    this.modalService.complete("thing",{"code":0});
    this. thing_quote=null
    this. thingQuote=null;
    this.isOpen = false;
    if (this.timer) {
      this.getList();
    }
  }

  // 初始化数据
  getInfo() {
    if (!this.thingId) {
      return;
    }

    this.http.get('web/thing/detail', {
      params: {
        id: this.thingId,
      },
    }).subscribe(info => {      
      this.loading = false;
      this.info    = info;
      this.info['base']['id'] = this.info['base']['thing_id'] ? this.info['base']['thing_id'] : this.thingId;
      this.quoteList.columns = info['quoteColumns'];
      this.attachment.columns = info['attachmentColumns'];
      this.attachment.columns2 = info['attachmentColumns2'];
      this.attachment.show_figure_uploadfile_exts = info['base'].show_figure_uploadfile_exts;
      this.attachment.final_work_uploadfile_exts = info['base'].final_work_uploadfile_exts;
      if (info['base']) {
        this.urlList = info['base']['current_user_names'];
      }

      if (info['thing'] && info['thing']['quote']) {
        this.quoteList.list    = info['thing']['quote'];
        this.acceptance_evaluate_type   = info['thing']['acceptance_evaluate_type'];
        this.acceptance_evaluate_total_score   = info['thing']['acceptance_evaluate_total_score'];
        this.set_total_score   = info['thing']['set_total_score'];
      } else {
        this.quoteList.list    = [];
      }
      if(info['thing']&& info['thing']['score_type']==1){
        this.score_type=info['thing']['score_type'];
        this.score_detail=info['thing']['score_detail'];        
        this.isEvalute=false;
        this.isScore_detail=true        
      }else if(info['thing']&& info['thing']['score_type']==0){
        this.score_type=info['thing']['score_type'];
        this.score_detail=null;
        this.isEvalute=true;
        this.isScore_detail=false 
      }      
      if (info['attachment']) {
        this.attachment.list['1000']   = info['attachment']['1000'] ? info['attachment']['1000'] : [];
        this.attachment.list['1005']   = info['attachment']['1005'] ? info['attachment']['1005'] : [];
        this.attachment.list['1010']   = info['attachment']['1010'] ? info['attachment']['1010'] : [];
      } else {
        this.attachment.list   = {
          '1000': [],
          '1005': [],
          '1010': [],
        };
      }
  //修复明细按钮消失问题
  if (!info['thing']['pre_produce_breakdown'] || info['thing']['pre_produce_breakdown'] === '') {
    this.isShowDetail2=false
    return false;
  }
  if (!Array.isArray(info['thing']['pre_produce_breakdown'])) {
    this.isShowDetail2= Array.isArray(JSON.parse(info['thing']['pre_produce_breakdown'])) && JSON.parse(info['thing']['pre_produce_breakdown']).some(item => item.value||item.pre_value);
  } else {
    this.isShowDetail2= info['thing']['pre_produce_breakdown'].some(item => item.value);
  }

  
 
      this.cd.markForCheck();
    }, err => {
      this.loading = false;
      this.message.error(err.msg);
      this.cd.markForCheck();
    });
  }

  // 标签页选中
  tabsetChange(value) {
    if ('changeData' === value) {
      this.getChangeList();
      if (this.info['isShowPrice']) {
        this.getQuiteList();
      }
      this.getRemarkList();
      this.loading = false;
    } else if ('changeDelayData' === value) {
      this.getDelayList();
    }
    this.cd.markForCheck();
  }

  // 获取数据列表
  getChangeList() {
    this.changeData.changeList = [];
    this.changeData.changeLoading = true;
    this.cd.markForCheck();
    this.http.get('web/thing/change-list', { params: {
      id: this.thingId,
    }}).subscribe(result => {
      this.changeData.changeLoading = false;
      this.changeData.changeList    = result['list'];
      this.changeData.changeColumns = result['columns'];
      this.cd.markForCheck();
    }, err => {
      this.changeData.changeLoading = false;
      this.message.error(err.msg);
      this.cd.markForCheck();
    });
  }

  // 获取列表
  getQuiteList() {
    this.changeData.quoteLoading = true;
    this.changeData.quoteList = [];
    this.http.get('web/thing/quote-list', {params: {
      id: this.thingId,
    }}).subscribe(result => {
      this.changeData.quoteLoading  = false;
      this.changeData.quoteList     = result['list'];
      this.changeData.quoteColumns  = result['columns'];
      this.cd.markForCheck();
    }, err => {
      this.message.error(err.msg);
      this.cd.markForCheck();
    });
  }

  // 获取备注列表
  getRemarkList() {
    this.changeData.remarkLoading = true;
    this.changeData.remarkList = [];
    this.cd.markForCheck();
    this.http.get('web/thing/remark-list', { params: {
      id: this.thingId,
    }}).subscribe(result => {
      this.changeData.remarkLoading  = false;
      this.changeData.remarkList     = result['list'];
      this.changeData.isAddRemark    = result['isAddRemark'] ? result['isAddRemark'] : '';
      this.changeData.remarkColumns  = result['columns'];
      this.cd.markForCheck();
    }, err => {
      this.changeData.remarkLoading  = false;
      this.message.error(err.msg);
      this.cd.markForCheck();
    });
  }

  // 添加物件备注
  addThingRemarkModal() {
    this.remarkModalData.isShow = true;
    this.remarkModalData.submitLoading = false;
    this.remarkModalData.remark = '';
    this.remarkModalData.file_id = '';
    this.remarkModalData.fileList = [];
    this.timer++;
    this.nzZIndex = this.nzZIndex + 1;

    // this.thingDetailRemark['container']['overlayElement'].style.zIndex = this.nzZIndex + 1;
    this.cd.markForCheck();
  }

  addThingRemarkModalOk() {
    if (this.remarkModalData.remark === '' || this.remarkModalData.remark.length === 0) {
      this.message.error('备注信息不能为空');
      this.cd.markForCheck();
      return;
    }

    if (this.remarkModalData.fileList.length > 0) {
      this.remarkModalData.fileList.forEach(data => {
        if (data['id']) {
          this.remarkModalData.file_id = data['id'];
        }
      });
    }

    this.remarkModalData.submitLoading = true;
    this.cd.markForCheck();
    this.http.post('web/thing/add-thing-remark', {
      id : this.thingId,
      remark : this.remarkModalData.remark,
      file_id : this.remarkModalData.file_id
    }).subscribe(results => {
      this.remarkModalData.submitLoading = false;
      this.timer++;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.message.success(results['msg']);
      this.addThingRemarkModalCancel();
      this.getRemarkList();
      this.cd.markForCheck();
    }, err => {
      this.message.error(err.msg);
      this.cd.markForCheck();
    });
  }

  addThingRemarkModalCancel() {
    this.remarkModalData.isShow = false;
    this.cd.markForCheck();
  }

  // 删除备注
  changeRemark(key, item) {
    if (key === 'del') {
      this.http.post('web/thing/del-thing-remark', {
        id: item.id
      }).subscribe(results => {
        if (results['code'] === 0) {
          this.timer++;
          this.getRemarkList();
          this.message.success(results['msg']);
        } else {
          this.message.error(results['msg']);
        }
        this.cd.markForCheck();
      }, err => {
        this.message.error(err.msg);
        this.cd.markForCheck();
      });
    }
  }

  getAttachmentList() {
    this.http.get('web/thing/attachment-list', {
      params: {
        id: this.thingId,
      },
    }).subscribe(results => {
      this.attachment.list['1000']   = results['data']['1000'] ? results['data']['1000'] : [];
      this.attachment.list['1005']   = results['data']['1005'] ? results['data']['1005'] : [];
      this.attachment.list['1010']   = results['data']['1010'] ? results['data']['1010'] : [];
      this.timer++;
      this.cd.markForCheck();
    }, err => {
      this.message.error(err.msg);
      this.cd.markForCheck();
    });
  }

  // 同步蜘蛛系统
  synchronou(item) {
    this.message.isAllLoading = true;
    this.http.post('web/thing/synchronous', {
      id: this.thingId,
      file_id: item.id
    }).subscribe(results => {
      this.message.isAllLoading = false;
      this.timer++;
      if (results['code'].toString() !== '0' && results['code'].toString() === '-1') {
        this.message.error(results['msg']);
        return false;
      } else if (results['code'].toString() !== '0') {
        this.syncModal.isShow = true;
        this.syncModal.list = results['data'] || [];
        return false;
      }
      this.message.success(results['msg']);
      this.getAttachmentList();
      this.cd.markForCheck();

    }, err => {
      this.message.error(err.msg);
      this.cd.markForCheck();
    });
  }

  // 制作完成按钮事件
  completed() {
    this.isSubmitLoading = true;
    this.cd.markForCheck();
    this.http.post('web/order/apply-producer-acceptance', {
      ids: this.thingId,
    }).subscribe(result => {
      this.isSubmitLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.isOpen = false;
      this.message.success(result['msg']);
      this.isChangeThing = true;
      this.timer++;
      this.menuService.getBacklog();
      this.cd.markForCheck();
    }, err => {
      this.message.error(err.msg);
      this.isOpen = false;
      this.cd.markForCheck();
    });
  }

  // 图片预览
  showImg(url) {
    this.modalService.open('photo', {
      title: '',
      url: url
    });
    this.cd.markForCheck();
  }

  // 设置展示图
  thingFigure(item) {
    this.http.post('web/thing/set-thing-figure', {
      id: this.dataModal['id'],
      file_id: item['id']
    }).subscribe(results => {
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      if (this.info['base']) {
        this.info['thing']['show_figure_id'] = item['id'];
      }
      this.cd.markForCheck();
    });
  }

  // 显示明细
  showPriceDetail(item, key, event) {
    let showCountPrice = true;
    let type = "1";
    //指明是预期的，需求明细模板
    if(key == 'pre_produce_breakdown'){
      showCountPrice = false;
      type = "2";
    }
    //流程在待核价前，需求明细模板
    if(item.current_workflow <= '10400'){
      showCountPrice = false;
      type = "2";
    }
    event.stopPropagation();
    this.modalService.open('price-detail', {
      item: item,
      key: key,
      showCountPrice: showCountPrice,
      type: type
    });
    this.cd.markForCheck();
  }

  showPriceDetail2(item, key, showCountPrice = true, workLoadInfo=[] , type = 1,modelClass) {
    //console.log(JSON.parse(workLoadInfo))
    this.modalService.open('price-detail', {
      item: item,
      key: key,
      showCountPrice: showCountPrice,
      workLoadInfo: workLoadInfo,
      type: type,
      modelClass:modelClass
    })
    this.cd.markForCheck();
  }

  // 是否显示明细按钮，循环判断里面的value是否都为null
  isShowDetail (data, key) {
    // if(key == 'pre_produce_breakdown'){
    //   return true;
    // }
    if (!data[key] || data[key] === '') {
      return false;
    }
    if (!Array.isArray(data[key])) {
      return Array.isArray(JSON.parse(data[key])) && JSON.parse(data[key]).some(item => item.value||item.pre_value);
    } else {
      return data[key].some(item => item.value);
    }
  }

  // 分片上传
  customBigReq = (item: UploadXHRArgs) => {
    this.isChangeThing = true;
    this.uploadService.uploadBig(item, 1000, data => {
      this.http.post('web/thing/add-thing-file', {id: this.thingId, file_id: data['id']})
        .subscribe(results => {
          this.timer++;
          if (results['code'] === 0) {
            this.getAttachmentList();
            this.cd.markForCheck();
          } else {
            this.message.error(results['msg']);
            return false;
          }
        });
    });
  }

  delThingFile(item) {
    this.http.post('web/thing/del-thing-file', {
      file_id: item.id
    }).subscribe(result => {
      this.timer++;
      if (result['code'] === 0) {
        this.message.success(result['msg']);
        this.getAttachmentList();
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();

    }, (err) => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    } else if (event.key === 'order_code') {
      this.modalService.open('order', event.item);
    }
    this.cd.markForCheck();
  }

  passDegree () {
    this.testModal.isVisible = true;
    this.cd.markForCheck();
  }

  // 通过测试单
  passDegreeSubmit () {
    if (!this.testModal.pass_reason) {
      this.message.error('测试单通过原因必填!');
      return;
    }
    this.cd.markForCheck();

    this.http.post('web/thing/test-pass', {
      id: this.thingId,
      pass_reason: this.testModal.pass_reason,
      file_id: this.testModal.file_id
    }).subscribe(results => {
      this.timer++;
      if (results['code'] === 0 ) {
        this.message.success('测试单已通过');
        this.getInfo();
        this.testModal.isVisible = false;
      } else {
        this.message.error(results['msg']);
      }
      this.cd.markForCheck();
    });
  }

  // 打开标签历史记录的弹窗
  openHistoryModal (id = null) {
    this.modalService.open('table', {
      title: '物件变更记录',
      url: '/web/thing/get-thing-label-history?id=' + this.thingId,
      id: id
    });
    this.cd.markForCheck();
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }

  // 编辑物件标签
  editThingLabel () {
    this.modalService.open('thing-label', {
      title: '获取物件变更记录',
      params: {
        id: this.thingId
      },
      getUrl: '/web/thing/thing-label-edit?type=1',
      postUrl: ''
    });
    this.timer++;
    this.cd.markForCheck();
  }
  beforeUploadShowFigure = (file) => {
    console.log(file)
    return new Observable((observed) => {
      // 检查文件名
      let files = file.name.split(".");
      if (files.length <= 1) {
        this.message.error("请上传正确的文件名");
        observed.complete();
        return
      }

      // 检查后缀
      let file_ext = files.pop().toLowerCase();
      if (this.attachment.show_figure_uploadfile_exts.indexOf(file_ext) == -1 ) {
        this.message.error("文件后缀格式不符合要求");
        observed.complete();
        return
      }

      // 如果是图片
      if (file.type == 'image/jpeg' || file.type == 'image/png' || file.type == 'image/jpeg') {
        const isLt32M = file.size / 1024 / 1024 < 32;
        // 判断图片大小
        if (!isLt32M ) {
          this.message.error('文件必需小于32MB, 宽高不超过30000像素且总像素不超过2.5亿像素, 处理结果图宽高设置不超过9999像素');
          observed.complete();
          return
        } else {
          // 判断图片尺寸
          try {
            const reader = new FileReader()
            reader.readAsDataURL(file);
            reader.onload = () => {
              const image = new Image();
              image.src = <string> reader.result;
              image.onload = (img) => {
                if (image.width < 30000 && image.height < 30000 && image.width * image.height < 250000000) {
                  observed.next(true);
                } else {
                  observed.complete();
                }
              }
            }
          } catch (error) {
            observed.complete();
          }
        }
      } else {
        // const isLt10G = file.size <  1024 * 1024 * 1024 * 10;

        // // this.message.error('文件必需小于10G');

        // // 判断图片大小
        // if (!isLt10G ) {
        //   this.message.error('文件必需小于10G');
        //   observed.complete();
        //   return
        // }
        observed.next(true);
        observed.complete();
      }
    });
  } 
  // beforeUploadShowFigure= (file: File) => {
  //   let files = file.name.split(".");
  //   if(files.length !<= 1){
  //     this.message.error("请上传正确的文件名");
  //     return false;
  //   }
  //   let file_ext = files.pop().toLowerCase();
  //   if(this.attachment.show_figure_uploadfile_exts.indexOf(file_ext) == -1){
  //     this.message.error("文件后缀格式不符合要求");
  //     return false;
  //   }
  //   const isLt2M = file.size / 1024 / 1024 < 24;
  //   if (!isLt2M) {
  //     this.message.error('文件必需小于24MB!');
  //     return false;
  //   }
  //   return true;
  // }
  beforeUploadFinalWork= (file: File) => {
    let files = file.name.split(".");
    if(files.length <= 1){
      this.message.error("请上传正确的文件名");
      return false;
    }
    let file_ext = files.pop();
    if(this.attachment.final_work_uploadfile_exts.indexOf(file_ext) == -1){
      this.message.error("文件后缀格式不符合要求");
      return false;
    }
    // const isLt10G = file.size < 1024 * 1024 * 1024 * 10;
    // if (!isLt10G) {
    //   this.message.error('文件必需小于10G!');
    //   return false;
    // }
    return true;
  }
  uploadChange ($event) {
    if ($event.file && $event.file.status === 'done') {
      this.getAttachmentList();
      this.timer++;
      this.cd.markForCheck();
    }
  }

  uploadRemarkChange ($event) {
    if ($event.file && $event.file.status === 'done') {
      this.remarkModalData.fileList = [];
      this.remarkModalData.fileList.push({
        id: $event.file.originFileObj.file_id,
        name: $event.file.name,
        status: 'done',
      });
      this.timer++;
      this.cd.markForCheck();
    }
  }

  // 下载图片
  download (url, filename) {
    this.cos.downloadFile(url, filename)
  }

  uploadTestChange ($event) {
    if ($event.file && $event.file.status === 'done') {
      this.testModal.FileList = [];
      this.testModal.FileList.push({
        id: $event.file.originFileObj.file_id,
        name: $event.file.name,
        status: 'done',
      });
      this.testModal.file_id = $event.file.originFileObj.file_id;
      this.timer++;

      this.cd.markForCheck();
    }
  }

  openSupplierInfo (id) {
    this.openModal('supplier-info', id)
  }

  openContractInfo(id) {
    this.openModal('contract-price-info', id)
  }

  openThingInfo (id) {
    this.openModal('thing', id)
  }

  openOrderInfo (id) {
    this.openModal('order', id)
  }

  openModal (type = '', id = '') {
    if (type && id) {
      this.modalService.open(type, {
        id: id
      })
    }
  }

  dragStarted($event: any) {

 }

  dragEnded ($event: any) {

  }

  dragMove ($event: any) {
    if ($event.event) {
      this.distance.x += $event.event.movementX
      this.distance.y += $event.event.movementY

      let translate = `translate3d(${this.distance.x}px, ${this.distance.y}px, 0px)`
      this.renderer.setStyle(this.thingDetail['modalContainer']['nativeElement'].getElementsByClassName('ant-modal-content')[0], 'transform', translate)
    }
  }

  getDelayList() {
    this.delayChangeData.delayChangeLoading = true;
    this.delayChangeData.delayChangeList = [];
    this.http.get('web/thing/delay-change-list', {params: {
        id: this.thingId,
      }}).subscribe(result => {
      this.delayChangeData.delayChangeLoading  = false;
      this.delayChangeData.delayChangeList     = result['list'];
      this.delayChangeData.delayChangeColumns  = result['columns'];
      this.cd.markForCheck();
    }, err => {
      this.message.error(err.msg);
      this.cd.markForCheck();
    });
  }
}
