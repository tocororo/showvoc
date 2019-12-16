import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { RDFResourceRolesEnum } from 'src/app/models/Resources';
import { Constants } from '../model/GraphConstants';
import { GraphUtils } from '../model/GraphUtils';
import { Link } from '../model/Link';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';

@Component({
    selector: '[link]',
    templateUrl: "./link.component.html",
    styleUrls: ['../graph.css']
})
export class LinkComponent {
    @Output() linkClicked: EventEmitter<Link> = new EventEmitter<Link>();
    @Input('link') link: Link;
    @Input() rendering: boolean = true;
    @Input() selected: boolean = false;

    @ViewChild('textEl') textElement: ElementRef;

    linkClass: string = "link";
    arrowClass: string = "";

    show: string;

    constructor(private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        this.initLinkStyle();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['rendering'] && !changes['rendering'].firstChange) {
            this.updateShow();
        }
    }

    ngAfterViewInit() {
        this.updateShow();
    }

    private initLinkStyle() {
        if (this.link.res != null) {
            //distinguish the type or predicate
            let role: RDFResourceRolesEnum = this.link.res.getRole();
            this.arrowClass = role + "Arrow";
        }
        if (this.link.classAxiom) {
            this.linkClass += " linkDotted";
        }
    }

    /**
     * Compute the coordinates for the "d" attributes of the path
     */
    computePath() {
        let path: string = "M" + this.link.source.x + " " + this.link.source.y; //path start
        if (this.link.source == this.link.target) { //loop path
            let borderDistY = this.link.source.getNodeHeight() / 2;
            let sign = this.link.offset > 0 ? 1 : -1;
            let dy = (borderDistY + Math.abs(Constants.loopPathMultiplier * this.link.offset)) * sign;
            path = path + " c -30 " + dy + " 20 " + dy; //control points for curve dx1 dy1 dx2 dy2 (relative to the starting point);
            path = path + " 10 " + borderDistY * sign; //endpoint of the curve
        } else {
            let endpoint = GraphUtils.getIntersectionPoint(this.link);
            if (this.link.offset != 0) { //in case the offset, compute the control point for the Quadratic Bezier curve
                let center = GraphUtils.computeCenter(this.link.source, this.link.target);
                let normal = GraphUtils.calculateNormalVector(this.link.source, this.link.target, Constants.normalVectorMultiplier * this.link.offset);
                let controlPointX = center.x + normal.x;
                let controlPointY = center.y + normal.y;
                path = path + " Q" + controlPointX + " " + controlPointY;
            }
            path = path + " " + endpoint.x + " " + endpoint.y; //path end
        }
        return path;
    }

    private updateShow() {
        this.show = ResourceUtils.getRendering(this.link.res, this.rendering);
        this.changeDetectorRef.detectChanges(); //fire change detection in order to update the textEl that contains "show"
    }


    /**
     * Link label utils
     */

    private getLabelPosition() {
        let position: { x: number, y: number } = { x: 0, y: 0 };
        if (this.link.source == this.link.target) { //loop path
            let borderDistY = this.link.source.getNodeHeight() / 2;
            let sign = this.link.offset > 0 ? 1 : -1;
            let dy = (borderDistY + Math.abs(Constants.loopPathMultiplier * this.link.offset)) * sign;
            position.x = this.link.source.x;
            position.y = this.link.source.y + dy;
        } else { //"normal" path, the label is positioned in corrispondece of the control point of the curve
            let center = GraphUtils.computeCenter(this.link.source, this.link.target);
            let normal = GraphUtils.calculateNormalVector(this.link.source, this.link.target, Constants.normalVectorMultiplier * this.link.offset);
            position.x = center.x + normal.x;
            position.y = center.y + normal.y;
        }
        return position;
    }

    private getLabelTransform() {
        let labelPosition = this.getLabelPosition();
        return "translate(" + labelPosition.x + "," + labelPosition.y + ")";
    }

    private getLabelRectWidth() {
        let padding = 1;
        if (this.textElement != null) {
            return this.textElement.nativeElement.getBoundingClientRect().width + padding * 2;
        }
        return padding * 2;
    }

    onClick(event: Event) {
        event.stopPropagation(); //avoid propagation since click event is handled also in the svg container div
        if (this.link.res != null) {
            this.linkClicked.emit(this.link);
        }
    }

}