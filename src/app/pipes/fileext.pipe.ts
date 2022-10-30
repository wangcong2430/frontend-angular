import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'fileexts'
})
export class FileextsPipe implements PipeTransform {
    transform(arr:any): string {  
        if(!Array.isArray(arr)){
            return '';
        }
        return arr.map((val:string)=>{
            return "."+val
        }).join(',');
    } 
}
