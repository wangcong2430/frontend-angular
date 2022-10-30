import {Injectable} from '@angular/core';

declare var document: any;

@Injectable()
export class ScriptService {

  private scripts: any = {};

  loadScript(name: string, src: string) {
    return new Promise((resolve, reject) => {
      // resolve if already loaded
      if (this.scripts && this.scripts[name] && this.scripts[name].loaded) {
          resolve({script: name, loaded: true, status: 'Already Loaded'});
      } else {
        // load script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        this.scripts[name] = {
            src: src,
            loaded: false
        };
        script.src = src;

        if (script.readyState) {
          // IE
          script.onreadystatechange = () => {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              this.scripts[name].loaded = true;
              resolve({script: name, loaded: true, status: 'Loaded'});
            }
          };
        } else {
          // Others
          script.onload = () => {
              this.scripts[name].loaded = true;
              resolve({script: name, loaded: true, status: 'Loaded'});
          };
        }
        script.onerror = (error: any) => resolve({script: name, loaded: false, status: 'Loaded'});
        document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }
}
