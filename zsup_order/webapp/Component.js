/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "zsuporder/model/models"
],
function (UIComponent, Device, models) {
    "use strict";

    return UIComponent.extend("zsuporder.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            
            // Initialize the router
            this.getRouter().initialize();
            
            // Set the device model
            this.setModel(models.createDeviceModel(), "device");
            
            // Load sap.ui.comp library if not already loaded
            var oCore = sap.ui.getCore();
            if (!oCore.getLibraryResourceBundle("sap.ui.comp")) {
                oCore.loadLibrary("sap.ui.comp", {
                    version: "1.65.6"
                });
            }
        }
    });
});