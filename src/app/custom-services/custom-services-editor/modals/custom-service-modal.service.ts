import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ModalOptions, TextOrTranslation, TranslationUtils } from 'src/app/modal-dialogs/Modals';
import { CustomOperationDefinition, CustomService } from '../../../models/CustomService';
import { CustomOperationEditorModal } from './custom-operation-editor-modal';
import { CustomOperationModal } from './custom-operation-modal';
import { CustomServiceEditorModal } from './custom-service-editor-modal';


@Injectable()
export class CustomServiceModalServices {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    public openCustomServiceEditor(title: TextOrTranslation, serviceConf?: CustomService): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(CustomServiceEditorModal, new ModalOptions());
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        if (serviceConf != null) modalRef.componentInstance.service = serviceConf;
        return modalRef.result;
    }

    public openCustomOperationEditor(title: TextOrTranslation, customServiceId: string, operation?: CustomOperationDefinition): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(CustomOperationEditorModal, new ModalOptions('xl'));
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.customServiceId = customServiceId;
        if (operation != null) modalRef.componentInstance.operation = operation;
        return modalRef.result;
    }

    public openCustomOperationView(operation: CustomOperationDefinition): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(CustomOperationModal, new ModalOptions('xl'));
        modalRef.componentInstance.operation = operation;
        return modalRef.result;
    }

}