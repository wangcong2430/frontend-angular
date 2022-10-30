import { Component, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-component-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent {
  @Input() user;

  count: Number = 0;
  constructor(
    private http: HttpClient,
    private modalService: ModalService
  ) {}

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    const timer = setTimeout(() => {
      clearTimeout(timer);
      this.http.get('/web/user/cpm-backlog').pipe(delay(5000)).subscribe(res => {
        if (res && res['total']) {
          this.count = res['total'];
        }
      });
    }, 5000);
  }

  feedback(): void {
    this.modalService.open('form', {
      url: 'web/helpcenter/feedback/add',
      type: '1000'
    })
  }
}
