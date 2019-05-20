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

    public static DATASETS_FACETS_TYPE_KOS = "datasets.facets.type.kos";
    public static DATASETS_FACETS_TYPE_LEXICON = "datasets.facets.type.lexicon";
    public static DATASETS_FACETS_ONLY_OPEN_PROJECTS = "datasets.facets.only_open_projects";

    public static SEARCH_FILTERS_ONLY_OPEN_PROJECTS = "search.filters.only_open_projects";

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
        return (result === null) ? null : myWindow.unescape(result[1]);
    }

	/**
	 * Save the Cookie
	 * @param  {string} name Cookie's identification
	 * @param  {string} value Cookie's value
	 * @param  {number} expires Cookie's expiration date in days from now. If it's undefined the cookie is a session Cookie
	 * @param  {string} userIri IRI of the user useful to contextualize the cookie
	 */
    public static setCookie(name: string, value: string, expires?: number, userIri?: string) {
        if (userIri) {
            name += ":" + userIri;
        }
        let myWindow: any = window;
        let cookieStr = myWindow.escape(name) + '=' + myWindow.escape(value) + ';';

        if (expires) {
            let dtExpires = new Date(new Date().getTime() + expires * 1000 * 60 * 60 * 24);
            cookieStr += 'expires=' + dtExpires.toUTCString() + ';';
        }
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