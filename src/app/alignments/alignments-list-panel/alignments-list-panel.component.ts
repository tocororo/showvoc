import { Component, ViewChild, EventEmitter, Output } from '@angular/core';
import { AlignmentsListComponent } from './alignments-list.component';
import { AlignmentOverview } from 'src/app/models/Alignments';

@Component({
	selector: 'alignments-list-panel',
    templateUrl: './alignments-list-panel.component.html',
    host: { class: "vbox" }
})
export class AlignmentsListPanelComponent {

	@ViewChild(AlignmentsListComponent) viewChildList: AlignmentsListComponent;
	@Output() alignmentSelected = new EventEmitter<AlignmentOverview>();

	selectedAlignment: AlignmentOverview;

	constructor() { }

	refresh() {
		this.viewChildList.init();
	}

	settings() {
		//TODO
	}

	onAlignmentSelected(alignment: AlignmentOverview) {
		this.selectedAlignment = alignment;
        this.alignmentSelected.emit(alignment);
	}

}