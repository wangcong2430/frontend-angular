import { Component, OnInit, Input } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { MessageService } from '../../services/message.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-component-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  @Input() menus;
  @Input() menu_collapsed;
  @Input() user;
  openMap = {};
  isCollapsed = false;
  triggerTemplate = null;

  constructor(
    public menuService: MenuService,
    public messageService: MessageService,
    public language: LanguageService,
  ) {}

  ngOnInit() {
    for (const item in this.menus) {
      if (item) {
        this.openMap[ item['id'] ] = false;
      }
    }
  }

  openHandler(value: string): void {
    for (const key in this.openMap) {
      if (key !== value) {
        this.openMap[ key ] = false;
      }
    }
  }

  /** custom trigger can be TemplateRef **/
  changeTrigger(): void {
    // this.triggerTemplate = this.customTrigger;
  }
}
