import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-container-table-group',
  templateUrl: './table-group.container.html',
  styleUrls: ['./table-group.container.css']
})

export class TableGroupContainer implements OnInit {
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @Output() changeDisabledButton: EventEmitter<any> = new　EventEmitter();
  @Output() blurEvent: EventEmitter<any> = new　EventEmitter();
  @Output() clickEvent: EventEmitter<any> = new　EventEmitter();
  @Output() operateEvent1: EventEmitter<any> = new　EventEmitter();
  // loading
  @Input() loading;
  // 配置项
  @Input() columns = [];
  @Input() childrenColumns = [];
  // 数据列表
  @Input() list;
  allChecked = false;
  @Input() disabledButton = true;
  @Input() isChildrenDisabled = true;
  checkedNumber = 0;
  indeterminate = false;
  expand = {};
  // 分页
  @Input() pagination = {
    total_count: null,
    page_size: '10',
    page_index: '1',
  };

  constructor(private route: ActivatedRoute
    , private router: Router
    , private http: HttpClient
    , private fb: FormBuilder) {
  }

  ngOnInit() {
    // this.getTableList();
  }

  // 表格复选
  refreshStatus(notSet ?: boolean): void {
    let checkedNumber = 0;
    this.indeterminate = false;
    this.list.forEach(item => {
      if (item.children && item.children.length > 0) {
        if (notSet) {
          item.children.forEach(data => data.checked = item.checked);
        }
        if (item.children.length === item.children.filter(value => value.checked).length) {
          item.checked = true;
        } else {
          item.checked = false;
        }
        const allChecked2 = item.children.every(value => value.checked === true);
        const allUnChecked2 = item.children.every(value => !value.checked);
        item.indeterminate = (!allChecked2) && (!allUnChecked2);
        checkedNumber = checkedNumber + item.children.filter(value => value.checked).length;
      }
    });
    this.checkedNumber = checkedNumber;
    let flag = !(checkedNumber > 0);
    this.changeDisabledButton.emit(flag);
    // this.disabledButton = !this.list.some(value => value.checked);
    this.isCheckAll();
  }

  refreshChildrenStatus(val, itemId) {
    this.refreshStatus(false);
  }

  isCheckAll() {
    const allChecked = this.list.every(value => value.checked === true);
    const allUnChecked = this.list.every(value => !value.checked);
    this.allChecked = allChecked;
    this.indeterminate = (!allChecked) && (!allUnChecked);
  }

  // 表格全选
  checkAll(value: boolean): void {
    this.list.forEach(data => data.checked = value);
    this.refreshStatus(true);
  }

  // 页码改变时
  pageIndexChange(page_index) {
    this.pagination.page_index = page_index;
    this.getTableList();
  }

  // 每页显示数改变时
  pageSizeChange(page_size) {
    this.pagination.page_size  = page_size;
    this.pagination.page_index = '1';
    this.getTableList();
  }

  // 获取数据列表
  getTableList() {
    this.getList.emit(this.pagination);
  }

  // 获取失去焦点事件
  getBlurEvent(key, item) {
    this.blurEvent.emit({key: key, item: item});
  }

  // 获取点击事件
  getClickEvent(key, item) {
    this.clickEvent.emit({key: key, item: item});
  }

  // 操作按钮
  operate1(key, item) {
    this.operateEvent1.emit({key: key, item: item});
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
