import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbTabset, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';

@Component({
	selector: 'sparql-component',
	templateUrl: './sparql.component.html',
    host: { class: "pageComponent" },
})
export class SparqlComponent implements OnInit {

    @ViewChild(NgbTabset) viewChildTabset: NgbTabset;

    tabs: Tab[] = [];
    private idCount: number = 1;

    constructor() { }

	ngOnInit() {
        this.addTab();
	}

    addTab(event?: Event) {
        if (event) event.preventDefault();

        this.tabs.push({ id: this.idCount });
        setTimeout(() => {
            this.viewChildTabset.select("tab"+this.idCount);
            this.idCount++;
        });
    }

    closeTab(tab: Tab, event: Event) {
        event.preventDefault(); //prevent the refresh of the page
        //remove the tab to close
        let idxTabToClose: number = this.tabs.indexOf(tab);
        this.tabs.splice(idxTabToClose, 1);
        //select the previous tab, or the following in case the closed tab was the first one
        if (idxTabToClose > 0) {
            this.viewChildTabset.select("tab"+this.tabs[idxTabToClose-1].id);
        } else {
            this.viewChildTabset.select("tab"+this.tabs[idxTabToClose].id);
        }
    }

    onTabChange(event: NgbTabChangeEvent) {
        if (event.nextId == "addTab") {
            event.preventDefault();
            this.addTab();
        }
    }


}

class Tab {
    id: number;
}