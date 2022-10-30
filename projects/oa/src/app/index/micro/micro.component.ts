import {Component, ElementRef, Input, OnInit, Output} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestLinkService } from '../../services/rest-link.service';
import { bus, preloadApp, startApp, destroyApp } from "@tencent/wujie";

@Component({
  templateUrl: './micro.component.html',
})
export class MicroComponent implements OnInit {
  user;
  query;
  title;
  link_name_map;

  constructor(
    private route: ActivatedRoute,
    private elRef: ElementRef,
    private restLinkService: RestLinkService,
  ) {

  }

  ngOnInit(): void { 
    let microHost = '//mytable.oa.com'
    if (window.location.hostname.endsWith('.woa.com')) {
      microHost = microHost.replace('.oa.com', '.woa.com')
    }

    startApp({
      name: 'mytable',
      url: microHost,
      sync: true,
      el:  this.elRef.nativeElement.querySelector('#qiankun'),
      fetch: this.wujiFetch,
      props: {}
    })
  }

  wujiFetch = (url, options) => {
    // 替换url中包含主应用的域名成子应用的域名
    let tmpUrl = url
    let microHost = 'mytable.oa.com'
    if (window.location.hostname.endsWith('.woa.com')) {
      microHost = microHost.replace('.oa.com', '.woa.com')
    }
    if (url.includes(window.location.host)) {
      tmpUrl = url.replace(window.location.host, microHost)
    }
    const exclude = ['https://cdn-go.cn', 'https://vfiles.gtimg.cn', 'http://pingjs.qq.com']
    const headers = (options && options.headers) || {}
    return window
      .fetch(tmpUrl, {
        ...options,
        credentials: exclude.some(host => url.toString().includes(host)) ? 'omit' : 'include',
        headers: {
          ...headers,
          'Origin': window.location.origin
        }
      })
      .then(
        response => response,
        error => {
          console.error(error)
          return { text: () => '' }
        }
      )
 }

  // startApp({ name: "唯一id", url: "子应用路径", el: "容器", sync: true }
}
