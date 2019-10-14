import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'load-data',
    templateUrl: './load-data.component.html',
    host: { class: "pageComponent" }
})
export class LoadDataComponent {

    private token: string;

    constructor(private activeRoute: ActivatedRoute) { }

    ngOnInit() {
        this.token = this.activeRoute.snapshot.params['token'];
    }


}