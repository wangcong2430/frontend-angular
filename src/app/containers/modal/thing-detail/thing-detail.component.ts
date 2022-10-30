import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { forkJoin, Observable} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NzModalService, UploadXHRArgs } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

import { PriceDetailModalComponent } from '../price-detail/price-detail.component';
import { NzMessageService } from 'ng-zorro-antd';
import { ShowImgModalComponent } from '../show-img/show-img.component';
import { UploadService } from '../../../services/upload.service';
import { MenuService} from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { CosService } from '../../../services/cos.service';
import { remove } from '../../../utils/index';

@Component({
  selector: 'app-modal-thing-detail',
  templateUrl: './thing-detail.component.html',
  styleUrls  : ['./thing-detail.component.css']
})

export class ThingDetailModalComponent implements OnInit {
  @ViewChild(PriceDetailModalComponent)
  public priceDetailModal: PriceDetailModalComponent;
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @ViewChild(ShowImgModalComponent)
  private showImgModal: ShowImgModalComponent;

  @ViewChild('ThingDetail') ThingDetail: ElementRef;

  isOpen;
  isChngeThing = false;
  loading = false;
  isSubmitLoading = false;
  dataModal;
  info = {};
  fileList = [];
  quoteList = {
    list: [],
    columns: [],
  };
  imgnomore_tips = '暂无数据';
  attachment = {
    list: {
      '1000': [],
      '1005': [],
      '1010': []
    },
    columns: [],
    columns2: [],
    final_work_uploadfile_exts:[],
    show_figure_uploadfile_exts:[]
  };
  uploadModal = {
    isShow: false,
    percent: 0,
    msg: ''
  };
  styleModal = {
    isShow: false,
    list: [],
    isRecommend: false,
    onList: []
  };
  syncModal = {
    isShow: false,
    list: [],
    isRecommend: false,
    onList: []
  };
  tabsetIndex = 0;

  // 提示语
  SELECT_LABEL = '';
  limitJPG = '';
  limit100M = '';
  limit10G = '';
  FileUploading = '';
  fileSuccess = '';
  fileFails = '';
  count = 0;
  messageId = null;
  uploading = null;
  messageArr = [];
  thingId = null;
  nzZIndex = 800;
  constructor(
    private http: HttpClient,
    private message: NzMessageService,
    public uploadService: UploadService,
    private modal: ModalService,
    private modalService: NzModalService,
    private menuService: MenuService,
    private translate: TranslateService,
    private language: LanguageService,
    private cos: CosService
  ) {
    this.translate.use(this.language.language);
    this.translate.get('SELECT_LABEL').subscribe(result => {
      this.SELECT_LABEL = result;
    });

    this.translate.get('LIMIT_JPG').subscribe(result => {
      this.limitJPG = result;
    });

    this.translate.get('LIMIT_100M').subscribe(result => {
      this.limit100M = result;
    });

    this.translate.get('LIMIT_10G').subscribe(result => {
      this.limit10G = result;
    });

    this.translate.get('FILE_UPLOADING').subscribe(result => {
      this.FileUploading = result;
    });

    this.translate.get('FILE_SUCCESS').subscribe(result => {
      this.fileSuccess = result;
    });

    this.translate.get('FILE_FAILS').subscribe(result => {
      this.fileFails = result;
    });
  }

  ngOnInit() {
    // this.ThingDetail['container']['overlayElement'].style.zIndex = this.nzZIndex;
  }

  // 开打弹窗前先获取项目及预算
  openModal(item, tab = 0) {

    this.ThingDetail['container']['overlayElement'].style.zIndex = this.nzZIndex;

    this.tabsetIndex = tab;
    this.dataModal = item;
    this.isOpen = true;
    this.isSubmitLoading = false;
    this.isChngeThing = false;
    this.info = {};
    this.fileList = [];
    this.quoteList = {
      list: [],
      columns: [],
    };
    this.attachment = {
      list: {
        '1000': [],
        '1005': [],
        '1010': []
      },
      columns: [],
      columns2: [],
      final_work_uploadfile_exts:[],
      show_figure_uploadfile_exts:[]
    };
    this.uploadModal = {
      isShow: false,
      percent: 0,
      msg: ''
    };
    this.styleModal = {
      isShow: false,
      list: [],
      isRecommend: false,
      onList: []
    };
    this.count = 0;
    this.messageId = null;
    this.getInfo();
  }

  modalCancel() {
    if (this.messageArr.length > 0) {
      this.modalService.create({
        nzTitle: '提示',
        nzContent: '关闭弹窗, 将关闭文件上传',
        nzClosable: false,
        nzOnOk: () => {

          this.messageArr.map(id => {
            this.message.remove(id);
          });
          this.messageArr = [];
          this.isOpen = false;
          if (this.count) {
            this.getList.emit();
          }
        }
      });
    } else {
      this.isOpen = false;
      if (this.count) {
        this.getList.emit();
      }
    }
  }

