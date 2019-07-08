import { Component, Output, EventEmitter } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AlignmentOverview } from 'src/app/models/Alignments';
import { ProjectsServices } from '../../services/projects.service';
import { PMKIContext } from '../../utils/PMKIContext';

@Component({
	selector: 'alignments-list',
    templateUrl: './alignments-list.component.html',
    host: { class: "structureComponent" }
})
export class AlignmentsListComponent {

	@Output() alignmentSelected = new EventEmitter<AlignmentOverview>();

	loading: boolean = false;
	alignments: AlignmentOverview[];
	selectedAlignment: AlignmentOverview;

	constructor(private projectService: ProjectsServices) { }

	ngOnInit() {
    	this.init();
	}

	init() {
		this.loading = true;
		this.alignments = null;
		//MOCK-UP
		this.projectService.listProjects(null, false, true).pipe( //TODO the target dataset should be: project dependant? user dependant?
			finalize(() => this.loading = false)
		).subscribe(
            projects => {
				this.alignments = [];
				projects.forEach(p => {
					if (p.getName() != PMKIContext.getProjectCtx().getProject().getName()) {
						this.alignments.push({ size: Math.floor(Math.random() * 100), project: p});
					}
				});
            }
		);
	}

	selectAlignment(alignment: AlignmentOverview) {
        this.selectedAlignment = alignment;
		this.alignmentSelected.emit(alignment);
	}

}