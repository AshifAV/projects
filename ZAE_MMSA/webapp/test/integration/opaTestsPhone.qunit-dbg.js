/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"com/globalintelli/ZAE_MMSA/test/integration/PhoneJourneys"
	], function() {
		QUnit.start();
	});
});