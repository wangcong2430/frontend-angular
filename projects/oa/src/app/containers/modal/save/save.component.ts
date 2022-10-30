import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UploadXHRArgs } from 'ng-zorro-antd';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { debounceTime, skip } from 'rxjs/operators';
import { MessageService } from '../../../services/message.service';
import { UploadService } from '../../../services/upload.service';
import { ScriptService } from '../../../services/script.service';
import { CosService } from '../../../services/cos.service';
import { filterOption } from '../../../utils/utils';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-modal-save',
  templateUrl: './save.component.html',
  styleUrls: ['./save.component.css']
})

export class SaveModalComponent implements OnInit {
  @Output() submit: EventEmitter<any> = new　EventEmitter();
  saveForm: FormGroup;
  base = {
    width: 500,
    laCol: 24,
  };
  modalData = {
    isShow: false,
    formBase: [],
    data: {}
  };
  modelName = '';
  remarkModalData;
  searchOaChange$ = new BehaviorSubject('');
  isSearchOaSelect = true;
  optionOaSearchs = {};
  optionOaKey = '0';
  searchQqChange$ = new BehaviorSubject('');
  isSearchQqSelect = true;
  optionQqSearchs = {};
  optionQqKey = '0';

  fileList = [];
  objtype;

  oaUserAllList = [];
  oaUserSelectList = {};
  oaUserAllLoading = {};

