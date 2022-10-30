import { Component, ElementRef, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { BehaviorSubject, Observable } from 'rxjs'
import { map, debounceTime, switchMap, skipWhile, skip } from 'rxjs/operators'
import { ScriptService } from '../../services/script.service';

@Component({
  selector: 'formly-field-select-oa-user-new',
  templateUrl: './select-oa-user-new.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .search-user-body .search-user-ul li{
        font-size: 12px;
        overflow: hidden;
        height: 40px;
      }

      :host .search-user-body .search-user-ul,
      :host .search-user-body .search-user-ul li{
        min-width: 200px;
        width: 100%;
        max-width: 300px;
      }

      .search-user-body textarea {
        font-size: 12px;
        height: 20px;
      }

      ::ng-deep textarea.ant-input,
      ::ng-deep .ant-input {
        transition: none !important;
      }
    `
  ]
})
export class FormlyFieldSelectOaUserNew extends FieldType implements OnInit {
  validating = '';
  oaUserSelectList = {};
  oaUserAllLoading = {};

  constructor(
    private srcript: ScriptService,
    private cd: ChangeDetectorRef,
  ) {
    super();
  }

  get labelProp(): string {
    return this.to['labelProp'] || 'label';
  }

  get valueProp(): string {
    return this.to['valueProp'] || 'value';
  }

  get mode(): string {
    return this.to['mode'] || 'default';
  }

  get minRows(): string {
    return this.to['minRows'] || 2
  }



  searchChange$ = new BehaviorSubject('');

  ngOnInit () {
    const optionsList$ =  this.searchChange$.asObservable().pipe(x=>x).pipe(debounceTime(100))

    optionsList$.subscribe(value => {
      const search_key = this.getSearchKey(value)
      this.oaUserSelectList[this.key] = [];
      if (search_key !== '') {
        this.getSearchList(search_key)
      }
      this.cd.markForCheck()
    });
  }

  // 获取用户数据
  getOaUserList() {
    return new Promise((resolve, reject) => {
      if (!(window as any)._arrusers || (window as any)._arrusers.length === 0) {
        this.srcript.loadScript('user',  location.protocol + '//top.oa.com/js/users.js').then(data => {
          return resolve()
        }).catch(err => {
          reject()
        });
      } else {
        return resolve()
      }
    })
  }

  focus(key = null) {
    this.oaUserAllLoading[this.key] = 'loading...';
    this.getOaUserList().then(res => {
      this.oaUserAllLoading[this.key] = '';
      this.userinit()
    },err => {
      this.oaUserAllLoading[this.key] = '';
      this.cd.markForCheck()
    });
  }

  // 对用户进行格式化
  userinit() {
    if (this.model[this.key]) {
      let options;
      options = this.model[this.key].split(';');
      if (options.length > 0) {
        options.forEach((data, index) => {
          if (data === '') {
            options.splice(index, 1);
          }
        });
      }
      this.model[this.key] = options.join(';') + ';';
      this.cd.markForCheck()
    }
  }

  userblur(value, key) {
    value.stopPropagation();
    if (!(window as any)._arrusers || (window as any)._arrusers.length === 0) {
      return false;
    }
    let options;
    let newArr = []
    if (this.model[key]) {
      options = this.model[key].split(';');
      options.forEach((data, index) => {
        let temp_key, temp_arr;
        temp_key = data.toLowerCase().match('[a-z_]+') || [];
        temp_key = temp_key[0] || '';
        temp_arr = (window as any)._arrusers.find(item => item[0] == temp_key);

        if (temp_arr && temp_arr[1] && newArr.indexOf(temp_arr[1]) == -1) {
          newArr.push(temp_arr[1])
        }
      });
      this.model[key] = newArr.join(';');
      this.formControl.setValue(this.model[key])

      // 清除缓存

    }
    setTimeout(() => {
      this.oaUserSelectList[key] = [];
      this.cd.markForCheck()
    }, 300);
    this.cd.markForCheck()
    // 去重,补全
  }

  userclick(option, key) {
    this.model[this.key] = this.addUser(option[1], this.model[key].split(';'))
    this.formControl.setValue(this.model[this.key])
    this.oaUserSelectList[key] = [];
    this.cd.markForCheck()
  }


  change (value) {
    this.searchChange$.next(value)
  }

  search (value) {
    if (!this.oaUserAllLoading[this.key]) {
      const search_key = this.getSearchKey(value.target.value)
      this.oaUserSelectList[this.key] = [];
      if (search_key !== '') {
        this.getSearchList(search_key)
      }
    }
    this.cd.markForCheck()
  }

  // 添加用户
  addUser (user, users) {
    let userlist = [];
    if (this.model[this.key]) {
      userlist = users
    }

    if (userlist.length == 0) {
      userlist.push(user);
    } else {
      if (userlist.every(value => user != value)) {
        userlist.push(user );
      }
    }

    if (userlist.length > 0) {
      userlist.forEach((user, index) => {
        if (user.indexOf('(') < 0) {
          userlist.splice(index, 1);
        }
      });
    }
    return userlist.join(';') + ';';
  }

  // 获取搜索关键字
  getSearchKey (value) {
    let users = value.split(';');
    return users && users.length > 0 ? users.find(item => item.indexOf('(') < 0) : ''
  }

  // 获取搜索下拉参数
  getSearchList (key) {

    (window as any)._arrusers.forEach(data => {
      if (this.oaUserSelectList[this.key].length <= 8 && data[1].indexOf(key) == 0) {
        this.oaUserSelectList[this.key].push(data);
      }
    });

    if (this.oaUserSelectList[this.key].length <= 8) {
      (window as any)._arrusers.forEach(data => {
        if (this.oaUserSelectList[this.key].length <= 8 && data[1].indexOf(key) > 0) {
          this.oaUserSelectList[this.key].push(data);
        }
      });
    }
  }

  debounce (fn, wait) {
    var timeout = null;
    return function() {
        if(timeout !== null)   clearTimeout(timeout);
        timeout = setTimeout(fn, wait);
    }
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
