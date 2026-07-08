sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"com/globalintelli/ZAE_SFQC/model/formatter"
], function (Controller, MessageBox, JSONModel, Formatter) {
	"use strict";

	return Controller.extend("com.globalintelli.ZAE_SFQC.controller.BaseController", {
		formatter: Formatter,
		geti18n: function (i18n) {
			return this.getView().getModel("i18n").getResourceBundle().getText(i18n) || "ERROR";
		},
		getQueryParam: function (name) {
			var url = window.location.href;
			var temp = name.replace(/[\[\]]/g, "\\$&");
			var regex = new RegExp("[?&]" + temp + "(=([^&#]*)|&|#|$)"),
				results = regex.exec(url);
			if (!results) {
				return null;
			}
			if (!results[2]) {
				return "";
			}
			return decodeURIComponent(results[2].replace(/\+/g, " "));
		},

		resetOverviewPage: function () {
			// debugger;
			var that = this;
			var overviewSubView = that.getView().byId("overviewSubView");
			var overviewController = overviewSubView.getController();
			overviewController._setInitTable();
			// var that = this;
			// var mApp = that.getView().getModel("app");
			// var oAppModel = new JSONModel("./model/app.json");
			// oAppModel.attachRequestCompleted(function (m) {
			// 	var app = m.getSource().getData();
			// 	mApp.setProperty("/pages/Overview", app.pages.Overview);
			// });

			// var sPath = sap.ui.require.toUrl("sap/m/sample/TableBreadcrumb/productHierarchy.json");
			// var oModel = new JSONModel(sPath);
			// this.getView().setModel(oModel);
			// this.getView().setModel(new JSONModel(this.mInitialOrderState), "Order");

		},

		//TODO: Move to UI5Util
		genContextPath: function (context) {
			var path = "";
			if (Array.isArray(context)) {
				//TODO: Make more robust
			} else {
				Object.keys(context).forEach(function (k, i, a) {
					path += k + "='" + context[k] + "'";
					if (i !== a.length - 1) {
						path += ",";
					}
				});
			}
			return "(" + path + ")";
		},

		onImageError: function (oEvent) {
			// debugger;
			oEvent.getSource().setSrc("https://i.ibb.co/5kkWFT1/DFLT.png");
			// try {
			// 	oEvent.getSource().setSrc(this.getOwnerComponent().getManifest()["sap.platform.abap"].uri + "/resource/image/dummyImg.png");
			// } catch (e) {
			// 	oEvent.getSource().setSrc("https://i.ibb.co/5kkWFT1/DFLT.png");
			// }
		},

		setupMessageManager: function () {
			this.oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
			this.oMessageManager = sap.ui.getCore().getMessageManager();
			this.getView().setModel(this.oMessageManager.getMessageModel(), "message");
			this.oMessageManager.registerMessageProcessor(this.oMessageProcessor);
			// this.oMessageManager.registerObject(this.getView(), true);
		},

		isResponseValid: function (response) {
			// var that = this;
			var valid = true;
			if (Array.isArray(response)) {
				response.forEach(function (r) {
					if (!(r.statusCode !== null && r.statusCode !== undefined && (r.statusCode === "200" || r.statusCode === "201"))) {
						valid = false;
						// if (r.message) {
						// 	that.addMessage(r.message, 'ERROR');
						// }
					}
				});
			} else {
				// TODO: Add Logic
				valid = false;
			}
			return valid;
		},

		addMessage: function (message, type) {
			if (!this.oMessageManager) {
				this.oMessageManager = sap.ui.getCore().getMessageManager();
			}
			this.oMessageManager.addMessages(
				new sap.ui.core.message.Message({
					message: message,
					type: type,
					// persistent: true,
					// code: 'E',
					processor: this.oMessageProcessor,
					// descriptionUrl: 'test'
				})
			);
		},

		showMessage: function (title, message, type, actions, onClose) {
			this.addMessage(message, type);
			var opts = {
				icon: type.toUpperCase(),
				title: title,
				persistent: true,
				type: type.toUpperCase()
					// 	onClose: function(oAction) { / * do something * / }
			};
			if (actions === undefined || actions.length === 0) {
				opts.actions = ["CLOSE"];
			} else {
				opts.actions = actions;
			}
			if (onClose === undefined) {
				opts.onClose = function () {};
			} else {
				opts.onClose = onClose;
			}
			MessageBox.show(message, opts);
		},

		onMessagePopoverPress: function (oEvent) {
			this._getMessagePopover().openBy(oEvent.getSource());
		},

		_getMessagePopover: function () {
			// create popover lazily (singleton)
			if (!this._oMessagePopover) {
				this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(), "com.globalintelli.ZAE_SFQC.view.MessagePopover", this);
				this.getView().addDependent(this._oMessagePopover);
			}
			return this._oMessagePopover;
		},

		dateToSrvFormat: function (date) {
			var dd = date.getDate();
			var mm = date.getMonth() + 1; // January is 0!
			var yyyy = date.getFullYear();
			if (dd < 10) {
				dd = "0" + dd;
			}
			if (mm < 10) {
				mm = "0" + mm;
			}
			var epoch = new Date(yyyy + "-" + mm + "-" + dd).getTime();

			return "/Date(" + epoch.toString() + ")/";
		},

		onOpportunityNavigation: function (oEvent) {
			var that = this;
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var mApp = that.getView().getModel("app");
			var opportunity = mApp.getProperty("/pages/Opportunity/opportunity");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Opportunity",
					action: "aeDisplay&//ZAE_C_Opportunity_01(object_type='BUS2000111',Opportunity='" + opportunity +
						"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)"
				}
			})) || "";

			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});
		},

		onSalesProspectNavigation: function (oEvent) {
			var that = this;
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var mApp = that.getView().getModel("app");
			var sales_prospect = mApp.getProperty("/pages/Opportunity/opportunityData/sales_prospect");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Customer",
					action: "aeDisplay"
				},
				params: {
					"Customer": sales_prospect
				}
			})) || "";

			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},

		onContactPersonNavigation: function (oEvent) {
			var that = this;
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var mApp = that.getView().getModel("app");
			var contact_person = mApp.getProperty("/pages/Opportunity/opportunityData/contact_person");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Customer",
					action: "aeDisplay"
				},
				params: {
					"Customer": contact_person
				}
			})) || "";

			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},

		_calTotalPrice: function (items) {
			var price = 0;
			items.forEach(function (i) {
				price += i.netPrice * i.qty;
			});
			return price;
		},

		testFunc: function () {
			return;
		}
	});
});