import Prolog from 'jsprolog';
import { Scope } from '../models/Plugins';
import { AnnotatedValue, Resource, Value } from '../models/Resources';
import { User } from "../models/User";
import { SVContext } from './SVContext';

export enum STActionsEnum {
    //Download
    downloadGenericAction = "downloadGenericAction",
    //Projects
    projectSetProjectFacets = "projectSetProjectFacets",
    //Storage
    storageGenericAction = "storageGenericAction",
}

export class AuthorizationEvaluator {

    private static prologEngine: any;
    private static resRole: string = "%resource_role%";
    private static authCache: { [goal: string]: boolean } = {};

    public static actionAuthGoalMap: { [key: string]: string } = {
        [STActionsEnum.downloadGenericAction]: 'auth(pm(project,downloads), "CRUD").',
        [STActionsEnum.projectSetProjectFacets]: 'auth(pm(project), "U").',
        [STActionsEnum.storageGenericAction]: 'auth(pm(project), "CRUD").',
    };

    public static initEvalutator(capabilityList: string[]) {
        let db: string = this.tbox + this.jsPrologSupport;
        if (capabilityList.length > 0) {
            let capabilities = capabilityList.join(". ") + ".";
            db += capabilities;
        }
        // console.log(db);
        AuthorizationEvaluator.reset();
        AuthorizationEvaluator.prologEngine = Prolog.Parser.parse(db);
    }

    public static reset() {
        AuthorizationEvaluator.prologEngine = null;
        AuthorizationEvaluator.authCache = {};
    }


    /**
     * Check if a VBAction is authorized
     * @param action 
     * @param resource If provided, is used to get its role 
     * @param langValue If provided, check if it is a language tagged resource and the user has the permission
     */
    public static isAuthorized(action: STActionsEnum, resource?: AnnotatedValue<Resource>, langValue?: AnnotatedValue<Value>): boolean {
        let goal: string = this.actionAuthGoalMap[action]; //retrieves the action goal and call isGaolAuthorized
        return AuthorizationEvaluator.isGaolAuthorized(goal, resource, langValue);
    }

    public static isSettingsActionAuthorized(scope: Scope, crud: string) {
        if (scope == Scope.SYSTEM) {
            return SVContext.getLoggedUser().isSuperUser(false);
        } else if (scope == Scope.PROJECT) {
            if (crud == "R") { //only read
                return true; //PROJECT settings can be read by any user (e.g. project languages)
            } else {
                return AuthorizationEvaluator.isGaolAuthorized('auth(pm(project, _), "' + crud + '").');
            }
        } else if (scope == Scope.PROJECT_GROUP) {
            if (crud == "R") { //only read
                return true; //PROJECT_GROUP settings can be read by any user (e.g. group limitations)
            } else {
                return AuthorizationEvaluator.isGaolAuthorized('auth(pm(project, group), "' + crud + '").');
            }
        } else { //USER, USER_PROJECT
            return true; //it is enough that the user is logged
        }
    }

    /**
     * Check if a goal is authorized
     * @param goal 
     * @param resource 
     * @param langValue 
     */
    public static isGaolAuthorized(goal: string, resource?: AnnotatedValue<Resource>, langValue?: AnnotatedValue<Value>): boolean {
        let user: User = SVContext.getLoggedUser();
        if (user == null) {
            return false;
        }
        if (user.isAdmin()) {
            return true;
        } else {
            // //check language authorization
            // if (langValue != null && langValue.getAttribute(ResAttribute.LANG)) {
            //     let userLangs: string[] = SVContext.getProjectUserBinding().getLanguages();
            //     if (!userLangs.some(l => l.toLowerCase() == langValue.getAttribute(ResAttribute.LANG).toLowerCase())) {
            //         return false;
            //     }
            // }

            if (AuthorizationEvaluator.prologEngine == null) { //engine not yet initialized
                return false;
            }
            //evaluate if the user capabilities satisfy the authorization requirement
            if (goal.includes(AuthorizationEvaluator.resRole)) { //dynamic goal (depending on resource role)
                if (resource != null) {
                    goal = goal.replace(AuthorizationEvaluator.resRole, resource.getRole());
                } else {
                    throw new Error("Cannot resolve the authorization goal: goal depends on resource role, but resource is undefined");
                }
            }
            return this.evaulateGoal(goal);
        }
    }

    static evaulateGoal(goal: string): boolean {
        let cachedAuth: boolean = this.authCache[goal];
        if (cachedAuth != null) { //if it was chached => return it
            return cachedAuth;
        } else { //...otherwise compute authorization
            let query = Prolog.Parser.parseQuery(goal);
            let iter = Prolog.Solver.query(AuthorizationEvaluator.prologEngine, query);
            let authorized: boolean = iter.next();
            //cache the result of the evaluation for the given goal
            this.authCache[goal] = authorized;
            return authorized;
        }
    }


