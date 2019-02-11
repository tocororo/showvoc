import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {

	constructor() { }

	searchString: string;
	searching: boolean = false;

	searchResults: string[];

	ngOnInit() {
	}

	searchKeyHandler(event: KeyboardEvent) {
		if (this.searchString != null && this.searchString.trim() != "") {
			this.search();
		}
	}

	search() {
		this.searching = true;
		this.searchResults = null;
		setTimeout(() => {
			this.searchResults = ["uno", "due", "tre"];
			this.searching = false;
		}, 500);
	}

}
