// this class is partially re-using code from the project:
// https://github.com/BCJTI/ng2-cookies

export class Cookie {

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

    public static DATASETS_FACETS_TYPE_KOS = "datasets.facets.type.kos";
    public static DATASETS_FACETS_TYPE_LEXICON = "datasets.facets.type.lexicon";
    public static DATASETS_FACETS_ONLY_OPEN_PROJECTS = "datasets.facets.only_open_projects";

    public static SEARCH_FILTERS_ONLY_OPEN_PROJECTS = "search.filters.only_open_projects";
    public static SEARCH_FILTERS_LANGUAGES = "search.filters.languages";

    public static EXPLORE_HIDE_WARNING_MODAL_RES_VIEW = "explore.hide_warning_open_modal_res_view";

	/**
	 * Retrieves a single cookie by it's name
	 * @param  {string} name Identification of the Cookie
	 * @param  {string} userIri IRI of the user useful to contextualize the cookie
	 * @returns The Cookie's value 
	 */
    public static getCookie(name: string, userIri?: string): string {
        if (userIri) {
            name += ":" + userIri;
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
	 * @param  {string} name Cookie's identification
	 * @param  {string} value Cookie's value
	 * @param  {number} expires Cookie's expiration date in days from now. If it's undefined the cookie has a duration of 10 years
	 * @param  {string} userIri IRI of the user useful to contextualize the cookie
	 */
    public static setCookie(name: string, value: string, expires?: number, userIri?: string) {
        if (value == null) {
            this.deleteCookie(name, userIri);
            return;
        }
        if (userIri) {
            name += ":" + userIri;
        }
        let myWindow: any = window;
        let cookieStr = myWindow.escape(name) + '=' + myWindow.escape(value) + ';';

        if (!expires) {
            expires = 365*10;
        }
        let dtExpires = new Date(new Date().getTime() + expires * 1000 * 60 * 60 * 24);
        cookieStr += 'expires=' + dtExpires.toUTCString() + ';';
        document.cookie = cookieStr;
    }

	/**
	 * Removes specified Cookie
	 * @param  {string} name Cookie's identification
	 * @param  {string} userIri IRI of the user useful to contextualize the cookie
	 */
    public static deleteCookie(name: string, userIri?: string) {
        // If the cookie exists
        if (Cookie.getCookie(name)) {
            Cookie.setCookie(name, '', -1, userIri);
        }
    }

}