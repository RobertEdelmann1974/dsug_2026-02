/**
 * @type {String}
 * @properties={typeid:35,uuid:"64348F41-E18D-43A3-9B78-06D35F24BA66"}
 */
var username = null;

/**
 * @type {String}
 * @properties={typeid:35,uuid:"1BD91E68-C4AD-435A-A2D9-3FE247A3DDD3"}
 */
var password = null;


/**
 * Fired when the button is clicked.
 *
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"EFA51BB7-70F2-4E5F-B8AA-DF1804A8357E"}
 */
function onAction_buttonToken(event) {
	if (username && password) {
		var newToken = scopes.paperless.getPaperlessToken(username, password)
		if (newToken) {
			// show message
		}
	}
}
