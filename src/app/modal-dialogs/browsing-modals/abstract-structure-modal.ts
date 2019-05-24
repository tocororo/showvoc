import { ElementRef, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { UIUtils } from 'src/app/utils/UIUtils';

export class AbstractStructureModal {

    @Input() title: string;

    selectedNode: AnnotatedValue<IRI>;
    
	constructor(protected activeModal: NgbActiveModal, protected elementRef: ElementRef) { }
	
	ngAfterViewInit() {
		UIUtils.setFullSizeModal(this.elementRef);
	}
    
    onNodeSelected(node: AnnotatedValue<IRI>) {
        this.selectedNode = node;
    }

	ok() {
		this.activeModal.close(this.selectedNode);
	}

	close() {
		this.activeModal.dismiss();
	}

}
