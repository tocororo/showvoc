import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

@Component({
	selector: 'resizable-layout',
    templateUrl: './resizable-layout.component.html',
    styleUrls: ['./resizable-layout.component.css'],
    host: {
        class: 'hbox',
        '(mousemove)': 'onMousemove($event)',
        '(mouseup)': 'onMouseup()',
        '(mouseleave)': 'onMouseup()'
    }
})
export class ResizableLayoutComponent {

    @ViewChild('leftdiv') private leftDiv: ElementRef;
    @ViewChild('rightdiv') private rightDiv: ElementRef;

    constructor(private cdRef:ChangeDetectorRef) {}

    /**
     * Returns true if the right div has been provided in the parent template
     */
    rightProvided(): boolean {
        return this.rightDiv.nativeElement && this.rightDiv.nativeElement.children.length > 0;
    }

    /**
     * There are two div:
     * - left div: the flex value varies between "minFlex" and "maxFlex"
     * - right div: the flex value is fixed to "rightFlex".
     * 
     * When resizing, it is changed just "leftFlex" between "minFlex" and "maxFlex".
     * The proportion between the two panels left:right stays between minFlex:rightFlex and maxFlex:rightFlex
     */

    leftFlex: number = 2;
    readonly rightFlex: number = 4;

    private readonly minFlex: number = 1;
    private readonly maxFlex: number = 16;

    private dragging: boolean = false;
    private startMousedownX: number;

    private onMousedown(event: MouseEvent) {
        event.preventDefault();
        this.dragging = true;
        this.startMousedownX = event.clientX;
        this.onMousemove = this.draggingHandler; //set listener on mousemove
    }
    private onMouseup() {
        if (this.dragging) { //remove listener on mousemove
            this.onMousemove = (event: MouseEvent) => {};
            this.dragging = false;
        }
    }
    private onMousemove(event: MouseEvent) {}
    private draggingHandler(event: MouseEvent) {
        let endMousedownX = event.clientX;
        let diffX: number = this.startMousedownX - endMousedownX;

        let leftDivWidth: number = this.leftDiv.nativeElement.offsetWidth;
        let rightDivWidth: number = this.rightDiv.nativeElement.offsetWidth;

        /**
         * Compute the leftFlex based on the following mathematical proportion:
         *  leftDivWidth:rightDivWidth = leftFlex:rightFlex
         * rightFlex is fixed, left and right divWidth are retrieved => compute leftFlex
         */
        this.leftFlex = (leftDivWidth-diffX)/(rightDivWidth+diffX)*this.rightFlex;

        //ensure that leftFlex stays between min and max flex
        if (this.leftFlex > this.maxFlex) {
            this.leftFlex = this.maxFlex;
        }
        else if (this.leftFlex < this.minFlex) {
            this.leftFlex = this.minFlex;
        }
        //update the initial X position of the cursor
        this.startMousedownX = event.clientX;
    }



}
