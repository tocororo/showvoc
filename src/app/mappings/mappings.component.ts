import { Component, OnInit } from '@angular/core';
import { Project } from '../models/Project';
import { ProjectsServices } from '../services/projects.service';
import { finalize } from 'rxjs/operators';
import { MappingsModalsServices } from './mappings-modal.service';

@Component({
	selector: 'mappings-component',
	templateUrl: './mappings.component.html',
	host: { class: "pageComponent" }
})
export class MappingsComponent implements OnInit {

	sourceProjects: Project[];
	selectedSourceProject: Project;
	
	loading: boolean = false;
	mappings: MappingOverview[];


	constructor(private projectService: ProjectsServices, private mappingsModals: MappingsModalsServices) { }

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
		this.mappings = null;
		this.projectService.listProjects(null, false, true).pipe( //TODO the target dataset should be: project dependant? user dependant?
			finalize(() => this.loading = false)
		).subscribe(
            projects => {
				this.mappings = [];
				projects.forEach(p => {
					if (p.getName() != this.selectedSourceProject.getName()) {
						this.mappings.push({ size: Math.floor(Math.random() * 100), project: p});
					}
				});
            }
		);
	}

	showMappings(mapping: MappingOverview) {
		this.mappingsModals.openMappings(this.selectedSourceProject, mapping.project);
	}

}


class MappingOverview {
	project: Project;
	size: number;
}