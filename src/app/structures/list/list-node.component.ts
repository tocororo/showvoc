import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractNode } from '../abstract-node';

@Component({
	selector: 'list-node',
	templateUrl: './list-node.component.html'
})
export class ListNodeComponent extends AbstractNode implements OnInit {

    //get an element in the view referenced with #listNodeElement (useful to apply scrollIntoView in the search function)
    @ViewChild('listNodeElement') listNodeElement: ElementRef;

	constructor() {
		super()
	}

	ngOnInit() {
	}

    ensureVisible() {
        this.listNodeElement.nativeElement.scrollIntoView({block: 'end', behavior: 'smooth'});
    }

}
