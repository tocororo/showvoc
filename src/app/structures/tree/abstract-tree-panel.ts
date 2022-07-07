import { Directive } from '@angular/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { SVEventHandler } from 'src/app/utils/SVEventHandler';
import { SVProperties } from 'src/app/utils/SVProperties';
import { AbstractPanel } from '../abstract-panel';

@Directive()
export abstract class AbstractTreePanel extends AbstractPanel {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    /**
     * ATTRIBUTES
     */

    /**
     * CONSTRUCTOR
     */
    constructor(basicModals: BasicModalsServices, sharedModals: SharedModalsServices, eventHandler: SVEventHandler, svProp: SVProperties) {
        super(basicModals, sharedModals, eventHandler, svProp);
    }

    /**
     * METHODS
     */

}