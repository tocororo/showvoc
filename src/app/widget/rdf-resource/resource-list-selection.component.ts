import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { AnnotatedValue, Value } from 'src/app/models/Resources';

@Component({
    selector: "resource-list-selection",
    templateUrl: "./resource-list-selection.component.html",
    host: { class: "vbox" }
})
export class ResourceListSelectionComponent {
    @Input() resources: AnnotatedValue<Value>[];
    @Input() rendering: boolean = true;
    @Input() multiselection: boolean = false;
    @Input() selectedResources: Value[]; //resources that will be selected once the dialog is initialized

    @Output() nodeSelected = new EventEmitter<AnnotatedValue<Value>[]>();
    @Output() dblClicked = new EventEmitter<AnnotatedValue<Value>>();

    @ViewChild('scrollableContainer') scrollableElement: ElementRef;

    nodeList: NodeStruct[];


    constructor() { }

    ngOnInit() {
        this.nodeList = [];
        this.resources.forEach(r => {
            this.nodeList.push({
                resource: r,
                selected: this.selectedResources && this.selectedResources.length > 0 && this.selectedResources.some(sr => sr.equals(r.getValue()))
            });
        });
        if (!this.multiselection && this.selectedResources && this.selectedResources.length > 1) {
            //multiselection disabled, but selected resources more than 1 -> leave only the first selected
            let firstChecked: boolean = false;
            for (let r of this.nodeList) {
                if (r.selected) {
                    if (firstChecked) {
                        r.selected = false;
                    } else {
                        firstChecked = true;
                    }
                }
            }
        }
    }

    onDblClick(node: NodeStruct) {
        this.dblClicked.emit(node.resource);
    }

    onResourceSelected(node: NodeStruct) {
        if (this.multiselection) {
            node.selected = !node.selected;
        } else {
            node.selected = true;
            //in case of multiselection disabled, deselected all the other resources
            this.nodeList.forEach(r => {
                if (r != node) {
                    r.selected = false;
                }
            });
        }
        this.emitSelection();
    }

    emitSelection() {
        let selectedRes: AnnotatedValue<Value>[] = [];
        this.nodeList.forEach(r => {
            if (r.selected) {
                selectedRes.push(r.resource);
            }
        });
        this.nodeSelected.emit(selectedRes);
    }


    //Resource limitation management
    private initialRes: number = 150;
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

interface NodeStruct {
    resource: AnnotatedValue<Value>;
    selected: boolean;
}