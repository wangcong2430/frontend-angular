import { Component, OnInit } from '@angular/core';
import { UploadService } from '../../../services/upload.service';

@Component({
  selector: 'app-modal-upload-plan',
  templateUrl: './upload-plan.component.html',
  styleUrls: ['./upload-plan.component.css' ]
})

export class UploadPlanModalComponent implements OnInit {

  msg: String = '';
  percent: Number = 0;
  isShow: Boolean = false;

  constructor(
     public uploadService: UploadService
  ) {}

  ngOnInit() {}
}
