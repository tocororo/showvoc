import { LinksetMetadata } from 'src/app/models/Metadata';
import { Link } from './Link';
import { Node } from './Node';

export class AlignmentLink extends Link {

    linkset: LinksetMetadata;

    constructor(source: Node, target: Node, linkset: LinksetMetadata) {
        super(source, target);
        this.linkset = linkset;
    }

}