import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Properties } from '../models/Properties';
import { IRI } from '../models/Resources';
import { PreferencesSettingsServices } from '../services/preferences-settings.service';
import { PMKIEventHandler } from './PMKIEventHandler';

@Injectable()
export class PMKIProperties {

    private activeSchemes: IRI[] = [];
    private activeLexicon: IRI;
    private showFlags: boolean = true;


    constructor(private prefService: PreferencesSettingsServices, private eventHandler: PMKIEventHandler) {
    }

    /* =============================
    ========= PREFERENCES ==========
    ============================= */

    /**
     * To call each time the user change project
     */
    initUserProjectPreferences(): Observable<void> {
        var properties: string[] = [
            Properties.pref_active_schemes, Properties.pref_active_lexicon, Properties.pref_show_flags
        ];
        return this.prefService.getPUSettings(properties).pipe(
            map(prefs => {
                this.activeSchemes = [];
                let activeSchemesPref: string = prefs[Properties.pref_active_schemes];
                if (activeSchemesPref != null) {
                    let skSplitted: string[] = activeSchemesPref.split(",");
                    for (var i = 0; i < skSplitted.length; i++) {
                        this.activeSchemes.push(new IRI(skSplitted[i]));
                    }
                }

                this.activeLexicon = null;
                let activeLexiconPref: string = prefs[Properties.pref_active_lexicon];
                if (activeLexiconPref != null) {
                    this.activeLexicon = new IRI(activeLexiconPref);
                }

                this.showFlags = prefs[Properties.pref_show_flags] == "true";
            })
        );
    }

    getActiveSchemes(): IRI[] {
        return this.activeSchemes;
    }
    setActiveSchemes(schemes: IRI[]) {
        if (schemes == null) {
            this.activeSchemes = [];
        } else {
            this.activeSchemes = schemes;
        }
        this.prefService.setActiveSchemes(this.activeSchemes).subscribe(
            stResp => {
                this.eventHandler.schemeChangedEvent.emit(this.activeSchemes);
            }
        );
    }
    isActiveScheme(scheme: IRI): boolean {
        return this.activeSchemes.find(s => s.equals(scheme)) != null;
    }

    getActiveLexicon(): IRI {
        return this.activeLexicon;
    }
    setActiveLexicon(lexicon: IRI) {
        this.activeLexicon = lexicon;
        this.prefService.setPUSetting(Properties.pref_active_lexicon, this.activeLexicon.getIRI()).subscribe(
            stResp => {
                this.eventHandler.lexiconChangedEvent.emit(this.activeLexicon);
            }
        );
    }
    isActiveLexicon(lexicon: IRI): boolean {
        return this.activeLexicon != null && this.activeLexicon.equals(lexicon);
    }

    getShowFlags(): boolean {
        return this.showFlags;
    }
    setShowFlags(show: boolean) {
        this.showFlags = show;
        this.prefService.setShowFlags(show).subscribe();
    }

}