import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { BasicModalsServices } from 'src/app/modal-dialogs/basic-modals/basic-modals.service';
import { BrowsingModalsServices } from 'src/app/modal-dialogs/browsing-modals/browsing-modal.service';
import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { ProjectContext, SVContext } from 'src/app/utils/SVContext';
import { Project } from '../../../models/Project';
import { OntoLex, OWL, RDFS, SKOS } from '../../../models/Vocabulary';

@Component({
    selector: 'resource-picker',
    templateUrl: './resourcePickerComponent.html',
    styles: [":host { display: block; }"]
})
export class ResourcePickerComponent {

    @Input() resource: AnnotatedValue<IRI>;

    @Input() disabled: boolean = false;
    @Input() editable: boolean = false; //tells if the URI can be manually edited
    @Input() size: string;

    @Input() config: ResourcePickerConfig;
    @Output() resourceChanged = new EventEmitter<AnnotatedValue<IRI>>();

    inputGroupClass: string = "input-group";
    resourceIRI: string;

    projectAccessed: boolean; //useful in order to disable picker (and just fill manually the field) from outside project

    constructor(private browsingModals: BrowsingModalsServices, private basicModals: BasicModalsServices) { }

    ngOnInit() {
        //if the input size is not valid, set default to "sm"
        if (this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.inputGroupClass += " input-group-" + this.size;
        }

        let defaultConfig = new ResourcePickerConfig();
        if (this.config == null) {
            this.config = defaultConfig;
        } else { //merge provided config (it could be incomplete) with the default values
            this.config.roles = this.config.roles != null ? this.config.roles : defaultConfig.roles;
            this.config.classes = this.config.classes != null ? this.config.classes : defaultConfig.classes;
        }

        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.init();
    }

    private init() {
        this.projectAccessed = SVContext.getWorkingProject() != null;
        if (this.resource) {
            if (typeof this.resource == 'string') {
                this.resource = new AnnotatedValue(new IRI(this.resource));
            }
            this.resourceIRI = this.resource.getValue().getIRI();
        } else {
            this.resourceIRI = null;
        }
    }

    pickLocalResource() {
        this.selectResourceType(SVContext.getWorkingProject()).subscribe(
            role => {
                if (role != null) { //role is null if user canceled the selection
                    this.openSelectionResource(role, SVContext.getProjectCtx());
                }
            }
        );
    }


    private selectResourceType(project: Project): Observable<RDFResourceRolesEnum> {
        let resourceTypes: { [key: string]: RDFResourceRolesEnum } = {
            "Class": RDFResourceRolesEnum.cls,
            "Individual": RDFResourceRolesEnum.individual,
            "Concept": RDFResourceRolesEnum.concept,
            "ConceptScheme": RDFResourceRolesEnum.conceptScheme,
            "Collection": RDFResourceRolesEnum.skosCollection,
            "Property": RDFResourceRolesEnum.property,
            "AnnotationProperty": RDFResourceRolesEnum.annotationProperty,
            "DatatypeProperty": RDFResourceRolesEnum.datatypeProperty,
            "ObjectProperty": RDFResourceRolesEnum.objectProperty,
            "OntologyProperty": RDFResourceRolesEnum.ontologyProperty,
            "Lexicon": RDFResourceRolesEnum.limeLexicon,
            "LexicalEntry": RDFResourceRolesEnum.ontolexLexicalEntry,
        };
        let options: string[] = [];
        for (let key in resourceTypes) {
            if (this.isRolePickable(resourceTypes[key], project)) {
                options.push(key);
            }
        }
        if (options.length == 1) {
            return of(resourceTypes[options[0]]);
        } else {
            return from(
                this.basicModals.select({ key: "COMMONS.ACTIONS.PICK_RESOURCE" }, { key: "COMMONS.ACTIONS.SELECT_RESOURCE_TYPE_TO_PICK" }, options).then(
                    (role: string) => {
                        return resourceTypes[role];
                    },
                    () => {
                        return null;
                    }
                )
            );
        }
    }

    private openSelectionResource(role: RDFResourceRolesEnum, projectCtx: ProjectContext) {
        if (role == RDFResourceRolesEnum.cls) {
            this.browsingModals.browseClassTree({ key: "DATA.ACTIONS.SELECT_CLASS" }, null).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.individual) {
            this.browsingModals.browseClassIndividualTree({ key: "DATA.ACTIONS.SELECT_INSTANCE" }, this.config.classes).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.concept) {
            let activeSchemes: IRI[] = projectCtx.getProjectPreferences().activeSchemes;
            this.browsingModals.browseConceptTree({ key: "DATA.ACTIONS.SELECT_CONCEPT" }, activeSchemes, true).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.conceptScheme) {
            this.browsingModals.browseSchemeList({ key: "DATA.ACTIONS.SELECT_SCHEME" }).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.skosCollection) {
            this.browsingModals.browseCollectionTree({ key: "DATA.ACTIONS.SELECT_COLLECTION" }).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.property || role == RDFResourceRolesEnum.annotationProperty ||
            role == RDFResourceRolesEnum.datatypeProperty || role == RDFResourceRolesEnum.objectProperty || role == RDFResourceRolesEnum.ontologyProperty) {
            this.browsingModals.browsePropertyTree({ key: "DATA.ACTIONS.SELECT_PROPERTY" }).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.limeLexicon) {
            this.browsingModals.browseLexiconList({ key: "DATA.ACTIONS.SELECT_LEXICON" }).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        } else if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
            this.browsingModals.browseLexicalEntryList({ key: "DATA.ACTIONS.SELECT_LEXICAL_ENTRY" }, null, true).then(
                (selectedResource: AnnotatedValue<IRI>) => {
                    this.updatePickedResource(selectedResource);
                },
                () => { }
            );
        }

        //Other type of resource will be added when necessary
    }

    private updatePickedResource(resource: AnnotatedValue<IRI>) {
        this.resource = resource;
        this.resourceIRI = resource.getValue().getIRI();
        // this.onModelChanged();
        this.resourceChanged.emit(this.resource);
    }

    onIriChanged() {
        let returnedRes: AnnotatedValue<IRI> = new AnnotatedValue(new IRI(this.resourceIRI));
        this.resourceChanged.emit(returnedRes);
    }

    /**
     * Tells if the component should allow to pick resource for the given role
     * @param role 
     */
    private isRolePickable(role: RDFResourceRolesEnum, project: Project) {
        let modelType: string = project.getModelType();
        if (this.config.roles != null && this.config.roles.length != 0) {
            return this.config.roles.indexOf(role) != -1;
        } else { // if roles array is not provided, allow selection of all roles compliant with the model type
            if (modelType == OntoLex.uri) { //ontolex project allows selection of all type of resource
                return true;
            } else if (modelType == RDFS.uri || modelType == OWL.uri) {
                return role == RDFResourceRolesEnum.cls || role == RDFResourceRolesEnum.individual || role == RDFResourceRolesEnum.property;
            } else if (modelType == SKOS.uri) {
                return role == RDFResourceRolesEnum.cls || role == RDFResourceRolesEnum.individual || role == RDFResourceRolesEnum.property ||
                    role == RDFResourceRolesEnum.concept || role == RDFResourceRolesEnum.conceptScheme || role == RDFResourceRolesEnum.skosCollection;
            }
            return true;
        }
    }

}

export class ResourcePickerConfig {
    roles?: RDFResourceRolesEnum[]; //if provided, the resource selection is restricted to the given roles
    classes?: IRI[]; //if provided (works only if there are no roles restrictions or if it allows to select individual)
}