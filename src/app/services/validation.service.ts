import { ValidationErrors } from "@angular/forms";

export class ValidationService {
    static completeValidation(control): ValidationErrors {
        let flag = true;
        let val = control.value || [];
        for (let row of val) {
            for (let item in row) {
                if (!row[item] || !row[item].length) {
                    flag = false;
                }
            }
        }
        return flag ? null : {'complete': true};
    }

    static numberValidation(control): ValidationErrors {
        return !control.value || /^\d+$/.test(control.value) ? null : {'input-number': true};
    }
}
