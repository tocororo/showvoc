import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { PmkiConstants } from '../models/Pmki';
import { Project } from '../models/Project';
import { OntoLex, OWL, RDFS, SKOS } from '../models/Vocabulary';
import { ProjectsServices } from '../services/projects.service';
import { Cookie } from '../utils/Cookie';
import { PMKIEventHandler } from '../utils/PMKIEventHandler';

@Component({
    selector: 'datasets-component',
    templateUrl: './datasets.component.html',
    host: { class: "pageComponent" }
})
export class DatasetsComponent implements OnInit {

    allProjects: Project[];
    projects: Project[] = [];

    eventSubscriptions: Subscription[] = [];

    datasetTypeFacets: { label: string, datasetTypes: string[], active: boolean, cookie: string }[] = [
        { label: "KOS", datasetTypes: [SKOS.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_KOS },
        { label: "Ontologies", datasetTypes: [RDFS.uri, OWL.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_ONTOLOGY },
        { label: "Lexicons", datasetTypes: [OntoLex.uri], active: true, cookie: Cookie.DATASETS_FACETS_TYPE_LEXICON }
    ];
    openCheck: boolean = true;

    filterString: string;

    loading: boolean = false;

    instanceName: string;

    constructor(private router: Router, private projectService: ProjectsServices, private eventHandler: PMKIEventHandler) {
        this.eventSubscriptions.push(eventHandler.projectUpdatedEvent.subscribe(
            () => this.initDatasets())
        );
    }

    ngOnInit() {
        this.initCookies();
        this.initDatasets();

        this.instanceName = window['pmki_instance_name'];
    }

    initDatasets() {
        this.loading = true;
        this.projectService.listProjectsPerRole(PmkiConstants.rolePublic).pipe(
            finalize(() => this.loading = false)
        ).subscribe(
            projects => {
                this.allProjects = projects;
                this.filterDatasets();
            }
        );
    }

    filterDatasets() {
        let modelFacets: string[] = []; //collect the active model facets
        this.datasetTypeFacets.forEach(f => {
            if (f.active) {
                modelFacets = modelFacets.concat(f.datasetTypes)
            }
        })

        this.projects = [];
        //filter the results according the search string and the facets
        this.allProjects.forEach(p => {
            if (
                (
                    this.filterString == null || this.filterString.trim() == "" || //no filter
                    p.getName().toUpperCase().includes(this.filterString.toUpperCase()) || //check filter string matches project name
                    p.getBaseURI().toUpperCase().includes(this.filterString.toUpperCase()) //check filter string matches project baseuri
                ) &&
                modelFacets.includes(p.getModelType()) && //check on model facets
                (!this.openCheck || this.openCheck && p.isOpen()) //check only open facet
            ) {
                this.projects.push(p);
            }
        });
    }

    onFacetChange() {
        this.updateCookies();
        this.filterDatasets();
    }

    private goToProject(project: Project) {
        this.router.navigate(["/datasets/" + project.getName()]);
    }

    private initCookies() {
        this.datasetTypeFacets.forEach(f => {
            f.active = Cookie.getCookie(f.cookie) != "false";
        })
        this.openCheck = Cookie.getCookie(Cookie.DATASETS_FACETS_ONLY_OPEN_PROJECTS) != "false";
    }
    private updateCookies() {
        this.datasetTypeFacets.forEach(f => {
            Cookie.setCookie(f.cookie, f.active + "");
        })
        Cookie.setCookie(Cookie.DATASETS_FACETS_ONLY_OPEN_PROJECTS, this.openCheck + "");
    }

}