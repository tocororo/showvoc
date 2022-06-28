import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../../models/Project';

@Component({
    selector: 'dataset-card',
    templateUrl: './dataset-card.component.html',
    host: { class: "d-block" }
})
export class DatasetCardComponent {

    @Input() project: Project;
    @Input() accessible: boolean = true;

    constructor(private router: Router) { }

    goToProject(project: Project) {
        this.router.navigate(["/datasets/" + project.getName()]);
    }

}