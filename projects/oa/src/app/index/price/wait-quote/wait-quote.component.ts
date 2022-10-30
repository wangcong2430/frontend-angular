import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service'
import { Router } from '@angular/router';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './wait-quote.component.html',
  styleUrls: ['./wait-quote.component.css']
})
export class WaitQuoteComponent implements OnInit {
  isOpen = false;
  formData;
  // loading
  loading = true;
  listLoading = false;
  isSubmitLoading = false;
  searchFormData = {
    ...getUrlParams()
  };
  // 配置项
  queryFields = [];
  disabledButton = true;
  // 数据列表
  list = [];
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  displayData;
  isVisible = false;
  reason = '';
  isSearchDropdown = false;
  isColumnDropdown = false;
  showChildrenColumns = {};
  childrenColumns = [];
  filterValue = '';
  serviceData;

  constructor(
    private http: HttpClient,
    private message: MessageService,
    private menuService: MenuService,
    private modalService: ModalService,
    private router: Router
  ) {}

  // 翻页方法
  pageIndexChange($event): void {
    this.pagination.page_index = $event;
    this.getList();
  }

  // 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  getConfig() {
    // this.loading = true;
    this.http.get('web/price/wait-quote-price-config').subscribe(result => {
      this.loading          = false;
      this.queryFields      = result['queryFields'];
      this.getList();
    });
  }

  // 每页显示数改变时
  pageSizeChange(page_size) {
    this.pagination.page_size  = page_size;
    this.pagination.page_index = '1';
    this.getList();
  }

  currentPageDataChange($event): void {
    this.displayData = $event;
  }

  refreshThingStatus(index: number): void {
    let checkedThingNumber = 0;
      this.displayData.forEach((demand, demandIndex) => {
      if(demandIndex == index){
        const allThingChecked = demand['thing'].every(value => value.checked === true);
        const allUnThingChecked = demand['thing'].every(value => !value.checked);
        demand.checked = allThingChecked;
        demand.indeterminate = (!allThingChecked) && (!allUnThingChecked);
      }
        checkedThingNumber = checkedThingNumber + demand['thing'].filter(value => value.checked).length;
    });
    this.disabledButton = !this.list.some((demand, demandIndex) => {
      return demand['thing'].some(value => value.checked);
    });
  }

  checkThingAll(index: number, value: boolean): void {
    this.displayData.forEach((demand, demandIndex) => {
      if (demandIndex == index) {
        demand.checked = value;
        demand['thing'].forEach(thing => thing.checked = value);
      }
    });
    this.refreshThingStatus(index);
  }

  ngOnInit() {
    this.getConfig();
  }

  // 获取数据列表
  getList() {
    this.listLoading = true;
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);
    params = {
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/price/wait-quote-list', { params: params }).subscribe(result => {
      this.listLoading = false;
      if (result['code'] === 0) {
        this.list                   = result['data']['list'];
        this.pagination.total_count = result['data']['pager']['itemCount'];
        this.pagination.page_index  = result['data']['pager']['page'];
        this.pagination.page_size   = result['data']['pager']['pageSize'];
      }
      this.showChildrenColumns = {
        'quote_flow_step': true,
        'supplier': true,
        'recent_price': true,
        'unit_price': true,
        'workload': true,
        'total_price': true,
        'produce_grade': true,
        'complete_date': true,
        'not_pass_percent': true,
        'remark': true,
        'manager_remark': true,
        'down_price_template': true
      }
      this.childrenColumns = [
        {
          key: 'quote_flow_step',
          label: '报价状态',
          show: true
        },
        {
          key: 'supplier',
          label: 'CP名称',
          show: true
        },
        {
          key: 'unit_price',
          label: '单价',
          show: true
        },
        {
          key: 'workload',
          label: '报价数量',
          show: true
        },
        {
          key: 'total_price',
          label: '总价',
          show: true
        },
        {
          key: 'down_price_template',
          label: '下载报价模板',
          show: true
        },
        {
          key: 'produce_grade',
          label: '制作等级',
          show: true
        },
        {
          key: 'complete_date',
          label: '承诺交付日期',
          show: true,
        },
        {
          key: 'not_pass_percent',
          label: '不通过结算比例',
          show: true
        },
        {
          key: 'remark',
          label: 'CP备注',
          show: true
        },
        {
          key: 'manager_remark',
          label: '采购经理备注',
          show: true
        }
      ]
      this.getDropdown();
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }
  download (id) {
    window.open('web/file/' + id , '_blank');
  }

  // 显示明细
  showPriceDetail(item, key, showCountPrice = true) {
    // this.priceDetailModal.openModal(item, key, showCountPrice);
    this.modalService.open('price-detail', {
      item: item,
      key: key,
      showCountPrice: false,
      type:'2'
    })
  }

  backInquiry() {
    let thing_id;
    thing_id = [];
    // 遍历list列出选中的物件ID
    this.list.forEach((demand, demandIndex) => {
      if (demand.indeterminate || demand.checked) {
        demand['thing'].forEach((thing, thingIndex) => {
          if (thing.checked) {
            thing_id.push(thing['id']);
          }
        });
      }
    });
    if  (thing_id.length === 0) {
      this.message.error('请选择物件');
      return false;
    }
    this.isSubmitLoading = true;
    this.message.isAllLoading = true;
    this.http.post('web/price/back-inquiry', {thingId: thing_id}).subscribe(result => {
      this.isSubmitLoading = false;
      this.message.isAllLoading = false;
      if (result['code'] == -1) {
        this.message.error(result['msg']);
      } else {
        this.message.success(result['msg']);
        this.getList();
        this.menuService.getBacklog();
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.isSubmitLoading = false;
    });
  }

  checkModelChange () {
    this.queryFields = [...this.queryFields]
  }

  overQuote() {
    let thing_id;
    thing_id = [];
    // 遍历list列出选中的物件ID
    this.list.forEach((demand, demandIndex) => {
      if (demand.indeterminate || demand.checked) {
        demand['thing'].forEach((thing, thingIndex) => {
          if (thing.checked) {
            thing_id.push(thing['id']);
          }
        });
      }
    });
    if  (thing_id.length === 0) {
      this.message.error('请选择物件');
      return false;
    }
    this.isSubmitLoading = true;
    this.message.isAllLoading = true;
    this.http.post('web/price/over-quote', {thingId: thing_id, reason: this.reason}).subscribe(result => {
      this.isVisible = false;
      this.isSubmitLoading = false;
      this.message.isAllLoading = false;
      if (result['code'] == -1) {
        this.message.error(result['msg']);
      } else {
        this.message.success(result['msg']);
        this.getList();
        this.menuService.getBacklog();
      }
    }, (err) => {
      this.message.error('网络异常，请稍后再试');
      this.message.isAllLoading = false;
      this.isSubmitLoading = false;
    });
  }

  dropdownChange(bol, type) {
    if(bol == false) {
      this.closeDropdown(type);
    }
  }
  columnChange(bol, column) {
    this.showChildrenColumns[column.key] = bol;
  }
  // 设置已选择缓存
  closeDropdown(type) {
    if(type == 'search') {
      let searchList = {};
      if(localStorage.getItem('searchDropdown')) {
        searchList = JSON.parse(localStorage.getItem('searchDropdown'));
        searchList[this.router.url] = []
      } else {
        searchList = {
          [this.router.url]: []
        }
      }
      this.isSearchDropdown = false;
      this.queryFields.forEach(item => {
        searchList[this.router.url].push({
          key: item.key,
          show: item.show
        })
      })
      localStorage.setItem('searchDropdown', JSON.stringify(searchList));
    } else if(type == 'column') {
      this.isColumnDropdown = false;
      let columnList = {};
      if(localStorage.getItem('columnDropdown')) {
        columnList = JSON.parse(localStorage.getItem('searchDropdown'));
        columnList[this.router.url] = [];
      } else {
        columnList = {
          [this.router.url]: []
        }
      }
      this.childrenColumns.forEach(item => {
        columnList[this.router.url].push({
          key: item.key,
          show: item.show
        })
      })
      localStorage.setItem('columnDropdown', JSON.stringify(columnList));
    }
  }
  // 获取缓存
  getDropdown() {
    const url = this.router.url;
    if(localStorage.getItem('searchDropdown')) {
      const searchList = JSON.parse(localStorage.getItem('searchDropdown'));
      if(searchList[url]) {
        this.queryFields.forEach(item => {
          searchList[url].forEach(search => {
            if(item.key == search.key) {
              item.show = search.show;
            }
          })
        })
      }
    }
    if(localStorage.getItem('columnDropdown')) {
      const columnList = JSON.parse(localStorage.getItem('columnDropdown'));
      if(columnList[url]) {
        this.childrenColumns.forEach(item => {
          columnList[url].forEach(column => {
            if(item.key == column.key) {
              item.show = column.show;
              this.showChildrenColumns[column.key] = column.show;
            }
          })
        })
      }
    }
  }

  // 页面过滤
  searchData() {
    if (this.filterValue) {
      this.filterValue = this.filterValue.toString().trim().toUpperCase()
    } else {
      this.message.error('请输入查询的值');
      return;
    }

    if(!this.serviceData) {
      this.serviceData = JSON.parse(JSON.stringify(this.list));
    }
    if(!this.filterValue) {
      this.list = this.serviceData;
      return;
    }
    this.list = JSON.parse(JSON.stringify(this.serviceData)).filter(item => {
      item.thing = item.thing.filter(thing => {
        thing.thing_quote = thing.thing_quote.filter(item => {
          for(let i = 0; i < this.childrenColumns.length; i++) {
            if(item[this.childrenColumns[i].key] && item[this.childrenColumns[i].key].indexOf(this.filterValue) != -1) {
              return item;
            }
          }
        })
        if(thing.thing_quote.length > 0) return thing;
      })
      return item.thing.length > 0;
    })
  }

  // 全选
  checkAll(): void {
    this.list.forEach(data => {
      data.checked = true;
      data.indeterminate = false;
      if (data.thing) {
        data.thing.forEach(data2 => data2.checked = true);
      }
    });
  }

  // 反选
  checkReverse () {
    this.list.forEach(data => {
      data.checked = !data.checked;
      if (data.thing) {
        data.thing.forEach(data2 => data2.checked = !data2.checked);
      }
    });
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
  openOrCloseAll (checked = false) {
    this.list = this.list.map(item => {
      return {
        ...item,
        expand: checked
      }
    })
  }
}
