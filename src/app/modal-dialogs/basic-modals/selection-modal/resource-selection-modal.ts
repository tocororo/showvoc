import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnnotatedValue, Value } from 'src/app/models/Resources';

@Component({
    selector: 'resource-selection-modal',
    templateUrl: './resource-selection-modal.html'
})
export class ResourceSelectionModal {

    @Input() title: string = "Select a resource";
    @Input() message: string;
    @Input() resourceList: AnnotatedValue<Value>;
    @Input() rendering: boolean = true;

    resourceSelected: AnnotatedValue<Value>;

    constructor(public activeModal: NgbActiveModal) { }


    ok() {
        this.activeModal.close(this.resourceSelected);
    }

    close() {
        this.activeModal.dismiss();
    }

}
