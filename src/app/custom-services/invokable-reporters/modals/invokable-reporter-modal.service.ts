import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ModalOptions, TextOrTranslation, TranslationUtils } from 'src/app/modal-dialogs/Modals';
import { Reference } from '../../../models/Configuration';
import { Report, ServiceInvocationDefinition } from '../../../models/InvokableReporter';
import { InvokableReporterEditorModal } from './invokable-reporter-editor-modal';
import { ReportResultModal } from './report-result-modal';
import { ServiceInvocationEditorModal } from './service-invocation-editor-modal';


@Injectable()
export class InvokableReporterModalServices {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    public openInvokableReporterEditor(title: TextOrTranslation, existingReporters: Reference[], reporterRef?: Reference): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(InvokableReporterEditorModal, new ModalOptions('xl'));
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.existingReporters = existingReporters;
        if (reporterRef != null) modalRef.componentInstance.reporterRef = reporterRef;
        return modalRef.result;
    }

    public openServiceInvocationEditor(title: TextOrTranslation, invokableReporterRef: Reference, serviceInvocation?: { def: ServiceInvocationDefinition, idx: number }): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(ServiceInvocationEditorModal, new ModalOptions('full'));
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.invokableReporterRef = invokableReporterRef;
        if (serviceInvocation != null) modalRef.componentInstance.serviceInvocation = serviceInvocation;
        return modalRef.result;
    }

    public showReport(report: Report): Promise<void> {
        const modalRef: NgbModalRef = this.modalService.open(ReportResultModal, new ModalOptions('lg'));
        modalRef.componentInstance.report = report;
        return modalRef.result;
    }

}