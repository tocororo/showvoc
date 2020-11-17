import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AnnotatedValue, RDFResourceRolesEnum, ResAttribute, Resource, Value } from '../models/Resources';
import { ResourceUtils } from '../utils/ResourceUtils';
import { GraphMode } from './abstract-graph';
import { Node, NodeMeasure } from './model/Node';

@Directive()
export abstract class AbstractGraphNode {

    @ViewChild('textEl') textElement: ElementRef;

    @Input() rendering: boolean = true;
    @Input() selected: boolean = false;
    @Output() nodeClicked: EventEmitter<Node> = new EventEmitter<Node>();
    @Output() nodeDblClicked: EventEmitter<Node> = new EventEmitter<Node>();

    protected abstract graphMode: GraphMode;

    abstract node: Node; //in the implementations this should be a @Input() which differs only for the bindingPropertyName
    measures: NodeMeasure;

    nodeClass: string;
    deprecated: boolean = false;

    normalizedShow: string;
    show: string;

    /**
     * Graph implementations use the ChangeDetectionStrategy.OnPush,
     * it means that the change detection is fired only when the reference of the objects is completely replaced.
     * Here I inject the ChangeDetectorRef in order to force the change detection when objects (show and normalizedShow)
     * are not replaced but simply changed.
     */
    protected changeDetectorRef: ChangeDetectorRef
    constructor(changeDetectorRef: ChangeDetectorRef) {
        this.changeDetectorRef = changeDetectorRef;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['rendering'] && !changes['rendering'].firstChange) {
            this.updateShow();
        }
    }

    ngAfterViewInit() {
        this.updateShow();
    }

    protected initNode() {
        this.initNodeStyle();
        this.measures = this.node.getNodeMeaseure();
    }

    private updateShow() {
        this.show = ResourceUtils.getRendering(this.node.res, this.rendering);
        this.changeDetectorRef.detectChanges(); //fire change detection in order to update the textEl that contains "show"

        this.normalizedShow = this.show;
        if (this.textElement != null) {
            let textElementWidth = this.textElement.nativeElement.getBBox().width;
            let nodeWidth = this.node.getNodeWidth() - 4; //subtract 4 as padding
            if (textElementWidth > nodeWidth) {
                let ratio = textElementWidth / nodeWidth;
                let truncateAt = Math.floor(this.normalizedShow.length / ratio);
                this.normalizedShow = this.normalizedShow.substring(0, truncateAt);
            }
            if (this.show.length > this.normalizedShow.length) {
                this.normalizedShow = this.show.substring(0, this.normalizedShow.length - 3) + "...";
            }
        }
        this.changeDetectorRef.detectChanges(); //fire change detection in order to update the normalizedShow in the view
    }

    private initNodeStyle() {
        let res: AnnotatedValue<Value> = this.node.res;
        if (res.getValue() instanceof Resource) {
            let role: RDFResourceRolesEnum = res.getRole();
            let explicit: boolean = res.getAttribute(ResAttribute.EXPLICIT) || res.getAttribute(ResAttribute.EXPLICIT) == undefined;
            this.deprecated = res.getAttribute(ResAttribute.DEPRECATED);
            
            if (role == RDFResourceRolesEnum.annotationProperty ||
                role == RDFResourceRolesEnum.cls ||
                role == RDFResourceRolesEnum.concept ||
                role == RDFResourceRolesEnum.conceptScheme ||
                role == RDFResourceRolesEnum.dataRange ||
                role == RDFResourceRolesEnum.datatypeProperty ||
                role == RDFResourceRolesEnum.individual ||
                role == RDFResourceRolesEnum.limeLexicon ||
                role == RDFResourceRolesEnum.objectProperty ||
                role == RDFResourceRolesEnum.ontolexForm ||
                role == RDFResourceRolesEnum.ontolexLexicalEntry ||
                role == RDFResourceRolesEnum.ontolexLexicalSense ||
                role == RDFResourceRolesEnum.ontologyProperty ||
                role == RDFResourceRolesEnum.property
            ) {
                this.nodeClass = role;
                if (!explicit) {
                    this.nodeClass = role + "Imported";
                } else if (this.deprecated) {
                    this.nodeClass = role + "Deprecated";
                }
            } else if (
                role == RDFResourceRolesEnum.skosCollection ||
                role == RDFResourceRolesEnum.skosOrderedCollection
            ) {
                this.nodeClass = RDFResourceRolesEnum.skosCollection;
                if (!explicit) {
                    this.nodeClass = role + "Imported";
                } else if (this.deprecated) {
                    this.nodeClass = role + "Deprecated";
                }
            } else if (role == RDFResourceRolesEnum.ontology) {
                this.nodeClass = role;
            } else if (role == RDFResourceRolesEnum.xLabel) {
                this.nodeClass = role;
                if (!explicit) {
                    this.nodeClass = role + "Imported";
                } else if (this.deprecated) {
                    this.nodeClass = role + "Deprecated";
                }
            } else { //none of the above (maybe mention?)
                this.nodeClass = "unkwnownNode";
            }
        }
    }


    /**
     * Click handlers
     */

    private isSingleClick: boolean = true;

    onClick() {
        this.isSingleClick = true;
        setTimeout(() => {
            if (this.isSingleClick) {
                this.nodeClicked.emit(this.node);
            }
        }, 300);
    }

    onDblClick() {
        this.isSingleClick = false;
        this.nodeDblClicked.emit(this.node);
    }
}