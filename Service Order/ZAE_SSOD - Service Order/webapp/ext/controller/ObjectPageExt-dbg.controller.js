sap.ui.define([
	"sap/ui/core/Fragment",
	"com/globalintelli/zae_flib/controller/aeUtility/",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
	'sap/m/SearchField',
	'sap/m/Token',
	'sap/ui/model/type/String',
	'sap/m/ColumnListItem',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	"sap/m/MessageBox",
	"com/globalintelli/zae_ssod/ext/util/treeFunctions",
	"com/globalintelli/zae_flib/controller/aeUI5Utility",
	"sap/ui/export/library",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast",
	"sap/ui/core/HTML",
	"com/globalintelli/zae_ssod/ext/external/xlsx"

], function (Fragment, aeUtility, JSONModel, Dialog, DialogType, Button, ButtonType, Text,
	SearchField, Token, typeString, ColumnListItem, Filter, FilterOperator, MessageBox, treeFunctions, aeUI5Utility, exportLibrary,
	Spreadsheet, MessageToast, HTML) {
	"use strict";
	var EdmType = exportLibrary.EdmType;
	return sap.ui.controller("com.globalintelli.zae_ssod.ext.controller.ObjectPageExt", {

		i18nPath: "i18n",
		aeUtil: new aeUtility(),
		aeUI5Util: new aeUI5Utility(),
		treeFunctions: new treeFunctions(),
		_oDynamicNotesDialog: {},
		_valueHelpDialogs: [],
		constant: {
			MaterialPath: "/MaterialVHData",
			ItmCategory: "/ItemCategory",
			ItmCategoryDesc: "/ItemCategoryDesc",
			BindingPath: "/ZAE_VH_Material_01",
			InspectionLotBindingPath: "/ZAE_VH_InspectionChar"
		},
		onInit: function (oEvent) {
			this.aeUtil.resetLibrary();
			this.aeUI5Util.resetLibrary();
			this.aeUtil.fnRemoveShareButton(this);
			this.ServiceHistoryTab = false;
			this.PricingSummaryTab = false;
			this.ItemPricingSummaryTab = false;
			this.CompPricingSummaryTab = false;
			var oNotes = {
				nItemData: [],
				workEst: "",
				ConcatinatedCategorizationSchemaTreeTableData: [],
				vComplaints: [{
					Complaint: "",
					ComplaintKey: "",
					ComplaintDescription: "",
					ItemCatUsage: "",
					EmpResp: ""
				}]
			};
			var oModel = new JSONModel();
			oModel.setData(oNotes);
			this.getView().setModel(oModel, "mNotes");

			var oJsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oJsonModel, "mDownPayAmt");

			var oJsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oJsonModel, "mApplyDiscount");
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var oPriorityModel = {
				edit: true
			};
			var oModel1 = new JSONModel();
			oModel1.setData(oPriorityModel);
			this.getView().setModel(oModel, "mPriority");
			var oView = this.getView();
			var oTblID = this.createId("CPFacet::responsiveTable");
			var oItemTbl = oView.byId(oTblID);
			if (oItemTbl) {
				// oVehicleTbl.attachUpdateFinished(this.fnGetNPSandPDSSScore, this);
				oItemTbl.getParent().attachBeforeRebindTable(function (oEvent) {
					var binding = oEvent.getParameter("bindingParams");
					binding.parameters.select = binding.parameters.select +
						',AvailableQuantity,AvailableQuantityCriti,AvailableQuantityUnit,ItemCategoryGroup,ItemLongText,OperationQuantity,GrossValue,Discount,isShowSSOD_B126,isShowSSOD_B127,isShowSSOD_B128,isShowSSOD_B129,isShowSSOD_B130,isShowSSOD_B132,isShowSSOD_B133,isShowSSOD_B134,isShowSSOD_B135,isShowSSOD_B136,MItemCategoryGroup';

				});
			}
			var oTableLSHF = this.createId("HSLFacet::responsiveTable");
			var oView = this.getView();
			var oTableLSH = oView.byId(oTableLSHF);
			if (oTableLSH) {
				oTableLSH.setMode("None");
				oTableLSH.getParent().setInitialNoDataText("To Start, Click on Load Legacy History");
				oTableLSH.getParent().attachBeforeRebindTable(function (oEvent) {
					var binding = oEvent.getParameter("bindingParams");
					if (this.LegacyServiceHistoryTab) {
						binding.preventTableBind = false;
					} else {
						binding.preventTableBind = true;
					}

				}.bind(this));
			}
			// ServiceHistoryTab
			var oTableSHF = this.createId("HSFacet::responsiveTable");
			var oView = this.getView();
			var oTableSH = oView.byId(oTableSHF);
			if (oTableSH) {
				oTableSH.setMode("None");
				oTableSH.getParent().setInitialNoDataText("To Start, Click on Load Service History");
				oTableSH.getParent().attachBeforeRebindTable(function (oEvent) {
					var binding = oEvent.getParameter("bindingParams");
					if (this.ServiceHistoryTab) {
						binding.preventTableBind = false;
					} else {
						binding.preventTableBind = true;
					}

				}.bind(this));
			}

			// var oTableSHF = this.createId("SHFFacet::responsiveTable");
			// var oView = this.getView();
			// var oTableSH = oView.byId(oTableSHF);
			// if (oTableSH) {
			// 	oTableSH.setMode("None");
			// 	oTableSH.getParent().setInitialNoDataText("To Start, Click on Load History");
			// 	oTableSH.getParent().attachBeforeRebindTable(function (oEvent) {
			// 		var binding = oEvent.getParameter("bindingParams");
			// 		if (this.ServiceHistoryTab) {
			// 			binding.preventTableBind = false;
			// 		} else {
			// 			binding.preventTableBind = true;
			// 		}

			// 	}.bind(this));
			// }

			// Pricing Summanry 
			var Buttons = ["SSOD_B137Button", "SSOD_B157Button", "SSOD_B158Button"];
			var oView = this.getView();
			Buttons.forEach(function (obj) {
				if (oView.byId(obj)) {
					oView.byId(obj).setIcon("sap-icon://table-view");
					oView.byId(obj).setTooltip("Fetch Data");
				}
			});
			var oTablePSF = this.createId("PSFacet::responsiveTable");
			var oView = this.getView();
			var oTablePS = oView.byId(oTablePSF);
			if (oTablePS) {
				oTablePS.setMode("None");
				oTablePS.getParent().setInitialNoDataText("To Start, Click on Fetch Data Icon");
				oTablePS.getParent().attachBeforeRebindTable(function (oEvent) {
					var binding = oEvent.getParameter("bindingParams");
					if (this.PricingSummaryTab) {
						binding.preventTableBind = false;
					} else {
						binding.preventTableBind = true;
					}

				}.bind(this));
			}
			// Operations Tab
			var oCRTable = this.getView().byId(this.createId("CRFacet::responsiveTable"));
			if (oCRTable) {
				oCRTable.setMode("None");
				oCRTable.getParent().setInitialNoDataText("To Start, Click on Fetch Data Icon");
				oCRTable.getParent().attachBeforeRebindTable(function (oEvent) {
					var binding = oEvent.getParameter("bindingParams");
					if (this.ItemPricingSummaryTab) {
						binding.preventTableBind = false;
					} else {
						binding.preventTableBind = true;
					}
				}.bind(this));

				// oCRTable.getParent().getSemanticObjectController().attachNavigationTargetsObtained(function (oEvent) {
				// 	debugger;
				// 	var oEvent;
				// 	return;
				// });
				// oCRTable.getParent().getSemanticObjectController().setBeforeNavigationCallback(function (Obj) {
				// 	var ConditionType = Obj.semanticAttributes.PricesInSales;
				// 	if (!ConditionType) {
				// 		ConditionType = Obj.semanticAttributes.ConditionType;
				// 	}
				// 	// oEvent.getParameter("semanticAttributesOfSemanticObjects")["ConditionType"] = {
				// 	// 	"ConditionType": ConditionType,
				// 	// 	"openMode": "external"
				// 	// };
				// 	var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				// 		target: {
				// 			semanticObject: "PricesInSales",
				// 			action: "manage"
				// 		},
				// 		params: {
				// 			"ConditionType": ConditionType,
				// 			"openMode": "external"
				// 		}
				// 	})) || "";
				// 	var url = window.location.href.split('#')[0] + hash;
				// 	sap.m.URLHelper.redirect(url, true);
				// 	this.Navigationcheck = true;
				// 	// oEvent.getParameters().setAppStateKey("");
				// }.bind(this));

				oCRTable.getParent().getSemanticObjectController().attachBeforePopoverOpens(function (oEvent) {
					// if (this.Navigationcheck && oEvent) {
					var ConditionType = oEvent.getParameter("semanticAttributesOfSemanticObjects")[""].PricesInSales;
					if (!ConditionType) {
						ConditionType = oEvent.getParameter("semanticAttributesOfSemanticObjects")[""].ConditionType;
					}
					oEvent.getParameter("semanticAttributesOfSemanticObjects")["ConditionType"] = {
						"ConditionType": ConditionType,
						"openMode": "external"
					};
					var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
						target: {
							semanticObject: "PricesInSales",
							action: "manage"
						},
						params: {
							"ConditionType": ConditionType,
							"openMode": "external"
						}
					})) || "";
					var url = window.location.href.split('#')[0] + hash;
					sap.m.URLHelper.redirect(url, true);
					oEvent.getParameters().setAppStateKey("");
					// }
				}.bind(this));

			}

			// component Table
			var oCRRTable = this.getView().byId(this.createId("CCRFacet::responsiveTable"));
			if (oCRRTable) {
				oCRRTable.setMode("None");
				oCRRTable.getParent().setInitialNoDataText("To Start, Click on Fetch Data Icon");
				oCRRTable.getParent().attachBeforeRebindTable(function (oEvent) {
					var binding = oEvent.getParameter("bindingParams");
					if (this.CompPricingSummaryTab) {
						binding.preventTableBind = false;
					} else {
						binding.preventTableBind = true;
					}

				}.bind(this));

				// oCRRTable.getParent().getSemanticObjectController().setBeforeNavigationCallback(function (Obj) {

				// 	var ConditionType = Obj.semanticAttributes.PricesInSales;
				// 	if (!ConditionType) {
				// 		ConditionType = Obj.semanticAttributes.ConditionType;
				// 	}
				// 	// oEvent.getParameter("semanticAttributesOfSemanticObjects")["ConditionType"] = {
				// 	// 	"ConditionType": ConditionType,
				// 	// 	"openMode": "external"
				// 	// };
				// 	var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				// 		target: {
				// 			semanticObject: "PricesInSales",
				// 			action: "manage"
				// 		},
				// 		params: {
				// 			"ConditionType": ConditionType,
				// 			"openMode": "external"
				// 		}
				// 	})) || "";
				// 	var url = window.location.href.split('#')[0] + hash;
				// 	sap.m.URLHelper.redirect(url, true);
				// 	this.Navigationcheck = true;
				// 	// oEvent.getParameters().setAppStateKey("");
				// }.bind(this));

				oCRRTable.getParent().getSemanticObjectController().attachBeforePopoverOpens(function (oEvent) {
					// if (this.Navigationcheck && oEvent) {
					var ConditionType = oEvent.getParameter("semanticAttributesOfSemanticObjects")[""].PricesInSales;
					if (!ConditionType) {
						ConditionType = oEvent.getParameter("semanticAttributesOfSemanticObjects")[""].ConditionType;
					}
					oEvent.getParameter("semanticAttributesOfSemanticObjects")["ConditionType"] = {
						"ConditionType": ConditionType,
						"openMode": "external"
					};
					var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
						target: {
							semanticObject: "PricesInSales",
							action: "manage"
						},
						params: {
							"ConditionType": ConditionType,
							"openMode": "external"
						}
					})) || "";
					var url = window.location.href.split('#')[0] + hash;
					sap.m.URLHelper.redirect(url, true);
					oEvent.getParameters().setAppStateKey("");
					// }
				}.bind(this));
			}

			var oTableOPID = this.createId("OPFacet::responsiveTable");
			var oView = this.getView();
			var oTableOP = oView.byId(oTableOPID);
			if (oTableOP) {
				oTableOP.setGrowingThreshold(100);
				oTableOP.getParent().attachBeforeRebindTable(function (oEvent) {
					var binding = oEvent.getParameter("bindingParams");
					binding.parameters.select = binding.parameters.select +
						',ItemCategoryGroup,NetValue,GrossValue,Discount,subtotal5,isShowSSOD_B105,isShowSSOD_B106,isShowSSOD_B107,isShowSSOD_B108,isShowSSOD_B109,ItemLongText';
					// ',NetValue,GrossValue,Discount,subtotal5,isShowSSOD_B105,isShowSSOD_B106,isShowSSOD_B107+isShowSSOD_B108,isShowSSOD_B109';
				}.bind(this));
			}

			this.extensionAPI.attachPageDataLoaded(function (oEvent) {
				this._fnPricingSummaryTab(oEvent);
				// this._fnServiceHistoryTab(oEvent);
				// this._fnLegacyServiceHistoryTab(oEvent);
			}.bind(this));

		},
		// _fnLegacyServiceHistoryTab: function (oEvent) {
		// 	var oTableLSHF = this.createId("HSLFacet::responsiveTable");
		// 	var oView = this.getView();
		// 	var oTableLSH = oView.byId(oTableLSHF);
		// 	if (oTableLSH && oTableLSH.getBinding("items")) {
		// 		oTableLSH.setMode("None");
		// 		oTableLSH.getBinding("items").suspend(true);
		// 		oTableLSH.setNoDataText("To Start, Click on Load Legacy History");
		// 	}
		// },
		// _fnServiceHistoryTab: function (oEvent) {
		// 	var oTableSHF = this.createId("HSFacet::responsiveTable");
		// 	var oView = this.getView();
		// 	var oTableSH = oView.byId(oTableSHF);
		// 	if (oTableSH && oTableSH.getBinding("items")) {
		// 		oTableSH.setMode("None");
		// 		oTableSH.getBinding("items").suspend(true);
		// 		oTableSH.setNoDataText("To Start, Click on Load Service History");
		// 	}
		// },

		_fnPricingSummaryTab: function (oEvent) {
			var oTablePSF = this.createId("PSFacet::responsiveTable");
			var oView = this.getView();
			var oTablePS = oView.byId(oTablePSF);
			if (oTablePS && oTablePS.getBinding("items")) {
				oTablePS.setMode("None");
				oTablePS.getBinding("items").suspend(true);
				oTablePS.setNoDataText("To Start, Click on Fetch Data Icon");
			}
		},

		onAfterRendering: function (oEvent) {
			this.onInitChangeDocs();
		},
		onClickSSOD_B01: function (oEvent) {
			var that = this;
			/*var pageData = this.aeUtil.getPageData(oEvent);*/
			var oSource = oEvent.getSource();
			if (!this.oWarningDialog) {
				this.oWarningDialog = new Dialog({
					type: DialogType.Message,
					title: "Warning",
					icon: "sap-icon://message-warning",
					content: new Text({
						text: "Once Released it's not possible to make changes.. Verify the Service order details to ensure that data is correct."
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Continue",
						press: function () {
							this.oWarningDialog.close();
							/*var pageData = that.aeUtil.getPageData(oEvent);*/
							var pageData = that.getView().getBindingContext().getObject();
							var actId = "SSOD_B01";
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var oModel = oSource.getModel();
							var oEntity = "ZAE_FM_SSOD_STATUS_BILLINGSet";
							var data = [{
								callProperty: "IOrderId",
								value: pageData.ServiceOrder
							}];
							var succFunc = function (oData, response) {
								that.extensionAPI.refresh();
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function () {
							this.oWarningDialog.close();
						}.bind(this)
					})
				});
			}
			this.oWarningDialog.addStyleClass("sapUiContentPadding");
			this.oWarningDialog.open();

		},
		onClickSSOD_B02: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B02";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_STAT_RELOPERATIONSSet";
			var data = [{
				callProperty: "IOrderId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		onClickSSOD_B03: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B03";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_STAT_COMPLETEORDERSet";
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		onClickSSOD_B04old: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B04";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_STATUS_CLOSEORDERSet";
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},

		// onClickSSOD_B04: function (oEvent) {
		// 	var that = this;
		// 	var oSource = oEvent.getSource();
		// 	var pageData = that.getView().getBindingContext().getObject();
		// 	var actId = "SSOD_B04";
		// 	var actLabel = this.aeUtil.geti18nText(that, actId);
		// 	var fragName = "com.globalintelli.zae_ssod.ext.fragment.CloseServiceOrder";
		// 	var oModel = oSource.getModel();
		// 	var oEntity = "ZAE_FM_SSOD_STATUS_CLOSEORDERSet";
		// 	var dialogFields = [{
		// 		fragInputId: "StatusreasonInput",
		// 		fragInputLabel: this.aeUtil.geti18nText(that, "StatusreasonInput"),
		// 		vhEntitySet: "ZAE_I_ActivityStatusReasonCode",
		// 		vhEntitySetFilter: [{
		// 			path: 'TransactionType',
		// 			operator: 'EQ',
		// 			value1: "'" + pageData.ServiceDocumentType + "'"
		// 		}],
		// 		vhSearchKey: "Code",
		// 		vhSearchText: "CodeText",
		// 		callProperty: "StatusReason"
		// 	}];
		// 	var data = [{
		// 		callProperty: "ObjectId",
		// 		value: pageData.ServiceOrder
		// 	}];
		// 	var checkFucc = function () {
		// 		var oStatusreasonInput = Fragment.byId(actId + "Fragment", "StatusreasonInput").getValue();
		// 		if (oStatusreasonInput === "" || oStatusreasonInput === undefined) {
		// 			return {
		// 				pass: false,
		// 				msg: this.aeUtil.geti18nText(that, "Select_Status_Reason")
		// 			};
		// 		} else {
		// 			return {
		// 				pass: true
		// 			};
		// 		}
		// 	}.bind(this);
		// 	var succFunc = function (oData) {
		// 		that.extensionAPI.refresh();
		// 		that.getView().setBusy(false);
		// 	}.bind(this);
		// 	var errorFunc = function (oData) {
		// 		that.extensionAPI.refresh();
		// 		that.getView().setBusy(false);
		// 	}.bind(this);
		// 	this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);
		// },

		onClickSSOD_B04: function (oEvent) {
			if (!this._oStatusReasonDialog) {
				Fragment.load({
						id: "StatusReason",
						name: "com.globalintelli.zae_ssod.ext.fragment.CloseServiceOrder",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateStatusReasonDialog(oDialogContent);
						this._setStatusReasonDialogInitialState();
						this._checkReservationsAndUpdateTextMessage(); // New function to handle dynamic message creation
					}.bind(this));
			} else {
				this._setStatusReasonDialogInitialState();
				this._checkReservationsAndUpdateTextMessage(); // Ensure dynamic message is updated if dialog is already created
			}
		},

		_setStatusReasonDialogInitialState: function () {
			var that = this;
			var aFilter = [];
			var pageData = that.getView().getBindingContext().getObject();
			//aFilter.push(new sap.ui.model.Filter("TransactionType", sap.ui.model.FilterOperator.EQ, "'" + pageData.ServiceDocumentType + "'"));
			aFilter.push(new sap.ui.model.Filter("TransactionType", sap.ui.model.FilterOperator.EQ, pageData.ServiceDocumentType));
			Fragment.byId("StatusReason", "StatusreasonInput").getBinding("items").filter(aFilter);
			Fragment.byId("StatusReason", "StatusreasonInput").setSelectedKey(null);
			Fragment.byId("StatusReason", "SSOD_B04MessageStrip").setVisible(false);
			this._oStatusReasonDialog.open();
		},
		_CreateStatusReasonDialog: function (oDialogContent, oEvent) {
			var that = this;

			this._oStatusReasonDialog = new sap.m.Dialog({
				title: "{i18n>SSOD_B04}",
				contentWidth: "30em",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "Submit",
					press: function () {
						var pageData = that.getView().getBindingContext().getObject();
						//var selSecData = this.aeUtil.getSecData(that, "OPFacet");
						var oStatusreasonInput = Fragment.byId("StatusReason", "StatusreasonInput").getSelectedKey();
						var oTextMessage = Fragment.byId("StatusReason", "SSOD_B04TextMessage"); //for confirmation msg
						/*	if (oStatusreasonInput === "") {
								var msg2 = "Fill out mandatory field";
								var oMessageStrip = Fragment.byId("StatusReason", "SSOD_B04MessageStrip");
								oMessageStrip.setVisible(true);
								oMessageStrip.setText(msg2);
								return;
							}*/

						if (!oStatusreasonInput) {
							//	oTextMessage.setText("Please fill out the mandatory field.");
							var msg2 = "Fill out mandatory field";
							var oMessageStrip = Fragment.byId("StatusReason", "SSOD_B04MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);

							oTextMessage.setVisible(true);
							return;
						}
						var actId = "SSOD_B04";
						var actLabel = that.aeUtil.geti18nText(that, actId);
						var oModel = that.getView().getModel();
						var oEntity = "ZAE_FM_SSOD_STATUS_CLOSEORDERSet";
						that.getView().setBusy(true);
						var data = [{
							callProperty: "ObjectId",
							value: pageData.ServiceOrder
						}, {
							callProperty: "StatusReason",
							value: oStatusreasonInput
						}];
						var succFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						var errorFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errorFunc);
						that._oStatusReasonDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Close",
					press: function () {
						this._oStatusReasonDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oStatusReasonDialog);

		},

		_checkReservationsAndUpdateTextMessage: function () {
			var that = this;
			var msg;
			var temp;
			var pageData = this.getView().getBindingContext().getObject();
			var aFilter = [
				new sap.ui.model.Filter("ObjectId", sap.ui.model.FilterOperator.EQ, pageData.ServiceOrder),
				new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, pageData.Equipment)
			];

			that.getView().getModel().read("/ZAE_I_Reserved_Stock_04", {
				filters: aFilter,
				success: function (oData) {
					if (oData.results.length > 0) {
						for (var i = 0; i < oData.results.length; i++) {
							if (oData.results[i].blockedQuantity > 0) {
								temp = "Reservation for item number " + oData.results[i].ItemWithOutLdngZero +
									" Material " + oData.results[i].OriginallyRequestedProduct +
									" exists for Qty " + oData.results[i].blockedQuantity +
									" " + oData.results[i].UnitOfMeasure;
								msg = msg ? msg + "\n" + temp : temp;
							}
						}
						//	msg = "Reservation for item number"; //Added for testing
						if (msg) {
							msg += "\n\nDo you want to continue without de-reserving the item? If yes, press SUBMIT.";
						}
					}
					var oTextMessage = Fragment.byId("StatusReason", "SSOD_B04TextMessage");
					if (msg) {
						oTextMessage.setText(msg);
						oTextMessage.setVisible(true);
					} else {
						oTextMessage.setVisible(false);
					}
				},
				error: function () {
					sap.m.MessageToast.show("Error fetching reservations.");
				}
			});
		},

		onClickSSOD_B05: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B05";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_WARRANTY_CLAIM_CREATESet";
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		onClickSSOD_B16: function (oEvent) {
			var ButtonID = "SSOD_B16";
			this.fnDynamicNotes(ButtonID);
			// var that = this;
			// var pageData = this.aeUtil.getPageData(oEvent);
			// if (pageData.E0012NoteMandatory === true) {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.getView().getBindingContext().getObject();
			// 	var actId = "SSOD_B16";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);

			// 	var fragName = "com.globalintelli.zae_ssod.ext.fragment.JCRecvdbywarantyteam";
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_JCSet";
			// 	var dialogFields = [{
			// 		fragInputId: "Note",
			// 		fragInputLabel: this.aeUtil.geti18nText(that, "Note"),
			// 		callProperty: "Note"
			// 	}];
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];

			// 	var checkFucc = function () {
			// 		var vNote = Fragment.byId(actId + "Fragment", "Note").getValue();
			// 		if (vNote === "" || vNote === undefined) {
			// 			return {
			// 				pass: false,
			// 				msg: this.aeUtil.geti18nText(that, "Add_notes")
			// 			};
			// 		} else {
			// 			return {
			// 				pass: true
			// 			};
			// 		}
			// 	}.bind(this);
			// 	var succFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};
			// 	var errorFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};

			// 	this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, errorFunc);

			// } else {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.aeUtil.getPageData(oEvent);
			// 	var actId = "SSOD_B16";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_JCSet";
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];
			// 	var succFunc = function (oData, response) {
			// 		this.extensionAPI.refresh();
			// 	}.bind(this);
			// 	this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

			// }
		},
		onClickSSOD_B17: function (oEvent) {
			var ButtonID = "SSOD_B17";
			this.fnDynamicNotes(ButtonID);
			// var that = this;
			// var pageData = this.aeUtil.getPageData(oEvent);
			// if (pageData.E0013NoteMandatory === true) {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.getView().getBindingContext().getObject();
			// 	var actId = "SSOD_B17";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);

			// 	var fragName = "com.globalintelli.zae_ssod.ext.fragment.WaitingPQRReport";
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_WPQRSet";
			// 	var dialogFields = [{
			// 		fragInputId: "Note",
			// 		fragInputLabel: this.aeUtil.geti18nText(that, "Note"),
			// 		callProperty: "Note"
			// 	}];
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];

			// 	var checkFucc = function () {
			// 		var vNote = Fragment.byId(actId + "Fragment", "Note").getValue();
			// 		if (vNote === "" || vNote === undefined) {
			// 			return {
			// 				pass: false,
			// 				msg: this.aeUtil.geti18nText(that, "Add_notes")
			// 			};
			// 		} else {
			// 			return {
			// 				pass: true
			// 			};
			// 		}
			// 	}.bind(this);
			// 	var succFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};
			// 	var errorFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};

			// 	this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, errorFunc);

			// } else {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.aeUtil.getPageData(oEvent);
			// 	var actId = "SSOD_B17";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_WPQRSet";
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];
			// 	var succFunc = function (oData, response) {
			// 		this.extensionAPI.refresh();
			// 	}.bind(this);
			// 	this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

			// }
		},
		onClickSSOD_B18: function (oEvent) {
			var ButtonID = "SSOD_B18";
			this.fnDynamicNotes(ButtonID);
			// var that = this;
			// var pageData = this.aeUtil.getPageData(oEvent);
			// if (pageData.E0014NoteMandatory === true) {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.getView().getBindingContext().getObject();
			// 	var actId = "SSOD_B18";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);

			// 	var fragName = "com.globalintelli.zae_ssod.ext.fragment.WarrantyProcessing";
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_WPSet";
			// 	var dialogFields = [{
			// 		fragInputId: "Note",
			// 		fragInputLabel: this.aeUtil.geti18nText(that, "Note"),
			// 		callProperty: "Note"
			// 	}];
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];

			// 	var checkFucc = function () {
			// 		var vNote = Fragment.byId(actId + "Fragment", "Note").getValue();
			// 		if (vNote === "" || vNote === undefined) {
			// 			return {
			// 				pass: false,
			// 				msg: this.aeUtil.geti18nText(that, "Add_notes")
			// 			};
			// 		} else {
			// 			return {
			// 				pass: true
			// 			};
			// 		}
			// 	}.bind(this);
			// 	var succFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};
			// 	var errorFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};

			// 	this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, errorFunc);

			// } else {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.aeUtil.getPageData(oEvent);
			// 	var actId = "SSOD_B18";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_WPSet";
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];
			// 	var succFunc = function (oData, response) {
			// 		this.extensionAPI.refresh();
			// 	}.bind(this);
			// 	this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

			// }
		},
		onClickSSOD_B19: function (oEvent) {
			var ButtonID = "SSOD_B19";
			this.fnDynamicNotes(ButtonID);
			// var that = this;
			// var pageData = this.aeUtil.getPageData(oEvent);
			// if (pageData.E0015NoteMandatory === true) {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.getView().getBindingContext().getObject();
			// 	var actId = "SSOD_B19";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);

			// 	var fragName = "com.globalintelli.zae_ssod.ext.fragment.WarrantyPartiallyClosed";
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_PCSet";
			// 	var dialogFields = [{
			// 		fragInputId: "Note",
			// 		fragInputLabel: this.aeUtil.geti18nText(that, "Note"),
			// 		callProperty: "Note"
			// 	}];
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];

			// 	var checkFucc = function () {
			// 		var vNote = Fragment.byId(actId + "Fragment", "Note").getValue();
			// 		if (vNote === "" || vNote === undefined) {
			// 			return {
			// 				pass: false,
			// 				msg: this.aeUtil.geti18nText(that, "Add_notes")
			// 			};
			// 		} else {
			// 			return {
			// 				pass: true
			// 			};
			// 		}
			// 	}.bind(this);
			// 	var succFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};
			// 	var errorFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};

			// 	this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, errorFunc);

			// } else {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.aeUtil.getPageData(oEvent);
			// 	var actId = "SSOD_B19";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_PCSet";
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];
			// 	var succFunc = function (oData, response) {
			// 		this.extensionAPI.refresh();
			// 	}.bind(this);
			// 	this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
			// }
		},
		onClickSSOD_B20: function (oEvent) {
			var ButtonID = "SSOD_B20";
			this.fnDynamicNotes(ButtonID);
			// var that = this;
			// var pageData = this.aeUtil.getPageData(oEvent);
			// if (pageData.E0016NoteMandatory === true) {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.getView().getBindingContext().getObject();
			// 	var actId = "SSOD_B20";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);

			// 	var fragName = "com.globalintelli.zae_ssod.ext.fragment.WarrantyClosedClaimed";
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_CCSet";
			// 	var dialogFields = [{
			// 		fragInputId: "Note",
			// 		fragInputLabel: this.aeUtil.geti18nText(that, "Note"),
			// 		callProperty: "Note"
			// 	}];
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];

			// 	var checkFucc = function () {
			// 		var vNote = Fragment.byId(actId + "Fragment", "Note").getValue();
			// 		if (vNote === "" || vNote === undefined) {
			// 			return {
			// 				pass: false,
			// 				msg: this.aeUtil.geti18nText(that, "Add_notes")
			// 			};
			// 		} else {
			// 			return {
			// 				pass: true
			// 			};
			// 		}
			// 	}.bind(this);
			// 	var succFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};
			// 	var errorFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};

			// 	this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, errorFunc);

			// } else {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.aeUtil.getPageData(oEvent);
			// 	var actId = "SSOD_B20";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_CCSet";
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];
			// 	var succFunc = function (oData, response) {
			// 		this.extensionAPI.refresh();
			// 	}.bind(this);
			// 	this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

			// }
		},
		onClickSSOD_B21: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B21";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_STATUS_PDSet";
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		onClickSSOD_B06_old: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = that.getView().getBindingContext().getObject();
			var actId = "SSOD_B06";
			var actLabel = that.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.DownpayAmt";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_STATUS_RELFORDOWNPSet";
			var dialogFields = [{
				fragInputId: "DownPayAmtInput",
				fragInputLabel: that.aeUtil.geti18nText(that, "DOWNPAYAMT"),
				callProperty: "DownpayAmt"
			}];
			var data = [{
				callProperty: "IOrderId",
				value: pageData.ServiceOrder
			}];
			var checkFucc = function () {
				var DPAmount = Fragment.byId(actId + "Fragment", "DownPayAmtInput").getValue();
				var pageData = that.getView().getBindingContext().getObject();
				var NetAmount = pageData.ServiceDocNetAmount;
				DPAmount = DPAmount + ".00";
				if (DPAmount === "" || DPAmount === undefined) {
					return {
						pass: false,
						msg: that.aeUtil.geti18nText(that, "ENTER_DOWNPAYMENT_AMT")
					};
				} else {
					if (Number(DPAmount) > Number(NetAmount)) {
						return {
							pass: false,
							msg: that.aeUtil.geti18nText(that, "ENTER_DOWNPAYMENT")
						};

					} else {
						return {
							pass: true
						};
					}
				}
			}.bind(this);
			var succFunc = function (oData, response) {
				that.extensionAPI.refresh();
			}.bind(this);

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);
		},

		onClickSSOD_B06: function (oEvent) {
			var that = this;
			var pageData = that.getView().getBindingContext().getObject();
			var mDownPayAmt = that.getView().getModel("mDownPayAmt");
			var mDownPayAmtData = {
				value: 1,
				min: 1,
				max: 99,
				ServiceDocNetAmount: pageData.ServiceDocNetAmount,
				ServiceOrder: pageData.ServiceOrder
			};
			mDownPayAmt.setData(mDownPayAmtData);
			mDownPayAmt.updateBindings(true);
			if (!this._oNewDownPayAmtDialog) {
				Fragment.load({
						id: "fragDownPayAmt",
						name: "com.globalintelli.zae_ssod.ext.fragment.DownpayAmt",
						controller: {
							fnCalDownPayAmt: function (sliderValue, netValue) {
								return (Number(netValue) / 100) * Number(sliderValue);
							},
							onSubmitPressed: function () {
								var actId = "SSOD_B06";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var mDownPayAmt2 = that.getView().getModel("mDownPayAmt");
								var mDownPayAmtData2 = mDownPayAmt2.getData();
								var oModel = that.getView().getModel();
								var oEntity = "ZAE_FM_SSOD_STATUS_RELFORDOWNPSet";
								var data = [{
									callProperty: "IOrderId",
									value: mDownPayAmtData2.ServiceOrder
								}, {
									callProperty: "DownpayAmt",
									value: mDownPayAmtData2.value + ".00"
								}];

								var succFunc = function (oData, response) {
									that.aeUtil.refreshControlModel(that.getView());
								}.bind(that);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
								that._oNewDownPayAmtDialog.close();
							},
							onCancelPressed: function () {
								that._oNewDownPayAmtDialog.close();
							}
						}
					})
					.then(function (oDialogContent) {
						that._oNewDownPayAmtDialog = oDialogContent;
						that.extensionAPI.attachToView(that._oNewDownPayAmtDialog);
						this._setDownPayAmtDialogInitialState();
					}.bind(this));
			} else {
				this._setDownPayAmtDialogInitialState();
			}

		},

		_setDownPayAmtDialogInitialState: function () {
			this._oNewDownPayAmtDialog.open();

		},

		onClickSSOD_B07: function (oEvent) {
			var that = this;
			var oView = this.getView();
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "BDFacet");
			var actId = "SSOD_B07";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SALESDOC_CMPLT_BILLINGSet";
			var data = [{
				callProperty: "Vbeln",
				value: selSecData.BillingDocument
			}];
			var succFunc = function (oData, response) {
				this.aeUtil.refreshControlModel(oView);
			}.bind(this);
			var errFunc = function (oData, response) {
				this.aeUtil.refreshControlModel(oView);
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);
		},
		onClickSSOD_B08: function (oEvent) {

			var pageData = this.getView().getBindingContext().getObject();

			var sid = undefined;
			var client = undefined;
			try {
				sid = sap.ushell.Container.getLogonSystem()._oData.system;
				client = sap.ushell.Container.getLogonSystem()._oData.client;
			} catch (e) {
				sid = undefined;
				client = undefined;
			}

			var d = "";
			var c = "100";
			// if (sid === 'S4D') {
			// 	d = window.location.href.split("/")[2];
			// } else {
			// 	if (sid !== 'ZF1') {
			// 		d = "s4h" + window.location.href.split("/")[2].substring(3).split(":")[0] + ":44301";
			// 	} else {
			// 		// d = "azi-s4h" + window.location.href.split("/")[2].substring(7).split(":")[0] + ":44301";
			// 		d = "azi-s4h-prd1.alzayani.com:44301";
			// 	}
			// 	if (sid === 'ZF3') {
			// 		c = "600";
			// 	} else if (sid === 'ZF2') {
			// 		c = "700";
			// 	} else if (sid === 'ZF1') {
			// 		if (client === '300') {
			// 			c = "800";
			// 		} else if (client === '301') {
			// 			c = "801";
			// 		}
			// 	}
			// }
			switch (sid) {
			case "S4D":
				d = window.location.href.split("/")[2];
				break;
			case "SH1":
				d = "iss-sh1.issmideast.com:44301";
				c = client;
				break;
			case "DS4":
				d = window.location.href.split("/")[2];
				break;
			case "QS4":
				d = window.location.href.split("/")[2];
				break;
			case "PS4":
				d = window.location.href.split("/")[2];
			case "ZF3":
				d = "s4h" + window.location.href.split("/")[2].substring(3).split(":")[0] + ":44301";
				c = "600";
				break;
			case "ZF2":
				d = "s4h" + window.location.href.split("/")[2].substring(3).split(":")[0] + ":44301";
				c = "700";
				break;
			case "ZF1":
				d = "azi-s4h-prd1.alzayani.com:44301";
				if (client === '300') {
					c = "800";
				} else if (client === '301') {
					c = "801";
				}
				break;
			default:
			}

			var baseUrl = 'https://' + d + '/sap(bD1lbiZjPTAwMSZkPW1pbg==)/bc/bsp/sap/crm_ui_start/default.htm';
			var params = '?crm-object-type=BT116_SRVO&crm-object-action=B&crm-object-value=' + pageData.ServiceOrder +
				'&sap-client=' + c + '&sap-language=EN';
			var link = baseUrl + params;
			window.open(link, '_blank');
		},
		onClickSSOD_B10: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var actId = "SSOD_B10";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.AddeditClaimNo";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_ADD_EDIT_CLAIM_NUMBERSet";
			var dialogFields = [{
				fragInputId: "ClaimNoInput",
				fragInputLabel: this.aeUtil.geti18nText(that, "ClaimNoInput"),
				callProperty: "ClaimNum" //Claim No
			}];
			var data = [{
				callProperty: "WorkEstimate", //Work Estimate
				value: pageData.ServiceOrder
			}];
			var checkFucc = function () {
				return {
					pass: true
				};
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

		},
		onClickSSOD_B32: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var actId = "SSOD_B32";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.AddEditLPO";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_ADD_EDIT_LPO_NOSet";
			var dialogFields = [{
				fragInputId: "LPOInput",
				fragInputLabel: this.aeUtil.geti18nText(that, "LPOInput"),
				callProperty: "LpoNumber"
			}];
			var data = [{
				callProperty: "IOrderId",
				value: pageData.ServiceOrder
			}];
			var checkFucc = function () {
				return {
					pass: true
				};
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

		},

		// "SSOD_B11": {
		// 	"id": "SSOD_B11Button",
		// 	"text": "{@i18n>SSOD_B11}",
		// 	"press": "onClickSSOD_B11",
		// 	"applicablePath": "isShowSSOD_B11"
		// },
		onClickSSOD_B11: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B11";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SET_STS_ISSUE_GATE_PASSSet";
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		onClickSSOD_B12: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B12";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_ST_RESUME_FRM_HOLDSet";
			var data = [{
				callProperty: "IOrderId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},

		onClickSSOD_B22: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var actId = "SSOD_B22";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.UpdateAmount";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_DOWN_PAYMENTSet";
			var dialogFields = [{
				fragInputId: "AmountInput",
				fragInputLabel: this.aeUtil.geti18nText(that, "AMOUNT"),
				callProperty: "Amount"
			}];
			var data = [{
				callProperty: "ServiceOrder",
				value: pageData.ServiceOrder
			}, {
				callProperty: "DpType",
				value: "1"
			}];
			var checkFucc = function () {
				var pageData = that.getView().getBindingContext().getObject();
				var NetAmount = pageData.ServiceDocNetAmount;
				var vAmount = Fragment.byId(actId + "Fragment", "AmountInput").getValue();
				if (vAmount === "" || vAmount === undefined) {
					return {
						pass: false,
						msg: this.aeUtil.geti18nText(that, "SELECT_AMOUNT")
					};
				} else {
					vAmount = vAmount + ".00";
					if (Number(vAmount) > Number(NetAmount)) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "MORE_THAN_NET_AMOUNT")
						};
					} else {
						return {
							pass: true
						};
					}
				}
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

		},
		onClickSSOD_B23: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var actId = "SSOD_B23";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_STAT_PAY_RECEIVEDSet";
			var data = [{
				callProperty: "IOrderId",
				value: pageData.ServiceOrder
			}];

			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		onClickSSOD_B09: function (oEvent) {
			if (!this._oNewCreateNotesDialog) {
				Fragment.load({
						id: "fragCreateNotes",
						name: "com.globalintelli.zae_ssod.ext.fragment.CreateNotes",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateNotesDialog(oDialogContent);
						this._setCreateNotesDialogInitialState();
					}.bind(this));
			} else {
				this._setCreateNotesDialogInitialState();
			}
		},
		_setCreateNotesDialogInitialState: function () {
			var that = this;
			var selSecData = this.aeUtil.getSecData(that, "SNfacet");
			var Notes = selSecData.Notes;
			if (Notes !== "") {
				Fragment.byId("fragCreateNotes", "noteInput").setValue(Notes.trim());
			} else {
				Fragment.byId("fragCreateNotes", "noteInput").setValue("");
			}
			Fragment.byId("fragCreateNotes", "SSOD_B09MessageStrip").setVisible(false);
			this._oNewCreateNotesDialog.open();
		},
		_CreateNotesDialog: function (oDialogContent, oEvent) {
			var that = this;

			this._oNewCreateNotesDialog = new sap.m.Dialog({
				title: "Create Notes",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "Create",

					press: function () {
						var selSecData = this.aeUtil.getSecData(that, "SNfacet");
						var vTextId = selSecData.TextId;
						var vnotes = Fragment.byId("fragCreateNotes", "noteInput").getValue();
						this.getView().getModel("mNotes").setProperty("/nItemData", []);
						that.checkNotes(vnotes);
						if (vnotes === "") {
							var msg2 = "Fill out mandatory fields";
							var oMessageStrip = Fragment.byId("fragCreateNotes", "SSOD_B09MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);
							return;
						}
						var pageData = that.getView().getBindingContext().getObject();
						var actId = "SSOD_B09";
						var actLabel = that.aeUtil.geti18nText(that, actId);
						var oModel = that.getView().getModel();
						var Itemsdata = that.getView().getModel("mNotes").getData();
						var arr2 = Itemsdata.nItemData;
						var oEntity = "HEADER_DATA_NOTESSet";
						var arr1 = [];
						var oItementry = {};
						oItementry.ServiceDocument = pageData.ServiceOrder;
						oItementry.TextId = vTextId; // Text Id
						arr1.push(oItementry);
						that.getView().setBusy(true);
						var data = [{
							callProperty: "N_HEADER_DATA",
							value: arr1
						}, {
							callProperty: "N_TEXT_DATA",
							value: arr2
						}];
						var succFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						var errorFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errorFunc);
						that._oNewCreateNotesDialog.close();

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Close",
					press: function () {
						this._oNewCreateNotesDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oNewCreateNotesDialog);

		},
		checkNotes: function (s) {
			var oModeldata = this.getView().getModel("mNotes").getData();
			if (s.length > 130) {
				oModeldata.nItemData.push({
					Tdformat: '',
					Tdline: s.slice(0, 130)
				});
				this.checkNotes(s.slice(130, s.length));
			} else {
				oModeldata.nItemData.push({
					Tdformat: '',
					Tdline: s.slice(0, s.length)
				});
			}
		},
		onClickSSOD_B13: function (oEvent) {
			// var fragName = "com.globalintelli.zae_ssod.ext.fragment.ManageOutputItems";
			// var that = this;
			// if (!this._oPopover) {
			// 	this._oPopover = sap.ui.xmlfragment(this.getView().getId(), fragName, {
			// 		onClickSSOD_B14: function () {
			// 			var selSecData = that.aeUtil.getSecData(that, "BLFacet");
			// 			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			// 			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
			// 				target: {
			// 					semanticObject: "OutputRequestItem",
			// 					action: "show"
			// 				},
			// 				params: {
			// 					"OutputControlApplicationObject": selSecData.BillingDocument.toString().padStart(10, '0')
			// 				}
			// 			})) || "";
			// 			oCrossAppNavigator.toExternal({
			// 				target: {
			// 					shellHash: hash
			// 				}
			// 			});
			// 		},
			// 		onClickSSOD_B15: function () {
			// 			var selSecData = that.aeUtil.getSecData(that, "BLFacet");
			// 			var BillingDocument = selSecData.BillingDocument.toString().padStart(10, '0');
			// 			var link = window.location.origin +
			// 				"/sap/opu/odata/sap/CA_OC_OUTPUT_REQUEST_SRV/Items(ApplObjectType='BILLING_DOCUMENT',ApplObjectId='" + BillingDocument +
			// 				"',ItemId='1')/GetDocument/$value/";
			// 			window.open(link, '_blank');
			// 		}
			// 	});
			// 	this.getView().addDependent(this._oPopover);
			// }
			// var pop = oEvent.getSource();
			// this._oPopover.openBy(pop);

			var that = this;

			var selSecData = this.aeUtil.getSecData(that, "BLFacet");
			var opdfViewer = new sap.m.PDFViewer();
			that.getView().addDependent(opdfViewer);
			var sServiceURL = that.getView().getModel("Invoice01Preview").sServiceUrl;
			var sSource = sServiceURL + "/ZAE_FM_CRM_INVOICE_01Set(Invoice='" + selSecData.BillingDocument + "')/$value";
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle("Invoice " + selSecData.BillingDocument);
			opdfViewer.setShowDownloadButton(false);
			opdfViewer.open();

		},
		onClickSSOD_B24: function (oEvent) {
			var ButtonID = "SSOD_B24";
			this.fnDynamicNotes(ButtonID);
			// var that = this;
			// var pageData = this.aeUtil.getPageData(oEvent);
			// if (pageData.E0002NoteMandatory === true) {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.getView().getBindingContext().getObject();
			// 	var actId = "SSOD_B24";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);

			// 	var fragName = "com.globalintelli.zae_ssod.ext.fragment.ShareWithPartsTeam";
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_WITHPARTSSet";
			// 	var dialogFields = [{
			// 		fragInputId: "Note",
			// 		fragInputLabel: this.aeUtil.geti18nText(that, "Note"),
			// 		callProperty: "Note"
			// 	}];
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];

			// 	var checkFucc = function () {
			// 		var vNote = Fragment.byId(actId + "Fragment", "Note").getValue();
			// 		if (vNote === "" || vNote === undefined) {
			// 			return {
			// 				pass: false,
			// 				msg: this.aeUtil.geti18nText(that, "Add_notes")
			// 			};
			// 		} else {
			// 			return {
			// 				pass: true
			// 			};
			// 		}
			// 	}.bind(this);
			// 	var succFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};
			// 	var errorFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};

			// 	this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, errorFunc);

			// } else {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.aeUtil.getPageData(oEvent);
			// 	var actId = "SSOD_B24";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_WITHPARTSSet";
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];
			// 	var succFunc = function (oData, response) {
			// 		this.extensionAPI.refresh();
			// 	}.bind(this);
			// 	this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

			// }
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

		_fnCheckNotesDescription: function (ButtonID) {
			var that = this;
			var Status = "";
			var oModel = this.getView().getModel("mNotes");
			var pageData = this.getView().getBindingContext().getObject();
			var ServiceDocumentType = pageData.ServiceDocumentType;
			var StatusProfile = pageData.StatusProfile;
			var Title = that.getView().getModel("i18n").getResourceBundle().getText(ButtonID);
			var _oNotes = Fragment.byId(ButtonID + "Dialog", "SimpleFormNotes");
			var CreatedID = that.createId("action::" + ButtonID + "Button");
			that.getView().byId(CreatedID).setBusy(true);
			var oContent = {
				"SSOD_B24": "E0002",
				"SSOD_B25": "E0003",
				"SSOD_B16": "E0012",
				"SSOD_B17": "E0013",
				"SSOD_B18": "E0014",
				"SSOD_B19": "E0015",
				"SSOD_B20": "E0016",
				"SSOD_B45": "E0019",
				"SSOD_B57": "E0006"
			};

			var Status = oContent[ButtonID];
			that._oDynamicNotesDialog[ButtonID].setTitle(Title);
			_oNotes.destroyContent();
			var NotesData = [];
			oModel.getData().DynamicNotes = [];
			// oModel.setProperty("/DynamicNotes", []);
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("Ttype", sap.ui.model.FilterOperator.EQ, ServiceDocumentType));
			aFilters.push(new sap.ui.model.Filter("StatusProfile", sap.ui.model.FilterOperator.EQ, StatusProfile));
			aFilters.push(new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, Status));
			this.getView().getModel().read("/ZAE_I_TC_SSOD_13", {
				filters: aFilters,
				success: function (oData1, response1) {
					that.getView().byId(CreatedID).setBusy(false);
					that.NotesData = oData1.results;
					if (oData1.results.length === 0) {
						Fragment.byId(ButtonID + "Dialog", "IdNotesSubmit").setEnabled(false);
					} else {
						Fragment.byId(ButtonID + "Dialog", "IdNotesSubmit").setEnabled(true);
					}
					for (var i = 0; i < oData1.results.length; i++) {

						_oNotes.addContent(new sap.m.Label({
							text: that.formatNameAndValuePair(oData1.results[i].TestDescription, oData1.results[i].TextType),
							required: oData1.results[i].Mandatory
						}));
						var oTextArea = new sap.m.TextArea({
							required: oData1.results[i].Mandatory,
							text: "text",
							rows: 4
						});
						oTextArea.data("Key", oData1.results[i].TextType);
						_oNotes.addContent(oTextArea);

					}
					Fragment.byId(ButtonID + "Dialog", "NotesMessageStrip").setVisible(false);
					Fragment.byId(ButtonID + "Dialog", "NotesMessageStrip").setVisible(false);
					that._oDynamicNotesDialog[ButtonID].open();
				},
				error: function (Error) {

				}
			});

		},
		DynamicCheckNotes: function (t, s) {
			var oModeldata = this.getView().getModel("mNotes").getData();
			if (s.length > 130) {
				oModeldata.nItemData.push({
					TextType: t,
					Note: s.slice(0, 130)
				});
				this.DynamicCheckNotes(t, s.slice(130, s.length));
			} else {
				oModeldata.nItemData.push({
					TextType: t,
					Note: s.slice(0, s.length)
				});
			}
		},
		//Release to Parts Team
		fnDynamicNotes: function (oButton) {
			var that = this;
			var Button = oButton;
			var oSourceModel = this.getView().getModel();
			// var oSource = oEvent.getSource();
			var oContent = {
				"SSOD_B24": "Header_dataSet",
				"SSOD_B25": "Header_dataSet",
				"SSOD_B16": "Header_dataSet",
				"SSOD_B17": "Header_dataSet",
				"SSOD_B18": "Header_dataSet",
				"SSOD_B19": "Header_dataSet",
				"SSOD_B20": "Header_dataSet",
				"SSOD_B45": "Header_dataSet",
				"SSOD_B57": "Header_dataSet"
			};
			var oService = {
				"SSOD_B24": "Sharewithpartsteam",
				"SSOD_B25": "UpdatedbyPartsteam",
				"SSOD_B16": "JCrecvdbywarantyteam",
				"SSOD_B17": "WaitingPQRreport",
				"SSOD_B18": "WarrantyProcesssing",
				"SSOD_B19": "WarrantyPartiallyClosed",
				"SSOD_B20": "WarrantyClosedandClaimed",
				"SSOD_B45": "ApprovalbyInternalDepartment",
				"SSOD_B57": "SetStatustoJCreturnedforcorrection"
			};
			if (!that._oDynamicNotesDialog[Button]) {
				Fragment.load({
					id: Button + "Dialog",
					name: "com.globalintelli.zae_ssod.ext.fragment.DynamicNotes",
					controller: {
						onCancelPressed: function () {
							that._oDynamicNotesDialog[Button].close();
						},
						onSubmitPressed: function (oEvent) {
							var Entity = oContent[Button];
							var Service = oService[Button];
							var _oNotes = Fragment.byId(Button + "Dialog", "SimpleFormNotes");
							var oItementry2;
							var arr2 = [];
							that.getView().getModel("mNotes").setProperty("/nItemData", []);
							for (var i = 0; i < _oNotes.getContent().length; i++) {
								if (_oNotes.getContent()[i].getRequired() && _oNotes.getContent()[i].getMetadata().getName() === 'sap.m.TextArea' &&
									_oNotes.getContent()[i].getValue() === "") {
									var msg2 = that.getView().getModel("i18n").getResourceBundle().getText("Filloutmandatoryfields");
									var oMessageStrip = Fragment.byId(Button + "Dialog", "NotesMessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(msg2);
									return;
								} else if (_oNotes.getContent()[i].getMetadata().getName() === 'sap.m.TextArea') {
									that.DynamicCheckNotes(_oNotes.getContent()[i].data().Key, _oNotes.getContent()[i].getValue());
									var NotesCheck = that.getView().getModel("mNotes").getData();

									oItementry2 = NotesCheck.nItemData;
									arr2.push(...oItementry2);
									NotesCheck.nItemData = [];
								}

							}

							var pageData = that.getView().getBindingContext().getObject();
							var actId = Button;
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var oModel = that.getView().getModel(Service);
							var oEntity = Entity;
							var arr1 = [];
							var oItementry = {
								ObjectId: pageData.ServiceOrder,
							};

							arr1.push(oItementry);
							that.getView().setBusy(true);
							var data = [{
								callProperty: "N_HEADER_DATA",
								value: arr1
							}, {
								callProperty: "N_NOTES_TYPE_DATA",
								value: arr2
							}];
							var succFunc = function (oData) {
								that.extensionAPI.refresh();
								that.getView().setBusy(false);
							};
							var errorFunc = function (oData) {
								that.extensionAPI.refresh();
								that.getView().setBusy(false);
							};
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errorFunc);
							that._oDynamicNotesDialog[Button].close();

						}
					}
				}).then(function (oValueHelpDialogContent3) {
					that._oDynamicNotesDialog[Button] = oValueHelpDialogContent3;
					that.getView().addDependent(that._oDynamicNotesDialog[Button]);
					that._setDynamicNotesDialogInitialState(Button);
				});
			} else {
				that._setDynamicNotesDialogInitialState(Button);
			}

		},
		_setDynamicNotesDialogInitialState: function (oButton) {
			this._fnCheckNotesDescription(oButton);

		},

		onClickSSOD_B25: function (oEvent) {

			var ButtonID = "SSOD_B25";
			this.fnDynamicNotes(ButtonID);

			// var that = this;
			// var pageData = this.aeUtil.getPageData(oEvent);
			// if (pageData.E0003NoteMandatory === true) {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.getView().getBindingContext().getObject();
			// 	var actId = "SSOD_B25";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);

			// 	var fragName = "com.globalintelli.zae_ssod.ext.fragment.DynamicNotes";
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_RELPARTSSet";
			// 	var dialogFields = [{
			// 		fragInputId: "Note",
			// 		fragInputLabel: this.aeUtil.geti18nText(that, "Note"),
			// 		callProperty: "Note"
			// 	}];
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];

			// 	var checkFucc = function () {
			// 		var vNote = Fragment.byId(actId + "Fragment", "Note").getValue();
			// 		if (vNote === "" || vNote === undefined) {
			// 			return {
			// 				pass: false,
			// 				msg: this.aeUtil.geti18nText(that, "Add_notes")
			// 			};
			// 		} else {
			// 			return {
			// 				pass: true
			// 			};
			// 		}
			// 	}.bind(this);
			// 	var succFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};
			// 	var errorFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};

			// 	this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, errorFunc);

			// } else {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.aeUtil.getPageData(oEvent);
			// 	var actId = "SSOD_B25";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_RELPARTSSet";
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];
			// 	var succFunc = function (oData, response) {
			// 		this.extensionAPI.refresh();
			// 	}.bind(this);
			// 	this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

			// }
		},
		onClickSSOD_B26: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B26";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SET_STS_RECD_DWNPAYMENTSet";
			var data = [{
				callProperty: "IOrderId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		onClickSSOD_B27: function (oEvent) {
			var fragName1 = "com.globalintelli.zae_ssod.ext.fragment.PDFPreview";
			var pageData1 = this.getView().getBindingContext().getObject();
			var vServiceOrder = pageData1.ServiceOrder;
			var that = this;
			if (!this._oPopoverpdf) {
				this._oPopoverpdf = sap.ui.xmlfragment(this.getView().getId(), fragName1, {

					onClickSSOD_B28: function () {
						var pageData1 = that.getView().getBindingContext().getObject();
						var vServiceOrder = pageData1.ServiceOrder;
						var opdfViewer = new sap.m.PDFViewer();
						that.getView().addDependent(opdfViewer);
						var sServiceURL = that.getView().getModel("jobCardPreview").sServiceUrl;
						var sSource = sServiceURL + "/ZAE_FM_CRM_JOB_CARDSet(SerDoc='" + vServiceOrder + "')/$value";
						opdfViewer.setSource(sSource);
						opdfViewer.setTitle("Job Card " + vServiceOrder);
						opdfViewer.setShowDownloadButton(false);
						opdfViewer.open();
					},
					onClickSSOD_B60: function () {
						var pageData1 = that.getView().getBindingContext().getObject();
						var vServiceOrder = pageData1.ServiceOrder;
						var opdfViewer = new sap.m.PDFViewer();
						that.getView().addDependent(opdfViewer);
						var sServiceURL = that.getView().getModel("PrepaymentInvoicePreview").sServiceUrl;
						var sSource = sServiceURL + "/ZAE_FM_SSOD_DWNPAYMENT_INV_PSet(SerDoc='" + vServiceOrder + "')/$value";
						opdfViewer.setSource(sSource);
						opdfViewer.setTitle("Prepayment Invoice " + vServiceOrder);
						opdfViewer.setShowDownloadButton(false);
						opdfViewer.open();
					},
					onClickSSOD_B29: function () {
						var pageData1 = that.getView().getBindingContext().getObject();
						var vServiceOrder = pageData1.ServiceOrder;
						var opdfViewer = new sap.m.PDFViewer();
						that.getView().addDependent(opdfViewer);
						var sServiceURL = that.getView().getModel("ProformaInvoicePreview").sServiceUrl;
						var sSource = sServiceURL + "/ZAE_FM_CRM_PRO_INVOICESet(SerDoc='" + vServiceOrder + "')/$value";
						opdfViewer.setSource(sSource);
						opdfViewer.setTitle("Pro Forma Invoice " + vServiceOrder);
						opdfViewer.setShowDownloadButton(false);
						opdfViewer.open();
					},
					onClickSSOD_B30: function () {
						var pageData1 = that.getView().getBindingContext().getObject();
						var vServiceOrder = pageData1.ServiceOrder;
						var opdfViewer = new sap.m.PDFViewer();
						that.getView().addDependent(opdfViewer);
						var sServiceURL = that.getView().getModel("InvoicePreview").sServiceUrl;
						var sSource = sServiceURL + "/ZAE_FM_CRM_INVOICESet(SerDoc='" + vServiceOrder + "')/$value";
						opdfViewer.setSource(sSource);
						opdfViewer.setTitle("Invoice " + vServiceOrder);
						opdfViewer.setShowDownloadButton(false);
						opdfViewer.open();
					},
					onClickSSOD_B31: function () {
						var pageData1 = that.getView().getBindingContext().getObject();
						var vServiceOrder = pageData1.ServiceOrder;
						var opdfViewer = new sap.m.PDFViewer();
						that.getView().addDependent(opdfViewer);
						var sServiceURL = that.getView().getModel("GatePassPreview").sServiceUrl;
						var sSource = sServiceURL + "/ZAE_FM_CRM_GATEPASSSet(SerDoc='" + vServiceOrder + "')/$value";
						opdfViewer.setSource(sSource);
						opdfViewer.setTitle("Gate Pass " + vServiceOrder);
						opdfViewer.setShowDownloadButton(false);
						opdfViewer.open();
					},
					// onClickSSOD_B74: function () {
					// 	var pageData1 = that.getView().getBindingContext().getObject();
					// 	var vServiceOrder = pageData1.ServiceOrder;
					// 	var opdfViewer = new sap.m.PDFViewer();
					// 	that.getView().addDependent(opdfViewer);
					// 	var sServiceURL = that.getView().getModel("DraftProformaPreview").sServiceUrl;
					// 	var sSource = sServiceURL + "/ZAE_FM_SSOD_DRAFT_PROFORMA_PSet(SerDoc='" + vServiceOrder + "')/$value";
					// 	opdfViewer.setSource(sSource);
					// 	opdfViewer.setTitle("Draft Proforma " + vServiceOrder);
					// 	opdfViewer.setShowDownloadButton(false);
					// 	opdfViewer.open();
					onClickSSOD_B74: function () {
						var pageData1 = that.getView().getBindingContext().getObject();
						var link = "https://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=ZSRV_DRAFTINV%20SO_SORD-LOW=" +
							pageData1
							.ServiceOrder + ";DYNP_OKCODE=#";
						window.open(link);
					},
					onClickSSOD_B94: function () {
						var pageData1 = that.getView().getBindingContext().getObject();
						var vServiceOrder = pageData1.ServiceOrder;
						var opdfViewer = new sap.m.PDFViewer();
						that.getView().addDependent(opdfViewer);
						var sServiceURL = that.getView().getModel("EstimatePreview").sServiceUrl;
						var sSource = sServiceURL + "/ZAE_FM_SSOD_ESTIMATE_PRINT_PSet(ObjectId='" + vServiceOrder + "')/$value";
						opdfViewer.setSource(sSource);
						opdfViewer.setTitle("Estimate " + vServiceOrder);
						opdfViewer.setShowDownloadButton(false);
						opdfViewer.open();
					},
					onClickSSOD_B99: function () {
						var pageData1 = that.getView().getBindingContext().getObject();
						var link = "https://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=ZESTIMATE%20SO_OBJID-LOW=" +
							pageData1
							.ServiceOrder + ";DYNP_OKCODE=#";
						window.open(link);

					}
				});
				this.getView().addDependent(this._oPopoverpdf);
			}
			var pop = oEvent.getSource();
			var Buttons = this._oPopoverpdf.getButtons();
			for (var i = 0; i < Buttons.length; i++) {
				if (Buttons[i].getId().includes('SSOD_B28')) {
					Buttons[i].addEventDelegate({
						onBeforeRendering: function (oEvent1) {
							oEvent1.srcControl.bindProperty("visible", {
								parts: ["isShowSSOD_B28"],
								formatter: function (button) {
									if (Buttons[i] === undefined || Buttons[i] === null) {
										var bindingObj = that.getView().getBindingContext() ? that.getView().getBindingContext().getObject() : undefined;
										return bindingObj ? bindingObj["isShowSSOD_B28"] : false;
									}
									return Buttons[i];

								}
							});
						}
					}, that);
				} else if (Buttons[i].getId().includes('SSOD_B60')) {
					Buttons[i].addEventDelegate({
						onBeforeRendering: function (oEvent1) {
							oEvent1.srcControl.bindProperty("visible", {
								parts: ["isShowSSOD_B60"],
								formatter: function (button) {
									if (Buttons[i] === undefined || Buttons[i] === null) {
										var bindingObj = that.getView().getBindingContext() ? that.getView().getBindingContext().getObject() : undefined;
										return bindingObj ? bindingObj["isShowSSOD_B60"] : false;
									}
									return Buttons[i];

								}
							});
						}
					}, that);
				} else if (Buttons[i].getId().includes('SSOD_B74')) {
					Buttons[i].addEventDelegate({
						onBeforeRendering: function (oEvent1) {
							oEvent1.srcControl.bindProperty("visible", {
								parts: ["isShowSSOD_B74"],
								formatter: function (button) {
									if (Buttons[i] === undefined || Buttons[i] === null) {
										var bindingObj = that.getView().getBindingContext() ? that.getView().getBindingContext().getObject() : undefined;
										return bindingObj ? bindingObj["isShowSSOD_B74"] : false;
									}
									return Buttons[i];

								}
							});
						}
					}, that);
				} else if (Buttons[i].getId().includes('SSOD_B94')) {
					Buttons[i].addEventDelegate({
						onBeforeRendering: function (oEvent1) {
							oEvent1.srcControl.bindProperty("visible", {
								parts: ["isShowSSOD_B94"],
								formatter: function (button) {
									if (Buttons[i] === undefined || Buttons[i] === null) {
										var bindingObj = that.getView().getBindingContext() ? that.getView().getBindingContext().getObject() : undefined;
										return bindingObj ? bindingObj["isShowSSOD_B94"] : false;
									}
									return Buttons[i];

								}
							});
						}
					}, that);
				} else if (Buttons[i].getId().includes('SSOD_B99')) {
					Buttons[i].addEventDelegate({
						onBeforeRendering: function (oEvent1) {
							oEvent1.srcControl.bindProperty("visible", {
								parts: ["isShowSSOD_B99"],
								formatter: function (button) {
									if (Buttons[i] === undefined || Buttons[i] === null) {
										var bindingObj = that.getView().getBindingContext() ? that.getView().getBindingContext().getObject() : undefined;
										return bindingObj ? bindingObj["isShowSSOD_B99"] : false;
									}
									return Buttons[i];

								}
							});
						}
					}, that);
				}
			}
			this._oPopoverpdf.openBy(pop);
		},
		onClickSSOD_B33: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var actId = "SSOD_B33";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.UpdatePlateNo";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_UPDATE_PLATENOSet";
			var dialogFields = [{
				fragInputId: "VINNoInput",
				fragInputLabel: this.aeUtil.geti18nText(that, "VINNoInput"),
				callProperty: "FleetVin"
			}, {
				fragInputId: "LicenseNoInput",
				fragInputLabel: this.aeUtil.geti18nText(that, "LicenseNoInput"),
				callProperty: "LicenseNum"
			}];
			var data = [{
				callProperty: "Equipment",
				value: pageData.Equipment
			}];
			var checkFucc = function () {
				return {
					pass: true
				};
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

		},
		/*					onClickSSOD_B34: function (oEvent) {
								var that = this;
								var oView = this.getView();
								var oSource = oEvent.getSource();
								var selSecData = this.aeUtil.getSecData(that, "CPFacet");
								var actId = "SSOD_B34";
								var actLabel = this.aeUtil.geti18nText(that, actId);
								var oModel = oSource.getModel();
								var oEntity = "ZAE_FM_SSOD_CREATE_PRSet";
								var data = [{
									callProperty: "IOrderId",
									value: selSecData.ServiceOrder
								}, {
									callProperty: "Component",
									value: selSecData.ServiceOrderOperation
								}];
								var succFunc = function (oData, response) {
									this.aeUtil.refreshControlModel(oView);
								}.bind(this);
								var errFunc = function (oData, response) {
									this.aeUtil.refreshControlModel(oView);
								}.bind(this);
								this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);
							},*/
		onClickSSOD_B34: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var selSecData = that.aeUtil.getSecData(that, "CPFacet");
			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			} else {

				var actId = "SSOD_B34";
				var actLabel = this.aeUtil.geti18nText(that, actId);
				var fragName = "com.globalintelli.zae_ssod.ext.fragment.CreatePurchaseRequisition";
				var oModel = oSource.getModel();
				var oEntity = "ZAE_FM_SSOD_CREATE_PRSet";
				var dialogFields = [{
					fragInputId: "PurchaseRequisition",
					fragInputLabel: this.aeUtil.geti18nText(that, "PurchaseRequisition"),
					vhEntitySet: "ZAE_VH_PurchaseRequisitionType",
					vhEntitySetFilter: [{

						path: 'SalesOrganization',
						operator: 'EQ',
						value1: pageData.SalesOrganization
					}, {
						path: 'DistributionChannel',
						operator: 'EQ',
						value1: pageData.DistributionChannel
					}, {
						path: 'Division',
						operator: 'EQ',
						value1: pageData.Division
					}, {
						path: 'BusinessTransactionType',
						operator: 'EQ',
						value1: pageData.ServiceDocumentType
					}, {
						path: 'ItemCategoryGroup',
						operator: 'EQ',
						value1: selSecData.MItemCategoryGroup
					}],
					vhSearchKey: "PurchaseRequisitionType",
					vhSearchText: "PurchaseRequisitionTypeName",
					callProperty: "Prtype"
				}];
				var data = [{
					callProperty: "IOrderId",
					value: selSecData.ServiceOrder
				}, {
					callProperty: "Component",
					value: selSecData.ServiceOrderOperation
				}];
				var checkFucc = function () {
					var oPR = Fragment.byId(actId + "Fragment", "PurchaseRequisition").getValue();
					if (oPR === "" || oPR === undefined) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "SELECT_PURCHASE_REQUISITION")
						};
					} else {
						return {
							pass: true
						};
					}
				}.bind(this);
				var succFunc = function (oData, response) {
					this.extensionAPI.refresh();
				}.bind(this);

				this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);
			}
		},

		// onClickSSOD_B37: function (oEvent) {
		// 	if (!this._oBillingDateDialog) {
		// 		Fragment.load({
		// 				id: "idBillingDateDialog",
		// 				name: "com.globalintelli.zae_ssod.ext.fragment.UpdateBillingDate",
		// 				controller: this
		// 			})
		// 			.then(function (oDialogContent) {
		// 				this._createDialog(oDialogContent);
		// 				this._setDialogInitialState();
		// 			}.bind(this));
		// 	} else {
		// 		this._setDialogInitialState();
		// 	}
		// },

		// _createDialog: function (oDialogContent) {
		// 	var that = this;
		// 	this._oBillingDateDialog = new Dialog({
		// 		title: "Update Billing Date",
		// 		width: "640px",
		// 		content: [
		// 			oDialogContent
		// 		],
		// 		buttons: [
		// 			new Button({
		// 				text: "Submit",
		// 				press: function () {
		// 					var MessageStrip = Fragment.byId("idBillingDateDialog", "SSOD_B37MessageStrip");
		// 					var pageData = this.getView().getBindingContext().getObject();
		// 					var actId = 'SSOD_B37';
		// 					var actLabel = this.aeUtil.geti18nText(that, actId);
		// 					var oModel = this.getView().getModel();
		// 					var oEntity = "ZAE_FM_SSOD_UPD_BILLING_DATESet";
		// 					var oBillingDateInput = Fragment.byId("idBillingDateDialog", "billingDateInput").getDateValue();
		// 					if (oBillingDateInput === null) {
		// 						MessageStrip.setText("Fill required fields.");
		// 						MessageStrip.setVisible(true);
		// 						return;
		// 					}
		// 					var epoch = new Date(oBillingDateInput);
		// 					epoch.setHours(6);
		// 					var IDate = "\/Date(" + epoch.getTime() + ")\/";
		// 					var data = [{
		// 						callProperty: "IOrderId",
		// 						value: pageData.ServiceOrder
		// 					}, {
		// 						callProperty: "BillingDate",
		// 						value: IDate
		// 					}];
		// 					var succFunc = function (oData, response) {
		// 						this.extensionAPI.refresh();
		// 					}.bind(this);
		// 					this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
		// 					this._oBillingDateDialog.close();
		// 				}.bind(this)
		// 			}),
		// 			new Button({
		// 				text: "Close",
		// 				press: function () {
		// 					this._oBillingDateDialog.close();
		// 				}.bind(this)
		// 			})
		// 		]
		// 	});
		// 	this.getView().addDependent(this._oBillingDateDialog);
		// },

		// _setDialogInitialState: function () {
		// 	Fragment.byId("idBillingDateDialog", "billingDateInput").setDateValue(new Date());
		// 	Fragment.byId("idBillingDateDialog", "SSOD_B37MessageStrip").setVisible(false);
		// 	this._oBillingDateDialog.open();
		// },
		onClickSSOD_B37: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B37";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_UPD_BILLING_DATESet";
			var data = [{
				callProperty: "IOrderId",
				value: pageData.ServiceOrder
			}, {
				callProperty: "BillingDate",
				value: pageData.BillingDate
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
		},

		// _setPreAppOpDialogInitialState: function () {
		// 	Fragment.byId("idPreAppOpDialog", "PreAppNoOpInput").setValue(null);
		// 	Fragment.byId("idPreAppOpDialog", "SSOD_B38MessageStrip").setVisible(false);
		// 	this._oPreAppOpDialog.open();
		// },
		// _createPreAppOpDialog: function (oDialogContent) {
		// 	var that = this;
		// 	this._oPreAppOpDialog = new Dialog({
		// 		title: "{i18n>SSOD_B38}",
		// 		width: "640px",
		// 		content: [
		// 			oDialogContent
		// 		],
		// 		buttons: [
		// 			new Button({
		// 				text: "Submit",
		// 				press: function () {
		// 					var MessageStrip = Fragment.byId("idPreAppOpDialog", "SSOD_B38MessageStrip");
		// 					var selSecData = this.aeUtil.getSecData(that, "OPFacet");
		// 					var actId = 'SSOD_B38';
		// 					var actLabel = this.aeUtil.geti18nText(that, actId);
		// 					var oModel = this.getView().getModel();
		// 					var oEntity = "PRE_APP_HEADER_DATASet";
		// 					var oPreAppValue = Fragment.byId("idPreAppOpDialog", "PreAppNoOpInput").getValue();
		// 					if (oPreAppValue === null) {
		// 						MessageStrip.setText("Fill required fields.");
		// 						MessageStrip.setVisible(true);
		// 						return;
		// 					}
		// 					var oHeaderData = [];
		// 					var oItemData = [];
		// 					oHeaderData.push({
		// 						"PreApprNo": oPreAppValue
		// 					});
		// 					if (selSecData instanceof Array) {
		// 						for (var i = 0; i < selSecData.length; i++) {
		// 							oItemData.push({
		// 								"ObjectId": selSecData[i].ServiceOrder,
		// 								"NumberInt": selSecData[i].ServiceOrderOperation
		// 							});
		// 						}
		// 					} else {
		// 						oItemData.push({
		// 							"ObjectId": selSecData.ServiceOrder,
		// 							"NumberInt": selSecData.ServiceOrderOperation
		// 						});
		// 					}
		// 					var data = [{
		// 						callProperty: "N_PRE_APP_HEADER_DATA",
		// 						value: oHeaderData
		// 					}, {
		// 						callProperty: "N_PRE_APP_ITEM_DATA",
		// 						value: oItemData
		// 					}];
		// 					var succFunc = function (oData, response) {
		// 						this.extensionAPI.refresh();
		// 					}.bind(this);
		// 					this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
		// 					this._oPreAppOpDialog.close();
		// 				}.bind(this)
		// 			}),
		// 			new Button({
		// 				text: "Close",
		// 				press: function () {
		// 					this._oPreAppOpDialog.close();
		// 				}.bind(this)
		// 			})
		// 		]
		// 	});
		// 	this.getView().addDependent(this._oPreAppOpDialog);

		// },
		// onClickSSOD_B38: function (oEvent) {
		// 	if (!this._oPreAppOpDialog) {
		// 		Fragment.load({
		// 				id: "idPreAppOpDialog",
		// 				name: "com.globalintelli.zae_ssod.ext.fragment.AddEditPreApprovalNoOP",
		// 				controller: this
		// 			})
		// 			.then(function (oDialogContent) {
		// 				this._createPreAppOpDialog(oDialogContent);
		// 				this._setPreAppOpDialogInitialState();
		// 			}.bind(this));
		// 	} else {
		// 		this._setPreAppOpDialogInitialState();
		// 	}
		// },
		/*_setPreAppCompDialogInitialState: function () {
			Fragment.byId("idPreAppCompDialog", "PreAppNoCompInput").setValue(null);
			Fragment.byId("idPreAppCompDialog", "SSOD_B39MessageStrip").setVisible(false);
			this._oPreAppCompDialog.open();
		},
		_createPreAppCompDialog: function (oDialogContent) {
			var that = this;
			this._oPreAppCompDialog = new Dialog({
				title: "{i18n>SSOD_B39}",
				width: "640px",
				content: [
					oDialogContent
				],
				buttons: [
					new Button({
						text: "Submit",
						press: function () {
							var MessageStrip = Fragment.byId("idPreAppCompDialog", "SSOD_B39MessageStrip");
							var selSecData = this.aeUtil.getSecData(that, "CPFacet");
							var actId = 'SSOD_B39';
							var actLabel = this.aeUtil.geti18nText(that, actId);
							var oModel = this.getView().getModel();
							var oEntity = "PRE_APP_HEADER_DATASet";
							var oPreAppValue = Fragment.byId("idPreAppCompDialog", "PreAppNoCompInput").getValue();
							if (oPreAppValue === null) {
								MessageStrip.setText("Fill required fields.");
								MessageStrip.setVisible(true);
								return;
							}
							var oHeaderData = [];
							var oItemData = [];
							oHeaderData.push({
								"PreApprNo": oPreAppValue
							});
							if (selSecData instanceof Array) {
								for (var i = 0; i < selSecData.length; i++) {
									oItemData.push({
										"ObjectId": selSecData[i].ServiceOrder,
										"NumberInt": selSecData[i].ServiceOrderOperation
									});
								}
							} else {
								oItemData.push({
									"ObjectId": selSecData.ServiceOrder,
									"NumberInt": selSecData.ServiceOrderOperation
								});
							}
							var data = [{
								callProperty: "N_PRE_APP_HEADER_DATA",
								value: oHeaderData
							}, {
								callProperty: "N_PRE_APP_ITEM_DATA",
								value: oItemData
							}];
							var succFunc = function (oData, response) {
								this.extensionAPI.refresh();
							}.bind(this);
							this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
							this._oPreAppCompDialog.close();
						}.bind(this)
					}),
					new Button({
						text: "Close",
						press: function () {
							this._oPreAppCompDialog.close();
						}.bind(this)
					})
				]
			});
			this.getView().addDependent(this._oPreAppCompDialog);

		},
		, 
		"SSOD_B39": { // button Removed AE-2385
			"id": "SSOD_B39Button",
			"text": "{@i18n>SSOD_B39}",
			"press": "onClickSSOD_B39",
			"requiresSelection": true,
			"applicablePath": "isShowSSOD_B39"
					}
		onClickSSOD_B39: function (oEvent) {
			if (!this._oPreAppCompDialog) {
				Fragment.load({
						id: "idPreAppCompDialog",
						name: "com.globalintelli.zae_ssod.ext.fragment.AddEditPreApprovalNoComp",
						controller: this
					})
					.then(function (oDialogContent) {
						this._createPreAppCompDialog(oDialogContent);
						this._setPreAppCompDialogInitialState();
					}.bind(this));
			} else {
				this._setPreAppCompDialogInitialState();
			}
		},*/

		onClickSSOD_B38: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			var actId = "SSOD_B38";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.AddEditPreApprovalNoOP";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_ADD_EDIT_CLAIM_NO_ITEMSet";
			var dialogFields = [{
				fragInputId: "PreAppNoOpInput",
				fragInputLabel: this.aeUtil.geti18nText(that, "PreAppNoOpInput"),
				callProperty: "PreApprNo"
			}];
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}, {
				callProperty: "NumberInt",
				value: selSecData.ServiceOrderOperation
			}];
			var checkFucc = function () {
				var PreAppNoOp = Fragment.byId(actId + "Fragment", "PreAppNoOpInput").getValue();
				var len_PreAppNoOp = PreAppNoOp.length;
				if (PreAppNoOp === "" || PreAppNoOp === undefined) {
					return {
						pass: false,
						msg: this.aeUtil.geti18nText(that, "ADDCLAIMNO"),
						type: "Error"
					};
				}
				if (len_PreAppNoOp > 10) {
					return {
						pass: false,
						msg: this.aeUtil.geti18nText(that, "ADDCLAIMNO_LEN"),
						type: "Error"
					};
				} else {
					return {
						pass: true
					};
				}

			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

		},
		onClickSSOD_B40: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			var actId = "SSOD_B40";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			//var oModel = oSource.getModel();
			var oModel = that.getView().getModel("DeleteComponent");
			var oEntity = "ZAE_FM_SSOD_DELETE_ITEM_MSet";
			var aHeaderData = [];
			var aItemsData = [];
			aHeaderData.push({
				"ObjectId": pageData.ServiceOrder
			});
			if (selSecData instanceof Array) {
				for (var i = 0; i < selSecData.length; i++) {
					aItemsData.push({
						"NumberInt": selSecData[i].ServiceOrderOperation
					});
				}
			} else {
				aItemsData.push({
					"NumberInt": selSecData.ServiceOrderOperation
				});
			}
			var data = [{
				callProperty: "N_ZAE_FM_SSOD_DELETE_ITEM_M",
				value: aHeaderData
			}, {
				callProperty: "N_ITEMS",
				value: aItemsData
			}];
			// var data = [{
			// 	callProperty: "ObjectId",
			// 	value: selSecData.ServiceOrder
			// }, {
			// 	callProperty: "NumberInt",
			// 	value: selSecData.ServiceOrderOperation
			// }];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			var errFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);

		},
		onClickSSOD_B41: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			var actId = "SSOD_B41";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = that.getView().getModel("DeleteComponent");
			var oEntity = "ZAE_FM_SSOD_DELETE_ITEM_MSet";
			var aHeaderData = [];
			var aItemsData = [];
			aHeaderData.push({
				"ObjectId": pageData.ServiceOrder
			});
			if (selSecData instanceof Array) {
				for (var i = 0; i < selSecData.length; i++) {
					aItemsData.push({
						"NumberInt": selSecData[i].ServiceOrderOperation
					});
				}
			} else {
				aItemsData.push({
					"NumberInt": selSecData.ServiceOrderOperation
				});
			}
			var data = [{
				callProperty: "N_ZAE_FM_SSOD_DELETE_ITEM_M",
				value: aHeaderData
			}, {
				callProperty: "N_ITEMS",
				value: aItemsData
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			var errFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);
			// if (selSecData instanceof Array) {
			// 	this.oTempMessageDialog = new sap.m.Dialog({
			// 		type: sap.m.DialogType.Message,
			// 		title: "Information",
			// 		state: sap.ui.core.ValueState.Information,
			// 		content: new Text({
			// 			text: "Multiple Selection Not Allowed"
			// 		}),
			// 		endButton: new Button({
			// 			type: sap.m.ButtonType.Default,
			// 			text: "Cancel",
			// 			press: function () {
			// 				this.oTempMessageDialog.close();
			// 			}.bind(this)
			// 		})
			// 	});
			// 	this.oTempMessageDialog.open();
			// 	return;
			// } else {

			// }
		},
		onClickSSOD_B42: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			// var oTableID = this.getView().createId("CPFacet::Table");
			// var oView = this.getView();
			// if (oTableID) {
			// 	oView.byId(oTableID).rebindTable();
			// }
			if (selSecData.ItemCategoryGroup !== 'ZSUB') {
				that.oITFacetAddComponentsButton = oEvent.getSource();
				if (!that._AddComponentsDialog) {
					Fragment.load({
						id: "AddComponentDialog",
						name: "com.globalintelli.zae_ssod.ext.fragment.AddComponent",
						controller: {
							onExport: function () {
								// var EdmTypse = exportLibrary.EdmType;
								var oTable = Fragment.byId("AddComponentDialog", "idComponentListTable");
								var oBinding = oTable.getBinding('items');
								var aCols = [];
								var columnsToExport = [2, 4, 10];

								oTable.getColumns().forEach(function (oCol, ind) {
									if (columnsToExport.includes(ind)) {
										var oCell = oTable.getItems()[0].getCells()[ind];
										var obj = {
											label: oCol.getAggregation("header").getText(),
											type: EdmType.String
										};
										// switch (oCell.getMetadata().getName()) {
										// case "sap.m.Text":
										// 	obj["property"] = oCell.getBinding("text")["sPath"];
										// 	if (!obj["property"]) {
										// 		obj["property"] = oCell.getBinding("text").aBindings[1].sPath;
										// 	}
										// 	break;
										// case "sap.m.Input":
										// 	obj["property"] = oCell.getBinding("value")["sPath"];
										// 	break;
										// case "sap.m.Select":
										// 	obj["property"] = oCell.getBinding("selectedKey")["sPath"];
										// 	break;
										// case "sap.m.MultiInput":
										// 	obj["property"] = "Material";
										// 	break;
										// default:
										// 	break;
										// }
										obj["property"] = "";
										aCols.push(obj);
									}
								});

								var oSettings = {
									fileName: "Add Components Template",
									workbook: {
										columns: aCols,
										context: {
											sheetName: "Components"
										}
									},
									dataSource: oBinding
								};
								var oSheet = new sap.ui.export.Spreadsheet(oSettings);
								oSheet.build()
									.then(function () {
										MessageToast.show('Spreadsheet export has finished');
									}).finally(function () {
										oSheet.destroy();
									});
							},
							fileChanged: function (oEvt) {
								var self = this;
								var file = oEvt.getParameter("files") && oEvt.getParameter("files")[0];
								if (file && window.FileReader) {
									var reader = new FileReader();
									var result = {},
										data, sheetNamesArray = [],
										sheetCount = 0;
									reader.onload = function (e) {
										data = e.target.result;
										var wb = XLSX.read(data, {
											type: 'binary',
											cellDates: true
										});
										wb.SheetNames.forEach(function (sheetName) {
											var roa = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName], {
												raw: false,
											});
											if (roa.length > 0) {
												sheetNamesArray[sheetCount] = sheetName;
												result[sheetName] = roa;
											}
										});

										var availableData = [];
										var dataCount = 0;
										for (var i = 0; i < sheetNamesArray.length; i++) {
											var arrayElement = sheetNamesArray[i];
											var sheetData = result[arrayElement];
											for (var j = 0; j < sheetData.length; j++) {
												availableData[dataCount] = sheetData[j];
												dataCount++;
											}
										}
										self.fnUpdateTableData(availableData);
									};
									reader.readAsBinaryString(file);

								} else {
									/*var oMessageStrip = Fragment.byId(actId + "Fragment", actId + "MessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(checkObj.msg);*/
								}
							},

							fnUpdateTableData: function (oXLData) {
								var self = this;
								var pageData = that.getView().getBindingContext().getObject();
								var ServiceOrganization = pageData.ServiceOrganization;
								var SalesOrganization = pageData.SalesOrganization;
								var DistributionChannel = pageData.DistributionChannel;
								// tableData = tableData.slice(2, 3);
								var aFilterArray = [];
								aFilterArray.push(new sap.ui.model.Filter({
									path: "Plant",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: ServiceOrganization
								}));
								aFilterArray.push(new sap.ui.model.Filter({
									path: "DistributionChannel",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: DistributionChannel
								}));
								aFilterArray.push(new sap.ui.model.Filter({
									path: "SalesOrganization",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: SalesOrganization
								}));
								oXLData.forEach(function (item) {
									item["Material"] = item["Material"].toUpperCase();
									aFilterArray.push(new sap.ui.model.Filter({
										path: "Material",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: item.Material
									}));
								});
								that.getView().getModel().read("/ZAE_I_MaterialSalesData_06", {
									filters: aFilterArray,
									success: function (oData, response) {
										var oModel = that.getView().getModel("mWorkEstimateComponent");
										var tableData = oModel.getProperty("/TableData") || [];
										// save the first row and remove it from the array
										var firstRow = tableData.length > 0 ? tableData.shift() : null;
										tableData = tableData.slice(2);
										var oItemsTable = Fragment.byId("AddComponentDialog", "idComponentListTable");
										var ItemsTable = that.getView().byId(that.getView().createId("CPFacet" + "::Table")).getTable().getItems();
										var materialData = oData.results;
										var mergedData = oXLData.map(excelData => {
											var MaterialDataCheck = materialData.find(s => s.Material == excelData.Material);
											if (MaterialDataCheck) {
												return {
													...excelData,
													...MaterialDataCheck,
												}
											} else {
												return {
													...excelData
												}
											}
										});
										for (var i = 0; i < mergedData.length; i++) {
											var oValueState = "None";
											var oValueStateText = "";
											if (!mergedData[i].MaterialName) {
												oValueState = "Error";
											} else {
												// Check if Material already exists in ItemsTable
												var materialExists = ItemsTable.some(function (Item) {
													return Item.getBindingContext().getObject().OriginallyRequestedProduct === mergedData[i].Material;
												});

												if (materialExists) {
													oValueState = "Warning";
													oValueStateText = "Component with material " + mergedData[i].Material + " already exists";
												}
											}
											tableData.push({
												ItemNumber: "",
												HighLevelItemNumber: firstRow ? firstRow.HighLevelItemNumber : 0,
												Material: mergedData[i].Material,
												MaterialName: mergedData[i].MaterialName,
												Quantity: mergedData[i].Quantity,
												Price: 0,
												Severity: mergedData[i].Severity,
												DescriptionCheck: false,
												PriceCheck: false,
												ItemCategory: "",
												ItemCategoryDesc: "",
												QuantityUnit: mergedData[i].UnitOfMeasure,
												ItemCategoryGroup: mergedData[i].ItemCategoryGroup,
												AvailableQuantity: mergedData[i].AvailableQuantity,
												oValueState: oValueState,
												oValueStateText: oValueStateText
											});

										}
										// // If the first row existed, add it back to the beginning of the tableData array
										if (firstRow) {
											tableData.unshift(firstRow);
										}
										oModel.setProperty("/TableData", tableData);
										// // Update bindings
										oModel.updateBindings(true);
										oItemsTable.getAggregation("items").forEach(function (Item, i) {
											var oTokens = Item.getCells()[2].getTokens();
											var RowData = that.getView().getModel("mWorkEstimateComponent").getProperty(Item.oBindingContexts.mWorkEstimateComponent
												.sPath);
											if (RowData["Material"] && i !== 0) {
												var oToken = new sap.m.Token({
													key: RowData["Material"],
													text: that.aeUtil.formatNameAndValuePair(RowData["MaterialName"], RowData["Material"])
												});
												Item.getCells()[2].setTokens([oToken]);
												self.fnLoadItemCateghory(Item.oBindingContexts);
											}
										});
										self.fnSubmitButonValidation();
									},
									error: function (error) {

									}

								});
							},
							onProductValueHelpRequested: function (oEvent1) {
								var pageData = that.getView().getBindingContext().getObject();
								var ServiceOrganization = pageData.ServiceOrganization;
								var SalesOrganization = pageData.SalesOrganization;
								var DistributionChannel = pageData.DistributionChannel;
								var input = oEvent1.getSource();
								input.setTokens([]);
								var configObject = {
									entitySet: "ZAE_VH_MatSalesSupersession",
									initiallyVisibleFields: "Material,MaterialGroup,MaterialType,ItemCategoryGroup,UnitOfMeasure,LaboratoryOffice,AvailableQuantity",
									selectionMode: "MultiToggle",

									tokenObject: {
										key: "Material",
										Description: "MaterialName"
									},
									controlConfiguration: [{
										index: 0,
										key: "SalesOrganization",
										filterType: "auto",
										label: "SalesOrganization",
										mandatory: "auto",
										visible: false
									}, {
										index: 1,
										key: "DistributionChannel",
										filterType: "auto",
										label: "DistributionChannel",
										mandatory: "auto",
										visible: false
									}, {
										index: 2,
										key: "Material",
										filterType: "auto",
										label: "Material",
										mandatory: "auto",
										visible: true
									}, {
										index: 3,
										key: "MaterialName",
										filterType: "auto",
										label: "{/#ZAE_VH_MatSalesSupersessionType/MaterialName/@sap:label}",
										mandatory: "auto",
										visible: true
									}, {
										index: 4,
										key: "MaterialGroup",
										filterType: "auto",
										label: "Material Group",
										mandatory: "auto",
										visible: true
									}, {
										index: 5,
										key: "MaterialType",
										filterType: "auto",
										label: "MaterialType",
										mandatory: "auto",
										visible: true
									}, {
										index: 6,
										key: "Plant",
										filterType: "auto",
										label: "Service Organization",
										mandatory: "auto",
										visible: false
									}, {
										index: 7,
										key: "LaboratoryOffice",
										filterType: "auto",
										label: "Laboratory/Design office",
										mandatory: "auto",
										visible: true
									}],
									defaultFilter: {
										Plant: {
											"items": [{
												"key": ServiceOrganization
											}]
										},
										// DistributionChannel: {
										// 	"items": [{
										// 		"key": DistributionChannel
										// 	}]
										// },
										MaterialType: {
											"items": [{
												"key": "HERB"
											}]
										},
										// SalesOrganization: {
										// 	"items": [{
										// 		"key": SalesOrganization
										// 	}]
										// }

									},
									onBeforeRebindSmartTable: function (oEvent) {
										var aFilterArray = oEvent.getParameter("bindingParams").filters;
										aFilterArray.push(new sap.ui.model.Filter({
											path: "Plant",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: ServiceOrganization
										}));
										aFilterArray.push(new sap.ui.model.Filter({
											path: "DistributionChannel",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: DistributionChannel
										}));
										aFilterArray.push(new sap.ui.model.Filter({
											path: "SalesOrganization",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: SalesOrganization
										}));
										oEvent.getParameter("bindingParams").filters = aFilterArray;
										oEvent.getParameter("bindingParams").parameters.select = oEvent.getParameter("bindingParams").parameters.select +
											',AvailableQuantity'
									}

								};
								that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
							},
							onMaterailTokenUpdate: function (oEvent) {
								var selSecData = that.aeUtil.getSecData(that, "OPFacet");
								var aTokens = oEvent.getSource().getTokens();
								var oTableItems = Fragment.byId("AddComponentDialog", "idComponentListTable").getItems();
								var oBindingContexts = oEvent.getSource().getParent().oBindingContexts;
								var path = oBindingContexts["mWorkEstimateComponent"].getPath();
								var oModel = oBindingContexts["mWorkEstimateComponent"].getModel();
								var oDescriptionCheck = false;
								var oPriceCheck = false;
								var validationtable = that.getView().getModel("mWorkEstimateComponent").getData().DescriptionCheckData;
								// var ItemsTable = that.getView().byId(that.getView().createId("CPFacet" + "::Table")).getTable().getItems();
								if (aTokens.length === 0 || oEvent.getParameters().type === "removed") {
									oEvent.getSource().setSelectedKey("");
									oModel.setProperty(path + "/MaterialVHData", []);
									oModel.setProperty(path + "/PriceCheck", false);
									oModel.setProperty(path + "/DescriptionCheck", false);
									oModel.setProperty(path + "/Price", "");
									oModel.setProperty(path + "/OrderDesc", "");
									//	oModel.setProperty(path + "/Currency", "");
									oModel.setProperty(path + "/Quantity", "");
									oModel.setProperty(path + "/AvailableQuantity", "");
									oModel.setProperty(path + "/Severity", "");
									// oModel.setProperty(path + "/oValueState", "None");
									// oModel.setProperty(path + "/oValueStateText", "");
								} else {
									var oBindingContexts = oEvent.getSource().getParent().oBindingContexts;
									var path = oBindingContexts["mWorkEstimateComponent"].getPath();
									if (aTokens.length > 1) {
										var MainItem = Number(path.split("/")[2]);
										aTokens.forEach(function (oToken, i) {
											if (!oTableItems[MainItem]) {
												this.addLine();
												// this.fnAdditonalColumns(oBindingContexts);
												oTableItems = Fragment.byId("AddComponentDialog", "idComponentListTable").getItems();
												//Fragment.byId("NewItemTableDialog", "idItemListListTable").getModel().refresh(true);
											}
											var ItemCatFromMat = aTokens[i].mAggregations.customData[0].getProperty("value").ItemCategoryGroup;
											validationtable.forEach(function (ele) {
												if (ele.ItemCatGroup === ItemCatFromMat) {
													oDescriptionCheck = ele.DescriptionCheck;
													oPriceCheck = ele.PriceCheck;
												}
											});

											oModel.oData.TableData[i + 1].DescriptionCheck = oDescriptionCheck;
											oModel.oData.TableData[i + 1].PriceCheck = oPriceCheck;
											if (MainItem < 100) {
												oTableItems[MainItem].getCells()[2].setTokens([aTokens[i]]);
												oTableItems[MainItem].getCells()[2].fireTokenUpdate();
												MainItem = MainItem + 1;

												// oModel.oData.TableData.forEach(function (obj) {
												// 	var MaterialItemCheck = ItemsTable.find(function (Item) {
												// 		return Item.getBindingContext().getObject().OriginallyRequestedProduct === obj.Material;

												// 	});
												// 	if (MaterialItemCheck) {
												// 		obj.oValueState = "Warning";
												// 		obj.oValueStateText = "Component with material" + " " + obj.Material + " " + "already exists";
												// 	} else {
												// 		obj.oValueState = "None";
												// 		obj.oValueStateText = "";
												// 	}
												// });
											}
										}.bind(this));
									} else {
										oEvent.getSource().setSelectedKey(aTokens[0].getProperty("key"));
										var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
										var oToken = new Token({
											key: aTokens[0].getKey(),
											text: aTokens[0].getText()
										});
										var oModel = oBindingContexts["mWorkEstimateComponent"].getModel();

										// oModel.setProperty(path + "/MaterialVHData", [oToken]);
										oEvent.getSource().setTokens([oToken]);
										oModel.setProperty(path + "/QuantityUnit", oSelRowData.UnitOfMeasure);
										oModel.setProperty(path + "/ItemCategoryGroup", oSelRowData.ItemCategoryGroup);
										oModel.setProperty(path + "/Material", aTokens[0].getKey());
										oModel.setProperty(path + "/Quantity", "1");
										oModel.setProperty(path + "/AvailableQuantity", oSelRowData.AvailableQuantity);
										// var MaterialItemCheck = ItemsTable.find(function (Item) {
										// 	return Item.getBindingContext().getObject().OriginallyRequestedProduct === aTokens[0].getKey();

										// });
										// if (MaterialItemCheck) {
										// 	var oValueState = "Warning";
										// 	var oValueStateText = "Component with material" + " " + aTokens[0].getKey() + " " + "already exists";
										// 	oModel.setProperty(path + "/oValueState", oValueState);
										// 	oModel.setProperty(path + "/oValueStateText", oValueStateText);
										// } else {
										// 	oModel.setProperty(path + "/oValueState", "None");
										// 	oModel.setProperty(path + "/oValueStateText", "");
										// }

										// oModel.oData.TableData.forEach(function (obj) {
										// 	var MaterialItemCheck = ItemsTable.find(function (Item) {
										// 		return Item.getBindingContext().getObject().HigherLevelItem === selSecData.ServiceOrderOperation && Item.getBindingContext()
										// 			.getObject().OriginallyRequestedProduct === obj.Material;
										// 	});
										// 	if (MaterialItemCheck) {
										// 		obj.oValueState = "Warning";
										// 		obj.oValueStateText = "Component with material" + " " + obj.Material + " " + "already exists";
										// 	} else {
										// 		obj.oValueState = "None";
										// 		obj.oValueStateText = "";
										// 	}
										// });
									}

								}
								if (oEvent.getParameters().type !== "removed") {
									this.fnLoadItemCateghory(oBindingContexts);
									// this.fnAdditonalColumns(oBindingContexts);
								}
							},

							fnAdditonalColumns: function (oBindingContexts) {
								var self = this;
								var pageData = that.getView().getBindingContext().getObject();
								var path = oBindingContexts["mWorkEstimateComponent"].getPath();
								var oWEModel = oBindingContexts["mWorkEstimateComponent"].getModel();
								var oWEModelData = oWEModel.getData();
								var rowData = oWEModel.getProperty(path);
								var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
								var aFilter = [];
								aFilter.push(new sap.ui.model.Filter({
									path: "Ttype",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.ServiceDocumentType
										//value1: "ZORP"
								}));
								if (rowData.Material) {
									aFilter.push(new sap.ui.model.Filter({
										path: "ItemCatGroup",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: rowData.ItemCategoryGroup
											//	value1: "ZSUC"
									}));
								}

								var ItemListTable = Fragment.byId("AddComponentDialog", "idComponentListTable");
								var oItems = ItemListTable.getAggregation("items");
								that.getView().getModel().read("/ZAE_I_TC_SSOD_10", {
									filters: aFilter,
									success: function (oData, response) {
										//	oItemCategory.setBusy(false);
										if (oData.results.length > 0) {
											rowData.PriceCheck = oData.results[0].PriceCheck;
											rowData.DescriptionCheck = oData.results[0].DescriptionCheck;

											// rowData.PriceCheck = true;
											// rowData.DescriptionCheck = true;

										} else {
											rowData.PriceCheck = false;
											rowData.DescriptionCheck = false;
										}
										oWEModel.updateBindings(true);
										//	self.fnSubmitButonValidation();
									},
									error: function (error) {

									}
								});
							},

							addLine: function () {
								var pageData = that.getView().getBindingContext().getObject();
								var oModel = that.getView().getModel("mWorkEstimateComponent");
								var TableData = oModel.getProperty("/TableData");
								TableData.push({
									ItemNumber: "",
									HighLevelItemNumber: Number(TableData[0].ItemNumber) + "",
									Material: "",
									MaterialName: "",
									MaterialVHData: [],
									Quantity: "",
									QuantityUnit: "",
									AvailableQuantity: "",
									ItemCategory: "",
									Price: 0,
									OrderDesc: "",
									Currency: pageData.currency,
									ItemCategoryDesc: "",
									Enabled: true,
									PriceCheck: false,
									DescriptionCheck: false
								});
								oModel.setProperty("/TableData", TableData);
							},
							onSelectMaterial: function (oEvent) {
								if (oEvent.getParameter("selectedRow") !== null) {
									var selSecData = that.aeUtil.getSecData(that, "OPFacet");
									// var ItemsTable = that.getView().byId(that.getView().createId("CPFacet" + "::Table")).getTable().getItems();
									var oSource = oEvent.getSource();
									oSource.setTokens([]);
									var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
									var oText = this.formatNameAndValuePair(oSelectedData.MaterialName, oSelectedData.Material)
									var oToken = new sap.m.Token({
										key: oSelectedData.Material,
										text: oText
									});
									oSource.setTokens([oToken]);

									// oModel.oData.TableData.forEach(function (obj) {
									// var MaterialItemCheck = ItemsTable.find(function (Item) {
									// 	return Item.getBindingContext().getObject().OriginallyRequestedProduct === oSource.getTokens()[0].getKey();

									// });

									// });
									// oSource.fireTokenUpdate();
									var oBindingContexts = oEvent.getSource().getParent().oBindingContexts;
									var path = oBindingContexts["mWorkEstimateComponent"].getPath();
									var oModel = oBindingContexts["mWorkEstimateComponent"].getModel();
									oEvent.getSource().setSelectedKey(oSelectedData.Material);
									// var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
									oModel.setProperty(path + "/MaterialVHData", [oSelectedData]);
									oModel.setProperty(path + "/ItemCategoryGroup", oSelectedData.ItemCategoryGroup);
									oModel.setProperty(path + "/Material", oSelectedData.Material);
									oModel.setProperty(path + "/QuantityUnit", oSelectedData.UnitOfMeasure);
									oModel.setProperty(path + "/Quantity", "1");
									oModel.setProperty(path + "/AvailableQuantity", oSelectedData.AvailableQuantity);
									// if (MaterialItemCheck) {
									// 	var oValueState = "Warning";
									// 	var oValueStateText = "Component with material" + " " + oSource.getTokens()[0].getKey() + " " + "already exists";
									// 	oModel.setProperty(path + "/oValueState", oValueState);
									// 	oModel.setProperty(path + "/oValueStateText", oValueStateText);
									// }
									this.fnLoadItemCateghory(oBindingContexts);
									this.fnAdditonalColumns(oBindingContexts);
								}
							},
							handleMaterialSuggest: function (oEvent) {
								var pageData = that.getView().getBindingContext().getObject();
								var sTerm = oEvent.getParameter("suggestValue");
								var aFilters = [];
								if (sTerm) {
									aFilters.push(new sap.ui.model.Filter({
										path: "Plant",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.ServiceOrganization
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "DistributionChannel",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.DistributionChannel
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "SalesOrganization",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.SalesOrganization
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "MaterialType",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: "HERB"
									}));
									// aFilters.push(new sap.ui.model.Filter({
									// 	path: "DrillState1",
									// 	operator: sap.ui.model.FilterOperator.EQ,
									// 	value1: "leaf"
									// }));
									aFilters.push(new Filter({
										filters: [
											new Filter({
												path: "Material",
												operator: sap.ui.model.FilterOperator.Contains,
												value1: sTerm
											}),
											new Filter({
												path: "MaterialName",
												operator: sap.ui.model.FilterOperator.Contains,
												value1: sTerm
											})

										],
										and: false
									}));
								}
								oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
								oEvent.getSource().getBinding("suggestionRows").resume();
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
							fnLoadItemCateghory: function (oBindingContexts) {
								var self = this;
								var pageData = that.getView().getBindingContext().getObject();
								var path = oBindingContexts["mWorkEstimateComponent"].getPath();
								var oWEModel = oBindingContexts["mWorkEstimateComponent"].getModel();
								var oWEModelData = oWEModel.getData();
								var rowData = oWEModel.getProperty(path);
								var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
								var aFilter = [];
								aFilter.push(new sap.ui.model.Filter({
									path: "TransactionType",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.ServiceDocumentType
								}));
								if (rowData.Material) {
									aFilter.push(new sap.ui.model.Filter({
										path: "ItemCategoryGroup",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: rowData.ItemCategoryGroup
									}));
								} else {
									oWEModel.setProperty(path + "/ItemCategory", "");
									oWEModel.setProperty(path + "/ItemCategoryDesc", "");
									self.fnSubmitButonValidation();
									return;
								}
								var HighLevelItemCategory = "";
								if (rowData.HighLevelItemNumber) {

									for (var i = 0; i < currentIndex; i++) {
										if (oWEModelData.TableData[i].ItemNumber === oWEModelData.TableData[currentIndex].HighLevelItemNumber) {
											HighLevelItemCategory = oWEModelData.TableData[i].ItemCategory;
										}
									}

								}
								aFilter.push(new sap.ui.model.Filter({
									path: "ItemCategoryMainItem",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: HighLevelItemCategory
								}));

								var ItemListTable = Fragment.byId("AddComponentDialog", "idComponentListTable");
								var oItems = ItemListTable.getAggregation("items");
								var oItemCategory = oItems[currentIndex].getAggregation("cells")[7];
								oItemCategory.setBusy(true);
								that.getView().getModel().read("/ZAE_I_ItemCategoryDetermine", {
									filters: aFilter,
									success: function (oData, response) {
										oItemCategory.setBusy(false);
										if (oData.results.length > 0) {
											oWEModel.setProperty(path + "/ItemCategory", oData.results[0].ItemCategory);
											oWEModel.setProperty(path + "/ItemCategoryDesc", oData.results[0].ItemCategoryDesc);
										} else {
											oWEModel.setProperty(path + "/ItemCategory", "");
											oWEModel.setProperty(path + "/ItemCategoryDesc", "");
										}
										self.fnSubmitButonValidation();
									},
									error: function (error) {
										oItemCategory.setBusy(false);
									}
								});

							},

							fnSubmitButonValidation: function () {
								var ItemListTable = Fragment.byId("AddComponentDialog", "idComponentListTable");
								var oItems = ItemListTable.getAggregation("items");
								var BoolPendingIP = false;
								var boolDataExist = false;
								for (var i = 1; i < oItems.length; i++) {
									var Material;
									if (oItems[i].getAggregation("cells")[2].getTokens().length > 0) {
										Material = oItems[i].getAggregation("cells")[2].getTokens()[0].getKey();
									} else {
										Material = ""
									}
									var Quantity = oItems[i].getAggregation("cells")[4].getValue();
									var oAvailableQuantity = oItems[i].getAggregation("cells")[6].getText().replace(/ *\([^)]*\) */g, "");
									Quantity = parseFloat(Quantity);
									oAvailableQuantity = parseFloat(oAvailableQuantity);
									if (Quantity <= 0 || Quantity > oAvailableQuantity) {
										oItems[i].getAggregation("cells")[4].setValueState('Error');
									} else {
										oItems[i].getAggregation("cells")[4].setValueState('None');
									}
									var QtyValueState = oItems[i].getAggregation("cells")[4].getValueState();
									var ItemCategory = oItems[i].getAggregation("cells")[7].getText();
									var MaterialDesc = oItems[i].getAggregation("cells")[3].getValue();
									var UnitPrice = oItems[i].getAggregation("cells")[8].getValue();
									if (Material || Quantity) { /**Validation Required/Not **/
										boolDataExist = true;
										if (!Material || isNaN(Quantity) || Quantity <= 0 || !ItemCategory) { //Validation //|| !MaterialDesc || !UnitPrice
											BoolPendingIP = true;
										}
										if (that.getView().getModel('mWorkEstimateComponent').getData().TableData[i].DescriptionCheck) {
											if (!MaterialDesc) {
												BoolPendingIP = true;
											}
										}
										if (that.getView().getModel('mWorkEstimateComponent').getData().TableData[i].PriceCheck) {
											if (!UnitPrice || UnitPrice === '0') {
												BoolPendingIP = true;
											}
										}
									}

								}
								Fragment.byId("AddComponentDialog", "BTNSubmit").setEnabled(boolDataExist ? !BoolPendingIP : false);
							},

							onAddNewRow: function () {
								var pageData = that.getView().getBindingContext().getObject();
								var mWEComponent = that.getView().getModel("mWorkEstimateComponent");
								var mWEComponentData = mWEComponent.getData();
								mWEComponentData.TableData.push({
									ItemNumber: "",
									HighLevelItemNumber: Number(mWEComponentData.TableData[0].ItemNumber) + "",
									Material: "",
									MaterialName: "",
									MaterialVHData: [],
									Quantity: "",
									QuantityUnit: "",
									AvailableQuantity: "",
									ItemCategory: "",
									ItemCategoryDesc: "",
									Severity: "",
									Price: 0,
									OrderDesc: "",
									Currency: pageData.currency,
									Enabled: true,
									PriceCheck: false,
									DescriptionCheck: false
								});
								mWEComponent.updateBindings(true);
							},

							onDeletePress: function (oEvent) {
								var oSource = oEvent.getSource();
								var oBindingContexts = oSource.getParent().oBindingContexts;
								var path = oBindingContexts["mWorkEstimateComponent"].getPath();
								var oWEModel = oBindingContexts["mWorkEstimateComponent"].getModel();
								var OEModelData = oWEModel.getData();
								var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
								var filteredData = [];
								for (var i = 0; i < OEModelData.TableData.length; i++) {
									if (currentIndex != i) {
										filteredData.push(OEModelData.TableData[i]);
									}
								}
								OEModelData.TableData = filteredData;
								oWEModel.updateBindings(true);
								this.fnSubmitButonValidation();

							},

							onReset: function () {
								that._initAddComponentsDialog("RESET");
							},

							onSubmit: function () {
								var actId = "SSOD_B42";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var oModel = that.getView().getModel("AddComponents1");
								var oEntity = "ZAE_FM_SSWE_ADD_COMPONENTS_MSet"; //"ZAE_FM_SSWE_ADD_COMPONENTSSet";
								var pageData = that.getView().getBindingContext().getObject();
								var mmWorkEstimateComponent = that.getView().getModel("mWorkEstimateComponent");
								var oWorkEstimateComponentData = mmWorkEstimateComponent.getData();
								var NavMain = [{
									"Estimate": pageData.ServiceOrder,
									"Operation": oWorkEstimateComponentData.TableData[0].ItemNumber.padStart(6, 0)
								}];
								var NavItems = [];
								for (var i = 1; i < oWorkEstimateComponentData.TableData.length; i++) {
									if (oWorkEstimateComponentData.TableData[i].Material) {
										var Quantity = oWorkEstimateComponentData.TableData[i].Quantity;
										if (Quantity < '0') {
											var MsgErrBox = that.getView().getModel("i18n").getResourceBundle().getText("Quantityshouldnottakelessthan");
											MessageBox.error(MsgErrBox);
											return;
										}
										NavItems.push({
											"OrderedProd": oWorkEstimateComponentData.TableData[i].Material,
											"Quantity": oWorkEstimateComponentData.TableData[i].Quantity,
											"Severity": oWorkEstimateComponentData.TableData[i].Severity,
											"OrderProdDesc": oWorkEstimateComponentData.TableData[i].OrderDesc,
											"Price": (oWorkEstimateComponentData.TableData[i].Price) !== "" ? (oWorkEstimateComponentData.TableData[i].Price).toString() : "0",
											"Currency": oWorkEstimateComponentData.TableData[i].Currency,
											"ProcessQtyUnit": ""

										});
									}
								}

								var data = [{
									callProperty: "NavMain",
									value: NavMain
								}, {
									callProperty: "NavItems",
									value: NavItems
								}];
								var succFunc = function (oData, response) {
									that.aeUtil.refreshControlModel(that.oITFacetAddComponentsButton);
									that._fnLockAddComponent(false);
									that.resetSessionTimeout(false);
									that.oMouseMove = true;
								}.bind(this);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
								that._AddComponentsDialog.close();
							},

							onCancel: function () {
								that._AddComponentsDialog.close();
								that._fnLockAddComponent(false);
								that.resetSessionTimeout(false);
								that.oMouseMove = true;
							},

						}
					}).then(function (DialogContent) {
						that._AddComponentsDialog = DialogContent;
						that.getView().addDependent(that._AddComponentsDialog);
						that._initAddComponentsDialog("INIT");
						that._AddComponentsDialog.attachBrowserEvent("keyup", function (e) {
							if (e.which == 27 || e.keyCode == 27) {
								that._fnLockAddComponent(false);
							}
						}.bind(this));
					});
				} else {
					that._initAddComponentsDialog("INIT");
				}
			} else {
				this.fnAddSubletComponents(oSource);
			}
		},
		// _initAddComponentsDialog: function (form) {
		// 	var that = this;
		// 	var pageData = that.getView().getBindingContext().getObject();
		// 	Fragment.byId("AddComponentDialog", "BTNSubmit").setEnabled(false);
		// 	var oDataInitial = {
		// 		TableData: [],
		// 		DescriptionCheckData: []
		// 	};

		// 	var oCols = {
		// 		"cols": [{
		// 			"label": "Material",
		// 			"template": "Material",
		// 			"width": "10rem"
		// 		}, {
		// 			"label": "MaterialName",
		// 			"template": "MaterialName",
		// 			"width": "15rem"
		// 		}, {
		// 			"label": "SalesOrganization",
		// 			"template": "SalesOrganization",
		// 			"width": "15rem"
		// 		}, {
		// 			"label": "DistributionChannel",
		// 			"template": "DistributionChannel",
		// 			"width": "15rem"
		// 		}, {
		// 			"label": "MaterialGroup",
		// 			"template": "MaterialGroup",
		// 			"width": "15rem"
		// 		}, {
		// 			"label": "MaterialGroupName",
		// 			"template": "MaterialGroupName",
		// 			"width": "15rem"
		// 		}, {
		// 			"label": "ItemCategoryGroup",
		// 			"template": "ItemCategoryGroup",
		// 			"width": "15rem"
		// 		}, {
		// 			"label": "Material Type",
		// 			"template": "MaterialType",
		// 			"width": "15rem"
		// 		}, {
		// 			"label": "Material Type Name",
		// 			"template": "MaterialTypeName",
		// 			"width": "15rem"
		// 		}]
		// 	};
		// 	this.oAddComponentMatVHColModel = new JSONModel(oCols);
		// 	var selSecData = this.aeUtil.getSecData(that, "OPFacet");
		// 	if (selSecData instanceof Array) {
		// 		var dialog = new Dialog({
		// 			title: 'Warning',
		// 			type: 'Message',
		// 			state: 'Warning',
		// 			content: new Text({
		// 				text: 'Multiple Selection Not allowed'
		// 			}),
		// 			beginButton: new Button({
		// 				type: ButtonType.Emphasized,
		// 				text: 'OK',
		// 				press: function () {
		// 					dialog.close();
		// 				}
		// 			}),
		// 			afterClose: function () {
		// 				dialog.destroy();
		// 			}
		// 		});
		// 		dialog.open();
		// 		return;
		// 	}
		// 	var oToken = new sap.m.Token({
		// 		key: selSecData.OriginallyRequestedProduct,
		// 		text: that.aeUtil.formatNameAndValuePair(selSecData.MaterialName, selSecData.OriginallyRequestedProduct)
		// 	});
		// 	oDataInitial.TableData.push({
		// 		ItemNumber: Number(selSecData.ServiceOrderOperation) + "",
		// 		HighLevelItemNumber: Number(selSecData.ServiceOrderOperation) == 0 ? "" : Number(selSecData.ServiceOrderOperation) + "",
		// 		Material: selSecData.OriginallyRequestedProduct,
		// 		MaterialName: selSecData.MaterialName,
		// 		MaterialVHData: [{
		// 			Material: selSecData.OriginallyRequestedProduct,
		// 			MaterialName: selSecData.MaterialName
		// 		}],
		// 		Quantity: selSecData.OperationQuantity,
		// 		QuantityUnit: selSecData.OperationQuantityUnit,
		// 		ItemCategory: selSecData.ServiceDocItemCategory,
		// 		ItemCategoryDesc: selSecData.ServiceDocItemCategoryName,
		// 		Severity: selSecData.Severity,
		// 		Price: 0,
		// 		Currency: pageData.currency,
		// 		OrderDesc: "",
		// 		Enabled: false,
		// 		PriceCheck: false,
		// 		DescriptionCheck: false
		// 	});
		// 	for (var i = 10; i <= 20; i = i + 10) {
		// 		oDataInitial.TableData.push({
		// 			ItemNumber: "",
		// 			HighLevelItemNumber: Number(selSecData.ServiceOrderOperation) + "",
		// 			Material: "",
		// 			MaterialName: "",
		// 			MaterialVHData: [],
		// 			Quantity: "",
		// 			QuantityUnit: "",
		// 			ItemCategory: "",
		// 			ItemCategoryDesc: "",
		// 			Currency: pageData.currency,
		// 			OrderDesc: "",
		// 			Price: 0,
		// 			Severity: "",
		// 			Enabled: true,
		// 			PriceCheck: false,
		// 			DescriptionCheck: false
		// 		});
		// 	}

		// 	var aFilter = [];
		// 	aFilter.push(new sap.ui.model.Filter({
		// 		path: "Ttype",
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: pageData.ServiceDocumentType
		// 			// value1: "ZORP"
		// 	}));
		// 	Fragment.byId("AddComponentDialog", "idComponentListTable").setBusy(true);
		// 	that.getView().getModel().read("/ZAE_I_TC_SSOD_10", {
		// 		filters: aFilter,
		// 		success: function (oData, response) {
		// 			Fragment.byId("AddComponentDialog", "idComponentListTable").setBusy(false);
		// 			// if (oData.results.length > 0) {
		// 			oDataInitial.DescriptionCheckData = oData.results;
		// 			var oJSONModel = new JSONModel(jQuery.extend(true, {}, oDataInitial));
		// 			that.getView().setModel(oJSONModel, "mWorkEstimateComponent");
		// 			oJSONModel.updateBindings(true);
		// 			Fragment.byId("AddComponentDialog", "idComponentListTable").getItems()[0].getCells()[2].setTokens([oToken]);
		// 			// }
		// 		},
		// 		error: function (error) {
		// 			Fragment.byId("AddComponentDialog", "idComponentListTable").setBusy(false);
		// 		}
		// 	});
		// 	// var oJSONModel = new JSONModel(jQuery.extend(true, {}, oDataInitial));
		// 	// that.getView().setModel(oJSONModel, "mWorkEstimateComponent");

		// 	if (form === "INIT") {
		// 		this._AddComponentsDialog.open();
		// 	}
		// },

		_initAddComponentsDialog: function (form) {
			var that = this;
			var pageData = that.getView().getBindingContext().getObject();
			var ButtonID = "SSOD_B42"
			Fragment.byId("AddComponentDialog", "BTNSubmit").setEnabled(false);
			var oDataInitial = {
				TableData: [],
				DescriptionCheckData: []
			};

			var oCols = {
				"cols": [{
					"label": "Material",
					"template": "Material",
					"width": "10rem"
				}, {
					"label": "MaterialName",
					"template": "MaterialName",
					"width": "15rem"
				}, {
					"label": "SalesOrganization",
					"template": "SalesOrganization",
					"width": "15rem"
				}, {
					"label": "DistributionChannel",
					"template": "DistributionChannel",
					"width": "15rem"
				}, {
					"label": "MaterialGroup",
					"template": "MaterialGroup",
					"width": "15rem"
				}, {
					"label": "MaterialGroupName",
					"template": "MaterialGroupName",
					"width": "15rem"
				}, {
					"label": "ItemCategoryGroup",
					"template": "ItemCategoryGroup",
					"width": "15rem"
				}, {
					"label": "Material Type",
					"template": "MaterialType",
					"width": "15rem"
				}, {
					"label": "Material Type Name",
					"template": "MaterialTypeName",
					"width": "15rem"
				}]
			};
			this.oAddComponentMatVHColModel = new JSONModel(oCols);
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			if (selSecData instanceof Array) {
				var dialog = new Dialog({
					title: 'Warning',
					type: 'Message',
					state: 'Warning',
					content: new Text({
						text: 'Multiple Selection Not allowed'
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: 'OK',
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});
				dialog.open();
				return;
			}
			var oToken = new sap.m.Token({
				key: selSecData.OriginallyRequestedProduct,
				text: that.aeUtil.formatNameAndValuePair(selSecData.MaterialName, selSecData.OriginallyRequestedProduct)
			});
			oDataInitial.TableData.push({
				ItemNumber: Number(selSecData.ServiceOrderOperation) + "",
				HighLevelItemNumber: Number(selSecData.ServiceOrderOperation) == 0 ? "" : Number(selSecData.ServiceOrderOperation) + "",
				Material: selSecData.OriginallyRequestedProduct,
				MaterialName: selSecData.MaterialName,
				MaterialVHData: [{
					Material: selSecData.OriginallyRequestedProduct,
					MaterialName: selSecData.MaterialName
				}],
				Quantity: selSecData.OperationQuantity,
				QuantityUnit: selSecData.OperationQuantityUnit,
				ItemCategory: selSecData.ServiceDocItemCategory,
				ItemCategoryDesc: selSecData.ServiceDocItemCategoryName,
				Severity: selSecData.Severity,
				Price: 0,
				Currency: pageData.currency,
				OrderDesc: "",
				Enabled: false,
				PriceCheck: false,
				DescriptionCheck: false,
				oValueState: "None",
				oValueStateText: ""
			});
			for (var i = 10; i <= 20; i = i + 10) {
				oDataInitial.TableData.push({
					ItemNumber: "",
					HighLevelItemNumber: Number(selSecData.ServiceOrderOperation) + "",
					Material: "",
					MaterialName: "",
					MaterialVHData: [],
					Quantity: "",
					QuantityUnit: "",
					AvailableQuantity: "",
					ItemCategory: "",
					ItemCategoryDesc: "",
					Currency: pageData.currency,
					OrderDesc: "",
					Price: 0,
					Severity: "",
					Enabled: true,
					PriceCheck: false,
					DescriptionCheck: false,
					oValueState: "None",
					oValueStateText: ""

				});
			}

			var aFilter = [];
			aFilter.push(new sap.ui.model.Filter({
				path: "Ttype",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.ServiceDocumentType
					// value1: "ZORP"
			}));
			Fragment.byId("AddComponentDialog", "idComponentListTable").setBusy(true);
			that.getView().getModel().read("/ZAE_I_TC_SSOD_10", {
				filters: aFilter,
				success: function (oData, response) {
					Fragment.byId("AddComponentDialog", "idComponentListTable").setBusy(false);
					// if (oData.results.length > 0) {
					oDataInitial.DescriptionCheckData = oData.results;
					var oJSONModel = new JSONModel(jQuery.extend(true, {}, oDataInitial));
					that.getView().setModel(oJSONModel, "mWorkEstimateComponent");
					oJSONModel.updateBindings(true);
					Fragment.byId("AddComponentDialog", "idComponentListTable").getItems()[0].getCells()[2].setTokens([oToken]);
					Fragment.byId("AddComponentDialog", "fileUploaderInput").clear();
					// }
				},
				error: function (error) {
					Fragment.byId("AddComponentDialog", "idComponentListTable").setBusy(false);
				}
			});
			// var oJSONModel = new JSONModel(jQuery.extend(true, {}, oDataInitial));
			// that.getView().setModel(oJSONModel, "mWorkEstimateComponent");
			that.oMouseMove = false;

			$(document).mousemove(function () {
				if (!that.oMouseMove) {
					that.resetSessionTimeout(true);
				}
			});

			$(document).keypress(function (e) {
				if (!that.oMouseMove) {
					that.resetSessionTimeout(true);
				}
			});

			that.resetSessionTimeout(true);

			if (form === "INIT") {
				that._fnLockAddComponent(true, ButtonID);
			}
		},

		_fnLockAddComponent: function (Lock, ButtonID) {
			var that = this;
			var pageData = this.getView().getBindingContext().getObject();
			var actId = ButtonID;
			var actLabel = this.aeUtil.geti18nText(that, actId);
			// var oModel = this.getView().getModel();
			// var oEntity = "ZAE_FM_SRV_DOC_LOCK_UNLOCKSet";
			// var data = [{
			// 	callProperty: "ObjectId",
			// 	value: pageData.WorkEstimate
			// }, {
			// 	callProperty: "Lock",
			// 	value: Lock
			// }];
			var oModel = this.getView().getModel("LockModel");
			var oEntity = "ZAE_FM_SRV_DOC_LOCK_UNLOCKSet";
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}, {
				callProperty: "Lock",
				value: Lock
			}];
			var succFunc = function (oData, response) {
				if (Lock && ButtonID === "SSOD_B42") {
					this._AddComponentsDialog.open();
				}
				if (Lock && ButtonID === "SSOD_B42Sub") {
					this._AddSubletComponentsDialog.open();
				}
				if (Lock && ButtonID === "SSOD_B66") {
					this._AddItemTableDialog.open();
				}
				if (Lock && ButtonID === "SSOD_B149") {
					this._AddSubletLabourComponentsDialog.open();
				}
				//	this.extensionAPI.refresh();
			}.bind(this);
			var errFunc = function (oData, response) {
				// this.aeUtil.refreshControlModel(oView);
			}.bind(this);
			that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);
		},

		resetSessionTimeout: function (SessionCheck) {
			var that = this;
			this.timeout;
			clearTimeout(this.timeout);
			this.timeout = setTimeout(function () {
					that.sessionExpired(SessionCheck);
				},
				180000); // 180000

		},

		sessionExpired: function (SessionCheck) {
			var that = this;
			var Lock = false;
			if (SessionCheck) {
				if (that._AddComponentsDialog) {
					that._AddComponentsDialog.close();
				}
				if (that._AddSubletComponentsDialog) {
					that._AddSubletComponentsDialog.close();
				}
				if (that._AddItemTableDialog) {
					that._AddItemTableDialog.close();
				}
				if (that._AddSubletLabourComponentsDialog) {
					that._AddSubletLabourComponentsDialog.close();
				}

				that._fnLockAddComponent(Lock);
				that.oMouseMove = true;
				that.oDialog = new sap.m.Dialog({
					title: "Session Timeout",
					type: sap.m.DialogType.Message,
					content: new sap.m.Text({
						text: "Session has timed out."
					}),
					beginButton: new sap.m.Button({
						text: "OK",
						press: function (oEvent) {
							that.oDialog.close();
						}
					})
				});
				that.oDialog.open();
			}

		},
		onClickSSOD_B43: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B41";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_STS_REL_FR_BILLINGSet";
			var data = [{
				callProperty: "IOrderId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		onClickSSOD_B44: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "RBSFacet");
			var actId = "SSOD_B44";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var header = [];
			var items = [];
			if (selSecData instanceof Array) {
				header.push({
					"IOrderId": selSecData[0].ServiceOrder
				});
				for (var i = 0; i < selSecData.length; i++) {
					items.push({
						"NumberInt": selSecData[i].ServiceOrderOperation
					});
				}
			} else {
				header.push({
					"IOrderId": selSecData.ServiceOrder
				});
				items.push({
					"NumberInt": selSecData.ServiceOrderOperation
				});
			}
			var oEntity = "HEADER_TO_BILLINGSet";

			var data = [{
				callProperty: "N_HEADER_TO_BILLING",
				value: header
			}, {
				callProperty: "N_ITEMS_TO_BILLING",
				value: items
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		onClickSSOD_B45: function (oEvent) {
			var ButtonID = "SSOD_B45";
			this.fnDynamicNotes(ButtonID);
			// var that = this;
			// var pageData = this.aeUtil.getPageData(oEvent);
			// if (pageData.E0019NoteMandatory === true) {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.getView().getBindingContext().getObject();
			// 	var actId = "SSOD_B45";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);

			// 	var fragName = "com.globalintelli.zae_ssod.ext.fragment.ApprovedbyInternalDept";
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_APPBY_INTDPSet";
			// 	var dialogFields = [{
			// 		fragInputId: "Note",
			// 		fragInputLabel: this.aeUtil.geti18nText(that, "Note"),
			// 		callProperty: "Note"
			// 	}];
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];

			// 	var checkFucc = function () {
			// 		var vNote = Fragment.byId(actId + "Fragment", "Note").getValue();
			// 		if (vNote === "" || vNote === undefined) {
			// 			return {
			// 				pass: false,
			// 				msg: this.aeUtil.geti18nText(that, "Add_notes")
			// 			};
			// 		} else {
			// 			return {
			// 				pass: true
			// 			};
			// 		}
			// 	}.bind(this);
			// 	var succFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};
			// 	var errorFunc = function (oData) {
			// 		that.extensionAPI.refresh();
			// 		that.getView().setBusy(false);
			// 	};

			// 	this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, errorFunc);

			// } else {
			// 	var that = this;
			// 	var oSource = oEvent.getSource();
			// 	var pageData = this.aeUtil.getPageData(oEvent);
			// 	var actId = "SSOD_B45";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_APPBY_INTDPSet";
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];
			// 	var succFunc = function (oData, response) {
			// 		this.extensionAPI.refresh();
			// 	}.bind(this);
			// 	this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

			// }
		},
		onClickSSOD_B46: function (oEvent) {
			if (!this._oUpdateRuleDialog) {
				Fragment.load({
						id: "FragUpdateRuleDialog",
						name: "com.globalintelli.zae_ssod.ext.fragment.UpdateRule",
						controller: this
					})
					.then(function (oDialogContent) {
						this._UpdateRuleDialog(oDialogContent);
						this._setUpdateRuleDialogInitialState();
					}.bind(this));
			} else {
				this._setUpdateRuleDialogInitialState();
			}
		},
		_setUpdateRuleDialogInitialState: function () {
			Fragment.byId("FragUpdateRuleDialog", "BillingRuleInput").setSelectedKey(null);
			Fragment.byId("FragUpdateRuleDialog", "SSOD_B46MessageStrip").setVisible(false);
			var pageData = this.getView().getBindingContext().getObject();
			var BillingRule = Fragment.byId("FragUpdateRuleDialog", "BillingRuleInput");
			var oBinding = BillingRule.getBinding("items");
			var aServiceDocumentType = [];
			aServiceDocumentType.push(new Filter("ServiceOrderType", sap.ui.model.FilterOperator.EQ, pageData.ServiceDocumentType));
			oBinding.filter(aServiceDocumentType);
			this._oUpdateRuleDialog.open();
		},
		_UpdateRuleDialog: function (oDialogContent, oEvent) {
			var that = this;

			this._oUpdateRuleDialog = new sap.m.Dialog({
				title: "{i18n>SSOD_B46}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "Create",

					press: function () {
						var selSecData = this.aeUtil.getSecData(that, "OPFacet");
						var oBillingRule = Fragment.byId("FragUpdateRuleDialog", "BillingRuleInput").getSelectedKey();
						if (oBillingRule === "" || oBillingRule === undefined) {
							var msg2 = "Select Billing Rule";
							var oMessageStrip = Fragment.byId("FragUpdateRuleDialog", "SSOD_B46MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);
							return;
						}
						var pageData = that.getView().getBindingContext().getObject();
						var actId = "SSOD_B46";
						var actLabel = that.aeUtil.geti18nText(that, actId);
						var oModel = that.getView().getModel();
						var oEntity = "UPD_PARTNER_HEADERSet";
						var aHeaderData = [];
						var aItemsData = [];
						aHeaderData.push({
							"ObjectId": pageData.ServiceOrder,
							"BillingRule": oBillingRule
						});
						if (selSecData instanceof Array) {
							for (var i = 0; i < selSecData.length; i++) {
								aItemsData.push({
									"NumberInt": selSecData[i].ServiceOrderOperation
								});
							}
						} else {
							aItemsData.push({
								"NumberInt": selSecData.ServiceOrderOperation
							});
						}
						var data = [{
							callProperty: "N_UPD_PARTNER_HEADER",
							value: aHeaderData
						}, {
							callProperty: "N_UPD_PARTNER_ITEMS",
							value: aItemsData
						}];
						var succFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						var errorFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errorFunc);
						that._oUpdateRuleDialog.close();

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Close",
					press: function () {
						this._oUpdateRuleDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oUpdateRuleDialog);

		},

		onClickSSOD_B47: function () {
			var that = this;
			var selSecData = this.aeUtil.getSecData(that, "BDFacet");
			var opdfViewer = new sap.m.PDFViewer();
			that.getView().addDependent(opdfViewer);
			var sServiceURL = that.getView().getModel("ZAE_FM_CRM_PER_INVOICE_SRV").sServiceUrl;
			var sSource = sServiceURL + "/ZAE_FM_CRM_PER_INVOICESet(Invoice='" + selSecData.BillingDocument + "')/$value";
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle("Invoice " + selSecData.BillingDocument);
			opdfViewer.setShowDownloadButton(false);
			opdfViewer.open();
		},
		onClickSSOD_B48: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B48";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_CHANGE_CREDIT_STATUSSet";
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}, {
				callProperty: "Cmgst",
				value: "D"
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);

		},
		/*onClickSSOD_B49: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var actId = "SSOD_B49";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.UpdatePriority";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_PRIORITY_CHANGESet";
			var dialogFields = [{
				fragInputId: "PriorityInput",
				fragInputLabel: this.aeUtil.geti18nText(that, "PriorityInput"),
				callProperty: "Priority"
			}];
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}];
			var checkFucc = function () {
				var vPriority = Fragment.byId(actId + "Fragment", "PriorityInput").getContent().getValue();
				if (vPriority === "" || vPriority === undefined) {
					return {
						pass: false,
						msg: that.aeUtil.geti18nText(that, "ENTER_PRIORITY")
					};
				} else {
					return {
						pass: true
					};
				}
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, succFunc);

		}*/
		onClickSSOD_B49: function (oEvent) {
			var pageData = this.aeUtil.getPageData(oEvent);
			var ServiceOrder = pageData.ServiceOrder;
			if (!this._oUpdatePriorityDialog) {
				Fragment.load({
						id: "idUpdatePriorityForm",
						name: "com.globalintelli.zae_ssod.ext.fragment.UpdatePriority",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateUpdatePriorityDialog(oDialogContent, ServiceOrder);
						this._setUpdatePriorityDialogInitialState();
					}.bind(this));
			} else {
				this._setUpdatePriorityDialogInitialState();
			}
		},
		_CreateUpdatePriorityDialog: function (oDialogContent, ServiceOrder) {
			var that = this;
			this._oUpdatePriorityDialog = new sap.m.Dialog({
				title: "{i18n>SSOD_B49}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "Submit",
					enabled: true,
					press: function () {
						var vPriorityInput = Fragment.byId("idUpdatePriorityForm", "PriorityInput").getContent().getSelectedKey();
						var oMessageStrip = Fragment.byId("idUpdatePriorityForm", "SSOD_B49MessageStrip");
						var errorMessage = "";
						if (vPriorityInput === "" || vPriorityInput === undefined || vPriorityInput === null) {
							errorMessage = this.aeUtil.geti18nText(that, "SEL_PRIORITY");

						}
						if (errorMessage !== "") {
							oMessageStrip.setVisible(true).setText(errorMessage);
							return false;
						}
						var oEntity = "ZAE_FM_SSOD_PRIORITY_CHANGESet";
						var oModel = that.getView().getModel();
						var actId = "SSOD_B49";
						var actLabel = this.aeUtil.geti18nText(that, actId);
						var data = [{
							callProperty: "ObjectId",
							value: ServiceOrder
						}, {
							callProperty: "Priority",
							value: vPriorityInput
						}];

						var succFunc = function (oData) {
							that.extensionAPI.refresh();

						};

						var errFunc = function (oData) {
							that.extensionAPI.refresh();

						};

						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);
						that._oUpdatePriorityDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Close",
					press: function () {
						this._oUpdatePriorityDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oUpdatePriorityDialog);

		},
		_setUpdatePriorityDialogInitialState: function () {
			Fragment.byId("idUpdatePriorityForm", "PriorityInput").setValue();
			Fragment.byId("idUpdatePriorityForm", "PriorityInput").setEditable(true);
			var oMessageStrip = Fragment.byId("idUpdatePriorityForm", "SSOD_B49MessageStrip");
			oMessageStrip.setVisible(false);
			this._oUpdatePriorityDialog.open();
		},

		onClickSSOD_B50: function () {
			var opdfViewer = new sap.m.PDFViewer();
			this.getView().addDependent(opdfViewer);
			var selSecData = this.aeUtil.getSecData(this, "BDFacet");
			var vInvoice = selSecData.BillingDocument;
			var sServiceURL = this.getView().getModel("InvoiceBDRPreview").sServiceUrl;
			vInvoice = vInvoice.padStart(10, 0);
			var sSource = sServiceURL + "/ZAE_FM_SSOD_SER_INV_LS_BW_PSet(Invoice='" + vInvoice + "')/$value";
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle("Invoice " + vInvoice);
			opdfViewer.setShowDownloadButton(false);
			opdfViewer.open();
		},

		onClickSSOD_B51: function () {
			var opdfViewer = new sap.m.PDFViewer();
			this.getView().addDependent(opdfViewer);
			var selSecData = this.aeUtil.getSecData(this, "BLFacet");
			var vInvoice = selSecData.BillingDocument;
			var sServiceURL = this.getView().getModel("InvoiceBDPreview").sServiceUrl;
			vInvoice = vInvoice.padStart(10, 0);
			var sSource = sServiceURL + "/ZAE_FM_SSOD_SER_INV_LS_BWSet(Invoice='" + vInvoice + "')/$value";
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle("Invoice " + vInvoice);
			opdfViewer.setShowDownloadButton(false);
			opdfViewer.open();
		},
		onClickSSOD_B52: function (oEvent) {
			var pageData = this.getView().getBindingContext().getObject();
			if (!this._oUpdatePartnerDialog) {
				Fragment.load({
						id: "idUpdatePartnerDialog",
						name: "com.globalintelli.zae_ssod.ext.fragment.UpdateDepartment",
						controller: this
					})
					.then(function (oPartnerDialogContent) {
						this._createUpdatePartnerDialog(oPartnerDialogContent);
						this._setUpdatePartnerDialogInitialState(pageData);
					}.bind(this));
			} else {
				this._setUpdatePartnerDialogInitialState(pageData);
			}
		},

		_createUpdatePartnerDialog: function (oPartnerDialogContent) {
			var that = this;
			this._oUpdatePartnerDialog = new Dialog({
				title: "{i18n>SSOD_B52}",
				width: "640px",
				content: [
					oPartnerDialogContent
				],
				buttons: [
					new Button({
						text: "Submit",
						press: function () {
							var MessageStrip = Fragment.byId("idUpdatePartnerDialog", "SSOD_B52MessageStrip");
							var pageData = this.getView().getBindingContext().getObject();
							var actId = 'SSOD_B52';
							var actLabel = this.aeUtil.geti18nText(that, actId);
							var oModel = this.getView().getModel();
							var oEntity = "ZAE_FM_SSOD_UPDATE_DEPARTMENTSet";
							var oPartnerInput = Fragment.byId("idUpdatePartnerDialog", "PartnerInput").getValue();
							if (oPartnerInput === '') {
								MessageStrip.setText("Fill required fields.");
								MessageStrip.setVisible(true);
								return;
							}
							var data = [{
								callProperty: "ObjectId",
								value: pageData.ServiceOrder
							}, {
								callProperty: "Partner",
								value: oPartnerInput
							}];
							var succFunc = function (oData, response) {
								this.extensionAPI.refresh();
							}.bind(this);
							this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
							this._oUpdatePartnerDialog.close();
						}.bind(this)
					}),
					new Button({
						text: "Close",
						press: function () {
							this._oUpdatePartnerDialog.close();
						}.bind(this)
					})
				]
			});
			this.getView().addDependent(this._oUpdatePartnerDialog);
		},

		_setUpdatePartnerDialogInitialState: function (pageData) {
			Fragment.byId("idUpdatePartnerDialog", "PartnerInput").setValue('');
			Fragment.byId("idUpdatePartnerDialog", "SSOD_B52MessageStrip").setVisible(false);
			this._oUpdatePartnerDialog.open();
		},
		onSearchPartnerValueHelp: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter1 = new sap.ui.model.Filter("BusinessPartner", sap.ui.model.FilterOperator.Contains, "'" + sValue + "'");
			var oFilter2 = new sap.ui.model.Filter("BusinessPartnerName", sap.ui.model.FilterOperator.Contains, "'" + sValue + "'");
			var oFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: false
			});
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},
		onCancelPartnerValueHelp: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.destroy();
		},
		onShowPartnerValueHelpDialogClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var Partner = Fragment.byId("idUpdatePartnerDialog", "PartnerInput");
				Partner.setValue(oSelectedItem.getTitle());
			}
		},
		onShowPartnerVH: function () {
			var that = this;
			var oPartnerTemplate = new sap.m.StandardListItem({
				title: "{BusinessPartner}",
				description: "{BusinessPartnerName}",
				type: "Active"

			});
			if (!this._valueHelpDialog) {
				Fragment.load({
						id: "valueHelpDialogFragment",
						name: "com.globalintelli.zae_ssod.ext.fragment.PartnerVH",
						controller: that
					})
					.then(function (oValueHelpDialogContent) {
						oValueHelpDialogContent.open();
						oValueHelpDialogContent.setModel(that.getView().getModel());
						oValueHelpDialogContent.bindAggregation("items", {
							path: '/ZAE_VH_BUSINESSPARTNER',
							template: oPartnerTemplate
						});

					});
			} else {
				this._valueHelpDialog.open();
				this._valueHelpDialog.bindAggregation("items", {
					path: '/ZAE_VH_BUSINESSPARTNER',
					template: oPartnerTemplate
				});
			}
		},

		onClickSSOD_B53: function () {
			var opdfViewer = new sap.m.PDFViewer();
			this.getView().addDependent(opdfViewer);
			var selSecData = this.aeUtil.getSecData(this, "BDFacet");
			var vInvoice = selSecData.BillingDocument;
			var sServiceURL = this.getView().getModel("SplitInBDRPreview").sServiceUrl;
			vInvoice = vInvoice.padStart(10, 0);
			var sSource = sServiceURL + "/ZAE_FM_SSOD_BDR_SPLIT_IN_PSet(Invoice='" + vInvoice + "')/$value";
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle("Invoice " + vInvoice);
			opdfViewer.setShowDownloadButton(false);
			opdfViewer.open();
		},

		onClickSSOD_B54: function () {
			var opdfViewer = new sap.m.PDFViewer();
			this.getView().addDependent(opdfViewer);
			var selSecData = this.aeUtil.getSecData(this, "BDFacet");
			var vInvoice = selSecData.BillingDocument;
			var sServiceURL = this.getView().getModel("SplitCustBDRPreview").sServiceUrl;
			vInvoice = vInvoice.padStart(10, 0);
			var sSource = sServiceURL + "/ZAE_FM_SSOD_BDR_SPLIT_CUST_PSet(Invoice='" + vInvoice + "')/$value";
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle("Invoice " + vInvoice);
			opdfViewer.setShowDownloadButton(false);
			opdfViewer.open();
		},

		onClickSSOD_B55: function () {
			var opdfViewer = new sap.m.PDFViewer();
			this.getView().addDependent(opdfViewer);
			var selSecData = this.aeUtil.getSecData(this, "BLFacet");
			var vInvoice = selSecData.BillingDocument;
			var sServiceURL = this.getView().getModel("SplitInINVPreview").sServiceUrl;
			vInvoice = vInvoice.padStart(10, 0);
			var sSource = sServiceURL + "/ZAE_FM_SSOD_INV_SPLIT_IN_PSet(Invoice='" + vInvoice + "')/$value";
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle("Invoice " + vInvoice);
			opdfViewer.setShowDownloadButton(false);
			opdfViewer.open();
		},

		onClickSSOD_B56: function () {
			var opdfViewer = new sap.m.PDFViewer();
			this.getView().addDependent(opdfViewer);
			var selSecData = this.aeUtil.getSecData(this, "BLFacet");
			var vInvoice = selSecData.BillingDocument;
			var sServiceURL = this.getView().getModel("SplitCustINVPreview").sServiceUrl;
			vInvoice = vInvoice.padStart(10, 0);
			var sSource = sServiceURL + "/ZAE_FM_SSOD_INV_SPLIT_CUST_PSet(Invoice='" + vInvoice + "')/$value";
			opdfViewer.setSource(sSource);
			opdfViewer.setTitle("Invoice " + vInvoice);
			opdfViewer.setShowDownloadButton(false);
			opdfViewer.open();
		},

		onClickSSOD_B57: function (oEvent) {

			var ButtonID = "SSOD_B57";
			this.fnDynamicNotes(ButtonID);
			// 	var pageData = this.aeUtil.getPageData(oEvent);
			// 	var actId = "SSOD_B57";
			// 	var actLabel = this.aeUtil.geti18nText(that, actId);
			// 	var oModel = oSource.getModel();
			// 	var oEntity = "ZAE_FM_SSOD_STATUS_JC_RETSet";
			// 	var data = [{
			// 		callProperty: "ObjectId",
			// 		value: pageData.ServiceOrder
			// 	}];
			// 	var succFunc = function (oData, response) {
			// 		this.extensionAPI.refresh();
			// 	}.bind(this);
			// 	this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);

		},
		onClickSSOD_B58: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B58";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_STATUS_OPENSet";
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);

		},
		onClickSSOD_B59: function (oEvent) {
			var that = this;
			that.oITFacetAddComponentsButton = oEvent.getSource();
			if (!that._CompCreateSTODialog) {
				Fragment.load({
					id: "idCompCreateSTODialog",
					name: "com.globalintelli.zae_ssod.ext.fragment.CompCreateSTO",
					controller: {

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

						fnSubmitButonValidation: function () {
							var ItemListTable = Fragment.byId("idCompCreateSTODialog", "idCreateSTOTable");
							var oItems = ItemListTable.getAggregation("items");
							//var BoolPendingIP = false;
							//var boolDataExist = false;
							for (var i = 0; i < oItems.length; i++) {
								if (oItems[i].isSelected() === true) {
									var vOrderQty = oItems[i].getAggregation("cells")[4].getProperty('value');
									//var vATPQty = oItems[i].getAggregation("cells")[3].getProperty('text');
									vOrderQty = parseFloat(vOrderQty);
									//vATPQty = parseFloat(vATPQty);
									if (!vOrderQty) {
										var vDisableSubmit = true;
									}
									/*else if ( vOrderQty > vATPQty ) {
										vDisableSubmit = true; 
									}*/
								}
							}
							if (vDisableSubmit === true) {
								var vEnableSubmit = false;
							} else {
								vEnableSubmit = true;
							}
							Fragment.byId("idCompCreateSTODialog", "CreateSTOSubmit").setEnabled(vEnableSubmit);
						},

						onAddNewRow: function () {
							var mWEComponent = that.getView().getModel("mCreateSTOTableModel");
							var mWEComponentData = mWEComponent.getData();
							mWEComponentData.TableData.push({
								IssuePlant: "",
								IssueStorageLocation: "",
								StockQty: "",
								ATPQty: "",
								OrderQty: "",
								Enabled: true
							});
							mWEComponent.updateBindings(true);
						},

						onDeletePress: function (oEvent) {
							var oSource = oEvent.getSource();
							var oBindingContexts = oSource.getParent().oBindingContexts;
							var path = oBindingContexts["mCreateSTOTableModel"].getPath();
							var oWEModel = oBindingContexts["mCreateSTOTableModel"].getModel();
							var OEModelData = oWEModel.getData();
							var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
							var filteredData = [];
							for (var i = 0; i < OEModelData.TableData.length; i++) {
								if (currentIndex != i) {
									filteredData.push(OEModelData.TableData[i]);
								}
							}
							OEModelData.TableData = filteredData;
							oWEModel.updateBindings(true);
							this.fnSubmitButonValidation();

						},

						onReset: function () {
							that._initAddComponentsDialog("RESET");
						},

						onSubmit: function () {
							var actId = "SSOD_B59";
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var SecSelData = that.aeUtil.getSecData(that, "CPFacet");
							var oModel = that.getView().getModel();
							var oEntity = "COMP_STO_HEADER_DATASet";
							var pageData = that.getView().getBindingContext().getObject();
							var mmWorkEstimateComponent = that.getView().getModel("mCreateSTOTableModel");
							var oWorkEstimateComponentData = mmWorkEstimateComponent.getData();
							var NavMain = [{
								"ObjectId": SecSelData.ServiceOrder,
								"Component": SecSelData.ServiceOrderOperation,
								"Operation": SecSelData.HigherLevelItem
							}];
							var NavItems = [];
							for (var i = 0; i < oWorkEstimateComponentData.TableData.length; i++) {
								if (oWorkEstimateComponentData.TableData[i].OrderQty) {
									NavItems.push({
										"Iplant": oWorkEstimateComponentData.TableData[i].IssuePlant,
										"Qty": oWorkEstimateComponentData.TableData[i].OrderQty
									});
								}
							}

							var data = [{
								callProperty: "N_COMP_STO_HEADER_DATA",
								value: NavMain
							}, {
								callProperty: "N_COMP_STO_ITEM_DATA",
								value: NavItems
							}];
							var succFunc = function (oData, response) {
								that.aeUtil.refreshControlModel(that.oITFacetAddComponentsButton);
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
							that._CompCreateSTODialog.close();
						},
						onCancel: function () {
							that._CompCreateSTODialog.close();
						},
						onSelectionChange: function (oEvent) {
							var SelectedContext = oEvent.getSource().getSelectedContextPaths();
							if (oEvent.getParameters().selected === false) {
								oEvent.getParameters().listItem.getCells()[4].setValue("");
								oEvent.getParameters().listItem.getCells()[4].setEnabled(false);
							} else {
								oEvent.getParameters().listItem.getCells()[4].setEnabled(true);
							}
							this.fnSubmitButonValidation();

						}

					}
				}).then(function (DialogContent) {
					that._CompCreateSTODialog = DialogContent;
					that.getView().addDependent(that._CompCreateSTODialog);
					that._initCompCreateSTODialog("INIT");
				});
			} else {
				that._initCompCreateSTODialog("INIT");
			}
		},
		_initCompCreateSTODialog: function (form) {
			var that = this;
			var SecSelData = this.aeUtil.getSecData(this, "CPFacet");
			if (SecSelData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			} else {

				Fragment.byId("idCompCreateSTODialog", "CreateSTOSubmit").setEnabled(false);
				var oDataInitial = {
					TableData: []
				};
				var aFilter = [];
				aFilter.push(new sap.ui.model.Filter('ServiceOrder', sap.ui.model.FilterOperator.EQ, SecSelData.ServiceOrder));
				aFilter.push(new sap.ui.model.Filter('Component', sap.ui.model.FilterOperator.EQ, SecSelData.ServiceOrderOperation));
				aFilter.push(new sap.ui.model.Filter('Operation', sap.ui.model.FilterOperator.EQ, SecSelData.HigherLevelItem));
				that.getView().getModel().read("/ZAE_I_Material_ATP", {
					filters: aFilter,
					success: function (oData, response) {
						if (oData.results.length > 0) {
							for (var j = 0; j < oData.results.length; j++) {
								var mWEComponent = that.getView().getModel("mCreateSTOTableModel");
								var mWEComponentData = mWEComponent.getData();
								mWEComponentData.TableData.push({
									IssuePlant: oData.results[j].IssuePlant,
									IssueStorageLocation: oData.results[j].IssueStorageLocation,
									StockQty: oData.results[j].Stock,
									ATPQty: oData.results[j].ATPQuantity,
									OrderQty: "",
									Enabled: true,
									IssueplantName: oData.results[j].IssueplantName,
									IssueStorageLocationName: oData.results[j].IssueStorageLocationName
								});
								mWEComponent.updateBindings(true);
							}

						}
						that._CompCreateSTODialog.setBusy(false);
					},
					error: function (error) {
						that._CompCreateSTODialog.setBusy(false);
					}
				});
				var oJSONModel = new JSONModel(jQuery.extend(true, {}, oDataInitial));
				that.getView().setModel(oJSONModel, "mCreateSTOTableModel");
				oJSONModel.updateBindings(true);
				if (form === "INIT") {
					this._CompCreateSTODialog.setBusy(true);
					this._CompCreateSTODialog.open();
				}
			}
		},
		onClickSSOD_B61: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B61";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.UpdatePriceGroup";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SRVD_UPD_PRICE_LIST_GRPSet";
			var dialogFields = [{
				fragInputId: "priceGroup",
				fragInputLabel: this.aeUtil.geti18nText(that, "priceGroup"),
				vhEntitySet: "ZAE_VH_PriceGroup",
				vhSearchKey: "PriceGroup",
				vhSearchText: "PriceGroupText",
				callProperty: "PriceGrp"
			}];
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}, {
				callProperty: "ObjtypeH",
				value: pageData.ServiceObjectType
			}];
			var checkFucc = function () {
				var oPrice = Fragment.byId(actId + "Fragment", "priceGroup").getValue();
				if (oPrice === "" || oPrice === undefined) {
					return {
						pass: false,
						msg: this.aeUtil.geti18nText(that, "SELECT_PRICE_GRP")
					};
				} else {
					return {
						pass: true
					};
				}
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

		},
		onClickSSOD_B62: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var SecSelData = that.aeUtil.getSecData(that, "CPFacet");
			if (SecSelData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			} else {

				var actId = "SSOD_B62";
				var actLabel = this.aeUtil.geti18nText(that, actId);
				var fragName = "com.globalintelli.zae_ssod.ext.fragment.UpdatePriceGroup";
				var oModel = oSource.getModel();
				var oEntity = "ZAE_FM_SRVD_UPD_LI_PRICE_GRPSet";
				var dialogFields = [{
					fragInputId: "priceGroup",
					fragInputLabel: this.aeUtil.geti18nText(that, "priceGroup"),
					vhEntitySet: "ZAE_VH_PriceGroup",
					vhSearchKey: "PriceGroup",
					vhSearchText: "PriceGroupText",
					callProperty: "PriceGrp"
				}];
				var data = [{
					callProperty: "ObjectId",
					value: pageData.ServiceOrder
				}, {
					callProperty: "ObjtypeH",
					value: pageData.ServiceObjectType
				}, {
					callProperty: "Item",
					value: SecSelData.ServiceOrderOperation
				}];
				var checkFucc = function () {
					var oPrice = Fragment.byId(actId + "Fragment", "priceGroup").getValue();
					if (oPrice === "" || oPrice === undefined) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "SELECT_PRICE_GRP")
						};
					} else {
						return {
							pass: true
						};
					}
				}.bind(this);
				var succFunc = function (oData, response) {
					this.extensionAPI.refresh();
				}.bind(this);

				this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);
			}
		},
		onClickSSOD_B63: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B63";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.AddMeasuringDocuments";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_UEQU_EQU_ADD_MEASR_DOCSet";
			var dialogFields = [{
				fragInputId: "RecordedValueInput",
				fragInputLabel: this.aeUtil.geti18nText(that, "RECORDVALUE"),
				callProperty: "RecordedValue"
			}];
			var data = [{
				callProperty: "Equnr",
				value: pageData.Equipment

			}];
			var checkFucc = function () {
				var vRValue = Fragment.byId(actId + "Fragment", "RecordedValueInput").getValue();
				if (vRValue === "" || vRValue === undefined) {
					return {
						pass: false,
						msg: this.aeUtil.geti18nText(that, "SELECT_RECORDVALUE")
					};
				} else {
					return {
						pass: true
					};
				}
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);
		},
		onClickSSOD_B64: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "MD1Facet");
			var actId = "SSOD_B64";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_MEAS_DOC_CANCELSet";
			var data = [{
				callProperty: "MeasuringDocument",
				value: selSecData.MeasuringDocument
			}];

			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
		},

		//OEM Parts Return
		// "SSOD_B65": {
		// 								"id": "SSOD_B65Button",
		// 								"text": "{@i18n>SSOD_B65}",
		// 								"press": "onClickSSOD_B65",
		// 								"requiresSelection": true,
		// 								"applicablePath": "isShowSSOD_B65"
		// 							},
		// onClickSSOD_B65: function (oEvent) {
		// 	var that = this;
		// 	that.oITFacetOEMPartsButton = oEvent.getSource();

		// 	if (!that._OEMPartsDialog) {
		// 		Fragment.load({
		// 			id: "idOEMPartsDialog",
		// 			name: "com.globalintelli.zae_ssod.ext.fragment.OEMPartsReturn",
		// 			controller: {
		// 				fnOEMSubmitButonValidation: function () {
		// 					var oItems = Fragment.byId("idOEMPartsDialog", "idOEMTable").getItems();
		// 					var bEnabled = false;
		// 					var BoolPendingIP = false;
		// 					var Qty = 0;
		// 					// var Equipment = Fragment.byId("OEMPartsReturnDialog", "idEquipment").getTokens();
		// 					// if (Equipment.length === 0) {
		// 					// 	BoolPendingIP = true;
		// 					// }
		// 					for (var i = 0; i < oItems.length; i++) {
		// 						var Quantity = oItems[i].getAggregation("cells")[5];
		// 						var oQtyValue = Quantity.getValue();
		// 						var oBalance = parseFloat(oItems[i].getAggregation("cells")[4].getValue());
		// 						if (oQtyValue !== "") {
		// 							if (parseFloat(oQtyValue) === oBalance) {
		// 								Qty = Qty + parseFloat(oQtyValue);
		// 								Quantity.setValueState("None");
		// 							} else {
		// 								Quantity.setValueState("Error");
		// 								BoolPendingIP = true;
		// 							}
		// 						} else {
		// 							BoolPendingIP = true;
		// 						}
		// 					}
		// 					if (oItems.length === 0) {
		// 						bEnabled = false;
		// 					} else {
		// 						bEnabled = true;
		// 					}
		// 					Fragment.byId("idOEMPartsDialog", "OEMSubmit").setEnabled(bEnabled ? !BoolPendingIP : false);
		// 				},
		// 				onSelectionChange: function (oEvent) {
		// 					var SelectedContext = oEvent.getSource().getSelectedContextPaths();
		// 					if (oEvent.getParameters().selected === false) {
		// 						oEvent.getParameters().listItem.getCells()[5].setValue("");
		// 						oEvent.getParameters().listItem.getCells()[5].setEnabled(false);
		// 						oEvent.getParameters().listItem.getCells()[4].setValueState("None");
		// 					}
		// 					var oModel = that.getView().getModel("mOEMPartsReturn");
		// 					SelectedContext.forEach(function (oItem, i) {
		// 						oModel.setProperty(oItem + "/qtyEnabled", true);
		// 					});
		// 					if (SelectedContext.length === 0) {
		// 						oModel.getData().results.forEach(function (oItem, i) {
		// 							oItem.qtyEnabled = false;
		// 							oItem.Qty = "";
		// 						});
		// 						oModel.updateBindings(true);
		// 					}
		// 					this.fnOEMSubmitButonValidation();
		// 				},
		// 				onSubmitOEM: function (oEvent) {
		// 					//	var that = this;
		// 					var actId = "SSOD_B65";
		// 					var actLabel = that.aeUtil.geti18nText(that, actId);
		// 					var selSecData = that.aeUtil.getSecData(that, "OPFacet");
		// 					var oModel = that.getView().getModel("OEMPartsReturn");
		// 					var oEntity = "ZAE_FM_SSOD_ADDCOND_TYPE_LINESet";
		// 					var pageData = that.getView().getBindingContext().getObject();
		// 					// OEMQuantity = Fragment.byId("idOEMPartsDialog", "idOemQty").getValue();
		// 					var oSelectedItems = Fragment.byId("idOEMPartsDialog", "idOEMTable").getItems();
		// 					var NavMain = [{
		// 						"Serviceorder": pageData.ServiceOrder,
		// 					}];
		// 					var NavItems = [];
		// 					for (var i = 0; i < oSelectedItems.length; i++) {
		// 						NavItems.push({
		// 							"NumberInt": oSelectedItems[i].getCells()[0].getText(),
		// 							"Higherlevelitem": oSelectedItems[i].getCells()[1].getText(),
		// 							"Material": oSelectedItems[i].getCells()[2].getText(),
		// 							"Qty": oSelectedItems[i].getCells()[5].getValue(),
		// 						});
		// 					}
		// 					//			}
		// 					var data = [{
		// 						callProperty: "NavCondMain",
		// 						value: NavMain
		// 					}, {
		// 						callProperty: "NavCondItems",
		// 						value: NavItems
		// 					}];
		// 					var succFunc = function (oData, response) {
		// 						that.getView().getModel().refresh(true);
		// 					}.bind(this);
		// 					that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
		// 					that._OEMPartsDialog.close();

		// 				},
		// 				onCancel: function () {
		// 					that._OEMPartsDialog.close();
		// 				}
		// 			}
		// 		}).then(function (DialogContent) {
		// 			that._OEMPartsDialog = DialogContent;
		// 			that.getView().addDependent(that._OEMPartsDialog);
		// 			that._initOEMPartsDialog("INIT");
		// 		});
		// 	} else {
		// 		that._initOEMPartsDialog("INIT");
		// 	}
		// },
		// _initOEMPartsDialog: function (form) {
		// 	var that = this;
		// 	var selSecData = this.aeUtil.getSecData(that, "OPFacet");
		// 	if (!(selSecData instanceof Array)) {
		// 		selSecData = [selSecData];
		// 	}
		// 	var pageData = that.getView().getBindingContext().getObject();
		// 	var aTempData = {};
		// 	var aData = [];
		// 	var qty = "";
		// 	//	Fragment.byId("OEMPartsDialog", "OEMSubmit").setEnabled(false);
		// 	selSecData.forEach(function (obj, ind) {
		// 		aTempData = {
		// 			ItemNumber: Number(obj.ServiceOrderOperation) + "",
		// 			HighLevelItemNumber: "10",
		// 			Material: obj.OriginallyRequestedProduct,
		// 			MaterialName: obj.MaterialName,
		// 			OperationQuantity: obj.OperationQuantity,
		// 			OperationQuantityUnit: obj.OperationQuantityUnit,
		// 			Qty: qty,
		// 			qtyEnabled: false,
		// 			qtyValueState: "None"
		// 		};
		// 		aData.push(aTempData);
		// 	});
		// 	var oJSONModel = new sap.ui.model.json.JSONModel();
		// 	this.getView().setModel(oJSONModel, "mOEMPartsReturn");
		// 	this.getView().getModel("mOEMPartsReturn").setProperty("/results", aData);
		// 	this.getView().getModel("mOEMPartsReturn").setProperty("/results/ServiceOrder", selSecData[0].ServiceOrder);
		// 	this.getView().getModel("mOEMPartsReturn").refresh();
		// 	Fragment.byId("idOEMPartsDialog", "OEMSubmit").setEnabled(false);
		// 	this._OEMPartsDialog.open();
		// },
		onClickSSOD_B66: function (oEvent) {
			var that = this;
			that.oITFacetAddItemButton = oEvent.getSource();
			if (!that._AddItemTableDialog) {
				Fragment.load({
					id: "AddOperationDialog",
					name: "com.globalintelli.zae_ssod.ext.fragment.AddOperations",
					controller: {

						onInspectionLotValueHelpRequested: function (oEvent1) {
							var aCols = {
								"cols": [{
									"label": "InspectionLot",
									"template": "InspectionLot",
									"width": "10rem"
								}, {
									"label": "Inspection Characteristic",
									"template": "InspectionSpecificationText",
									"width": "10rem"
								}, {
									"label": "Color",
									"template": "InspectionCodeText",
									"width": "10rem"
								}, {
									"label": "Inspection Date",
									"template": "InspDate",
									"width": "10rem"
								}]
							};

							this._oInspectionLotBasicSearchField = new SearchField({
								showSearchButton: false
							});

							that._oInspectionLotMultiInput = oEvent1.getSource();

							that._oInspectionLotCustVHDialog = sap.ui.xmlfragment(
								"com.globalintelli.zae_ssod.ext.fragment.CustInspectionLotValueHelp",
								this);
							that._oInspectionLotCustVHDialog.setModel(that.getView().getModel());
							that._oInspectionLotCustVHDialog.setRangeKeyFields([{
								label: "InspectionLot",
								key: "InspectionLot",
								type: "string",
								typeInstance: new typeString({}, {
									maxLength: 7
								})
							}]);

							that._oInspectionLotCustVHDialog.getFilterBar().setBasicSearch(this._oInspectionLotBasicSearchField);

							that._oInspectionLotCustVHDialog.getTableAsync().then(function (oTable) {
								oTable.setModel(new JSONModel(aCols), "columns");

								if (oTable.bindRows) {
									oTable.bindAggregation("rows", that.constant.InspectionLotBindingPath);
								}

								if (oTable.bindItems) {
									oTable.bindAggregation("items", that.constant.InspectionLotBindingPath, function () {
										return new ColumnListItem({
											cells: aCols.map(function (column) {
												return new sap.m.Label({
													text: "{" + column.template + "}"
												});
											})
										});
									});
								}

								that._oInspectionLotCustVHDialog.update();
							}.bind(this));
							that._oInspectionLotCustVHDialog.setTokens(that._oInspectionLotMultiInput.getTokens());
							var aFilters = [];
							var ComplainCode = that._oInspectionLotMultiInput.getParent().getCells()[4].getSelectedKey();
							var Equipment = that.getView().getBindingContext().getObject().Equipment;
							if (ComplainCode !== "") {
								aFilters.push(new sap.ui.model.Filter("ComplainCode", sap.ui.model.FilterOperator.EQ, ComplainCode));
							}
							if (Equipment !== "") {
								aFilters.push(new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, Equipment.padStart(18, 0)));
							}
							this._filterTableInspectionLot(new Filter({
								filters: aFilters,
								and: true
							}));

							that._oInspectionLotCustVHDialog.open();
						},

						_filterTableInspectionLot: function (oFilter) {
							var oValueHelpDialog = that._oInspectionLotCustVHDialog;
							oValueHelpDialog.getTableAsync().then(function (oTable) {
								that.aeUtil.fnFilterVHTable(oTable, oFilter);
								oValueHelpDialog.update();
							});
						},

						onInspectionLotFilterBarSearch: function (oEvent4) {
							var ComplainCode = that._oInspectionLotMultiInput.getParent().getCells()[4].getSelectedKey();
							var aSelectionSet = oEvent4.getParameter("selectionSet");
							var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
								if (oControl.getValue()) {
									aResult.push(new Filter({
										path: oControl.getName(),
										operator: FilterOperator.Contains,
										value1: oControl.getValue()
									}));
								}

								return aResult;
							}, []);
							var Equipment = that.getView().getBindingContext().getObject().Equipment;
							if (ComplainCode !== "") {
								aFilters.push(new sap.ui.model.Filter("ComplainCode", sap.ui.model.FilterOperator.EQ, ComplainCode));
							}
							if (Equipment !== "") {
								aFilters.push(new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, Equipment.padStart(18, 0)));
							}

							this._filterTableInspectionLot(new Filter({
								filters: aFilters,
								and: true
							}));
						},

						onInspectionLotValueHelpOkPress: function (oEvent2) {
							var aTokens = oEvent2.getParameter("tokens");
							that._oInspectionLotMultiInput.setSelectedKey(aTokens[0].getProperty("key"));
							that._oInspectionLotMultiInput.setTokens(aTokens);
							that._oInspectionLotCustVHDialog.close();
							/*	var ItemListTable = Fragment.byId("AddOperationDialog", "idItemListListTable");
								var oItems = ItemListTable.getAggregation("items");
								var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
								var oBindingContexts = that._oInspectionLotMultiInput.getParent().oBindingContexts;
								var path = oBindingContexts["mServiceOrderOperation"].getPath();
								var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
								var Characteristic = oItems[currentIndex].getAggregation("cells")[5];
								var aFilters = [];
								aFilters.push(new sap.ui.model.Filter("InspectionLot", sap.ui.model.FilterOperator.EQ, oSelRowData.InspectionLot));
								var oBinding = Characteristic.getBinding("items");
								oBinding.filter(aFilters, "Application");*/

							var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
							var oBindingContexts = that._oInspectionLotMultiInput.getParent().oBindingContexts;
							var path = oBindingContexts["mServiceOrderOperation"].getPath();
							var oModel = oBindingContexts["mServiceOrderOperation"].getModel();
							oModel.setProperty(path + that.constant.InspectionLotBindingPath, oSelRowData);
							this.fnSubmitButonValidation();
						},

						onInspectionLotValueHelpCancelPress: function () {
							that._oInspectionLotCustVHDialog.close();
						},
						onInspectionLotValueHelpAfterClose: function () {
							that._oInspectionLotCustVHDialog.destroy();
						},

						onProductValueHelpRequested: function (oEvent1) {
							var pageData = that.getView().getBindingContext().getObject();
							var ServiceOrganization = pageData.ServiceOrganization;
							var SalesOrganization = pageData.SalesOrganization;
							var DistributionChannel = pageData.DistributionChannel;
							var Model = pageData.Model;
							var input = oEvent1.getSource();
							input.setTokens([]);
							var configObject = {
								entitySet: "ZAE_C_MaterialSalesData_07",
								initiallyVisibleFields: "Material,MaterialGroup,MaterialType,ItemCategoryGroup,UnitOfMeasure",
								selectionMode: "MultiToggle",

								tokenObject: {
									key: "Material",
									Description: "MaterialName"
								},
								controlConfiguration: [{
									index: 0,
									key: "SalesOrganization",
									filterType: "auto",
									label: "SalesOrganization",
									mandatory: "auto",
									visible: false
								}, {
									index: 1,
									key: "DistributionChannel",
									filterType: "auto",
									label: "DistributionChannel",
									mandatory: "auto",
									visible: false
								}, {
									index: 2,
									key: "Material",
									filterType: "auto",
									label: "Material",
									mandatory: "auto",
									visible: true
								}, {
									index: 3,
									key: "MaterialName",
									filterType: "auto",
									label: "{/#ZAE_C_MaterialSalesData_05Type/MaterialName/@sap:label}",
									mandatory: "auto",
									visible: true
								}, {
									index: 4,
									key: "MaterialGroup",
									filterType: "auto",
									label: "Material Group",
									mandatory: "auto",
									visible: true
								}, {
									index: 5,
									key: "MaterialType",
									filterType: "auto",
									label: "Material Type",
									mandatory: "auto",
									visible: true
								}, {
									index: 6,
									key: "Plant",
									filterType: "auto",
									label: "Service Organization",
									mandatory: "auto",
									visible: false
								}],
								defaultFilter: {
									Plant: {
										"items": [{
											"key": ServiceOrganization
										}]
									},
									// DistributionChannel: {
									// 	"items": [{
									// 		"key": DistributionChannel
									// 	}]
									// },
									MaterialType: {
										"items": [{
											"key": "ZSRV"
										}]
									},
									// SalesOrganization: {
									// 	"items": [{
									// 		"key": SalesOrganization
									// 	}]
									// }
								},
								onBeforeRebindSmartTable: function (oEvent) {
									var aFilterArray = oEvent.getParameter("bindingParams").filters;
									aFilterArray.push(new sap.ui.model.Filter({
										path: "Plant",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: ServiceOrganization
									}));
									aFilterArray.push(new sap.ui.model.Filter({
										path: "DistributionChannel",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: DistributionChannel
									}));
									aFilterArray.push(new sap.ui.model.Filter({
										path: "SalesOrganization",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: SalesOrganization
									}));
									aFilterArray.push(new sap.ui.model.Filter({
										path: "Model",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: Model
									}));
									oEvent.getParameter("bindingParams").filters = aFilterArray;
								}

							};
							that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
						},
						onMaterailTokenUpdate: function (oEvent) {
							var oTableItems = Fragment.byId("AddOperationDialog", "idItemListListTable").getItems();
							var aTokens = oEvent.getSource().getTokens();
							var oBindingContexts = oEvent.getSource().getParent().oBindingContexts;
							var path = oBindingContexts["mServiceOrderOperation"].getPath();
							var oModel = oBindingContexts["mServiceOrderOperation"].getModel();
							if (aTokens.length === 0 || oEvent.getParameters().type === "removed") {
								oEvent.getSource().setSelectedKey("");
								oModel.setProperty(path + that.constant.MaterialPath, []);
							} else {
								oEvent.getSource().setSelectedKey(aTokens[0].getProperty("key"));
								var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
								oModel.setProperty(path + that.constant.MaterialPath, oSelRowData);
								oModel.setProperty(path + "/QuantityUnit", oSelRowData.UnitOfMeasure);
								// oModel.setProperty(path + "/Quantity", oSelRowData.MaterialAvlQty);
								if (aTokens.length > 1) {
									var MainItem = Number(path.split("/")[2]);
									aTokens.forEach(function (oToken, i) {
										if (!oTableItems[MainItem]) {
											this.onAddNewRow();
											oTableItems = Fragment.byId("AddOperationDialog", "idItemListListTable").getItems();
											//Fragment.byId("AddOperationDialog", "idItemListListTable").getModel().refresh(true);
										}
										oTableItems[MainItem].getCells()[1].setTokens([aTokens[i]]);
										oTableItems[MainItem].getCells()[1].fireTokenUpdate();
										MainItem = MainItem + 1;
									}.bind(this));
								}

							}
							this.fnSubmitButonValidation();
							this.fnLoadQuantity(oBindingContexts);
							this.fnLoadItemCateghory(oBindingContexts);

						},
						onSelectMaterial: function (oEvent) {
							if (oEvent.getParameter("selectedRow") !== null) {
								var oSource = oEvent.getSource();
								oSource.setTokens([]);
								var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
								var oText = this.formatNameAndValuePair(oSelectedData.MaterialName, oSelectedData.Material)
								var oToken = new sap.m.Token({
									key: oSelectedData.Material,
									text: oText
								});
								oSource.setTokens([oToken]);
								// oSource.fireTokenUpdate();
								var oBindingContexts = oEvent.getSource().getParent().oBindingContexts;
								var path = oBindingContexts["mServiceOrderOperation"].getPath();
								var oModel = oBindingContexts["mServiceOrderOperation"].getModel();
								oEvent.getSource().setSelectedKey(oSelectedData.Material);
								// var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
								oModel.setProperty(path + that.constant.MaterialPath, oSelectedData);
								oModel.setProperty(path + "/QuantityUnit", oSelectedData.UnitOfMeasure);
								//oModel.setProperty(path + "/Quantity", oSelectedData.MaterialAvlQty);
								this.fnLoadQuantity(oBindingContexts);
								this.fnLoadItemCateghory(oBindingContexts);
							}
						},
						handleMaterialSuggest: function (oEvent) {
							var pageData = that.getView().getBindingContext().getObject();
							var ServiceOrganization = pageData.ServiceOrganization;
							var SalesOrganization = pageData.SalesOrganization;
							var DistributionChannel = pageData.DistributionChannel;
							var Model = pageData.Model;

							var sTerm = oEvent.getParameter("suggestValue");
							var aFilters = [];
							if (sTerm) {
								aFilters.push(new sap.ui.model.Filter({
									path: "Plant",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.ServiceOrganization
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "DistributionChannel",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.DistributionChannel
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "MaterialType",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: "ZSRV"
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "SalesOrganization",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: SalesOrganization
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "Model",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: Model
								}));

								aFilters.push(new Filter({
									filters: [
										new Filter({
											path: "Material",
											operator: sap.ui.model.FilterOperator.Contains,
											value1: sTerm
										}),
										new Filter({
											path: "MaterialName",
											operator: sap.ui.model.FilterOperator.Contains,
											value1: sTerm
										})

									],
									and: false
								}));
							}
							oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
							oEvent.getSource().getBinding("suggestionRows").resume();
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
						fnLoadQuantity: function (oBindingContexts) {
							var self = this;
							// var self = that;
							var pageData = that.getView().getBindingContext().getObject();
							var path = oBindingContexts["mServiceOrderOperation"].getPath();
							var oWEModel = oBindingContexts["mServiceOrderOperation"].getModel();
							var oWEModelData = oWEModel.getData();
							var rowData = oWEModel.getProperty(path);
							var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
							var Material = "";
							var aFilter = [];
							var aFilter1 = [];
							aFilter.push(new sap.ui.model.Filter({
								path: "Equipment",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.Equipment
							}));
							aFilter1.push(new sap.ui.model.Filter({
								path: "SalesOffice",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.SalesOffice
							}));
							aFilter1.push(new sap.ui.model.Filter({
								path: "SalesGroup",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.SalesGroup
							}));
							if (rowData.Material) {
								Material = rowData.Material;

							} else {
								oWEModel.setProperty(path + "/Quantity", "");
								self.fnSubmitButonValidation();
								return;
							}

							var ItemListTable = Fragment.byId("AddOperationDialog", "idItemListListTable");
							var oItems = ItemListTable.getAggregation("items");
							var oQty = oItems[currentIndex].getAggregation("cells")[2];
							oQty.setBusy(true);
							that.getView().getModel().read("/ZAE_I_EquipmentModelCode(P_Material='" + Material + "')/Set", {
								filters: aFilter,
								success: function (oData, response) {
									oQty.setBusy(false);
									if (oData.results.length > 0) {
										//	oWEModel.setProperty(path + "/Quantity", oData.results[0].MaterialAvlQty);
										that.getView().getModel().read("/ZAE_I_TC_SSWE_12", {
											filters: aFilter1,
											success: function (oData1, response1) {
												if (oData1.results.length > 0) {
													if (oData1.results[0].FreezeQtyField === true && oData.results[0].MaterialAvlQty !== '' &&
														oData.results[0].MaterialAvlQty !== '0.00') {
														oWEModel.setProperty(path + "/Quantity", oData.results[0].MaterialAvlQty);
														oQty.setEnabled(false);
													} else {
														oWEModel.setProperty(path + "/Quantity", oData.results[0].MaterialAvlQty);
														oQty.setEnabled(true);
													}

												} else {
													oWEModel.setProperty(path + "/Quantity", oData.results[0].MaterialAvlQty);
												}
												self.fnSubmitButonValidation();
											},
											error: function (error) {
												oQty.setBusy(false);
											}
										});
									} else {
										oWEModel.setProperty(path + "/Quantity", "");
									}
									self.fnSubmitButonValidation();
								},
								error: function (error) {
									oQty.setBusy(false);
								}
							});

						},
						fnLoadItemCateghory: function (oBindingContexts) {
							var self = this;
							// var self = that;
							var pageData = that.getView().getBindingContext().getObject();
							var path = oBindingContexts["mServiceOrderOperation"].getPath();
							var oWEModel = oBindingContexts["mServiceOrderOperation"].getModel();
							var oWEModelData = oWEModel.getData();
							var rowData = oWEModel.getProperty(path);
							var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
							var aFilter = [];
							aFilter.push(new sap.ui.model.Filter({
								path: "TransactionType",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.ServiceDocumentType
							}));
							if (rowData.Material) {
								aFilter.push(new sap.ui.model.Filter({
									path: "ItemCategoryGroup",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: rowData.MaterialVHData.ItemCategoryGroup
								}));
							} else {
								oWEModel.setProperty(path + that.constant.ItmCategory, "");
								oWEModel.setProperty(path + that.constant.ItmCategoryDesc, "");
								self.fnSubmitButonValidation();
								return;
							}

							var ItemListTable = Fragment.byId("AddOperationDialog", "idItemListListTable");
							var oItems = ItemListTable.getAggregation("items");
							var oItemCategory = oItems[currentIndex].getAggregation("cells")[5];
							oItemCategory.setBusy(true);
							that.getView().getModel().read("/ZAE_I_ItemCategoryDetermine", {
								filters: aFilter,
								success: function (oData, response) {
									oItemCategory.setBusy(false);
									if (oData.results.length > 0) {
										oWEModel.setProperty(path + that.constant.ItmCategory, oData.results[0].ItemCategory);
										oWEModel.setProperty(path + that.constant.ItmCategoryDesc, oData.results[0].ItemCategoryDesc);
									} else {
										oWEModel.setProperty(path + that.constant.ItmCategory, "");
										oWEModel.setProperty(path + that.constant.ItmCategoryDesc, "");
									}
									self.fnSubmitButonValidation();
								},
								error: function (error) {
									oItemCategory.setBusy(false);
								}
							});

						},

						onAddNewRow: function () {
							var mServiceOrderOperation = that.getView().getModel("mServiceOrderOperation");
							var oServiceOrderItemData = mServiceOrderOperation.getData();
							var aCheckList = oServiceOrderItemData.CheckListMasterData;
							oServiceOrderItemData.TableData.push({
								ItemNumber: oServiceOrderItemData.TableData.length === 0 ? "10" : Number(oServiceOrderItemData.TableData[
									oServiceOrderItemData.TableData.length - 1].ItemNumber) + 10 + "",
								HighLevelItemNumber: "",
								Material: "",
								MaterialVHData: {},
								Quantity: "",
								QuantityUnit: "",
								ItemCategory: "",
								ItemCategoryDesc: "",
								CheckListId: "",
								CheckList: aCheckList,
								CheckListEnabled: true,
								InspectionLot: "",
								Severity: "",
								Characteristic: ""

							});

							mServiceOrderOperation.updateBindings(true);
							this.fnSubmitButonValidation();

							var pageData = that.getView().getBindingContext().getObject();
							var aFiltersApp = [];
							aFiltersApp.push(new Filter('SalesOffice', 'EQ', pageData.SalesOffice));
							aFiltersApp.push(new Filter('SalesGroup', 'EQ', pageData.SalesGroup));
							aFiltersApp.push(new Filter('ProcessType', 'EQ', pageData.ServiceDocumentType));
							var ItemListTable = Fragment.byId("AddOperationDialog", "idItemListListTable");
							var oItems = ItemListTable.getAggregation("items");
							for (var i = 0; i < oItems.length; i++) {
								oItems[i].getCells()[6].getBinding('items').filter(aFiltersApp);
							}
						},

						onChangeOperationsQty: function (oEvent) {
							var oEnteredAmount = oEvent.getParameter('value');
							if (oEnteredAmount <= 0) {
								oEvent.getSource().setValueState('Error');
							} else {
								oEvent.getSource().setValueState('None');
							}
							this.fnSubmitButonValidation();
						},

						fnSubmitButonValidation: function () {

							var ItemListTable = Fragment.byId("AddOperationDialog", "idItemListListTable");
							var oItems = ItemListTable.getAggregation("items");
							var BoolPendingIP = false;
							var boolDataExist = false;
							for (var i = 0; i < oItems.length; i++) {
								// var HighLvlItemIPStatus = oItems[i].getAggregation("cells")[1].getValueState();
								// var HighLvlItem = oItems[i].getAggregation("cells")[1].getValue();
								var Material;
								if (oItems[i].getAggregation("cells")[1].getTokens().length > 0) {
									Material = oItems[i].getAggregation("cells")[1].getTokens()[0].getKey();
								} else {
									Material = "";
								}
								var Quantity = oItems[i].getAggregation("cells")[2].getValue();
								Quantity = parseFloat(Quantity);
								if (Quantity <= 0) {
									oItems[i].getAggregation("cells")[2].setValueState('Error');
								} else {
									oItems[i].getAggregation("cells")[2].setValueState('None');
								}
								// var InspectionLot = oItems[i].getAggregation("cells")[4].getSelectedKey();
								// var Characteristic = oItems[i].getAggregation("cells")[5].getSelectedKey();
								var ItemCategory = oItems[i].getAggregation("cells")[7].getText();
								if (Material || Quantity) { /** HighLvlItem || **/
									boolDataExist = true;
									if (!Material || !Quantity || Quantity <= 0 || !ItemCategory) { //HighLvlItemIPStatus === "Error" ||
										BoolPendingIP = true;
									}
								}
							}
							Fragment.byId("AddOperationDialog", "BTNSubmit").setEnabled(boolDataExist ? !BoolPendingIP : false);
						},

						onDeletePress: function (oEvent7) {
							var oSource = oEvent7.getSource();
							var oBindingContexts = oSource.getParent().oBindingContexts;
							var path = oBindingContexts["mServiceOrderOperation"].getPath();
							var oWEModel = oBindingContexts["mServiceOrderOperation"].getModel();
							var OEModelData = oWEModel.getData();
							var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
							var filteredData = [];
							for (var i = 0; i < OEModelData.TableData.length; i++) {
								if (OEModelData.TableData[i].ItemNumber !== OEModelData.TableData[currentIndex].ItemNumber && OEModelData.TableData[i].HighLevelItemNumber !==
									OEModelData.TableData[currentIndex].ItemNumber) {
									filteredData.push(OEModelData.TableData[i]);
								}
							}
							OEModelData.TableData = filteredData;
							oWEModel.updateBindings(true);
							this.fnSubmitButonValidation();
						},

						onReset: function () {
							that._initAddItemTableDialog("RESET");
						},
						onSubmit: function () {
							var actId = "SSOD_B66";
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var ItemListTable = Fragment.byId("AddOperationDialog", "idItemListListTable");
							var oItems = ItemListTable.getAggregation("items");
							var oModel = that.getView().getModel("AddOperations");
							var oEntity = "ZAE_FM_SSOD_ADD_OPERATIONSSet";
							var pageData = that.getView().getBindingContext().getObject();
							var mServiceOrderOperation = that.getView().getModel("mServiceOrderOperation");
							var oServiceOrderItemData = mServiceOrderOperation.getData();
							var NavMain = [{
								"ServiceOrder": pageData.ServiceOrder
							}];
							var NavItems = [];
							for (var i = 0; i < oServiceOrderItemData.TableData.length; i++) {
								if (oServiceOrderItemData.TableData[i].MaterialVHData && oServiceOrderItemData.TableData[i].Quantity !== "") {
									var obj = {},
										oTabData;
									oTabData = oServiceOrderItemData.TableData[i];
									obj["NumberInt"] = oTabData.ItemNumber.padStart(10, 0);
									obj["OrderedProd"] = oTabData.MaterialVHData.Material;
									obj["Severity"] = oTabData.Severity;
									obj["Quantity"] = oTabData.Quantity;
									if (obj["Quantity"] < '0') {
										var MsgErrBox = that.getView().getModel("i18n").getResourceBundle().getText("Quantityshouldnottakelessthan");
										MessageBox.error(MsgErrBox);
										return;
									}
									obj["ChklStepId"] = oTabData.CheckListId;
									if (oItems[i].getAggregation("cells")[4].getSelectedItem() !== null) {
										obj["CompCode"] = oItems[i].getAggregation("cells")[4].getSelectedItem().getAdditionalText(); //oTabData.ComplaintCode;
									}
									obj["ServiceType"] = oTabData.ServiceType;
									obj["ProcessQtyUnit"] = "";
									if (oTabData.ZAE_VH_InspectionChar) {
										var InspectionChar = oTabData.ZAE_VH_InspectionChar;
										obj["Prueflos"] = InspectionChar.InspectionLot;
										obj["InspOpNo"] = InspectionChar.InspPlanOperationInternalID;
										obj["InspCharNo"] = InspectionChar.InspectionCharacteristic;
										obj["InspCharCode"] = InspectionChar.Code;
										obj["Characteristic"] = InspectionChar.InspPlanOperationInternalID.replace(/^0+/, '') + "/" +
											InspectionChar.InspectionSpecificationText + "/" +
											InspectionChar.InspectionCodeText + "/" +
											InspectionChar.InspDate;
									}
									NavItems.push(obj);
								}
							}

							var data = [{
								callProperty: "NavMain",
								value: NavMain
							}, {
								callProperty: "NavOpp",
								value: NavItems
							}];
							var succFunc = function (oData, response) {
								that.aeUtil.refreshControlModel(that.oITFacetAddItemButton);
								that._fnLockAddComponent(false);
								that.resetSessionTimeout(false);
								that.oMouseMove = true;
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
							that._AddItemTableDialog.close();
						},

						onCancel: function () {
							that._AddItemTableDialog.close();
							that._fnLockAddComponent(false);
							that.resetSessionTimeout(false);
							that.oMouseMove = true;
						}
					}
				}).then(function (oValueHelpDialogContent) {
					that._AddItemTableDialog = oValueHelpDialogContent;
					that.getView().addDependent(that._AddItemTableDialog);
					that._initAddItemTableDialog("INIT");
					that._AddItemTableDialog.attachBrowserEvent("keyup", function (e) {
						if (e.which == 27 || e.keyCode == 27) {
							that._fnLockAddComponent(false);
						}
					}.bind(this));
				});
			} else {
				that._initAddItemTableDialog("INIT");
			}
		},
		_initAddItemTableDialog: function (form) {
			var that = this;
			var ButtonID = "SSOD_B66"
			Fragment.byId("AddOperationDialog", "BTNSubmit").setEnabled(false);
			var oDataInitial = {
				TableData: [],
				CheckListMasterData: []
			};
			for (var i = 10; i <= 30; i = i + 10) {
				oDataInitial.TableData.push({
					ItemNumber: i + "",
					HighLevelItemNumber: "",
					Material: "",
					MaterialVHData: {},
					Quantity: "",
					QuantityUnit: "",
					ItemCategory: "",
					ItemCategoryDesc: "",
					CheckListId: "",
					CheckList: [],
					CheckListEnabled: true,
					InspectionLot: "",
					Characteristic: "",
					Severity: ""

				});
			}
			var oJSONModel = new JSONModel(jQuery.extend(true, {}, oDataInitial));
			that.getView().setModel(oJSONModel, "mServiceOrderOperation");
			oJSONModel.updateBindings(true);

			var pageData = that.getView().getBindingContext().getObject();
			var aFiltersApp = [];
			aFiltersApp.push(new Filter('SalesOffice', 'EQ', pageData.SalesOffice));
			aFiltersApp.push(new Filter('SalesGroup', 'EQ', pageData.SalesGroup));
			aFiltersApp.push(new Filter('ProcessType', 'EQ', pageData.ServiceDocumentType));
			var ItemListTable = Fragment.byId("AddOperationDialog", "idItemListListTable");
			var oItems = ItemListTable.getAggregation("items");
			for (i = 0; i < oItems.length; i++) {
				oItems[i].getCells()[6].getBinding('items').filter(aFiltersApp);
			}

			that.oMouseMove = false;
			$(document).mousemove(function () {
				if (!that.oMouseMove) {
					that.resetSessionTimeout(true);
				}
			});
			$(document).keypress(function (e) {
				if (!that.oMouseMove) {
					that.resetSessionTimeout(true);
				}
			});
			that.resetSessionTimeout(true);

			if (form === "INIT") {
				that._fnLockAddComponent(true, ButtonID);
			}
			this.fnLoadCoplainCodeList();
		},
		fnLoadCoplainCodeList: function () {
			var pageData = this.getView().getBindingContext().getObject();
			var aFilters = [];
			aFilters.push(new Filter({
				filters: [
					new Filter({
						path: "ServiceObjectType",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: 'BUS2000223'
					}),
					new Filter({
						path: "ServiceRequest",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: pageData.ServiceRequest
					})

				],
				and: true
			}));

			aFilters.push(new Filter({
				filters: [
					new Filter({
						path: "CheckListOption",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "YES"
					}),
					new Filter({
						path: "CheckListOption",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "ZC000001"
					})

				],
				and: false
			}));
			var mServiceOrderOperation = this.getView().getModel("mServiceOrderOperation");
			this.getView().getModel().read("/ZAE_I_ServiceComplaint_01", { //ZAE_I_ServiceComplaint
				filters: aFilters,
				urlParameters: {},
				success: function (oData, response) {
					var oModelData = mServiceOrderOperation.getData();
					var aCheckList = [];
					if (oData.results.length > 0) {
						aCheckList = oData.results;
					}
					for (var i = 0; i < oModelData.TableData.length; i++) {
						oModelData.TableData[i].CheckList = aCheckList;
					}
					oModelData.CheckListMasterData = aCheckList;
					mServiceOrderOperation.updateBindings(true);
				},
				error: function (oError) {
					var aCheckList = [];
					var oModelData = mServiceOrderOperation.getData();
					for (var i = 0; i < oModelData.TableData.length; i++) {
						oModelData.TableData[i].CheckList = aCheckList;
					}
					oModelData.CheckListMasterData = [];
					mServiceOrderOperation.updateBindings(true);
				}

			});
		},

		onClickSSOD_B68: function (oEvent) {
			var that = this;
			if (!this._oNewSplitHeaderDialog) {
				Fragment.load({
						id: "fragSplitHeader",
						name: "com.globalintelli.zae_ssod.ext.fragment.SplitHeader",
						controller: {

							handleBPValueHelp: function (oEvent1) {
								var pageData = that.getView().getBindingContext().getObject();
								var ServiceOrganization = pageData.ServiceOrganization;
								var SalesOrganization = pageData.SalesOrganization;
								var DistributionChannel = pageData.DistributionChannel;
								var input = oEvent1.getSource();
								// input.setTokens([]);
								var configObject = {
									entitySet: "ZAE_VH_BusinessPartner_07",
									initiallyVisibleFields: "Partner,PartnerName,BusinesspartnerGrouping,FirstName,LastName",
									selectionMode: "Single",

									tokenObject: {
										key: "Partner",
										Description: "PartnerName"
									},
									controlConfiguration: [{
										index: 0,
										key: "Partner",
										filterType: "auto",
										label: "Business Partner",
										mandatory: "auto",
										visible: true
									}, {
										index: 1,
										key: "BusinesspartnerGrouping",
										filterType: "auto",
										label: "Business Partner Grouping",
										mandatory: "auto",
										visible: true
									}, {
										index: 2,
										key: "FirstName",
										filterType: "auto",
										label: "First Name",
										mandatory: "auto",
										visible: true
									}, {
										index: 3,
										key: "LastName",
										filterType: "auto",
										label: "Last Name",
										mandatory: "auto",
										visible: true
									}],
									defaultFilter: {

									},
									onBeforeRebindSmartTable: function (oEvent) {
										var pageData = that.getView().getBindingContext().getObject();
										var mSplit = that.getView().getModel("mSplitHeader");
										var bindingobj;
										var TableRows = Fragment.byId("fragSplitHeader", "SplitTable").getItems();
										for (var i = 0; i < TableRows.length; i++) {
											if (TableRows[i].getCells()[7].getSelectedItem() !== null) {
												if (TableRows[i].getCells()[7].getSelectedItem().getKey() === "Z5") {
													bindingobj = mSplit.getProperty(TableRows[i].getCells()[7].getSelectedItem().oBindingContexts.mSplitHeader.sPath);
												}
											}
											if (TableRows[i].getCells()[6].getSelectedItem() !== null) {
												if (TableRows[i].getCells()[6].getSelectedItem().getKey() === "Z5") {
													bindingobj = mSplit.getProperty(TableRows[i].getCells()[6].getSelectedItem().oBindingContexts.mSplitHeader.sPath);
												}
											}
										}
										var aFilters = oEvent.getParameter("bindingParams").filters;
										if (bindingobj.BPSelectionRule === '2') {
											aFilters.push(new sap.ui.model.Filter({
												path: "SalesOrganization",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.SalesOrganization
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "ProcessType",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.ServiceDocumentType
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "CurrentAccountingIndicator",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.CurrentAccountingIndicator
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "AccountingIndicator",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.AccountingIndicator
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "AccountingIndicatorSplit",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.AccountingIndicatorSplit
											}));
										} else if (bindingobj.BPSelectionRule === '1') {
											aFilters.push(new sap.ui.model.Filter({
												path: "ServiceOrg",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.service_org
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "BPSelectionRule",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.BPSelectionRule
											}));

										}
										oEvent.getParameter("bindingParams").filters = aFilters;
									}

								};
								that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
							},

							onModelContextChange: function (oEvent) {
								var self = this;
								var sId = oEvent.getParameter("id");
								var tbl = sap.ui.getCore().byId(sId);
								var header = tbl.$().find('thead');
								var selectAllCb = header.find('.sapMCb');
								selectAllCb.remove();

								tbl.getItems().forEach(function (r) {
									var obj = r.getBindingContext("mSplitHeader").getObject();
									var oStatus = obj.EnableSelect;
									var cb = r.$().find('.sapMCb');
									var oCb = sap.ui.getCore().getElementById(cb.attr('id'));
									if (oCb) {
										oCb.setEditable(oStatus);
									}
								});
								self.fnSubmitButonEnable();

							},

							fnliveChangeSplit: function (oEvent) {
								var mSplit = that.getView().getModel("mSplitHeader");
								var data = mSplit.getData();
								var sPath = oEvent.getSource().getBindingContext("mSplitHeader").getPath();
								var object = mSplit.getProperty(sPath);
								var BooleanCheck = false;

								for (var i = 0; i < data.TableList.length; i++) {
									if (object.Item === data.TableList[i].HigherLevelItem) {
										data.TableList[i].SplitCustomer = object.SplitCustomer;
									}
									if (Number(data.TableList[i].SplitCustomer) > 0 && Number(data.TableList[i].SplitCustomer) <= 100) {
										data.TableList[i].ProposedSplit = 100 - Number(data.TableList[i].SplitCustomer);
										if (data.TableList[i].ProposedSplit < 0) {
											BooleanCheck = true;
										}
									} else if (Number(data.TableList[i].SplitCustomer) >= 100) {
										data.TableList[i].ProposedSplit = 100 - Number(data.TableList[i].SplitCustomer);
										BooleanCheck = true;
									} else {
										data.TableList[i].ProposedSplit = 100;
									}
								}
								if (BooleanCheck) {
									MessageBox.error("Split should not be less than 0");
								}
								this.fnSubmitButonEnable();
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
							fnOnSelectHeaderAccInd: function (oEvent) {
								var mSplit = that.getView().getModel("mSplitHeader");
								var data = mSplit.getData();
								var SelectedItem = Fragment.byId("fragSplitHeader", "SplitAccountingIndicator").getSelectedItem();
								var sPath = SelectedItem.oBindingContexts.mSplitHeader.sPath;
								var obj = mSplit.getProperty(sPath);
								var SplitTable = Fragment.byId("fragSplitHeader", "SplitTable").getItems();
								var BoolenCheck = false;
								for (var i = 0; i < data.TableList.length; i++) {
									data.TableList[i].NewAccInd = obj.AccountingIndicatorSplit;
									if ((obj.AccountingIndicatorSplit === "Z5") || data.TableList[i].NewAccInd1 === "Z5") {
										BoolenCheck = true;
										if (data.TableList[i].NewAccInd1 === "Z5" || data.TableList[i].NewAccInd === "Z5") {
											var oControlEvent = {
												"selectedItem": ""
											};
											oControlEvent["selectedItem"] = oEvent.getParameter("selectedItem");
											SplitTable[i].getCells()[9].setEnabled(true);
											SplitTable[i].getCells()[6].fireChange(oControlEvent);
										}
									} else {
										SplitTable[i].getCells()[9].setSelectedKey(null);
										SplitTable[i].getCells()[9].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
								}
								mSplit.updateBindings(true);
								/*	Fragment.byId("fragSplitHeader", "ProposedSplit").setText(obj.AccountingIndicatorSplitText + " Split");
									Fragment.byId("fragSplitHeader", "SplitCustom").setText(obj.AccountingIndicatorSplitText + " Split To");*/
								if (BoolenCheck) {
									Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(true);

								} else {
									Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(false);
								}

								this.fnSubmitButonEnable();
							},

							fnSplitTableSelectionChange: function () {
								this.fnSubmitButonEnable();
							},

							fnNewAccIndSelectionChange: function (oEvent) {
								var pageData = that.getView().getBindingContext().getObject();
								var mSplit = that.getView().getModel("mSplitHeader");
								var data = mSplit.getData();
								var PartnerVH = [];
								var BoolenCheck = false;

								var bindingobj = that.getView().getModel("mSplitHeader").getProperty("/TableList/0/NewAccIndVH").find(function (obj) {
									return obj.AccountingIndicatorSplit === oEvent.getParameter("selectedItem").getKey();
								});
								// var SSODSplit = that.getView().getModel("mSplitHeader").getProperty(oEvent.getParameter("selectedItem").mBindingInfos.key.binding
								// 	.oContext.sPath);
								var BusinessPartnerCell = oEvent.getSource().getParent().getCells();
								if (oEvent.getParameter("selectedItem").getKey() !== 'Z5' && BusinessPartnerCell[7].getSelectedKey() === "Z5") {
									bindingobj = that.getView().getModel("mSplitHeader").getProperty(BusinessPartnerCell[7].getSelectedItem().mBindingInfos.key
										.binding
										.oContext
										.sPath);
								}
								for (var i = 0; i < data.TableList.length; i++) {
									if (data.TableList[i].NewAccInd === "Z5" || data.TableList[i].NewAccInd1 === "Z5") {
										//read ZAE_I_SSODSplit with key fields in data.TableList[i]
										BoolenCheck = true;
									} else {
										//	BusinessPartner[11].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
									//		this.fnSubmitButonEnable();
									if (BoolenCheck) {
										Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(true);
									} else {
										Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(false);
									}
								}
								if (oEvent.getParameter("selectedItem").getKey() === "Z5" || BusinessPartnerCell[7].getSelectedKey() ===
									"Z5") {
									BusinessPartnerCell[9].setEnabled(true);
								} else {
									BusinessPartnerCell[9].setValue("");
									BusinessPartnerCell[9].setEnabled(false);
								}
								this.fnSubmitButonEnable();
							},

							fnSubmitButonEnable: function () {

								var mSplit = that.getView().getModel("mSplitHeader");
								var SelectedItem = Fragment.byId("fragSplitHeader", "SplitAccountingIndicator").getSelectedItem();
								if (mSplit && SelectedItem) {
									var data = mSplit.getData();
									var sPath = SelectedItem.oBindingContexts.mSplitHeader.sPath;
									var object = mSplit.getProperty(sPath);
								}

								var ItemListTable = Fragment.byId("fragSplitHeader", "SplitTable");
								if (ItemListTable.getSelectedItems().length > 0) {
									var BoolSubmitEnable = true;
									ItemListTable.getSelectedItems().forEach(function (r) {
										var obj = r.getBindingContext("mSplitHeader").getObject();
										if (!obj.NewAccInd || !obj.SplitCustomer || (object && object.AccountingIndicatorSplit === "Z1" && !obj.Customer)) {
											BoolSubmitEnable = false;
										}
									});
									Fragment.byId("fragSplitHeader", "IDSubmit").setEnabled(BoolSubmitEnable);
								} else {
									Fragment.byId("fragSplitHeader", "IDSubmit").setEnabled(false);
								}

							},

							onSubmitPressed: function () {
								var ItemListTable = Fragment.byId("fragSplitHeader", "SplitTable");
								var aCondValue0 = [],
									itemText = "",
									findUnSelectedItems = [];
								ItemListTable.getItems().forEach(function (r) {
									var tableRowObj = r.getBindingContext("mSplitHeader").getObject();
									if (Number(tableRowObj.SplitCustomer) > 0) {
										findUnSelectedItems.push(r);
									}
								});

								if (ItemListTable.getSelectedItems().length > 0) {
									ItemListTable.getSelectedItems().forEach(function (r) {
										var tableRowObj = r.getBindingContext("mSplitHeader").getObject();
										if (Number(tableRowObj.SplitCustomer) === 0) {
											var obj = {
												NumberInt: tableRowObj.Item,
												HigherLevelItem: tableRowObj.HigherLevelItem,
												Material: tableRowObj.Material,
												Qty: tableRowObj.ItemQuantity,
												Uom: tableRowObj.QuantityUnit,
												AcInd: tableRowObj.ProposedAccInd,
												AcIndSplt: tableRowObj.NewAccInd,
												CondValue: tableRowObj.SplitCustomer,
												Partner: ""
											};
											itemText = itemText + tableRowObj.Item + ", ";
											aCondValue0.push(obj);
										}
										var tempArray = [];
										for (var i = 0; i < findUnSelectedItems.length; i++) {
											if (findUnSelectedItems[i].sId !== r.sId) {
												tempArray.push(findUnSelectedItems[i]);
											}

										}
										findUnSelectedItems = tempArray;

									});

								} else {
									var msg2 = "Kindly Select Items";
									var oMessageStrip = Fragment.byId("fragSplitHeader", "SSOD_B68MessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(msg2);
									return;
								}

								if (aCondValue0.length > 0 || findUnSelectedItems.length > 0) {
									var text = "";
									if (aCondValue0.length > 0) {
										text = "Item " + itemText + " having split 0 100 Pls confirm...";
									}
									if (findUnSelectedItems.length > 0) {
										text = " Some of the items not selected whit Split to is grater than 0 \n " + text;
									}
									this.oConfirmationMessageDialog = new sap.m.Dialog({
										type: sap.m.DialogType.Message,
										title: "Information",
										state: sap.ui.core.ValueState.Information,
										content: new Text({
											text: text
										}),
										beginButton: new Button({
											type: sap.m.ButtonType.Emphasized,
											text: "OK",
											press: function () {
												this.fnPressSubmit();
												this.oConfirmationMessageDialog.close();
											}.bind(this)
										}),
										endButton: new Button({
											type: sap.m.ButtonType.Default,
											text: "Cancel",
											press: function () {
												this.oConfirmationMessageDialog.close();
											}.bind(this)
										})
									});
									this.oConfirmationMessageDialog.open();
								} else {
									this.fnPressSubmit();
								}
							},

							fnPressSubmit: function () {
								var actId = "SSOD_B68";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var pageData = that.getView().getBindingContext().getObject();
								var oModel = that.getView().getModel("ZAE_FM_SSOD_ITEM_SPLIT_SRV");
								var oEntity = "ZAE_FM_SSOD_ITEM_SPLITSet";
								var NavSplitMain = [{
									ObjectId: pageData.ServiceOrder
								}];

								var NavSplitItems = [];
								var ItemListTable = Fragment.byId("fragSplitHeader", "SplitTable");
								if (ItemListTable.getSelectedItems().length > 0) {
									ItemListTable.getSelectedItems().forEach(function (r) {
										var tableRowObj = r.getBindingContext("mSplitHeader").getObject();
										var obj = {
											NumberInt: tableRowObj.Item,
											Higherlevelitem: tableRowObj.HigherLevelItem,
											Material: tableRowObj.Material,
											Qty: tableRowObj.ItemQuantity,
											Uom: tableRowObj.QuantityUnit,
											AcInd: tableRowObj.ProposedAccInd,
											AcIndSplt: tableRowObj.NewAccInd,
											CondValue: tableRowObj.SplitCustomer,
											Partner: tableRowObj.Customer
										};
										NavSplitItems.push(obj);
									});

								} else {
									var msg2 = "Kindly Select Items";
									var oMessageStrip = Fragment.byId("fragSplitHeader", "SSOD_B68MessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(msg2);
									return;
								}

								var data = [{
									callProperty: "NavSplitMain",
									value: NavSplitMain
								}, {
									callProperty: "NavSplitItems",
									value: NavSplitItems
								}];

								var succFunc = function (oData, response) {
									that.aeUtil.refreshControlModel(that.getView());
								}.bind(that);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
								that._oNewSplitHeaderDialog.close();
								that._oNewSplitHeaderDialog.destroy();
								that._oNewSplitHeaderDialog = null;
							},
							onCancelPressed: function () {
								that._oNewSplitHeaderDialog.close();
								that._oNewSplitHeaderDialog.destroy();
								that._oNewSplitHeaderDialog = null;
							}

						}
					})
					.then(function (oDialogContent) {
						that._oNewSplitHeaderDialog = oDialogContent;
						that.extensionAPI.attachToView(that._oNewSplitHeaderDialog);
						this._setSplitHeaderDialogInitialState();
					}.bind(this));
			} else {
				this._setSplitHeaderDialogInitialState();
			}
		},

		_setSplitHeaderDialogInitialState: function () {
			var that = this,
				aFilter = [],
				aFilter2 = [];
			var obj = {
				TableList: []
			};
			var mSplit = that.getView().getModel("mSplitHeader");
			if (mSplit) {
				mSplit.setData(obj);
			} else {
				var oJsonModel = new sap.ui.model.json.JSONModel();
				oJsonModel.setData(obj);
				that.getView().setModel(oJsonModel, "mSplitHeader");
			}

			var pageData = this.getView().getBindingContext().getObject();
			aFilter.push(new sap.ui.model.Filter({
				path: "ServiceOrder",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.ServiceOrder
			}));
			that._oNewSplitHeaderDialog.setBusy(true);
			that.getView().getModel().read("/ZAE_C_ServiceOrderOP_01", {
				filters: aFilter,
				success: function (oDataOrderOP, response) {
					that.getView().getModel().read("/ZAE_C_ServiceOrderComp_01", {
						filters: aFilter,
						success: function (oDataComp, response) {
							aFilter2.push(new sap.ui.model.Filter({
								path: "SalesOrganization",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.SalesOrganization
							}));
							aFilter2.push(new sap.ui.model.Filter({
								path: "ProcessType",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.ServiceDocumentType
							}));
							that.getView().getModel().read("/ZAE_I_SSODSplit", {
								filters: aFilter2,
								success: function (oDataSplit, response) {
									var SplitParameterList = oDataSplit.results;
									var OrderCompList = oDataComp.results;
									var selectedArray = oDataOrderOP;
									var splitList = [];
									for (var i = 0; i < selectedArray.length; i++) {
										var FilteredData = SplitParameterList.filter(function (obj) {
											return obj.CurrentAccountingIndicator === selectedArray[i].BillableControl;
										});
										var operationObj = {
											Item: selectedArray[i].ServiceOrderOperation,
											HigherLevelItem: "",
											Material: selectedArray[i].OriginallyRequestedProduct,
											MaterialName: selectedArray[i].MaterialName,
											ItemQuantity: selectedArray[i].OperationQuantity,
											QuantityUnit: selectedArray[i].OperationQuantityUnit,
											CurrentAccountingIndicator: selectedArray[i].BillableControl,
											CurrentAccountingIndicatorName: selectedArray[i].BillableControlName,
											ProposedAccInd: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingIndicator : "",
											ProposedAccIndName: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingindicatorText : "",
											NewAccInd: "",
											// NewAccIndVH: SplitParameterList,
											NewAccIndVH: FilteredData,
											SplitCustomer: "",
											ProposedSplit: 100,
											EnableSelect: true, //selectedArray[i].BillableControl ? false : true,
											Customer: ""
										};
										splitList.push(operationObj);
										for (var j = 0; j < OrderCompList.length; j++) {
											if (OrderCompList[j].HigherLevelItem === selectedArray[i].ServiceOrderOperation) {
												FilteredData = SplitParameterList.filter(function (obj) {
													return obj.CurrentAccountingIndicator === selectedArray[i].BillableControl;
												});

												var operationObj = {
													Item: OrderCompList[j].ServiceOrderOperation,
													HigherLevelItem: OrderCompList[j].HigherLevelItem,
													Material: OrderCompList[j].OriginallyRequestedProduct,
													MaterialName: OrderCompList[j].MaterialName,
													ItemQuantity: OrderCompList[j].OperationQuantity,
													QuantityUnit: OrderCompList[j].OperationQuantityUnit,
													CurrentAccountingIndicator: OrderCompList[j].BillableControl,
													CurrentAccountingIndicatorName: OrderCompList[j].BillableControlName,
													ProposedAccInd: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingIndicator : "",
													ProposedAccIndName: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingindicatorText : "",
													NewAccInd: "",
													NewAccIndVH: FilteredData, //SplitParameterList,
													SplitCustomer: "",
													ProposedSplit: 100,
													EnableSelect: true, //OrderCompList[j].BillableControl ? false : true,
													Customer: ""
												};
												splitList.push(operationObj);
											}

										}

									}
									SplitParameterList.sort(function (a, b) {
										return a.AccountingIndicatorSplit.localeCompare(b.AccountingIndicatorSplit);
									});
									var unique = [...new Map(SplitParameterList.map((m) => [m.AccountingIndicatorSplit, m])).values()];
									var obj = {
										TableList: splitList,
										NewAccIndVH: unique //SplitParameterList
									};
									that.getView().getModel("mSplitHeader").setData(obj);
									that._oNewSplitHeaderDialog.setBusy(false);
									Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(false);
									that.getView().getModel("mSplitHeader").updateBindings(true);
									setTimeout(function () {
										Fragment.byId("fragSplitHeader", "SplitTable").fireModelContextChange();
									}, 100);
								},
								error: function (error) {
									that._oNewSplitHeaderDialog.setBusy(false);
								}
							});

						},
						error: function (error) {
							that._oNewSplitHeaderDialog.setBusy(false);
						}
					});

				},
				error: function (error) {
					that._oNewSplitHeaderDialog.setBusy(false);
				}
			});
			this._oNewSplitHeaderDialog.open();
		},

		onClickSSOD_B67: function (oEvent) {
			var that = this;
			if (!this._oNewSplitDialog) {
				Fragment.load({
						id: "fragSplit",
						name: "com.globalintelli.zae_ssod.ext.fragment.Split",
						controller: {

							handleBPValueHelpOp: function (oEvent1) {
								var pageData = that.getView().getBindingContext().getObject();
								var ServiceOrganization = pageData.ServiceOrganization;
								var SalesOrganization = pageData.SalesOrganization;
								var DistributionChannel = pageData.DistributionChannel;
								var input = oEvent1.getSource();
								// input.setTokens([]);
								var configObject = {
									entitySet: "ZAE_VH_BusinessPartner_07",
									initiallyVisibleFields: "Partner,PartnerName,BusinesspartnerGrouping,FirstName,LastName",
									selectionMode: "Single",

									tokenObject: {
										key: "Partner",
										Description: "PartnerName"
									},
									controlConfiguration: [{
										index: 0,
										key: "Partner",
										filterType: "auto",
										label: "Business Partner",
										mandatory: "auto",
										visible: true
									}, {
										index: 1,
										key: "BusinesspartnerGrouping",
										filterType: "auto",
										label: "Business Partner Grouping",
										mandatory: "auto",
										visible: true
									}, {
										index: 2,
										key: "FirstName",
										filterType: "auto",
										label: "First Name",
										mandatory: "auto",
										visible: true
									}, {
										index: 3,
										key: "LastName",
										filterType: "auto",
										label: "Last Name",
										mandatory: "auto",
										visible: true
									}],
									defaultFilter: {

									},
									onBeforeRebindSmartTable: function (oEvent) {
										var pageData = that.getView().getBindingContext().getObject();
										var mSplit = that.getView().getModel("mSplit");
										var bindingobj;
										var TableRows = Fragment.byId("fragSplit", "SplitTable").getItems();
										for (var i = 0; i < TableRows.length; i++) {
											if (TableRows[i].getCells()[7].getSelectedItem() !== null) {
												if (TableRows[i].getCells()[7].getSelectedItem().getKey() === "Z5") {
													bindingobj = mSplit.getProperty(TableRows[i].getCells()[7].getSelectedItem().oBindingContexts.mSplit.sPath);
												}
											}
											if (TableRows[i].getCells()[6].getSelectedItem() !== null) {
												if (TableRows[i].getCells()[6].getSelectedItem().getKey() === "Z5") {
													bindingobj = mSplit.getProperty(TableRows[i].getCells()[6].getSelectedItem().oBindingContexts.mSplit.sPath);
												}
											}
										}
										var aFilters = oEvent.getParameter("bindingParams").filters;
										if (bindingobj.BPSelectionRule === '2') {
											aFilters.push(new sap.ui.model.Filter({
												path: "SalesOrganization",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.SalesOrganization
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "ProcessType",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.ServiceDocumentType
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "CurrentAccountingIndicator",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.CurrentAccountingIndicator
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "AccountingIndicator",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.AccountingIndicator
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "AccountingIndicatorSplit",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.AccountingIndicatorSplit
											}));
										} else if (bindingobj.BPSelectionRule === '1') {
											aFilters.push(new sap.ui.model.Filter({
												path: "ServiceOrg",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.service_org
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "BPSelectionRule",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.BPSelectionRule
											}));

										}
										oEvent.getParameter("bindingParams").filters = aFilters;
									}

								};
								that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
							},
							onModelContextChange: function (oEvent) {
								var self = this;
								var sId = oEvent.getParameter("id");
								var tbl = sap.ui.getCore().byId(sId);
								var header = tbl.$().find('thead');
								var selectAllCb = header.find('.sapMCb');
								selectAllCb.remove();

								tbl.getItems().forEach(function (r) {
									var obj = r.getBindingContext("mSplit").getObject();
									var oStatus = obj.EnableSelect;
									var cb = r.$().find('.sapMCb');
									var oCb = sap.ui.getCore().getElementById(cb.attr('id'));
									if (oCb) {
										oCb.setEditable(oStatus);
									}
								});
								self.fnSubmitButonEnable();

							},

							onBPTokenUpdate: function (oEvent) {
								var aTokens = oEvent.getSource().getTokens();
								var oBindingContexts = oEvent.getSource().getParent().oBindingContexts;
								var path = oBindingContexts["mSplit"].getPath();
								var oModel = oBindingContexts["mSplit"].getModel();
								var data = oModel.getData();
								if (aTokens.length === 0 || oEvent.getParameters().type === "removed") {
									oEvent.getSource().setSelectedKey("");
									oEvent.getSource().setTokens([]);
									oModel.setProperty(path + "/Customer", "");
								} else {
									oEvent.getSource().setTokens([]);
									var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
									oModel.setProperty(path + "/Customer", oSelRowData.Partner);
								}
								this.fnSubmitButonEnable();
							},

							fnliveChangeSplit: function (oEvent) {
								var mSplit = that.getView().getModel("mSplit");
								var data = mSplit.getData();
								var sPath = oEvent.getSource().getBindingContext("mSplit").getPath();
								var object = mSplit.getProperty(sPath);
								var BooleanCheck = false;

								for (var i = 0; i < data.TableList.length; i++) {
									if (object.Item === data.TableList[i].HigherLevelItem) {
										data.TableList[i].SplitCustomer = object.SplitCustomer;
									}
									if (Number(data.TableList[i].SplitCustomer) > 0 && Number(data.TableList[i].SplitCustomer) <= 100) {
										data.TableList[i].ProposedSplit = 100 - Number(data.TableList[i].SplitCustomer);
										if (data.TableList[i].ProposedSplit < 0) {
											BooleanCheck = true;
										}
									} else if (Number(data.TableList[i].SplitCustomer) >= 100) {
										data.TableList[i].ProposedSplit = 100 - Number(data.TableList[i].SplitCustomer);
										BooleanCheck = true;
									} else {
										data.TableList[i].ProposedSplit = 100;
									}
								}
								if (BooleanCheck) {
									MessageBox.error("Split should not be less than 0");
								}
								this.fnSubmitButonEnable();
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

							fnOnSelectHeaderAccInd: function (oEvent) {
								var mSplit = that.getView().getModel("mSplit");
								var data = mSplit.getData();
								var SelectedItem = Fragment.byId("fragSplit", "SplitAccountingIndicator").getSelectedItem();
								var sPath = SelectedItem.oBindingContexts.mSplit.sPath;
								var obj = mSplit.getProperty(sPath);
								var SplitTable = Fragment.byId("fragSplit", "SplitTable").getItems();
								var BoolenCheck = false;
								for (var i = 0; i < data.TableList.length; i++) {
									data.TableList[i].NewAccInd = obj.AccountingIndicatorSplit;
									if ((obj.AccountingIndicatorSplit === "Z5") || data.TableList[i].NewAccInd1 === "Z5") {
										BoolenCheck = true;
										if (data.TableList[i].NewAccInd1 === "Z5" || data.TableList[i].NewAccInd === "Z5") {
											var oControlEvent = {
												"selectedItem": ""
											};
											oControlEvent["selectedItem"] = oEvent.getParameter("selectedItem");
											SplitTable[i].getCells()[9].setEnabled(true);
											SplitTable[i].getCells()[6].fireChange(oControlEvent);
										}
									} else {
										SplitTable[i].getCells()[9].setSelectedKey(null);
										SplitTable[i].getCells()[9].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
								}
								mSplit.updateBindings(true);
								/*	Fragment.byId("fragSplitHeader", "ProposedSplit").setText(obj.AccountingIndicatorSplitText + " Split");
									Fragment.byId("fragSplitHeader", "SplitCustom").setText(obj.AccountingIndicatorSplitText + " Split To");*/
								if (BoolenCheck) {
									Fragment.byId("fragSplit", "ColumnCustomer").setVisible(true);

								} else {
									Fragment.byId("fragSplit", "ColumnCustomer").setVisible(false);
								}

								this.fnSubmitButonEnable();
							},

							// fnSplitTableSelectionChange: function () {
							// 	this.fnSubmitButonEnable();
							// },

							fnSplitTableSelectionChange: function () {
								this.fnSubmitButonEnable();
							},

							fnNewAccIndSelectionChange: function (oEvent) {
								var pageData = that.getView().getBindingContext().getObject();
								var mSplit = that.getView().getModel("mSplit");
								var data = mSplit.getData();
								var PartnerVH = [];
								var BoolenCheck = false;

								var bindingobj = that.getView().getModel("mSplit").getProperty("/TableList/0/NewAccIndVH").find(function (obj) {
									return obj.AccountingIndicatorSplit === oEvent.getParameter("selectedItem").getKey();
								});
								// var SSODSplit = that.getView().getModel("mSplitHeader").getProperty(oEvent.getParameter("selectedItem").mBindingInfos.key.binding
								// 	.oContext.sPath);
								var BusinessPartnerCell = oEvent.getSource().getParent().getCells();
								if (oEvent.getParameter("selectedItem").getKey() !== 'Z5' && BusinessPartnerCell[7].getSelectedKey() === "Z5") {
									bindingobj = that.getView().getModel("mSplit").getProperty(BusinessPartnerCell[7].getSelectedItem().mBindingInfos.key
										.binding
										.oContext
										.sPath);
								}
								for (var i = 0; i < data.TableList.length; i++) {
									if (data.TableList[i].NewAccInd === "Z5" || data.TableList[i].NewAccInd1 === "Z5") {
										//read ZAE_I_SSODSplit with key fields in data.TableList[i]
										BoolenCheck = true;
									} else {
										//	BusinessPartner[11].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
									//		this.fnSubmitButonEnable();
									if (BoolenCheck) {
										Fragment.byId("fragSplit", "ColumnCustomer").setVisible(true);
									} else {
										Fragment.byId("fragSplit", "ColumnCustomer").setVisible(false);
									}
								}
								if (oEvent.getParameter("selectedItem").getKey() === "Z5" || BusinessPartnerCell[7].getSelectedKey() ===
									"Z5") {
									BusinessPartnerCell[9].setEnabled(true);
								} else {
									BusinessPartnerCell[9].setValue("");
									BusinessPartnerCell[9].setEnabled(false);
								}
								this.fnSubmitButonEnable();
							},

							fnSubmitButonEnable: function () {

								var mSplit = that.getView().getModel("mSplit");
								var SelectedItem = Fragment.byId("fragSplit", "SplitAccountingIndicator").getSelectedItem();
								if (mSplit && SelectedItem) {
									var data = mSplit.getData();
									var sPath = SelectedItem.oBindingContexts.mSplit.sPath;
									var object = mSplit.getProperty(sPath);
								}

								var ItemListTable = Fragment.byId("fragSplit", "SplitTable");
								if (ItemListTable.getSelectedItems().length > 0) {
									var BoolSubmitEnable = true;
									ItemListTable.getSelectedItems().forEach(function (r) {
										var obj = r.getBindingContext("mSplit").getObject();
										if (!obj.NewAccInd || !obj.SplitCustomer || (object && object.AccountingIndicatorSplit === "Z5" && !obj.Customer)) {
											BoolSubmitEnable = false;
											Fragment.byId("fragSplit", "IDSubmit").setEnabled(BoolSubmitEnable);
										} else {
											Fragment.byId("fragSplit", "IDSubmit").setEnabled(BoolSubmitEnable);
										}
									});
								} else {
									Fragment.byId("fragSplit", "IDSubmit").setEnabled(false);
								}

							},

							onSubmitPressed: function () {
								var ItemListTable = Fragment.byId("fragSplit", "SplitTable");
								var aCondValue0 = [],
									itemText = "",
									findUnSelectedItems = [];
								ItemListTable.getItems().forEach(function (r) {
									var tableRowObj = r.getBindingContext("mSplit").getObject();
									if (Number(tableRowObj.SplitCustomer) > 0) {
										findUnSelectedItems.push(r);
									}
								});
								if (ItemListTable.getSelectedItems().length > 0) {
									ItemListTable.getSelectedItems().forEach(function (r) {
										var tableRowObj = r.getBindingContext("mSplit").getObject();
										if (Number(tableRowObj.SplitCustomer) === 0) {
											var obj = {
												NumberInt: tableRowObj.Item,
												HigherLevelItem: tableRowObj.HigherLevelItem,
												Material: tableRowObj.Material,
												Qty: tableRowObj.ItemQuantity,
												Uom: tableRowObj.QuantityUnit,
												AcInd: tableRowObj.ProposedAccInd,
												AcIndSplt: tableRowObj.NewAccInd,
												CondValue: tableRowObj.SplitCustomer,
												Partner: ""
											};
											itemText = itemText + tableRowObj.Item + ", ";
											aCondValue0.push(obj);
										}
										var tempArray = [];
										for (var i = 0; i < findUnSelectedItems.length; i++) {
											if (findUnSelectedItems[i].sId !== r.sId) {
												tempArray.push(findUnSelectedItems[i]);
											}

										}
										findUnSelectedItems = tempArray;

									});

								} else {
									var msg2 = "Kindly Select Items";
									var oMessageStrip = Fragment.byId("fragSplit", "SSOD_B67MessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(msg2);
									return;
								}

								if (aCondValue0.length > 0 || findUnSelectedItems.length > 0) {
									var text = "";
									if (aCondValue0.length > 0) {
										text = "Item " + itemText + " having split 0 100 Pls confirm...";
									}
									if (findUnSelectedItems.length > 0) {
										text = " Some of the items not selected with Split to is greater than 0 \n " + text;
									}

									this.oConfirmationMessageDialog = new sap.m.Dialog({
										type: sap.m.DialogType.Message,
										title: "Information",
										state: sap.ui.core.ValueState.Information,
										content: new Text({
											text: text
										}),
										beginButton: new Button({
											type: sap.m.ButtonType.Emphasized,
											text: "OK",
											press: function () {
												this.fnPressSubmit();
												this.oConfirmationMessageDialog.close();
											}.bind(this)
										}),
										endButton: new Button({
											type: sap.m.ButtonType.Default,
											text: "Cancel",
											press: function () {
												this.oConfirmationMessageDialog.close();
											}.bind(this)
										})
									});
									this.oConfirmationMessageDialog.open();
								} else {
									this.fnPressSubmit();
								}
							},

							fnPressSubmit: function () {
								var actId = "SSOD_B67";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var pageData = that.getView().getBindingContext().getObject();
								var oModel = that.getView().getModel("ZAE_FM_SSOD_ITEM_SPLIT_SRV");
								var oEntity = "ZAE_FM_SSOD_ITEM_SPLITSet";
								var NavSplitMain = [{
									ObjectId: pageData.ServiceOrder
								}];

								var NavSplitItems = [];
								var ItemListTable = Fragment.byId("fragSplit", "SplitTable");
								if (ItemListTable.getSelectedItems().length > 0) {
									ItemListTable.getSelectedItems().forEach(function (r) {
										var tableRowObj = r.getBindingContext("mSplit").getObject();
										var obj = {
											NumberInt: tableRowObj.Item,
											Higherlevelitem: tableRowObj.HigherLevelItem,
											Material: tableRowObj.Material,
											Qty: tableRowObj.ItemQuantity,
											Uom: tableRowObj.QuantityUnit,
											AcInd: tableRowObj.ProposedAccInd,
											AcIndSplt: tableRowObj.NewAccInd,
											CondValue: tableRowObj.SplitCustomer,
											Partner: tableRowObj.Customer
										};
										NavSplitItems.push(obj);
									});

								} else {
									var msg2 = "Kindly Select Items";
									var oMessageStrip = Fragment.byId("fragSplit", "SSOD_B67MessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(msg2);
									return;
								}

								var data = [{
									callProperty: "NavSplitMain",
									value: NavSplitMain
								}, {
									callProperty: "NavSplitItems",
									value: NavSplitItems
								}];

								var succFunc = function (oData, response) {
									that.aeUtil.refreshControlModel(that.getView());
								}.bind(that);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
								that._oNewSplitDialog.close();
								that._oNewSplitDialog.destroy();
								that._oNewSplitDialog = null;
							},
							onCancelPressed: function () {
								that._oNewSplitDialog.close();
								that._oNewSplitDialog.destroy();
								that._oNewSplitDialog = null;
							}
						}
					})
					.then(function (oDialogContent) {
						that._oNewSplitDialog = oDialogContent;
						that.extensionAPI.attachToView(that._oNewSplitDialog);
						this._setSplitDialogInitialState();
					}.bind(this));
			} else {
				this._setSplitDialogInitialState();
			}

		},

		_setSplitDialogInitialState: function () {
			var that = this,
				aFilter = [],
				aFilter2 = [];
			var obj = {
				TableList: []
			};
			var mSplit = that.getView().getModel("mSplit");
			if (mSplit) {
				mSplit.setData(obj);
			} else {
				var oJsonModel = new sap.ui.model.json.JSONModel();
				oJsonModel.setData(obj);
				that.getView().setModel(oJsonModel, "mSplit");
			}

			var pageData = this.getView().getBindingContext().getObject();
			var selSecData = that.aeUtil.getSecData(that, "OPFacet");
			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					/*beginButton: new Button({
						type: sap.m.ButtonType.Emphasized,
						text: "OK",
						press: function () { 
							this.oTempMessageDialog.close();
						}.bind(this)
					}),*/
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			} else {

				aFilter.push(new sap.ui.model.Filter({
					path: "ServiceOrder",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: pageData.ServiceOrder
				}));
				that._oNewSplitDialog.setBusy(true);
				that.getView().getModel().read("/ZAE_C_ServiceOrderComp_01", {
					filters: aFilter,
					success: function (oDataComp, response) {
						var selSecData = that.aeUtil.getSecData(that, "OPFacet");
						aFilter2.push(new sap.ui.model.Filter({
							path: "SalesOrganization",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: pageData.SalesOrganization
						}));
						aFilter2.push(new sap.ui.model.Filter({
							path: "ProcessType",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: pageData.ServiceDocumentType
						}));
						aFilter2.push(new sap.ui.model.Filter({
							path: "CurrentAccountingIndicator",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: selSecData.BillableControl
						}));

						that.getView().getModel().read("/ZAE_I_SSODSplit", {
							filters: aFilter2,
							success: function (oDataSplit, response) {
								var SplitParameterList = oDataSplit.results;
								var OrderCompList = oDataComp.results;
								var selectedArray = [];
								if (selSecData instanceof Array) {
									selectedArray = selSecData;
								} else {
									selectedArray.push(selSecData);
								}
								var splitList = [];
								for (var i = 0; i < selectedArray.length; i++) {
									var operationObj = {
										Item: selectedArray[i].ServiceOrderOperation,
										HigherLevelItem: "",
										Material: selectedArray[i].OriginallyRequestedProduct,
										MaterialName: selectedArray[i].MaterialName,
										ItemQuantity: selectedArray[i].OperationQuantity,
										QuantityUnit: selectedArray[i].OperationQuantityUnit,
										CurrentAccountingIndicator: selectedArray[i].BillableControl,
										CurrentAccountingIndicatorName: selectedArray[i].BillableControlName,
										ProposedAccInd: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingIndicator : "",
										ProposedAccIndName: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingindicatorText : "",
										NewAccInd: "",
										NewAccIndVH: SplitParameterList,
										SplitCustomer: "",
										ProposedSplit: 100,
										EnableSelect: true, //ture, //selectedArray[i].BillableControl ? false : true,
										Customer: ""
									};
									splitList.push(operationObj);
									for (var j = 0; j < OrderCompList.length; j++) {
										if (OrderCompList[j].HigherLevelItem === selectedArray[i].ServiceOrderOperation) {
											var operationObj = {
												Item: OrderCompList[j].ServiceOrderOperation,
												HigherLevelItem: OrderCompList[j].HigherLevelItem,
												Material: OrderCompList[j].OriginallyRequestedProduct,
												MaterialName: OrderCompList[j].MaterialName,
												ItemQuantity: OrderCompList[j].OperationQuantity,
												QuantityUnit: OrderCompList[j].OperationQuantityUnit,
												CurrentAccountingIndicator: OrderCompList[j].BillableControl,
												CurrentAccountingIndicatorName: OrderCompList[j].BillableControlName,
												ProposedAccInd: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingIndicator : "",
												ProposedAccIndName: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingindicatorText : "",
												NewAccInd: "",
												NewAccIndVH: SplitParameterList,
												SplitCustomer: "",
												ProposedSplit: 100,
												EnableSelect: true, //OrderCompList[j].BillableControl ? false : true,
												Customer: ""
											};
											splitList.push(operationObj);
										}

									}

								}
								var obj = {
									TableList: splitList,
									NewAccIndVH: SplitParameterList
								};
								that.getView().getModel("mSplit").setData(obj);
								that._oNewSplitDialog.setBusy(false);
								Fragment.byId("fragSplit", "ColumnCustomer").setVisible(false);
								that.getView().getModel("mSplit").updateBindings(true);
								setTimeout(function () {
									Fragment.byId("fragSplit", "SplitTable").fireModelContextChange();
								}, 100);
								/*	var ItemListTable = Fragment.byId("fragSplit", "SplitTable");
									ItemListTable.removeSelections();*/
							},
							error: function (error) {
								that._oNewSplitDialog.setBusy(false);
							}
						});

					},
					error: function (error) {
						that._oNewSplitDialog.setBusy(false);
					}
				});
				this._oNewSplitDialog.open();

			}
		},

		onClickSSOD_B69: function (oEvent) {

			var that = this;
			if (!this._oNewComponentSplitDialog) {
				Fragment.load({
						id: "fragSplitComponent",
						name: "com.globalintelli.zae_ssod.ext.fragment.SplitComponent",
						controller: {

							handleBPValueHelpComp: function (oEvent1) {
								var pageData = that.getView().getBindingContext().getObject();
								var ServiceOrganization = pageData.ServiceOrganization;
								var SalesOrganization = pageData.SalesOrganization;
								var DistributionChannel = pageData.DistributionChannel;
								var input = oEvent1.getSource();
								// input.setTokens([]);
								var configObject = {
									entitySet: "ZAE_VH_BusinessPartner_07",
									initiallyVisibleFields: "Partner,PartnerName,BusinesspartnerGrouping,FirstName,LastName",
									selectionMode: "Single",

									tokenObject: {
										key: "Partner",
										Description: "PartnerName"
									},
									controlConfiguration: [{
										index: 0,
										key: "Partner",
										filterType: "auto",
										label: "Business Partner",
										mandatory: "auto",
										visible: true
									}, {
										index: 1,
										key: "BusinesspartnerGrouping",
										filterType: "auto",
										label: "Business Partner Grouping",
										mandatory: "auto",
										visible: true
									}, {
										index: 2,
										key: "FirstName",
										filterType: "auto",
										label: "First Name",
										mandatory: "auto",
										visible: true
									}, {
										index: 3,
										key: "LastName",
										filterType: "auto",
										label: "Last Name",
										mandatory: "auto",
										visible: true
									}],
									defaultFilter: {

									},
									onBeforeRebindSmartTable: function (oEvent) {
										var pageData = that.getView().getBindingContext().getObject();
										var mSplit = that.getView().getModel("mSplit");
										var bindingobj;
										var TableRows = Fragment.byId("fragSplitComponent", "SplitTable").getItems();
										for (var i = 0; i < TableRows.length; i++) {
											if (TableRows[i].getCells()[7].getSelectedItem() !== null) {
												if (TableRows[i].getCells()[7].getSelectedItem().getKey() === "Z5") {
													bindingobj = mSplit.getProperty(TableRows[i].getCells()[7].getSelectedItem().oBindingContexts.mSplit.sPath);
												}
											}
											if (TableRows[i].getCells()[6].getSelectedItem() !== null) {
												if (TableRows[i].getCells()[6].getSelectedItem().getKey() === "Z5") {
													bindingobj = mSplit.getProperty(TableRows[i].getCells()[6].getSelectedItem().oBindingContexts.mSplit.sPath);
												}
											}
										}
										var aFilters = oEvent.getParameter("bindingParams").filters;
										if (bindingobj.BPSelectionRule === '2') {
											aFilters.push(new sap.ui.model.Filter({
												path: "SalesOrganization",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.SalesOrganization
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "ProcessType",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.ServiceDocumentType
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "CurrentAccountingIndicator",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.CurrentAccountingIndicator
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "AccountingIndicator",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.AccountingIndicator
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "AccountingIndicatorSplit",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.AccountingIndicatorSplit
											}));
										} else if (bindingobj.BPSelectionRule === '1') {
											aFilters.push(new sap.ui.model.Filter({
												path: "ServiceOrg",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.service_org
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "BPSelectionRule",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.BPSelectionRule
											}));

										}
										oEvent.getParameter("bindingParams").filters = aFilters;
									}

								};
								that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
							},

							onModelContextChange: function (oEvent) {
								var self = this;
								var sId = oEvent.getParameter("id");
								var tbl = sap.ui.getCore().byId(sId);
								var header = tbl.$().find('thead');
								var selectAllCb = header.find('.sapMCb');
								selectAllCb.remove();

								tbl.getItems().forEach(function (r) {
									var obj = r.getBindingContext("mSplit").getObject();
									var oStatus = obj.EnableSelect;
									var cb = r.$().find('.sapMCb');
									var oCb = sap.ui.getCore().getElementById(cb.attr('id'));
									if (oCb) {
										oCb.setEditable(oStatus);
									}
								});
								self.fnSubmitButonEnable();

							},

							fnliveChangeSplit: function (oEvent) {
								var mSplit = that.getView().getModel("mSplit");
								var data = mSplit.getData();
								var sPath = oEvent.getSource().getBindingContext("mSplit").getPath();
								var object = mSplit.getProperty(sPath);
								var BooleanCheck = false;

								for (var i = 0; i < data.TableList.length; i++) {
									if (object.Item === data.TableList[i].HigherLevelItem) {
										data.TableList[i].SplitCustomer = object.SplitCustomer;
									}
									if (Number(data.TableList[i].SplitCustomer) > 0 && Number(data.TableList[i].SplitCustomer) <= 100) {
										data.TableList[i].ProposedSplit = 100 - Number(data.TableList[i].SplitCustomer);
										if (data.TableList[i].ProposedSplit < 0) {
											BooleanCheck = true;
										}
									} else if (Number(data.TableList[i].SplitCustomer) >= 100) {
										data.TableList[i].ProposedSplit = 100 - Number(data.TableList[i].SplitCustomer);
										BooleanCheck = true;
									} else {
										data.TableList[i].ProposedSplit = 100;
									}
								}
								if (BooleanCheck) {
									MessageBox.error("Split should not be less than 0");
								}
								this.fnSubmitButonEnable();
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

							fnOnSelectHeaderAccInd: function (oEvent) {
								var mSplit = that.getView().getModel("mSplit");
								var data = mSplit.getData();
								var SelectedItem = Fragment.byId("fragSplitComponent", "SplitAccountingIndicator").getSelectedItem();
								var sPath = SelectedItem.oBindingContexts.mSplit.sPath;
								var obj = mSplit.getProperty(sPath);
								var SplitTable = Fragment.byId("fragSplitComponent", "SplitTable").getItems();
								var BoolenCheck = false;
								for (var i = 0; i < data.TableList.length; i++) {
									data.TableList[i].NewAccInd = obj.AccountingIndicatorSplit;
									if ((obj.AccountingIndicatorSplit === "Z5") || data.TableList[i].NewAccInd1 === "Z5") {
										BoolenCheck = true;
										if (data.TableList[i].NewAccInd1 === "Z5" || data.TableList[i].NewAccInd === "Z5") {
											var oControlEvent = {
												"selectedItem": ""
											};
											oControlEvent["selectedItem"] = oEvent.getParameter("selectedItem");
											SplitTable[i].getCells()[9].setEnabled(true);
											SplitTable[i].getCells()[6].fireChange(oControlEvent);
										}
									} else {
										SplitTable[i].getCells()[9].setSelectedKey(null);
										SplitTable[i].getCells()[9].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
								}
								mSplit.updateBindings(true);
								/*	Fragment.byId("fragSplitHeader", "ProposedSplit").setText(obj.AccountingIndicatorSplitText + " Split");
									Fragment.byId("fragSplitHeader", "SplitCustom").setText(obj.AccountingIndicatorSplitText + " Split To");*/
								if (BoolenCheck) {
									Fragment.byId("fragSplitComponent", "ColumnCustomer").setVisible(true);

								} else {
									Fragment.byId("fragSplitComponent", "ColumnCustomer").setVisible(false);
								}

								this.fnSubmitButonEnable();
							},

							fnSplitTableSelectionChange: function () {
								this.fnSubmitButonEnable();
							},

							fnSplitTableSelectionChange: function () {
								this.fnSubmitButonEnable();
							},

							fnNewAccIndSelectionChange: function (oEvent) {
								var pageData = that.getView().getBindingContext().getObject();
								var mSplit = that.getView().getModel("mSplit");
								var data = mSplit.getData();
								var PartnerVH = [];
								var BoolenCheck = false;

								var bindingobj = that.getView().getModel("mSplit").getProperty("/TableList/0/NewAccIndVH").find(function (obj) {
									return obj.AccountingIndicatorSplit === oEvent.getParameter("selectedItem").getKey();
								});
								// var SSODSplit = that.getView().getModel("mSplitHeader").getProperty(oEvent.getParameter("selectedItem").mBindingInfos.key.binding
								// 	.oContext.sPath);
								var BusinessPartnerCell = oEvent.getSource().getParent().getCells();
								if (oEvent.getParameter("selectedItem").getKey() !== 'Z5' && BusinessPartnerCell[7].getSelectedKey() === "Z5") {
									bindingobj = that.getView().getModel("mSplit").getProperty(BusinessPartnerCell[7].getSelectedItem().mBindingInfos.key
										.binding
										.oContext
										.sPath);
								}
								for (var i = 0; i < data.TableList.length; i++) {
									if (data.TableList[i].NewAccInd === "Z5" || data.TableList[i].NewAccInd1 === "Z5") {
										//read ZAE_I_SSODSplit with key fields in data.TableList[i]
										BoolenCheck = true;
									} else {
										//	BusinessPartner[11].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
									//		this.fnSubmitButonEnable();
									if (BoolenCheck) {
										Fragment.byId("fragSplitComponent", "ColumnCustomer").setVisible(true);
									} else {
										Fragment.byId("fragSplitComponent", "ColumnCustomer").setVisible(false);
									}
								}
								if (oEvent.getParameter("selectedItem").getKey() === "Z5" || BusinessPartnerCell[7].getSelectedKey() ===
									"Z5") {
									BusinessPartnerCell[9].setEnabled(true);
								} else {
									BusinessPartnerCell[9].setValue("");
									BusinessPartnerCell[9].setEnabled(false);
								}
								this.fnSubmitButonEnable();
							},

							fnSubmitButonEnable: function () {
								var mSplit = that.getView().getModel("mSplit");
								var SelectedItem = Fragment.byId("fragSplitComponent", "SplitAccountingIndicator").getSelectedItem();
								if (mSplit && SelectedItem) {
									var data = mSplit.getData();
									var sPath = SelectedItem.oBindingContexts.mSplit.sPath;
									var object = mSplit.getProperty(sPath);
								}

								var ItemListTable = Fragment.byId("fragSplitComponent", "SplitTable");
								if (ItemListTable.getSelectedItems().length > 0) {
									var BoolSubmitEnable = true;
									ItemListTable.getSelectedItems().forEach(function (r) {
										var obj = r.getBindingContext("mSplit").getObject();
										if (!obj.NewAccInd || !obj.SplitCustomer || (object && object.AccountingIndicatorSplit === "Z5" && !obj.Customer)) {
											BoolSubmitEnable = false;
											Fragment.byId("fragSplitComponent", "IDSubmit").setEnabled(BoolSubmitEnable);
										} else {
											Fragment.byId("fragSplitComponent", "IDSubmit").setEnabled(BoolSubmitEnable);
										}
									});
								} else {
									Fragment.byId("fragSplitComponent", "IDSubmit").setEnabled(false);
								}

							},

							onSubmitPressed: function () {
								var ItemListTable = Fragment.byId("fragSplitComponent", "SplitTable");
								var aCondValue0 = [],
									itemText = "",
									findUnSelectedItems = [];
								ItemListTable.getItems().forEach(function (r) {
									var tableRowObj = r.getBindingContext("mSplit").getObject();
									if (Number(tableRowObj.SplitCustomer) > 0) {
										findUnSelectedItems.push(r);
									}
								});
								if (ItemListTable.getSelectedItems().length > 0) {
									ItemListTable.getSelectedItems().forEach(function (r) {
										var tableRowObj = r.getBindingContext("mSplit").getObject();
										if (Number(tableRowObj.SplitCustomer) === 0) {
											var obj = {
												NumberInt: tableRowObj.Item,
												HigherLevelItem: tableRowObj.HigherLevelItem,
												Material: tableRowObj.Material,
												Qty: tableRowObj.ItemQuantity,
												Uom: tableRowObj.QuantityUnit,
												AcInd: tableRowObj.ProposedAccInd,
												AcIndSplt: tableRowObj.NewAccInd,
												CondValue: tableRowObj.SplitCustomer,
												Partner: ""
											};
											itemText = itemText + tableRowObj.Item + ", ";
											aCondValue0.push(obj);
										}
										var tempArray = [];
										for (var i = 0; i < findUnSelectedItems.length; i++) {
											if (findUnSelectedItems[i].sId !== r.sId) {
												tempArray.push(findUnSelectedItems[i]);
											}

										}
										findUnSelectedItems = tempArray;

									});

								} else {
									var msg2 = "Kindly Select Items";
									var oMessageStrip = Fragment.byId("fragSplitComponent", "SSOD_B69MessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(msg2);
									return;
								}

								if (aCondValue0.length > 0 || findUnSelectedItems.length > 0) {
									var text = "";
									if (aCondValue0.length > 0) {
										text = "Item " + itemText + " having split 0 100 Pls confirm...";
									}
									if (findUnSelectedItems.length > 0) {
										text = " Some of the items not selected whit Split to is grater than 0 \n " + text;
									}

									this.oConfirmationMessageDialog = new sap.m.Dialog({
										type: sap.m.DialogType.Message,
										title: "Information",
										state: sap.ui.core.ValueState.Information,
										content: new Text({
											text: text
										}),
										beginButton: new Button({
											type: sap.m.ButtonType.Emphasized,
											text: "OK",
											press: function () {
												this.fnPressSubmit();
												this.oConfirmationMessageDialog.close();
											}.bind(this)
										}),
										endButton: new Button({
											type: sap.m.ButtonType.Default,
											text: "Cancel",
											press: function () {
												this.oConfirmationMessageDialog.close();
											}.bind(this)
										})
									});
									this.oConfirmationMessageDialog.open();
								} else {
									this.fnPressSubmit();
								}
							},

							fnPressSubmit: function () {
								var actId = "SSOD_B69";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var pageData = that.getView().getBindingContext().getObject();
								var oModel = that.getView().getModel("ZAE_FM_SSOD_ITEM_SPLIT_SRV");
								var oEntity = "ZAE_FM_SSOD_ITEM_SPLITSet";
								var NavSplitMain = [{
									ObjectId: pageData.ServiceOrder
								}];

								var NavSplitItems = [];
								var ItemListTable = Fragment.byId("fragSplitComponent", "SplitTable");
								if (ItemListTable.getSelectedItems().length > 0) {
									ItemListTable.getSelectedItems().forEach(function (r) {
										var tableRowObj = r.getBindingContext("mSplit").getObject();
										var obj = {
											NumberInt: tableRowObj.Item,
											Higherlevelitem: tableRowObj.HigherLevelItem,
											Material: tableRowObj.Material,
											Qty: tableRowObj.ItemQuantity,
											Uom: tableRowObj.QuantityUnit,
											AcInd: tableRowObj.ProposedAccInd,
											AcIndSplt: tableRowObj.NewAccInd,
											CondValue: tableRowObj.SplitCustomer,
											Partner: tableRowObj.Customer
										};
										NavSplitItems.push(obj);
									});

								} else {
									var msg2 = "Kindly Select Items";
									var oMessageStrip = Fragment.byId("fragSplitComponent", "SSOD_B69MessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(msg2);
									return;
								}

								var data = [{
									callProperty: "NavSplitMain",
									value: NavSplitMain
								}, {
									callProperty: "NavSplitItems",
									value: NavSplitItems
								}];

								var succFunc = function (oData, response) {
									that.aeUtil.refreshControlModel(that.getView());
								}.bind(that);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
								that._oNewComponentSplitDialog.close();
								that._oNewComponentSplitDialog.destroy();
								that._oNewComponentSplitDialog = null;
							},
							onCancelPressed: function () {
								that._oNewComponentSplitDialog.close();
								that._oNewComponentSplitDialog.destroy();
								that._oNewComponentSplitDialog = null;
							}
						}
					})
					.then(function (oDialogContent) {
						that._oNewComponentSplitDialog = oDialogContent;
						that.extensionAPI.attachToView(that._oNewComponentSplitDialog);
						this._setComponentSplitDialogInitialState();
					}.bind(this));
			} else {
				this._setComponentSplitDialogInitialState();
			}
		},

		_setComponentSplitDialogInitialState: function () {
			var that = this,
				aFilter = [],
				aFilter2 = [];
			var obj = {
				TableList: []
			};
			var mSplit = that.getView().getModel("mSplit");
			if (mSplit) {
				mSplit.setData(obj);
			} else {
				var oJsonModel = new sap.ui.model.json.JSONModel();
				oJsonModel.setData(obj);
				that.getView().setModel(oJsonModel, "mSplit");
			}

			var pageData = this.getView().getBindingContext().getObject();
			var selSecData = that.aeUtil.getSecData(that, "CPFacet");
			/*	if (selSecData instanceof Array) {
					this.oTempMessageDialog = new sap.m.Dialog({
						type: sap.m.DialogType.Message,
						title: "Information",
						state: sap.ui.core.ValueState.Information,
						content: new Text({
							text: "Multiple Selection Not Allowed"
						}),
						endButton: new Button({
							type: sap.m.ButtonType.Default,
							text: "Cancel",
							press: function () {
								this.oTempMessageDialog.close();
							}.bind(this)
						})
					});
					this.oTempMessageDialog.open();
					return;
				} else { }*/

			that._oNewComponentSplitDialog.setBusy(true);

			aFilter2.push(new sap.ui.model.Filter({
				path: "SalesOrganization",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.SalesOrganization
			}));
			aFilter2.push(new sap.ui.model.Filter({
				path: "ProcessType",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.ServiceDocumentType
			}));
			aFilter2.push(new sap.ui.model.Filter({
				path: "CurrentAccountingIndicator",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: selSecData.BillableControl
			}));
			that.getView().getModel().read("/ZAE_I_SSODSplit", {
				filters: aFilter2,
				success: function (oDataSplit, response) {
					var SplitParameterList = oDataSplit.results;
					var selectedArray = [];
					if (selSecData instanceof Array) {
						selectedArray = selSecData;
					} else {
						selectedArray.push(selSecData);
					}
					var splitList = [];
					for (var i = 0; i < selectedArray.length; i++) {
						var operationObj = {
							Item: selectedArray[i].ServiceOrderOperation,
							HigherLevelItem: selectedArray[i].HigherLevelItem,
							Material: selectedArray[i].OriginallyRequestedProduct,
							MaterialName: selectedArray[i].MaterialName,
							ItemQuantity: selectedArray[i].OperationQuantity,
							QuantityUnit: selectedArray[i].OperationQuantityUnit,
							CurrentAccountingIndicator: selectedArray[i].BillableControl,
							CurrentAccountingIndicatorName: selectedArray[i].BillableControlName,
							ProposedAccInd: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingIndicator : "",
							ProposedAccIndName: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingindicatorText : "",
							NewAccInd: "",
							NewAccIndVH: SplitParameterList,
							SplitCustomer: "",
							ProposedSplit: 100,
							EnableSelect: true, //selectedArray[i].BillableControl ? false : true,
							Customer: "",
							SplitEnable: true
						};
						splitList.push(operationObj);
					}
					var obj = {
						TableList: splitList,
						NewAccIndVH: SplitParameterList
					};
					that.getView().getModel("mSplit").setData(obj);
					that._oNewComponentSplitDialog.setBusy(false);
					Fragment.byId("fragSplitComponent", "ColumnCustomer").setVisible(false);
					that.getView().getModel("mSplit").updateBindings(true);
					setTimeout(function () {
						Fragment.byId("fragSplitComponent", "SplitTable").fireModelContextChange();
					}, 100);
					/*	var ItemListTable = Fragment.byId("fragSplit", "SplitTable");
						ItemListTable.removeSelections();*/
				},
				error: function (error) {
					that._oNewComponentSplitDialog.setBusy(false);
				}
			});

			this._oNewComponentSplitDialog.open();

		},
		//OEM Parts Return Component
		onClickSSOD_B70: function (oEvent) {
			var that = this;
			that.oITFacetOEMPartsButton = oEvent.getSource();

			if (!that._CompOEMPartsDialog) {
				Fragment.load({
					id: "idCompOEMPartsDialog",
					name: "com.globalintelli.zae_ssod.ext.fragment.CompOEMPartsReturn",
					controller: {
						fnOEMSubmitButonValidation: function () {
							var oItems = Fragment.byId("idCompOEMPartsDialog", "idOEMTable").getItems();
							var bEnabled = false;
							var BoolPendingIP = false;
							var Qty = 0;
							// var Equipment = Fragment.byId("OEMPartsReturnDialog", "idEquipment").getTokens();
							// if (Equipment.length === 0) {
							// 	BoolPendingIP = true;
							// }
							for (var i = 0; i < oItems.length; i++) {
								var Quantity = oItems[i].getAggregation("cells")[5];
								var oQtyValue = Quantity.getValue();
								var oBalance = parseFloat(oItems[i].getAggregation("cells")[4].getValue());
								if (oQtyValue !== "") {
									if (parseFloat(oQtyValue) === oBalance) {
										Qty = Qty + parseFloat(oQtyValue);
										Quantity.setValueState("None");
									} else {
										Quantity.setValueState("Error");
										BoolPendingIP = true;
									}
								} else {
									BoolPendingIP = true;
								}
							}
							if (oItems.length === 0) {
								bEnabled = false;
							} else {
								bEnabled = true;
							}
							Fragment.byId("idCompOEMPartsDialog", "OEMSubmit").setEnabled(bEnabled ? !BoolPendingIP : false);
						},
						onSelectionChange: function (oEvent) {
							var SelectedContext = oEvent.getSource().getSelectedContextPaths();
							if (oEvent.getParameters().selected === false) {
								oEvent.getParameters().listItem.getCells()[5].setValue("");
								oEvent.getParameters().listItem.getCells()[5].setEnabled(false);
								oEvent.getParameters().listItem.getCells()[4].setValueState("None");
							}
							var oModel = that.getView().getModel("mCompOEMPartsReturn");
							SelectedContext.forEach(function (oItem, i) {
								oModel.setProperty(oItem + "/qtyEnabled", true);
							});
							if (SelectedContext.length === 0) {
								oModel.getData().results.forEach(function (oItem, i) {
									oItem.qtyEnabled = false;
									oItem.Qty = "";
								});
								oModel.updateBindings(true);
							}
							this.fnOEMSubmitButonValidation();
						},
						onSubmitOEM: function (oEvent) {
							//	var that = this;
							var actId = "SSOD_B70";
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var selSecData = that.aeUtil.getSecData(that, "OPFacet");
							var oModel = that.getView().getModel("OEMPartsReturn");
							var oEntity = "ZAE_FM_SSOD_ADDCOND_TYPE_LINESet";
							var pageData = that.getView().getBindingContext().getObject();
							// OEMQuantity = Fragment.byId("idCompOEMPartsDialog", "idOemQty").getValue();
							var oSelectedItems = Fragment.byId("idCompOEMPartsDialog", "idOEMTable").getItems();
							var NavMain = [{
								"Serviceorder": pageData.ServiceOrder,
							}];
							var NavItems = [];
							for (var i = 0; i < oSelectedItems.length; i++) {
								NavItems.push({
									"NumberInt": oSelectedItems[i].getCells()[0].getText(),
									"Higherlevelitem": oSelectedItems[i].getCells()[1].getText(),
									"Material": oSelectedItems[i].getCells()[2].getText(),
									"Qty": oSelectedItems[i].getCells()[5].getValue(),
								});
							}
							//			}
							var data = [{
								callProperty: "NavCondMain",
								value: NavMain
							}, {
								callProperty: "NavCondItems",
								value: NavItems
							}];
							var succFunc = function (oData, response) {
								that.getView().getModel().refresh(true);
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
							that._CompOEMPartsDialog.close();

						},
						onCancel: function () {
							that._CompOEMPartsDialog.close();
						}
					}
				}).then(function (DialogContent) {
					that._CompOEMPartsDialog = DialogContent;
					that.getView().addDependent(that._CompOEMPartsDialog);
					that._initCompOEMPartsDialog("INIT");
				});
			} else {
				that._initCompOEMPartsDialog("INIT");
			}
		},
		_initCompOEMPartsDialog: function (form) {
			var that = this;
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			if (!(selSecData instanceof Array)) {
				selSecData = [selSecData];
			}
			var pageData = that.getView().getBindingContext().getObject();
			var aTempData = {};
			var aData = [];
			var qty = "";
			//	Fragment.byId("OEMPartsDialog", "OEMSubmit").setEnabled(false);
			selSecData.forEach(function (obj, ind) {
				aTempData = {
					ItemNumber: Number(obj.ServiceOrderOperation) + "",
					HighLevelItemNumber: "10",
					Material: obj.OriginallyRequestedProduct,
					MaterialName: obj.MaterialName,
					OperationQuantity: obj.OperationQuantity,
					OperationQuantityUnit: obj.OperationQuantityUnit,
					Qty: qty,
					qtyEnabled: false,
					qtyValueState: "None"
				};
				aData.push(aTempData);
			});
			var oJSONModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oJSONModel, "mCompOEMPartsReturn");
			this.getView().getModel("mCompOEMPartsReturn").setProperty("/results", aData);
			this.getView().getModel("mCompOEMPartsReturn").setProperty("/results/ServiceOrder", selSecData[0].ServiceOrder);
			this.getView().getModel("mCompOEMPartsReturn").refresh();
			Fragment.byId("idCompOEMPartsDialog", "OEMSubmit").setEnabled(false);
			this._CompOEMPartsDialog.open();
		},
		onClickSSOD_B72: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			if (selSecData instanceof Array) {
				var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("MultipleNotAllowed");
				sap.m.MessageBox.error(msg1);
				return;
			}
			var actId = "SSOD_B72";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_ACC_IND_REMOVESet";
			var data = [{
				callProperty: "ObjectId",
				value: selSecData.ServiceOrder
			}, {
				callProperty: "NumberInt",
				value: selSecData.ServiceOrderOperation
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		/*onClickSSOD_B71: function (oEvent) {
				var that = this;
				var actId = "SSOD_B71";
				var oSource = oEvent.getSource();
				var actLabel = this.aeUtil.geti18nText(this, actId);
				var selSecData = this.aeUtil.getSecData(that, "OPFacet");
				var pageData = that.getView().getBindingContext().getObject();
				var fragName = "com.globalintelli.zae_ssod.ext.fragment.ChargeTo";
				var oModel = oSource.getModel();
				var oEntity = "ZAE_FM_SSOD_ACC_IND_UPDATESet";
				var dialogFields = [{
					fragInputId: "BillingRuleInput",
					fragInputLabel: this.aeUtil.geti18nText(that, "BillingRuleInput"),
					vhEntitySet: "ZAE_I_TC_SSOD_CHRT",
					vhEntitySetFilter: [{

						path: 'SalesOrganization',
						operator: 'EQ',
						value1: pageData.SalesOrganization
					}, {
						path: 'ProcessType',
						operator: 'EQ',
						value1: pageData.ServiceDocumentType
					}],
					vhSearchKey: "BillingRule",
					vhSearchText: "BillingRuleName",
					callProperty: "BillingRule"
				}];
				var data = [{
						callProperty: "ObjectId",
						value: selSecData.ServiceOrder
					}, {
						callProperty: "NumberInt",
						value: selSecData.ServiceOrderOperation
					}];
				var checkFucc = function () {
					var oPR = Fragment.byId(actId + "Fragment", "BillingRuleInput").getValue();
					if (oPR === "" || oPR === undefined) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "SELECT_BILLING_RULE")
						};
					} else {
						return {
							pass: true
						};
					}
				}.bind(this);
				var succFunc = function (oData, response) {
					this.extensionAPI.refresh();
				}.bind(this);

				this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);			

		},*/

		onClickSSOD_B71: function (oEvent) {
			if (!this._oChargeToDialog) {
				Fragment.load({
						id: "idChargeToDialog",
						name: "com.globalintelli.zae_ssod.ext.fragment.ChargeTo",
						controller: this
					})
					.then(function (oDialogContent) {
						this._createChargeToDialog(oDialogContent);
						this._setChargeToDialogInitialState();
					}.bind(this));
			} else {
				this._setChargeToDialogInitialState();
			}
		},

		_createChargeToDialog: function (oDialogContent) {
			var that = this;
			this._oChargeToDialog = new Dialog({
				title: "{i18n>SSOD_B71}",
				width: "640px",
				content: [
					oDialogContent
				],
				buttons: [
					new Button({
						text: "Submit",
						press: function () {
							var MessageStrip = Fragment.byId("idChargeToDialog", "SSOD_B71MessageStrip");
							var pageData = this.getView().getBindingContext().getObject();
							var selSecData = this.aeUtil.getSecData(that, "OPFacet");
							var actId = 'SSOD_B71';
							var actLabel = this.aeUtil.geti18nText(that, actId);
							var oModel = this.getView().getModel();
							var oEntity = "ZAE_FM_SSOD_ACC_IND_UPDATESet";
							var oBillingDateInput = Fragment.byId("idChargeToDialog", "BillingRuleInput").getValue();
							oBillingDateInput = oBillingDateInput.split("(")[0];
							var oPartnerChargeInput = Fragment.byId("idChargeToDialog", "PartnerChargeInput").getValue();
							oPartnerChargeInput = oPartnerChargeInput.split("(")[0];
							if (oBillingDateInput === "" || oBillingDateInput === undefined) {
								MessageStrip.setText("Fill required fields.");
								MessageStrip.setVisible(true);
								return;
							} else if (oBillingDateInput === "05" || oBillingDateInput === "06" || oBillingDateInput === '09' ||
								oBillingDateInput === "10" || oBillingDateInput === "11") {
								if (oPartnerChargeInput === "" || oPartnerChargeInput === undefined) {
									MessageStrip.setText("Fill required fields.");
									MessageStrip.setVisible(true);
									return;
								}
							}
							var data = [{
								callProperty: "ObjectId",
								value: selSecData.ServiceOrder
							}, {
								callProperty: "NumberInt",
								value: selSecData.ServiceOrderOperation
							}, {
								callProperty: "BillingRule",
								value: oBillingDateInput
							}, {
								callProperty: "Partner",
								value: oPartnerChargeInput
							}];
							var succFunc = function (oData, response) {
								this.extensionAPI.refresh();
							}.bind(this);
							this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
							this._oChargeToDialog.close();
						}.bind(this)
					}),
					new Button({
						text: "Close",
						press: function () {
							this._oChargeToDialog.close();
						}.bind(this)
					})
				]
			});
			this.getView().addDependent(this._oChargeToDialog);
		},

		_setChargeToDialogInitialState: function () {
			var that = this;
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			if (selSecData instanceof Array) {
				var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("MultipleNotAllowed");
				sap.m.MessageBox.error(msg1);
				return;
			}
			Fragment.byId("idChargeToDialog", "BillingRuleInput").setValue();
			Fragment.byId("idChargeToDialog", "PartnerChargeInput").setValue();
			Fragment.byId("idChargeToDialog", "SSOD_B71MessageStrip").setVisible(false);
			Fragment.byId("idChargeToDialog", "PartnerChargeInput").setVisible(false);
			this._oChargeToDialog.open();
		},
		onSearchBillingRuleValueHelp: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var pageData = this.getView().getBindingContext().getObject();
			var oFilter1 = new sap.ui.model.Filter("BillingRule", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter2 = new sap.ui.model.Filter("BillingRuleName", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter3 = new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.Contains, pageData.SalesOrganization);
			var oFilter4 = new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.Contains, pageData.ServiceDocumentType);
			var oFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: false
			});
			var oFilter5 = new sap.ui.model.Filter({
				filters: [oFilter, oFilter3, oFilter4],
				and: true
			});
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter5]);
		},
		onCancelBillingRuleValueHelp: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.destroy();
		},
		onShowBillingRuleValueHelpDialogClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			Fragment.byId("idChargeToDialog", "PartnerChargeInput").setValue();
			if (oSelectedItem) {
				var Partner = Fragment.byId("idChargeToDialog", "BillingRuleInput");
				Partner.setValue(oSelectedItem.getTitle() + "(" + oSelectedItem.getDescription() + ")");
			}
			if (oSelectedItem.getTitle() === '05' || oSelectedItem.getTitle() === '06' || oSelectedItem.getTitle() === '09' || oSelectedItem.getTitle() ===
				"10" || oSelectedItem.getTitle() === "11") {
				Fragment.byId("idChargeToDialog", "PartnerChargeInput").setVisible(true);
			} else {
				Fragment.byId("idChargeToDialog", "PartnerChargeInput").setVisible(false);
			}
		},
		onShowBillingRuleVH: function () {
			var that = this;
			var oPartnerTemplate = new sap.m.StandardListItem({
				title: "{BillingRule}",
				description: "{BillingRuleName}",
				type: "Active"

			});
			if (!this._valueHelpDialog) {
				Fragment.load({
						id: "valueHelpDialogFragment",
						name: "com.globalintelli.zae_ssod.ext.fragment.BillingRuleVH",
						controller: that
					})
					.then(function (oValueHelpDialogContent) {
						oValueHelpDialogContent.open();
						oValueHelpDialogContent.setModel(that.getView().getModel());
						var pageData = that.getView().getBindingContext().getObject();
						var aFilter = [];
						aFilter.push(new sap.ui.model.Filter('SalesOrganization', 'EQ', pageData.SalesOrganization));
						aFilter.push(new sap.ui.model.Filter('ProcessType', 'EQ', pageData.ServiceDocumentType));
						oValueHelpDialogContent.bindAggregation("items", {
							path: '/ZAE_I_TC_SSOD_CHRT',
							template: oPartnerTemplate,
							filters: aFilter
						});

					});
			} else {
				this._valueHelpDialog.open();
				var pageData = that.getView().getBindingContext().getObject();
				var aFilter = [];
				aFilter.push(new sap.ui.model.Filter('SalesOrganization', 'EQ', pageData.SalesOrganization));
				aFilter.push(new sap.ui.model.Filter('ProcessType', 'EQ', pageData.ServiceDocumentType));
				this._valueHelpDialog.bindAggregation("items", {
					path: '/ZAE_I_TC_SSOD_CHRT',
					template: oPartnerTemplate,
					filters: aFilter
				});
			}
		},
		onSearchChargePartnerValueHelp: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var pageData = this.getView().getBindingContext().getObject();
			var oFilter1 = new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter2 = new sap.ui.model.Filter("PartnerName", sap.ui.model.FilterOperator.Contains, sValue);
			//	var oFilter3 = new sap.ui.model.Filter("ServiceOrg", sap.ui.model.FilterOperator.Contains, pageData.service_org);
			var oFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: false
			});
			var oFilter4 = new sap.ui.model.Filter({
				filters: [oFilter],
				and: true
			});
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter4]);
		},
		onCancelChargePartnerValueHelp: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.destroy();
		},
		onShowChargePartnerValueHelpDialogClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var Partner = Fragment.byId("idChargeToDialog", "PartnerChargeInput");
				Partner.setValue(oSelectedItem.getTitle() + "(" + oSelectedItem.getDescription() + ")");
			}
		},
		onShowChargePartnerVH: function () {
			var that = this;
			var oPartnerTemplate = new sap.m.StandardListItem({
				title: "{Partner}",
				description: "{PartnerName}",
				type: "Active"

			});
			if (!this._valueHelpDialog) {
				Fragment.load({
						id: "valueHelpDialogFragment",
						name: "com.globalintelli.zae_ssod.ext.fragment.ChargePartnerVH",
						controller: that
					})
					.then(function (oValueHelpDialogContent) {
						oValueHelpDialogContent.open();
						oValueHelpDialogContent.setModel(that.getView().getModel());
						var pageData = that.getView().getBindingContext().getObject();
						var aFilter = [];
						// aFilter.push(new sap.ui.model.Filter("ServiceOrg", sap.ui.model.FilterOperator.Contains, pageData.service_org));
						// oValueHelpDialogContent.bindAggregation("items", {
						// 	path: '/ZAE_VH_BusinessPartner_03', //ZAE_I_PartnerForIntDept
						// 	template: oPartnerTemplate
						// 		//							filters: aFilter
						// });

						var oBillingDateInput = Fragment.byId("idChargeToDialog", "BillingRuleInput").getValue().split("(")[0];
						if (oBillingDateInput !== "11") {
							aFilter.push(new sap.ui.model.Filter("ServiceOrg", sap.ui.model.FilterOperator.Contains, pageData.service_org));
							oValueHelpDialogContent.bindAggregation("items", {
								path: '/ZAE_VH_BusinessPartner_03', //ZAE_I_PartnerForIntDept
								template: oPartnerTemplate
									//							filters: aFilter
							});
						} else {
							aFilter.push(new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, pageData.SalesOrganization));
							aFilter.push(new sap.ui.model.Filter("Make", sap.ui.model.FilterOperator.EQ, pageData.Make));
							oValueHelpDialogContent.bindAggregation("items", {
								path: '/ZAE_I_TC_SSOD_22', //ZAE_I_PartnerForIntDept
								template: oPartnerTemplate,
								filters: aFilter
							});
						}

					});
			} else {
				this._valueHelpDialog.open();
				var pageData = that.getView().getBindingContext().getObject();
				var aFilter = [];
				// aFilter.push(new sap.ui.model.Filter("ServiceOrg", sap.ui.model.FilterOperator.Contains, pageData.service_org));
				// this._valueHelpDialog.bindAggregation("items", {
				// 	path: '/ZAE_VH_BusinessPartner_03', //ZAE_I_PartnerForIntDept
				// 	template: oPartnerTemplate
				// 		//					filters: aFilter
				// });
				var oBillingDateInput = Fragment.byId("idChargeToDialog", "BillingRuleInput").getValue().split("(")[0];
				if (oBillingDateInput !== "11") {
					aFilter.push(new sap.ui.model.Filter("ServiceOrg", sap.ui.model.FilterOperator.Contains, pageData.service_org));
					oValueHelpDialogContent.bindAggregation("items", {
						path: '/ZAE_VH_BusinessPartner_03', //ZAE_I_PartnerForIntDept
						template: oPartnerTemplate
							//							filters: aFilter
					});
				} else {
					aFilter.push(new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, pageData.SalesOrganization));
					aFilter.push(new sap.ui.model.Filter("Make", sap.ui.model.FilterOperator.EQ, pageData.Make));
					oValueHelpDialogContent.bindAggregation("items", {
						path: '/ZAE_I_TC_SSOD_22', //ZAE_I_PartnerForIntDept
						template: oPartnerTemplate,
						filters: aFilter
					});
				}
			}
		},
		onClickSSOD_B73: function (oEvent) {
			var that = this;
			var selSecData = this.aeUtil.getSecData(that, "BDFacet");
			var link = "https://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=ZPROFORMA%20SO_VBELN-LOW=" +
				selSecData
				.BillingDocument + ";DYNP_OKCODE=#";
			window.open(link, '_blank');
		},
		onClickSSOD_B75: function (oEvent) {
			var that = this;
			var selSecData = this.aeUtil.getSecData(that, "BLFacet");
			var link = "https://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=ZINVOICE%20SO_VBELN-LOW=" +
				selSecData
				.BillingDocument + ";DYNP_OKCODE=#";
			window.open(link, '_blank');

		},
		onClickSSOD_B76: function (oEvent) {
			var that = this;
			var PageData = this.getView().getBindingContext().getObject();
			var oSalesOrder = {
				serviceDocGUID: PageData.ServiceDocumentUUID.toLocaleUpperCase().replaceAll("-", ""),
				serviceDocumentDate: PageData.ServiceDocCreationDateTime
			};
			that.oExtensionAPI = this;
			that.oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			that.onOpenChangeDocDialog(that, oEvent, oSalesOrder);
		},
		onClickSSOD_B78: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "CreditMemoRequest",
					action: "create"
				},
				// params: {
				//     "OutputControlApplicationObject": selSecData.BillingDocument.toString().padStart(10, '0')
				// }
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});
		},
		onOpenChangeDocDialog: function (that, oEvent, oBusinessObject) {
			this.sSalesDocumentId = oBusinessObject.serviceDocGUID;
			this.sCreationTime = oBusinessObject.serviceDocumentDate;
			var self = this;
			var Dialog = sap.ui.getCore().byId("ServiceOrderChangeDocDialog--ChangeDocDialog");
			if (!Dialog) {
				that.changeDocPromise = that.changeDocPromise || Fragment.load({
					id: "ServiceOrderChangeDocDialog",
					name: "sap.cus.sd.lib.slsdoc.manage.reuse.view.changeDoc",
					controller: that
				});

				that.changeDocPromise.then(function (dialog) {
					that.getView().addDependent(dialog);
					self._loadContent(that, dialog);
				});
			} else {
				that.getView().addDependent(Dialog);
				self._loadContent(that, Dialog);
			}
		},

		onChangeDocButtonClose: function (oEvent) {
			var that = this;
			var oDialog = oEvent.getSource().getParent();
			oDialog.close();
			that.getView().removeDependent(oDialog);
		},

		_getObjectById: function (sFragmentId, sElementId) {
			return sap.ui.core.Fragment.byId(sFragmentId, sElementId);
		},

		_loadContent: function (that, dialog) {
			var oLogContainer = this._getObjectById("ServiceOrderChangeDocDialog", "ChangeDocControlContainer");
			oLogContainer.setComponent(that.oComp);
			that.oComp.getObjectId()[0] = this.sSalesDocumentId;
			that.oComp.setStartDate(this.sCreationTime);
			that.oComp.stRefresh();
			dialog.open();
		},
		_pad: function (nParam, width, zParam) {
			var z = zParam || "0";
			var n = nParam + "";
			return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
		},
		onInitChangeDocs: function () {
			this.oComp = sap.ui.getCore().getComponent(sap.ui.core.Fragment.createId("ServiceOrderChangeDocDialog",
				"ChangeDocControlComponent"));
			if (this.oComp === undefined) {
				var oDate = new Date();
				oDate.setDate(1);
				oDate.setMonth(1);
				this.oComp = sap.ui.getCore().createComponent({
					name: "sap.nw.core.changedocs.lib.reuse.changedocscomponent",
					id: sap.ui.core.Fragment.createId("ServiceOrderChangeDocDialog", "ChangeDocControlComponent"),
					settings: {
						"objectClass": ["CRM_ORDER"],
						"objectId": [],
						"startDate": oDate,
						"stIsAreaVisible": true
					}
				});
				this.oComp.init();
			}
		},
		onClickSSOD_B77: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B77";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_ITEM_SPLIT_ESTSet";
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);

		},
		onClickSSOD_B79: function (oEvent) {

			var that = this;
			var oView = this.getView();
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "CDMRFacet");
			var actId = "SSOD_B79";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SALESDOC_CMPLT_BILLINGSet";
			var data = [{
				callProperty: "Vbeln",
				value: selSecData.SalesOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			var errFunc = function (oData, response) {
				this.aeUtil.refreshControlModel(oView);
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);

		},
		onClickSSOD_B80: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			var actId = "SSOD_B80";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.ChangeQuantity";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_CHANGE_QTYSet";
			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			} else {
				var dialogFields = [{
					fragInputId: "QtyInput",
					fragInputLabel: this.aeUtil.geti18nText(that, "QtyInput"),
					callProperty: "Quantity"
				}];
				var data = [{
					callProperty: "ObjectId",
					value: selSecData.ServiceOrder

				}, {
					callProperty: "NumberInt",
					value: selSecData.ServiceOrderOperation

				}];
				var checkFucc = function () {
					var vQty = Fragment.byId(actId + "Fragment", "QtyInput").getValue();
					if (vQty === "" || vQty === undefined) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "SELECT_Qty")
						};
					} else {
						return {
							pass: true
						};
					}
				}.bind(this);
				var succFunc = function (oData, response) {
					this.extensionAPI.refresh();
				}.bind(this);

				this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);
			}
		},
		onClickSSOD_B81: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			var actId = "SSOD_B81";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.ChangeQuantity";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_CHANGE_QTYSet";
			var dialogFields = [{
				fragInputId: "QtyInput",
				fragInputLabel: this.aeUtil.geti18nText(that, "QtyInput"),
				callProperty: "Quantity"
			}];

			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			} else {
				var data = [{
					callProperty: "ObjectId",
					value: selSecData.ServiceOrder

				}, {
					callProperty: "NumberInt",
					value: selSecData.ServiceOrderOperation

				}];
				var checkFucc = function () {
					var vQty = Fragment.byId(actId + "Fragment", "QtyInput").getValue();
					if (vQty === "" || vQty === undefined) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "SELECT_Qty")
						};
					} else {
						return {
							pass: true
						};
					}
				}.bind(this);
				var succFunc = function (oData, response) {
					this.extensionAPI.refresh();
				}.bind(this);

				this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

			}
		},

		onClickSSOD_B82: function (oEvent) {
			var that = this;
			that.oITFacetAddItemButton = oEvent.getSource();
			if (!that._oApprovalDecisionDialog) {
				Fragment.load({
					id: "ApprovalDecisionDialog",
					name: "com.globalintelli.zae_ssod.ext.fragment.ApprovalDecision",
					controller: {

						onChangeApprovalStatus: function (oEvent) {
							var oSelectedKey = oEvent.getParameter('selectedItem').getKey();
							var oPath = oEvent.getSource().getParent().oBindingContexts.mApprovalDec.getPath();
							if (oSelectedKey && oPath) {
								oEvent.getSource().getParent().oBindingContexts.mApprovalDec.getModel().setProperty(oPath + '/RejectionReason', '');
								oEvent.getSource().getParent().oBindingContexts.mApprovalDec.getModel().setProperty(oPath + '/ToServiceType', '');
								if (oSelectedKey === 'AP') {
									oEvent.getSource().getParent().oBindingContexts.mApprovalDec.getModel().setProperty(oPath + '/RejReasonEnabled', false);
									oEvent.getSource().getParent().oBindingContexts.mApprovalDec.getModel().setProperty(oPath + '/ToSrvTypeEnabled', false);
								} else if (oSelectedKey === 'RA') {
									oEvent.getSource().getParent().oBindingContexts.mApprovalDec.getModel().setProperty(oPath + '/RejReasonEnabled', false);
									oEvent.getSource().getParent().oBindingContexts.mApprovalDec.getModel().setProperty(oPath + '/ToSrvTypeEnabled', true);
								} else if (oSelectedKey === 'RJ') {
									oEvent.getSource().getParent().oBindingContexts.mApprovalDec.getModel().setProperty(oPath + '/RejReasonEnabled', true);
									oEvent.getSource().getParent().oBindingContexts.mApprovalDec.getModel().setProperty(oPath + '/ToSrvTypeEnabled', false);
									this.ReasonforRejection(oSelectedKey, oEvent);
								}
							}
							this.fnSubmitButonValidation();
						},
						ReasonforRejection: function (oSelectedKey, oEvent) {
							var self = this;
							var pageData = that.getView().getBindingContext().getObject();
							//	var selSecData = that.aeUtil.getSecData(that, "OPFacet");
							var aFilter = [];
							var ItemListTable = Fragment.byId("ApprovalDecisionDialog", "idAppDecTable");
							var oItems = ItemListTable.getAggregation("items");
							var RejectionReason;
							var oSource = oEvent.getSource();
							var oBindingContexts = oSource.getParent().oBindingContexts;
							var path = oBindingContexts["mApprovalDec"].getPath();
							var oWEModel = oBindingContexts["mApprovalDec"].getModel();
							var OEModelData = oWEModel.getData();
							var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
							var ServiceType = OEModelData.TableData[currentIndex].ServiceType;
							ServiceType = ServiceType.split("(")[0].trimEnd();
							aFilter.push(new sap.ui.model.Filter('SalesOffice', 'EQ', pageData.SalesOffice));
							aFilter.push(new sap.ui.model.Filter('ProcessType', 'EQ', pageData.process_type));
							//aFilter.push(new sap.ui.model.Filter('ServiceType', 'EQ', selSecData[currentIndex].MaintenanceOrderType));
							aFilter.push(new sap.ui.model.Filter('ServiceType', 'EQ', ServiceType));
							that.getView().getModel().read("/ZAE_I_TC_SSOD_OPR", {
								filters: aFilter,
								success: function (oData, response) {
									if (oData.results.length > 0) {
										RejectionReason = oItems[currentIndex].getAggregation("cells")[3].setSelectedKey(oData.results[0].ReasonforRejection);
									}
									self.fnSubmitButonValidation();
								}
							})
						},

						onDeletePress: function (oEvent) {
							var oSource = oEvent.getSource();
							var oBindingContexts = oSource.getParent().oBindingContexts;
							var path = oBindingContexts["mApprovalDec"].getPath();
							var oWEModel = oBindingContexts["mApprovalDec"].getModel();
							var OEModelData = oWEModel.getData();
							var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
							var filteredData = [];
							for (var i = 0; i < OEModelData.TableData.length; i++) {
								if (currentIndex != i) {
									filteredData.push(OEModelData.TableData[i]);
								}
							}
							OEModelData.TableData = filteredData;
							oWEModel.updateBindings(true);
							this.fnSubmitButonValidation();

						},

						fnSubmitButonValidation: function (oEvent) {

							var ItemListTable = Fragment.byId("ApprovalDecisionDialog", "idAppDecTable");
							var oItems = ItemListTable.getAggregation("items");
							var BoolPendingIP = false;
							var boolDataExist = false;
							for (var i = 0; i < oItems.length; i++) {
								var ApprovalSts = oItems[i].getAggregation("cells")[2].getSelectedKey();
								var RejReason = oItems[i].getAggregation("cells")[3].getSelectedKey();
								var ToServiceType = oItems[i].getAggregation("cells")[4].getSelectedKey();
								if (ApprovalSts) {
									boolDataExist = true;
									if (ApprovalSts === 'AP') {
										BoolPendingIP = false;
									} else if (ApprovalSts === 'RA') {
										if (ToServiceType !== undefined && ToServiceType !== null && ToServiceType !== '') {
											BoolPendingIP = false;
										} else {
											BoolPendingIP = true;
										}
									} else if (ApprovalSts === 'RJ') {
										if (RejReason !== undefined && RejReason !== null && RejReason !== '') {
											BoolPendingIP = false;
										} else {
											BoolPendingIP = true;
										}
									}
								}
							}
							Fragment.byId("ApprovalDecisionDialog", "BTNSubmit").setEnabled(boolDataExist ? !BoolPendingIP : false);
						},

						onReset: function () {
							that._initAppDecTableDialog("RESET");
						},
						onSubmit: function () {
							var actId = "SSOD_B82";
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var ItemListTable = Fragment.byId("ApprovalDecisionDialog", "idAppDecTable");
							var oItems = ItemListTable.getAggregation("items");
							var oModel = that.getView().getModel();
							var oEntity = "SSOD_APPROVAL_HEADER_DATASet";
							var pageData = that.getView().getBindingContext().getObject();
							var mServiceOrderOperation = that.getView().getModel("mApprovalDec");
							var oServiceOrderItemData = mServiceOrderOperation.getData();
							var NavMain = [{
								"ServiceOrder": pageData.ServiceOrder
							}];
							var NavItems = [];
							for (var i = 0; i < oServiceOrderItemData.TableData.length; i++) {
								if (oServiceOrderItemData.TableData[i].ApprovalStatus) {
									var obj = {},
										oTabData;
									oTabData = oServiceOrderItemData.TableData[i];
									obj["NumberInt"] = oTabData.Operation;
									obj["AprvStatus"] = oTabData.ApprovalStatus;
									obj["Rejection"] = oTabData.RejectionReason;
									obj["ServiceType"] = oTabData.ToServiceType;
									NavItems.push(obj);
								}
							}

							var data = [{
								callProperty: "N_SSOD_APPROVAL_HEADER_DATA",
								value: NavMain
							}, {
								callProperty: "N_SSOD_APPROVAL_ITEM_DATA",
								value: NavItems
							}];
							var succFunc = function (oData, response) {
								that.aeUtil.refreshControlModel(that.oITFacetAddItemButton);
								that.getView().getModel().refresh(true);
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
							that._oApprovalDecisionDialog.close();
						},

						onCancel: function () {
							that._oApprovalDecisionDialog.close();
						}
					}
				}).then(function (oValueHelpDialogContent) {
					that._oApprovalDecisionDialog = oValueHelpDialogContent;
					that.getView().addDependent(that._oApprovalDecisionDialog);
					that._initAppDecTableDialog("INIT");
				});
			} else {
				that._initAppDecTableDialog("INIT");
			}
		},
		_initAppDecTableDialog: function (form) {
			var that = this;
			Fragment.byId("ApprovalDecisionDialog", "BTNSubmit").setEnabled(false);
			var oTableID = this.createId("OPFacet::responsiveTable");
			var oItems = this.getView().byId(oTableID).getSelectedItems();
			var oDataInitial = {
				TableData: []
			};
			oItems.forEach(function (oItem) {
				var oItemObj = oItem.getBindingContext().getObject();
				if (oItemObj.MaintenanceOrderType !== null && oItemObj.MaintenanceOrderType !== undefined && oItemObj.MaintenanceOrderType !==
					"") {
					oDataInitial.TableData.push({
						Operation: oItemObj.ServiceOrderOperation,
						ServiceType: oItemObj.MaintenanceOrderType + "( " + oItemObj.ServiceTypeLongText + " )",
						ApprovalStatus: "",
						RejectionReason: "",
						ToServiceType: "",
						RejReasonEnabled: false,
						ToSrvTypeEnabled: false
					});
				}
			});
			var oJSONModel = new JSONModel(jQuery.extend(true, {}, oDataInitial));
			that.getView().setModel(oJSONModel, "mApprovalDec");
			oJSONModel.updateBindings(true);

			var pageData = that.getView().getBindingContext().getObject();
			var aFiltersApp = [];
			aFiltersApp.push(new Filter('SalesOffice', 'EQ', pageData.SalesOffice));
			aFiltersApp.push(new Filter('SalesGroup', 'EQ', pageData.SalesGroup));
			aFiltersApp.push(new Filter('ProcessType', 'EQ', pageData.ServiceDocumentType));
			var ItemListTable = Fragment.byId("ApprovalDecisionDialog", "idAppDecTable");
			oItems = ItemListTable.getAggregation("items");
			if (oItems) {
				for (var i = 0; i < oItems.length; i++) {
					oItems[i].getCells()[4].getBinding('items').filter(aFiltersApp);
				}
			}

			if (form === "INIT") {
				this._oApprovalDecisionDialog.open();
			}

		},

		onClickSSOD_B83: function (oEvent) {
			var that = this;
			var oView = that.getView();
			var pageData = oView.getBindingContext().getObject();
			var aFilter = [];
			aFilter.push(new sap.ui.model.Filter('TransactionType', sap.ui.model.FilterOperator.EQ, pageData.ServiceDocumentType));
			aFilter.push(new sap.ui.model.Filter('Make', sap.ui.model.FilterOperator.EQ, pageData.Make));
			oView.setBusy(true);
			oView.getModel().read("/ZAE_I_ClaimTransaction", {
				filters: aFilter,
				success: function (oData, response) {
					oView.setBusy(false);
					if (oData.results.length > 0) {
						var oClaimTransaction = oData.results[0];
						var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
						var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
							target: {
								semanticObject: oClaimTransaction.TransactionCode,
								action: "aeDisplay"
							}
						})) || "";
						var url = window.location.href.split('#')[0] + hash;
						sap.m.URLHelper.redirect(url, true);
					}

				},
				error: function (error) {
					oView.setBusy(false);
				}
			});

			/*var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "CreditMemoRequest",
					action: "create"
				}, 
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});*/

		},
		onClickSSOD_B84: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			var actId = "SSOD_B84";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.AddEditSeverity";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_ADD_EDIT_SEVERITYSet";
			var dialogFields = [{
				fragInputId: "SeverityIn",
				fragInputLabel: this.aeUtil.geti18nText(that, "SeverityIn"),
				vhEntitySet: "ZAE_VH_SEVERITY",
				vhSearchKey: "Severity",
				vhSearchText: "Description",
				callProperty: "Severity"
			}];
			var data = [{
				callProperty: "ObjectId",
				value: selSecData.ServiceOrder
			}, {
				callProperty: "NumberInt",
				value: selSecData.ServiceOrderOperation
			}, {
				callProperty: "Severity",
				value: selSecData.Severity
			}];
			var checkFucc = function () {
				return {
					pass: true
				};
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

		},
		onClickSSOD_B85: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			var actId = "SSOD_B85";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.AddEditSeverity1";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_ADD_EDIT_SEVERITYSet";
			var dialogFields = [{
				fragInputId: "SeverityIn",
				fragInputLabel: this.aeUtil.geti18nText(that, "SeverityIn"),
				vhEntitySet: "ZAE_VH_SEVERITY",
				vhSearchKey: "Severity",
				vhSearchText: "Description",
				callProperty: "Severity"
			}];
			var data = [{
				callProperty: "ObjectId",
				value: selSecData.ServiceOrder
			}, {
				callProperty: "NumberInt",
				value: selSecData.ServiceOrderOperation
			}, {
				callProperty: "Severity",
				value: selSecData.Severity
			}];
			var checkFucc = function () {
				return {
					pass: true
				};
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

		},
		onClickSSOD_B86: function (oEvent) {
			var that = this;
			var oView = this.getView();
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			if (selSecData instanceof Array) {
				var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("MultipleNotAllowed");
				sap.m.MessageBox.error(msg1);
				return;
			}
			var actId = "SSOD_B86";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_REMOVE_BILL_BLOCKSet";
			var data = [{
				callProperty: "Serviceorder",
				value: selSecData.ServiceOrder
			}, {
				callProperty: "NumberInt",
				value: selSecData.ServiceOrderOperation
			}];
			var succFunc = function (oData, response) {
				this.aeUtil.refreshControlModel(oView);
			}.bind(this);
			var errFunc = function (oData, response) {
				this.aeUtil.refreshControlModel(oView);
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);
		},
		onClickSSOD_B87: function (oEvent) {
			var that = this;
			var oView = this.getView();
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			if (selSecData instanceof Array) {
				var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("MultipleNotAllowed");
				sap.m.MessageBox.error(msg1);
				return;
			}
			var actId = "SSOD_B87";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_REMOVE_BILL_BLOCKSet";
			var data = [{
				callProperty: "Serviceorder",
				value: selSecData.ServiceOrder
			}, {
				callProperty: "NumberInt",
				value: selSecData.ServiceOrderOperation
			}];
			var succFunc = function (oData, response) {
				this.aeUtil.refreshControlModel(oView);
			}.bind(this);
			var errFunc = function (oData, response) {
				this.aeUtil.refreshControlModel(oView);
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);
		},
		onClickSSOD_B88: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			if (selSecData instanceof Array) {
				var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("MultipleNotAllowed");
				sap.m.MessageBox.error(msg1);
				return;
			}
			var actId = "SSOD_B88";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.UpdateBillingBlockOP";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_UPD_BILLIING_BLOCKSet";
			var dialogFields = [{
				fragInputId: "BillingBlock",
				fragInputLabel: this.aeUtil.geti18nText(that, "BillingBlock"),
				vhEntitySet: "ZAE_VH_BillingBlockReason",
				vhSearchKey: "BillingBlockReason",
				vhSearchText: "BillingBlockReasonDescription",
				callProperty: "BillingBlock"
			}];
			var data = [{
				callProperty: "Serviceorder",
				value: selSecData.ServiceOrder
			}, {
				callProperty: "NumberInt",
				value: selSecData.ServiceOrderOperation
			}];
			var checkFucc = function () {
				return {
					pass: true
				};
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);
		},
		onClickSSOD_B89: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			if (selSecData instanceof Array) {
				var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("MultipleNotAllowed");
				sap.m.MessageBox.error(msg1);
				return;
			}
			var actId = "SSOD_B89";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.UpdateBillingBlockCP";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_UPD_BILLIING_BLOCKSet";
			var dialogFields = [{
				fragInputId: "BillingBlock",
				fragInputLabel: this.aeUtil.geti18nText(that, "BillingBlock"),
				vhEntitySet: "ZAE_VH_BillingBlockReason",
				vhSearchKey: "BillingBlockReason",
				vhSearchText: "BillingBlockReasonDescription",
				callProperty: "BillingBlock"
			}];
			var data = [{
				callProperty: "Serviceorder",
				value: selSecData.ServiceOrder
			}, {
				callProperty: "NumberInt",
				value: selSecData.ServiceOrderOperation
			}];
			var checkFucc = function () {
				return {
					pass: true
				};
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);
		},
		onClickSSOD_B90_old: function (oEvent) {
			var input = oEvent.getSource();
			var cachedScriptPromises = {};
			var oModel = this.getView().getModel("mNotes").getData();
			oModel.ConcatinatedCategorizationSchemaTreeTableData = [];
			var pageData = this.getView().getBindingContext().getObject();
			var aFilters = [],
				that = this;
			aFilters.push(new Filter("Equipment", "EQ", pageData.Equipment));
			var oSet = "/GET_SCHEMA_HEADER_DATASet";
			var oPostDataObj = {
				GET_SCHEMA_INPUT: [{
					Equipment: pageData.Equipment,
					Plant: pageData.ServiceOrganization
				}],
				GET_SCHEMA_OUTPUT: []
			};
			input.setBusy(true);

			this.getView().getModel().create(oSet, oPostDataObj, {
				success: function (oData, response) {

					if (oData.GET_SCHEMA_OUTPUT.results.length > 0) {
						that.getView().getModel().read("/ZAE_I_Equipment", {
							filters: aFilters,
							success: function (oData1, response1) {
								if (oData1.results.length > 0) {
									var EquiData = oData1.results[0];
									for (var i = 0; i < oData.GET_SCHEMA_OUTPUT.results.length; i++) {
										var SchemaID = oData.GET_SCHEMA_OUTPUT.results[i].Schemaid;
										var vCatSchemaReasolveCount = 0;
										cachedScriptPromises[SchemaID] = $.Deferred(function (defer) {
											that.getView().getModel().read("/ZAE_I_CategorizationSchema", {
												urlParameters: {
													"$filter": "asp_id  eq \'" + SchemaID + "\'",
													"$orderby": "cat_id"
												},
												success: function (oData2, response2) {
													if (oData2.results.length > 0) {
														var oSchemaID = oData2.results[0].asp_id;
														var flatData = that.aeUI5Util.genParentIdWithDiv(oData2.results, "cat_id", "parentId", "_", 1);
														var tableData = that.treeFunctions.convertFlatToTree(flatData, "cat_id", "parentId", oSchemaID);
														var FilteredTreeTableData = that.treeFunctions.filterTreeData(tableData, oSchemaID + "_S",
															EquiData.ContractStatusCode);
														oModel.ConcatinatedCategorizationSchemaTreeTableData = oModel.ConcatinatedCategorizationSchemaTreeTableData
															.concat(
																FilteredTreeTableData);
														that.fnProcessCatSchema(input, oModel.ConcatinatedCategorizationSchemaTreeTableData);
													}

												},
												error: function () {
													defer.resolve();
													input.setBusy(false);
												}
											}).promise();

											cachedScriptPromises[SchemaID].done(function () {
												vCatSchemaReasolveCount++;
												if (Object.keys(cachedScriptPromises).length === vCatSchemaReasolveCount) {

													that.fnProcessCatSchema(input, oModel.ConcatinatedCategorizationSchemaTreeTableData);
												}
											});

										});

									}
								}
							},
							error: function (oError) {

								input.setBusy(false);
							}

						});

					} else {
						var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("CategorizationSchemaNotavailable");
						sap.m.MessageToast.show(msg1);
					}

				},
				error: function (oError) {}
			});

		},

		onClickSSOD_B90: function (oEvent) {
			var cachedScriptPromises = {};
			var that = this;
			var input = oEvent.getSource();
			var oModel = this.getView().getModel("mNotes").getData();
			var pageData = this.getView().getBindingContext().getObject();
			var vEquip = pageData.Equipment;
			var vPlant = pageData.ServiceOrganization;
			var oSet = "/GET_SCHEMA_HEADER_DATASet";
			var oPostDataObj = {
				GET_SCHEMA_INPUT: [{
					Equipment: vEquip,
					Plant: vPlant
				}],
				GET_SCHEMA_OUTPUT: []
			};
			input.setBusy(true);
			this.getView().getModel().create(oSet, oPostDataObj, {
				success: function (oData, response) {

					if (oData.GET_SCHEMA_OUTPUT.results.length > 0) {
						var aFilter = [];
						aFilter.push(new sap.ui.model.Filter({
							path: "Equipment",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: vEquip
						}));
						that.getView().getModel().read("/ZAE_I_Equipment_04", {
							filters: aFilter,
							urlParameters: {
								$expand: ["to_ServiceContractNew", "to_ServiceContractNew/to_Item_01", "to_EquipmentRecall",
									// "to_SmartServiceContract"
								]
							},
							success: function (oData1, response1) {
								var oEquipmentData = {};
								if (oData1.results.length > 0) {
									oEquipmentData = oData1.results[0];
								}
								for (var i = 0; i < oData.GET_SCHEMA_OUTPUT.results.length; i++) {
									var SchemaID = oData.GET_SCHEMA_OUTPUT.results[i].Schemaid;
									var vCatSchemaReasolveCount = 0;
									var FilteredTreeTableData = [];
									oModel.ConcatinatedCategorizationSchemaTreeTableData = [];
									cachedScriptPromises[SchemaID] = $.Deferred(function (defer) {
										that.getView().getModel().read("/ZAE_I_CategorizationSchema_01", {
											urlParameters: {
												"$filter": "asp_id  eq \'" + SchemaID + "\'",
												"$orderby": "cat_id"
											},
											success: function (oData2, response2) {
												if (oData2.results.length > 0) {
													var oSchemaID = oData2.results[0].asp_id;
													var flatData = that.aeUI5Util.genParentIdWithDiv(oData2.results, "cat_id", "parentId", "_", 1);
													var tableData = that.treeFunctions.convertFlatToTree(flatData, "cat_id", "parentId", oSchemaID);
													var oServiceContract = oEquipmentData.to_ServiceContractNew.results[0];
													/*if (oEquipmentData.to_EQUIPMENTCURRCONTSTS.ContractStatusCode === "CTIN" && oServiceContract &&
														oServiceContract.to_Item.results.length > 0 && oServiceContract.to_Item.results[0].Material) {
														var Material = oServiceContract.to_Item.results[0].Material;
														FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S", oEquipmentData
															.to_EQUIPMENTCURRCONTSTS.ContractStatusCode, Material);
													}*/

													// var aFilterCode = ["UPSL"];
													// if (oEquipmentData.to_EQUIPMENTCURRCONTSTS.ContractStatusCode === "CTIN" && oServiceContract &&
													// 	oServiceContract.to_Item.results.length > 0 && oServiceContract.SrviceSchemaQualifier === "CTIN" &&
													// 	oServiceContract.to_Item.results[0].Material) {
													// 	var Material = oServiceContract.to_Item.results[0].Material;
													// 	aFilterCode.push("CTIN");
													// 	if (oEquipmentData.to_ServiceContract01.results.length > 0) {
													// 		aFilterCode.push(oEquipmentData.to_ServiceContract01.results[0].SrviceSchemaQualifier);
													// 	}
													// 	FilteredTreeTableData = that.treeFunctions.filterTreeData(tableData, oSchemaID + "_S", aFilterCode, Material);
													// }

													// /*else {
													// 	FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S",
													// 		"CTOT");
													// }*/
													// else {
													// 	aFilterCode.push("CTOT");
													// 	if (oEquipmentData.to_ServiceContract01.results.length > 0) {
													// 		aFilterCode.push(oEquipmentData.to_ServiceContract01.results[0].SrviceSchemaQualifier);
													// 	}
													// 	FilteredTreeTableData = that.treeFunctions.filterTreeData(tableData, oSchemaID + "_S",
													// 		aFilterCode);
													// }
													var inContractNodes = flatData.filter((iC) => iC.CatIDType !== "").map((iM) => iM.cat_id);
													var openInContractNodes = [];
													var ESTOnodes = flatData.filter((iC) => ((iC.CatIDType === "REPR") && (iC.CatIDCategory === '18' || iC.CatIDCategory ===
														'11' || iC.CatIDCategory === '12' || iC.CatIDCategory === '26'))).map((iM) => iM.cat_id);
													inContractNodes.forEach((cn) => {
														const nodeIds = cn.split('_');
														for (let i = 1; i <= nodeIds.length + 1; i++) {
															const tempId = nodeIds.slice(0, i).join('_');
															if (!openInContractNodes.includes(tempId)) {
																openInContractNodes.push(tempId);
															}
														}
													})
													if (oEquipmentData.ConcatenatedActiveSystStsName.search("ESTO") !== -1) {
														var aShowNodes = [{
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "18"
														}, {
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "11"
														}, {
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "12"
														}, {
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "26"
														}];
														FilteredTreeTableData = that.filterTreeESTOData(tableData, aShowNodes, ESTOnodes, flatData);
														tableData = FilteredTreeTableData;
													}
													var aHideNodes = [];
													if (oEquipmentData.ConcatenatedActiveSystStsName.search("ECUS") !== -1) {
														aHideNodes.push({
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "18"
														});
													}
													if (oEquipmentData.ContractStatus_new === "CTIN" && oServiceContract &&
														oServiceContract.to_Item_01.results.length > 0 && oServiceContract.SrviceSchemaQualifier === "CTIN" &&
														oServiceContract.to_Item_01.results[0].Material) {
														// var Material = oServiceContract.to_Item.results[0].Material;
														var Material = oServiceContract.SalesContractType === 'ZUMC' ? oServiceContract.to_Item_01.results[0].ReferenceMaterial :
															oServiceContract.to_Item_01.results[0].Material;
														aHideNodes.push({
															SrviceSchemaQualifier: "CTOT",
															CatIDCategory: ""
														});
														if (oServiceContract.CatIDCategory) {
															aHideNodes.push({
																SrviceSchemaQualifier: "CTIN",
																CatIDCategory: Number(oServiceContract.CatIDCategory) === 1 ? "2" : "1"
															});
														}
														FilteredTreeTableData = that.treeFunctions.filterTreeData(tableData, oSchemaID + "_S", aHideNodes, Material,
															openInContractNodes,
															flatData);
													} else {
														aHideNodes.push({
															SrviceSchemaQualifier: "CTIN",
															CatIDCategory: ""
														});
														FilteredTreeTableData = that.treeFunctions.filterTreeData(tableData, oSchemaID + "_S", aHideNodes, Material,
															openInContractNodes,
															flatData);
													}

													//***recal filter *//
													// if (oEquipmentData.to_EquipmentRecall.results.length > 0) {
													var oRecalList = oEquipmentData.to_EquipmentRecall.results;
													FilteredTreeTableData = that.filterTreeRecallData(FilteredTreeTableData, oRecalList);
													// }

													if (oServiceContract) {
														if (oServiceContract.to_Item_01.results[0].MaterialFrom && oServiceContract.to_Item_01.results[0].MaterialTo) {
															FilteredTreeTableData = that.filterTreeMaterialKM(FilteredTreeTableData, oServiceContract);
														}
													}
													oModel.ConcatinatedCategorizationSchemaTreeTableData = oModel.ConcatinatedCategorizationSchemaTreeTableData.concat(
														FilteredTreeTableData);
												}
												defer.resolve();
											},
											error: function () {
												defer.resolve();
												input.setBusy(false);
											}
										});
									}).promise();

									cachedScriptPromises[SchemaID].done(function () {
										input.setBusy(false);
										vCatSchemaReasolveCount++;
										if (Object.keys(cachedScriptPromises).length === vCatSchemaReasolveCount) {
											if (oModel.ConcatinatedCategorizationSchemaTreeTableData.length === 0) {
												var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("CategorizationSchemaNotavailable");
												sap.m.MessageToast.show(msg1);
											} else {
												that.fnProcessCatSchema_AddItemFromTem(input, oModel.ConcatinatedCategorizationSchemaTreeTableData);
											}

										}
									});

								}

							},
							error: function (oError) {
								input.setBusy(false);
							}

						});

					} else {
						var msg = this.getView().getModel("i18n").getResourceBundle().getText("CategorizationSchemaNotavailable");
						sap.m.MessageToast.show(msg);
						input.setBusy(false);
					}

				},
				error: function (oError) {
					input.setBusy(false);
				}
			});

		},
		fnProcessCatSchema_AddItemFromTem: function (input, FilteredTreeTableData) {
			input.setBusy(false);
			var that = this;
			var keyCol = "cat_id";
			var valueCol = "cat_label";
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.CategoryTreeDialogValueHelp";
			var actId = "SSOD_B90";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var pageData = that.getView().getBindingContext().getObject();
			var oModel = this.getView().getModel();
			var inputId = input.getId();
			var oEntity = "ZAE_FM_SSWE_ADD_ITEM_FRM_TEMPSet";
			var checkFucc = function (SelectedContexts) {
				var pageData = that.getView().getBindingContext().getObject();
				var vCompCode = Fragment.byId(inputId + "TreeVHFragment", "CompCode").getSelectedKey();
				if (pageData.ComplainCode) {
					Fragment.byId(inputId + "TreeVHFragment", "CompCode").setRequired(true);
					if (vCompCode === "" || vCompCode === undefined) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "SEL_COMP"),
							type: "Error"
						};
					} else {
						return {
							pass: true
						};
					}
				} else {
					Fragment.byId(inputId + "TreeVHFragment", "CompCode").setRequired(false);
				}
				if (SelectedContexts.length > 0) {
					return {
						pass: true
					};
				} else {
					return {
						pass: false,
						msg: that.aeUtil.geti18nText(that, "TREE_TABLE_SELECTION"),
						type: "Error"
					};
				}

			}.bind(this);
			var submitFunc = function (SelectedList) {
				var pageData = that.getView().getBindingContext().getObject();
				var vCompCode = Fragment.byId(inputId + "TreeVHFragment", "CompCode").getSelectedKey();
				var NavMain = [{
					"WorkEstimate": pageData.ServiceOrder,
					"CompCode": vCompCode
				}];
				var NavCatid = [];
				SelectedList.forEach(function (obj) {
					NavCatid.push({
						"Catid": obj.cat_id
					});
				});
				var data = [{
					callProperty: "NavMain",
					value: NavMain
				}, {
					callProperty: "NavCatid",
					value: NavCatid
				}];
				var succFunc = function (oData, response) {
					oModel.refresh();
				}.bind(this);
				this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);

			}.bind(this);

			that.treeFunctions.handleTreeValueHelp(that, input, fragName, keyCol, valueCol, FilteredTreeTableData, checkFucc, submitFunc);
		},
		// filterTreeRecallData: function (data, oRecallList) {
		// 	var tData = data;
		// 	if (tData && tData.length > 0) {
		// 		var RecallFilter = function (d) {
		// 			var boolRecallFound = 0;
		// 			d.forEach(function (o) {
		// 				var tO = o;
		// 				for (var i = 0; i < oRecallList.length; i++) {
		// 					// if (tO.cat_id == oRecallList[i].ExtRecallNo && oRecallList[i].ServiceOrder ==="") {
		// 					if (tO.cat_id === oRecallList[i].ExtRecallNo && oRecallList[i].ServiceOrder !== "" && oRecallList[i].MaintenanceOrder !==
		// 						"" &&
		// 						oRecallList[i].SystemStatus.includes("TECO")) {
		// 						tO["Status"] = "TECO";
		// 					} else if (tO.cat_id === oRecallList[i].ExtRecallNo && tO["Status"] !== "TECO") {
		// 						boolRecallFound = boolRecallFound + 1;
		// 						tO["ValidFrom"] = oRecallList[i].ValidFrom;
		// 						tO["ValidTo"] = oRecallList[i].ValidTo;
		// 						tO["Info"] = oRecallList[i].Info;
		// 					}
		// 				}
		// 			});
		// 			return boolRecallFound > 0;
		// 		};

		// 		var filterFunc = function (d) {
		// 			return d.filter(function (o) {
		// 				var tO = o;
		// 				if (tO.children) {
		// 					tO.children = filterFunc(tO.children);
		// 				}
		// 				if (tO.cat_id.slice(-4) === "S_RC") {
		// 					return RecallFilter(tO.children);
		// 				}
		// 				return d;
		// 			});

		// 		};

		// 		tData = filterFunc(tData);
		// 	}
		// 	return tData;
		// },

		filterTreeRecallData: function (data, oRecallList) {
			var tData = data;
			if (tData && tData.length > 0) {
				var RecallFilter = function (d) {
					return d.filter(function (o) {
						var boolRecallFound = 0;
						var tO = o;
						for (var i = 0; i < oRecallList.length; i++) {
							// if (tO.cat_id == oRecallList[i].ExtRecallNo && oRecallList[i].ServiceOrder ==="") {
							if (tO.cat_id === oRecallList[i].ExtRecallNo && oRecallList[i].ServiceOrder !== "" && oRecallList[i].MaintenanceOrder !==
								"" &&
								oRecallList[i].SystemStatus.includes("TECO")) {
								tO["Status"] = "TECO";
							} else if (tO.cat_id === oRecallList[i].ExtRecallNo && tO["Status"] !== "TECO") {
								boolRecallFound = boolRecallFound + 1;
								tO["ValidFrom"] = oRecallList[i].ValidFrom;
								tO["ValidTo"] = oRecallList[i].ValidTo;
								tO["Info"] = oRecallList[i].Info;
							}
						}
						return boolRecallFound > 0;
					});
				};

				var filterFunc = function (d) {
					return d.filter(function (o) {
						var tO = o;
						if (tO.children) {
							tO.children = filterFunc(tO.children);
						}
						if (tO.cat_id.slice(-4) === "S_RC") {
							var rChildren = RecallFilter(tO.children);
							tO.children = rChildren;
							return rChildren.length > 0;
						}
						return d;
					});

				};

				tData = filterFunc(tData);
			}
			return tData;
		},

		filterTreeESTOData: function (data, ShowNodes, inContractNodes, flatData) {
			var tData = data;
			if (tData && tData.length > 0) {
				var inContractFilter = function (cat_id) {
					var count = 0;
					inContractNodes.forEach((iC) => {
						if (iC === cat_id) {
							count = count + 1;
						}
					});
					return count > 0;
				}
				var filterFunc = function (d) {
					return d.filter(function (o) {
						var tO = o;
						var temp = tO.cat_id;
						if (tO.children) {
							tO.children = filterFunc(tO.children);
						}
						var showNode = false;
						for (var i = 0; i < ShowNodes.length; i++) {
							if (ShowNodes[i].CatIDCategory === tO.CatIDCategory && ShowNodes[i].SrviceSchemaQualifier === tO.CatIDType) {
								showNode = true;
							} else if (!tO.CatIDCategory) {
								showNode = true;
							}
						}
						if (showNode === false && inContractFilter(tO.cat_id)) {
							return true;
						}

						return showNode
					});
				};

				tData = filterFunc(tData);
			}
			return tData;
		},

		// filterTreeMaterialKM: function (aTreeData, oServiceCOntract) {
		// 	function recursive(Array, boolCTINCTOT) {
		// 		var i = 0;
		// 		var filtArray = [];
		// 		var BoolFilterArray = false;
		// 		while (i < Array.length) {
		// 			if (Array[i].children && Array[i].children.length > 0) {
		// 				if (Array[i].cat_desc === "CTIN" || Array[i].children && Array[i].cat_desc === "CTOT" || boolCTINCTOT) {
		// 					Array[i].children = recursive(Array[i].children, true);
		// 				} else {
		// 					Array[i].children = recursive(Array[i].children);
		// 				}
		// 			} else if (boolCTINCTOT) {
		// 				BoolFilterArray = true;
		// 				var BoolStartingKMS = false;
		// 				var BoolEndingKMS = false;
		// 				Array.sort((a, b) => {
		// 					return Number(a.cat_sequence) - Number(b.cat_sequence);
		// 				});
		// 				filtArray = Array.filter(function (o) {
		// 					var tO = o;
		// 					if (oServiceCOntract.to_Item.results && oServiceCOntract.to_Item.results.length > 0 && tO.Material === oServiceCOntract.to_Item
		// 						.results[0].MaterialFrom) {
		// 						BoolStartingKMS = true;
		// 						return true;
		// 					} else if (oServiceCOntract.to_Item.results && oServiceCOntract.to_Item.results.length > 0 && tO.Material ===
		// 						oServiceCOntract.to_Item.results[0].MaterialTo) {
		// 						BoolEndingKMS = true;
		// 						return true;
		// 					} else if (BoolStartingKMS && BoolEndingKMS === false) {
		// 						return true;
		// 					} else {
		// 						return false;
		// 					}
		// 				});
		// 			}
		// 			i++;
		// 		}
		// 		if (BoolFilterArray) {
		// 			Array = filtArray;
		// 		}
		// 		return Array;
		// 	}

		// 	return recursive(aTreeData);
		// },
		filterTreeMaterialKM: function (aTreeData, oServiceCOntract) {
			function recursive(Array, boolCTINCTOT) {
				var i = 0;
				var filtArray = [];
				var BoolFilterArray = false;
				while (i < Array.length) {
					if (Array[i].children && Array[i].children.length > 0) {
						if (Array[i].cat_desc === "CTIN" || Array[i].children && Array[i].cat_desc === "CTOT" || boolCTINCTOT) {
							Array[i].children = recursive(Array[i].children, true);
						} else {
							Array[i].children = recursive(Array[i].children);
						}
					} else if (boolCTINCTOT) {
						BoolFilterArray = true;
						filtArray = Array.filter(function (o) {
							var tO = o;
							if (tO.msitem && oServiceCOntract.to_Item_01.results && oServiceCOntract.to_Item_01.results.length > 0) {
								var msitem = tO.msitem.replace(/[^0-9.]+/g, "");
								msitem = parseFloat(msitem);
								if (isNaN(msitem)) {
									msitem = 0;
								}
								var FromMsItem = oServiceCOntract.to_Item_01.results[0].FromMsItem.replace(/[^0-9.]+/g, "");
								var ToMsItem = oServiceCOntract.to_Item_01.results[0].ToMsItem.replace(/[^0-9.]+/g, "");
								if (FromMsItem && ToMsItem && msitem >= parseFloat(FromMsItem) && msitem <= parseFloat(ToMsItem)) {
									return true;
								} else {
									return false;
								}
							} else {
								return false;
							}
						});
					}
					i++;
				}
				if (BoolFilterArray) {
					Array = filtArray;
				}
				return Array;
			}

			return recursive(aTreeData);
		},
		onClickSSOD_B91: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			var actId = "SSOD_B91";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.EditOpDesc";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SC_EDIT_OP_DESCSet";
			var oLocalModel = new JSONModel();
			oLocalModel.setData({
				OpDesc: selSecData.OperationDescription
			});
			this.getView().setModel(oLocalModel, "mOpDesc");
			if (selSecData instanceof Array) {
				sap.m.MessageBox.error("Please select single operation");
				return;
			}
			var dialogFields = [{
				fragInputId: "OPDescInput",
				fragInputLabel: this.aeUtil.geti18nText(that, "OPDescInput"),
				callProperty: "OpDesc"
			}];
			var data = [{
				callProperty: "ObjectId",
				value: selSecData.ServiceOrder
			}, {
				callProperty: "NumberInt",
				value: selSecData.ServiceOrderOperation
			}];
			var checkFucc = function () {
				return {
					pass: true
				};

			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
				this.getView().getModel().refresh(true);
			}.bind(this);

			/*if (Fragment.byId(actId + "Fragment", "OPDescInput")){
				Fragment.byId(actId + "Fragment", "OPDescInput").getParent().destroy();
			}*/

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, succFunc);
		},
		onClickSSOD_B92: function (oEvent) {
			var pageData = this.getView().getBindingContext().getObject();
			var that = this;
			var link = "https://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=ZSRV_REWRK%20S_EQUNR-LOW=" + pageData.Equipment +
				";S_AUART-LOW=" + pageData.ServiceDocumentType + ";S_DOCNO-LOW=" + pageData.ServiceOrder + ";DYNP_OKCODE=#";
			window.open(link);

		},
		onClickSSOD_B93: function (oEvent) {
			var pageData = this.getView().getBindingContext().getObject();
			var selSecData = this.aeUtil.getSecData(this, "CPFacet");
			var that = this;
			var link = "https://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=ZSRV_PRT_WRNTY%20S_AUART-LOW=" + pageData
				.ServiceDocumentType +
				";S_DOCNO-LOW=" + pageData.ServiceOrder + ";S_MATNR-LOW=" + selSecData.OriginallyRequestedProduct + ";S_EQUNR-LOW=" + pageData.Equipment +
				";DYNP_OKCODE=#";
			window.open(link);

		},
		onClickSSOD_B95: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			var actId = "SSOD_B95";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.ApplyDiscount";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SC_AI_CHANGESet";
			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			} else {
				var dialogFields = [{
					fragInputId: "AccIndicatorInput",
					fragInputLabel: this.aeUtil.geti18nText(that, "AccIndicatorInput"),
					vhEntitySet: "ZAE_I_BillableControlText",
					vhSearchKey: "BillableControl",
					vhSearchText: "BillableControlName",
					callProperty: "AcIndicator"
				}];
				var data = [{
					callProperty: "ObjectId",
					value: selSecData.ServiceOrder
				}, {
					callProperty: "NumberInt",
					value: selSecData.ServiceOrderOperation
				}];

				var checkFucc = function () {
					return {
						pass: true
					};
				}.bind(this);
				var succFunc = function (oData, response) {
					this.extensionAPI.refresh();
				}.bind(this);

				this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);
			}

		},

		onClickSSOD_B96_old: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			var actId = "SSOD_B96";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.ManualDiscount";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSQT_APPLY_DISCOUNTSet";
			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			} else {
				var dialogFields = [{
					fragInputId: "DiscountInput",
					fragInputLabel: this.aeUtil.geti18nText(that, "DiscountInput"),
					callProperty: "Discount"
				}];
				var data = [{
					callProperty: "ObjectId",
					value: selSecData.ServiceOrder
				}, {
					callProperty: "NumberInt",
					value: selSecData.ServiceOrderOperation
				}];
				var checkFucc = function () {
					var oDiscount = Fragment.byId(actId + "Fragment", "DiscountInput").getValue();
					if (oDiscount === "" || oDiscount === undefined) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "ENTER_DISCOUNT")
						};
					} else if (oDiscount < 0 || oDiscount > 100) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "ENTER_VALID_DISCOUNT")
						};
					} else {
						return {
							pass: true
						};
					}
				}.bind(this);
				var succFunc = function (oData, response) {
					this.extensionAPI.refresh();
				}.bind(this);

				this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

			}
		},

		onClickSSOD_B97: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			var actId = "SSOD_B97";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.ApplyDiscount2";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SC_AI_CHANGESet";
			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			} else {
				var dialogFields = [{
					fragInputId: "AccIndicatorInput",
					fragInputLabel: this.aeUtil.geti18nText(that, "AccIndicatorInput"),
					vhEntitySet: "ZAE_I_BillableControlText",
					vhSearchKey: "BillableControl",
					vhSearchText: "BillableControlName",
					callProperty: "AcIndicator"
				}];
				var data = [{
					callProperty: "ObjectId",
					value: selSecData.ServiceOrder
				}, {
					callProperty: "NumberInt",
					value: selSecData.ServiceOrderOperation
				}];

				var checkFucc = function () {
					return {
						pass: true
					};
				}.bind(this);
				var succFunc = function (oData, response) {
					this.extensionAPI.refresh();
				}.bind(this);

				this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);
			}

		},

		onClickSSOD_B98: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			var actId = "SSOD_B98";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.ManualDiscount2";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSQT_APPLY_DISCOUNTSet";
			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			} else {
				var dialogFields = [{
					fragInputId: "DiscountInput",
					fragInputLabel: this.aeUtil.geti18nText(that, "DiscountInput"),
					callProperty: "Discount"
				}];
				var data = [{
					callProperty: "ObjectId",
					value: selSecData.ServiceOrder
				}, {
					callProperty: "NumberInt",
					value: selSecData.ServiceOrderOperation
				}];
				var checkFucc = function () {
					var oDiscount = Fragment.byId(actId + "Fragment", "DiscountInput").getValue();
					if (oDiscount === "" || oDiscount === undefined) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "ENTER_DISCOUNT")
						};
					} else if (oDiscount < 0 || oDiscount > 100) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "ENTER_VALID_DISCOUNT1")
						};
					} else {
						return {
							pass: true
						};
					}
				}.bind(this);
				var succFunc = function (oData, response) {
					this.extensionAPI.refresh();
				}.bind(this);

				this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

			}
		},
		/*,
													"SSOD_B100": {
														"id": "SSOD_B100Button",
														"text": "{@i18n>SSOD_B100}",
														"press": "onClickSSOD_B100",
														"requiresSelection": true,
														"applicablePath": "isShowSSOD_B100"
													}*/

		onClickSSOD_B100: function (oEvent) {
			var cachedScriptPromises = {};
			var that = this;
			var input = oEvent.getSource();
			var oModel = this.getView().getModel("mNotes").getData();
			var pageData = this.getView().getBindingContext().getObject();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			if (selSecData instanceof Array) {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("Multi Selection is not Allowed");
				sap.m.MessageBox.error(msg);
				return;
			}
			var vEquip = pageData.Equipment;
			var vPlant = pageData.ServiceOrganization;
			var oSet = "/GET_SCHEMA_HEADER_DATASet";
			var oPostDataObj = {
				GET_SCHEMA_INPUT: [{
					Equipment: vEquip,
					Plant: vPlant
				}],
				GET_SCHEMA_OUTPUT: []
			};
			this.getView().setBusy(true);
			this.getView().getModel().create(oSet, oPostDataObj, {
				success: function (oData, response) {

					if (oData.GET_SCHEMA_OUTPUT.results.length > 0) {
						var aFilter = [];
						aFilter.push(new sap.ui.model.Filter({
							path: "Equipment",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: vEquip
						}));
						that.getView().getModel().read("/ZAE_I_Equipment_04", {
							filters: aFilter,
							urlParameters: {
								$expand: ["to_ServiceContractNew", "to_ServiceContractNew/to_Item_01", "to_EquipmentRecall",
									// "to_SmartServiceContract"
								]
							},
							success: function (oData1, response1) {
								var oEquipmentData = {};
								if (oData1.results.length > 0) {
									oEquipmentData = oData1.results[0];
								}
								for (var i = 0; i < oData.GET_SCHEMA_OUTPUT.results.length; i++) {
									var SchemaID = oData.GET_SCHEMA_OUTPUT.results[i].Schemaid;
									var vCatSchemaReasolveCount = 0;
									var FilteredTreeTableData = [];
									oModel.ConcatinatedCategorizationSchemaTreeTableData = [];
									cachedScriptPromises[SchemaID] = $.Deferred(function (defer) {
										that.getView().getModel().read("/ZAE_I_CategorizationSchema_01", {
											urlParameters: {
												"$filter": "asp_id  eq \'" + SchemaID + "\'",
												"$orderby": "cat_id"
											},
											success: function (oData2, response2) {
												if (oData2.results.length > 0) {
													var oSchemaID = oData2.results[0].asp_id;
													var flatData = that.aeUI5Util.genParentIdWithDiv(oData2.results, "cat_id", "parentId", "_", 1);
													var tableData = that.treeFunctions.convertFlatToTree(flatData, "cat_id", "parentId", oSchemaID);
													var inContractNodes = flatData.filter((iC) => iC.CatIDType === "CTIN").map((iM) => iM.cat_id);
													var openInContractNodes = [];
													var ESTOnodes = flatData.filter((iC) => ((iC.CatIDType === "REPR") && (iC.CatIDCategory === '18' || iC.CatIDCategory ===
														'11' || iC.CatIDCategory === '12' || iC.CatIDCategory === '26'))).map((iM) => iM.cat_id);
													inContractNodes.forEach((cn) => {
														const nodeIds = cn.split('_');
														for (let i = 1; i <= nodeIds.length + 1; i++) {
															const tempId = nodeIds.slice(0, i).join('_');
															if (!openInContractNodes.includes(tempId)) {
																openInContractNodes.push(tempId);
															}
														}
													})
													if (oEquipmentData.ConcatenatedActiveSystStsName.search("ESTO") !== -1) {
														var aShowNodes = [{
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "18"
														}, {
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "11"
														}, {
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "12"
														}, {
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "26"
														}];
														FilteredTreeTableData = that.filterTreeESTOData(tableData, aShowNodes, ESTOnodes, flatData);
														tableData = FilteredTreeTableData;
													}
													var oServiceContract = oEquipmentData.to_ServiceContractNew.results[0];

													var aHideNodes = [];
													if (oEquipmentData.ConcatenatedActiveSystStsName.search("ECUS") !== -1) {
														aHideNodes.push({
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "18"
														});
													}
													if (oEquipmentData.ContractStatus_new === "CTIN" && oServiceContract &&
														oServiceContract.to_Item_01.results.length > 0 && oServiceContract.SrviceSchemaQualifier === "CTIN" &&
														oServiceContract.to_Item_01.results[0].Material) {
														var Material = oServiceContract.SalesContractType === 'ZUMC' ? oServiceContract.to_Item_01.results[0].ReferenceMaterial :
															oServiceContract.to_Item_01.results[0].Material;
														aHideNodes.push({
															SrviceSchemaQualifier: "CTOT",
															CatIDCategory: ""
														});
														if (oServiceContract.CatIDCategory) {
															aHideNodes.push({
																SrviceSchemaQualifier: "CTIN",
																CatIDCategory: Number(oServiceContract.CatIDCategory) === 1 ? "2" : "1"
															});
														}
														FilteredTreeTableData = that.treeFunctions.filterTreeData2(tableData, oSchemaID + "_S", aHideNodes,
															Material,
															openInContractNodes, flatData);
													}

													if (oServiceContract) {
														if (oServiceContract.to_Item.results[0].MaterialFrom && oServiceContract.to_Item.results[0].MaterialTo) {
															FilteredTreeTableData = that.filterTreeMaterialKM(FilteredTreeTableData, oServiceContract);
														}
													}

													oModel.ConcatinatedCategorizationSchemaTreeTableData = oModel.ConcatinatedCategorizationSchemaTreeTableData.concat(
														FilteredTreeTableData);
												}
												defer.resolve();
											},
											error: function () {
												defer.resolve();
												that.getView().setBusy(false);
											}
										});
									}).promise();

									cachedScriptPromises[SchemaID].done(function () {
										that.getView().setBusy(false);
										vCatSchemaReasolveCount++;
										if (Object.keys(cachedScriptPromises).length === vCatSchemaReasolveCount) {
											if (oModel.ConcatinatedCategorizationSchemaTreeTableData.length === 0) {
												var msg1 = that.getView().getModel("i18n").getResourceBundle().getText("CategorizationSchemaNotavailable");
												sap.m.MessageToast.show(msg1);
											} else {
												that.fnProcessCatSchema_AddWork(input, oModel.ConcatinatedCategorizationSchemaTreeTableData);
											}

										}
									});

								}

							},
							error: function (oError) {
								that.getView().setBusy(false);
							}

						});

					} else {
						var msg = this.getView().getModel("i18n").getResourceBundle().getText("CategorizationSchemaNotavailable");
						sap.m.MessageToast.show(msg);
						input.setBusy(false);
					}

				},
				error: function (oError) {
					input.setBusy(false);
				}
			});

		},

		fnProcessCatSchema_AddWorkOld: function (input, FilteredTreeTableData) {
			input.setBusy(false);
			this.getView().setBusy(false);
			var that = this;
			var keyCol = "cat_id";
			var valueCol = "cat_label";
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.ServiceReqTreeDialog";
			var actId = "SSOD_B100";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = this.getView().getModel();
			var ZAE_FM_SERQ_ADD_WORK_SRV = that.getView().getModel();
			var oEntity = "ZAE_FM_SSOD_OP_ADD_CONTRACTSet";
			var checkFucc = function (SelectedContexts) {

				if (SelectedContexts.length > 0) {
					return {
						pass: true
					};
				} else {
					return {
						pass: false,
						msg: that.aeUI5Util.geti18nText(that, "TREE_TABLE_SELECTION"),
						type: "Error"
					};
				}

			}.bind(this);
			var submitFunc = function (SelectedList) {
				var pageData = that.getView().getBindingContext().getObject();
				var selSecData = this.aeUtil.getSecData(that, "OPFacet");

				var data = [{
					callProperty: "ObjectId",
					value: pageData.ServiceOrder
				}, {
					callProperty: "NumberInt",
					value: selSecData.ServiceOrderOperation
				}, {
					callProperty: "CatId",
					value: SelectedList[0].cat_id
				}];

				var succFunc = function (oData, response) {
					oModel.refresh();
				}.bind(this);
				this.aeUtil.createCall(that, actId, actLabel, ZAE_FM_SERQ_ADD_WORK_SRV, oEntity, data, succFunc);

			}.bind(this);

			that.treeFunctions.handleTreeValueHelp(that, input, fragName, keyCol, valueCol, FilteredTreeTableData, checkFucc, submitFunc);
		},
		onClickSSOD_B122: function (oEvent) {
			var cachedScriptPromises = {};
			var that = this;
			var input = oEvent.getSource();
			var oModel = this.getView().getModel("mNotes").getData();
			var pageData = this.getView().getBindingContext().getObject();
			/*var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			if (selSecData instanceof Array) {
				var msg = this.getView().getModel("i18n").getResourceBundle().getText("Multi Selection is not Allowed");
				sap.m.MessageBox.error(msg);
				return;
			}*/
			var vEquip = pageData.Equipment;
			var vPlant = pageData.ServiceOrganization;
			var oSet = "/GET_SCHEMA_HEADER_DATASet";
			var oPostDataObj = {
				GET_SCHEMA_INPUT: [{
					Equipment: vEquip,
					Plant: vPlant
				}],
				GET_SCHEMA_OUTPUT: []
			};
			this.getView().setBusy(true);
			this.getView().getModel().create(oSet, oPostDataObj, {
				success: function (oData, response) {

					if (oData.GET_SCHEMA_OUTPUT.results.length > 0) {
						var aFilter = [];
						aFilter.push(new sap.ui.model.Filter({
							path: "Equipment",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: vEquip
						}));
						that.getView().getModel().read("/ZAE_I_Equipment_04", {
							filters: aFilter,
							urlParameters: {
								$expand: ["to_ServiceContractNew", "to_ServiceContractNew/to_Item_01", "to_EquipmentRecall",
									// "to_SmartServiceContract"
								]
							},
							success: function (oData1, response1) {
								var oEquipmentData = {};
								if (oData1.results.length > 0) {
									oEquipmentData = oData1.results[0];
								}
								for (var i = 0; i < oData.GET_SCHEMA_OUTPUT.results.length; i++) {
									var SchemaID = oData.GET_SCHEMA_OUTPUT.results[i].Schemaid;
									var vCatSchemaReasolveCount = 0;
									var FilteredTreeTableData = [];
									oModel.ConcatinatedCategorizationSchemaTreeTableData = [];
									cachedScriptPromises[SchemaID] = $.Deferred(function (defer) {
										that.getView().getModel().read("/ZAE_I_CategorizationSchema_01", {
											urlParameters: {
												"$filter": "asp_id  eq \'" + SchemaID + "\'",
												"$orderby": "cat_id"
											},
											success: function (oData2, response2) {
												if (oData2.results.length > 0) {
													var oSchemaID = oData2.results[0].asp_id;
													var flatData = that.aeUI5Util.genParentIdWithDiv(oData2.results, "cat_id", "parentId", "_", 1);
													var tableData = that.treeFunctions.convertFlatToTree(flatData, "cat_id", "parentId", oSchemaID);
													var inContractNodes = flatData.filter((iC) => iC.CatIDType === "CTIN").map((iM) => iM.cat_id);
													var openInContractNodes = [];
													var ESTOnodes = flatData.filter((iC) => ((iC.CatIDType === "REPR") && (iC.CatIDCategory === '18' || iC.CatIDCategory ===
														'11' || iC.CatIDCategory === '12' || iC.CatIDCategory === '26'))).map((iM) => iM.cat_id);
													inContractNodes.forEach((cn) => {
														const nodeIds = cn.split('_');
														for (let i = 1; i <= nodeIds.length + 1; i++) {
															const tempId = nodeIds.slice(0, i).join('_');
															if (!openInContractNodes.includes(tempId)) {
																openInContractNodes.push(tempId);
															}
														}
													})
													if (oEquipmentData.ConcatenatedActiveSystStsName.search("ESTO") !== -1) {
														var aShowNodes = [{
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "18"
														}, {
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "11"
														}, {
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "12"
														}, {
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "26"
														}];
														FilteredTreeTableData = that.filterTreeESTOData(tableData, aShowNodes, ESTOnodes, flatData);
														tableData = FilteredTreeTableData;
													}
													var oServiceContract = oEquipmentData.to_ServiceContractNew.results[0];

													var aHideNodes = [];
													if (oEquipmentData.ConcatenatedActiveSystStsName.search("ECUS") !== -1) {
														aHideNodes.push({
															SrviceSchemaQualifier: "REPR",
															CatIDCategory: "18"
														});
													}
													if (oEquipmentData.ContractStatus_new === "CTIN" && oServiceContract &&
														oServiceContract.to_Item_01.results.length > 0 && oServiceContract.SrviceSchemaQualifier === "CTIN" &&
														oServiceContract.to_Item_01.results[0].Material) {
														var Material = oServiceContract.SalesContractType === 'ZUMC' ? oServiceContract.to_Item_01.results[0].ReferenceMaterial :
															oServiceContract.to_Item_01.results[0].Material;
														aHideNodes.push({
															SrviceSchemaQualifier: "CTOT",
															CatIDCategory: ""
														});
														if (oServiceContract.CatIDCategory) {
															aHideNodes.push({
																SrviceSchemaQualifier: "CTIN",
																CatIDCategory: Number(oServiceContract.CatIDCategory) === 1 ? "2" : "1"
															});
														}
														FilteredTreeTableData = that.treeFunctions.filterTreeData2(tableData, oSchemaID + "_S", aHideNodes,
															Material,
															openInContractNodes, flatData);
													}

													if (oServiceContract) {
														if (oServiceContract.to_Item.results[0].MaterialFrom && oServiceContract.to_Item.results[0].MaterialTo) {
															FilteredTreeTableData = that.filterTreeMaterialKM(FilteredTreeTableData, oServiceContract);
														}
													}

													oModel.ConcatinatedCategorizationSchemaTreeTableData = oModel.ConcatinatedCategorizationSchemaTreeTableData.concat(
														FilteredTreeTableData);
												}
												defer.resolve();
											},
											error: function () {
												defer.resolve();
												that.getView().setBusy(false);
											}
										});
									}).promise();

									cachedScriptPromises[SchemaID].done(function () {
										that.getView().setBusy(false);
										vCatSchemaReasolveCount++;
										if (Object.keys(cachedScriptPromises).length === vCatSchemaReasolveCount) {
											if (oModel.ConcatinatedCategorizationSchemaTreeTableData.length === 0) {
												var msg1 = that.getView().getModel("i18n").getResourceBundle().getText("CategorizationSchemaNotavailable");
												sap.m.MessageToast.show(msg1);
											} else {
												that.fnProcessCatSchema_AddWork(input, oModel.ConcatinatedCategorizationSchemaTreeTableData);
											}

										}
									});

								}

							},
							error: function (oError) {
								that.getView().setBusy(false);
							}

						});

					} else {
						var msg = this.getView().getModel("i18n").getResourceBundle().getText("CategorizationSchemaNotavailable");
						sap.m.MessageToast.show(msg);
						input.setBusy(false);
					}

				},
				error: function (oError) {
					input.setBusy(false);
				}
			});

		},

		fnProcessCatSchema_AddWork: function (input, FilteredTreeTableData) {
			input.setBusy(false);
			this.getView().setBusy(false);
			var that = this;
			var keyCol = "cat_id";
			var valueCol = "cat_label";
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.ServiceReqTreeDialog";
			var actId = "SSOD_B122";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = this.getView().getModel();
			var ZAE_FM_SERQ_ADD_WORK_SRV = that.getView().getModel();
			var oEntity = "ZAE_FM_SSOD_ADD_CONTRACTSet";
			var checkFucc = function (SelectedContexts) {

				if (SelectedContexts.length > 0) {
					return {
						pass: true
					};
				} else {
					return {
						pass: false,
						msg: that.aeUI5Util.geti18nText(that, "TREE_TABLE_SELECTION"),
						type: "Error"
					};
				}

			}.bind(this);
			var submitFunc = function (SelectedList) {
				var pageData = that.getView().getBindingContext().getObject();
				//				var selSecData = this.aeUtil.getSecData(that, "OPFacet");

				var data = [{
					callProperty: "ObjectId",
					value: pageData.ServiceOrder
				}, {
					callProperty: "CatId",
					value: SelectedList[0].cat_id
				}];

				var succFunc = function (oData, response) {
					oModel.refresh();
				}.bind(this);
				this.aeUtil.createCall(that, actId, actLabel, ZAE_FM_SERQ_ADD_WORK_SRV, oEntity, data, succFunc);

			}.bind(this);

			that.treeFunctions.handleTreeValueHelp(that, input, fragName, keyCol, valueCol, FilteredTreeTableData, checkFucc, submitFunc);
		},

		onClickSSOD_B101: function () {
			var oTableSHF = this.createId("SHFFacet::responsiveTable");
			var oView = this.getView();
			var oTableSH = oView.byId(oTableSHF);
			if (oTableSH) {
				this.ServiceHistoryTab = true;
				oTableSH.getParent().rebindTable();
				oTableSH.getParent().setInitialNoDataText("No Data Found");

			}
		},
		onClickSSOD_B102: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var oModel = this.getView().getModel();
			var pageData = this.getView().getBindingContext().getObject();
			var aFilters = [];
			oSource.setBusy(true);
			var oCurrentStatusData = [];
			aFilters.push(new sap.ui.model.Filter('ServiceRequest', sap.ui.model.FilterOperator.EQ, pageData.ServiceRequest));
			oModel.read("/ZAE_I_ServiceRequestActWorkSts", {
				filters: aFilters,
				success: function (response1) {
					if (response1.results.length > 0) {
						oCurrentStatusData = response1.results;
					}
					oSource.setBusy(false);
					that._OpenSetWorkStatusDialog(oSource, oCurrentStatusData);
				}.bind(this),
				error: function (error1) {
					oSource.setBusy(false);
				}
			});
		},
		_OpenSetWorkStatusDialog: function (oMainSource, oCurrentStatusData) {
			var that = this;
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var oModelData = [];
			if (oCurrentStatusData) {
				for (var i = 0; i < oCurrentStatusData.length; i++) {
					oModelData.push({
						"StatusShortName": oCurrentStatusData[i].StatusShortName,
						"StatusName": oCurrentStatusData[i].StatusName,
						"Active": oCurrentStatusData[i].Active,
						"Status": oCurrentStatusData[i].Status
					});
				}
			}

			oJsonModel.setData(oModelData);
			if (!this._oFragSetWorkToggle) {
				Fragment.load({
					id: "fragToggle",
					name: "com.globalintelli.zae_ssod.ext.fragment.SetWorkStatus",
					controller: {
						onSwitchChange: function (oEvent) {

							var oSource = oEvent.getSource();
							oSource.setBusy(true);
							var oTBLModel = oSource.oPropagatedProperties.oBindingContexts.undefined.getModel();
							var Path = oSource.oPropagatedProperties.oBindingContexts.undefined.getPath();
							var oRowData = oTBLModel.getProperty(Path);
							var oModel = that.getView().getModel();
							var pageData = that.getView().getBindingContext().getObject();
							var actId = "SSWE_B44";
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var oEntity = "ZAE_FM_SSRQ_SET_WORK_STATUSSet";
							var data = [{
								callProperty: "ObjectId",
								value: pageData.ServiceRequest
							}, {
								callProperty: "Status",
								value: oRowData.Status
							}];
							var succFunc = function (oData, resp) {
								that.aeUtil.refreshControlModel(oMainSource);
								var aFilters = [];
								aFilters.push(new sap.ui.model.Filter('ServiceRequest', sap.ui.model.FilterOperator.EQ, pageData.ServiceRequest));
								oModel.read("/ZAE_I_ServiceRequestActWorkSts", {
									filters: aFilters,
									success: function (response) {
										oSource.setBusy(false);
										var oResponseData2 = [];
										if (response.results.length > 0) {
											oResponseData2 = response.results;
										}
										for (var k = 0; k < oModelData.length; k++) {
											oModelData[k].Active = oResponseData2[k].Active;
										}

										var oTModel = that._oFragSetWorkToggle.getModel();
										oTModel.setData(oModelData);
										oTModel.updateBindings(true);
									},
									error: function (error) {
										oSource.setBusy(false);
									}
								});
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
						},
						onclose: function (oEvent) {
							that._oFragSetWorkToggle.close();
						}
					}
				}).then(function (oDialogContent) {
					this._oFragSetWorkToggle = oDialogContent;
					this.getView().addDependent(this._oFragSetWorkToggle);
					this._oFragSetWorkToggle.setModel(oJsonModel);
					this._oFragSetWorkToggle.open();
				}.bind(this));
			} else {
				this._oFragSetWorkToggle.setModel(oJsonModel);
				this._oFragSetWorkToggle.open();
			}
		},
		//Added for AE-4241
		onClickSSOD_B104: function (oEvent) {
			var that = this;
			if (!this._oNewSplitDialog) {
				Fragment.load({
						id: "fragSplit3",
						name: "com.globalintelli.zae_ssod.ext.fragment.Split3Party",
						controller: {

							handleBPValueHelp: function (oEvent1) {
								var pageData = that.getView().getBindingContext().getObject();
								var ServiceOrganization = pageData.ServiceOrganization;
								var SalesOrganization = pageData.SalesOrganization;
								var DistributionChannel = pageData.DistributionChannel;
								var input = oEvent1.getSource();
								// input.setTokens([]);
								var configObject = {
									entitySet: "ZAE_VH_BusinessPartner_07",
									initiallyVisibleFields: "Partner,PartnerName,BusinesspartnerGrouping,FirstName,LastName",
									selectionMode: "Single",

									tokenObject: {
										key: "Partner",
										Description: "PartnerName"
									},
									controlConfiguration: [{
										index: 0,
										key: "Partner",
										filterType: "auto",
										label: "Business Partner",
										mandatory: "auto",
										visible: true
									}, {
										index: 1,
										key: "BusinesspartnerGrouping",
										filterType: "auto",
										label: "Business Partner Grouping",
										mandatory: "auto",
										visible: true
									}, {
										index: 2,
										key: "FirstName",
										filterType: "auto",
										label: "First Name",
										mandatory: "auto",
										visible: true
									}, {
										index: 3,
										key: "LastName",
										filterType: "auto",
										label: "Last Name",
										mandatory: "auto",
										visible: true
									}],
									defaultFilter: {

									},
									onBeforeRebindSmartTable: function (oEvent) {
										var pageData = that.getView().getBindingContext().getObject();
										var mSplit = that.getView().getModel("mSplit");
										var bindingobj;
										var TableRows = Fragment.byId("fragSplit3", "SplitTable").getItems();
										for (var i = 0; i < TableRows.length; i++) {
											if (TableRows[i].getCells()[7].getSelectedItem() !== null) {
												if (TableRows[i].getCells()[7].getSelectedItem().getKey() === "Z5") {
													bindingobj = mSplit.getProperty(TableRows[i].getCells()[7].getSelectedItem().oBindingContexts.mSplit.sPath);
												}
											}
											if (TableRows[i].getCells()[6].getSelectedItem() !== null) {
												if (TableRows[i].getCells()[6].getSelectedItem().getKey() === "Z5") {
													bindingobj = mSplit.getProperty(TableRows[i].getCells()[6].getSelectedItem().oBindingContexts.mSplit.sPath);
												}
											}
										}
										var aFilters = oEvent.getParameter("bindingParams").filters;
										if (bindingobj.BPSelectionRule === '2') {
											aFilters.push(new sap.ui.model.Filter({
												path: "SalesOrganization",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.SalesOrganization
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "ProcessType",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.ServiceDocumentType
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "CurrentAccountingIndicator",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.CurrentAccountingIndicator
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "AccountingIndicator",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.AccountingIndicator
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "AccountingIndicatorSplit",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.AccountingIndicatorSplit
											}));
										} else if (bindingobj.BPSelectionRule === '1') {
											aFilters.push(new sap.ui.model.Filter({
												path: "ServiceOrg",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.service_org
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "BPSelectionRule",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.BPSelectionRule
											}));

										}
										oEvent.getParameter("bindingParams").filters = aFilters;
									}

								};
								that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
							},

							onModelContextChange: function (oEvent) {
								var self = this;
								var sId = oEvent.getParameter("id");
								var tbl = sap.ui.getCore().byId(sId);
								var header = tbl.$().find('thead');
								var selectAllCb = header.find('.sapMCb');
								selectAllCb.remove();

								tbl.getItems().forEach(function (r) {
									var obj = r.getBindingContext("mSplit").getObject();
									var oStatus = obj.EnableSelect;
									var cb = r.$().find('.sapMCb');
									var oCb = sap.ui.getCore().getElementById(cb.attr('id'));
									if (oCb) {
										oCb.setEditable(oStatus);
									}
								});
								self.fnSubmitButonEnable();
							},

							fnliveChangeSplit: function (oEvent) {
								var BoolenCheck = false;
								var RowSplit = oEvent.getSource().getParent().getCells();
								var mSplit = that.getView().getModel("mSplit");
								var data = mSplit.getData();
								var sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.mSplit.sPath;
								var object = mSplit.getProperty(sPath);
								for (var i = 0; i < data.TableList.length; i++) {
									if (object.Item === data.TableList[i].HigherLevelItem) {
										//	data.TableList[i].SplitCustomer = object.SplitCustomer; //COmmented
										data.TableList[i].SplitCustomer1 = object.SplitCustomer1;
										data.TableList[i].SplitCustomer2 = object.SplitCustomer2;
									}

									if (Number(data.TableList[i].SplitCustomer1) > 0 && Number(data.TableList[i].SplitCustomer1) <= 100 && Number(data.TableList[
											i].SplitCustomer2) > 0 && Number(data.TableList[i].SplitCustomer2) <=
										100) {
										//	data.TableList[i].ProposedSplit = 100 - Number(data.TableList[i].SplitCustomer);
										data.TableList[i].ProposedSplit = 100 - (Number(data.TableList[i].SplitCustomer1) + Number(data.TableList[i].SplitCustomer2));
										if (data.TableList[i].ProposedSplit < 0) {
											BoolenCheck = true;
										}
									} else if (Number(data.TableList[i].SplitCustomer1) >= 100 || Number(data.TableList[i].SplitCustomer2) >= 100) {
										data.TableList[i].ProposedSplit = 100 - (Number(data.TableList[i].SplitCustomer1) + Number(data.TableList[i].SplitCustomer2));
										BoolenCheck = true;
									} else if (Number(data.TableList[i].SplitCustomer1) > 0 && Number(data.TableList[i].SplitCustomer1) <= 100) {
										data.TableList[i].ProposedSplit = 100 - Number(data.TableList[i].SplitCustomer1);

									} else {
										data.TableList[i].ProposedSplit = 100;
									}
								}
								if (BoolenCheck) {
									MessageBox.error("Split 3 should not be less than 0");
								}
								this.fnSubmitButonEnable();
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

							fnOnSelectHeaderAccInd: function (oEvent) { //Split acc indicator 2
								var BoolenCheck = false;
								var SplitTable = Fragment.byId("fragSplit3", "SplitTable").getItems();
								var mSplit = that.getView().getModel("mSplit");
								var data = mSplit.getData();
								var SelectedItem2 = Fragment.byId("fragSplit3", "SplitAccountingIndicator").getSelectedItem();
								var sPath2 = SelectedItem2.oBindingContexts.mSplit.sPath;
								var obj2 = mSplit.getProperty(sPath2);
								//Added for AE-4241 - partner field
								var SelectedItem3 = Fragment.byId("fragSplit3", "SplitAccountingIndicator3").getSelectedItem();
								if (SelectedItem3 !== null) {
									var sPath3 = SelectedItem3.oBindingContexts.mSplit.sPath;
									var obj3 = mSplit.getProperty(sPath3);
								}
								for (var i = 0; i < data.TableList.length; i++) {
									data.TableList[i].NewAccInd = obj2.AccountingIndicatorSplit;
									if ((obj2.AccountingIndicatorSplit === "Z5") || (obj3 && obj3.AccountingIndicatorSplit === "Z5") || data.TableList[i].NewAccInd1 ===
										"Z5") {
										BoolenCheck = true;
										if (data.TableList[i].NewAccInd1 === "Z5" || data.TableList[i].NewAccInd === "Z5") {
											var oControlEvent = {
												"selectedItem": ""
											};
											oControlEvent["selectedItem"] = oEvent.getParameter("selectedItem");
											SplitTable[i].getCells()[11].setEnabled(true);
											SplitTable[i].getCells()[6].fireChange(oControlEvent);
										}
									} else {
										SplitTable[i].getCells()[11].setSelectedKey(null);
										SplitTable[i].getCells()[11].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
								}
								mSplit.updateBindings(true);

								if (BoolenCheck) {
									Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(true);
								} else {
									Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(false);
								}

								this.fnSubmitButonEnable();
							},

							fnOnSelectHeaderAccInd3: function (oEvent) {
								var BoolenCheck = false;
								var mSplit = that.getView().getModel("mSplit");
								var SplitTable = Fragment.byId("fragSplit3", "SplitTable").getItems();
								var data = mSplit.getData();
								var SelectedItem3 = Fragment.byId("fragSplit3", "SplitAccountingIndicator3").getSelectedItem(); //Added
								var sPath3 = SelectedItem3.oBindingContexts.mSplit.sPath;
								var obj3 = mSplit.getProperty(sPath3);
								var SelectedItem2 = Fragment.byId("fragSplit3", "SplitAccountingIndicator").getSelectedItem();
								if (SelectedItem2 !== null) {
									var sPath2 = SelectedItem2.oBindingContexts.mSplit.sPath;
									var obj2 = mSplit.getProperty(sPath2);
								}
								for (var i = 0; i < data.TableList.length; i++) {
									data.TableList[i].NewAccInd1 = obj3.AccountingIndicatorSplit;
									if ((obj3.AccountingIndicatorSplit === "Z5") || (obj2 && obj2.AccountingIndicatorSplit === "Z5") || data.TableList[i].NewAccInd ===
										"Z5" || data.TableList[i].NewAccInd1 === "Z5") {
										BoolenCheck = true;
										if (data.TableList[i].NewAccInd1 === "Z5" || data.TableList[i].NewAccInd === "Z5") {
											var oControlEvent = {
												"selectedItem": ""
											};
											oControlEvent["selectedItem"] = oEvent.getParameter("selectedItem");
											SplitTable[i].getCells()[11].setEnabled(true);
											SplitTable[i].getCells()[7].fireChange(oControlEvent);
										}
									} else {
										SplitTable[i].getCells()[11].setSelectedKey(null);
										SplitTable[i].getCells()[11].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
								}
								mSplit.updateBindings(true);
								if (BoolenCheck) {
									Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(true);
								} else {
									Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(false);
								}
								this.fnSubmitButonEnable();
							},

							fnNewAccIndSelectionChange2: function (oEvent) {
								var pageData = that.getView().getBindingContext().getObject();
								var mSplit = that.getView().getModel("mSplit");
								var data = mSplit.getData();
								var PartnerVH = [];
								var BoolenCheck = false;

								var bindingobj = that.getView().getModel("mSplit").getProperty("/TableList/0/NewAccIndVH").find(function (obj) {
									return obj.AccountingIndicatorSplit === oEvent.getParameter("selectedItem").getKey();
								});
								var BusinessPartnerCell = oEvent.getSource().getParent().getCells();
								if (oEvent.getParameter("selectedItem").getKey() !== 'Z5' && BusinessPartnerCell[7].getSelectedKey() === "Z5") {
									bindingobj = that.getView().getModel("mSplit").getProperty(BusinessPartnerCell[7].getSelectedItem().mBindingInfos.key.binding
										.oContext
										.sPath);
								}
								// var SSODSplit = that.getView().getModel("mSplitHeader").getProperty(oEvent.getParameter("selectedItem").mBindingInfos.key.binding
								// 	.oContext.sPath);
								for (var i = 0; i < data.TableList.length; i++) {
									if (data.TableList[i].NewAccInd === "Z5" || data.TableList[i].NewAccInd1 === "Z5") {
										//read ZAE_I_SSODSplit with key fields in data.TableList[i]
										BoolenCheck = true;

										// var aFilters1 = [];

										// if (bindingobj.BPSelectionRule === '2' || data.TableList[i].NewAccInd1 === "Z5") {
										// 	aFilters1.push(new Filter("SalesOrganization", "EQ", pageData.SalesOrganization));
										// 	aFilters1.push(new Filter("ProcessType", "EQ", pageData.ServiceDocumentType));
										// 	aFilters1.push(new Filter("CurrentAccountingIndicator", "EQ", bindingobj.CurrentAccountingIndicator));
										// 	aFilters1.push(new Filter("AccountingIndicator", "EQ", bindingobj.AccountingIndicator));
										// 	aFilters1.push(new Filter("AccountingIndicatorSplit", "EQ", bindingobj.AccountingIndicatorSplit));
										// } else if (bindingobj.BPSelectionRule === '1' || data.TableList[i].NewAccInd1 === "Z5") {
										// 	aFilters1.push(new Filter("ServiceOrg", "EQ", pageData.service_org));
										// 	aFilters1.push(new Filter("BPSelectionRule", "EQ", bindingobj.BPSelectionRule));
										// }
										// if (BusinessPartnerCell[11]) {
										// 	BusinessPartnerCell[11].getBinding("items").filter(aFilters1);
										// }
									} else {
										//	BusinessPartner[11].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
									//		this.fnSubmitButonEnable();
									if (BoolenCheck) {
										Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(true);
									} else {
										Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(false);
									}
								}
								if (oEvent.getParameter("selectedItem").getKey() === "Z5" || BusinessPartnerCell[7].getSelectedKey() ===
									"Z5") {
									BusinessPartnerCell[11].setEnabled(true);
								} else {
									BusinessPartnerCell[11].setValue("");
									BusinessPartnerCell[11].setEnabled(false);
								}

								this.fnSubmitButonEnable();
							},

							fnNewAccIndSelectionChange3: function (oEvent) {
								var pageData = that.getView().getBindingContext().getObject();
								var mSplit = that.getView().getModel("mSplit");
								var data = mSplit.getData();
								var BoolenCheck = false;
								var SelectedItem2 = Fragment.byId("fragSplit3", "SplitAccountingIndicator3").getSelectedItem();
								var bindingobj = that.getView().getModel("mSplit").getProperty("/TableList/0/NewAccIndVH1").find(function (obj) {
									return obj.AccountingIndicatorSplit === oEvent.getParameter("selectedItem").getKey();
								});
								// var SSODSplit = that.getView().getModel("mSplitHeader").getProperty(oEvent.getParameter("selectedItem").mBindingInfos.key.binding
								// 	.oContext.sPath);
								var BusinessPartnerCell = oEvent.getSource().getParent().getCells();
								if (oEvent.getParameter("selectedItem").getKey() !== 'Z5' && BusinessPartnerCell[6].getSelectedKey() === "Z5") {
									bindingobj = that.getView().getModel("mSplit").getProperty(BusinessPartnerCell[6].getSelectedItem().mBindingInfos.key.binding
										.oContext
										.sPath);
								}
								for (var i = 0; i < data.TableList.length; i++) {
									if (data.TableList[i].NewAccInd1 === "Z5" || data.TableList[i].NewAccInd === "Z5") {
										BoolenCheck = true;
										// var aFilters1 = [];
										// if (bindingobj.BPSelectionRule === '2' || data.TableList[i].NewAccInd === "Z5") {
										// 	aFilters1.push(new Filter("SalesOrganization", "EQ", pageData.SalesOrganization));
										// 	aFilters1.push(new Filter("ProcessType", "EQ", pageData.ServiceDocumentType));
										// 	aFilters1.push(new Filter("CurrentAccountingIndicator", "EQ", bindingobj.CurrentAccountingIndicator));
										// 	aFilters1.push(new Filter("AccountingIndicator", "EQ", bindingobj.AccountingIndicator));
										// 	aFilters1.push(new Filter("AccountingIndicatorSplit", "EQ", bindingobj.AccountingIndicatorSplit));
										// } else if (bindingobj.BPSelectionRule === '1' || data.TableList[i].NewAccInd === "Z5") {
										// 	aFilters1.push(new Filter("ServiceOrg", "EQ", pageData.service_org));
										// 	aFilters1.push(new Filter("BPSelectionRule", "EQ", bindingobj.BPSelectionRule));
										// }
										// if (BusinessPartnerCell[11]) {
										// 	BusinessPartnerCell[11].getBinding("items").filter(aFilters1);
										// }
									} else {
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
									//		this.fnSubmitButonEnable();

									if (BoolenCheck) {
										Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(true);
									} else {
										Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(false);
									}

								}
								if (BusinessPartnerCell[6].getSelectedKey() === "Z5" || oEvent.getParameter("selectedItem").getKey() === "Z5") {
									BusinessPartnerCell[11].setEnabled(true);
								} else {
									BusinessPartnerCell[11].setValue("");
									BusinessPartnerCell[11].setEnabled(false);
								}

								// var BusinessPartner = oEvent.getSource().getParent().getCells();
								// if (BusinessPartner[6].getSelectedKey() === "Z5" || BusinessPartner[7].getSelectedKey() === "Z5") {
								// 	BusinessPartner[11].setEnabled(true);
								// } else {
								// 	BusinessPartner[11].setEnabled(false);
								// }
								this.fnSubmitButonEnable();
							},

							// fnOnSelectHeaderAccInd: function (oEvent) {
							// 	var mSplit = that.getView().getModel("mSplit");
							// 	var data = mSplit.getData();
							// 	var SelectedItem2 = Fragment.byId("fragSplit3", "SplitAccountingIndicator").getSelectedItem();
							// 	var sPath2 = SelectedItem2.oBindingContexts.mSplit.sPath;
							// 	var obj2 = mSplit.getProperty(sPath2);

							// 	var SelectedItem3 = Fragment.byId("fragSplit3", "SplitAccountingIndicator3").getSelectedItem(); //Added
							// 	if (SelectedItem3 !== null) {
							// 		var sPath3 = SelectedItem3.oBindingContexts.mSplit.sPath;
							// 		var obj3 = mSplit.getProperty(sPath3);
							// 	}

							// 	for (var i = 0; i < data.TableList.length; i++) {
							// 		data.TableList[i].NewAccInd = obj2.AccountingIndicatorSplit;
							// 	}
							// 	mSplit.updateBindings(true);

							// 	if (obj2.AccountingIndicatorSplit === "Z5" || (obj3 && obj3.AccountingIndicatorSplit === "Z5")) { //modified
							// 		Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(true);
							// 	} else {
							// 		Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(false);
							// 	}
							// 	this.fnSubmitButonEnable();
							// },
							// //Added for AE-4241 Start
							// fnOnSelectHeaderAccInd3: function (oEvent) {
							// 	var mSplit = that.getView().getModel("mSplit");
							// 	var data = mSplit.getData();
							// 	var SelectedItem3 = Fragment.byId("fragSplit3", "SplitAccountingIndicator3").getSelectedItem(); //Added
							// 	var sPath3 = SelectedItem3.oBindingContexts.mSplit.sPath;
							// 	var obj3 = mSplit.getProperty(sPath3);
							// 	var SelectedItem2 = Fragment.byId("fragSplit3", "SplitAccountingIndicator").getSelectedItem(); //Added 
							// 	if (SelectedItem2 !== null) {
							// 		var sPath2 = SelectedItem2.oBindingContexts.mSplit.sPath;
							// 		var obj2 = mSplit.getProperty(sPath2);
							// 	}
							// 	for (var i = 0; i < data.TableList.length; i++) {
							// 		data.TableList[i].NewAccInd1 = obj3.AccountingIndicatorSplit;
							// 	}
							// 	mSplit.updateBindings(true);

							// 	if ((obj3.AccountingIndicatorSplit === "Z5") || (obj2 && obj2.AccountingIndicatorSplit === "Z5")) { //modified 
							// 		Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(true);
							// 	} else {
							// 		Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(false);
							// 	}

							// 	this.fnSubmitButonEnable();
							// },
							//Added for AE-4241 End
							fnSplitTableSelectionChange: function () {
								this.fnSubmitButonEnable();
							},

							// fnNewAccIndSelectionChange2: function (oEvent) {
							// 	var mSplit = that.getView().getModel("mSplit");
							// 	var data = mSplit.getData();
							// 	for (var i = 0; i < data.TableList.length; i++) {
							// 		if (data.TableList[i].NewAccInd === "Z5") {
							// 			Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(true);
							// 		} else {
							// 			Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(false);
							// 		}
							// 	}
							// 	this.fnSubmitButonEnable();
							// },

							// fnNewAccIndSelectionChange3: function (oEvent) {
							// 	var mSplit = that.getView().getModel("mSplit");
							// 	var data = mSplit.getData();
							// 	for (var i = 0; i < data.TableList.length; i++) {
							// 		if (data.TableList[i].NewAccInd1 === "Z5") {
							// 			Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(true);
							// 		} else {
							// 			Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(false);
							// 		}
							// 	}
							// 	this.fnSubmitButonEnable();
							// },

							fnSubmitButonEnable: function () {

								var mSplit = that.getView().getModel("mSplit");
								var SelectedItem = Fragment.byId("fragSplit3", "SplitAccountingIndicator").getSelectedItem();
								var SelectedItem1 = Fragment.byId("fragSplit3", "SplitAccountingIndicator3").getSelectedItem(); //Added for AE-4241
								if (mSplit && SelectedItem && SelectedItem1) {
									var data = mSplit.getData();
									var sPath = SelectedItem.oBindingContexts.mSplit.sPath;
									var object = mSplit.getProperty(sPath);
									//Added for AE-4241 Start
									var sPath1 = SelectedItem1.oBindingContexts.mSplit.sPath;
									var object1 = mSplit.getProperty(sPath1);
									//Added for AE-4241 End
								}

								/*					//Added for testing Start
													if (mSplit && SelectedItem) {
														var sPath = SelectedItem.oBindingContexts.mSplit.sPath;
														var object = mSplit.getProperty(sPath);
														if ((object.AccountingIndicatorSplit === "Z5")) {
															Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(true);
														} else {
															Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(false);
														}
													}
													//Added for testing End*/
								var ItemListTable = Fragment.byId("fragSplit3", "SplitTable");
								if (ItemListTable.getSelectedItems().length > 0) {
									var BoolSubmitEnable = true;
									ItemListTable.getSelectedItems().forEach(function (r) {
										var obj = r.getBindingContext("mSplit").getObject();
										//	if (!obj.NewAccInd || !obj.SplitCustomer || (object && object.AccountingIndicatorSplit === "Z5" && !obj.Customer))
										if (!obj.NewAccInd || !obj.NewAccInd1 || !obj.SplitCustomer1 || !obj.SplitCustomer2 || (object && object.AccountingIndicatorSplit ===
												"Z5" &&
												!obj.Customer) || (object1 && object1.AccountingIndicatorSplit === "Z5" & !obj.Customer) || obj.ProposedSplit < 0) {
											BoolSubmitEnable = false;
											// Fragment.byId("fragSplit3", "IDSubmit").setEnabled(BoolSubmitEnable);
										}
										//Added for AE-4241 Start
										if (((obj.ProposedAccInd != obj.NewAccInd) && (obj.ProposedAccInd != obj.NewAccInd1)) && (obj.NewAccInd != obj.NewAccInd1) &&
											obj.ProposedSplit > 0) {
											BoolSubmitEnable = true;
										} else {
											BoolSubmitEnable = false;
										}
										//Added for AE-4241 End
									});
									Fragment.byId("fragSplit3", "IDSubmit").setEnabled(BoolSubmitEnable);
								} else {
									Fragment.byId("fragSplit3", "IDSubmit").setEnabled(false);
								}
							},

							onSubmitPressed: function () {
								var ItemListTable = Fragment.byId("fragSplit3", "SplitTable");
								var aCondValue0 = [],
									itemText = "",
									findUnSelectedItems = [];
								ItemListTable.getItems().forEach(function (r) {
									var tableRowObj = r.getBindingContext("mSplit").getObject();
									//	if (Number(tableRowObj.SplitCustomer) > 0)      //Commented
									if (Number(tableRowObj.SplitCustomer1) > 0 && Number(tableRowObj.SplitCustomer2) > 0) {
										findUnSelectedItems.push(r);
									}
								});
								if (ItemListTable.getSelectedItems().length > 0) {
									ItemListTable.getSelectedItems().forEach(function (r) {
										var tableRowObj = r.getBindingContext("mSplit").getObject();
										//	if (Number(tableRowObj.SplitCustomer) === 0)            //commented
										if (Number(tableRowObj.SplitCustomer1) === 0 || Number(tableRowObj.SplitCustomer2) === 0) //Added
										{
											var obj = {
												NumberInt: tableRowObj.Item,
												HigherLevelItem: tableRowObj.HigherLevelItem,
												Material: tableRowObj.Material,
												Qty: tableRowObj.ItemQuantity,
												Uom: tableRowObj.QuantityUnit,
												AcInd: tableRowObj.ProposedAccInd,
												AcIndSplt2: tableRowObj.NewAccInd, //Commented
												AcIndSplt3: tableRowObj.NewAccInd1,
												//	CondValue: tableRowObj.SplitCustomer,   //Commented
												CondValue: tableRowObj.SplitCustomer1 !== "" ? tableRowObj.SplitCustomer1 : "0",
												CondValue1: tableRowObj.SplitCustomer2 !== "" ? tableRowObj.SplitCustomer2 : "0",
												//	CondValue1:tableRowObj.SplitCustomer1 + tableRowObj.SplitCustomer2,
												Partner: ""
											};
											itemText = itemText + tableRowObj.Item + ", ";
											aCondValue0.push(obj);
										}
										var tempArray = [];
										for (var i = 0; i < findUnSelectedItems.length; i++) {
											if (findUnSelectedItems[i].sId !== r.sId) {
												tempArray.push(findUnSelectedItems[i]);
											}
										}
										findUnSelectedItems = tempArray;
									});
								} else {
									var msg2 = "Kindly Select Items";
									var oMessageStrip = Fragment.byId("fragSplit3", "SSOD_B104MessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(msg2);
									return;
								}

								if (aCondValue0.length > 0 || findUnSelectedItems.length > 0) {
									var text = "";
									if (aCondValue0.length > 0) {
										text = "Item " + itemText + " having split 0 100 Pls confirm...";
									}
									if (findUnSelectedItems.length > 0) {
										text = " Some of the items not selected with Split to is greater than 0 \n " + text;
									}

									this.oConfirmationMessageDialog = new sap.m.Dialog({
										type: sap.m.DialogType.Message,
										title: "Information",
										state: sap.ui.core.ValueState.Information,
										content: new Text({
											text: text
										}),
										beginButton: new Button({
											type: sap.m.ButtonType.Emphasized,
											text: "OK",
											press: function () {
												this.fnPressSubmit();
												this.oConfirmationMessageDialog.close();
											}.bind(this)
										}),
										endButton: new Button({
											type: sap.m.ButtonType.Default,
											text: "Cancel",
											press: function () {
												this.oConfirmationMessageDialog.close();
											}.bind(this)
										})
									});
									this.oConfirmationMessageDialog.open();
								} else {
									this.fnPressSubmit();
								}
							},
							fnPressSubmit: function () {
								var actId = "SSOD_B104";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var pageData = that.getView().getBindingContext().getObject();
								//	var oModel = that.getView().getModel("ZAE_FM_SSOD_ITEM_SPLIT_SRV");           //Commented
								var oModel = that.getView().getModel('Split3Preview'); //Added
								//	var oEntity = "ZAE_FM_SSOD_ITEM_SPLITSet";                                    //Commented
								var oEntity = "ZAE_FM_SSOD_ITEM_SPLIT_01Set"; //Added
								var NavSplitMain = [{
									ObjectId: pageData.ServiceOrder
								}];

								var NavSplitItems = [];
								var ItemListTable = Fragment.byId("fragSplit3", "SplitTable");
								if (ItemListTable.getSelectedItems().length > 0) {
									ItemListTable.getSelectedItems().forEach(function (r) {
										var tableRowObj = r.getBindingContext("mSplit").getObject();
										var obj = {
											NumberInt: tableRowObj.Item,
											Higherlevelitem: tableRowObj.HigherLevelItem,
											Material: tableRowObj.Material,
											Qty: tableRowObj.ItemQuantity,
											Uom: tableRowObj.QuantityUnit,
											AcInd: tableRowObj.ProposedAccInd,
											//	AcIndSplt: tableRowObj.NewAccInd,       //Commented
											AcIndSplt2: tableRowObj.NewAccInd, //Added
											AcIndSplt3: tableRowObj.NewAccInd1, //Added
											//	CondValue: tableRowObj.SplitCustomer,   //Commented
											CondValue: tableRowObj.SplitCustomer1 !== "" ? tableRowObj.SplitCustomer1 : "0",
											CondValue1: tableRowObj.SplitCustomer2 !== "" ? tableRowObj.SplitCustomer2 : "0",
											Partner: tableRowObj.Customer
										};
										NavSplitItems.push(obj);
									});

								} else {
									var msg2 = "Kindly Select Items";
									var oMessageStrip = Fragment.byId("fragSplit3", "SSOD_B104MessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(msg2);
									return;
								}

								var data = [{
									callProperty: "NavSplitMain",
									value: NavSplitMain
								}, {
									callProperty: "NavSplitItems",
									value: NavSplitItems
								}];

								var succFunc = function (oData, response) {
									that.aeUtil.refreshControlModel(that.getView());
								}.bind(that);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
								that._oNewSplitDialog.close();
								that._oNewSplitDialog.destroy();
								that._oNewSplitDialog = null;
							},
							onCancelPressed: function () {
								that._oNewSplitDialog.close();
								that._oNewSplitDialog.destroy();
								that._oNewSplitDialog = null;
							}
						}
					})
					.then(function (oDialogContent) {
						that._oNewSplitDialog = oDialogContent;
						that.extensionAPI.attachToView(that._oNewSplitDialog);
						this._setSplit3DialogInitialState();
					}.bind(this));
			} else {
				this._setSplit3DialogInitialState();
			}

		},
		_setSplit3DialogInitialState: function () {
			var that = this,
				aFilter = [],
				aFilter2 = [];
			var obj = {
				TableList: []
			};
			var mSplit = that.getView().getModel("mSplit");
			if (mSplit) {
				mSplit.setData(obj);
			} else {
				var oJsonModel = new sap.ui.model.json.JSONModel();
				oJsonModel.setData(obj);
				that.getView().setModel(oJsonModel, "mSplit");
			}

			var pageData = this.getView().getBindingContext().getObject();
			var selSecData = that.aeUtil.getSecData(that, "OPFacet");
			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					/*beginButton: new Button({
						type: sap.m.ButtonType.Emphasized,
						text: "OK",
						press: function () { 
							this.oTempMessageDialog.close();
						}.bind(this)
					}),*/
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			} else {

				aFilter.push(new sap.ui.model.Filter({
					path: "ServiceOrder",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: pageData.ServiceOrder
				}));
				//	that._oNewSplitDialog.setBusy(true);                                       //Commented
				Fragment.byId("fragSplit3", "SplitTable").setBusy(true); //added
				that.getView().getModel().read("/ZAE_C_ServiceOrderComp_01", {
					filters: aFilter,
					success: function (oDataComp, response) {
						var selSecData = that.aeUtil.getSecData(that, "OPFacet");
						aFilter2.push(new sap.ui.model.Filter({
							path: "SalesOrganization",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: pageData.SalesOrganization
						}));
						aFilter2.push(new sap.ui.model.Filter({
							path: "ProcessType",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: pageData.ServiceDocumentType
						}));
						aFilter2.push(new sap.ui.model.Filter({
							path: "CurrentAccountingIndicator",
							operator: sap.ui.model.FilterOperator.EQ,
							value1: selSecData.BillableControl
						}));

						that.getView().getModel().read("/ZAE_I_SSODSplit", {
							filters: aFilter2,
							success: function (oDataSplit, response) {
								Fragment.byId("fragSplit3", "SplitTable").setBusy(false); //Added
								var SplitParameterList = oDataSplit.results;
								var OrderCompList = oDataComp.results;
								var selectedArray = [];
								if (selSecData instanceof Array) {
									selectedArray = selSecData;
								} else {
									selectedArray.push(selSecData);
								}
								var splitList = [];
								for (var i = 0; i < selectedArray.length; i++) {
									var operationObj = {
										Item: selectedArray[i].ServiceOrderOperation,
										HigherLevelItem: "",
										Material: selectedArray[i].OriginallyRequestedProduct,
										MaterialName: selectedArray[i].MaterialName,
										ItemQuantity: selectedArray[i].OperationQuantity,
										QuantityUnit: selectedArray[i].OperationQuantityUnit,
										CurrentAccountingIndicator: selectedArray[i].BillableControl,
										CurrentAccountingIndicatorName: selectedArray[i].BillableControlName,
										ProposedAccInd: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingIndicator : "",
										ProposedAccIndName: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingindicatorText : "",
										NewAccInd: "",
										NewAccIndVH: SplitParameterList,
										NewAccInd1: "", //Added
										NewAccIndVH1: SplitParameterList, //Added
										//	SplitCustomer: "",                        //Commented
										SplitCustomer1: "", //Added
										SplitCustomer2: "", //Added
										ProposedSplit: 100,
										EnableSelect: true, //ture, //selectedArray[i].BillableControl ? false : true,
										Customer: ""
									};
									splitList.push(operationObj);
									for (var j = 0; j < OrderCompList.length; j++) {
										if (OrderCompList[j].HigherLevelItem === selectedArray[i].ServiceOrderOperation) {
											var operationObj = {
												Item: OrderCompList[j].ServiceOrderOperation,
												HigherLevelItem: OrderCompList[j].HigherLevelItem,
												Material: OrderCompList[j].OriginallyRequestedProduct,
												MaterialName: OrderCompList[j].MaterialName,
												ItemQuantity: OrderCompList[j].OperationQuantity,
												QuantityUnit: OrderCompList[j].OperationQuantityUnit,
												CurrentAccountingIndicator: OrderCompList[j].BillableControl,
												CurrentAccountingIndicatorName: OrderCompList[j].BillableControlName,
												ProposedAccInd: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingIndicator : "",
												ProposedAccIndName: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingindicatorText : "",
												NewAccInd: "",
												NewAccIndVH: SplitParameterList,
												NewAccInd1: "", //Added
												NewAccIndVH1: SplitParameterList, //Added
												//	SplitCustomer: "",           //Commented
												SplitCustomer1: "", //Added
												SplitCustomer2: "", //Added
												ProposedSplit: 100,
												EnableSelect: true, //OrderCompList[j].BillableControl ? false : true,
												Customer: ""
											};
											splitList.push(operationObj);
										}

									}

								}
								var obj = {
									TableList: splitList,
									NewAccIndVH: SplitParameterList,
									NewAccIndVH1: SplitParameterList
								};
								that.getView().getModel("mSplit").setData(obj);
								that._oNewSplitDialog.setBusy(false);
								Fragment.byId("fragSplit3", "ColumnCustomer").setVisible(false);
								that.getView().getModel("mSplit").updateBindings(true);
								setTimeout(function () {
									Fragment.byId("fragSplit3", "SplitTable").fireModelContextChange();
								}, 100);
								/*	var ItemListTable = Fragment.byId("fragSplit3", "SplitTable");
									ItemListTable.removeSelections();*/
							},
							error: function (error) {
								that._oNewSplitDialog.setBusy(false);
								Fragment.byId("fragSplit3", "SplitTable").setBusy(false); //Added
							}
						});

					},
					error: function (error) {
						that._oNewSplitDialog.setBusy(false);
					}
				});
				this._oNewSplitDialog.open();

			}
		},
		// for Split 3 party Header
		onClickSSOD_B103: function (oEvent) {
			var that = this;
			if (!this._oNewSplitHeaderDialog) {
				Fragment.load({
						id: "fragSplitHeader",
						name: "com.globalintelli.zae_ssod.ext.fragment.Split3PartyHeader",
						controller: {

							handleBPValueHelp: function (oEvent1) {
								var pageData = that.getView().getBindingContext().getObject();
								var ServiceOrganization = pageData.ServiceOrganization;
								var SalesOrganization = pageData.SalesOrganization;
								var DistributionChannel = pageData.DistributionChannel;
								var input = oEvent1.getSource();
								// input.setTokens([]);
								var configObject = {
									entitySet: "ZAE_VH_BusinessPartner_07",
									initiallyVisibleFields: "Partner,PartnerName,BusinesspartnerGrouping,FirstName,LastName",
									selectionMode: "Single",

									tokenObject: {
										key: "Partner",
										Description: "PartnerName"
									},
									controlConfiguration: [{
										index: 0,
										key: "Partner",
										filterType: "auto",
										label: "Business Partner",
										mandatory: "auto",
										visible: true
									}, {
										index: 1,
										key: "BusinesspartnerGrouping",
										filterType: "auto",
										label: "Business Partner Grouping",
										mandatory: "auto",
										visible: true
									}, {
										index: 2,
										key: "FirstName",
										filterType: "auto",
										label: "First Name",
										mandatory: "auto",
										visible: true
									}, {
										index: 3,
										key: "LastName",
										filterType: "auto",
										label: "Last Name",
										mandatory: "auto",
										visible: true
									}],
									defaultFilter: {

									},
									onBeforeRebindSmartTable: function (oEvent) {
										var pageData = that.getView().getBindingContext().getObject();
										var mSplit = that.getView().getModel("mSplitHeader");
										var bindingobj;
										var TableRows = Fragment.byId("fragSplitHeader", "SplitTable").getItems();
										for (var i = 0; i < TableRows.length; i++) {
											if (TableRows[i].getCells()[7].getSelectedItem() !== null) {
												if (TableRows[i].getCells()[7].getSelectedItem().getKey() === "Z5") {
													bindingobj = mSplit.getProperty(TableRows[i].getCells()[7].getSelectedItem().oBindingContexts.mSplitHeader.sPath);
												}
											}
											if (TableRows[i].getCells()[6].getSelectedItem() !== null) {
												if (TableRows[i].getCells()[6].getSelectedItem().getKey() === "Z5") {
													bindingobj = mSplit.getProperty(TableRows[i].getCells()[6].getSelectedItem().oBindingContexts.mSplitHeader.sPath);
												}
											}
										}
										var aFilters = oEvent.getParameter("bindingParams").filters;
										if (bindingobj.BPSelectionRule === '2') {
											aFilters.push(new sap.ui.model.Filter({
												path: "SalesOrganization",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.SalesOrganization
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "ProcessType",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.ServiceDocumentType
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "CurrentAccountingIndicator",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.CurrentAccountingIndicator
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "AccountingIndicator",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.AccountingIndicator
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "AccountingIndicatorSplit",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.AccountingIndicatorSplit
											}));
										} else if (bindingobj.BPSelectionRule === '1') {
											aFilters.push(new sap.ui.model.Filter({
												path: "ServiceOrg",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: pageData.service_org
											}));
											aFilters.push(new sap.ui.model.Filter({
												path: "BPSelectionRule",
												operator: sap.ui.model.FilterOperator.EQ,
												value1: bindingobj.BPSelectionRule
											}));

										}
										oEvent.getParameter("bindingParams").filters = aFilters;
									}

								};
								that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
							},

							onModelContextChange: function (oEvent) {
								var self = this;
								var sId = oEvent.getParameter("id");
								var tbl = sap.ui.getCore().byId(sId);
								var header = tbl.$().find('thead');
								var selectAllCb = header.find('.sapMCb');
								selectAllCb.remove();

								tbl.getItems().forEach(function (r) {
									var obj = r.getBindingContext("mSplitHeader").getObject();
									var oStatus = obj.EnableSelect;
									var cb = r.$().find('.sapMCb');
									var oCb = sap.ui.getCore().getElementById(cb.attr('id'));
									if (oCb) {
										oCb.setEditable(oStatus);
									}
								});
								self.fnSubmitButonEnable();

							},

							fnliveChangeSplit: function (oEvent) {
								var BoolenCheck = false;
								var RowSplit = oEvent.getSource().getParent().getCells();
								var mSplit = that.getView().getModel("mSplitHeader");
								var data = mSplit.getData();
								var sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.mSplitHeader.sPath;
								var object = mSplit.getProperty(sPath);
								for (var i = 0; i < data.TableList.length; i++) {
									if (object.Item === data.TableList[i].HigherLevelItem) {
										//	data.TableList[i].SplitCustomer = object.SplitCustomer; //COmmented
										data.TableList[i].SplitCustomer1 = object.SplitCustomer1;
										data.TableList[i].SplitCustomer2 = object.SplitCustomer2;
									}

									if (Number(data.TableList[i].SplitCustomer1) > 0 && Number(data.TableList[i].SplitCustomer1) <= 100 && Number(data.TableList[
											i].SplitCustomer2) > 0 && Number(data.TableList[i].SplitCustomer2) <=
										100) {
										//	data.TableList[i].ProposedSplit = 100 - Number(data.TableList[i].SplitCustomer);
										data.TableList[i].ProposedSplit = 100 - (Number(data.TableList[i].SplitCustomer1) + Number(data.TableList[i].SplitCustomer2));
										if (data.TableList[i].ProposedSplit < 0) {
											BoolenCheck = true;
										}
									} else if (Number(data.TableList[i].SplitCustomer1) >= 100 || Number(data.TableList[i].SplitCustomer2) >= 100) {
										data.TableList[i].ProposedSplit = 100 - (Number(data.TableList[i].SplitCustomer1) + Number(data.TableList[i].SplitCustomer2));
										BoolenCheck = true;
									} else if (Number(data.TableList[i].SplitCustomer1) > 0 && Number(data.TableList[i].SplitCustomer1) <= 100) {
										data.TableList[i].ProposedSplit = 100 - Number(data.TableList[i].SplitCustomer1);

									} else {
										data.TableList[i].ProposedSplit = 100;
									}
								}
								if (BoolenCheck) {
									MessageBox.error("Split 3 should not be less than 0");
								}
								this.fnSubmitButonEnable();
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

							fnOnSelectHeaderAccInd: function (oEvent) { //Split acc indicator 2
								var BoolenCheck = false;
								var SplitTable = Fragment.byId("fragSplitHeader", "SplitTable").getItems();
								var mSplit = that.getView().getModel("mSplitHeader");
								var data = mSplit.getData();
								var SelectedItem2 = Fragment.byId("fragSplitHeader", "SplitAccountingIndicator").getSelectedItem();
								var sPath2 = SelectedItem2.oBindingContexts.mSplitHeader.sPath;
								var obj2 = mSplit.getProperty(sPath2);
								//Added for AE-4241 - partner field
								var SelectedItem3 = Fragment.byId("fragSplitHeader", "SplitAccountingIndicator1").getSelectedItem();
								if (SelectedItem3 !== null) {
									var sPath3 = SelectedItem3.oBindingContexts.mSplitHeader.sPath;
									var obj3 = mSplit.getProperty(sPath3);
								}
								for (var i = 0; i < data.TableList.length; i++) {
									data.TableList[i].NewAccInd = obj2.AccountingIndicatorSplit;
									if ((obj2.AccountingIndicatorSplit === "Z5") || (obj3 && obj3.AccountingIndicatorSplit === "Z5") || data.TableList[i].NewAccInd1 ===
										"Z5") {
										BoolenCheck = true;
										if (data.TableList[i].NewAccInd1 === "Z5" || data.TableList[i].NewAccInd === "Z5") {
											var oControlEvent = {
												"selectedItem": ""
											};
											oControlEvent["selectedItem"] = oEvent.getParameter("selectedItem");
											SplitTable[i].getCells()[11].setEnabled(true);
											SplitTable[i].getCells()[6].fireChange(oControlEvent);
										}
									} else {
										SplitTable[i].getCells()[11].setSelectedKey(null);
										SplitTable[i].getCells()[11].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
								}
								mSplit.updateBindings(true);

								if (BoolenCheck) {
									Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(true);
								} else {
									Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(false);
								}

								this.fnSubmitButonEnable();
							},
							//Added for AE-4241 Start -Split ACC Ind 3
							fnOnSelectHeaderAccInd1: function (oEvent) {
								var BoolenCheck = false;
								var mSplit = that.getView().getModel("mSplitHeader");
								var SplitTable = Fragment.byId("fragSplitHeader", "SplitTable").getItems();
								var data = mSplit.getData();
								var SelectedItem3 = Fragment.byId("fragSplitHeader", "SplitAccountingIndicator1").getSelectedItem(); //Added
								var sPath3 = SelectedItem3.oBindingContexts.mSplitHeader.sPath;
								var obj3 = mSplit.getProperty(sPath3);
								var SelectedItem2 = Fragment.byId("fragSplitHeader", "SplitAccountingIndicator").getSelectedItem();
								if (SelectedItem2 !== null) {
									var sPath2 = SelectedItem2.oBindingContexts.mSplitHeader.sPath;
									var obj2 = mSplit.getProperty(sPath2);
								}
								for (var i = 0; i < data.TableList.length; i++) {
									data.TableList[i].NewAccInd1 = obj3.AccountingIndicatorSplit;
									if ((obj3.AccountingIndicatorSplit === "Z5") || (obj2 && obj2.AccountingIndicatorSplit === "Z5") || data.TableList[i].NewAccInd ===
										"Z5" || data.TableList[i].NewAccInd1 === "Z5") {
										BoolenCheck = true;
										if (data.TableList[i].NewAccInd1 === "Z5" || data.TableList[i].NewAccInd === "Z5") {
											var oControlEvent = {
												"selectedItem": ""
											};
											oControlEvent["selectedItem"] = oEvent.getParameter("selectedItem");
											SplitTable[i].getCells()[11].setEnabled(true);
											SplitTable[i].getCells()[7].fireChange(oControlEvent);
										}
									} else {
										SplitTable[i].getCells()[11].setSelectedKey(null);
										SplitTable[i].getCells()[11].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
								}
								mSplit.updateBindings(true);
								if (BoolenCheck) {
									Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(true);
								} else {
									Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(false);
								}
								this.fnSubmitButonEnable();
							},
							//Added for AE-4241 End
							fnSplitTableSelectionChange: function () {
								this.fnSubmitButonEnable();
							},

							fnNewAccIndSelectionChange2: function (oEvent) {
								var pageData = that.getView().getBindingContext().getObject();
								var mSplit = that.getView().getModel("mSplitHeader");
								var data = mSplit.getData();
								var PartnerVH = [];
								var BoolenCheck = false;

								var bindingobj = that.getView().getModel("mSplitHeader").getProperty("/TableList/0/NewAccIndVH").find(function (obj) {
									return obj.AccountingIndicatorSplit === oEvent.getParameter("selectedItem").getKey();
								});
								// var SSODSplit = that.getView().getModel("mSplitHeader").getProperty(oEvent.getParameter("selectedItem").mBindingInfos.key.binding
								// 	.oContext.sPath);
								var BusinessPartnerCell = oEvent.getSource().getParent().getCells();
								if (oEvent.getParameter("selectedItem").getKey() !== 'Z5' && BusinessPartnerCell[7].getSelectedKey() === "Z5") {
									bindingobj = that.getView().getModel("mSplitHeader").getProperty(BusinessPartnerCell[7].getSelectedItem().mBindingInfos.key
										.binding
										.oContext
										.sPath);
								}
								for (var i = 0; i < data.TableList.length; i++) {
									if (data.TableList[i].NewAccInd === "Z5" || data.TableList[i].NewAccInd1 === "Z5") {
										//read ZAE_I_SSODSplit with key fields in data.TableList[i]
										BoolenCheck = true;

										// var aFilters1 = [];

										// if (bindingobj.BPSelectionRule === '2' || data.TableList[i].NewAccInd1 === "Z5") {
										// 	aFilters1.push(new Filter("SalesOrganization", "EQ", pageData.SalesOrganization));
										// 	aFilters1.push(new Filter("ProcessType", "EQ", pageData.ServiceDocumentType));
										// 	aFilters1.push(new Filter("CurrentAccountingIndicator", "EQ", bindingobj.CurrentAccountingIndicator));
										// 	aFilters1.push(new Filter("AccountingIndicator", "EQ", bindingobj.AccountingIndicator));
										// 	aFilters1.push(new Filter("AccountingIndicatorSplit", "EQ", bindingobj.AccountingIndicatorSplit));
										// } else if (bindingobj.BPSelectionRule === '1' || data.TableList[i].NewAccInd1 === "Z5") {
										// 	aFilters1.push(new Filter("ServiceOrg", "EQ", pageData.service_org));
										// 	aFilters1.push(new Filter("BPSelectionRule", "EQ", bindingobj.BPSelectionRule));
										// }
										// if (BusinessPartnerCell[11]) {
										// 	BusinessPartnerCell[11].getBinding("items").filter(aFilters1);
										// }
									} else {
										//	BusinessPartner[11].setEnabled(false);
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
									//		this.fnSubmitButonEnable();
									if (BoolenCheck) {
										Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(true);
									} else {
										Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(false);
									}
								}
								if (oEvent.getParameter("selectedItem").getKey() === "Z5" || BusinessPartnerCell[7].getSelectedKey() ===
									"Z5") {
									BusinessPartnerCell[11].setEnabled(true);
								} else {
									BusinessPartnerCell[11].setValue("");
									BusinessPartnerCell[11].setEnabled(false);
								}

								this.fnSubmitButonEnable();
							},

							fnNewAccIndSelectionChange3: function (oEvent) {
								var pageData = that.getView().getBindingContext().getObject();
								var mSplit = that.getView().getModel("mSplitHeader");
								var data = mSplit.getData();
								var BoolenCheck = false;
								var bindingobj = that.getView().getModel("mSplitHeader").getProperty("/TableList/0/NewAccIndVH1").find(function (obj) {
									return obj.AccountingIndicatorSplit === oEvent.getParameter("selectedItem").getKey();
								});
								// var SSODSplit = that.getView().getModel("mSplitHeader").getProperty(oEvent.getParameter("selectedItem").mBindingInfos.key.binding
								// 	.oContext.sPath);
								var BusinessPartnerCell = oEvent.getSource().getParent().getCells();
								if (oEvent.getParameter("selectedItem").getKey() !== 'Z5' && BusinessPartnerCell[6].getSelectedKey() === "Z5") {
									bindingobj = that.getView().getModel("mSplitHeader").getProperty(BusinessPartnerCell[6].getSelectedItem().mBindingInfos.key
										.binding
										.oContext
										.sPath);
								}
								for (var i = 0; i < data.TableList.length; i++) {
									if (data.TableList[i].NewAccInd1 === "Z5" || data.TableList[i].NewAccInd === "Z5") {
										BoolenCheck = true;
										// var aFilters1 = [];
										// if (bindingobj.BPSelectionRule === '2' || data.TableList[i].NewAccInd === "Z5") {
										// 	aFilters1.push(new Filter("SalesOrganization", "EQ", pageData.SalesOrganization));
										// 	aFilters1.push(new Filter("ProcessType", "EQ", pageData.ServiceDocumentType));
										// 	aFilters1.push(new Filter("CurrentAccountingIndicator", "EQ", bindingobj.CurrentAccountingIndicator));
										// 	aFilters1.push(new Filter("AccountingIndicator", "EQ", bindingobj.AccountingIndicator));
										// 	aFilters1.push(new Filter("AccountingIndicatorSplit", "EQ", bindingobj.AccountingIndicatorSplit));
										// } else if (bindingobj.BPSelectionRule === '1' || data.TableList[i].NewAccInd === "Z5") {
										// 	aFilters1.push(new Filter("ServiceOrg", "EQ", pageData.service_org));
										// 	aFilters1.push(new Filter("BPSelectionRule", "EQ", bindingobj.BPSelectionRule));
										// }
										// if (BusinessPartnerCell[11]) {
										// 	BusinessPartnerCell[11].getBinding("items").filter(aFilters1);
										// }
									} else {
										if (!BoolenCheck) {
											BoolenCheck = false;
										}
									}
									//		this.fnSubmitButonEnable();

									if (BoolenCheck) {
										Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(true);
									} else {
										Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(false);
									}

								}
								if (BusinessPartnerCell[6].getSelectedKey() === "Z5" || oEvent.getParameter("selectedItem").getKey() === "Z5") {
									BusinessPartnerCell[11].setEnabled(true);
								} else {
									BusinessPartnerCell[11].setValue("");
									BusinessPartnerCell[11].setEnabled(false);
								}

								// var BusinessPartner = oEvent.getSource().getParent().getCells();
								// if (BusinessPartner[6].getSelectedKey() === "Z5" || BusinessPartner[7].getSelectedKey() === "Z5") {
								// 	BusinessPartner[11].setEnabled(true);
								// } else {
								// 	BusinessPartner[11].setEnabled(false);
								// }
								this.fnSubmitButonEnable();
							},

							fnSubmitButonEnable: function () {

								var mSplit = that.getView().getModel("mSplitHeader");
								var SelectedItem = Fragment.byId("fragSplitHeader", "SplitAccountingIndicator").getSelectedItem();
								var SelectedItem1 = Fragment.byId("fragSplitHeader", "SplitAccountingIndicator1").getSelectedItem(); //Added
								if (mSplit && SelectedItem && SelectedItem1) {
									var data = mSplit.getData();
									var sPath = SelectedItem.oBindingContexts.mSplitHeader.sPath;
									var object = mSplit.getProperty(sPath);
									//Added for AE-4241 Start
									var sPath1 = SelectedItem1.oBindingContexts.mSplitHeader.sPath;
									var object1 = mSplit.getProperty(sPath1);
									//Added for AE-4241 End
								}

								var ItemListTable = Fragment.byId("fragSplitHeader", "SplitTable");
								if (ItemListTable.getSelectedItems().length > 0) {
									var BoolSubmitEnable = true;
									ItemListTable.getSelectedItems().forEach(function (r) {

										var obj = r.getBindingContext("mSplitHeader").getObject();
										//	if (!obj.NewAccInd || !obj.SplitCustomer || (object && object.AccountingIndicatorSplit === "Z1" && !obj.Customer)) //Commented
										if (!obj.NewAccInd || !obj.NewAccInd1 || !obj.SplitCustomer1 || !obj.SplitCustomer2 || (object && object.AccountingIndicatorSplit ===
												"Z1" && !obj.Customer) || (object1 && object1.AccountingIndicatorSplit === "Z1" && !obj.Customer) || obj.ProposedSplit <
											0) {
											BoolSubmitEnable = false;
										}
										//Added for AE-4241 Start
										if (((obj.ProposedAccInd != obj.NewAccInd) && (obj.ProposedAccInd != obj.NewAccInd1)) && (obj.NewAccInd != obj.NewAccInd1) &&
											obj.ProposedSplit > 0) {
											BoolSubmitEnable = true;
										} else {
											BoolSubmitEnable = false;
										}
										//Added for AE-4241 End
									});
									Fragment.byId("fragSplitHeader", "IDSubmit").setEnabled(BoolSubmitEnable);
								} else {
									Fragment.byId("fragSplitHeader", "IDSubmit").setEnabled(false);
								}

							},

							onSubmitPressed: function () {
								var ItemListTable = Fragment.byId("fragSplitHeader", "SplitTable");
								var aCondValue0 = [],
									itemText = "",
									findUnSelectedItems = [];
								ItemListTable.getItems().forEach(function (r) {
									var tableRowObj = r.getBindingContext("mSplitHeader").getObject();
									if (Number(tableRowObj.SplitCustomer) > 0) {
										findUnSelectedItems.push(r);
									}
								});

								if (ItemListTable.getSelectedItems().length > 0) {
									ItemListTable.getSelectedItems().forEach(function (r) {
										var tableRowObj = r.getBindingContext("mSplitHeader").getObject();
										/*										if (Number(tableRowObj.SplitCustomer) === 0) {
																					var obj = {
																						NumberInt: tableRowObj.Item,
																						HigherLevelItem: tableRowObj.HigherLevelItem,
																						Material: tableRowObj.Material,
																						Qty: tableRowObj.ItemQuantity,
																						Uom: tableRowObj.QuantityUnit,
																						AcInd: tableRowObj.ProposedAccInd,
																						AcIndSplt: tableRowObj.NewAccInd,
																						CondValue: tableRowObj.SplitCustomer,
																						Partner: ""
																					};
																					itemText = itemText + tableRowObj.Item + ", ";
																					aCondValue0.push(obj);
																				}*/
										if (Number(tableRowObj.SplitCustomer1) === 0 || Number(tableRowObj.SplitCustomer2) === 0) {
											var obj = {
												NumberInt: tableRowObj.Item,
												HigherLevelItem: tableRowObj.HigherLevelItem,
												Material: tableRowObj.Material,
												Qty: tableRowObj.ItemQuantity,
												Uom: tableRowObj.QuantityUnit,
												AcInd: tableRowObj.ProposedAccInd,
												//	AcIndSplt: tableRowObj.NewAccInd,
												AcIndSplt2: tableRowObj.NewAccInd,
												AcIndSplt3: tableRowObj.NewAccInd1,
												//	CondValue: tableRowObj.SplitCustomer,
												CondValue: tableRowObj.SplitCustomer1 !== "" ? tableRowObj.SplitCustomer1 : "0",
												CondValue1: tableRowObj.SplitCustomer2 !== "" ? tableRowObj.SplitCustomer2 : "0",
												Partner: ""
											};
											itemText = itemText + tableRowObj.Item + ", ";
											aCondValue0.push(obj);
										}
										var tempArray = [];
										for (var i = 0; i < findUnSelectedItems.length; i++) {
											if (findUnSelectedItems[i].sId !== r.sId) {
												tempArray.push(findUnSelectedItems[i]);
											}

										}
										findUnSelectedItems = tempArray;

									});

								} else {
									var msg2 = "Kindly Select Items";
									var oMessageStrip = Fragment.byId("fragSplitHeader", "SSOD_B103MessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(msg2);
									return;
								}

								if (aCondValue0.length > 0 || findUnSelectedItems.length > 0) {
									var text = "";
									if (aCondValue0.length > 0) {
										text = "Item " + itemText + " having split 0 100 Pls confirm...";
									}
									if (findUnSelectedItems.length > 0) {
										text = " Some of the items not selected whit Split to is grater than 0 \n " + text;
									}
									this.oConfirmationMessageDialog = new sap.m.Dialog({
										type: sap.m.DialogType.Message,
										title: "Information",
										state: sap.ui.core.ValueState.Information,
										content: new Text({
											text: text
										}),
										beginButton: new Button({
											type: sap.m.ButtonType.Emphasized,
											text: "OK",
											press: function () {
												this.fnPressSubmit();
												this.oConfirmationMessageDialog.close();
											}.bind(this)
										}),
										endButton: new Button({
											type: sap.m.ButtonType.Default,
											text: "Cancel",
											press: function () {
												this.oConfirmationMessageDialog.close();
											}.bind(this)
										})
									});
									this.oConfirmationMessageDialog.open();
								} else {
									this.fnPressSubmit();
								}
							},

							fnPressSubmit: function () {
								var actId = "SSOD_B103";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var pageData = that.getView().getBindingContext().getObject();
								//	var oModel = that.getView().getModel("ZAE_FM_SSOD_ITEM_SPLIT_SRV");
								var oModel = that.getView().getModel('Split3Preview');
								//	var oEntity = "ZAE_FM_SSOD_ITEM_SPLITSet";
								var oEntity = "ZAE_FM_SSOD_ITEM_SPLIT_01Set";
								var NavSplitMain = [{
									ObjectId: pageData.ServiceOrder
								}];

								var NavSplitItems = [];
								var ItemListTable = Fragment.byId("fragSplitHeader", "SplitTable");
								if (ItemListTable.getSelectedItems().length > 0) {
									ItemListTable.getSelectedItems().forEach(function (r) {
										var tableRowObj = r.getBindingContext("mSplitHeader").getObject();
										var obj = {
											NumberInt: tableRowObj.Item,
											Higherlevelitem: tableRowObj.HigherLevelItem,
											Material: tableRowObj.Material,
											Qty: tableRowObj.ItemQuantity,
											Uom: tableRowObj.QuantityUnit,
											AcInd: tableRowObj.ProposedAccInd,
											//	AcIndSplt: tableRowObj.NewAccInd,
											AcIndSplt2: tableRowObj.NewAccInd,
											AcIndSplt3: tableRowObj.NewAccInd1,
											//	CondValue: tableRowObj.SplitCustomer,
											CondValue: tableRowObj.SplitCustomer1 !== "" ? tableRowObj.SplitCustomer1 : "0",
											CondValue1: tableRowObj.SplitCustomer2 !== "" ? tableRowObj.SplitCustomer2 : "0",
											Partner: tableRowObj.Customer
										};
										NavSplitItems.push(obj);
									});

								} else {
									var msg2 = "Kindly Select Items";
									var oMessageStrip = Fragment.byId("fragSplitHeader", "SSOD_B103MessageStrip");
									oMessageStrip.setVisible(true);
									oMessageStrip.setText(msg2);
									return;
								}

								var data = [{
									callProperty: "NavSplitMain",
									value: NavSplitMain
								}, {
									callProperty: "NavSplitItems",
									value: NavSplitItems
								}];

								var succFunc = function (oData, response) {
									that.aeUtil.refreshControlModel(that.getView());
								}.bind(that);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);
								that._oNewSplitHeaderDialog.close();
								that._oNewSplitHeaderDialog.destroy();
								that._oNewSplitHeaderDialog = null;
							},
							onCancelPressed: function () {
								that._oNewSplitHeaderDialog.close();
								that._oNewSplitHeaderDialog.destroy();
								that._oNewSplitHeaderDialog = null;
							}

						}
					})
					.then(function (oDialogContent) {
						that._oNewSplitHeaderDialog = oDialogContent;
						that.extensionAPI.attachToView(that._oNewSplitHeaderDialog);
						this._setSplitHeaderDialogInitialState();
					}.bind(this));
			} else {
				this._setSplitHeaderDialogInitialState();
			}
		},
		_setSplitHeaderDialogInitialState: function () {
			var that = this,
				aFilter = [],
				aFilter2 = [];
			var obj = {
				TableList: []
			};
			var mSplit = that.getView().getModel("mSplitHeader");
			if (mSplit) {
				mSplit.setData(obj);
			} else {
				var oJsonModel = new sap.ui.model.json.JSONModel();
				oJsonModel.setData(obj);
				that.getView().setModel(oJsonModel, "mSplitHeader");
			}

			var pageData = this.getView().getBindingContext().getObject();
			aFilter.push(new sap.ui.model.Filter({
				path: "ServiceOrder",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.ServiceOrder
			}));
			Fragment.byId("fragSplitHeader", "SplitTable").setBusy(true);
			that.getView().getModel().read("/ZAE_C_ServiceOrderOP_01", {
				filters: aFilter,
				success: function (oDataOrderOP, response) {
					oDataOrderOP = oDataOrderOP.results.filter(function (obj) {
						return obj.isShowSSOD_B104 === true
					});
					that.getView().getModel().read("/ZAE_C_ServiceOrderComp_01", {
						filters: aFilter,
						success: function (oDataComp, response) {
							aFilter2.push(new sap.ui.model.Filter({
								path: "SalesOrganization",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.SalesOrganization
							}));
							aFilter2.push(new sap.ui.model.Filter({
								path: "ProcessType",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.ServiceDocumentType
							}));
							that.getView().getModel().read("/ZAE_I_SSODSplit", {
								filters: aFilter2,
								success: function (oDataSplit, response) {
									Fragment.byId("fragSplitHeader", "SplitTable").setBusy(false);
									var SplitParameterList = oDataSplit.results;
									var OrderCompList = oDataComp.results;
									var selectedArray = oDataOrderOP;
									var splitList = [];
									var PartnerVH = [];
									for (var i = 0; i < selectedArray.length; i++) {
										var FilteredData = SplitParameterList.filter(function (obj) {
											return obj.CurrentAccountingIndicator === selectedArray[i].BillableControl;
										});
										var operationObj = {
											Item: selectedArray[i].ServiceOrderOperation,
											HigherLevelItem: "",
											Material: selectedArray[i].OriginallyRequestedProduct,
											MaterialName: selectedArray[i].MaterialName,
											ItemQuantity: selectedArray[i].OperationQuantity,
											QuantityUnit: selectedArray[i].OperationQuantityUnit,
											CurrentAccountingIndicator: selectedArray[i].BillableControl,
											CurrentAccountingIndicatorName: selectedArray[i].BillableControlName,
											ProposedAccInd: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingIndicator : "",
											ProposedAccIndName: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingindicatorText : "",
											NewAccInd: "",
											// NewAccIndVH: SplitParameterList,
											NewAccIndVH: FilteredData,
											NewAccInd1: "", //Added
											NewAccIndVH1: FilteredData,
											//	SplitCustomer: "",
											SplitCustomer1: "",
											SplitCustomer2: "",
											ProposedSplit: 100,
											EnableSelect: true, //selectedArray[i].BillableControl ? false : true,
											Customer: "",
											PartnerVH: []
										};
										splitList.push(operationObj);
										for (var j = 0; j < OrderCompList.length; j++) {
											if (OrderCompList[j].HigherLevelItem === selectedArray[i].ServiceOrderOperation) {
												FilteredData = SplitParameterList.filter(function (obj) {
													return obj.CurrentAccountingIndicator === selectedArray[i].BillableControl;
												});

												var operationObj = {
													Item: OrderCompList[j].ServiceOrderOperation,
													HigherLevelItem: OrderCompList[j].HigherLevelItem,
													Material: OrderCompList[j].OriginallyRequestedProduct,
													MaterialName: OrderCompList[j].MaterialName,
													ItemQuantity: OrderCompList[j].OperationQuantity,
													QuantityUnit: OrderCompList[j].OperationQuantityUnit,
													CurrentAccountingIndicator: OrderCompList[j].BillableControl,
													CurrentAccountingIndicatorName: OrderCompList[j].BillableControlName,
													ProposedAccInd: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingIndicator : "",
													ProposedAccIndName: SplitParameterList.length > 0 ? SplitParameterList[0].AccountingindicatorText : "",
													NewAccInd: "",
													NewAccIndVH: FilteredData, //SplitParameterList,
													NewAccInd1: "",
													NewAccIndVH1: FilteredData,
													//	SplitCustomer: "",
													SplitCustomer1: "",
													SplitCustomer2: "",
													ProposedSplit: 100,
													EnableSelect: true, //OrderCompList[j].BillableControl ? false : true,
													Customer: "",
													PartnerVH: []
												};
												splitList.push(operationObj);
											}

										}

									}
									SplitParameterList.sort(function (a, b) {
										return a.AccountingIndicatorSplit.localeCompare(b.AccountingIndicatorSplit);
									});
									var unique = [...new Map(SplitParameterList.map((m) => [m.AccountingIndicatorSplit, m])).values()];
									var obj = {
										TableList: splitList,
										NewAccIndVH: unique, //SplitParameterList
										NewAccIndVH1: unique //Added
									};
									that.getView().getModel("mSplitHeader").setData(obj);
									that._oNewSplitHeaderDialog.setBusy(false);
									Fragment.byId("fragSplitHeader", "ColumnCustomer").setVisible(false);
									that.getView().getModel("mSplitHeader").updateBindings(true);
									setTimeout(function () {
										Fragment.byId("fragSplitHeader", "SplitTable").fireModelContextChange();
									}, 100);
								},
								error: function (error) {
									Fragment.byId("fragSplitHeader", "SplitTable").setBusy(false);
									that._oNewSplitHeaderDialog.setBusy(false);
								}
							});

						},
						error: function (error) {
							that._oNewSplitHeaderDialog.setBusy(false);
						}
					});

				},
				error: function (error) {
					that._oNewSplitHeaderDialog.setBusy(false);
				}
			});
			this._oNewSplitHeaderDialog.open();
		},
		onClickSSOD_B96: function (oEvent) {
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.ManualDiscount";
			var selSecData = this.aeUtil.getSecData(this, "OPFacet");
			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			}
			var that = this;

			if (!this._oApplyDiscountPopover) {
				this._oApplyDiscountPopover = sap.ui.xmlfragment(this.getView().getId(), fragName, {
					onClickSSOD_B105: function (oEvent) {
						that.fnLoadDiscountLevels("LS1");
					},
					onClickSSOD_B106: function (oEvent) {
						that.fnLoadDiscountLevels("LS2");
					},
					onClickSSOD_B107: function (oEvent) {
						that.fnLoadDiscountLevels("LS3");
					},
					onClickSSOD_B108: function (oEvent) {
						that.fnLoadDiscountLevels("LS4");
					},
					onClickSSOD_B109: function (oEvent) {
						that.fnLoadDiscountLevels("LS5");
					}
				});
				this.getView().addDependent(this._oApplyDiscountPopover);
				this._oApplyDiscountPopover.attachBeforeOpen(function (oEvent) {
					var selSecData = this.aeUtil.getSecData(that, "OPFacet");

					if (selSecData.isShowSSOD_B105 !== undefined) {
						oEvent.getSource().getButtons()[0].setVisible(selSecData.isShowSSOD_B105);
					}

					if (selSecData.isShowSSOD_B106 !== undefined) {
						oEvent.getSource().getButtons()[1].setVisible(selSecData.isShowSSOD_B106);
					}

					if (selSecData.isShowSSOD_B107 !== undefined) {
						oEvent.getSource().getButtons()[2].setVisible(selSecData.isShowSSOD_B107);
					}
					if (selSecData.isShowSSOD_B108 !== undefined) {
						oEvent.getSource().getButtons()[3].setVisible(selSecData.isShowSSOD_B108);
					}
					if (selSecData.isShowSSOD_B109 !== undefined) {
						oEvent.getSource().getButtons()[4].setVisible(selSecData.isShowSSOD_B109);
					}

					setTimeout(function () {}, 1000);

				}, this);
			}
			this._oApplyDiscountPopover.setModel(this.getView().getModel());
			var pop = oEvent.getSource();
			this._oApplyDiscountPopover.openBy(pop);
		},
		fnLoadDiscountLevels: function (DiscountLevels) {

			var that = this;
			var aFilters = [];
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			var oButton = this.getView().byId(this.createId("SSOD_B96Button"));
			var pageData = this.getView().getBindingContext().getObject();
			oButton.setBusy(true);
			// var oSelSecData = oData.results[0];
			var aFilters2 = [];
			aFilters2.push(new Filter("SalesOffice", "EQ", pageData.SalesOffice));
			aFilters2.push(new Filter("SalesGroup", "EQ", pageData.SalesGroup));
			aFilters2.push(new Filter("TransactionType", "EQ", pageData.ServiceDocumentType));
			aFilters2.push(new Filter("ItemCategoryGroup", "EQ", selSecData.ItemCategoryGroup));
			// aFilters2.push(new Filter("TransactionType", "EQ", 'ZORP'));
			// aFilters2.push(new Filter("ItemCategoryGroup", "EQ", 'LEIS'));
			that.getView().getModel().read("/ZAE_I_TC_SSOD_12", {
				filters: aFilters2,
				success: function (oDataDL, responseDL) {
					oButton.setBusy(false);
					var DiscountData = {},
						L1DiscountFrom,
						L1DiscountTo,
						L2DiscountFrom,
						L2DiscountTo,
						L3DiscountFrom,
						L3DiscountTo,
						L4DiscountFrom,
						L4DiscountTo,
						L5DiscountFrom,
						L5DiscountTo;
					if (oDataDL.results.length > 0) {
						for (var i = 0; i < oDataDL.results.length; i++) {
							var oDisLevels = oDataDL.results[i];
							if (oDataDL.results[i].Levels === 'LS1') {
								L1DiscountFrom = Number(oDisLevels.DiscountFrom);
								L1DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LS2') {
								L2DiscountFrom = Number(oDisLevels.DiscountFrom);
								L2DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LS3') {
								L3DiscountFrom = Number(oDisLevels.DiscountFrom);
								L3DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LS4') {
								L4DiscountFrom = Number(oDisLevels.DiscountFrom);
								L4DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LS5') {
								L5DiscountFrom = Number(oDisLevels.DiscountFrom);
								L5DiscountTo = Number(oDisLevels.DiscountTo);
							}

							if (oDisLevels.Levels === DiscountLevels) {
								DiscountData = oDisLevels;
								// DiscountData.L1DiscountValue = Number(oSelSecData.L1DiscountValue);
								// DiscountData.SpecialDiscount = Number(oSelSecData.Discount);
								// // if (DiscountData.ZRule === '1') {
								// //Percentage
								// DiscountData.DiscountFrom = Number(oDisLevels.DiscountFrom);
								// DiscountData.DiscountTo = Number(oDisLevels.DiscountTo);
								// DiscountData.value = Number(DiscountData.DiscountFrom);
								// DiscountData.SliderValue = Number(DiscountData.value);
								// DiscountData.WorkEstimate = selSecData.WorkEstimate;
								// DiscountData.WorkEstimateItem = selSecData.WorkEstimateItem;
								// DiscountData.Subtotal1Amount = Number(selSecData.OperationQuantity) != 0 ? Number(selSecData.GrossValue) / Number(
								// 	selSecData.OperationQuantity) : Number(selSecData.GrossValue);
								// DiscountData.NetAfterDiscount = Number(DiscountData.GrossValue) - (DiscountData.L1DiscountValue + DiscountData
								// 	.L2DiscountValue +
								// 	DiscountData.L3DiscountValue + DiscountData.OEMDiscount + DiscountData.SpecialDiscount);
								// var oDiscountAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.value)) / 100;
								// DiscountData.DiscountValue = oDiscountAmt.toFixed(3);
								// DiscountData.NetValue = Number(DiscountData.Subtotal1Amount) - Number(DiscountData.Discount);
								// DiscountData.NetAfterProposed = 0;

								DiscountData.L1DiscountValue = 0;
								DiscountData.SpecialDiscount = 0;
								// if (DiscountData.ZRule === '1') {
								//Percentage
								DiscountData.DiscountFrom = Number(oDisLevels.DiscountFrom);
								DiscountData.DiscountTo = Number(oDisLevels.DiscountTo);
								DiscountData.value = Number(DiscountData.DiscountFrom);
								DiscountData.SliderValue = Number(DiscountData.value);
								DiscountData.WorkEstimate = selSecData.WorkEstimate;
								DiscountData.WorkEstimateItem = selSecData.WorkEstimateItem;
								DiscountData.Subtotal1Amount = Number(selSecData.OperationQuantity) != 0 ? Number(selSecData.GrossValue) / Number(
									selSecData.OperationQuantity) : Number(selSecData.GrossValue);
								DiscountData.CurrentDiscount = Number(selSecData.Discount);
								DiscountData.CurrentDiscountPer = (DiscountData.CurrentDiscount / Number(selSecData.GrossValue)) * 100;
								DiscountData.NetAfterDiscount = Number(DiscountData.Subtotal1Amount) - DiscountData.CurrentDiscount;
								DiscountData.value = 0;
								DiscountData.DiscountValue = 0;
								DiscountData.NetAfterProposed = 0;

							}

						}
						if (L1DiscountFrom && L1DiscountTo) {
							DiscountData.L1DiscountFrom = L1DiscountFrom;
							DiscountData.L1DiscountTo = L1DiscountTo;
							DiscountData.L1Visible = true
						} else {
							DiscountData.L1Visible = false
						}
						if (L2DiscountFrom && L2DiscountFrom) {
							DiscountData.L2DiscountFrom = L2DiscountFrom;
							DiscountData.L2DiscountTo = L2DiscountTo;
							DiscountData.L2Visible = true
						} else {
							DiscountData.L2Visible = false
						}
						if (L3DiscountFrom && L3DiscountFrom) {
							DiscountData.L3DiscountFrom = L3DiscountFrom;
							DiscountData.L3DiscountTo = L3DiscountTo;
							DiscountData.L3Visible = true
						} else {
							DiscountData.L3Visible = false
						}
						if (L4DiscountFrom && L4DiscountTo) {
							DiscountData.L4DiscountFrom = L4DiscountFrom;
							DiscountData.L4DiscountTo = L4DiscountTo;
							DiscountData.L4Visible = true
						} else {
							DiscountData.L4Visible = false
						}
						if (L5DiscountFrom && L5DiscountTo) {
							DiscountData.L5DiscountFrom = L5DiscountFrom;
							DiscountData.L5DiscountTo = L5DiscountTo;
							DiscountData.L5Visible = true
						} else {
							DiscountData.L5Visible = false
						}

						var oModel = that.getView().getModel("mApplyDiscount");
						oModel.setData(DiscountData);
						that.fnLoadDiscountPopup();

					} else {
						var MsgErr4 = that.getView().getModel("i18n").getResourceBundle().getText("KindlyMaintainDataInSSOD");
						MessageBox.error(MsgErr4);
					}
				},
				error: function (oError) {
					oButton.setBusy(false);
					var MsgErrBox2 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorInDiscountLevel");
					MessageBox.error(MsgErrBox2);
				}
			});

		},
		fnLoadDiscountPopup: function () {
			var that = this;

			that.byId(that.createId("SSOD_B96Button")).setBusy(false);
			if (!this._oNewDiscountDialog) {
				Fragment.load({
						id: "fragDiscount",
						name: "com.globalintelli.zae_ssod.ext.fragment.Discount",
						controller: {
							_fnCalDiscValue: function () {
								var selSecData = that.aeUtil.getSecData(that, "OPFacet");
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountData = mApplyDiscount.getData();
								//Percentage
								var oDiscountAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.SliderValue)) / 100;
								DiscountData.value = DiscountData.SliderValue;
								DiscountData.DiscountValue = (oDiscountAmt * Number(selSecData.OperationQuantity)).toFixed(2);
								// DiscountData.NetValue = Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue);
								DiscountData.NetAfterProposed = (Number(selSecData.GrossValue) - Number(DiscountData.DiscountValue)).toFixed(2);
								// DiscountData.NetAfterProposed = (DiscountData.NetAfterProposed * Number(selSecData.OperationQuantity)).tofixed(2);
								this._SubmitButtonValidation();
							},
							_onInputDiscountValue: function (oEvent) {
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountData = mApplyDiscount.getData();
								var DiscountValueMSGStrip = Fragment.byId("fragDiscount", "applyDiscountMessageStrip");
								var oDiscountToAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountTo)) / 100;
								var oDiscountFromAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountFrom)) / 100;
								var MsgTextDis = that.getView().getModel("i18n").getResourceBundle().getText("Discountbeyondnotpermitted", [DiscountData.DiscountValue]);
								var MsgTextDisLess = that.getView().getModel("i18n").getResourceBundle().getText("Discountlessthennotpermitted", [
									DiscountData.DiscountValue
								]);
								var oSubmitButton = Fragment.byId("fragDiscount", "IDSubmitButton");
								if (Number(DiscountData.DiscountValue) > oDiscountToAmt) {
									//show waring msg 
									DiscountData.value = DiscountData.DiscountTo;
									DiscountData.SliderValue = DiscountData.DiscountTo;
									this._fnCalDiscValue();
									DiscountValueMSGStrip.setText(MsgTextDis);
									DiscountValueMSGStrip.setType("Warning");
									DiscountValueMSGStrip.setVisible(true);

								} else if (Number(DiscountData.DiscountValue) < oDiscountFromAmt) {
									DiscountData.value = DiscountData.DiscountFrom;
									DiscountData.SliderValue = DiscountData.DiscountFrom;
									this._fnCalDiscValue();
									DiscountValueMSGStrip.setText(MsgTextDisLess);
									DiscountValueMSGStrip.setType("Warning");
									DiscountValueMSGStrip.setVisible(true);
								} else {
									DiscountValueMSGStrip.setVisible(false);
									var Discount = (Number(DiscountData.DiscountValue) * 100) / Number(DiscountData.Subtotal1Amount);
									DiscountData.value = Discount.toFixed(2);
									DiscountData.SliderValue = Number(DiscountData.value);
									DiscountData.NetValue = Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue);
									DiscountData.NetAfterProposed = (Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue)).toFixed(2);
								}

								if (Number(DiscountData.DiscountValue) >= oDiscountFromAmt && Number(DiscountData.DiscountValue) <= oDiscountToAmt) {
									oSubmitButton.setEnabled(true);
								} else {
									oSubmitButton.setEnabled(false);
								}

							},
							_SubmitButtonValidation: function (oEvent) {
								var StepInput = Fragment.byId("fragDiscount", "DiscountSlider");
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountValue = Fragment.byId("fragDiscount", "Discountvalue").getValue();
								var DiscountData = mApplyDiscount.getData();
								// var slider = Fragment.byId("fragDiscount", "DiscountSlider");
								var oSubmitButton = Fragment.byId("fragDiscount", "IDSubmitButton");
								// var Text = Fragment.byId("fragDiscount", "TextInput").getValue();
								/*var oDiscountToAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountTo)) / 100;
								var oDiscountFromAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountFrom)) / 100;
								if (Number(DiscountValue) >= oDiscountFromAmt && Number(DiscountValue) <= oDiscountToAmt) {
									oSubmitButton.setEnabled(true);
								} else {
									oSubmitButton.setEnabled(false);
								}*/

								if (StepInput.getValue() >= Number(DiscountData.DiscountFrom) && StepInput.getValue() <= Number(DiscountData.DiscountTo)) {
									oSubmitButton.setEnabled(true);
									StepInput.setValueState("None");
								} else {
									oSubmitButton.setEnabled(false);
								}
								// if (Text === "") {
								// 	oSubmitButton.setEnabled(false);
								// } else {
								// 	oSubmitButton.setEnabled(true);
								// }

							},
							onSubmitPressed: function () {
								// this._onInputDiscountValue();
								var StepInput = Fragment.byId("fragDiscount", "DiscountSlider");
								if (StepInput.getValue() > StepInput.getMax() || StepInput.getValue() < StepInput.getMin()) {
									return;
								}
								var selSecData = that.aeUtil.getSecData(that, "OPFacet");
								var actId = "SSOD_B96";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var oModelApplyDiscount = that.getView().getModel("mApplyDiscount");
								var oModelApplyDiscountData = oModelApplyDiscount.getData();
								// var vText = Fragment.byId("fragDiscount", "TextInput").getValue();
								that.getView().getModel("mNotes").setProperty("/nItemData", []);
								// that.checkNotes(vText);
								// var TextData = that.getView().getModel("mNotes").getData();
								var oModel = that.getView().getModel();
								var aHeaderData = [];
								// var aTextData = TextData.nItemData;
								// aHeaderData.push({
								// 	"Vbeln": oModelApplyDiscountData.SalesQuotation,
								// 	"Posnr": oModelApplyDiscountData.SalesQuotationItem,
								// 	"Levels": oModelApplyDiscountData.Levels,
								// 	"Discount": StepInput.getValue().toString()
								// });
								var oEntity;
								var data;
								// if (oModelApplyDiscountData.ZruleManual === "2") {
								oEntity = "ZAE_FM_SSQT_APPLY_DISCOUNTSet";
								// data = [{
								// 	callProperty: "Salesdocument",
								// 	value: oModelApplyDiscountData.SalesQuotation
								// }, {
								// 	callProperty: "ItmNumber",
								// 	value: oModelApplyDiscountData.SalesQuotationItem
								// }, {
								// 	callProperty: "Levels",
								// 	value: oModelApplyDiscountData.Levels
								// }, {
								// 	callProperty: "CondValue",
								// 	value: oModelApplyDiscountData.DiscountValue.toString()
								// }];
								var data = [{
									callProperty: "ObjectId",
									value: selSecData.ServiceOrder
								}, {
									callProperty: "NumberInt",
									value: selSecData.ServiceOrderOperation
								}, {
									callProperty: "Discount",
									value: StepInput.getValue().toString()
								}, {
									callProperty: "Levels",
									value: oModelApplyDiscountData.Levels
								}];
								// } else {
								// 	//oEntity = "ZAE_FM_UQTN_ADD_DISCOUNT_VALUESet"; //ZAE_FM_UQTN_ADD_DISCOUNTSet";
								// 	oEntity = "UQTN_HEADER_DISCOUNTSet";
								// 	data = [{
								// 		callProperty: "N_UQTN_HEADER_DISCOUNT",
								// 		value: aHeaderData
								// 	}, {
								// 		callProperty: "N_UQTN_TEXT",
								// 		value: aTextData
								// 	}];

								// 	// data = [{
								// 	// 	callProperty: "Vbeln",
								// 	// 	value: oModelApplyDiscountData.SalesQuotation
								// 	// }, {
								// 	// 	callProperty: "Posnr",
								// 	// 	value: oModelApplyDiscountData.SalesQuotationItem
								// 	// }, {
								// 	// 	callProperty: "Levels",
								// 	// 	value: oModelApplyDiscountData.Levels
								// 	// }, {
								// 	// 	callProperty: "Discount",
								// 	// 	value: oModelApplyDiscountData.DiscountValue.toString()
								// 	// }];
								// }

								/*oEntity = "ZAE_FM_QTN_ADD_COND_DISC_WMSet";
								data = [{
									callProperty: "Salesdocument",
									value: oModelApplyDiscountData.SalesQuotation
								}, {
									callProperty: "ItmNumber",
									value: oModelApplyDiscountData.SalesQuotationItem
								}, {
									callProperty: "Levels",
									value: oModelApplyDiscountData.Levels
								}, {
									callProperty: "CondValue",
									value: oModelApplyDiscountData.DiscountValue.toString()
								}];
*/
								var succFunc = function (oData, response) {
									that.aeUtil.refreshControlModel(that.getView());
								}.bind(that);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
								that._oNewDiscountDialog.close();
							},
							onCancelPressed: function () {
								that._oNewDiscountDialog.close();
							}
						}
					})
					.then(function (oDialogContent) {
						that._oNewDiscountDialog = oDialogContent;
						that.extensionAPI.attachToView(that._oNewDiscountDialog);
						this._setDiscountDialogInitialState();
					}.bind(this));
			} else {
				this._setDiscountDialogInitialState();
			}
		},

		_setDiscountDialogInitialState: function () {
			var oModelApplyDiscount = this.getView().getModel("mApplyDiscount");
			var oModelApplyDiscountData = oModelApplyDiscount.getData();
			var oDiscountMessageStrip = Fragment.byId("fragDiscount", "applyDiscountMessageStrip");
			var oDiscount = Fragment.byId("fragDiscount", "Discount");
			var oGrossValue = Fragment.byId("fragDiscount", "Grossvalue");
			var oDiscountvalue = Fragment.byId("fragDiscount", "Discountvalue");
			var oDiscount = Fragment.byId("fragDiscount", "Discount");
			//	var oDiscountSlider = Fragment.byId("fragDiscount", "DiscountSlider");    //commented for AE-4062 
			var oDiscountSlider = Fragment.byId("fragDiscount", "DiscountSlider").setValue(0); //Added for AE-4062
			// var oText = Fragment.byId("fragDiscount", "TextInput").setValue("");
			var oButton = this._oNewDiscountDialog.getBeginButton();
			var DisText = this.getView().getModel("i18n").getResourceBundle().getText("DiscountforSelected");
			if (Number(oModelApplyDiscountData.value) >= Number(oModelApplyDiscountData.DiscountTo)) {
				oDiscountSlider.setVisible(false);
				oDiscount.setVisible(false);
				oGrossValue.setVisible(false);
				oDiscountvalue.setVisible(false);
				oDiscountMessageStrip.setVisible(true);
				oDiscountMessageStrip.setText(DisText);
				oDiscountMessageStrip.setType("Error");
				// oText.setVisible(false);
				oButton.setEnabled(false);
			} else {
				oDiscountMessageStrip.setVisible(false);
				oDiscountSlider.setVisible(true);
				oDiscount.setVisible(true);
				oGrossValue.setVisible(true);
				oDiscountvalue.setVisible(true);
				// oText.setVisible(true);
				oButton.setEnabled(false);
			}
			this._oNewDiscountDialog.open();
		},
		// onClickSSOD_B110: function (oEvent) {
		// 	var that = this;
		// 	if (!this._oNewChangeContactPersonDialog) {
		// 		debugger;
		// 		Fragment.load({
		// 				id: "fragChangeContactPerson",
		// 				name: "com.globalintelli.zae_ssod.ext.fragment.ChangeContactPerson",
		// 				controller: this
		// 			})
		// 			.then(function (oDialogContent) {
		// 				this._ChangeContactPersonDialog(oDialogContent);

		// 				this._setChangeContactPersonDialogInitialState();
		// 			}.bind(this));
		// 	} else {
		// 		this._setChangeContactPersonDialogInitialState();
		// 	}
		// },

		// _ChangeContactPersonDialog: function (oDialogContent) {

		// 	var ContactPerson;

		// 	var that = this;
		// 	this._oNewChangeContactPersonDialog = new sap.m.Dialog({
		// 		title: "{i18n>SSOD_B110}",
		// 		width: "15rem",
		// 		content: [
		// 			oDialogContent
		// 		],

		// 		beginButton: new sap.m.Button({
		// 			text: "{i18n>Change}",
		// 			press: function () {
		// 				that._oNewChangeContactPersonDialog.setBusy(true);
		// 					var pageData = that.getView().getBindingContext().getObject();

		// 				ContactPerson = Fragment.byId("fragChangeContactPerson", "ContactPerson").getTokens()[0];
		// 				if (ContactPerson === undefined) {
		// 					that.fnCheckChangeContactPersonRequiredValidation();
		// 					var msg = this.getView().getModel("i18n").getResourceBundle().getText("Please Select Contact Person");
		// 					sap.m.MessageBox.error(msg);
		// 					return{
		// 						pass: false
		// 					};

		// 				} else {
		// 					ContactPerson = ContactPerson.getProperty("key");
		// 				}

		// 				var oEntity = "ZAE_FM_SSOD_CHANGE_CPSet";
		// 				var oModel = that.getView().getModel();
		// 				var data = [{
		// 					callProperty: "ObjectId",
		// 					value: pageData.ContactPerson
		// 				}, {
		// 					callProperty: "ContactP",
		// 					value: ContactPerson
		// 				}];

		// 				var succFunc = function (oData) {
		// 					that.extensionAPI.refresh();
		// 					that._oNewChangeContactPersonDialog.setBusy(false);
		// 					that._oNewChangeContactPersonDialog.close();
		// 				};

		// 				var errFunc = function (oData) {
		// 					that.extensionAPI.refresh();
		// 					that._oNewChangeContactPersonDialog.setBusy(false);
		// 				};
		// 				var actId = "SSOD_B110";
		// 				var actLabel = "Assign Contact Person";
		// 				that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);

		// 			}.bind(this)
		// 		}),
		// 		endButton: new sap.m.Button({
		// 			text: "{i18n>Close}",
		// 			press: function () {
		// 				this._oNewChangeContactPersonDialog.close();
		// 			}.bind(this)
		// 		})
		// 	});

		// 	this.getView().addDependent(this._oNewChangeContactPersonDialog);

		// },

		// _fnChangeContactPersonCreateButtonEnabledState: function () {
		// 	var ContactPerson = Fragment.byId("fragChangeContactPerson", "ContactPerson");
		// 	var bEnabled = ContactPerson.getTokens().length > 0;
		// 	this._oNewChangeContactPersonDialog.getBeginButton().setEnabled(bEnabled);
		// },
		// onChangeContactPerson: function () {
		// 	this._fnChangeContactPersonCreateButtonEnabledState();
		// },

		// _setChangeContactPersonDialogInitialState: function () {
		// 	var that = this;
		// 	// var numbSel = this.extensionAPI.getSelectedContexts().length;

		// 		Fragment.byId("fragChangeContactPerson", "ContactPerson").setValue("");

		// 	this._oNewChangeContactPersonDialog.open();
		// 	this._oNewChangeContactPersonDialog.getBeginButton().setEnabled(true);

		// },

		//Commented for AE-4265 Start
		/*	onClickSSOD_B110: function (oEvent) {
				var that = this;
				var oSource = oEvent.getSource();
				var pageData = that.getView().getBindingContext().getObject();
				var selectedData = this.extensionAPI.getSelectedContexts();
				var actId = "SSOD_B110";
				var actLabel = this.aeUtil.geti18nText(that, actId);
				var fragName = "com.globalintelli.zae_ssod.ext.fragment.ChangeContactPerson";
				var oModel = oSource.getModel();
				var oEntity = "ZAE_FM_SSOD_CHANGE_CPSet";
				var dialogFields = [{
					fragInputId: "ContactPerson",
					fragInputLabel: this.aeUtil.geti18nText(that, "ContactPerson"),
					vhEntitySet: "ZAE_VH_BUSINESSPARTNER_05",
					vhSearchKey: "BusinessPartner",
					vhSearchText: "BusinessPartnerName",
					callProperty: "Partner"
				}];
				var data = [{
					callProperty: "ObjectId",
					value: pageData.ServiceOrder
				}, {
					callProperty: "Partner",
					value: selectedData.ContactPerson
				}, ];
				var checkFucc = function () {
					var ContactPerson = Fragment.byId(actId + "Fragment", "ContactPerson").getValue();
					if (ContactPerson === "" || ContactPerson === undefined) {
						return {
							pass: false,
							msg: this.aeUtil.geti18nText(that, "Select_contact_Person")
						};
					} else {
						return {
							pass: true
						};
					}
				}.bind(this);

				var succFunc = function (oData, response) {
					this.extensionAPI.refresh();
				}.bind(this);

				this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc);

			},*/
		//Commented for AE-4265 End
		onClickSSOD_B111: function (oEvent) {
			if (!this._oInsApprDialog) {
				Fragment.load({
						id: "idInsApprDialog",
						name: "com.globalintelli.zae_ssod.ext.fragment.InsAppClaimNo",
						controller: this
					})
					.then(function (oDialogContent) {
						this._createInsApprDialog(oDialogContent);
						this._setInsApprDialogInitialState();
					}.bind(this));
			} else {
				this._setInsApprDialogInitialState();
			}
		},
		_createInsApprDialog: function (oDialogContent) {
			var that = this;
			this._oInsApprDialog = new sap.m.Dialog({
				title: "{i18n>SSOD_B111}",
				width: "640px",
				content: [
					oDialogContent
				],
				// buttons: [
				// 	new sap.m.Button({
				beginButton: new sap.m.Button({
					text: "Submit",
					press: function () {
						var pageData = that.getView().getBindingContext().getObject();
						var MessageStrip = Fragment.byId("idInsApprDialog", "SSOD_B111MessageStrip");
						var actId = 'SSOD_B111';
						var actLabel = this.aeUtil.geti18nText(that, actId);
						var oModel = this.getView().getModel();
						var oEntity = "ZAE_FM_SSOD_UPDATE_SPLIT_RULESet";
						var SplitRuleInput = Fragment.byId("idInsApprDialog", "SplitRuleInput").getSelectedKey();
						var SplitAmt = Fragment.byId("idInsApprDialog", "SplitAmt").getValue();
						var SplitPercentage = Fragment.byId("idInsApprDialog", "SplitPercentage").getValue();
						// if (SplitRuleInput === null || SplitRuleInput === undefined || SplitRuleInput === '') {
						// 	MessageStrip.setText("Fill required fields.");
						// 	MessageStrip.setVisible(true);
						// 	return;
						// }
						// if (Fragment.byId("idInsApprDialog", "SplitAmt").getVisible() === true &&
						// 	Fragment.byId("idInsApprDialog", "SplitAmt").getEnabled() === true) {
						// 	if (SplitAmt === null || SplitAmt === undefined || SplitAmt === '') {
						// 		MessageStrip.setText("Fill required fields.");
						// 		MessageStrip.setVisible(true);
						// 		return;
						// 	} else if (SplitAmt === '0' || SplitAmt === '0.00') {
						// 		MessageStrip.setText("Enter Split Amount");
						// 		MessageStrip.setVisible(true);
						// 		return;
						// 	}
						// }
						// else
						// if (Fragment.byId("idInsApprDialog", "SplitPercentage").getVisible === true) {
						// 	if (SplitPercentage === null || SplitPercentage === undefined || SplitPercentage === '') {
						// 		MessageStrip.setText("Fill required fields.");
						// 		MessageStrip.setVisible(true);
						// 		return;
						// 	} else 
						if (SplitPercentage > 100) {
							MessageStrip.setText("Enter Value Upto 100");
							MessageStrip.setVisible(true);
							return;
						}
						// }
						var data = [{
							callProperty: "ObjectId",
							value: pageData.ServiceOrder
						}, {
							callProperty: "ISplitRule",
							value: SplitRuleInput
						}, {
							callProperty: "ISplitAmount",
							value: SplitAmt
						}, {
							callProperty: "ISplitPerc",
							value: SplitPercentage
						}];
						var succFunc = function (oData, response) {
							this.extensionAPI.refresh();
						}.bind(this);
						this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
						this._oInsApprDialog.close();

					}.bind(this)
				}),
				// new sap.m.Button({
				endButton: new sap.m.Button({
						text: "Close",
						press: function () {
							this._oInsApprDialog.close();
						}.bind(this)
					})
					//]
			});
			this.getView().addDependent(this._oInsApprDialog);
		},
		_setInsApprDialogInitialState: function () {
			var aFilter = [];
			var pageData = this.getView().getBindingContext().getObject();
			aFilter.push(new sap.ui.model.Filter("ProcessType", sap.ui.model.FilterOperator.EQ, pageData.ServiceDocumentType));
			//Fragment.byId("idInsApprDialog", "SplitRuleInput").setSelectedKey();
			Fragment.byId("idInsApprDialog", "SplitRuleInput").getBinding("items").filter(aFilter);
			Fragment.byId("idInsApprDialog", "SplitAmt").setValue(0);
			Fragment.byId("idInsApprDialog", "SplitPercentage").setValue();
			var MessageStrip = Fragment.byId("idInsApprDialog", "SSOD_B111MessageStrip");
			MessageStrip.setText();
			MessageStrip.setVisible(false);
			this._fnSubmitEnabledState();
			this._oInsApprDialog.open();
		},
		onChangeSplitRule: function (oEvent) {
			var selectedKey = oEvent.getParameter("selectedItem").getKey();
			Fragment.byId("idInsApprDialog", "SplitAmt").setValue(0);
			var selectedObject = oEvent.getParameter("selectedItem").getBindingContext().getObject();
			if (selectedKey === '1') {
				var pageData = this.getView().getBindingContext().getObject();
				Fragment.byId("idInsApprDialog", "SplitAmt").setVisible(true).setValue(oEvent.getParameter("selectedItem").getAdditionalText());
				Fragment.byId("idInsApprDialog", "SplitPercentage").setVisible(false);
				if (selectedObject.Changeable === true) {
					Fragment.byId("idInsApprDialog", "SplitAmt").setEnabled(true);
				} else {
					Fragment.byId("idInsApprDialog", "SplitAmt").setEnabled(false);
				}
			} else if (selectedKey === '5' || selectedKey === '6' || selectedKey === '7') {
				var pageData = this.getView().getBindingContext().getObject();
				Fragment.byId("idInsApprDialog", "SplitAmt").setVisible(true).setValue(oEvent.getParameter("selectedItem").getAdditionalText());
				Fragment.byId("idInsApprDialog", "SplitPercentage").setVisible(true);
				if (selectedObject.Changeable === true) {
					Fragment.byId("idInsApprDialog", "SplitAmt").setEnabled(true);
				} else {
					Fragment.byId("idInsApprDialog", "SplitAmt").setEnabled(false);
				}
			} else if (selectedKey !== ' ' && selectedKey !== undefined) {
				Fragment.byId("idInsApprDialog", "SplitAmt").setVisible(false);
				Fragment.byId("idInsApprDialog", "SplitPercentage").setVisible(true);
			} else {
				Fragment.byId("idInsApprDialog", "SplitAmt").setVisible(false);
				Fragment.byId("idInsApprDialog", "SplitPercentage").setVisible(false);
			}
			this._fnSubmitEnabledState();
		},
		_fnSubmitEnabledState: function () {
			var SplitRuleInput = Fragment.byId("idInsApprDialog", "SplitRuleInput");
			var SplitAmt = Fragment.byId("idInsApprDialog", "SplitAmt");
			var SplitPercentage = Fragment.byId("idInsApprDialog", "SplitPercentage");
			var bEnabled = (SplitRuleInput.getVisible() ? SplitRuleInput.getSelectedKey() !== "" : true) &&
				(SplitAmt.getVisible() ? SplitAmt.getValue() !== "" : true) &&
				(SplitPercentage.getVisible() ? SplitPercentage.getValue() !== "" : true)
			this._oInsApprDialog.getBeginButton().setEnabled(bEnabled);
		},
		onClickSSOD_B112: function (oEvent) {
			if (!this._oNewCreateNotesDialogOP) {
				Fragment.load({
						id: "fragCreateNotesOP",
						name: "com.globalintelli.zae_ssod.ext.fragment.CreateNotesOP",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateNotesDialogOP(oDialogContent);
						this._setCreateNotesDialogInitialStateOP();
					}.bind(this));
			} else {
				this._setCreateNotesDialogInitialStateOP();
			}
		},
		_setCreateNotesDialogInitialStateOP: function () {
			var selSecData = this.aeUtil.getSecData(this, "INOPFacet");
			Fragment.byId("fragCreateNotesOP", "noteInputOP").setValue(selSecData.Notes);
			Fragment.byId("fragCreateNotesOP", "SSOD_B112MessageStrip").setVisible(false);
			this._oNewCreateNotesDialogOP.setModel(this.getView().getModel("i18n"), "i18n");
			this._oNewCreateNotesDialogOP.open();
		},
		_CreateNotesDialogOP: function (oDialogContent, oEvent) {
			var that = this;

			this._oNewCreateNotesDialogOP = new sap.m.Dialog({
				title: "{i18n>SSOD_B112}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "{i18n>Add}",

					press: function () {
						var selSecData = this.aeUtil.getSecData(that, "INOPFacet");
						var vTextId = selSecData.TextId;
						var vnotes = Fragment.byId("fragCreateNotesOP", "noteInputOP").getValue();
						this.getView().getModel("mNotes").setProperty("/nItemData", []);
						that.checkNotes(vnotes);
						if (vnotes === "") {
							var msg2 = this.getView().getModel("i18n").getResourceBundle().getText("Filloutmandatoryfields");
							var oMessageStrip = Fragment.byId("fragCreateNotesOP", "SSOD_B112MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);
							return;
						}
						var pageData = that.getView().getBindingContext().getObject();
						var actId = "SSOD_B112";
						var actLabel = that.aeUtil.geti18nText(that, actId);
						var oModel = that.getView().getModel("AddNotes");
						var Itemsdata = that.getView().getModel("mNotes").getData();
						var arr2 = Itemsdata.nItemData;
						var oEntity = "ZAE_FM_SERVDOCITEM_ADD_NOTESSet";
						var arr1 = [];
						var oItementry = {};
						oItementry.ServiceDocument = pageData.ServiceOrder;
						oItementry.Item = pageData.ServiceOrderOperation;
						oItementry.TextId = vTextId; // Text Id
						oItementry.DontConcatText = true;
						arr1.push(oItementry);
						that.getView().setBusy(true);
						var data = [{
							callProperty: "NavMain",
							value: arr1
						}, {
							callProperty: "NavOpp",
							value: arr2
						}];
						var succFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						var errorFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errorFunc);
						that._oNewCreateNotesDialogOP.close();

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "{i18n>Close}",
					press: function () {
						this._oNewCreateNotesDialogOP.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oNewCreateNotesDialogOP);

		},

		onClickSSOD_B113: function (oEvent) {
			if (!this._oNewCreateNotesDialogCP) {
				Fragment.load({
						id: "fragCreateNotesCP",
						name: "com.globalintelli.zae_ssod.ext.fragment.CreateNotesCP",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateNotesDialogCP(oDialogContent);
						this._setCreateNotesDialogInitialStateCP();
					}.bind(this));
			} else {
				this._setCreateNotesDialogInitialStateCP();
			}
		},
		_setCreateNotesDialogInitialStateCP: function () {
			var that = this;
			var selSecData = this.aeUtil.getSecData(that, "INCPFacet");
			Fragment.byId("fragCreateNotesCP", "noteInputCP").setValue(selSecData.Notes);
			Fragment.byId("fragCreateNotesCP", "SSOD_B113MessageStrip").setVisible(false);
			this._oNewCreateNotesDialogCP.setModel(this.getView().getModel("i18n"), "i18n");
			this._oNewCreateNotesDialogCP.open();
		},
		_CreateNotesDialogCP: function (oDialogContent, oEvent) {
			var that = this;

			this._oNewCreateNotesDialogCP = new sap.m.Dialog({
				title: "{i18n>SSOD_B113}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "{i18n>Add}",

					press: function () {
						var selSecData = this.aeUtil.getSecData(that, "INCPFacet");
						var vTextId = selSecData.TextId;
						var vnotes = Fragment.byId("fragCreateNotesCP", "noteInputCP").getValue();
						this.getView().getModel("mNotes").setProperty("/nItemData", []);
						that.checkNotes(vnotes);
						if (vnotes === "") {
							var msg2 = this.getView().getModel("i18n").getResourceBundle().getText("Filloutmandatoryfields");
							var oMessageStrip = Fragment.byId("fragCreateNotesCP", "SSOD_B113MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);
							return;
						}
						var pageData = that.getView().getBindingContext().getObject();
						var actId = "SSOD_B113";
						var actLabel = that.aeUtil.geti18nText(that, actId);
						var oModel = that.getView().getModel("AddNotes");
						var Itemsdata = that.getView().getModel("mNotes").getData();
						var arr2 = Itemsdata.nItemData;
						var oEntity = "ZAE_FM_SERVDOCITEM_ADD_NOTESSet";
						var arr1 = [];
						var oItementry = {};
						oItementry.ServiceDocument = pageData.ServiceOrder;
						oItementry.Item = pageData.ServiceOrderOperation;
						oItementry.TextId = vTextId; // Text Id
						oItementry.DontConcatText = true;
						arr1.push(oItementry);
						that.getView().setBusy(true);
						var data = [{
							callProperty: "NavMain",
							value: arr1
						}, {
							callProperty: "NavOpp",
							value: arr2
						}];
						var succFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						var errorFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errorFunc);
						that._oNewCreateNotesDialogCP.close();

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "{i18n>Close}",
					press: function () {
						this._oNewCreateNotesDialogCP.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oNewCreateNotesDialogCP);

		},

		onClickSSOD_B115: function () {
			var oTableLSHF = this.createId("HSLFacet::responsiveTable");
			var oView = this.getView();
			var oTableLSH = oView.byId(oTableLSHF);
			if (oTableLSH) {
				this.LegacyServiceHistoryTab = true;
				oTableLSH.getParent().rebindTable();
				oTableLSH.getParent().setInitialNoDataText("No Data Found");

			}
		},
		onClickSSOD_B114: function () {
			var oTableSHF = this.createId("HSFacet::responsiveTable");
			var oView = this.getView();
			var oTableSH = oView.byId(oTableSHF);
			if (oTableSH) {
				this.ServiceHistoryTab = true;
				oTableSH.getParent().rebindTable();
				oTableSH.getParent().setInitialNoDataText("No Data Found");

			}
		},

		onClickSSOD_B116: function (oEvent) {
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.RequestforDiscount";
			var selSecData = this.aeUtil.getSecData(this, "OPFacet");
			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			}
			var that = this;

			if (!this._oApplyDiscountPopoverRD) {
				this._oApplyDiscountPopoverRD = sap.ui.xmlfragment(this.getView().getId(), fragName, {
					onClickSSOD_B117: function (oEvent) {
						that.fnLoadDiscountLevelsRD("LS1");
					},
					onClickSSOD_B118: function (oEvent) {
						that.fnLoadDiscountLevelsRD("LS2");
					},
					onClickSSOD_B119: function (oEvent) {
						that.fnLoadDiscountLevelsRD("LS3");
					},
					onClickSSOD_B120: function (oEvent) {
						that.fnLoadDiscountLevelsRD("LS4");
					},
					onClickSSOD_B121: function (oEvent) {
						that.fnLoadDiscountLevelsRD("LS5");
					}
				});
				this.getView().addDependent(this._oApplyDiscountPopoverRD);
				// this._oApplyDiscountPopover.attachBeforeOpen(function (oEvent) {
				// 	var selSecData = this.aeUtil.getSecData(that, "OPFacet");

				// 	if (selSecData.isShowSSOD_B105 !== undefined) {
				// 		oEvent.getSource().getButtons()[0].setVisible(selSecData.isShowSSOD_B105);
				// 	}

				// 	if (selSecData.isShowSSOD_B106 !== undefined) {
				// 		oEvent.getSource().getButtons()[1].setVisible(selSecData.isShowSSOD_B106);
				// 	}

				// 	if (selSecData.isShowSSOD_B107 !== undefined) {
				// 		oEvent.getSource().getButtons()[2].setVisible(selSecData.isShowSSOD_B107);
				// 	}
				// 	if (selSecData.isShowSSOD_B108 !== undefined) {
				// 		oEvent.getSource().getButtons()[3].setVisible(selSecData.isShowSSOD_B108);
				// 	}
				// 	if (selSecData.isShowSSOD_B109 !== undefined) {
				// 		oEvent.getSource().getButtons()[4].setVisible(selSecData.isShowSSOD_B109);
				// 	}

				// 	setTimeout(function () {}, 1000);

				// }, this);
			}
			this._oApplyDiscountPopoverRD.setModel(this.getView().getModel());
			var pop = oEvent.getSource();
			this._oApplyDiscountPopoverRD.openBy(pop);
		},
		fnLoadDiscountLevelsRD: function (DiscountLevels) {

			var that = this;
			var aFilters = [];
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			var oButton = this.getView().byId(this.createId("SSOD_B116Button"));
			var pageData = this.getView().getBindingContext().getObject();
			oButton.setBusy(true);
			// var oSelSecData = oData.results[0];
			var aFilters2 = [];
			aFilters2.push(new Filter("SalesOffice", "EQ", pageData.SalesOffice));
			aFilters2.push(new Filter("SalesGroup", "EQ", pageData.SalesGroup));
			aFilters2.push(new Filter("TransactionType", "EQ", pageData.ServiceDocumentType));
			aFilters2.push(new Filter("ItemCategoryGroup", "EQ", selSecData.ItemCategoryGroup));
			// aFilters2.push(new Filter("TransactionType", "EQ", 'ZORP'));
			// aFilters2.push(new Filter("ItemCategoryGroup", "EQ", 'LEIS'));
			that.getView().getModel().read("/ZAE_I_TC_SSOD_12", {
				filters: aFilters2,
				success: function (oDataDL, responseDL) {
					oButton.setBusy(false);
					var DiscountData = {},
						L1DiscountFrom,
						L1DiscountTo,
						L2DiscountFrom,
						L2DiscountTo,
						L3DiscountFrom,
						L3DiscountTo,
						L4DiscountFrom,
						L4DiscountTo,
						L5DiscountFrom,
						L5DiscountTo;
					if (oDataDL.results.length > 0) {
						for (var i = 0; i < oDataDL.results.length; i++) {
							var oDisLevels = oDataDL.results[i];
							if (oDataDL.results[i].Levels === 'LS1') {
								L1DiscountFrom = Number(oDisLevels.DiscountFrom);
								L1DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LS2') {
								L2DiscountFrom = Number(oDisLevels.DiscountFrom);
								L2DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LS3') {
								L3DiscountFrom = Number(oDisLevels.DiscountFrom);
								L3DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LS4') {
								L4DiscountFrom = Number(oDisLevels.DiscountFrom);
								L4DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LS5') {
								L5DiscountFrom = Number(oDisLevels.DiscountFrom);
								L5DiscountTo = Number(oDisLevels.DiscountTo);
							}

							if (oDisLevels.Levels === DiscountLevels) {
								DiscountData = oDisLevels;
								// DiscountData.L1DiscountValue = Number(oSelSecData.L1DiscountValue);
								// DiscountData.SpecialDiscount = Number(oSelSecData.Discount);
								// // if (DiscountData.ZRule === '1') {
								// //Percentage
								// DiscountData.DiscountFrom = Number(oDisLevels.DiscountFrom);
								// DiscountData.DiscountTo = Number(oDisLevels.DiscountTo);
								// DiscountData.value = Number(DiscountData.DiscountFrom);
								// DiscountData.SliderValue = Number(DiscountData.value);
								// DiscountData.WorkEstimate = selSecData.WorkEstimate;
								// DiscountData.WorkEstimateItem = selSecData.WorkEstimateItem;
								// DiscountData.Subtotal1Amount = Number(selSecData.OperationQuantity) != 0 ? Number(selSecData.GrossValue) / Number(
								// 	selSecData.OperationQuantity) : Number(selSecData.GrossValue);
								// DiscountData.NetAfterDiscount = Number(DiscountData.GrossValue) - (DiscountData.L1DiscountValue + DiscountData
								// 	.L2DiscountValue +
								// 	DiscountData.L3DiscountValue + DiscountData.OEMDiscount + DiscountData.SpecialDiscount);
								// var oDiscountAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.value)) / 100;
								// DiscountData.DiscountValue = oDiscountAmt.toFixed(3);
								// DiscountData.NetValue = Number(DiscountData.Subtotal1Amount) - Number(DiscountData.Discount);
								// DiscountData.NetAfterProposed = 0;

								DiscountData.L1DiscountValue = 0;
								DiscountData.SpecialDiscount = 0;
								// if (DiscountData.ZRule === '1') {
								//Percentage
								DiscountData.DiscountFrom = Number(oDisLevels.DiscountFrom);
								DiscountData.DiscountTo = Number(oDisLevels.DiscountTo);
								DiscountData.value = Number(DiscountData.DiscountFrom);
								DiscountData.SliderValue = Number(DiscountData.value);
								DiscountData.WorkEstimate = selSecData.WorkEstimate;
								DiscountData.WorkEstimateItem = selSecData.WorkEstimateItem;
								DiscountData.Subtotal1Amount = Number(selSecData.OperationQuantity) != 0 ? Number(selSecData.GrossValue) / Number(
									selSecData.OperationQuantity) : Number(selSecData.GrossValue);
								DiscountData.CurrentDiscount = Number(selSecData.Discount);
								DiscountData.CurrentDiscountPer = (DiscountData.CurrentDiscount / Number(selSecData.GrossValue)) * 100;
								DiscountData.NetAfterDiscount = Number(DiscountData.Subtotal1Amount) - DiscountData.CurrentDiscount;
								DiscountData.value = 0;
								DiscountData.DiscountValue = 0;
								DiscountData.NetAfterProposed = 0;

							}

						}
						if (L1DiscountFrom && L1DiscountTo) {
							DiscountData.L1DiscountFrom = L1DiscountFrom;
							DiscountData.L1DiscountTo = L1DiscountTo;
							DiscountData.L1Visible = true
						} else {
							DiscountData.L1Visible = false
						}
						if (L2DiscountFrom && L2DiscountFrom) {
							DiscountData.L2DiscountFrom = L2DiscountFrom;
							DiscountData.L2DiscountTo = L2DiscountTo;
							DiscountData.L2Visible = true
						} else {
							DiscountData.L2Visible = false
						}
						if (L3DiscountFrom && L3DiscountFrom) {
							DiscountData.L3DiscountFrom = L3DiscountFrom;
							DiscountData.L3DiscountTo = L3DiscountTo;
							DiscountData.L3Visible = true
						} else {
							DiscountData.L3Visible = false
						}
						if (L4DiscountFrom && L4DiscountTo) {
							DiscountData.L4DiscountFrom = L4DiscountFrom;
							DiscountData.L4DiscountTo = L4DiscountTo;
							DiscountData.L4Visible = true
						} else {
							DiscountData.L4Visible = false
						}
						if (L5DiscountFrom && L5DiscountTo) {
							DiscountData.L5DiscountFrom = L5DiscountFrom;
							DiscountData.L5DiscountTo = L5DiscountTo;
							DiscountData.L5Visible = true
						} else {
							DiscountData.L5Visible = false
						}

						var oModel = that.getView().getModel("mApplyDiscount");
						oModel.setData(DiscountData);
						that.fnLoadDiscountPopupRD();

					} else {
						var MsgErr4 = that.getView().getModel("i18n").getResourceBundle().getText("KindlyMaintainDataInSSOD");
						MessageBox.error(MsgErr4);
					}
				},
				error: function (oError) {
					oButton.setBusy(false);
					var MsgErrBox2 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorInDiscountLevel");
					MessageBox.error(MsgErrBox2);
				}
			});

		},
		fnLoadDiscountPopupRD: function () {
			var that = this;

			that.byId(that.createId("SSOD_B116Button")).setBusy(false);
			if (!this._oNewDiscountDialogRD) {
				Fragment.load({
						id: "fragDiscountRD",
						name: "com.globalintelli.zae_ssod.ext.fragment.DiscountRD",
						controller: {
							_fnCalDiscValue: function () {
								var selSecData = that.aeUtil.getSecData(that, "OPFacet");
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountData = mApplyDiscount.getData();
								//Percentage
								var oDiscountAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.SliderValue)) / 100;
								DiscountData.value = DiscountData.SliderValue;
								DiscountData.DiscountValue = (oDiscountAmt * Number(selSecData.OperationQuantity)).toFixed(2);
								// DiscountData.NetValue = Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue);
								DiscountData.NetAfterProposed = (Number(selSecData.GrossValue) - Number(DiscountData.DiscountValue)).toFixed(2);
								// DiscountData.NetAfterProposed = (DiscountData.NetAfterProposed * Number(selSecData.OperationQuantity)).tofixed(2);
								this._SubmitButtonValidation();
							},
							_onInputDiscountValue: function (oEvent) {
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountData = mApplyDiscount.getData();
								var DiscountValueMSGStrip = Fragment.byId("fragDiscountRD", "applyDiscountMessageStripRD");
								var oDiscountToAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountTo)) / 100;
								var oDiscountFromAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountFrom)) / 100;
								var MsgTextDis = that.getView().getModel("i18n").getResourceBundle().getText("Discountbeyondnotpermitted", [DiscountData.DiscountValue]);
								var MsgTextDisLess = that.getView().getModel("i18n").getResourceBundle().getText("Discountlessthennotpermitted", [
									DiscountData.DiscountValue
								]);
								var oSubmitButton = Fragment.byId("fragDiscountRD", "IDSubmitButtonRD");
								if (Number(DiscountData.DiscountValue) > oDiscountToAmt) {
									//show waring msg 
									DiscountData.value = DiscountData.DiscountTo;
									DiscountData.SliderValue = DiscountData.DiscountTo;
									this._fnCalDiscValue();
									DiscountValueMSGStrip.setText(MsgTextDis);
									DiscountValueMSGStrip.setType("Warning");
									DiscountValueMSGStrip.setVisible(true);

								} else if (Number(DiscountData.DiscountValue) < oDiscountFromAmt) {
									DiscountData.value = DiscountData.DiscountFrom;
									DiscountData.SliderValue = DiscountData.DiscountFrom;
									this._fnCalDiscValue();
									DiscountValueMSGStrip.setText(MsgTextDisLess);
									DiscountValueMSGStrip.setType("Warning");
									DiscountValueMSGStrip.setVisible(true);
								} else {
									DiscountValueMSGStrip.setVisible(false);
									var Discount = (Number(DiscountData.DiscountValue) * 100) / Number(DiscountData.Subtotal1Amount);
									DiscountData.value = Discount.toFixed(2);
									DiscountData.SliderValue = Number(DiscountData.value);
									DiscountData.NetValue = Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue);
									DiscountData.NetAfterProposed = (Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue)).toFixed(2);
								}

								if (Number(DiscountData.DiscountValue) >= oDiscountFromAmt && Number(DiscountData.DiscountValue) <= oDiscountToAmt) {
									oSubmitButton.setEnabled(true);
								} else {
									oSubmitButton.setEnabled(false);
								}

							},
							_SubmitButtonValidation: function (oEvent) {
								var StepInput = Fragment.byId("fragDiscountRD", "DiscountSlider");
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountValue = Fragment.byId("fragDiscountRD", "Discountvalue").getValue();
								var DiscountData = mApplyDiscount.getData();
								// var slider = Fragment.byId("fragDiscountRD", "DiscountSlider");
								var oSubmitButton = Fragment.byId("fragDiscountRD", "IDSubmitButtonRD");
								var Text = Fragment.byId("fragDiscountRD", "TextInput").getValue().length;
								/*var oDiscountToAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountTo)) / 100;
								var oDiscountFromAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountFrom)) / 100;
								if (Number(DiscountValue) >= oDiscountFromAmt && Number(DiscountValue) <= oDiscountToAmt) {
									oSubmitButton.setEnabled(true);
								} else {
									oSubmitButton.setEnabled(false);
								}*/

								if (StepInput.getValue() >= Number(DiscountData.DiscountFrom) && StepInput.getValue() <= Number(DiscountData.DiscountTo) &&
									Text < 256) {
									oSubmitButton.setEnabled(true);
									StepInput.setValueState("None");
								} else {
									oSubmitButton.setEnabled(false);
								}
								// if (Text === "") {
								// 	oSubmitButton.setEnabled(false);
								// } else {
								// 	oSubmitButton.setEnabled(true);
								// }

							},
							onSubmitPressedRD: function () {
								// this._onInputDiscountValue();
								var StepInput = Fragment.byId("fragDiscountRD", "DiscountSlider");
								if (StepInput.getValue() > StepInput.getMax() || StepInput.getValue() < StepInput.getMin()) {
									return;
								}
								var selSecData = that.aeUtil.getSecData(that, "OPFacet");
								var actId = "SSOD_B116";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var oModelApplyDiscount = that.getView().getModel("mApplyDiscount");
								var oModelApplyDiscountData = oModelApplyDiscount.getData();
								var vText = Fragment.byId("fragDiscountRD", "TextInput").getValue();
								// that.getView().getModel("mNotes").setProperty("/nItemData", []);
								// that.checkNotes(vText);
								// var TextData = that.getView().getModel("mNotes").getData();
								var oModel = that.getView().getModel();
								var aHeaderData = [];
								// var aTextData = TextData.nItemData;
								// aHeaderData.push({
								// 	"Vbeln": oModelApplyDiscountData.SalesQuotation,
								// 	"Posnr": oModelApplyDiscountData.SalesQuotationItem,
								// 	"Levels": oModelApplyDiscountData.Levels,
								// 	"Discount": StepInput.getValue().toString()
								// });
								var oEntity;
								var data;
								// if (oModelApplyDiscountData.ZruleManual === "2") {
								oEntity = "ZAE_FM_SSOD_WF_NOTIFSet";
								// data = [{
								// 	callProperty: "Salesdocument",
								// 	value: oModelApplyDiscountData.SalesQuotation
								// }, {
								// 	callProperty: "ItmNumber",
								// 	value: oModelApplyDiscountData.SalesQuotationItem
								// }, {
								// 	callProperty: "Levels",
								// 	value: oModelApplyDiscountData.Levels
								// }, {
								// 	callProperty: "CondValue",
								// 	value: oModelApplyDiscountData.DiscountValue.toString()
								// }];
								var data = [{
									callProperty: "ObjectId",
									value: selSecData.ServiceOrder
								}, {
									callProperty: "NumberInt",
									value: selSecData.ServiceOrderOperation
								}, {
									callProperty: "DiscPercentage",
									value: StepInput.getValue().toString()
								}, {
									callProperty: "Levels",
									value: oModelApplyDiscountData.Levels
								}, {
									callProperty: "Object",
									value: "2"
								}, {
									callProperty: "Text",
									value: vText
								}];
								// } else {
								// 	//oEntity = "ZAE_FM_UQTN_ADD_DISCOUNT_VALUESet"; //ZAE_FM_UQTN_ADD_DISCOUNTSet";
								// 	oEntity = "UQTN_HEADER_DISCOUNTSet";
								// 	data = [{
								// 		callProperty: "N_UQTN_HEADER_DISCOUNT",
								// 		value: aHeaderData
								// 	}, {
								// 		callProperty: "N_UQTN_TEXT",
								// 		value: aTextData
								// 	}];

								// 	// data = [{
								// 	// 	callProperty: "Vbeln",
								// 	// 	value: oModelApplyDiscountData.SalesQuotation
								// 	// }, {
								// 	// 	callProperty: "Posnr",
								// 	// 	value: oModelApplyDiscountData.SalesQuotationItem
								// 	// }, {
								// 	// 	callProperty: "Levels",
								// 	// 	value: oModelApplyDiscountData.Levels
								// 	// }, {
								// 	// 	callProperty: "Discount",
								// 	// 	value: oModelApplyDiscountData.DiscountValue.toString()
								// 	// }];
								// }

								/*oEntity = "ZAE_FM_QTN_ADD_COND_DISC_WMSet";
								data = [{
									callProperty: "Salesdocument",
									value: oModelApplyDiscountData.SalesQuotation
								}, {
									callProperty: "ItmNumber",
									value: oModelApplyDiscountData.SalesQuotationItem
								}, {
									callProperty: "Levels",
									value: oModelApplyDiscountData.Levels
								}, {
									callProperty: "CondValue",
									value: oModelApplyDiscountData.DiscountValue.toString()
								}];
*/
								var succFunc = function (oData, response) {
									that.aeUtil.refreshControlModel(that.getView());
								}.bind(that);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
								that._oNewDiscountDialogRD.close();
							},
							onCancelPressedRD: function () {
								that._oNewDiscountDialogRD.close();
							}
						}
					})
					.then(function (oDialogContent) {
						that._oNewDiscountDialogRD = oDialogContent;
						that.extensionAPI.attachToView(that._oNewDiscountDialogRD);
						this._setDiscountDialogInitialStateRD();
					}.bind(this));
			} else {
				this._setDiscountDialogInitialStateRD();
			}
		},

		_setDiscountDialogInitialStateRD: function () {
			var oModelApplyDiscount = this.getView().getModel("mApplyDiscount");
			var oModelApplyDiscountData = oModelApplyDiscount.getData();
			var oDiscountMessageStrip = Fragment.byId("fragDiscountRD", "applyDiscountMessageStripRD");
			var oDiscount = Fragment.byId("fragDiscountRD", "Discount");
			var oGrossValue = Fragment.byId("fragDiscountRD", "Grossvalue");
			var oDiscountvalue = Fragment.byId("fragDiscountRD", "Discountvalue");
			var oDiscount = Fragment.byId("fragDiscountRD", "Discount");
			//	var oDiscountSlider = Fragment.byId("fragDiscountRD", "DiscountSlider");    //commented for AE-4062 
			var oDiscountSlider = Fragment.byId("fragDiscountRD", "DiscountSlider").setValue(0); //Added for AE-4062
			var oText = Fragment.byId("fragDiscountRD", "TextInput").setValue("");
			var oButton = this._oNewDiscountDialogRD.getBeginButton();
			var DisText = this.getView().getModel("i18n").getResourceBundle().getText("DiscountforSelected");
			if (Number(oModelApplyDiscountData.value) >= Number(oModelApplyDiscountData.DiscountTo)) {
				oDiscountSlider.setVisible(false);
				oDiscount.setVisible(false);
				oGrossValue.setVisible(false);
				oDiscountvalue.setVisible(false);
				oDiscountMessageStrip.setVisible(true);
				oDiscountMessageStrip.setText(DisText);
				oDiscountMessageStrip.setType("Error");
				// oText.setVisible(false);
				oButton.setEnabled(false);
			} else {
				oDiscountMessageStrip.setVisible(false);
				oDiscountSlider.setVisible(true);
				oDiscount.setVisible(true);
				oGrossValue.setVisible(true);
				oDiscountvalue.setVisible(true);
				// oText.setVisible(true);
				oButton.setEnabled(false);
			}
			this._oNewDiscountDialogRD.open();
		},
		fnAddSubletComponents: function (oSource) {
			var that = this;
			var oButton = oSource;
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			if (!that._AddSubletComponentsDialog) {
				Fragment.load({
					id: "AddSubletComponentDialog",
					name: "com.globalintelli.zae_ssod.ext.fragment.AddSubletComponent",
					controller: {
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
						fnCostValue: function (oValue) {
							if (oValue) {
								return oValue;
							}
						},

						onChangeCost: function (oEvent) {
							var oSource = oEvent.getSource();
							var oValue = oEvent.getParameter("value");
							if (oValue) {
								var oObject = oSource.getParent().getBindingContext().getObject();
								var oSalesPrice = (parseFloat(oValue) * parseFloat(oObject["MinMargin"])).toFixed(2);
								oSource.getParent().getCells()[5].setValue(oSalesPrice);
								if (oSalesPrice > 0) {
									oSource.getParent().getCells()[5].setValueState("None");
								} else {
									oSource.getParent().getCells()[5].setValueState("Error");
								}
							}
							this.fnSubmitButonValidation();
						},
						updateFinished: function (oEvent) {
							var oItems = oEvent.getSource().getItems();
							oItems.forEach(function (obj) {
								let oObject = obj.getBindingContext().getObject();
								if (!oObject["Enabled"] && parseFloat(oObject["Cost"])) {
									var oSalesPrice = (parseFloat(oObject["Cost"]) * parseFloat(oObject["MinMargin"])).toFixed(2);
									obj.getCells()[5].setValue(oSalesPrice);
								}
							});
						},
						onChangeSalesPrice: function (oEvent) {
							var oSource = oEvent.getSource();
							var oObject = oSource.getParent().getBindingContext().getObject();
							var oValue = parseFloat(oEvent.getParameter("value"));
							var oCost = parseFloat(oSource.getParent().getCells()[4].getValue());
							if (!isNaN(oValue) && !isNaN(oCost) && oValue !== 0) {
								var oMinValue = (oCost * parseFloat(oObject["MinMargin"])).toFixed(2);
								var oMaxValue = (oCost * parseFloat(oObject["MaxMargin"])).toFixed(2);
								if (oMinValue === oMaxValue) {
									oSource.setValueState("Error");
									oSource.setValueStateText(oResourceBundle.getText("SalesPriceEqual", oMinValue));
								} else if (oValue < oMinValue) {
									oSource.setValueState("Error");
									oSource.setValueStateText(oResourceBundle.getText("SalesPriceless", oMinValue));
								} else if (oValue > oMaxValue) {
									oSource.setValueState("Error");
									oSource.setValueStateText(oResourceBundle.getText("SalesPriceMore", oMaxValue));
								} else {
									oSource.setValueState("None");
									oSource.setValueStateText("");
								}
							} else {
								oSource.setValueState("Error");
							}
							this.fnSubmitButonValidation();
						},
						onSelectionChange: function (oEvent) {
							var oSelectedItems = oEvent.getSource().getSelectedItems();
							oSelectedItems.forEach(function (obj) {
								let oObject = obj.getBindingContext().getObject();
								if (!oObject["Enabled"] && parseFloat(oObject["Cost"])) {
									var oSalesPrice = (parseFloat(oObject["Cost"]) * parseFloat(oObject["MinMargin"])).toFixed(2);
									obj.getCells()[5].setValue(oSalesPrice);
								}
								obj.getCells()[1].setEnabled(true);
							});
							var SelectedContext = oEvent.getSource().getSelectedContexts();
							if (oEvent.getParameter("selected") === false) {
								let oObject = oEvent.getParameter("listItem").getBindingContext().getObject();
								if (parseFloat(oObject["Cost"])) {
									var oSalesPrice = (parseFloat(oObject["Cost"]) * parseFloat(oObject["MinMargin"])).toFixed(2);
								}
								oEvent.getParameter("listItem").getCells()[2].setValue("");
								oEvent.getParameter("listItem").getCells()[4].setValue(oObject["Cost"]);
								oEvent.getParameter("listItem").getCells()[5].setValue(oSalesPrice);
								oEvent.getParameter("listItem").getCells()[6].setSelectedKey("");
								oEvent.getParameter("listItem").getCells()[1].setEnabled(false);
							}
							if (oSelectedItems.length === 0) {
								oEvent.getSource().getItems().forEach(function (obj) {
									let oObject = obj.getBindingContext().getObject();
									if (parseFloat(oObject["Cost"])) {
										var oSalesPrice = (parseFloat(oObject["Cost"]) * parseFloat(oObject["MinMargin"])).toFixed(2);
									}
									obj.getCells()[2].setValue("");
									obj.getCells()[4].setValue(oObject["Cost"]);
									obj.getCells()[5].setValue(oSalesPrice);
									obj.getCells()[6].setSelectedKey("");
									obj.getCells()[1].setEnabled(false);
								})
							}
							this.fnSubmitButonValidation();

						},
						onMaterialValueHelpRequested: function (oEvent1) {
							var pageData = that.getView().getBindingContext().getObject();
							var ServiceOrganization = pageData.ServiceOrganization;
							var SalesOrganization = pageData.SalesOrganization;
							var DistributionChannel = pageData.DistributionChannel;
							var input = oEvent1.getSource();
							input.setTokens([]);
							var configObject = {
								entitySet: "ZAE_C_MaterialSalesData_06",
								initiallyVisibleFields: "Material,MaterialGroup,MaterialType,ItemCategoryGroup,UnitOfMeasure",
								selectionMode: "MultiToggle",

								tokenObject: {
									key: "Material",
									Description: "MaterialName"
								},
								controlConfiguration: [{
									index: 0,
									key: "SalesOrganization",
									filterType: "auto",
									label: "SalesOrganization",
									mandatory: "auto",
									visible: false
								}, {
									index: 1,
									key: "DistributionChannel",
									filterType: "auto",
									label: "DistributionChannel",
									mandatory: "auto",
									visible: false
								}, {
									index: 2,
									key: "Material",
									filterType: "auto",
									label: "{/#ZAE_C_MaterialSalesData_06Type/Material/@sap:label}",
									mandatory: "auto",
									visible: true
								}, {
									index: 3,
									key: "MaterialName",
									filterType: "auto",
									label: "{/#ZAE_C_MaterialSalesData_06Type/MaterialName/@sap:label}",
									mandatory: "auto",
									visible: true
								}, {
									index: 4,
									key: "MaterialGroup",
									filterType: "auto",
									label: "Material Group",
									mandatory: "auto",
									visible: true
								}, {
									index: 5,
									key: "MaterialType",
									filterType: "auto",
									label: "{/#ZAE_C_MaterialSalesData_06Type/MaterialType/@sap:label}",
									mandatory: "auto",
									visible: true
								}, {
									index: 6,
									key: "Plant",
									filterType: "auto",
									label: "Service Organization",
									mandatory: "auto",
									visible: false
								}],
								defaultFilter: {
									Plant: {
										"items": [{
											"key": ServiceOrganization
										}]
									}
								},
								onBeforeRebindSmartTable: function (oEvent) {
									var pageData = that.getView().getBindingContext().getObject();
									var aFilters = oEvent.getParameter("bindingParams").filters;
									aFilters.push(new sap.ui.model.Filter({
										path: "Plant",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.ServiceOrganization

									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "DistributionChannel",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.DistributionChannel
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "SalesOrganization",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.SalesOrganization
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "TransactionType",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.ServiceDocumentType
									}));
									oEvent.getParameter("bindingParams").filters = aFilters;
								}

							};
							that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
						},
						onMaterailTokenUpdate: function (oEvent) {
							var aFilters = [];
							var pageData = that.getView().getBindingContext().getObject();
							var oTokens = oEvent.getSource().getTokens();
							if (oEvent.getParameter("type") === "removed") {
								var RemovedTokens = oEvent.getParameters("removedTokens").removedTokens;
								oTokens = oTokens.filter(({
									sId
								}) => !RemovedTokens.some((e) => e.sId === sId));
							}
							oTokens.forEach(function (oToken) {
								aFilters.push(new sap.ui.model.Filter({
									path: "Material",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oToken.getKey()
								}));

							});
							aFilters.push(new sap.ui.model.Filter({
								path: "Plant",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.ServiceOrganization
							}));
							aFilters.push(new sap.ui.model.Filter({
								path: "DistributionChannel",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.DistributionChannel
							}));
							aFilters.push(new sap.ui.model.Filter({
								path: "SalesOrganization",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.SalesOrganization
							}));
							aFilters.push(new sap.ui.model.Filter({
								path: "TransactionType",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.ServiceDocumentType
							}));
							Fragment.byId("AddSubletComponentDialog", "idAddSubletComponentTable").getBinding("items").filter(aFilters);
						},
						onSelectMaterial: function (oEvent) {
							if (oEvent.getParameter("selectedRow") !== null) {
								var oSource = oEvent.getSource();
								oSource.setTokens([]);
								var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
								var oText = this.formatNameAndValuePair(oSelectedData.MaterialName, oSelectedData.Material)
								var oToken = new sap.m.Token({
									key: oSelectedData.Material,
									text: oText
								});
								oSource.setTokens([oToken]);
								oSource.setValue();
								var aFilters = [];
								var pageData = that.getView().getBindingContext().getObject();
								// var oTokens = oEvent.getSource().getTokens();
								// if (oEvent.getParameter("type") && oEvent.getParameter("type") !== "removed") {
								// oTokens.forEach(function (oToken) {
								aFilters.push(new sap.ui.model.Filter({
									path: "Material",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oToken.getKey()
								}));

								// });
								// }
								aFilters.push(new sap.ui.model.Filter({
									path: "Plant",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.ServiceOrganization
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "DistributionChannel",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.DistributionChannel
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "SalesOrganization",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.SalesOrganization
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "TransactionType",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.ServiceDocumentType
								}));
								Fragment.byId("AddSubletComponentDialog", "idAddSubletComponentTable").getBinding("items").filter(aFilters);
							}
						},
						handleMaterialSuggest: function (oEvent) {
							var pageData = that.getView().getBindingContext().getObject();
							var sTerm = oEvent.getParameter("suggestValue");
							var aFilters = [];
							if (sTerm) {
								aFilters.push(new sap.ui.model.Filter({
									path: "Plant",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.ServiceOrganization
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "DistributionChannel",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.DistributionChannel
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "SalesOrganization",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.SalesOrganization
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "TransactionType",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.ServiceDocumentType
								}));

								aFilters.push(new Filter({
									filters: [
										new Filter({
											path: "Material",
											operator: sap.ui.model.FilterOperator.Contains,
											value1: sTerm
										}),
										new Filter({
											path: "MaterialName",
											operator: sap.ui.model.FilterOperator.Contains,
											value1: sTerm
										})

									],
									and: false
								}));
							}
							oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
							oEvent.getSource().getBinding("suggestionRows").resume();
						},
						fnSubmitButonValidation: function (oEvent) {
							var boolIpPending = false;
							var oTableItems = Fragment.byId("AddSubletComponentDialog", "idAddSubletComponentTable").getSelectedItems();
							oTableItems.forEach(function (oItem) {
								if (!(oItem.getCells()[1].getValue())) {
									boolIpPending = true;
								}
								if (!(oItem.getCells()[2].getValue())) {
									boolIpPending = true;
								}
								if (oItem.getCells()[5].getValueState() === 'Error') {
									boolIpPending = true;
								}
							});
							if (oTableItems.length === 0) {
								boolIpPending = true;
							}
							Fragment.byId("AddSubletComponentDialog", "BTNSubmit").setEnabled(!boolIpPending);
						},
						onSubmit: function () {
							var actId = "SSOD_B42";
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var oModel = that.getView().getModel("AddComponents1");
							var oEntity = "ZAE_FM_SSWE_ADD_COMPONENTS_MSet"; //"ZAE_FM_SSWE_ADD_COMPONENTSSet";
							var selSecData = that.aeUtil.getSecData(that, "OPFacet");
							var pageData = that.getView().getBindingContext().getObject();
							var oTableItems = Fragment.byId("AddSubletComponentDialog", "idAddSubletComponentTable").getSelectedItems();
							var NavMain = [{
								"Estimate": pageData.ServiceOrder,
								"Operation": selSecData.ServiceOrderOperation
							}];
							var NavItems = [];
							oTableItems.forEach(function (oItem) {
								NavItems.push({
									"OrderedProd": oItem.getCells()[0].getText(),
									"Quantity": oItem.getCells()[2].getValue(),
									"Severity": oItem.getCells()[6].getSelectedKey(),
									"OrderProdDesc": oItem.getCells()[1].getValue(),
									"Price": oItem.getCells()[5].getValue() !== "" ? oItem.getCells()[5].getValue().toString() : "0",
									"Currency": pageData.currency,
									"ProcessQtyUnit": "",
									"Cost": oItem.getCells()[4].getValue() !== "" ? oItem.getCells()[4].getValue().toString() : "0"

								});
							});
							var data = [{
								callProperty: "NavMain",
								value: NavMain
							}, {
								callProperty: "NavItems",
								value: NavItems
							}];
							var succFunc = function (oData, response) {
								that.getView().getModel().refresh(true);
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
							that._AddSubletComponentsDialog.close();
						},
						onCancel: function () {
							that._AddSubletComponentsDialog.close();
							that._fnLockAddComponent(false);
							that.resetSessionTimeout(false);
							that.oMouseMove = true;
						},
						_fnLockAddComponent: function (Lock) {
							var that = this;
							var pageData = this.getView().getBindingContext().getObject();
							var actId = "SSOD_B42";
							var actLabel = this.aeUtil.geti18nText(that, actId);
							var oModel = this.getView().getModel();
							var oEntity = "ZAE_FM_SRV_DOC_LOCK_UNLOCKSet";
							var data = [{
								callProperty: "ObjectId",
								value: pageData.ServiceOrder
							}, {
								callProperty: "Lock",
								value: Lock
							}];
							var succFunc = function (oData, response) {
								//	this.extensionAPI.refresh();
							}.bind(this);
							var errFunc = function (oData, response) {
								// this.aeUtil.refreshControlModel(oView);
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);
						},
					}
				}).then(function (DialogContent) {
					that._AddSubletComponentsDialog = DialogContent;
					that.getView().addDependent(that._AddSubletComponentsDialog);
					that._initAddSubletComponentsDialog();
					that._AddSubletComponentsDialog.attachBrowserEvent("keyup", function (e) {
						if (e.which == 27 || e.keyCode == 27) {
							that._fnLockAddComponent(false);
						}
					}.bind(this));
				});
			} else {
				that._initAddSubletComponentsDialog();
			}
		},
		// _initAddSubletComponentsDialog: function () {
		// 	var that = this;
		// 	var aFilters = [];
		// 	Fragment.byId("AddSubletComponentDialog", "idAddSubletComponentTable").removeSelections();
		// 	Fragment.byId("AddSubletComponentDialog", "BTNSubmit").setEnabled(false);
		// 	var pageData = that.getView().getBindingContext().getObject();
		// 	var selSecData = this.aeUtil.getSecData(that, "OPFacet");
		// 	if (selSecData instanceof Array) {
		// 		var dialog = new Dialog({
		// 			title: 'Warning',
		// 			type: 'Message',
		// 			state: 'Warning',
		// 			content: new Text({
		// 				text: 'Multiple Selection Not allowed'
		// 			}),
		// 			beginButton: new Button({
		// 				type: ButtonType.Emphasized,
		// 				text: 'OK',
		// 				press: function () {
		// 					dialog.close();
		// 				}
		// 			}),
		// 			afterClose: function () {
		// 				dialog.destroy();
		// 			}
		// 		});
		// 		dialog.open();
		// 		return;
		// 	}
		// 	var oTableBinding = Fragment.byId("AddSubletComponentDialog", "idAddSubletComponentTable");
		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: "Plant",
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: pageData.ServiceOrganization
		// 	}));
		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: "DistributionChannel",
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: pageData.DistributionChannel
		// 	}));
		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: "SalesOrganization",
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: pageData.SalesOrganization
		// 	}));
		// 	aFilters.push(new sap.ui.model.Filter({
		// 		path: "TransactionType",
		// 		operator: sap.ui.model.FilterOperator.EQ,
		// 		value1: pageData.ServiceDocumentType
		// 	}));
		// 	oTableBinding.getBinding("items").filter(aFilters);
		// 	oTableBinding.getItems().forEach(function (obj) {
		// 		obj.getCells()[2].setValue("");
		// 		obj.getCells()[4].setValue("");
		// 		obj.getCells()[5].setSelectedKey("");
		// 		obj.getCells()[1].setEnabled(false);
		// 	})
		// 	var Materials = Fragment.byId("AddSubletComponentDialog", "idMaterial");
		// 	Materials.setTokens([]);
		// 	this._AddSubletComponentsDialog.open();
		// },

		_initAddSubletComponentsDialog: function () {
			var that = this;
			var aFilters = [];
			var ButtonID = "SSOD_B42Sub"
			Fragment.byId("AddSubletComponentDialog", "idAddSubletComponentTable").removeSelections();
			Fragment.byId("AddSubletComponentDialog", "BTNSubmit").setEnabled(false);
			var pageData = that.getView().getBindingContext().getObject();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			if (selSecData instanceof Array) {
				var dialog = new Dialog({
					title: 'Warning',
					type: 'Message',
					state: 'Warning',
					content: new Text({
						text: 'Multiple Selection Not allowed'
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: 'OK',
						press: function () {
							dialog.close();
						}
					}),
					afterClose: function () {
						dialog.destroy();
					}
				});
				dialog.open();
				return;
			}
			var oTableBinding = Fragment.byId("AddSubletComponentDialog", "idAddSubletComponentTable");
			aFilters.push(new sap.ui.model.Filter({
				path: "Plant",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.ServiceOrganization
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "DistributionChannel",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.DistributionChannel
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "SalesOrganization",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.SalesOrganization
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "TransactionType",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.ServiceDocumentType
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "SalesOffice",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.SalesOffice
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "SalesGroup",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.SalesGroup
			}));
			oTableBinding.getBinding("items").filter(aFilters);
			oTableBinding.getItems().forEach(function (obj) {
				let oObject = obj.getBindingContext().getObject();
				obj.getCells()[2].setValue("");
				obj.getCells()[4].setValue(oObject["Cost"]);
				obj.getCells()[5].setValue(oObject["SalesPrice"]);
				obj.getCells()[6].setSelectedKey();
				obj.getCells()[1].setEnabled(false);
			});
			if (oTableBinding.getItems().length > 0) {
				oTableBinding.rerender();
			}
			var Materials = Fragment.byId("AddSubletComponentDialog", "idMaterial");
			Materials.setTokens([]);
			that.oMouseMove = false;
			that._fnLockAddComponent(true, ButtonID);
			$(document).mousemove(function () {
				if (!that.oMouseMove) {
					that.resetSessionTimeout(true);
				}
			});

			$(document).keypress(function (e) {
				if (!that.oMouseMove) {
					that.resetSessionTimeout(true);
				}
			});

			that.resetSessionTimeout(true);
			// this._AddSubletComponentsDialog.open();
		},
		onPressLongText: function (oEvent) {
			var oBindingContextData = oEvent.getSource().getBindingContext().getObject();
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			MessageBox.show(
				oBindingContextData.ItemLongText, {
					icon: MessageBox.Icon.INFORMATION,
					title: oResourceBundle.getText("LongText"),
					actions: [MessageBox.Action.CLOSE],
					emphasizedAction: MessageBox.Action.CLOSE,
					onClose: function (oAction) {}
				}
			);
		},
		onClickSSOD_B123: function () {
			var pageData1 = this.getView().getBindingContext().getObject();
			var link = "https://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=ZSRV_CITEM%20SRV_ORD-LOW=" +
				pageData1.ServiceOrder + ";DYNP_OKCODE=#";
			window.open(link);
		},
		onClickSSOD_B124: function () {
			var pageData1 = this.getView().getBindingContext().getObject();
			var link = "https://" + window.location.host + "/sap/bc/gui/sap/its/webgui?~transaction=ZSRV_PRICE_CHECK%20SRV_ORD-LOW=" +
				pageData1.ServiceOrder + ";DYNP_OKCODE=#";
			window.open(link);
		},
		onClickSSOD_B137: function () {
			var oTablePSF = this.createId("PSFacet::responsiveTable");
			var oView = this.getView();
			var oTablePS = oView.byId(oTablePSF);
			if (oTablePS) {
				this.PricingSummaryTab = true;
				oTablePS.getParent().rebindTable();
				oTablePS.getParent().setInitialNoDataText("No Data Found");
			}
		},

		// onClickSSOD_B131: function (oEvent) {
		// 	var fragName = "com.globalintelli.zae_ssod.ext.fragment.PartsManualDiscount";
		// 	var selSecData = this.aeUtil.getSecData(this, "CPFacet");
		// 	if (selSecData instanceof Array) {
		// 		sap.m.MessageBox.information("Multiple Selection Not Allowed");
		// 		return;
		// 	}
		// 	var that = this;

		// 	if (!this._oApplyDiscountPopoverNew) {
		// 		this._oApplyDiscountPopoverNew = sap.ui.xmlfragment(this.getView().getId(), fragName, {
		// 			onClickSSOD_B132: function (oEvent) {
		// 				that.fnLoadManualDiscountLevelsNew("LP1");
		// 			},
		// 			onClickSSOD_B133: function (oEvent) {
		// 				that.fnLoadManualDiscountLevelsNew("LP2");
		// 			},
		// 			onClickSSOD_B134: function (oEvent) {
		// 				that.fnLoadManualDiscountLevelsNew("LP3");
		// 			},
		// 			onClickSSOD_B135: function (oEvent) {
		// 				that.fnLoadManualDiscountLevelsNew("LP4");
		// 			},
		// 			onClickSSOD_B136: function (oEvent) {
		// 				that.fnLoadManualDiscountLevelsNew("LP5");
		// 			}
		// 		});
		// 		this.getView().addDependent(this._oApplyDiscountPopoverNew);
		// 		this._oApplyDiscountPopoverNew.attachBeforeOpen(function (oEvent) {
		// 			var selSecData = this.aeUtil.getSecData(that, "CPFacet");

		// 			if (selSecData.isShowSSOD_B132 !== undefined) {
		// 				oEvent.getSource().getButtons()[0].setVisible(selSecData.isShowSSOD_B132);
		// 			}

		// 			if (selSecData.isShowSSOD_B133 !== undefined) {
		// 				oEvent.getSource().getButtons()[1].setVisible(selSecData.isShowSSOD_B133);
		// 			}

		// 			if (selSecData.isShowSSOD_B134 !== undefined) {
		// 				oEvent.getSource().getButtons()[2].setVisible(selSecData.isShowSSOD_B134);
		// 			}
		// 			if (selSecData.isShowSSOD_B135 !== undefined) {
		// 				oEvent.getSource().getButtons()[3].setVisible(selSecData.isShowSSOD_B135);
		// 			}
		// 			if (selSecData.isShowSSOD_B136 !== undefined) {
		// 				oEvent.getSource().getButtons()[4].setVisible(selSecData.isShowSSOD_B136);
		// 			}

		// 			setTimeout(function () {}, 1000);

		// 		}, this);
		// 	}
		// 	this._oApplyDiscountPopoverNew.setModel(this.getView().getModel());
		// 	var pop = oEvent.getSource();
		// 	this._oApplyDiscountPopoverNew.openBy(pop);
		// },
		// fnLoadManualDiscountLevelsNew: function (DiscountLevels) {

		// 	var that = this;
		// 	var aFilters = [];
		// 	var selSecData = this.aeUtil.getSecData(that, "CPFacet");
		// 	var oButton = this.getView().byId(this.createId("SSOD_B131Button"));
		// 	var pageData = this.getView().getBindingContext().getObject();
		// 	oButton.setBusy(true);
		// 	// var oSelSecData = oData.results[0];
		// 	var aFilters2 = [];
		// 	aFilters2.push(new Filter("SalesOrganization", "EQ", pageData.SalesOrganization));
		// 	aFilters2.push(new Filter("DistributionChannel", "EQ", pageData.DistributionChannel));
		// 	aFilters2.push(new Filter("SalesDocumentType", "EQ", pageData.ServiceDocumentType));
		// 	aFilters2.push(new Filter("ItemCategoryGroup", "EQ", selSecData.ItemCategoryGroup));
		// 	aFilters2.push(new Filter("SalesOffice", "EQ", pageData.SalesOffice));
		// 	that.getView().getModel().read("/ZAE_I_TC_PQTN_02", {
		// 		filters: aFilters2,
		// 		success: function (oDataDL, responseDL) {
		// 			oButton.setBusy(false);
		// 			var DiscountData = {},
		// 				L1DiscountFrom,
		// 				L1DiscountTo,
		// 				L2DiscountFrom,
		// 				L2DiscountTo,
		// 				L3DiscountFrom,
		// 				L3DiscountTo,
		// 				L4DiscountFrom,
		// 				L4DiscountTo,
		// 				L5DiscountFrom,
		// 				L5DiscountTo;
		// 			if (oDataDL.results.length > 0) {
		// 				for (var i = 0; i < oDataDL.results.length; i++) {
		// 					var oDisLevels = oDataDL.results[i];
		// 					if (oDataDL.results[i].Levels === 'LP1') {
		// 						L1DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						L1DiscountTo = Number(oDisLevels.DiscountTo);
		// 					} else if (oDataDL.results[i].Levels === 'LP2') {
		// 						L2DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						L2DiscountTo = Number(oDisLevels.DiscountTo);
		// 					} else if (oDataDL.results[i].Levels === 'LP3') {
		// 						L3DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						L3DiscountTo = Number(oDisLevels.DiscountTo);
		// 					} else if (oDataDL.results[i].Levels === 'LP4') {
		// 						L4DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						L4DiscountTo = Number(oDisLevels.DiscountTo);
		// 					} else if (oDataDL.results[i].Levels === 'LP5') {
		// 						L5DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						L5DiscountTo = Number(oDisLevels.DiscountTo);
		// 					}

		// 					if (oDisLevels.Levels === DiscountLevels) {
		// 						DiscountData = oDisLevels;
		// 						DiscountData.L1DiscountValue = 0;
		// 						DiscountData.SpecialDiscount = 0;
		// 						DiscountData.DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						DiscountData.DiscountTo = Number(oDisLevels.DiscountTo);
		// 						DiscountData.value = Number(DiscountData.DiscountFrom);
		// 						DiscountData.SliderValue = Number(DiscountData.value);
		// 						DiscountData.SalesQuotation = selSecData.ServiceOrder;
		// 						DiscountData.SalesQuotationItem = selSecData.ServiceOrderItem;
		// 						DiscountData.Subtotal1Amount = Number(selSecData.OrderQuantity) != 0 ? Number(selSecData.GrossValue) / Number(
		// 							selSecData.OperationQuantity) : Number(selSecData.GrossValue);
		// 						DiscountData.CurrentDiscount = Number(selSecData.Discount);
		// 						DiscountData.CurrentDiscountPer = (DiscountData.CurrentDiscount / Number(selSecData.GrossValue)) * 100;
		// 						DiscountData.NetAfterDiscount = Number(DiscountData.Subtotal1Amount) - DiscountData.CurrentDiscount;
		// 						DiscountData.value = 0;
		// 						DiscountData.DiscountValue = 0;
		// 						DiscountData.NetAfterProposed = 0;

		// 					}

		// 				}
		// 				if (L1DiscountFrom && L1DiscountTo) {
		// 					DiscountData.L1DiscountFrom = L1DiscountFrom;
		// 					DiscountData.L1DiscountTo = L1DiscountTo;
		// 					DiscountData.L1Visible = true
		// 				} else {
		// 					DiscountData.L1Visible = false
		// 				}
		// 				if (L2DiscountFrom && L2DiscountFrom) {
		// 					DiscountData.L2DiscountFrom = L2DiscountFrom;
		// 					DiscountData.L2DiscountTo = L2DiscountTo;
		// 					DiscountData.L2Visible = true
		// 				} else {
		// 					DiscountData.L2Visible = false
		// 				}
		// 				if (L3DiscountFrom && L3DiscountFrom) {
		// 					DiscountData.L3DiscountFrom = L3DiscountFrom;
		// 					DiscountData.L3DiscountTo = L3DiscountTo;
		// 					DiscountData.L3Visible = true
		// 				} else {
		// 					DiscountData.L3Visible = false
		// 				}
		// 				if (L4DiscountFrom && L4DiscountTo) {
		// 					DiscountData.L4DiscountFrom = L4DiscountFrom;
		// 					DiscountData.L4DiscountTo = L4DiscountTo;
		// 					DiscountData.L4Visible = true
		// 				} else {
		// 					DiscountData.L4Visible = false
		// 				}
		// 				if (L5DiscountFrom && L5DiscountTo) {
		// 					DiscountData.L5DiscountFrom = L5DiscountFrom;
		// 					DiscountData.L5DiscountTo = L5DiscountTo;
		// 					DiscountData.L5Visible = true
		// 				} else {
		// 					DiscountData.L5Visible = false
		// 				}

		// 				var oModel = that.getView().getModel("mApplyDiscount");
		// 				oModel.setData(DiscountData);
		// 				that.fnLoadManualDiscountPopup();

		// 			} else {
		// 				var MsgErr4 = that.getView().getModel("i18n").getResourceBundle().getText("KindlymaintainData");
		// 				MessageBox.error(MsgErr4);
		// 			}
		// 		},
		// 		error: function (oError) {
		// 			oButton.setBusy(false);
		// 			var MsgErrBox2 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorInDiscountLevel");
		// 			MessageBox.error(MsgErrBox2);
		// 		}
		// 	});

		// },
		// fnLoadManualDiscountPopup: function () {
		// 	var that = this;
		// 	that.byId(that.createId("SSOD_B131Button")).setBusy(false);
		// 	if (!this._oNewManualDiscountDialog) {
		// 		Fragment.load({
		// 				id: "fragManualDiscount",
		// 				name: "com.globalintelli.zae_ssod.ext.fragment.ApplyManualDiscount",
		// 				controller: {
		// 					_fnCalDiscValue: function () {
		// 						var selSecData = that.aeUtil.getSecData(that, "CPFacet");
		// 						var mApplyDiscount = that.getView().getModel("mApplyDiscount");
		// 						var DiscountData = mApplyDiscount.getData();
		// 						var oDiscountAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.SliderValue)) / 100;
		// 						DiscountData.value = DiscountData.SliderValue;
		// 						DiscountData.DiscountValue = (oDiscountAmt * Number(selSecData.OperationQuantity)).toFixed(2);
		// 						DiscountData.NetAfterProposed = (Number(selSecData.GrossValue) - Number(DiscountData.DiscountValue)).toFixed(2);
		// 						if (isNaN(DiscountData.NetAfterProposed)) {
		// 							DiscountData.NetAfterProposed = 0;
		// 						}
		// 						this._SubmitButtonValidation();
		// 					},
		// 					_onInputDiscountValue: function (oEvent) {
		// 						var mApplyDiscount = that.getView().getModel("mApplyDiscount");
		// 						var DiscountData = mApplyDiscount.getData();
		// 						var DiscountValueMSGStrip = Fragment.byId("fragManualDiscount", "applyDiscountMessageStrip");
		// 						var oDiscountToAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountTo)) / 100;
		// 						var oDiscountFromAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountFrom)) / 100;
		// 						var MsgTextDis = that.getView().getModel("i18n").getResourceBundle().getText("Discountbeyondnotpermitted", [DiscountData.DiscountValue]);
		// 						var MsgTextDisLess = that.getView().getModel("i18n").getResourceBundle().getText("Discountlessthennotpermitted", [
		// 							DiscountData.DiscountValue
		// 						]);
		// 						var oSubmitButton = Fragment.byId("fragManualDiscount", "IDSubmitButton");
		// 						if (Number(DiscountData.DiscountValue) > oDiscountToAmt) {
		// 							//show waring msg 
		// 							DiscountData.value = DiscountData.DiscountTo;
		// 							DiscountData.SliderValue = DiscountData.DiscountTo;
		// 							this._fnCalDiscValue();
		// 							DiscountValueMSGStrip.setText(MsgTextDis);
		// 							DiscountValueMSGStrip.setType("Warning");
		// 							DiscountValueMSGStrip.setVisible(true);

		// 						} else if (Number(DiscountData.DiscountValue) < oDiscountFromAmt) {
		// 							DiscountData.value = DiscountData.DiscountFrom;
		// 							DiscountData.SliderValue = DiscountData.DiscountFrom;
		// 							this._fnCalDiscValue();
		// 							DiscountValueMSGStrip.setText(MsgTextDisLess);
		// 							DiscountValueMSGStrip.setType("Warning");
		// 							DiscountValueMSGStrip.setVisible(true);
		// 						} else {
		// 							DiscountValueMSGStrip.setVisible(false);
		// 							var Discount = (Number(DiscountData.DiscountValue) * 100) / Number(DiscountData.Subtotal1Amount);
		// 							DiscountData.value = Discount.toFixed(2);
		// 							DiscountData.SliderValue = Number(DiscountData.value);
		// 							DiscountData.NetValue = Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue);
		// 							DiscountData.NetAfterProposed = (Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue)).toFixed(2);
		// 						}

		// 						if (Number(DiscountData.DiscountValue) >= oDiscountFromAmt && Number(DiscountData.DiscountValue) <= oDiscountToAmt) {
		// 							oSubmitButton.setEnabled(true);
		// 						} else {
		// 							oSubmitButton.setEnabled(false);
		// 						}

		// 					},
		// 					_SubmitButtonValidation: function (oEvent) {
		// 						var StepInput = Fragment.byId("fragManualDiscount", "DiscountSlider");
		// 						var mApplyDiscount = that.getView().getModel("mApplyDiscount");
		// 						var DiscountValue = Fragment.byId("fragManualDiscount", "Discountvalue").getValue();
		// 						var DiscountData = mApplyDiscount.getData();
		// 						// var slider = Fragment.byId("fragManualDiscount", "DiscountSlider");
		// 						var oSubmitButton = Fragment.byId("fragManualDiscount", "IDSubmitButton");
		// 						if (StepInput.getValue() >= Number(DiscountData.DiscountFrom) && StepInput.getValue() <= Number(DiscountData.DiscountTo)) {
		// 							oSubmitButton.setEnabled(true);
		// 							StepInput.setValueState("None");
		// 						} else {
		// 							oSubmitButton.setEnabled(false);
		// 						}

		// 					},
		// 					onSubmitPressed: function () {
		// 						// this._onInputDiscountValue();
		// 						var StepInput = Fragment.byId("fragManualDiscount", "DiscountSlider");
		// 						if (StepInput.getValue() > StepInput.getMax() || StepInput.getValue() < StepInput.getMin()) {
		// 							return;
		// 						}
		// 						var selSecData = that.aeUtil.getSecData(that, "CPFacet");
		// 						var actId = "SSOD_B131";
		// 						var actLabel = that.aeUtil.geti18nText(that, actId);
		// 						var oModelApplyDiscount = that.getView().getModel("mApplyDiscount");
		// 						var oModelApplyDiscountData = oModelApplyDiscount.getData();
		// 						var oModel = that.getView().getModel();
		// 						var aHeaderData = [];

		// 						var oEntity;
		// 						var data;

		// 						oEntity = "ZAE_FM_SRV_ADD_EDIT_CONDSSet";
		// 						var data = [{
		// 							callProperty: "ObjectId",
		// 							value: selSecData.ServiceOrder
		// 						}, {
		// 							callProperty: "NumberInt",
		// 							value: selSecData.ServiceOrderOperation
		// 						}, {
		// 							callProperty: "CondAmount",
		// 							value: oModelApplyDiscountData.DiscountValue.toString()
		// 						}, {
		// 							callProperty: "Level",
		// 							value: oModelApplyDiscountData.Levels
		// 						}];
		// 						var succFunc = function (oData, response) {
		// 							that.aeUtil.refreshControlModel(that.getView());
		// 						}.bind(that);
		// 						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
		// 						that._oNewManualDiscountDialog.close();
		// 					},
		// 					onCancelPressed: function () {
		// 						that._oNewManualDiscountDialog.close();
		// 					}
		// 				}
		// 			})
		// 			.then(function (oDialogContent) {
		// 				that._oNewManualDiscountDialog = oDialogContent;
		// 				that.extensionAPI.attachToView(that._oNewManualDiscountDialog);
		// 				this._setManualDiscountDialogInitialState();
		// 			}.bind(this));
		// 	} else {
		// 		this._setManualDiscountDialogInitialState();
		// 	}
		// },

		// _setManualDiscountDialogInitialState: function () {
		// 	var oModelApplyDiscount = this.getView().getModel("mApplyDiscount");
		// 	var oModelApplyDiscountData = oModelApplyDiscount.getData();
		// 	var oDiscountMessageStrip = Fragment.byId("fragManualDiscount", "applyDiscountMessageStrip");
		// 	var oDiscount = Fragment.byId("fragManualDiscount", "Discount");
		// 	var oGrossValue = Fragment.byId("fragManualDiscount", "Grossvalue");
		// 	var oDiscountvalue = Fragment.byId("fragManualDiscount", "Discountvalue");
		// 	var oDiscount = Fragment.byId("fragManualDiscount", "Discount");
		// 	//	var oDiscountSlider = Fragment.byId("fragManualDiscount", "DiscountSlider");    //commented for AE-4062 
		// 	var oDiscountSlider = Fragment.byId("fragManualDiscount", "DiscountSlider").setValue(0); //Added for AE-4062
		// 	// var oText = Fragment.byId("fragManualDiscount", "TextInput").setValue("");
		// 	var oButton = this._oNewManualDiscountDialog.getBeginButton();
		// 	var DisText = this.getView().getModel("i18n").getResourceBundle().getText("DiscountforSelected");
		// 	if (Number(oModelApplyDiscountData.value) >= Number(oModelApplyDiscountData.DiscountTo)) {
		// 		oDiscountSlider.setVisible(false);
		// 		oDiscount.setVisible(false);
		// 		oGrossValue.setVisible(false);
		// 		oDiscountvalue.setVisible(false);
		// 		oDiscountMessageStrip.setVisible(true);
		// 		oDiscountMessageStrip.setText(DisText);
		// 		oDiscountMessageStrip.setType("Error");
		// 		// oText.setVisible(false);
		// 		oButton.setEnabled(false);
		// 	} else {
		// 		oDiscountMessageStrip.setVisible(false);
		// 		oDiscountSlider.setVisible(true);
		// 		oDiscount.setVisible(true);
		// 		oGrossValue.setVisible(true);
		// 		oDiscountvalue.setVisible(true);
		// 		// oText.setVisible(true);
		// 		oButton.setEnabled(false);
		// 	}
		// 	this._oNewManualDiscountDialog.open();
		// },

		onClickSSOD_B131: function (oEvent) {
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.PartsManualDiscount";
			var selSecData = this.aeUtil.getSecData(this, "CPFacet");
			if (selSecData instanceof Array) {
				sap.m.MessageBox.information("Multiple Selection Not Allowed");
				return;
			}
			var that = this;

			if (!this._oApplyDiscountPopoverNew) {
				this._oApplyDiscountPopoverNew = sap.ui.xmlfragment(this.getView().getId(), fragName, {
					onClickSSOD_B132: function (oEvent) {
						that.fnLoadManualDiscountLevelsNew("LP1");
					},
					onClickSSOD_B133: function (oEvent) {
						that.fnLoadManualDiscountLevelsNew("LP2");
					},
					onClickSSOD_B134: function (oEvent) {
						that.fnLoadManualDiscountLevelsNew("LP3");
					},
					onClickSSOD_B135: function (oEvent) {
						that.fnLoadManualDiscountLevelsNew("LP4");
					},
					onClickSSOD_B136: function (oEvent) {
						that.fnLoadManualDiscountLevelsNew("LP5");
					}
				});
				this.getView().addDependent(this._oApplyDiscountPopoverNew);
				this._oApplyDiscountPopoverNew.attachBeforeOpen(function (oEvent) {
					var selSecData = this.aeUtil.getSecData(that, "CPFacet");

					if (selSecData.isShowSSOD_B132 !== undefined) {
						oEvent.getSource().getButtons()[0].setVisible(selSecData.isShowSSOD_B132);
					}

					if (selSecData.isShowSSOD_B133 !== undefined) {
						oEvent.getSource().getButtons()[1].setVisible(selSecData.isShowSSOD_B133);
					}

					if (selSecData.isShowSSOD_B134 !== undefined) {
						oEvent.getSource().getButtons()[2].setVisible(selSecData.isShowSSOD_B134);
					}
					if (selSecData.isShowSSOD_B135 !== undefined) {
						oEvent.getSource().getButtons()[3].setVisible(selSecData.isShowSSOD_B135);
					}
					if (selSecData.isShowSSOD_B136 !== undefined) {
						oEvent.getSource().getButtons()[4].setVisible(selSecData.isShowSSOD_B136);
					}

					setTimeout(function () {}, 1000);

				}, this);
			}
			this._oApplyDiscountPopoverNew.setModel(this.getView().getModel());
			var pop = oEvent.getSource();
			this._oApplyDiscountPopoverNew.openBy(pop);
		},
		fnLoadManualDiscountLevelsNew: function (DiscountLevels) {

			var that = this;
			var aFilters = [];
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			var DiscountAmount = (selSecData.Discount * selSecData.GrossValue) / 100;
			var oButton = this.getView().byId(this.createId("SSOD_B131Button"));
			var pageData = this.getView().getBindingContext().getObject();
			oButton.setBusy(true);
			// var oSelSecData = oData.results[0];
			var aFilters2 = [];
			aFilters2.push(new Filter("SalesOrganization", "EQ", pageData.SalesOrganization));
			aFilters2.push(new Filter("DistributionChannel", "EQ", pageData.DistributionChannel));
			aFilters2.push(new Filter("SalesDocumentType", "EQ", pageData.ServiceDocumentType));
			aFilters2.push(new Filter("ItemCategoryGroup", "EQ", selSecData.ItemCategoryGroup));
			aFilters2.push(new Filter("SalesOffice", "EQ", pageData.SalesOffice));
			that.getView().getModel().read("/ZAE_I_TC_PQTN_02", {
				filters: aFilters2,
				success: function (oDataDL, responseDL) {
					oButton.setBusy(false);
					var DiscountData = {},
						L1DiscountFrom,
						L1DiscountTo,
						L2DiscountFrom,
						L2DiscountTo,
						L3DiscountFrom,
						L3DiscountTo,
						L4DiscountFrom,
						L4DiscountTo,
						L5DiscountFrom,
						L5DiscountTo;
					if (oDataDL.results.length > 0) {
						for (var i = 0; i < oDataDL.results.length; i++) {
							var oDisLevels = oDataDL.results[i];
							if (oDataDL.results[i].Levels === 'LP1') {
								L1DiscountFrom = Number(oDisLevels.DiscountFrom);
								L1DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LP2') {
								L2DiscountFrom = Number(oDisLevels.DiscountFrom);
								L2DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LP3') {
								L3DiscountFrom = Number(oDisLevels.DiscountFrom);
								L3DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LP4') {
								L4DiscountFrom = Number(oDisLevels.DiscountFrom);
								L4DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LP5') {
								L5DiscountFrom = Number(oDisLevels.DiscountFrom);
								L5DiscountTo = Number(oDisLevels.DiscountTo);
							}

							if (oDisLevels.Levels === DiscountLevels) {
								DiscountData = oDisLevels;
								DiscountData.L1DiscountValue = 0;
								DiscountData.SpecialDiscount = 0;
								DiscountData.DiscountFrom = Number(oDisLevels.DiscountFrom);
								DiscountData.DiscountTo = Number(oDisLevels.DiscountTo);
								DiscountData.value = Number(DiscountData.DiscountFrom);
								DiscountData.SliderValue = Number(DiscountData.value);
								DiscountData.SalesOrder = selSecData.WorkEstimate;
								DiscountData.SalesOrderItem = selSecData.WorkEstimateItem;
								DiscountData.Subtotal1Amount = (Number(selSecData.GrossValue) / Number(selSecData.OperationQuantity)).toFixed(2);
								DiscountData.CurrentDiscount = (Number(DiscountAmount) / Number(selSecData.OperationQuantity)).toFixed(2);
								DiscountData.CurrentDiscountPer = Number(selSecData.Discount);
								// DiscountData.SalesQuotation = selSecData.WorkEstimate;
								// DiscountData.SalesQuotationItem = selSecData.WorkEstimateItem;
								// DiscountData.Subtotal1Amount = Number(selSecData.OrderQuantity) != 0 ? Number(selSecData.GrossValue) / Number(
								// 	selSecData.OperationQuantity) : Number(selSecData.GrossValue);
								// DiscountData.CurrentDiscount = Number(selSecData.Discount);
								// DiscountData.CurrentDiscountPer = (DiscountData.CurrentDiscount / Number(selSecData.GrossValue)) * 100;
								DiscountData.NetAfterDiscount = Number(DiscountData.Subtotal1Amount) - DiscountData.CurrentDiscount;
								DiscountData.value = 0;
								DiscountData.DiscountValue = 0;
								DiscountData.NetAfterProposed = 0;

							}

						}
						if (L1DiscountFrom && L1DiscountTo) {
							DiscountData.L1DiscountFrom = L1DiscountFrom;
							DiscountData.L1DiscountTo = L1DiscountTo;
							DiscountData.L1Visible = true
						} else {
							DiscountData.L1Visible = false
						}
						if (L2DiscountFrom && L2DiscountFrom) {
							DiscountData.L2DiscountFrom = L2DiscountFrom;
							DiscountData.L2DiscountTo = L2DiscountTo;
							DiscountData.L2Visible = true
						} else {
							DiscountData.L2Visible = false
						}
						if (L3DiscountFrom && L3DiscountFrom) {
							DiscountData.L3DiscountFrom = L3DiscountFrom;
							DiscountData.L3DiscountTo = L3DiscountTo;
							DiscountData.L3Visible = true
						} else {
							DiscountData.L3Visible = false
						}
						if (L4DiscountFrom && L4DiscountTo) {
							DiscountData.L4DiscountFrom = L4DiscountFrom;
							DiscountData.L4DiscountTo = L4DiscountTo;
							DiscountData.L4Visible = true
						} else {
							DiscountData.L4Visible = false
						}
						if (L5DiscountFrom && L5DiscountTo) {
							DiscountData.L5DiscountFrom = L5DiscountFrom;
							DiscountData.L5DiscountTo = L5DiscountTo;
							DiscountData.L5Visible = true
						} else {
							DiscountData.L5Visible = false
						}

						var oModel = that.getView().getModel("mApplyDiscount");
						oModel.setData(DiscountData);
						that.fnLoadManualDiscountPopup();

					} else {
						var MsgErr4 = that.getView().getModel("i18n").getResourceBundle().getText("KindlymaintainData");
						MessageBox.error(MsgErr4);
					}
				},
				error: function (oError) {
					oButton.setBusy(false);
					var MsgErrBox2 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorInDiscountLevel");
					MessageBox.error(MsgErrBox2);
				}
			});

		},
		fnLoadManualDiscountPopup: function () {
			var that = this;
			that.byId(that.createId("SSOD_B131Button")).setBusy(false);
			if (!this._oNewManualDiscountDialog) {
				Fragment.load({
						id: "fragManualDiscount",
						name: "com.globalintelli.zae_ssod.ext.fragment.ApplyManualDiscount",
						controller: {
							_fnCalDiscValue: function () {
								var selSecData = that.aeUtil.getSecData(that, "CPFacet");
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountData = mApplyDiscount.getData();
								var oDiscountAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.SliderValue)) / 100;
								DiscountData.value = DiscountData.SliderValue;
								//	DiscountData.DiscountValue = (oDiscountAmt * Number(selSecData.OperationQuantity)).toFixed(2);
								//	DiscountData.NetAfterProposed = (Number(selSecData.GrossValue) - Number(DiscountData.DiscountValue)).toFixed(2);
								DiscountData.DiscountValue = (oDiscountAmt).toFixed(2);
								DiscountData.NetAfterProposed = (Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue)).toFixed(2);
								// DiscountData.NetAfterProposed = (Number(DiscountData.NetAfterDiscount) - Number(DiscountData.DiscountValue)).toFixed(2);
								if (isNaN(DiscountData.NetAfterProposed)) {
									DiscountData.NetAfterProposed = 0;
								}
								this._SubmitButtonValidation();
							},
							_onInputDiscountValue: function (oEvent) {
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountData = mApplyDiscount.getData();
								var DiscountValueMSGStrip = Fragment.byId("fragManualDiscount", "applyDiscountMessageStrip");
								var oDiscountToAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountTo)) / 100;
								var oDiscountFromAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountFrom)) / 100;
								var MsgTextDis = that.getView().getModel("i18n").getResourceBundle().getText("Discountbeyondnotpermitted", [DiscountData.DiscountValue]);
								var MsgTextDisLess = that.getView().getModel("i18n").getResourceBundle().getText("Discountlessthennotpermitted", [
									DiscountData.DiscountValue
								]);
								var oSubmitButton = Fragment.byId("fragManualDiscount", "IDSubmitButton");
								if (Number(DiscountData.DiscountValue) > oDiscountToAmt) {
									//show waring msg 
									DiscountData.value = DiscountData.DiscountTo;
									DiscountData.SliderValue = DiscountData.DiscountTo;
									this._fnCalDiscValue();
									DiscountValueMSGStrip.setText(MsgTextDis);
									DiscountValueMSGStrip.setType("Warning");
									DiscountValueMSGStrip.setVisible(true);

								} else if (Number(DiscountData.DiscountValue) < oDiscountFromAmt) {
									DiscountData.value = DiscountData.DiscountFrom;
									DiscountData.SliderValue = DiscountData.DiscountFrom;
									this._fnCalDiscValue();
									DiscountValueMSGStrip.setText(MsgTextDisLess);
									DiscountValueMSGStrip.setType("Warning");
									DiscountValueMSGStrip.setVisible(true);
								} else {
									DiscountValueMSGStrip.setVisible(false);
									var Discount = (Number(DiscountData.DiscountValue) * 100) / Number(DiscountData.Subtotal1Amount);
									DiscountData.value = Discount.toFixed(2);
									DiscountData.SliderValue = Number(DiscountData.value);
									DiscountData.NetValue = Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue);
									DiscountData.NetAfterProposed = (Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue)).toFixed(2);
								}

								if (Number(DiscountData.DiscountValue) >= oDiscountFromAmt && Number(DiscountData.DiscountValue) <= oDiscountToAmt) {
									oSubmitButton.setEnabled(true);
								} else {
									oSubmitButton.setEnabled(false);
								}

							},
							_SubmitButtonValidation: function (oEvent) {
								var StepInput = Fragment.byId("fragManualDiscount", "DiscountSlider");
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountValue = Fragment.byId("fragManualDiscount", "Discountvalue").getValue();
								var DiscountData = mApplyDiscount.getData();
								// var slider = Fragment.byId("fragManualDiscount", "DiscountSlider");
								var oSubmitButton = Fragment.byId("fragManualDiscount", "IDSubmitButton");
								if (StepInput.getValue() >= Number(DiscountData.DiscountFrom) && StepInput.getValue() <= Number(DiscountData.DiscountTo)) {
									oSubmitButton.setEnabled(true);
									StepInput.setValueState("None");
								} else {
									oSubmitButton.setEnabled(false);
								}

							},
							onSubmitPressed: function () {
								// this._onInputDiscountValue();
								var StepInput = Fragment.byId("fragManualDiscount", "DiscountSlider");
								if (StepInput.getValue() > StepInput.getMax() || StepInput.getValue() < StepInput.getMin()) {
									return;
								}
								var selSecData = that.aeUtil.getSecData(that, "CPFacet");
								var actId = "SSOD_B131";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var oModelApplyDiscount = that.getView().getModel("mApplyDiscount");
								var oModelApplyDiscountData = oModelApplyDiscount.getData();
								var oModel = that.getView().getModel();
								var aHeaderData = [];

								var oEntity;
								var data;
								var oBalanceAmount = 0;
								// var oBalancePercentage = 0;
								// var oDiscountCheck;
								// var oDifferencePercentage = oModelApplyDiscountData.DiscountTo - (Number(selSecData.Discount) +
								// 	oModelApplyDiscountData.SliderValue);
								// //	var oUnitDiscount = (Number(oModelApplyDiscountData.Subtotal1Amount) * 1) / 100;
								// //	var onePercengageDiscountAmount = (oUnitDiscount * Number(selSecData.OperationQuantity)).toFixed(2);
								// if (oDifferencePercentage > 0) {
								// 	oBalancePercentage = (Number(oModelApplyDiscountData.SliderValue)).toFixed(2);
								// 	if (Number(oModelApplyDiscountData.SliderValue - oModelApplyDiscountData.CurrentDiscountPer) <= 0) {
								// 		oDiscountCheck = oModelApplyDiscountData.SliderValue;
								// 	} else {
								// 		oDiscountCheck = oModelApplyDiscountData.SliderValue - oModelApplyDiscountData.CurrentDiscountPer;
								// 	}
								// 	oBalanceAmount = Math.abs((((Number(oModelApplyDiscountData.Subtotal1Amount) * oDiscountCheck) / 100) *
								// 		Number(selSecData.OperationQuantity)));
								// 	// oBalanceAmount = (onePercengageDiscountAmount * Number(oModelApplyDiscountData.SliderValue)).toFixed(2);
								// 	// oBalancePercentage = (Number(oModelApplyDiscountData.SliderValue)).toFixed(2);
								// 	// oBalanceAmount = (((Number(oModelApplyDiscountData.Subtotal1Amount) * Number(oModelApplyDiscountData.SliderValue)) / 100) *
								// 	// 	Number(selSecData.OperationQuantity));
								// } else {
								// 	oBalancePercentage = ((Number(oModelApplyDiscountData.DiscountTo) - Number(oModelApplyDiscountData.CurrentDiscountPer))).toFixed(
								// 		2);
								// 	// oBalanceAmount = (onePercengageDiscountAmount *
								// 	// 	(Number(oModelApplyDiscountData.DiscountTo) - Number(selSecData.Discount))).toFixed(2);
								// 	// oBalanceAmount = oBalanceAmount > 0 ? oBalanceAmount : 0;
								// 	if (oBalancePercentage > 0) {
								// 		oBalanceAmount = (((Number(oModelApplyDiscountData.Subtotal1Amount) * Number(oBalancePercentage)) /
								// 				100) *
								// 			Number(selSecData.OperationQuantity));
								// 	} else {
								// 		oBalanceAmount = 0;
								// 	}
								// }
								//Commented by Sandhya SP-8189
								// var oBalancePercentage = 0;
								// if (Number(oModelApplyDiscountData.SliderValue - oModelApplyDiscountData.CurrentDiscountPer) <= 0) {
								// 	if (Number(oModelApplyDiscountData.SliderValue + oModelApplyDiscountData.CurrentDiscountPer) > Number(
								// 			oModelApplyDiscountData.DiscountTo)) {
								// 		oBalancePercentage = Number(oModelApplyDiscountData.DiscountTo) - oModelApplyDiscountData.CurrentDiscountPer;
								// 	} else {
								// 		oBalancePercentage = oModelApplyDiscountData.SliderValue;
								// 	}
								// } else {
								// 	oBalancePercentage = oModelApplyDiscountData.SliderValue - oModelApplyDiscountData.CurrentDiscountPer;
								// }
								// oBalanceAmount = Math.abs((((Number(oModelApplyDiscountData.Subtotal1Amount) * oBalancePercentage) / 100) *
								// 	Number(selSecData.OperationQuantity)));
								//End by Sandhya SP-8189

								oBalanceAmount = oModelApplyDiscountData.DiscountValue;
								oEntity = "ZAE_FM_SRV_ADD_EDIT_CONDSSet";
								var data = [{
									callProperty: "ObjectId",
									value: selSecData.ServiceOrder
								}, {
									callProperty: "NumberInt",
									value: selSecData.ServiceOrderOperation
								}, {
									callProperty: "CondAmount",
									value: oBalanceAmount.toString()
								}, {
									callProperty: "Level",
									value: oModelApplyDiscountData.Levels
								}];
								var succFunc = function (oData, response) {
									that.aeUtil.refreshControlModel(that.getView());
								}.bind(that);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
								that._oNewManualDiscountDialog.close();
							},
							onCancelPressed: function () {
								that._oNewManualDiscountDialog.close();
							}
						}
					})
					.then(function (oDialogContent) {
						that._oNewManualDiscountDialog = oDialogContent;
						that.extensionAPI.attachToView(that._oNewManualDiscountDialog);
						this._setManualDiscountDialogInitialState();
					}.bind(this));
			} else {
				this._setManualDiscountDialogInitialState();
			}
		},

		_setManualDiscountDialogInitialState: function () {
			var oModelApplyDiscount = this.getView().getModel("mApplyDiscount");
			var oModelApplyDiscountData = oModelApplyDiscount.getData();
			var oDiscountMessageStrip = Fragment.byId("fragManualDiscount", "applyDiscountMessageStrip");
			var oDiscount = Fragment.byId("fragManualDiscount", "Discount");
			var oGrossValue = Fragment.byId("fragManualDiscount", "Grossvalue");
			var oDiscountvalue = Fragment.byId("fragManualDiscount", "Discountvalue");
			var oDiscount = Fragment.byId("fragManualDiscount", "Discount");
			//	var oDiscountSlider = Fragment.byId("fragManualDiscount", "DiscountSlider");    //commented for AE-4062 
			var oDiscountSlider = Fragment.byId("fragManualDiscount", "DiscountSlider").setValue(0); //Added for AE-4062
			// var oText = Fragment.byId("fragManualDiscount", "TextInput").setValue("");
			var oButton = this._oNewManualDiscountDialog.getBeginButton();
			var DisText = this.getView().getModel("i18n").getResourceBundle().getText("DiscountforSelected");
			if (Number(oModelApplyDiscountData.CurrentDiscountPer) >= Number(oModelApplyDiscountData.DiscountTo)) {
				oDiscountSlider.setVisible(false);
				oDiscount.setVisible(false);
				oGrossValue.setVisible(false);
				oDiscountvalue.setVisible(false);
				oDiscountMessageStrip.setVisible(true);
				oDiscountMessageStrip.setText(DisText);
				oDiscountMessageStrip.setType("Error");
				// oText.setVisible(false);
				oButton.setEnabled(false);
			} else {
				oDiscountMessageStrip.setVisible(false);
				oDiscountSlider.setVisible(true);
				oDiscount.setVisible(true);
				oGrossValue.setVisible(true);
				oDiscountvalue.setVisible(true);
				// oText.setVisible(true);
				oButton.setEnabled(false);
			}
			this._oNewManualDiscountDialog.open();
		},

		// Request manual Discount 
		// onClickSSOD_B125: function (oEvent) {
		// 	var fragName = "com.globalintelli.zae_ssod.ext.fragment.RequestManualDiscount";
		// 	var selSecData = this.aeUtil.getSecData(this, "CPFacet");
		// 	if (selSecData instanceof Array) {
		// 		sap.m.MessageBox.information("Multiple Selection Not Allowed");
		// 		return;
		// 	}
		// 	var that = this;

		// 	if (!this._oApplyRequestDiscountPopover) {
		// 		this._oApplyRequestDiscountPopover = sap.ui.xmlfragment(this.getView().getId(), fragName, {
		// 			onClickSSOD_B126: function (oEvent) {
		// 				that.fnLoadDiscountLevelsReq("LP1");
		// 			},
		// 			onClickSSOD_B127: function (oEvent) {
		// 				that.fnLoadDiscountLevelsReq("LP2");
		// 			},
		// 			onClickSSOD_B128: function (oEvent) {
		// 				that.fnLoadDiscountLevelsReq("LP3");
		// 			},
		// 			onClickSSOD_B129: function (oEvent) {
		// 				that.fnLoadDiscountLevelsReq("LP4");
		// 			},
		// 			onClickSSOD_B130: function (oEvent) {
		// 				that.fnLoadDiscountLevelsReq("LP5");
		// 			}
		// 		});
		// 		this.getView().addDependent(this._oApplyRequestDiscountPopover);
		// 		this._oApplyRequestDiscountPopover.attachBeforeOpen(function (oEvent) {
		// 			var selSecData = this.aeUtil.getSecData(that, "CPFacet");

		// 			if (selSecData.isShowSSOD_B126 !== undefined) {
		// 				oEvent.getSource().getButtons()[0].setVisible(selSecData.isShowSSOD_B126);
		// 			}

		// 			if (selSecData.isShowSSOD_B127 !== undefined) {
		// 				oEvent.getSource().getButtons()[1].setVisible(selSecData.isShowSSOD_B127);
		// 			}

		// 			if (selSecData.isShowSSOD_B128 !== undefined) {
		// 				oEvent.getSource().getButtons()[2].setVisible(selSecData.isShowSSOD_B128);
		// 			}
		// 			if (selSecData.isShowSSOD_B129 !== undefined) {
		// 				oEvent.getSource().getButtons()[3].setVisible(selSecData.isShowSSOD_B129);
		// 			}
		// 			if (selSecData.isShowSSOD_B130 !== undefined) {
		// 				oEvent.getSource().getButtons()[4].setVisible(selSecData.isShowSSOD_B130);
		// 			}

		// 			setTimeout(function () {}, 1000);

		// 		}, this);
		// 	}
		// 	this._oApplyRequestDiscountPopover.setModel(this.getView().getModel());
		// 	var pop = oEvent.getSource();
		// 	this._oApplyRequestDiscountPopover.openBy(pop);
		// },
		// fnLoadDiscountLevelsReq: function (DiscountLevels) {

		// 	var that = this;
		// 	var aFilters = [];
		// 	var selSecData = this.aeUtil.getSecData(that, "CPFacet");
		// 	var oButton = this.getView().byId(this.createId("SSOD_B125Button"));
		// 	var pageData = this.getView().getBindingContext().getObject();
		// 	oButton.setBusy(true);
		// 	// var oSelSecData = oData.results[0];
		// 	var aFilters2 = [];
		// 	aFilters2.push(new Filter("SalesOrganization", "EQ", pageData.SalesOrganization));
		// 	aFilters2.push(new Filter("DistributionChannel", "EQ", pageData.DistributionChannel));
		// 	aFilters2.push(new Filter("SalesDocumentType", "EQ", pageData.ServiceDocumentType));
		// 	aFilters2.push(new Filter("ItemCategoryGroup", "EQ", selSecData.ItemCategoryGroup));
		// 	aFilters2.push(new Filter("SalesOffice", "EQ", pageData.SalesOffice));
		// 	that.getView().getModel().read("/ZAE_I_TC_PQTN_02", {
		// 		filters: aFilters2,
		// 		success: function (oDataDL, responseDL) {
		// 			oButton.setBusy(false);
		// 			var DiscountData = {},
		// 				L1DiscountFrom,
		// 				L1DiscountTo,
		// 				L2DiscountFrom,
		// 				L2DiscountTo,
		// 				L3DiscountFrom,
		// 				L3DiscountTo,
		// 				L4DiscountFrom,
		// 				L4DiscountTo,
		// 				L5DiscountFrom,
		// 				L5DiscountTo;
		// 			if (oDataDL.results.length > 0) {
		// 				for (var i = 0; i < oDataDL.results.length; i++) {
		// 					var oDisLevels = oDataDL.results[i];
		// 					if (oDataDL.results[i].Levels === 'LP1') {
		// 						L1DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						L1DiscountTo = Number(oDisLevels.DiscountTo);
		// 					} else if (oDataDL.results[i].Levels === 'LP2') {
		// 						L2DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						L2DiscountTo = Number(oDisLevels.DiscountTo);
		// 					} else if (oDataDL.results[i].Levels === 'LP3') {
		// 						L3DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						L3DiscountTo = Number(oDisLevels.DiscountTo);
		// 					} else if (oDataDL.results[i].Levels === 'LP4') {
		// 						L4DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						L4DiscountTo = Number(oDisLevels.DiscountTo);
		// 					} else if (oDataDL.results[i].Levels === 'LP5') {
		// 						L5DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						L5DiscountTo = Number(oDisLevels.DiscountTo);
		// 					}

		// 					if (oDisLevels.Levels === DiscountLevels) {
		// 						DiscountData = oDisLevels;
		// 						DiscountData.L1DiscountValue = 0;
		// 						DiscountData.SpecialDiscount = 0;
		// 						DiscountData.DiscountFrom = Number(oDisLevels.DiscountFrom);
		// 						DiscountData.DiscountTo = Number(oDisLevels.DiscountTo);
		// 						DiscountData.value = Number(DiscountData.DiscountFrom);
		// 						DiscountData.SliderValue = Number(DiscountData.value);
		// 						DiscountData.SalesQuotation = selSecData.ServiceOrder;
		// 						DiscountData.SalesQuotationItem = selSecData.ServiceOrderOperation;
		// 						DiscountData.Subtotal1Amount = Number(selSecData.OperationQuantity) != 0 ? Number(selSecData.GrossValue) / Number(
		// 							selSecData.OperationQuantity) : Number(selSecData.GrossValue);
		// 						DiscountData.CurrentDiscount = Number(selSecData.Discount);
		// 						DiscountData.CurrentDiscountPer = (DiscountData.CurrentDiscount / Number(selSecData.GrossValue)) * 100;
		// 						DiscountData.NetAfterDiscount = Number(DiscountData.Subtotal1Amount) - DiscountData.CurrentDiscount;
		// 						DiscountData.value = 0;
		// 						DiscountData.DiscountValue = 0;
		// 						DiscountData.NetAfterProposed = 0;

		// 					}

		// 				}
		// 				if (L1DiscountFrom && L1DiscountTo) {
		// 					DiscountData.L1DiscountFrom = L1DiscountFrom;
		// 					DiscountData.L1DiscountTo = L1DiscountTo;
		// 					DiscountData.L1Visible = true
		// 				} else {
		// 					DiscountData.L1Visible = false
		// 				}
		// 				if (L2DiscountFrom && L2DiscountFrom) {
		// 					DiscountData.L2DiscountFrom = L2DiscountFrom;
		// 					DiscountData.L2DiscountTo = L2DiscountTo;
		// 					DiscountData.L2Visible = true
		// 				} else {
		// 					DiscountData.L2Visible = false
		// 				}
		// 				if (L3DiscountFrom && L3DiscountFrom) {
		// 					DiscountData.L3DiscountFrom = L3DiscountFrom;
		// 					DiscountData.L3DiscountTo = L3DiscountTo;
		// 					DiscountData.L3Visible = true
		// 				} else {
		// 					DiscountData.L3Visible = false
		// 				}
		// 				if (L4DiscountFrom && L4DiscountTo) {
		// 					DiscountData.L4DiscountFrom = L4DiscountFrom;
		// 					DiscountData.L4DiscountTo = L4DiscountTo;
		// 					DiscountData.L4Visible = true
		// 				} else {
		// 					DiscountData.L4Visible = false
		// 				}
		// 				if (L5DiscountFrom && L5DiscountTo) {
		// 					DiscountData.L5DiscountFrom = L5DiscountFrom;
		// 					DiscountData.L5DiscountTo = L5DiscountTo;
		// 					DiscountData.L5Visible = true
		// 				} else {
		// 					DiscountData.L5Visible = false
		// 				}

		// 				var oModel = that.getView().getModel("mApplyDiscount");
		// 				oModel.setData(DiscountData);
		// 				that.fnLoadDiscountPopupReq();

		// 			} else {
		// 				var MsgErr4 = that.getView().getModel("i18n").getResourceBundle().getText("KindlymaintainData");
		// 				MessageBox.error(MsgErr4);
		// 			}
		// 		},
		// 		error: function (oError) {
		// 			oButton.setBusy(false);
		// 			var MsgErrBox2 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorInDiscountLevel");
		// 			MessageBox.error(MsgErrBox2);
		// 		}
		// 	});

		// },
		// fnLoadDiscountPopupReq: function () {
		// 	var that = this;
		// 	that.byId(that.createId("SSOD_B125Button")).setBusy(false);
		// 	if (!this._oNewRequestManualDiscountDialog) {
		// 		Fragment.load({
		// 				id: "fragReqManualDiscount",
		// 				name: "com.globalintelli.zae_ssod.ext.fragment.RequestManualDiscountPopup",
		// 				controller: {
		// 					_fnCalDiscValue: function () {
		// 						var selSecData = that.aeUtil.getSecData(that, "CPFacet");
		// 						var mApplyDiscount = that.getView().getModel("mApplyDiscount");
		// 						var DiscountData = mApplyDiscount.getData();
		// 						//Percentage
		// 						var oDiscountAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.SliderValue)) / 100;
		// 						DiscountData.value = DiscountData.SliderValue;
		// 						DiscountData.DiscountValue = (oDiscountAmt * Number(selSecData.OperationQuantity)).toFixed(2);
		// 						// DiscountData.NetValue = Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue);
		// 						DiscountData.NetAfterProposed = (Number(selSecData.GrossValue) - Number(DiscountData.DiscountValue)).toFixed(2);
		// 						if (isNaN(DiscountData.NetAfterProposed)) {
		// 							DiscountData.NetAfterProposed = 0;
		// 						}
		// 						this._SubmitButtonValidation();
		// 					},
		// 					_onInputDiscountValue: function (oEvent) {
		// 						var mApplyDiscount = that.getView().getModel("mApplyDiscount");
		// 						var DiscountData = mApplyDiscount.getData();
		// 						var DiscountValueMSGStrip = Fragment.byId("fragReqManualDiscount", "applyDiscountMessageStrip");
		// 						var oDiscountToAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountTo)) / 100;
		// 						var oDiscountFromAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountFrom)) / 100;
		// 						var MsgTextDis = that.getView().getModel("i18n").getResourceBundle().getText("Discountbeyondnotpermitted", [DiscountData.DiscountValue]);
		// 						var MsgTextDisLess = that.getView().getModel("i18n").getResourceBundle().getText("Discountlessthennotpermitted", [
		// 							DiscountData.DiscountValue
		// 						]);
		// 						var oSubmitButton = Fragment.byId("fragReqManualDiscount", "IDSubmitButton");
		// 						if (Number(DiscountData.DiscountValue) > oDiscountToAmt) {
		// 							//show waring msg 
		// 							DiscountData.value = DiscountData.DiscountTo;
		// 							DiscountData.SliderValue = DiscountData.DiscountTo;
		// 							this._fnCalDiscValue();
		// 							DiscountValueMSGStrip.setText(MsgTextDis);
		// 							DiscountValueMSGStrip.setType("Warning");
		// 							DiscountValueMSGStrip.setVisible(true);

		// 						} else if (Number(DiscountData.DiscountValue) < oDiscountFromAmt) {
		// 							DiscountData.value = DiscountData.DiscountFrom;
		// 							DiscountData.SliderValue = DiscountData.DiscountFrom;
		// 							this._fnCalDiscValue();
		// 							DiscountValueMSGStrip.setText(MsgTextDisLess);
		// 							DiscountValueMSGStrip.setType("Warning");
		// 							DiscountValueMSGStrip.setVisible(true);
		// 						} else {
		// 							DiscountValueMSGStrip.setVisible(false);
		// 							var Discount = (Number(DiscountData.DiscountValue) * 100) / Number(DiscountData.Subtotal1Amount);
		// 							DiscountData.value = Discount.toFixed(2);
		// 							DiscountData.SliderValue = Number(DiscountData.value);
		// 							DiscountData.NetValue = Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue);
		// 							DiscountData.NetAfterProposed = (Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue)).toFixed(2);
		// 						}

		// 						if (Number(DiscountData.DiscountValue) >= oDiscountFromAmt && Number(DiscountData.DiscountValue) <= oDiscountToAmt) {
		// 							oSubmitButton.setEnabled(true);
		// 						} else {
		// 							oSubmitButton.setEnabled(false);
		// 						}

		// 					},
		// 					_SubmitButtonValidation: function (oEvent) {
		// 						var StepInput = Fragment.byId("fragReqManualDiscount", "DiscountSlider");
		// 						var mApplyDiscount = that.getView().getModel("mApplyDiscount");
		// 						var DiscountValue = Fragment.byId("fragReqManualDiscount", "Discountvalue").getValue();
		// 						var DiscountData = mApplyDiscount.getData();
		// 						var oSubmitButton = Fragment.byId("fragReqManualDiscount", "IDSubmitButton");

		// 						if (StepInput.getValue() >= Number(DiscountData.DiscountFrom) && StepInput.getValue() <= Number(DiscountData.DiscountTo)) {
		// 							oSubmitButton.setEnabled(true);
		// 							StepInput.setValueState("None");
		// 						} else {
		// 							oSubmitButton.setEnabled(false);
		// 						}
		// 					},
		// 					onSubmitPressed: function () {
		// 						// this._onInputDiscountValue();
		// 						var StepInput = Fragment.byId("fragReqManualDiscount", "DiscountSlider");
		// 						if (StepInput.getValue() > StepInput.getMax() || StepInput.getValue() < StepInput.getMin()) {
		// 							return;
		// 						}
		// 						var selSecData = that.aeUtil.getSecData(that, "CPFacet");
		// 						var actId = "SSOD_B125";
		// 						var actLabel = that.aeUtil.geti18nText(that, actId);
		// 						var oModelApplyDiscount = that.getView().getModel("mApplyDiscount");
		// 						var oModelApplyDiscountData = oModelApplyDiscount.getData();
		// 						var oModel = that.getView().getModel();
		// 						var aHeaderData = [];
		// 						var oEntity;
		// 						var data;
		// 						oEntity = "ZAE_FM_PQTN_PARTS_DISCOUNTSet";
		// 						var data = [{
		// 							callProperty: "DocNo",
		// 							value: selSecData.ServiceOrder
		// 						}, {
		// 							callProperty: "ItemNo",
		// 							value: selSecData.ServiceOrderOperation
		// 						}, {
		// 							callProperty: "DocType",
		// 							value: "4"
		// 						}, {
		// 							callProperty: "Discount",
		// 							value: oModelApplyDiscountData.DiscountValue.toString()
		// 						}, {
		// 							callProperty: "Levels",
		// 							value: oModelApplyDiscountData.Levels
		// 						}];
		// 						var succFunc = function (oData, response) {
		// 							that.aeUtil.refreshControlModel(that.getView());
		// 						}.bind(that);
		// 						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
		// 						that._oNewRequestManualDiscountDialog.close();
		// 					},
		// 					onCancelPressed: function () {
		// 						that._oNewRequestManualDiscountDialog.close();
		// 					}
		// 				}
		// 			})
		// 			.then(function (oDialogContent) {
		// 				that._oNewRequestManualDiscountDialog = oDialogContent;
		// 				that.extensionAPI.attachToView(that._oNewRequestManualDiscountDialog);
		// 				this._setReqManualDiscountDialogInitialState();
		// 			}.bind(this));
		// 	} else {
		// 		this._setReqManualDiscountDialogInitialState();
		// 	}
		// },

		// _setReqManualDiscountDialogInitialState: function () {
		// 	var oModelApplyDiscount = this.getView().getModel("mApplyDiscount");
		// 	var oModelApplyDiscountData = oModelApplyDiscount.getData();
		// 	var oDiscountMessageStrip = Fragment.byId("fragReqManualDiscount", "applyDiscountMessageStrip");
		// 	var oDiscount = Fragment.byId("fragReqManualDiscount", "Discount");
		// 	var oGrossValue = Fragment.byId("fragReqManualDiscount", "Grossvalue");
		// 	var oDiscountvalue = Fragment.byId("fragReqManualDiscount", "Discountvalue");
		// 	var oDiscount = Fragment.byId("fragReqManualDiscount", "Discount");
		// 	//	var oDiscountSlider = Fragment.byId("fragReqManualDiscount", "DiscountSlider");    //commented for AE-4062 
		// 	var oDiscountSlider = Fragment.byId("fragReqManualDiscount", "DiscountSlider").setValue(0); //Added for AE-4062
		// 	// var oText = Fragment.byId("fragReqManualDiscount", "TextInput").setValue("");
		// 	var oButton = this._oNewRequestManualDiscountDialog.getBeginButton();
		// 	var DisText = this.getView().getModel("i18n").getResourceBundle().getText("DiscountforSelected");
		// 	if (Number(oModelApplyDiscountData.value) >= Number(oModelApplyDiscountData.DiscountTo)) {
		// 		oDiscountSlider.setVisible(false);
		// 		oDiscount.setVisible(false);
		// 		oGrossValue.setVisible(false);
		// 		oDiscountvalue.setVisible(false);
		// 		oDiscountMessageStrip.setVisible(true);
		// 		oDiscountMessageStrip.setText(DisText);
		// 		oDiscountMessageStrip.setType("Error");
		// 		// oText.setVisible(false);
		// 		oButton.setEnabled(false);
		// 	} else {
		// 		oDiscountMessageStrip.setVisible(false);
		// 		oDiscountSlider.setVisible(true);
		// 		oDiscount.setVisible(true);
		// 		oGrossValue.setVisible(true);
		// 		oDiscountvalue.setVisible(true);
		// 		// oText.setVisible(true);
		// 		oButton.setEnabled(false);
		// 	}
		// 	this._oNewRequestManualDiscountDialog.open();
		// },

		onClickSSOD_B125: function (oEvent) {
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.RequestManualDiscount";
			var selSecData = this.aeUtil.getSecData(this, "CPFacet");
			if (selSecData instanceof Array) {
				sap.m.MessageBox.information("Multiple Selection Not Allowed");
				return;
			}
			var that = this;

			if (!this._oApplyRequestDiscountPopover) {
				this._oApplyRequestDiscountPopover = sap.ui.xmlfragment(this.getView().getId(), fragName, {
					onClickSSOD_B126: function (oEvent) {
						that.fnLoadDiscountLevelsReq("LP1");
					},
					onClickSSOD_B127: function (oEvent) {
						that.fnLoadDiscountLevelsReq("LP2");
					},
					onClickSSOD_B128: function (oEvent) {
						that.fnLoadDiscountLevelsReq("LP3");
					},
					onClickSSOD_B129: function (oEvent) {
						that.fnLoadDiscountLevelsReq("LP4");
					},
					onClickSSOD_B130: function (oEvent) {
						that.fnLoadDiscountLevelsReq("LP5");
					}
				});
				this.getView().addDependent(this._oApplyRequestDiscountPopover);
				this._oApplyRequestDiscountPopover.attachBeforeOpen(function (oEvent) {
					var selSecData = this.aeUtil.getSecData(that, "CPFacet");

					if (selSecData.isShowSSOD_B126 !== undefined) {
						oEvent.getSource().getButtons()[0].setVisible(selSecData.isShowSSOD_B126);
					}

					if (selSecData.isShowSSOD_B127 !== undefined) {
						oEvent.getSource().getButtons()[1].setVisible(selSecData.isShowSSOD_B127);
					}

					if (selSecData.isShowSSOD_B128 !== undefined) {
						oEvent.getSource().getButtons()[2].setVisible(selSecData.isShowSSOD_B128);
					}
					if (selSecData.isShowSSOD_B129 !== undefined) {
						oEvent.getSource().getButtons()[3].setVisible(selSecData.isShowSSOD_B129);
					}
					if (selSecData.isShowSSOD_B130 !== undefined) {
						oEvent.getSource().getButtons()[4].setVisible(selSecData.isShowSSOD_B130);
					}

					setTimeout(function () {}, 1000);

				}, this);
			}
			this._oApplyRequestDiscountPopover.setModel(this.getView().getModel());
			var pop = oEvent.getSource();
			this._oApplyRequestDiscountPopover.openBy(pop);
		},
		fnLoadDiscountLevelsReq: function (DiscountLevels) {

			var that = this;
			var aFilters = [];
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			var DiscountAmount = (selSecData.Discount * selSecData.GrossValue) / 100;
			var oButton = this.getView().byId(this.createId("SSOD_B125Button"));
			var pageData = this.getView().getBindingContext().getObject();
			oButton.setBusy(true);
			// var oSelSecData = oData.results[0];
			var aFilters2 = [];
			aFilters2.push(new Filter("SalesOrganization", "EQ", pageData.SalesOrganization));
			aFilters2.push(new Filter("DistributionChannel", "EQ", pageData.DistributionChannel));
			aFilters2.push(new Filter("SalesDocumentType", "EQ", pageData.ServiceDocumentType));
			aFilters2.push(new Filter("ItemCategoryGroup", "EQ", selSecData.ItemCategoryGroup));
			aFilters2.push(new Filter("SalesOffice", "EQ", pageData.SalesOffice));
			that.getView().getModel().read("/ZAE_I_TC_PQTN_02", {
				filters: aFilters2,
				success: function (oDataDL, responseDL) {
					oButton.setBusy(false);
					var DiscountData = {},
						L1DiscountFrom,
						L1DiscountTo,
						L2DiscountFrom,
						L2DiscountTo,
						L3DiscountFrom,
						L3DiscountTo,
						L4DiscountFrom,
						L4DiscountTo,
						L5DiscountFrom,
						L5DiscountTo;
					if (oDataDL.results.length > 0) {
						for (var i = 0; i < oDataDL.results.length; i++) {
							var oDisLevels = oDataDL.results[i];
							if (oDataDL.results[i].Levels === 'LP1') {
								L1DiscountFrom = Number(oDisLevels.DiscountFrom);
								L1DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LP2') {
								L2DiscountFrom = Number(oDisLevels.DiscountFrom);
								L2DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LP3') {
								L3DiscountFrom = Number(oDisLevels.DiscountFrom);
								L3DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LP4') {
								L4DiscountFrom = Number(oDisLevels.DiscountFrom);
								L4DiscountTo = Number(oDisLevels.DiscountTo);
							} else if (oDataDL.results[i].Levels === 'LP5') {
								L5DiscountFrom = Number(oDisLevels.DiscountFrom);
								L5DiscountTo = Number(oDisLevels.DiscountTo);
							}

							if (oDisLevels.Levels === DiscountLevels) {
								DiscountData = oDisLevels;
								DiscountData.L1DiscountValue = 0;
								DiscountData.SpecialDiscount = 0;
								DiscountData.DiscountFrom = Number(oDisLevels.DiscountFrom);
								DiscountData.DiscountTo = Number(oDisLevels.DiscountTo);
								DiscountData.value = Number(DiscountData.DiscountFrom);
								DiscountData.SliderValue = Number(DiscountData.value);
								DiscountData.SalesOrder = selSecData.WorkEstimate;
								DiscountData.SalesOrderItem = selSecData.WorkEstimateItem;
								DiscountData.Subtotal1Amount = (Number(selSecData.GrossValue) / Number(selSecData.OperationQuantity)).toFixed(2);
								DiscountData.CurrentDiscount = (Number(DiscountAmount) / Number(selSecData.OperationQuantity)).toFixed(2);
								DiscountData.CurrentDiscountPer = Number(selSecData.Discount);
								// DiscountData.SalesQuotation = selSecData.WorkEstimate;
								// DiscountData.SalesQuotationItem = selSecData.WorkEstimateItem;
								// DiscountData.Subtotal1Amount = Number(selSecData.OrderQuantity) != 0 ? Number(selSecData.GrossValue) / Number(
								// 	selSecData.OperationQuantity) : Number(selSecData.GrossValue);
								// DiscountData.CurrentDiscount = Number(selSecData.Discount);
								// DiscountData.CurrentDiscountPer = (DiscountData.CurrentDiscount / Number(selSecData.GrossValue)) * 100;
								DiscountData.NetAfterDiscount = Number(DiscountData.Subtotal1Amount) - DiscountData.CurrentDiscount;
								DiscountData.value = 0;
								DiscountData.DiscountValue = 0;
								DiscountData.NetAfterProposed = 0;

							}

						}
						if (L1DiscountFrom && L1DiscountTo) {
							DiscountData.L1DiscountFrom = L1DiscountFrom;
							DiscountData.L1DiscountTo = L1DiscountTo;
							DiscountData.L1Visible = true
						} else {
							DiscountData.L1Visible = false
						}
						if (L2DiscountFrom && L2DiscountFrom) {
							DiscountData.L2DiscountFrom = L2DiscountFrom;
							DiscountData.L2DiscountTo = L2DiscountTo;
							DiscountData.L2Visible = true
						} else {
							DiscountData.L2Visible = false
						}
						if (L3DiscountFrom && L3DiscountFrom) {
							DiscountData.L3DiscountFrom = L3DiscountFrom;
							DiscountData.L3DiscountTo = L3DiscountTo;
							DiscountData.L3Visible = true
						} else {
							DiscountData.L3Visible = false
						}
						if (L4DiscountFrom && L4DiscountTo) {
							DiscountData.L4DiscountFrom = L4DiscountFrom;
							DiscountData.L4DiscountTo = L4DiscountTo;
							DiscountData.L4Visible = true
						} else {
							DiscountData.L4Visible = false
						}
						if (L5DiscountFrom && L5DiscountTo) {
							DiscountData.L5DiscountFrom = L5DiscountFrom;
							DiscountData.L5DiscountTo = L5DiscountTo;
							DiscountData.L5Visible = true
						} else {
							DiscountData.L5Visible = false
						}

						var oModel = that.getView().getModel("mApplyDiscount");
						oModel.setData(DiscountData);
						that.fnLoadDiscountPopupReq();

					} else {
						var MsgErr4 = that.getView().getModel("i18n").getResourceBundle().getText("KindlymaintainData");
						MessageBox.error(MsgErr4);
					}
				},
				error: function (oError) {
					oButton.setBusy(false);
					var MsgErrBox2 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorInDiscountLevel");
					MessageBox.error(MsgErrBox2);
				}
			});

		},
		fnLoadDiscountPopupReq: function () {
			var that = this;
			that.byId(that.createId("SSOD_B125Button")).setBusy(false);
			if (!this._oNewRequestManualDiscountDialog) {
				Fragment.load({
						id: "fragReqManualDiscount",
						name: "com.globalintelli.zae_ssod.ext.fragment.RequestManualDiscountPopup",
						controller: {
							_fnCalDiscValue: function () {
								var selSecData = that.aeUtil.getSecData(that, "CPFacet");
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountData = mApplyDiscount.getData();
								var oDiscountAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.SliderValue)) / 100;
								DiscountData.value = DiscountData.SliderValue;
								//	DiscountData.DiscountValue = (oDiscountAmt * Number(selSecData.OperationQuantity)).toFixed(2);
								//	DiscountData.NetAfterProposed = (Number(selSecData.GrossValue) - Number(DiscountData.DiscountValue)).toFixed(2);
								DiscountData.DiscountValue = (oDiscountAmt).toFixed(2);
								DiscountData.NetAfterProposed = (Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue)).toFixed(2);
								// DiscountData.NetAfterProposed = (Number(DiscountData.NetAfterDiscount) - Number(DiscountData.DiscountValue)).toFixed(2);
								if (isNaN(DiscountData.NetAfterProposed)) {
									DiscountData.NetAfterProposed = 0;
								}
								this._SubmitButtonValidation();
							},
							_onInputDiscountValue: function (oEvent) {
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountData = mApplyDiscount.getData();
								var DiscountValueMSGStrip = Fragment.byId("fragReqManualDiscount", "applyDiscountMessageStrip");
								var oDiscountToAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountTo)) / 100;
								var oDiscountFromAmt = (Number(DiscountData.Subtotal1Amount) * Number(DiscountData.DiscountFrom)) / 100;
								var MsgTextDis = that.getView().getModel("i18n").getResourceBundle().getText("Discountbeyondnotpermitted", [DiscountData.DiscountValue]);
								var MsgTextDisLess = that.getView().getModel("i18n").getResourceBundle().getText("Discountlessthennotpermitted", [
									DiscountData.DiscountValue
								]);
								var oSubmitButton = Fragment.byId("fragReqManualDiscount", "IDSubmitButton");
								if (Number(DiscountData.DiscountValue) > oDiscountToAmt) {
									//show waring msg 
									DiscountData.value = DiscountData.DiscountTo;
									DiscountData.SliderValue = DiscountData.DiscountTo;
									this._fnCalDiscValue();
									DiscountValueMSGStrip.setText(MsgTextDis);
									DiscountValueMSGStrip.setType("Warning");
									DiscountValueMSGStrip.setVisible(true);

								} else if (Number(DiscountData.DiscountValue) < oDiscountFromAmt) {
									DiscountData.value = DiscountData.DiscountFrom;
									DiscountData.SliderValue = DiscountData.DiscountFrom;
									this._fnCalDiscValue();
									DiscountValueMSGStrip.setText(MsgTextDisLess);
									DiscountValueMSGStrip.setType("Warning");
									DiscountValueMSGStrip.setVisible(true);
								} else {
									DiscountValueMSGStrip.setVisible(false);
									var Discount = (Number(DiscountData.DiscountValue) * 100) / Number(DiscountData.Subtotal1Amount);
									DiscountData.value = Discount.toFixed(2);
									DiscountData.SliderValue = Number(DiscountData.value);
									DiscountData.NetValue = Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue);
									DiscountData.NetAfterProposed = (Number(DiscountData.Subtotal1Amount) - Number(DiscountData.DiscountValue)).toFixed(2);
								}

								if (Number(DiscountData.DiscountValue) >= oDiscountFromAmt && Number(DiscountData.DiscountValue) <= oDiscountToAmt) {
									oSubmitButton.setEnabled(true);
								} else {
									oSubmitButton.setEnabled(false);
								}

							},
							_SubmitButtonValidation: function (oEvent) {
								var StepInput = Fragment.byId("fragReqManualDiscount", "DiscountSlider");
								var mApplyDiscount = that.getView().getModel("mApplyDiscount");
								var DiscountValue = Fragment.byId("fragReqManualDiscount", "Discountvalue").getValue();
								var DiscountData = mApplyDiscount.getData();
								var oSubmitButton = Fragment.byId("fragReqManualDiscount", "IDSubmitButton");

								if (StepInput.getValue() >= Number(DiscountData.DiscountFrom) && StepInput.getValue() <= Number(DiscountData.DiscountTo)) {
									oSubmitButton.setEnabled(true);
									StepInput.setValueState("None");
								} else {
									oSubmitButton.setEnabled(false);
								}
							},
							onSubmitPressed: function () {
								// this._onInputDiscountValue();
								var StepInput = Fragment.byId("fragReqManualDiscount", "DiscountSlider");
								if (StepInput.getValue() > StepInput.getMax() || StepInput.getValue() < StepInput.getMin()) {
									return;
								}
								var selSecData = that.aeUtil.getSecData(that, "CPFacet");
								var actId = "SSOD_B125";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var oModelApplyDiscount = that.getView().getModel("mApplyDiscount");
								var oModelApplyDiscountData = oModelApplyDiscount.getData();
								var oText = Fragment.byId("fragReqManualDiscount", "TextInput").getValue();
								var oModel = that.getView().getModel();
								var aHeaderData = [];
								var oEntity;
								var data;
								var oBalanceAmount = 0;
								var oBalancePercentage = 0;
								// var oDiscountCheck;
								// var oDifferencePercentage = oModelApplyDiscountData.DiscountTo - (Number(oModelApplyDiscountData.CurrentDiscountPer) +
								// 	oModelApplyDiscountData.SliderValue);
								// // var oUnitDiscount = (Number(selSecData.Price) * 1) / 100;
								// // var onePercengageDiscountAmount = (oUnitDiscount * Number(selSecData.OperationQuantity)).toFixed(2);
								// if (oDifferencePercentage > 0) {
								// 	oBalancePercentage = (Number(oModelApplyDiscountData.SliderValue)).toFixed(2);
								// 	if (Number(oModelApplyDiscountData.SliderValue - oModelApplyDiscountData.CurrentDiscountPer) <= 0) {
								// 		oDiscountCheck = oModelApplyDiscountData.SliderValue;
								// 	} else {
								// 		oDiscountCheck = oModelApplyDiscountData.SliderValue - oModelApplyDiscountData.CurrentDiscountPer;
								// 	}
								// 	oBalanceAmount = Math.abs((((Number(oModelApplyDiscountData.Subtotal1Amount) * oDiscountCheck) / 100) *
								// 		Number(selSecData.OperationQuantity)));
								// 	// oBalancePercentage = (Number(oModelApplyDiscountData.SliderValue)).toFixed(2);
								// 	// oBalanceAmount = (((Number(oModelApplyDiscountData.Subtotal1Amount) * Number(oModelApplyDiscountData.SliderValue)) / 100) *
								// 	// 	Number(selSecData.OperationQuantity));
								// } else {
								// 	oBalancePercentage = ((Number(oModelApplyDiscountData.DiscountTo) - Number(oModelApplyDiscountData.CurrentDiscountPer))).toFixed(
								// 		2);
								// 	if (oBalancePercentage > 0) {
								// 		oBalanceAmount = (((Number(oModelApplyDiscountData.Subtotal1Amount) * Number(oBalancePercentage)) /
								// 				100) *
								// 			Number(selSecData.OperationQuantity));
								// 	} else {
								// 		oBalanceAmount = 0;
								// 		oBalancePercentage = 0;
								// 	}
								// }

								// var oBalancePercentage = 0;
								// if (Number(oModelApplyDiscountData.SliderValue - oModelApplyDiscountData.CurrentDiscountPer) <= 0) {
								// 	if (Number(oModelApplyDiscountData.SliderValue + oModelApplyDiscountData.CurrentDiscountPer) > Number(
								// 			oModelApplyDiscountData.DiscountTo)) {
								// 		oBalancePercentage = Number(oModelApplyDiscountData.DiscountTo) - oModelApplyDiscountData.CurrentDiscountPer;
								// 	} else {
								// 		oBalancePercentage = oModelApplyDiscountData.SliderValue;
								// 	}
								// } else {
								// 	oBalancePercentage = oModelApplyDiscountData.SliderValue - oModelApplyDiscountData.CurrentDiscountPer;
								// }
								// oBalanceAmount = Math.abs((((Number(oModelApplyDiscountData.Subtotal1Amount) * oBalancePercentage) / 100)));

								oBalanceAmount = oModelApplyDiscountData.DiscountValue;

								oEntity = "ZAE_FM_PQTN_PARTS_DISCOUNTSet";
								var data = [{
									callProperty: "DocNo",
									value: selSecData.ServiceOrder
								}, {
									callProperty: "ItemNo",
									value: selSecData.ServiceOrderOperation
								}, {
									callProperty: "DocType",
									value: "4"
								}, {
									callProperty: "Percentage",
									value: StepInput.getValue().toString()
								}, {
									callProperty: "Discount",
									value: oBalanceAmount.toString()
								}, {
									callProperty: "Levels",
									value: oModelApplyDiscountData.Levels
								}, {
									callProperty: "Tdline",
									value: oText
								}];
								var succFunc = function (oData, response) {
									that.aeUtil.refreshControlModel(that.getView());
								}.bind(that);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
								that._oNewRequestManualDiscountDialog.close();
							},
							onCancelPressed: function () {
								that._oNewRequestManualDiscountDialog.close();
							}
						}
					})
					.then(function (oDialogContent) {
						that._oNewRequestManualDiscountDialog = oDialogContent;
						that.extensionAPI.attachToView(that._oNewRequestManualDiscountDialog);
						this._setReqManualDiscountDialogInitialState();
					}.bind(this));
			} else {
				this._setReqManualDiscountDialogInitialState();
			}
		},

		_setReqManualDiscountDialogInitialState: function () {
			var oModelApplyDiscount = this.getView().getModel("mApplyDiscount");
			var oModelApplyDiscountData = oModelApplyDiscount.getData();
			var oDiscountMessageStrip = Fragment.byId("fragReqManualDiscount", "applyDiscountMessageStrip");
			var oDiscount = Fragment.byId("fragReqManualDiscount", "Discount");
			var oGrossValue = Fragment.byId("fragReqManualDiscount", "Grossvalue");
			var oDiscountvalue = Fragment.byId("fragReqManualDiscount", "Discountvalue");
			var oDiscount = Fragment.byId("fragReqManualDiscount", "Discount");
			//	var oDiscountSlider = Fragment.byId("fragReqManualDiscount", "DiscountSlider");    //commented for AE-4062 
			var oDiscountSlider = Fragment.byId("fragReqManualDiscount", "DiscountSlider").setValue(0); //Added for AE-4062
			var oText = Fragment.byId("fragReqManualDiscount", "TextInput").setValue("");
			var oButton = this._oNewRequestManualDiscountDialog.getBeginButton();
			var DisText = this.getView().getModel("i18n").getResourceBundle().getText("DiscountforSelected");
			if (Number(oModelApplyDiscountData.CurrentDiscountPer) >= Number(oModelApplyDiscountData.DiscountTo)) {
				oDiscountSlider.setVisible(false);
				oDiscount.setVisible(false);
				oGrossValue.setVisible(false);
				oDiscountvalue.setVisible(false);
				oDiscountMessageStrip.setVisible(true);
				oDiscountMessageStrip.setText(DisText);
				oDiscountMessageStrip.setType("Error");
				// oText.setVisible(false);
				oButton.setEnabled(false);
			} else {
				oDiscountMessageStrip.setVisible(false);
				oDiscountSlider.setVisible(true);
				oDiscount.setVisible(true);
				oGrossValue.setVisible(true);
				oDiscountvalue.setVisible(true);
				// oText.setVisible(true);
				oButton.setEnabled(false);
			}
			this._oNewRequestManualDiscountDialog.open();
		},

		/*		onClickSSOD_B138: function (oEvent) {

					var that = this;
					var oSource = oEvent.getSource();
					var selSecData = this.aeUtil.getSecData(that, "OPFacet");
					var pageData = that.getView().getBindingContext().getObject();
					// var numbSel = this.extensionAPI.getSelectedContexts().length;
					if (selSecData.length > 1) {
						var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("Select_Single_item");
						sap.m.MessageBox.error(msg1);
						return;
					} else {
						var actId = "SSOD_B138";
						var actLabel = this.aeUtil.geti18nText(that, actId);
						var fragName = "com.globalintelli.zae_ssod.ext.fragment.UpdatePrice01";
						var oModel = oSource.getModel();
						var oEntity = "ZAE_FM_SSQT_UPDATE_PRICESet";
						var dialogFields = [{
							fragInputId: "priceInput",
							fragInputLabel: this.aeUtil.geti18nText(that, "priceInput"),
							callProperty: "Price"
						}];
						var data = [{
							callProperty: "ObjectId",
							value: pageData.ServiceOrder
						}, {
							callProperty: "NumberInt",
							value: selSecData.ServiceOrderOperation
						}];
						var checkFucc = function () {
							var oPrice = Fragment.byId(actId + "Fragment", "priceInput").getValue();
							if (oPrice === "" || oPrice === undefined) {
								return {
									pass: false,
									msg: this.aeUtil.geti18nText(that, "ENTER_PRICE")
								};
							} else {
								return {
									pass: true
								};
							}
						}.bind(this);
						var succFunc = function (oData, response) {
							this.extensionAPI.refresh();
						}.bind(this);
						var errFunc = function (oData, response) {
							this.extensionAPI.refresh();
						}.bind(this);

						this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, errFunc);
					}
				},
		*/

		onClickSSOD_B138: function (oEvent) {
			if (!this._oUpdatePriceDialog) {
				Fragment.load({
						id: "FragUpdatePriceDialog",
						name: "com.globalintelli.zae_ssod.ext.fragment.UpdatePrice01",
						controller: this
					})
					.then(function (oDialogContent) {
						this._UpdatePriceDialog(oDialogContent);
						this._setUpdatePriceDialogInitialState();
					}.bind(this));
			} else {
				this._setUpdatePriceDialogInitialState();
			}
		},
		_setUpdatePriceDialogInitialState: function () {
			var that = this;
			var pageData = this.getView().getBindingContext().getObject();
			Fragment.byId("FragUpdatePriceDialog", "priceInput").setValue();
			Fragment.byId("FragUpdatePriceDialog", "LumsumpriceInput").setValue();
			Fragment.byId("FragUpdatePriceDialog", "CurrencyInput").setSelectedKey(pageData.TransactionCurrency);
			Fragment.byId("FragUpdatePriceDialog", "SSOD_B138MessageStrip").setVisible(false);
			var Currency = Fragment.byId("FragUpdatePriceDialog", "CurrencyInput");
			var oBinding = Currency.getBinding("items");
			var aCurrency = [];
			aCurrency.push(new Filter("ServiceOrder", sap.ui.model.FilterOperator.EQ, pageData.ServiceOrder));
			oBinding.filter(aCurrency);
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			if (selSecData instanceof Array) {
				var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("Select_Single_item");
				sap.m.MessageBox.error(msg1);
				return;
			}
			// this._oUpdatePriceDialog.open();
			that._fnCheckPriceAuth();
		},
		_fnCheckPriceAuth: function () {
			var that = this;
			var pageData = this.getView().getBindingContext().getObject();
			var oEntity = "ZAE_FM_USER_AUTH_FOR_OBJ_GETSet";
			var oModel = this.getView().getModel();
			var data = [{
				callProperty: "AuthObject",
				value: "ZLUMSUMPRC"
			}, {
				callProperty: "AuthValue",
				value: "03"
			}];
			var succFunc = function (oData) {
				var vFlag = oData.Flag === "X" ? pageData.ServiceDocumentType === 'ZOIN' : false;
				Fragment.byId("FragUpdatePriceDialog", "LumsumpriceInput").setVisible(vFlag);
				Fragment.byId("FragUpdatePriceDialog", "priceInput").setVisible(!vFlag);
				that._oUpdatePriceDialog.open();
			};
			var errFunc = function (oData) {
				Fragment.byId("FragUpdatePriceDialog", "LumsumpriceInput").setVisible(false);
				sap.m.MessageBox.error("Unknown Error");
			};
			this.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
		},
		_UpdatePriceDialog: function (oDialogContent, oEvent) {
			var that = this;

			this._oUpdatePriceDialog = new sap.m.Dialog({
				title: "{i18n>SSOD_B138}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "Submit",

					press: function () {
						var selSecData = this.aeUtil.getSecData(that, "OPFacet");
						var oCurrency = Fragment.byId("FragUpdatePriceDialog", "CurrencyInput").getSelectedKey();
						var oPrice = Fragment.byId("FragUpdatePriceDialog", "priceInput").getValue();
						var oLumpsumPrice = Fragment.byId("FragUpdatePriceDialog", "LumsumpriceInput").getValue();
						if (!oPrice && !oLumpsumPrice) {
							var msg2 = "Enter Price";
							var oMessageStrip = Fragment.byId("FragUpdatePriceDialog", "SSOD_B138MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);
							return;
						}
						if (oLumpsumPrice) {
							oPrice = (parseFloat(oLumpsumPrice) / parseFloat(selSecData.OperationQuantity)).toFixed(3);
						}
						var pageData = that.getView().getBindingContext().getObject();
						var actId = "SSOD_B138";
						var actLabel = that.aeUtil.geti18nText(that, actId);
						var oModel = that.getView().getModel();
						var oEntity = "ZAE_FM_SSQT_UPDATE_PRICESet";
						var data = [{
							callProperty: "ObjectId",
							value: pageData.ServiceOrder
						}, {
							callProperty: "NumberInt",
							value: selSecData.ServiceOrderOperation
						}, {
							callProperty: "Price",
							value: oPrice
						}, {
							callProperty: "Currency",
							value: oCurrency
						}];
						var succFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						var errorFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errorFunc);
						that._oUpdatePriceDialog.close();

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Close",
					press: function () {
						this._oUpdatePriceDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oUpdatePriceDialog);

		},

		/*		onClickSSOD_B139: function (oEvent) {

					var that = this;
					var oSource = oEvent.getSource();
					var selSecData = this.aeUtil.getSecData(that, "CPFacet");
					var pageData = that.getView().getBindingContext().getObject();
					// var numbSel = this.extensionAPI.getSelectedContexts().length;
					if (selSecData.length > 1) {
						var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("Select_Single_item");
						sap.m.MessageBox.error(msg1);
						return;
					} else {
						var actId = "SSOD_B139";
						var actLabel = this.aeUtil.geti18nText(that, actId);
						var fragName = "com.globalintelli.zae_ssod.ext.fragment.UpdatePrice02";
						var oModel = oSource.getModel();
						var oEntity = "ZAE_FM_SSQT_UPDATE_PRICESet";
						var dialogFields = [{
							fragInputId: "priceInput",
							fragInputLabel: this.aeUtil.geti18nText(that, "priceInput"),
							callProperty: "Price"
						}];
						var data = [{
							callProperty: "ObjectId",
							value: pageData.ServiceOrder
						}, {
							callProperty: "NumberInt",
							value: selSecData.ServiceOrderOperation
						}];
						var checkFucc = function () {
							var oPrice = Fragment.byId(actId + "Fragment", "priceInput").getValue();
							if (oPrice === "" || oPrice === undefined) {
								return {
									pass: false,
									msg: this.aeUtil.geti18nText(that, "ENTER_PRICE")
								};
							} else {
								return {
									pass: true
								};
							}
						}.bind(this);
						var succFunc = function (oData, response) {
							this.extensionAPI.refresh();
						}.bind(this);
						var errFunc = function (oData, response) {
							this.extensionAPI.refresh();
						}.bind(this);

						this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, errFunc);

					}
				},
		*/

		onClickSSOD_B139: function (oEvent) {
			if (!this._oUpdatePriceDialog1) {
				Fragment.load({
						id: "FragUpdatePriceDialog1",
						name: "com.globalintelli.zae_ssod.ext.fragment.UpdatePrice02",
						controller: this
					})
					.then(function (oDialogContent) {
						this._UpdatePriceDialog1(oDialogContent);
						this._setUpdatePriceDialogInitialState1();
					}.bind(this));
			} else {
				this._setUpdatePriceDialogInitialState1();
			}
		},
		_setUpdatePriceDialogInitialState1: function () {
			var that = this;
			var pageData = this.getView().getBindingContext().getObject();
			Fragment.byId("FragUpdatePriceDialog1", "priceInput1").setValue();
			Fragment.byId("FragUpdatePriceDialog1", "CurrencyInput1").setSelectedKey(pageData.TransactionCurrency);
			Fragment.byId("FragUpdatePriceDialog1", "SSOD_B139MessageStrip").setVisible(false);
			var Currency = Fragment.byId("FragUpdatePriceDialog1", "CurrencyInput1");
			var oBinding = Currency.getBinding("items");
			var aCurrency = [];
			aCurrency.push(new Filter("ServiceOrder", sap.ui.model.FilterOperator.EQ, pageData.ServiceOrder));
			oBinding.filter(aCurrency);
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			if (selSecData instanceof Array) {
				var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("Select_Single_item");
				sap.m.MessageBox.error(msg1);
				return;
			}
			this._oUpdatePriceDialog1.open();
		},
		_UpdatePriceDialog1: function (oDialogContent, oEvent) {
			var that = this;

			this._oUpdatePriceDialog1 = new sap.m.Dialog({
				title: "{i18n>SSOD_B139}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "Create",

					press: function () {
						var selSecData = this.aeUtil.getSecData(that, "CPFacet");
						var oCurrency = Fragment.byId("FragUpdatePriceDialog1", "CurrencyInput1").getSelectedKey();
						var oPrice = Fragment.byId("FragUpdatePriceDialog1", "priceInput1").getValue();
						if (oPrice === "" || oPrice === undefined) {
							var msg2 = "Enter Price";
							var oMessageStrip = Fragment.byId("FragUpdatePriceDialog1", "SSOD_B139MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);
							return;
						}
						var pageData = that.getView().getBindingContext().getObject();
						var actId = "SSOD_B139";
						var actLabel = that.aeUtil.geti18nText(that, actId);
						var oModel = that.getView().getModel();
						var oEntity = "ZAE_FM_SSQT_UPDATE_PRICESet";
						var data = [{
							callProperty: "ObjectId",
							value: pageData.ServiceOrder
						}, {
							callProperty: "NumberInt",
							value: selSecData.ServiceOrderOperation
						}, {
							callProperty: "Price",
							value: oPrice
						}, {
							callProperty: "Currency",
							value: oCurrency
						}];
						var succFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						var errorFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errorFunc);
						that._oUpdatePriceDialog1.close();

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Close",
					press: function () {
						this._oUpdatePriceDialog1.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oUpdatePriceDialog1);

		},

		onClickSSOD_B140: function (oEvent) {
			var that = this;
			var selSecData = that.aeUtil.getSecData(that, "CPFacet");
			var pageData = this.getView().getBindingContext().getObject();
			var oMaterial = "";
			if (selSecData instanceof Array) {
				for (var i = 0; i < selSecData.length; i++) {
					/*	oMaterial.push({
							"Material": selSecData[i].OriginallyRequestedProduct
						});*/
					if (!oMaterial) {
						oMaterial = "&Material=" + selSecData[i].OriginallyRequestedProduct
					} else {
						oMaterial += "&Material=" + selSecData[i].OriginallyRequestedProduct
					}
				}
			} else {
				if (!oMaterial) {
					oMaterial = "&Material=" + selSecData.OriginallyRequestedProduct
				} else {
					oMaterial += "&Material=" + selSecData.OriginallyRequestedProduct
				}

				// "Material": selSecData.OriginallyRequestedProduct	

			}

			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Material",
					action: "aepAnalyzeStock"
				}
				// params: oMaterial
			})) || "";
			var url = window.location.href.split('#')[0] + hash + "?" + oMaterial;
			sap.m.URLHelper.redirect(url, true);
		},
		onClickSSOD_B141: function (oEvent) {
			if (!this._oReasonDialog) {
				Fragment.load({
						id: "ReasonDialog",
						name: "com.globalintelli.zae_ssod.ext.fragment.ReasonforRejection",
						controller: this
					})
					.then(function (oDialogContent) {
						this._CreateReasonDialog(oDialogContent);
						this._setReasonDialogInitialState();
					}.bind(this));
			} else {
				this._setReasonDialogInitialState();
			}
		},
		_setReasonDialogInitialState: function () {
			var that = this;
			var aFilter = [];
			var pageData = that.getView().getBindingContext().getObject();
			aFilter.push(new sap.ui.model.Filter("TransactionType", sap.ui.model.FilterOperator.EQ, pageData.ServiceDocumentType));
			aFilter.push(new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, pageData.SalesOrganization));
			Fragment.byId("ReasonDialog", "rjcnReasonInput").getBinding("items").filter(aFilter);
			Fragment.byId("ReasonDialog", "rjcnReasonInput").setSelectedKey(null);
			Fragment.byId("ReasonDialog", "SSOD_B141MessageStrip").setVisible(false);
			this._oReasonDialog.open();
		},
		_CreateReasonDialog: function (oDialogContent, oEvent) {
			var that = this;

			this._oReasonDialog = new sap.m.Dialog({
				title: "{i18n>SSOD_B141}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "Submit",

					press: function () {
						var pageData = that.getView().getBindingContext().getObject();
						var selSecData = this.aeUtil.getSecData(that, "OPFacet");
						var rjcnReasonInput = Fragment.byId("ReasonDialog", "rjcnReasonInput").getSelectedKey();
						if (rjcnReasonInput === "") {
							var msg2 = "Fill out mandatory field";
							var oMessageStrip = Fragment.byId("ReasonDialog", "SSOD_B141MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);
							return;
						}
						var actId = "SSOD_B141";
						var actLabel = that.aeUtil.geti18nText(that, actId);
						var oModel = that.getView().getModel();
						var oEntity = "SSOD_ITEM_REJ_HEADERSet";
						var arr1 = [];
						var arr2 = [];
						var oItementry = {};
						oItementry.ObjectId = pageData.ServiceOrder;
						oItementry.Rejection = rjcnReasonInput;
						arr1.push(oItementry);
						if (!(selSecData instanceof Array)) {
							arr2.push({
								"NumberInt": selSecData.ServiceOrderOperation
							});
						} else {
							for (var i = 0; i < selSecData.length; i++) {
								arr2.push({
									"NumberInt": selSecData[i].ServiceOrderOperation
								});
							}
						}
						that.getView().setBusy(true);
						var data = [{
							callProperty: "N_SSOD_ITEM_REJ_HEADER",
							value: arr1
						}, {
							callProperty: "N_SSOD_ITEM_REJ",
							value: arr2
						}];
						var succFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						var errorFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errorFunc);
						that._oReasonDialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Close",
					press: function () {
						this._oReasonDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oReasonDialog);

		},
		onClickSSOD_B142: function (oEvent) {
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.ApplyPerDiscountPopOver";
			var selSecData = this.aeUtil.getSecData(this, "CPFacet");
			var that = this;
			if (!this._oApplyPerDiscountPopOver) {
				this._oApplyPerDiscountPopOver = sap.ui.xmlfragment(this.getView().getId(), fragName, {
					onClickSSOD_B143: function (oEvent) {
						that.fnLoadDiscountLevelsPerDiscount("LP1");
					},
					onClickSSOD_B144: function (oEvent) {
						that.fnLoadDiscountLevelsPerDiscount("LP2");
					},
					onClickSSOD_B145: function (oEvent) {
						that.fnLoadDiscountLevelsPerDiscount("LP3");
					},
					onClickSSOD_B146: function (oEvent) {
						that.fnLoadDiscountLevelsPerDiscount("LP4");
					},
					onClickSSOD_B147: function (oEvent) {
						that.fnLoadDiscountLevelsPerDiscount("LP5");
					}
				});
				this.getView().addDependent(this._oApplyPerDiscountPopOver);
				this._oApplyPerDiscountPopOver.attachBeforeOpen(function (oEvent) {
					var selSecData = this.aeUtil.getSecData(that, "CPFacet");

					if (selSecData.isShowSSOD_B143 !== undefined) {
						oEvent.getSource().getButtons()[0].setVisible(selSecData.isShowSSOD_B143);
					}

					if (selSecData.isShowSSOD_B144 !== undefined) {
						oEvent.getSource().getButtons()[1].setVisible(selSecData.isShowSSOD_B144);
					}

					if (selSecData.isShowSSOD_B145 !== undefined) {
						oEvent.getSource().getButtons()[2].setVisible(selSecData.isShowSSOD_B145);
					}
					if (selSecData.isShowSSOD_B146 !== undefined) {
						oEvent.getSource().getButtons()[3].setVisible(selSecData.isShowSSOD_B146);
					}
					if (selSecData.isShowSSOD_B147 !== undefined) {
						oEvent.getSource().getButtons()[4].setVisible(selSecData.isShowSSOD_B147);
					}

					setTimeout(function () {}, 1000);

				}, this);
			}
			this._oApplyPerDiscountPopOver.setModel(this.getView().getModel());
			var pop = oEvent.getSource();
			this._oApplyPerDiscountPopOver.openBy(pop);
		},
		fnLoadDiscountLevelsPerDiscount: function (oSource) {
			var that = this;
			this.oLevel = oSource;
			if (!that._ApplyPerDiscountDialog) {
				Fragment.load({
					id: "ApplyPerDiscountDialog",
					name: "com.globalintelli.zae_ssod.ext.fragment.ApplyPerDiscount",
					controller: {
						onChangeDiscountPercentage: function (oEvent) {
							var oValue = oEvent.getParameter("newValue");
							var oValueState = oEvent.getSource().getValueState();
							// if (!(oValue[oValue.length - 1] === ".")) {
							// 	oValue = oValue.replace(/[^0-9.]/g, "");
							// 	oValue = oValue.split(".").length > 0 ? oValue.split(".")[0] + oValue.split(".")[1].slice(0, 2) : oValue;
							// 	oValue = parseFloat(oValue) > 100 ? "100" : 0;
							// 	oEvent.getSource().setValue(oValue);
							// }
						},
						onSubmit: function () {
							var actId = "SSOD_B142";
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var oModel = that.getView().getModel("MultipleCompDiscount");
							var oEntity = "ZAE_FM_SRV_ADD_EDIT_CONDS_MSet";
							var oSliderDiscount = Fragment.byId("ApplyPerDiscountDialog", "SliderDiscount");
							var oSelectedArray = [];
							var selSecData = that.aeUtil.getSecData(that, "CPFacet");
							var pageData = that.getView().getBindingContext().getObject();
							if (!(selSecData instanceof Array)) {
								oSelectedArray.push(selSecData);
							} else {
								oSelectedArray = selSecData;
							}
							if (oSliderDiscount.getValueState() === "Error") {
								return;
							}
							var NavMain = [{
								"Salesdocument": pageData.ServiceOrder,
								"Level": that.oLevel,
								"DiscountPercentage": oSliderDiscount.getValue().toString()
							}];
							var NavItems = [];
							oSelectedArray.forEach(function (oItem) {
								NavItems.push({
									"ItmNumber": oItem.ServiceOrderOperation
								});
							});
							var data = [{
								callProperty: "NavMain",
								value: NavMain
							}, {
								callProperty: "NavItems",
								value: NavItems
							}];
							var succFunc = function (oData, response) {
								that.getView().getModel().refresh(true);
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
							that._ApplyPerDiscountDialog.close();
						},
						onCancel: function () {
							that._ApplyPerDiscountDialog.close();
						}
					}
				}).then(function (DialogContent) {
					that._ApplyPerDiscountDialog = DialogContent;
					that.getView().addDependent(that._ApplyPerDiscountDialog);
					that._initApplyPerDiscountDialog(that.oLevel);
				});
			} else {
				that._initApplyPerDiscountDialog(that.oLevel);
			}
		},
		_initApplyPerDiscountDialog: function (oLevel) {
			var that = this;
			var aFilters = [];
			var selSecData = that.aeUtil.getSecData(that, "CPFacet");
			var pageData = this.getView().getBindingContext().getObject();
			var oSliderDiscount = Fragment.byId("ApplyPerDiscountDialog", "SliderDiscount");
			var oModel = new JSONModel();
			this.getView().setModel(oModel, "mApplyPercentageDis");
			oSliderDiscount.setValue(0);
			var aFilters2 = [];
			aFilters2.push(new Filter("SalesOrganization", "EQ", pageData.SalesOrganization));
			aFilters2.push(new Filter("DistributionChannel", "EQ", pageData.DistributionChannel));
			aFilters2.push(new Filter("SalesDocumentType", "EQ", pageData.ServiceDocumentType));
			aFilters2.push(new Filter("SalesOffice", "EQ", pageData.SalesOffice));
			aFilters2.push(new Filter("Levels", "EQ", oLevel));
			if (selSecData instanceof Array) {
				var selectedItemCategory = [...new Map(selSecData.map((m) => [m.ItemCategoryGroup, m])).values()];
				if (selectedItemCategory.length === 1) {
					aFilters2.push(new Filter("ItemCategoryGroup", "EQ", selectedItemCategory[0].ItemCategoryGroup));
				} else {
					var omsg = this.getView().getModel("i18n").getResourceBundle().getText("CommonDiscountRange")
					sap.m.MessageBox.error(omsg);
					return;
				}
			} else {
				aFilters2.push(new Filter("ItemCategoryGroup", "EQ", selSecData.ItemCategoryGroup));
			}
			this.getView().setBusy(true);
			that.getView().getModel().read("/ZAE_I_TC_PQTN_02", {
				filters: aFilters2,
				success: function (oDataDL, responseDL) {
					that.getView().setBusy(false);
					var oResult = oDataDL.results;
					if (oResult.length > 0) {
						var oValueStateText = parseFloat(oResult[0].DiscountFrom) + " - " + parseFloat(oResult[0].DiscountTo);
						oSliderDiscount.setValueStateText(oValueStateText);
						oSliderDiscount.setMax(parseFloat(oResult[0].DiscountTo));
						oSliderDiscount.setMin(parseFloat(oResult[0].DiscountFrom));
						// oSliderDiscount.setValueStateText(oValueStateText);
						that.getView().getModel("mApplyPercentageDis").setProperty("/valueStateText", oValueStateText);
						that._ApplyPerDiscountDialog.open();
					} else {
						var omsg = that.getView().getModel("i18n").getResourceBundle().getText("KindlymaintainData")
						sap.m.MessageBox.error(omsg);
					}
				},
				error: function (oError) {
					that.getView().setBusy(false);
					var MsgErrBox2 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorInDiscountLevel");
					MessageBox.error(MsgErrBox2);
				}
			});
		},

		onClickSSOD_B150: function (oEvent) {
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.ApplyPerDiscountPopOverOP";
			var selSecData = this.aeUtil.getSecData(this, "OPFacet");
			var that = this;
			if (!this._oApplyPerDiscountPopOverOP) {
				this._oApplyPerDiscountPopOverOP = sap.ui.xmlfragment(this.getView().getId(), fragName, {
					onClickSSOD_B151: function (oEvent) {
						that.fnLoadDiscountLevelsPerDiscountOP("LS1");
					},
					onClickSSOD_B152: function (oEvent) {
						that.fnLoadDiscountLevelsPerDiscountOP("LS2");
					},
					onClickSSOD_B153: function (oEvent) {
						that.fnLoadDiscountLevelsPerDiscountOP("LS3");
					},
					onClickSSOD_B154: function (oEvent) {
						that.fnLoadDiscountLevelsPerDiscountOP("LS4");
					},
					onClickSSOD_B155: function (oEvent) {
						that.fnLoadDiscountLevelsPerDiscountOP("LS5");
					}
				});
				this.getView().addDependent(this._oApplyPerDiscountPopOverOP);
				this._oApplyPerDiscountPopOverOP.attachBeforeOpen(function (oEvent) {
					var selSecData = this.aeUtil.getSecData(that, "OPFacet");

					if (selSecData.isShowSSOD_B151 !== undefined) {
						oEvent.getSource().getButtons()[0].setVisible(selSecData.isShowSSOD_B151);
					}

					if (selSecData.isShowSSOD_B152 !== undefined) {
						oEvent.getSource().getButtons()[1].setVisible(selSecData.isShowSSOD_B152);
					}

					if (selSecData.isShowSSOD_B153 !== undefined) {
						oEvent.getSource().getButtons()[2].setVisible(selSecData.isShowSSOD_B153);
					}
					if (selSecData.isShowSSOD_B154 !== undefined) {
						oEvent.getSource().getButtons()[3].setVisible(selSecData.isShowSSOD_B154);
					}
					if (selSecData.isShowSSOD_B155 !== undefined) {
						oEvent.getSource().getButtons()[4].setVisible(selSecData.isShowSSOD_B155);
					}

					setTimeout(function () {}, 1000);

				}, this);
			}
			this._oApplyPerDiscountPopOverOP.setModel(this.getView().getModel());
			var pop = oEvent.getSource();
			this._oApplyPerDiscountPopOverOP.openBy(pop);
		},
		fnLoadDiscountLevelsPerDiscountOP: function (oSource) {
			var that = this;
			this.oLevel = oSource;
			if (!that._ApplyPerDiscountDialogOP) {
				Fragment.load({
					id: "ApplyPerDiscountDialogOP",
					name: "com.globalintelli.zae_ssod.ext.fragment.ApplyPerDiscountOP",
					controller: {
						onChangeDiscountPercentageOP: function (oEvent) {
							var oValue = oEvent.getParameter("newValue");
							var oValueState = oEvent.getSource().getValueState();
							// if (!(oValue[oValue.length - 1] === ".")) {
							// 	oValue = oValue.replace(/[^0-9.]/g, "");
							// 	oValue = oValue.split(".").length > 0 ? oValue.split(".")[0] + oValue.split(".")[1].slice(0, 2) : oValue;
							// 	oValue = parseFloat(oValue) > 100 ? "100" : 0;
							// 	oEvent.getSource().setValue(oValue);
							// }
						},
						onSubmit: function () {
							var actId = "SSOD_B150";
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var oModel = that.getView().getModel("MultipleCompDiscountOP");
							var oEntity = "SSQT_APPLY_DISCOUNT_M_HEADERSet";
							var oSliderDiscount = Fragment.byId("ApplyPerDiscountDialogOP", "SliderDiscountOP");
							var oSelectedArray = [];
							var selSecData = that.aeUtil.getSecData(that, "OPFacet");
							var pageData = that.getView().getBindingContext().getObject();
							if (!(selSecData instanceof Array)) {
								oSelectedArray.push(selSecData);
							} else {
								oSelectedArray = selSecData;
							}
							if (oSliderDiscount.getValueState() === "Error") {
								return;
							}
							var NavMain = [{
								"ObjectId": pageData.ServiceOrder,
								"Levels": that.oLevel,
								"DiscountPercentage": oSliderDiscount.getValue().toString(),

							}];
							var NavItems = [];
							oSelectedArray.forEach(function (oItem) {
								NavItems.push({
									"NumberInt": oItem.ServiceOrderOperation
								});
							});
							var data = [{
								callProperty: "N_SSQT_APPLY_DISCOUNT_M_HEADER",
								value: NavMain
							}, {
								callProperty: "N_SSQT_APPLY_DISCOUNT_M_ITEM",
								value: NavItems
							}];
							var succFunc = function (oData, response) {
								that.getView().getModel().refresh(true);
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
							that._ApplyPerDiscountDialogOP.close();
						},
						onCancel: function () {
							that._ApplyPerDiscountDialogOP.close();
						}
					}
				}).then(function (DialogContent) {
					that._ApplyPerDiscountDialogOP = DialogContent;
					that.getView().addDependent(that._ApplyPerDiscountDialogOP);
					that._initApplyPerDiscountDialogOP(that.oLevel);
				});
			} else {
				that._initApplyPerDiscountDialogOP(that.oLevel);
			}
		},
		_initApplyPerDiscountDialogOP: function (oLevel) {
			var that = this;
			var aFilters = [];
			var selSecData = that.aeUtil.getSecData(that, "OPFacet");
			var pageData = this.getView().getBindingContext().getObject();
			var oSliderDiscount = Fragment.byId("ApplyPerDiscountDialogOP", "SliderDiscountOP");
			var oModel = new JSONModel();
			this.getView().setModel(oModel, "mApplyPercentageDis");
			oSliderDiscount.setValue(0);
			var aFilters2 = [];
			aFilters2.push(new Filter("SalesOffice", "EQ", pageData.SalesOffice));
			aFilters2.push(new Filter("SalesGroup", "EQ", pageData.SalesGroup));
			aFilters2.push(new Filter("TransactionType", "EQ", pageData.ServiceDocumentType));
			aFilters2.push(new Filter("ItemCategoryGroup", "EQ", selSecData.ItemCategoryGroup));
			aFilters2.push(new Filter("Levels", "EQ", oLevel));
			if (selSecData instanceof Array) {
				var selectedItemCategory = [...new Map(selSecData.map((m) => [m.ItemCategoryGroup, m])).values()];
				if (selectedItemCategory.length === 1) {
					aFilters2.push(new Filter("ItemCategoryGroup", "EQ", selectedItemCategory[0].ItemCategoryGroup));
				} else {
					var omsg = this.getView().getModel("i18n").getResourceBundle().getText("CommonDiscountRange")
					sap.m.MessageBox.error(omsg);
					return;
				}
			} else {
				aFilters2.push(new Filter("ItemCategoryGroup", "EQ", selSecData.ItemCategoryGroup));
			}
			this.getView().setBusy(true);
			that.getView().getModel().read("/ZAE_I_TC_SSOD_12", {
				filters: aFilters2,
				success: function (oDataDL, responseDL) {
					that.getView().setBusy(false);
					var oResult = oDataDL.results;
					if (oResult.length > 0) {
						var oValueStateText = parseFloat(oResult[0].DiscountFrom) + " - " + parseFloat(oResult[0].DiscountTo);
						oSliderDiscount.setValueStateText(oValueStateText);
						oSliderDiscount.setMax(parseFloat(oResult[0].DiscountTo));
						oSliderDiscount.setMin(parseFloat(oResult[0].DiscountFrom));
						// oSliderDiscount.setValueStateText(oValueStateText);
						that.getView().getModel("mApplyPercentageDis").setProperty("/valueStateText", oValueStateText);
						that._ApplyPerDiscountDialogOP.open();
					} else {
						var omsg = that.getView().getModel("i18n").getResourceBundle().getText("KindlyMaintainDataInSSOD")
						sap.m.MessageBox.error(omsg);
					}
				},
				error: function (oError) {
					that.getView().setBusy(false);
					var MsgErrBox2 = that.getView().getModel("i18n").getResourceBundle().getText("ErrorInDiscountLevel");
					MessageBox.error(MsgErrBox2);
				}
			});

		},

		onClickSSOD_B148: function (oEvent) {
			if (!this._oSplitToNewOrderDialog) {
				Fragment.load({
						id: "FragSplitToNewOrder",
						name: "com.globalintelli.zae_ssod.ext.fragment.SplitToNewOrder",
						controller: this
					})
					.then(function (oDialogContent) {
						this._SplitToNewOrderDialog(oDialogContent);
						this._setSplitToNewOrderDialogInitialState();
					}.bind(this));
			} else {
				this._setSplitToNewOrderDialogInitialState();
			}
		},
		_setSplitToNewOrderDialogInitialState: function () {
			var that = this;
			Fragment.byId("FragSplitToNewOrder", "ProcessTypeInput").setSelectedKey(null);
			Fragment.byId("FragSplitToNewOrder", "SSOD_B148MessageStrip").setVisible(false);
			Fragment.byId("FragSplitToNewOrder", "PartnerInput").setVisible(false);
			var pageData = this.getView().getBindingContext().getObject();
			var ProcessType = Fragment.byId("FragSplitToNewOrder", "ProcessTypeInput");
			var oBinding = ProcessType.getBinding("items");
			var aServiceDocumentType = [];
			aServiceDocumentType.push(new Filter("ProcessType", sap.ui.model.FilterOperator.EQ, pageData.ServiceDocumentType));
			oBinding.filter(aServiceDocumentType);
			this._oSplitToNewOrderDialog.open();
		},
		fnCheckProcessType: function (oEvent) {
			var that = this;
			var PartnerRule = oEvent.getSource().getSelectedItem().getBindingContext().getObject().PartnerRule;
			var ProcessType = Fragment.byId("FragSplitToNewOrder", "ProcessTypeInput").getSelectedKey();
			if (ProcessType) {
				Fragment.byId("FragSplitToNewOrder", "PartnerInput").setVisible(true);
			}
			Fragment.byId("FragSplitToNewOrder", "PartnerInput").setValue('');
			if (PartnerRule === "1" || PartnerRule === "4") {
				Fragment.byId("FragSplitToNewOrder", "PartnerInput").setEnabled(true);
			} else if (PartnerRule === "2") {
				Fragment.byId("FragSplitToNewOrder", "PartnerInput").setVisible(false);
			} else if (PartnerRule === "3") {
				var PartnerDetails = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
				var otext = this.formatNameAndValuePair(PartnerDetails.PartnerName, PartnerDetails.Partner);
				Fragment.byId("FragSplitToNewOrder", "PartnerInput").data('Partner', PartnerDetails.Partner);
				Fragment.byId("FragSplitToNewOrder", "PartnerInput").setValue(otext);
				Fragment.byId("FragSplitToNewOrder", "PartnerInput").setEnabled(false);
			}
		},
		handleValueHelp: function (oEvent) {
			var pageData = this.getView().getBindingContext().getObject();
			var input = oEvent.getSource();
			var inputLabel = this.aeUtil.geti18nText(this, 'Partner');
			var vhEntitySet;
			var ProcessTypeObj = Fragment.byId("FragSplitToNewOrder", "ProcessTypeInput").getSelectedItem().getBindingContext().getObject();
			var oProcessTypeInput = Fragment.byId("FragSplitToNewOrder", "ProcessTypeInput").getSelectedKey();
			var PartnerRule = ProcessTypeObj.PartnerRule;
			if (PartnerRule === "1") {
				vhEntitySet = "ZAE_I_TC_SSWE_11";
			} else if (PartnerRule === "4") {
				vhEntitySet = "ZAE_I_TC_SSOD_22";
			}
			var vhSearchKey = "Partner";
			var vhSearchText = "PartnerName";
			var vhEntitySetFilter = [{
				path: 'SalesOrganization',
				operator: 'EQ',
				value1: pageData.SalesOrganization
			}, {
				path: 'Make',
				operator: 'EQ',
				value1: pageData.Make
			}];
			this.handleDialogValueHelp(this, input, inputLabel, vhEntitySet, vhSearchKey, vhSearchText, vhEntitySetFilter);

		},
		_SplitToNewOrderDialog: function (oDialogContent, oEvent) {
			var that = this;

			this._oSplitToNewOrderDialog = new sap.m.Dialog({
				title: "{i18n>SSOD_B148}",
				content: [
					oDialogContent
				],
				beginButton: new sap.m.Button({
					text: "Create",
					press: function () {
						var selSecData = this.aeUtil.getSecData(that, "OPFacet");
						var Partner = Fragment.byId("FragSplitToNewOrder", "PartnerInput");
						var oProcessTypeInput = Fragment.byId("FragSplitToNewOrder", "ProcessTypeInput").getSelectedKey();
						var PartnerRule = Fragment.byId("FragSplitToNewOrder", "ProcessTypeInput").getSelectedItem().getBindingContext().getObject()
							.PartnerRule;
						if (oProcessTypeInput === "" || oProcessTypeInput === undefined) {
							var msg2 = "Select Process Type";
							var oMessageStrip = Fragment.byId("FragSplitToNewOrder", "SSOD_B148MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);
							return;
						}
						var oPartnerInput = Partner.data("Partner");
						if ((oPartnerInput === "" || oPartnerInput === undefined) && PartnerRule !== "3") {
							var msg2 = "Select Partner";
							var oMessageStrip = Fragment.byId("FragSplitToNewOrder", "SSOD_B148MessageStrip");
							oMessageStrip.setVisible(true);
							oMessageStrip.setText(msg2);
							return;
						}
						var pageData = that.getView().getBindingContext().getObject();
						var actId = "SSOD_B148";
						var actLabel = that.aeUtil.geti18nText(that, actId);
						var oModel = that.getView().getModel('SplitToNewOrder');
						var oEntity = "ZAE_FM_SSOD_CRT_SPLIT_SRV_ORDSet";
						var aHeaderData = [];
						var aItemsData = [];
						aHeaderData.push({
							"ISerOrd": pageData.ServiceOrder,
							"IOrderType": oProcessTypeInput,
							"Partner": oPartnerInput !== null ? oPartnerInput : ""
						});
						if (selSecData instanceof Array) {
							for (var i = 0; i < selSecData.length; i++) {
								aItemsData.push({
									"NumberInt": selSecData[i].ServiceOrderOperation
								});
							}
						} else {
							aItemsData.push({
								"NumberInt": selSecData.ServiceOrderOperation
							});
						}
						var data = [{
							callProperty: "N_ZAE_FM_SSOD_CRT_SPLIT_SRV_OR",
							value: aHeaderData
						}, {
							callProperty: "N_ITEMS_DATA",
							value: aItemsData
						}];
						var succFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						var errorFunc = function (oData) {
							that.extensionAPI.refresh();
							that.getView().setBusy(false);
						};
						that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errorFunc);
						that._oSplitToNewOrderDialog.close();

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Close",
					press: function () {
						this._oSplitToNewOrderDialog.close();
					}.bind(this)
				})
			});

			this.getView().addDependent(this._oSplitToNewOrderDialog);

		},
		handleDialogValueHelp: function (that, input, inputLabel, vhEntitySet, vhSearchKey, vhSearchText, vhEntitySetFilter) {
			var self = this;
			var inputId = input.getId();
			if (!self._valueHelpDialogs[inputId]) {
				Fragment.load({
						id: inputId + "DialogVHFragment",
						name: "com.globalintelli.zae_ssod.ext.fragment.DialogValueHelp",
						controller: {
							_handleValueHelpClose: function (oEvent) {
								var oSelectedItem = oEvent.getParameter("selectedItem");
								if (oSelectedItem) {
									input.data('Partner', oSelectedItem.getDescription());
									var oObject = oSelectedItem.getBindingContext().getObject();
									var otext = self.formatNameAndValuePair(oObject.PartnerName, oObject.Partner);
									input.setValue(otext);
								}
								oEvent.getSource().getBinding("items").filter([]);
							},
							_handleValueHelpSearch: function (oEvent) {
								var sValue = oEvent.getParameter("value");
								self._setValueHelpDialogFilter(inputId, vhSearchKey, vhSearchText, vhEntitySetFilter, sValue);
							}
						}
					})
					.then(function (oValueHelpDialogContent) {
						self._valueHelpDialogs[inputId] = oValueHelpDialogContent;
						that.getView().addDependent(self._valueHelpDialogs[inputId]);
						self._initValueHelpDialog(input, inputLabel, vhEntitySet, vhSearchKey, vhSearchText, vhEntitySetFilter);
					});
			} else {
				self._initValueHelpDialog(input, inputLabel, vhEntitySet, vhSearchKey, vhSearchText, vhEntitySetFilter);
			}
		},

		_initValueHelpDialog: function (input, inputLabel, vhEntitySet, vhSearchKey, vhSearchText, vhEntitySetFilter) {
			var inputId = input.getId();
			this._valueHelpDialogs[inputId].setTitle(inputLabel);
			var inputValue = input.getValue();
			if (vhEntitySet) {
				var vhObjItems = {
					path: "/" + vhEntitySet,
					template: new sap.m.StandardListItem({
						title: "{" + vhSearchText + "}",
						description: "{" + vhSearchKey + "}"
					})
				};
				this._valueHelpDialogs[inputId].bindAggregation("items", vhObjItems);
			}
			this._setValueHelpDialogFilter(inputId, vhSearchKey, vhSearchText, vhEntitySetFilter, inputValue);
			this._valueHelpDialogs[inputId].open(inputValue);
		},

		_setValueHelpDialogFilter: function (inputId, vhSearchKey, vhSearchText, vhEntitySetFilter, sValue) {
			// var inputFilter = new sap.ui.model.Filter({
			// 	filters: this.aeUtil.genFilterArr([{
			// 		path: vhSearchKey,
			// 		operator: sap.ui.model.FilterOperator.Contains,
			// 		value1: sValue
			// 	}, {
			// 		path: vhSearchText,
			// 		operator: sap.ui.model.FilterOperator.Contains,
			// 		value1: sValue
			// 	}])
			// });
			var oFilter = [];
			oFilter.push(new Filter({
				filters: [
					new Filter({
						path: vhSearchKey,
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					}),
					new Filter({
						path: vhSearchText,
						operator: sap.ui.model.FilterOperator.Contains,
						value1: sValue
					})

				],
				and: false
			}));
			if (vhEntitySetFilter) {
				// oFilter.push(vhEntitySetFilter);
				vhEntitySetFilter.forEach(function (obj) {
					// oFilter2 = new sap.ui.model.Filter({
					// 	filters: [
					// 		// inputFilter,
					// 		this.aeUtil.genFilterArr([{
					// 			path: obj.path,
					// 			operator: obj.operator,
					// 			value1: obj.value1
					// 		}])
					// 	],
					// 	and: true
					// });
					oFilter.push(new sap.ui.model.Filter({
						path: obj.path,
						operator: obj.operator,
						value1: obj.value1
					}));
				}.bind(this));

				// oFilter = new sap.ui.model.Filter({
				// 	filters: [oFilter, oFilter2],
				// 	and: true
				// });

			}
			// if (vhEntitySetFilter) {
			// var entityFilter = new sap.ui.model.Filter({
			//     path: vhEntitySetFilter.path,
			//     operator: vhEntitySetFilter.operator,
			//     value1: vhEntitySetFilter.value1
			// });

			// // Combine input filter and entity filter with AND condition
			// oFilter = new sap.ui.model.Filter({
			//     filters: [inputFilter, entityFilter],
			//     and: true
			// });
			// }
			this._valueHelpDialogs[inputId].getBinding("items").filter(oFilter, sap.ui.model.FilterType.Application);

		},
		onClickSSOD_B149: function (oEvent) {
			var that = this;
			var oButton = oEvent.getSource();
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			if (!that._AddSubletLabourComponentsDialog) {
				Fragment.load({
					id: "AddSubletLabourComponentDialog",
					name: "com.globalintelli.zae_ssod.ext.fragment.AddSubletLabourComponent",
					controller: {
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
						fnCostValue: function (oValue) {
							if (oValue) {
								return oValue;
							}
						},

						onFilterSearchMaterial: function (oEvent) {
							var searchText = oEvent.getParameter("query");
							var pageData = that.getView().getBindingContext().getObject();
							var aFilters = [];
							// var SearchFilters = [];
							var oBinding = Fragment.byId("AddSubletLabourComponentDialog", "idAddSubletComponentTable").getBinding("items");
							aFilters.push(new sap.ui.model.Filter({
								path: "Plant",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.ServiceOrganization
							}));
							aFilters.push(new sap.ui.model.Filter({
								path: "DistributionChannel",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.DistributionChannel
							}));
							aFilters.push(new sap.ui.model.Filter({
								path: "SalesOrganization",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.SalesOrganization
							}));
							aFilters.push(new sap.ui.model.Filter({
								path: "TransactionType",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.ServiceDocumentType
							}));
							aFilters.push(new sap.ui.model.Filter({
								path: "SalesOffice",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.SalesOffice
							}));
							aFilters.push(new sap.ui.model.Filter({
								path: "SalesGroup",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.SalesGroup
							}));
							if (searchText) {
								aFilters.push(new Filter({
									filters: [
										new Filter({
											path: "Material",
											operator: sap.ui.model.FilterOperator.Contains,
											value1: searchText
										})
									],
									and: false
								}));
								// var combinedFilter = new Filter({
								// 	filters: [aFilters, SearchFilters],
								// 	and: true
								// });
								oBinding.filter(aFilters);
							} else {
								oBinding.filter(aFilters);
							}
						},

						onChangeCost: function (oEvent) {
							var oSource = oEvent.getSource();
							var oValue = oEvent.getParameter("value");
							if (oValue) {
								var oObject = oSource.getParent().getBindingContext().getObject();
								var oSalesPrice = (parseFloat(oValue) * parseFloat(oObject["MinMargin"])).toFixed(2);
								oSource.getParent().getCells()[5].setValue(oSalesPrice);
								if (oSalesPrice > 0) {
									oSource.getParent().getCells()[5].setValueState("None");
								} else {
									oSource.getParent().getCells()[5].setValueState("Error");
								}
							}
							this.fnSubmitButonValidation();
						},
						updateFinished: function (oEvent) {
							var oItems = oEvent.getSource().getItems();
							oItems.forEach(function (obj) {
								let oObject = obj.getBindingContext().getObject();
								if (!oObject["Enabled"] && parseFloat(oObject["Cost"])) {
									var oSalesPrice = (parseFloat(oObject["Cost"]) * parseFloat(oObject["MinMargin"])).toFixed(2);
									obj.getCells()[5].setValue(oSalesPrice);
								}
							});
						},
						onChangeSalesPrice: function (oEvent) {
							var oSource = oEvent.getSource();
							var oObject = oSource.getParent().getBindingContext().getObject();
							var oValue = parseFloat(oEvent.getParameter("value"));
							var oCost = parseFloat(oSource.getParent().getCells()[4].getValue());
							if (!isNaN(oValue) && !isNaN(oCost) && oValue !== 0) {
								var oMinValue = (oCost * parseFloat(oObject["MinMargin"])).toFixed(2);
								var oMaxValue = (oCost * parseFloat(oObject["MaxMargin"])).toFixed(2);
								if (oMinValue === oMaxValue) {
									oSource.setValueState("Error");
									oSource.setValueStateText(oResourceBundle.getText("SalesPriceEqual", oMinValue));
								} else if (oValue < oMinValue) {
									oSource.setValueState("Error");
									oSource.setValueStateText(oResourceBundle.getText("SalesPriceless", oMinValue));
								} else if (oValue > oMaxValue) {
									oSource.setValueState("Error");
									oSource.setValueStateText(oResourceBundle.getText("SalesPriceMore", oMaxValue));
								} else {
									oSource.setValueState("None");
									oSource.setValueStateText("");
								}
							} else {
								oSource.setValueState("Error");
							}
							this.fnSubmitButonValidation();
						},
						onSelectionChange: function (oEvent) {
							var oSelectedItems = oEvent.getSource().getSelectedItems();
							oSelectedItems.forEach(function (obj) {
								let oObject = obj.getBindingContext().getObject();
								if (!oObject["Enabled"] && parseFloat(oObject["Cost"])) {
									var oSalesPrice = (parseFloat(oObject["Cost"]) * parseFloat(oObject["MinMargin"])).toFixed(2);
									obj.getCells()[5].setValue(oSalesPrice);
								}
								obj.getCells()[1].setEnabled(true);

							});
							oEvent.getParameter("listItem").getCells()[2].setValue("1");
							var SelectedContext = oEvent.getSource().getSelectedContexts();
							if (oEvent.getParameter("selected") === false) {
								let oObject = oEvent.getParameter("listItem").getBindingContext().getObject();
								if (parseFloat(oObject["Cost"])) {
									var oSalesPrice = (parseFloat(oObject["Cost"]) * parseFloat(oObject["MinMargin"])).toFixed(2);
								}
								oEvent.getParameter("listItem").getCells()[2].setValue("");
								oEvent.getParameter("listItem").getCells()[4].setValue(oObject["Cost"]);
								oEvent.getParameter("listItem").getCells()[5].setValue(oSalesPrice);
								oEvent.getParameter("listItem").getCells()[6].setSelectedKey("");
								oEvent.getParameter("listItem").getCells()[1].setEnabled(false);
							}
							if (oSelectedItems.length === 0) {
								oEvent.getSource().getItems().forEach(function (obj) {
									let oObject = obj.getBindingContext().getObject();
									if (parseFloat(oObject["Cost"])) {
										var oSalesPrice = (parseFloat(oObject["Cost"]) * parseFloat(oObject["MinMargin"])).toFixed(2);
									}
									obj.getCells()[2].setValue("");
									obj.getCells()[4].setValue(oObject["Cost"]);
									obj.getCells()[5].setValue(oSalesPrice);
									obj.getCells()[6].setSelectedKey("");
									obj.getCells()[1].setEnabled(false);
								})
							}
							this.fnSubmitButonValidation();

						},
						onMaterialValueHelpRequested: function (oEvent1) {
							var pageData = that.getView().getBindingContext().getObject();
							var ServiceOrganization = pageData.ServiceOrganization;
							var SalesOrganization = pageData.SalesOrganization;
							var DistributionChannel = pageData.DistributionChannel;
							var input = oEvent1.getSource();
							input.setTokens([]);
							var configObject = {
								entitySet: "ZAE_C_MaterialSalesData_06",
								initiallyVisibleFields: "Material,MaterialGroup,MaterialType,ItemCategoryGroup,UnitOfMeasure",
								selectionMode: "MultiToggle",

								tokenObject: {
									key: "Material",
									Description: "MaterialName"
								},
								controlConfiguration: [{
									index: 0,
									key: "SalesOrganization",
									filterType: "auto",
									label: "SalesOrganization",
									mandatory: "auto",
									visible: false
								}, {
									index: 1,
									key: "DistributionChannel",
									filterType: "auto",
									label: "DistributionChannel",
									mandatory: "auto",
									visible: false
								}, {
									index: 2,
									key: "Material",
									filterType: "auto",
									label: "{/#ZAE_C_MaterialSalesData_06Type/Material/@sap:label}",
									mandatory: "auto",
									visible: true
								}, {
									index: 3,
									key: "MaterialName",
									filterType: "auto",
									label: "{/#ZAE_C_MaterialSalesData_06Type/MaterialName/@sap:label}",
									mandatory: "auto",
									visible: true
								}, {
									index: 4,
									key: "MaterialGroup",
									filterType: "auto",
									label: "Material Group",
									mandatory: "auto",
									visible: true
								}, {
									index: 5,
									key: "MaterialType",
									filterType: "auto",
									label: "{/#ZAE_C_MaterialSalesData_06Type/MaterialType/@sap:label}",
									mandatory: "auto",
									visible: true
								}, {
									index: 6,
									key: "Plant",
									filterType: "auto",
									label: "Service Organization",
									mandatory: "auto",
									visible: false
								}],
								defaultFilter: {
									Plant: {
										"items": [{
											"key": ServiceOrganization
										}]
									}
								},
								onBeforeRebindSmartTable: function (oEvent) {
									var pageData = that.getView().getBindingContext().getObject();
									var aFilters = oEvent.getParameter("bindingParams").filters;
									aFilters.push(new sap.ui.model.Filter({
										path: "Plant",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.ServiceOrganization

									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "DistributionChannel",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.DistributionChannel
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "SalesOrganization",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.SalesOrganization
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "TransactionType",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.ServiceDocumentType
									}));
									aFilterArray.push(new sap.ui.model.Filter({
										path: "ItemCategoryGroup",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: "ZSUB"
									}));
									oEvent.getParameter("bindingParams").filters = aFilters;
									oEvent.getParameter("bindingParams").select = oEvent.getParameter("bindingParams").select + ",MaterialBaseUnit";

								}

							};
							that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
						},
						onMaterailTokenUpdate: function (oEvent) {
							var aFilters = [];
							var pageData = that.getView().getBindingContext().getObject();
							var oTokens = oEvent.getSource().getTokens();
							if (oEvent.getParameter("type") === "removed") {
								var RemovedTokens = oEvent.getParameters("removedTokens").removedTokens;
								oTokens = oTokens.filter(({
									sId
								}) => !RemovedTokens.some((e) => e.sId === sId));
							}
							oTokens.forEach(function (oToken) {
								aFilters.push(new sap.ui.model.Filter({
									path: "Material",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: oToken.getKey()
								}));

							});
							aFilters.push(new sap.ui.model.Filter({
								path: "Plant",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.ServiceOrganization
							}));
							aFilters.push(new sap.ui.model.Filter({
								path: "DistributionChannel",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.DistributionChannel
							}));
							aFilters.push(new sap.ui.model.Filter({
								path: "SalesOrganization",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.SalesOrganization
							}));
							aFilters.push(new sap.ui.model.Filter({
								path: "TransactionType",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: pageData.ServiceDocumentType
							}));
							Fragment.byId("AddSubletLabourComponentDialog", "idAddSubletComponentTable").getBinding("items").filter(aFilters);
						},
						// onSelectMaterial: function (oEvent) {
						// 	if (oEvent.getParameter("selectedRow") !== null) {
						// 		var oSource = oEvent.getSource();
						// 		oSource.setTokens([]);
						// 		var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
						// 		var oText = this.formatNameAndValuePair(oSelectedData.MaterialName, oSelectedData.Material)
						// 		var oToken = new sap.m.Token({
						// 			key: oSelectedData.Material,
						// 			text: oText
						// 		});
						// 		oSource.setTokens([oToken]);
						// 		oSource.setValue();
						// 		var aFilters = [];
						// 		var pageData = that.getView().getBindingContext().getObject();
						// 		// var oTokens = oEvent.getSource().getTokens();
						// 		// if (oEvent.getParameter("type") && oEvent.getParameter("type") !== "removed") {
						// 		// oTokens.forEach(function (oToken) {
						// 		aFilters.push(new sap.ui.model.Filter({
						// 			path: "Material",
						// 			operator: sap.ui.model.FilterOperator.EQ,
						// 			value1: oToken.getKey()
						// 		}));

						// 		// });
						// 		// }
						// 		aFilters.push(new sap.ui.model.Filter({
						// 			path: "Plant",
						// 			operator: sap.ui.model.FilterOperator.EQ,
						// 			value1: pageData.ServiceOrganization
						// 		}));
						// 		aFilters.push(new sap.ui.model.Filter({
						// 			path: "DistributionChannel",
						// 			operator: sap.ui.model.FilterOperator.EQ,
						// 			value1: pageData.DistributionChannel
						// 		}));
						// 		aFilters.push(new sap.ui.model.Filter({
						// 			path: "SalesOrganization",
						// 			operator: sap.ui.model.FilterOperator.EQ,
						// 			value1: pageData.SalesOrganization
						// 		}));
						// 		aFilters.push(new sap.ui.model.Filter({
						// 			path: "TransactionType",
						// 			operator: sap.ui.model.FilterOperator.EQ,
						// 			value1: pageData.ServiceDocumentType
						// 		}));
						// 		Fragment.byId("AddSubletLabourComponentDialog", "idAddSubletComponentTable").getBinding("items").filter(aFilters);
						// 	}
						// },
						// handleMaterialSuggest: function (oEvent) {
						// 	var pageData = that.getView().getBindingContext().getObject();
						// 	var sTerm = oEvent.getParameter("suggestValue");
						// 	var aFilters = [];
						// 	if (sTerm) {
						// 		aFilters.push(new sap.ui.model.Filter({
						// 			path: "Plant",
						// 			operator: sap.ui.model.FilterOperator.EQ,
						// 			value1: pageData.ServiceOrganization
						// 		}));
						// 		aFilters.push(new sap.ui.model.Filter({
						// 			path: "DistributionChannel",
						// 			operator: sap.ui.model.FilterOperator.EQ,
						// 			value1: pageData.DistributionChannel
						// 		}));
						// 		aFilters.push(new sap.ui.model.Filter({
						// 			path: "SalesOrganization",
						// 			operator: sap.ui.model.FilterOperator.EQ,
						// 			value1: pageData.SalesOrganization
						// 		}));
						// 		aFilters.push(new sap.ui.model.Filter({
						// 			path: "TransactionType",
						// 			operator: sap.ui.model.FilterOperator.EQ,
						// 			value1: pageData.ServiceDocumentType
						// 		}));

						// 		aFilters.push(new Filter({
						// 			filters: [
						// 				new Filter({
						// 					path: "Material",
						// 					operator: sap.ui.model.FilterOperator.Contains,
						// 					value1: sTerm
						// 				}),
						// 				new Filter({
						// 					path: "MaterialName",
						// 					operator: sap.ui.model.FilterOperator.Contains,
						// 					value1: sTerm
						// 				})

						// 			],
						// 			and: false
						// 		}));
						// 	}
						// 	oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
						// 	oEvent.getSource().getBinding("suggestionRows").resume();
						// },
						fnSubmitButonValidation: function (oEvent) {
							var boolIpPending = false;
							var Material = Fragment.byId("AddSubletLabourComponentDialog", "opMaterial").getTokens();
							var ItemCategory = Fragment.byId("AddSubletLabourComponentDialog", "ItemCategory").getSelectedKey();
							var Quantity = Fragment.byId("AddSubletLabourComponentDialog", "Quantity").getValue();
							var oTableItems = Fragment.byId("AddSubletLabourComponentDialog", "idAddSubletComponentTable").getSelectedItems();
							oTableItems.forEach(function (oItem) {
								if (!(oItem.getCells()[1].getValue())) {
									boolIpPending = true;
								}
								if (!(oItem.getCells()[2].getValue())) {
									boolIpPending = true;
								}
								if (oItem.getCells()[5].getValueState() === 'Error') {
									boolIpPending = true;
								}
							});
							if (oTableItems.length === 0) {
								boolIpPending = true;
							}
							Quantity = parseFloat(Quantity);

							if (Material.length <= 0 || ItemCategory === "" || isNaN(Quantity) || Quantity <= 0) {
								boolIpPending = true;
							}
							Fragment.byId("AddSubletLabourComponentDialog", "BTNSubmit").setEnabled(!boolIpPending);
						},
						onSubmit: function () {
							var actId = "SSOD_B149";
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var oModel = that.getView().getModel("AddSubletOperation");
							var oEntity = "ZAE_FM_SSOD_ADD_SUBLET_OPRSet";
							var Material = Fragment.byId("AddSubletLabourComponentDialog", "opMaterial").getTokens()[0];
							var ItemCategory = Fragment.byId("AddSubletLabourComponentDialog", "ItemCategory").getSelectedKey();
							var Quantity = Fragment.byId("AddSubletLabourComponentDialog", "Quantity").getValue();
							var ComplaintCode = Fragment.byId("AddSubletLabourComponentDialog", "ComplaintCode").getSelectedKey();
							var ServiceType = Fragment.byId("AddSubletLabourComponentDialog", "ServiceType").getSelectedKey();
							var Severity = Fragment.byId("AddSubletLabourComponentDialog", "Severity").getSelectedKey();
							var pageData = that.getView().getBindingContext().getObject();
							var oTableItems = Fragment.byId("AddSubletLabourComponentDialog", "idAddSubletComponentTable").getSelectedItems();
							var InspectionLotData = "";
							if (Fragment.byId("AddSubletLabourComponentDialog", "InspectionLot").getTokens().length > 0) {
								InspectionLotData = Fragment.byId("AddSubletLabourComponentDialog", "InspectionLot").getTokens()[0].getCustomData()[0].mProperties
									.value;
							}
							var NavMain = [{
								"ServiceOrder": pageData.ServiceOrder,
							}];
							var NavItems = [];

							var obj = {
								"NumberInt": "10",
								"OrderedProd": Material.getKey(),
								"Quantity": Quantity,
								"Severity": Severity,
								"ServiceType": ServiceType,
								"CompCode": ComplaintCode,
								"OrderProdDesc": Material.getText().split("(")[0],
							};
							if (InspectionLotData) {
								obj["Prueflos"] = InspectionLotData.InspectionLot;
								obj["InspOpNo"] = InspectionLotData.InspPlanOperationInternalID;
								obj["InspCharNo"] = InspectionLotData.InspectionCharacteristic;
								obj["InspCharCode"] = InspectionLotData.Code;
								obj["Characteristic"] = InspectionLotData.InspPlanOperationInternalID.replace(/^0+/, '') + "/" +
									InspectionLotData.InspectionSpecificationText + "/" +
									InspectionLotData.InspectionCodeText + "/" +
									InspectionLotData.InspDate;
							}
							NavItems.push(obj);
							oTableItems.forEach(function (oItem, i) {
								NavItems.push({
									"NumberInt": ((i + 2) * 10).toString(),
									"NumberParent": "10",
									"OrderedProd": oItem.getCells()[0].getText(),
									"Quantity": oItem.getCells()[2].getValue(),
									"Severity": oItem.getCells()[6].getSelectedKey(),
									"OrderProdDesc": oItem.getCells()[1].getValue(),
									"Price": oItem.getCells()[5].getValue() !== "" ? oItem.getCells()[5].getValue().toString() : "0",
									"Currency": pageData.currency,
									"ProcessQtyUnit": "",
									"Cost": oItem.getCells()[4].getValue() !== "" ? oItem.getCells()[4].getValue().toString() : "0"

								});
							});
							var data = [{
								callProperty: "NavMain",
								value: NavMain
							}, {
								callProperty: "NavItems",
								value: NavItems
							}];
							var succFunc = function (oData, response) {
								that.getView().getModel().refresh(true);
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
							that._AddSubletLabourComponentsDialog.close();
						},
						onCancel: function () {
							that._AddSubletLabourComponentsDialog.close();
							that._fnLockAddComponent(false);
							that.resetSessionTimeout(false);
							that.oMouseMove = true;
						},
						_fnLockAddComponent: function (Lock) {
							var that = this;
							var pageData = this.getView().getBindingContext().getObject();
							var actId = "SSOD_B149";
							var actLabel = this.aeUtil.geti18nText(that, actId);
							var oModel = this.getView().getModel();
							var oEntity = "ZAE_FM_SRV_DOC_LOCK_UNLOCKSet";
							var data = [{
								callProperty: "ObjectId",
								value: pageData.ServiceOrder
							}, {
								callProperty: "Lock",
								value: Lock
							}];
							var succFunc = function (oData, response) {
								//	this.extensionAPI.refresh();
							}.bind(this);
							var errFunc = function (oData, response) {
								// this.aeUtil.refreshControlModel(oView);
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errFunc);
						},
						onInspectionLotValueHelpRequested: function (oEvent1) {
							var aCols = {
								"cols": [{
									"label": "InspectionLot",
									"template": "InspectionLot",
									"width": "10rem"
								}, {
									"label": "Inspection Characteristic",
									"template": "InspectionSpecificationText",
									"width": "10rem"
								}, {
									"label": "Color",
									"template": "InspectionCodeText",
									"width": "10rem"
								}, {
									"label": "Inspection Date",
									"template": "InspDate",
									"width": "10rem"
								}]
							};

							this._oInspectionLotBasicSearchField = new SearchField({
								showSearchButton: false
							});

							that._oInspectionLotMultiInput = oEvent1.getSource();

							that._oInspectionLotCustVHDialog = sap.ui.xmlfragment(
								"com.globalintelli.zae_ssod.ext.fragment.CustInspectionLotValueHelp",
								this);
							that._oInspectionLotCustVHDialog.setModel(that.getView().getModel());
							that._oInspectionLotCustVHDialog.setRangeKeyFields([{
								label: "InspectionLot",
								key: "InspectionLot",
								type: "string",
								typeInstance: new typeString({}, {
									maxLength: 7
								})
							}]);

							that._oInspectionLotCustVHDialog.getFilterBar().setBasicSearch(this._oInspectionLotBasicSearchField);

							that._oInspectionLotCustVHDialog.getTableAsync().then(function (oTable) {
								oTable.setModel(new JSONModel(aCols), "columns");

								if (oTable.bindRows) {
									oTable.bindAggregation("rows", that.constant.InspectionLotBindingPath);
								}

								if (oTable.bindItems) {
									oTable.bindAggregation("items", that.constant.InspectionLotBindingPath, function () {
										return new ColumnListItem({
											cells: aCols.map(function (column) {
												return new sap.m.Label({
													text: "{" + column.template + "}"
												});
											})
										});
									});
								}

								that._oInspectionLotCustVHDialog.update();
							}.bind(this));
							that._oInspectionLotCustVHDialog.setTokens(that._oInspectionLotMultiInput.getTokens());
							var aFilters = [];
							var ComplainCode = Fragment.byId("AddSubletLabourComponentDialog", "ComplaintCode").getSelectedKey();
							var Equipment = that.getView().getBindingContext().getObject().Equipment;
							if (ComplainCode !== "") {
								aFilters.push(new sap.ui.model.Filter("ComplainCode", sap.ui.model.FilterOperator.EQ, ComplainCode));
							}
							if (Equipment !== "") {
								aFilters.push(new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, Equipment.padStart(18, 0)));
							}
							this._filterTableInspectionLot(new Filter({
								filters: aFilters,
								and: true
							}));

							that._oInspectionLotCustVHDialog.open();
						},
						_filterTableInspectionLot: function (oFilter) {
							var oValueHelpDialog = that._oInspectionLotCustVHDialog;
							oValueHelpDialog.getTableAsync().then(function (oTable) {
								that.aeUtil.fnFilterVHTable(oTable, oFilter);
								oValueHelpDialog.update();
							});
						},
						onInspectionLotFilterBarSearch: function (oEvent4) {
							var ComplainCode = Fragment.byId("AddSubletLabourComponentDialog", "ComplaintCode").getSelectedKey();
							var aSelectionSet = oEvent4.getParameter("selectionSet");
							var aFilters = aSelectionSet.reduce(function (aResult, oControl) {
								if (oControl.getValue()) {
									aResult.push(new Filter({
										path: oControl.getName(),
										operator: FilterOperator.Contains,
										value1: oControl.getValue()
									}));
								}

								return aResult;
							}, []);
							var Equipment = that.getView().getBindingContext().getObject().Equipment;
							if (ComplainCode !== "") {
								aFilters.push(new sap.ui.model.Filter("ComplainCode", sap.ui.model.FilterOperator.EQ, ComplainCode));
							}
							if (Equipment !== "") {
								aFilters.push(new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, Equipment.padStart(18, 0)));
							}

							this._filterTableInspectionLot(new Filter({
								filters: aFilters,
								and: true
							}));
						},
						onInspectionLotValueHelpOkPress: function (oEvent2) {
							var aTokens = oEvent2.getParameter("tokens");
							that._oInspectionLotMultiInput.setSelectedKey(aTokens[0].getProperty("key"));
							that._oInspectionLotMultiInput.setTokens(aTokens);
							that._oInspectionLotCustVHDialog.close();
							/*	var ItemListTable = Fragment.byId("AddOperationDialog", "idItemListListTable");
								var oItems = ItemListTable.getAggregation("items");
								var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
								var oBindingContexts = that._oInspectionLotMultiInput.getParent().oBindingContexts;
								var path = oBindingContexts["mServiceOrderOperation"].getPath();
								var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
								var Characteristic = oItems[currentIndex].getAggregation("cells")[5];
								var aFilters = [];
								aFilters.push(new sap.ui.model.Filter("InspectionLot", sap.ui.model.FilterOperator.EQ, oSelRowData.InspectionLot));
								var oBinding = Characteristic.getBinding("items");
								oBinding.filter(aFilters, "Application");*/

							// var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
							// var oBindingContexts = that._oInspectionLotMultiInput.getParent().oBindingContexts;
							// var path = oBindingContexts["mServiceOrderOperation"].getPath();
							// var oModel = oBindingContexts["mServiceOrderOperation"].getModel();
							// oModel.setProperty(path + that.constant.InspectionLotBindingPath, oSelRowData);
							// this.fnSubmitButonValidation();
						},
						onInspectionLotValueHelpCancelPress: function () {
							that._oInspectionLotCustVHDialog.close();
						},
						onInspectionLotValueHelpAfterClose: function () {
							that._oInspectionLotCustVHDialog.destroy();
						},
						onSelectMaterial: function (oEvent) {
							if (oEvent.getParameter("selectedRow") !== null) {
								var oSource = oEvent.getSource();
								oSource.setTokens([]);
								var oQuantity = Fragment.byId("AddSubletLabourComponentDialog", "Quantity");
								var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
								var oText = this.formatNameAndValuePair(oSelectedData.MaterialName, oSelectedData.Material)
								var oToken = new sap.m.Token({
									key: oSelectedData.Material,
									text: oText
								});
								oSource.setTokens([oToken]);
								oQuantity.setDescription(oSelectedData.UnitOfMeasure);

								// var oBindingContexts = oEvent.getSource().getParent().oBindingContexts;
								// var path = oBindingContexts["mWorkEstimateComponent"].getPath();
								// var oModel = oBindingContexts["mWorkEstimateComponent"].getModel();
								// oEvent.getSource().setSelectedKey(oSelectedData.Material);
								// var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
								// oModel.setProperty(path + "/MaterialVHData", [oSelectedData]);
								// oModel.setProperty(path + "/ItemCategoryGroup", oSelectedData.ItemCategoryGroup);
								// oModel.setProperty(path + "/Material", oSelectedData.Material);
								// oModel.setProperty(path + "/QuantityUnit", oSelectedData.UnitOfMeasure);
								// oModel.setProperty(path + "/Quantity", "1");
							}
						},
						handleMaterialSuggest: function (oEvent) {
							var pageData = that.getView().getBindingContext().getObject();
							var sTerm = oEvent.getParameter("suggestValue");
							var aFilters = [];
							if (sTerm) {
								aFilters.push(new sap.ui.model.Filter({
									path: "Plant",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.ServiceOrganization
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "DistributionChannel",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.DistributionChannel
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "SalesOrganization",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: pageData.SalesOrganization
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "MaterialType",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: "ZSRV"
								}));
								aFilters.push(new sap.ui.model.Filter({
									path: "ItemCategoryGroup",
									operator: sap.ui.model.FilterOperator.EQ,
									value1: "ZSUB"
								}));
								aFilters.push(new Filter({
									filters: [
										new Filter({
											path: "Material",
											operator: sap.ui.model.FilterOperator.Contains,
											value1: sTerm
										}),
										new Filter({
											path: "MaterialName",
											operator: sap.ui.model.FilterOperator.Contains,
											value1: sTerm
										})

									],
									and: false
								}));
							}
							oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
							oEvent.getSource().getBinding("suggestionRows").resume();
						},
						onProductValueHelpRequested: function (oEvent1) {
							var pageData = that.getView().getBindingContext().getObject();
							var ServiceOrganization = pageData.ServiceOrganization;
							var SalesOrganization = pageData.SalesOrganization;
							var DistributionChannel = pageData.DistributionChannel;
							var input = oEvent1.getSource();
							input.setTokens([]);
							var configObject = {
								entitySet: "ZAE_C_MaterialSalesData_05",
								initiallyVisibleFields: "Material,MaterialGroup,MaterialType,ItemCategoryGroup,UnitOfMeasure",
								selectionMode: "MultiToggle",

								tokenObject: {
									key: "Material",
									Description: "MaterialName"
								},
								controlConfiguration: [{
									index: 0,
									key: "SalesOrganization",
									filterType: "auto",
									label: "SalesOrganization",
									mandatory: "auto",
									visible: false
								}, {
									index: 1,
									key: "DistributionChannel",
									filterType: "auto",
									label: "DistributionChannel",
									mandatory: "auto",
									visible: false
								}, {
									index: 2,
									key: "Material",
									filterType: "auto",
									label: "Material",
									mandatory: "auto",
									visible: true
								}, {
									index: 3,
									key: "MaterialName",
									filterType: "auto",
									label: "{/#ZAE_C_MaterialSalesData_05Type/MaterialName/@sap:label}",
									mandatory: "auto",
									visible: true
								}, {
									index: 4,
									key: "MaterialGroup",
									filterType: "auto",
									label: "Material Group",
									mandatory: "auto",
									visible: true
								}, {
									index: 5,
									key: "MaterialType",
									filterType: "auto",
									label: "Material Type",
									mandatory: "auto",
									visible: true
								}, {
									index: 6,
									key: "Plant",
									filterType: "auto",
									label: "Service Organization",
									mandatory: "auto",
									visible: false
								}],
								defaultFilter: {
									Plant: {
										"items": [{
											"key": ServiceOrganization
										}]
									},
									// DistributionChannel: {
									// 	"items": [{
									// 		"key": DistributionChannel
									// 	}]
									// },
									MaterialType: {
										"items": [{
											"key": "HERB"
										}]
									},
									// SalesOrganization: {
									// 	"items": [{
									// 		"key": SalesOrganization
									// 	}]
									// }
								},
								onBeforeRebindSmartTable: function (oEvent) {
									var aFilterArray = oEvent.getParameter("bindingParams").filters;
									aFilterArray.push(new sap.ui.model.Filter({
										path: "Plant",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: ServiceOrganization
									}));
									aFilterArray.push(new sap.ui.model.Filter({
										path: "DistributionChannel",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: DistributionChannel
									}));
									aFilterArray.push(new sap.ui.model.Filter({
										path: "SalesOrganization",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: SalesOrganization
									}));
									aFilterArray.push(new sap.ui.model.Filter({
										path: "ItemCategoryGroup",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: "ZSUB"
									}));
									oEvent.getParameter("bindingParams").filters = aFilterArray;
									oEvent.getParameter("bindingParams").select = oEvent.getParameter("bindingParams").select + ",MaterialBaseUnit";
								}

							};
							that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
						},
						onMaterailTokenUpdate1: function (oEvent) {
							var aFilters = [];
							var oQuantity = Fragment.byId("AddSubletLabourComponentDialog", "Quantity");
							var aFilters = [];
							aFilters.push(new sap.ui.model.Filter({
								path: "ItemCategoryGroup",
								operator: sap.ui.model.FilterOperator.EQ,
								value1: "ZSUB"
							}));
							if (oEvent.getSource().getTokens().length > 0 && oEvent.getParameter("type") !== "removed") {
								var oBindingContext = oEvent.getSource().getTokens()[0].getCustomData()[0].mProperties["value"];
								oQuantity.setDescription(oBindingContext.UnitOfMeasure);
							} else {
								oQuantity.setDescription("");
							}
							this.fnSubmitButonValidation();
						},
						onChangeOperationsQty: function (oEvent) {
							var oValue = oEvent.getSource().getValue();
							oValue = parseFloat(oValue);
							if (isNaN(oValue) || oValue <= 0) {
								oEvent.getSource().setValueState("Error");
							} else {
								oEvent.getSource().setValueState("None");
							}
							this.fnSubmitButonValidation();
						}

					}
				}).then(function (DialogContent) {
					that._AddSubletLabourComponentsDialog = DialogContent;
					that.getView().addDependent(that._AddSubletLabourComponentsDialog);
					that._initAddSubletLabourComponentsDialog();
					that._AddSubletLabourComponentsDialog.attachBrowserEvent("keyup", function (e) {
						if (e.which == 27 || e.keyCode == 27) {
							that._fnLockAddComponent(false);
						}
					}.bind(this));
				});
			} else {
				that._initAddSubletLabourComponentsDialog();
			}
		},
		_initAddSubletLabourComponentsDialog: function () {
			var that = this;
			var aFilters = [];
			var ButtonID = "SSOD_B149"
			Fragment.byId("AddSubletLabourComponentDialog", "idAddSubletComponentTable").removeSelections();
			Fragment.byId("AddSubletLabourComponentDialog", "BTNSubmit").setEnabled(false);
			Fragment.byId("AddSubletLabourComponentDialog", "searchField").setValue("");
			var pageData = that.getView().getBindingContext().getObject();
			// var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			// if (selSecData instanceof Array) {
			// 	var dialog = new Dialog({
			// 		title: 'Warning',
			// 		type: 'Message',
			// 		state: 'Warning',
			// 		content: new Text({
			// 			text: 'Multiple Selection Not allowed'
			// 		}),
			// 		beginButton: new Button({
			// 			type: ButtonType.Emphasized,
			// 			text: 'OK',
			// 			press: function () {
			// 				dialog.close();
			// 			}
			// 		}),
			// 		afterClose: function () {
			// 			dialog.destroy();
			// 		}
			// 	});
			// 	dialog.open();
			// 	return;
			// }
			var aComplaintFilters = [];
			aComplaintFilters.push(new Filter({
				filters: [
					new Filter({
						path: "ServiceObjectType",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: 'BUS2000223'
					}),
					new Filter({
						path: "ServiceRequest",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: pageData.ServiceRequest
					})

				],
				and: true
			}));
			aComplaintFilters.push(new Filter({
				filters: [
					new Filter({
						path: "CheckListOption",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "YES"
					}),
					new Filter({
						path: "CheckListOption",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "ZC000001"
					})

				],
				and: false
			}));
			Fragment.byId("AddSubletLabourComponentDialog", "ComplaintCode").getBinding("items").filter(aComplaintFilters);

			var aFiltersApp = [];
			aFiltersApp.push(new Filter('SalesOffice', 'EQ', pageData.SalesOffice));
			aFiltersApp.push(new Filter('SalesGroup', 'EQ', pageData.SalesGroup));
			aFiltersApp.push(new Filter('ProcessType', 'EQ', pageData.ServiceDocumentType));
			Fragment.byId("AddSubletLabourComponentDialog", "ServiceType").getBinding("items").filter(aFiltersApp);

			var aFiltersItemCar = [];
			aFiltersItemCar.push(new Filter('TransactionType', 'EQ', pageData.ServiceDocumentType));
			aFiltersItemCar.push(new Filter("ItemCategoryGroup", "EQ", "ZSUB"));
			Fragment.byId("AddSubletLabourComponentDialog", "ItemCategory").getBinding("items").filter(aFiltersItemCar);

			var oTableBinding = Fragment.byId("AddSubletLabourComponentDialog", "idAddSubletComponentTable");
			aFilters.push(new sap.ui.model.Filter({
				path: "Plant",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.ServiceOrganization
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "DistributionChannel",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.DistributionChannel
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "SalesOrganization",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.SalesOrganization
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "TransactionType",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.ServiceDocumentType
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "SalesOffice",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.SalesOffice
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "SalesGroup",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.SalesGroup
			}));
			oTableBinding.getBinding("items").filter(aFilters);
			oTableBinding.getItems().forEach(function (obj) {
				let oObject = obj.getBindingContext().getObject();
				obj.getCells()[2].setValue("");
				obj.getCells()[4].setValue(oObject["Cost"]);
				obj.getCells()[5].setValue(oObject["SalesPrice"]);
				obj.getCells()[6].setSelectedKey();
				obj.getCells()[1].setEnabled(false);
			});
			if (oTableBinding.getItems().length > 0) {
				oTableBinding.rerender();
			}
			// var Materials = Fragment.byId("AddSubletLabourComponentDialog", "idMaterial");
			// Materials.setTokens([]);

			Fragment.byId("AddSubletLabourComponentDialog", "opMaterial").setTokens([]);
			Fragment.byId("AddSubletLabourComponentDialog", "InspectionLot").setTokens([]);
			Fragment.byId("AddSubletLabourComponentDialog", "Quantity").setValue("");
			Fragment.byId("AddSubletLabourComponentDialog", "Quantity").setValueState("None");
			Fragment.byId("AddSubletLabourComponentDialog", "Quantity").setDescription("");
			Fragment.byId("AddSubletLabourComponentDialog", "Quantity").setValue("1");
			Fragment.byId("AddSubletLabourComponentDialog", "ComplaintCode").setSelectedKey("");
			Fragment.byId("AddSubletLabourComponentDialog", "ServiceType").setSelectedKey("");
			Fragment.byId("AddSubletLabourComponentDialog", "Severity").setSelectedKey("");
			that.oMouseMove = false;
			that._fnGetMaterialDescription();
			that._fnLockAddComponent(true, ButtonID);
			$(document).mousemove(function () {
				if (!that.oMouseMove) {
					that.resetSessionTimeout(true);
				}
			});

			$(document).keypress(function (e) {
				if (!that.oMouseMove) {
					that.resetSessionTimeout(true);
				}
			});

			that.resetSessionTimeout(true);
			// this._AddSubletLabourComponentsDialog.open();
		},
		_fnGetMaterialDescription: function (oEvent) {
			var that = this;
			var oMaterial = Fragment.byId("AddSubletLabourComponentDialog", "opMaterial");
			if (oMaterial) {
				oMaterial.setBusy(true);
				this.getView().getModel().read("/ZAE_I_Material_09('SUBLET')", {
					urlParameters: {
						$expand: ["to_MaterialText"]
					},
					success: function (oData) {
						oMaterial.setBusy(false);
						var oToken = new sap.m.Token({
							key: oData["Material"],
							text: that.formatNameAndValuePair(oData.to_MaterialText.MaterialName, oData["Material"])
						});
						oMaterial.setTokens([oToken]);
						Fragment.byId("AddSubletLabourComponentDialog", "Quantity").setDescription(oData.MaterialBaseUnit);
					},
					error: function (oResponse) {
						oMaterial.setBusy(false);
					}
				});
			}
		},
		onClickSSOD_B156: function (oEvent) {
			var that = this;
			that.oITFacetAddItemButton = oEvent.getSource();
			if (!that._AddTaskListDialog) {
				Fragment.load({
					id: "TaskListDialog",
					name: "com.globalintelli.zae_ssod.ext.fragment.AddTaskList",
					controller: {

						OnSelect: function (oEvent) {
							var oData = [];
							var Selecetd = oEvent.getSource().getSelectedItems();
							if (Selecetd.length > 0) {
								Fragment.byId("TaskListDialog", "BTNSubmit").setEnabled(true);
							} else {
								Fragment.byId("TaskListDialog", "BTNSubmit").setEnabled(false);
							}
						},
						onSubmit: function () {
							var actId = "SSOD_B156";
							var actLabel = that.aeUtil.geti18nText(that, actId);
							var oModel = that.getView().getModel();
							var oEntity = "ZAE_FM_SSOD_ADD_ITEMS_TASKLISTSet";
							var pageData = that.getView().getBindingContext().getObject();
							var catId = Fragment.byId("TaskListDialog", "idItemListListTable").getSelectedItem().getBindingContext().getObject().Category;
							var data = [{
								callProperty: "ServiceOrder",
								value: pageData.ServiceOrder
							}, {
								callProperty: "CatId",
								value: catId
							}];

							var succFunc = function (oData, response) {
								that.extensionAPI.refresh();
							}.bind(this);
							var errorFunc = function (oData) {
								that.extensionAPI.refresh();
							}.bind(this);
							that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, errorFunc);
							that._AddTaskListDialog.close();
						},

						onCancel: function () {
							that._AddTaskListDialog.close();
						}
					}
				}).then(function (oValueHelpDialogContent) {
					that._AddTaskListDialog = oValueHelpDialogContent;
					that.getView().addDependent(that._AddTaskListDialog);
					that._initAddItemTableDialog1("INIT");
				});
			} else {
				that._initAddItemTableDialog1("INIT");
			}
		},
		_initAddItemTableDialog1: function (form) {
			var that = this;
			Fragment.byId("TaskListDialog", "idItemListListTable").removeSelections();
			Fragment.byId("TaskListDialog", "BTNSubmit").setEnabled(false);
			var oDataInitial = {
				TableData: []
			};
			var pageData = this.getView().getBindingContext().getObject();
			var BillingRule = Fragment.byId("TaskListDialog", "idItemListListTable");
			var oBinding = BillingRule.getBinding("items");
			var aServiceDocumentType = [];
			aServiceDocumentType.push(new Filter("ServiceRequest", sap.ui.model.FilterOperator.EQ, +" " + pageData.ServiceRequest + " "));
			aServiceDocumentType.push(new Filter("UserStatus", sap.ui.model.FilterOperator.EQ, "E0004"));
			oBinding.filter(aServiceDocumentType);

			if (form === "INIT") {
				that._AddTaskListDialog.open();
			}

		},

		onClickSSOD_B157: function () {
			var oTableCR = this.getView().byId(this.createId("CRFacet::responsiveTable"));
			if (oTableCR) {
				this.ItemPricingSummaryTab = true;
				oTableCR.getParent().rebindTable();
				oTableCR.getParent().setInitialNoDataText("No Data Found");
			}
		},
		onClickSSOD_B158: function () {
			var oTableCRR = this.getView().byId(this.createId("CCRFacet::responsiveTable"));
			if (oTableCRR) {
				this.CompPricingSummaryTab = true;
				oTableCRR.getParent().rebindTable();
				oTableCRR.getParent().setInitialNoDataText("No Data Found");
			}
		},
		//Change Sold to party
		onClickSSOD_B159: function (oEvent) {
			var pageData = this.getView().getBindingContext().getObject();
			if (!this._oUpdateSoldtoPartyDialog) {
				Fragment.load({
						id: "idUpdatePartnerDialog1",
						name: "com.globalintelli.zae_ssod.ext.fragment.ChangeSoldToParty",
						controller: this
					})
					.then(function (oPartnerDialogContent) {
						this._createUpdateSoldtoPartyDialog(oPartnerDialogContent);
						this._setUpdateSoldtoPartyDialogInitialState(pageData);
					}.bind(this));
			} else {
				this._setUpdateSoldtoPartyDialogInitialState(pageData);
			}
		},
		_createUpdateSoldtoPartyDialog: function (oPartnerDialogContent) {
			var that = this;
			this._oUpdateSoldtoPartyDialog = new Dialog({
				title: "{i18n>SSOD_B159}",
				width: "640px",
				content: [
					oPartnerDialogContent
				],
				buttons: [
					new Button({
						text: "Submit",
						press: function () {
							var MessageStrip = Fragment.byId("idUpdatePartnerDialog1", "SSOD_B156MessageStrip");
							var pageData = this.getView().getBindingContext().getObject();
							var actId = 'SSOD_B159';
							var actLabel = this.aeUtil.geti18nText(that, actId);
							var oModel = this.getView().getModel();
							var oEntity = "ZAE_FM_SSOD_UPD_SOLD_TO_PARTYSet";
							var oPartnerInput = Fragment.byId("idUpdatePartnerDialog1", "idPartnerInput").getValue();
							var regex = /\(([^)]+)\)/;
							var BPValue = oPartnerInput.match(regex);
							if (oPartnerInput === undefined || oPartnerInput === '') {
								var msg = "Kindly Select Partner"
								var oMessageStrip = Fragment.byId("idUpdatePartnerDialog1", "SSOD_B159MessageStrip");
								oMessageStrip.setVisible(true);
								oMessageStrip.setText(msg);
								return;
							}
							var data = [{
								callProperty: "ObjectId",
								value: pageData.ServiceOrder
							}, {
								callProperty: "Partner",
								value: BPValue[1]
							}];
							var succFunc = function (oData, response) {
								this.extensionAPI.refresh();
							}.bind(this);
							this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
							this._oUpdateSoldtoPartyDialog.close();
						}.bind(this)
					}),
					new Button({
						text: "Close",
						press: function () {
							this._oUpdateSoldtoPartyDialog.close();
						}.bind(this)
					})
				]
			});
			this.getView().addDependent(this._oUpdateSoldtoPartyDialog);
		},
		_setUpdateSoldtoPartyDialogInitialState: function (pageData) {
			Fragment.byId("idUpdatePartnerDialog1", "idPartnerInput").setValue('');
			Fragment.byId("idUpdatePartnerDialog1", "SSOD_B159MessageStrip").setVisible(false);
			this._oUpdateSoldtoPartyDialog.open();
		},
		onSearchPartnerValueHelp1: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			/*			var oFilter1 = new sap.ui.model.Filter("BusinessPartner", sap.ui.model.FilterOperator.Contains, "'" + sValue + "'");
						var oFilter2 = new sap.ui.model.Filter("BusinessPartnerName", sap.ui.model.FilterOperator.Contains, "'" + sValue + "'");*/
			var oFilter1 = new sap.ui.model.Filter("BusinessPartner", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter2 = new sap.ui.model.Filter("BusinessPartnerName", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: false
			});
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},
		onCancelPartnerValueHelp1: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			// oDialog.close();
			//	this._valueHelpDialog1.close();
		},
		onShowPartnerValueHelpDialogClose1: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var Partner = Fragment.byId("idUpdatePartnerDialog1", "idPartnerInput");
				var SelPartner = this.formatNameAndValuePair(oSelectedItem.getDescription(), oSelectedItem.getTitle());
				Partner.setValue(SelPartner);
			}
		},
		onShowPartnerVH1: function () {
			var that = this;
			var pageData = that.getView().getBindingContext().getObject();
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("SalesOrganization", sap.ui.model.FilterOperator.EQ, pageData.SalesOrganization));
			aFilters.push(new sap.ui.model.Filter("DistributionChannel", sap.ui.model.FilterOperator.EQ, pageData.DistributionChannel));
			aFilters.push(new sap.ui.model.Filter("Division", sap.ui.model.FilterOperator.EQ, pageData.Division));
			var oPartnerTemplate = new sap.m.StandardListItem({
				title: "{BusinessPartner}",
				description: "{BusinessPartnerName}",
				type: "Active"

			});
			if (!this._valueHelpDialog1) {
				Fragment.load({
						id: "valueHelpDialogFragment",
						name: "com.globalintelli.zae_ssod.ext.fragment.SoldtoPartyVH",
						controller: that
					})
					.then(function (oValueHelpDialogContent) {
						that._valueHelpDialog1 = oValueHelpDialogContent
						that._valueHelpDialog1.open();
						that._valueHelpDialog1.setModel(that.getView().getModel());
						that._valueHelpDialog1.bindAggregation("items", {
							path: '/ZAE_I_BusinessPartner_03',
							template: oPartnerTemplate,
							filters: aFilters
						});

					});
			} else {
				this._valueHelpDialog1.open();
				this._valueHelpDialog1.bindAggregation("items", {
					path: '/ZAE_I_BusinessPartner_03',
					template: oPartnerTemplate,
					filters: aFilters
				});
			}
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
		onClickSSOD_B160: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			var actId = "SSOD_B160";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.EditCompDesc";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SC_EDIT_OP_DESCSet";
			var oLocalModel = new JSONModel();
			oLocalModel.setData({
				CompDesc: selSecData.ServiceDocumentItemDescription
			});
			this.getView().setModel(oLocalModel, "mCompDesc");
			if (selSecData instanceof Array) {
				sap.m.MessageBox.error("Please select single Component");
				return;
			}
			var dialogFields = [{
				fragInputId: "CompDescInput",
				fragInputLabel: this.aeUtil.geti18nText(that, "CompDescInput"),
				callProperty: "OpDesc"
			}];
			var data = [{
				callProperty: "ObjectId",
				value: selSecData.ServiceOrder
			}, {
				callProperty: "NumberInt",
				value: selSecData.ServiceOrderOperation
			}];
			var checkFucc = function () {
				return {
					pass: true
				};

			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);

			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, succFunc);
		},
		onClickSSOD_B161: function (oEvent) {
			var that = this;
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			if (selSecData instanceof Array) {
				this.oTempMessageDialog = new sap.m.Dialog({
					type: sap.m.DialogType.Message,
					title: "Information",
					state: sap.ui.core.ValueState.Information,
					content: new Text({
						text: "Multiple Selection Not Allowed"
					}),
					endButton: new Button({
						type: sap.m.ButtonType.Default,
						text: "Cancel",
						press: function () {
							this.oTempMessageDialog.close();
						}.bind(this)
					})
				});
				this.oTempMessageDialog.open();
				return;
			}
			var pageData = this.getView().getBindingContext().getObject();
			var oSource = oEvent.getSource();
			if (!this._ReplacePartDialog) {
				Fragment.load({
						id: "fragReplacePart",
						name: "com.globalintelli.zae_ssod.ext.fragment.ReplacePart",
						controller: {
							onProductValueHelpRequestedReplacePart: function (oEvent1) {
								var pageData = that.getView().getBindingContext().getObject();
								var ServiceOrganization = pageData.ServiceOrganization;
								var SalesOrganization = pageData.SalesOrganization;
								var DistributionChannel = pageData.DistributionChannel;
								var input = oEvent1.getSource();
								input.setTokens([]);
								var configObject = {
									entitySet: "ZAE_VH_MatSalesSupersession",
									initiallyVisibleFields: "Material,MaterialGroup,MaterialType,ItemCategoryGroup,UnitOfMeasure",
									selectionMode: "Single",

									tokenObject: {
										key: "Material",
										Description: "MaterialName"
									},
									controlConfiguration: [{
										index: 0,
										key: "SalesOrganization",
										filterType: "auto",
										label: "SalesOrganization",
										mandatory: "auto",
										visible: false
									}, {
										index: 1,
										key: "DistributionChannel",
										filterType: "auto",
										label: "DistributionChannel",
										mandatory: "auto",
										visible: false
									}, {
										index: 2,
										key: "Material",
										filterType: "auto",
										label: "Material",
										mandatory: "auto",
										visible: true
									}, {
										index: 3,
										key: "MaterialName",
										filterType: "auto",
										label: "{/#ZAE_VH_MatSalesSupersessionType/MaterialName/@sap:label}",
										mandatory: "auto",
										visible: true
									}, {
										index: 4,
										key: "MaterialGroup",
										filterType: "auto",
										label: "Material Group",
										mandatory: "auto",
										visible: true
									}, {
										index: 5,
										key: "MaterialType",
										filterType: "auto",
										label: "MaterialType",
										mandatory: "auto",
										visible: true
									}, {
										index: 6,
										key: "Plant",
										filterType: "auto",
										label: "Service Organization",
										mandatory: "auto",
										visible: false
									}],
									defaultFilter: {
										Plant: {
											"items": [{
												"key": ServiceOrganization
											}]
										},
										MaterialType: {
											"items": [{
												"key": "ZPRT"
											}]
										},
									},
									onBeforeRebindSmartTable: function (oEvent) {
										var aFilterArray = oEvent.getParameter("bindingParams").filters;
										aFilterArray.push(new sap.ui.model.Filter({
											path: "Plant",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: ServiceOrganization
										}));
										aFilterArray.push(new sap.ui.model.Filter({
											path: "DistributionChannel",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: DistributionChannel
										}));
										aFilterArray.push(new sap.ui.model.Filter({
											path: "SalesOrganization",
											operator: sap.ui.model.FilterOperator.EQ,
											value1: SalesOrganization
										}));
										oEvent.getParameter("bindingParams").filters = aFilterArray;
									}

								};
								that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
							},
							onMaterailTokenUpdateReplacePart: function (oEvent) {
								var selSecData = that.aeUtil.getSecData(that, "CPFacet");
								var aTokens = oEvent.getSource().getTokens();
								var ItemsTable = that.getView().byId(that.getView().createId("CPFacet" + "::Table")).getTable().getItems();
								var QtyValue = Fragment.byId("fragReplacePart", "QuantityId").getValue();
								if (aTokens.length === 0 || oEvent.getParameters().type === "removed") {
									oEvent.getSource().setSelectedKey("");
									Fragment.byId("fragReplacePart", "BTNSubmit").setEnabled(false);
								} else if (aTokens.length > 0 && QtyValue !== "") {
									Fragment.byId("fragReplacePart", "BTNSubmit").setEnabled(true);
								}

							},
							onSelectMaterialReplacePart: function (oEvent) {
								if (oEvent.getParameter("selectedRow") !== null) {
									var selSecData = that.aeUtil.getSecData(that, "CPFacet");
									var ItemsTable = that.getView().byId(that.getView().createId("CPFacet" + "::Table")).getTable().getItems();
									var oSource = oEvent.getSource();
									oSource.setTokens([]);
									var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
									var oText = this.formatNameAndValuePair(oSelectedData.MaterialName, oSelectedData.Material)
									var oToken = new sap.m.Token({
										key: oSelectedData.Material,
										text: oText
									});
									oSource.setTokens([oToken]);
								}
							},
							handleMaterialSuggestReplacePart: function (oEvent) {
								var pageData = that.getView().getBindingContext().getObject();
								var sTerm = oEvent.getParameter("suggestValue");
								var aFilters = [];
								if (sTerm) {
									aFilters.push(new sap.ui.model.Filter({
										path: "Plant",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.ServiceOrganization
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "DistributionChannel",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.DistributionChannel
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "SalesOrganization",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: pageData.SalesOrganization
									}));
									aFilters.push(new sap.ui.model.Filter({
										path: "MaterialType",
										operator: sap.ui.model.FilterOperator.EQ,
										value1: "ZPRT"
									}));
									aFilters.push(new Filter({
										filters: [
											new Filter({
												path: "Material",
												operator: sap.ui.model.FilterOperator.Contains,
												value1: sTerm
											}),
											new Filter({
												path: "MaterialName",
												operator: sap.ui.model.FilterOperator.Contains,
												value1: sTerm
											})

										],
										and: false
									}));
								}
								oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
								oEvent.getSource().getBinding("suggestionRows").resume();
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

							onSubmit: function () {
								var actId = "SSOD_B161";
								var actLabel = that.aeUtil.geti18nText(that, actId);
								var oModel = that.getView().getModel();
								var oEntity = "ZAE_FM_SSOD_REPLACE_PARTSet";
								var pageData = that.getView().getBindingContext().getObject();
								var selSecData = that.aeUtil.getSecData(that, "CPFacet");
								var Material = Fragment.byId("fragReplacePart", "MaterialId").getTokens()[0].getKey();
								var Qty = Fragment.byId("fragReplacePart", "QuantityId").getValue();

								var data = [{
									callProperty: "ObjectId",
									value: selSecData.ServiceOrder
								}, {
									callProperty: "NumberInt",
									value: selSecData.ServiceOrderOperation
								}, {
									callProperty: "Material",
									value: Material
								}, {
									callProperty: "Qty",
									value: Qty
								}];
								var succFunc = function (oData, response) {
									that.extensionAPI.refresh();
									//	that.aeUtil.refreshControlModel(oSource);
								}.bind(this);
								that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
								that._ReplacePartDialog.close();
							},
							fnSubmitButonValidationReplacePart: function (oEvent) {
								var QtyValue = oEvent.getSource().getValue();
								var Material = Fragment.byId("fragReplacePart", "MaterialId").getTokens()[0];
								var BoolenCheck = false;
								if (QtyValue < 0) {
									oEvent.getSource().setValueState("Error");
								} else {
									oEvent.getSource().setValueState("None");
								}
								if (Material && Material.getKey() !== "" && QtyValue !== "" && QtyValue > 0) {
									BoolenCheck = true;
								}
								Fragment.byId("fragReplacePart", "BTNSubmit").setEnabled(BoolenCheck);
							},
							onCancel: function () {
								that._ReplacePartDialog.close();
							},

						}
					})
					.then(function (oDialogContent) {
						that._ReplacePartDialog = oDialogContent;
						that.getView().addDependent(that._ReplacePartDialog);
						that._setReplacePartInitialState();
					}.bind(that));

			} else {
				this._setReplacePartInitialState();
			}
		},
		_setReplacePartInitialState: function () {
			Fragment.byId("fragReplacePart", "MaterialId").setTokens([]);
			Fragment.byId("fragReplacePart", "QuantityId").setValue("");
			Fragment.byId("fragReplacePart", "QuantityId").setValueState("None")
			Fragment.byId("fragReplacePart", "BTNSubmit").setEnabled(false);
			var actId = "SSOD_B154";
			var actLabel = this.getView().getModel("i18n").getResourceBundle().getText(actId);
			this._ReplacePartDialog.setTitle(actLabel);
			this._ReplacePartDialog.open();
		},
		//Update Employee Responsible
		onClickSSOD_B162: function (oEvent) {
			var pageData = this.getView().getBindingContext().getObject();
			if (!this._oUpdateEmpRespDialog) {
				Fragment.load({
						id: "idUpdateEmpResDialog",
						name: "com.globalintelli.zae_ssod.ext.fragment.UpdateEmployeeResponsible",
						controller: this
					})
					.then(function (oPartnerDialogContent) {
						this._createUpdateEmpRespDialog(oPartnerDialogContent);
						this._setUpdateEmpRespDialogInitialState(pageData);
					}.bind(this));
			} else {
				this._setUpdateEmpRespDialogInitialState(pageData);
			}
		},
		_createUpdateEmpRespDialog: function (oPartnerDialogContent) {
			var that = this;
			this._oUpdateEmpRespDialog = new Dialog({
				title: "{i18n>SSOD_B162}",
				width: "640px",
				content: [
					oPartnerDialogContent
				],
				buttons: [
					new Button({
						text: "Submit",
						press: function () {
							var MessageStrip = Fragment.byId("idUpdateEmpResDialog", "SSOD_B162MessageStrip");
							var pageData = this.getView().getBindingContext().getObject();
							var actId = 'SSOD_B162';
							var actLabel = this.aeUtil.geti18nText(that, actId);
							var oModel = this.getView().getModel();
							var oEntity = "ZAE_FM_SRV_UPDATE_EMP_RESPSet";
							var oPartnerInput = Fragment.byId("idUpdateEmpResDialog", "idEmpResp").getValue();
							var regex = /\(([^)]+)\)/;
							var BPValue = oPartnerInput.match(regex);
							if (oPartnerInput === undefined || oPartnerInput === '') {
								var msg = "Kindly Select Partner to update"
								var oMessageStrip = Fragment.byId("idUpdateEmpResDialog", "SSOD_B162MessageStrip");
								oMessageStrip.setVisible(true);
								oMessageStrip.setText(msg);
								return;
							}
							var data = [{
								callProperty: "ObjectId",
								value: pageData.ServiceOrder
							}, {
								callProperty: "EmpResp",
								value: BPValue[1]
							}];
							var succFunc = function (oData, response) {
								this.extensionAPI.refresh();
							}.bind(this);
							this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
							this._oUpdateEmpRespDialog.close();
						}.bind(this)
					}),
					new Button({
						text: "Close",
						press: function () {
							this._oUpdateEmpRespDialog.close();
						}.bind(this)
					})
				]
			});
			this.getView().addDependent(this._oUpdateEmpRespDialog);
		},
		_setUpdateEmpRespDialogInitialState: function (pageData) {
			Fragment.byId("idUpdateEmpResDialog", "idEmpResp").setValue('');
			Fragment.byId("idUpdateEmpResDialog", "SSOD_B162MessageStrip").setVisible(false);
			this._oUpdateEmpRespDialog.open();
		},
		onSearchEmpRespValueHelp: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter1 = new sap.ui.model.Filter("BusinessPartner", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter2 = new sap.ui.model.Filter("BusinessPartnerName", sap.ui.model.FilterOperator.Contains, sValue);
			var oFilter = new sap.ui.model.Filter({
				filters: [oFilter1, oFilter2],
				and: false
			});
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},
		onCancelEmpRespValueHelp: function (oEvent) {
			var oDialog = oEvent.getSource().getParent();
			oDialog.destroy();
		},
		onShowEmpRespValueHelpDialogClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var Partner = Fragment.byId("idUpdateEmpResDialog", "idEmpResp");
				var SelPartner = this.formatNameAndValuePair(oSelectedItem.getDescription(), oSelectedItem.getTitle());
				Partner.setValue(SelPartner);
			}
		},
		onShowEmpRespVH: function () {
			var that = this;
			var oPartnerTemplate = new sap.m.StandardListItem({
				title: "{BusinessPartner}",
				description: "{BusinessPartnerName}",
				type: "Active"

			});
			if (!this._valueHelpDialog) {
				Fragment.load({
						id: "valueHelpDialogFragment",
						name: "com.globalintelli.zae_ssod.ext.fragment.EmployeeResponsibleVH",
						controller: that
					})
					.then(function (oValueHelpDialogContent) {
						oValueHelpDialogContent.open();
						oValueHelpDialogContent.setModel(that.getView().getModel());
						oValueHelpDialogContent.bindAggregation("items", {
							path: '/ZAE_VH_BusinessPartner_02',
							template: oPartnerTemplate
						});

					});
			} else {
				this._valueHelpDialog.open();
				this._valueHelpDialog.bindAggregation("items", {
					path: '/ZAE_VH_BusinessPartner_02',
					template: oPartnerTemplate
				});
			}
		},
		//start by nanda 
		onClickSSOD_B163: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.getView().getBindingContext().getObject();
			var selSecData = this.aeUtil.getSecData(that, "OPFacet");
			var actId = "SSOD_B163";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var fragName = "com.globalintelli.zae_ssod.ext.fragment.UpdSrvDetails";
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_UPD_SRV_DETAILSSet";
			var oLocalModel = new JSONModel();
			if (selSecData instanceof Array) {
				sap.m.MessageBox.error("Please select single Component");
				return;
			}
			var dialogFields = [{
				fragInputId: "CatID",
				fragInputLabel: this.aeUtil.geti18nText(that, "CatID"),
				vhEntitySet: "ZAE_VH_Service_Category_ID",
				vhEntitySetFilter: [{
					path: 'ServiceRequest',
					operator: 'EQ',
					value1: pageData.ServiceRequest
				}],
				vhSearchKey: "CatId",
				vhSearchText: "CatId",
				callProperty: "CatId"
			}];
			var data = [{
				callProperty: "ServiceOrder",
				value: selSecData.ServiceOrder
			}, {
				callProperty: "Operation",
				value: selSecData.ServiceOrderOperation
			}];
			var checkFucc = function () {
				return {
					pass: true
				};
			}.bind(this);
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.dialogCreateCall(that, actId, actLabel, fragName, oModel, oEntity, dialogFields, data, checkFucc, succFunc, succFunc);
		},
		//added by nanda end
		boldText: function (sText) {
			return new HTML("<b>" + sText + "</b>");
		},
		onClickSSOD_B164: function (oEvent) {

			var that = this;
			var oSource = oEvent.getSource();
			var pageData = this.aeUtil.getPageData(oEvent);
			var actId = "SSOD_B164";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_RESET_STATUS_INVSet";
			var data = [{
				callProperty: "ObjectId",
				value: pageData.ServiceOrder
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		//Reset Accounting Indicator - CP facet
		onClickSSOD_B165: function (oEvent) {
			var that = this;
			var oSource = oEvent.getSource();
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			if (selSecData instanceof Array) {
				var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("MultipleNotAllowed");
				sap.m.MessageBox.error(msg1);
				return;
			}
			var actId = "SSOD_B165";
			var actLabel = this.aeUtil.geti18nText(that, actId);
			var oModel = oSource.getModel();
			var oEntity = "ZAE_FM_SSOD_ACC_IND_REMOVESet";
			var data = [{
				callProperty: "ObjectId",
				value: selSecData.ServiceOrder
			}, {
				callProperty: "NumberInt",
				value: selSecData.ServiceOrderOperation
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			this.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc);

		},
		//Reserve Stock
		onClickSSOD_B166: function (oEvent) {
			var that = this;
			var actId = "SSOD_B166";
			var oSource = oEvent.getSource();
			var actLabel = that.aeUtil.geti18nText(that, actId);
			var oModel = that.getView().getModel("ReserveStock");
			var oEntity = "ZAE_FM_SSOD_ITEM_RESERVE_STOCKSet";
			var pageData = that.getView().getBindingContext().getObject();
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			var NavMain = [{
				"ObjectId": pageData.ServiceOrder
			}];
			var NavItems = [];
			if (selSecData instanceof Array) {
				for (var i = 0; i < selSecData.length; i++) {
					NavItems.push({
						"NumberInt": selSecData[i].ServiceOrderOperation
					});
				}
			} else {
				NavItems.push({
					"NumberInt": selSecData.ServiceOrderOperation
				});
			}
			var data = [{
				callProperty: "NavMain",
				value: NavMain
			}, {
				callProperty: "NavItems",
				value: NavItems
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
		},
		//Dereserve Stock
		onClickSSOD_B167: function (oEvent) {
			var that = this;
			var actId = "SSOD_B167";
			var oSource = oEvent.getSource();
			var actLabel = that.aeUtil.geti18nText(that, actId);
			var oModel = that.getView().getModel("DeReserveStock");
			var oEntity = "ZAE_FM_SSOD_DERESERVE_STOCKSet";
			var pageData = that.getView().getBindingContext().getObject();
			var selSecData = this.aeUtil.getSecData(that, "CPFacet");
			var NavMain = [{
				"ObjectId": pageData.ServiceOrder
			}];
			var NavItems = [];
			if (selSecData instanceof Array) {
				for (var i = 0; i < selSecData.length; i++) {
					NavItems.push({
						"NumberInt": selSecData[i].ServiceOrderOperation
					});
				}
			} else {
				NavItems.push({
					"NumberInt": selSecData.ServiceOrderOperation
				});
			}
			var data = [{
				callProperty: "NavMain",
				value: NavMain
			}, {
				callProperty: "NavItems",
				value: NavItems
			}];
			var succFunc = function (oData, response) {
				this.extensionAPI.refresh();
			}.bind(this);
			that.aeUtil.createCall(that, actId, actLabel, oModel, oEntity, data, succFunc, succFunc);
		},

	});

});