  filterOption = filterOption
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private uploadService: UploadService,
    private srcript: ScriptService,
    public cos: CosService,
    private modalService: NzModalService
  ) {}

  ngOnInit() {
    this.base = {
      width: 500,
      laCol: 24,
    };
    this.modalData = {
      isShow: false,
      formBase: [],
      data: {}
    };
    this.modelName = '';
    // this.saveForm = {};
    this.searchOaChange$ = new BehaviorSubject('');
    this.isSearchOaSelect = true;
    this.optionOaSearchs = {};
    this.optionOaKey = '0';
    this.searchQqChange$ = new BehaviorSubject('');
    this.isSearchQqSelect = true;
    this.optionQqSearchs = {};
    this.optionQqKey = '0';
    this.searchQqChange$.asObservable().pipe(skip(1), debounceTime(500))
      .subscribe((value) => {
        let options;
        options = {

        };
        this.isSearchQqSelect = true;
        this.http.get('web/user/cp-user-list', { params: {
          username: value ? value : '',
        }}).subscribe(data2 => {
          this.optionQqSearchs[(this.optionQqKey ? this.optionQqKey : '0')] = data2['data'];
          this.isSearchQqSelect = false;
        });
      });


    this.searchOaChange$.asObservable().pipe(skip(1), debounceTime(120))
      .subscribe((value) => {
        this.isSearchOaSelect = true;
        let params = {
          enName: value ? value : '',
        }
        if (this.modalData.data && this.modalData.data['project_id']) {
          params['project_id'] = this.modalData.data['project_id']
        }

        this.http.get('web/user/search-names', { params: params }).subscribe(data2 => {
          this.optionOaSearchs[(this.optionOaKey ? this.optionOaKey : '0')] = data2['data'];
          this.isSearchOaSelect = false;
        });
      });
  }

  // 表单值变化
  modelChange(value, key) {
    //console.log(value,key)
    if (this.modelName === 'rest-category' && key === 'parent_id') {
      if (value.toString() === '0') {
        // 改变表单配置
        this.modalData.formBase.forEach(form => {
          if (form.key === 'produce_grades') {
            form.hideExpression = true;
          } else if (form.key === 'produce_breakdowns') {
            form.hideExpression = true;
          } else if (form.key === 'is_pull_spider') {
            form.hideExpression = true;
          } else if (form.key === 'is_project_category') {
            form.hideExpression = false;
          } else if (form.key === 'is_exhibition') {
            form.hideExpression = false;
          } else if (form.key === 'is_breakdown') {
            form.hideExpression = true;
          } else if (form.key === 'type') {
            form.hideExpression = false;
          }
        });
        this.modalData.data['produce_grades'] = '';
        this.modalData.data['produce_breakdowns'] = '';
      } else {
        this.http.get('web/category/get-parent-select', { params: {id: value} }).subscribe(result => {
          if (result['code'] !== 0) {
            this.message.error(result['msg']);
            return false;
          }
          // 改变表单配置
          this.modalData.formBase.forEach(form => {
            if (form.key === 'produce_grades') {
              form.hideExpression = false;
              form.templateOptions.options = result['produceGrade'];
            } else if (form.key === 'produce_breakdowns') {
              form.hideExpression = false;
              form.templateOptions.options = result['produceBreakdown'];
            } else if (form.key === 'is_pull_spider') {
              form.hideExpression = false;
            } else if (form.key === 'is_project_category') {
              form.hideExpression = true;
            } else if (form.key === 'is_exhibition') {
              form.hideExpression = true;
            } else if (form.key === 'is_breakdown') {
              form.hideExpression = false;
            } else if (form.key === 'type') {
              form.hideExpression = true;
            }
            this.modalData.data['produce_grades'] = '';
            this.modalData.data['produce_breakdowns'] = '';
          });
        });
      }
    } else if (this.modelName === 'user-oa' && key === 'username') {
      let params;
      params = {username: value.target.value};
      if (value.target.value !== '') {
        this.http.get('web/user/info-by-username', { params: params }).subscribe(result => {
          if (result['code'] !== 0) {
            this.message.error(result['msg']);
            this.modalData.data['username']  = '';
            return false;
          }
          this.modalData.data['name']  = result['data']['name'];
          this.modalData.data['email'] = result['data']['email'];
        });
      }
    } else if (this.modelName === 'user-oa' && key === 'roles') {
      if (value && Array.isArray(value)) {
        let isinternal, control, financial, spm, department_deadline, department_group_deadline;
        isinternal = false;
        control = false;
        financial = false;
        department_deadline = false;
        department_group_deadline = false;
        value.forEach(data2 => {
          if (data2 === '内审') {
            isinternal = true;
          }
          if (data2 === '内控') {
            control = true;
          }
          if (data2 === '财务') {
            financial = true;
          }
          if (data2 === '财务') {
            financial = true;
          }
          if (data2 === '采购助理') {
            spm = true;
          }
          if (data2 === '工作室接口人') {
            department_deadline = true;
          }

          if (data2 === '工作室群接口人') {
            department_group_deadline = true;
          }
        });
        if (!isinternal) {
          this.modalData.data['internal_deadline']  = '';
        }
        if (!control) {
          this.modalData.data['control_deadline']  = '';
        }
        if (!financial) {
          this.modalData.data['financial_deadline']  = '';
        }
        if (!spm) {
          this.modalData.data['spm_user_id']  = '';
        }
        if (!department_deadline) {
          this.modalData.data['department_deadline'] = ''
        }

        if (!department_group_deadline) {
          this.modalData.data['department_group_deadline'] = ''
        }

        this.modalData.formBase.forEach(form => {
          if (form.key === 'internal_deadline' && !isinternal) {
            form.hideExpression = true;
          } else if (form.key === 'internal_deadline' && isinternal) {
            form.hideExpression = false;
          }
          if (form.key === 'control_deadline' && !control) {
            form.hideExpression = true;
          } else if (form.key === 'control_deadline' && control) {
            form.hideExpression = false;
          }
          if (form.key === 'financial_deadline' && !financial) {
            form.hideExpression = true;
          } else if (form.key === 'financial_deadline' && financial) {
            form.hideExpression = false;
          }
          if (form.key === 'spm_user_id' && !spm) {
            form.hideExpression = true;
          } else if (form.key === 'spm_user_id' && spm) {
            form.hideExpression = false;
          }

          if (form.key === 'department_deadline' && !department_deadline) {
            form.hideExpression = true
          } else if (form.key === 'department_deadline' && department_deadline){
            form.hideExpression = false
          }

          
          if (form.key === 'department_group_deadline' && !department_group_deadline) {
            form.hideExpression = true
          } else if (form.key === 'department_group_deadline' && department_group_deadline){
            form.hideExpression = false
          }
        });
      }
    } else if (this.modelName === 'common-price' && key === 'category_id') {
      this.http.get('web/price-library/category-change', { params: {category_id: value} }).subscribe(result => {
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        // 改变表单配置
        this.modalData.formBase.forEach(form => {
          if (form.key === 'produce_grade_id') {
            form.hideExpression = false;
            form.templateOptions.options = result['data']['produceGradeList'] || [];
          } else if (form.key === 'produce_breakdown_id') {
            form.hideExpression = false;
            form.templateOptions.options = result['data']['produceBreakdownList'] || [];
          }
          this.modalData.data['produce_grade_id'] = '';
          this.modalData.data['produce_breakdown_id'] = '';
        });
      });
    }
  }

  getOaUserList(key) {
    let options;
    if (this.oaUserAllList.length === 0) {
      options = this.modalData.data[key];
      this.oaUserAllLoading[key] = 'loading...';
      this.modalData.data[key] = '';
      if ((window as any)._arrusers) {
        const userNameList = (window as any)._arrusers;
        this.oaUserAllLoading = {};
        this.modalData.data[key] = options;
        this.oaUserAllList = userNameList;
        this.userinit(key);
      } else {
        this.srcript.loadScript('user', location.protocol + '//top.oa.com/js/users.js').then(data => {
          this.oaUserAllLoading = {};
          this.modalData.data[key] = options;
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
    if (this.modalData.data[key] && this.modalData.data[key] !== '') {
      let options;
      options = this.modalData.data[key].split(';');
      if (options.length > 0) {
        options.forEach((data, index) => {
          if (data === '') {
            options.splice(index, 1);
          }
        });
      }
      this.modalData.data[key] = options.join(';') + ';';
    }
  }
  userblur(value, key) {
    let options;
    if (this.modalData.data[key]) {
      options = this.modalData.data[key].split(';');
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
      this.modalData.data[key] = options.join(';');
    }
    setTimeout(() => {
      this.oaUserSelectList[key] = [];
    }, 300);
  }
  userclick(option, key) {
    let options;
    if (this.modalData.data[key]) {
      options = this.modalData.data[key].split(';');
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
    this.modalData.data[key] = options.join(';');
    this.oaUserSelectList[key] = [];
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
    if (search_key !== '') {
      this.oaUserAllList.forEach(data => {
        if (this.oaUserSelectList[key].length <= 5 && data[1].indexOf(search_key) >= 0) {
          this.oaUserSelectList[key].push(data);
        }
      });
    }
  }

  // 开打弹窗
  openModal(formBase, data, modelName = '') {
    let tdata = {};
    if (data) {
      tdata = JSON.parse(JSON.stringify(data));
    }
    this.ngOnInit();
    this.modelName = modelName;
    formBase.forEach((item, index) => {
      // 树形选择框处理
      if (item.type === 'tree_select' && item.templateOptions) {
        item.templateOptions.treeSelect = [];
        item.templateOptions.options.forEach(option => {
          let newNode;
          newNode = {
            title: option.label,
            key:   option.value,
            children: []
          };
          if (option.children && Array.isArray(option.children)) {
            option.children.forEach(option2 => {
              let cnewNode;
              cnewNode = {
                title: option2.label,
                key:   option2.value,
              };
              if (option2.children && Array.isArray(option2.children)) {
                cnewNode['children'] = [];
                option2.children.forEach(option3 => {
                  cnewNode.children.push({
                    title: option3.label,
                    key:   option3.value,
                  });
                });
              }
              newNode.children.push(cnewNode);
            });
          }
          item.templateOptions.treeSelect.push(newNode);
        });
      } else if (item.type === 'select-oa-user' && typeof(tdata[item.key + '_options']) === 'object') {
        this.isSearchOaSelect = false;
        this.optionOaSearchs[item.key] = tdata[item.key + '_options'];
      } else if (item.type === 'select-qq-user' && typeof(tdata[item.key + '_options']) === 'object') {
        this.isSearchOaSelect = false;
        this.optionOaSearchs[item.key] = tdata[item.key + '_options'];
      }
      // 表单赋值
      let defaultValue;
      defaultValue = typeof(item['defaultValue']) !== 'undefined'
        && typeof(item['defaultValue']) !== 'object'
        && typeof(item['defaultValue']) !== 'function'
        ? item['defaultValue'].toString() : null;
      if (tdata && tdata[item.key] && typeof(tdata[item.key]) !== 'function') {
        defaultValue = typeof(tdata[item.key]) === 'object' ? tdata[item.key] : tdata[item.key].toString();
      }
      if (item['editDisabled'] && tdata && tdata['id']) {
        item.disabled = true;
      } else {
        item.disabled = false;
      }

      if (item.key && defaultValue) {
        tdata[item.key] = defaultValue;
      }

      // this.saveForm.setControl(item.key, new FormControl({value: defaultValue, disabled: item.disabled || false}));
    });
    if (formBase.length > 5) {
      this.base = {
        width: 850,
        laCol: 12,
      };
    }
    this.modalData.formBase = JSON.parse(JSON.stringify(formBase));
    this.modalData.data = tdata;
    if (this.modalData.data && typeof(this.modalData.data['sort']) === 'function') {
      this.modalData.data['sort'] = '';
    }
    if (this.modelName === 'user-oa' && tdata['roles'] && Array.isArray(tdata['roles'])) {
      let isinternal, control, financial, spm,department,department_group;
      isinternal = false;
      control = false;
      financial = false;
      spm = false;
      department = false;
      department_group = false;
      tdata['roles'].forEach(data2 => {
        if (data2 === '内审') {
          isinternal = true;
        }
        if (data2 === '内控') {
          control = true;
        }
        if (data2 === '财务') {
          financial = true;
        }
        if (data2 === '采购助理') {
          spm = true;
        }
        if (data2 === '工作室接口人') {
          department = true;
        }
        if (data2 === '工作室群接口人') {
          department_group = true;
        }
      });
      if (!isinternal) {
        this.modalData.data['internal_deadline']  = '';
      }
      if (!control) {
        this.modalData.data['control_deadline']  = '';
      }
      if (!financial) {
        this.modalData.data['financial_deadline']  = '';
      }
      if (!department) {
        this.modalData.data['department_deadline']  = '';
      }
      if (!department_group) {
        this.modalData.data['department_group_deadline']  = '';
      }
      if (!spm) {
        this.modalData.data['spm_user_id']  = '';
      }
      this.modalData.formBase.forEach(form => {
        if (form.key === 'internal_deadline' && !isinternal) {
          form.hideExpression = true;
        } else if (form.key === 'internal_deadline' && isinternal) {
          form.hideExpression = false;
        }
        if (form.key === 'control_deadline' && !control) {
          form.hideExpression = true;
        } else if (form.key === 'control_deadline' && control) {
          form.hideExpression = false;
        }
        if (form.key === 'financial_deadline' && !financial) {
          form.hideExpression = true;
        } else if (form.key === 'financial_deadline' && financial) {
          form.hideExpression = false;
        }
        if (form.key === 'department_deadline' && !department) {
          form.hideExpression = true;
        } else if (form.key === 'department_deadline' && department) {
          form.hideExpression = false;
        }
        if (form.key === 'department_group_deadline' && !department_group) {
          form.hideExpression = true;
        } else if (form.key === 'department_group_deadline' && department_group) {
          form.hideExpression = false;
        }
        if (form.key === 'spm_user_id' && !spm) {
          form.hideExpression = true;
        } else if (form.key === 'spm_user_id' && spm) {
          form.hideExpression = false;
        }
      });
    }
    this.modalData.isShow = true;
  }

  handleOk(): void {
    let isRequired = true;
    let message = '';
    let params, id;
    id = '';

    if (this.modalData) {
      id = this.modalData.data['id'];
    }

    params = {
      id: id,
      ...this.modalData.data
    };

    this.modalData.formBase.filter(item => item.required && !item.hideExpression).map(item => {
       if (this.modalData.data[item.key]) {
         return;
       } else {
        isRequired = false;
        message += item.templateOptions.label + ' ';
       }
    });
    if (isRequired) {
      this.submit.emit({code: 0, value: params, modelName: this.modelName});
    } else {
      this.message.error('字段：' + message + '必填');
    }
  }

  // 采购经理备注
  customBigReq = (item: UploadXHRArgs) => {
    return this.uploadService.uploadBig(item, this.objtype, (res) => {
      // console.log(res)
    });
  }

  handleChange({ file, fileList, event}, key): void {
    if (fileList && fileList.length > 0) {
      this.modalData.data[key] = fileList.map(item => {
        if (item.response && item.status === 'done') {
          return {
            id: file.originFileObj.file_id,
            name: file.name,
          };
        } else {
          return item;
        }
      });
    } else {
      this.modalData.data[key] = fileList;
    }
  }

  cancelModal(): void {
    this.modalData.isShow = false;
  }

  onOaSearch(value = '', key = '0') {
    this.optionOaKey = key;
    this.searchOaChange$.next(value);
  }
  onQqSearch(value = '', key = '0') {
    this.optionQqKey = key;
    this.searchQqChange$.next(value);
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
