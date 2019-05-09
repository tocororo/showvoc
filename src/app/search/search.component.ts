import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { IRI, Literal } from '../models/Resources';
import { GlobalSearchServices } from '../services/global-search.service';
import { SKOSXL, SKOS, RDFS } from '../models/Vocabulary';
import { ResourcesServices } from '../services/resources.service';
import { PMKIContext } from '../utils/PMKIContext';
import { Project } from '../models/Project';

@Component({
	selector: 'search-component',
	templateUrl: './search.component.html',
    host: { class: "pageComponent" },
    styles: [`
        .search-result + .search-result {
            margin-top: 1rem;
        }
        .grouped-search-result + .grouped-search-result {
            margin-top: 1rem;
        }
    `]
})
export class SearchComponent {

	searchString: string;
    lastSearch: string;
    
	loading: boolean = false;

    groupedSearchResults: { [repId: string ]: GlobalSearchResult[] };
    groupedSearchResultsRepoIds: string[];

    private labelTypeOrder: string[] = [
        SKOSXL.prefLabel.getIRI(), SKOS.prefLabel.getIRI(), RDFS.label.getIRI(),
        SKOSXL.altLabel.getIRI(), SKOS.altLabel.getIRI(),
        SKOSXL.hiddenLabel.getIRI(), SKOS.hiddenLabel.getIRI(),
    ];

	constructor(private globalSearchService: GlobalSearchServices, private resourcesService: ResourcesServices, private router: Router) { }

	searchKeyHandler() {
		if (this.searchString != null && this.searchString.trim() != "") {
			this.search();
		}
	}

	search() {
        this.lastSearch = this.searchString;
        
        this.loading = true;
        this.globalSearchService.search(this.searchString).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            results => {
                //parse global search response
                let parsedSearchResults: GlobalSearchResult[] = [];
                results.results.forEach(element => {
                    let details: SearchResultDetails[] = []
                    element.details.forEach(detail => {
                        details.push({
                            label: new Literal(detail.label, detail.lang),
                            predicate: new IRI(detail.labelType)
                        });
                    });
                    let r: GlobalSearchResult = {
                        details: details.sort(this.sortDetails(this.labelTypeOrder)),
                        repId: element.repId,
                        resource: new IRI(element.resource),
                        resourceLocalName: element.resourceLocalName,
                        resourceType: new IRI(element.resourceType)
                    }
                    parsedSearchResults.push(r);
                });

                //group by repository ID the results 
                this.groupedSearchResults = {};
                parsedSearchResults.forEach(r => {
                    let resultsInRepo: GlobalSearchResult[] = this.groupedSearchResults[r.repId];
                    if (resultsInRepo != null) {
                        resultsInRepo.push(r);
                    } else {
                        this.groupedSearchResults[r.repId] = [r];
                    }
                });
                //update the repository IDs list, useful to iterate over groupedSearchResults in the UI
                this.groupedSearchResultsRepoIds = Object.keys(this.groupedSearchResults);

                //compute show of results
                let projectBackup = PMKIContext.getProject();
                this.groupedSearchResultsRepoIds.forEach(repo => {
                    let results: GlobalSearchResult[] = this.groupedSearchResults[repo];
                    this.computeShowOfResults(results);
                });
                PMKIContext.setProject(projectBackup);
            }
        )
    }

    private computeShowOfResults(results: GlobalSearchResult[]) {
        let resources: IRI[] = []
        results.forEach(r => {
            resources.push(r.resource);
        });

        PMKIContext.setProject(new Project(results[0].repId));
        this.resourcesService.getResourcesInfo(resources).subscribe(
            annotated => {
                annotated.forEach(a => {
                    results.find(r => r.resource.equals(a.getValue())).show = a.getShow();
                })
            }
        );
    }

    
    private goToResource(result: GlobalSearchResult) {
        this.router.navigate(["/datasets/" + result.repId], { queryParams: { resId: result.resource.getIRI() } });
    }

    private goToDataset(repoId: string) {
        this.router.navigate(["/datasets/" + repoId]);
    }
    
    private sortDetails(order: string[]) {
        return function(a: SearchResultDetails, b: SearchResultDetails) {
            let indexPredA = order.indexOf(a.predicate.getIRI());
            let indexPredB = order.indexOf(b.predicate.getIRI());
            if (indexPredA == -1) return 1;
            else if (indexPredB == -1) return -1;
            else return indexPredA - indexPredB;
        }
    }

}

class GlobalSearchResult {
    details: SearchResultDetails[];
    repId: string;
    resource: IRI;
    show?: string;
    resourceLocalName: string;
    resourceType: IRI;
}
class SearchResultDetails {
    label: Literal;
    predicate: IRI;
}