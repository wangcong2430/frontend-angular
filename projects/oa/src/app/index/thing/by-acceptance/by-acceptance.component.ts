import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { AcceptanceRateComponent } from '../../../containers/modal/acceptance-rate/acceptance-rate.component';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { UploadsService } from '../../../services/uploads.service';
import { toNumber, UploadXHRArgs } from 'ng-zorro-antd';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import { CosService } from '../../../services/cos.service';

@Component({
  templateUrl: './by-acceptance.component.html',
})

export class ByAcceptanceComponent implements OnInit {
  @ViewChild(AcceptanceRateComponent)
  private acceptanceRateModal: AcceptanceRateComponent;
  // loading
  loading = true;
  listLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  isNewAcceptance = false;
  queryFields = [];
  disabledButton = true;
  // 数据列表
  list = [];
  expands = {}; // 展开项
  isVisible = false; // 驳回弹出框
  reason = ''; // 驳回原因
  endMakeReason = ''
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  // 通过程度
  pass_degree = {};
  // 评分相关变量
  acceptanceScore = [];
  acceptanceScoreTemp = [];
  optionsNogood=[]
  optionsSuccess=[]
  optionsGood=[]
  newVersion=null;
  // 筛选
    searchFormData = {
    ...getUrlParams()
  };
  isIhubTo = false;
  ihubCode = null;

  hubData = {
    arthub: {
      jumpUrl: '',
      num: 0
    },
    ihub: {
      jumpUrl: '',
      num: 0
    }
  };

  formatterPercent = (value: number) => {
    return value ? `${value} %` : value
  };

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService,
    private modalService: ModalService,
    private uploadsService: UploadsService,
    public cos: CosService
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
    this.getList();

    this.getHubHref();

