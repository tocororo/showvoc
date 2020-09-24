import { Component, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { PmkiConstants } from 'src/app/models/Pmki';
import { Properties } from 'src/app/models/Properties';
import { IRI } from 'src/app/models/Resources';
import { AdministrationServices } from 'src/app/services/administration.service';
import { PreferencesSettingsServices } from 'src/app/services/preferences-settings.service';
import { ProjectsServices } from 'src/app/services/projects.service';
import { ExtensionConfiguratorComponent } from 'src/app/widget/extensionConfigurator/extension-configurator.component';
import { BasicModalsServices } from '../../modal-dialogs/basic-modals/basic-modals.service';
import { ModalOptions, ModalType } from '../../modal-dialogs/Modals';
import { ConfigurableExtensionFactory, ExtensionPointID, PluginSpecification, Settings } from '../../models/Plugins';
import { BackendTypesEnum, Project, RemoteRepositoryAccessConfig, Repository, RepositoryAccess, RepositoryAccessType } from '../../models/Project';
import { OntoLex, OWL, RDFS, SKOS, SKOSXL } from '../../models/Vocabulary';
import { ExtensionsServices } from '../../services/extensions.service';
import { RemoteAccessConfigModal } from './remote-access-config-modal';
import { RemoteRepoSelectionModal } from './remote-repositories/remote-repo-selection-modal';

@Component({
    selector: "create-project-modal",
    templateUrl: "./create-project-modal.html",
})
export class CreateProjectModal {

    @ViewChild("dataRepoConfigurator") dataRepoConfigurator: ExtensionConfiguratorComponent;

    loading: boolean;

    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal, private projectService: ProjectsServices,
        private extensionsService: ExtensionsServices, private adminService: AdministrationServices,
        private prefService: PreferencesSettingsServices, private basicModals: BasicModalsServices) { }

    ngOnInit() {
        // init core repo extensions
        this.extensionsService.getExtensions(ExtensionPointID.REPO_IMPL_CONFIGURER_ID).subscribe(
            extensions => {
                this.dataRepoExtensions = <ConfigurableExtensionFactory[]>extensions;
                setTimeout(() => { //let the dataRepoConfigurator component to be initialized (due to *ngIf="dataRepoExtensions")
                    this.dataRepoConfigurator.selectExtensionAndConfiguration(this.DEFAULT_REPO_EXTENSION_ID, this.DEFAULT_REPO_CONFIG_TYPE);
                });
            }
        );

        this.initRemoteConfigs();
    }

    /** =========================================
     * Basic project info
     * ========================================= */

    projectName: string;
    baseURI: string;

    semanticModels: { uri: string, show: string }[] = [
        { uri: RDFS.uri, show: Project.getPrettyPrintModelType(RDFS.uri) },
        { uri: OWL.uri, show:  Project.getPrettyPrintModelType(OWL.uri) },
        { uri: SKOS.uri, show: Project.getPrettyPrintModelType(SKOS.uri) },
        { uri: OntoLex.uri, show: Project.getPrettyPrintModelType(OntoLex.uri) }
    ];
    selectedSemModel: string = SKOS.uri;

    lexicalizationModels: { uri: string, show: string }[] = [
        { uri: RDFS.uri, show: Project.getPrettyPrintModelType(RDFS.uri) },
        { uri: SKOS.uri, show: Project.getPrettyPrintModelType(SKOS.uri) },
        { uri: SKOSXL.uri, show: Project.getPrettyPrintModelType(SKOSXL.uri) },
        { uri: OntoLex.uri, show: Project.getPrettyPrintModelType(OntoLex.uri) }
    ];
    selectedLexModel: string = SKOS.uri; //SKOS

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


    /** =========================================
     * Repository handlers
     * ========================================= */

    repositoryAccessList: RepositoryAccessType[] = [RepositoryAccessType.CreateLocal, RepositoryAccessType.CreateRemote, RepositoryAccessType.AccessExistingRemote]
    selectedRepositoryAccess: RepositoryAccessType = this.repositoryAccessList[1];

    dataRepoId: string;
    dataRepoExtensions: ConfigurableExtensionFactory[];
    private selectedDataRepoExtension: ConfigurableExtensionFactory;
    private selectedDataRepoConfig: Settings;

    remoteRepoConfigs: RemoteRepositoryAccessConfig[] = [];
    selectedRemoteRepoConfig: RemoteRepositoryAccessConfig;

    private supportRepoId: string; //not used (since in PMKI the project creation doesn't support History nor Validation), but still necessary to the createProject()


    //backend types (when accessing an existing remote repository)
    private backendTypes: BackendTypesEnum[] = [BackendTypesEnum.openrdf_NativeStore, BackendTypesEnum.openrdf_MemoryStore, BackendTypesEnum.graphdb_FreeSail];
    private selectedCoreRepoBackendType: BackendTypesEnum = this.backendTypes[0];
    private selectedSupportRepoBackendType: BackendTypesEnum = this.backendTypes[0];

    private DEFAULT_REPO_EXTENSION_ID = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.PredefinedRepositoryImplConfigurer";
    private DEFAULT_REPO_CONFIG_TYPE = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.RDF4JNativeSailConfigurerConfiguration";

    private initRemoteConfigs() {
        this.prefService.getSystemSettings([Properties.setting_remote_configs]).subscribe(
            stResp => {
                if (stResp[Properties.setting_remote_configs] != null) {
                    this.remoteRepoConfigs = <RemoteRepositoryAccessConfig[]> JSON.parse(stResp[Properties.setting_remote_configs]);
                    //initialize the selected configuration
                    if (this.selectedRemoteRepoConfig != null) {
                        //if previously a config was already selected, select it again (deselected if not found, probably it has been deleted)
                        this.selectedRemoteRepoConfig = this.remoteRepoConfigs.find(c => c.serverURL == this.selectedRemoteRepoConfig.serverURL);
                    } else {
                        if (this.remoteRepoConfigs.length == 1) { //in case of just one configuration, select it
                            this.selectedRemoteRepoConfig = this.remoteRepoConfigs[0];
                        }
                    }
                } else {
                    this.remoteRepoConfigs = [];
                    this.selectedRemoteRepoConfig = null;
                }
            }
        );
    }

    /**
     * Tells if the selected RepositoryAccess is remote
     */
    isRepoAccessRemote(): boolean {
        return this.selectedRepositoryAccess == RepositoryAccessType.CreateRemote || this.selectedRepositoryAccess == RepositoryAccessType.AccessExistingRemote;
    }

    /**
     * Tells if the selected RepositoryAccess is in create mode.
     */
    isRepoAccessCreateMode(): boolean {
        return (this.selectedRepositoryAccess == RepositoryAccessType.CreateLocal ||
            this.selectedRepositoryAccess == RepositoryAccessType.CreateRemote);
    }

    configRemoteRepoAccess() {
        this.modalService.open(RemoteAccessConfigModal, new ModalOptions("lg")).result.then(
            () => {
                this.initRemoteConfigs();
            },
            () => {
                this.initRemoteConfigs();
            }
        );
    }

    changeRemoteRepository() {
        if (this.selectedRemoteRepoConfig == null || this.selectedRemoteRepoConfig.serverURL == null) {
            this.basicModals.alert("Missing configuration", "The remote 'Repository Access' has not been configure.", ModalType.warning);
            return;
        }

        const modalRef: NgbModalRef = this.modalService.open(RemoteRepoSelectionModal, new ModalOptions("lg"));
        modalRef.componentInstance.title = "Select Remote Data Repository";
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
            this.basicModals.alert("Create dataset", "Dataset name is missing or not valid", ModalType.warning);
            return;
        }
        //check baseURI
        if (this.baseURI.trim() == null || this.baseURI.trim() == "") {
            this.basicModals.alert("Create dataset", "BaseURI is missing or not valid", ModalType.warning);
            return;
        }

        /**
         * Prepare repositoryAccess parameter
         */
        let repositoryAccess: RepositoryAccess = new RepositoryAccess(this.selectedRepositoryAccess);
        //in case of remote repository access, set the configuration
        if (this.isRepoAccessRemote()) {
            if (this.selectedRemoteRepoConfig == null) {
                this.basicModals.alert("Missing configuration", "The remote 'Repository Access' has not been configure.", ModalType.warning);
                return;
            }
            repositoryAccess.setConfiguration(this.selectedRemoteRepoConfig);
        }

        //check if data repository configuration needs to be configured
        if (this.selectedDataRepoConfig.requireConfiguration()) {
            this.basicModals.alert("Missing configuration", "The data repository (" + this.selectedDataRepoConfig.shortName + ") requires to be configured", ModalType.warning);
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
            false, false, false, repositoryAccess, this.dataRepoId, this.supportRepoId, coreRepoSailConfigurerSpecification,
            coreRepoBackendType, null, null, null, null, null, null, null, null, false, null, null, null).pipe(
                finalize(() => this.loading = false)
            ).subscribe(() => {
                this.adminService.addRolesToUser(this.projectName, PmkiConstants.visitorEmail, [PmkiConstants.roleStaging]).pipe(
                    finalize(() => this.loading = false)
                ).subscribe(() => {
                    this.basicModals.alert("Dataset created", "The dataset has been successfully created");
                    this.activeModal.close();
                })
            });
    }

    close() {
        this.activeModal.dismiss();
    }

}