    private static tbox = `
        auth(TOPIC, CRUDVRequest) :-
            chk_capability(TOPIC, CRUDV),
            resolveCRUDV(CRUDVRequest, CRUDV).
        
        chk_capability(TOPIC, CRUDV) :-
            capability(TOPIC, CRUDV).
        
        chk_capability(rdf(_), CRUDV) :-              
            chk_capability(rdf, CRUDV).  
        
        chk_capability(rdf(_,_), CRUDV) :-          
        chk_capability(rdf, CRUDV).
        
        chk_capability(rdf(Subject), CRUDV) :-
            capability(rdf(AvailableSubject), CRUDV),
            covered(Subject, AvailableSubject).  
        
        chk_capability(rdf(Subject,Scope), CRUDV) :-
            capability(rdf(AvailableSubject,Scope), CRUDV),
            covered(Subject, AvailableSubject).
        
        chk_capability(rdf(Subject,lexicalization(LANG)), CRUDV) :-
            capability(rdf(AvailableSubject,lexicalization(LANGCOVERAGE)), CRUDV),
            covered(Subject, AvailableSubject),
            resolveLANG(LANG, LANGCOVERAGE).

        chk_capability(rdf(SKOSELEMENT), CRUDV) :-
            capability(rdf(skos), CRUDV),
            vocabulary(SKOSELEMENT, skos).

        chk_capability(rdf(SKOSELEMENT,_), CRUDV) :-
            capability(rdf(skos), CRUDV),
            vocabulary(SKOSELEMENT, skos).

        chk_capability(rdf(ONTOLEXELEMENT), CRUDV) :-
            capability(rdf(ontolex), CRUDV),
            vocabulary(ONTOLEXELEMENT, ontolex).

        chk_capability(rdf(ONTOLEXELEMENT,_), CRUDV) :-
            capability(rdf(ontolex), CRUDV),
            vocabulary(ONTOLEXELEMENT, ontolex).
        
        chk_capability(rdf(_,lexicalization(LANG)), CRUDV) :-
            capability(rdf(lexicalization(LANGCOVERAGE)), CRUDV),
            resolveLANG(LANG, LANGCOVERAGE).
        
        chk_capability(rdf(xLabel(LANG)), CRUDV) :-
            capability(rdf(lexicalization(LANGCOVERAGE)), CRUDV),
            resolveLANG(LANG, LANGCOVERAGE).
        
        chk_capability(rdf(xLabel(LANG),_), CRUDV) :-
            capability(rdf(lexicalization(LANGCOVERAGE)), CRUDV),
            resolveLANG(LANG, LANGCOVERAGE).
        
        chk_capability(rdf(_,lexicalization(_)), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(xLabel(_)), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(xLabel(_),_), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(_,lexicalization), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).

        chk_capability(rdf(_,notes), CRUDV) :-
            capability(rdf(notes), CRUDV).
        
        chk_capability(rdf(xLabel), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(xLabel,_), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).

        chk_capability(rdf(ontolexForm), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(ontolexForm,_), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
            
        chk_capability(rdf(ontolexLexicalEntry), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(ontolexLexicalEntry,_), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(limeLexicon), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
        
        chk_capability(rdf(limeLexicon,_), CRUDV) :-
            capability(rdf(lexicalization), CRUDV).
            
        chk_capability(rdf(_,notes), CRUDV) :-
            capability(rdf(notes), CRUDV).

        chk_capability(rbac(_), CRUDV) :-
            chk_capability(rbac, CRUDV).

        chk_capability(rbac(_,_), CRUDV) :-
            chk_capability(rbac, CRUDV).

        chk_capability(cform(_), CRUDV) :-
            chk_capability(cform, CRUDV).
        
        chk_capability(cform(_,_), CRUDV) :-
            chk_capability(cform, CRUDV).

        resolveCRUDV(CRUDVRequest, CRUDV) :-
            char_subset(CRUDVRequest, CRUDV).

        resolveLANG(LANG, LANGCOVERAGE) :-
            split_string(LANG,",","",LANGList),
            split_string(LANGCOVERAGE,",","",LANGCOVERAGEList),
                subset(LANGList, LANGCOVERAGEList).
        
        
        covered(Subj,resource) :- role(Subj).
        covered(objectProperty, property).
        covered(datatypeProperty, property).
        covered(annotationProperty, property).
        covered(ontologyProperty, property).
        covered(skosOrderedCollection, skosCollection).
        covered(Role, Role).
        
        role(cls).
        role(individual).
        role(property).
        role(objectProperty).
        role(datatypeProperty).
        role(annotationProperty).
        role(ontologyProperty).
        role(ontology).
        role(dataRange).
        role(concept).
        role(conceptScheme).
        role(xLabel).
        role(xLabel(_)).
        role(skosCollection).
        role(skosOrderedCollection).
        role(ontolexForm).
        role(ontolexLexicalEntry).
        role(limeLexicon).
        role(decompComponent).

        vocabulary(concept, skos).
        vocabulary(conceptScheme, skos).
        vocabulary(skosCollection, skos).

        vocabulary(ontolexForm, ontolex).
        vocabulary(ontolexLexicalEntry, ontolex).
        vocabulary(limeLexicon, ontolex).
        vocabulary(decompComponent, ontolex).
        
        getCapabilities(FACTLIST) :- findall(capability(A,CRUD),capability(A,CRUD),FACTLIST).    
        `;

    private static jsPrologSupport = `
        char_subset(A,B) :-
            subset(A,B).

        subset([],_).
 
        subset([H|R],L) :-
            member(H,L),
            subset(R,L).
        
        member(E,[E|_]).
        member(E,[_|T]) :-
        member(E,T).
        `;

}

export enum CRUDEnum {
    C = "C",
    R = "R",
    U = "U",
    D = "D",
    V = "V",
}