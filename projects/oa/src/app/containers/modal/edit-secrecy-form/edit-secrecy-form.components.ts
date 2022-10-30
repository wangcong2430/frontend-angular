import { Component, OnInit, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { MessageService } from '../../../services/message.service';
import { ModalService } from '../../../services/modal.service';
import { DownloadService } from '../../../services/download.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-modal-edit-secrecy-form',
  templateUrl: './edit-secrecy-form.components.html',
})

export class EditSecrecyFormModelComponent implements OnInit {
  titleName = "请选择保密范围"
  isVisible = false;
  model = {
    secrecy_codes: [],
    secrecys_detail:[],
    thing_ids:[]
  };
  options: FormlyFormOptions = {
    formState: {
      contractList: []
    }
  };
  fields = [
    {
      fieldGroupClassName: 'row no-gutters',
      fieldGroup: [
        {
          key: 'secrecy_codes',
          type: 'nz-checkbox',
          className: 'ant-col-16 mr-3',
          templateOptions: {
            labelSpan: 8,
            width:600,
            options: [
              {
                label: '需求名称（勾选后所属需求所有物件均对需求名称保密）',
                value: 'story_name',
              },
              {
                label: '需求附件（勾选后所属需求所有物件均对需求附件保密）',
                value: 'story_attach',
              },
              {
                label: '项目名称（勾选后所属需求所有物件均对项目名称保密）',
                value: 'project_name',
              },
              {
                label: '附件及互动（含制作人上传的展示文件、最终作品和过程附件）',
                value: 'upload_attach',
              },
              {
                label: '物件名称',
                value: 'thing_name',
              }
            ]
          }
        },
      ]
      }
  ];

  form = new FormGroup({});


  close() {
    this.isVisible = false;
    this.modal = null;
  }

  
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private modal: ModalService,
    private download: DownloadService,
    private cd: ChangeDetectorRef,
    private modalService: NzModalService,
    
    ) {}
    
    ngOnInit() {
        this.modal.modal$.subscribe(item => {
          if(item['key'] == 'secrecy-form'){
            console.log(item)
          this.model.secrecy_codes = item['data']['init_secrecy'];
          this.model.thing_ids = item['data']['thing_ids'];
          this.model.secrecys_detail = item['data']['secrecys_detail'];
          this.isVisible = true;
        }
      });
    }
  
    submit(){
      let whole_secrecy = this.model['secrecy_codes'].sort().join(",")
      let diff_num = 0;
      for(let i in this.model.secrecys_detail){
          if(whole_secrecy != i){
            diff_num += this.model.secrecys_detail[i].length;
          }
      }
      var warning_msg = "所选择的单据中有"+diff_num.toString()+"个物件的保密范围与当前保密范围不一致，若继续将会重新统一保密配置"

      if(diff_num != 0 && Object.keys(this.model.secrecys_detail).length != 1){
        this.modalService.confirm({
          nzTitle:"保密配置不一致提醒",
          nzContent:warning_msg,
          nzOnOk:()=>{
            this.editBulkThing()
          }
        })
      }else{
        this.editBulkThing()
      }
    }

    editBulkThing(){
      this.http.post('web/thing-secrecy-list/edit-bulk-things-secrecy', {...this.model}).subscribe(result => {
        if(result['code'] != 0){
          this.message.error("不完全一致");
          return;
        }
        if(result['data'] == 'insert'){
          this.message.success("保存成功");
        }else{
          this.message.success("更新成功");
        }
        this.close();
      });
    }
}

