import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})


export class StringHelper {

    public GetUrl(url: string, params: string[]) {

        let result = url;
        let i = 0;
        for (let arg of params) {
            let strToReplace = "{" + i++ + "}";
            result = result.replace(strToReplace, (arg || ''));
        }
        return result;

    }
}