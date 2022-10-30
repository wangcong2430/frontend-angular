import {
  Component, ChangeDetectorRef, OnChanges,
  ChangeDetectionStrategy, OnInit, OnDestroy,  Input, Output, EventEmitter, SimpleChanges
} from '@angular/core';
import { Subject} from 'rxjs';
import { ControlValueAccessor } from '@angular/forms';
import { isArray } from 'ngx-bootstrap';

@Component({
  selector: 'app-label-edit',
  templateUrl: './label-edit.component.html',
  styleUrls: ['label-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class LabelAditComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges {
  constructor(
    private cd: ChangeDetectorRef,
  ) {}

  onDestroy$ = new Subject<void>();
  isVisiable = false;
  attriOptions = [];


  collapsed = true;
  buyVideos=null;
  desginOptions=null;
  form_remark=null;
  formRemarks=[]
  howtomakes=null;

  @Input() edit: Boolean = false;

  @Input() data = [];

  @Input() required: Boolean = true;

  @Output() change = new EventEmitter<any>();

  @Output() dataChange = new EventEmitter<any>();

  onChange: any = () => {};
  onTouch: any = () => {};



  ngOnInit () {
    // 如果model 有数据, 则使用model, 否则使用options
    //console.log(this.data)
    this.data.map((item,index)=>{
      if(item.form_remark){
           item.form_remark=item.form_remark.replace(/\n/g,'<br>')
      }
      //89 后期包装
      if( item.category_id == "386"){
        if(item.title == "制作方式" ){
          this.howtomakes = item.form_value
          item.form_value = ""
          item.options = []
        }
      }
      return item
    })
    this.data = this.cascadeLabel(this.data);
  }
  cascadeLabel(data){
    let buy_video = data.find(item=>item.title == "需求类型" &&item.category_id == "386")
    if(!buy_video){
      return data
    }
    let made_type = data.find(item=>item.title == "制作方式" &&item.category_id == "386")
    if(!made_type){
      return data
    }
    let new_made_options = null
    if(buy_video.value=="买量视频"){
      if(made_type.value&&made_type.value instanceof Array){
        made_type.value=made_type.value.filter(idm=>idm=='实拍买量'||idm=='剪辑买量'||idm=='引擎买量')
      }
      new_made_options = this.howtomakes.split("|").filter(idm=>idm=='实拍买量'||idm=='剪辑买量'||idm=='引擎买量')
    }else if(buy_video.value!=null){
      new_made_options = this.howtomakes.split("|").filter(idm=>idm!=='实拍买量'&&idm!=='剪辑买量'&&idm!=='引擎买量')
    }
    //console.log(new_made_options)
    made_type.form_value = this.howtomakes
    made_type.options = new_made_options
    return data
  }





  ngOnChanges(changes: SimpleChanges): void {
    //console.log(this.data)
    const data = changes.data.currentValue;
    if (data && data instanceof Array) {
      this.data = data.map(item => {
        if(item.form_remark){
          item.form_remark=item.form_remark.replace(/\n/g,'<br>')
        }        
        if (item.attr_type === '1' && item.form_num > 1&& !item.options) {
          const form_name = item['form_name'] ? item['form_name'].split('|') : [];
          const value = item['value'] ? item['value'].split('|') : [];
          return {
            ...item,
            options: form_name.map((label, index) => {
              return {
                label: label,
                value: value && value[index] ? value[index] : ''
              };
            })
          };
        } else if (item.attr_type === '2' && !item.options) {
          //console.log(this.data)
         
          if( item.category_id == "386"){
            if(item.title == "制作方式" ){
              this.howtomakes = item.form_value
              item.form_value = ""
              item.options = []
              //console.log( this.howtomakes)
              this.data = this.cascadeLabel(this.data);
            }else{
              const form_value = item['form_value'] ? item['form_value'].split('|') : [];
              return {
                ...item,
                options: form_value
              };
            }

          } else{
            const form_value = item['form_value'] ? item['form_value'].split('|') : [];
            return {
              ...item,
              options: form_value
            };

          }
          if(item.value&&isArray(item.value)){
            item.value = item.value.filter(x => x)
          }
        }
        return item;
      }).filter(x => x);
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

  collapseChange ($event) {
    $event.stopPropagation()
    this.collapsed = !this.collapsed;
    this.cd.markForCheck();
  }

  modelChange (event) {
    if (this.data && this.data.length > 0) {
      this.data = this.data.map(item => {
        if (item.attr_type === '1' && item.form_num > 1 && item.options && item.options.length > 0) {
          item.options = item.options.map(res => {
            return {
              ...res,
              value: res.value || res.value === 0 ? res.value : null
            };
          });

          if (item.options.every(res => res.value === null)) {
            item.value = null;
          } else {
            item.value = item.options.map(res => res.value || res.value === 0  ? res.value : null).join('|');
          }
        } else {
          // console.log(item.value);
          if(item.value&&isArray(item.value)){
            item.value = item.value.filter(x => x)
          }
        }

        return item;
      }).filter(x => x)
      this.data = this.cascadeLabel(this.data);
    }
    this.dataChange.emit(this.data);
    this.cd.markForCheck();
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }

  ngOnDestroy() { }
}
