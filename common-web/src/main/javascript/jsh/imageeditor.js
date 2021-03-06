goog.provide('jsh.ImageEditor');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('jsh.BaseEditor');
goog.require('jsh.MimeTypeHelper');
goog.require('jsh.SplitPane');



/**
 * A resource Editor for displaying Image resources.
 *
 * @param {jsh.model.HackResource} resource the resource to edit.
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper to use.
 * @extends {jsh.BaseEditor}
 * @constructor
 */
jsh.ImageEditor = function(resource, opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.valid = true;

  /** @type {jsh.model.HackResource}
   * @private */
  this.resource_ = resource;

  /**
   * @type {Element}
   * @private
   */
  this.imageElement_;

  /**
   * @type {Element}
   * @private
   */
  this.pathElement_;

};
goog.inherits(jsh.ImageEditor, jsh.BaseEditor);


/**
 * @override
 */
jsh.ImageEditor.prototype.createDom = function() {

  var el = goog.soy.renderAsElement(jsh.soy.editor.imageEditor);
  this.decorateInternal(el);

};


/**
 * Decorates an existing HTML DIV element..
 *
 * @param {Element} element The DIV element to decorate. The element's
 *    text, if any will be used as the component's label.
 * @override
 */
jsh.ImageEditor.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  this.imageElement_ = goog.dom.getElementByClass(
      goog.getCssName('jsh-imageeditor-image'), element);
  this.pathElement_ = goog.dom.getElementByClass(
      goog.getCssName('jsh-imageeditor-path'), element);
};


/**
 * Executed when the Ace component is inserted into the page.
 *
 * @override
 */
jsh.ImageEditor.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.imageElement_.src = this.resource_.tempFileName +
      '/' + this.resource_.path;
  goog.dom.setTextContent(this.pathElement_, this.resource_.path);

};
