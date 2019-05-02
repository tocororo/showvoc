import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../models/Project';
import { OntoLex, SKOS } from '../models/Vocabulary';
import { ProjectsServices } from '../services/projects.service';
import { PMKIContext } from '../utils/PMKIContext';

@Component({
	selector: 'app-datasets',
	templateUrl: './datasets.component.html',
	host: { class: "pageComponent" }
})
export class DatasetsComponent implements OnInit {

	languages: string[] = ["de", "fr", "en", "es", "it"];
	kosCheck: boolean = true;
	lexiconsCheck: boolean = true;

	projects: Project[] = [];

	searchString: string;
	lastSearch: string;
	loading: boolean = false;

	constructor(private route: ActivatedRoute, private router: Router, private projectService: ProjectsServices) { }

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
		this.projectService.listProjects(null, false, false).subscribe(
			projects => {
				this.projects = [];
				//filter the results according the search string and the facets
				projects.forEach(p => {
					if (
						(this.searchString == null || this.searchString.trim() == "" || p.getName().toUpperCase().includes(this.searchString.toUpperCase()) || p.getBaseURI().toUpperCase().includes(this.searchString.toUpperCase())) &&
						(modelFacets == null || modelFacets.includes(p.getModelType()))
					) {
						this.projects.push(p);
					}
				});
				this.loading = false;
			}
		)
	}

	onFacetChange() {
		this.searchDataset();
	}

	private goToProject(project: Project) {
		PMKIContext.setProject(project);
		this.router.navigate(["/datasets/" + project.getName()]);
	}

}




