import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { TransitiveImportMethodAllowance } from 'src/app/models/Metadata';
import { Project } from 'src/app/models/Project';
import { RDFFormat, DataFormat } from 'src/app/models/RDFFormat';
import { InputOutputServices } from 'src/app/services/input-output.service';
import { PmkiServices } from 'src/app/services/pmki.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { ExtensionFactory, Settings, ExtensionPointID, PluginSpecification } from 'src/app/models/Plugins';
import { ExtensionsServices } from 'src/app/services/extensions.service';
import { ModalType } from 'src/app/modal-dialogs/Modals';

@Component({
    selector: 'load-stable',
    templateUrl: './load-stable.component.html',
    host: { class: "pageComponent" }
})
export class LoadStableResourceComponent {

    private token: string;

    private readonly rdfExtensionId: string = "it.uniroma2.art.semanticturkey.extension.impl.rdflifter.rdfdeserializer.RDFDeserializingLifter";

    projectName: string;
    contributorEmail: string;
    file: File;
    filePickerAccept: string;

    inputFormats: DataFormat[];
    selectedInputFormat: DataFormat;

    importAllowances: { allowance: TransitiveImportMethodAllowance, show: string }[] = [
        { allowance: TransitiveImportMethodAllowance.nowhere, show: "Do not resolve" },
        { allowance: TransitiveImportMethodAllowance.web, show: "From Web" },
        { allowance: TransitiveImportMethodAllowance.webFallbackToMirror, show: "From Web with fallback to Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirror, show: "From Ontology Mirror" },
        { allowance: TransitiveImportMethodAllowance.mirrorFallbackToWeb, show: "From Ontology Mirror with fallback to Web" }
    ];
    selectedImportAllowance: TransitiveImportMethodAllowance = this.importAllowances[1].allowance;

    //lifters
    lifters: ExtensionFactory[];
    selectedLifterExtension: ExtensionFactory;
    selectedLifterConfig: Settings;

    constructor(private inputOutputService: InputOutputServices, private extensionService: ExtensionsServices,
        private pmkiService: PmkiServices, private basicModals: BasicModalsServices,
        private activeRoute: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        this.token = this.activeRoute.snapshot.params['token'];

        this.extensionService.getExtensions(ExtensionPointID.RDF_LIFTER_ID).subscribe(
            extensions => {
                //allow only the rdf lifter
                this.lifters = [];
                this.lifters = [extensions.find(e => e.id == this.rdfExtensionId)];
            }
        );
    }

    onLifterExtensionUpdated(ext: ExtensionFactory) {
        this.selectedLifterExtension = ext;
        this.inputOutputService.getSupportedFormats(this.selectedLifterExtension.id).subscribe(
            formats => {
                this.inputFormats = formats;
                /*
                 * Iterate over the input format for:
                 * - collecting the extensions of the formats, in order to provide them to the file picker
                 * - select a default input format (rdf for the rdf lifter)
                 */
                let extList: string[] = []; 
                let defaultInputFormatIdx: number = 0;
                for (var i = 0; i < this.inputFormats.length; i++) {
                    extList.push("."+this.inputFormats[i].defaultFileExtension);
                    if (this.selectedLifterExtension.id == this.rdfExtensionId && this.inputFormats[i].name == "RDF/XML") {
                        defaultInputFormatIdx = i;
                    }
                }
                this.selectedInputFormat = this.inputFormats[defaultInputFormatIdx];
                //remove duplicated extensions
                extList = extList.filter((item: string, pos: number) => {
                    return extList.indexOf(item) == pos;
                });
                this.filePickerAccept = extList.join(",");
            }
        )
    }

    fileChangeEvent(file: File) {
        this.file = file;
        this.inputOutputService.getParserFormatForFileName(file.name).subscribe(
            format => {
                if (format != null) {
                    for (var i = 0; i < this.inputFormats.length; i++) {
                        if (this.inputFormats[i].name == format) {
                            this.selectedInputFormat = this.inputFormats[i];
                            return;
                        }
                    }
                }
            }
        );
    }

    load() {
        let rdfLifterSpec: PluginSpecification = {
            factoryId: this.selectedLifterExtension.id,
        }
        if (this.selectedLifterConfig != null) {
            if (this.selectedLifterConfig.requireConfiguration()) {
                this.basicModals.alert("Missing configuration", "The Lifter needs to be configured", ModalType.warning);
                return;
            }
            rdfLifterSpec.configType = this.selectedLifterConfig.type;
            rdfLifterSpec.configuration = this.selectedLifterConfig.getPropertiesAsMap();
        }

        PMKIContext.setTempProject(new Project(this.projectName));
        this.pmkiService.loadStableContributionData(this.token, this.projectName, this.contributorEmail, this.file, 
            this.selectedInputFormat.name, rdfLifterSpec, this.selectedImportAllowance).subscribe(
            () => {
                PMKIContext.removeTempProject();
                this.basicModals.alert("Load data", "Data loaded successfully.").then(
                    () => {
                        this.router.navigate(["/home"]);
                    }
                )
            }
        )
    }


}