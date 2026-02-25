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
 * @type {Map<>}
 * @properties={typeid:35,uuid:"67CD32C1-8820-4E16-A649-89AE68CC99E9",variableType:-4}
 */
var paperlessProjekt = new Map();


/**
 * @type {Map<>}
 * @properties={typeid:35,uuid:"1CF14A4F-8C76-4D2E-A8D9-C225DE3C3E46",variableType:-4}
 */
var paperlessProjektIds = new Map();


/**
 * @type {Map<>}
 * @properties={typeid:35,uuid:"5396A397-79D4-423D-9BA3-5A3006677EFC",variableType:-4}
 */
var customFieldsPaperlessValues = new Map();

/**
* @type {Map<>}
*
 * @properties={typeid:35,uuid:"65997DC3-E334-40C1-8E48-42A7A2815C11",variableType:-4}
 */
var customFieldsPaperless = new Map();

/**
* @type {Map<>}
*
 * @properties={typeid:35,uuid:"A0BC5A5B-A059-4462-880C-D2F067E929C0",variableType:-4}
 */
var customFieldsPaperlessId = new Map();

/**
 * @properties={typeid:24,uuid:"A0966F53-91CA-4F39-A233-490FCE9D8D7A"}
 */
function setHTTPConfig() {
	httpConfig = plugins.http.createNewHttpClientConfig();
	httpConfig.forceHttp1 = true;
}

/**
 * initialize URL and token
 * @properties={typeid:24,uuid:"A7D285F2-8654-4AB5-8121-7EECF0F67C59"}
 */
function onSolutionOpen() {
	var token = application.getUserProperty('PaperlessToken');
	var url = application.getUserProperty('PaperlessURL');
	if (token) {
		paperlessToken = token
	}
	if (url) {
		paperlessServerUrl = url
	}
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
	application.setUserProperty('PaperlessToken', paperlessToken);
	application.setUserProperty('PaperlessURL', paperlessServerUrl);

	return paperlessToken;
}

/**
 * @properties={typeid:24,uuid:"1D98F516-3209-4904-8ED9-12952643BEC6"}
 */
function downloadDocumentList() {
	if (!httpConfig) {
		setHTTPConfig();
	}
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	downloadCustomFieldsPaperless();
	var url = paperlessServerUrl + ENDPOINTS.documents;
	var request = httpClient.createGetRequest(url);
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	var response = getResponse(request);
	if (response) {
		var numDocument = 0 
		var fsPaperless = datasources.mem.paperless_documents.getFoundSet();
		fsPaperless.deleteAllRecords();
		var nextURL = null;
		do {
			var responseObject = JSON.parse(response);
			if (responseObject.hasOwnProperty('next')) {
				nextURL = responseObject['next'];
			}
			if (responseObject.hasOwnProperty('count') && responseObject['count'] != 0 && responseObject.hasOwnProperty('results')) {
				var documents = responseObject['results']
				for (var iDocs = 0; iDocs < documents.length; iDocs++) {
					numDocument++
					var recordPaperless = fsPaperless.getRecord(fsPaperless.newRecord());
					recordPaperless.filename = documents[iDocs]['original_file_name'];
					recordPaperless.title = documents[iDocs]['title'];
					recordPaperless.content = documents[iDocs]['content'];
					recordPaperless.bytes = fetchDocument(documents[iDocs]['id']);
					if (documents[iDocs].hasOwnProperty('custom_fields')) {
						// custom fields - create info
						recordPaperless.custom_fields = parseCustomFields(documents[iDocs]['custom_fields'])
					}
					databaseManager.saveData(recordPaperless);
				}
			}
			if (nextURL) {
				request = httpClient.createGetRequest(nextURL);
				request.addHeader('Authorization', 'Token ' + paperlessToken);
				response = getResponse(request);
				if (!response) {
					nextURL = null;
				}
			}
		} while (nextURL);
	}
	httpClient.close();
	logger.debug('fetched ' + numDocument.toString() + ' documents.');
}

/**
 * extracts custom fields for a document in a readable format
 * @param {Array<{value: String, field: Number}>} listFields  
 * @return {String}
 * @properties={typeid:24,uuid:"76748D98-BD41-4C26-AD13-D7B5D4B7608E"}
 */
function parseCustomFields(listFields) {
	if (!listFields && !listFields.length) {
		return null;
	}
	var fieldInfoList = [];
	for (var iFields = 0; iFields < listFields.length; iFields++) {
		var fieldInfo = '';
		/** @type {{value: String, field: Number}} */
		var fieldObject = listFields[iFields];
		if (fieldObject.hasOwnProperty('field') && fieldObject['field'] && customFieldsPaperlessId.has(fieldObject['field'])) {
			fieldInfo += customFieldsPaperlessId.get(fieldObject['field']) + ': ';
		}
		if (fieldObject.hasOwnProperty('value') && fieldObject['value'] && customFieldsPaperlessValues.has(fieldObject['value'])) {
			fieldInfo += customFieldsPaperlessValues.get(fieldObject['value']);
		}
		fieldInfoList.push(fieldInfo);
	}
	return fieldInfoList.join('\n');
}

/**
 * @param {Number} documentId
 * @return {Array<byte>}
 * @properties={typeid:24,uuid:"3AFA94B7-3E58-4136-9537-5804EB49987E"}
 */
