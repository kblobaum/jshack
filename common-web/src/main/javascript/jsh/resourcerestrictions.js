goog.provide('jsh.ResourceRestrictions');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.ui.Checkbox');
goog.require('goog.ui.Component');
goog.require('jsh.CheckSwitchRenderer');
goog.require('jsh.InjectionPointPane');
goog.require('jsh.RestrictionPane');
goog.require('jsh.model.injectionPoint');
goog.require('jsh.soy.editor');



/**
 * The Panel which contains all the controls for editing where and when a
 * resource will be injected.
 *
 * @param {goog.dom.DomHelper=} opt_domHelper DOM helper to use.
 * @extends {goog.ui.Component}
 * @constructor
 */
jsh.ResourceRestrictions = function(opt_domHelper) {
  goog.base(this, opt_domHelper);

  this.injectCheckbox = null;
  this.injectionPointPane = null;
  this.restrictionPane = null;
};
goog.inherits(jsh.ResourceRestrictions, goog.ui.Component);


/**
 * @override
 */
jsh.ResourceRestrictions.prototype.createDom = function() {
  var el = goog.soy.renderAsElement(jsh.soy.editor.resourceRestrictions);
  this.decorateInternal(el);
};


/**
 * Decorates an existing HTML DIV element..
 *
 * @param {Element} element The DIV element to decorate. The element's
 *    text, if any will be used as the component's label.
 * @override
 */
jsh.ResourceRestrictions.prototype.decorateInternal = function(element) {
  this.setElementInternal(element);

  var cbel = goog.dom.getElementByClass('inject-checkbox', element);
  this.injectCheckbox = new goog.ui.Checkbox();
  this.injectCheckbox.decorate(cbel);
  this.injectCheckbox.setLabel(goog.dom.getParentElement(cbel));

  this.injectionPointPane = new jsh.InjectionPointPane();
  this.addChild(this.injectionPointPane, true);
  this.restrictionPane = new jsh.RestrictionPane();

  this.addChild(this.restrictionPane, true);
  goog.events.listen(this.injectCheckbox, goog.ui.Component.EventType.CHANGE,
      this.handleInjectCheckboxChange, false, this);

  this.handleInjectCheckboxChange();
  goog.events.listen(this.injectionPointPane,
      [jsh.events.EventType.INJECTION_POINT_ADDED,
        jsh.events.EventType.INJECTION_POINT_REMOVED],
      this.handleInjectionPointsChanged, false, this);

  this.handleInjectionPointsChanged();
};


/**
 * Handles the change of state for the checkbox indicating that the resource
 * should be injected.
 */
jsh.ResourceRestrictions.prototype.handleInjectCheckboxChange = function() {
  var checked = this.injectCheckbox.isChecked();
  goog.style.setElementShown(this.injectionPointPane.getElement(), checked);

  if (!checked) {
    this.injectionPointPane.resetInjectionPoints();
  }
};


/**
 * Handles items being added to the injections point list, to show the
 * restrictions pane
 */
jsh.ResourceRestrictions.prototype.handleInjectionPointsChanged = function() {
  goog.style.setElementShown(this.restrictionPane.getElement(),
      !this.injectionPointPane.hasInjectionPoints());
};
