goog.provide('jsh.MimeTypeHelper');
goog.provide('jsh.MimeTypeHelper.DataType');


/**
 * Constants for data types.
 * @enum {string}
 */
jsh.MimeTypeHelper.DataType = {
  BINARY: 'binary',
  TEXT: 'text'
};


/**
 * Constants for editor types.
 * @enum {string}
 */
jsh.MimeTypeHelper.EditorType = {
  TEXT: 'text',
  IMAGE: 'image',
  DEFAULT: 'default'
};


/**
 *
 * @type {Object}
 */
jsh.MimeTypeHelper.mimeLookup = {
  'application/javascript': {
    'iconClass': goog.getCssName('jsh-resourcelistitem-js'),
    'aceMode': 'ace/mode/javascript',
    'dataType': jsh.MimeTypeHelper.DataType.TEXT,
    'editorType': jsh.MimeTypeHelper.EditorType.TEXT,
    'defaultContent': '\/* This snippet binds a function to the ' +
        '\"dom:loaded\" event.\n' +
        'You can put your own javascript into the function, or replace\n' +
        'the entire snippet. *\/\n' +
        'Event.observe(document,\'dom:loaded\', function() {\n' +
        '    //Your javascript goes here. \n' +
        '});\n'
  },
  'text/html': {
    'iconClass': goog.getCssName('jsh-resourcelistitem-html'),
    'aceMode': 'ace/mode/html',
    'autoCompletePattern': {
      'application/javascript':
          '<script src="###path###" type="text/javascript"></script>',
      'text/css': '<link href="###path###" rel="stylesheet">',
      'image': '<img src="###path###" />'
    },
    'defaultContent': '<!-- This snippet binds a function to the ' +
        '\"dom:loaded\" event.\n' +
        'You can put your own javascript into the function, or replace\n' +
        'the entire snippet. -->\n' +
        '<script type=\'text/javascript\'>\n' +
        '    Event.observe(document,\'dom:loaded\', function() {\n' +
        '        //Your javascript goes here. \n' +
        '    });\n' +
        '</script>\n',
    injectable: true
  },
  'text/css': {
    'iconClass': goog.getCssName('jsh-resourcelistitem-css'),
    'aceMode': 'ace/mode/css'
  },
  'image/png': {
    'iconClass': goog.getCssName('jsh-resourcelistitem-png')
  },
  'image/gif': {
    'iconClass': goog.getCssName('jsh-resourcelistitem-gif')
  },
  'image/jpeg': {
    'iconClass': goog.getCssName('jsh-resourcelistitem-jpg')
  },
  'text': {
    'iconClass': goog.getCssName('jsh-resourcelistitem-text'),
    'dataType': jsh.MimeTypeHelper.DataType.TEXT,
    'editorType': jsh.MimeTypeHelper.EditorType.TEXT
  },
  'image': {
    'iconClass': goog.getCssName('jsh-resourcelistitem-text'),
    'editorType': jsh.MimeTypeHelper.EditorType.IMAGE
  },
  '*' : {
    'iconClass': goog.getCssName('jsh-resourcelistitem-default'),
    'dataType': jsh.MimeTypeHelper.DataType.BINARY,
    'editorType': jsh.MimeTypeHelper.EditorType.DEFAULT
  }
};


/**
 * Gets the CSS class to use when displaying a ResourceListItem for this mime
 * type.
 * @param {string} mimeType the mime type.
 * @return {string}
 */
jsh.MimeTypeHelper.getIconClass = function(mimeType) {
  return /** @type {string} */ (jsh.MimeTypeHelper.
      lookupAttribute_('iconClass', mimeType));
};


/**
 * Gets the Ace Editor mode to use for this mime type.
 * @param {string} mimeType the mime type.
 * @return {string}
 */
jsh.MimeTypeHelper.getAceMode = function(mimeType) {
  return /** @type {string} */ (jsh.MimeTypeHelper.
      lookupAttribute_('aceMode', mimeType));
};


/**
 * Gets the data type for this mime type.
 * @param {string} mimeType the mime type.
 * @return {jsh.MimeTypeHelper.DataType}
 */
jsh.MimeTypeHelper.getDataType = function(mimeType) {
  return /** @type {jsh.MimeTypeHelper.DataType} */ (jsh.MimeTypeHelper.
      lookupAttribute_('dataType', mimeType));
};


/**
 * Gets the Editor Type to use for this mime type.
 * @param {string} mimeType the mime type.
 * @return {jsh.MimeTypeHelper.EditorType}
 */
jsh.MimeTypeHelper.getEditorType = function(mimeType) {
  return /** @type {jsh.MimeTypeHelper.EditorType} */ (jsh.MimeTypeHelper.
      lookupAttribute_('editorType', mimeType));
};


/**
 * Gets the Default Content to use for this mime type.
 * @param {string} mimeType the mime type.
 * @return {string}
 */
jsh.MimeTypeHelper.getDefaultContent = function(mimeType) {
  return /** @type {string} */ (jsh.MimeTypeHelper.
      lookupAttribute_('defaultContent', mimeType));
};


/**
 * Gets the injectability to use for this mime type.
 * @param {string} mimeType the mime type.
 * @return {boolean}
 */
jsh.MimeTypeHelper.getInjectable = function(mimeType) {
  return /** @type {boolean} */ (jsh.MimeTypeHelper.
      lookupAttribute_('injectable', mimeType) === true);
};


/**
 * Gets the pattern for auto completing a resource.
 * @param {string} editorMimeType Mime type of the editor.
 * @param {string} resourceMimeType Mime type of the resource.
 * @param {string} path The path of the resource.
 * @return {?string}
 */
jsh.MimeTypeHelper.getAutoCompletePattern = function(editorMimeType,
                                            resourceMimeType, path) {
  var lookup = jsh.MimeTypeHelper.lookupAttribute_('autoCompletePattern',
      editorMimeType);
  var pattern = lookup[resourceMimeType];
  if (!pattern) {
    var genericType = resourceMimeType.split('/')[0];
    pattern = lookup[genericType];
    if (!pattern) {
      pattern = lookup['*'];
      if (!pattern) {
        return null;
      }
    }
  }

  var ref = '${resources[\'' + path + '\']}';
  return pattern.replace('###path###', ref);
};


/**
 * Lookup an attribute for a given mime type.
 * @param {string} attribute the attribute to lookup.
 * @param {string} mimeType the mime type.
 * @return {*}
 * @private
 */
jsh.MimeTypeHelper.lookupAttribute_ = function(attribute, mimeType) {
  var lookup = jsh.MimeTypeHelper.mimeLookup[mimeType];
  if (lookup) {
    var value = lookup[attribute];
    if (value) {
      return value;
    }
  }

  var genericType = mimeType.split('/')[0];
  lookup = jsh.MimeTypeHelper.mimeLookup[genericType];
  if (lookup) {
    var value = lookup[attribute];
    if (value) {
      return value;
    }
  }

  lookup = jsh.MimeTypeHelper.mimeLookup['*'];
  return lookup[attribute];
};

