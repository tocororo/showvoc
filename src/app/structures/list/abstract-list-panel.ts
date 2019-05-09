import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { AbstractPanel } from '../abstract-panel';

export abstract class AbstractListPanel extends AbstractPanel {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    /**
     * ATTRIBUTES
     */

    /**
     * CONSTRUCTOR
     */
    constructor(basicModals: BasicModalsServices, eventHandler: PMKIEventHandler, vbProp: PMKIProperties) {
        super(basicModals, eventHandler, vbProp);
    }

    /**
     * METHODS
     */

}