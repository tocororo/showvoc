import { AnnotatedValue, IRI } from 'src/app/models/Resources';
import { Link } from './Link';
import { Node } from './Node';

export class ModelLink extends Link {

    res: AnnotatedValue<IRI>;

    constructor(source: Node, target: Node, res: AnnotatedValue<IRI>) {
        super(source, target);
        this.res = res;
    }

}