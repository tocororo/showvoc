import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { AnnotatedValue, Resource } from 'src/app/models/Resources';

@Component({
    selector: "resource-list",
    templateUrl: "./resource-list.component.html",
    host: { class: "vbox" }
})
export class ResourceListComponent {
    @Input() resources: AnnotatedValue<Resource>[];
    @Input() rendering: boolean = true;
    @Output() nodeSelected = new EventEmitter<AnnotatedValue<Resource>>();

    @ViewChild('scrollableContainer') scrollableElement: ElementRef;

    private resourceSelected: AnnotatedValue<Resource>;

    constructor() { }

    private onResourceSelected(resource: AnnotatedValue<Resource>) {
        this.resourceSelected = resource;
        this.nodeSelected.emit(resource);
    }

    //Resource limitation management
    private initialRes: number = 50;
    private resLimit: number = this.initialRes;
    private increaseRate: number = this.initialRes / 5;
    onScroll() {
        let scrollElement: HTMLElement = this.scrollableElement.nativeElement;
        if (Math.abs(scrollElement.scrollHeight - scrollElement.offsetHeight - scrollElement.scrollTop) < 2) {
            //bottom reached => increase max range if there are more roots to show
            if (this.resLimit < this.resources.length) {
                this.resLimit += this.increaseRate;
            }
        }
    }

}