    this.modalService.complete$.subscribe(item => {
      if (item['key'] === 'thing') {
        this.getList();
      }

      if (item && item['key'] === 'thing-label') {
        const obj = {};
        const list = item['data']['list'];
        list.forEach(data => {
          if (data.thing_id) {
            data.thing_id.forEach(id => {
              obj[id] = data;
            });
          }
        });

        this.list.forEach(data => {
          if (data.children) {
            data.children.forEach(children => {
              if (obj[children.id]) {
                children.attribute_check = children.attribute_check.map((attribute, index) => {
                  const val = obj[children.id].attribute_check.find(item => item.id === attribute.id).value;
                  return {
                    ...attribute,
                    value: val ? val : attribute.value
                  };
                });
              }
            });
          }
        });
       }
    });
  }

  // 获取arthub地址
  getHubHref() {
    this.http.get('/web/thing/arthub-jump-link',{
      params: {
        source: 'oa',
        current_workflow: '11010'
      }
    }).subscribe(result => {
      if (result['code'] === 0) {
        this.hubData = result['data'];
      } else {
        this.message.error(result['msg'] || '网络异常, 请稍后再试');
      }
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

// 筛选
  submitSearchForm(value): void {
    if (value['code'] === 0) {
      this.searchFormData = value['value'];
      this.pagination.page_index = '1';
      this.getList();
    }
  }

  selectPass ($event) {
    this.pass_degree[$event.key] = $event.item;
  }
  // 获取页面配置
  getConfig() {
    this.loading = true;
    this.http.get('web/acceptance/initiate-acceptance-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.queryFields     = result['search_form'];
      this.childrenColumns = result['columnsChildren'];
      this.acceptanceScore = result['acceptanceScore'];
      this.acceptanceScoreTemp = result['acceptanceScore'];
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    let params;
    this.searchFormData = paramsFilter(this.searchFormData);
    params = {
      'group_by' : '1',
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/acceptance/initiate-acceptance-list', {
      params: params
    }).subscribe(result => {
      //console.log(result)
      if (result['code'] === 0) {
        this.listLoading            = false;
        if (this.expands && result['data']['list']) {
          result['data']['list'] = result['data']['list'].map(item => {
            if (this.expands[item.id]) {
              item['expand'] = this.expands[item.id];
            }
            return item;
          });
        }
        this.list                   = result['data']['list'];
        this.pagination.total_count = result['data']['pager']['itemCount'];
        this.pagination.page_index  = result['data']['pager']['page'];
        this.pagination.page_size   = result['data']['pager']['pageSize'];
      } else {
        this.message.error(result['msg'] || '网络异常, 请稍后再试');
      }
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  beforeUploadImg = (file: File) => {
    const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png');
    if (!isJPG) {
      this.message.error(file.name + '格式不对，格式要求：jpg,png,jpeg');
    }
    const isLt2M = file.size  < 104857600;
    if (!isLt2M) {
      this.message.error(file.name + '超出大小限制，文件大小：100M以内');
    }
    return isJPG && isLt2M;
  }

  beforeUploadImg1 = (file: File) => {
    const fileTypes = ['jpg','gif','png','psd','ai','jpeg','bmp','doc','docx','xls','xlsx','ppt','pptx','pdf','zip','7z','tga','rar','mp3','mp4','mov','wmv','avi','swf','fla','wav','ogg','aif','aiff','flac','caf','mpg','mpeg','wma'];
    const fileNames = file.name.split('.');
    const isJPG = fileTypes.some(type => fileNames[fileNames.length - 1] == type);
    if (!isJPG) {
      this.message.error(file.name + '格式不对，格式要求：jpg,gif,png,psd,ai,jpeg,bmp,doc,docx,xls,xlsx,ppt,pptx,pdf,zip,7z,tga,rar,mp3,mp4,mov,wmv,avi,swf,fla,wav,ogg,aif,aiff,flac,caf,mpg,mpeg,wma');
    }
    // const isLt10G = file.size  < 1024 * 1024 * 1024 * 10;
    // if (!isLt10G) {
    //   this.message.error(file.name + '超出大小限制，文件大小：10G以内');
    // }
    return isJPG;
  }

  beforeUploadImg2 = (file: File) => {
    const fileTypes = ['jpg', 'gif', 'png', 'psd', 'ai', 'jpeg',
                      'bmp', 'doc', 'docx', 'xls', 'xlsx', 'ppt',
                      'pptx', 'pdf', 'zip', '7z', 'tga', 'rar', 'mp3',
                      'mp4', 'mov', 'wmv', 'avi', 'swf', 'fla', 'wav',
                      'ogg', 'aif', 'aiff', 'flac', 'caf', 'mpg', 'mpeg', 'wma'];
    const fileNames = file.name.split('.');
    const isJPG = fileTypes.some(type => fileNames[fileNames.length - 1] == type);
    if (!isJPG) {
      this.message.error(file.name +
        '格式不对，格式要求：jpg,gif,png,psd,ai,jpeg,bmp,doc,docx,xls,xlsx,ppt,pptx,pdf,zip,7z,tga,rar,mp3,mp4,mov,wmv,avi,swf,fla,wav,ogg,aif,aiff,flac,caf,mpg,mpeg,wma');
    }
    // const isLt10G = file.size < 1024 * 1024 * 1024 * 10;
    // if (!isLt10G) {
    //   this.message.error(file.name + '超出大小限制，文件大小：10G以内');
    // }
    return isJPG;
  }
  // 分片上传
  customBigReq = (item: UploadXHRArgs) => {
    const id = item.file.name.split(',')[0];
    if (!/FPI[0-9a-zA-Z]+/.test(id)) {
      this.message.error(item.file.name + '文件名称格式不对，未找到对应的物件单号，要求：物件单号+逗号+文件名');
      return;
    }
    this.uploadsService.uploadBig(item, item.data.objType, data => {
      this.http.post('web/thing/add-thing-file', { id, file_id: data['id']} )
        .subscribe(results => {
          if (results['code'].toString() == '0') {
            return false;
          } else {
            this.message.error(results['msg']);
            return false;
          }

        });
    }, 'batch');
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 点击事件
  clickEvent(event) {
    console.log(event)
    if (event.key === 'thing_code') {
      this.modalService.open('thing', event.item);
    }
    if (event.key === 'upload') {
      if(event.item.is_ihub_upload === '1') {
        this.ihubCode = null;
        this.isIhubTo = true;
        return;
      }
      this.modalService.open('thing', {...event.item, status: 'upload'});
    }
  }

  isIhubToEvent() {
    window.open('https://ihub.qq.com', '_black');
  }

  // 批量修改便签
  batchUpdataLabel () {
    const ids = this.list.map(item => item.children)
      .reduce((pre, cur) => pre.concat(cur), [])
      .filter(item => item.checked)
      .map(item => {
        return item.id;
      }).join(',');

    this.modalService.open('thing-label', {
      title: '获取物件变更记录',
      params: {
        id: ids
      },
      getUrl: '/web/thing/thing-label-edit',
      postUrl: '',
      required: false,
      callback: true
    });
  }

  acceptanceSubmit(optionType) {
    // 通过时才需要选择通过程度, 驳回时不需要
    // ihubCode
    const ihubCodeList = [];
    let thing_id;
    thing_id = [];
    let pass_degree;
    let things = [];
    let things_label = {};
    pass_degree = {};
    const pass_reason = {};
    const acceptance_reason = {};
    const settlement_ratio = {};
    const isError = false;
    if (optionType === 'pass') {
      let isError = false;
      this.list.forEach((items) => {
        if ((items.checked || items.indeterminate) && items.children) {
          this.expands[items.id] = items.expand;
          if (isError) {
            return;
          }
          items.children.forEach(thing => {
            if (thing.checked) {
              if(thing.is_ihub_upload === '1') {
                ihubCodeList.push(thing.thing_code);
              } else {
                if (!thing.pass_degree) {
                  isError = true;
                  this.message.error(thing.thing_name + '(' + thing.thing_code + '): ' + '未选择通过程度');
                  return;
                }

                if (thing['is_test'] == '1' && (!thing.acceptance_reason || !(String(thing.acceptance_reason).trim())) ) {
                  // this.message.error(thing.thing_code+ ': 请填写验收说明');
                  // isError = true;
                  // return;
                }
                if ((thing.pass_degree == '2' || thing.pass_degree == '3')
                      && (!thing.acceptance_reason || !(String(thing.acceptance_reason).trim()))) {
                  this.message.error(thing.thing_code + ': 请填写验收说明');
                  isError = true;
                  return;
                }
                if ((thing.pass_degree == '2' || thing.pass_degree == '3')
                  && thing.settlement_ratio != '0'
                  && !thing.settlement_ratio) {
                  this.message.error(thing.thing_code + ': 请填写结算比例');
                  isError = true;
                  return;
                }

                if(thing.settlement_ratio && (toNumber(thing.settlement_ratio)<0 || toNumber(thing.settlement_ratio)>100)){
                  this.message.error(thing.thing_code + ': 结算比例请填写数字0-100');
                  isError = true;
                  return;
                }


                if (thing['is_show_figure'] === '无' && thing['is_exhibition'] === '1' &&　optionType === 'pass') {
                  this.message.error('物件:' + thing['thing_code'] + ', 未上传作品展示图');
                  isError = true;
                  return;
                }
                if (thing['is_final_work'] === '无'　&& optionType === 'pass') {
                  this.message.error('物件:' + thing['thing_code'] + ', 未上传最终作品');
                  isError = true;
                  return;
                }

                thing.attribute_check.map((item3, index3) => {
                  if (item3.attr_type == '1') {
                    if (item3.form_num == '1') {
                      if (!item3.value && item3.is_required == '1') {
                        this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                        isError = true;
                        return false;
                      }

                    } else {
                      if (item3.options && item3.options.some(item => !item.value) && item3.is_required == '1') {
                        this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                        isError = true;
                        return false;
                      }

                      if (item3.options
                          && item3.options.some(item => !item.value)
                          && item3.options.some(item => item.value)) {
                        this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                        isError = true;
                        return false;
                      }
                    }
                  } else if (item3.attr_type === '2') {
                    if ((!item3.value || (item3.value && item3.value.length == 0) )&& item3.is_required =='1') {
                      this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                      isError = true;
                      return false;
                    }
                  }
                });

                if (thing.pass_degree) {
                  pass_degree[thing.id] = thing.pass_degree ? thing.pass_degree : '';
                  pass_reason[thing.id] = thing.pass_reason ? thing.pass_reason : '';
                  thing_id.push(thing.id);

                  acceptance_reason[thing.id] = thing.acceptance_reason ? thing.acceptance_reason : '';
                  settlement_ratio[thing.id] = thing.settlement_ratio ? thing.settlement_ratio : 0;

                  things_label[thing.id] = thing.attribute_check;
                }
              }
            }
          });
        }
      });
      if (isError) {
        return;
      }
    }
    if(ihubCodeList.length > 0) {
      this.ihubCode = ihubCodeList.join(', ');
      this.isIhubTo = true;
      return false;
    }
    if (thing_id.length === 0) {
      this.message.error('请选择物件');
      return false;
    }
    localStorage.setItem('thing_id',thing_id.toString())
    this.http.get('web/acceptance/get-acceptance-score', {
      params: {
        thing_id: thing_id.toString(),
        current_workflow: '11000',
      }
    }).subscribe(res => {
      if (res['code'] === 0) {
       // console.log(this.acceptanceScore)
        if (res['data'].length > 0) {
          this.isNewAcceptance = true;
          this.acceptanceScore = res['data'];
          this.newVersion=res['version']          
          if(this.newVersion=='2'){
            this.optionsSuccess=this.acceptanceScore[0].options
            this.optionsNogood=this.acceptanceScore[1].options
            this.optionsGood=this.acceptanceScore[2].options  
          }
        }else if(res['data'].length==0){          
          //this.acceptanceScore = res['data'];
          //console.log(this.acceptanceScore)
          this.isNewAcceptance = false;
          this.acceptanceScore = this.acceptanceScoreTemp;
        }
         else {
          this.isNewAcceptance = false;
          //this.acceptanceScore = this.acceptanceScoreTemp;
        }

        if (optionType === 'pass') {
          this.acceptanceRateModal.openModal(
            'web/acceptance/by-acceptance-submit',
            thing_id,
            pass_degree,
            [],
            pass_reason,
            acceptance_reason,
            null,
            [],
            this.acceptanceScore,
            this.isNewAcceptance,
            settlement_ratio,
            things_label,
          );
          return;
        } else {
          this.message.isAllLoading = true;
          this.http.post('web/acceptance/by-acceptance-reject',
            {
              thing_id: thing_id,
              reason: this.reason,
              pass_degree: pass_degree,
              pass_reason: pass_reason,
              acceptance_reason: acceptance_reason,
              settlement_ratio: settlement_ratio,
              things_label: things_label
            }
          ).subscribe(result => {
            this.isVisible = false;
            this.message.isAllLoading = false;
            if (result['code'] !== 0) {
              this.message.error(result['msg']);
              return false;
            }
            this.message.success(result['msg']);
            this.getList();
            this.menuService.getBacklog();
          }, (err) => {
            this.isVisible = false;
            this.message.error('网络异常，请稍后再试');
            this.message.isAllLoading = false;
          });
        }
      } else {
        this.message.error(res['msg']);
        return false;
      }
    }, err => {
      this.message.error('网络异常, 请稍后再试');
    });


  }
  // 校验通过程度是否选择
  checkPassLevel() {
    let result;
    result = true;
    this.list.forEach((story) => {
      if (story.children) {
        story['children'].forEach((thing) => {
          if (thing.checked) {
            // 做通过程度选择的判断
            if (this.pass_degree[thing.id] === undefined) {
              this.message.error(thing.thing_code + ': 请选择通过程度');
              result = false;
            }
          }
        });
      }
    });
  }


  // 是否显示批量通过程度弹窗
  isDegreeVisible = false;
  pass_degree_radio = null;
  acceptance_reason = null;
  settlement_ratio = null;
  // 是否显示作品评价弹窗
  isProjectEvaluateVisible=false;
  isNogood=false;
  isGood=false;
  isSuccess=true;
  // 通过批量添加通过程度
  degreePass () {
    this.isDegreeVisible = true;
  }
  //作品评价
  projectEvaluate(){
    console.log(123)
    this.isProjectEvaluateVisible=true;
    this.http.get('web/acceptance/get-acceptance-score', {
      params: {
        thing_id: localStorage.getItem('thing_id'),
        current_workflow: '11000',
      }
    }).subscribe(res => {
      if (res['code'] === 0) {
        if (res['data'].length > 0) {
          this.isNewAcceptance = true;
          this.acceptanceScore = res['data'];
          this.optionsSuccess=this.acceptanceScore[0].options
          this.optionsNogood=this.acceptanceScore[1].options
          this.optionsGood=this.acceptanceScore[2].options

        } else {
          this.isNewAcceptance = false;
          //this.acceptanceScore = this.acceptanceScoreTemp;
        }
      }
    }, err => {
      this.message.error('网络异常, 请稍后再试');
    });

  }
  //较差显示
  noGood(){
    ////console.log(123)
    this.isNogood=true
    this.isGood=false
    this.isSuccess=false
  }
  //非常棒显示
  Good(){
    ////console.log(456)
    this.isGood=true
    this.isNogood=false
    this.isSuccess=false
  }
  Success(){
    this.isSuccess=true
    this.isNogood=false
    this.isGood=false
  }
  endMakeVisible = false; // 撤回弹出框
  endMakeButton () {
    this.endMakeVisible = true;
    this.reason = null;
    this.endMakeReason = null;
  }
  // 结束制作
  endMake() {
    let thing_id;

    let pass_degree;
    pass_degree = {};
    let isError = false;
    const acceptance_reason = {};
    const settlement_ratio = {};
    const things_label = {};

    this.list.forEach((items) => {
      if ((items.checked || items.indeterminate) && items.children) {
        items.children.forEach(thing => {
          if (thing.checked) {
              if (thing['is_test'] == '1' && (!thing.acceptance_reason || !(String(thing.acceptance_reason).trim())) ) {
                // this.message.error(thing.thing_code+ ': 请填写验收说明');
                // return false;
              }
              if (thing.pass_degree && (thing.pass_degree == '2' || thing.pass_degree == '3')
                && (!thing.acceptance_reason || !(String(thing.acceptance_reason).trim()))) {
                this.message.error(thing.thing_code + ': 请填写验收说明');
                return false;
              }

              if(thing.settlement_ratio && (toNumber(thing.settlement_ratio)<0 || toNumber(thing.settlement_ratio)>100)){
                this.message.error(thing.thing_code + ': 结算比例请填写数字0-100');
                return false;
              }


                thing.attribute_check.map((item3, index3) => {
                  if (item3.attr_type == '1') {
                    if (item3.form_num == '1') {
                      if (item3.value === null && item3.is_required === '1') {
                        this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                        isError = true;
                        return false;
                      }

                    } else {
                      if (item3.options && item3.options.some(item => item.value == null) && item3.is_required === '1') {
                        this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                        isError = true;
                        return false;
                      }

                      if (item3.options
                          && item3.options.some(item => item.value == null)
                          && item3.options.some(item => item.value != null)) {
                        this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                        isError = true;
                        return false;
                      }
                    }
                  } else if (item3.attr_type === '2') {
                    if ((item3.value === null || (item3.value && item3.value.length == 0) )&& item3.is_required === '1') {
                      this.message.error(thing.thing_name + ': ' + item3.title + '不能为空');
                      isError = true;
                      return false;
                    }
                  }
                });

              if (thing.pass_degree) {
                pass_degree[thing.id] = thing.pass_degree ? thing.pass_degree : 0;
                acceptance_reason[thing.id] = thing.acceptance_reason ? thing.acceptance_reason : '';
                settlement_ratio[thing.id] = thing.settlement_ratio ? thing.settlement_ratio : 0;
                things_label[thing.id] = thing.attribute_check;
              }
          }
        });
      }
    });

    if (isError) {
      return
    }

    thing_id = [];
    this.list.forEach((items) => {
      if ((items.checked || items.indeterminate) && items.children) {
        this.expands[items.id] = items.expand;
        items.children.forEach(thing => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });

    if (thing_id.length === 0) {
      this.message.error('未请选择需要结束制作的物件');
      return false;
    }

    if (!this.reason) {
      this.message.error('请选择结束制作的原因');
      return false;
    }
    if(this.reason == '供方原因' && !this.endMakeReason){
      this.message.error('请填写具体变更的原因');
      return false;
    }

    //this.isSubmitLoading = true;
    this.http.post('web/order/end-make-option', {
      thing_quote_ids: thing_id,
      reason: this.reason,
      endMakeReason:this.endMakeReason,
      pass_degree: pass_degree,
      acceptance_reason: acceptance_reason,
      settlement_ratio: settlement_ratio,
    }).subscribe(results => {
      this.endMakeVisible = false;
      //this.isSubmitLoading = false;
      if (results['code'].toString() !== '0') {
        this.message.error(results['msg']);
        return false;
      }
      this.reason = null;
      this.endMakeReason = null;
      this.message.success(results['msg']);
      this.getList();
      //this.menuService.getBacklog();
    });
  }


    // 上传文件
    uploadChange ($event) {
      if ($event.type === 'success' && $event.file && $event.file.originFileObj) {
        // file_id = $event.file.originFileObj.file_id;
        //console.log($event);
        const thing_code = $event.file.name.split(',')[0];
        this.http.post('web/thing/add-thing-file', {
          thing_code: thing_code,
          file_id: $event['file']['originFileObj']['file_id'],
          type: $event['file']['originFileObj']['object_type']
        }).subscribe(results => {
          if (results['code'] === 0) {
            this.message.success('上传成功');
            //this.getList();
          } else {
            this.message.error(results['msg']);
          }
        }, err => {
          this.message.remove(err);
        });
      }
    }

  // 批量添加验收程度
  degreeSubmit () {

    if (!this.pass_degree_radio) {
      this.message.error('请选择通过程度');
      return;
    }

    if ((this.pass_degree_radio == 2 || this.pass_degree_radio == 3) && !this.acceptance_reason ) {
      this.message.error('请填写验收说明');
      return;
    }

    if ((this.pass_degree_radio == 2 || this.pass_degree_radio == 3) && !this.settlement_ratio && this.settlement_ratio != '0') {
      this.message.error('请填写结算比例');
      return;
    }

    if(this.settlement_ratio && (toNumber(this.settlement_ratio)<0 || toNumber(this.settlement_ratio)>100)){
      this.message.error('结算比例请填写数字0-100');
      return;
    }

    this.list.forEach(items => {
      if (items && (items.checked || items.indeterminate) && items.children && items.children.length > 0) {
        items.children.forEach(item => {
          if (item.checked) {
            item['pass_degree'] = this.pass_degree_radio;
            item['acceptance_reason'] = this.acceptance_reason;
            item['settlement_ratio'] = this.settlement_ratio;
          }
        });
      }
    });

    this.isDegreeVisible = false;
  }

  delayNotice() {
    let thing_id;
    thing_id = [];
    this.list.forEach((items) => {
      if ((items.checked || items.indeterminate) && items.children) {
        this.expands[items.id] = items.expand;
        items.children.forEach(thing => {
          if (thing.checked) {
            thing_id.push(thing.id);
          }
        });
      }
    });
    //显示弹框
    this.modalService.open('delay-remind', {
      current_workflow: 11010,
      thing_id: thing_id
    });
  }
}
