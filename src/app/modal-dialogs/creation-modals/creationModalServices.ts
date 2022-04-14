import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AnnotatedValue, IRI, Literal } from 'src/app/models/Resources';
import { ModalOptions, TextOrTranslation, TranslationUtils } from '../Modals';
import { NewTypedLiteralModal } from './newTypedLiteralModal/new-typed-literal-modal';

@Injectable()
export class CreationModalServices {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    // /**
    //  * Opens a modal to create a new literal with language tag
    //  * @param title the title of the modal dialog
    //  * @param value the value inserted by default
    //  * @param valueReadonly if true the input field is disable and cannot be changed
    //  * @param lang the language selected as default
    //  * @param langReadonly if true the language selection is disable and language cannot be changed
    //  * @param langConstraints constraints to apply to the lang
    //  * @param multivalueOpt options about the creation of multiple labels
    //  * @return if the modal closes with ok returns a promise containing an ARTLiteral
    //  */
    // newPlainLiteral(title: TextOrTranslation, value?: string, valueReadonly?: boolean, lang?: string, langReadonly?: boolean,
    //     langConstraints?: LanguageConstraint, multivalueOpt?: { enabled: boolean, allowSameLang: boolean }) {
    //     let _options: ModalOptions = new ModalOptions();
    //     const modalRef: NgbModalRef = this.modalService.open(NewPlainLiteralModal, _options);
    //     modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
    //     if (value != null) modalRef.componentInstance.value = value;
    //     if (valueReadonly != null) modalRef.componentInstance.valueReadonly = valueReadonly;
    //     if (lang != null) modalRef.componentInstance.lang = lang;
    //     if (langReadonly != null) modalRef.componentInstance.langReadonly = langReadonly;
    //     if (langConstraints != null) modalRef.componentInstance.langConstraints = langConstraints;
    //     if (multivalueOpt != null) modalRef.componentInstance.multivalueOpt = multivalueOpt;
    //     return modalRef.result;
    // }

    /**
     * Opens a modal to create a new literal with datatype
     * @param title the title of the modal dialog
     * @param predicate the (optional) predicate that is going to enrich with the typed literal
     * @param value the (optional) value inserted initially
     * @param allowedDatatypes datatypes allowed in the datatype selection list
     * @param dataRanges if provided, tells which values can be created/chosed (e.g. xml:string ["male", "female"])
     * @return if the modal closes with ok returns a promise containing an ARTLiteral
     */
    newTypedLiteral(title: TextOrTranslation, predicate?: IRI, value?: Literal, allowedDatatypes?: IRI[], dataRanges?: (Literal[])[]): Promise<AnnotatedValue<Literal>> {
        let _options: ModalOptions = new ModalOptions();
        const modalRef: NgbModalRef = this.modalService.open(NewTypedLiteralModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        if (predicate != null) modalRef.componentInstance.predicate = predicate;
        if (value != null) modalRef.componentInstance.value = value;
        if (allowedDatatypes != null) modalRef.componentInstance.allowedDatatypes = allowedDatatypes;
        if (dataRanges != null) modalRef.componentInstance.dataRanges = dataRanges;
        return modalRef.result;
    }

}