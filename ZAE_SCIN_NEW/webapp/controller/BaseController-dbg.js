 sap.ui.define([
 	"sap/ui/core/mvc/Controller",
 	"sap/ui/core/routing/History"
 ], function (Controller, History) {
 	"use strict";

 	return Controller.extend("com.globalintelli.ZAE_SCIN_NEW.controller.BaseController", {

 		MainAppState: "",

 		navBack: function (oEvent) {
 			var oHistory = History.getInstance();
 			var sPreviousHash = oHistory.getPreviousHash();
 			if (sPreviousHash === undefined || sPreviousHash === "") {
 				window.history.back();
 			} else {
 				window.history.go(-1);
 			}
 			this.getOwnerComponent().getRouter().getView("com.globalintelli.ZAE_SCIN_NEW.view.Main").getController().onNavBack();
 		},

 		getRouter: function () {
 			return sap.ui.core.UIComponent.getRouterFor(this);
 		},

 		formatNameAndValuePair: function (sName, sValue) {
 			if (!sName && !sValue) {
 				return "";
 			} else if (sValue && !sName) {
 				return sValue.replace(/^0+/, "");
 			} else if (!sValue && sName) {
 				return sName;
 			} else {
 				return sName + " (" + sValue.replace(/^0+/, "") + ")";
 			}
 		},
 	});
 });