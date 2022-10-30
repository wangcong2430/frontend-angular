import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';
import { ModalService } from '../../services/modal.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-container-table',
  templateUrl: './table.container.html',
  styleUrls: ['./table.container.css']
})

export class TableContainer implements OnInit, OnDestroy {
  @ViewChild('nestedTable') nestedTable: ElementRef;
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @Output() changeDisabledButton: EventEmitter<any> = new　EventEmitter();
  @Output() clickEvent: EventEmitter<any> = new　EventEmitter();
  @Output() queryFieldsChange: EventEmitter<any> = new　EventEmitter();
  
  //textarea 当前值
  @Input() textareaValue = null
  // loading
  @Input() loading;
  //是否可不可编辑
  @Input() id_detail = false;
  // 配置项
  @Input() columns = [];
  @Input() queryFields;
  // 数据列表
  @Input() listMessage = '';
  @Input() list = [];
  @Input() showCheckbox = true;
  @Input() serialNumber = false; //是否展示没有勾选功能的序号
  @Input() noSerialNumber = true
  allChecked = false;
  @Input() disabledButton = true;
  checkedNumber = 0;
  indeterminate = false;
  // 分页
  @Input() showPagination = true;
  @Input() pagination = {
    total_count: null,
    page_size: '10',
    page_index: '1',
  };

  last_page_index = null;
  last_page_size = this.pagination.page_size;

  expand = {};
  isSearchDropdown = false;
  isColumnDropdown = false;
  serviceData; // 保存页面数据
  filterValue = '';

  moveX = null

  constructor(
    private modalService: ModalService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private msg: MessageService

  ) {}

  paginationChange$ = new BehaviorSubject({});

  ngOnInit() {
    this.paginationChange$.pipe(skip(1), debounceTime(10)).subscribe(item => {
      this.getTableList();
    });
    this.columns.forEach(item => {
      item.show = true;
    });
    this.getDropdown();
  }

  ngOnDestroy () {
    this.paginationChange$.complete();
  }

  // 表格复选
  refreshStatus(): void {
    const allChecked = this.list.every(value => value.checked === true);
    const allUnChecked = this.list.every(value => !value.checked);
    this.allChecked = allChecked;
    this.indeterminate = (!allChecked) && (!allUnChecked);
    this.checkedNumber = this.list.filter(value => value.checked).length;
    this.changeDisabledButton.emit(!this.list.some(value => value.checked || value.indeterminate));
  }

  // 表格全选
  checkAll(value: boolean): void {
    this.list.forEach(data => data.checked = value);
    this.changeDisabledButton.emit(true);
    this.refreshStatus();
  }


  // 页码改变时
  pageIndexChange(page_index) {
    this.pagination.page_index = page_index;
    this.changeDisabledButton.emit(this.list.some(value => value.checked || value.indeterminate));
    this.paginationChange$.next(this.pagination);
  }
  
  //textarea 输入事件
  textareaInput(length,event){
    if(event.length>length){
      this.msg.error('最多只能输入200个字符')
    }
    
  }
  
  // 每页显示数改变时
  pageSizeChange(page_size) {
    this.pagination.page_size = page_size;
    this.changeDisabledButton.emit(!this.list.some(value => value.checked || value.indeterminate));
    this.paginationChange$.next(this.pagination);
  }

  // 获取数据列表
  getTableList() {
    this.getList.emit(this.pagination);
  }

  // 获取点击事件
  getClickEvent(key, item, img = false, event) {
    event.stopPropagation();

    if (img) {
      this.modalService.open(
        'photo',
        {
          title: item.thing_name,
          url: img
        }
      );
    } else {
      this.clickEvent.emit({key: key, item: item});
    }
  }
  //input type= number 禁止输入e
  onlyNumber(event){
    return (/[\d]/.test(String.fromCharCode(event.keyCode)))
  }
  //评分textarea 改变触发
  getKeydown(index,idx,err,value,event){
    if(event){
      event.stopPropagation()
    }
    this.list[index].score_options[idx].complyRule='no'
    // if(err&&(value<=0||value>100||value%5!=0)){
    //   this.msg.error('请填写0~100，5倍数的整数')
    // }
  }
  // 显示明细
  showPriceDetail(item, key, event) {
    event.stopPropagation();
    this.modalService.open('price-detail', {
      item: item,
      key: key
    });
  }

