import { Component, Input } from '@angular/core';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { AnnotatedValue, Value, Resource } from 'src/app/models/Resources';

@Component({
    selector: 'resource-details-panel',
    templateUrl: './resource-details-panel.html',
    host: { class: "vbox" }
})
export class ResourceDetailsPanel {

    @Input() resource: AnnotatedValue<Value>;

    constructor(private sharedModals: SharedModalsServices) { }

    private showResourceView() {
        this.sharedModals.openResourceView(<Resource>this.resource.getValue());
    }

}