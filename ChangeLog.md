# Reference to Semantic Turkey Change Log
This changelog is limited to changes brought exclusively to the ShowVoc client application.
The full changelog of the platform includes also changes brought to the Semantic Turkey backend:

https://bitbucket.org/art-uniroma2/semantic-turkey/src/master/ChangeLog.txt

# 2.3.1 (dd-mm-202y)
  * Added an interface for Translation API
  * Fixed bug that prevented to access Data page and to focus resources through direct links
  * Fixed a bug that prevented to customize the class tree root
  * Added missing translations

# 2.3.0 (28-10-2022)
  * Added possibility to insert custom content into the home page blank section
  * Enabled visualization of ordered collection members in ResourceView
  * Resolved issues in Data page when dataset name is too long
  * Fixed a bug that prevented to delete files uploaded in distributions panel
  * Fixed minor UI issues

# 2.2.1 (19-10-2022)
  * Minor changes

# 2.2.0 (27-09-2022)
  * Added model-oriented graph and class-diagram (uml-like)
  * Implemented the facet-based visualization of datasets
  * Implemented MetadataRegistry
  * Introduced Customizable Reports for internal users
  * Introduced Custom Services for internal users
  * Implemented Custom Search
  * Implemented storage of SPARQL queries (for authenticated user only)
  * Added parameterized SPARQL queries (for authenticated user only)
  * Added statistical charts in Metadata page
  * Implemented support for HTTP resolution and content-negotiation
  * Fixed performances issues by replacing usage setTimeout() with ChangeDetectorRef#detectChanges(). Thanks to Saku Seppälä for the contribution!

# 2.1.0 (23-06-2022)
  * Changed default Dataset landing tab from metadata to data
  * fixed resources resolution and alignment bugs linked to issues in the MDR
  * Fixed authorization issues for SuperUser
  * Minor changes and bugfixes

# 2.0.0 (12-05-2022)
  * Enabled support to SAML authentication
  * Added a metadata summary page for each dataset
  * Added possibility to create downloadable distribution of datasets
  * Added new kind of authorized user: SuperUser. SuperUser create projects and then get the role Project Manager automatically assigned to them
  * Added completion for endpoints to use in "locally federated" (i.e. different repositories on the same GraphDB instance) SPARQL queries
  * Added advanced search
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