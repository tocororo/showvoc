import { Dataset } from '../models/Datasets';

export class PMKIContext {

    private static currentDataset: Dataset;


    static setDataset(dataset: Dataset) {
        this.currentDataset = dataset;
    }
    static getDataset(): Dataset {
        return this.currentDataset;
    }
    static removeDataset() {
        this.currentDataset = null;
    }

}