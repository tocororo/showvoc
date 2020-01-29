import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { AbstractLinkComponent } from '../../abstract-link';
import { DataLink } from '../../model/DataLink';

@Component({
    selector: '[data-link]',
    templateUrl: "./data-link.component.html",
    styleUrls: ['../../graph.css']
})
export class DataLinkComponent extends AbstractLinkComponent {
    @Input('data-link') link: DataLink;
    @Input() rendering: boolean = true;

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['rendering'] && !changes['rendering'].firstChange) {
            this.updateShow();
        }
    }

    updateShow() {
        this.show = ResourceUtils.getRendering(this.link.res, this.rendering);
        this.changeDetectorRef.detectChanges(); //fire change detection in order to update the textEl that contains "show"
    }

    initLinkStyle() {
        if (this.link.res != null) {
            //distinguish the type or predicate
            let role: RDFResourceRolesEnum = this.link.res.getRole();
            this.arrowClass = role + "Arrow";
        }
    }

}