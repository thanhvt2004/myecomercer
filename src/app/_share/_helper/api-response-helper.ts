import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import * as _ from "lodash";
import { apiResponseModel } from "src/app/_models/api-response.model";

@Injectable({
    providedIn: 'root'
})


export class ApiResponseHelper {

    constructor(private translate: TranslateService) {
    }

    public ProcessData(meta: any, screenPath: string) {
        var result: apiResponseModel = {
            isSuccess: false,
            message: ""
        };

        var returnCode = meta.code.split('-')[0];
        if (returnCode == '200') {
            result.isSuccess = true;
        } else {
            result.isSuccess = false;
        }

        //get message
        this.translate.get('ApiResponseMessages.' + screenPath + '.' + meta.code).subscribe(res => {
            result.message = res;
            //fix cannot find any defined message
            if(result.message.indexOf('ApiResponseMessages') > -1) {
                result.message = '';
            }
        });

        return result;
    }
}