goog.provide('jsh.HackEditor');

goog.require('goog.array');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.ui.Component');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.SplitPane');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarButton');
goog.require('goog.ui.ToolbarMenuButton');
goog.require('goog.ui.ToolbarSeparator');
goog.require('goog.ui.ToolbarToggleButton');
goog.require('goog.ui.tree.TreeControl');
goog.require('jsh.AceEditor');
goog.require('jsh.DefaultEditor');
goog.require('jsh.EditorContainer');
goog.require('jsh.FileSelectToolbarButton');
goog.require('jsh.HackDetailsArea');
goog.require('jsh.ImageEditor');
goog.require('jsh.ResourceListContainer');
goog.require('jsh.ResourceListHeader');
goog.require('jsh.ResourceListItem');
goog.require('jsh.SplitPane');
goog.require('jsh.TextEditor');
goog.require('jsh.events.EventType');
goog.require('jsh.events.FileImportEvent');
goog.require('jsh.model.Hack');



/**
 * The Main Editor component for JSHack.  Contains the splitpane and
 * coordinates interactions between the child components.
 *
 * @param {jsh.model.Hack=} opt_hack The hack to be edited.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper to use.
 * @extends {goog.ui.Component}
 * @constructor
 */
jsh.HackEditor = function(opt_hack, opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.splitpane_ = null;

  this.viewSizeMonitor_ = new goog.dom.ViewportSizeMonitor();

  this.editorCache_ = {};

  this.editorContainer_ = null;

  this.currentEditor_ = null;

  /**
   *
   * @type {Array.<jsh.model.HackResource>}
   * @private
   */
  this.resources_ = new Array();

  /**
   * @private
   * @type {jsh.ResourceListContainer} */
  this.resourceListContainer_ = null;

  this.resourceListHeader_ = null;

  //TODO This needs to go somewhere else, like a constant or something
  this.splitPaneHandleWidth_ = 5;

  this.setModel(opt_hack);

  this.btnWordWrap_ = null;

};
goog.inherits(jsh.HackEditor, goog.ui.Component);


/**
 * Creates the div in which the Hack editor is placed
 *
 * @override
 */
jsh.HackEditor.prototype.createDom = function() {
  var el = goog.dom.createDom('div', goog.getCssName('ide'));
  this.decorateInternal(el);
};


/**
 * Decorates an existing HTML DIV element as a SampleComponent.
 *
 * @param {Element} element The DIV element to decorate. The element's
 *    text, if any will be used as the component's label.
 * @override
 */
