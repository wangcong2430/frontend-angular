import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { UploadXHRArgs } from 'ng-zorro-antd';
import { DatePipe } from '@angular/common';

import { ThingDetailModalComponent } from '../../../../../containers/modal/thing-detail/thing-detail.component';
import { ThingPriceChangeModalComponent } from '../../../../../containers/modal/thing-price-change/thing-price-change.component';

import { MenuService } from '../../../../../services/menu.service';
import { UploadsService } from '../../../../../services/uploads.service';
import { LanguageService } from '../../../../../services/language.service';
import { ModalService } from '../../../../../services/modal.service';
import { MessageService } from '../../../../../services/message.service';
import { CosService } from '../../../../../services/cos.service';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  templateUrl: './fabrication.component.html',
  styleUrls: ['./fabrication.component.css']
})

export class FabricationComponent implements OnInit {
  @ViewChild(ThingDetailModalComponent)
  private thingDetailModal: ThingDetailModalComponent;
  @ViewChild(ThingPriceChangeModalComponent)
  private thingPriceChangeModal: ThingPriceChangeModalComponent;
// loading
  loading = true;
  listLoading = false;
  submitLoading = false;
  // 配置项
    searchFormData = {
  };
  columns = [];
  childrenColumns = [];
  queryFields = [];
  disabledButton = true;
  isBusiness     = false;
  isProducer     = false;
  // 数据列表
  list = [];
  list_plus=[]
  // 分页
  pagination = {
    total_count: null,
    page_size: '10',
    page_index: '1',
  };

  // 提示语
  plaseSelectObject;

  datePipe = new DatePipe('zh-Hans');

  isBatchTimeVisible = null;
  actualStartTime = null;

  limitJPG = '';
  limit100M = '';
  limit10G = '';
  FileUploading = '';
  fileSuccess = '';
  fileFails = '';

  isIhubTo = false;

  hubData = {
    arthub: {
      jumpUrl: '',
      num: 0
    },
    ihub: {
      jumpUrl: '',
      num: 0
    }
  };

