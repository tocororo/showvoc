import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { TextOrTranslation, TranslationUtils } from "../../modal-dialogs/Modals";
import { Toast, ToastOpt } from "./Toasts";

@Injectable()
export class ToastService {

    constructor(private translateService: TranslateService) {}
    
    toasts: Toast[] = [];

    show(title: TextOrTranslation, message: TextOrTranslation, options?: ToastOpt) {
        let t = TranslationUtils.getTranslatedText(title, this.translateService);
        let msg = TranslationUtils.getTranslatedText(message, this.translateService);
        this.toasts.push({ title: t, message: msg, options: options });
    }

    remove(toast: Toast) {
        this.toasts = this.toasts.filter(t => t !== toast);
    }

}