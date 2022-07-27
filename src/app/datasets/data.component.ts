import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { InverseRewritingRule } from '../models/HttpResolution';
import { Project } from '../models/Project';
import { ShowVocUrlParams } from '../models/ShowVoc';
import { HttpResolutionServices } from '../services/http-resolution.service';
import { MetadataServices } from '../services/metadata.service';
import { ProjectsServices } from '../services/projects.service';
import { UserServices } from '../services/user.service';
import { DatatypeValidator } from '../utils/DatatypeValidator';
import { SVContext } from '../utils/SVContext';
import { SVProperties } from '../utils/SVProperties';

@Component({
    selector: 'data-component',
    templateUrl: './data.component.html',
    host: { class: "pageComponent" }
})
export class DataComponent {

    initialized: boolean;

    constructor(private activatedRoute: ActivatedRoute, private router: Router, private httpResolutionService: HttpResolutionServices, private projectsService: ProjectsServices,
        private userService: UserServices, private metadataService: MetadataServices,
        private svProp: SVProperties, private dtValidator: DatatypeValidator, private basicModals: BasicModalsServices,
        private location: Location) { }

    ngOnInit() {

        let resId: string = this.activatedRoute.snapshot.queryParams[ShowVocUrlParams.resId];
        let resURI: string = this.activatedRoute.snapshot.queryParams["resURI"];


        if (resURI) {
            this.httpResolutionService.getBrowsingInfo(resURI).subscribe(
                (info: { project: string; inverseRewritingRules: InverseRewritingRule[] }) => {

                    let rule: InverseRewritingRule;
                    if (info.inverseRewritingRules) {
                        rule = info.inverseRewritingRules.find(r => {
                            let sourceRegexp = new RegExp(r.sourceRDFresURIregExp);
                            return resURI.match(sourceRegexp);
                        });
                    }

                    if (rule == null) {
                        this.basicModals.alert({ key: "COMMONS.STATUS.ERROR" }, { key: "Unable to find an inverse rewriting rule matching URI " + resURI }, ModalType.error);
                        return;
                    }

                    let sourceRegexp = new RegExp(rule.sourceRDFresURIregExp);
                    let resolvedResourceIRI: string = resURI.replace(sourceRegexp, rule.targetResURIExp);

                    this.initProject(info.project).subscribe(
                        (initialized) => {
                            this.initialized = initialized;
                            this.setUrl(resolvedResourceIRI);
                        }
                    );
                }
            );
        } else if (resId) {
            this.httpResolutionService.getMappedProject(resId).subscribe(
                (projectName: string) => {
                    this.initProject(projectName).subscribe(
                        (initialized) => {
                            this.initialized = initialized;
                            this.setUrl(resId);
                        }
                    );
                }
            );
        }
    }

    private setUrl(resourceIRI: string) {
        this.router.navigate(
            [],
            {
                relativeTo: this.activatedRoute,
                queryParams: {
                    [ShowVocUrlParams.resId]: resourceIRI, //set resId
                    "resURI": null //remove resURI
                },
                queryParamsHandling: 'merge', //keep other params
            });
    }

    private initProject(projectName: string): Observable<boolean> {
        return this.projectsService.listProjects(null, true, true).pipe( //retrieve project with a service invocation
            mergeMap(projects => {
                let p: Project = projects.find(p => p.getName() == projectName);
                if (p != null) { //project fount
                    SVContext.initProjectCtx(p);
                    let projInitFunctions: Observable<any>[] = [
                        this.metadataService.getNamespaceMappings(),
                        this.dtValidator.initDatatypeRestrictions(),
                        this.svProp.initProjectSettings(SVContext.getProjectCtx()),
                        this.svProp.initUserProjectPreferences(SVContext.getProjectCtx()),
                        this.userService.listUserCapabilities() //get the capabilities for the user
                    ];
                    return forkJoin(projInitFunctions).pipe(
                        map(() => {
                            return true;
                        })
                    );
                } else { //project not found, redirect to home
                    this.basicModals.alert({ key: "DATASETS.STATUS.DATASET_NOT_FOUND" }, { key: "MESSAGES.UNEXISTING_OR_INACCESSIBLE_DATASET", params: { datasetId: projectName } }, ModalType.warning).then(
                        () => {
                            this.router.navigate(
                                ['/home'], 
                                { 
                                    queryParams: {
                                        [ShowVocUrlParams.resId]: null, //remove resId
                                    },
                                    queryParamsHandling: "merge" //and keep other params
                                });
                        }
                    );
                    return of(false);
                }
            })
        );
    }

}
