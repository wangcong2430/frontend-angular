import { Component, ElementRef, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { RestLinkService } from '../../services/rest-link.service';
import { getUrlParams } from '../../utils/utils';

@Component({
  templateUrl: './iframe.component.html',
  styles: [
  `
    :host ::ng-deep iframe.iframe{
      position: relative;
      width: 100%;
      height: 100%;
      height: calc(100% + 93px);
      padding: 0;
      margin: 0;
      border: none;
    }
  `]
})
export class IframeComponent implements OnInit {
  link = ''
  loading = false
  iframeObj: any = {}
  currentIframe: any
  constructor(
    private route: ActivatedRoute,
    private elRef: ElementRef,
    private router: Router,
    private restLinkService: RestLinkService,
    private modalService: ModalService
  ) {
    this.addEventListenMessage()
  }

  ngOnInit(): void { 
    this.initIframe()
    console.log('ngOnInit')
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) { 
        this.initIframe()
      }
    })

  }

  initIframe () {
    if (this.loading) {
      return
    }
    this.loading = true

    if (!this.iframeObj[window.location.href]) {
      const iframe = document.createElement('iframe');
      iframe.src = window.location.href.replace(window.location.origin + '/iframe', window.location.origin)
      iframe.className="w-100 h-100 border-0";
      this.iframeObj[window.location.href] = iframe
    }
    this.currentIframe = this.iframeObj[window.location.href]
    this.currentIframe.onload = () => { 
      this.loading = false;
    };
    this.elRef.nativeElement.querySelector('#iframe').innerHTML= ''
    this.elRef.nativeElement.querySelector('#iframe').appendChild(this.currentIframe);
  }

  addEventListenMessage () {
    window.addEventListener('message', (e) => {
      if (e.data && e.data.key && e.data.value) {
        this.modalService.open(e.data.key, e.data.value);
      }
    })
  }

  
}
