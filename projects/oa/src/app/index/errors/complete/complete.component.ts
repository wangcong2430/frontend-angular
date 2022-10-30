import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-index-register-base-info',
  templateUrl: './complete.component.html',
})
export class CompleteComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {}
}
