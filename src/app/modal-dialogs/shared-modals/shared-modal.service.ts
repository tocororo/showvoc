import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Settings } from 'src/app/models/Plugins';
import { AnnotatedValue, Resource, Value } from 'src/app/models/Resources';
import { ProjectContext } from 'src/app/utils/SVContext';
import { ResourcePickerConfig } from 'src/app/widget/pickers/value-picker/resourcePickerComponent';
import { ResourceViewModal } from '../../resource-view/modals/resource-view-modal';
import { ResourceSelectionModal } from '../basic-modals/selection-modal/resource-selection-modal';
import { ModalOptions, TextOrTranslation, TranslationUtils } from '../Modals';
import { LanguageSelectorModal } from './languages-selector-modal/languages-selector-modal';
import { PluginConfigurationModal, PluginSettingsHandler } from './plugin-configuration/plugin-configuration-modal';
import { ResourcePickerModal } from './resource-picker-modal/resource-picker-modal';

@Injectable()
export class SharedModalsServices {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    /**
     * Opens a resource view in a modal
     * @param resource 
     */
    openResourceView(resource: Resource, projectCtx?: ProjectContext, options?: ModalOptions) {
        let _options: ModalOptions = new ModalOptions("lg").merge(options);
        const modalRef: NgbModalRef = this.modalService.open(ResourceViewModal, _options);
        modalRef.componentInstance.resource = resource;
        modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * Opens a modal to select multiple languages
     * @param title
     * @param languages languages already selected
     * @param radio if true, exactly one language should be selected
     * @param projectAware if true, allow selection only of languages available in the current project
     * @param projectCtx allow to customize the available languages for the contextual project
     */
    selectLanguages(title: TextOrTranslation, languages?: string[], radio?: boolean, projectAware?: boolean, projectCtx?: ProjectContext) {
        const modalRef: NgbModalRef = this.modalService.open(LanguageSelectorModal, new ModalOptions());
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        if (languages != null) modalRef.componentInstance.languages = languages;
        if (radio != null) modalRef.componentInstance.radio = radio;
        if (projectAware != null) modalRef.componentInstance.projectAware = projectAware;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     * @param roles 
     * @param editable 
     */
    pickResource(title: TextOrTranslation, config?: ResourcePickerConfig, editable?: boolean): Promise<AnnotatedValue<Resource>> {
        const modalRef: NgbModalRef = this.modalService.open(ResourcePickerModal, new ModalOptions());
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        if (config != null) modalRef.componentInstance.config = config;
        if (editable != null) modalRef.componentInstance.editable = editable;
        return modalRef.result;
    }

    /**
     * Opens a modal with an message and a list of selectable options.
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body. If null no message will be in the modal
     * @param resourceList array of available resources
     * @param rendering in case of array of resources, it tells whether the resources should be rendered
     * @return if the modal closes with ok returns a promise containing a list of selected resource
     */
    selectResource(title: TextOrTranslation, message: TextOrTranslation, resourceList: AnnotatedValue<Value>[], rendering?: boolean, multiselection?: boolean, emptySelectionAllowed?: boolean, selectedResources?: Value[]): Promise<any[]> {
        const modalRef: NgbModalRef = this.modalService.open(ResourceSelectionModal, new ModalOptions());
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText(title, this.translateService);
        modalRef.componentInstance.message = TranslationUtils.getTranslatedText(message, this.translateService);
        modalRef.componentInstance.resourceList = resourceList;
        if (rendering != null) modalRef.componentInstance.rendering = rendering;
        if (multiselection != null) modalRef.componentInstance.multiselection = multiselection;
        if (emptySelectionAllowed != null) modalRef.componentInstance.emptySelectionAllowed = emptySelectionAllowed;
        if (selectedResources != null) modalRef.componentInstance.selectedResources = selectedResources;
        return modalRef.result;
    }

    /**
     * Opens a modal to change a plugin configuration.
     * Returns a new PluginConfiguration, the input configuration doesn't mutate.
     * @param configuration
     */
    configurePlugin(configuration: Settings, handler?: PluginSettingsHandler) {
        const modalRef: NgbModalRef = this.modalService.open(PluginConfigurationModal, new ModalOptions("lg"));
        modalRef.componentInstance.configuration = configuration;
        modalRef.componentInstance.handler = handler;
        return modalRef.result;
    }

}