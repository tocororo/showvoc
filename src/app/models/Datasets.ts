export class Dataset {
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