/**
 * @type {plugins.http.HttpClientConfig}
 * @properties={typeid:35,uuid:"5CCC5805-34AF-4A4C-B41E-A62628AE15AF",variableType:-4}
 */
 var httpConfig = null;

 /**
 * @properties={typeid:35,uuid:"6E1B0830-BAF7-4DEB-B250-8B8C0676CF6A",variableType:-4}
 */
var logger = scopes.svyLogManager.getLogger('app.bauprocheck.paperless');

 
/**
 * @type {String}
 * @properties={typeid:35,uuid:"F2242839-E941-41FB-86E6-1131873CAF03"}
 */
var paperlessToken = null;

/**
 * @type {String}
 * @properties={typeid:35,uuid:"0D7BB89B-C2B4-4B60-9B69-120251D21F96"}
 */
var paperlessServerUrl = null;

/**
 * @enum
 * @properties={typeid:35,uuid:"52CC73F4-6559-4DCE-9729-5EA7E2CD3E07",variableType:-4}
 */
var ENDPOINTS = {
    "correspondents": "/api/correspondents/",
    "document_types": "/api/document_types/",
    "documents": "/api/documents/",
    "logs": "/api/logs/",
    "tags": "/api/tags/",
    "token": "/api/token/",
    "saved_views": "/api/saved_views/",
    "storage_paths": "/api/storage_paths/",
    "tasks": "/api/tasks/",
    "users": "/api/users/",
    "groups": "/api/groups/",
    "mail_accounts": "/api/mail_accounts/",
    "mail_rules": "/api/mail_rules/",
    "share_links": "/api/share_links/",
    "workflow_triggers": "/api/workflow_triggers/",
    "workflow_actions": "/api/workflow_actions/",
    "workflows": "/api/workflows/",
    "custom_fields": "/api/custom_fields/",
    "config": "/api/config/",
	"document_upload": "/api/documents/post_document/",
	"document_binary": "/documents/"
}

/**
 * @enum
 * @properties={typeid:35,uuid:"4C42E46F-E0ED-4876-9438-55FAF7FB1BDF",variableType:-4}
 */
var FIELDTYPES = {
	'STRING': 'string',
	'URL': 'url',
	'DATE': 'date',
	'BOOLEAN': 'boolean',
	'INTEGER': 'integer',
	'FLOAT': 'float',
	'MONETARY': 'monetary',
	'DOCUMENTLINK': 'documentlink',
	'SELECT': 'select',
	'LONGTEXT': 'longtext'
}

/**
 * @properties={typeid:24,uuid:"A0966F53-91CA-4F39-A233-490FCE9D8D7A"}
 */
function setHTTPConfig() {
	httpConfig = plugins.http.createNewHttpClientConfig();
	httpConfig.forceHttp1 = true;
}

/**
 * @param {String} username
 * @param {String} password
 * @return {String}
 *
 * @properties={typeid:24,uuid:"C39CB83E-8F32-4187-B4AF-E1CD452DF8EE"}
 */
function getPaperlessToken(username, password) {
	if (!username || !password) {
		return null;
	}

	// Neues Token holen
	if (!httpConfig) {
		setHTTPConfig();
	}
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var url = paperlessServerUrl + ENDPOINTS.token;
	var request = httpClient.createPostRequest(url);
	request.addHeader('Content-Type', 'application/json');
	request.setBodyContent(JSON.stringify({
		username: username,
		password: password
	}))
	var response = request.executeRequest();
	httpClient.close();
	if (!response.getResponseBody()) {
		return null;
	}
	var responseObject = JSON.parse(response.getResponseBody());
	if (responseObject && responseObject.hasOwnProperty('token')) {
		logger.debug('User: ' + username + '\n' + 'token: ' + responseObject['token']);
		paperlessToken = responseObject['token'];
	}
	return paperlessToken;
}