  // 当前处理人分割成数组
  getUsersList(str: string) {
    const users = str.split(';').map(user => {
      return user;
    });
    return users;
  }

  sort(e) {
    const list = JSON.parse(JSON.stringify(this.list));
    const compare = function (prop, type) {
      return function (obj1, obj2) {
        const val1 = obj1[prop];
        const val2 = obj2[prop];
          if ( type === 'descend' ) {
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

  dropdownChange(bol, type) {
    if (bol === false) {
      this.closeDropdown(type);
    }
  }

  checkModelChange () {
    this.queryFieldsChange.emit([...this.queryFields])
  }

  // 设置已选择缓存
  closeDropdown(type) {
    if (type === 'search') {
      let searchList = {};
      if (localStorage.getItem('searchDropdown')) {
        searchList = JSON.parse(localStorage.getItem('searchDropdown'));
        searchList[this.router.url] = [];
      } else {
        searchList = {
          [this.router.url]: []
        };
      }
      this.isSearchDropdown = false;
      this.queryFields.forEach(item => {
        searchList[this.router.url].push({
          key: item.key,
          show: item.show
        });
      });
      localStorage.setItem('searchDropdown', JSON.stringify(searchList));
    } else if (type === 'column') {
      this.isColumnDropdown = false;
      let columnList = {};
      if (localStorage.getItem('columnDropdown')) {
        columnList = JSON.parse(localStorage.getItem('searchDropdown'));
        columnList[this.router.url] = [];
      } else {
        columnList = {
          [this.router.url]: []
        };
      }
      this.columns.forEach(item => {
        columnList[this.router.url].push({
          key: item.key,
          show: item.show
        });
      });
      localStorage.setItem('columnDropdown', JSON.stringify(columnList));
    }
  }
  // 获取缓存
  getDropdown() {
    const url = this.router.url;
    if (localStorage.getItem('searchDropdown')) {
      const searchList = JSON.parse(localStorage.getItem('searchDropdown'));
      if (searchList[url]) {
        this.queryFields&&this.queryFields.forEach(item => {
          searchList[url].forEach(search => {
            if (item.key == search.key) {
              item.show = search.show;
            }
          });
        });
      }
    }
    if (localStorage.getItem('columnDropdown')) {
      const columnList = JSON.parse(localStorage.getItem('columnDropdown'));
      if (columnList[url]) {
        this.columns.forEach(item => {
          columnList[url].forEach(column => {
            if (item.key == column.key) {
              item.show = column.show;
            }
          });
        });
      }
    }
  }
  // 页面过滤
  searchData() {
    if (this.filterValue) {
      this.filterValue = this.filterValue.toString().trim().toUpperCase()
    } else {
      this.msg.error('请输入查询的值');
      return;
    }

    if (!this.serviceData) {
      this.serviceData = JSON.parse(JSON.stringify(this.list));
    }
    if (!this.filterValue) {
      this.list = this.serviceData;
      return;
    }
    this.list = JSON.parse(JSON.stringify(this.serviceData)).filter(child => {
      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].show && child[this.columns[i].key] && child[this.columns[i].key].toString().indexOf(this.filterValue) != -1) {
          return child;
        }
      }
    });
  }

  
  dragstart($event) {
    this.moveX = null
  } 
  
  dragmove($event) {
    if (this.moveX) {
      this.nestedTable['tableBodyNativeElement'].scrollLeft -= ($event.pointerPosition.x - this.moveX)
      this.moveX = $event.pointerPosition.x
    } else {
      this.moveX = $event.pointerPosition.x
    }
  }

  // 图片预览
  preview (url, name = null) {
    this.modalService.open('photo', {
      title: name,
      url: url
    });
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