function fetchDocument(documentId) {
	if (!httpConfig) {
		setHTTPConfig();
	}
	if (!documentId) {
		return null;
	}
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var url = paperlessServerUrl + ENDPOINTS.documents + documentId.toString() + '/download/';
	logger.debug(url);
	var request = httpClient.createGetRequest(url);
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	var response = request.executeRequest();
	httpClient.close();
	var statusCode = response.getStatusCode();
	if (statusCode != 200) {
		logger.error('konnte Dokumente nicht laden: ' + statusCode + ' - ' + response.getResponseBody());
		return null;
	}

	var bytes = response.getMediaData();
	return bytes;
}

/**
 * @param {plugins.http.PostRequest|plugins.http.GetRequest|plugins.http.PutRequest|plugins.http.DeleteRequest|plugins.http.PatchRequest} request
 * @private
 * @return {String}
 *
 * @properties={typeid:24,uuid:"AB99E735-FEAE-49CA-8A1E-EE8A5415B229"}
 */
function getResponse(request) {
	var response = request.executeRequest();

	var statusCode = response.getStatusCode();
	if (statusCode >= 200 && statusCode< 300) {
		var responseBody = response.getResponseBody();
		var tmpBytes = new java.lang.String(responseBody).getBytes("ISO-8859-1");
		responseBody = new java.lang.String(tmpBytes, 'UTF-8').toString();
		if (!responseBody) {
			//			logger.error('Error executing request: received no data');
			return null;
		}
		responseBody = responseBody.replace(/(?:\\[r]|[\r]+)+/g, '\\n')
		return responseBody;
	} else {
		logger.error('Request error ' + statusCode + ': ' + response.getResponseBody());
		return null;
	}
}

/**
 * @properties={typeid:24,uuid:"7E968186-184F-4254-8D80-6C7273A69309"}
 */
function downloadCustomFieldsPaperless() {
	if (!httpConfig) {
		setHTTPConfig();
	}
	// Fields without select values, only get ids
	var ignoreFields = ['interne Notiz', 'Bezeichnung', 'Langtext', 'Achse', 'Erfasst', 'Erledigt am', 'Erledigen bis']
	var processFields = ['Projekt']
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var url = paperlessServerUrl + ENDPOINTS.custom_fields;
	var request = httpClient.createGetRequest(url);
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	var response = getResponse(request);

	if (response) {
		var fsCustomFields = datasources.mem.paperless_custom_fields.getFoundSet();
		fsCustomFields.deleteAllRecords();
		var fsCustomFieldValues = datasources.mem.paperless_custom_field_values.getFoundSet();
		fsCustomFieldValues.deleteAllRecords();
		customFieldsPaperlessValues = new Map();
		customFieldsPaperless = new Map();
		var nextURL = null;
		do {
			var responseObject = JSON.parse(response);
			if (responseObject.hasOwnProperty('next')) {
				nextURL = responseObject['next'];
			}
			if (responseObject.hasOwnProperty('count') && responseObject['count'] != 0 && responseObject.hasOwnProperty('results')) {
				var customFields = responseObject['results']
				customFieldsPaperless = new Map();
				customFieldsPaperlessId = new Map();
				for (var iCustom = 0; iCustom < customFields.length; iCustom++) {
					var nameField = customFields[iCustom].name
					var recordField = fsCustomFields.getRecord(fsCustomFields.newRecord());
					recordField.name = customFields[iCustom].name;
					recordField.id = customFields[iCustom].id;
					customFieldsPaperless.set(nameField, customFields[iCustom].id)
					customFieldsPaperlessId.set(customFields[iCustom].id, nameField)

					if (ignoreFields.includes(nameField)) {
						continue;
					}
					// createCustomFieldMap(customFields[iCustom]);
					var variableName = 'paperless' + nameField.replace('ä', 'ae');
					var variableNameId = 'paperless' + nameField.replace('ä', 'ae') + 'Ids';
					scopes.paperless[variableName] = new Map();
					scopes.paperless[variableNameId] = new Map();
					if (!customFields[iCustom].hasOwnProperty('extra_data')) {
						continue;
					}
					var extraData = customFields[iCustom]['extra_data'];
					if (!extraData || !extraData.hasOwnProperty('select_options')) {
						continue;
					}
					recordField.extra_data = JSON.stringify(extraData);
					/** @type Array<{id: String, label:String}>  */
					var selectOptions = extraData['select_options'];
					for (var iProcess = 0; iProcess < selectOptions.length; iProcess++) {
						var recordFieldValues = fsCustomFieldValues.getRecord(fsCustomFieldValues.newRecord());
						recordFieldValues.paperless_field_id = recordField.id;
						recordFieldValues.label = selectOptions[iProcess].label;
						recordFieldValues.id = selectOptions[iProcess].id;
						if (!customFieldsPaperlessValues.has(selectOptions[iProcess].id)) {
							customFieldsPaperlessValues.set(selectOptions[iProcess].id, selectOptions[iProcess].label);
						}
						if (nameField == 'Projekt') {
							if (!scopes.paperless[variableName].has(selectOptions[iProcess].label)) {
								scopes.paperless[variableName].set(selectOptions[iProcess].label, selectOptions[iProcess].id);
							}
							if (!scopes.paperless[variableNameId].has(selectOptions[iProcess].id)) {
								scopes.paperless[variableNameId].set(selectOptions[iProcess].id, selectOptions[iProcess].label);
							}
						}
					}
					databaseManager.saveData(fsCustomFields);
					databaseManager.saveData(fsCustomFieldValues);
				}
			}
			if (nextURL) {
				request = httpClient.createGetRequest(nextURL);
				request.addHeader('Authorization', 'Token ' + paperlessToken);
				response = getResponse(request);
				if (!response) {
					nextURL = null;
				}
			}
		} while (nextURL);
	}
	httpClient.close();
}


