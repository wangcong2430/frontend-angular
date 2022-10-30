import { Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormlyFormOptions } from '@ngx-formly/core';
import { Subject  } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UploadXHRArgs} from 'ng-zorro-antd';
import { MessageService } from '../../../services/message.service';
import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { ModalService } from '../../../services/modal.service';
import { UploadService} from '../../../services/upload.service';
import { NzModalService } from 'ng-zorro-antd';
import { DownloadService} from '../../../services/download.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  
import { CosService } from '../../../services/cos.service';

@Component({
  templateUrl: './contract-price.component.html',
})

export class ContractPriceComponent implements OnInit, OnDestroy {
  @ViewChild(SaveModalComponent)
  private saveModal: SaveModalComponent;
  constructor(
    private http: HttpClient,
    private modalService: ModalService,
    private modal: NzModalService,
    private message: MessageService,
    private _downloadService: DownloadService,
    public uploadService: UploadService,
    public cos: CosService
  ) {
    this.modalService.complete$.pipe(takeUntil(this.onDestroy$)).subscribe(res => {
      if ((res['key'] === 'create-contract' || res['key'] === 'contract-price-info' || res['key'] === 'contract-price-apply-info')
          && res['data']['code'] === '0') {
        this.getList();
      }
    });
    this.uploadService.uploadState$.subscribe(item => {
      this.uploadModal.percent = item['percent'];
      this.uploadModal.isShow = item['isShow'];
      this.uploadModal.msg = item['msg'];
    });
  }
  isCpm = false;
  isAdmin = false;
  onDestroy$ = new Subject<void>();
  // Model 参数配置
  isModelVisible = false;
  title = 'title';
  isOkLoading = false;

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
  model: any = {};
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
  };
  uploadModal = {
    isShow: false,
    percent: 0,
    msg: '',
    loading: false,
    status: ''
  };
  showModal = {
    isOpen: false,
    id: 0,
    loading: false,
    type: 1,
    title: '是否撤回变更申请？'
  };

  ngOnInit() {

    this.modalService.complete$.pipe(takeUntil(this.onDestroy$)).subscribe(res => {
      if ((res['key'] === 'create-contract'
            || res['key'] === 'contract-price-info'
            || res['key'] === 'contract-price-apply-info') && res['data']['code'] === 0) {
        this.getList();
      }
    });
    this.uploadService.uploadState$.subscribe(item => {
      this.uploadModal.percent = item['percent'];
      this.uploadModal.isShow = item['isShow'];
      this.uploadModal.msg = item['msg'];
    });

    // 获取列表配置
    this.getConfig();

    // 获取列表信息
    this.getList();
  }
  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/contract/contract-price-config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.queryFields      = result['search_form'];
      this.isCpm            = result['isCpm'] || false;
      this.isAdmin            = result['isAdmin'] || false;
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
    this.http.get('web/contract/contract-list', { params: params }).subscribe(result => {
      if (result['code'] == 0) {
        this.listLoading            = false;
        this.list                   = result['list'];
        this.pagination.total_count = result['pager']['itemCount'];
        this.pagination.page_index  = result['pager']['page'];
        this.pagination.page_size   = result['pager']['pageSize'];
      } else {
        this.listLoading            = false;
        this.message.error(result['msg'] || '网络异常, 请稍后再试');
      }
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
    if (event.key === 'update') {
      // 编辑合同
      this.openModal(event.item);

    } else if (event.key === 'withdraw') {
      // 撤销合同
      this.showModal.id = 0;
      this.showModal.loading = false;
      this.showModal.type = 1;
      this.showModal.title = '是否撤回变更申请？';
      this.showModal.id = event.item['apply_id'];
      this.showModal.isOpen = true;

    } else if (event.key === 'delbtn') {
      // 删除合同
      this.showModal.loading = false;
      this.showModal.type = 2;
      this.showModal.title = '是否删除草稿单据？';
      this.showModal.id = event.item['apply_id'];
      this.showModal.isOpen = true;
    } else if (event.key === 'info') {
      let obj;
      // flow_step 当前流程 0审批驳回 5撤回 10待审批 20已生效
      // if (event.item['flow_step'] && (event.item['flow_step'].toString() === '0' || event.item['flow_step'].toString() === '5')) {
      //   // 被驳回 被撤回编辑
      //   obj = {
      //     id: event.item['id'],
      //   };
      //   // this.modalService.open('contract-price-apply-info', obj);
      //   this.modalService.open('contract-price-info', obj);

      // } else

      if (event.item['is_apply_step'] && event.item['is_apply_step'].toString() === '1' && event.item['apply_id']) {
        // 如果合同在审批中 则查询审批相关信息
        this.modalService.open('contract-price-apply-info', {
          id: event.item['apply_id']
        });
      } else {
        this.modalService.open('contract-price-info', {
          id: event.item['id'],
        });
      }
    } else if (event.key === 'pull') {
      const messageId = this.message.loading('数据正在同步中', { nzDuration: 0 }).messageId;
      this.http.get('web/contract/update-date?id=' + event.item['id'] ).subscribe(result => {
        this.message.remove(messageId);
        if (result['code'] === 0) {
          this.getList();
          this.message.success(result['msg']);
        } else {
          this.message.error(result['msg']);
        }
      }, err => {
        this.message.remove(messageId);
        this.message.error(err['msg']);
      });
    } else if (event.key === 'copy') {
      // 审批表数据
      const params = {
        type: 'copy',
        title: '复制合同'
      };

      if (event.item['flow_step'] && (event.item['flow_step'].toString() === '0' || event.item['flow_step'].toString() === '5')) {
        params['apply_id'] = event.item['id'];
      } else {
        params['id'] = event.item['id'];
      }
      this.modalService.open('create-contract', {
        params: params
      });
    } else if (event.key === 'operate') {
      this.modalService.open('table', {
        title: '操作记录',
        url: 'web/contract/contract-change',
        params: {
          params: {
            id: event.item['id'],
          }
        }
      });
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

  // 编辑框
  submitDel(item): void {
    this.http.post('web/supplier-shortlist/del', { id: item['id'] }).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
    });
  }

  // 编辑 or 新建 弹窗
  openModal(item = {}) {
    const params = {};
    if (item['flow_step'] && (item['flow_step'].toString() === '0' || item['flow_step'].toString() === '5')) {
      params['apply_id'] = item['id'];
    } else {
      params['id'] = item['id'];
    }

    if (item['id']) {
      params['type'] = 'update';
      params['title'] = '编辑合同';
    } else {
      params['type'] = 'add';
      params['title'] = '新建合同';
    }

    this.modalService.open('create-contract', {
      params: params
    });
  }

  // 撤回变更申请 删除草稿
  openWithdrawModal () {
    this.showModal.loading = true;
    if (this.showModal.type === 1) {
      this.http.post('web/contract/contract-approval-submit', {id: this.showModal.id, type: 'withdraw'} ).subscribe(result => {
        this.showModal.loading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.showModal.isOpen = false;
        this.getList();
      });
    } else if (this.showModal.type === 2) {
      this.http.post('web/contract/contract-apply-del', {id: this.showModal.id} ).subscribe(result => {
        this.showModal.loading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.showModal.isOpen = false;
        this.getList();
      });
    }
  }

  // 编辑框
  submitSaveForm(value): void {
    if (value['code'] === 0) {
      this.message.isAllLoading = true;
      this.http.post('web/supplier-shortlist/save', { params: value['value'] }).subscribe(result => {
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
    }
  }

  // 导出合同
  exportContract() {
    let fileName = `正在导出合同数据`;

    this._downloadService.loading({
      data: {
        msg: '下载中',
        name: fileName
      }
    });

    this.http.post('/web/contract/export-contract', this.model).subscribe(result => {
      if (result['code'] == 0) {
        this.message.success('下载成功');
        // window.open(result['data'])
        fileName = result['fileName'] || '';
        this._downloadService.loaded({
          data: {
            msg: '下载成功',
            name: fileName,
            link: result['data']
          }
        });
      } else {
        this._downloadService.error({
          data: {
            //msg: '下载失败, 请稍后再试, 或联系管理员',
            msg: result['msg'],
          }
        });
      }
    }, (error) => {
      this._downloadService.error({
        data: {
          msg: '下载失败, 请稍后再试, 或联系管理员',
        }
      });
    });
  }

  beforeUploadImg = (file: File) => {
    const isLt2M = file.size / 1024 / 1024 < 100;
    if (!isLt2M) {
      this.message.error('文件必需小于100MB!');
    }
    return isLt2M;
  }

  // customBigReq = (item: UploadXHRArgs) => {
  //   this.uploadService.uploadBig(item, 1600, data => {
  //     setTimeout(() => {
  //       this.uploadModal.percent = 100;
  //       this.uploadModal.isShow = true;
  //       this.uploadModal.loading = true;
  //       this.uploadModal.msg = '上传成功,正在拉取供应商EPO完成...';
  //     }, 0);

  //     this.http.post('/web/contract/import-supplier-epo', {
  //       file_id: data.id
  //     }).subscribe(resupplier => {
  //       if (resupplier['code'] != 0) {
  //         this.uploadModal.percent = 100;
  //         this.uploadModal.loading = false;
  //         this.uploadModal.msg = resupplier['msg'];
  //         this.uploadModal.status = 'exception';
  //         setTimeout(() => {
  //           this.uploadModal.isShow = false;
  //         }, 3000);
  //         return false;
  //       }
  //       this.uploadModal.percent = 100;
  //       this.uploadModal.loading = true;
  //       this.uploadModal.msg = '拉取供应商EPO完成,数据正在系统导入,请稍后...';
  //       // this.message.success('供应商导入成功');

  //       this.http.post('/web/contract/import-contract', {
  //         file_id: data.id
  //       }).subscribe(results => {
  //         if (results['code'] == -300) {
  //           this.uploadModal.isShow = false;
  //           this.modal.create({
  //             nzTitle: '提示',
  //             nzContent: results['msg'],
  //             nzClosable: false,
  //             nzOnOk: () => new Promise(resolve => setTimeout(resolve, 200))
  //           });
  //         }
  //         if (results['code'] == 0) {
  //           this.uploadModal.percent = 100;
  //           this.uploadModal.loading = true;
  //           this.uploadModal.msg = '上传成功,数据打包成功,即将关闭...';
  //           this.uploadModal.isShow = false;
  //           this.message.success('合同导入成功');
  //           this.getList();
  //         } else {
  //           this.uploadModal.percent = 100;
  //           this.uploadModal.loading = false;
  //           this.uploadModal.msg = results['msg'];
  //           this.uploadModal.status = 'exception';
  //         }
  //         setTimeout(() => {
  //           this.uploadModal.isShow = false;
  //         }, 3000);
  //       }, () => {
  //         this.uploadModal.percent = 100;
  //         this.uploadModal.loading = false;
  //         this.uploadModal.msg = '导入异常！';
  //         this.uploadModal.status = 'exception';
  //         setTimeout(() => {
  //           this.uploadModal.isShow = false;
  //         }, 3000);
  //       });
  //     }, () => {
  //       this.uploadModal.percent = 100;
  //       this.uploadModal.loading = false;
  //       this.uploadModal.msg = '导入异常！';
  //       this.uploadModal.status = 'exception';
  //       setTimeout(() => {
  //         this.uploadModal.isShow = false;
  //       }, 3000);
  //     });
  //   });
  // }

  uploadChange ($event) {
    if ($event.type === 'success' && $event.file && $event.file.originFileObj) {
      const messageId = this.message.loading('上传成功,正在拉取供应商EPO完成...', { nzDuration: 0 }).messageId;
      this.http.post('/web/contract/import-supplier-epo', {
        file_id: $event.file.originFileObj.file_id
      }).subscribe(resupplier => {
        this.message.remove(messageId);
        if (resupplier['code'] === 0) {
          const messageId2 = this.message.loading('拉取供应商EPO完成,数据正在系统导入,请稍后...', { nzDuration: 0 }).messageId;
          this.http.post('/web/contract/import-contract', {
            file_id: $event.file.originFileObj.file_id
          }).subscribe(results => {
            this.message.remove(messageId2);
            if (results['code'] == 0) {
              this.message.success('合同导入成功');
              this.getList();
            } else if (results['code'] == -300) {
              this.uploadModal.isShow = false;
              this.modal.create({
                nzTitle: '提示',
                nzContent: results['msg'],
                nzClosable: false,
                nzOnOk: () => new Promise(resolve => setTimeout(resolve, 200))
              });
            } else {
              this.message.error(results['msg']);
            }
          }, () => {
            this.message.remove(messageId2);
            this.message.error('导入异常！');
          });
        } else {
          this.message.error(resupplier['msg']);
        }
      }, (error) => {
        console.log(error)
        this.message.remove(messageId);
        this.message.error('导入异常！')
      });
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
  
  download() {
    this.downloadFile('http://wbp-1258344700.cos.ap-guangzhou.myqcloud.com/upload/1/ayucuyljdw3hcf0z2hmvmhbaf1fnli7dq475x5b545fgg5idbkj55h9bmx8mwf4c/contract_template-0425.xlsx', 'contract_template-0425.xlsx')
  }
  downloadFile(data, fileName) {
    // 下载类型 xls
    const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    // 下载类型：csv
    const contentType2 = 'text/csv';
    const blob = new Blob([data], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    // 打开新窗口方式进行下载
    // window.open(url); 
   
    // 以动态创建a标签进行下载
    const a = document.createElement('a');
    //const fileName = "模板下载";
    a.href = url;
    // a.download = fileName;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
