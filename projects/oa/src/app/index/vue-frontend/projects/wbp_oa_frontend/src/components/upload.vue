<template>
  <a-upload :file-list="fileList" :action="`/web/cos/upload?type=${type}`" :before-upload="beforeUpload" multiple
    :customRequest="customReqs" @remove="handle_remove">
    <slot name="default"></slot> 
    <slot name="tips"></slot>
  </a-upload>
</template>

<script lang="ts">
import { defineComponent, ref, toRaw } from 'vue';
import * as R from 'ramda'
import { message } from 'ant-design-vue';
import http from '../axios/http';
import COS from 'cos-js-sdk-v5';
import { get_cos_info, get_cos_sts } from '../api/cos';
export default defineComponent({
  props: {
    value: {
      type: Array,
      required: true,
      default: []
    },
    type: {
      type: String,
      required: false,
      default: '1055'
    }
  },
  emits: ['update:value'],
  setup({ value }, { emit }) {
    const fileList = ref(R.clone(value))

    // 大文件上传校验
    const beforeUpload = (file: File) => {
      // 检验图片类型和像素大小
      const is_image = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt32M = file.size < 1024 * 1024 * 24;
      if (is_image && !isLt32M) {
        message.error(
          'JPG/PNG 等预览图片大小不超过32MB、宽高不超过30000像素且总像素不超过2.5亿像素!'
        );
        return false;
      }

      // 要求上传格式
      const fileTypes = ['jpg', 'gif', 'png', 'psd', 'ai', 'jpeg', 'bmp', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'zip', '7z', 'tga', 'rar', 'mp3', 'mp4', 'mov', 'wmv', 'avi', 'swf', 'fla', 'wav', 'ogg', 'aif', 'aiff', 'flac', 'caf', 'mpg', 'mpeg', 'wma', 'eml', 'txt', 'msg',];
      const fileNames = file.name.split('.');
      const isFILE = fileTypes.some(
        type => fileNames[fileNames.length - 1] == type
      );
      if (!isFILE) {
        message.error(
          file.name +
          `格式不对，格式要求：jpg,gif,png,psd,ai,jpeg,bmp,doc,docx,xls,xlsx,ppt,
      pptx,pdf,zip,7z,tga,rar,mp3,mp4,mov,wmv,avi,swf,fla,wav,ogg,aif,aiff,flac,caf,mpg,mpeg,wma,msg`
        );
      }
      // const isLt10G = file.size < 1024 * 1024 * 1024 * 10;
      // if (!isLt10G) {
      //   this.message.error('文件必需小于10G!');
      // }
      return isFILE;
    };

    function getQueryUrl(url: any, variable: any) {
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

    let nowTime: any = Math.floor(new Date().getTime() / 1000);
    let startTime: any = null;
    let expiredTime: any = null;
    let credentials: any = null;

    const getAuthorization = (options, callback) => {
      // 服务端 JS 和 PHP 例子：https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/
      // 服务端其他语言参考 COS STS SDK ：https://github.com/tencentyun/qcloud-cos-sts-sdk
      // STS 详细文档指引看：https://cloud.tencent.com/document/product/436/14048
      // console.log('2333');

      // 每15分钟获取一次授权,
      if (!startTime || nowTime - startTime > 60 * 15) {
        get_cos_sts().then(res => {
          if (res['code'] === 0) {
            const data = res['data'];
            startTime = res['data']['startTime'];
            expiredTime = res['data']['expiredTime'];

            credentials = data && data['credentials'];
            if (!data || !credentials) {
              return console.error('credentials invalid');
            }

            const authorization = COS.getAuthorization({
              SecretId: credentials.tmpSecretId,
              SecretKey: credentials.tmpSecretKey,
              Method: options.Method,
              Pathname: options.Pathname,
              Query: options.Query,
              Headers: options.Headers,
              Expires: 60 * 60 * 2,
            });

            callback({
              Authorization: authorization,
              XCosSecurityToken: credentials.sessionToken,
            });
          } else {
            message.error(
              '您电脑时间可能差异过大导致无法上传，请校对电脑时间后重新上传'
            );
          }
        });
      } else {
        const authorization = COS.getAuthorization({
          SecretId: credentials.tmpSecretId,
          SecretKey: credentials.tmpSecretKey,
          Method: options.Method,
          Pathname: options.Pathname,
          Query: options.Query,
          Headers: options.Headers,
          Expires: 900,
        });

        callback({
          Authorization: authorization,
          XCosSecurityToken: credentials.sessionToken,
        });
      }
    };

    const customReqs = async (item: any) => {
      item.name = item.file.name
      fileList.value?.push(item);
      item = R.last(fileList.value)
      const pattern =
        /[`~!@#$^&*()=|{}':;',\\\[\]<>\/?~！@#￥……&*（）——|{}【】'；：""'。，、？\s]/g;
      const filename = item.file.name.replace(pattern, '#');
      const res = await get_cos_info();
      const upload_context = {
        ...res,
        Bucket: res['bucket'],
        Region: res['region'],
        Key: res['prefix'] + filename,
        StorageClass: 'STANDARD',
        SliceSize: 1024 * 1024 * 5,
        AsyncLimit: 5,
        Body: item.file, // 上传文件对象
        onTaskReady: (taskId) => {
          item['file']['taskId'] = taskId;
          item.status = 'uploading'
          console.log('ready: ', item)
        },
        onProgress: (progressData) => {
          // const percent = {
          //   ...progressData,
          //   percent: progressData.percent * 100,
          // };
          // item.percent = percent;
          // item.onProgress(item.percent);
          item.percent = progressData.percent * 100;
          item.status = 'uploading'
          console.log('progress: ', item)
        },
        onFileFinish: (err, data, options) => {
          item.status = err ? 'error' : 'done'
          emit('update:value', R.filter(f => f.status === 'done', fileList.value))
          console.log('finish: ', item)
        }
      }
      item.file.object_id = getQueryUrl(item.action, 'id');
      item.file.object_type = getQueryUrl(item.action, 'type');

      new COS({
        getAuthorization,
        UploadCheckContentMd5: true,
        ProgressInterval: 1000,
      }).uploadFile(
        upload_context,
        async (err: any, data: any) => {
          console.log(data)
          if (err) {
            console.error(err)
          }
          // if (data) {
          //   const res = await uploadFiles({
          //     file_size: item.file.size + '',
          //     file_name: item.file.name + '',
          //     file_path: item.cdn_domain.split('//')[1] + '/' + item.Key,
          //     file_type: item.file.type,
          //     object_id: item.file.object_id,
          //     object_type: item.file.object_type,
          //   });
          //   if (res['code'] === 0) {
          //     item['file']['file_id'] = res['data']['file_id'];
          //     item['url'] = 'web/file/' + res['data']['file_id'];
          //     item['file']['object_type'] = getQueryUrl(item.action, 'type');
          //     item['name'] = item.file.name;
          //     item.status = 'done';
          //     emit('update:value', fileList.value)
          //     message.success('文件上传成功');
          //   } else {
          //     item.status = 'error';
          //     message.error(res['msg'] || '文件上传失败, 请稍后再试!');
          //   }
          // }
        }
      );
    };

    // 下载图片
    function download(url: any, filename: any) {
      downloadFile(url, filename);
    }

    // 下载文件
    function downloadFile(url: string, filename: string = '') {
      // 待补充
      const mediaTypeArr = [
        // 图片
        '.png',
        '.bmp',
        'gif',
        'jpg',
        'jpeg',

        // 视频
        'mp4',
        '.avi',
        '.mov',
        '.mpv',
        '.wmv',

        // 音频
        '.mp3',

        // 文本
        '.txt',
        '.doc',
        '.xml',
      ];

      // 修改协议头

      if (url.indexOf('myqcloud.com') > -1) {
        if (mediaTypeArr.some(str => filename.endsWith(str))) {
          downloadFileByBlob(url, filename);
        } else {
          downloadFileByUrl(url, filename);
        }
      } else if (url) {
        http.get(url + '/60/preview').then(
          result => {
            let url = result['data']['file_path'];
            if (url) {
              url = url.replace('https:', location.protocol);

              // 如果是 wbp 下载文件
              if (url.indexOf('wbp-1258344700') > -1) {
                downloadFileByCos(url, filename);
              } else if (mediaTypeArr.some(str => filename.endsWith(str))) {
                downloadFileByBlob(url, filename);
              } else {
                downloadFileByUrl(url, filename);
              }
            }
          },
          err => {
            console.log(err);
          }
        );
      }
    }

    // function downloadFileByCos (url: string, filename: string = '') {
    //   const fileUrl = new URL(url)
    //   this.cos.getObjectUrl({
    //     Bucket: this.config.Bucket,
    //     Region: this.config.Region,
    //     Key: decodeURIComponent(fileUrl.pathname),
    //   }, (err, data) => {
    //     console.log(data)
    //     if (err) return console.log(err);
    //     setTimeout(() => {
    //       var downloadUrl = data.Url + (data.Url.indexOf('?') > -1 ? '&' : '?') + 'response-content-disposition=attachment';
    //       // window.open(downloadUrl);
    //       this.downloadFileByUrl(downloadUrl)
    //     }, 60);
    //   });
    // }
    const handle_remove = (file) => {
      console.log('remove: ', file)
      fileList.value = R.reject(f => f.uid === file.uid, fileList.value)
    }
    return {
      beforeUpload,
      customReqs,
      fileList,
      handle_remove,
    }
  },
});
</script>

<style scoped>
</style>
