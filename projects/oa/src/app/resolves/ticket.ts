import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { WorkflowInstanceService } from '../../api-client';

@Injectable()
export class TicketResolve implements Resolve<any> {

  constructor(
    private workflowInstanceService: WorkflowInstanceService
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    return new Observable(observer => {
      this.workflowInstanceService.webWorkflowInstanceDetailPost(route.params['id']).subscribe(result => {
        if (result['code'] === 0) {
          observer.next(result['data']);
        } else {
          observer.next(null);
        }
        observer.complete();
      });
    });
  }
}
