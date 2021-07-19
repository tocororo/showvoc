import { Component } from '@angular/core';
import { ToastService } from './toast-service';

@Component({
    selector: 'app-toasts',
    templateUrl: "toast-container.html",
    host: { '[class.ngb-toasts]': 'true' },
    styles: [`
        :host {
            position: fixed;
            top: auto !important;
            bottom: 0 !important;
        }
    `]

})
export class ToastsContainer {

    constructor(public toastService: ToastService) { }

}