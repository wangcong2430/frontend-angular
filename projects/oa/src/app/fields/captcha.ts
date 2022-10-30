import { Component, OnInit } from '@angular/core';
import { Field } from '@ngx-formly/core';
import { HttpClient } from "@angular/common/http";
import { CaptchaService } from "../events/captcha.service";

@Component({
    selector: 'formly-field-captcha',
    template: `
    <input 
    type="text" 
    class="form-control" 
    [placeholder]="to.placeholder"
    [(ngModel)]="model[key]">
    <img [src]="src" alt="" (click)="reload()" >
  `,
})
export class FormlyFieldCaptcha extends Field implements OnInit {
    public src;

    constructor(private http: HttpClient, private service: CaptchaService) {
        super();
    }


    ngOnInit() {
        this.src = this.to.attributes.src;
        this.service.refresh$.subscribe(() => {
            this.src = this.to.attributes.src + '?random=' + Math.random();
        });
    }

    reload() {
        this.service.refresh(this.to.attributes.refresh_src);
    }
}
