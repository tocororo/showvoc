import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { AbstractLinkComponent } from '../../abstract-link';
import { DataLink } from '../../model/DataLink';

@Component({
    selector: '[data-link]',
    templateUrl: "./data-link.component.html",
    styleUrls: ['../../graph.css']
})
export class DataLinkComponent extends AbstractLinkComponent {
    @Input('data-link') link: DataLink;

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['rendering'] && !changes['rendering'].firstChange) {
            this.updateShow();
        }
    }

    getLinkShow() {
        //see https://art-uniroma2.atlassian.net/browse/ST-2265
        // return ResourceUtils.getRendering(this.link.res, this.rendering);
        return this.link.res.getShow();
    }

    initLinkStyle() {
        if (this.link.res != null) {
            //distinguish the type or predicate
            let role: RDFResourceRolesEnum = this.link.res.getRole();
            this.arrowClass = role + "Arrow";
        }
    }

}