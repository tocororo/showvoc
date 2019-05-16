/**
 * IP address/logical host name of the machine hosting Semantic Turkey.
 * By default (variable left unspecified) the host is resolved dynamically by using the same address of the 
 * machine hosting the PMKI portal.
 * Thus if PMKI and Semantic Turkey are running on the same machine this variable can be left commented,
 * otherwise uncomment the line and edit the value.
 */
// var st_host = "127.0.0.1";

/**
 * Port of the container hosting Semantic Turkey.
 * By default (variable left unspecified) the port is resolved dynamically by using the same port of the 
 * container hosting the PMKI portal.
 * Thus if PMKI and Semantic Turkey are running on the same container this variable can be left commented,
 * otherwise uncomment the line and edit the value.
 */
var st_port = "1979";

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
 * container hosting the PMKI portal.
 */
// var st_protocol = "http";

/**
 * By default, PMKI relies on a lurker user created in Semantic Turkey.
 * This is necessary in order to allow PMKI to execute requests to ST that are secured.
 * If no user is logged directly in PMKI, the default "lurker" user should be logged.
 * The following parameters need to be set in order to provide the credentials for this lurker user.
 */
var lurker_user_email = "";
var lurker_user_password = "";