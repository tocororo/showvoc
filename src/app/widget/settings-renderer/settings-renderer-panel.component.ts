import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Scope, Settings } from '../../models/Plugins';

@Component({
    selector: 'settings-renderer-panel',
    templateUrl: './settings-renderer-panel.component.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SettingsRendererPanelComponent), multi: true,
    }]
})
export class SettingsRendererPanelComponent {

    @Input() scope: Scope;

    settings: Settings;
    private safeDescription: SafeHtml;
    private safeWarning: SafeHtml;

    closedAlert1: boolean;
    closedAlert2: boolean;

    constructor(public sanitizer: DomSanitizer) { }

    private sanitizeHtml() {
        if (this.settings.htmlDescription) {
            this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(this.settings.htmlDescription);
        }
        if (this.settings.htmlWarning) {
            this.safeWarning = this.sanitizer.bypassSecurityTrustHtml(this.settings.htmlWarning);
        }
    }

    onModelChanged() {
        this.propagateChange(this.settings);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: Settings) {
        if (obj) {
            this.settings = obj;
            this.sanitizeHtml();
        }
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

    //--------------------------------------------------

}