import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UploadsService } from '../../../services/uploads.service';

@Component({
  selector: 'app-modal-uploads-plan',
  templateUrl: './uploads-plan.component.html',
  styleUrls: ['./uploads-plan.component.css' ]
})

export class UploadsPlanModalComponent implements OnInit {

  msg: String = '';
  percent: Number = 0;
  isShow: Boolean = false;

  constructor(
     public uploadsService: UploadsService
  ) {}

  ngOnInit() {}

  closeModal(modal) {
    modal.isShow = false;
    modal.options = [];
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
