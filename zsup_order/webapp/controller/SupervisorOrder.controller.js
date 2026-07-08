sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("zsuporder.controller.SupervisorOrder", {

        onInit: function () {
            // Set default date
            const today = new Date().toISOString().split('T')[0];
            this.byId("orderDate").setValue(today);
            
            // TODO: Add signature pad logic later
        },

        onNavBack: function () {
            MessageToast.show("Navigating back...");
        },

        onSaveOrder: function () {
            MessageToast.show("Order Saved Successfully!");
        },

        onClearSignature: function () {
            MessageToast.show("Clear Signature clicked (Implement later)");
        },

        onCancel: function () {
            MessageToast.show("Cancelled");
        }

    });
});