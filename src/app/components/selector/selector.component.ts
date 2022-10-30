import { Component, Input, OnInit, OnChanges, Output, ElementRef, ViewChild, EventEmitter } from '@angular/core';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})

export class SelectorComponent implements OnInit, OnChanges {
  @Input() list: object;
  @Input() bindLabel: string;
  @Input() bindValue: string;
  @Input() searchKey: string;
  @Input() placeholder: string;
  @Input() value: string;
  @Input() isCur: boolean;
  @Input() curValue: string;
  @Output() valueChange: EventEmitter<string>;
  @Input() filter: Array<object>;
  searchValue = '';
  text = '';
  open = false;

  @ViewChild('search', { read : ElementRef })
  search: ElementRef;

  constructor(private util: UtilsService) {
      this.valueChange = new EventEmitter<string>();
  }

  ngOnInit () {
    this.list = this.list || [];
    this.bindLabel = this.bindLabel || 'name';
    this.bindValue = this.bindValue || 'id';
    this.searchKey = this.searchKey || 'name';
    this.placeholder = this.placeholder || '请选择';
    if (this.isCur === false) {
      if (this.value) {
        const index = this.util.findIndexByKeyValue(this.list, this.bindValue, this.value);
        this.text = index > -1 ? this.list[index][this.bindLabel] : '';
      }
      this.curValue = this.text;
    } else {
      this.curValue = this.curValue;
    }
  }

  clear(e) {
    if (e) {
      e.stopPropagation();
    }
    this.value = '';
    this.text = '';
    this.curValue = '';
    this.valueChange.emit(this.value);
  }

  openFn() {
    this.open = !this.open;
    setTimeout(() => {
      this.search.nativeElement.focus();
    });
  }

  change(item) {
    this.value = item[this.bindValue];
    this.text = item[this.bindLabel];
    this.valueChange.emit(this.value);
    this.curValue = this.text;
    this.open = false;
  }

  ngOnChanges (changes) {
    if (changes && changes.list) {
      const index = this.util.findIndexByKeyValue(changes.list.currentValue, this.bindValue, this.value);
      if (index > -1) {
        this.text = this.curValue = changes.list.currentValue[index][this.bindLabel];
      } else {
        this.text = this.curValue = '';
      }
    }
    if (changes && changes.value) {
      if (this.isCur === false) {
        this.value = changes.value.currentValue;
      }
    }
  }

  get val() {
    if (this.isCur === false) {
      const index = this.util.findIndexByKeyValue(this.list, this.bindValue, this.value);
      return index > -1 ? this.list[index][this.bindLabel] : '';
    } else {
      return this.curValue;
    }
  }
}
