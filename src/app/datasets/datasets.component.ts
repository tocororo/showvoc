import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Dataset, Model, DatasetService } from '../models/Datasets';
import { PMKIContext } from '../utils/PMKIContext';

@Component({
	selector: 'app-datasets',
	templateUrl: './datasets.component.html',
	styleUrls: ['./datasets.component.css']
})
export class DatasetsComponent implements OnInit {

	languages: string[] = ["de", "fr", "en", "es", "it"];
	kosCheck: boolean = true;
	lexiconsCheck: boolean = true;

	allDatasets: Dataset[] = [];
	datasets: Dataset[] = [];

	searchString: string;
	loading: boolean = false;

	constructor(private route: ActivatedRoute, private router: Router) { }

	ngOnInit() {
		this.route.queryParams.subscribe(params => {
			let search = params['search'];
			this.searchString = search;

			this.searchDataset();
		});
	}

	searchDataset() {
		let modelFacets: Model[] = [];
		if (this.kosCheck) modelFacets.push(Model.SKOS);
		if (this.lexiconsCheck) modelFacets.push(Model.OntoLex);

		this.loading = true;
		DatasetService.getDatasets(this.searchString, modelFacets).subscribe(datasets => {
			this.loading = false;
			this.datasets = datasets;
		});
	}

	onFacetChange() {
		this.searchDataset();
	}

	private goToDataset(dataset: Dataset) {
		PMKIContext.setDataset(dataset);
		this.router.navigate(["/datasets/" + dataset.id]);
	}

}




