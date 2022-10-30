import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-modal-show-img',
  templateUrl: './show-img.component.html',
  styleUrls: ['./show-img.component.css']
})

export class ShowImgModalComponent implements OnInit {
  showImg = {
    loading: false,
    isVisible: false,
    url: ''
  };
  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {}

  // 开打弹窗
  openModal(url) {
    this.showImg.url = '';
    this.showImg.loading = true;
    this.showImg.isVisible = true;
    this.showImg.url = url;
  }

  changeLoad() {
    this.showImg.loading = false;
  }

  onCancel() {
    this.showImg.url = '';
    this.showImg.isVisible = false;
  }
}
