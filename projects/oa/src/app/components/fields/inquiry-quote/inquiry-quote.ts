import { Component, ChangeDetectorRef,  ChangeDetectionStrategy, OnInit, OnDestroy, DoCheck } from '@angular/core';
import { timer } from 'rxjs';
import { FieldArrayType, FormlyFormBuilder,  } from '@ngx-formly/core';
import { debounce } from 'rxjs/operators';
import { UploadXHRArgs } from 'ng-zorro-antd';
import { UploadService } from '../../../services/upload.service';
import { MessageService } from '../../../services/message.service';
import { CosService } from '../../../services/cos.service';
import { filterOption } from '../../../utils/utils';

@Component({
  selector: 'app-inquiry-quote',
  templateUrl: './inquiry-quote.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    :host {
        margin-bottom: 30px;
    }
    input[type=number] {
      -moz-appearance:textfield;
    }
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    ::ng-deep .modal-table .ant-modal-body {
      padding: 0
    }

    ::ng-deep .ant-table-thead > tr > th, .ant-table-tbody > tr > td {
        padding: 8px 8px;
    }

    ::ng-deep .hide {
      display: none;
    }
  `]
})

export class InquiryQuoteFormlyComponent extends FieldArrayType implements OnInit, OnDestroy, DoCheck  {

  constructor(
    builder: FormlyFormBuilder,
    private msg: MessageService,
    public uploadService: UploadService,
    private cd: ChangeDetectorRef,
    public cos: CosService
  ) {
    super(builder);
  }

  isModelVisible: Boolean = false;
  modelTitle: String = '';
  is_show_workload = false;    // 是否显示工作量

  thing_project_breakdown = [];   // 物件明细
  saveProduceBreakdown = null;   // 物件明显的备份
  workload_unit_options = [];

  // 明细总价
  total_price: Number = 0;
  diffLastModel = null;
  currencyObj;
  valueChanges;
  diffLastUnitLIst = null;

  filterOption = filterOption
  ngOnInit () {
    if (this.to['thing_project_breakdown_list']) {
      this.is_show_workload = this.formControl.root.value.is_show_workload;

      this.thing_project_breakdown = this.to['thing_project_breakdown_list'].map(item => {
        return {
          id: item.id,
          count_price: (this.is_show_workload ? Number(item.value_default) : Number(item.value)) *  Number(item.price),
          label: item.label,
          pre_workload_unit_label: item.pre_workload_unit_label,
          price: Number(item.price),
          produce_breakdown_id: item.produce_breakdown_id,
          produce_breakdown_name: item.produce_breakdown_name,
          produce_grade_id: item.produce_grade_id,
          produce_grade_name: item.produce_grade_name,
          value: this.is_show_workload ? Number(item.value_default) : Number(item.value),
          workload_unit_id: item.workload_unit_id,
          workload_unit_list: item.workload_unit_list,
          contract_price_remark: item.contract_price_remark,
          workload_unit_data: item.workload_unit_data,
          disabled:    item.workload_unit_data[item.workload_unit_id]
                            && item.workload_unit_data[item.workload_unit_id].isPriceDisabled
                            ? item.workload_unit_data[item.workload_unit_id].isPriceDisabled : false,
          workload_unit_name: item.workload_unit_data[item.workload_unit_id]
                            && item.workload_unit_data[item.workload_unit_id].workload_unit_name
                            ? item.workload_unit_data[item.workload_unit_id].workload_unit_name : null,
          price_upper: item.workload_unit_data[item.workload_unit_id]
                            && item.workload_unit_data[item.workload_unit_id].price_upper
                            ? item.workload_unit_data[item.workload_unit_id].price_upper : 0,
          price_lower: item.workload_unit_data[item.workload_unit_id]
                            && item.workload_unit_data[item.workload_unit_id].price_lower
                            ? item.workload_unit_data[item.workload_unit_id].price_lower : 0,
          isPriceDisabled: item.workload_unit_data[item.workload_unit_id]
                            && item.workload_unit_data[item.workload_unit_id].isPriceDisabled
                            ? item.workload_unit_data[item.workload_unit_id].isPriceDisabled : false,
        };
      });

      this.workload_unit_options = this.to['thing_project_breakdown_list'].map(item => {
        return {
          workload_unit_list: item.workload_unit_list
        };
      });

      if (this.model.quote.workload_default && this.is_show_workload) {
        this.model.quote.workload = Number(this.model.quote.workload_default);
      } else {
        this.model.quote.workload = null;
      }
    }

    this.valueChanges =   this.formControl
                              .root.get('thing_list')
                              .valueChanges.pipe(debounce(() => timer(100)))
                              .subscribe(res => {
                                this.currencyObj = this.to['currencyObj'];
                                this.cd.markForCheck();
                              });
    this.cd.markForCheck();

  }

  ngDoCheck () {
    // 如果明细发生改变, 则初始化
    const nowModel = JSON.stringify(this.to['thing_project_breakdown_list']);
    const nowUnitList =  JSON.stringify(this.to['workload_unit_list']);

    if (nowModel !== this.diffLastModel || this.is_show_workload !== this.formControl.root.value.is_show_workload) {

      this.diffLastModel = nowModel;
      this.diffLastUnitLIst = nowUnitList;
      this.is_show_workload = this.formControl.root.value.is_show_workload;

      if (this.to['thing_project_breakdown_list'].length > 0) {
        this.thing_project_breakdown = this.to['thing_project_breakdown_list'].map(item => {
          return {
            id: item.id,
            count_price: (this.is_show_workload ? Number(item.value_default) : Number(item.value)) *  Number(item.price),
            label: item.label,
            pre_workload_unit_label: item.pre_workload_unit_label,
            price: Number(item.price),
            produce_breakdown_id: item.produce_breakdown_id,
            produce_breakdown_name: item.produce_breakdown_name,
            produce_grade_id: item.produce_grade_id,
            produce_grade_name: item.produce_grade_name,
            value: this.is_show_workload ? Number(item.value_default) : Number(item.value),
            workload_unit_id: item.workload_unit_id,
            workload_unit_list: item.workload_unit_list,
            workload_unit_data: item.workload_unit_data,
            contract_price_remark: item.contract_price_remark,
            disabled: item.workload_unit_data[item.workload_unit_id]
                            && item.workload_unit_data[item.workload_unit_id].isPriceDisabled
                            ? item.workload_unit_data[item.workload_unit_id].isPriceDisabled : false,
            workload_unit_name: item.workload_unit_data[item.workload_unit_id]
                            && item.workload_unit_data[item.workload_unit_id].workload_unit_name
                            ? item.workload_unit_data[item.workload_unit_id].workload_unit_name : null,
            price_upper: item.workload_unit_data[item.workload_unit_id]
                            && item.workload_unit_data[item.workload_unit_id].price_upper
                            ? item.workload_unit_data[item.workload_unit_id].price_upper : 0,
            price_lower: item.workload_unit_data[item.workload_unit_id]
                            && item.workload_unit_data[item.workload_unit_id].price_lower
                            ? item.workload_unit_data[item.workload_unit_id].price_lower : 0,
            isPriceDisabled: item.workload_unit_data[item.workload_unit_id]
                            && item.workload_unit_data[item.workload_unit_id].isPriceDisabled
                            ? item.workload_unit_data[item.workload_unit_id].isPriceDisabled : false,
          };
        });

        this.workload_unit_options = this.to['thing_project_breakdown_list'].map(item => {
          return {
            workload_unit_list: item.workload_unit_list
          };
        });
      }

      const total = this.thing_project_breakdown.length > 0
                    ? this.thing_project_breakdown
                          .map(item => item.count_price)
                          .reduce((total, item) =>  total + Number(item))
                    : 0;

      this.total_price =  total ? total : 0;
      this.model.quote.total_price = this.total_price;

      if (this.model.quote.workload_default && this.is_show_workload) {
        this.model.quote.workload = Number(this.model.quote.workload_default);
      } else {
        this.model.quote.workload = null;
      }
      this.saveBreakdown();
    }

    if ( nowUnitList != this.diffLastUnitLIst) {
      this.diffLastUnitLIst = nowUnitList;
      // this.model.quote.workload_unit_id = null;
      this.model.quote.workload = null;
      this.model.quote.total_price = null;
      this.model.quote.unit_price = null;

      if (this.to['workload_unit_list'] && this.to['workload_unit_list'].length == 1) {
        this.model.quote.workload_unit_id = this.to['workload_unit_list'][0].value;
        if (this.model.quote.workload_unit_id && this.to['workload_unit_data'][this.model.quote.workload_unit_id]) {
          this.model.quote.unit_price = this.to['workload_unit_data'][this.model.quote.workload_unit_id].quote_unit_price;
          this.formControl.setValue(this.model.quote);
        }
      }
      this.field.formControl.setValue(this.model.quote);
    }
    this.cd.markForCheck();

  }

  // 编辑明细
  quote() {
    if (this.saveProduceBreakdown) {
      this.thing_project_breakdown = JSON.parse(this.saveProduceBreakdown);
    }
    this.modelTitle = '编辑明细';
    this.isModelVisible = true;
    this.cd.markForCheck();
  }

  // 价格详情
  openTemplate () {
    this.modelTitle = '价格详情';
    this.isModelVisible = true;
    this.cd.markForCheck();
  }

  // 编辑单价
  editUnitPrice ($event) {

    if ($event
        && this.to['workload_unit_data'][this.model.quote.workload_unit_id]
        && this.to['workload_unit_data'][this.model.quote.workload_unit_id].price_upper
        && this.to['workload_unit_data'][this.model.quote.workload_unit_id].price_upper != 0
        && this.to['workload_unit_data'][this.model.quote.workload_unit_id].price_upper < $event
    ) {
      this.msg.error(this.model.story_code + '的报价单价不可超过合同上限' + this.to['workload_unit_data'][this.model.quote.workload_unit_id].price_upper)
    }

    let unit_price =  $event;
    // 有明细, 改数量
    if (this.model.quote.produce_breakdown && this.model.quote.total_price) {
      if (unit_price) {
        this.model.quote.workload = Number((this.model.quote.total_price / unit_price).toFixed(3));
      } else {
        this.model.quote.workload = null;
      }
      this.formControl.setValue(this.model.quote);
    }  else if (unit_price && this.model.quote.workload) {
      this.model.quote.total_price = (unit_price * this.model.quote.workload).toFixed(2);       // 缺总价，改总价
    } else if (unit_price && this.model.quote.total_price) {
      this.model.quote.workload = Number((this.model.quote.total_price / unit_price).toFixed(3));   // 缺数量，改数量
    } else if (unit_price === 0) {
      this.model.quote.total_price = 0;
    } else {
      this.model.quote.total_price = null;
    }
    this.formControl.setValue(this.model.quote);
    this.cd.markForCheck();
  }

  // 编辑总价
  editTotalPrice ($event) {
    let total_price = $event;
    // 如果有单价, 改数量
    if (total_price) {
      if (this.model.quote.unit_price) {
        this.model.quote.workload = Number((total_price / this.model.quote.unit_price).toFixed(3))
      } else if (this.model.quote.workload) {
        this.model.quote.unit_price = Number((total_price / this.model.quote.workload).toFixed(3))
      }
    } else if (total_price === 0) {
      this.model.quote.workload = 0;
    } else {
      this.model.quote.workload = null;
    }
    this.formControl.setValue(this.model.quote);
    this.cd.markForCheck();
  }

  // 编辑数量
  editWorkload ($event) {
    let workload = $event;
    // 有明细,改单价
    this.model.quote = this.formControl.value;
    if (this.model.quote.produce_breakdown && this.model.quote.total_price) {
      if (workload) {
        this.model.quote.unit_price = Number((this.model.quote.total_price / workload).toFixed(2));
      } else if (workload === 0) {
        this.model.quote.unit_price = '';
      }
      this.formControl.patchValue(this.model.quote);
    } else if (workload && this.model.quote.unit_price) {
      // 缺总价，改总价
      this.model.quote.total_price = Number((workload * this.model.quote.unit_price).toFixed(2));
      this.formControl.patchValue(this.model.quote);
    } else if (workload && this.model.quote.total_price) {
      // 缺单价，改单价
      this.model.quote.unit_price = Number((this.model.quote.total_price / workload).toFixed(2));
      this.formControl.patchValue(this.model.quote);
    } else if (workload === 0) {
      this.model.quote.total_price = 0;
      this.formControl.patchValue(this.model.quote);
    } else {
      this.model.quote.total_price = null;
      this.formControl.patchValue(this.model.quote);
    }
    this.cd.markForCheck();
  }

  // 明细单位选择
  onSelectChange (data) {

    data.price = data.workload_unit_data[data.workload_unit_id].price;
    if (data.price) {
      data.count_price =  Number((data.price * data.value).toFixed(2));
    } else {

      // 固定价
      let defaultItem = data.workload_unit_list.find(item => item.value === data.workload_unit_id)

      if (defaultItem && defaultItem.default_value) {
        data.price = defaultItem.default_value;
        data.count_price = Number((data.price * data.value).toFixed(2));
        data.disabled = true;
      } else {
        data.price = 0;
        data.count_price = 0;
      }
    }

    this.totalPrice();

    console.log(data)

    data.disabled = data.workload_unit_data[data.workload_unit_id].isPriceDisabled;
    data.workload_unit_name = data.workload_unit_data[data.workload_unit_id].workload_unit_name;
    data.price_upper = data.workload_unit_data[data.workload_unit_id].price_upper;
    data.price_lower = data.workload_unit_data[data.workload_unit_id].price_lower;
    data.isPriceDisabled = data.workload_unit_data[data.workload_unit_id].isPriceDisabled;
    this.cd.markForCheck();

  }

  // 编辑明细数量
  editBreakdown (value, data) {
    if (!data.disabled && data.price_upper > 0 && data.price > data.price_upper) {
      this.msg.error(data.label + '的明细单价不可超过合同上限' + data.price_upper);
    }

    if (value) {
      data.count_price = (Number(data.price) * Number(value)).toFixed(2)
      this.totalPrice();
    } else if (value === 0 ) {
      data.count_price = 0;
    } else {
      data.count_price = null;
    }
    this.cd.markForCheck();
  }

    // 编辑明细单价
    editBreakdownPrice (price, data) {
      if (!data.disabled && data.price_upper > 0 && data.price > data.price_upper) {
        this.msg.error(data.label + '的明细单价不可超过合同上限' + data.price_upper);
      }

      if (price) {
        data.count_price = (Number(data.value) * Number(price)).toFixed(2);
        this.totalPrice();
      } else if (price === 0 ) {
        data.count_price = 0;
      } else {
        data.count_price = null;
      }
      this.cd.markForCheck();
  }

  // 编辑明细总价
  editBreakdownTotal (total, data) {
    if (total && data.price) {
      data.value = (Number(total) / Number(data.price)).toFixed(3);
      this.totalPrice();
    } else if (total === 0) {
      data.value = 0;
    } else {
      data.value = null;
    }
    this.cd.markForCheck();
  }

  totalPrice () {
    let total_price = 0;
    this.thing_project_breakdown.map(item => {
      total_price += Number(item.count_price);
     return item;
    });
    this.total_price = Number(total_price.toFixed(2));
    this.cd.markForCheck();
  }

  // 清空报价
  clearBreakdown () {
    this.thing_project_breakdown = this.to['thing_project_breakdown_list'].map(item => {
      return {
        id: item.id,
        count_price: null,
        label: item.label,
        pre_workload_unit_label: item.pre_workload_unit_label,
        price: Number(item.price),
        produce_breakdown_id: item.produce_breakdown_id,
        produce_breakdown_name: item.produce_breakdown_name,
        produce_grade_id: item.produce_grade_id,
        produce_grade_name: item.produce_grade_name,
        contract_price_remark: item.contract_price_remark,
        value: null,
        workload_unit_id: item.workload_unit_id,
        workload_unit_list: item.workload_unit_list,
        workload_unit_data: item.workload_unit_data,
        disabled: item.workload_unit_data[item.workload_unit_id]
                      && item.workload_unit_data[item.workload_unit_id].isPriceDisabled
                      ? item.workload_unit_data[item.workload_unit_id].isPriceDisabled : false,
        workload_unit_name: item.workload_unit_data[item.workload_unit_id]
                      && item.workload_unit_data[item.workload_unit_id].workload_unit_name
                      ? item.workload_unit_data[item.workload_unit_id].workload_unit_name : null,
        price_upper: item.workload_unit_data[item.workload_unit_id]
                      && item.workload_unit_data[item.workload_unit_id].price_upper
                      ? item.workload_unit_data[item.workload_unit_id].price_upper : 0,
        price_lower: item.workload_unit_data[item.workload_unit_id]
                      && item.workload_unit_data[item.workload_unit_id].price_lower
                      ? item.workload_unit_data[item.workload_unit_id].price_lower : 0,
        isPriceDisabled: item.workload_unit_data[item.workload_unit_id]
                      && item.workload_unit_data[item.workload_unit_id].isPriceDisabled
                      ? item.workload_unit_data[item.workload_unit_id].isPriceDisabled : false,

      };
    });
    this.total_price = null;
    this.cd.markForCheck();
  }

  // 保存明细
  saveBreakdown () {
    // 验证明细单价是否符合要求
    let isErr = false;
    this.thing_project_breakdown.map(item => {
      if (item.price_upper && (item.price_upper != item.price_lower) && ( item.price > Number(item.price_upper))) {
        this.msg.error(item.label + '的明细单价不可超过合同上限' + item.price_upper);
        isErr = true;
      }
    });

    if (isErr) {
      return;
    }

    if (this.thing_project_breakdown) {
       const produce_breakdown = this.thing_project_breakdown.filter(item => item.count_price).map(item => {
        return {
          id: item.id,
          count_price: item.count_price,
          label: item.label,
          pre_workload_unit_label: item.pre_workload_unit_label,
          price: item.price,
          produce_breakdown_id: item.produce_breakdown_id,
          produce_breakdown_name: item.produce_breakdown_name,
          produce_grade_id: item.produce_grade_id,
          produce_grade_name: item.produce_grade_name,
          value: item.value,
          workload_unit_id: item.workload_unit_id,
          remark: item.remark,
          contract_price_remark: item.contract_price_remark,
          file_id: item.file_id,
          workload_unit_name: item.workload_unit_name,
          price_upper: item.price_upper,
          price_lower: item.price_lower,
          isPriceDisabled: item.isPriceDisabled
        };
      });

      this.saveProduceBreakdown = JSON.stringify(this.thing_project_breakdown);
      if (produce_breakdown.length > 0) {
        this.model.quote.produce_breakdown = produce_breakdown;
        this.model.quote.total_price = this.total_price;
        if (this.model.quote.unit_price) {
          this.model.quote.workload = Number(this.model.quote.total_price / this.model.quote.unit_price).toFixed(3);
        } else if (this.model.quote.workload) {
          this.model.quote.unit_price = Number(this.model.quote.total_price / this.model.quote.workload).toFixed(2);
        } else {
          this.model.quote.workload = 1;
          this.model.quote.unit_price = this.model.quote.total_price;
        }
      } else {
        this.model.quote.produce_breakdown = null;
        this.model.quote.total_price = null;
        this.model.quote.unit_price = null;
      }

      this.field.formControl.setValue(this.model.quote);
      this.isModelVisible = false;
    }
    this.cd.markForCheck();
  }


  editWorkloadUnit ($event) {
    if ($event && this.to['workload_unit_data'][$event] && this.to['workload_unit_data'][$event].quote_unit_price) {
      this.model.quote.unit_price = this.to['workload_unit_data'][$event].quote_unit_price;
      this.formControl.setValue(this.model.quote);
    }
    this.cd.markForCheck();
  }

  // 关闭弹窗
  closeModel () {
    this.modelTitle = '';
    this.isModelVisible = false;
    this.cd.markForCheck();
  }

  // 上传文件
  uploadChange ($event, data) {
    if ($event.type === 'success' && $event.file && $event.file.originFileObj) {
      data.file_id = $event.file.originFileObj.file_id;
    }
  }

  editUnit ($event) {
    if (this.to['workload_unit_data'] && this.model.quote.workload_unit_id && this.to['workload_unit_data'][this.model.quote.workload_unit_id]) {
      this.model.quote.unit_price = this.to['workload_unit_data'][this.model.quote.workload_unit_id]['quote_unit_price'];
      this.cd.markForCheck();
    }
  }

  ngOnDestroy () {
    if (this.valueChanges) {
      this.valueChanges.unsubscribe();
    }
  }

  trackByFn(index, item) {
    return item.id ? item.id : index; // or item.id
  }
}
