import { Component, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { StableResourceStoredContribution } from 'src/app/models/Contribution';
import { ExtensionConfiguratorComponent } from 'src/app/widget/extensionConfigurator/extension-configurator.component';
import { BasicModalsServices } from '../../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../../modal-dialogs/Modals';
import { ConfigurableExtensionFactory, ExtensionPointID, PluginSpecification, Settings } from '../../models/Plugins';
import { RemoteRepositoryAccessConfig, RepositoryAccess, RepositoryAccessType } from '../../models/Project';
import { Properties } from '../../models/Properties';
import { IRI } from '../../models/Resources';
import { OntoLex, RDFS, SKOS, SKOSXL } from '../../models/Vocabulary';
import { ExtensionsServices } from '../../services/extensions.service';
import { PmkiServices } from '../../services/pmki.service';
import { PreferencesSettingsServices } from '../../services/preferences-settings.service';

@Component({
    selector: "stable-project-creation-modal",
    templateUrl: "./stable-project-creation-modal.html",
})
export class StableProjectCreationModal {

    @Input() contribution: StableResourceStoredContribution;

    @ViewChild("dataRepoConfigurator") dataRepoConfigurator: ExtensionConfiguratorComponent;

    loading: boolean;

    projectName: string;
    baseURI: string;

    semanticModels: { uri: string, show: string }[] = [
        { uri: SKOS.uri, show: "SKOS" },
        { uri: OntoLex.uri, show: "Ontolex" }
    ];
    selectedSemModel: string;

    lexicalizationModels: { uri: string, show: string }[] = [
        { uri: RDFS.uri, show: "RDFS" },
        { uri: SKOS.uri, show: "SKOS" },
        { uri: SKOSXL.uri, show: "SKOS-XL" },
        { uri: OntoLex.uri, show: "Ontolex" }
    ];
    selectedLexModel: string;

    formLocked: boolean = true;
    lockTooltip: string = "The form has been partially pre-filled with the information contained in the contribution request. " +
        "It is strongly recommended to leave them as they are. If you desire to change them anyway, you can unlock the field with the following switch."

    repositoryAccessList: RepositoryAccessType[] = [RepositoryAccessType.CreateLocal, RepositoryAccessType.CreateRemote]
    selectedRepositoryAccess: RepositoryAccessType = this.repositoryAccessList[1];

    dataRepoExtensions: ConfigurableExtensionFactory[];
    private selectedDataRepoExtension: ConfigurableExtensionFactory;
    private selectedDataRepoConfig: Settings;

    private DEFAULT_REPO_EXTENSION_ID = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.PredefinedRepositoryImplConfigurer";
    private DEFAULT_REPO_CONFIG_TYPE = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.RDF4JNativeSailConfigurerConfiguration";

    private remoteAccessConfig: RemoteRepositoryAccessConfig;

    constructor(public activeModal: NgbActiveModal, private preferencesService: PreferencesSettingsServices,
        private extensionsService: ExtensionsServices, private pmkiService: PmkiServices, private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.projectName = this.contribution.resourceName;
        this.projectName = this.projectName.replace(/[\W_]+/g, "_");//sanitize project name;
        this.baseURI = this.contribution.baseURI.getIRI();
        this.selectedSemModel = this.contribution.model.getIRI();
        this.selectedLexModel = this.contribution.lexicalizationModel.getIRI();

        this.preferencesService.getSystemSettings([Properties.setting_remote_configs]).subscribe(
            stResp => {
                if (stResp[Properties.setting_remote_configs] != null) {
                    let remoteAccessConfigurations = <RemoteRepositoryAccessConfig[]>JSON.parse(stResp[Properties.setting_remote_configs]);
                    if (remoteAccessConfigurations != null && remoteAccessConfigurations.length > 0) {
                        this.remoteAccessConfig = remoteAccessConfigurations[0];
                    }
                }
            }
        );

        // init core repo extensions
        this.extensionsService.getExtensions(ExtensionPointID.REPO_IMPL_CONFIGURER_ID).subscribe(
            extensions => {
                this.dataRepoExtensions = <ConfigurableExtensionFactory[]>extensions;
                setTimeout(() => { //let the dataRepoConfigurator component to be initialized (due to *ngIf="dataRepoExtensions")
                    this.dataRepoConfigurator.selectExtensionAndConfiguration(this.DEFAULT_REPO_EXTENSION_ID, this.DEFAULT_REPO_CONFIG_TYPE);
                });
            }
        );
    }

    ok() {
        let repositoryAccess: RepositoryAccess = new RepositoryAccess(this.selectedRepositoryAccess);
        //in case of remote repository access, set the configuration (retrieved from settings during the initlization)
        if (this.selectedRepositoryAccess == RepositoryAccessType.CreateRemote) {
            if (this.remoteAccessConfig == null || !this.remoteAccessConfig.serverURL == null || this.remoteAccessConfig.serverURL.trim() == "") {
                this.basicModals.alert("Missing configuration", "The system has not been configured in order to create a remote repository. " +
                    "Please provide a configuration to a remote triple store in the 'System configuration' page.", ModalType.warning);
                return;
            }
            repositoryAccess.setConfiguration(this.remoteAccessConfig);
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

        this.loading = true;
        this.pmkiService.approveStableContribution(this.projectName, new IRI(this.selectedSemModel), new IRI(this.selectedLexModel),
            this.baseURI, repositoryAccess, coreRepoSailConfigurerSpecification, this.contribution['relativeReference']).pipe(
                finalize(() => this.loading = false)
            ).subscribe(
                () => {
                    this.basicModals.alert("Project created", "The contribution has been approved and the project has been successfully created");
                    this.activeModal.close();
                }
            );
    }

    close() {
        this.activeModal.dismiss();
    }

}