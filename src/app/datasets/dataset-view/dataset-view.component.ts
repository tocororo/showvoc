import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { Project } from 'src/app/models/Project';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { ProjectsServices } from 'src/app/services/projects.service';
import { StructureTabsetComponent } from 'src/app/structures/structure-tabset/structure-tabset.component';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';

@Component({
	selector: 'dataset-view',
	templateUrl: './dataset-view.component.html',
	host: { class: "pageComponent" }
})
export class DatasetViewComponent implements OnInit {

    @ViewChild(StructureTabsetComponent) viewChildStructureTabset: StructureTabsetComponent;

    ready: boolean = false;

	project: Project;

	private resource: AnnotatedValue<IRI> = null;

	constructor(private projectService: ProjectsServices, private pmkiProp: PMKIProperties,
		private basicModals: BasicModalsServices, private route: ActivatedRoute, private router: Router) { }

	ngOnInit() {
		this.initializeProjectInContext().subscribe(
			() => {
                this.project = PMKIContext.getProject();
				if (this.project != null) { //project initialized correctly
					this.pmkiProp.initUserProjectPreferences().subscribe(
						() => {
                            this.ready = true;

                            this.route.queryParams.subscribe(
                                params => {
                                    let resId: string = params['resId'];
                                    if (resId != null) {
                                        //give the time to initialize the structure tabset after the change of this.ready
                                        setTimeout(() => {
                                            this.viewChildStructureTabset.selectResource(new IRI(resId));
                                        });
                                        
                                    }
                                }
                            );

						}
					)
				}
			}
		);
	}

    /**
     * Initialize the correct project in the PMKIContext
     * The user could land on this page from:
     * - Dataset page (clicking on a dataset name)
     * - Search page (clicking on the dataset name or on a resource from the search results)
     * - directly with the url (e.g. .../#/datasets/MyDataset),
     * So the Project in the ctx could be null (and thus it needs to be retrieved from the server), or it could be initialized.
     * Anyway, event if it is already initialized, the context project could be different from the one passed via the param url
     * since in the search page, when the user select a project or a resource in the results, the project is not set in the context,
     * but it is simply passed in the url (the search page has not the Project objects, simply the project id)
     */
	private initializeProjectInContext(): Observable<void> {
        let ctxProject = PMKIContext.getProject();
        let paramProject = this.route.snapshot.paramMap.get('id');
		if (ctxProject != null) {
            //check if the project in the context is the same passed as url param
            if (ctxProject.getName() == paramProject) { //if the project is already initialized in the context stop here
                return of(null);
            }
		}
        //if this code is reached, the context project was not initialized, or it was not the project passed via url param 
        return this.projectService.listProjects(null, true, true).pipe( //retrieve project with a service invocation
            map(projects => {
                let p: Project = projects.find(p => p.getName() == paramProject);
                if (p != null) {
                    PMKIContext.setProject(p);
                } else {
                    this.basicModals.alert("Dataset not found", "The requested dateset (id: '" + paramProject +
                        "') does not exist. You will be redirect to the home page.", ModalType.warning).then(
                        () => { this.router.navigate(["/"]) }
                    );
                }
            })
        );
	}

	onNodeSelected(node: AnnotatedValue<IRI>) {
		if (node == null) return;
		this.resource = node;
	}

}