  // 初始化数据
  getInfo() {
    this.info = {};
    // 获取数据
    this.loading = true;
    this.http.get('web/thing/detail', {
      params: {
        id: this.dataModal['id'],
      },
    }).subscribe(info => {
      this.loading = false;
      this.info    = info;
      this.info['base']['id'] = this.info['base']['thing_id'] ? this.info['base']['thing_id'] : this.dataModal['id'];
      this.thingId = this.info['base']['id'];
      this.quoteList.columns = info['quoteColumns'];
      this.imgnomore_tips = info['isSecrecyImg']?'信息保密':'暂无数据';
      this.attachment.columns = info['attachmentColumns'];
      this.attachment.columns2 = info['attachmentColumns2'];
      this.attachment.show_figure_uploadfile_exts = info['base'].show_figure_uploadfile_exts;
      this.attachment.final_work_uploadfile_exts = info['base'].final_work_uploadfile_exts
      if (typeof(info['thing']) !== 'undefined' && typeof(['quote']) !== 'undefined') {
        this.quoteList.list    = info['thing']['quote'];
      } else {
        this.quoteList.list    = [];
      }
      if (info['styleList']) {
        this.styleModal.isRecommend = info['isRecommend'];
        this.styleModal.list = info['styleList'];
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
    });
  }

  getAttachmentList() {
    this.http.get('web/thing/attachment-list', {
      params: {
        'id': this.dataModal['id'],
      },
    }).subscribe(results => {
      this.attachment.list['1000']   = results['data'][1000] ? results['data'][1000] : [];
      this.attachment.list['1005']   = results['data'][1005] ? results['data'][1005] : [];
      this.attachment.list['1010']   = results['data'][1010] ? results['data'][1010] : [];
    });
  }

  delThingFile(item) {
    this.http.post('web/thing/del-thing-file', {file_id: item.id})
      .subscribe(results => {
        if (results['code'].toString() !== '0') {
          this.message.error(results['msg']);
          return false;
        }
        this.count++;
        this.isChngeThing = true;
        this.message.success(results['msg']);
        this.getAttachmentList();
      });
  }

  // 同步蜘蛛系统
  // synchronou(item) {
  //   this.message.isAllLoading = true;
  //   this.http.post('web/thing/synchronous', {id: this.dataModal['id'], file_id: item.id})
  //     .subscribe(results => {
  //       this.message.isAllLoading = false;
  //       if (results['code'].toString() !== '0' && results['code'].toString() === '-1') {
  //         this.message.error(results['msg']);
  //         return false;
  //       } else if (results['code'].toString() !== '0') {
  //         this.syncModal.isShow = true;
  //         this.syncModal.list = results['data'] || [];
  //         return false;
  //       }
  //       this.message.success(results['msg']);
  //       this.getAttachmentList();
  //     });
  // }


  // 制作完成按钮事件
  completed() {

    let error = false;
    if (this.dataModal.attribute_check && this.dataModal.attribute_check.length > 0) {
      this.dataModal.attribute_check.map((item3, index3) => {
          if (item3.attr_type == '1') {
            if (item3.form_num == '1') {
              if (!item3.value && item3.is_required === '1') {
                this.message.error( this.dataModal.thing_name + ': ' + item3.title + '不能为空');
                error = true;
                return false;
              }
            } else {
              if (item3.options && item3.options.some(item => item.value !== null) && item3.options.some(item => item.value === null))  {
                this.message.error( this.dataModal.thing_name + ': ' + item3.title + '不能为空');
                error = true;
                return false;
              }

              if ( item3.is_required === '1' && item3.options && item3.options.some(item => item.value === null))  {
                this.message.error( this.dataModal.thing_name + ': ' + item3.title + '不能为空');
                error = true;
                return false;
              }
            }
          } else if (item3.attr_type == '2') {
            if (!item3.value && item3.is_required === '1') {
              this.message.error(this.dataModal.thing_name + ': ' + item3.title + '不能为空');
              error = true;
              return false;
            }
          }
      });
    }

    if (error) {
      return;
    }


    this.isSubmitLoading = true;
    this.http.post('web/order/apply-producer-acceptance', [this.dataModal]).subscribe(result => {
      this.isSubmitLoading = false;
      if (result['code'] == 0) {
        this.message.success(result['msg']);
        this.isOpen = false;
        this.getList.emit();
        this.menuService.getBacklog();
      } else {
        this.message.error(result['msg']);
      }
    }, err => {
      this.isSubmitLoading = false;
      this.message.error(err.msg);
    });
  }

  showImg(name, url) {
    this.modal.open('photo', {
      title: name,
      url: url
    });
  }

  // 设置展示图
  thingFigure(item) {
    this.http.post('web/thing/set-thing-figure', {
      id: this.dataModal['id'],
      file_id: item['id']
    }).subscribe(results => {
      this.count++;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      if (this.info['base']) {
        this.info['base']['show_figure_id'] = item['id'];
      }
    });
  }

  // 打开标签历史记录的弹窗
  openHistoryModal (id = null) {
    console.log('openHistoryModal')
    this.modal.open('table', {
      title: '物件变更记录',
      url: '/web/thing/get-thing-label-history?id=' + this.thingId,
      id: id
    });
  }

  // 编辑物件标签
  editThingLabel () {
    console.log('editThingLabel')

    this.modal.open('thing-label', {
      title: '获取物件变更记录',
      params: {
        id: this.thingId
      },
      getUrl: '/web/thing/thing-label-edit?type=1',
      postUrl: ''
    });
  }

  // 显示明细
  showPriceDetail(item, key, event) {
    event.stopPropagation();
    this.priceDetailModal.openModal(item, key);
  }

  // 是否显示明细按钮，循环判断里面的value是否都为null
  isShowDetail (data, key) {
    if (!data[key] || data[key] === '') {
      return false;
    }
    if (!Array.isArray(data[key])) {
      return Array.isArray(JSON.parse(data[key])) && JSON.parse(data[key]).some(item => item.value);
    } else {
      return data[key].some(item => item.value);
    }
  }

  // customReqs = (item: UploadXHRArgs) =>  {
  //   const messageId = this.message.loading(this.FileUploading + '...', { nzDuration: 0 }).messageId;
  //   this.messageArr = [...this.messageArr, messageId];
  //   return this.cos.uploadFile(item).subscribe(
  //     (event) => {
  //       // 处理成功
  //       this.message.remove(messageId);
  //       remove(this.messageArr, messageId);
  //       this.message.success(this.fileSuccess);
  //       item.onSuccess(event, item.file, event);
  //       this.count++;
  //       this.getAttachmentList();
  //     }, err => {
  //       // 处理失败
  //       this.message.remove(messageId);
  //       remove(this.messageArr, messageId);
  //       this.message.error(this.fileFails);
  //       item.onError(err, item.file);
  //     }
  //   );
  // }
  // beforeUploadShowFigure= (file: File) => {
  //   console.log(file)
  //   let files = file.name.split(".");
  //   if(files.length <= 1){
  //     this.message.error("请上传正确的文件名");
  //     return false;
  //   }

  //   const reader = new FileReader()
  //   reader.readAsDataURL(file);
  //   console.log(1)
  //   reader.onload = (event) => {
  //     const image = new Image();
  //     console.log(event)
  //   console.log(2)

  //     image.src = <string> event.target.result;
  //     image.onload = (img) => {
  //       console.log(image.width)
  //       console.log(image.height)
  //       console.log(3)
        
  //       return false
  //     }
  //     console.log(4)

  //   }
  //   console.log(5)

  //   // let file_ext = files.pop().toLowerCase();
  //   // if(this.attachment.show_figure_uploadfile_exts.indexOf(file_ext) == -1){
  //   //   this.message.error("文件后缀格式不符合要求");
  //   //   return false;
  //   // }
  //   const isLt2M = file.size / 1024 / 1024 < 32;
  //   if (!isLt2M && (file.type == 'image/jpeg' || file.type == 'image/png' || file.type == 'image/jpeg')) {
  //     this.message.error('文件必需小于32MB, 宽高不超过30000像素且总像素不超过2.5亿像素, 处理结果图宽高设置不超过9999像素');
  //     return false;
  //   }
  //   return true;
  // }

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
    //  this.message.error('文件必需小于10G!');
    //  return false;
    // }
    return true;
  }

