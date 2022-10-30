import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-component-layout-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})
export class LayoutFooterComponent {
    constructor(private translate: TranslateService) {}
}
