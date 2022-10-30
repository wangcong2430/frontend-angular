import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './draft.component.html',
})
export class DraftComponent implements OnInit {
  loading = false;
  listLoading = false;
  columns;
  list = [];
  queryFields = [];
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  pagination = {
    total_count: 0,
    page_size: '20',
    page_index: '1',
  };
  disabledButton = true;
  checked = []; // 列表被选中变量
  thing_config_group = []; // 物件
  deleteThingId = []; // 删除的物件Id
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private translate: TranslateService,
    private fb: FormBuilder,
    private menuService: MenuService,
    private message: MessageService
  ) {

  }
  ngOnInit() {
    this.getConfig();
    this.getList();
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 提交进入
  draftSubmit() {
    // this.disabledButton = true;
    let story;
    story = [];
    this.list.forEach((value, key) => {
      if (value.checked) {
        // 获取被选中的需求id
        let runObj;
        runObj = {
          story_name : value.story_name, // 需求名称
          id : value.id, // 需求名称
          thing_id : value.thing_id, // 物件id
        };

        story.push(runObj);
      }
    });
    if (story.length < 1) {
      this.message.error('请选择需求进行提交');
      return false;
    }
    story.forEach((value, index) => {
        let postData;
        postData = {
          'story_id': value['id'],
          'thing_id': value['thing_id'],
        };
        this.http.post('web/demand/story-save', postData, {
          observe: 'response'
        }).subscribe(response => {
          if (response['body']['code'] === 0) {
            // this.formData['id'] = response['body']['story_id'];
            this.message.success(value['story_name'] + '提交成功');
          }
        });
    });
  }

// 删除进入
  draftDelete() {
    let story;
    story = [];
    this.list.forEach((value, key) => {
      if (value.checked) {
        // 获取被选中的需求id
        let runObj;
        runObj = {
          story_name : value.story_name, // 需求名称
          id : value.id, // 需求名称
          thing_id : value.thing_id, // 物件id
        };
        story.push(runObj);
      }
    });
    if (story.length < 1) {
      this.message.error('请选择需求进行删除');
      return false;
    }
    story.forEach((value, index) => {
      this.http.get('web/demand/delete-demand',
        {
          params: {
            demand_id: value['id'],
          }
        }
      ).subscribe(result => {
        if (result['code'] == 0) {
          this.message.success(result['msg']);
          this.getList();
          this.menuService.getBacklog();
        } else {
          this.message.error(result['msg']);
        }
      });
    });
  }

  getConfig() {
    this.loading = true;
    this.http.get('web/demand/demand-draft-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.queryFields     = result['search_form'];
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
    this.http.get('web/demand/demand-draft-list', { params: params }).subscribe(result => {
      this.listLoading            = false;
      this.pagination.total_count = result['data']['pager']['itemCount'];
      this.pagination.page_index  = result['data']['pager']['page'];
      this.pagination.page_size   = result['data']['pager']['pageSize'];
      this.list                   = result['data']['list'];
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  clickEvent(value) {
    if (value.key === 'story_code') {
      this.router.navigateByUrl('/thing/createDemand/' + value.item['id'] + '?=id' + value.item['project_id']);
    } else if (value.key === 'delete') {
      this.message.isAllLoading = true;
      this.http.get('web/demand/delete-demand',
        {
          params: {
            demand_id: value.item['id']
          }
        }
      ).subscribe(result => {
        this.message.isAllLoading = false;
        if (result['code'] == 0) {
          this.message.success(result['msg']);
          this.getList();
          this.menuService.getBacklog();
        } else {
          this.message.error(result['msg']);
        }
      }, () => {
        this.message.error('网络异常，请稍后再试');
        this.message.isAllLoading = false;
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
}
