import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { ModalService } from '../../../services/modal.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-inquiry-push-epo-component',
  templateUrl: './inquiry-push-epo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class InquiryPushEpoComponent extends FieldType implements OnInit, OnDestroy  {

  constructor(
    private cd: ChangeDetectorRef,
    private modal: ModalService
  ) {
    super();
  }
  checked: Boolean = false;
  pushEpo$;
  pushEpoModel = {
    is_push_epo: false,
    statement_id: null
  };

  modelChange ($event) {
    // this.model.is_push_epo = $event
    this.update();
  }

  update () {
    if (this.pushEpoModel.is_push_epo && this.to['ids'] && !this.pushEpoModel.statement_id) {
      this.modal.open('push-epo', Object.assign(this.pushEpoModel,  {
        ids: ['385']
      }));
    }
  }

  ngOnInit () {
    this.pushEpo$ = this.modal.complete$.pipe(filter((item: any) => item.key == 'push-epo')).subscribe(res => {
      if (res['data'] && res['data']['code'] == 0 && res['data']['data'] && res['data']['data']['id']) {
        this.pushEpoModel = Object.assign({}, this.pushEpoModel, res['data']['data'])
        this.cd.markForCheck();
      } else {
        this.pushEpoModel.is_push_epo = false;
        this.cd.markForCheck();
      }
    });
  }


  ngOnDestroy () {
    this.pushEpo$.unsubscribe();
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
