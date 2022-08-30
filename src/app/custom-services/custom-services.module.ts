import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { WidgetModule } from '../widget/widget.module';
import { CustomServiceRouterComponent } from './custom-service-router.component';
import { CustomOperationComponent } from './custom-services-editor/custom-operation.component';
import { CustomServiceComponent } from './custom-services-editor/custom-service.component';
import { CustomServicesPageComponent } from './custom-services-editor/custom-services-page.component';
import { AuthorizationHelperModal } from './custom-services-editor/modals/authorization-helper-modal';
import { CustomOperationEditorModal } from './custom-services-editor/modals/custom-operation-editor-modal';
import { CustomOperationModal } from './custom-services-editor/modals/custom-operation-modal';
import { CustomServiceEditorModal } from './custom-services-editor/modals/custom-service-editor-modal';
import { CustomServiceModalServices } from './custom-services-editor/modals/custom-service-modal.service';
import { OperationTypeEditor } from './custom-services-editor/modals/operation-type-editor';
import { InvokableReportersPageComponent } from './invokable-reporters/invokable-reporters-page.component';
import { InvokableReporterComponent } from './invokable-reporters/invokable-reporter.component';
import { InvokableReporterEditorModal } from './invokable-reporters/modals/invokable-reporter-editor-modal';
import { InvokableReporterModalServices } from './invokable-reporters/modals/invokable-reporter-modal.service';
import { ReportResultModal } from './invokable-reporters/modals/report-result-modal';
import { ServiceInvocationEditorModal } from './invokable-reporters/modals/service-invocation-editor-modal';
import { ServiceInvocationComponent } from './invokable-reporters/service-invocation.component';


@NgModule({
    imports: [
        CommonModule,
        DragDropModule,
        FormsModule,
        NgbDropdownModule,
        NgbPopoverModule,
        TranslateModule,
        WidgetModule,
    ],
    declarations: [
        AuthorizationHelperModal,
        CustomOperationComponent,
        CustomOperationEditorModal,
        CustomOperationModal,
        CustomServicesPageComponent,
        CustomServiceRouterComponent,
        CustomServiceComponent,
        CustomServiceEditorModal,
        InvokableReportersPageComponent,
        InvokableReporterComponent,
        InvokableReporterEditorModal,
        ReportResultModal,
        ServiceInvocationComponent,
        ServiceInvocationEditorModal,
        OperationTypeEditor,
    ],
    exports: [
        CustomServiceRouterComponent
    ],
    providers: [
        CustomServiceModalServices, 
        InvokableReporterModalServices
    ],
    entryComponents: [
        AuthorizationHelperModal,
        CustomOperationEditorModal,
        CustomOperationModal,
        CustomServiceEditorModal,
        InvokableReporterEditorModal,
        ReportResultModal,
        ServiceInvocationEditorModal,
    ]
})
export class CustomServicesModule { }