// import {
//     Component, Input, OnInit, OnChanges, Output, ViewEncapsulation, EventEmitter, ElementRef
// } from '@angular/core';
// import './memberinput.js';
// import {CacheService} from "../../services/cache.service";
// import * as jQuery from 'jquery';
// import { HttpClient } from "@angular/common/http";

// function isNumber(value: string | number): boolean
// {
//     return !isNaN(Number(value.toString()));
// }

// let $ = jQuery;

// @Component({
//     selector: 'app-member-picker',
//     templateUrl: './template.html',
//     styleUrls: ['./style.css'],
//     encapsulation: ViewEncapsulation.None
// })
// export class MemberPickerComponent implements OnInit, OnChanges {
//     @Input() value: string;
//     @Input() maxMemberCount: any;
//     @Output() valueChange: EventEmitter<string>;
//     $element;
//     timer: any;
//     afterInit: boolean;

//     constructor(private http: HttpClient, private cache: CacheService, private el: ElementRef) {
//         this.valueChange = new EventEmitter<string>();
//     }
//     ngOnInit() {
//         if(this.value){
//             this.timer = setTimeout(() => {
//                 this.init();
//             });
//         } else {
//             this.afterInit = true;
//         }
//     }

//     init(str?) {
//         const vm = this;
//         this.cache.from('WEB_USER_NAME_LIST',
//             () => {
//                 return this.http.get("web/basic/userlist").toPromise().then(result => {
//                     const data = result['data'];
//                     if (data['ret_code'] === 0) {
//                         this.$element = $(this.el.nativeElement).find('input');
//                         const allMemberList = [];
//                         const allMemberMap = {};
//                         data['data'].forEach(item => {
//                             allMemberList.push(item[1]);
//                             allMemberMap[item[0]] = item[1];
//                         });
//                         return {
//                             allMemberList,
//                             allMemberMap
//                         }
//                     }
//                 });
//             }).subscribe(result => {
//                 console.log(result)
//                 this.$element = $(this.el.nativeElement).find('input');
//                 let options = {
//                     autoFocus: false
//                 };
//                 if (this.maxMemberCount && isNumber(this.maxMemberCount)) {
//                   options = Object.assign({}, options, { maxMemberCount: this.maxMemberCount})
//                 }
//                 this.$element.memberInput(options, vm.value, result.allMemberList, result.allMemberMap);
//                 this.$element.on('memberPicker', () => {
//                     let value = this.$element.val();
//                     value = value.replace(/\(.*?\)/g, '');
//                     vm.valueChange.emit(value);
//                 });
//                 if (str === 'focus') {
//                     $(this.el.nativeElement).find('.oaui_memberinput_editor').find('input').focus();
//                 }
//             });
//     }

//     focus() {
//         clearTimeout(this.timer);
//         this.init('focus');
//     }

//     ngOnChanges(changes) {
//         const newValue = changes.value && changes.value.currentValue;
//         const oldValue = changes.value && changes.value.previousValue;
//         let $memberInput;
//         if (this.$element) {
//             $memberInput = this.$element.data('memberInput');
//         }
//         if(oldValue !== newValue && newValue && !this.$element && this.afterInit){
//             this.focus();
//         }
//         if ($memberInput && newValue !== oldValue && $memberInput.memberPickerValue.join(';').replace(/\(.*?\)/g, '') !== newValue) {
//             if ($memberInput && $memberInput.reset) {
//                 $memberInput.reset();
//                 $memberInput.appendValue(newValue, false);
//             }
//         }
//     }
// }
