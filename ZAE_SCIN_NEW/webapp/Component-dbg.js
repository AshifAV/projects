sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/globalintelli/ZAE_SCIN_NEW/model/models",
	'sap/ui/fl/FakeLrepConnectorLocalStorage'
], function (UIComponent, Device, models, FakeLrepConnectorLocalStorage) {
	"use strict";

	return UIComponent.extend("com.globalintelli.ZAE_SCIN_NEW.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			sap.ui.fl.FakeLrepConnectorLocalStorage.enableFakeConnector();
		}
	});
});