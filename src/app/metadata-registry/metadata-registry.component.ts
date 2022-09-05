import { Component } from "@angular/core";
import { finalize } from 'rxjs/operators';
import { Project } from 'src/app/models/Project';
import { HttpServiceContext } from 'src/app/utils/HttpManager';
import { BasicModalsServices } from '../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../modal-dialogs/Modals';
import { CatalogRecord2 } from '../models/Metadata';
import { MapleServices } from '../services/maple.service';

@Component({
    selector: "metadata-registry-component",
    templateUrl: "./metadata-registry.component.html",
    host: { class: "vbox" },
})
export class MetadataRegistryComponent {

    selectedCatalogRecord2: CatalogRecord2;

    activeTab: AddendaTabsEnum = "lexicalizationSets";

    profilationLoading: boolean;

    constructor(private mapleService: MapleServices, private basicModals: BasicModalsServices) { }

    /**
     * Catalog records
     */

    onCatalogSelected(catalogRecord: CatalogRecord2) {
        this.selectedCatalogRecord2 = catalogRecord;
    }

    profileProject() {
        let project: Project = new Project(this.selectedCatalogRecord2.dataset.projectName);
        HttpServiceContext.setContextProject(project);
        this.mapleService.checkProjectMetadataAvailability().pipe(
            finalize(() => HttpServiceContext.removeContextProject())
        ).subscribe(
            available => {
                if (available) {
                    this.basicModals.confirm({ key: "DATASETS.ACTIONS.PROFILE_DATASET" }, { key: "MESSAGES.REFRESH_METADATA_CONFIRM", params: { datasetName: project.getName() } }, ModalType.warning).then(
                        () => {
                            this.profileProjectImpl(project);
                        },
                        () => { }
                    );
                } else {
                    this.profileProjectImpl(project);
                }
            }
        );
    }
    
    private profileProjectImpl(project: Project) {
        this.profilationLoading = true;
        HttpServiceContext.setContextProject(project);
        this.mapleService.profileProject().pipe(
            finalize(() => HttpServiceContext.removeContextProject())
        ).subscribe(
            () => {
                this.profilationLoading = false;
            }
        );
    }


}

type AddendaTabsEnum = "linksets" | "lexicalizationSets";