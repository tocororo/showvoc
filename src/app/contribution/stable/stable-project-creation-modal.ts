import { ChangeDetectorRef, Component, Input } from "@angular/core";
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { AbstractProjectCreationModal } from "src/app/administration/projects-manager/abstract-project-creation-modal";
import { StableResourceStoredContribution } from 'src/app/models/Contribution';
import { SettingsServices } from "src/app/services/settings.service";
import { BasicModalsServices } from '../../modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from '../../modal-dialogs/Modals';
import { PluginSpecification } from '../../models/Plugins';
import { RepositoryAccess, RepositoryAccessType } from '../../models/Project';
import { IRI } from '../../models/Resources';
import { ExtensionsServices } from '../../services/extensions.service';
import { ShowVocServices } from '../../services/showvoc.service';

@Component({
    selector: "stable-project-creation-modal",
    templateUrl: "./stable-project-creation-modal.html",
})
export class StableProjectCreationModal extends AbstractProjectCreationModal {

    @Input() contribution: StableResourceStoredContribution;

    formLocked: boolean = true;
    lockTooltip: string = "The form has been partially pre-filled with the information contained in the contribution request. " +
        "It is strongly recommended to leave them as they are. If you desire to change them anyway, you can unlock the field with the following switch.";

    //@Override access existing is not allowed when approving a contribution
    repositoryAccessList: RepositoryAccessType[] = [RepositoryAccessType.CreateLocal, RepositoryAccessType.CreateRemote];


    constructor(activeModal: NgbActiveModal, settingsService: SettingsServices, extensionsService: ExtensionsServices, modalService: NgbModal, changeDetectorRef: ChangeDetectorRef,
        private svService: ShowVocServices, private basicModals: BasicModalsServices) {
        super(activeModal, modalService, extensionsService, settingsService, changeDetectorRef);
    }

    ngOnInit() {
        this.projectName = this.contribution.resourceName;
        this.projectName = this.projectName.replace(/[\W_]+/g, "_");//sanitize project name;
        this.baseURI = this.contribution.baseURI.getIRI();
        this.selectedSemModel = this.contribution.model.getIRI();
        this.selectedLexModel = this.contribution.lexicalizationModel.getIRI();

        this.initCoreRepoExtensions();

        this.initRemoteConfigs();
    }

    ok() {
        let repositoryAccess: RepositoryAccess = new RepositoryAccess(this.selectedRepositoryAccess);
        //in case of remote repository access, set the configuration
        if (this.isRepoAccessRemote()) {
            if (this.selectedRemoteRepoConfig == null) {
                this.basicModals.alert({ key: "COMMONS.CONFIG.MISSING_CONFIGURATION" }, { key: "MESSAGES.REMOTE_REPO_ACCESS_NOT_CONFIGURED" }, ModalType.warning);
                return;
            }
            repositoryAccess.setConfiguration(this.selectedRemoteRepoConfig);
        }

        //check if data repository configuration needs to be configured
        if (this.selectedDataRepoConfig.requireConfiguration()) {
            this.basicModals.alert({ key: "COMMONS.CONFIG.MISSING_CONFIGURATION" }, { key: "MESSAGES.DATA_REPO_NOT_CONFIGURED" }, ModalType.warning);
            return;
        }
        let coreRepoSailConfigurerSpecification: PluginSpecification = {
            factoryId: this.selectedDataRepoExtension.id,
            configType: this.selectedDataRepoConfig.type,
            configuration: this.selectedDataRepoConfig.getPropertiesAsMap()
        };

        this.loading = true;
        this.svService.approveStableContribution(this.projectName, new IRI(this.selectedSemModel), new IRI(this.selectedLexModel),
            this.baseURI, repositoryAccess, coreRepoSailConfigurerSpecification, this.contribution['relativeReference']).pipe(
                finalize(() => { this.loading = false; })
            ).subscribe(
                () => {
                    this.basicModals.alert({ key: "DATASETS.STATUS.DATASET_CREATED" }, { key: "MESSAGES.CONTRIBUTION_APPROVED_DATASET_CREATED" });
                    this.activeModal.close();
                }
            );
    }

}