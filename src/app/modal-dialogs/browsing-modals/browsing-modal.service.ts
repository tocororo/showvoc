import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { ModalOptions, TextOrTranslation, TranslationUtils } from '../Modals';
import { ClassIndividualTreeModal } from './class-individual-tree-modal/class-individual-tree-modal';
import { ClassTreeModal } from './class-tree-modal/class-tree-modal';
import { CollectionTreeModal } from './collection-tree-modal/collection-tree-modal';
import { ConceptTreeModal } from './concept-tree-modal/concept-tree-modal';
import { LexicalEntryListModal } from './lexical-entry-list-modal/lexical-entry-list-modal';
import { LexiconListModal } from './lexicon-list-modal/lexicon-list-modal';
import { PropertyTreeModal } from './property-tree-modal/property-tree-modal';
import { SchemeListModal } from './scheme-list-modal/scheme-list-modal';

@Injectable()
export class BrowsingModalsServices {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    /**
     * Open a modal to browse the class tree
     * @param title 
     * @param roots list of IRI which the tree will be rooted on
     * @param options 
     */
    browseClassTree(title: TextOrTranslation, roots?: IRI[], options?: ModalOptions): Promise<AnnotatedValue<IRI>> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(ClassTreeModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.roots = roots;
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the class tree and select an individual of a class
     * @param title the title of the modal
     * @param classes (optional) tells the admitted type of the individual to pick
     * @return if the modal closes with ok returns a promise containing the selected individual
     */
    browseClassIndividualTree(title: TextOrTranslation, classes?: IRI[], options?: ModalOptions): Promise<AnnotatedValue<IRI>> {
        let _options: ModalOptions = new ModalOptions('xl').merge(options);
        const modalRef: NgbModalRef = this.modalService.open(ClassIndividualTreeModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        if (classes != null) modalRef.componentInstance.classes = classes;
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the concept tree
     * @param title the title of the modal
     * @param scheme the scheme of the concept tree. If not provided the modal contains a tree in no-scheme mode
     * @param schemeChangeable if true a menu is shown and the user can browse not only the selected scheme
     * @return if the modal closes with ok returns a promise containing the selected concept
     */
    browseConceptTree(title: TextOrTranslation, schemes?: IRI[], schemeChangeable?: boolean, options?: ModalOptions): Promise<AnnotatedValue<IRI>> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(ConceptTreeModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.schemes = schemes;
        modalRef.componentInstance.schemeChangeable = schemeChangeable;
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the collection tree
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected collection
     */
    browseCollectionTree(title: TextOrTranslation, options?: ModalOptions): Promise<AnnotatedValue<IRI>> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(CollectionTreeModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the scheme list
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing the selected scheme
     */
    browseSchemeList(title: TextOrTranslation, options?: ModalOptions): Promise<AnnotatedValue<IRI>> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(SchemeListModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        return modalRef.result;
    }

    /**
     * Opens a modal to browse the property tree
     * @param title the title of the modal
     * @param rootProperties optional , if provided the tree is build with these properties as roots
     * @param resource optional, if provided the returned propertyTree contains 
     * just the properties that have as domain the type of the resource 
     * @return if the modal closes with ok returns a promise containing the selected property
     */
    browsePropertyTree(title: TextOrTranslation, rootProperties?: IRI[], resource?: IRI, options?: ModalOptions): Promise<AnnotatedValue<IRI>> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(PropertyTreeModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.rootProperties = rootProperties;
        modalRef.componentInstance.resource = resource;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     * @param lexicon if not provided, get the current active
     * @param lexiconChangeable 
     */
    browseLexicalEntryList(title: TextOrTranslation, lexicon?: IRI, lexiconChangeable?: boolean, options?: ModalOptions): Promise<AnnotatedValue<IRI>> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(LexicalEntryListModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.lexicon = lexicon;
        modalRef.componentInstance.lexiconChangeable = lexiconChangeable;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     */
    browseLexiconList(title: TextOrTranslation, options?: ModalOptions): Promise<AnnotatedValue<IRI>> {
        let _options: ModalOptions = new ModalOptions().merge(options);
        const modalRef: NgbModalRef = this.modalService.open(LexiconListModal, _options);
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        return modalRef.result;
    }


}