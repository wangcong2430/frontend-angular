import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';

@Component({
  templateUrl: './role.component.html',
  styles: [
    `
    :host ::ng-deep .ant-card-body{
      padding: 12px;
    }

    :host ::ng-deep .ant-table-thead > tr > th {
      background-color: #E8EFFB;
      font-family: PingFangSC-Regular;
      font-weight: 400;
      font-size: 14px;
      color: rgba(0,0,0,0.90);
      line-height: 22px;
    }


    :host ::ng-deep  .ant-table-thead > tr > th.ant-table-column-has-actions.ant-table-column-has-sorters:hover {
      background-color: #0052D9;
      color: white;
    }

    :host ::ng-deep .ant-table-thead > tr > th .ant-table-column-sorter .ant-table-column-sorter-inner-full {
      color: white;
    }

    :host ::ng-deep .ant-table-thead > tr > th .ant-table-column-sorter .ant-table-column-sorter-inner .ant-table-column-sorter-up.on,
    :host ::ng-deep .ant-table-thead > tr > th .ant-table-column-sorter .ant-table-column-sorter-inner .ant-table-column-sorter-down.on {
      color: #ccc;
    }

    :host ::ng-deep .ant-table-thead > tr > th, .ant-table-tbody > tr > td {
      padding: 10px;
    }

    :host ::ng-deep .config-field .ant-checkbox-wrapper + .ant-checkbox-wrapper {
      margin-left: 0px;
    }

    ::ng-deep .config-field .ant-checkbox-wrapper {
      min-width: 162px;
    }

    `
  ]
})

export class RoleComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private message: MessageService,
  ) {}
  // loading
  loading = false;
  listLoading = false;

  sortName: string | null = null;
  sortValue: string | null = null;

  can = false;

  disabled = false;

  roles;
  limit;
  options;

  isConfigVisible;
  configList;
  group_id;
  column;
  type;
  item_name;

  ngOnInit() {
    this.loading = true;
    this.getConfig();
  }


  getConfig() {
    const loading = this.message.loading('加载数据中...', { nzDuration: 0 }).messageId;
    this.http.get('/web/statistics/role-data-config').subscribe(result => {
      this.loading = false;
      this.message.remove(loading);
      if (result['code'] == 0) {
        this.roles = result['data']['roles'];
        this.limit = result['data']['limit'];
        this.options = result['data']['options'];

        this.roles.forEach(role => {
          role.children = this.options.map(res => {
            let value = false;
            let indeterminate = false;
            if (this.limit.some(item => item.value == role.value)) {
              if (this.limit.find(item => item.value == role.value).permissions.indexOf(res.value) > -1) {
                value = true;
              }
              if (this.limit.find(item => item.value == role.value).indeterminate.indexOf(res.value) > -1) {
                indeterminate = true;
              }
            }
            return {
              label: res.label,
              key: res.value,
              value: value,
              indeterminate: indeterminate
            };
          });
        });
      } else {
        // this.message.error(result['msg'])
      }
    }, err => {
      this.loading = false;
      this.message.remove(loading);
      this.message.error('服务器异常, 请联系管理员');
    });
  }

  edit () {
    this.disabled = false;
  }

  save () {
    this.limit =  this.roles.filter(item => item.children.some(item => item.value)).map(item => {
      return {
        label: item.label,
        value: item.label,
        permissions: item.children.filter(item => item.value).map(item => item.key)
      };
    });
    let loading = this.message.loading('数据正在保存中...', { nzDuration: 0 }).messageId;
    this.http.post('/web/statistics/role-data-save', {
      data: this.limit
    }).subscribe(result => {
      this.message.remove(loading);
      if (result['code'] == 0) {
        this.disabled = !this.disabled;
        this.message.success(result['msg']);
        this.getConfig();
      } else {
        this.message.error(result['msg']);
      }
    }, err => {
      this.loading = false;
      this.message.remove(loading);
      this.message.error('服务器异常, 请联系管理员');
    });
  }

  // 获取角色配置
  roleConfig (option, type) {
    let params;
    this.type = type;
    if (type === 'role') {
      params  = {
        group_id:   option.value
      };
      this.group_id = option.value;
    } else {
      params  = {
        item_name:  option.value
      };
      this.item_name = option.value;

    }


    this.group_id = option.value;
    const loadingId = this.message.loading('加载数据中...', { nzDuration: 0 }).messageId;
    this.http.get('/web/statistics/field-config', {
      params: params
    }).subscribe(result => {
      this.message.remove(loadingId);
      if (result['code'] == 0) {
        this.isConfigVisible = true;
        this.configList = result['data'];
      }
    }, err => {
      this.message.remove(loadingId);
      this.message.error(err);
    });
  }

  // 角色提交
  roleFieldSubmit () {
    const loadingId = this.message.loading('加载数据中...', { nzDuration: 0 }).messageId;
    this.http.post('/web/statistics/role-field-submit', {
      item_name:  this.item_name,
      columns: this.configList
    }).subscribe(result => {
      this.message.remove(loadingId);
      if (result['code'] == 0) {
        this.isConfigVisible = false;
        this.type == '';
        this.message.success(result['msg']);
        this.getConfig();
      } else {
        this.message.error(result['msg']);
      }
    }, err => {
      this.message.remove(loadingId);
      this.message.error(err['msg']);
    });
  }

  // 限制配置
  groupFieldSubmit () {
    const loadingId = this.message.loading('加载数据中...', { nzDuration: 0 }).messageId;
    this.http.post('/web/statistics/group-field-submit', {
      group_id:  this.group_id,
      columns: this.column
    }).subscribe(result => {
      this.message.remove(loadingId);
      if (result['code'] == 0) {
        this.isConfigVisible = false;
        this.type == '';
        this.message.success(result['msg']);
        this.getConfig();
      } else {
        this.message.error(result['msg']);
      }
    }, err => {
      this.message.remove(loadingId);
      this.message.error(err['msg']);
    });
  }

  updateAllChecked(item): void {
    item.indeterminate = false;
    if (item.checked) {
      item.children = item.children.map(item => {
        return {
          ...item,
          checked: true
        };
      });
    } else {
      item.children = item.children.map(item => {
        return {
          ...item,
          checked: false
        };
      });
    }

    this.getCheckValue(item);
  }

  updateSingleChecked($event, item): void {
    if (item.children.every(item => item.checked === false)) {
      item.checked = false;
      item.indeterminate = false;
    } else if (item.children.every(item => item.checked === true)) {
      item.checked = true;
      item.indeterminate = false;
    } else {
      item.indeterminate = true;
    }

    this.getCheckValue(item);
  }

  getCheckValue (item) {
    this.column =  this.configList.map(item => {
      return item.children.filter(res => res.checked === true).map(res => res.key).toString()
    }).filter(item => item.length > 0).toString();
  }

  configCancel () {
    this.isConfigVisible = false;
    this.type == '';
  }

  configOk () {
    this.isConfigVisible = false;
    if (this.type == 'role' ) {
      this.groupFieldSubmit();
    } else {
      this.roleFieldSubmit();
    }
  }
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
