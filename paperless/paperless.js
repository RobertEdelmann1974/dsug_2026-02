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
 * @type {Map<>}
 * @properties={typeid:35,uuid:"7A704705-E827-4425-B60A-5D312527699A",variableType:-4}
 */
var tags = new Map()

/**
 * @type {Map<>}
 *
 * @properties={typeid:35,uuid:"FFAB1870-8F44-4AE1-AF05-CA99AE24BE68",variableType:-4}
 */
var tagsId = new Map()

/**
 * @type {Map<>}
 * @properties={typeid:35,uuid:"C3FBA9AC-C282-44E8-B003-91C30D3C31ED",variableType:-4}
 */
var correspondents = new Map()

/**
 * @type {Map<>}
 *
 * @properties={typeid:35,uuid:"8E87F32D-C1E9-486D-A178-C20E969BF602",variableType:-4}
 */
var correspondentsId = new Map()

/**
 * @type {Map<>}
 * @properties={typeid:35,uuid:"10FBB206-D2B2-45E6-829F-1FFA2D5C3926",variableType:-4}
 */
var documenttypes = new Map()

/**
 * @type {Map<>}
 *
 * @properties={typeid:35,uuid:"B353FD77-A7DC-4434-B0A8-191B055426D5",variableType:-4}
 */
var documenttypesId = new Map()


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

/**
 * @properties={typeid:24,uuid:"CA6782B5-A341-456A-8640-F3E0A2EB1D8F"}
 */
function uploadAllCorrespondets() {
	downloadCorrespondents();
	var fsFirmen = datasources.mem.correspondents.getFoundSet();
	fsFirmen.loadAllRecords();
	var recordFirmen;
	for (var iFirmen = 1; iFirmen <= fsFirmen.getSize(); iFirmen++) {
		recordFirmen = fsFirmen.getRecord(iFirmen)
		if (correspondents.has(recordFirmen.name + ', ' + recordFirmen.city)) {
			continue;
		}
		uploadCorrespondet(recordFirmen.name + ', ' + recordFirmen.city);
	}
}


/**
 * upload correspondent to paperless
 * @param {String} firmenName
 *
 * @properties={typeid:24,uuid:"841D00B8-AFEE-420C-97EE-E2368CD5A03A"}
 */
function uploadCorrespondet(firmenName) {
	if (!firmenName) {
		return;
	}
	if (!httpConfig) {
		setHTTPConfig();
	}
	var objectCorrespondent = {
	    "name": firmenName,
	    "match": firmenName,
	    "matching_algorithm": 6,
	    "is_insensitive": true,
	    "owner": null,
	    "set_permissions": {}
	};
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var url = paperlessServerUrl + ENDPOINTS.correspondents;
	var request = httpClient.createPostRequest(url);
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	request.addHeader('Content-Type', 'application/json');
	request.setBodyContent(JSON.stringify(objectCorrespondent));
	var response = getResponse(request);
	httpClient.close();
	if (!response) {
		return;
	}
	var responseObject = JSON.parse(response);
	if (responseObject && responseObject.hasOwnProperty('id')) {
		/** @type {Number} */
		var id = responseObject['id'];
		correspondents.set(objectCorrespondent.name,id);
		correspondentsId.set(id, objectCorrespondent.name);
//		logger.debug('corespondent mit id: ' + id.toString() + ' erstellt.');
	}
}

/**
 * @properties={typeid:24,uuid:"20CC41B9-1F8D-4D9B-B8C0-B1E769339DD6"}
 */
