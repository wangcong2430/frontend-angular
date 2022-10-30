import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-component-crumb',
  templateUrl: './crumb.component.html',
  styleUrls: ['./crumb.component.css']
})
export class CrumbComponent implements OnInit {
  @Input() title = '';
  @Input() list;
  @Input() isChildren = false;
  @Output() changeDisabledButton: EventEmitter<any> = new　EventEmitter();

  constructor(
    public menuService: MenuService
  ) {}

  ngOnInit() {}

  // 全部展开、全部收起
  openOrCloseAll(bool = true) {
    this.list.forEach(data => {
      data.expand = bool;
    });
  }

  // 表格全选
  checkAll(value: boolean): void {

    if (this.list.length == 0) {
      return
    }
    this.list.forEach(data => {
      if (data.children) {
        data.children.forEach(data2 => {
          data2.checked = data2.disabled ? data2.checked : value;
        });

        if (data.children.filter(item => !item.disabled).every(item => item.checked === false) ) {
          data.checked = false;
          data.indeterminate = false;
        } else if ( data.children.filter(item => !item.disabled).every(item => item.checked === true) ) {
          data.checked = true;
          data.indeterminate = false;
        } else {
          data.indeterminate = true;
        }
      }
    } );

    if (this.list.some(item => item.indeterminate || item.checked)) {
      this.changeDisabledButton.emit(false);
    }
  }

  checkReverse(): void {
    if (this.list.length == 0) {
      return
    }
    this.list.forEach(data => {
      if (data.children) {
        data.children.forEach(data2 => data2.checked = data2.disabled ? data2.checked : !data2.checked);

        if (data.children.filter(item => !item.disabled).every(item => item.checked === false) ) {
          data.checked = false;
          data.indeterminate = false;
        } else if ( data.children.filter(item => !item.disabled).every(item => item.checked === true) ) {
          data.checked = true;
          data.indeterminate = false;
        } else {
          data.indeterminate = true;
        }
      }
    } );

    // 改变disbale状态
    if (this.list.some(item => item.indeterminate || item.checked)) {
      this.changeDisabledButton.emit(false);
    } else {
      this.changeDisabledButton.emit(true);
    }
  }
}
