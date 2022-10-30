import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './create-story.component.html'
})

export class CreateStoryComponent  implements OnInit {
  loading = false;
  project_select; // 项目信息
  brand_principal_select; // 品牌经理负责人
  story_name; // 需求名称
  creator; // 录入人
  operator; // 经办人
  brand_product_manager; // 经办人
  budget_type; // 预算类型
  story_remark; // 需求说明
  category_select; // 有权限的类别
  workload_unit_list; // 工作量单位
  thing_config_group = []; // 物件配置信息
  selected_first_category = [];
  price_library; // 通用价格库
  formData = {
    id: '0'
  };
  deleteThingId = []; // 要删除的物件ID
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params) {
        this.formData['id'] = params['storyId'];
      }
    });
    this.http.get('web/demand/get-story-info', {
      params: {
        'story_id': this.formData['id'],
      },
      observe: 'response'
    }).subscribe( response => {
      if (response['body']['code'] === 0) {
        this.project_select = response['body']['data']['project'];
        this.formData['story_code'] = response['body']['data']['story_code'];
        this.category_select = response['body']['data']['category'];
        this.workload_unit_list = response['body']['data']['workload_unit'];
        this.creator = response['body']['data']['creator'];
        this.formData['creator'] = this.creator[0]['value'];
        this.formData['category_select'] = response['body']['data']['category_select'];
        this.selected_first_category = response['body']['data']['category_select'];
        this.price_library = response['body']['data']['price_library'];
        this.budget_type = response['body']['data']['budget_type_list'];
        if (this.formData['id']) {
          this.formData['project'] = response['body']['data']['project_id'];
          this.onProjectSelectChange(response['body']['data']['project_id']);
          this.formData['story_name'] = response['body']['data']['story_name'];
          this.formData['brand_product_manager'] = response['body']['data']['manager_id'];
          this.formData['story_remark'] = response['body']['data']['story_remark'];
          this.formData['budget_type'] = response['body']['data']['budget_type'];
        } else {
          if (this.budget_type.length > 1) {
            this.formData['budget_type'] = this.budget_type[0]['value'];
          }
        }
        this.onloadThing();
      }
    });
  }

  onProjectSelectChange(value) {
    if (!value) {
      return false;
    }
    this.project_select.forEach((item, index) => {
      if (value == item.id) {
        this.formData['product_name'] = item['product_name'];
        this.formData['project_group_name'] = item['project_group_name'];
        this.brand_principal_select = item['brand_principal'];
        this.formData['brand_principal'] = item['brand_principal'][0]['value'];
        this.brand_product_manager = item['brand_product_manager'];
      }
    });
  }

  onFirstCategorySelectChange(value) {
    if (!this.selected_first_category) {
      this.category_select.forEach((item, index) => {
        if (item.id == value[0]) {
          this.thing_config_group.push({id: item.id, title: item.title, list: []});
        }
      });
    } else if (value.length == 0) {
      this.thing_config_group[0]['list'].forEach((item, index) => {
        if (item['id']) {
          this.deleteThingId.push(item.id);
        }
      });
      this.thing_config_group = [];
    } else {
      if (this.selected_first_category.length < value.length) {
        let result = this.diffArray(value, this.selected_first_category);
        this.category_select.forEach((item, index) => {
          if (item.id == result) {
            this.thing_config_group.push({id: item.id, title: item.title, category_price: 0, list: []});
          }
        });
      } else {
        let result = this.diffArray(this.selected_first_category, value);
        this.thing_config_group.forEach((item, index) => {
          if (item.id == result) {
            if (item['list']) {
              item['list'].forEach((thing, ind) => {
                if (thing['id']) {
                  this.deleteThingId.push(thing.id);
                }
              });
            }
            this.thing_config_group.splice(index, 1);
          }
        });
      }
    }
    this.selected_first_category = value;
  }

  diffArray(arr1, arr2) {
    for (let i = 0; i < arr1.length; i++) {
      if (arr2.indexOf(arr1[i]) < 0) {
        return arr1[i];
      }
    }
    return 0;
  }

  addThing(firstCategoryId) {
    this.thing_config_group.forEach((item, index) => {
      if (item['id'] == firstCategoryId) {
        this.thing_config_group[index]['list'].push({
          'id': 0,
          'thing_name': '',
          'category_id': 0,
          'produce_breakdown_list': [],
          'pre_workload_unit_id': '0',
          'produce_grade_list': [],
          'pre_produce_grade_id': 0,
          'expected_complete_date': '',
          'remark': '',
          'pre_total_price': 0
        });
      }
    });
  }

  onSecondCategoryChange(value, thingGroupIndex, thingIndex) {
    this.category_select.forEach((item, index) => {
      if (this.thing_config_group[thingGroupIndex]['id'] == item['id']) {
        item.child_category.forEach((childItem, index) => {
          if (childItem.id == value) {
            this.thing_config_group[thingGroupIndex]['list'][thingIndex]['produce_grade_list'] = childItem['produceGrades'];
            let produceBreakdownTemp = [];
            for (let i = 0; i < childItem.produceBreakdowns.length; i++) {
              produceBreakdownTemp.push({id: childItem.produceBreakdowns[i].id, title: childItem.produceBreakdowns[i].title, value: ''});
            }
            this.thing_config_group[thingGroupIndex]['list'][thingIndex]['produce_breakdown_list'] = produceBreakdownTemp;
          }

        })
      }
    });
    this.predictionPriceChange('', '', thingGroupIndex, thingIndex);
  }

  copyThing(thingGroupIndex, thingIndex) {
    let thing = [];
    thing = JSON.parse(JSON.stringify(this.thing_config_group[thingGroupIndex]['list'][thingIndex]));
    thing['id'] = 0;
    thing['thing_code'] = '';
    this.thing_config_group[thingGroupIndex]['list'].push(thing);
    // 新增的条目进行排序
    for (let i = this.thing_config_group[thingGroupIndex]['list'].length - 1; i > thingIndex + 1; i--) {
      let thingTemp = this.thing_config_group[thingGroupIndex]['list'][i];
      this.thing_config_group[thingGroupIndex]['list'][i] = this.thing_config_group[thingGroupIndex]['list'][i - 1];
      this.thing_config_group[thingGroupIndex]['list'][i - 1] = thingTemp;
    }
    this.predictionPriceChange('', '', thingGroupIndex, thingIndex + 1);
  }

  deleteThing(thingGroupIndex, thingIndex) {
    if (this.thing_config_group[thingGroupIndex]['list'][thingIndex]['id']) {
      this.deleteThingId.push(this.thing_config_group[thingGroupIndex]['list'][thingIndex]['id']);
    }
    this.thing_config_group[thingGroupIndex]['list'].splice(thingIndex, 1);
    this.statisticThingPrice(thingGroupIndex);
  }

  saveStory(isSubmit = false) {
    let postData = {
      'story': this.formData,
      'thing': this.thing_config_group,
      'deleteThingId': this.deleteThingId,
    };
    this.http.post('web/demand/story-save', postData, {
      observe: 'response'
    }).subscribe(response => {
      if (response['body']['code'] === 0) {
        this.formData['id'] = response['body']['story_id'];
        this.onloadThing(isSubmit);
      }
    });
  }

  submitStory() {
    this.saveStory(true);
  }

  onloadThing(isSubmit = false) {
    if (this.formData['id']) {
      // @ts-ignore
      this.http.get('web/demand/load-thing', {
       params: {
         story_id: this.formData['id']
       },
        observe: 'response'
      }).subscribe(response => {
        if (response['body']['code'] == 0) {
          this.thing_config_group = JSON.parse(JSON.stringify(response['body']['data']));
        }
        this.statisticAllThingPrice();
        if (isSubmit === true) {
          // 遍历数据提取物件ID
          let thing_id = [];
          this.thing_config_group.forEach((thingGroup, thingGroupIndex) => {
            thingGroup['list'].forEach((thing, thingIndex) => {
              if (thing.id) {
                thing_id.push(thing.id);
              }
            });
          });
          this.http.post('/web/demand/demand-submit', {thing_id: thing_id}).subscribe(result => {
            // console.log('demand_submit', result);
          });
        }
      });
    }
  }

  // 第次改值都遍历thing_config_group重新计算价格
  predictionPriceChange(key, value, thingGroupIndex, thingIndex) {
    let thing = this.thing_config_group[thingGroupIndex]['list'][thingIndex];
    let thing_price = 0;
    if (key == 'produce_grade') {
      thing['produce_breakdown_list'].forEach((produce_breakdown, produceIndex) => {
        if (produce_breakdown['value'] != '') {
          this.price_library.forEach((price, priceIndex) => {
            if (price['category_id'] == thing['category_id'] &&
              price['produce_grade_id'] == value &&
              price['workload_unit_id'] == thing['pre_workload_unit_id'] &&
              price['produce_breakdown_id'] == produce_breakdown['id']
            ) {
              thing_price += parseFloat(produce_breakdown['value']) * parseFloat(price['unit_price']);
            }
          });
        }
      });
    } else if (key == 'workload_unit_id') {
      thing['produce_breakdown_list'].forEach((produce_breakdown, produceIndex) => {
        if (produce_breakdown['value'] != '') {
          this.price_library.forEach((price, priceIndex) => {
            if (price['category_id'] == thing['category_id'] &&
              price['produce_grade_id'] == thing['pre_produce_grade_id'] &&
              price['workload_unit_id'] == value &&
              price['produce_breakdown_id'] == produce_breakdown['id']
            ) {
              thing_price += parseFloat(produce_breakdown['value']) * parseFloat(price['unit_price']);
            }
          });
        }
      });
    } else {
      thing['produce_breakdown_list'].forEach((produce_breakdown, produceIndex) => {
        if (produce_breakdown['value'] != '') {
          this.price_library.forEach((price, priceIndex) => {
            if (price['category_id'] == thing['category_id'] &&
              price['produce_grade_id'] == thing['pre_produce_grade_id'] &&
              price['workload_unit_id'] == thing['pre_workload_unit_id'] &&
              price['produce_breakdown_id'] == produce_breakdown['id']
            ) {
              thing_price += parseFloat(produce_breakdown['value']) * parseFloat(price['unit_price']);
            }
          });
        }
      });
    }

    this.thing_config_group[thingGroupIndex]['list'][thingIndex]['pre_total_price'] = thing_price;
    this.statisticThingPrice(thingGroupIndex);
  }

  // 统计物件的价格
  statisticThingPrice(thingGroupIndex) {
    let prediction_price = 0;
    this.thing_config_group[thingGroupIndex]['list'].forEach((thing, thingIndex) => {
      prediction_price += parseFloat(thing['pre_total_price']);
    });
    this.thing_config_group[thingGroupIndex]['category_price'] = prediction_price;
  }

  statisticAllThingPrice() {
    let prediction_price = 0;
    this.thing_config_group.forEach((thingGroup, thingGroupIndex) => {
      thingGroup['list'].forEach((thing, thingIndex) => {
        prediction_price += parseFloat(thing['pre_total_price']);
      });
      thingGroup['category_price'] = prediction_price;
    });
  }

  trackByFn(index, item) {
    return item && item.id ? item.id : index; // or item.id
  }
}
