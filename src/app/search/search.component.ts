import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Dataset, DatasetService } from '../models/Datasets';
import { SearchResult, SearchService } from '../models/Search';
import { PMKIContext } from '../utils/PMKIContext';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css']
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
		SearchService.getSearchResults(this.searchString).subscribe(
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
