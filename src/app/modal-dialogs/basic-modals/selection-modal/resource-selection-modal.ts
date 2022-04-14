import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnnotatedValue, Value } from 'src/app/models/Resources';

@Component({
    selector: 'resource-selection-modal',
    templateUrl: './resource-selection-modal.html'
})
export class ResourceSelectionModal {

    @Input() title: string;
    @Input() message: string;
    @Input() resourceList: AnnotatedValue<Value>[];
    @Input() multiselection: boolean = false; //tells if multiple selection is allowed
    @Input() selectedResources: Value[]; //resources that will be selected once the dialog is initialized
    @Input() emptySelectionAllowed: boolean = false;
    @Input() rendering: boolean = true;
    
    private selection: AnnotatedValue<Value>[];
    
    constructor(public activeModal: NgbActiveModal) {}

    isOkEnabled() {
        return this.emptySelectionAllowed || this.selection && this.selection.length > 0;
    }
    
    onResourceSelected(resources: AnnotatedValue<Value>[]) {
        this.selection = resources;
    }

    onResDblClicked(resource: AnnotatedValue<Value>) {
        if (!this.multiselection) {
            this.selection = [resource];
            this.ok();
        }
    }

    ok() {
        this.activeModal.close(this.selection);
    }

    close() {
        this.activeModal.dismiss();
    }

}