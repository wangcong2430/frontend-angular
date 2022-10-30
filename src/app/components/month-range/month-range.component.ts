import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-month-range',
  templateUrl: './month-range.component.html',
  styleUrls: ['./month-range.component.css']
})
export class MonthRangeComponent implements OnInit {
  @Input()
  set value(value: string) {
    this._value = value;
    if (this._value && this._value.length) {
      if (this._value[0] && this._value[1]) {
        this.text = this._value[0].slice(0, 4)
            + '-' + this._value[0].slice(4, 6)
            + '~' + this._value[1].slice(0, 4)
            + '-' + this._value[1].slice(4, 6);
      } else {
        this.text = '-请选择-';
      }
    } else {
      this.text = '-请选择-';
    }
  }
  get value() {
    return this._value;
  }
  @Output() valueChange: EventEmitter<string>;
  hiddenSelect = true;
  yearList = [];
  monthList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  text = '';
  _value;
  query = {
      begin_year: '',
      begin_month: '',
      end_year: '',
      end_month: '',
  };
  showError = false;
  constructor() {
      this.valueChange = new EventEmitter<string>();
  }

  ngOnInit() {
    const year = new Date().getFullYear();
    for (let i = 2018; i <= year; i++) {
        this.yearList.push(i + '');
    }
  }

  initValue() {
    this.showError = false;
    if (this._value && this._value.length) {
      const begin = this._value[0];
      const end = this._value[1];
      this.query.begin_year = begin.slice(0, 4);
      this.query.begin_month = begin.slice(4, 6);
      this.query.end_year = end.slice(0, 4);
      this.query.end_month = end.slice(4, 6);
    }
  }
  show () {
    this.hiddenSelect = !this.hiddenSelect;
    if (this.hiddenSelect === false) {
      this.initValue();
    }
  }
  apply() {
    if (!this.query.begin_year || !this.query.begin_month || !this.query.end_year || !this.query.end_month) {
      this.text = '-请选择-';
      this._value = [];
    } else if ((this.query.begin_year > this.query.end_year) ||
      (this.query.begin_year === this.query.end_year && this.query.begin_month > this.query.end_month)) {
      this.showError = true;
      return false;
    } else {
      this.text = this.query.begin_year + '-' + this.query.begin_month + '~' + this.query.end_year + '-' + this.query.end_month;
      this._value = [this.query.begin_year + this.query.begin_month, this.query.end_year + this.query.end_month];
    }
    this.hiddenSelect = true;
    this.valueChange.emit(this._value);
  }
  cancel() {
    this.showError = false;
    this.hiddenSelect = true;
  }

}
