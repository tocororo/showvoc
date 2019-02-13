import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export class Dataset {
    id: string;
    title: string;
    url: string
    description: string;
    model: Model;
    lexicalizationModel: string;
    languages?: string[];
}

export enum Model {
	SKOS = "SKOS",
	OntoLex = "OntoLex"
}




//MOCK, to remove later
export class DatasetService {
    private static mockDataset: Dataset[] = [
        {
            id: "agrovoc",
            title: "Agrovoc",
            url: "http://aims.fao.org/vest-registry/vocabularies/agrovoc",
            description: "A controlled vocabulary covering all areas of interest of the Food and Agriculture Organization (FAO) of the United Nations.",
            model: Model.SKOS,
            lexicalizationModel: "SKOS-XL"
        },
        {
            id: "eurovoc",
            title: "Eurovoc",
            url: "http://publications.europa.eu/resource/dataset/eurovoc",
            description: "EuroVoc is a multilingual, multidisciplinary thesaurus covering the activities of the EU, the European Parliament in particular. It contains terms in 23 EU languages (Bulgarian, Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, German, Greek, Hungarian, Italian, Latvian, Lithuanian, Maltese, Polish, Portuguese, Romanian, Slovak, Slovenian, Spanish and Swedish), plus in three languages of countries which are candidates for EU accession: македонски (mk), shqip (sq) and cрпски (sr).",
            model: Model.SKOS,
            lexicalizationModel: "SKOS-XL"
        },
        {
            id: "teseo",
            title: "Teseo",
            url: "https://www.senato.it/3235?testo_generico=745",
            description: "TESEO (TEsauro SEnato per l'Organizzazione dei documenti parlamentari) è un sistema di classificazione usato nelle più importanti banche dati del Senato, della Camera e di alcune Regioni.",
            model: Model.SKOS,
            lexicalizationModel: "SKOS-XL"
        },
        {
            id: "wordnet",
            title: "WordNet",
            url: "https://wordnet.princeton.edu/",
            description: "WordNet® is a large lexical database of English. Nouns, verbs, adjectives and adverbs are grouped into sets of cognitive synonyms (synsets), each expressing a distinct concept. Synsets are interlinked by means of conceptual-semantic and lexical relations.",
            model: Model.OntoLex,
            lexicalizationModel: "OntoLex"
        },
    ];

    static getDatasets(search?: string, modelFacets?: Model[]): Observable<Dataset[]> {
        let datasets: Dataset[] = [];
        this.mockDataset.forEach(d => {
            if (
                (search == null || search.trim() == "" || d.title.toUpperCase().includes(search.toUpperCase()) || d.description.toUpperCase().includes(search.toUpperCase())) &&
                (modelFacets == null || modelFacets.includes(d.model))
            ) {
                datasets.push(d);
            }
        });
        return of(datasets).pipe(delay(500));
    }
    static getDataset(id: string): Observable<Dataset> {
        let dataset: Dataset;
        this.mockDataset.forEach(d => {
            if (d.id == id) {
                dataset = d;
            }
        });
        return of(dataset).pipe(delay(300));
    }
}