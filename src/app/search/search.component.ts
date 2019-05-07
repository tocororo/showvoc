import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dataset } from '../models/Datasets';
import { SearchResult, SearchServicesMock } from '../models/Search';
import { PMKIContext } from '../utils/PMKIContext';

@Component({
	selector: 'search-component',
	templateUrl: './search.component.html',
	host: { class: "pageComponent" }
})
export class SearchComponent implements OnInit {

	searchString: string;
	loading: boolean = false;

	searchResults: SearchResult[];

	constructor(private router: Router) { }

	ngOnInit() {
	}

	searchKeyHandler(event: KeyboardEvent) {
		if (this.searchString != null && this.searchString.trim() != "") {
			this.search();
		}
	}

	search() {
		this.loading = true;
		this.searchResults = [];
		SearchServicesMock.getSearchResults(this.searchString).subscribe(
			results => {
				this.searchResults = results;
				this.loading = false;
			}
		)
	}

	private goToDataset(dataset: Dataset) {
		PMKIContext.setDataset(dataset);
		this.router.navigate(["/datasets/" + dataset.id]);
	}

}
