/**
 * @properties={type:12,typeid:36,uuid:"D05672BB-CCA7-4EFD-A48B-6BE647CA0611"}
 */
function tooltip_fields() {
	if (!custom_fields) {
		'no custom fields';
	}
	return custom_fields.replace('\n','<br/>\n');
}
