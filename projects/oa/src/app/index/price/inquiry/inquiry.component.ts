import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import flattenDeep from 'lodash/flattenDeep';

import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { ListService } from '../../../services/list.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';

@Component({
  templateUrl: './inquiry.component.html',
  styleUrls: ['./inquiry.component.css']
})

export class InquiryComponent implements OnInit, OnDestroy {

  is_test = 0;
  isOpen = false;

  // loading
  loading = true;
  listLoading = true;

  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  disabledButton = true;

  // 筛选
  searchFormData = {
    ...getUrlParams()
  };

  // 数据列表
  list = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  expands = {}; // 展开项
  isVisible = false; // 驳回弹出框
  reason = ''; // 驳回原因
  settlement_ratio = ''; // 推荐结算比例
  checkListsId = null;
  onDestroy$ = null;
  pageDestroy$ = null;

  // 选中的物件列表
  thing_ids = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private menuService: MenuService,
    private message: MessageService,
    private modalService: ModalService,
    private NzMessage: NzMessageService,
    private listService: ListService
  ) { }

  ngOnInit() {
    this.pageDestroy$ = new Subject();

    this.route.url.subscribe(urls => {
      if (urls[0].path === 'inquiry') {
        this.is_test = 0;
      } else {
        this.is_test = 1;
      }
      this.getConfig();
    });

    this.listService.valueChange().pipe(takeUntil(this.pageDestroy$)).subscribe(list => {
      if (this.expands && list['list']) {
        list['list'] = list['list'].map(item => {
          if (this.expands[item.id]) {
            item['expand'] = this.expands[item.id];
          }
          return item;
        });
      }
      this.list = list['list'] ? list['list'] : [];
      this.pagination.total_count = list['pager']['itemCount'];
      this.pagination.page_index = list['pager']['page'];
      this.pagination.page_size = list['pager']['pageSize'];

      this.listLoading = false;
      this.loading = false;
      //console.log(this.list)
      /* if(this.is_test==1){
        this.list = this.list.map((item) => {
          if (item.children && item.children.length > 0) {
            item.children = item.children.map((idm) => {
              if (idm.attribute_check && idm.attribute_check.length > 0) {
                idm.attribute_check = idm.attribute_check.filter((ixm) => {                    
                      return ixm.label_type=='1'                                         
                })
              }
              return idm
            })
          }
          return item

        })
      
      } */
        this.list = this.list.map((item) => {
          if (item.children && item.children.length > 0) {
            item.children = item.children.map((idm) => {
              if (idm.attribute_check && idm.attribute_check.length > 0) {
                idm.attribute_check = idm.attribute_check.map((ixm) => {
                    if(ixm.label_category_id == '1'){
                      return ixm
                    }else if(ixm.label_type=='1'){

                      return ixm
                    }else{
                      return ixm
                    }
                     
                })
              }
              return idm
            })
          }
          return item

        }) 
      

      //console.log(this.list)
    }, err => {
      this.listLoading = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 获取页面配置
  getConfig() {
    this.loading = true;
    const params = {
      'is_test': this.is_test + ''
    };
    this.http.get('web/price/inquiry-config', { params: params }).subscribe(result => {
      this.loading = false;
      this.columns = result['columns'];
      this.childrenColumns = result['columnsChildren'];
      this.queryFields = result['queryFields'];
      this.getList();
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    if (pagination) {
      this.pagination = pagination;
    }

    this.searchFormData = paramsFilter(this.searchFormData);

    this.listService.getList('price/inquiry', {
      params: {
        ...this.searchFormData,
        page_index: this.pagination.page_index,
        page_size: this.pagination.page_size,
        is_test: this.is_test,
      }
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

  // 提交驳回意见
  submitReject() {
    let thing_id;
    thing_id = [];
    this.list.forEach((story, storyIndex) => {
      if (story.expand != undefined) {
        this.expands[story.id] = story.expand;
      }
      if (story.checked || story.indeterminate) {
        story['children'].forEach((thing, thingIndex) => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });

    this.message.isAllLoading = true;
    this.http.post('/web/price/inquiry-reject', {
      thing_id: thing_id,
      reason: this.reason,
    }).subscribe(result => {
      this.message.isAllLoading = false;
      if (result['code'] !== 0) {
        this.message.error(result['msg']);
        return false;
      }
      this.message.success(result['msg']);
      this.getList();
      this.isVisible = false; // 关闭驳回弹窗
      this.reason = ''; // 清空驳回原因
      this.menuService.getBacklog();
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
    });
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    }
  }

  // 生成订单
  generateOrder() {
    let category_type = '1';
    if (this.list.filter(item => item.indeterminate || item.checked).some(items => items.category_type === '1')) {
      category_type = '1';
    } else if (this.list.filter(item => item.indeterminate || item.checked).some(items => items.category_type === '2')) {
      category_type = '2';
    }

    let checkLists = this.list.filter(item => item.indeterminate || item.checked).map((items, index) =>
      items['children'].filter(item => item.checked).map(item => item.id)
    );

    this.checkListsId = checkLists.reduce((acc, val) => acc.concat(val), []);

    this.modalService.open('generate-order', {
      thing_id: this.checkListsId.toString(),
      is_test: this.is_test,
      category_type: category_type
    });
  }

  // 询价
  openFormModel() {
    const thing_id = this.list.map(item => {
      if (item.expand != undefined) {
        this.expands[item.id] = item.expand;
      }
      return item;
    }).filter(item => item.indeterminate || item.checked).map((items, index) =>
      items['children'].filter(item => item.checked).map(item => item.id)
    ).reduce((acc, val) => acc.concat(val), []);

    if (thing_id.length === 0) {
      this.message.error('请选择物件');
      return false;
    }

    this.modalService.open('inquiry', {
      thing_id: thing_id,
      is_test: this.is_test
    });
  }

  orderChange() {
    this.thing_ids = flattenDeep(
      this.list.filter(item => item.checked || item.indeterminate)
        .map(item => item.children.filter(item => item.checked)
          .map(item => item.id)
        )
    );
    this.http.post('/web/price/edit-is-test', {
      thing_id: this.thing_ids,
      is_test: this.is_test == 0 ? '1' : '0'
    }).subscribe(result => {
      if (result['code'] === 0) {
        this.getList();
        this.message.success(result['msg']);
        this.menuService.getBacklog();
      } else {
        this.message.error(result['msg']);
      }
    });
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.
    this.pageDestroy$.next();
    this.pageDestroy$.complete();
  }

  delayNotice() {
    this.thing_ids = flattenDeep(
      this.list.filter(item => item.checked || item.indeterminate)
        .map(item => item.children.filter(item => item.checked)
          .map(item => item.id)
        )
    );
    //显示弹框
    this.modalService.open('delay-remind', {
      current_workflow: 10300,
      thing_id: this.thing_ids
    })
  }
}
