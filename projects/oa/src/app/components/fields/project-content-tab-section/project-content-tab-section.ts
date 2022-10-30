import { Component, ChangeDetectorRef,  ChangeDetectionStrategy } from '@angular/core';
import { FieldArrayType, FormlyFormBuilder } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { MessageService } from '../../../services/message.service'

@Component({
  selector: 'app-formly-tap-section',
  templateUrl: './project-content-tab-section.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ProjectContentTabComponent extends FieldArrayType {
  constructor(
    builder: FormlyFormBuilder,
    private msg: MessageService,
    private cd: ChangeDetectorRef,

  ) {
    super(builder);
  }

  // 多选框的下拉属性
  selectOptions = []

  // 多选框的选中值
  SelectedValue = [];

  nzSelectedIndex

  selectedValue = [];
  oldSelectedValue = []

  copyContent = null

  ngOnInit () {
    // 设置下拉框下拉参数
    this.selectOptions = this.model.map(item => {
      return {
        label: item.label,
        value: item.value,
      }
    })

    this.SelectedValue = this.model.filter(item => {
      return item.checked === true
    }).map(res => res.value)

    this.cd.markForCheck()
  }

  // 当前多选框发生变化
  OnSelectChanges ($event) {
    this.model.map(item => {
      let value = $event.find(res => {
        return res === item.value
      })
      item.checked = value ? true : false
    })

    this.cd.markForCheck()
  }

  copyText (item, index) {
    this.msg.success('复制成功');
    let data = {};
    if(this.field.templateOptions.isBMP) {
      data = {
        focus_peopler: this.model[index].focus_peopler,
        core_people: this.model[index].core_people,
      }
    } else {
      data = this.model[index];
    }

    this.copyContent = {
      data: JSON.parse(JSON.stringify(data)),
      index:index
    }

    this.cd.markForCheck()
  }

  paste (data, index) {
    if (this.copyContent && this.copyContent.data) {
      this.msg.success('黏贴成功');
      let target = Object.assign({}, { ...this.model[index], ...this.copyContent.data, label: this.model[index].label, value: this.model[index].value, need_approver: (this.model[index].need_approver ? this.model[index].need_approver : this.copyContent.data.need_approver) })
      super.remove(index);
      super.add(index, target );
    } else {
      this.msg.error('缓存没有数据, 请重新复制')
    }

    this.cd.markForCheck()
  }


  onChange ($event) {}

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
