import { Component, ElementRef, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FieldType,  } from '@ngx-formly/core';
import { CosService } from '../../../../services/cos.service';
import { distinctUntilChanged, filter, debounceTime } from 'rxjs/operators';
import Quill from 'quill';

const font = Quill.import('formats/font');

font.whitelist = ['mirza', 'roboto', 'aref', 'serif', 'sansserif', 'monospace'];
Quill.register(font, true);

@Component({
  selector: 'app-quill-component',
  templateUrl: './ngx-quill.component.html',
  styleUrls: ['./ngx-quill.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NgxQuillComponent extends FieldType implements AfterViewInit {

  constructor(
    private elementRef: ElementRef,
    private http: HttpClient,
    private cos: CosService
  ) {
    super();
  }

  // 基本数据
  quillEditor: any;
  editorElem: HTMLElement;
  content: any;
  defaultModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': new Array<any>() }, { 'background': new Array<any>() }],          // dropdown with defaults from theme
      [{ 'font': new Array<any>() }],
      [{ 'align': new Array<any>() }],

      ['clean'],                                         // remove formatting button

      ['link', 'image', 'video']                         // link and image, video
    ]
  };

  action = 'web/plupload/upload-big?object_type=1430';

  get contents () {
    return this.to.contents;
  }

  // 视图加载完成后执行初始化
  ngAfterViewInit() {
    this.editorElem = this.elementRef.nativeElement.children[0];
    this.quillEditor = new Quill(this.editorElem, Object.assign({
      modules: this.defaultModules,
      placeholder: '请输入',
      readOnly: false,
      theme: 'snow',
      boundary: document.body
    }, this.options || {}));

    // 写入内容
    if (this.formControl.value) {
      this.quillEditor.clipboard.dangerouslyPasteHTML(0, this.formControl.value);
      this.quillEditor.blur();
    }

    this.quillEditor.on('selection-change', (range: any) => {
      if (!range) {
        // this.onModelTouched();
        // this.blur.emit(this.quillEditor);
      } else {
        // this.focus.emit(this.quillEditor);
      }
    });
    this.quillEditor.on('text-change', (delta: any, oldDelta: any, source: any) => {

      let html = this.editorElem.children[0].innerHTML;
      if (html === '<p><br></p>') {
        html = null;
      }
      console.log(html)
      this.formControl.patchValue(html);
    });

    this.quillEditor.getModule('toolbar').addHandler('image', this.handlerImage.bind(this));
    this.quillEditor.root.addEventListener('drop', this.dropHandle.bind(this), false);


    // this.form.root.get('name').valueChanges.subscribe()
    // 监听文件变化
    // console.log(this.form)

    this.formControl.valueChanges
      .pipe(debounceTime(60))
      .subscribe(item => {
        if (this.to.contents !== -1) {
          console.log(this.to.contents)
          this.quillEditor.deleteText(0, this.quillEditor.getLength())
          this.quillEditor.clipboard.dangerouslyPasteHTML(0, this.to.contents);
          this.quillEditor.blur();
          this.to.contents = -1;
        }
      })
  }

  handlerImage () {
    const Imageinput = document.createElement('input');
    Imageinput.setAttribute('type', 'file');
    Imageinput.setAttribute('name', 'file');
    Imageinput.setAttribute('accept', 'image/png, image/gif, image/jpeg');
    Imageinput.classList.add('ql-image');
    Imageinput.addEventListener('change', () => {
      const file = Imageinput.files[0];
      const formData = new FormData();
      formData.append('file', file);
      if (Imageinput.files != null && Imageinput.files[0] != null) {
        this.uploadFile(file)
      }
    });
    Imageinput.click();
  }

  /**
   * @description 粘贴
   * @param e
   */
  pasteHandle(e) {
    const clipboardData = e.clipboardData;
    let i = 0;
    let items, item, types;

    if (clipboardData) {
      items = clipboardData.items;

      if (!items) {
        return;
      }
      item = items[0];
      types = clipboardData.types || [];

      for (; i < types.length; i++) {
        if (types[i] === 'Files') {
          item = items[i];
          break;
        }
      }
      if (item && item.kind === 'file' && item.type.match(/^image\//i)) {
        e.preventDefault();
        const file = item.getAsFile();
        this.uploadFile(file)
      }
    }
  }

    /**
   * 拖拽
   * @param e
   */
  dropHandle(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0]; // 获取到第一个上传的文件对象
    this.uploadFile(file)
  }

  uploadFile (file) {
    this.cos.uploadFile({
      file: file,
      action: '/web/cos/upload?type=1430'
    }).subscribe(item => {
      if (item['statusCode'] === 200) {
        // const src =  'web/file/' + item['file']['file_id'];
        const src = location.protocol + '//'+ item['Location']
        const range = this.quillEditor.getSelection(true);
        const index = range.index + range.length;
        this.quillEditor.insertEmbed(range.index, 'image', src);
      }
    })
  }
}

