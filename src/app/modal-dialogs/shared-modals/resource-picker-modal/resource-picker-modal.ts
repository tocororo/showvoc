import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnnotatedValue, IRI, Resource } from 'src/app/models/Resources';
import { ResourcePickerConfig } from 'src/app/widget/pickers/value-picker/resource-picker.component';

@Component({
    selector: "resource-picker-modal",
    templateUrl: "./resource-picker-modal.html",
})
export class ResourcePickerModal {
    @Input() title: string;
    @Input() config: ResourcePickerConfig;
    @Input() editable: boolean;

    resource: AnnotatedValue<Resource>;

    constructor(public activeModal: NgbActiveModal) {}

    updateResource(res: AnnotatedValue<IRI>) {
        this.resource = res;
    }

    ok() {
        this.activeModal.close(this.resource);
    }

    close() {
        this.activeModal.dismiss();
    }

}