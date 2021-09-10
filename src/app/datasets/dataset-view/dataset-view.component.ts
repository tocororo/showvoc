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

    constructor(private router: Router, private activeRoute: ActivatedRoute) { }

    ngOnInit() {
        this.project = SVContext.getWorkingProject();
    }

    isActiveRoute(route: string) {
        let url: string = this.router.url.split("?")[0];
        let splittedUrl = url.split("/");
        let active = splittedUrl[splittedUrl.length-1];
        return active == route;
    }

    goToRoute(route: string) {
        let queryParams = {};
        if (this.activeRoute.snapshot.queryParams[ShowVocUrlParams.hideNav] != null) {
            queryParams[ShowVocUrlParams.hideNav] = this.activeRoute.snapshot.queryParams[ShowVocUrlParams.hideNav];
        }
        this.router.navigate([route], { relativeTo: this.activeRoute, queryParams: queryParams });
    }

}