jsh.HackEditor.prototype.decorateInternal = function(element) {

  goog.base(this, 'decorateInternal', element);

  var toolbar = new goog.ui.Toolbar();

  this.btnSave_ = new goog.ui.ToolbarButton(this.createButtonDOM_('Save',
      goog.getCssName('fa-floppy-o')));
  toolbar.addChild(this.btnSave_, true);
  goog.events.listen(this.btnSave_, goog.ui.Component.EventType.ACTION,
      function() {
        if (this.hackDetails_.isValid()) {
          this.hackDetails_.validateFields();
          this.dispatchEvent({type: jsh.events.EventType.SAVE});
        } else {
          this.resourceListContainer_.
              setSelectedChild(this.resourceListHeader_);
          //Forgive me, for I have sinned... The timeout forces the browser to
          //render the HackDetails component prior to validating the fields,
          //otherwise the CSS transition will not work.
          setTimeout(goog.bind(function() {
            this.hackDetails_.validateFields();
          }, this), 0);
        }
      }, false, this);


  toolbar.addChild(new goog.ui.ToolbarSeparator(), true);

  var btnUpload = new jsh.FileSelectToolbarButton('Import Resource',
      goog.getCssName('fa-upload'));
  toolbar.addChild(btnUpload, true);


  var btnNew = new goog.ui.ToolbarMenuButton(
      this.createButtonDOM_('Create Resource', goog.getCssName('fa-file-o')));
  var jsFileMenuItem = new goog.ui.MenuItem('Javascript File');
  btnNew.addItem(jsFileMenuItem);
  var htmlFileMenuItem = new goog.ui.MenuItem('HTML File');
  btnNew.addItem(htmlFileMenuItem);
  var cssFileMenuItem = new goog.ui.MenuItem('CSS File');
  btnNew.addItem(cssFileMenuItem);

  toolbar.addChild(btnNew, true);

  goog.events.listen(jsFileMenuItem, goog.ui.Component.EventType.ACTION,
      function() {
        this.createResource('newresource.js', 'application/javascript');
      }, false, this);
  goog.events.listen(cssFileMenuItem, goog.ui.Component.EventType.ACTION,
      function() {
        this.createResource('newresource.css', 'text/css');
      }, false, this);
  goog.events.listen(htmlFileMenuItem, goog.ui.Component.EventType.ACTION,
      function() {
        this.createResource('newresource.html', 'text/html');
      }, false, this);


  this.btnDelete_ = new goog.ui.ToolbarButton(
      this.createButtonDOM_('Delete Resource', goog.getCssName('fa-trash-o')));
  toolbar.addChild(this.btnDelete_, true);

  goog.events.listen(this.btnDelete_, goog.ui.Component.EventType.ACTION,
      this.deleteSelectedResource, false, this);

  this.btnRename_ = new goog.ui.ToolbarButton(
      this.createButtonDOM_('Rename Resource', goog.getCssName('fa-pencil')));
  toolbar.addChild(this.btnRename_, true);
  goog.events.listen(this.btnRename_, goog.ui.Component.EventType.ACTION,
      function() {
        var resItem = this.resourceListContainer_.getSelectedChild();
        if (resItem && resItem.isRenameable()) {
          resItem.setNameEditable();
        }
      }, false, this);

  toolbar.addChild(new goog.ui.ToolbarSeparator(), true);

  this.btnWordWrap_ = new goog.ui.ToolbarToggleButton(
      this.createButtonDOM_('Word Wrap', goog.getCssName('fa-exchange')));

  goog.events.listen(this.btnWordWrap_, goog.ui.Component.EventType.ACTION,
      this.refreshWordWrap, false, this);

  toolbar.addChild(this.btnWordWrap_, true);

  this.addChild(toolbar, true);


  var btnClose = new goog.ui.ToolbarButton(this.createButtonDOM_('Close',
      goog.getCssName('fa-power-off')));
  toolbar.addChild(btnClose, true);
  goog.dom.classlist.add(btnClose.getElement(), goog.getCssName('close-btn'));


  this.resourceListContainer_ = new jsh.ResourceListContainer();

  this.resourceListHeader_ = new jsh.ResourceListHeader();
  this.resourceListContainer_.addChild(this.resourceListHeader_, true);

  goog.events.listen(this.resourceListHeader_,
      goog.ui.Component.EventType.SELECT,
      this.showHackDetailsArea, false, this);

  jsh.AceEditor.addCompleter(this.getResourceCompleter());
  jsh.AceEditor.addCompleter(this.getConfigurationCompleter());

  this.editorContainer_ = new jsh.EditorContainer();

  this.hackDetails_ = new jsh.HackDetailsArea();
  this.editorContainer_.addChild(this.hackDetails_, true);
  this.currentEditor_ = this.hackDetails_;

  this.splitpane_ = new jsh.SplitPane(this.resourceListContainer_,
      this.editorContainer_, goog.ui.SplitPane.Orientation.HORIZONTAL);
  this.splitpane_.setInitialSize(300);
  this.splitpane_.setHandleSize(this.splitPaneHandleWidth_);

  this.addChild(this.splitpane_, true);

};


/**
 * Update the state of the editor based on the details in a hack object.
 * @param {jsh.model.Hack} hack The hack containing the new details
 */
jsh.HackEditor.prototype.updateEditorState = function(hack) {
  this.hackDetails_.hackIdentifierInput.value =
      hack.identifier ? hack.identifier : '';
  this.hackDetails_.hackNameInput.value = hack.name ? hack.name : '';
  this.hackDetails_.hackDescInput.value =
      hack.description ? hack.description : '';
  this.hackDetails_.hackVersionInput.value =
      hack.version ? hack.version : '';
  this.hackDetails_.hackTargetVerMinInput.value =
      hack.targetVersionMin ? hack.targetVersionMin : '';
  this.hackDetails_.hackTargetVerMaxInput.value =
      hack.targetVersionMax ? hack.targetVersionMax : '';

  this.resourceListHeader_.setHackName(hack.name);
  this.resourceListHeader_.setHackIdentifier(hack.identifier);

  this.hackDetails_.developerList.setDevelopers(hack.developers);
  this.hackDetails_.configurationList.setConfiguration(
      hack.configEntryDefinitions);

  this.setModel(hack);

  //TODO Need to update the resources when the data comes back from the server.

};


/**
 * Event handler for when the "Create Resource" button is clicked.
 * @param {string} name the name of the new resource.
 * @param {string} type the mime type of the new resource.
 */
