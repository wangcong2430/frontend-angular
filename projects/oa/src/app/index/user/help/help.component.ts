import { Component, OnInit, ViewChild, ChangeDetectorRef,  ChangeDetectionStrategy, } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '../../../services/message.service';
import { FormlyFormOptions } from '@ngx-formly/core';
import { SaveModalComponent } from '../../../containers/modal/save/save.component';
import { paramsFilter, filterOption, getUrlParams } from '../../../utils/utils';  

@Component({
  templateUrl: './help.component.html', 
  styleUrls: ['./help.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class HelpComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private cd: ChangeDetectorRef,
  ) {}
  // loading
  loading = false;

  // 数据列表
  lists = [];
  
  model = {
    question: null,
    id: null,
    parent_id: null,
    answer: null,
    status: '1'
  };

  // 判断当前是搜索状态
  isSearch = false;
  searchKey = null;
  searchResult = null;

  title = ''
  parentTitle = null

  ngOnInit() {
    // 获取列表信息
    this.loading = true;
    this.getQuestionList();
    this.newQuestion();
  }

  // 获取问题列表
  getQuestionList (name = null) {
    this.cd.markForCheck();
    this.http.get('web/helpcenter/question/list', { params: {
      Staffname: name
    }}).subscribe(result => {
      this.loading = false;
      if (result['code'] === 0) {
        // 保留点开记录
        result['data'].forEach(item => {
          this.lists.forEach(list => {
            if (item.id === list.id) {
              item.active = list.active;
            }
          })
        })
        this.lists = result['data'];
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, error => {
      this.loading = false;
      this.message.error('网络异常，请稍后再试');
      this.cd.markForCheck();
    });
  }

  setTitle (parentTitle, title = null) {
    this.parentTitle = parentTitle;
    this.title = title;
  }

  searchQuestion ($event) {
    this.http.get('web/helpcenter/question/search', { params: {
      keyword: this.searchKey
    }}).subscribe(result => {
      if (result['code'] === 0) {
        this.isSearch = true;
        this.searchResult = result['data']
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, error => {
      this.message.error('网络异常，请稍后再试');
      this.cd.markForCheck();
    });
  }

  addQuestion () {
    if (!this.model.question) {
      this.message.error('请输入问题');
      return
    }

    this.http.post('web/helpcenter/question/add', {
      parent_id: this.model.parent_id,
      question: this.model.question,
      status: this.model.status,
      answer: this.model.answer,
    }).subscribe(result => {
      if (result['code'] === 0) {
        // this.message.success(result['msg']);
        this.message.success('添加成功');
        this.getQuestionList();
        this.newQuestion();
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, error => {
      this.message.error('网络异常，请稍后再试');
      this.cd.markForCheck();
    });
  }

  editQuestion () {
    if (!this.model.id) {
      return;
    }

    if (!this.model.question) {
      this.message.error('请输入问题');
      return;
    }

    this.http.post('web/helpcenter/question/edit', {
      id: this.model.id,
      parent_id: this.model.parent_id,
      question: this.model.question,
      status: this.model.status,
      answer: this.model.answer,
    }).subscribe(result => {
      if (result['code'] === 0) {
        // this.message.success(result['msg']);
        this.message.success('编辑成功');
        this.getQuestionList();
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, error => {
      this.message.error('网络异常，请稍后再试');
      this.cd.markForCheck();
    });
  }


  delQuestion (id = null ) {
    if (!id) {
      return
    }
    this.http.get('web/helpcenter/question/del', { params: {
      id: id,
    }}).subscribe(result => {
      if (result['code'] === 0) {
        // this.message.success(result['msg']);
        this.message.success('删除成功');
        this.getQuestionList();
      } else {
        this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, error => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  questionSort (sorts) {
    this.http.post('web/helpcenter/question/sort', {
      sorts: sorts,
    }).subscribe(result => {
      if (result['code'] === 0) {
        // this.message.success(result['msg']);
      } else {
        // this.message.error(result['msg']);
      }
      this.cd.markForCheck();
    }, error => {
      this.message.error('网络异常，请稍后再试');
    });
  }

  // 编辑问题
  edit ($event, question) {
    $event.stopPropagation();
    this.model = {
      question: question.question,
      id: question.id,
      parent_id: question.parent_id,
      answer: question.answer,
      status: question.status
    }
    this.setTitle(question.question, '编辑子问题')
    this.isSearch = false;
  }

  up ($event, data, index) {
    $event.stopPropagation();
    if (index > 0) {
      let value = data[index];
      data[index] = data[index-1];
      data[index-1] = value
    }
    this.questionSort(data.map(item => item.id))
  }

  down ($event, data, index) {
    $event.stopPropagation();
    if (index < data.length - 1) {
      let value = data[index];
      data[index] = data[index+1];
      data[index+1] = value
    }
    this.questionSort(data.map(item => item.id))
  }

  save ($event) {
    if (this.model.id) {
      this.editQuestion();
    } else {
      this.addQuestion();
    }
  }

  // 新建问题
  newQuestion () {
    this.model = {
      question: null,
      id: null,
      parent_id: 0,
      answer: null,
      status: '1'
    }
    this.isSearch = false;
    this.setTitle('新建常见问题')
    this.cd.markForCheck();
  }

  // 新建子问题
  newChildrenEdit ($event, question) {
    $event.stopPropagation();
    this.model = {
      question: null,
      id: null,
      parent_id: question.id,
      answer: null,
      status: '1'
    }
    this.setTitle(question.question, '新建子问题')
    this.isSearch = false;
    this.cd.markForCheck();
  }

  // 
  activeChange ($event, data) {
    this.model = {
      question: data.question,
      id: data.id,
      parent_id: data.parent_id,
      answer: data.answer,
      status: data.status
    }
    this.setTitle(data.question, '编辑问题')
    this.isSearch = false;
  }
}