  constructor(
    private http: HttpClient,
    private message: NzMessageService,
    private menuService: MenuService,
    private uploadsService: UploadsService,
    private language: LanguageService,
    private translate: TranslateService,
    private modalService: ModalService,
    public cos: CosService
  ) {
    this.translate.use(this.language.language);
    this.translate.get('PLEASE_SELECT_OBJECT').subscribe(result => {
      this.plaseSelectObject = result;
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
    // 获取页面配置
    this.getConfig();

    this.getHubHref();
    this.modalService.complete$.subscribe(item => {
      if (item && item['key'] === 'thing-label') {
        const obj = {};
        const list = item['data']['list'];

        list.forEach(data => {
          if (data.thing_id) {
            data.thing_id.forEach(id => {
              obj[id] = data;
            });
          }
        });        
        this.list.forEach(data => {
          if (data.children) {
            data.children.forEach(children => {
              if (obj[children.id]) {
                children.attribute_check = children.attribute_check.map((attribute, index) => {
                  const val = obj[children.id].attribute_check.find(item => item.id === attribute.id).value;
                  return {
                    ...attribute,
                    value: val ? val : attribute.value
                  };
                });
              }
            });
          }
        });
       }
    });
  }
  ngOnChanges(): void {

    
  }
  // 获取arthub地址
  getHubHref() {
    this.http.get('/web/thing/arthub-jump-link', {
      params: {
        source: 'qq',
        current_workflow: '10900'
      }
    }).subscribe(result => {
      if (result['code'] === 0) {
        this.hubData = result['data'];
      } else {
        this.message.error(result['msg'] || '网络异常, 请稍后再试');
      }
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/order/producer-order-configs').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.childrenColumns = result['childrenColumns'];
      this.isBusiness      = result['isBusiness'];
      this.isProducer      = result['isProducer'];
      this.queryFields     = result['search_form'];
      // 获取列表
      this.getList();
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }
    let params;
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/order/producer-order-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      if (result['code'] === 0) {
        //console.log( result['list'])
        this.pagination.total_count = result['pager']['itemCount'];
        this.pagination.page_index  = result['pager']['page'];
        this.pagination.page_size   = result['pager']['pageSize'];
        this.list                   = result['list'] ? result['list'] : [];
        this.list_plus              =result['list'] ? result['list'] : [];
       // console.log(this.list)
        
        /* this.list= this.list.map((item) => {
          if (item.children && item.children.length > 0) {
            item.children = item.children.map((idm) => {
              if (idm.attribute_check && idm.attribute_check.length > 0) {
                idm.attribute_check = idm.attribute_check.map((ixm) => { 
                         if(ixm.label_type==1&&ixm.is_show==1){
                          return ixm
                         }else if(ixm.label_type==1&&ixm.is_show!=1){
                          ixm={}
                          return ixm
                         } 
                         return ixm                            
                })
              }
              return idm
            })
          }
          return item

        }) */
        //console.log(this.list_plus)
      } else {
        this.message.error(result['msg']);
      }
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
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

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 制作完成按钮事件
  completed() {

    if (this.submitLoading) return;
    
    //console.log(this.list_plus)
    const attributeList = this.list.map(item => item.children)
      .reduce((pre, cur) => pre.concat(cur), [])
      .filter(item => item.checked)
      .map(item => {
        return {
          id: item.id,
          attribute_check: item.attribute_check,
          thing_name: item.thing_name,
          actual_start_time: item.actual_start_time,
          final_work: item.final_work,
          process_attachment: item.process_attachment,
          show_figure: item.show_figure && item.show_figure instanceof Array ? item.show_figure.map((value)=>{value['thumbUrl'] = '';return value}) : []
        };
      });

    let error = false;
    attributeList.forEach(item2 => {

      if (item2.final_work && item2.final_work.some(item => item.status === 'uploading')
          || item2.process_attachment && item2.process_attachment.some(item => item.status === 'uploading')
          || item2.show_figure && item2.show_figure.some(item => item.status === 'uploading')) {
        this.message.error('文件正在上传中, 请稍后再试');
        error = true;
        return false;
      }

      item2.attribute_check && item2.attribute_check.map((item3, index3) => {
        if (item3.attr_type == '1') {
          if (item3.form_num == '1') {
            if (!item3.value && item3.is_required === '1') {
              this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
              error = true;
              return false;
            }
          } else {
            if (item3.options && item3.options.some(item => item.value === null) && item3.options.some(item => item.value !== null)) {
              this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
              error = true;
              return false;
            }

            if (item3.options && item3.is_required === '1' && item3.options.some(item => !item.value)) {
              this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
              error = true;
              return false;
            }
          }
        } else if (item3.attr_type == '2' ) {
          if (!item3.value && item3.is_required === '1') {
            this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
            error = true;
            return false;
          }
        }
      });
    });

    if (error) {
      return;
    }
    console.log(attributeList)
    this.submitLoading = true;
    this.http.post('web/order/apply-producer-acceptance', attributeList).subscribe(result => {
      this.submitLoading = false;
      if (result['code'] === 0) {
        this.message.success(result['msg']);
        this.getList();
        this.menuService.getBacklog();
      } else {
        this.message.error(result['msg']);
      }
    }, err => {
      this.submitLoading = false;
      this.message.error(err.msg);
    });
  }

  isIhubToEvent() {
    window.open('https://ihub.qq.com', '_black');
  }

  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.thingDetailModal.openModal(event.item);
    } else if (event.key === 'upload') {
      this.thingDetailModal.openModal(event.item, 1);
    } else if(event.key === 'uplaodClick') {
      if(this.isIhubTo === false) {
        this.isIhubTo = true;
      }
    }
  }

  blurEvent(event) {
    let params;
    if (event.key === 'producer_name') {
      params = {
        id: event.item['id'],
        name: event.item['producer_name'],
      };
      this.http.post('web/order/add-thing-producer', params).subscribe(result => {});
    }
  }

  // 物件变更弹窗
  priceChangeModal() {
    let item;
    item = [];
    this.list.forEach(data => {
      if (data.children && data.children.length > 0) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            item.push(data2.id);
          }
        });
      }
    });
    this.thingPriceChangeModal.openModal({id: item});
  }

  uploadChange($event) {
    if ($event.type === 'success') {
      const file_name = $event.file.originFileObj.name;
      const thing_code = file_name.split(',')[0];
      this.http.post('web/thing/add-thing-file', {
        thing_code: thing_code,
        file_id: $event.file.originFileObj.file_id,
        type: $event.file.originFileObj.object_type
      }).subscribe(results => {
        if (results['code'] === 0) {
          // this.message.success('上传成功');
          this.getList();
        } else {
          this.message.error(results['msg']);
        }
      }, err => {
        this.message.error('网络错误, 请稍后再试!' || err['msg']);
      });
    }
  }

  // 批量上传
  batchUpdataLabel () {
    const ids = this.list.map(item => item.children)
      .reduce((pre, cur) => pre.concat(cur), [])
      .filter(item => item.checked)
      .map(item => {
        return item.id;
      }).join(',');

    this.modalService.open('thing-label', {
      title: '获取物件变更记录',
      params: {
        id: ids
      },
      getUrl: '/web/order/thing-label-edit',
      postUrl: '',
      callback: true
    });
  }

  // 批量修改开工日期
  batchUpdataTime () {
    this.isBatchTimeVisible = true;
    this.actualStartTime = null;
  }

  onDatePickerChange(date) {
    this.actualStartTime = this.datePipe.transform(date, 'yyyy-MM-dd');
  }

  batchTimeOk () {
    this.list.forEach(data => {
      if (data.children && data.children.length > 0) {
        data.children.forEach(data2 => {
          if (data2.checked) {
            data2.actual_start_time = this.actualStartTime;
          }
        });
      }
    });
    this.isBatchTimeVisible = false;
  }

  // uploadFile () {
  //   this.model$.open('upload', {

  //   })
  // }
}
