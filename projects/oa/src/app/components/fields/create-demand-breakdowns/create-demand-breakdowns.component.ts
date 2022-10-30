import { Component, ChangeDetectorRef,  ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FieldArrayType, FormlyFormBuilder,  } from '@ngx-formly/core';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { merge, Subject, of, combineLatest, race } from 'rxjs';

import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { filterOption } from '../../../utils/utils';

@Component({
  selector: 'app-create-demand-breakdowns',
  templateUrl: './create-demand-breakdowns.component.html',
  styleUrls: ['./create-demand-breakdowns.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CreateDemandBreakdownsComponent extends FieldArrayType  implements OnInit {

  // 当前的模板
  isUseTemplate: Boolean = false;

  constructor(
    builder: FormlyFormBuilder,
    private cd: ChangeDetectorRef,
    private message: MessageService,
    private modalService: ModalService,
  ) {
    super(builder);
  }

  isRenderForm: Boolean = false;
  isVisible: Boolean = false;
  title: String = '标题';

  // 选择模块
  templateOptions = [];

  useTemplateModel = {
    pre_unit_price: 0,
    selectedValue: null,
    pre_produce_breakdown: []
  };

  // 编辑明细
  editeDtailsValue = [];

  // 编辑明细的弹窗
  isEditDetailVisible: Boolean = false;
  // editThingDetail = [];
  thingTotalprice = 0;



  price_template_library_list: [];

  last_category_id = null;

  filterOption = filterOption

  ngOnInit () {
    // 监听类别变化
    if (!this.model['produce_breakdowns'] || (this.model['produce_breakdowns'] && this.model['produce_breakdowns'].length === 0)) {
      this.model['produce_breakdowns'] = this.to['produceBreakdowns'].map(item => {
        let thing = this.to['price_library_list'].find(res => res.produce_breakdown_id == item.id && res.workload_unit_id == item.workload_unit_id);
        if (!item.unit_price) {
          item.unit_price = thing && thing.unit_price ? thing.unit_price : null
        }
        return {
          label: item.title,
          id: item.id,
          value: null,
          description: item.description,
          workload_unit_id: item.workload_unit_id,
          workload_unit_name: item.workload_unit_name,
          unit_price: item.unit_price 
        };
      });
    }

    // 设置类别
    if (this.to['produceBreakdowns'] && this.to['produceBreakdowns'].length === 0) {
      this.model.price_type = '4';
    } else {
      if (this.to['is_breakdown'] && this.to['is_breakdown'] == '0') {
        this.model.price_type = '3';

      } else {
        this.model.price_type = '2';
      }
    }

    if (this.model.price_type == '1') {
      this.isUseTemplate = true;
    }

    race([
      this.formControl.parent.get('category_id').valueChanges,
      this.formControl.parent.get('pre_produce_grade_id').valueChanges
    ]).pipe(debounceTime(10)).subscribe(res => {
      const produceBreakdowns = this.to['produceBreakdowns'].map(item => {
        let thing = this.to['price_library_list'].find(res => res.produce_breakdown_id == item.id && res.workload_unit_id == item.workload_unit_id);
        if (!item.unit_price) {
          item.unit_price = thing && thing.unit_price ? thing.unit_price : null
        }
      
        return {
          label: item.title,
          id: item.id,
          value: null,
          description: item.description,
          workload_unit_id: item.workload_unit_id,
          workload_unit_name: item.workload_unit_name,
          unit_price: item.unit_price
        };
      });

      this.model['produce_breakdowns'] = [...produceBreakdowns]

      if (this.to['produceBreakdowns'] && this.to['produceBreakdowns'].length === 0) {
        this.model.price_type = '4';
      } else {
        if (this.to['is_breakdown'] && this.to['is_breakdown'] == '0') {
          this.model.price_type = '3';
        } else {
          this.model.price_type = '2';
        }
      }
      this.cd.detectChanges();
    });
    this.modalService.modal$.pipe(distinctUntilChanged()).pipe(debounceTime(600)).subscribe(item => {
      if(item['key'] == 'update-produce-breakdown'){
        console.log('22222')
        this.formControl.parent.get("produce_breakdowns").setValue(this.model.produce_breakdowns);
        this.cd.markForCheck();
      }
    })
    this.cd.markForCheck();
  }

  // 使用模板
  useTemplate ($event) {
    this.title = '选择模板';
    this.templateOptions = this.to['price_template_library_list'].map(res => {
      return {
        label: res.price_code,
        value: res.category_id,
        render_pic: res.render_pic,
        template_example: res.template_example
      };
    });
    this.isVisible = true;
    this.cd.markForCheck();

  }

  // 切换模板
  changeTemplate () {
    this.title = '选择模板';

    if (this.to['produceBreakdowns']) {
      this.model['produce_breakdowns'] = this.to['produceBreakdowns'].map(
        item => { return {
          label: item.title,
          id: item.id,
          value: null,
          description: item.description
        };
      });
    }
    this.model.price_type = '1';
    this.isVisible = true;
    this.cd.markForCheck();
  }

  // 取消模板,
  cancelTemplate () {
    if (this.to['produceBreakdowns']) {
      this.model.pre_workload = null;
      this.model.pre_unit_price = 0;
      this.model['produce_breakdowns'] = this.to['produceBreakdowns'].map(res => {
        return {
          label: res.title,
          id: res.id,
          value: null,
          description: res.description
        };
      });
    }

    if (this.model.price_type === '1') {
      this.model.price_type = '2';
    }

    this.isUseTemplate = false;
    this.isVisible = false;
    this.isRenderForm = false;

    this.formControl.setValue(this.model.produce_breakdowns);
    this.cd.markForCheck();

  }

  // 编辑明细
  editTemplate () {
    this.title = '编辑明细';
    if (this.to['produceBreakdowns']) {
      this.editeDtailsValue = this.to['produceBreakdowns'].map(item => {
        let thing = this.to['price_library_list'].find(res => res.produce_breakdown_id == item.id && res.workload_unit_id == item.workload_unit_id);
        if (!item.unit_price) {
          item.unit_price = thing && thing.unit_price ? thing.unit_price : null
        }
        var cur_model = []
        if(this.model['produce_breakdowns']){
          cur_model = this.model['produce_breakdowns'].find(res => res.id === item.id)
        }
        return {
          label: item.title,
          id: item.id,
          description: item.description,
          workload_unit_id: cur_model?cur_model['workload_unit_id']:item.workload_unit_id,
          workload_unit_name:  cur_model?cur_model['workload_unit_name']:item.workload_unit_name,
          value: cur_model?cur_model['value'] : 0,
          unit_price: cur_model?cur_model['unit_price']:item.unit_price
        };
      });
    }

    this.isVisible = true;
    this.model.price_type = '3';
    this.cd.markForCheck();

  }

  closeModel () {
    this.isVisible = false;
    this.isRenderForm = false;
    this.cd.markForCheck();
  }

  submit () {
    if (this.model.price_type == '3') {
      this.model.produce_breakdowns = this.editeDtailsValue;
    } else {
     this.model.produce_breakdowns = this.useTemplateModel.pre_produce_breakdown;
     this.model.pre_unit_price = this.useTemplateModel.pre_unit_price;
    }

    if (this.model.price_type == '1' || this.model.price_type == '2') {
      this.model.price_type = '1';
      this.isUseTemplate = true;
    }

    this.isVisible = false;
    this.isRenderForm = false;
    this.formControl.setValue(this.model.produce_breakdowns);
    this.cd.markForCheck();
  }

  // 选择模板
  OnChanges (id) {
    let pre_produce_breakdown = this.to['price_template_library_list']
      .find(res => res.category_id === id + '').priceTemplateLibraryDetail.map(res => {
      return {
        label: res.produce_breakdown_title,
        value: res.value,
        id: res.id,
        description: res.description
      };
    });
    this.useTemplateModel.pre_produce_breakdown = pre_produce_breakdown;
    this.useTemplateModel.pre_unit_price = this.to['price_template_library_list'].find(res => res.category_id === id + '').unit_price;
    this.useTemplateModel['render_pic'] = this.to['price_template_library_list'].find(res => res.category_id === id + '').render_pic;
    this.useTemplateModel['template_example'] = this.to['price_template_library_list'].find(res => res.category_id === id + '').template_example;
    // this.cd.markForCheck();
    this.cd.detectChanges();

  }

  // 显示明细
  showDetail (model) {
    // this.editThingDetail =  model.produce_breakdowns;
    this.isEditDetailVisible = true;

    model.produce_breakdowns.forEach(item => {
      let thing = this.to['price_library_list'].find(res => res.produce_breakdown_id == item.id && res.workload_unit_id == item.workload_unit_id);
      if (!item.unit_price) {
        item.unit_price = thing && thing.unit_price ? thing.unit_price : null
      }
    });

    let total_price = model.produce_breakdowns.map(item => item.value && item.unit_price ? Number(item.value) * Number(item.unit_price) : 0).reduce((total, price) => total + price)
    this.thingTotalprice = total_price ? total_price : 0;

    this.cd.markForCheck();

  }

  workloadUnitChanges (id, data) {
    if (id) {
      data.workload_unit_name = this.to.workload_unit_list.find(item => item.value == id).label
      const produce_breakdown_info = this.to.price_library_list.find(item => item.produce_breakdown_id == data.id && item.workload_unit_id == id)
      if (produce_breakdown_info && produce_breakdown_info.unit_price) {
        data.unit_price = produce_breakdown_info.unit_price
      } else {
        data.unit_price = ''
      }

      this.formControl.setValue(this.model.produce_breakdowns);
      this.cd.markForCheck();
    }
  }

  // 编辑明细数量
  editThingDetailValue (data) {
    let total_price = data.map(item => item.value && item.unit_price ? Number(item.value) * Number(item.unit_price) : 0).reduce((total, price) => total + price)
    this.thingTotalprice = total_price ? total_price : 0;
    this.cd.markForCheck();
  }

  // 编辑明细弹窗
  editDetailModel () {
    
    // if (!this.model.produce_breakdowns.some(item => item.value && item.workload_unit_id)) {
    //   this.message.error('明细数量和明细单位不能为空');
    //   return
    // }
    this.isEditDetailVisible = false;
    this.formControl.setValue(this.model.produce_breakdowns);
    this.cd.markForCheck();
  }

  getAllPrcie (unit, value) {
    return unit && value ? Number(unit) * Number(value) : 0;
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }

  change () {
    this.formControl.setValue(this.model.produce_breakdowns);
    if (this.model.pre_workload) {
      if (this.formControl.parent.get('pre_workload')) {
        this.formControl.parent.get('pre_workload').setValue(this.model.pre_workload);
      }
    }
    this.cd.markForCheck();
  }
}
