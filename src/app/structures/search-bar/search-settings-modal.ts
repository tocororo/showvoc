import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchMode, SearchSettings } from 'src/app/models/Properties';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import { PMKIProperties } from 'src/app/utils/PMKIProperties';

@Component({
    selector: 'search-settings-modal',
    templateUrl: './search-settings-modal.html'
})
export class SearchSettingsModal implements OnInit {

    @Input() role: RDFResourceRolesEnum;

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

    constructor(public activeModal: NgbActiveModal, private pmkiProp: PMKIProperties) { }

    ngOnInit() {
        this.settingsForConceptPanel = this.role == RDFResourceRolesEnum.concept;

        this.settings = PMKIContext.getProjectCtx().getProjectPreferences().searchSettings;
        this.activeStringMatchMode = this.settings.stringMatchMode;
        this.useURI = this.settings.useURI;
        this.useLocalName = this.settings.useLocalName;
        this.useNotes = this.settings.useNotes;
        this.restrictLang = this.settings.restrictLang;
        this.includeLocales = this.settings.includeLocales;
        this.languages = this.settings.languages;
        this.useAutocompletion = this.settings.useAutocompletion;
        this.restrictConceptSchemes = this.settings.restrictActiveScheme;
        // this.activeClsIndSearchMode = this.settings.classIndividualSearchMode;
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
        this.pmkiProp.setSearchSettings(
            PMKIContext.getProjectCtx(),
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
                // classIndividualSearchMode: this.activeClsIndSearchMode
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
