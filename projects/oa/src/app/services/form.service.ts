import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { debounceTime, map, tap, switchMap, takeUntil } from 'rxjs/operators';
import { FormlyField, Field } from '@ngx-formly/core';
import { from } from 'rxjs';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';

@Injectable()
export class FormService {

  priceLibraryCategoryId: number;

  constructor(
    private http: HttpClient
  ) {
  }

  formEvent(formFields, modelChange) {
    return new Observable((observer) => {
      for (const formItem of formFields) {
        if (formItem['templateOptions'] && formItem['templateOptions'].target) {
          formItem['lifecycle'] = {
            onInit: (from, field: FormlyFieldConfig) => {              
              from.get(field.templateOptions.target).valueChanges.pipe(
                takeUntil(modelChange)
              ).subscribe( value => {
                console.log(value)                
                 if (value && field.templateOptions.getUrl) {
                   this.http.get(field.templateOptions.getUrl, {
                    params: {
                      'value': value,
                      'vendor_id': value,
                      // 'supplier_id': value
                     },
                     observe: 'response'
                   }).subscribe(response => {                     
                    observer.next([field, response]);
                   });
                 } else {
                  observer.next([field, value]);
                } 
              });
            }
          };
        }
      }
    });
  }

  modelChange(event, modelClassKey, formFields, formData) {
    if (modelClassKey === 'PriceLibrary') {
      if (event['category_id'] && event['category_id'] !== this.priceLibraryCategoryId) {
        this.priceLibraryCategoryId = event['category_id'];
      }
    } else if (modelClassKey === 'OaUser') {

    }
    

    return [formFields, formData];
  }



  formControlChange(modelClassKey, formFields, modelSubject) {
    if (modelClassKey === 'PriceLibrary') {
      // produce_breakdown_id
      formFields[1]['lifecycle'] = {
        onInit: (form, field) => {
          form.get('category_id').valueChanges.subscribe(
            v => {
              this.http.get('web/ajax-check/produce-breakdown-grade', {
                params: {
                  'category_id': v,
                },
                observe: 'response',
              }).subscribe(response => {
                if (response.body['code'] === 0) {
                  field.templateOptions.options = response.body['data']['produceBreakdownList'];
                  formFields[2]['templateOptions']['options'] = response.body['data']['produceGradeList'];
                }
              });
            }
          );
        }
      };
    } else if (modelClassKey === 'PriceContractLibrary') {
      formFields[2]['lifecycle'] = {
        onInit: (form, field) => {
          form.get('category_id').valueChanges.subscribe(
            v => {
              this.http.get('web/ajax-check/produce-breakdown-grade', {
                params: {
                  'category_id': v,
                },
                observe: 'response',
              }).subscribe(response => {
                if (response.body['code'] === 0) {
                  field.templateOptions.options = response.body['data']['produceBreakdownList'];
                  formFields[3]['templateOptions']['options'] = response.body['data']['produceGradeList'];
                }
              });
            }
          );
        }
      };
    } else if (modelClassKey === 'OaUser') {
      formFields[2]['lifecycle'] = {
        onInit: (form, field) => {
          form.get('username').valueChanges.subscribe(
            v => {
              field.formControl.setValue(v + '@tencent.com');
            }
          );
        }
      };
    } else if (modelClassKey === 'Contract') {
      formFields[1]['lifecycle'] = {
        onInit: (form, field) => {
          form.get('supplier_id').valueChanges.pipe(
            takeUntil(modelSubject)
          ).subscribe(
            v => {
              this.http.get('web/ajax-check/get-epo-order', {
                params: {
                  'supplier_id': v,
                },
                observe: 'response'
              }).subscribe(response => {
                if (response.body['code'] === 0) {
                  field.templateOptions.options = response.body['data'];
                }
              });
            }
          );
        }
      };

      formFields[2]['lifecycle'] = {
        onInit: (form, field) => {
          form.get('epo_order_code').valueChanges.pipe(
            takeUntil(modelSubject)
          ).subscribe(
            v => {
              this.http.get('web/ajax-check/get-epo-order-info', {
                params: {
                  'epo_order_code': v,
                },
                observe: 'response'
              }).subscribe(response => {
                if (response.body['code'] === 0) {
                  field.formControl.setValue(response.body['data']['contract_number']);
                  formFields[3].templateOptions.options = response.body['data']['currency_code'];
                  formFields[3].formControl.setValue(response.body['data']['currency_code'][0]['value']);
                  formFields[4].templateOptions.options = response.body['data']['org_info'];
                  formFields[4].formControl.setValue(response.body['data']['org_info'][0]['value']);
                  formFields[6].formControl.setValue(response.body['data']['date_range']);
                }
              });
            }
          );
        }
      };
    }
    return formFields;
  }


}
