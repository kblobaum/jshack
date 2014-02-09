goog.provide('jsh.events.EventType');


/**
 * Constants for event names.
 * @enum {string}
 */
jsh.events.EventType = {
  /** dispatched when a component enters an invalid state. */
  HACK_INVALID: 'hackinvalid',
  HACK_VALID: 'hackvalid',
  FILES_IMPORTED: 'filesimported',
  SAVE: 'save',
  RESOURCE_RENAMED: 'resourcerenamed',
  RESOURCE_NAME_EDITABLE: 'resourcenameeditable',
  RESOURCE_NAME_UNEDITABLE: 'resourcenameuneditable',
  RESOURCE_DELETED: 'resourcedeleted'
};
