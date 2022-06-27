import { ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { AbstractLinkComponent } from '../../abstract-link';
import { ModelLink } from '../../model/ModelLink';

@Component({
    selector: '[model-link]',
    templateUrl: "./model-link.component.html",
    styleUrls: ['../../graph.css']
})
export class ModelLinkComponent extends AbstractLinkComponent {
    @Input('model-link') link: ModelLink;

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['rendering'] && !changes['rendering'].firstChange) {
            this.updateShow();
        }
    }

    getLinkShow() {
        return ResourceUtils.getRendering(this.link.res, this.rendering);
    }

    initLinkStyle() {
        if (this.link.res != null) {
            //distinguish the type or predicate
            let role: RDFResourceRolesEnum = this.link.res.getRole();
            this.arrowClass = role + "Arrow";
        }
    }

}