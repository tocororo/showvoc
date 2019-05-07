import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { TreeListContext } from 'src/app/utils/UIUtils';

@Component({
	selector: 'structure-tabset',
	templateUrl: './structure-tabset.component.html',
})
export class StructureTabsetComponent implements OnInit {
    @Output() nodeSelected = new EventEmitter<AnnotatedValue<IRI>>();

    private context: TreeListContext = TreeListContext.dataPanel;

    model: string;
    private selectedNode: AnnotatedValue<IRI>;

	constructor() { }

    ngOnInit() {
        this.model = PMKIContext.getProject().getModelType(true);
    }
    
    onNodeSelected(node: AnnotatedValue<IRI>) {
        this.nodeSelected.emit(node);
    }

}
