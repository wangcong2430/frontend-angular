import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { ActivatedRoute, Router } from '@angular/router';

import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';

@Component({
  templateUrl: './nuclear-price.component.html',
  styleUrls: ['./nuclear-price.component.css']
})

export class NuclearPriceComponent implements OnInit {
  isOpen = false;
  formData;
  //页面路径是否是核价页面
  modelClass=null;
  // loading
  loading = true;
  listLoading = false;
  // 配置项
  searchFormData = {
    ...getUrlParams()
  };
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
  displayData = [];
  modal_produce_break = [];
  is_test = '0'
  isVisible = false;
  isVisibleDemand = false;
  reason = '';
  reasonDemand = '';
  showChildrenColumns = {};
  childrenColumns = [];
  isSearchDropdown = false;
  isColumnDropdown = false;
  filterValue = '';
  serviceData;
  isAcceptLoading = false;
  rejectLoading = false;
  rejectToDraftLoading = false;
  //预计花费标红显示
  expected_expenditure_text_color = null;
  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private route: ActivatedRoute,
    private router: Router,
    private message: MessageService,
    private modalService: ModalService) {
  }

  // 翻页方法
  pageIndexChange($event): void {
    this.pagination.page_index = $event;
    this.getList();
  }

  checkModelChange() {
    this.queryFields = [...this.queryFields]
  }

  // 每页显示数改变时
  pageSizeChange(page_size) {
    this.pagination.page_size = page_size;
    this.pagination.page_index = '1';
    this.getList();
  }

  refreshThingStatus(index: number): void {
    let checkedThingNumber = 0;
    this.list.forEach((demand, demandIndex) => {
      if (demandIndex === index) {
        const allThingChecked = demand['thing'].every(value => value.checked || value.indeterminate);
        const allUnThingChecked = demand['thing'].every(value => !value.checked && !value.indeterminate);
        demand.checked = allThingChecked;
        demand.indeterminate = (!allThingChecked) && (!allUnThingChecked);
      }

      // 计算价格
      const pre_workload = demand['thing'].filter(value => value.checked || value.indeterminate).map(item => item.pre_workload)


      demand.currency = demand['thing'][0]['currency']
      demand.workload_unit = demand['thing'][0]['workload_unit']


      // 预估数量
      demand.pre_workload = null
      if (pre_workload && pre_workload.length) {
        demand.pre_workload = Number(pre_workload.reduce((total, num) => Number(total) + Number(num))).toFixed(3)
      }

      // 单价范围下限
      demand.unit_price_low = null
      demand.unit_price_height = null
      const unit_price_low = demand['thing'].filter(value => value.checked || value.indeterminate).map(item => {
        const unit_price_arr = item.thing_quote.filter(value => value.checked || value.indeterminate).map(item => item.unit_price)
        demand.currency = item.thing_quote[0]['currency']

        return Math.min(...unit_price_arr)
      })
      if (unit_price_low && unit_price_low.length) {
        demand.unit_price_low = Math.min(...unit_price_low).toFixed(2)
      }

      // 单价范围上限
      const unit_price_height = demand['thing'].filter(value => value.checked || value.indeterminate).map(item => {
        const unit_price_arr = item.thing_quote.filter(value => value.checked || value.indeterminate).map(item => item.unit_price)
        return Math.max(...unit_price_arr)
      })
      if (unit_price_height && unit_price_height.length) {
        // demand.unit_price_height = Number(unit_price_height.reduce((total, num) => Number(total) + Number(num))).toFixed(3)
        demand.unit_price_height = Math.max(...unit_price_height).toFixed(3)
      }

      // 总金额
      demand.total_price = null
      const total_price = demand['thing'].filter(value => value.checked || value.indeterminate).map(item => {
        const thing_quote = item.thing_quote.filter(value => value.checked || value.indeterminate).map(item => item.total_price)
        return Number(thing_quote.reduce((total, num) => Number(total) + Number(num)) / thing_quote.length).toFixed(3)
      })
      if (total_price && total_price.length) {
        demand.total_price = Number(total_price.reduce((total, num) => Number(total) + Number(num))).toFixed(3)
      }

      // 报价数量
      demand.workload = null
      const workload = demand['thing'].filter(value => value.checked || value.indeterminate).map(item => {
        const thing_quote = item.thing_quote.filter(value => value.checked || value.indeterminate).map(item => item.workload)
        return Number(thing_quote.reduce((total, num) => Number(total) + Number(num)) / thing_quote.length).toFixed(3)
      })
      if (workload && workload.length) {
        demand.workload = Number(workload.reduce((total, num) => Number(total) + Number(num))).toFixed(3)
      }




      checkedThingNumber = checkedThingNumber + demand['thing'].filter(value => value.checked).length;
    });

    try {
      this.disabledButton = !this.list.some((demand, demandIndex) => {
        return demand['thing'].some(value => value.checked);
      });
    } catch (error) {
      this.disabledButton = false;
    }
  }

  // 选择物件
  checkThing(list_index, thingIndex) {

    let thing = this.list[list_index]['thing'][thingIndex];
    thing.checked = !thing.checked;
    thing.indeterminate = false;

    let checked = !this.list[list_index]['thing'][thingIndex]['checked']
    if (checked) {
      let qList = this.list[list_index]['thing'][thingIndex]['thing_quote']

      if (this.is_test == '1') {
        if (qList && qList.length > 0) {
          qList.forEach(item => {
            if (item['flow_step'] != '3020') {
              item.checked = false;
            }
          })
        }
      } else {
        if (qList && qList.filter(item => item['flow_step'] == '3005').length == 1) {
          qList.forEach(item => {
            if (item['flow_step'] == '3005') {
              item.checked = false;
            }
          });
        }
      }

      this.list[list_index]['thing'][thingIndex]['thing_quote'] = qList

    } else {
      let qList = this.list[list_index]['thing'][thingIndex]['thing_quote'];

      if (this.is_test == '1') {
        if (qList && qList.length > 0) {
          qList.forEach(item => {
            if (item['flow_step'] != '3020') {
              item.checked = true;
            }
          });
        }
      } else {
        if (qList && qList.filter(item => item['flow_step'] == '3005').length == 1) {
          qList.forEach(item => {
            if (item['flow_step'] == '3005') {
              item.checked = true;
            }
          })
        }
      }
      this.list[list_index]['thing'][thingIndex]['thing_quote'] = qList
    }

    this.refreshThingStatus(list_index);
  }

  // 选择需求
  checkThingAll(index: number): void {
    let checked = !this.list[index].checked;
    this.list.forEach((demand, demandIndex) => {
      if (demandIndex === index) {
        demand.checked = checked;
        demand['thing'].forEach(thing => {

          thing.checked = checked;

          if (this.is_test == '0') {
            if (thing['thing_quote'] && thing['thing_quote'].filter(item => item['flow_step'] == '3005').length == 1) {
              thing['thing_quote'].forEach(quote => {
                if (quote['flow_step'] == '3005') {
                  quote.checked = checked;
                }
              })
            }
          } else {
            thing['thing_quote'].forEach(quote => {
              if (quote['flow_step'] != '3020') {
                quote.checked = checked;
              }
            })
          }
        });
      }
    });
    this.refreshThingStatus(index);
  }

  ngOnInit() {
    this.route.url.subscribe(urls => {      
      if (urls[0].path === 'nuclearPrice') {
        this.is_test = '0';
        this.modelClass='0'
      } else {
        this.is_test = '1';
        this.modelClass='1'
      }
      this.getConfig();
      // 获取列表信息
      this.getList();
    });

    this.modalService.complete$.subscribe(item => {
      if (item['key'] == 'inquiry') {
        this.getList();
      }
    })
  }


  getConfig() {
    this.loading = true;
    this.http.get('web/price/nuclear-price-config', {
      params: {
        is_test: this.is_test
      }
    }).subscribe(result => {
      this.loading = false;
      this.queryFields = result['queryFields'];
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

  // 获取数据列表
  getList() {
    this.listLoading = true;
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);
    params = {
      page_index: this.pagination.page_index.toString(),
      page_size: this.pagination.page_size.toString(),
      is_test: this.is_test,
      modelClass:this.modelClass,
      ...this.searchFormData
    };
    this.http.get('web/price/nuclear-price-list', { params: params }).subscribe(result => {
      this.listLoading = false;
      if (result['data']) {
        this.list                   = result['data']['list'] ? result['data']['list'] : [];
        this.list=this.list.map((item)=>{
            item.thing.map((idm)=>{
              idm.modelClass=this.modelClass
            })
            return item
        })
        //console.log(this.list)
        this.pagination.total_count = result['data']['pager']['itemCount'];
        this.pagination.page_index = result['data']['pager']['page'];
        this.pagination.page_size = result['data']['pager']['pageSize'];
        this.showChildrenColumns = {
          'supplier': true,
          'recent_price': true,
          'unit_price': true,
          'unit_price_text': true,
          'workload': true,
          'total_price': true,
          'produce_grade': true,
          'complete_date': true,
          'not_pass_percent': true,
          'remark': true,
          'manager_remark': true,
          'down_price_template': true,
          'contract_remark': true,
          'production_staff': true
        };
       /*  this.list=this.list.map((story_list) => {
          if (story_list['category_type_name'] == '营销推广费') {
            story_list['thing'].map((thing_list) => {
              thing_list['thing_quote'].map((quote_list) => {
                if (quote_list['total_price_text']) {
                    console.log(quote_list['total_price'])
                    thing_list.total_price=quote_list['total_price']

                }
              })
            })

          }else if(story_list['category_type_name'] == '内容制作费'){
            story_list['thing'].map((thing_list) => {
              thing_list['thing_quote'].map((quote_list) => {
                if (quote_list['workload']) {
                    console.log(quote_list['workload'])
                    thing_list.workload=quote_list['workload']

                }
              })
            })
          }
          return story_list
        })
        console.log(this.list) */
      }

      this.childrenColumns = [
        {
          key: 'supplier',
          label: 'CP名称',
          show: true
        },
        {
          key: 'recent_price',
          label: '最近一次单价',
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
          show: true,
          'is_test': this.is_test
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
      ];
      this.getDropdown();
    }, err => {
      this.listLoading = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  download(id) {
    if (id) {
      window.open('web/file/' + id, '_blank');
    }
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  selectSupplier(thingQuoteId, demandIndex, thingIndex, quoteList) {
    let qList = this.list[demandIndex]['thing'][thingIndex]['thing_quote']
    if (qList && qList.length > 0) {
      if (this.is_test == '1') {
        // 测试单
        qList[thingQuoteId].checked = !qList[thingQuoteId].checked
        const allThingChecked = qList.every(value => value.checked === true);
        const allUnThingChecked = qList.every(value => !value.checked);
        this.list[demandIndex]['thing'][thingIndex]['checked'] = allThingChecked;
        this.list[demandIndex]['thing'][thingIndex]['indeterminate'] = (!allThingChecked) && (!allUnThingChecked);
      } else if (this.is_test == '0') {
        // 正式单
        qList.forEach((item, i) => {
          if (i != thingQuoteId) {
            item.checked = false;
          }
        })
        qList[thingQuoteId].checked = !qList[thingQuoteId].checked;
        this.list[demandIndex]['thing'][thingIndex]['checked'] = qList.some(value => value.checked);
      }
    }
    this.refreshThingStatus(demandIndex);
  }

  submitPostData(optionType) {
    this.isAcceptLoading = true;
    let post_url = '';
    let thing_param;
    thing_param = [];

    let url = '/web/price/test-confirm-price';
    if (this.is_test === '0') {
      url = '/web/price/confirm-price';
    }

    if (optionType === 'accept') {
      // 确认提交进入
      post_url = '/web/price/test-confirm-price';
      if (this.is_test === '0') {
        post_url = '/web/price/confirm-price';
      }
      this.list.forEach((demand, demandIndex) => {
        if (demand['thing']) {
          demand['thing'].forEach((thing, thingIndex) => {
            if (thing.checked || thing.indeterminate) {
              thing.thing_quote.forEach((quote) => {
                if (quote.checked || quote.indeterminate) {
                  thing_param.push({ thing_id: thing.id, thing_quote_id: quote.id, prepayments_status: quote.prepayments_status });
                }
              })
            }
          });
        }
      });

      if (thing_param.length === 0) {
        this.isAcceptLoading = false;
        this.message.error('请选择物件和供应商');
        return false;
      }
    } else {
      // 返回询价进入
      if (optionType === 'rejectToDraft') {
        // 驳回到草稿
        post_url = '/web/price/reject-to-draft';
      } else {
        // 返回询价
        post_url = '/web/price/reject-inquiry';
      }


      this.list.forEach((demand, demandIndex) => {
        if (demand['thing']) {
          demand['thing'].forEach((thing, thingIndex) => {
            if (thing.checked) {
              thing_param.push({ thing_id: thing.id, thing_quote_id: thing.thing_quote_id, prepayments_status: thing.prepayments_status });
            }
          });
        }
      });
      if (thing_param.length === 0) {
        this.isAcceptLoading = false;
        this.message.error('请选择物件');
        return false;
      }
    }
    if (thing_param.length) {
      const param = {
        thing_param: thing_param,
        option_type: optionType,
        reason: this.reason
      };
      if (optionType === 'rejectToDraft') {
        param.reason = this.reasonDemand;
      }

      this.rejectLoading = true;
      this.rejectToDraftLoading = true;
      this.message.isAllLoading = true;
      this.http.post(post_url, param).subscribe(result => {
        this.isAcceptLoading = false;
        this.isVisible = false;
        this.isVisibleDemand = false;
        this.message.isAllLoading = false;
        this.rejectLoading = false;
        this.rejectToDraftLoading = false;
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.getList();
        this.menuService.getBacklog();
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
        this.message.isAllLoading = false;
        this.isAcceptLoading = false;
        this.rejectLoading = false;
        this.rejectToDraftLoading = false;
      });
    }
  }

  // 显示明细
  showPriceDetail(item, key, showCountPrice = true, workLoadInfo = [], type = 1,modelClass) {
    this.modalService.open('price-detail', {
      item: item,
      key: key,
      showCountPrice: showCountPrice,
      workLoadInfo: workLoadInfo,
      type: type,
      modelClass:modelClass
    })
  }

  reinquiry() {
    let catgory_map = {};
    let thing_ids = [];
    for (let project of this.list) {
      let project_id = project['project_id'];
      for (let thing of project['thing']) {
        if (thing['checked'] != true) {
          continue;
        }
        thing_ids.push(thing.id);
        let key = project_id + "-" + thing['category_id'] + "-" + thing['pre_produce_grade_id'];
        let suppliers = thing['thing_quote'].map(supplier => {
          return supplier['supplier_id'] + "-" + supplier['thing']['contract_id']
        }).sort().join(",");
        let thing_code = thing['thing_code'];
        let value = { "thing_code": thing_code, "suppliers": suppliers };
        if (key in catgory_map) {
          if (value['suppliers'] != catgory_map[key]['suppliers']) {
            let msg = value['thing_code'] + "与" + catgory_map[key]['thing_code'] + "供应商与合同需要一致才能重新询价";
            this.message.error(msg);
            return;
          }
        } else {
          catgory_map[key] = value;
        }
      }
    }
    if (thing_ids.length == 0) {
      this.message.error("请选择需要重询的物件");
      return;
    }
    //判断thing同一个类别优先度下的供应商-合同是否一致
    this.modalService.open('reinquiry', {
      // thing_id: ["57980","57911"],
      thing_id: thing_ids,
      is_test: this.is_test,
      modelClass:this.modelClass,
      type:'reinquiry'
    });
    return true;
  }

  //  选中唯一
  checkedOne() {
    this.list.forEach(res => {
      if (res.thing && res.thing.length > 0) {

        res.thing.forEach(item => {
          if (item.thing_quote && (item.thing_quote.length === 1)) {
            item.thing_quote.forEach(i => {
              if (Number(item.pre_workload) >= Number(i.workload)) {
                i.checked = true;
                item.thing_quote_id = i.id;
              }
            });

            item.checked = item.thing_quote.some(i => i.checked);
          }
        });

        try {
          res.checked = res.thing.some(item => item.checked && item.thing_quote && (item.thing_quote.length === 1));
        } catch (error) {
          res.checked = false
        }
      }
    });
  }

  // 反选
  checkReverse() {
    this.list.forEach(res => {
      if (res.thing && res.thing.length > 0) {
        res.checked = !res.checked
        res.thing.forEach(item => {
          item.checked = !item.checked
          if (this.is_test == '1') {
            item.thing_quote.forEach(i => {
              i.checked = !i.checked
            });
          }
          if (this.is_test == '0') {
            if (item['thing_quote'] && item['thing_quote'].filter(item => item['flow_step'] == '3005').length == 1) {
              item['thing_quote'].forEach(quote => {
                if (quote['flow_step'] == '3005') {
                  quote.checked = !quote.checked;
                }
              })
            }
          } else {
            item['thing_quote'].forEach(quote => {
              if (quote['flow_step'] != '3020') {
                quote.checked = false;
              }
            })
          }
        });
      }
    });
  }

  checkedAll() {
    this.list.forEach(res => {
      if (res.thing && res.thing.length > 0) {
        res.checked = true
        res.thing.forEach(item => {
          item.checked = true
          // if (this.is_test == '1') {
          //   item.thing_quote.forEach(i => {
          //     i.checked = true
          //   });
          // }

          if (this.is_test == '0') {
            if (item['thing_quote'] && item['thing_quote'].filter(item => item['flow_step'] == '3005').length == 1) {
              item['thing_quote'].forEach(quote => {
                if (quote['flow_step'] == '3005') {
                  quote.checked = true;
                }
              })
            }
          } else {
            item['thing_quote'].forEach(quote => {
              if (quote['flow_step'] != '3020') {
                quote.checked = true;
              }
            })
          }
        });
      }
    });
  }


  // 获取点击事件
  clickThingDetail(item) {
    this.modalService.open('thing', item)
  }

  // 明细是否标红
  IsRed(category_breakdown, produce_breakdown) {
   
    try {
      return produce_breakdown.filter(item => {
        return item.value
      }).some(item => {
        return item.value != (category_breakdown.find(i => i.id == item.id).value)
      });
    } catch (error) {
      return false
    }
  }

  setColor(category_type,is_change_workload, quote_workload, thing_list_pre_workload) {
    if (is_change_workload == 1) {
      return 'red';
    }

    let quote_workload_float = parseFloat(quote_workload)
    let thing_list_pre_workload_float = parseFloat(thing_list_pre_workload)
    if (isNaN(quote_workload_float) || isNaN(thing_list_pre_workload_float)) {
      return '';
    }
    if (quote_workload_float == thing_list_pre_workload_float&&category_type=='1') {
      return '';
    }
    if (category_type=='1'&&quote_workload_float == thing_list_pre_workload_float) {
      return '#000000';
    }
    if (quote_workload_float > thing_list_pre_workload_float&&category_type=='1') {
      return 'red'
    }
    if (category_type=='1'&&quote_workload_float > thing_list_pre_workload_float) {
      return 'red'
    }
    if (quote_workload_float < thing_list_pre_workload_float&&category_type=='1') {
      return '#00A870'
    }
    if (category_type=='1'&&quote_workload_float < thing_list_pre_workload_float) {
      return '#00A870'
    }
  }

  dropdownChange(bol, type) {
    if (bol == false) {
      this.closeDropdown(type);
    }
  }
  columnChange(bol, column) {
    this.showChildrenColumns[column.key] = bol;
  }
  // 设置已选择缓存
  closeDropdown(type) {
    if (type == 'search') {
      let searchList = {};
      if (localStorage.getItem('searchDropdown')) {
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
    } else if (type == 'column') {
      this.isColumnDropdown = false;
      let columnList = {};
      if (localStorage.getItem('columnDropdown')) {
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
    if (localStorage.getItem('searchDropdown')) {
      const searchList = JSON.parse(localStorage.getItem('searchDropdown'));
      if (searchList[url]) {
        this.queryFields.forEach(item => {
          searchList[url].forEach(search => {
            if (item.key == search.key) {
              item.show = search.show;
            }
          })
        })
      }
    }
    if (localStorage.getItem('columnDropdown')) {
      const columnList = JSON.parse(localStorage.getItem('columnDropdown'));
      if (columnList[url]) {
        this.childrenColumns.forEach(item => {
          columnList[url].forEach(column => {
            if (item.key == column.key) {
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

    if (!this.serviceData) {
      this.serviceData = JSON.parse(JSON.stringify(this.list));
    }
    if (!this.filterValue) {
      this.list = this.serviceData;
      return;
    }
    this.list = JSON.parse(JSON.stringify(this.serviceData)).filter(item => {
      item.thing = item.thing.filter(thing => {
        thing.thing_quote = thing.thing_quote.filter(item => {
          for (let i = 0; i < this.childrenColumns.length; i++) {
            if (item[this.childrenColumns[i].key] && item[this.childrenColumns[i].key].indexOf(this.filterValue) != -1) {
              return item;
            }
          }
        })
        if (thing.thing_quote.length > 0) return thing;
      })
      return item.thing.length > 0;
    })
  }

  openOrCloseAll(checked = false) {
    this.list = this.list.map(item => {
      return {
        ...item,
        expand: checked
      }
    })
  }


  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }

  delayNotice() {
    let thing_ids;
    thing_ids = [];
    this.list.forEach((demand, demandIndex) => {
      if (demand['thing']) {
        demand['thing'].forEach((thing, thingIndex) => {
          if (thing.checked) {
            thing_ids.push(thing.id);
          }
        });
      }
    });
    //显示弹框
    this.modalService.open('delay-remind', {
      current_workflow: 10500,
      thing_id: thing_ids
    })
  }
}
