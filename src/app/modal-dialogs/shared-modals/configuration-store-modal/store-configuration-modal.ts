import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Reference } from 'src/app/models/Configuration';
import { Scope, ScopeUtils } from 'src/app/models/Plugins';
import { ConfigurationsServices } from 'src/app/services/configuration.service';
import { BasicModalsServices } from '../../basic-modals/basic-modals.service';
import { ModalType } from '../../Modals';

@Component({
    selector: "store-configuration",
    templateUrl: "./store-configuration-modal.html",
})
export class StoreConfigurationModal {
    @Input() title: string;
    @Input() configurationComponent: string;
    @Input() configurationObject: { [key: string]: any };
    @Input() relativeRef: string;

    scopes: Scope[];
    selectedScope: Scope;

    identifier: string;

    references: Reference[];
    private selectedRef: Reference;

    constructor(public activeModal: NgbActiveModal, private configurationsService: ConfigurationsServices, private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.configurationsService.getConfigurationManager(this.configurationComponent).subscribe(
            confMgr => {
                this.scopes = confMgr.configurationScopes;
                this.selectedScope = this.scopes[0];

                if (this.relativeRef) {
                    this.identifier = this.relativeRef.substring(this.relativeRef.indexOf(":") + 1);
                    this.selectedScope = Reference.getRelativeReferenceScope(this.relativeRef);
                }
            }
        );

        this.configurationsService.getConfigurationReferences(this.configurationComponent).subscribe(
            refs => {
                this.references = refs;
            }
        );
    }

    selectReference(reference: Reference) {
        this.selectedRef = reference;
        this.identifier = this.selectedRef.identifier.substring(this.selectedRef.identifier.indexOf(":"));
        this.selectedScope = this.selectedRef.getReferenceScope();
    }

    ok() {
        let idRegexp = new RegExp("^[\\w\\s.,-]+$"); //regexp for validating id (id will be the name of the file storing the configuration)
        if (!idRegexp.test(this.identifier)) {
            this.basicModals.alert({ key: "COMMONS.STATUS.INVALID_VALUE" }, { key: "MESSAGES.NOT_ALLOWED_CHARS_IN_ID" }, ModalType.warning);
            return;
        }

        //this is strange: I get the configuration scopes from the server but I need to hardwire the convertion to the serialization for the relativeReference
        let scopeSerialization: string = ScopeUtils.serializeScope(<Scope>this.selectedScope);
        let relativeReference: string = scopeSerialization + ":" + this.identifier;

        this.configurationsService.storeConfiguration(this.configurationComponent, relativeReference, this.configurationObject).subscribe(
            () => {
                this.activeModal.close(relativeReference);
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}