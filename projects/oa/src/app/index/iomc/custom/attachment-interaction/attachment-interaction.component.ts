
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, Renderer2} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UploadXHRArgs } from 'ng-zorro-antd';
import { MessageService } from '../../../../services/message.service';
import { UploadService } from '../../../../services/upload.service';
import { MenuService } from '../../../../services/menu.service';
import { ModalService } from '../../../../services/modal.service';
import { CosService } from '../../../../services/cos.service';

@Component({
  templateUrl: './attachment-interaction.component.html',
  styleUrls: ['./attachment-interaction.component.less']
})

export class AttachmentInteractionComponent implements OnInit {
  distance = {
    x: 0,
    y: 0
  }
  thing_code: any = null;
  id: any = null;
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
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams.thing_code) {
        this.thing_code = queryParams.thing_code
        this.getInfo(queryParams.thing_code)
      }
    })
  }

  // 获取信息
  getInfo (thing_code) {
    if (!thing_code) {
      return;
    }

    this.http.get('web/thing/detail', {
      params: {
        thing_code: thing_code,
      },
    }).subscribe(info => {
      this.loading = false;
      this.info = info;
      this.id = this.info['base']['thing_id'];
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

      this.cd.markForCheck();
    }, err => {
      this.loading = false;
      this.message.error(err.msg);
      this.cd.markForCheck();
    });
  }

  getAttachmentList() {
    this.http.get('web/thing/attachment-list', {
      params: {
        id: this.id,
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

  // 图片预览
  showImg(url) {
    this.modalService.open('photo', {
      title: '',
      url: url
    });
    this.cd.markForCheck();
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

  trackByFn(index, item) {
    return item.id ? item.id : index; // or item.id
  }


  beforeUploadShowFigure= (file: File) => {
    let files = file.name.split(".");
    if(files.length !<= 1){
      this.message.error("请上传正确的文件名");
      return false;
    }
    let file_ext = files.pop().toLowerCase();
    if(this.attachment.show_figure_uploadfile_exts.indexOf(file_ext) == -1){
      this.message.error("文件后缀格式不符合要求");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 24;
    if (!isLt2M) {
      this.message.error('文件必需小于24MB!');
      return false;
    }
    return true;
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
    const isLt4G = file.size < 4294967296;
    if (!isLt4G) {
      this.message.error('文件必需小于4G!');
      return false;
    }
    return true;
  }

  uploadChange ($event) {
    if ($event.file && $event.file.status === 'done') {
      this.getAttachmentList();
      this.timer++;
      this.cd.markForCheck();
    }
  }

  openModal (type = '', id = '') {
    if (type && id) {
      this.modalService.open(type, {
        id: id
      })
    }
  }

  downloadImage (url, downloadImage) {
    this.cos.downloadImage(url, downloadImage)
  }
}
