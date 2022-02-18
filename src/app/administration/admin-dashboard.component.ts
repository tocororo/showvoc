import { Component, OnInit } from '@angular/core';
import { SVContext } from '../utils/SVContext';

@Component({
    selector: 'admin-dashboard-component',
    templateUrl: './admin-dashboard.component.html',
    host: { class: "pageComponent" }
})
export class AdminDashboardComponent implements OnInit {

    isAdmin: boolean

    constructor() { }

    ngOnInit() {
        this.isAdmin = SVContext.getLoggedUser().isAdmin();
    }

}