jsh.HackEditor.prototype.createResource = function(name, type) {
  var resource = new jsh.model.HackResource();
  resource.path = name;
  resource.mime = type;
  resource.content = jsh.MimeTypeHelper.getDefaultContent(type);
  var listItem = this.addResource(resource);
  this.resources_.push(resource);
};


/**
 * Add a resource to the end without ensuring order, selection or renaming.
 *
 * @param {jsh.model.HackResource!} resource the hack to add to the UI.
 * @return {jsh.ResourceListBaseItem!}
 * @private
 */
jsh.HackEditor.prototype.addResourceListItem_ = function(resource) {
  var resItem = new jsh.ResourceListItem(resource);
  this.resourceListContainer_.addChild(resItem, true);
  goog.events.listen(resItem, goog.ui.Component.EventType.SELECT,
      this.handleResourceSelect, false, this);
  return resItem;
};


/**
 * Given a HackResource model, adds all the required UI elements to manipulate
 * that HackResource.
 *
 * @param {jsh.model.HackResource!} resource the hack to add to the UI.
 * @param {boolean=} opt_rename set the resource list item name editable.
 */
jsh.HackEditor.prototype.addResource = function(resource, opt_rename) {
  var resItem = this.addResourceListItem_(resource);

  this.resourceListContainer_.setSelectedChild(resItem);
  this.resourceListContainer_.sortChildren();

  if (opt_rename !== false) {
    resItem.setNameEditable();
  }
};


/**
 * Given a list of HackResource models, adds all the required UI elements to
 * manipulate the HackResources.
 *
 * @param {Array.<jsh.model.HackResource>!} resources the resources to add.
 */
jsh.HackEditor.prototype.addResources = function(resources) {
  var resItem;
  for (var i = 0; i < resources.length; i++) {
    var res = resources[i];
    if (res) {
      resItem = this.addResourceListItem_(res);
      this.resources_.push(res);
    }
  }

  if (resItem) {
    this.resourceListContainer_.setSelectedChild(resItem);
  }
  this.resourceListContainer_.sortChildren();
};


/**
 * Returns the HackResource items currently being managed by the editor.
 *
 * @return {Array.<jsh.model.HackResource>}
 */
jsh.HackEditor.prototype.getResources = function() {
  var resources = this.resources_;
  for (var i = 0; i < resources.length; i++) {
    var currRes = resources[i];
    if (currRes.editor && currRes.editor.getContent) {
      currRes.content = currRes.editor.getContent();
    }
  }
  return this.resources_;
};


/**
 * Called when component's element is known to be in the document.
 * @override
 */
jsh.HackEditor.prototype.enterDocument = function() {
  this.resizeOuterSplitPane_();
  goog.events.listen(this.viewSizeMonitor_,
      goog.events.EventType.RESIZE, this.resizeOuterSplitPane_, false, this);


  goog.events.listen(this.resourceListContainer_,
      goog.ui.Component.EventType.SELECT,
      function(e) {
        var resItem = e.target;
        this.btnDelete_.setEnabled(resItem.isDeleteable());
        this.btnRename_.setEnabled(resItem.isRenameable());
      }, false, this);

  if (this.resourceListHeader_) {
    this.resourceListContainer_.setSelectedChild(this.resourceListHeader_);
  }

  if (this.getModel()) {
    this.updateEditorState(/** @type {jsh.model.Hack} */ (this.getModel()));
  }

  var handler = new goog.events.FileDropHandler(this.getElement(), true);
  goog.events.listen(handler, goog.events.FileDropHandler.EventType.DROP,
      function(e) {
        var files = e.getBrowserEvent().dataTransfer.files;
        var fileEvent = new jsh.events.FileImportEvent(files);
        this.dispatchEvent(fileEvent);
      }, false, this);

  goog.base(this, 'enterDocument');

};


/**
 * Handler for the viewSizeMonitor event, to resize the outerSplitPane
 * @private
 */
jsh.HackEditor.prototype.resizeOuterSplitPane_ = function() {
  var lhsheight = this.viewSizeMonitor_.getSize().height -
      goog.style.getPosition(this.splitpane_.getElement()).y;
  var lhswidth = this.viewSizeMonitor_.getSize().width;
  this.splitpane_.setSize(new goog.math.Size(lhswidth, lhsheight));
};


/**
 * Handler for when a ResourceListItem is selected.
 * @param {goog.events.Event!} e the select event
 */
