import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { AcceptanceRateComponent } from '../../../containers/modal/acceptance-rate/acceptance-rate.component';
import { MenuService } from '../../../services/menu.service';
import { ModalService } from '../../../services/modal.service';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';
import {isInteger, toNumber} from "ng-zorro-antd";

@Component({
  templateUrl: './demand-acceptance.component.html',
})

export class DemandAcceptanceComponent implements OnInit {
  @ViewChild(AcceptanceRateComponent)
  private acceptanceRateModal: AcceptanceRateComponent;

  // loading
  loading = true;
  listLoading = false;
  // 配置项
  columns = [];
  childrenColumns = [];
  queryFields = [];
  disabledButton = true;
  isNewAcceptance = false;
  isNewAcceptanceScore = false;
    //驳回不显示弹框
    optionType=null;
  // 数据列表
  list = [];
  expands = {}; // 展开项
  // 分页
  pagination = {
    total_count: null,
    page_size: '20',
    page_index: '1'
  };
  // 通过程度
  pass_degree = {};
// 筛选
    searchFormData = {
    ...getUrlParams()
  };
  msgHint = {
    isShow: false,
    isSubmitLoading: false,
    flag: 2,
    msg: ''
  };
  // 驳回原因
  rejectVisible = false;
  rejectReason = '';

  isIhubTo = false;
  ihubCode = '';

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

  // 评分相关变量
  acceptanceScore = [];
  acceptanceScoreTemp = [];
  acceptanceVersion=null;

  formatterPercent = (value: number) => {
    return value ? `${value} %` : value
  };

  constructor(
    private http: HttpClient,
    private menuService: MenuService,
    private message: MessageService,
    private modal: ModalService
  ) {}

  ngOnInit() {
    // 获取页面配置
    this.getConfig();
    this.getList();

    this.getHubHref();

    this.modal.complete$.subscribe(item => {
      if (item['key'] === 'thing-label') {
        this.getList();
      }
    });
  }

