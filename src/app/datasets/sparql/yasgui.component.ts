import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as $ from 'jquery';
import { PrefixMapping } from 'src/app/models/Metadata';
import { SearchMode } from 'src/app/models/Properties';
import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { QueryChangedEvent } from 'src/app/models/Sparql';
import { SearchServices } from 'src/app/services/search.service';
import { PMKIContext } from 'src/app/utils/PMKIContext';
import * as YASQE from 'yasgui-yasqe';

@Component({
    selector: 'yasgui',
    templateUrl: './yasgui.component.html',
    host: { class: "vbox" }
})
export class YasguiComponent {
    @Input() query: string;
    @Input() hideButtons: boolean = false;
    @Output() querychange = new EventEmitter<QueryChangedEvent>();

    @ViewChild('txtarea', { static: true }) textareaElement: ElementRef;

    private CLASS_COMPLETER_NAME = "customClassCompleter";
    private PREFIX_COMPLETER_NAME = "customPrefixCompleter";
    private PROPERTY_COMPLETER_NAME = "customPropertyCompleter";

    fetchFromPrefixCheck: boolean = false;

    private yasqe: any;

    constructor(private searchService: SearchServices) { }

    ngAfterViewInit() {
        YASQE.defaults.indentUnit = 4;
        YASQE.defaults.persistent = null; //disable persistency
        YASQE.defaults.autocompleters = ["variables"];

        //register the autocompleters if not yet done (by other instances of YasguiComponent)
        if (YASQE.defaults.autocompleters.indexOf(this.PREFIX_COMPLETER_NAME) == -1) {
            YASQE.registerAutocompleter(this.PREFIX_COMPLETER_NAME,
                (yasqe: any) => {
                    return this.customPrefixCompleter(yasqe, PMKIContext.getPrefixMappings(), this.fetchFromPrefixCheck);
                }
            );
        }
        if (YASQE.defaults.autocompleters.indexOf(this.PROPERTY_COMPLETER_NAME) == -1) {
            YASQE.registerAutocompleter(this.PROPERTY_COMPLETER_NAME,
                (yasqe: any) => {
                    return this.customPropertyCompleter(yasqe, this.searchService);
                }
            );
        }
        if (YASQE.defaults.autocompleters.indexOf(this.CLASS_COMPLETER_NAME) == -1) {
            YASQE.registerAutocompleter(this.CLASS_COMPLETER_NAME,
                (yasqe: any) => {
                    return this.customClassCompleter(yasqe, this.searchService);
                }
            );
        }

        this.yasqe = YASQE.fromTextArea(
            this.textareaElement.nativeElement,
            {
                persistent: null, //avoid same query for all the tabs
                createShareLink: null, //disable share button
                extraKeys: { "Ctrl-7": YASQE.commentLines },
            }
        );

        //called on changes in yasqe editor
        this.yasqe.on('change', (yasqe: any) => {
            //update query in parent component
            this.querychange.emit({ query: yasqe.getValue(), valid: yasqe.queryValid, mode: yasqe.getQueryMode() });
            //Check whether typed prefix is declared. If not, automatically add declaration using list from prefix.cc
            //taken from prefixes.js, since I don't use prefixes autocompleter I nees to register this listener
            YASQE.Autocompleters.prefixes.appendPrefixIfNeeded(yasqe, this.PREFIX_COMPLETER_NAME);
        });

        //I can't explain why, but if I don't force the update of the content, when a new tab is added, the editor is initialized with UI issues
        setTimeout(() => {
            this.forceContentUpdate();
        })
    }

    /**
     * If query is changed in code from the parent component, the @Input query changes, but content of the yasqe editor is not updated.
     * I need to force it by setting the value with setValue().
     * Note: this operation reset the caret at the beginning of the editor, so use it with caution.
     * @param changes 
     */
    public forceContentUpdate() {
        this.yasqe.setValue(this.query);
        this.collapsePrefixDeclaration();
    }

    private collapsePrefixDeclaration() {
        //collapse prefixes declaration if any
        if (Object.keys(this.yasqe.getPrefixesFromQuery()).length != 0) {
            this.yasqe.collapsePrefixes(true);
        }
    }

    /**
     * Listener on change event of checkbox to enable the prefix.cc prefix fetching.
     */
    onCheckboxChange() {
        //disable the completer, register it with fetchFromPrefixCC changed, then enable it again
        this.yasqe.disableCompleter(this.PREFIX_COMPLETER_NAME);
        YASQE.registerAutocompleter(this.PREFIX_COMPLETER_NAME,
            (yasqe: any) => {
                return this.customPrefixCompleter(yasqe, PMKIContext.getPrefixMappings(), this.fetchFromPrefixCheck);
            }
        );
        this.yasqe.enableCompleter(this.PREFIX_COMPLETER_NAME);
    }


    /**
     * Custom completers
     */

