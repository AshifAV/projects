sap.ui.define([
	"../BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.globalintelli.ZAE_SFQC.controller.subview.Confirmation", {
		onInit: function () {

		},

		onDocumentNavigate: function () {
			var that = this;
			var mApp = that.getView().getModel("app");
			var document = mApp.getProperty("/pages/Confirmation/data/document");
			var type = mApp.getProperty("/pages/Confirmation/data/type");
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			// var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			// var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			// var appState = {};
			// oAppState.setData(appState);
			// oAppState.save();
			// var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			// var sOldHash = oHashChanger.getHash();
			// var sNewHash = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			// oHashChanger.replaceHash(sNewHash);

			var semanticObject = "SalesQuotation";
			var action = "aesContract&/ZAE_C_Quotation_08('" + document + "')";
			if (type === "L") {
				semanticObject = "SalesQuotation";
				action = "aelDisplay&/ZAE_C_Quotation_03(SalesQuotation='" + document +
					"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)";
			} else if (type === "I") {
				semanticObject = "SalesInquiry";
				action = "aeuDisplay&/ZAE_C_SalesInquiry_01('" + document + "')";
			}

			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: semanticObject,
					action: action
				}
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},

		onTradeInNavigate: function () {
			var that = this;
			var mApp = that.getView().getModel("app");
			var tradeInDoc = mApp.getProperty("/pages/Confirmation/data/tradeInDoc");
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			// var sComponentId = sap.ui.core.Component.getOwnerIdFor(this.getView());
			// var oAppState = oCrossAppNavigator.createEmptyAppState(sap.ui.component(sComponentId));
			// var appState = {};
			// oAppState.setData(appState);
			// oAppState.save();
			// var oHashChanger = sap.ui.core.routing.HashChanger.getInstance();
			// var sOldHash = oHashChanger.getHash();
			// var sNewHash = sOldHash + "?" + "sap-iapp-state=" + oAppState.getKey();
			// oHashChanger.replaceHash(sNewHash);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "MaintenanceNotification",
					action: "aesDisplay&/ZAE_C_Notification_01('" + tradeInDoc + "')"
				}
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		}
	});

});