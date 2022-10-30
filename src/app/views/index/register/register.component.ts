import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
    selector: 'app-index-register',
    templateUrl: './component.html',
    styleUrls: ['./component.less']
})
export class RegisterComponent {
    constructor(
        public router: Router
    ) {
    }
}
