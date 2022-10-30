import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import * as COS from 'cos-js-sdk-v5';

@Injectable()
export class CosService {
  cos = null;
  config = {
    Bucket: 'wbp-1258344700',
    Region: 'ap-guangzhou',
    Prefix: 'upload'
  };

  startTime = null;
  expiredTime = null;
  nowTime = null;
  credentials = null;

  constructor(
    private http: HttpClient,
    private message: NzMessageService
  ) {
    this.cos = new COS({
      getAuthorization: this.getAuthorization,
      UploadCheckContentMd5: true,
      ProgressInterval: 1000,
    });
  }

  // 必选参数
  getAuthorization = (options, callback) => {
    // 服务端 JS 和 PHP 例子：https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/
    // 服务端其他语言参考 COS STS SDK ：https://github.com/tencentyun/qcloud-cos-sts-sdk
    // STS 详细文档指引看：https://cloud.tencent.com/document/product/436/14048
    // console.log('2333');


    this.nowTime = Math.floor(new Date().getTime() / 1000)
    // 每15分钟获取一次授权,
    if (!this.startTime || (this.nowTime - this.startTime > 60 * 15)) {
      this.http.get('web/cos/sts').subscribe(res  => {
        if (res['code'] === 0) {
          const data = res['data'];
          this.startTime = res['data']['startTime']
          this.expiredTime = res['data']['expiredTime']

          this.credentials = data && data['credentials'];
          if (!data || !this.credentials) {
            return console.error('credentials invalid');
          }

          const authorization = COS.getAuthorization({
              SecretId: this.credentials.tmpSecretId,
              SecretKey: this.credentials.tmpSecretKey,
              Method: options.Method,
              Pathname: options.Pathname,
              Query: options.Query,
              Headers: options.Headers,
              Expires: 60 * 60 * 2,
          });

          callback({
            Authorization: authorization,
            XCosSecurityToken: this.credentials.sessionToken,
          });
        }
      });
    } else {
      const authorization = COS.getAuthorization({
        SecretId: this.credentials.tmpSecretId,
        SecretKey: this.credentials.tmpSecretKey,
        Method: options.Method,
        Pathname: options.Pathname,
        Query: options.Query,
        Headers: options.Headers,
        Expires: 900,
    });

      callback({
        Authorization: authorization,
        XCosSecurityToken: this.credentials.sessionToken,
      });
    }

  }

  uploadFile = (item) => {
    return new Observable ((observed) => {
      this.http.get('web/cos/info').subscribe(res  => {
        this.cos.uploadFile({
          Bucket:     res['bucket'],
          Region:     res['region'],
          Key:        res['prefix'] + item.file.name,
          StorageClass: 'STANDARD',
          SliceSize: 1024 * 1024 * 5,
          AsyncLimit: 5,
          Body: item.file, // 上传文件对象
          onTaskReady: function(taskId) {
            item['file']['taskId'] = taskId;
          },

          onProgress: function(progressData) {
            item.onProgress({
              ...progressData,
              percent: progressData.percent * 100
            });
          },
        }, (err, data) => {
          if (data) {
            this.http.get('web/cos/upload', {
              params: {
                file_size: item.file.size + '',
                file_name: item.file.name + '',
                file_path: data['Location'],
                file_type: item.file.type,
                object_id: this.getQueryUrl(item.action, 'id'),
                object_type: this.getQueryUrl(item.action, 'type'),
              }
            }).subscribe(res => {
              if (res['code'] === 0) {
                item['file']['file_id'] = res['data']['file_id'];
                item['url'] = 'web/file/' + res['data']['file_id'];
                item['file']['object_type'] = this.getQueryUrl(item.action, 'type');
                data['file'] = item['file'];
                data['file_id'] = res['data']['file_id'];
                observed.next(data);
              } else {
                this.message.error(res['msg'] || '网络异常，请稍后再试')
                observed.error(res);
              }
            }, error => {
              this.message.error(error.msg || '网络异常，请稍后再试')
              observed.error(error);
            });
          } else if (err) {
            this.message.error('您电脑时间可能差异过大导致无法上传，请校对电脑时间后重新上传');
            observed.error(err);
          }
        });
      }, err => {
        observed.error(err);
      });
    });
  }

  cancelTask(taskId) {
    this.cos.cancelTask(taskId);
  }

  restartTask (taskId) {
    this.cos.restartTask(taskId);
  }

