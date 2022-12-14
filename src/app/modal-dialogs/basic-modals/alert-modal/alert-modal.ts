import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CheckOptions, ModalType } from '../../Modals';

@Component({
    selector: 'alert-modal',
    templateUrl: './alert-modal.html',
    styleUrls: ['../../modals.css']
})
export class AlertModal implements OnInit {

    @Input() title: string;
    @Input() message: string;
    @Input() type: ModalType;
    @Input() details: string;
    @Input() checkboxLabel: string;

    @Input() checkOpt: CheckOptions;

    titleClass: string;
    alertClass: string;

    detailsCollapsed: boolean = true;

    checkbox: boolean = false;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        if (this.type == null) {
            this.type = ModalType.info;
        }
        if (this.type == ModalType.info) {
            this.titleClass = "text-info";
            this.alertClass = "alert alert-info";
        } else if (this.type == ModalType.warning) {
            this.titleClass = "text-warning";
            this.alertClass = "alert alert-warning";
        } else if (this.type == ModalType.error) {
            this.titleClass = "text-danger";
            this.alertClass = "alert alert-danger";
        }
    }

    ok() {
        this.activeModal.close(this.checkOpt);
    }

    close() {
        this.activeModal.dismiss();
    }

}
