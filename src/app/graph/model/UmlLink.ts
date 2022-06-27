import { AnnotatedValue, IRI, RDFResourceRolesEnum } from 'src/app/models/Resources';
import { Link } from './Link';
import { Node } from "./Node";
import { UmlNode } from './UmlNode';


export class UmlLink extends Link {

    source: UmlNode;
    target: UmlNode;


    /*
     * mi serve per capire quali sono gli archi di un nodo che ciclano su se stessi(è usata insieme all'offset).
     * L'offset da solo non bastava perchè Tiziano l'ha usato per capire anche se un arco va sopra o sotto il nodo.
     */
    loop: boolean;


    constructor(source: Node, target: Node, res: AnnotatedValue<IRI>) {
        super(source, target, res);
    }


    getRole(): RDFResourceRolesEnum {
        return this.res.getRole();
    }

    isReflexive() {
        return this.res.getAttribute("reflexive");
    }


}