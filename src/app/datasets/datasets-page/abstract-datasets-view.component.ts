import { Directive, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Project } from 'src/app/models/Project';
import { ProjectsServices } from 'src/app/services/projects.service';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { DatasetsFilter } from './datasets-page.component';

@Directive()
export abstract class AbstractDatasetsView implements OnInit {

    @Input() filters: DatasetsFilter;

    eventSubscriptions: Subscription[] = [];

    loading: boolean = false;

    protected projectService: ProjectsServices;
    protected eventHandler: SVEventHandler;
    constructor(projectService: ProjectsServices, eventHandler: SVEventHandler) {
        this.projectService = projectService;
        this.eventHandler = eventHandler;

        this.eventSubscriptions.push(this.eventHandler.projectUpdatedEvent.subscribe(
            () => this.initDatasets())
        );
    }

    ngOnInit() {
        this.initDatasets();
    }

    abstract initDatasets(): void;

    isDatasetVisible(dataset: Project): boolean {
        let stringFilterOk: boolean = true;
        if (this.filters.stringFilter != null && this.filters.stringFilter.trim() != "") {
            let stringFilter: string = this.filters.stringFilter.toUpperCase();
            stringFilterOk = dataset.getName().toUpperCase().includes(stringFilter) || //check match in name
                dataset.getBaseURI().toUpperCase().includes(stringFilter) || //check match in baseuri
                (dataset.getDescription() != null && dataset.getDescription().toUpperCase().includes(stringFilter)); //check match in description
        }
        let modelFilterOk: boolean = this.filters.models.includes(dataset.getModelType()); //check on model facets
        let openFilterOk: boolean = !this.filters.open || (this.filters.open && dataset.isOpen()); //check only open facet
        return stringFilterOk && modelFilterOk && openFilterOk;
    }

}