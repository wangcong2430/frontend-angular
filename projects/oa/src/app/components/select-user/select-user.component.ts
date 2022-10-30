import { forwardRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ScriptService } from '../../services/script.service';

@Component({
  selector: 'app-select-oa-user-component',
  templateUrl: './select-user.component.html',
  styleUrls: ['./select-user.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectOaUserComponent),
      multi: true
    }
  ]
})

export class SelectOaUserComponent  implements ControlValueAccessor, OnInit {
    validating = '';
    oaUserAllList = [];
    oaUserSelectList = {};
    oaUserAllLoading = {};

    //The internal data model
    private innerValue: any = '';
    //Placeholders for the callbacks which are later provided
    //by the Control Value Accessor
    private onTouched: () => void = null;
    private onChange: (_: any) => void = null;

    @Input() nzSize = 'default'
    @Input() key = ''
    @Input() disabled: Boolean = false;
    @Output()  onSelectChange = new EventEmitter<Object>();

    //get accessor
    get value(): any {
        return this.innerValue;
    };

    //set accessor including call the onchange callback
    set value(v: any) {
        if (v !== this.innerValue) {
            this.innerValue = v;
            this.onChange(v);
        }
    };

    // get minRows() : number {
    //   return this.innerValue ? Math.floor(this.innerValue.replace(/[^\u0000-\u00ff]/g,'aaa').length / 60) + 1 : 1
    // }


    constructor(
      private srcript: ScriptService
    ) {

    }


    ngOnInit () {}

    //From ControlValueAccessor interface
    writeValue(value: any) {
        if (value !== this.innerValue) {
            this.innerValue = value;
        }
    }

    //From ControlValueAccessor interface
    registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    //From ControlValueAccessor interface
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    getOaUserList(key) {
      let options;
      if (this.oaUserAllList.length === 0) {
        options = this.innerValue;
        this.oaUserAllLoading[key] = 'loading...';
        this.innerValue = '';
        if ((window as any)._arrusers) {
          const userNameList = (window as any)._arrusers;
          this.oaUserAllLoading = {};
          this.innerValue = options;
          this.oaUserAllList = userNameList;
          this.userinit(key);
        } else {
          this.srcript.loadScript('user', location.protocol + '//top.oa.com/js/users.js').then(data => {
            this.oaUserAllLoading = {};
            this.innerValue = options;
            this.oaUserAllList = (window as any)._arrusers;
            this.userinit(key);
          });
        }
      } else {
        this.userinit(key);
      }
    }

    userfocus(key) {
      this.getOaUserList(key);
    }

    userinit(key) {
      if (this.innerValue && this.innerValue !== '') {
        let options;
        options = this.innerValue.split(';');
        if (options.length > 0) {
          options.forEach((data, index) => {
            if (data === '') {
              options.splice(index, 1);
            }
          });
        }
        this.innerValue = options.join(';') + ';';
        this.onChange(this.innerValue);
      }
    }

    userblur(value, key) {
      value.stopPropagation();
      if (this.oaUserAllList.length === 0) {
        return false;
      }
      let options;
      if (this.innerValue) {
        options = this.innerValue.split(';');
        if (options instanceof Array && options.length) {
          options.forEach((data, index) => {
            let temp_key, temp_arr;
            temp_key = data.toLowerCase().match('[a-z_]+') || [];
            temp_key = temp_key[0] || '';
            temp_arr = this.oaUserAllList.filter(item => item[0] === temp_key);
            if (temp_arr && temp_arr.length > 0) {
              options[index] = temp_arr[0][1];
            } else {
              options.splice(index, 1);
            }
          });
          this.innerValue = options.join(';');
          this.onChange(this.innerValue);
        }
      }
      setTimeout(() => {
        this.oaUserSelectList[key] = [];
      }, 300);
    }

    userclick(option, key) {
      let options;
      if (this.innerValue) {
        options = this.innerValue.split(';');
      } else {
        options = [];
      }
      if (options.length === 0) {
        options.push(option[1]);
      } else {
        if (options.length > 0) {
          options.forEach((data, index) => {
            if (data.indexOf('(') < 0) {
              options.splice(index, 1);
            }
          });
        }
        if (!options.some(value => option[1] === value)) {
          options.push(option[1]);
        }
      }
      this.innerValue = options.join(';');
      this.oaUserSelectList[key] = [];
      this.onChange(this.innerValue);
    }

    userChange(value, key) {
      let search_key, options;
      search_key = '';
      options = value.target.value.split(';');
      if (options.length > 0) {
        options.forEach(data => {
          if (data.indexOf('(') < 0) {
            search_key = data;
          }
        });
      }
      this.oaUserSelectList[key] = [];
      if (search_key !== '' && this.oaUserAllList instanceof Array && this.oaUserAllList.length) {
        this.oaUserAllList.forEach(data => {
          if (this.oaUserSelectList[key].length <= 5 && data[1].indexOf(search_key) >= 0) {
            this.oaUserSelectList[key].push(data);
          }
        });
      }
    }

    trackByFn(index, item) {
      return item && item.id ? item.id : index; // or item.id
    }
}
