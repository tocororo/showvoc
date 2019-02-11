import { Component, OnInit } from '@angular/core';
import { Dataset, Model } from '../models/Datasets';

@Component({
	selector: 'app-datasets',
	templateUrl: './datasets.component.html',
	styleUrls: ['./datasets.component.css'],
})
export class DatasetsComponent implements OnInit {

	// datasetTypeFacets: { type: string, checked: boolean }[] = [
	// 	{ type: "KOS", checked: true },
	// 	{ type: "Lexicon", checked: true }
	// ];

	languages: string[] = ["de", "fr", "en", "es", "it"];
	kosCheck: boolean = true;
	lexiconsCheck: boolean = true;

	allDatasets: Dataset[] = [
		{
			title: "Agrovoc",
			url: "http://aims.fao.org/vest-registry/vocabularies/agrovoc",
			description: "A controlled vocabulary covering all areas of interest of the Food and Agriculture Organization (FAO) of the United Nations.",
			model: Model.SKOS,
			lexicalizationModel: "SKOS-XL"
		},
		{
			title: "Eurovoc",
			url: "http://publications.europa.eu/resource/dataset/eurovoc",
			description: "EuroVoc is a multilingual, multidisciplinary thesaurus covering the activities of the EU, the European Parliament in particular. It contains terms in 23 EU languages (Bulgarian, Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, German, Greek, Hungarian, Italian, Latvian, Lithuanian, Maltese, Polish, Portuguese, Romanian, Slovak, Slovenian, Spanish and Swedish), plus in three languages of countries which are candidates for EU accession: македонски (mk), shqip (sq) and cрпски (sr).",
			model: Model.SKOS,
			lexicalizationModel: "SKOS-XL"
		},
		{
			title: "Teseo",
			url: "https://www.senato.it/3235?testo_generico=745",
			description: "TESEO (TEsauro SEnato per l'Organizzazione dei documenti parlamentari) è un sistema di classificazione usato nelle più importanti banche dati del Senato, della Camera e di alcune Regioni.",
			model: Model.SKOS,
			lexicalizationModel: "SKOS-XL"
		},
		{
			title: "WordNet",
			url: "https://wordnet.princeton.edu/",
			description: "WordNet® is a large lexical database of English. Nouns, verbs, adjectives and adverbs are grouped into sets of cognitive synonyms (synsets), each expressing a distinct concept. Synsets are interlinked by means of conceptual-semantic and lexical relations.",
			model: Model.OntoLex,
			lexicalizationModel: "OntoLex"
		},
	];
	datasets: Dataset[] = this.allDatasets;

	searchString: string;
	searching: boolean = false;

	constructor() { }

	ngOnInit() {
	}

	searchDataset() {
		this.searching = true;
		this.datasets = [];
		setTimeout(() => {
			this.allDatasets.forEach(d => {
				if (
					this.datasetMatchesFacets(d) && 
					(this.searchString == null || this.searchString.trim() == "" || 
					d.title.toUpperCase().includes(this.searchString.toUpperCase()) || d.description.toUpperCase().includes(this.searchString.toUpperCase()))
				) {
					this.datasets.push(d);
				}
			});

			this.searching = false;
		}, 500);
	}

	/**
	 * Returns true if the dataset matches the facets
	 */
	private datasetMatchesFacets(dataset: Dataset): boolean {
		if (this.lexiconsCheck && dataset.model == Model.OntoLex) {
			return true;
		}
		if (this.kosCheck && dataset.model == Model.SKOS) {
			return true;
		}
		return false;
	}

	onFacetChange() {
		this.searchDataset();
		// this.searching = true;
		// this.datasets = [];
		// setTimeout(() => {
		// 	if (this.searchString == null || this.searchString.trim() == "") {
		// 		this.datasets = this.allDatasets;
		// 	} else {
		// 		this.allDatasets.forEach(d => {
		// 			if (d.title.includes(this.searchString) || d.description.includes(this.searchString)) {
		// 				this.datasets.push(d);
		// 			}
		// 		});
		// 	}
		// 	this.searching = false;
		// }, 500);
	}

}




