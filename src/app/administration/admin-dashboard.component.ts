import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'admin-dashboard-component',
    templateUrl: './admin-dashboard.component.html',
    host: { class: "pageComponent" }
})
export class AdminDashboardComponent implements OnInit {

    constructor() { }

    ngOnInit() {
    }

}