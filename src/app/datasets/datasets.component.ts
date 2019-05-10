import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Project } from '../models/Project';
import { OntoLex, SKOS } from '../models/Vocabulary';
import { GlobalSearchServices } from '../services/global-search.service';
import { ProjectsServices } from '../services/projects.service';
import { PMKIContext } from '../utils/PMKIContext';

@Component({
	selector: 'datasets-component',
	templateUrl: './datasets.component.html',
	host: { class: "pageComponent" }
})
export class DatasetsComponent implements OnInit {

	languages: string[] = ["de", "fr", "en", "es", "it"];
	kosCheck: boolean = true;
	lexiconsCheck: boolean = true;

	projects: Project[];

	searchString: string;
	lastSearch: string;
	loading: boolean = false;

    constructor(private route: ActivatedRoute, private router: Router, private projectService: ProjectsServices,
        private globalSearchService: GlobalSearchServices) { }

	ngOnInit() {
		this.route.queryParams.subscribe(params => {
			let search = params['search'];
			this.searchString = search;
			this.searchDataset();
		});
	}

	searchDataset() {
		this.lastSearch = this.searchString;

		let modelFacets: string[] = [];
		if (this.kosCheck) modelFacets.push(SKOS.uri);
		if (this.lexiconsCheck) modelFacets.push(OntoLex.uri);

		this.loading = true;
        this.projectService.listProjects(null, false, false).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
			projects => {
				this.projects = [];
				//filter the results according the search string and the facets
				projects.forEach(p => {
                    if ((this.searchString == null || this.searchString.trim() == "" || 
                        p.getName().toUpperCase().includes(this.searchString.toUpperCase()) ||
                        p.getBaseURI().toUpperCase().includes(this.searchString.toUpperCase())) &&
						(modelFacets == null || modelFacets.includes(p.getModelType()))) {
						this.projects.push(p);
					}
				});
			}
		)
	}

	onFacetChange() {
		this.searchDataset();
    }
    
	private goToProject(project: Project) {
		this.router.navigate(["/datasets/" + project.getName()]);
    }
    
    private createIndex(project: Project) {
        /**
         * create index requires project set as ctx_project.
         * Here store in a temp variable the currently open project in order to restore it once the index is created
         */
        let activeProject: Project = PMKIContext.getProject();
        PMKIContext.setProject(project);
        project['creatingIndex'] = true;
        this.globalSearchService.createIndex().pipe(
            finalize(() => {
                project['creatingIndex'] = false;
                PMKIContext.setProject(activeProject); //restore the project active
            })
        ).subscribe();
    }

}