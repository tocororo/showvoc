import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchMode, SearchSettings, ClassIndividualPanelSearchMode } from 'src/app/models/Properties';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { SVContext } from 'src/app/utils/SVContext';
import { SVProperties } from 'src/app/utils/SVProperties';

@Component({
    selector: 'search-settings-modal',
    templateUrl: './search-settings-modal.html'
})
export class SearchSettingsModal implements OnInit {

    @Input() roles: RDFResourceRolesEnum[];

    private settings: SearchSettings;

    stringMatchModes: { show: string, value: SearchMode }[] = [
        { show: "Starts with", value: SearchMode.startsWith },
        { show: "Contains", value: SearchMode.contains },
        { show: "Ends with", value: SearchMode.endsWith },
        { show: "Exact", value: SearchMode.exact },
        { show: "Fuzzy", value: SearchMode.fuzzy }
    ];
    private activeStringMatchMode: SearchMode;

    settingsForConceptPanel: boolean = false;
    settingsForClassInstancePanel: boolean = false;

    //search mode use URI/LocalName
    useURI: boolean = true;
    useLocalName: boolean = true;
    useNotes: boolean = true;

    private restrictLang: boolean = false;
    private includeLocales: boolean = false;
    private languages: string[];

    private useAutocompletion: boolean = false;

    //concept search restriction
    private restrictConceptSchemes: boolean = true;

    //class-instance panel search
    clsIndSearchMode: { show: string, value: ClassIndividualPanelSearchMode }[] = [
        { show: "Only classes", value: ClassIndividualPanelSearchMode.onlyClasses },
        { show: "Only instances", value: ClassIndividualPanelSearchMode.onlyInstances },
        { show: "Both classes and instances", value: ClassIndividualPanelSearchMode.all }
    ];
    activeClsIndSearchMode: ClassIndividualPanelSearchMode;

    constructor(public activeModal: NgbActiveModal, private svProp: SVProperties) { }

    ngOnInit() {
        this.settingsForConceptPanel = this.roles.length == 1 && this.roles[0] == RDFResourceRolesEnum.concept;
        this.settingsForClassInstancePanel = this.roles.indexOf(RDFResourceRolesEnum.cls) != -1 && this.roles.indexOf(RDFResourceRolesEnum.individual) != -1;

        this.settings = SVContext.getProjectCtx().getProjectPreferences().searchSettings;
        this.activeStringMatchMode = this.settings.stringMatchMode;
        this.useURI = this.settings.useURI;
        this.useLocalName = this.settings.useLocalName;
        this.useNotes = this.settings.useNotes;
        this.restrictLang = this.settings.restrictLang;
        this.includeLocales = this.settings.includeLocales;
        this.languages = this.settings.languages;
        this.useAutocompletion = this.settings.useAutocompletion;
        this.restrictConceptSchemes = this.settings.restrictActiveScheme;
        this.activeClsIndSearchMode = this.settings.classIndividualSearchMode;
    }

    // private selectRestrictionLanguages() {
    //     this.sharedModals.selectLanguages("Language restrictions", this.languages, true).then(
    //         (langs: string[]) => {
    //             this.languages = langs;
    //             this.updateSettings();
    //         },
    //         () => {}
    //     );
    // }

    updateSettings() {
        this.svProp.setSearchSettings(
            SVContext.getProjectCtx(),
            {
                stringMatchMode: this.activeStringMatchMode,
                useURI: this.useURI,
                useLocalName: this.useLocalName,
                useNotes: this.useNotes,
                restrictLang: this.restrictLang,
                includeLocales: this.includeLocales,
                languages: this.languages,
                useAutocompletion: this.useAutocompletion,
                restrictActiveScheme: this.restrictConceptSchemes,
                classIndividualSearchMode: this.activeClsIndSearchMode
            }
        );
    }

    ok() {
        this.activeModal.close();
    }

    close() {
        this.activeModal.dismiss();
    }

}
