import { Component, OnInit, ViewChild } from '@angular/core';
import { FormlyFormOptions } from '@ngx-formly/core';
import { HttpClient } from '@angular/common/http';
import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { MessageService } from '../../../services/message.service';
import { DownloadService } from '../../../services/download.service';
import { formatDate } from '@angular/common';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})

export class Category2Component  implements OnInit {
  @ViewChild(SaveModalComponent)
  private saveModal: SaveModalComponent;
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private _downloadService: DownloadService
  ) {}
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
  isAdd = false;
  // 筛选
  searchFormData = {};
  queryFields = [];
  // 数据列表
  expand   = {};
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

  ngOnInit() {
    // 获取列表配置
    this.getConfig();

    // 获取列表信息
    this.getList();
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/category/config').subscribe(result => {
      this.loading          = false;
      this.columns          = result['columns'];
      this.queryFields      = result['search_form'];
      this.isAdd            = result['is_add'];
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
    this.http.get('web/category/tree', { params: params }).subscribe(result => {
      this.listLoading = false;
      if (result['code'] === 0) {
        this.list        = result['data'];
      } else {
        this.message.error('网络异常，请稍后再试');
      }
    }, err => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 获取点击事件
  getClickEvent(key, item) {
    this.clickEvent({key: key, item: item});
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'update') {
      this.openModal(event.item);
    } else if (event.key === 'del') {
      this.submitDel(event.item);
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
    this.http.post('web/category/del', { id: item['id'] }).subscribe(result => {
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
    let params;
    if (item['id']) {
      params = {
        id: item['id']
      };
    }
    this.http.get('web/category/info', { params: params}).subscribe(result => {
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      
    
      console.log(result['form'])
      this.saveModal.openModal(result['form'], result['info'], 'rest-category');
    });
  }

  // 编辑框
  submitSaveForm(value): void {
    if (value['code'] === 0) {
      this.message.isAllLoading = true;
      this.http.post('web/category/save', { params: value['value'] }).subscribe(result => {
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

  sort(e) {
    const list = JSON.parse(JSON.stringify(this.list));
    const compare = function (prop, type) {
      return function (obj1, obj2) {
        const val1 = obj1[prop];
        const val2 = obj2[prop];
          if (type === 'descend') {
            return val1 > val2 ? 1 : -1;
          } else {
            return val1 > val2 ? -1 : 1;
          }
      };
    };
    this.list = [];
    list.sort(compare(e.key, e.value));
    this.list = list;
  }

  export (type) {

    const now = formatDate (new Date (), 'yyyyMMddhhmmss', 'zh-ch');
    const fileName = `${type == 1 ? '设计类品类' : '内容类品类'}__导出时间${now}.csv`;

    this._downloadService.loading({
      data: {
        msg: '下载中',
        name: fileName
      }
    });

    this.http.get('/web/test-api/export-category', {params: {
      isDesign: type
    }}).subscribe(result => {
        if (result['code'] == 0) {
          this.message.success('下载成功');
          this._downloadService.loaded({
            data: {
              msg: '下载成功',
              name: fileName,
              link: result['data']
            }
          });
        } else {
          this.message.error('下载失败');
          this._downloadService.error({
            data: {
              name: fileName,
              msg: '下载失败:' + result['msg'],
            }
          });
        }
    }, (error) => {
      this.message.error('下载失败');
      this._downloadService.error({
        data: {
          name: fileName,
          msg: '下载失败',
        }
      });
    });
  }
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
