import { ChangeDetectorRef, Component, Input, SimpleChanges, ViewChild } from "@angular/core";
import { finalize } from 'rxjs/operators';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';
import { ExtensionsServices } from 'src/app/services/extensions.service';
import { ExtensionConfiguratorComponent } from 'src/app/widget/extensionConfigurator/extension-configurator.component';
import { Reference } from "../../models/Configuration";
import { AdditionalFile, InvokableReporter, ServiceInvocationDefinition } from "../../models/InvokableReporter";
import { ConfigurableExtensionFactory, DeploySource, ExtensionConfigurationStatus, ExtensionPointID, PluginSpecification, Settings, SettingsProp } from "../../models/Plugins";
import { InvokableReportersServices } from "../../services/invokable-reporters.service";
import { InvokableReporterModalServices } from "./modals/invokable-reporter-modal.service";

@Component({
    selector: "invokable-reporter",
    templateUrl: "./invokable-reporter.component.html",
    host: { class: "vbox" },
    styleUrls: ["../custom-services.css"]
})
export class InvokableReporterComponent {
    @Input() ref: Reference;

    @ViewChild("deployerConfigurator", { static: false }) deployerConfigurator: ExtensionConfiguratorComponent;

    private reporter: InvokableReporter;
    private selectedServiceInvocation: ServiceInvocationDefinition;
    private selectedServiceInvocationIdx: number;

    reportFormats: ReportFormatStruct[] = [
        { label: "HTML", value: null }, { label: "PDF", value: "application/pdf" }
    ];
    selectedReportFormat: ReportFormatStruct = this.reportFormats[0];

    /* despite invokable repotrers exploit the Settings standard, I cannot use the renderer since I have to 
    handle sections and additionalFiles ad-hoc (there is no dedicated widget in settings-renderer for such types of field
    which are complex) */
    form: InvokableReporterForm;
    additionalFilesPreview: string;

    //deployer
    repoSourcedDeployer: ConfigurableExtensionFactory[];
    streamSourcedDeployer: ConfigurableExtensionFactory[];
    selectedDeployerExtension: ConfigurableExtensionFactory;
    selectedDeployerConfig: Settings;

    deployerStatus: ExtensionConfigurationStatus;
    deployerRelativeRef: string;

    deploymentOptions: { translationKey: string, source: DeploySource }[] = [
        { translationKey: "DATA_MANAGEMENT.EXPORT.DEPLOY.SAVE_TO_FILE", source: null },
        { translationKey: "DATA_MANAGEMENT.EXPORT.DEPLOY.USE_CUSTOM_DEPLOYER", source: DeploySource.stream }
    ];
    selectedDeployment = this.deploymentOptions[0];

    loading: boolean;

