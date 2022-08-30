import { Component } from "@angular/core";
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { CustomServiceServices } from "../../services/custom-service-.service";
import { CustomServiceModalServices } from "./modals/custom-service-modal.service";

@Component({
    selector: "custom-services-component",
    templateUrl: "./custom-services-page.component.html",
    host: { class: "hbox" },
})
export class CustomServicesPageComponent {

    serviceIds: string[];
    selectedServiceId: string;

    constructor(private customServService: CustomServiceServices, private basicModals: BasicModalsServices,
        private customServiceModals: CustomServiceModalServices) { }

    ngOnInit() {
        this.initServices();
    }

    initServices() {
        this.customServService.getCustomServiceIdentifiers().subscribe(
            ids => {
                this.serviceIds = ids;
            }
        );
    }

    selectService(id: string) {
        if (this.selectedServiceId != id) {
            this.selectedServiceId = id;
        }
    }


    createService() {
        this.customServiceModals.openCustomServiceEditor({ key: "CUSTOM_SERVICES.ACTIONS.CREATE_CUSTOM_SERVICE" }).then(
            () => {
                this.initServices();
            },
            () => { }
        );
    }

    deleteService() {
        this.basicModals.confirm({ key: "CUSTOM_SERVICES.ACTIONS.DELETE_CUSTOM_SERVICE" }, { key: "CUSTOM_SERVICES.MESSAGES.DELETE_CUSTOM_SERVICE_CONFIRM" }, ModalType.warning).then(
            () => {
                this.customServService.deleteCustomService(this.selectedServiceId).subscribe(
                    () => {
                        this.selectedServiceId = null;
                        this.initServices();
                    }
                );
            }
        );
    }

    reload() {
        this.customServService.reloadCustomServices().subscribe(
            () => {
                this.initServices();
            }
        );
    }

}