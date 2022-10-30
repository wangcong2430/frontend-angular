import {
  Component, EventEmitter, ChangeDetectorRef,
  ChangeDetectionStrategy, Input, OnInit, Output, OnDestroy, OnChanges, SimpleChanges,
  ViewChild, ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';
import { ModalService } from '../../services/modal.service';
import { MessageService } from '../../services/message.service';


@Component({
  selector: 'app-container-table-group-new',
  templateUrl: './table-group-new.container.html',
  styleUrls: ['./table-group-new.container.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})

export class TableGroupNewContainer implements OnInit, OnDestroy, OnChanges {

  @ViewChild('nestedTable') nestedTable: ElementRef;
  // 列表无数据状态
  @Input() nzNoResult;
  @Input() showCheckbox;
  // loading
  @Input() loading;
  // 配置项
  @Input() columns = [];
  @Input() childrenColumns = [];
  // 数据列表
  @Input() list;
  @Input() queryFields;
  @Input() disabledButton = true;
  @Input() isChildrenDisabled = false;
  // 分页
  @Input() pagination = {
    total_count: null,
    page_size: '10',
    page_index: '1',
  };
   //是否可不可编辑
   @Input() id_detail = false;
  @Input() frontPagination = false;
  @Input() selectArr = [];
  @Input() hasSearch = true //是否展示页面过滤
  @Input() hasDropdownChange = true //是否有列选择功能
  @Output() listChange: EventEmitter<any> = new　EventEmitter();
  @Output() getList: EventEmitter<any> = new　EventEmitter();
  @Output() changeDisabledButton: EventEmitter<any> = new　EventEmitter();
  @Output() blurEvent: EventEmitter<any> = new　EventEmitter();
  @Output() clickEvent: EventEmitter<any> = new　EventEmitter();
  @Output() operateEvent1: EventEmitter<any> = new　EventEmitter();
  @Output() selectPass: EventEmitter<any> = new　EventEmitter();
  @Output() allSelect: EventEmitter<any> = new　EventEmitter();
  @Output() queryFieldsChange: EventEmitter<any> = new　EventEmitter();
  @Output() selectBatchScoringList : EventEmitter<any> = new　EventEmitter();


  allChecked = false;
  checkedNumber = 0;
  indeterminate = false;
  isExpand = true;
  expand   = {};
  isSearchDropdown = false;
  isColumnDropdown = false;
  serviceData; // 保存页面数据
  isPreview = false;
  filterValue = '';
  paginationChange$ = new BehaviorSubject({});

  listcache = {};

  formatterPercent = (value: number) => {
    return value ? `${value} %` : value
  };

  constructor(
    private router: Router,
    private modalService: ModalService,
    private msg: MessageService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.paginationChange$.pipe(skip(1), debounceTime(10)).subscribe(item => {
      this.getTableList();
    });
    this.childrenColumns.forEach(item => {
      item.show = true;
      if(item.key=='demand_acceptance_score') {
        item.type='evaluateDetail'
      }
    });
    this.getDropdown();

    const key = this.router.url + 'expand';
    this.expand = sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)) : this.expand;
    this.cd.markForCheck();
  }

  ngOnChanges(change: SimpleChanges) {
    // changes.prop contains the old and the new value...
    if (change.list &&  change.list.currentValue && change.list.currentValue.length > 0 || change.disabledButton ) {
      this.list.forEach(item => {
        if (item.id && this.expand.hasOwnProperty(item.id)) {
          item.expand = this.expand[item.id];
        }
        this.isCheckAll(item)
      });
      this.cd.markForCheck();
    }
  }


  stopPropagation ($event, type) {
    if (type) {
      $event.stopPropagation()
    }
  }

  refreshStatus(data ): void {
    if (data && data['children'] && data['children'].length > 0) {
      data.indeterminate = false;
      data['children'].forEach(item => {
        item.checked = data['checked'] ? data['checked'] : false;
      });
    }
    this.isCheckAll(data);
  }

  refreshChildrenStatus(data) {
    if (data && data.children && data.children.length > 0) {
      data.checked = data.children.filter(value => !value.disabled).every(value => value.checked);
      const allUnChecked = data.children.filter(value => !value.disabled).every(value => !value.checked);
      data.checked = data.children.filter(value => !value.disabled).every(value => value.checked);
      data.indeterminate = (!data.checked) && (!allUnChecked);

      this.isCheckAll(data);
    }
  }

  copy (text) {
    // window.clipboardData.setData('text', text);
    let transfer = document.createElement('input');
    document.body.appendChild(transfer);
    transfer.value = text;  // 这里表示想要复制的内容
    transfer.focus();
    transfer.select();
    if (document.execCommand('copy')) {
        document.execCommand('copy');
    }
    transfer.blur();
    // console.log('复制成功');
    // this.msg.success('物件单号复制成功');
    document.body.removeChild(transfer);
  }

  trackByIndex(_: number, data): number {
    return data.id;
  }

  isCheckAll(data) {

    data['order_amount'] = 0;
    data['product_price'] = 0;
    data['brand_price'] = 0;
    if (data['indeterminate'] || data['checked']) {
      if (data['children'] instanceof Array && data['children'].length > 0 && data['children'].some(item => item.checked)) {
        data['order_amount'] = data['children']
          .filter(item => item.checked)
          .map(item => item.new_total_price)
          .reduce((total, num) => Number(total) + Number(num));

          // 产品预算
        if (data['children'].some(item => item.checked && item.budget_type === '2')) {
          data['product_price'] = data['children']
            .filter(item => item.checked && item.budget_type === '2')
            .map(item => item.new_total_price)
            .reduce((total, num) => Number(total) + Number(num));
        }

        // 品牌预算
        if (data['children'].some(item => item.checked && item.budget_type === '1')) {
          data['brand_price'] = data['children']
            .filter(item => item.checked && item.budget_type === '1')
            .map(item => item.new_total_price)
            .reduce((total, num) => Number(total) + Number(num));
        }
      }
    }

    // 计算总金额
    if (data['children'] instanceof Array) {
      if (data['children'].length > 0 && data['children'].some(item => item.checked)) {
        if (typeof data['total_price_cny'] === 'number')  {
          data['content_order_amount'] = data.total_price_cny.toFixed(2);
        } else {
          data['content_order_amount'] = data['children'].filter(item => item.checked).map(item => {
            if (typeof item.total_price_cny === 'number') {
              return Number(item.total_price_cny) + Number(item.tax_price_cny || 0);
            }
            return Number(item.total_price) +  Number(item.tax_price || 0);

          }).reduce((total, num) => Number(total) + Number(num));
          data['content_order_amount'] = data['content_order_amount'].toFixed(2);
        }
      } else {
        data['content_order_amount'] = 0;
      }
    }

    const flag = this.list.some( item => item['indeterminate'] || item['checked']);
    this.changeDisabledButton.emit(!flag);

    const allChecked = this.list.every(value => value.checked === true);
    const allUnChecked = this.list.every(value => !value.checked);
    this.allChecked = allChecked;
    this.indeterminate = (!allChecked) && (!allUnChecked);
    this.cd.markForCheck();
  }


  // 表格反选
  checkReverse(): void {
    let list;
    list = this.list.map((value, index) => {
      return Object.assign(value, {checked: !value.checked}, value.children.map((res, i) => {
        return Object.assign(res, {checked: !res.checked});
      }) );
    });
    this.list = list;
    this.cd.markForCheck();
  }

  // 全部展开、全部收起
  openOrCloseAll() {
    this.list.forEach((value, index) => {
      this.expandChange(value.id);
    });
    this.cd.markForCheck();
  }


  // 页码改变时
  pageIndexChange(page_index) {
    this.pagination.page_index = page_index;
    this.paginationChange$.next(this.pagination);
    this.cd.markForCheck();
  }

  // 每页显示数改变时
  pageSizeChange(page_size) {
    this.pagination.page_size  = page_size;
    this.paginationChange$.next(this.pagination);
    this.cd.markForCheck();
  }

  // 获取数据列表
  getTableList() {
    if (!this.frontPagination) {
      this.getList.emit(this.pagination);
      this.cd.markForCheck();
    }
  }

  getallSelect(key, item) {
    this.allSelect.emit({key: key, item: item});
  }
  // 获取失去焦点事件
  getBlurEvent(key, item, item2 = {}) {
    this.blurEvent.emit({key: key, item: item, parentItem: item2});
  }

  // 获取点击事件
  getClickEvent(key, item, type, event) {
    event.stopPropagation();
    if(key==='thing_code'){
      this.modalService.open('thing', item)
    } else if (type === 'img') {
      this.preview(item[key], item.thing_name);
    } else if (type === 'thing') {
      this.modalService.open('thing', {
        id: item.order_id
      });
    } else if (type === 'order') {
      this.modalService.open('order', {
        id: item.id
      });
    } else  {
      this.clickEvent.emit({key: key, item: item});
    }
  }

  preview (url, name = null) {
    this.modalService.open('photo', {
      title: name,
      url: url
    });
  }

  // 操作按钮
  operate1(key, item) {
    this.operateEvent1.emit({key: key, item: item});
  }

  // 通过程度按钮
  getRadio(key, item, data2) {
    this.selectPass.emit({key: key, item: item});
    if (data2['is_test'] == '0') {
      data2['acceptance_reason'] = '';
    }
    this.cd.markForCheck();
  }

  // 显示展开按钮
  expandChange(data) {
    data.expand = !data.expand;
    if (data.id) {
      this.expand[data.id] = data.expand;
      const key = this.router.url + 'expand';
      sessionStorage.setItem(key, JSON.stringify(this.expand));
    }
    this.cd.markForCheck();
  }

  // 显示明细
  showPriceDetail(item, key, event) {
    let showCountPrice = true;
    let type = "1";
    //指明是预期的，需求明细模板
    if(key == 'pre_produce_breakdown'){
      showCountPrice = false;
      type = "2";
    }
    //流程在待核价前，需求明细模板
    if(item.current_workflow <= '10400'){
      showCountPrice = false;
      type = "2";
    }
    event.stopPropagation();
    this.modalService.open('price-detail', {
      key: key,
      item: item,
      showCountPrice: showCountPrice,
      type: type
    });
    this.cd.markForCheck();
  }

  // 是否显示明细按钮，循环判断里面的value是否都为null
  isShowDetail (data, key) {
    if ( data[key] && !Array.isArray(data[key]) && data[key] !== '') {
      return Array.isArray(JSON.parse(data[key])) && JSON.parse(data[key]).some(item => item.value || item.pre_value);
    } else {
      return data[key].some(item => item.value || item.pre_value);
    }
  }

  listDataChange() {
    if (this.list) {
      this.list.forEach(data => {
        this.expand[data.id] = this.isExpand;
      });
    }
    this.cd.markForCheck();
  }

  strToNumber (value) {
    return Number(value);
  }


  dropdownChange(bol, type) {
    if (bol == false) {
      this.closeDropdown(type);
    }
    // console.log('333')
    // this.cd.markForCheck();
    this.cd.detectChanges();
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
          show: item.show,
          hide: !item.show
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
      this.childrenColumns.forEach(item => {
        columnList[this.router.url].push({
          key: item.key,
          show: item.show
        });
      });
      localStorage.setItem('columnDropdown', JSON.stringify(columnList));
    }
    this.cd.markForCheck();
  }
   //评分textarea 改变触发
   getKeydown(index,idx,idx1,err,value,event){
    if(event){
      event.stopPropagation()
    }
    this.list[index].children[idx].score_options[idx1].complyRule='no'
  }
  // 获取缓存
  getDropdown() {
    const url = this.router.url;
    if (localStorage.getItem('searchDropdown')) {
      const searchList = JSON.parse(localStorage.getItem('searchDropdown'));
      if (searchList[url]) {
        this.queryFields&&this.queryFields.forEach(item => {
          searchList[url].forEach(search => {
            if (item.key === search.key) {
              item.show = search.show;
            }
          });
        });
      }
    }
    if (localStorage.getItem('columnDropdown')) {
      const columnList = JSON.parse(localStorage.getItem('columnDropdown'));
      if (columnList[url]) {
        this.childrenColumns.forEach(item => {
          columnList[url].forEach(column => {
            if (item.key === column.key) {
              item.show = column.show;
            }
          });
        });
      }
    }
    this.cd.markForCheck();
  }
  // 页面过滤
  searchData() {
    if (this.filterValue) {
      this.filterValue = this.filterValue.toString().trim().toUpperCase();
    } else {
      this.msg.error('请输入查询的值');
      return;
    }

    this.list = this.list.filter(item => {
      item.children = item.children.filter(child => {
        for (let i = 0; i < this.childrenColumns.length; i++) {
          if (this.childrenColumns[i].show && child[this.childrenColumns[i].key]
              && child[this.childrenColumns[i].key].toString().indexOf(this.filterValue) !== -1) {
            return child;
          }
        }
      });
      return item.children.length > 0;
    });

    this.cd.markForCheck();
  }
  //input type= number 禁止输入e
  onlyNumber(event){
    return (/[\d]/.test(String.fromCharCode(event.keyCode)))
  }
  //页面select 过滤
  selectList(key,value:any){
    console.log("key",key,value)
    if(key=='supplier_id'){
      this.selectBatchScoringList.emit(value)
    }
  }
  keyUpSearch ($event, children) {
    if (children.filter(item => item.checked >= 2)) {
      const first = children.map(item => item.checked).indexOf(true);
      const last = children.map(item => item.checked).lastIndexOf(true);

      children.forEach((item, index) => {
        if (index > first && index < last) {
          item.checked = true;
        }
      });
    }

    this.cd.markForCheck();
  }

  moveX = null

  checkModelChange () {
    this.queryFieldsChange.emit([...this.queryFields])
  }

  dragstart($event) {
    this.moveX = null
  }
  dragmove($event) {
    if (this.moveX) {
      this.nestedTable['tableBodyElement'].nativeElement.scrollLeft -= ($event.pointerPosition.x - this.moveX)
      this.moveX = $event.pointerPosition.x
    } else {
      this.moveX = $event.pointerPosition.x
    }
  }

  sort(e, list, index) {
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

    list = list.sort(compare(e.key, e.value));

    this.list[index].children = [...list]
    this.cd.markForCheck();
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
  ngOnDestroy () {
    this.paginationChange$.complete();
  }

}