    constructor(private invokableReporterService: InvokableReportersServices, private invokableReporterModals: InvokableReporterModalServices,
        private extensionService: ExtensionsServices, private basicModals: BasicModalsServices, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['ref'] && changes['ref'].currentValue) {
            this.initReporter(false);
        }
    }

    ngOnInit() {
        this.extensionService.getExtensions(ExtensionPointID.STREAM_SOURCED_DEPLOYER_ID).subscribe(
            extensions => {
                this.streamSourcedDeployer = <ConfigurableExtensionFactory[]>extensions;
            }
        );
    }

    private initReporter(restoreInvocation: boolean) {
        this.invokableReporterService.getInvokableReporter(this.ref.relativeReference).subscribe(
            (reporter: InvokableReporter) => {
                this.reporter = reporter;
                this.form = {
                    label: this.reporter.getProperty("label"),
                    description: this.reporter.getProperty("description"),
                    sections: this.reporter.getProperty("sections"),
                    template: this.reporter.getProperty("template"),
                    filename: this.reporter.getProperty("filename"),
                    additionalFiles: this.reporter.getProperty("additionalFiles"),
                    mimeType: this.reporter.getProperty("mimeType")
                };
                this.additionalFilesPreview = this.form.additionalFiles.value != null ? this.form.additionalFiles.value.map(f => f.destinationPath).join(", ") : null;
                if (restoreInvocation) {
                    //try to restore the selected service invocation (if any)
                    if (this.selectedServiceInvocationIdx != null && this.form.sections.value != null && this.form.sections.value.length > this.selectedServiceInvocationIdx) {
                        this.selectServiceInvocation(this.selectedServiceInvocationIdx);
                    } else {
                        this.selectedServiceInvocation = null;
                    }
                } else {
                    this.selectedServiceInvocation = null;
                    this.selectedServiceInvocationIdx = null;
                }
            }
        );
    }

    edit() {
        this.invokableReporterModals.openInvokableReporterEditor({ key: "INVOKABLE_REPORTERS.ACTIONS.EDIT_INVOKABLE_REPORT" }, [], this.ref).then(
            () => {
                this.initReporter(true);
            },
            () => { }
        );
    }

    selectServiceInvocation(index: number) {
        this.selectedServiceInvocationIdx = index;
        this.selectedServiceInvocation = this.form.sections.value[index];
        //set the reference of the reporter which the invocation belongs to (usefult when editing the service invocation)
        this.selectedServiceInvocation.reporterRef = this.ref;
    }

    createServiceInvocation() {
        this.invokableReporterModals.openServiceInvocationEditor({ key: "INVOKABLE_REPORTERS.ACTIONS.CREATE_SERVICE_INVOCATION" }, this.ref).then(
            () => { //operation created => require update
                this.initReporter(true);
            },
            () => { }
        );
    }

    deleteServiceInvocation() {
        this.invokableReporterService.removeSectionFromReporter(this.ref.relativeReference, this.selectedServiceInvocationIdx).subscribe(
            () => {
                this.initReporter(false);
            }
        );
    }

    onServiceInvocationUpdate() {
        //a service invocation of the reporter changed => require update
        this.initReporter(true);
    }

    /** =====================================
     * Deployer
     * =====================================*/

    onDeployerConfigUpdated(config: Settings) {
        this.selectedDeployerConfig = config;
        this.changeDetectorRef.detectChanges(); //in order to prevent ExpressionChangedAfterItHasBeenCheckedError when calling requireConfigurationDeployer() in UI
    }

    onDeployerConfigStatusUpdated(statusEvent: { status: ExtensionConfigurationStatus, relativeReference?: string }) {
        this.deployerStatus = statusEvent.status;
        this.deployerRelativeRef = statusEvent.relativeReference;
    }

    requireConfigurationDeployer() {
        if (this.selectedDeployerConfig != null) {
            return this.selectedDeployerConfig.requireConfiguration();
        }
        return false;
    }

    //========= Deployer end ================

    /** =====================================
     * Compilation
     * =====================================*/

    compileAndShowReport() {
        if (this.form.sections.value == null || this.form.sections.value.length == 0) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "INVOKABLE_REPORTERS.MESSAGES.NO_SERVICE_INVOCATION_PROVIDED" }, ModalType.warning);
        } else {
            this.loading = true;
            this.invokableReporterService.compileReport(this.ref.relativeReference, false).pipe(
                finalize(() => { this.loading = false; })
            ).subscribe(
                    report => {
                        this.invokableReporterModals.showReport(report);
                    },
                    (err: Error) => {
                        this.compilationErrorHandler(err);
                    }
                );
        }
    }

    compileAndDeploy() {
        if (this.form.sections.value == null || this.form.sections.value.length == 0) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "INVOKABLE_REPORTERS.MESSAGES.NO_SERVICE_INVOCATION_PROVIDED" }, ModalType.warning);
        } else {
            let reporterRef: string = this.ref.relativeReference;
            let mimeType: string = this.selectedReportFormat.value;
            let deployerSpec: PluginSpecification;

            if (this.selectedDeployment.source == DeploySource.stream) { //use custom deployer
                if (this.selectedDeployment.source != null) {
                    deployerSpec = {
                        factoryId: this.selectedDeployerExtension.id
                    };
                    if (this.selectedDeployerConfig != null) {
                        if (this.requireConfigurationDeployer()) {
                            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.DEPLOYER_NOT_CONFIGURED" }, ModalType.warning);
                            return;
                        }
                        deployerSpec.configType = this.selectedDeployerConfig.type;
                        deployerSpec.configuration = this.selectedDeployerConfig.getPropertiesAsMap();
                    }
                }
            }
            this.loading = true;
            this.invokableReporterService.compileAndExportReport(reporterRef, mimeType, deployerSpec).pipe(
                finalize(() => { this.loading = false; })
            ).subscribe(
                report => {
                    let url = window.URL.createObjectURL(report);
                    window.open(url);
                },
                (err: Error) => {
                    this.compilationErrorHandler(err);
                }
            );
        }
    }

    private compilationErrorHandler(error: Error) {
        if (error.name.endsWith("InvokableReporterException") && error.message.includes("AccessDeniedException")) { //not enough privileges
            this.basicModals.alert({ key: "STATUS.OPERATION_DENIED" }, { key: "INVOKABLE_REPORTERS.MESSAGES.NO_PERMISSION_FOR_SERVICE_INVOCATION" }, ModalType.error, error.message);
        } else { //if not due to access denied show in error modal
            this.basicModals.alert({ key: "STATUS.ERROR" }, error.message, ModalType.error, error.stack);
        }
    }

}


export class InvokableReporterForm {
    label: InvokableReporterFormEntry<string>;
    description: InvokableReporterFormEntry<string>;
    sections: InvokableReporterFormEntry<ServiceInvocationDefinition[]>;
    template: InvokableReporterFormEntry<string>;
    filename: InvokableReporterFormEntry<string>;
    additionalFiles: InvokableReporterFormEntry<AdditionalFile[]>;
    mimeType: InvokableReporterFormEntry<string>;
}

export class InvokableReporterFormEntry<T> extends SettingsProp {
    value: T;
}

export interface ReportFormatStruct {
    label: string;
    value: string;
}