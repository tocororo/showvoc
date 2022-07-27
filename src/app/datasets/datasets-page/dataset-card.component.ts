import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from '@angular/core';
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

    @ViewChild("modelBadge") modelBadge: ElementRef;
    @ViewChild("cardBody") cardBody: ElementRef;

    titleMaxWidth: string = "800px";

    constructor(private router: Router, private changeDetectorRef: ChangeDetectorRef) { }

    ngAfterViewInit() {
        let modelBadgeWidth = this.modelBadge.nativeElement.offsetWidth;
        let cardBodyWidth = this.cardBody.nativeElement.offsetWidth - 12; //subtract 12px of padding
        this.titleMaxWidth = cardBodyWidth - modelBadgeWidth + "px";
        this.changeDetectorRef.detectChanges();
    }

    goToProject(project: Project) {
        this.router.navigate(["/datasets/" + project.getName()]);
    }

}