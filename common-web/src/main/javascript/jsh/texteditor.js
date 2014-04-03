goog.provide('jsh.TextEditor');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('jsh.BaseEditor');
goog.require('jsh.MimeTypeHelper');
goog.require('jsh.ResourceRestrictions');
goog.require('jsh.SplitPane');



/**
 * The main editor for text type resources.  Code, etc.
 *
 * @param {jsh.model.HackResource} resource the resource to edit.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper to use.
 * @extends {jsh.BaseEditor}
 * @constructor
 */
jsh.TextEditor = function(resource, opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.valid = true;

  /** @type {jsh.model.HackResource}
   * @private */
  this.resource_ = resource;

  /** @type {jsh.SplitPane} */
  this.splitPane_;

  /** @type {jsh.AceEditor} */
  this.hackEditor_;

  /** @type {goog.ui.Component} */
  this.resourceProperties_;

  /** @type {number}
   *  @private
   */
  this.splitPaneHandleWidth_ = 5;
};
goog.inherits(jsh.TextEditor, jsh.BaseEditor);


/**
 * @override
 */
jsh.TextEditor.prototype.createDom = function() {

  var el = this.dom_.createDom('div', {'class': 'jsh-reseditor'});
  this.decorateInternal(el);

};


/**
 * Decorates an existing HTML DIV element..
 *
 * @param {Element} element The DIV element to decorate. The element's
 *    text, if any will be used as the component's label.
 * @override
 */
jsh.TextEditor.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  this.hackEditor_ = new jsh.AceEditor();
  this.resourceProperties_ = new jsh.ResourceRestrictions();
  this.splitPane_ = new jsh.SplitPane(this.hackEditor_,
      this.resourceProperties_, goog.ui.SplitPane.Orientation.VERTICAL);
  this.splitPane_.setInitialSize(250);
  this.splitPane_.setHandleSize(this.splitPaneHandleWidth_);
  this.splitPane_.setSecondComponentStatic(true);

  this.addChild(this.splitPane_, true);
};


/**
 * Executed when the Ace component is inserted into the page.
 *
 * @override
 */
jsh.TextEditor.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  //TODO this is nasty.  Really shouldn't rely on the dom structure like this.
  goog.events.listen(this.getParent().getParent(),
      goog.ui.Component.EventType.CHANGE,
      this.handleParentSizeChange, false, this);
  goog.events.listen(this.splitPane_, goog.ui.Component.EventType.CHANGE,
      goog.events.Event.stopPropagation, false, this);

  goog.dom.classlist.add(this.hackEditor_.getElement(),
      goog.getCssName('jsh-text-editor'));

  this.hackEditor_.getAce().setValue(this.resource_.content);
  this.hackEditor_.getAce().getSession().setMode(
      jsh.MimeTypeHelper.getAceMode(this.resource_.mime));

  goog.events.listen(this.resourceProperties_,
      jsh.events.EventType.SYSTEM_ROLE_RESTRICTION_EDITOR_ADDED,
      function() {
        window.console.log('jsh.TextEditor.prototype.enterDocument');
      },
      false, this);
};


/**
 * Handler for when the parent component changes. We're interested in size
 * changes in particular.
 * @param {!goog.events.Event} e An event.
 */
jsh.TextEditor.prototype.handleParentSizeChange = function(e) {
  var size = goog.style.getSize(this.getElement());
  this.splitPane_.setSize(size);
  this.hackEditor_.resize();
};
