import { Component, ElementRef, Input } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { ResourcesServices } from 'src/app/services/resources.service';
import { SVContext } from 'src/app/utils/SVContext';
import { ModalOptions } from '../../Modals';
import { AbstractStructureModal } from '../abstract-structure-modal';
import { LexiconListModal } from '../lexicon-list-modal/lexicon-list-modal';

@Component({
    selector: 'lexical-entry-list-modal',
    templateUrl: './lexical-entry-list-modal.html'
})
export class LexicalEntryListModal extends AbstractStructureModal {

    @Input() lexicon: IRI;
    @Input() lexiconChangeable: boolean = false;

    activeLexicon: AnnotatedValue<IRI>;

    constructor(activeModal: NgbActiveModal, elementRef: ElementRef,
        private modalService: NgbModal, private resourceService: ResourcesServices) {
        super(activeModal, elementRef);
    }

    ngOnInit() {
        if (this.lexicon == null) { //if no lexicon has been "forced", set the current active lexicon
            this.lexicon = SVContext.getProjectCtx().getProjectPreferences().activeLexicon;
        }
        if (this.lexicon != null) {
            this.resourceService.getResourceDescription(this.lexicon).subscribe(
                lex => {
                    this.activeLexicon = <AnnotatedValue<IRI>>lex;
                }
            )
        }
    }

    changeLexicon() {
        const modalRef: NgbModalRef = this.modalService.open(LexiconListModal, new ModalOptions());
        modalRef.componentInstance.title = "Select a Lexicon";
        modalRef.result.then(
            (lexicon: AnnotatedValue<IRI>) => {
                this.activeLexicon = lexicon;
            },
            () => { }
        )
    }

}