function downloadCorrespondents() {
	if (!httpConfig) {
		setHTTPConfig();
	}
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var url = paperlessServerUrl + ENDPOINTS.correspondents;
	var request = httpClient.createGetRequest(url);
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	var response = getResponse(request);
	if (response) {
		correspondents = new Map();
		correspondentsId = new Map();
		var nextURL = null;
		do {
			var responseObject = JSON.parse(response);
			if (responseObject.hasOwnProperty('next')) {
				nextURL = responseObject['next'];
			}
			if (responseObject.hasOwnProperty('count') && responseObject['count'] != 0 && responseObject.hasOwnProperty('results')) {
				/** @type {Array<{id: Number, slug: String, name: String}>} */
				var correspondentObject = responseObject['results']
				for (var iCorr = 0; iCorr < correspondentObject.length; iCorr++) {
					correspondents.set(correspondentObject[iCorr].name, correspondentObject[iCorr].id)
					correspondentsId.set(correspondentObject[iCorr].id, correspondentObject[iCorr].name)
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

/**
 * @properties={typeid:24,uuid:"C756D133-7987-436C-91E4-2A23C7199B70"}
 */
function downloadTags() {
	if (!httpConfig) {
		setHTTPConfig();
	}
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var url = paperlessServerUrl + ENDPOINTS.tags;
	var request = httpClient.createGetRequest(url);
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	var response = getResponse(request);
	if (response) {
		tags = new Map();
		tagsId = new Map();
		var nextURL = null;
		do {
			var responseObject = JSON.parse(response);
			if (responseObject.hasOwnProperty('next')) {
				nextURL = responseObject['next'];
			}
			if (responseObject.hasOwnProperty('count') && responseObject['count'] != 0 && responseObject.hasOwnProperty('results')) {
				/** @type {Array<{id: Number, slug: String, name: String}>} */
				var tagsObject = responseObject['results']
				for (var iTags = 0; iTags < tagsObject.length; iTags++) {
					tags.set(tagsObject[iTags].name, tagsObject[iTags].id)
					tagsId.set(tagsObject[iTags].id, tagsObject[iTags].name)
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

/**
 * @properties={typeid:24,uuid:"9BDFE34D-A849-4294-ABF0-CF3A2315C5F8"}
 */
function downloadDocTypes() {
	if (!httpConfig) {
		setHTTPConfig();
	}
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var url = paperlessServerUrl + ENDPOINTS.document_types;
	var request = httpClient.createGetRequest(url);
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	var response = getResponse(request);
	if (response) {
		documenttypes =  new Map();
		documenttypesId =  new Map();
		var nextURL = null;
		do {
			var responseObject = JSON.parse(response);
			if (responseObject.hasOwnProperty('next')) {
				nextURL = responseObject['next'];
			}
			if (responseObject.hasOwnProperty('count') && responseObject['count'] != 0 && responseObject.hasOwnProperty('results')) {
				/** @type {Array<{id: Number, slug: String, name: String}>} */
				var documenttypesObject = responseObject['results']
				for (var iDocType = 0; iDocType < documenttypesObject.length; iDocType++) {
					documenttypes.set(documenttypesObject[iDocType].name, documenttypesObject[iDocType].id)
					documenttypesId.set(documenttypesObject[iDocType].id, documenttypesObject[iDocType].name)
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

/**
 * @properties={typeid:24,uuid:"2E5263C1-B936-4618-AC8E-FC4453305260"}
 */
function createData() {
	var fsCorrespondents = datasources.mem.correspondents.getFoundSet();
	fsCorrespondents.deleteAllRecords();
	var fsTags = datasources.mem.tags.getFoundSet();
	fsTags.deleteAllRecords();
	var fsDocTypes = datasources.mem.document_types.getFoundSet();
	fsDocTypes.deleteAllRecords();

	var listCorrespondents = [{ name: 'Maier GmbH', city: 'Stuttgart', correspondents_id: 1 }, { name: 'Müller & Co.', city: 'München', correspondents_id: 2 }, { name: 'Schmidt AG', city: 'Zürich', correspondents_id: 3 }]
	for (var i = 0; i < listCorrespondents.length; i++) {
		var recCorr = fsCorrespondents.getRecord(fsCorrespondents.newRecord());
		recCorr.name = listCorrespondents[i].name;
		recCorr.city = listCorrespondents[i].city;
		recCorr.correspondents_id = listCorrespondents[i].id;
		databaseManager.saveData(recCorr);
	}
	var listTags = [
		{ name: '🔥🔥🔥', colour: '#26089c', tags_id: 1 },
		{ name: '☠️☠️☠️', colour: '#26089c', tags_id: 2 },
		{ name: '⭐', colour: '#26089c', tags_id: 3 },
		{ name: '⭐⭐', colour: '#26089c', tags_id: 4 },
		{ name: '⭐⭐⭐', colour: '#26089c', tags_id: 5 }
	];
	for (var iTags = 0; iTags < listTags.length; iTags++) {
		var recTags = fsTags.getRecord(fsTags.newRecord());
		recTags.colour = listTags[iTags].colour;
		recTags.name = listTags[iTags].name;
		recTags.tags_id = listTags[iTags].tags_id;
		databaseManager.saveData(recTags);
	}
	var listDocTypes = [
		{ name: 'formal letter', document_types_id: 1 },
		{ name: 'calculation', document_types_id: 2 },
		{ name: 'information', document_types_id: 3 }
	];
	for (var iDocType = 0; iDocType < listDocTypes.length; iDocType++) {
		var recDocType = fsDocTypes.getRecord(fsDocTypes.newRecord());
		recDocType.name = listDocTypes[iDocType].name;
		recDocType.document_types_id = listDocTypes[iDocType].document_types_id;
		databaseManager.saveData(recDocType);
	}
}

/**
 * @properties={typeid:24,uuid:"63285198-4F78-410E-9CF3-8A529824CEC8"}
 */
function createDocuments() {
	var fsDocuments = datasources.mem.documents.getFoundSet();
	fsDocuments.deleteAllRecords();

	var recDocs= fsDocuments.getRecord(fsDocuments.newRecord());
	recDocs.document_name = 'Document 01';
	recDocs.document_description = 'new important Document - Document 01';
	recDocs.document_filename = 'Document_01.pdf';
	var file = plugins.file.convertToRemoteJSFile('/Users/robertedelmann/git/dsug_2026-02/paperless/medias/Document_01.pdf');
	if (file && file.getBytes()) {
		recDocs.document_binary = file.getBytes();
	}
//	recDocs.document_binary = plugins.http.getMediaData("media:///Document_01.pdf");
	recDocs.correspondents_id = 1;
	recDocs.document_types_id = 1;
	recDocs.tags_id = 1;
	recDocs= fsDocuments.getRecord(fsDocuments.newRecord());
	recDocs.document_name = 'Document 02';
	recDocs.document_description = 'new important Document - Document 02';
	recDocs.document_filename = 'Document_02.pdf';
	var file = plugins.file.convertToRemoteJSFile('/Users/robertedelmann/git/dsug_2026-02/paperless/medias/Document_02.pdf');
	if (file && file.exists()) {
		recDocs.document_binary = file.getBytes();
	}
//	recDocs.document_binary = plugins.http.getMediaData("media:///Document_02.pdf");
	recDocs.correspondents_id = 2;
	recDocs.document_types_id = 2;
	recDocs.tags_id = 2;
	databaseManager.saveData(fsDocuments);
	recDocs= fsDocuments.getRecord(fsDocuments.newRecord());
	recDocs.document_name = 'Document 03';
	recDocs.document_description = 'new important Document - Document 03';
	recDocs.document_filename = 'Document_03.pdf';
	var file = plugins.file.convertToRemoteJSFile('/Users/robertedelmann/git/dsug_2026-02/paperless/medias/Document_02.pdf');
	if (file && file.exists()) {
		recDocs.document_binary = file.getBytes();
	}
//	recDocs.document_binary = plugins.http.getMediaData("media:///Document_03.pdf");
	recDocs.correspondents_id = 3;
	recDocs.document_types_id = 3;
	recDocs.tags_id = 3;
	databaseManager.saveData(fsDocuments);
}

/**
 * @properties={typeid:24,uuid:"F0C76EA2-F542-49D0-AF1B-80429426907D"}
 */
function downloadMasterData() {
	downloadCorrespondents();
	downloadCustomFieldsPaperless();
	downloadDocTypes()
	downloadTags();
}

/**
 * @properties={typeid:24,uuid:"4FC05E5C-221D-46DB-9FD0-C256AC0DB0C4"}
 */
function uploadMasterData() {
	downloadMasterData();
	uploadAllCorrespondets();
	uploadAllTags();
	uploadAllDocumentTypes();
}

/**
 * @properties={typeid:24,uuid:"5D329390-87F4-44F9-921C-137054D873D5"}
 */
function uploadAllTags() {
	var fsTags = datasources.mem.tags.getFoundSet();
	fsTags.loadAllRecords();
	for (var iTags = 1; iTags <= fsTags.getSize(); iTags++) {
		var recordTag = fsTags.getRecord(iTags);
		if (tags.has(recordTag.name)) {
			continue;
		}
		uploadTag(recordTag.name, recordTag.colour);
	}
}

/**
 * upload tag to paperless
 * @param {String} name
 * @param {String} colour
 * @properties={typeid:24,uuid:"113DC48D-3669-449B-B32E-83589650C1DC"}
 */
function uploadTag(name, colour) {
	if (!httpConfig) {
		setHTTPConfig();
	}

	/**
	 * @param {String} name
	 * @param {String} colour
	 * @return {Object}
	 * @properties={typeid:24,uuid:"E2DF7587-3BF6-41CD-A74E-FCC9EB322A31"}
	 */
	function getObjectTag(name, colour) {
		if (!name) {
			return null
		}
		var hexColor = "#7ad8dd";
		if (colour) {
			hexColor = colour;
		}
		return objectTag = {
		    "name": name,
		    "color": hexColor,
		    "match": name,
		    "matching_algorithm": 6,
		    "is_insensitive": true,
		    "is_inbox_tag": false,
		    "owner": null,
		    "set_permissions": {}
		};
	}

	var objectTag = getObjectTag(name, colour);
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var url = paperlessServerUrl + ENDPOINTS.tags;
	var request = httpClient.createPostRequest(url);
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	request.addHeader('Content-Type', 'application/json');
	request.setBodyContent(JSON.stringify(objectTag));
	var response = getResponse(request);
	httpClient.close();
	if (!response) {
		return;
	}
	var responseObject = JSON.parse(response);
	if (responseObject && responseObject.hasOwnProperty('id')) {
		/** @type {Number} */
		var id = responseObject['id'];
		tags.set(name,id);
		tagsId.set(id, name);
	}
}

/**
 * @properties={typeid:24,uuid:"2D0E8D7B-CD9C-4818-BE4E-3A4BCB20E303"}
 */
function uploadAllDocumentTypes() {
	var fsDokumentTypen = datasources.mem.document_types.getFoundSet();
	fsDokumentTypen.loadAllRecords();
	for (var iDT = 1; iDT <= fsDokumentTypen.getSize(); iDT++) {
		var recordDokumentTyp = fsDokumentTypen.getRecord(iDT);
		if (documenttypes.has(recordDokumentTyp.name)) {
			continue;
		}
		uploadDocumentType(recordDokumentTyp.name);
	}
}

/**
 * upload DocumentType to paperless
 * @param {String} bezeichnung
 * @return {Number} id of created document type
 *
 * @properties={typeid:24,uuid:"B60E0A2A-921F-4BFD-810B-EF19B256B493"}
 */
function uploadDocumentType(bezeichnung) {
	if (!bezeichnung) {
		return null;
	}
	if (!httpConfig) {
		setHTTPConfig();
	}
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var url = paperlessServerUrl + ENDPOINTS.document_types;
	var request = httpClient.createPostRequest(url);
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	request.addHeader('Content-Type', 'application/json');
	request.setBodyContent(JSON.stringify({
		"name": bezeichnung,
		"match": bezeichnung,
		"matching_algorithm": 6,
		"is_insensitive": false,
		"owner": null,
		"set_permissions": { }
	}));

	var response = getResponse(request);
	httpClient.close();
	if (!response) {
		return null;
	}
	var responseObject = JSON.parse(response);
	if (responseObject && responseObject.hasOwnProperty('id')) {
		/** @type {Number} */
		var id = responseObject['id'];
		logger.info('DocumentType mit id: ' + id.toString() + ' erstellt.');
		documenttypes.set(bezeichnung, id);
		documenttypesId.set(id, bezeichnung);
		return id;
	}
	return null;
}

/**
 * checks if a custom field with the name exists,
 * if not creates a field with the given name + the given type.
 * if no type is given "string" is used as a default
 *
 * @param {String} fieldName name of field to be shown in paperless
 * @param {String} [fieldType] name of field to be shown in paperless
 *
 * @properties={typeid:24,uuid:"20DEA520-837D-416C-8BA5-337495C5BAE8"}
 */
function uploadCustomField(fieldName, fieldType) {
	if (!fieldName) {
		return;
	}
	if (customFieldsPaperless.has(fieldName)) {
		return;
	}
	if (!fieldType || fieldType == FIELDTYPES.SELECT) {
		// first create select fields as string an change via patch later
		fieldType = FIELDTYPES.STRING;
	}
	var objectField = {
		name: fieldName,
		data_type: fieldType,
	}
	// Upload
	var idPaperless = null;
	if (!httpConfig) {
		setHTTPConfig();
	}
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var url = paperlessServerUrl + ENDPOINTS.custom_fields;
	var request = httpClient.createPostRequest(url);
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	request.addHeader('Content-Type', 'application/json');
	request.setBodyContent(JSON.stringify(objectField));
	var response = getResponse(request);
	httpClient.close();
	if (!response) {
		return;
	}
	/** @type {{id: Number, name: String, data_type: String, extra_data}} */
	var responseObject = JSON.parse(response);
	if (responseObject && responseObject.hasOwnProperty('id')) {
		customFieldsPaperless.set(fieldName, responseObject['id']);
	}
	downloadCustomFieldsPaperless()
}

/**
 * checks if a custom field with the name exists,
 * if not creates a field with the given name + the given type.
 * if no type is given "string" is used as a default
 *
 * @param {String} fieldName name of field to be shown in paperless
 * @param {String} tableName name of tabel used for select values
 *
 * @properties={typeid:24,uuid:"474091AF-7254-4C31-97D6-D8B7FDA314B5"}
 */
function uploadCustomFieldSelect(fieldName, tableName) {
	downloadCustomFieldsPaperless();
	/**
	 * @param {{label: String}} a
	 * @param {{label: String}} b
	 * @return {Number}
	 * */
	function sortList(a,b) {
		if (a.label > b.label) {
			return 1;
		} else if (a.label < b.label) {
			return -1
		}
		return 0;
	}

	if (!fieldName || !tableName) {
		return;
	}
	if (!customFieldsPaperless.has(fieldName)) {
		uploadCustomField(fieldName, FIELDTYPES.SELECT);
	}

	var variableName = 'paperless' + fieldName.replace('ä','ae');
	var fsCustomFieldData = databaseManager.getFoundSet('bauprocheck',tableName);
	/** @type [{label: String, id: String}] */
	var listSelectOptions = []
	fsCustomFieldData.loadAllRecords();
	for (var iC = 1; iC <= fsCustomFieldData.getSize(); iC++) {
		var record = fsCustomFieldData.getRecord(iC);
		var name = ''
		if (tableName == 'projekte') {
			name = record['schluessel_bezeichnung_trenner'];
		} else if (tableName == 'firmen') {
			name = record['firma_plus_ort'];
		} else if (tableName == 'personen') {
			name = record['anzeige_name'];
		} else if (tableName == 'projekte') {
			name = record['schluessel_bezeichnung_trenner'];
		} else if (tableName == 'auftraege') {
			name = record['info_projekt'];
		} else if (tableName == 'vz_gewerke') {
			name = record['bezeichnung'] + ' (' + record['gewerk_kuerzel'] + ')';
		} else if (tableName == 'vz_ebenen') {
			name = record['anzeige_ebene'];
		} else if (tableName == 'raumbuch') {
			name = record['projekt_schluessel'] + ' -- ' + record['anzeige_raumbuch'];
		} else {
			name = record['bezeichnung'] + ' (' + record['kuerzel'] + ')';
		}
		if (!scopes.paperless[variableName].has(name)) {
//			logger.debug('Feld Fehlt: ' + name);
			listSelectOptions.push({label: name});
		} else {
			var id = scopes.paperless[variableName].get(name);
//			logger.debug('Feld vorhanden: ' + name + ' - Id: ' + id);
			listSelectOptions.push({label: name, id: id});
		}
	}
	listSelectOptions.sort(sortList);
//	logger.debug(JSON.stringify(listSelectOptions));
	var paperlessFieldId = customFieldsPaperless.get(fieldName);
	if (!httpConfig) {
		setHTTPConfig();
	}
	var customFieldObject = {
		"extra_data": {
			"select_options": listSelectOptions
		},
		"data_type": "select"
	}
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var urlPatch = paperlessServerUrl + ENDPOINTS.custom_fields + paperlessFieldId.toString() + '/';
	var request = httpClient.createPatchRequest(urlPatch)
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	request.setBodyContent(JSON.stringify(customFieldObject),'application/json');
	var response = getResponse(request);
	httpClient.close();
	if (!response) {
		logger.error('problem updating field: ' + JSON.stringify(customFieldObject));
	}
	downloadCustomFieldsPaperless()
//	logger.debug('upload ' + fieldName + ' complete.')
}

/**
 * @properties={typeid:24,uuid:"76A4B6A6-7A63-4EDA-945C-83AB7497B498"}
 */
function UploadAllDocuments() {
	var fsDocuments = datasources.mem.documents.getFoundSet();
	fsDocuments.loadAllRecords();
	for (var iDoc = 1; iDoc <= fsDocuments.getSize(); iDoc++) {
		var recDocument = fsDocuments.getRecord(iDoc);
		uploadDocument(recDocument.document_binary, recDocument.document_filename, recDocument.document_name, recDocument.document_description, recDocument.correspondents_id, recDocument.tags_id, recDocument.document_types_id)
	}
}

/**
 * @param {Array<byte>} bytes
 * @param {String} fileName
 * @param {String} [documentName]
 * @param {String} [documentDescription]
 * @param {Date} [fileDate]
 * @param {Number} [correspondentId]
 * @param {Number} [tagsId]
 * @param {Number} [documentTypesId]
 * @properties={typeid:24,uuid:"E0D9F6CA-50F0-44DE-B025-0147CE6E9A37"}
 */
function uploadDocument(bytes, fileName, documentName, documentDescription, fileDate, correspondentId, tagsId, documentTypesId) {
	if (!bytes || !fileName) {
		return;
	}
	if (!fileDate) {
		fileDate = new Date();
	}
	var extension = 'dat';
	var baseName = 'temp';
	var nameParts = fileName.split('.');
	if (nameParts.length >= 2) {
		extension = '.' + nameParts.pop();
		baseName = nameParts.join('.');
	}
	// sanitize name?
//	var tempFile = plugins.file.createTempFile(baseName,extension);
	if (tempFile.setBytes(bytes, true)) {
		logger.debug('created file: ' + tempFile.getAbsolutePath());
	} else {
		logger.error('could not create file.');
		return;
	}
	// get Masterdata Server
	uploadMasterData()

	/** @type {Array<{field: Number, value: String}>} */
	var customFieldsList = [];

	if (!httpConfig) {
		setHTTPConfig();
	}
	var httpClient = plugins.http.createNewHttpClient(httpConfig);
	var url = paperlessServerUrl + '/api/documents/post_document/';
	var request = httpClient.createPostRequest(url);
	request.addHeader('Authorization', 'Token ' + paperlessToken);
	request.forceMultipart(true);
	var success = request.addFile('document', 'plugins.file.convertToJSFile(fileName)');
	if (!success) {
		logger.error('Error adding file.', LOGGINGLEVEL.ERROR);
		return;
	}
	var teileTitel = [];
	teileTitel.push(documentName);
	teileTitel.push(documentDescription);
	teileTitel.push(fileName)
	request.addParameter('title', teileTitel.join(' - '));
	if (correspondentId) {
		request.addParameter('correspondent', correspondentId.toString());
	}
	if (documentTypesId) {
		request.addParameter('document_type',documentTypesId.toString());
	}
	if (tagsId) {
		request.addParameter('tags', tagsId.toString());
	}

	request.addParameter('created', utils.dateFormat(fileDate, 'yyyy-MM-dd HH:mm:ss'));
	var response = getResponse(request);
	tempFile.deleteFile();
	httpClient.close();
	if (response) {
//		var fsDokumentPaperless = datasources.db.bauprocheck.paperless_dokumente.getFoundSet();
//		var recordInfo = fsDokumentPaperless.getRecord(fsDokumentPaperless.newRecord());
//		recordInfo.dateiname = fileName;
//		recordInfo.datum_stand_dokument = fileDate;
//		if (recordDokument) {
//			recordInfo.dokumente_id = recordDokument.dokumente_id
//			recordInfo.dokumente_fw_id = recordDokument.fw_document_id
//		}
//		recordInfo.upload_time = new Date ();
//		recordInfo.paperless_task_id = response;
//		recordInfo.stammdaten_upload = JSON.stringify(customFieldsList);
//		databaseManager.saveData(recordInfo);
	}
}