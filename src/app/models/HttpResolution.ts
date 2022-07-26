export interface RewritingRule {
    sourceURIRegExp: string;
    format: FormatExt;
    targetURIExp: string;

    //extensions for editor
    testing?: boolean;
    testRuleSource?: string;
    testRuleResult?: {
        entries?: string[], //$0, $1, ...
        groups?: { [key: string]: string },
        output?: string;
        matched?: boolean;
    };
}

export interface InverseRewritingRule {
    sourceRDFresURIregExp: string;
    targetResURIExp: string;
    formatMap?: {[key: string]: string};

    //extensions for editor
    formatMapSupport?: { key: string, value: string }[];
    testing?: boolean;
    testRuleSource?: string;
    testRuleResult?: {
        entries?: string[], //$0, $1, ...
        groups?: { [key: string]: string },
        output?: string;
        format?: string;
        matched?: boolean;
    };
}

export enum FormatExt {
    all = "all",
    alldata = "alldata",
    html = "html",
    jsonld = "jsonld",
    n3 = "n3",
    nt = "nt",
    rdf = "rdf",
    ttl = "ttl"
}

export class HttpResolutionUtils {

    static isValidRegExp(regexp: string): { valid: boolean, message?: string } {
        try {
            new RegExp(regexp);
            return { valid: true };
        } catch (error) {
            let message = "Invalid regular expression\n" + regexp;
            if (error instanceof Error) {
                message = error.message;
            }
            return { valid: false, message: message };
        }
    }
}