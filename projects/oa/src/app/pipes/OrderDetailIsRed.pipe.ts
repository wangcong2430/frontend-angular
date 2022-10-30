import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'orderDetailIsRed' })
export class OrderDetailIsRedPipe implements PipeTransform {
  transform(item) {
    let category, produce;
    if (item.pre_produce_breakdown && !Array.isArray(item.pre_produce_breakdown)) {
      category = JSON.parse(item.pre_produce_breakdown);
    } else  {
        category = item.pre_produce_breakdown;
    }

    if (item.produce_breakdown && !Array.isArray(item.produce_breakdown)) {
      produce = JSON.parse(item.produce_breakdown);
    } else {
        produce = item.produce_breakdown;
    }

    if (!category || !produce || category.length === 0) {
        return false;
    }

    return produce.filter(item => {
      return item.value;
    }).some(item => {
      return category.find(i => i.id === item.id) ? item.value !== (category.find(i => i.id === item.id).value) : false
    });
  }
}
