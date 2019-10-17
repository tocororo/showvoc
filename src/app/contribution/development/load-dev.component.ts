import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { PmkiConversionFormat } from 'src/app/models/Pmki';
import { DataFormat } from 'src/app/models/RDFFormat';
import { InputOutputServices } from 'src/app/services/input-output.service';
import { PmkiServices } from 'src/app/services/pmki.service';

@Component({
    selector: 'load-dev',
    templateUrl: './load-dev.component.html',
    host: { class: "pageComponent" }
})
export class LoadDevResourceComponent {

    private token: string;

    dataFormats: DataFormat[];
    selectedFormat: DataFormat;

    private readonly zThesExtensionId: string = "it.uniroma2.art.semanticturkey.extension.impl.rdflifter.zthesdeserializer.ZthesDeserializingLifter"

    projectName: string;
    file: File;

    filePickerAccept: string;

    constructor(private pmkiService: PmkiServices, private inputOutputService: InputOutputServices,
        private basicModals: BasicModalsServices, private activeRoute: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        this.token = this.activeRoute.snapshot.params['token'];
        let conversionFormat = this.activeRoute.snapshot.params['format'];
        if (conversionFormat == PmkiConversionFormat.TBX) { //temporarly... to replace with a call to getSupportedFormats when available for tbx
            this.dataFormats = [new DataFormat("TBX", "application/x-tbx", "tbx")];
            this.selectedFormat = this.dataFormats[0];
            this.filePickerAccept = ".tbx";
        } else if (conversionFormat == PmkiConversionFormat.ZTHES) {
            this.dataFormats = [new DataFormat("XML", "application/xml", "xml")];
            this.selectedFormat = this.dataFormats[0];
            this.filePickerAccept = ".xml";

            //WHY THIS WANTS PROJECT CONTEXT?
            // this.inputOutputService.getSupportedFormats(this.zThesExtensionId).subscribe(
            //     formats => {
            //         this.dataFormats = formats;
            //         this.selectedFormat = this.dataFormats[0];

            //         let extList: string[] = []; //collects the extensions of the formats in order to provide them to the file picker
            //         this.dataFormats.forEach(f => {
            //             extList.push("." + f.defaultFileExtension);
            //         });
            //         //remove duplicated extensions
            //         extList = extList.filter((item: string, pos: number) => {
            //             return extList.indexOf(item) == pos;
            //         });
            //         this.filePickerAccept = extList.join(",");
            //     }
            // )
        }
    }

    fileChangeEvent(file: File) {
        this.file = file;
    }

    load() {
        alert("TODO");
        // this.basicModals.alert("Load data", "Data loaded successfully").then(
        //     () => {
        //         this.router.navigate(["/home"]);
        //     }
        // )
    }


}