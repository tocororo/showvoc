import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { PMKIContext } from 'src/app/utils/PMKIContext';

@Component({
	selector: 'structure-tabset',
	templateUrl: './structure-tabset.component.html',
})
export class StructureTabsetComponent implements OnInit {
    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();

    private model: string;
    private selectedNode: AnnotatedValue<IRI>;

	constructor() { }

    ngOnInit() {
        this.model = PMKIContext.getProject().getModelType(true);
    }
    
    onNodeSelected(node: AnnotatedValue<IRI>) {
        this.nodeSelected.emit(node);
    }

}
