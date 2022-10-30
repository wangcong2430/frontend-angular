import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef,  ChangeDetectionStrategy, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { UploadService } from '../../../services/upload.service';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { filter } from 'rxjs/operators';
import { CosService } from '../../../services/cos.service';

@Component({
  selector: 'app-modal-demand-detail',
  templateUrl: './demand-detail.component.html',
  styleUrls  : ['./demand-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DemandDetailModalComponent implements OnInit {
  @ViewChild('demandDetail') demandDetail: ElementRef;

  //弹窗相关数据
  isVisible = false
  popLoading = false //pop
  popListLoading = false //pop
  popColumns = [] //pop
  popChildrenColumns = [] //pop
  popList=[] //pop
  popTitle=null //pop
  //分页 pop
  popPagination ={
    total_count: null,
    page_size: '20',
    page_index: '1'
  }

  constructor(
    private http: HttpClient,
    private message: MessageService,
    public uploadService: UploadService,
    public menuService: MenuService,
    private modalService: ModalService,
    public cos: CosService,
    private cd: ChangeDetectorRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    this.modalService.modal$.pipe(filter(item => {
      return item && item['key'] === 'demand' && item['data']['id'];
    })).subscribe(item => {
      this.getPopConfig(item['data']['id'], item['data']['type'])
    });
  }

  // 获取页面配置
  getPopConfig(id:string, type: string) {
    this.popLoading = true;

    this.http.get('web/perf-score/demand-detail', { params: {
      id:id,
      type: type,
    }}).subscribe(result => {
      if(result['code']=='-1'){
        this.message.error(result['msg'])
        this.popLoading          = false;
        return
      }

      result['colum'].forEach(item=>{
        item.show = true
      })
      result['childrenColum'].forEach(item=>{
        item.show = true
      })
      //让子表格默认收起
      result['data'].forEach(item=>{
        item.expand = true
      })
      this.popLoading          = false;
      this.popColumns          = result['colum'];
      this.popChildrenColumns  = result['childrenColum'];
      this.popList             = result['data'];
      this.popTitle            = result['title'];
      this.isVisible = true
      this.cd.markForCheck();
    });
  }

  handleCancel () {
    this.isVisible = false
  }

  handleOk () {
    this.isVisible = false
  }
}
