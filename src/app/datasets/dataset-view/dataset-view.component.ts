import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'src/app/models/Project';
import { ShowVocUrlParams } from 'src/app/models/ShowVoc';
import { SVContext } from 'src/app/utils/SVContext';

@Component({
    selector: 'dataset-view',
    templateUrl: './dataset-view.component.html',
    host: { class: "pageComponent" },
    styles: [`
        /*.nav-pills .nav-link.active { background-color: #17a2b8; }*/
        .nav li a { padding: 10px; font-size: 15px; color: #17a2b8; }
    `]
})
export class DatasetViewComponent {

    @ViewChild("navtabs") navtabsEl: ElementRef;

    project: Project;

    hideDatasetName: boolean;

    isUserAuthorized: boolean;

    titleMaxWidth: number = 0;

    constructor(private router: Router, private activatedRoute: ActivatedRoute, private cdRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.project = SVContext.getWorkingProject();
        this.isUserAuthorized = SVContext.getLoggedUser().isSuperUser(false);
        this.activatedRoute.queryParams.subscribe(
            params => {
                this.hideDatasetName = params[ShowVocUrlParams.hideDatasetName] == "true";
            }
        );
    }

    ngAfterViewInit() {
        this.initTitleMaxWidth();
    }

    isActiveRoute(route: string) {
        let url: string = this.router.url.split("?")[0];
        let splittedUrl = url.split("/");
        let active = splittedUrl[splittedUrl.length - 1];
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

    @HostListener('window:resize', ['$event'])
    initTitleMaxWidth() {
        let tabsWidth: number = 0;
        let tabs: HTMLCollection = this.navtabsEl.nativeElement.children;
        for (let i = 0; i < tabs.length; i++) {
            let tab: Element = tabs.item(i);
            if (tab instanceof HTMLElement) {
                tabsWidth += tab.offsetWidth;
            }
        }
        this.titleMaxWidth = this.navtabsEl.nativeElement.offsetWidth - tabsWidth - 40; //40 gives an additional margin
        this.cdRef.detectChanges();
    }

}
