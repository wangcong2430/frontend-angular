import {Component, OnInit, Input, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.css']
})

export class PromptComponent implements OnInit {
  @Input() config;

  constructor() {
  }

  ngOnInit() {
  }
}
