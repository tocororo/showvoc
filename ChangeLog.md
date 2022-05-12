# Reference to Semantic Turkey Change Log
This changelog is limited to changes brought exclusively to the ShowVoc client application.
The full changelog of the platform includes also changes brought to the Semantic Turkey backend:

https://bitbucket.org/art-uniroma2/semantic-turkey/src/master/ChangeLog.txt

# 2.0.1 (dd-mm-2022)
  *

# 2.0.0 (12-05-2022)
  * Enabled support to SAML authentication
  * Added a metadata summary page for each dataset
  * Added possibility to create downloadable distribution of datasets
  * Added new kind of authorized user: SuperUser. SuperUser create projects and then get the role Project Manager automatically assigned to them
  * Added completion for endpoints to use in "locally federated" (i.e. different repositories on the same GraphDB instance) SPARQL queries
  * Fixed a bug that prevented to automatically change the alphabetic index in Lexical Entry panel after a search
  * Fixed a bug that prevented to show search results in Alignments tab when the target dataset was not available

# 1.2.1 (07-02-2022)
  * Added the possibility to edit credentials for accessing a remote repo
  * Preserved hideNav param when selecting an alignment in Alignments tab
  * Fixed bug when creating dataset and not changing the configuration through the combo-box: in that case no configuration
    was sent (instead of the default one on the combobox: GraphDBFree) and native-store was set instead
  * Added the count of hidden results in Search page

# 1.2.0 (26-01-2022)
  * Added possibility to create multiple administrators
  * Made dialogs draggable
  * Added localization for Spanish, thanks to Juan Antonio Pastor Sanchez for the contribution!
  * Added Manchester Syntax highlighting in resource view
  * Added possibility to hide the dataset name in the Dataset view through the URL parameter "hideDatasetName"

# 1.1.1 (28-10-2021)
  * Added localization for French, thanks to Nathalie Vedovotto for the contribution!
  * Fixed a bug that broke any download link
  * Fixed a bug that caused an error when administrator tries to edit project settings
  * Minor bugfixes

# 1.0.1 (21-09-2021)
  * Added possibility to hide the top navigation bar to visitor users through the URL parameter "hideNav"
  * Added app logo and favicon
  * Minor bugfixes and improvements

# 1.0.0 (02-08-2021)
  * Enabled deletion of remote repositories referred by a deleted dataset
  * Improved management of Remote Repository configurations
  * Added possibility to clear dataset data
  * Introduced project facets
  * Converted alignments list to a tree
  * Implemented search in alignments
  * Enabled possibility to customize ShowVoc instance name
  * Enabled possibility to deactivate users contributions
  * Adopted the new Settings services
  * Added german l10n, thanks to Roland Wingerter for the contribution!
  * Fixed missing error message in case of exception during the project creation
  * Updated the settings rendering widgets to deal with non-backward compatible changes in their representation returned by the server
  * Updated Angular cli to version 10.2.0 and Angular version to ^10.2.2
  * Updated ng-bootstrap dependency to version 7.0.0

<em>Note: Since the project has been renamed from PMKI to ShowVoc, the version numbering has restarted from 1.0.0</em>

# 1.0.0 (31-07-2020)
  * First release of the system