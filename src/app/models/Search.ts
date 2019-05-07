import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Dataset, DatasetService } from './Datasets';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from './Resources';

export class SearchResult {
    dataset: Dataset;
    resource: AnnotatedValue<IRI>;
    resourceDescription?: string;
}

//MOCK, to remove later
export class SearchServicesMock {

    static getSearchResults(search?: string): Observable<SearchResult[]> {
        let results: SearchResult[] = [];

        let maxResults: number = Math.random()*DatasetService.mockDataset.length;
        for (let i = 0; i < maxResults; i++) {
            let foundInDataset: Dataset = DatasetService.mockDataset[Math.floor(Math.random()*DatasetService.mockDataset.length)];
            if (results.some((r => r.dataset == foundInDataset))) continue; //if dataset already in a result, continue

            let res: SearchResult = {
                resource: new AnnotatedValue(new IRI("http://baseuri#" + search), { "role": RDFResourceRolesEnum.concept, "show": search }),
                dataset: foundInDataset
            }

            if (Math.random() > 0.5) { //with 50% probability add the description (which is optional)
                res.resourceDescription = "Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua";
            }

            results.push(res);
        }

        return of(results).pipe(delay(500));
    }
}