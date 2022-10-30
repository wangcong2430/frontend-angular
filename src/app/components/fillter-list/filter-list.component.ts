import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-component-filter-list',
  templateUrl: './filter-list.component.html',
  styleUrls: ['./filter-list.component.css']
})
export class FilterListComponent implements OnInit {
  @Input() queryFields;
  @Input() list;
  @Input() columns = [];

  isSearchDropdown = false;
  isColumnDropdown = false;
  serviceData; // 保存页面数据
  filterValue = '';
  constructor(
    private router: Router
  ) {}

  ngOnInit() {}

  dropdownChange(bol, type) {
    if (bol === false) {
      this.closeDropdown(type);
    }
  }

  // 设置已选择缓存
  closeDropdown(type) {
    if (type === 'search') {
      let searchList = {};
      if (localStorage.getItem('searchDropdown')) {
        searchList = JSON.parse(localStorage.getItem('searchDropdown'));
        searchList[this.router.url] = [];
      } else {
        searchList = {
          [this.router.url]: []
        };
      }
      this.isSearchDropdown = false;
      this.queryFields.forEach(item => {
        searchList[this.router.url].push({
          key: item.key,
          show: item.show
        });
      });
      localStorage.setItem('searchDropdown', JSON.stringify(searchList));
    } else if (type === 'column') {
      this.isColumnDropdown = false;
      let columnList = {};

      if (localStorage.getItem('columnDropdown') && localStorage.getItem('searchDropdown')) {
        columnList = JSON.parse(localStorage.getItem('searchDropdown'));
        columnList[this.router.url] = [];
      } else {
        columnList = {
          [this.router.url]: []
        };
      }
      this.columns.forEach(item => {
        columnList[this.router.url].push({
          key: item.key,
          show: item.show
        });
      });
      localStorage.setItem('columnDropdown', JSON.stringify(columnList));
    }

  }
  // 获取缓存
  getDropdown() {
    const url = this.router.url;
    if (localStorage.getItem('searchDropdown')) {
      const searchList = JSON.parse(localStorage.getItem('searchDropdown'));
      if (searchList[url]) {
        this.queryFields.forEach(item => {
          searchList[url].forEach(search => {
            if (item.key === search.key) {
              item.show = search.show;
            }
          });
        });
      }
    }
    if (localStorage.getItem('columnDropdown')) {
      const columnList = JSON.parse(localStorage.getItem('columnDropdown'));
      if (columnList[url]) {
        this.columns.forEach(item => {
          columnList[url].forEach(column => {
            if (item.key === column.key) {
              item.show = column.show;
            }
          });
        });
      }
    }
  }
  // 页面过滤
  searchData(value) {
    this.list.forEach(item => {
      item.show = JSON.stringify(item).indexOf(value) === -1 ? false : true;
    });
  }
}