    /**
     * Override the default "prefixes" autocompleter. This autocompleter looks for prefixes in the local triple store
     * and on prefix.cc if the fetchFromPrefixCC parameter is true
     */
    private customPrefixCompleter(yasqe: any, prefixMappings: PrefixMapping[], fetchFromPrefixCC: boolean): any {
        return {
            isValidCompletionPosition: function () {
                return YASQE.Autocompleters.prefixes.isValidCompletionPosition(yasqe);
            },
            get: function (token: any, callback: any) { //callback is the function to which pass the suggested strings if get is async
                var prefixArray: string[] = [];
                //add the prefixes from the local triplestore
                for (var i = 0; i < prefixMappings.length; i++) {
                    var prNs = prefixMappings[i].prefix + ": <" + prefixMappings[i].namespace + ">";
                    prefixArray.push(prNs);
                }
                prefixArray.sort();
                if (fetchFromPrefixCC) {
                    //-----------copied from prefixes.js of yasgui-yasqe-----------
                    $.get(YASQE.Autocompleters.prefixes.fetchFrom, function (data) {
                        for (var prefix in data) {
                            if (prefix == "bif")
                                continue; // skip this one! see #231
                            var completeString = prefix + ": <" + data[prefix] + ">";
                            prefixArray.push(completeString); // the array we want to store in localstorage
                        }

                        callback(prefixArray);
                    });
                    //-------------------------------------------------------
                } else {
                    callback(prefixArray);
                }
            },
            preProcessToken: function (token: any) {
                return YASQE.Autocompleters.prefixes.preprocessPrefixTokenForCompletion(yasqe, token)
            },
            async: true,
            bulk: true,
            autoShow: true,
            persistent: null,
            callbacks: {
                pick: function () {
                    yasqe.collapsePrefixes(false);
                }
            }
        }
    };

    /**
     * Override the default "properties" autocompleter. This autocompleter looks for properties in the local triple store
     */
    private customPropertyCompleter(yasqe: any, searchService: SearchServices): any {
        return {
            isValidCompletionPosition: function () {
                return YASQE.Autocompleters.properties.isValidCompletionPosition(yasqe);
            },
            get: function (token: any, callback: any) {
                //I don't know why, event if isValidCompletionPosition returns false, get is called, so I prevent to call searchResource
                //by stopping get function if token is a white space or a "error" token
                if (token.type == "ws" || token.type == "error") {
                    return;
                }
                searchService.searchResource(token.autocompletionString, ["property"], false, true, false, SearchMode.startsWith).subscribe(
                    (results: AnnotatedValue<IRI>[]) => {
                        var resArray: string[] = [];
                        for (var i = 0; i < results.length; i++) {
                            var uri = results[i].getValue().getIRI();
                            //results may contains duplicate (properties with multiple roles), so add the uri only if not already in
                            if (resArray.indexOf(uri) == -1) {
                                resArray.push(uri);
                            }
                        }
                        callback(resArray);
                    }
                );
            },
            preProcessToken: function (token: any) {
                return YASQE.Autocompleters.properties.preProcessToken(yasqe, token)
            },
            postProcessToken: function (token: any, suggestedString: string) {
                return YASQE.Autocompleters.properties.postProcessToken(yasqe, token, suggestedString);
            },
            async: true,
            bulk: false,
            autoShow: false,
            persistent: null,
            callbacks: {
                validPosition: yasqe.autocompleters.notifications.show,
                invalidPosition: yasqe.autocompleters.notifications.hide,
            }
        }
    }

    /**
     * Override the default "classes" autocompleter. This autocompleter looks for classes in the local triple store
     */
    private customClassCompleter(yasqe: any, searchService: SearchServices): any {
        return {
            isValidCompletionPosition: function () {
                return YASQE.Autocompleters.classes.isValidCompletionPosition(yasqe);
            },
            get: function (token: any, callback: any) {
                if (token.autocompletionString.trim() != "") {
                    searchService.searchResource(token.autocompletionString, ["cls"], false, true, false, SearchMode.startsWith).subscribe(
                        (results: AnnotatedValue<IRI>[]) => {
                            var resArray: string[] = [];
                            for (var i = 0; i < results.length; i++) {
                                resArray.push(results[i].getValue().getIRI());
                            }
                            callback(resArray);
                        }
                    );
                }
            },
            preProcessToken: function (token: any) {
                return YASQE.Autocompleters.classes.preProcessToken(yasqe, token)
            },
            postProcessToken: function (token: any, suggestedString: string) {
                return YASQE.Autocompleters.classes.postProcessToken(yasqe, token, suggestedString);
            },
            async: true,
            bulk: false,
            autoShow: false,
            persistent: null,
            callbacks: {
                validPosition: yasqe.autocompleters.notifications.show,
                invalidPosition: yasqe.autocompleters.notifications.hide,
            }
        }
    }

}