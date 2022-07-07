import { ChangeDetectorRef, Directive, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalOptions } from "src/app/modal-dialogs/Modals";
import { ConfigurableExtensionFactory, ExtensionPointID, Scope, Settings } from "src/app/models/Plugins";
import { Project, RemoteRepositoryAccessConfig, RepositoryAccessType } from "src/app/models/Project";
import { SettingsEnum } from "src/app/models/Properties";
import { OntoLex, OWL, RDFS, SKOS, SKOSXL } from "src/app/models/Vocabulary";
import { ExtensionsServices } from "src/app/services/extensions.service";
import { SettingsServices } from "src/app/services/settings.service";
import { ExtensionConfiguratorComponent } from "src/app/widget/extensionConfigurator/extension-configurator.component";
import { RemoteAccessConfigModal } from "./remote-access-config-modal";

@Directive()
export abstract class AbstractProjectCreationModal {

    @ViewChild("dataRepoConfigurator") dataRepoConfigurator: ExtensionConfiguratorComponent;

    loading: boolean;

    /** =========================================
     * Basic project info
     * ========================================= */

    projectName: string;
    baseURI: string;

    semanticModels: { uri: string, show: string }[] = [
        { uri: RDFS.uri, show: Project.getPrettyPrintModelType(RDFS.uri) },
        { uri: OWL.uri, show: Project.getPrettyPrintModelType(OWL.uri) },
        { uri: SKOS.uri, show: Project.getPrettyPrintModelType(SKOS.uri) },
        { uri: OntoLex.uri, show: Project.getPrettyPrintModelType(OntoLex.uri) }
    ];
    selectedSemModel: string;

    lexicalizationModels: { uri: string, show: string }[] = [
        { uri: RDFS.uri, show: Project.getPrettyPrintModelType(RDFS.uri) },
        { uri: SKOS.uri, show: Project.getPrettyPrintModelType(SKOS.uri) },
        { uri: SKOSXL.uri, show: Project.getPrettyPrintModelType(SKOSXL.uri) },
        { uri: OntoLex.uri, show: Project.getPrettyPrintModelType(OntoLex.uri) }
    ];
    selectedLexModel: string;

    /** =========================================
     * Repository handlers
     * ========================================= */

    repositoryAccessList: RepositoryAccessType[] = [RepositoryAccessType.CreateLocal, RepositoryAccessType.CreateRemote, RepositoryAccessType.AccessExistingRemote];
    selectedRepositoryAccess: RepositoryAccessType = RepositoryAccessType.CreateRemote;

    remoteRepoConfigs: RemoteRepositoryAccessConfig[] = []; //available remote configurations
    selectedRemoteRepoConfig: RemoteRepositoryAccessConfig;

    dataRepoExtensions: ConfigurableExtensionFactory[];
    selectedDataRepoExtension: ConfigurableExtensionFactory;
    selectedDataRepoConfig: Settings;

    DEFAULT_REPO_EXTENSION_ID = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.PredefinedRepositoryConfigurer";
    // private DEFAULT_REPO_CONFIG_TYPE = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.RDF4JNativeSailConfiguration";
    DEFAULT_REPO_CONFIG_TYPE = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.GraphDBFreeConfiguration";


    protected activeModal: NgbActiveModal;
    protected modalService: NgbModal;
    protected extensionsService: ExtensionsServices;
    protected settingsService: SettingsServices;
    protected changeDetectorRef: ChangeDetectorRef;
    constructor(activeModal: NgbActiveModal, modalService: NgbModal, extensionsService: ExtensionsServices, settingsService: SettingsServices, changeDetectorRef: ChangeDetectorRef) {
        this.activeModal = activeModal;
        this.modalService = modalService;
        this.extensionsService = extensionsService;
        this.settingsService = settingsService;
        this.changeDetectorRef = changeDetectorRef;
    }

    abstract ngOnInit(): void;

    initRemoteConfigs() {
        this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM).subscribe(
            settings => {
                let remoteConfSetting: RemoteRepositoryAccessConfig[] = settings.getPropertyValue(SettingsEnum.remoteConfigs);
                if (remoteConfSetting != null) {
                    this.remoteRepoConfigs = remoteConfSetting;
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
                    //the remote config are refreshed when admin changes it, so it might happend that he deleted the previously available configs 
                    this.remoteRepoConfigs = [];
                    this.selectedRemoteRepoConfig = null;
                }
            }
        );
    }

    /**
     * Initializes the extensions and the configurator of the data repo configuration (the one with the options in memory/native store/remote...)
     */
    initCoreRepoExtensions(configFilterPredicate?: ConfigurationFilterPredicate) {
        this.extensionsService.getExtensions(ExtensionPointID.REPO_IMPL_CONFIGURER_ID).subscribe(
            extensions => {
                this.dataRepoExtensions = <ConfigurableExtensionFactory[]>extensions;
                if (configFilterPredicate != null) {
                    this.dataRepoExtensions[0].configurations = this.dataRepoExtensions[0].configurations.filter(conf => configFilterPredicate(conf));
                }
                this.changeDetectorRef.detectChanges(); //let the dataRepoConfigurator component to be initialized (due to *ngIf="dataRepoExtensions")
                this.dataRepoConfigurator.selectExtensionAndConfiguration(this.DEFAULT_REPO_EXTENSION_ID, this.DEFAULT_REPO_CONFIG_TYPE);
            }
        );
    }


    isRepoAccessRemote(): boolean {
        return this.selectedRepositoryAccess == RepositoryAccessType.CreateRemote || this.selectedRepositoryAccess == RepositoryAccessType.AccessExistingRemote;
    }

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

    abstract ok(): void;

    close() {
        this.activeModal.dismiss();
    }
    
}

/**
 * Predicate for filtering allowed remote repo extensions: given a settings returns if the extension is allowed, false otherwise
 */
export interface ConfigurationFilterPredicate { (settings: Settings): boolean }