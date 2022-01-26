import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/models/Project';
import { ShowVocUrlParams } from 'src/app/models/ShowVoc';
import { SVContext } from 'src/app/utils/SVContext';

@Component({
    selector: 'dataset-view',
    templateUrl: './dataset-view.component.html',
    host: { class: "pageComponent" },
    styles: [`
		.nav-pills .nav-link.active { background-color: #17a2b8; }
		a { color: #17a2b8; }
	`]
})
export class DatasetViewComponent {

    project: Project;

    hideDatasetName: boolean;

    constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

    ngOnInit() {
        this.project = SVContext.getWorkingProject();
        this.activatedRoute.queryParams.subscribe(
            params => {
                this.hideDatasetName = params[ShowVocUrlParams.hideDatasetName] == "true";
            }
        );
    }

    isActiveRoute(route: string) {
        let url: string = this.router.url.split("?")[0];
        let splittedUrl = url.split("/");
        let active = splittedUrl[splittedUrl.length-1];
        return active == route;
    }

    goToRoute(route: string) {
        let queryParams = {};
        if (this.activatedRoute.snapshot.queryParams[ShowVocUrlParams.hideNav] != null) {
            queryParams[ShowVocUrlParams.hideNav] = this.activatedRoute.snapshot.queryParams[ShowVocUrlParams.hideNav];
        }
        if (this.activatedRoute.snapshot.queryParams[ShowVocUrlParams.hideDatasetName] != null) {
            queryParams[ShowVocUrlParams.hideDatasetName] = this.activatedRoute.snapshot.queryParams[ShowVocUrlParams.hideDatasetName];
        }
        this.router.navigate([route], { relativeTo: this.activatedRoute, queryParams: queryParams });
    }

}