jsh.HackEditor.prototype.handleResourceSelect = function(e) {
  var resourceListItem = e.currentTarget;
  var resource = resourceListItem.getModel();

  var id = resourceListItem.getId();
  var ed = resource.editor;
  if (ed == null) {
    ed = this.createEditor(resource);
    this.editorCache_[id] = ed;
    resource.editor = ed;
    this.editorContainer_.addChild(ed, true);
    this.refreshWordWrapOnEditor_(ed);
    if (ed.resize) {
      goog.events.listen(this.splitpane_, goog.ui.Component.EventType.CHANGE,
          function() {
            this.resize();
          }, false, ed);
    }
  }

  this.currentEditor_.setVisible(false);
  ed.setVisible(true);
  this.currentEditor_ = ed;

  // trigger resize on ResourceEditor
  this.splitpane_.dispatchEvent(goog.ui.Component.EventType.CHANGE);
};


/**
 * Display the HackDetails Area, and hide the currently active resource editor.
 */
jsh.HackEditor.prototype.showHackDetailsArea = function() {
  this.currentEditor_.setVisible(false);
  this.hackDetails_.setVisible(true);
  this.currentEditor_ = this.hackDetails_;
};


/**
 *
 * @param {jsh.model.HackResource} resource
 * @return {jsh.BaseEditor}
 */
jsh.HackEditor.prototype.createEditor = function(resource) {
  var ed;
  switch (jsh.MimeTypeHelper.getEditorType(resource.mime)) {
    case jsh.MimeTypeHelper.EditorType.TEXT:
      ed = new jsh.TextEditor(resource);
      break;

    case jsh.MimeTypeHelper.EditorType.IMAGE:
      ed = new jsh.ImageEditor(resource);
      break;

    default:
      ed = new jsh.DefaultEditor(resource);
  }
  return ed;
};


/**
 * Returns hack model which represents the current unsaved state of the editor.
 * @return {jsh.model.Hack}
 */
jsh.HackEditor.prototype.getHackModel = function() {
  var hack = new jsh.model.Hack();

  hack.identifier = this.hackDetails_.hackIdentifierInput.value;
  hack.name = this.hackDetails_.hackNameInput.value;
  hack.description = this.hackDetails_.hackDescInput.value;
  hack.version = this.hackDetails_.hackVersionInput.value;
  hack.targetVersionMin = this.hackDetails_.hackTargetVerMinInput.value;
  hack.targetVersionMax = this.hackDetails_.hackTargetVerMaxInput.value;

  hack.developers = this.hackDetails_.developerList.getDevelopers();
  hack.configEntryDefinitions =
      this.hackDetails_.configurationList.getConfiguration();

  hack.resources = this.getResources();
  return hack;
};


/**
 * Creates the DOM structure for a button with a font-awesome icon.
 * @param {string} text Text to display on the button.
 * @param {string} iconClass The font-awesome icon class.
 * @return {Element}
 * @private
 */
jsh.HackEditor.prototype.createButtonDOM_ = function(text, iconClass) {
  return goog.soy.renderAsElement(jsh.soy.editor.toolbarButton,
      {text: text, iconClass: iconClass});
};


/**
 * Deletes the resource, if it's deleteable, that is currenty the selection
 * in the resource list container.
 */
jsh.HackEditor.prototype.deleteSelectedResource = function() {
  var resItem = this.resourceListContainer_.getSelectedChild();

  if (resItem && resItem.isDeleteable()) {
    var hackResource = /**@type {jsh.model.HackResource} */(resItem.getModel());
    var id = resItem.getId();
    var ed = this.editorCache_[id];
    if (ed != null) {
      delete this.editorCache_[id];
      this.editorContainer_.removeChild(ed, true);
    }
    var selectedIndex = this.resourceListContainer_.getSelectedIndex();
    this.resourceListContainer_.removeChild(resItem, true);
    if (selectedIndex >= this.resourceListContainer_.getChildCount()) {
      this.resourceListContainer_.setSelectedChildByIndex(selectedIndex - 1,
          true);
    } else {
      this.resourceListContainer_.setSelectedChildByIndex(selectedIndex, true);
    }

    goog.array.remove(this.resources_, hackResource);

    this.dispatchEvent(new goog.events.Event(
        jsh.events.EventType.RESOURCE_DELETED, hackResource));
  }
};


/**
 * Gets an AceEditor auto completer for the resources in this editor.
 * @return {{getCompletions: function(ace.AceEditor, ace.AceSession, number,
 * string, function(Object, Array.<{name: string, value:string, score: number,
 * meta: string}>))}}
 */
