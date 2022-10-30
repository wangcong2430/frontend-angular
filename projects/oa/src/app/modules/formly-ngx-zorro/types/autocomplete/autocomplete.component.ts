import { Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
    selector: 'app-autocomplete-component',
    templateUrl: './autocomplete.component.html'
})
export class AutocompleteComponent extends FieldType implements OnInit {
  data: any = [];

  ngOnInit () {
    if (this.to.options instanceof Array) {
      this.data = [...this.to.options];
    }
  }

  onInput(value: string): void {
    if (this.to.options instanceof Array) {
      this.data = [...this.to.options];
    }

    if (value) {
      this.data = this.data.filter(option => {
        return option.value.toLowerCase().indexOf(value.toLowerCase()) > -1
      });
    }
  }
}
