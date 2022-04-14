import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AnnotatedValue, IRI, Literal } from 'src/app/models/Resources';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { SVContext } from 'src/app/utils/SVContext';

@Component({
    selector: "new-typed-lang-modal",
    templateUrl: "./new-typed-literal-modal.html",
})
export class NewTypedLiteralModal {

    @Input() title: string = 'Create new label';
    @Input() predicate: IRI;
    @Input() value: Literal;
    @Input() allowedDatatypes: IRI[];
    @Input() dataRanges: Literal[][];

    showAspectSelector: boolean = false;
    typedLiteralAspectSelector: string = "Typed literal";
    dataRangeAspectSelector: string = "DataRange";
    aspectSelectors: string[] = [this.typedLiteralAspectSelector, this.dataRangeAspectSelector];
    selectedAspectSelector: string = this.aspectSelectors[0];

    datatype: AnnotatedValue<IRI>;

    selectedDataRange: Literal[]; //selected list of dataranges among which chose one

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        if (this.allowedDatatypes != null && this.dataRanges != null) {
            this.showAspectSelector = true;
            this.selectedDataRange = this.dataRanges[0];
        } else if (this.allowedDatatypes != null) {
            this.selectedAspectSelector = this.typedLiteralAspectSelector;
        } else if (this.dataRanges != null) {
            this.selectedAspectSelector = this.dataRangeAspectSelector;
            this.selectedDataRange = this.dataRanges[0];
        } else { //both allowedDatatypes and dataRanges null
            this.selectedAspectSelector = this.typedLiteralAspectSelector;
        }

        //reset the input value if it has a datatype not allowed 
        if (this.value != null && this.allowedDatatypes != null && this.allowedDatatypes.length > 0) {
            if (!this.allowedDatatypes.some(d => d.getIRI() == this.value.getDatatype().getIRI())) {
                this.value = null;
            }
        }
        //init datatype according the input value (if any)
        if (this.value != null) {
            this.datatype = new AnnotatedValue(this.value.getDatatype());
        }
    }

    getDataRangePreview(dataRange: Literal[]): string {
        let preview: string = "OneOf: [";
        for (let i = 0; i < dataRange.length; i++) {
            let v: Literal = dataRange[i];
            preview += JSON.stringify(v.getLabel());
            let dtQname = ResourceUtils.getQName(v.getDatatype().getIRI(), SVContext.getPrefixMappings());
            if (dtQname == v.getDatatype().getIRI()) {
                dtQname = "<" + v.getDatatype() + ">";
            }
            preview += "^^" + dtQname;
            preview += ", ";
            if (i == 2 && dataRange.length > 3) { //stops the preview at the third element (if there are more)
                preview += "...";
                break;
            }
        }
        preview += "]";
        return preview;
    }

    onDatatypeChange(datatype: AnnotatedValue<IRI>) {
        this.datatype = datatype;
    }

    /**
     * Determines if the Ok button is enabled.
     */
    isOkEnabled(): boolean {
        return this.value != null && this.value.getLabel() != "";
    }

    ok() {
        this.activeModal.close(new AnnotatedValue(this.value));
    }


    close() {
        this.activeModal.dismiss();
    }

}