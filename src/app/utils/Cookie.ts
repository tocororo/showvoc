// this class is partially re-using code from the project:
// https://github.com/BCJTI/ng2-cookies

import { Project } from '../models/Project';
import { Value } from '../models/Resources';
import { User } from '../models/User';

export class Cookie {

    public static TRANSLATE_LANG = "translate.lang";

    public static RES_VIEW_INCLUDE_INFERENCE = "resource_view.include_inference";
    public static RES_VIEW_RENDERING = "resource_view.rendering";

    public static SHOW_DEPRECATED = "tree_list.show_deprecated";

    public static SEARCH_STRING_MATCH_MODE = "search.string_match_mode";
    public static SEARCH_USE_URI = "search.use_uri";
    public static SEARCH_USE_LOCAL_NAME = "search.use_local_name";
    public static SEARCH_USE_NOTES = "search.use_notes";
    public static SEARCH_CONCEPT_SCHEME_RESTRICTION = "search.restrict_active_schemes";
    public static SEARCH_CLS_IND_PANEL = "search.cls_ind_panel"; //tells if search classes, individuals or both
    public static SEARCH_LANGUAGES = "search.languages";
    public static SEARCH_RESTRICT_LANG = "search.restrict_lang";
    public static SEARCH_INCLUDE_LOCALES = "search.include_locales";
    public static SEARCH_USE_AUTOMOMPLETION = "search.use_autocompletion";

    public static PROJECT_COLLAPSED_DIRS = "project.collapsed_dirs"; //comma separated names of collapsed directories
    public static PROJECT_VIEW_MODE = "project.view_mode";
    public static PROJECT_FACET_BAG_OF = "project.facet_bag_of";

    public static ALIGNMENT_SEARCH_DATASET_MODE = "alignment.search.dataset_mode";

    public static DATASETS_FACETS_TYPE_KOS = "datasets.facets.type.kos";
    public static DATASETS_FACETS_TYPE_LEXICON = "datasets.facets.type.lexicon";
    public static DATASETS_FACETS_TYPE_ONTOLOGY = "datasets.facets.type.ontology";
    public static DATASETS_FACETS_ONLY_OPEN_PROJECTS = "datasets.facets.only_open_projects";

    public static SEARCH_FILTERS_ONLY_OPEN_PROJECTS = "search.filters.only_open_projects";
    public static SEARCH_FILTERS_LANGUAGES = "search.filters.languages";

    public static EXPLORE_HIDE_WARNING_MODAL_RES_VIEW = "explore.hide_warning_open_modal_res_view";



    public static WARNING_CUSTOM_ROOT = "warnings.ui.tree.cls.customroot";
    public static WARNING_ADMIN_CHANGE_USER_TYPE = "warnings.administration.change_user_type";

    public static getCookie(name: string, project?: Project, user?: User): string {
        if (project) {
            name += ".P." + project.getName();
        }
        if (user) {
            name += ".U." + user.getIri();
        }

        let myWindow: any = window;
        name = myWindow.escape(name);
        let regexp = new RegExp('(?:^' + name + '|;\\s*' + name + ')=(.*?)(?:;|$)', 'g');
        let result = regexp.exec(document.cookie);
        let value = (result === null) ? null : myWindow.unescape(result[1]);
        return value;
    }

    /**
     * Save the Cookie
     * @param name 
     * @param value 
     * @param attrs 
     */
    public static setCookie(name: string, value: any, project?: Project, user?: User, attrs?: CookieAttr) {
        value = this.convertValueToString(value);

        if (value == null) {
            this.deleteCookie(name, project, user);
            return;
        }

        if (project) {
            name += ".P." + project.getName();
        }
        if (user) {
            name += ".U." + user.getIri();
        }

        let myWindow: any = window;
        let cookieStr = myWindow.escape(name) + '=' + myWindow.escape(value) + ';';

        let expires = (attrs && attrs.expires) ? attrs.expires : 365 * 10; //default 10 years
        let dtExpires = new Date(new Date().getTime() + expires * 1000 * 60 * 60 * 24);
        cookieStr += 'expires=' + dtExpires.toUTCString() + ';';

        let path: string = (attrs && attrs.path) ? attrs.path : null;
        if (path) {
            cookieStr += "path=" + path + ";";
        }

        document.cookie = cookieStr;
    }

    /**
     * Removes specified Cookie
     */
    public static deleteCookie(name: string, project?: Project, user?: User) {
        // If the cookie exists
        if (Cookie.getCookie(name, project, user)) {
            Cookie.setCookie(name, '', project, user, { expires: -1 });
        }
    }

    private static convertValueToString(value: any): string {
        let valueAsString: string;
        if (Array.isArray(value)) {
            if (value.length > 0) {
                let stringArray: string[] = [];
                value.forEach((v: any) => {
                    if (v instanceof Value) {
                        stringArray.push((<Value>v).toNT());
                    } else {
                        stringArray.push(v);
                    }
                });
                valueAsString = stringArray.join(",");
            }
        } else if (value instanceof Map) {
            if (value.size > 0) {
                let stringMap: { [key: string]: string } = {};
                value.forEach((v: any, key: string) => {
                    if (v instanceof Value) {
                        stringMap[key] = (<Value>v).toNT();
                    } else {
                        stringMap[key] = v;
                    }
                });
                valueAsString = JSON.stringify(stringMap);
            }
        } else if (value instanceof Value) {
            valueAsString = (<Value>value).toNT();
        } else if (value != null) {
            valueAsString = value;
        }
        return valueAsString;
    }

}


/**
 * Note: path is useful for the translate.lang cookie which if it is set for http://<hostname>/vocbench3 
 * is blocked by the browser for requests toward http://<hostname>/semanticturkey since they have different path
 */
export interface CookieAttr {
    expires?: number;
    path?: string;
}