  uploadChange($event, data) {
    if ($event.type === 'success') {
      this.message.success(this.fileSuccess);
      this.count++;
      this.getAttachmentList();
    }
  }

  recommendChange = (value) => {
    this.styleModal.onList = [];
    if (value) {
      this.styleModal.isShow = true;
    } else {
      this.saveThingStyle();
    }
  }

  styleModalOk = () => {
    this.styleModal.onList = [];
    this.styleModal.list.forEach(data => {
      data.children.forEach(data2 => {
        if (data2.checked) {
          this.styleModal.onList.push(data2.value);
        }
      });
    });
    if (this.styleModal.onList.length === 0) {
      // this.message.error('标签不能为空(Please select the label)');
      this.message.error(this.SELECT_LABEL);

      return false;
    }
    this.styleModal.isShow = false;
    this.saveThingStyle();
  }
  styleModalCancel = () => {
    this.styleModal.isShow = false;
    this.styleModal.isRecommend = false;
  }
  saveThingStyle = () => {
    let tags;
    tags = [];
    if (this.styleModal.isRecommend) {
      this.styleModal.list.forEach(data => {
        data.children.forEach(data2 => {
          if (data2.checked) {
            tags.push(data2);
          }
        });
      });
    }
    this.http.post('web/thing/save-thing-style', {
      id: this.dataModal['id'],
      tags: tags
    }).subscribe(results => {
      if (results['code'].toString() !== '0') {
        this.count++;
        this.message.error(results['msg']);
        return false;
      }
    });
  }

  download (url, filename) {
    this.cos.downloadFile(url, filename)
  }

  trackByFn(index, item) {
    return item.id ? item.id : index; // or item.id
  }
  isString(val): boolean 
  { 
    return typeof(val) == 'string';
  }
}