  getQueryUrl(url, variable) {
    const query = url.split('?')[1];
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (pair[0] === variable) {
        return pair[1] + '';
      }
    }
    return '';
  }

  customReqs = (item) => {
    const messageId = this.message.loading(item.file.name + '正在上传中...', { nzDuration: 0 }).messageId;
    return this.uploadFile(item).subscribe(
      (event) => {
        // 处理成功
        // this.message.success('上传成功')
        this.message.remove(messageId);
        item.onSuccess(event, item.file, event);
        
      }, err => {
        // 处理失败
        this.message.remove(messageId);
        item.onError(err, item.file);
      }
    );
  }


  customReqsNoMsg = (item) => {
    const messageId = this.message.loading(item.file.name + '正在上传中...', { nzDuration: 0 }).messageId;
    return this.uploadFile(item).subscribe(
      (event) => {
        // 处理成功
        this.message.remove(messageId);
        item.onSuccess(event, item.file, event);
      }, err => {
        // 处理失败
        this.message.remove(messageId);
        item.onError(err, item.file);
      }
    );
  }

  beforeUploadImg = (file: File) => {
    const isJPG = (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif');
    if (!isJPG) {
      this.message.error('只能上传 JPG/PNG 格式的文件!');
    }
    const isLt2M = file.size / 1024 / 1024 < 24;
    if (!isLt2M) {
      this.message.error('文件必需小于24MB!');
    }
    return isJPG && isLt2M;
  }

  beforeUploadImgSize = (file: File) => {
    const isLt2M = file.size / 1024 / 1024 < 24;
    if (!isLt2M) {
      this.message.error('文件必需小于24MB!');
      return false;
    }
    return isLt2M;
  }

  beforeUploadFileSize = (file: File) => {
    // const isLt10G = file.size < 1024 * 1024 * 1024 * 10;
    // if (!isLt10G) {
    //   this.message.error('文件必需小于10G!');
    //   return false;
    // }
    return true;
  }

  // 大文件上传校验
  beforeUploadFile = (file: File) => {
    const fileTypes = ['jpg', 'gif', 'png', 'psd', 'ai', 'jpeg',
        'bmp', 'doc', 'docx', 'xls', 'xlsx', 'ppt',
        'pptx', 'pdf', 'zip', '7z', 'tga', 'rar', 'mp3',
        'mp4', 'mov', 'wmv', 'avi', 'swf', 'fla', 'wav',
        'ogg', 'aif', 'aiff', 'flac', 'caf', 'mpg', 'mpeg', 'wma', 'eml', 'txt', 'msg'];
    const fileNames = file.name.split('.');
    const isFILE = fileTypes.some(type => fileNames[fileNames.length - 1] == type);
    if (!isFILE) {
      this.message.error(file.name + `格式不对，格式要求：jpg,gif,png,psd,ai,jpeg,bmp,doc,docx,xls,xlsx,ppt,
      pptx,pdf,zip,7z,tga,rar,mp3,mp4,mov,wmv,avi,swf,fla,wav,ogg,aif,aiff,flac,caf,mpg,mpeg,wma,msg`);
    }
    // const isLt10G = file.size < 1024 * 1024 * 1024 * 10;
    // if (!isLt10G) {
    //   this.message.error('文件必需小于10G!');
    // }
    return isFILE;
  }

  // 文件上传校验
  beforeUpload = (file: File) => {
    // object_type: this.getQueryUrl(item.action, 'type'),
    const fileTypes = ['jpg', 'gif', 'png', 'psd', 'ai', 'jpeg',
        'bmp', 'doc', 'docx', 'xls', 'xlsx', 'ppt',
        'pptx', 'pdf', 'zip', '7z', 'tga', 'rar', 'mp3',
        'mp4', 'mov', 'wmv', 'avi', 'swf', 'fla', 'wav',
        'ogg', 'aif', 'aiff', 'flac', 'caf', 'mpg', 'mpeg', 'wma', 'eml', 'txt', 'msg'];
    const fileNames = file.name.split('.');
    const isFILE = fileTypes.some(type => fileNames[fileNames.length - 1] == type);
    if (!isFILE) {
      this.message.error(file.name + `格式不对，格式要求：jpg,gif,png,psd,ai,jpeg,bmp,doc,docx,xls,xlsx,ppt,
      pptx,pdf,zip,7z,tga,rar,mp3,mp4,mov,wmv,avi,swf,fla,wav,ogg,aif,aiff,flac,caf,mpg,mpeg,wma,msg`);
    }
    // const isLt10G = file.size < 1024 * 1024 * 1024 * 10;
    // if (!isLt10G) {
    //   this.message.error('文件必需小于10G!');
    // }
    return isFILE;
  }

    // 文件上传校验
  beforeUploadExcel = (file: File) => {
    const fileTypes = ['xlsx', 'xls', 'csv'];
    const fileNames = file.name.split('.');
    const isFILE = fileTypes.some(type => fileNames[fileNames.length - 1] == type);
    if (!isFILE) {
      this.message.error(file.name + `格式不对，格式要求：csv, xls, xlsx`);
    }
    return isFILE;
  }

  delFile (id) {
    return new Observable ((observed) => {
      this.http.post('web/cos/del-file', {
        file_id: id
      }).subscribe(result => {
        if (result['code'] === 0) {
          this.message.success(result['msg']);
          observed.next();
        } else {
          this.message.error(result['msg']);
          observed.error();
        }
      }, (err) => {
        this.message.error('网络异常，请稍后再试');
        observed.error();
      });
    })
  }

  downloadFileByCos (url: string, filename: string = '') {
    const fileUrl = new URL(url) 
    this.cos.getObjectUrl({
      Bucket: this.config.Bucket,
      Region: this.config.Region,
      Key: decodeURIComponent(fileUrl.pathname),
    }, (err, data) => {
      console.log(data)
      if (err) return console.log(err);
      setTimeout(() => {
        var downloadUrl = data.Url + (data.Url.indexOf('?') > -1 ? '&' : '?') + 'response-content-disposition=attachment';
        // window.open(downloadUrl);
        this.downloadFileByUrl(downloadUrl)
      }, 60);
    });
  }


  downloadFileByBlob (url: string, filename: string = '') {
    this.http.get(url, {
      responseType: "blob",
    }).subscribe(resp=>{

      
      const ContentType = resp.type
      if (ContentType && !filename.substring(0, filename.lastIndexOf("."))) {

        const type = ContentType.split('/')[1];
        filename = filename + '.' + type
      }

      var blob = new Blob([resp], { type: 'application/octet-stream' });
      const BlobURL = URL.createObjectURL(blob);
      this.downloadFileByUrl(BlobURL, filename)
    }, err => {
      // console.log(err)
      this.downloadFileByUrl(url, filename)
    })
  }

  // 下载文件
  downloadFileByUrl (url: string, filename: string = '') {
    if (!filename && url) {
      filename  = url.substring( url.lastIndexOf('/')+1, url.length)
    }
    const eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    eleLink.href = url;
    eleLink.target = '_blank';
    document.body.appendChild(eleLink);
    eleLink.click();
    setTimeout(() => {
      document.body.removeChild(eleLink);
    }, 0);
  }

  // 下载文件
  downloadFile (url: string, filename: string = '') {
    // 待补充
    const mediaTypeArr = [
      // 图片
      '.png', '.bmp', 'gif', 'jpg', 'jpeg',

      // 视频
      'mp4', '.avi', '.mov', '.mpv', '.wmv',  

      // 音频
      '.mp3',

      // 文本
      '.txt', '.doc', '.xml'
    ]

    // 修改协议头

    if (url.indexOf('myqcloud.com') > -1 ) { 
      if (mediaTypeArr.some(str => filename.endsWith(str))) {
        this.downloadFileByBlob(url, filename)
      } else {
        this.downloadFileByUrl(url, filename)
      }
    } else if (url) {
      this.http.get(url + '/60/preview').subscribe(result => {
        let url = result['data']['file_path'];
        if (url) {
          url = url.replace('https:', location.protocol);

          // 如果是 wbp 下载文件
          if (url.indexOf('wbp-1258344700') > -1) {
            this.downloadFileByCos(url, filename)
          } else if (mediaTypeArr.some(str => filename.endsWith(str))) {
            this.downloadFileByBlob(url, filename)
          } else {
            this.downloadFileByUrl(url, filename)
          }
        }
      }, err => {
        console.log(err)
      })
    }
  }

    // 下载文件, 浏览器能直接预览的使用blob, 浏览器无法预览的直接下载
    downloadImage (url, filename = null) {
      // 待补充
      const arr = ['.apng', '.avif', '.bmp', '.gif', 'ico', '.cur', '.jpg', '.jpeg', '.jfif', '.pjepeg', '.pjp', '.png', '.svg',
      '.tif', '.webp', '.rmvb', 'mp4', '3gp', 'mpeg', 'wmv', 'avi', 'mov', 'mpv']
  
      if (!arr.some(item => filename.endsWith(item))) {
        this.downloadByUrl(url, filename)
      } else {
        this.http.get(url, {
          responseType: "blob",
        }).subscribe(resp=>{
          var eleLink = document.createElement('a');
          eleLink.download = filename ? filename : '';
          eleLink.target = '_blank';
          eleLink.style.display = 'none';
          // 字符内容转变成blob地址
          var blob = new Blob([resp]);
          eleLink.href = URL.createObjectURL(blob);
          // 触发点击
          document.body.appendChild(eleLink);
          eleLink.click();
          // 然后移除
          document.body.removeChild(eleLink);
        })
      }
    }
  
    downloadByUrl (url, name = null) {
      const eleLink = document.createElement('a');
      eleLink.download =  name ? name : 'file';
      eleLink.style.display = 'none';
      eleLink.href = url;
      eleLink.target = '_blank';
      document.body.appendChild(eleLink);
      eleLink.click();
      document.body.removeChild(eleLink);
    }
  
}

