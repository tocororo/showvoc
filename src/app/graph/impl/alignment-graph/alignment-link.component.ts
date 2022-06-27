import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { AbstractLinkComponent } from '../../abstract-link';
import { AlignmentLink } from '../../model/AlignmentLink';

@Component({
    selector: '[align-link]',
    templateUrl: "./alignment-link.component.html",
    styleUrls: ['../../graph.css']
})
export class AlignmentLinkComponent extends AbstractLinkComponent {
    @Input('align-link') link: AlignmentLink;
    @Input() showPercentage: boolean = false;

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['showPercentage'] && !changes['showPercentage'].firstChange) {
            this.updateShow();
        }
    }

    getLinkShow() {
        return this.showPercentage ? this.link.linkset.linkPercentage+"%" : this.link.linkset.linkCount+"";
    }

    initLinkStyle() {
        //do not add any class to the already existing "link" class (see AbstractLinkComponent)
    }

}