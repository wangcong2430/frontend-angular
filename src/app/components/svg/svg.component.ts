import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-svg',
  templateUrl: './svg.component.html',
  styleUrls: ['./svg.component.css']
})
export class SvgComponent implements OnInit {
  @Input() type;
  constructor() { }

  ngOnInit() {
  }

  get t() {
    return this.type || 'other';
  }
}
