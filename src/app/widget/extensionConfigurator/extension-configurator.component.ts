import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { SharedModalsServices } from 'src/app/modal-dialogs/shared-modals/shared-modal.service';
import { ConfigurationsServices } from 'src/app/services/configuration.service';
import { Configuration } from '../../models/Configuration';
import { ConfigurableExtensionFactory, ExtensionConfigurationStatus, Settings } from '../../models/Plugins';

@Component({
    selector: 'extension-configurator',
    templateUrl: './extension-configurator.component.html'
})
export class ExtensionConfiguratorComponent {

    @Input('extensions') extensions: ConfigurableExtensionFactory[];
    @Input() storeable: boolean = true; //tells if the component should allow to store and load configuration
    @Input() disabled: boolean = false;
    @Output() extensionUpdated = new EventEmitter<ConfigurableExtensionFactory>();
    @Output() configurationUpdated = new EventEmitter<Settings>();
    @Output() configStatusUpdated = new EventEmitter<{ status: ExtensionConfigurationStatus, relativeReference?: string }>();

    selectedExtension: ConfigurableExtensionFactory;
    private selectedConfiguration: Settings;

    private status: ExtensionConfigurationStatus;
    
    constructor(private configurationService: ConfigurationsServices, private basicModals: BasicModalsServices, private sharedModals: SharedModalsServices) {}

    ngOnInit() {
        this.selectedExtension = this.extensions[0];
        this.extensionUpdated.emit(this.selectedExtension);
        
        if (this.selectedExtension.configurations != null) {
            this.selectedConfiguration = this.selectedExtension.configurations[0];
            this.configurationUpdated.emit(this.selectedConfiguration);
        }

        this.status = ExtensionConfigurationStatus.unsaved;
        this.configStatusUpdated.emit({ status: this.status });
    }

    private onChangeExtension() {
        this.extensionUpdated.emit(this.selectedExtension);
        if (this.selectedExtension.configurations != null) { //if extension has configurations
            this.selectedConfiguration = this.selectedExtension.configurations[0];
            this.configurationUpdated.emit(this.selectedConfiguration);

            this.status = ExtensionConfigurationStatus.unsaved;
            this.configStatusUpdated.emit({ status: this.status });
        }
    }

    private onChangeConfig() {
        this.configurationUpdated.emit(this.selectedConfiguration);

        this.status = ExtensionConfigurationStatus.unsaved;
        this.configStatusUpdated.emit({ status: this.status });
    }

    private configure() {
        this.sharedModals.configurePlugin(this.selectedConfiguration).then(
            (cfg: Settings) => {
                //update the selected configuration...
                this.selectedConfiguration = cfg;
                //...and the configuration among the availables
                var configs: Settings[] = this.selectedExtension.configurations;
                for (var i = 0; i < configs.length; i++) {
                    if (configs[i].shortName == this.selectedConfiguration.shortName) {
                        configs[i] = this.selectedConfiguration;
                    }
                }

                this.extensionUpdated.emit(this.selectedExtension);
                this.configurationUpdated.emit(this.selectedConfiguration);

                this.status = ExtensionConfigurationStatus.unsaved;
                this.configStatusUpdated.emit({ status: this.status });
            },
            () => { }
        );
    }

    private saveConfig() {
        alert("TODO");
        // let config: { [key: string]: any } = this.selectedConfiguration.getPropertiesAsMap();
        // this.sharedModals.storeConfiguration("Store configuration", this.selectedExtension.id, config).then(
        //     (relativeRef: string) => {
        //         this.basicModals.alert("Save configuration", "Configuration saved succesfully");
                
        //         this.status = ExtensionConfigurationStatus.saved;
        //         this.configStatusUpdated.emit({ status: this.status, relativeReference: relativeRef });
        //     },
        //     () => {}
        // );
    }

    private loadConfig() {
        alert("TODO");
        // this.sharedModals.loadConfiguration("Load configuration", this.selectedExtension.id).then(
        //     (config: LoadConfigurationModalReturnData) => {
        //         for (var i = 0; i < this.selectedExtension.configurations.length; i++) {
        //             if (this.selectedExtension.configurations[i].type == config.configuration.type) {
        //                 this.selectedExtension.configurations[i] = config.configuration;
        //                 this.selectedConfiguration = this.selectedExtension.configurations[i];
        //             }
        //         }
        //         this.configurationUpdated.emit(this.selectedConfiguration);

        //         this.status = ExtensionConfigurationStatus.saved;
        //         this.configStatusUpdated.emit({ status: this.status, relativeReference: config.reference.relativeReference });
        //     },
        //     () => {}
        // );
    }

    //useful to change the selected extension and configuration from a parent component
    public selectExtensionAndConfiguration(extensionID: string, configurationType: string) {
        for (var i = 0; i < this.extensions.length; i++) {
            if (this.extensions[i].id == extensionID) {
                this.selectedExtension = this.extensions[i];
                this.extensionUpdated.emit(this.selectedExtension);
                break;
            }
        }
        for (var i = 0; i < this.selectedExtension.configurations.length; i++) {
            if (this.selectedExtension.configurations[i].type == configurationType) {
                this.selectedConfiguration = this.selectedExtension.configurations[i];
            }
        }
    }

    //useful only for the filter chain, in order to force the load of a single filter
    public forceConfiguration(extensionID: string, configRef: string) {
        //select the extension
        for (var i = 0; i < this.extensions.length; i++) {
            if (this.extensions[i].id == extensionID) {
                this.selectedExtension = this.extensions[i];
                this.extensionUpdated.emit(this.selectedExtension);
                break;
            }
        }
        //load the configuration
        this.configurationService.getConfiguration(this.selectedExtension.id, configRef).subscribe(
            (conf: Configuration) => {
                for (var i = 0; i < this.selectedExtension.configurations.length; i++) {
                    if (this.selectedExtension.configurations[i].type == conf.type) {
                        this.selectedExtension.configurations[i] = conf;
                        this.selectedConfiguration = this.selectedExtension.configurations[i];
                    }
                }

                this.configurationUpdated.emit(this.selectedConfiguration);

                this.status = ExtensionConfigurationStatus.saved;
                this.configStatusUpdated.emit({ status: this.status, relativeReference: configRef });
            }
        )
    }


}