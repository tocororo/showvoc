import { Component, ElementRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IRI } from 'src/app/models/Resources';
import { AbstractStructureModal } from '../abstract-structure-modal';

@Component({
    selector: 'property-tree-modal',
    templateUrl: './property-tree-modal.html'
})
export class PropertyTreeModal extends AbstractStructureModal {

    @Input() rootProperties: IRI[];
    @Input() resource: IRI[];

    domainRes: IRI[];
    private showAll: boolean = false;

    constructor(activeModal: NgbActiveModal, elementRef: ElementRef) {
        super(activeModal, elementRef);
    }

    /**
     * When the checkbox "select all properties" changes status
     * Resets the selectedProperty and update the domainRes that represents 
     * the resource which its type should be the domain of the properties in the tree
     */
    private onShowAllChanged() {
        this.selectedNode = null;
        if (this.showAll) {
            this.domainRes = null;
        } else {
            this.domainRes = this.resource;
        }
    }

}
