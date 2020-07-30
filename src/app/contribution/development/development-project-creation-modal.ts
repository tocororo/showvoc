import { Component, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { DevResourceStoredContribution } from 'src/app/models/Contribution';
import { ExtensionConfiguratorComponent } from 'src/app/widget/extensionConfigurator/extension-configurator.component';
import { BasicModalsServices } from '../../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../../modal-dialogs/Modals';
import { ConfigurableExtensionFactory, ExtensionPointID, PluginSpecification, Settings } from '../../models/Plugins';
import { RemoteRepositoryAccessConfig, RepositoryAccessType, Project } from '../../models/Project';
import { Properties } from '../../models/Properties';
import { IRI } from '../../models/Resources';
import { OntoLex, RDFS, SKOS, SKOSXL, OWL } from '../../models/Vocabulary';
import { ExtensionsServices } from '../../services/extensions.service';
import { PmkiServices } from '../../services/pmki.service';
import { PreferencesSettingsServices } from '../../services/preferences-settings.service';

@Component({
    selector: "development-project-creation-modal",
    templateUrl: "./development-project-creation-modal.html",
})
export class DevProjectCreationModal {

    @Input() contribution: DevResourceStoredContribution;

    @ViewChild("dataRepoConfigurator") dataRepoConfigurator: ExtensionConfiguratorComponent;

    loading: boolean;

    projectName: string;
    baseURI: string;

    semanticModels: { uri: string, show: string }[] = [
        { uri: RDFS.uri, show: Project.getPrettyPrintModelType(RDFS.uri) },
        { uri: OWL.uri, show:  Project.getPrettyPrintModelType(OWL.uri) },
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

    formLocked: boolean = true;
    lockTooltip: string = "The form has been partially pre-filled with the information contained in the contribution request. " +
        "It is strongly recommended to leave them as they are. If you desire to change them anyway, you can unlock the field with the following switch."

    repositoryAccessType: RepositoryAccessType = RepositoryAccessType.CreateRemote;

    vbConnectionConfig: VbConnectionConfig = {
        stHost: null,
        adminEmail: null,
        adminPassword: ""
    }


    dataRepoExtensions: ConfigurableExtensionFactory[];
    private selectedDataRepoExtension: ConfigurableExtensionFactory;
    private selectedDataRepoConfig: Settings;

    private DEFAULT_REPO_EXTENSION_ID = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.PredefinedRepositoryImplConfigurer";
    private DEFAULT_REPO_CONFIG_TYPE = "it.uniroma2.art.semanticturkey.extension.impl.repositoryimplconfigurer.predefined.GraphDBFreeConfigurerConfiguration";

    private remoteAccessConfig: RemoteRepositoryAccessConfig;

    constructor(public activeModal: NgbActiveModal, private preferencesService: PreferencesSettingsServices,
        private extensionsService: ExtensionsServices, private pmkiService: PmkiServices, private basicModals: BasicModalsServices) { }

    ngOnInit() {
        this.projectName = this.contribution.resourceName;
        this.projectName = this.projectName.replace(/[\W_]+/g, "_");//sanitize project name;
        this.baseURI = this.contribution.baseURI.getIRI();
        this.selectedSemModel = this.contribution.model.getIRI();
        this.selectedLexModel = this.contribution.lexicalizationModel.getIRI();

        this.preferencesService.getSystemSettings([Properties.setting_vb_connection]).subscribe(
            setting => {
                let vb_conn_value: string = setting[Properties.setting_vb_connection];
                if (vb_conn_value != null) {
                    this.vbConnectionConfig = JSON.parse(vb_conn_value);
                }
            }
        );

        // init core repo extensions
        this.extensionsService.getExtensions(ExtensionPointID.REPO_IMPL_CONFIGURER_ID).subscribe(
            extensions => {
                this.dataRepoExtensions = <ConfigurableExtensionFactory[]>extensions;
                //filter out the configurations which are not remote (that are not for GraphDB)
                this.dataRepoExtensions[0].configurations = this.dataRepoExtensions[0].configurations.filter(conf => conf.type.includes("GraphDB"));

                setTimeout(() => { //let the dataRepoConfigurator component to be initialized (due to *ngIf="dataRepoExtensions")
                    this.dataRepoConfigurator.selectExtensionAndConfiguration(this.DEFAULT_REPO_EXTENSION_ID, this.DEFAULT_REPO_CONFIG_TYPE);
                });
            }
        );
    }

    ok() {
        if (this.vbConnectionConfig.stHost == null) {
            this.basicModals.alert("Missing configuration", "The system has not been configured in order to connect with a remote VocBench instance. " +
                "Please provide a configuration in the 'System configuration' page.", ModalType.warning);
            return;
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
        this.pmkiService.approveDevelopmentContribution(this.projectName, new IRI(this.selectedSemModel), new IRI(this.selectedLexModel),
            this.baseURI, coreRepoSailConfigurerSpecification, this.contribution['relativeReference']).pipe(
                finalize(() => this.loading = false)
            ).subscribe(
                () => {
                    this.basicModals.alert("Dataset created", "The contribution has been approved and the dataset has been successfully created");
                    this.activeModal.close();
                }
            );
    }

    close() {
        this.activeModal.dismiss();
    }

}

class VbConnectionConfig {
    stHost: string;
    adminEmail: string;
    adminPassword: string;
}