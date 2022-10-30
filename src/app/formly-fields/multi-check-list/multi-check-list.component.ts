import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { FieldType } from '@ngx-formly/core';


@Component({
  selector: 'app-multi-check-list',
  templateUrl: './multi-check-list.component.html',
  styleUrls: ['./multi-check-list.component.css']
})

export class FormlyFieldMultiCheckListComponent extends FieldType implements OnInit, OnChanges {

  curCheckList = []
  oldCheckList = []

  constructor() {
    super();
  }

  processSelectList(id: string, list: string[]) {
    let index = list.indexOf(id)
    let result = list.slice(0)
    if (index === -1) {
      result.push(id)
    } else {
      result.splice(index, 1)
    }
    return result
  }

  checkClickHandler(id) {
    if (!this.to.disabled) {
      if (!this.model[this.key]) {
        this.curCheckList = []
      }
      this.curCheckList = this.processSelectList(id, this.curCheckList)
      this.updateForm()
    }
  }

  // 全选、反选click handler
  batchSelectHandler(type) {
    if (!this.to.disabled) {
      if (!this.model[this.key]) {
        this.curCheckList = []
      }
      if (type === '1') {
        this.curCheckList = this.to.checkList.map(item => item.id.toString())
      } else if (type === '2') {
        let curCheckList = this.curCheckList
        this.curCheckList = this.to.checkList.filter(item => curCheckList.indexOf(item.id.toString()) === -1).map(it => it.id.toString())
      }
      this.updateForm()
    }
  }

  updateForm() {
    this.model[this.key] = this.curCheckList
    if (this.form.get(this.key)) {
      this.form.get(this.key).setValue(this.model[this.key]);
    }
  }

  ngOnInit() {
    this.oldCheckList = this.to.checkList
  }

}