  // 获取arthub地址
  getHubHref() {
    this.http.get('/web/thing/arthub-jump-link',{
      params: {
        source: 'oa',
        current_workflow: '11000'
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
    this.http.get('web/acceptance/demand-person-acceptance-config').subscribe(result => {
      this.loading         = false;
      this.columns         = result['columns'];
      this.queryFields     = result['search_form'];
      this.childrenColumns = result['columnsChildren'];
      this.acceptanceScore = result['acceptanceScore'];
      this.acceptanceScoreTemp = result['acceptanceScore'];
      //console.log(this.acceptanceScore)
    });
  }

  // 获取数据列表
  getList(pagination?: null) {
    this.listLoading = true;
    this.searchFormData = paramsFilter(this.searchFormData);
    let params;
    params = {
      'group_by' : '1',
      'page_index':  this.pagination.page_index.toString(),
      'page_size':  this.pagination.page_size.toString(),
      ...this.searchFormData
    };
    this.http.get('web/acceptance/demand-person-acceptance-list', {
      params: params
    }).subscribe(result => {
      this.listLoading            = false;
      this.pagination.total_count = result['data']['pager']['itemCount'];
      this.pagination.page_index  = result['data']['pager']['page'];
      this.pagination.page_size   = result['data']['pager']['pageSize'];
      if (this.expands && result['data']['list']) {
        result['data']['list'] = result['data']['list'].map(item => {
          if (this.expands[item.id]) {
            item['expand'] = this.expands[item.id];
          }
          return item;
        });
      }
      this.list                   = result['data']['list'];
    }, err => {
      this.listLoading            = false;
      this.message.error('网络异常, 请稍后再试');
    });
  }

  // 按钮根据表格复选 显示是否可用
  changeDisabledButton(value) {
    this.disabledButton = value;
  }

  // 点击事件
  clickEvent(event) {
    if (event.key === 'thing_code') {
      this.modal.open('thing', event.item);
    }
    if (event.key === 'operation') {
      window.open(event.item.operation_id);
    }
  }

  isIhubToEvent() {
    window.open('https://ihub.qq.com', '_black');
  }

  acceptanceSubmit(optionType, hint = true) {
    // 通过时才需要选择通过程度, 驳回时不需要
    const thing_id = [];
    const pass_degree = {};
    const pass_reason = {};
    const acceptance_reason = {};
    const settlement_ratio = {};
    let isError = false;

    const ihubCodeList = [];
    this.list.forEach((items) => {
      if ((items.checked || items.indeterminate) && items.children) {
        this.expands[items.id] = items.expand;
        if (isError) {
          return;
        }
        items.children.forEach(thing => {
          if (thing.checked) {
            if(thing.is_ihub_upload === '1') {
              ihubCodeList.push(thing.thing_code)
            } else {
              thing_id.push(thing.id);

              if (thing['is_skip_score'] == '1') {
                if(optionType == 'reject'){
                  this.isNewAcceptanceScore = true
                }
                pass_degree[thing.id] = thing.pass_degree ? thing.pass_degree : '';
                pass_reason[thing.id] = thing.pass_reason ? thing.pass_reason : '';
                acceptance_reason[thing.id] = thing.acceptance_reason ? thing.acceptance_reason : '';
                settlement_ratio[thing.id] = thing.settlement_ratio ? thing.settlement_ratio : 0;
                return;
              }
              this.isNewAcceptanceScore = true

              if (!thing.pass_degree && optionType === 'pass') {
                isError = true;
                this.message.error(thing.thing_name + '(' + thing.thing_code + '): ' + '未选择通过程度');
                return;
              }

              if (thing['is_test'] == '1'  && optionType == 'pass'
                    && (!thing.acceptance_reason || !(String(thing.acceptance_reason).trim())) ) {
                // this.message.error(thing.thing_code + ': 请填写验收说明');
                // isError = true;
                // return;
              }
              if ((thing.pass_degree == '2' || thing.pass_degree == '3')
                    && optionType == 'pass'
                    && (!thing.acceptance_reason || !(String(thing.acceptance_reason).trim()))) {
                this.message.error(thing.thing_code + ': 请填写验收说明');
                isError = true;
                return;
              }
              if ((thing.pass_degree == '2' || thing.pass_degree == '3')
                && optionType == 'pass'
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

              if (thing.pass_degree) {
                pass_degree[thing.id] = thing.pass_degree ? thing.pass_degree : '';
                pass_reason[thing.id] = thing.pass_reason ? thing.pass_reason : '';
                acceptance_reason[thing.id] = thing.acceptance_reason ? thing.acceptance_reason : '';
                settlement_ratio[thing.id] = thing.settlement_ratio ? thing.settlement_ratio : 0;
              }
            }
          }
        });
      }
    });

    if (isError) {
      return;
    }
    if(ihubCodeList.length > 0) {
      this.ihubCode = ihubCodeList.join(', ');
      this.isIhubTo = true;
      return false;
    }
    if (thing_id.length == 0) {
      this.message.error('请选择物件');
      return false;
    }

    if(!this.isNewAcceptanceScore){
        this.msgHint.isSubmitLoading = true;
        this.message.isAllLoading = true;
        this.http.post('/web/acceptance/demand-person-acceptance-' + optionType,
          {
            thing_id: thing_id ,
            pass_degree: pass_degree,
            pass_reason: pass_reason,
            remark: this.rejectReason,
            acceptance_reason: acceptance_reason,
            settlement_ratio: settlement_ratio
          }
        ).subscribe(result => {
          this.msgHint.isSubmitLoading = false;
          this.message.isAllLoading = false;
          if (result['code'] !== 0) {
            this.message.error(result['msg']);
            return false;
          }
          this.message.success(result['msg']);
          this.rejectVisible = false;
          this.getList();
          this.menuService.getBacklog();
        }, () => {
          this.message.error('网络异常，请稍后再试');
          this.msgHint.isSubmitLoading = false;
          this.message.isAllLoading = false;
          this.rejectVisible = false;
        });
        return;
    }

    this.http.get('web/acceptance/get-acceptance-score', {
      params: {
        thing_id: thing_id.toString(),
        current_workflow: '11000',
      }
    }).subscribe(res => {
      if (res['code'] === 0) {
        if (res['data'].length > 0) {
          this.isNewAcceptance = true;
          this.acceptanceScore = res['data'];
          this.acceptanceVersion=res['version']
          this.optionType=optionType
          //console.log(this.acceptanceScore)
        } else {
          this.isNewAcceptance = false;
          this.acceptanceScore = this.acceptanceScoreTemp;
        }
        if (hint) {
          this.msgHint.msg = '';
          this.msgHint.flag = optionType;
          if (optionType === 'reject') {
            this.rejectReason = '';
            this.rejectVisible = true;
            this.msgHint.msg = `您一共选择了 ${thing_id.length} 个物件。
       ----------------------------------------------------------------------------------------- 确认要【驳回】吗？`;
            return;
          }
        } else {
          this.msgHint.isShow = false;
          this.msgHint.msg = '';
        }

        if (optionType === 'pass') {
          this.acceptanceRateModal.openModal('/web/acceptance/demand-person-acceptance-'
            + optionType, thing_id, pass_degree, [], pass_reason, acceptance_reason, null, [], this.acceptanceScore, this.isNewAcceptance, settlement_ratio);
        } else {
          this.msgHint.isSubmitLoading = true;
          this.message.isAllLoading = true;
          this.http.post('/web/acceptance/demand-person-acceptance-' + optionType,
            {
              thing_id: thing_id ,
              pass_degree: pass_degree,
              pass_reason: pass_reason,
              remark: this.rejectReason,
              acceptance_reason: acceptance_reason,
              settlement_ratio: settlement_ratio
            }
          ).subscribe(result => {
            this.msgHint.isSubmitLoading = false;
            this.message.isAllLoading = false;
            if (result['code'] !== 0) {
              this.message.error(result['msg']);
              return false;
            }
            this.message.success(result['msg']);
            this.rejectVisible = false;
            this.getList();
            this.menuService.getBacklog();
          }, () => {
            this.message.error('网络异常，请稍后再试');
            this.msgHint.isSubmitLoading = false;
            this.message.isAllLoading = false;
            this.rejectVisible = false;
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
    return result;
  }

  // 是否显示批量通过程度弹窗
  isDegreeVisible = false;
  pass_degree_radio = null;
  acceptance_reason = null;
  settlement_ratio = null;
  // 通过批量添加通过程度
  degreePass () {
    this.isDegreeVisible = true;
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

    // 更改物件标签
    updateLabel () {
      const attributeList = this.list.map(item => item.children)
        .reduce((pre, cur) => pre.concat(cur), [])
        .filter(item => item.checked)
        .map(item => {
          return {
            id: item.id,
            attribute: item.attribute,
            attribute_check: item.attribute_check,
            thing_name: item.thing_name
          };
        });

      let error = false;

      attributeList.forEach(item2 => {
        item2.attribute.map((item3, index3) => {
          if (item3.is_required == '1') {
            if (item3.attr_type == '1') {
              if (item3.form_num == '1') {
                if (!item3.value) {
                  this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
                  error = true;
                  return false;
                }
              } else {
                if (item3.options.some(item => item.value == null)) {
                  this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
                  error = true;
                  return false;
                }
              }
            } else if (item3.attr_type == '2') {
              if (!item3.value) {
                this.message.error(item2.thing_name + ': ' + item3.title + '不能为空');
                error = true;
                return false;
              }
            }
          }
        });
      });

      if (error) {
        return;
      }


      this.http.post('/web/acceptance/purchasing-manager-edit-label', {
        data: attributeList
      }).subscribe(result => {
        if (result['code'] !== 0) {
          this.message.error(result['msg']);
          return false;
        }
        this.message.success(result['msg']);
        this.getList();
        this.menuService.getBacklog();
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
        this.message.isAllLoading = false;
      });
    }

    batchUpdataLabel () {
      const ids = this.list.map(item => item.children)
        .reduce((pre, cur) => pre.concat(cur), [])
        .filter(item => item.checked)
        .map(item => {
          return item.id;
        }).join(',');

      if (!ids)  {
        this.message.error('请选择物件');
        return;
      }

      this.modal.open('thing-label', {
        title: '获取物件变更记录',
        params: {
          id: ids
        },
        getUrl: '/web/thing/thing-label-edit',
        postUrl: ''
      });
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
    this.modal.open('delay-remind', {
      current_workflow: 11000,
      thing_id: thing_id
    });
  }
}
