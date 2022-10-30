import { Component, ChangeDetectorRef,  ChangeDetectionStrategy, OnInit, OnDestroy,  Input, Output, EventEmitter } from '@angular/core';
import { Subject} from 'rxjs';
import { ControlValueAccessor } from '@angular/forms';
import { filterOption } from '../../utils/utils';

@Component({
  selector: 'app-thing-price-edit',
  templateUrl: './thing-price-edit.component.html',
  styleUrls: ['thing-price-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ThingPriceEditComponent implements ControlValueAccessor, OnInit, OnDestroy {
  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  onDestroy$ = new Subject<void>();
  isVisiable = false;
  attriOptions = [];

  breakdownPriceModalData
  fillForm
  isFill
  list
  selctPriceModalData

  private _options = null;

  @Input() edit: Boolean = false;

  @Input()
  data = [];

  @Output() dataChange = new EventEmitter<any>();

  onChange: any = () => {};
  onTouch: any = () => {};

  filterOption = filterOption

  ngOnInit () {
    // 如果model 有数据, 则使用model, 否则使用options
    if (this.data && this.data.length > 0) {
      // this.options = this.data;
    } else if (this.data) {
      this.data = this.data.map(item => {
        if (item.attr_type == 1 && item.form_num > 1) {
          return {
            ...item,
            options: item['form_name'] ? item['form_name'].split('|').map(item => {
                                                            return {
                                                              label: item,
                                                              value: null
                                                            };
                                                          }) : []};
        } else if (item.attr_type == 2) {
          return {...item, options: item['form_value'] ? item['form_value'].split('|') : []};
        } else {
          return item;
        }
      });
      this.modelChange();
    }
  }



  writeValue(value): void {
    // console.log(value);
  }

  registerOnChange(fn): void {
    this.onChange = fn;
  }

  registerOnTouched(fn): void {
    this.onTouch = fn;
  }

  modelChange () {
    if (this.data && this.data.length > 0) {
      this.data = this.data.map(item => {
        if (item.attr_type === 1 && item.form_num > 1 && item.options && item.options.length > 0) {
          item.value = item.options.map(res => res.value).join('|');
        }
        return item;
      });
    }
    this.dataChange.emit(this.data);
    this.cd.markForCheck();
  }

  ngOnDestroy() {
    // 组件销毁时, 删除循环的列表
    // if (this.field.fieldGroup && this.field.fieldGroup.length > 0) {
    //   this.field.fieldGroup.map((item, index) => {
    //     super.remove(index);
    //   });
    // }
    // this.onDestroy$.next();
  }

  // 查看报价信息
  selctPriceModal(item) {
    this.selctPriceModalData.isShow = true;
    this.selctPriceModalData.data = {
      list:  [],
      price:  '',
      sample_package_url:  '',
      sketch_map_url:  '',
    };

    if (item['pre_produce_breakdown']) {
      this.selctPriceModalData.data = {
        list:               JSON.parse(JSON.stringify(item['quote_produce_breakdown'])),
        price:              item['quote_total_price'],
        sample_package_url: item['sample_package_url'],
        sketch_map_url:     item['sketch_map_url'],
      };
    }
  }

    // 明细报价
    breakdownPriceModal(item, isEmpty, isDisabled) {
      this.breakdownPriceModalData.isShow = true;
      this.breakdownPriceModalData.data = {
        thing_id:  0,
        workload:  1,
        unit_price:  0,
        total_price:  0,
        quote_total_price:  0,
        produce_breakdown_list:  [],
        isEmpty: false,
      };
      this.breakdownPriceModalData.data['quote_total_price']  = item['quote_total_price'] ? item['quote_total_price'] : 0;
      if (item['contract_groups']) {
        this.breakdownPriceModalData.data['thing_id']         = item['id'];

        let contract_groups;
        contract_groups = JSON.parse(JSON.stringify(item['contract_groups']));
        contract_groups.forEach(data => {
          // 获取工作单位
          if (data.workload_unit_list) {
            data.workload_unit_list.forEach(data2 => {
              let workload_unit_data;
              workload_unit_data = data['workload_unit_data'][data2['value']];
              // 价格提示
              workload_unit_data.tooltipTitle = '';
              if (parseFloat(workload_unit_data['price_upper']) > 0
                && parseFloat(workload_unit_data['price_upper']) !== parseFloat(workload_unit_data['price_lower'])
              ) {
                workload_unit_data.tooltipTitle = parseFloat(workload_unit_data['price_lower'])
                  + '~' + parseFloat(workload_unit_data['price_upper']);
              }
              data['workload_unit_data'][data2['value']] = workload_unit_data;
            });
          }
          this.breakdownPriceModalData.data['produce_breakdown_list'].push(data);
        });
      }
      if (item['quote_produce_breakdown_cache']) {
        this.breakdownPriceModalData.data['produce_breakdown_list'] = JSON.parse(JSON.stringify(item['quote_produce_breakdown_cache']));
        if (isEmpty) {
          this.breakdownPriceModalData.data['total_price'] = item['quote_total_price'];
          this.breakdownPriceModalData.data['isEmpty']     = true;
          if (!isDisabled) {
            this.breakdownPriceModalEmpty();
          }
        } else {
          this.breakdownPriceModalData.data['workload']    = item['quote_workload'];
          this.breakdownPriceModalData.data['unit_price']  = item['quote_unit_price'];
          this.breakdownPriceModalData.data['total_price'] = item['quote_total_price'];
        }
      }
      this.calculatePriceModal();
      this.breakdownPriceModalData.data['isEmpty']         = isEmpty;
    }

    getPrice(item, key, isdisabled ?: false) {
      // 锁定总价
      if (isdisabled) {
        if (key === 'quote_workload') {
          if (item['quote_workload'] || item['quote_workload'] === 0 ) {
            if (item['quote_total_price'] && item['quote_workload'] !== 0) {
              item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
            } else {
              item['quote_unit_price'] = '';
            }
          }
        } else if (key === 'quote_unit_price') {
          if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
            if (item['quote_total_price'] && item['quote_unit_price'] !== 0){
              item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
            } else {
              item['quote_workload'] = '';
            }
          }
        } else if (key === 'quote_total_price') {
          if (item['quote_total_price'] === 0) {
            item['quote_workload'] = 0;
          } else if (item['quote_unit_price'] !== 0 && item['quote_unit_price'] > 0) {
            item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
          } else if (item['quote_workload'] !== 0 && item['quote_workload'] > 0) {
            item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
          }
        }
      } else {
        if (key === 'quote_workload') {
          if (item['quote_workload'] || item['quote_workload'] === 0) {
            if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
              item['quote_total_price'] = (item['quote_unit_price'] * item['quote_workload']).toFixed(2);
            } else  if (item['quote_total_price'] && item['quote_workload'] != 0) {
              item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
            }
          }
        } else if (key === 'quote_unit_price') {
          if (item['quote_unit_price'] || item['quote_unit_price'] === 0) {
            if (item['quote_workload'] || item['quote_workload'] === 0) {
              item['quote_total_price'] = (item['quote_unit_price'] * item['quote_workload']).toFixed(2);
            } else if (item['quote_total_price'] &&  item['quote_unit_price'] != 0)  {
              item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
            }
          }
        } else if (key === 'quote_total_price') {
          if (item['quote_total_price'] || item['quote_total_price'] === 0) {
            if (item['quote_total_price'] && item['quote_unit_price'] != 0) {
              item['quote_workload'] = (item['quote_total_price'] / item['quote_unit_price']).toFixed(3);
            } else if (item['quote_total_price'] && item['quote_workload'] != 0) {
              item['quote_unit_price'] = (item['quote_total_price'] / item['quote_workload']).toFixed(2);
            } else if (item['quote_total_price'] === 0) {
              item['quote_workload'] = 0;
            }
          }
        }
      }

      // 固定税率
      if (item['tax_type'] && (item['tax_type'] == 1 || item['tax_type'] == 2)) {
        if (item['quote_total_price'] !== '') {
          item['quote_total_price'] = (item['quote_total_price'] * (1 + Number(item['tax_value']))).toFixed(2);
          item['tax_price'] = (item['quote_total_price'] * Number(item['tax_value'])).toFixed(2);
        }
      }
    }

    getFillPrice(key) {
      let workload = null, unit_price = null, total_price = null;

      if (this.fillForm['quote_workload']) {
        workload = parseFloat(this.fillForm['quote_workload']);
      }
      if (this.fillForm['quote_unit_price']) {
        unit_price = parseFloat(this.fillForm['quote_unit_price']);
      }
      if (this.fillForm['quote_total_price']) {
        total_price = parseFloat(this.fillForm['quote_total_price']);
      }
      // if (key === 'quote_workload' && workload !== '') {
      //   if (unit_price !== '' && workload >= 0) {
      //     total_price = (unit_price * workload).toFixed(2);
      //   } else if (total_price !== '') {
      //     unit_price = (total_price / workload).toFixed(2);
      //   }
      // } else if (key === 'quote_unit_price' && unit_price !== '') {
      //   if (workload !== '' && unit_price >= 0) {
      //     total_price = (unit_price * workload).toFixed(2);
      //   } else if (total_price !== '') {
      //     workload = (total_price / unit_price).toFixed(3);
      //   }
      // } else if (key === 'quote_total_price' && unit_price !== '') {
      //   if (unit_price !== '' && unit_price >= 0) {
      //     workload = (total_price / unit_price).toFixed(3);
      //   } else if (workload !== '' && workload >= 0) {
      //     unit_price = (total_price / workload).toFixed(2);
      //   }
      // }
      if (key === 'quote_workload') {
        if (workload) {
          if (unit_price) {
            total_price = (unit_price * workload).toFixed(2);
          } else  if (total_price) {
            unit_price = (total_price / workload).toFixed(2);
          }
        } else if (workload === 0) {
          total_price = 0;
        } else if (workload === null) {
          total_price = null;
        }
      } else if (key === 'quote_unit_price') {
        if (unit_price) {
          if (workload) {
            total_price = (unit_price * workload).toFixed(2);
          } else if (total_price)  {
            workload = (total_price / unit_price).toFixed(3);
          }
        } else if (unit_price === 0) {
          total_price = 0;
        } else if (unit_price === null) {
          total_price = null;
        }
      } else if (key === 'quote_total_price') {
        if (total_price) {
          if (unit_price) {
            workload = (total_price / unit_price).toFixed(3);
          } else if (workload) {
            unit_price = (total_price / workload).toFixed(2);
          }
        } else if (total_price === 0) {
          workload = 0;
        }
      }
      this.fillForm['quote_workload']    = workload;
      this.fillForm['quote_unit_price']  = unit_price;
      this.fillForm['quote_total_price'] = total_price;
    }
    fillAll() {
      this.list.forEach(item => {
        item.children.forEach(data => {
          if (data.checked) {
            data['save_reason']  = this.fillForm['save_reason'] || data['save_reason'];

            if (!data['is_disabled'] && (data.price_type == 4 || data.price_type == 3)) {
              data['quote_workload']    = this.fillForm['quote_workload'] || data['quote_workload'];
              data['quote_unit_price']  = this.fillForm['quote_unit_price'] || data['quote_unit_price'];
              data['quote_total_price'] = this.fillForm['quote_total_price'] || data['quote_total_price'];
              data['total_price'] =  data['quote_total_price'];
            }
          }
        });
      });
      this.isFill = false;
      for (const key in this.fillForm) {
        if (key) {
          this.fillForm[key] = '';
        }
      }
    }

  breakdownPriceModalEmpty () {

  }

  calculatePriceModal () {

  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
