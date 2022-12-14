/**
 * IP address/logical host name of the machine hosting Semantic Turkey.
 * By default (variable left unspecified) the host is resolved dynamically by using the same address of the 
 * machine hosting ShowVoc.
 * Thus if ShowVoc and Semantic Turkey are running on the same machine this variable can be left commented,
 * otherwise uncomment the line and edit the value.
 */
var st_host = "semanticturkey.sceiba.cu";

/**
 * Port of the container hosting Semantic Turkey.
 * By default (variable left unspecified) the port is resolved dynamically by using the same port of the 
 * container hosting ShowVoc.
 * Thus if ShowVoc and Semantic Turkey are running on the same container this variable can be left commented,
 * otherwise uncomment the line and edit the value.
 */
// var st_port = "433";

/**   
 * Path where SemanticTurkey server is listening. If omitted, the sole host is considered.
 * Please note that the path of Semantic Turkey services is defined as in:
 *  http://semanticturkey.uniroma2.it/doc/user/web_api.jsf#services_address_structure
 *  This additional path information is considered to be the starting part of the path described above, 
 *  and is usually necessary in case Semantic Turkey is installed behind a proxy redirecting the ST URL.
 */ 
var st_path;

/**
 * Protocol - either http or https.
 * By default (variable left unspecified) the protocol is resolved dynamically by using the same one of the
 * container hosting ShowVoc.
 */
var st_protocol = "https";

/**
 * A custom name for the current ShowVoc instance. 
 * If provided, the instance name will be visible in the Home and Datasets page.
 */
var showvoc_instance_name = "Sceiba Vocabularios";

/**
 * A list of l10n supported languages in addition to those already factory provided.
 * In order to add the support for a language you need to add the <langTag>.json translation file to
 * the folder assets/l10n and then add the same langTag to the following list
 */
var additional_l10n_langs = [];