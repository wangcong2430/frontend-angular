import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';
import { ModalService } from '../../services/modal.service';


@Component({
  selector: 'app-container-table',
  templateUrl: './table.container.html',
  styleUrls: ['./table.container.css']
})

export class TableContainer implements OnInit {
  @ViewChild('nestedTable') nestedTable: ElementRef;
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @Output() changeDisabledButton: EventEmitter<any> = new　EventEmitter();
  @Output() clickEvent: EventEmitter<any> = new　EventEmitter();
  // loading
  @Input() loading;
  // 配置项
  @Input() columns = [];
  // 数据列表
  @Input() list;
  allChecked = false;
  @Input() disabledButton = true;
  @Input () showCheckbox = true;
  @Input () queryFields;
  checkedNumber = 0;
  indeterminate = false;
  expand = null;
  // 分页
  @Input() pagination = {
    total_count: null,
    page_size: '10',
    page_index: '1',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    private modal: ModalService
  ) {}

  paginationChange$ = new BehaviorSubject({});

  ngOnInit() {
    this.paginationChange$.pipe(skip(1), debounceTime(10)).subscribe(item => {
      this.getTableList();
    });
  }

  // 表格复选
  refreshStatus(): void {
    const allChecked = this.list.every(value => value.checked === true);
    const allUnChecked = this.list.every(value => !value.checked);
    this.allChecked = allChecked;
    this.indeterminate = (!allChecked) && (!allUnChecked);
    this.checkedNumber = this.list.filter(value => value.checked).length;
    this.changeDisabledButton.emit(!this.list.some(value => value.checked));
  }

  // 表格全选
  checkAll(value: boolean): void {
    this.list.forEach(data => data.checked = value);
    this.refreshStatus();
  }


  // 页码改变时
  pageIndexChange(page_index) {
    this.pagination.page_index = page_index;
    this.paginationChange$.next(this.pagination);
  }

  // 每页显示数改变时
  pageSizeChange(page_size) {
    this.pagination.page_size = page_size;
    this.paginationChange$.next(this.pagination);
  }

  // 获取数据列表
  getTableList() {
    this.getList.emit(this.pagination);
  }

  // 获取点击事件
  getClickEvent(key, item, img = false) {
    if (img) {
      this.modal.open('photo', {
        title: item.thing_name,
        url: item.img,
      });
    } else {
      this.clickEvent.emit({key: key, item: item});
    }
  }

  // 图片预览
  preview (url, name = null) {
    this.modal.open('photo', {
      title: name,
      url: url
    });
  }

  moveX = null
  dragstart($event) {
    this.moveX = null
  } 
  
  dragmove($event) {
    if (this.moveX) {
      this.nestedTable['tableHeaderNativeElement'].scrollLeft -= ($event.pointerPosition.x - this.moveX)
      this.moveX = $event.pointerPosition.x
    } else {
      this.moveX = $event.pointerPosition.x
    }
  }

  // 显示明细
  showPriceDetail(item, key) {
    // this.priceDetailModal.openModal(item, key);
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
