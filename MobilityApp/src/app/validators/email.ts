import { FormControl } from '@angular/forms';
 
export class EmailValidator {
 
    static isValid(control: FormControl): any {
  
        let  EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;

        if (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value)) { 
          return {"incorrectMailFormat": true}
        }else{
          return null;  
        }
      
    }

    static isPlaque(control: FormControl): any {
  
        let  EMAIL_REGEXP = /^[a-zA-Z]{3}[0-9]{3}$/i;

        if (control.value.length > 0  && !EMAIL_REGEXP.test(control.value)) { 
          if(control.value.length > 6 ){
             return {"longPlaque": true}
          }else{
             return {"inCorrectPlaque": true}
          }
        }else{
          return null;  
        }
      
    }
 
}

