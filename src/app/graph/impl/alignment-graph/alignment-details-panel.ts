import { Component, Input } from '@angular/core';
import { AlignmentsModalsServices } from 'src/app/alignments/modals/alignments-modal.service';
import { Project } from 'src/app/models/Project';
import { AlignmentLink } from '../../model/AlignmentLink';

@Component({
    selector: 'alignment-details-panel',
    templateUrl: './alignment-details-panel.html',
    host: { class: "vbox" }
})
export class AlignmentDetailsPanel {

    @Input() alignmentLink: AlignmentLink;

    private sourceProject: Project;

    constructor(private alignemntModals: AlignmentsModalsServices) { }

    ngOnInit() {
        this.sourceProject = new Project(this.alignmentLink.source.getShow());
    }

    showMappings() {
        this.alignemntModals.openAlignments(this.sourceProject, this.alignmentLink.linkset);
    }

}