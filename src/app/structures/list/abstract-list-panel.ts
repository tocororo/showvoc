import { Directive } from '@angular/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { PMKIEventHandler } from 'src/app/utils/PMKIEventHandler';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';
import { AbstractPanel } from '../abstract-panel';

@Directive()
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
    constructor(basicModals: BasicModalsServices, eventHandler: PMKIEventHandler, pmkiProp: PMKIProperties) {
        super(basicModals, eventHandler, pmkiProp);
    }

    /**
     * METHODS
     */

}