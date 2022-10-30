import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { NzModalService } from 'ng-zorro-antd';
import { forkJoin, of, Subject } from 'rxjs';
import { ModalService } from '../../../services/modal.service';

@Component({
  templateUrl: './recruit.component.html',
  styleUrls: ['./recruit.component.css']
})

export class RecruitComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modal: NzModalService,
    private modalService: ModalService
  ) {}

  isBulletinVisible = false;

  initLoading = false; // bug
  loadingMore = true;
  loaded: Boolean =  false;
  visibleBusinessMembers$ =  new Subject<any>();
  visibleSystemMembers$ =  new Subject<any>();
  // 正在加载中
  loading: Boolean = true;
  // 加载完全部
  loadAll: Boolean = false;
  // 是否有数据
  isData: Boolean = false;
  // 是否有管理员权限
  can: Boolean = false;
  // 管理员的option_id
  can_option_value:number;
  // 创建通知的formly表当
  form = new FormGroup({});
  model: any = {};
  options: FormlyFormOptions = {
    formState: {
      awesomeIsForced: false,
    },
  };


  page_index = 0;

  bulletinObj = {};
  bulletinList = [];
  topList = [];

  queryFields = [];

  fields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'ant-row',
      fieldGroup: [
        {
          key: 'title',
          type: 'nz-input',
          className: 'ant-col-24',
          templateOptions: {
            label: '公告标题',
            nzLayout: 'fixedwidth',
            placeholder: 'Formly is terrific!',
            nzRequired : true,
          },
        },
        {
          key: 'content',
          type: 'rich-text',
          className: 'ant-col-24 mb-2',
          wrappers: ['field-wrapper'],
          templateOptions: {
            label: '公告内容',
            nzLayout: 'fixedwidth',
            placeholder: 'Formly is terrific!',
            nzRequired : true,
          },
        },
        // {
        //   key: 'is_must',
        //   type: 'nz-select',
        //   className: 'ant-col-6',
        //   templateOptions: {
        //     label: '是否必读',
        //     nzPlaceHolder: '是否必读',
        //     nzLayout: 'fixedwidth',
        //     nzValue: 'value',
        //     options: [{
        //       label: '是',
        //       value: '1'
        //     }, {
        //       label: '否',
        //       value: '2'
        //     }],
        //     nzRequired : true,
        //   },
        // },
        // {
        //   key: 'must_time',
        //   type: 'nz-number',
        //   className: 'ant-col-6',
        //   templateOptions: {
        //     label: '必读时长',
        //     nzPlaceHolder: '必读时长',
        //     nzLayout: 'fixedwidth',
        //     nzRequired : true
        //   },
        //   hideExpression: 'model.is_must !== "1"'
        // },
        // {
        //   key: 'must_effective_time',
        //   type: 'date-picker',
        //   className: 'ant-col-12',
        //   templateOptions: {
        //     label: '必读有效期',
        //     nzPlaceHolder: '必读有效期',
        //     nzLayout: 'fixedwidth',
        //     nzRequired : true,
        //     nzShowTime: true,
        //     nzFormat: 'yyyy-MM-dd HH:mm:ss',
        //   },
        //   hideExpression: 'model.is_must !== "1"'
        // },
        {
          key: 'type',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '公告类型',
            nzPlaceHolder: '公告类型',
            nzLayout: 'fixedwidth',
            nzValue: 'value',
            options: [{
              label: '管理公告',
              value: '1'
            }, {
              label: '招募公告',
              value: '2'
            }, {
              label: '系统公告',
              value: '3'
            }],
            nzRequired : true
          },
        },

        {
          key: 'is_top',
          type: 'nz-radio',
          className: 'ant-col-12',
          templateOptions: {
            label: '是否置顶',
            nzLayout: 'fixedwidth',
            nzPlaceHolder: '是否置顶',
            nzRequired : true,
            nzValue: 'value',
            options: [{
              label: '置顶',
              value: '1'
            }, {
              label: '不置顶',
              value: '2'
            }],
          },
        },
        // {
        //   key: 'top_time',
        //   type: 'date-picker',
        //   className: 'ant-col-12',
        //   templateOptions: {
        //     label: '置顶有效期',
        //     nzPlaceHolder: '置顶有效期',
        //     nzLayout: 'fixedwidth',
        //     nzRequired : true,
        //     nzShowTime: true,
        //     nzFormat: 'yyyy-MM-dd HH:mm:ss',
        //   },
        //   hideExpression: 'model.is_top !== "1"'
        // },
        {
          key: 'inside_permission_limit_department_ids',
          type: 'nz-tree-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '可见范围',
            nzPlaceHolder: '可输入关键字搜索',
            nzLayout: 'fixedwidth',
            mzMultiple:true,
            nzShowLine:true,
            nzDropdownStyle:{'max-heith': '400px'},
            nzDropdownMatchSelectWidth:false,
            nzDisplayWith: (node) => node.title
          },
        },
        {
          key: 'inside_permission_ids',
          className: 'ant-col-24',
          type: 'nz-select',
          templateOptions: {
            label: '品类',
            nzMode: 'multiple',
            nzValue: 'value',
            nzLayout: 'fixedwidth',
          },
        },
        {
          fieldGroupClassName: 'd-flex flex-row justify-content-start',
          className: 'ant-col-24',
          fieldGroup: [

            {
              key: 'inside_permission_limit_visible_member',
              type: 'nz-select',
              className: 'ant-col-12',
              templateOptions: {
                label: '需求方可见',
                nzMode: 'multiple',
                nzValue: 'value',
                nzLayout: 'fixedwidth',
                onModelChange:($event) => {
                  this.visibleBusinessMembers$.next($event);
                }
              },
              lifecycle:{
                onInit: (form,field,model,options) => {
                  setTimeout(() => {
                    this.visibleBusinessMembers$.next(model.inside_permission_limit_visible_member);
                  }, 0);
                }
              }
            },
            {
              key: 'inside_permission_limit_must_member',
              type: 'nz-select',
              className: 'ant-col-12',
              templateOptions: {
                label: '必读角色',
                nzMode: 'multiple',
                nzValue: 'value',
                nzLayout: 'fixedwidth',
              },
              lifecycle:{
                onInit: (form,field,model,options) => {
                  this.visibleBusinessMembers$.subscribe(item=>{
                    if(typeof(item) !== 'object'){
                      return;
                    }
                    let business_members = options.formState.business_members.filter(member=>{
                      return item.indexOf(member['value']) != -1
                    });
                    field.templateOptions.options = business_members;

                    if(this.model.inside_permission_limit_must_member){
                        this.model.inside_permission_limit_must_member = this.model.inside_permission_limit_must_member.filter(member=>{
                          return item.indexOf(member) != -1
                        });
                        field.formControl.setValue(this.model.inside_permission_limit_must_member);
                    }
                  })
                }
              }
            },
          ]
        },

        {
          fieldGroupClassName: 'd-flex flex-row justify-content-start',
          className: 'ant-col-24',
          fieldGroup: [
            {
              key: 'contracted_supplier',
              type: 'nz-checkbox',
              className: 'ant-col-8',
              templateOptions: {
                label: '签约供应商',
                type: 'isBoolean',
                nzLayout: 'fixedwidth',
              },
            },
            {
              key: 'contracted_supplier_limit_must_time',
              type: 'nz-number',
              className: 'ant-col-6',
              templateOptions: {
                label: '必读时长(秒)',
                nzPlaceHolder: '必读时长',
                nzLayout: 'fixedwidth',
              },
              hideExpression: '!model.contracted_supplier'
            },
            {
              template: '(如没有填写，则签约供应商对该公告仅可见)',
              className: 'text-center ant-col-10 red m-2',
              hideExpression: '!model.contracted_supplier'
           },
          ]
        },
        {
          key: 'contracted_supplier_ids',
          type: 'nz-select',
          className: 'ant-col-24',
          templateOptions: {
            label: '品类',
            nzValue: 'value',
            nzMode: 'multiple',
            options: [],
            nzRequired : true,
          },
          hideExpression: '!model.contracted_supplier'
        },

        {
          fieldGroupClassName: 'd-flex flex-row justify-content-start',
          className: 'ant-col-24',
          fieldGroup: [
            {
              key: 'registered_supplier',
              type: 'nz-checkbox',
              className: 'ant-col-8',
              templateOptions: {
                label: '注册供应商',
                type: 'isBoolean',
                nzLayout: 'fixedwidth',
              },
            },
            {
              key: 'registered_supplier_limit_must_time',
              type: 'nz-number',
              className: 'ant-col-6',
              templateOptions: {
                label: '必读时长(秒)',
                nzPlaceHolder: '必读时长',
                nzLayout: 'fixedwidth',
              },
              hideExpression: '!model.registered_supplier'
            },
            {
              template: '(如没有填写，则注册供应商对该公告仅可见)',
              className: 'text-center ant-col-10 red m-2',
              hideExpression: '!model.registered_supplier'
           },
          ]
        },
        {
          fieldGroupClassName: 'd-flex flex-row justify-content-start',
          className: 'ant-col-24',
          fieldGroup: [
            {
              key: 'is_sign_up',
              type: 'nz-checkbox',
              className: 'ant-col-6',
              templateOptions: {
                label: '新增按钮',
                type: 'isBoolean',
                nzLayout: 'fixedwidth',
                nzLabelTip:'此按钮将显示在公告接收页面“确定”按钮右侧',
              },
            },
            {
              key: 'button_name',
              type: 'nz-input',
              className: 'ant-col-8',
              templateOptions: {
                label: '',
                nzPlaceHolder: '请输入按钮名称，不超过6个字',
                nzLayout: 'fixedwidth',
                maxLength: 6,
                nzRequired : true,
                disabled:!this.model.is_sign_up
              },
              expressionProperties: {
                'templateOptions.disabled': '!model.is_sign_up',
              },
              // hideExpression: '!model.is_sign_up'
            }
          ]
        },
        {
          fieldGroupClassName: 'd-flex flex-row justify-content-start',
          className: 'ant-col-24',
          fieldGroup: [
            {
              key: 'is_external_link',
              type: 'nz-checkbox',
              className: 'ant-col-6',
              templateOptions: {
                label: 'WBP外部链接',
                type: 'isBoolean',
                nzLayout: 'fixedwidth',
                nzLabelTip:'公告接收者点击上方新增的按钮可直接打开此链接'
              },
              hideExpression: '!model.is_sign_up'
            },
            {
              key: 'external_link',
              type: 'nz-input',
              className: 'ant-col-8',
              templateOptions: {
                label: '',
                nzPlaceHolder: '请输入链接',
                nzLayout: 'fixedwidth',
                nzRequired : true,
                disabled:!this.model.is_external_link
              },
              expressionProperties: {
                'templateOptions.disabled': '!model.is_external_link',
              },
              hideExpression: '!model.is_sign_up'
            }
          ]
        },
        {
          fieldGroupClassName: 'd-flex flex-row justify-content-start',
          className: 'ant-col-24',
          fieldGroup: [

            {
              key: 'system_permission_limit_visible_member',
              type: 'nz-select',
              className: 'ant-col-12',
              templateOptions: {
                label: '其它可见方',
                nzMode: 'multiple',
                nzValue: 'value',
                nzLayout: 'fixedwidth',
                onModelChange:($event) => {
                  //管理员的optionid,不能移除
                  let admin_options_id = this.can_option_value;
                  if($event.indexOf(admin_options_id) === -1){
                    this.message.warning('管理员身份不允许移除');
                    $event.unshift(admin_options_id);
                  }
                  this.visibleSystemMembers$.next($event);
                }
              },
              lifecycle:{
                onInit: (form,field,model,options) => {
                  setTimeout(() => {
                    this.visibleSystemMembers$.next(model.system_permission_limit_visible_member);
                  }, 0);
                }
              }
            },
            {
              key: 'system_permission_limit_must_member',
              type: 'nz-select',
              className: 'ant-col-12',
              templateOptions: {
                label: '可见方必读',
                nzMode: 'multiple',
                nzValue: 'value',
                nzLayout: 'fixedwidth',
              },
              lifecycle:{
                onInit: (form,field,model,options) => { 
                  this.visibleSystemMembers$.subscribe(item=>{
                    if(typeof(item) !== 'object'){
                      return;
                    }
                    let system_members = options.formState.system_members.filter(member=>{
                      return item.indexOf(member['value']) != -1
                    });
                    field.templateOptions.options = system_members;

                    if(this.model.system_permission_limit_must_member){
                      this.model.system_permission_limit_must_member = this.model.system_permission_limit_must_member.filter(member=>{
                        return item.indexOf(member) != -1
                      });
                      field.formControl.setValue(this.model.system_permission_limit_must_member);
                  }
                  })
                }
              }
            },
          ]
        },
        {
          key: 'publish_time',
          type: 'date-picker',
          className: 'ant-col-24',
          templateOptions: {
            label: '发布时间',
            nzPlaceHolder: '发布时间',
            nzShowTime: true,
            nzFormat: 'yyyy-MM-dd HH:mm:ss',
            nzLayout: 'fixedwidth',
            nzRequired : true,
          },
        },
        {
          key: 'effective_time',
          type: 'date-picker',
          className: 'ant-col-24',
          templateOptions: {
            label: '有效时间',
            nzPlaceHolder: '公告截止时间',
            nzShowTime: true,
            nzFormat: 'yyyy-MM-dd HH:mm:ss',
            nzLayout: 'fixedwidth',
            nzRequired : true,
          },
        },
        {
          key: 'attachment_id',
          type: 'create-demand-upload-component',
          className: 'ant-col-24',
          templateOptions: {
            label: '上传附件',
            nzLayout: 'fixedwidth',
            nzLimit: 1,
            nzMultiple: false,
            options: [],
            key: '1410'
          },
        },
        {
          key: 'video_id',
          type: 'create-demand-upload-component',
          className: 'ant-col-24',
          templateOptions: {
            label: '上传视频',
            nzLayout: 'fixedwidth',
            type: 'video',
            nzLimit: 1,
            nzMultiple: false,
            options: [],
            key: '1420'
          },
        },
      ]
    },

  ];

  // return model['uploadFile'] && model['uploadFile']['file_name'] ? [{
  //   status: 'done',
  //   name: model['uploadFile'] && model['uploadFile']['file_name'] ? model['uploadFile']['file_name'] : ''
  // }] : null

  ngOnInit(): void {
    this.getData();
  }

  getData (title = '') {
    this.initLoading = true;
    this.loading = true;
    forkJoin(
      this.http.get('web/bulletin/config'),
      this.http.get('web/bulletin/list', {params: {is_top: '1', title: title,'type':'2'}}),
      this.http.get('web/bulletin/list', {params: {page_index: '1', page_size: '10', title: title,'type':'2'}}),
    ).subscribe(item => {
      const [config, topList, bulletinList] = item;
      this.topList = topList['list'];
      // 判断是否有数据
      if ((topList['code'] === 0 && topList['list'].length > 0)
          || (bulletinList['code'] === 0 && Number( bulletinList['pager']['itemCount'] ) > 0)) {
        this.isData = true;
      }

      if (bulletinList['code'] === 0) {
        if (Array.isArray(this.queryFields) && this.queryFields.length === 0) {
          this.queryFields = config['form'];
        }

        this.bulletinObj = bulletinList['list'];
        this.page_index = bulletinList['pager']['page'];
        this.bulletinList = this.getObject(this.bulletinObj);
        // 判断是否是最后一页
        if (Number(bulletinList['pager']['page']) * Number(bulletinList['pager']['pageSize'])
              >= Number(bulletinList['pager']['itemCount'])) {
          this.loaded = true;
          this.loadAll = true;
        }

      }
      this.can = bulletinList['can'];
      this.initLoading = false;
      this.loading = false;
    });
  }

  getObject(object) {
    const values = [];
    for (const property in object) {
      if (property) {
        values.push({
          year: property,
          children: object[property]
        });
      }
    }
    return values.sort((a, b) => b.year - a.year);
  }

  onLoadMore(): void {
    this.loadingMore = true;
    this.loading = true;
    this.http.get('web/bulletin/list', { params: {
      'page_index': (Number(this.page_index) + 1).toString(),
      'page_size': '10',
      'type':'2'
    }}).subscribe((res: any) => {
      if (res.code === 0) {
        for (const item in res.list) {
          if (Object.getOwnPropertyDescriptor(this.bulletinObj, item) && res.list[item].length > 0) {
            this.bulletinObj[item] = this.bulletinObj[item].concat(...[res.list[item]]);
          } else {
            this.bulletinObj[item] = res.list[item];
          }
        }
        this.bulletinList = this.getObject(this.bulletinObj);
        this.page_index = res.pager.page;

        if (Number(res['pager']['page'])  * Number(res['pager']['pageSize']) >= Number(res['pager']['itemCount'])) {
          this.loaded = true;
          this.loadAll = true;
        }
      }
      this.loading = false;
      this.loadingMore = false;
    });
  }

  edit(item: any): void {
    this.message.success(item.email);
  }

  viewMore (data, isVisible) {
    data.showMore = isVisible;
    if (!(data.bulletinBrowsingHistory && data.bulletinBrowsingHistory.id) && data.is_read !== '1') {
      data.is_read = '1';
      this.http.post('/web/bulletin-browsing-history/add', {
        bulletin_id: data.id
      }).subscribe((res: any) => {
        console.log(res);
      });
    }
  }

  // 取消
  handleCancel () {
    this.isBulletinVisible = false;
  }

  // 确认
  handleOk () {
    if(!this.model.is_sign_up){
      this.model.is_external_link = false
    }
    this.http.post('web/bulletin/save', this.model ).subscribe(res => {
      if (res['code'] === 0) {
        this.model = {};
        this.isBulletinVisible = false;
        this.message.success(res['msg']);
        this.getData();
      } else {
        this.message.error(res['msg']);
      }
    });
  }
   //点击报名
   onSignup(id,is_external_link,external_link,index){
    if(is_external_link){
      window.open(external_link)
      this.topList[index].is_sign_up_button= false
    }else{
      this.http.get('web/bulletin/sign-up?id='+id).subscribe(res=>{
        if(res['code']==0){
          this.message.success(res['msg'])
          this.topList[index].is_sign_up_button= false
        }else{
          if(res['code']==-2){
            this.topList[index].is_sign_up_button= false
          }
          this.message.error(res['msg'])
        }
      })
    }
    
  }
  // 新建通知
  addBulletin (data = null) {
    let is_new:boolean;
    // 如果id不存在,则是创建, 如果存在则是编辑
    if (data && data['id']) {
      this.model = Object.assign({}, data);
      is_new = false;
    } else if (!data) {
      is_new = true;
      this.model = {};
    }

    this.http.get('web/bulletin/get-all-category', {
      params: {
        id: data && data['id'] ? data['id'] : null
      }
    }).subscribe(res => {
      let inside_permission_limit_department_ids = this.fields[0].fieldGroup.find(item=>{return item.key=="inside_permission_limit_department_ids"});
      inside_permission_limit_department_ids.templateOptions.nzNodes = res['deptCoaTree'];
      
      let inside_permission_ids = this.fields[0].fieldGroup.find(item=>{return item.key=="inside_permission_ids"});
      inside_permission_ids.templateOptions.options = res['top_category'];
      
      let inside_permission_limit_visible_member = this.fields[0].fieldGroup[6].fieldGroup.find(item=>{return item.key=="inside_permission_limit_visible_member"});
      inside_permission_limit_visible_member.templateOptions.options = res['business_members'];
      
      let contracted_supplier_ids = this.fields[0].fieldGroup.find(item=>{return item.key=="contracted_supplier_ids"});
      contracted_supplier_ids.templateOptions.options = res['all_category'];
      
      let system_permission_limit_visible_member = this.fields[0].fieldGroup[12].fieldGroup.find(item=>{return item.key=="system_permission_limit_visible_member"});
      system_permission_limit_visible_member.templateOptions.options = res['system_members'];
      this.can_option_value = res['system_members'].find((item)=>{return item.label == '管理员'}).value;
      
      this.options.formState.business_members = res['business_members'];
      this.options.formState.system_members = res['system_members'];
      // this.options.formState.deptCoaTree = res['deptCoaTree'];
      this.options.formState.top_category = res['top_category'];

      const attachment_id = this.fields[0].fieldGroup.find(item => item.key === 'attachment_id');

      if (this.model.attachment_id) {
        attachment_id.templateOptions.options = [{
          name: this.model.uploadFile.file_name,
          type: this.model.uploadFile.file_type
        }];
      } else {
        attachment_id.templateOptions.options = [];
      }

      const video_id = this.fields[0].fieldGroup.find(item => item.key === 'video_id');

      if (this.model.video_id) {
        video_id.templateOptions.options = [{
          name: this.model.uploadVideo.file_name,
          type: this.model.uploadVideo.file_type
        }];
      } else {
        video_id.templateOptions.options = [];
      }

      if(is_new === true){
        let initData = this.defaultInitData();
        this.model = Object.assign({}, initData);
      }
      this.isBulletinVisible = true;
    });

  }
  //新建公告时的默认数据
  defaultInitData(){
    var data = {};
    data['inside_permission_limit_department_ids'] = ['all-0'];
    data['inside_permission_ids'] = ['all-0'];
    data['inside_permission_limit_visible_member'] = this.options.formState.business_members.map((item)=>{return item.value});
    data['inside_permission_limit_must_member'] = this.options.formState.business_members.map((item)=>{return item.value});
    data['system_permission_limit_visible_member'] = this.options.formState.system_members.map((item)=>{return item.value});
    data['system_permission_limit_must_member'] = this.options.formState.system_members.map((item)=>{return item.value});
    return data;
  }

  simplify (html) {
    if (!html) {
      return ''
    }

    let value = html.replace(/<[^>]+>/g, '').replace(/(&nbsp;)*/g, "")
    return value.length > 120 ?  value.slice(0, 120) + '...' : value;
  }

  // 编辑公告
  editBulletin (data: string) {
    this.addBulletin(data);
  }

  // 删除公告
  delBulletin (id: string) {
    this.modal.confirm({
      nzTitle: '请问要是否要删除这条公告',
      nzOnOk: () => {
        this.http.post('web/bulletin/delete ', {
          bulletin_id: id
        }).subscribe(res => {
          if (res['code'] === 0) {
            this.message.success(res['msg']);
            this.getData();
          } else {
            this.message.error(res['msg']);
          }
        });
      }
    });
  }

  // 图片预览
  lookPicture ($event, data) {
    $event.stopPropagation();
    this.modalService.open('photo', {
      title: data.uploadFile.file_name,
      url: data['uploadFile']['file_path']
    });
  }

  submitSearchForm(data): void {
    if (data['code'] === 0) {
      this.getData(data['value']['title']);
    }
  }

  isBefore (date) {
    return new Date() < new Date(date);
  }

  preview () {
    this.modalService.open('bulletin', this.bulletinList[0].children);
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
