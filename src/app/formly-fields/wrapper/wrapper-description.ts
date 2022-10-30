import { Component, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
    selector: 'formly-wrapper-description',
    template: `
        <ng-container #fieldComponent></ng-container>
        <span class="one-line" *ngIf="to.description" #description >
            <span class="text-muted" [innerHTML]="to.description"></span>
        </span>
    `,
    styleUrls: ['./wrapper.css']
})
export class WrapperDescriptionComponent extends FieldWrapper implements AfterViewInit{
    @ViewChild('fieldComponent', {read: ViewContainerRef}) fieldComponent: ViewContainerRef;
    @ViewChild('description', {read: ViewContainerRef}) description: ViewContainerRef;
    title;
    
    ngAfterViewInit() {
        setTimeout(() => {
            this.title = this.description && this.description.element.nativeElement.innerText;
        });
    }
}
