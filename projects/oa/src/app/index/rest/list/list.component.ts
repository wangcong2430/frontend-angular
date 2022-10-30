import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, Subject } from 'rxjs';
import { RestLinkService } from '../../../services/rest-link.service';
import { FormService } from '../../../services/form.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import { MenuService } from '../../../services/menu.service';
import { MessageService } from '../../../services/message.service';


@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  user;
  data;
  title;
  loading = true;
  pagination = {
    previous_text: 'previous',
    next_text: 'next',
    total_count: null,
    page_size: null,
    page_index: '1',
  };

  query = {
    page: 1,
    'per-page': null,
  };

  form = new FormGroup({});
  update_form = new FormGroup({});
  options: FormlyFormOptions = {};
  queryFields: FormlyFieldConfig[];

  modelClass = 'FaultInfluenceType';
  columns;
  is_sync;
  btns = {};

  modalRef: BsModalRef;
  link_name_map;

  formData;
  formFields: FormlyFieldConfig[];

  // Model
  modelSubject = new Subject<void>();
  isVisible = false;
  isOkLoading = false;

  isCollapse = true;
  isCheckAll = true;
  isCheckReverse = true;
  needSearch = true;
  openModalTitle = "标题";
  isAdd = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private message: MessageService,
    private restLinkService: RestLinkService,
    private translate: TranslateService,
    private formService: FormService,
    private menuService: MenuService
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.modelClass = params['modelClass'];
      let url;
      if (this.router.url) {
        url = this.router.url.split('?')[0];
      }
      if (typeof(url) !== 'string') {
        url = this.router.url;
      }
      if (this.menuService.menu_has_names && this.menuService.menu_has_names[url]) {
        this.menuService.curr_menu = this.menuService.menu_has_names[url];
        this.menuService.change();
      }

      if (!this.link_name_map) {
        this.restLinkService.link_name_map.subscribe(link_name_map => {
          this.link_name_map = link_name_map;
          this.title = link_name_map[params['modelClass']];
        });
      } else {
        this.title = this.link_name_map[params['modelClass']];
      }

      forkJoin([
        this.translate.get('previous'),
        this.translate.get('next'),
        this.http.get('web/rest/config', {
          params: {
            'modelClass': this.modelClass
          },
        })
      ]).subscribe(results => {
        this.initCrumbHeadMenu(this.modelClass);
        const [previous_text, next_text, config] = results;
        this.pagination.previous_text = previous_text;
        this.pagination.next_text = next_text;
        this.queryFields = config['search_form'];
        this.columns = config['columns'];
        this.formFields = config['form'];
       
    
        this.is_sync = config['sync'];
        this.btns = config['btns'];

        for (const item of this.formFields) {


         
          // if(item.templateOptions && item.key === 'require_desc'){
          //   item['templateOptions'].modelClass = this.modelClass;
          //   item['templateOptions'].target = 'require_desc';
          //   item['templateOptions'].getUrl = '';
          // }
          // if(item.templateOptions && item.key === 'attachment_desc'){
          //   item['templateOptions'].modelClass = this.modelClass;
          //   item['templateOptions'].target = 'attachment_desc';
          //   item['templateOptions'].getUrl = '';
          // }
          

          // 监听supplier_id的值，改变自身的下拉选择
          if (item.templateOptions && item.key === 'epo_order_code') {
            item['templateOptions'].modelClass = this.modelClass;
            item['templateOptions'].target = 'supplier_id';
            item['templateOptions'].getUrl = 'web/ajax-check/get-epo-order';
          }

          // 监听epo_order_code, 改变表单中其他元素的值
          if (item.templateOptions && item.key === 'contract_number') {
            item['templateOptions'].modelClass = this.modelClass;
            item['templateOptions'].target = 'epo_order_code';
            item['templateOptions'].getUrl = 'web/ajax-check/get-epo-order-info';
          }

          // 监听username, 改变自身的值，但不用异步请求
          if (item.templateOptions && item.key === 'email') {
            item['templateOptions'].modelClass = this.modelClass;
            item['templateOptions'].target = 'username';
            item['templateOptions'].getUrl = '';
          }

          // 监听category_id, 改变表单中其他元素的值
          if (item.templateOptions && item.key === 'produce_breakdown_id') {
            item['templateOptions'].modelClass = this.modelClass;
            item['templateOptions'].target = 'category_id';
            item['templateOptions'].getUrl = 'web/ajax-check/produce-breakdown-grade';
          }

          // 搜索选择下拉框
          if (item.templateOptions && item.key === 'product_name') {
            item['templateOptions'].modelClass = this.modelClass;
            item['templateOptions'].target = 'product_name';
            item['templateOptions'].searchUrl = 'web/pull-coa/name-list';
            item['templateOptions'].getUrl = '';
            item['templateOptions'].option = [];
          }

          if (item.templateOptions && item.key === 'parent_project_no') {
            item['templateOptions'].modelClass = this.modelClass;
            item['templateOptions'].target = 'parent_project_no';
            item['templateOptions'].searchUrl = 'web/pull-parent-project/name-list';
            item['templateOptions'].getUrl = '';
            item['templateOptions'].option = [];
          }

          if (item.templateOptions && item.key === 'vendor_id') {
            item['templateOptions'].modelClass = this.modelClass;
            item['templateOptions'].target = 'vendor_id';
            item['templateOptions'].searchUrl = 'web/pull-vendor/name-list';
            item['templateOptions'].getUrl = 'web/pull-vendor/vendor-address';
            item['templateOptions'].option = [];
          }
        }


        this.formService.formEvent(this.formFields, this.modelSubject).subscribe(([field, response]) => {
          console.log(this.formFields)
          console.log(this.modelSubject)
          if (response['body']['code'] === -1) {
            return;
          }
          if (field.key === 'require_desc') {
         
          }
          if (field.key === 'epo_order_code') {
            field.templateOptions.options = response.body['data'];
          }
          if (field.key === 'contract_number') {
            field.formControl.setValue(response.body['data']['contract_number']);
            this.formFields[3].templateOptions.options = response.body['data']['currency_code'];
            this.formFields[3].formControl.setValue(response.body['data']['currency_code'][0]['value']);
            this.formFields[4].templateOptions.options = response.body['data']['org_info'];
            this.formFields[4].formControl.setValue(response.body['data']['org_info'][0]['value']);
            this.formFields[6].formControl.setValue(response.body['data']['date_range']);
          }

          if (field.key === 'email') {
            field.formControl.setValue(response + '@tencent.com');
          }

          if (field.key === 'produce_breakdown_id') {
            if (response.body['code'] === 0) {
              field.templateOptions.options = response.body['data']['produceBreakdownList'];

              const produceGradeId = this.formFields.find(res => res.key === 'produce_grade_id');
              produceGradeId['templateOptions']['options'] = response.body['data']['produceGradeList'];
            }
          }

          if (field.key === 'product_name' && field.templateOptions.option) {
            field.templateOptions.option.forEach((v, index) => {
              if (v.coa_code === response) {
                field.formControl.parent.get('product_code').setValue(v['coa_code']);
                  if ( field.formControl.parent.get('costcenter_name') ) {
                    field.formControl.parent.get('costcenter_name').setValue(v['costcenter_name']);
                  }
                  if (field.formControl.parent.get('department_name')) {
                    field.formControl.parent.get('department_name').setValue(v['dept_name']);
                }
              }
            });
          }

          if (field.key === 'parent_project_no' && field.templateOptions.option) {
            field.templateOptions.option.forEach((v, index) => {
              if (v.value === response) {
                if (field.formControl.parent.get('department_name')) {
                  field.formControl.parent.get('department_name').setValue(v['dept_name']);
                }
              }
            });
          }

          if (field.key === 'vendor_id' && field.templateOptions.option) {
            if (field.formControl.parent.get('address') ) {
              field.formControl.parent.get('address').setValue(response.body['data']['address']);
            }

            if (field.formControl.parent.get('city')) {
              field.formControl.parent.get('city').setValue(response.body['data']['city']);
            }
          }


        });
      });

      this.route.queryParams.subscribe(params => {
        this.query = JSON.parse(JSON.stringify(params));
        if (this.query.page) {
          this.query.page = +this.query.page;
        }
        this.getList();
      });
    });

    this.user = JSON.stringify(this.route.snapshot.data['user'], null, 4);
  }
  ngOnChanges(){
   
    
  }
  //自定义crumb的标题名
  initCrumbHeadMenu(modelClass){
    //工作量不需要”全选", ”反选“
    if(this.modelClass == 'WorkloadUnit'){
      this.isCheckAll = false;
      this.isCheckReverse = false;
      this.needSearch = false;
      this.isAdd = true;
    }else{
      this.isCheckAll = true;
      this.isCheckReverse = true;
      this.needSearch = true;
      this.isAdd = true;
    }

    //制作等级要显示新建按钮
    if (this.modelClass == 'ProduceGrade' ||  this.modelClass == 'ProduceBreakdown' ) {
      this.isAdd = true;
    }
  }
  getList() {
    this.loading = true;
    this.http.post('web/rest', paramsFilter(this.query), {
      params: {
        'modelClass': this.modelClass
      },
      observe: 'response',
    }).subscribe(response => {
      console.log(response);
      this.loading = false;
      this.data = response.body;
      this.pagination.total_count = response.headers.get('x-pagination-total-count');
      this.query['per-page'] = response.headers.get('x-pagination-per-page');
    });
  }

  search(page = 1) {
    this.query.page = page;
    // 是否国外做判断，避免传值Object
    if (this.query['is_abroad'] !== undefined) {
      if (typeof this.query['is_abroad'] === 'object') {
        this.query['is_abroad'] = this.query['is_abroad']['value'];
      }
    }
    this.router.navigate([], {
      queryParams: this.query,
    });
  }

  pageChanged($event) {
    this.search($event.page);
  }

  toggleCollapse(): void {
    this.isCollapse = this.queryFields.length > 3 ? !this.isCollapse : this.isCollapse;
  }


  openModal(item) {
    // 如果id存在, 则获取详情
    if (item && item.id) {
      this.http.get('web/rest/view', {
        params: {
          'id': item.id,
          'modelClass': this.modelClass
        },
      }).subscribe(result => {
        const category_id = result['category_id'] + '';
        this.formData = result;
        this.formData['category_id'] = null;
        setTimeout(t => {
          this.formData['category_id'] = category_id;
        }, 100)

        this.isVisible = true;
      });
      this.openModalTitle = "编辑";
    // 否则初始化项目
    } else {
      this.formData = item;
      this.isVisible = true;
      this.openModalTitle = "新建";
    }
  }

  closeModel(): void {
    this.isVisible = false;
    this.isOkLoading = false;
    this.modelSubject.next();
  }

  customDeal(){
      let custom_list = ['WorkloadUnit'];
      let data = this.formData;
      let modelClass = this.modelClass;
      if(custom_list.indexOf(modelClass) != -1){
        if(data['languages'] == null){
          data['languages'] = [{language: 'en-Us', language_text: 'en-Us', title: ''}]
        }
        data['languages'][0]['title'] = data.title_en
      }
  }
  save(form) {
    this.isOkLoading = true;
    //走自定义的保存方法
    this.customDeal();
    if (this.formData.id) {
      this.http.patch('web/rest/update', this.formData, {
        params: {
          'id': this.formData.id,
          'modelClass': this.modelClass
        },
      }).subscribe(result => {
        this.isOkLoading = false;
        if(result['status'] == -1 && result['type'] == 'json'){
          this.message.error(result['msg']);
          return;
        }
        this.isVisible = false;

        this.modelSubject.next();

        this.query['random'] = Math.random();
        this.search();
      });
    } else {
      this.http.post('web/rest/create', this.formData, {
        params: {
          'modelClass': this.modelClass
        },
      }).subscribe(result => {
        this.isOkLoading = false;
        if(result['status'] == -1 && result['type'] == 'json'){
          this.message.error(result['msg']);
          return;
        }
        this.isVisible = false;

        this.modelSubject.next();

        // this.modalRef.hide();
        this.query['random'] = Math.random();
        this.search();
      });
    }
  }

  syncing;

  syncList() {
    this.syncing = true;
    this.http.post('web/rest/sync', this.formData, {
      params: {
        'modelClass': this.modelClass
      },
    }).subscribe(result => {
      this.syncing = false;
      this.query['random'] = Math.random();
      this.search();
    });
  }

  // 页码改变时
  pageIndexChange(page_index) {
    this.pagination.page_index = page_index;
    this.getTableList();
  }

  // 每页显示数改变时
  pageSizeChange(page_size) {
    this.pagination.page_size  = page_size;
    this.pagination.page_index = '1';
    this.getTableList();
  }

  // 获取数据列表
  getTableList() {
    this.getList();
  }

  sort(e) {
    const list = JSON.parse(JSON.stringify(this.data));
    const compare = function (prop, type) {
      return function (obj1, obj2) {
          const val1 = obj1[prop];
          const val2 = obj2[prop];
          if (type === 'descend') {
            return val1 > val2 ? 1 : -1;
          } else {
            return val1 > val2 ? -1 : 1;
          }
      };
    };
    this.data = [];
    list.sort(compare(e.key, e.value));
    this.data = list;
  }
  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
