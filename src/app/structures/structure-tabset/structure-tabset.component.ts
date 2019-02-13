import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { Dataset } from 'src/app/models/Datasets';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { PMKIContext } from 'src/app/utils/PMKIContext';

@Component({
	selector: 'structure-tabset',
	templateUrl: './structure-tabset.component.html',
})
export class StructureTabsetComponent implements OnInit {
    @Input() dataset: Dataset;
    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();

    // private dataset: Dataset;
    private selectedNode: AnnotatedValue<IRI>;

	constructor() {
    }

    ngOnInit() {}
    
    onNodeSelected(node: AnnotatedValue<IRI>) {
        this.nodeSelected.emit(node);
    }

}
