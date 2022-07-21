import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SVContext } from 'src/app/utils/SVContext';

@Component({
    selector: 'sparql-component',
    templateUrl: './sparql.component.html',
    host: { class: "pageComponent" },
})
export class SparqlComponent implements OnInit {

    @ViewChild(NgbNav) viewChildNavbar: NgbNav;

    tabs: Tab[] = [];
    tabLimit: number = 10;
    private idCount: number = 1;

    TabType = TabType;
    readonly TAB_ID_PREFIX: string = "tab";

    isAuthenticatedUser: boolean;
    
    constructor(private changeDetectorRef: ChangeDetectorRef, private translateService: TranslateService) { }

    ngOnInit() {
        this.isAuthenticatedUser = SVContext.getLoggedUser().isSuperUser(false);
        this.addTab(TabType.query);
    }

    addTab(type: TabType) {
        let tab: Tab = { id: this.idCount, name: null, type: type, saved: false };
        this.translateService.get(type == TabType.query ? "Query" : "SPARQL.QUERY.PARAMETERIZED_QUERY")
            .subscribe(translation => { tab.name = translation; });
        this.tabs.push(tab);

        this.changeDetectorRef.detectChanges();
        this.viewChildNavbar.select(this.TAB_ID_PREFIX + this.idCount);
        this.idCount++;
    }

    closeTab(tab: Tab, event: Event) {
        event.preventDefault(); //prevent the refresh of the page
        //remove the tab to close
        let idxTabToClose: number = this.tabs.indexOf(tab);
        this.tabs.splice(idxTabToClose, 1);
        if (this.TAB_ID_PREFIX + tab.id == this.viewChildNavbar.activeId) { //closed tab is the active one
            //select the previous tab, or the following in case the closed tab was the first one
            if (idxTabToClose > 0) {
                this.viewChildNavbar.select(this.TAB_ID_PREFIX + this.tabs[idxTabToClose - 1].id);
            } else {
                this.viewChildNavbar.select(this.TAB_ID_PREFIX + this.tabs[idxTabToClose].id);
            }
        }

    }

}

class Tab {
    id: number;
    name: string;
    type: TabType;
    saved: boolean;
}

enum TabType {
    query = "query",
    parameterization = "parameterization",
}