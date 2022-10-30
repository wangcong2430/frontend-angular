import { Component, OnInit, ChangeDetectorRef,  ChangeDetectionStrategy } from '@angular/core';
import { FieldArrayType, FormlyFormBuilder } from '@ngx-formly/core';

@Component({
  selector: 'app-formly-tap-section',
  templateUrl: './select-template.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SelectTemplateComponent extends FieldArrayType implements OnInit {
  constructor(
    builder: FormlyFormBuilder,
    private cd: ChangeDetectorRef,
    ) {
    super(builder);
  }

  selectedValue = [];
  oldSelectedValue = [];

  ngOnInit () {
    // this.model.map(res => {
    //   this.selectedValue.push(res.id)
    //   this.oldSelectedValue.push(res.id)
    // })
  }

  OnChanges (arr) {
    // let list = arr.concat(this.oldSelectedValue)
    // list = Array.from(new Set(list))

    // // 新增的分类
    // let addList = list.filter(x => !this.oldSelectedValue.includes(x))
    // if (addList[0]) {
    //   let options = JSON.parse(JSON.stringify(this.to.options))
    //   let option = options.find(res => res.value === addList[0])
    //   super.add(arr.length-1, {
    //     product_list: [],
    //     id: option.value,
    //     title: option.label,
    //   })
    // }

    // // 删除的分类
    // let removeList = list.filter(x => !arr.includes(x))
    // if (removeList[0]) {
    //   let index = this.oldSelectedValue.findIndex((val) => val === removeList[0])
    //   super.remove(index)
    // }

    // this.oldSelectedValue = arr
  }
}
