import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Settings } from 'src/app/models/Plugins';
import { Resource } from 'src/app/models/Resources';
import { ProjectContext } from 'src/app/utils/SVContext';
import { ResourceViewModal } from '../../resource-view/modals/resource-view-modal';
import { ModalOptions, TextOrTranslation } from '../Modals';
import { LanguageSelectorModal } from './languages-selector-modal/languages-selector-modal';
import { PluginConfigurationModal, PluginSettingsHandler } from './plugin-configuration/plugin-configuration-modal';

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
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (languages != null) modalRef.componentInstance.languages = languages;
        if (radio != null) modalRef.componentInstance.radio = radio;
        if (projectAware != null) modalRef.componentInstance.projectAware = projectAware;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
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