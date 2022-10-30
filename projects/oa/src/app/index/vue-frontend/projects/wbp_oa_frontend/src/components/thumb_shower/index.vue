<template>
  <a-popover v-if="show" overlayClassName="scoped-thumb-shower-css" destroyTooltipOnHide>
    <template #content>
      <div class="min-w-[100px] min-h-[100px] flex items-center max-w-[400px]" @mouseenter="() => set_entered(true)"
        @mouseleave="() => set_entered(false)">
        <DownloadOutlined v-if="R.includes(file_type, ['图片', '压缩包', '其它', null])"
          class="downloader absolute bottom-[15px] right-[10px] z-10" :class="entered ? 'opacity-100' : 'opacity-0'"
          @click="download" @mouseenter="() => set_entered(true)" @mouseleave="() => set_entered(false)" />
        <template v-if="file_type === '图片'">
          <span v-if="file_size > 5242880" class="w-full h-full break-all p-3">
            图片({{ slug_url }})文件大于 5M，请下载查看
          </span>
          <a-image v-else :src="slug_url" :preview="false" />
        </template>
        <video v-else-if="file_type === '视频'" class="w-full h-full" :src="slug_url" autoplay controls></video>
        <audio v-else-if="file_type === '音频'" class="m-[10px]" :src="slug_url" controls autoplay>
        </audio>
        <div v-else-if="file_type === '压缩包'" class="w-full h-full break-all p-3">
          <span>不支持预览压缩包文件({{ slug_url }})，请下载后解压查看</span>
        </div>
        <div v-else class="w-full h-full break-all p-3">
          <span>不支持预览({{ slug_url }})，请下载后使用适当工具查看</span>
          <br />
          <span class="font-bold">以下格式文件尚未被支持(psd, ai, doc, docx, xls, xlsx, ppt, pptx, pdf, tga, wmv, avi, caf, wma,
            mov, mpg, mpeg)</span>
        </div>
      </div>
    </template>
    <div class="h-full">
      <a-image :src="thumb_url" height="100px" width="100px" :preview="false"
        fallback="data:image/png;base64,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" />
    </div>
  </a-popover>
  <vxe-null-cell v-else class="h-full" />
</template>
<script lang="tsx" setup>
import { ref, computed } from 'vue'
import { saveAs } from 'file-saver'
import * as R from 'ramda'
import { DownloadOutlined } from '@ant-design/icons-vue';

const { slug } = defineProps(['slug'])
const thumb_url = ref('')
const slug_url = ref(slug)
const entered = ref(false)

const set_entered = (v) => {
  entered.value = v
}

const loading = ref(true)

const show = computed(() => {
  return thumb_url.value && slug_url.value
})

const file_type = ref(null as any)
const file_size = ref(0)

const download = () => {
  // const _url = new URL(slug_url.value)
  // const f_name = R.last(R.split('/', _url.pathname))
  saveAs(slug_url.value)
}

if (slug) {
  if (slug.startsWith("/web")) {
    try {
      const { data: { file_path, file_type: f_type, file_size: f_size } } = await fetch(`${slug}/100/pre`).then(res => res.json())
      thumb_url.value = file_path
      file_size.value = f_size
      file_type.value = (() => {
        if (R.includes(f_type, ['application/zip', 'application/x-tar', 'application/gzip', 'application/x-bzip', 'application/x-bzip2', 'application/x-xz', 'application/x-7z-compressed', 'application/vnd.rar'])) {
          return '压缩包'
        } else if (R.includes(f_type, ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp'])) {
          return '图片'
        } else if (R.includes(f_type, ['audio/mpeg', 'audio/wav', 'audio/x-aiff', 'audio/ogg', 'audio/webm'])) {
          return '音频'
        } else if (R.includes(f_type, ['video/mp4', 'video/ogg', 'video/webm', 'application/x-shockwave-flash'])) {
          return '视频'
        }
        // if (R.includes(f_type, ['zip', 'tar', 'gz', 'bz2', 'xz', 'Z', '7z', 'rar'])) {
        //   return '压缩包'
        // } else if (R.includes(f_type, ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'])) {
        //   return '图片'
        // } else if (R.includes(f_type, ['mp3', 'wav', 'aif', 'aiff'])) {
        //   return '音频'
        // } else if (R.includes(f_type, ['mp4', 'ogg', 'webm', 'fla', 'flac', 'swf'])) {
        //   return '视频'
        // } else if (R.includes(f_type, ['psd', 'ai', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'tga', 'wmv', 'avi', 'caf', 'wma', 'mov', 'mpg', 'mpeg'])) {
        //   return '其它'
        // }
        return null
      })()
    } catch (e) {
      console.error(e)
      thumb_url.value = slug
    }
  }
}

loading.value = false
</script>
<style lang="less">
.scoped-thumb-shower-css {
  .downloader {
    width: 30px;
    height: 30px;
    color: white;
    padding: 3px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 3px;
    transition: opacity .2s linear;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  .ant-popover-inner-content {
    padding: 0;
  }
}
</style>