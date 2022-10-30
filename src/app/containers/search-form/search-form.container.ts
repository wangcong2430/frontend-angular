import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-container-search-form',
  templateUrl: './search-form.container.html',
  styleUrls: ['./search-form.container.css']
})

export class SearchFormContainer implements OnInit {
  @Output() submit: EventEmitter<any> = new　EventEmitter();
  // loading
  loading = false;
  // 配置项
  @Input() data;

  @Input() searchFormData = {}
  // 筛选
  searchForm;
  isShowCollapse = true;
  isCollapse = true;
  isVisible = false;
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    this.isVisible = false;
    this.getConfig();
  }

  // 获取页面配置
  getConfig() {
    const group: any = {};
    if (Array.isArray(this.data)) {
      this.data.forEach((item, index) => {
        let defaultValue;
        defaultValue = typeof(item['defaultValue']) !== 'undefined' ? item['defaultValue'].toString() : '';
        item['show'] = index < 3;
        this.isShowCollapse = (index < 3) ? false : true;
        group[item.key] = new FormControl(item['defaultValue'] || '');
      });
    }
    this.searchForm = new FormGroup(group);
    this.isVisible = true;
  }

  // 展开更多筛选
  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
    if (this.data && this.data.length > 0) {
      this.data.forEach((item, index) => {
        item['show'] = this.isCollapse ? (index < 3) : true;
      });
    }
  }

  submitForm(): void {
    for (const i in this.searchForm.controls) {
      if (i) {
        this.searchForm.controls[ i ].markAsDirty();
        this.searchForm.controls[ i ].updateValueAndValidity();
      }
    }
    this.submit.emit({code: 0, value: this.searchForm.value});
  }
}
