import { Component, OnInit, Input, TemplateRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuService } from '../../services/menu.service';
import { MessageService } from '../../services/message.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-component-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent implements OnInit {
  @Input() user;
  @Input() menus;
  @Input() menu_collapsed;
  @Input() menu_title;
  
  @ViewChild('trigger') customTrigger: TemplateRef<void>;
  openMap = {};
  isCollapsed = false;
  triggerTemplate = null;
  parent_id;


  constructor(
    public menuService: MenuService,
    public messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,

  ) {}

  ngOnInit() {
    for (const item in this.menus) {
      if (item['id']) {
        this.openMap[item['id']] = false;
      }
    }
    if (this.menuService.curr_menu.parent_id) {
      this.openMap[this.menuService.curr_menu.parent_id] = true;
    }
    this.parent_id = this.menuService.curr_menu.parent_id;

    this.menuService.menu$.subscribe(item => {
      this.cd.markForCheck();
    })
  }

  openHandler(value: string): void {
    for (const key in this.openMap) {
      if (key !== value) {
        this.openMap[ key ] = false;
      }
    }
    this.cd.markForCheck();
  }

  /** custom trigger can be TemplateRef **/
  changeTrigger(): void {
      this.triggerTemplate = this.customTrigger;
      this.cd.markForCheck();
  }

  goUrl (item) {
    if (item['url'].indexOf('dcs/') === -1) {
      this.router.navigate([item.url, item.query ]);
    } else {
      window.document.location.href = window.location.origin + item.url;
    }
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }

  toCollapsed () {
    this.isCollapsed=!this.isCollapsed;
    this.cd.markForCheck();
  }

}
