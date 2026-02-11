import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'rename'
})
export class RenamePipe implements PipeTransform {


    transform(value: any, upper: boolean, trim:string) {
        if(upper){
           if(trim=='yes'){
            return value.toUpperCase().split('@')[0]
           }

           else {
             return value.toUpperCase()
           }
        }
    }
}