import { Component, OnInit } from '@angular/core';
import { Project } from '../models/Project';
import { ProjectsServices } from '../services/projects.service';
import { finalize } from 'rxjs/operators';
import { AlignmentsModalsServices } from './alignments-modal.service';

@Component({
	selector: 'alignments-component',
	templateUrl: './alignments.component.html',
	host: { class: "pageComponent" }
})
export class AlignmentsComponent implements OnInit {

	sourceProjects: Project[];
	selectedSourceProject: Project;
	
	loading: boolean = false;
	alignments: AlignmentOverview[];


	constructor(private projectService: ProjectsServices, private alignmentsModals: AlignmentsModalsServices) { }

	ngOnInit() {
		this.projectService.listProjects(null, false, true).subscribe(
            projects => {
                this.sourceProjects = projects;
            }
        )
	}

	//MOCK-UP
	onSourceProjectChannge() {
		this.loading = true;
		this.alignments = null;
		this.projectService.listProjects(null, false, true).pipe( //TODO the target dataset should be: project dependant? user dependant?
			finalize(() => this.loading = false)
		).subscribe(
            projects => {
				this.alignments = [];
				projects.forEach(p => {
					if (p.getName() != this.selectedSourceProject.getName()) {
						this.alignments.push({ size: Math.floor(Math.random() * 100), project: p});
					}
				});
            }
		);
	}

	showAlignments(alignment: AlignmentOverview) {
		this.alignmentsModals.openAlignments(this.selectedSourceProject, alignment.project);
	}

}


class AlignmentOverview {
	project: Project;
	size: number;
}