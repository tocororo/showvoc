import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { LinksetMetadata } from 'src/app/models/Metadata';
import { AlignmentsListComponent } from './alignments-list.component';

@Component({
    selector: 'alignments-list-panel',
    templateUrl: './alignments-list-panel.component.html',
    host: { class: "vbox" }
})
export class AlignmentsListPanelComponent {

    @ViewChild(AlignmentsListComponent) viewChildList: AlignmentsListComponent;
    @Output() linksetSelected = new EventEmitter<LinksetMetadata>();

    selectedLinkset: LinksetMetadata;

    constructor() { }

    refresh() {
        this.viewChildList.init();
    }

    settings() {
        //TODO
    }

    onLinksetSelected(linkset: LinksetMetadata) {
        this.selectedLinkset = linkset;
        this.linksetSelected.emit(linkset);
    }

}