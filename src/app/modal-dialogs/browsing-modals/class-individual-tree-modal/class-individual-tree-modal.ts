import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { UIUtils } from 'src/app/utils/UIUtils';

@Component({
    selector: "class-individual-tree-modal",
    templateUrl: "./class-individual-tree-modal.html",
})
export class ClassIndividualTreeModal {
    @Input() title: string;
    @Input() classes: IRI[];
    
    selectedInstance: AnnotatedValue<IRI>;
    
    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef) {}

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }
    
    ok() {
        this.activeModal.close(this.selectedInstance);
    }

    close() {
        this.activeModal.dismiss();
    }
    
    onInstanceSelected(instance: AnnotatedValue<IRI>) {
        this.selectedInstance = instance;
    }

}