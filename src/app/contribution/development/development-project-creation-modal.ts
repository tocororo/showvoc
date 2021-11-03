import { Component, Input, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { AbstractProjectCreationModal, ConfigurationFilterPredicate } from "src/app/administration/projects-manager/abstract-project-creation-modal";
import { DevResourceStoredContribution } from 'src/app/models/Contribution';
import { SettingsServices } from "src/app/services/settings.service";
import { ExtensionConfiguratorComponent } from 'src/app/widget/extensionConfigurator/extension-configurator.component';
import { BasicModalsServices } from '../../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../../modal-dialogs/Modals';
import { ExtensionPointID, PluginSpecification, Scope, Settings } from '../../models/Plugins';
import { SettingsEnum, ShowVocSettings, VocBenchConnectionShowVocSettings } from '../../models/Properties';
import { IRI } from '../../models/Resources';
import { ExtensionsServices } from '../../services/extensions.service';
import { ShowVocServices } from '../../services/showvoc.service';

@Component({
    selector: "development-project-creation-modal",
    templateUrl: "./development-project-creation-modal.html",
})
export class DevProjectCreationModal extends AbstractProjectCreationModal {

    @Input() contribution: DevResourceStoredContribution;

    @ViewChild("dataRepoConfigurator") dataRepoConfigurator: ExtensionConfiguratorComponent;

    loading: boolean;

    formLocked: boolean = true;
    lockTooltip: string = "The form has been partially pre-filled with the information contained in the contribution request. " +
        "It is strongly recommended to leave them as they are. If you desire to change them anyway, you can unlock the field with the following switch."

    vbConnectionConfig: VocBenchConnectionShowVocSettings = {
        vbURL: null,
        stHost: null,
        adminEmail: null,
        adminPassword: ""
    }

    constructor(activeModal: NgbActiveModal, settingsService: SettingsServices, extensionsService: ExtensionsServices, modalService: NgbModal,
        private svService: ShowVocServices, private basicModals: BasicModalsServices) {
            super(activeModal, modalService, extensionsService, settingsService);
        }

    ngOnInit() {
        this.projectName = this.contribution.resourceName;
        this.projectName = this.projectName.replace(/[\W_]+/g, "_");//sanitize project name;
        this.baseURI = this.contribution.baseURI.getIRI();
        this.selectedSemModel = this.contribution.model.getIRI();
        this.selectedLexModel = this.contribution.lexicalizationModel.getIRI();

        this.settingsService.getSettings(ExtensionPointID.ST_CORE_ID, Scope.SYSTEM).subscribe(
            settings => {
                let showVocSettings: ShowVocSettings = settings.getPropertyValue(SettingsEnum.showvoc);
                if (showVocSettings != null && showVocSettings.vbConnectionConfig != null) {
                    this.vbConnectionConfig = showVocSettings.vbConnectionConfig
                } else {
                    this.vbConnectionConfig = new VocBenchConnectionShowVocSettings();
                }
            }
        )

        //init core repo extensions by excluding the configurations which are not remote (that are not for GraphDB)
        let pred: ConfigurationFilterPredicate = (settings: Settings) => settings.type.includes("GraphDB");
        this.initCoreRepoExtensions(pred);
    }

    ok() {
        if (this.vbConnectionConfig.stHost == null) {
            this.basicModals.alert({ key: "COMMONS.CONFIG.MISSING_CONFIGURATION" }, {key:"MESSAGES.SYSTEM_NOT_CONFIGURED_FOR_VB_CONNECTION"}, ModalType.warning);
            return;
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

        this.loading = true;
        this.svService.approveDevelopmentContribution(this.projectName, new IRI(this.selectedSemModel), new IRI(this.selectedLexModel),
            this.baseURI, coreRepoSailConfigurerSpecification, this.contribution['relativeReference']).pipe(
                finalize(() => this.loading = false)
            ).subscribe(
                () => {
                    this.basicModals.alert({ key: "DATASETS.STATUS.DATASET_CREATED" }, {key:"MESSAGES.CONTRIBUTION_APPROVED_DATASET_CREATED"});
                    this.activeModal.close();
                }
            );
    }

    close() {
        this.activeModal.dismiss();
    }

}