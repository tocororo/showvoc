import { Component, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { finalize } from 'rxjs/operators';
import { IRI } from 'src/app/models/Resources';
import { ShowVocConstants } from 'src/app/models/ShowVoc';
import { AdministrationServices } from 'src/app/services/administration.service';
import { ProjectsServices } from 'src/app/services/projects.service';
import { SettingsServices } from "src/app/services/settings.service";
import { ExtensionConfiguratorComponent } from 'src/app/widget/extensionConfigurator/extension-configurator.component';
import { BasicModalsServices } from '../../modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions, ModalType } from '../../modal-dialogs/Modals';
import { PluginSpecification } from '../../models/Plugins';
import { BackendTypesEnum, Repository, RepositoryAccess } from '../../models/Project';
import { ExtensionsServices } from '../../services/extensions.service';
import { AbstractProjectCreationModal } from "./abstract-project-creation-modal";
import { RemoteRepoSelectionModal } from './remote-repositories/remote-repo-selection-modal';

@Component({
    selector: "create-project-modal",
    templateUrl: "./create-project-modal.html",
})
export class CreateProjectModal extends AbstractProjectCreationModal {

    @ViewChild("dataRepoConfigurator") dataRepoConfigurator: ExtensionConfiguratorComponent;

    loading: boolean;

    dataRepoId: string;

    //backend types (when accessing an existing remote repository)
    backendTypes: BackendTypesEnum[] = [BackendTypesEnum.openrdf_NativeStore, BackendTypesEnum.openrdf_MemoryStore, BackendTypesEnum.graphdb_FreeSail];
    selectedCoreRepoBackendType: BackendTypesEnum = this.backendTypes[0];

    //not used (since in ShowVoc the project creation doesn't support History nor Validation), but still necessary to the createProject()
    private supportRepoId: string;

    constructor(activeModal: NgbActiveModal, settingsService: SettingsServices, extensionsService: ExtensionsServices, modalService: NgbModal,
        private projectService: ProjectsServices, private adminService: AdministrationServices, private basicModals: BasicModalsServices, private translateService: TranslateService) {
            super(activeModal, modalService, extensionsService, settingsService);
        }

    ngOnInit() {
        this.initCoreRepoExtensions();

        this.initRemoteConfigs();
    }

    /**
     * If the user is creation a project (not accessing an existing one),
     * the data repository IDs are determined from project's name
     */
    onProjectNameChange() {
        if (this.isRepoAccessCreateMode()) {
            this.dataRepoId = this.projectName.trim().replace(new RegExp(" ", 'g'), "_") + "_core";
            this.supportRepoId = this.projectName.trim().replace(new RegExp(" ", 'g'), "_") + "_support";
        }
    }

    /**
     * Handler of the button to explore remote repositories (when accessing an existing one)
     * @returns 
     */
    changeRemoteRepository() {
        if (this.selectedRemoteRepoConfig == null || this.selectedRemoteRepoConfig.serverURL == null) {
            this.basicModals.alert({ key: "COMMONS.CONFIG.MISSING_CONFIGURATION" }, {key:"MESSAGES.REMOTE_REPO_ACCESS_NOT_CONFIGURED"}, ModalType.warning);
            return;
        }

        const modalRef: NgbModalRef = this.modalService.open(RemoteRepoSelectionModal, new ModalOptions("lg"));
        modalRef.componentInstance.title = this.translateService.instant("ADMINISTRATION.DATASETS.REMOTE.SELECT_REMOTE_REPO");
        modalRef.componentInstance.repoConfig = this.selectedRemoteRepoConfig;
        modalRef.result.then(
            (repo: Repository) => {
                this.dataRepoId = (<Repository>repo).id;
            },
            () => { }
        );
    }

    ok() {
        //check project name
        if (!this.projectName || this.projectName.trim() == "") {
            this.basicModals.alert({ key: "DATASETS.ACTIONS.CREATE_DATASET" }, {key:"MESSAGES.DATASET_NAME_MISSING"}, ModalType.warning);
            return;
        }
        //check baseURI
        if (this.baseURI == null || this.baseURI.trim() == "") {
            this.basicModals.alert({ key: "DATASETS.ACTIONS.CREATE_DATASET" }, {key:"MESSAGES.BASEURI_MISSING"}, ModalType.warning);
            return;
        }

        /**
         * Prepare repositoryAccess parameter
         */
        let repositoryAccess: RepositoryAccess = new RepositoryAccess(this.selectedRepositoryAccess);
        //in case of remote repository access, set the configuration
        if (this.isRepoAccessRemote()) {
            if (this.selectedRemoteRepoConfig == null) {
                this.basicModals.alert({ key: "COMMONS.CONFIG.MISSING_CONFIGURATION" }, {key:"MESSAGES.REMOTE_REPO_ACCESS_NOT_CONFIGURED"}, ModalType.warning);
                return;
            }
            repositoryAccess.setConfiguration(this.selectedRemoteRepoConfig);
        }

        //check if data repository configuration needs to be configured
        if (this.selectedDataRepoConfig.requireConfiguration()) {
            this.basicModals.alert({ key: "COMMONS.CONFIG.MISSING_CONFIGURATION" }, {key:"MESSAGES.DATA_REPO_NOT_CONFIGURED"}, ModalType.warning);
            return;
        }
        let coreRepoSailConfigurerSpecification: PluginSpecification = {
            factoryId: this.selectedDataRepoExtension.id,
            configType: this.selectedDataRepoConfig.type,
            configuration: this.selectedDataRepoConfig.getPropertiesAsMap()
        }

        //backend types
        let coreRepoBackendType: BackendTypesEnum;
        if (!this.isRepoAccessCreateMode()) {
            coreRepoBackendType = this.selectedCoreRepoBackendType;
        }

        //support repo ID even if it's not used it is a mandatory param. Here set a fake id only if not explicitly initialized
        if (this.supportRepoId == null) {
            this.supportRepoId = this.projectName + "_support";
        }

        this.loading = true;
        this.projectService.createProject(this.projectName, this.baseURI, new IRI(this.selectedSemModel), new IRI(this.selectedLexModel),
            false, false, false, repositoryAccess, this.dataRepoId, this.supportRepoId, coreRepoSailConfigurerSpecification, coreRepoBackendType).pipe(
                finalize(() => this.loading = false)
            ).subscribe(() => {
                this.adminService.addRolesToUser(this.projectName, ShowVocConstants.visitorEmail, [ShowVocConstants.roleStaging]).pipe(
                    finalize(() => this.loading = false)
                ).subscribe(() => {
                    this.basicModals.alert({ key: "DATASETS.STATUS.DATASET_CREATED" }, {key:"MESSAGES.DATASET_CREATED"});
                    this.activeModal.close();
                })
            });
    }

}