jsh.HackEditor.prototype.getResourceCompleter = function() {
  return {
    'getCompletions': goog.bind(
        function(editor, session, pos, prefix, callback) {
          var items = goog.array.reduce(
              this.resourceListContainer_.getChildIds(),
              /**
           *
           * @param {Array.<{name: string, value:string, score: number,
           * meta: string}>} accumulation
           * @param {string} childId
           * @param {number} index
           * @param {Array.<{name: string, value:string, score: number,
           * meta: string}>} array
           * @return {Array.<{name: string, value:string, score: number,
           * meta: string}>}
           */
              function(accumulation, childId, index, array) {
                var lowerprefix = prefix.toLowerCase();
                var selectedResource = /** @type {jsh.model.HackResource} */
                    (this.resourceListContainer_.getSelectedChild().getModel());

                if (!jsh.MimeTypeHelper.getInjectable(selectedResource.mime)) {
                  return accumulation;
                }

                var item = this.resourceListContainer_.getChild(childId);
                if (!item) {
                  return accumulation;
                }

                var model = item.getModel();
                if (!model || !model.path ||
                    selectedResource.path == model.path) {
                  return accumulation;
                }

                var score;
                if (prefix.length === 0 ||
                    goog.string.startsWith(model.path.toLowerCase(),
                    lowerprefix)) {
                  score = 100;
                } else if (goog.string.contains(model.path.toLowerCase(),
                    lowerprefix)) {
                  score = 99;
                } else {
                  return accumulation;
                }

                var value = jsh.MimeTypeHelper.getAutoCompletePattern(
                    selectedResource.mime, model.mime, model.path);
                if (!value) {
                  return accumulation;
                }

                var completion = {
                  'name': model.path,
                  'value': value,
                  'score': score,
                  'meta': 'resource'
                };
                accumulation.push(completion);
                return accumulation;
              }, [], this);
          callback(null, items);
        }, this)
  };
};


/**
 * Gets an AceEditor auto completer for the configuration items in this hack.
 * @return {{getCompletions: function(ace.AceEditor, ace.AceSession, number,
 * string, function(Object, Array.<{name: string, value:string, score: number,
 * meta: string}>))}}
 */
jsh.HackEditor.prototype.getConfigurationCompleter = function() {
  return {
    'getCompletions': goog.bind(
        function(editor, session, pos, prefix, callback) {
          var items = goog.array.reduce(
              this.hackDetails_.configurationList.getConfiguration(),
              function(accumulation, config, index, array) {
                var selectedResource = /** @type {jsh.model.HackResource} */
                    (this.resourceListContainer_.getSelectedChild().getModel());

                if (!jsh.MimeTypeHelper.getInjectable(selectedResource.mime)) {
                  return accumulation;
                }

                var lowerPrefix = prefix.toLowerCase();
                var lowerId = config.identifier.toLowerCase();
                var score;
                if (prefix.length === 0 ||
                    goog.string.startsWith(lowerId, lowerPrefix)) {
                  score = 100;
                } else if (goog.string.contains(lowerId, lowerPrefix)) {
                  score = 99;
                } else {
                  return accumulation;
                }

                var completion = {
                  'name': config.name,
                  'value': '${config[\'' + config.identifier + '\']}',
                  'score': score,
                  'meta': 'configuration'
                };
                accumulation.push(completion);
                return accumulation;
              }, [], this);
          callback(null, items);
        }, this)
  };
};


/**
 * Returns if word wrap should be on in the text editors based on the state of
 * the word wrap button.
 * @return {boolean}
 */
jsh.HackEditor.prototype.getWordWrapEnabled = function() {
  return this.btnWordWrap_.hasState(goog.ui.Component.State.CHECKED);
};


/**
 * Sets the correct word wrap state onto the specified editor.
 * @param {jsh.BaseEditor} ed
 * @private
 */
jsh.HackEditor.prototype.refreshWordWrapOnEditor_ = function(ed) {
  if (ed && ed.wordWrap) {
    ed.wordWrap(this.getWordWrapEnabled());
  }
};


/**
 * Ses the correct word wrap state on all of the resource editors.
 */
jsh.HackEditor.prototype.refreshWordWrap = function() {
  this.resourceListContainer_.forEachChild(function(child, index) {
    window.console.log(child.getId());
    var ed = this.editorCache_[child.getId()];
    this.refreshWordWrapOnEditor_(ed);
  }, this);
};

