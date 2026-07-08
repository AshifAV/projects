/*global QUnit*/

sap.ui.define([
	"zsuporder/controller/SupervisorOrder.controller"
], function (Controller) {
	"use strict";

	QUnit.module("SupervisorOrder Controller");

	QUnit.test("I should test the SupervisorOrder controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
