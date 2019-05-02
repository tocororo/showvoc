import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { Project } from 'src/app/models/Project';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { ProjectsServices } from 'src/app/services/projects.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';

@Component({
	selector: 'app-dataset-view',
	templateUrl: './dataset-view.component.html',
	host: { class: "pageComponent" }
})
export class DatasetViewComponent implements OnInit {

	ready: boolean = false;

	project: Project;

	private resource: AnnotatedValue<IRI> = null;

	constructor(private projectService: ProjectsServices, private pmkiProp: PMKIProperties,
		private basicModals: BasicModalsServices, private route: ActivatedRoute, private router: Router) { }

	ngOnInit() {
		console.log("on init")
		this.initializeProjectInContext().subscribe(
			() => {
				this.project = PMKIContext.getProject();
				console.log("project inizialized", this.project);
				if (this.project != null) { //project initialized correctly
					this.pmkiProp.initUserProjectPreferences().subscribe(
						() => {
							this.ready = true;
						}
					)
				}
			}
		);
	}

	private initializeProjectInContext(): Observable<void> {
		/**
		 * the user could access the page of the dataset with the direct link (e.g. .../#/datasets/MyDataset),
		 * so the Project in the ctx could be null and it needs to be retrieved from the server
		 */
		if (PMKIContext.getProject() != null) {
			console.log("proj in context", PMKIContext.getProject().getName())
			return of(null);
		} else {
			let projectId = this.route.snapshot.paramMap.get('id');
			console.log("proj not in context, retrieving", projectId);
			//retrieve project with a service invocation
			return this.projectService.listProjects(null, true, true).pipe(
				map(projects => {
					let p: Project = projects.find(p => p.getName() == projectId);
					if (p != null) {
						PMKIContext.setProject(p);
					} else {
						this.basicModals.alert("Dataset not found", "The requested dateset (id: '" + projectId + 
							"') does not exist. You will be redirect to the home page.", ModalType.warning).then(
							confirm => { this.router.navigate(["/"]) }
						);
					}
				})
			);
		}
	}

	onNodeSelected(node: AnnotatedValue<IRI>) {
        this.resource = node;
	}
	
}
