import { Component, OnInit } from '@angular/core';
import { Dataset } from '../models/Datasets';

@Component({
	selector: 'app-datasets',
	templateUrl: './datasets.component.html',
	styleUrls: ['./datasets.component.css']
})
export class DatasetsComponent implements OnInit {

	languages: string[] = ["de", "fr", "en", "es", "it"];

	datasets: Dataset[];

	private mockDatasets: Dataset[] = [
		{
			title: "Agrovoc",
			url: "http://aims.fao.org/vest-registry/vocabularies/agrovoc",
			description: "A controlled vocabulary covering all areas of interest of the Food and Agriculture Organization (FAO) of the United Nations."
		},
		{
			title: "Eurovoc",
			url: "http://publications.europa.eu/resource/dataset/eurovoc",
			description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
		},
		{
			title: "Teseo",
			url: "https://www.senato.it/3235?testo_generico=745",
			description: "TESEO (TEsauro SEnato per l'Organizzazione dei documenti parlamentari) è un sistema di classificazione usato nelle più importanti banche dati del Senato, della Camera e di alcune Regioni."
		},
		{
			title: "dcterms",
			url: "http://purl.org/dc/terms/",
			description: "an up-to-date specification of all metadata terms maintained by the Dublin Core Metadata Initiative, including properties, vocabulary encoding schemes, syntax encoding schemes, and classes."
		},
		{
			title: "foaf",
			url: "http://xmlns.com/foaf/0.1/",
			description: "FOAF is a project devoted to linking people and information using the Web. Regardless of whether information is in people's heads, in physical or digital documents, or in the form of factual data, it can be linked."
		},
	]

	searchString: string;
	searching: boolean = false;

	constructor() { }

	ngOnInit() {
	}

	searchKeyHandler(event: KeyboardEvent) {
		if (this.searchString != null && this.searchString.trim() != "") {
			this.searchDataset();
		}
	}

	searchDataset() {
		this.searching = true;
		this.datasets = null;
		setTimeout(() => {
			this.datasets = this.mockDatasets;
			this.searching = false;
		}, 500);
	}

}


