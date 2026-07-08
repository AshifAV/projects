sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/m/library",
	"com/globalintelli/zae_flib/controller/aeUI5Utility",
	"com/globalintelli/zae_flib/controller/aeUtility/",
	"sap/m/MessageToast",
	"sap/ui/core/format/DateFormat",
	"com/globalintelli/ZAE_MMSA/util/treeFunctions",
	"sap/ui/core/Fragment",
	'sap/m/SearchField',
	'sap/m/Token',
	'sap/ui/model/type/String',
	'sap/m/ColumnListItem',
	"sap/m/Dialog",
	"sap/m/Button",
	'sap/m/Text',
	'sap/m/ButtonType',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function (BaseController, JSONModel, formatter, mobileLibrary, aeUI5Utility, aeUtility, MessageToast, DateFormat, treeFunctions,
	Fragment,
	SearchField, Token,
	typeString, ColumnListItem, Dialog, Button, Text, ButtonType, Filter, FilterOperator) {
	"use strict";

	// shortcut for sap.m.URLHelper
	var URLHelper = mobileLibrary.URLHelper;

	return BaseController.extend("com.globalintelli.ZAE_MMSA.controller.Detail", {

		formatter: formatter,

		aeUI5Util: new aeUI5Utility(),
		treeFunctions: new treeFunctions(),
		aeUtil: new aeUtility(),

		constant: {
			MaterialPath: "/MaterialVHData"
		},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {

			this.aeUI5Util.setupMessageManager(this);
			this.aeUI5Util.resetLibrary();
			this.treeFunctions.restLibrary();
			this.aeUtil.resetLibrary();
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				IsNextenabled: false,
				IsSubmitenabled: false,

				SchemaTransactionType: {},
				customerInfo: {},
				ConcatinatedCategorizationSchemaTreeTableData: [],
				TotalAmount: 0,
				SummaryList: [],
				vServiceRequset: "",
				_MeasuringDocument: [],
				_EquipmentMeasuringPoint: [],
				_ServiceComplaint: [],
				vComplaints: [],
				VisibleData: [],
				nItemData: []
			});

			var oViewModelEdit = new JSONModel({
				editable: true

			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");
			this.setModel(oViewModelEdit, "detailViewEdit");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			//	this.onNextButtoncheck();

			this.getView().byId("btnSubmit").setVisible(false);

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onSendEmailPress: function () {
			var oViewModel = this.getModel("detailView");

			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {

			var sObjectId = oEvent.getParameter("arguments").objectId;
			// var sObjectType = oEvent.getParameter("arguments").objectType;
			var sProcessType = oEvent.getParameter("arguments").ProcessType;
			// var sVehicleStatus = oEvent.getParameter("arguments").VehicleStatus;
			// var SalesGroup = oEvent.getParameter("arguments").SalesGroup;
			// var SalesOffice = oEvent.getParameter("arguments").SalesOffice;
			// var SalesOrg = oEvent.getParameter("arguments").SalesOrg;
			var mdetailView = this.getModel("detailView");

			this.onNextButtoncheck();
			mdetailView.setProperty("/SummaryList", []);
			mdetailView.setProperty("/vComplaints", []);
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("ZAE_I_ServiceRequest_03", {
					ServiceRequest: sObjectId,
					ServiceObjectType: "BUS2000223"
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
			var WorkList = sProcessType === "ZSRW" ? "to_WorkList2" : "to_WorkList";
			this.getView().byId("idPreviousmesauringKMS").setBusy(true);
			this.getView().byId("idPreviousmesauringHRS").setBusy(true);
			this.getView().getModel().read("/ZAE_I_ServiceRequest_03(ServiceObjectType='BUS2000223',ServiceRequest='" + sObjectId + "')", {

				urlParameters: {
					$expand: ["to_MeasuringDocument", "to_EquipmentMeasuringPoint", "to_ServiceComplaint", "to_EquipmentRecall", WorkList]
				},
				success: function (oData) {

					var pageDate = this.getView().getBindingContext().getObject();
					var Role = this.getView().getModel("appView").getData().Role;
					this._fnVisibleFields(Role);
					this.getView().byId("idPreviousmesauringKMS").setBusy(false);
					this.getView().byId("idPreviousmesauringHRS").setBusy(false);
					//	this.byId("swlrsmartTable").rebindTable();
					if (oData.to_MeasuringDocument.results.length > 0) {
						var measuringResults = oData.to_MeasuringDocument.results;
						var aKILOMETER = [],
							aHRS = [],
							boolKMsExist = false,
							boolHRsExist = false,
							latestKMSObj,
							latestHRSObj;
						for (var i = 0; i < measuringResults.length; i++) {
							if (measuringResults[i].MeasurementPosition === "KILOMETER") {
								aKILOMETER.push(measuringResults[i]);
								boolKMsExist = true;
							} else if (measuringResults[i].MeasurementPosition === "HRS") {
								aHRS.push(measuringResults[i]);
								boolHRsExist = true;
							}
						}

						if (boolKMsExist) {
							var len = aKILOMETER.length;
							for (var i = 0; i < len; i++) {
								for (var j = 0; j < len - 1; j++) {
									if (Number(aKILOMETER[j].MeasuringDocument) > Number(aKILOMETER[j + 1].MeasuringDocument)) {
										var tmp = aKILOMETER[j];
										aKILOMETER[j] = aKILOMETER[j + 1];
										aKILOMETER[j + 1] = tmp;
									}
								}
							}
							latestKMSObj = aKILOMETER[aKILOMETER.length - 1];
							this.getView().byId("idLabelKMS").setVisible(true);
							this.getView().byId("idPreviousmesauringKMS").setText(latestKMSObj.MeasuringReading + " " + latestKMSObj.MeasuringUnit);

						} else {
							this.getView().byId("idLabelKMS").setVisible(false);
						}

						if (boolHRsExist) {
							var len = aHRS.length;
							for (var i = 0; i < len; i++) {
								for (var j = 0; j < len - 1; j++) {
									if (Number(aHRS[j].MeasuringDocument) > Number(aHRS[j + 1].MeasuringDocument)) {
										var tmp = aHRS[j];
										aHRS[j] = aHRS[j + 1];
										aHRS[j + 1] = tmp;
									}
								}
							}
							latestHRSObj = aHRS[aHRS.length - 1];
							this.getView().byId("idLabelHRS").setVisible(true);
							this.getView().byId("idPreviousmesauringHRS").setText(latestHRSObj.MeasuringReading + " " + latestHRSObj.MeasuringUnit);

						} else {
							this.getView().byId("idLabelHRS").setVisible(false);
						}

					}
					if (oData.to_ServiceComplaint.results.length > 0) {
						//		mdetailView.setProperty("/_ServiceComplaint", oData.to_ServiceComplaint.results);
						var ComplaintListData = [];

						for (var i = 0; i < oData.to_ServiceComplaint.results.length; i++) {
							var obj = {
								ItemNumber: 10 * (i + 1),
								Complaint: oData.to_ServiceComplaint.results[i].ComplaintCode,
								ComplaintDescription: oData.to_ServiceComplaint.results[i].ComplainCodeDescription,
								Material: oData.to_ServiceComplaint.results[i].Material,
								Quantity: oData.to_ServiceComplaint.results[i].Quantity,
								QuantityUnit: oData.to_ServiceComplaint.results[i].ProcessQtyUnit,
								NetPrice: oData.to_ServiceComplaint.results[i].EstPrice,
								Tax: oData.to_ServiceComplaint.results[i].Tax,
								TotalPrice: oData.to_ServiceComplaint.results[i].TotalPrice,
								Currency: oData.to_ServiceComplaint.results[i].Currency,
								Enabled: false
							}
							if (oData.to_ServiceComplaint.results[i].Material) {
								obj["MaterialVHData"] = [{
									Material: oData.to_ServiceComplaint.results[i].Material,
									MaterialName: oData.to_ServiceComplaint.results[i].MaterialName
								}]
							} else {
								obj["MaterialVHData"] = []
							}
							ComplaintListData.push(obj);
						}
						ComplaintListData.push({
							ItemNumber: (ComplaintListData.length + 1) * 10,
							Complaint: "",
							ComplaintKey: "",
							ComplaintDescription: "",
							ItemCatUsage: "",
							Material: "",
							MaterialVHData: [],
							Quantity: "",
							QuantityUnit: "",
							NetPrice: 0,
							Tax: 0,
							TotalPrice: 0,
							Currency: "",
							Enabled: true

						});
						mdetailView.setProperty("/vComplaints", ComplaintListData);
					}

					if (oData.to_EquipmentMeasuringPoint.results.length > 0) {
						mdetailView.setProperty("/_EquipmentMeasuringPoint", oData.to_EquipmentMeasuringPoint.results);
					}

					// var CheckListData = oData.to_I_TC_SMSA.results;
					// var VisibleData = CheckListData.filter(function (ele) {
					// 	return ele.MsaRole === Role;
					// });
					// mdetailView.setProperty("/VisibleData", VisibleData[0]);

					//	if (oData.to_WorkList.results.length > 0) {
					var WorkListData = oData.ServiceDocumentType === "ZSRW" ? oData.to_WorkList2.results : oData.to_WorkList.results;
					if (WorkListData.length > 0) {
						var SummaryListData = [];

						for (var i = 0; i < WorkListData.length; i++) {
							var obj = {
								cat_label: WorkListData[i].cat_label,
								cat_id: WorkListData[i].cat_id,
								cat_desc: WorkListData[i].cat_desc,
								net_value_h: WorkListData[i].net_value_h,
								currency: WorkListData[i].currency,
								Stat: 'E0002'
							}
							SummaryListData.push(obj);
						}

						mdetailView.setProperty("/SummaryList", SummaryListData);
					}

					var ObjectStatusRecall = this.getView().byId("ObjectStatusRecall");
					var boolNoRecall = false,
						boolRecallPending = false,
						boolRecallComplete = false,
						vRecallPendingCount = 0,
						vRecallCompleteCount = 0;
					var recallCrit = "Indication01";
					var recallText = "";
					var boolStatusLargeClass = false;
					var recallPendingItems = []
					if (oData.to_EquipmentRecall.results.length > 0) {
						for (var i = 0; i < oData.to_EquipmentRecall.results.length; i++) {
							var oEquipmentRecall = oData.to_EquipmentRecall.results[i];
							if (oEquipmentRecall.WarrantyClaim !== '' && oEquipmentRecall.ServiceOrder !== '') {
								vRecallCompleteCount = vRecallCompleteCount + 1;
							} else if (oEquipmentRecall.WarrantyClaim !== '') {
								vRecallPendingCount = vRecallPendingCount + 1;
								recallPendingItems.push(oEquipmentRecall);
							}
						}
						boolRecallComplete = vRecallCompleteCount === oData.to_EquipmentRecall.results.length ? true : false;
						boolRecallPending = vRecallPendingCount > 0 ? true : false;

					} else {
						boolNoRecall = true;
					}
					if (boolNoRecall) {
						recallCrit = "Indication02";
						recallText = "No Recall";
						boolStatusLargeClass = false;
					} else if (boolRecallPending) {
						recallCrit = "Indication02";
						recallText = "Recall Pending";
						boolStatusLargeClass = true;
					} else if (boolRecallComplete) {
						recallCrit = "Indication04";
						recallText = "Recall Completed";
						boolStatusLargeClass = false;
					}
					ObjectStatusRecall.setText(recallText);
					ObjectStatusRecall.setState(recallCrit);

					//	this.PageData = this.getView().getBindingContect().getObject();

				}.bind(this),
				error: function (oError) {}

			});
		},

		_fnVisibleFields: function (Role) {
			var that = this;
			var pageData = that.getView().getBindingContext().getObject();
			var mdetailView = this.getModel("detailView");
			mdetailView.setProperty("/VisibleData", []);
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter({
				path: "ProcessType",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.ServiceDocumentType
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "MsaRole",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: Role
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "VehSts",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.StatusForVehicle
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "SalesOrg",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.SalesOrganization
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "SalesOffice",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.SalesOffice
			}));
			aFilters.push(new sap.ui.model.Filter({
				path: "SalesGrp",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.SalesGroup
			}));

			that.getView().getModel().read("/ZAE_I_ServiceAdvsiorRole_01", {
				filters: aFilters,
				success: function (oData1, response1) {
					var visibleData = [];
					if (oData1.results.length > 0) {
						visibleData = oData1.results
							// mdetailView.setProperty("/VisibleData", oData1.results[0]);
					} else {
						visibleData.push({
							ChkAccAvl: false,
							ChkCompCode: false,
							ChkCustSign: false,
							ChkDelivDate: false,
							ChkFuelgauge: false,
							ChkNote: false,
							ChkPicNote: false,
							ChkPicVid: false,
							ChkVehCond: false,
							ChkWrkReqSc: false,
						});
					}
					mdetailView.setProperty("/VisibleData", visibleData[0]);
					that.onNextButtoncheck();
				},
				error: function (Error) {

				}

			});
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function (oData) {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
			// this.getView().byId("idFuelSelect").bindItems({
			// 	path: "/ZAE_I_DomainValueText(domname='ZAE_D_FUEL_LEVEL')/Set",
			// 	template: new sap.ui.core.Item({
			// 		key: "{DomainText}",
			// 		text: "{DomainText}"
			// 	})
			// });

			// this.getView().byId("idvehiclecondition").bindItems({
			// 	path: "/ZAE_I_VehicleConditionType",
			// 	template: new sap.ui.core.Item({
			// 		key: "{VehicleConditionTypeText}",
			// 		text: "{VehicleConditionTypeText}"
			// 	})
			// });

			/*	this.getView().byId("idpaymentterms").bindItems({
					path: "/ZAE_I_PaymentTerms",
					template: new sap.ui.core.Item({
						key: "{CustomerPaymentTerms}",
						text: "{CustomerPaymentTermsName}"
					})
				});*/

			var oItems = this.getView().byId("idVBoxCheckList").getItems();
			oItems.forEach(function (ele) {
				ele.setSelected(false);
			});

			this.getView().byId("idFuelSelect").setSelectedItem(null);
			this.getView().byId("idvehiclecondition").setSelectedItem(null);

			this.getView().byId("idOdometer").setValue(null);
			this.getView().byId("idOdometer").setValueState("None");
			this.getView().byId("idHRS").setValue(null);
			this.getView().byId("idnotes").setValue(null);
			this.getView().byId("idV2").setVisible(false);
			this.getView().byId("idV3").setVisible(false);
			this.getView().byId("idV4").setVisible(false);
			this.getView().byId("DP2").setValue(null);

			//var schemaId = this.getView().getBindingContext().getObject().SchemaID;
			//this.previuosmeasuringformat();
			this.onNextButtoncheck();
			this.getView().byId("btnSubmit").setVisible(false);
			this.getView().byId("btnYrdOpr").setVisible(true);
			oViewModel.setProperty("/IsNextenabled", false);
			//	this.getView().byId("btnYrdOpr").setEnabled(false);
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.ServiceRequest,
				sObjectType = oObject.ServiceObjectType,
				sObjectName = oObject.ServiceDocumentDescription,
				sSchemaID = oObject.SchemaID,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);
			this.getModel("detailView").setProperty("/vServiceRequset", sObjectId);
			this.getModel("detailView").setProperty("/vComplaints", [{
				ItemNumber: 10,
				Complaint: "",
				ComplaintKey: "",
				ComplaintDescription: "",
				ItemCatUsage: "",
				Material: "",
				MaterialVHData: {},
				Quantity: "",
				QuantityUnit: "",
				NetPrice: 0,
				Tax: 0,
				TotalPrice: 0,
				Currency: "",
				Enabled: true

			}]);
			this.getModel("detailViewEdit").setProperty("/editable", true);
			this.getView().byId("idAddComplaint").setEnabled(true);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));

		},

		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		/**
		 * Set the full screen mode to false and navigate to master page
		 */
		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		/**
		 * Toggle between full and non full screen mode.
		 */
		toggleFullScreen: function () {
			var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (!bFullScreen) {
				// store current layout and go full screen
				this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
				this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			} else {
				// reset to previous layout
				this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
			}
		},

		treeStructure: function () {

			var cachedScriptPromises = {};
			var that = this;
			var input = this.getView();
			var oModel = that.getView().getModel("detailView").getData();
			var pageData = this.getView().getBindingContext().getObject();
			var vEquip = pageData.Equipment;
			var vPlant = pageData.ServiceOrganization;
			oModel.ConcatinatedCategorizationSchemaTreeTableData = [];
			var oSet = "/GET_SCHEMA_HEADER_DATASet";
			var oPostDataObj = {
				GET_SCHEMA_INPUT: [{
					Equipment: vEquip,
					Plant: vPlant
				}],
				GET_SCHEMA_OUTPUT: [{
					Schemaid: ""
				}]
			};

			that.getView().byId("idTreeTable").setBusy(true);
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

									cachedScriptPromises[SchemaID] = $.Deferred(function (defer) {

										that.getView().getModel().read("/ZAE_I_CategorizationSchema_01", {
											urlParameters: {
												"$filter": "asp_id  eq \'" + SchemaID + "\'",
												"$orderby": "cat_id"
											},
											success: function (oData2, response2) {
												that.getView().byId("idTreeTable").setBusy(false);
												if (oData2.results.length > 0) {
													var oSchemaID = oData2.results[0].asp_id;
													var flatData = that.aeUI5Util.genParentIdWithDiv(oData2.results, "cat_id", "parentId", "_", 1);
													var tableData = that.treeFunctions.convertFlatToTree(flatData, "cat_id", "parentId", oSchemaID);
													var FilteredTreeTableData;

													var oServiceContract = oEquipmentData.to_ServiceContractNew.results[0];
													/*if (oEquipmentData.to_EQUIPMENTCURRCONTSTS.ContractStatusCode === "CTIN" && oServiceContract &&
														oServiceContract.to_Item.results.length > 0 && oServiceContract.to_Item.results[0].Material) {
														var Material = oServiceContract.to_Item.results[0].Material;
														FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S", oEquipmentData
															.to_EQUIPMENTCURRCONTSTS.ContractStatusCode, Material);
													}*/

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
														var Material = oServiceContract.SalesContractType === 'ZUMC'  ? oServiceContract.to_Item_01.results[0].ReferenceMaterial :
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
														FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S", aHideNodes, Material,
															openInContractNodes,
															flatData);
													} else {
														aHideNodes.push({
															SrviceSchemaQualifier: "CTIN",
															CatIDCategory: ""
														});
														FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S", aHideNodes, Material,
															openInContractNodes,
															flatData);
													}

													// var aFilterCode = ["UPSL"];
													// if (oEquipmentData.ContractStatus_new === "CTIN" && oServiceContract &&
													// 	oServiceContract.to_Item.results.length > 0 && oServiceContract.SrviceSchemaQualifier === "CTIN" &&
													// 	oServiceContract.to_Item.results[0].Material) {
													// 	var Material = oServiceContract.to_Item.results[0].Material;
													// 	aFilterCode.push("CTIN");
													// 	if (oEquipmentData.to_ServiceContract01.results.length > 0) {
													// 		aFilterCode.push(oEquipmentData.to_ServiceContract01.results[0].SrviceSchemaQualifier);
													// 	}
													// 	FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S", aFilterCode, Material);
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
													// 	FilteredTreeTableData = that.filterTreeData(tableData, oSchemaID + "_S",
													// 		aFilterCode);
													// }

													//***recal filter *//
													// if (oEquipmentData.to_EquipmentRecall.results.length > 0) {
													var oRecalList = oEquipmentData.to_EquipmentRecall.results;
													that.addRecallToSummary(FilteredTreeTableData, oRecalList);
													FilteredTreeTableData = that.filterTreeRecallData(FilteredTreeTableData, oRecalList);
													// }

													if (oServiceContract) {
														if (oServiceContract.to_Item_01.results[0].MaterialFrom && oServiceContract.to_Item_01.results[0].MaterialTo) {
															FilteredTreeTableData = that.filterTreeMaterialKM(FilteredTreeTableData, oServiceContract);
														}
													}
													oModel.ConcatinatedCategorizationSchemaTreeTableData = oModel.ConcatinatedCategorizationSchemaTreeTableData
														.concat(
															FilteredTreeTableData);
													that._initTreeValueHelpDialog(input, oModel.ConcatinatedCategorizationSchemaTreeTableData);
												}
												defer.resolve();
											},
											error: function () {
												that.getView().byId("idTreeTable").setBusy(false);
												defer.resolve();
											}
										});

									}).promise();
									cachedScriptPromises[SchemaID].done(function () {
										vCatSchemaReasolveCount++;
										if (Object.keys(cachedScriptPromises).length === vCatSchemaReasolveCount) {
											//that.fnProcessCatSchema(input,FilteredTreeTableData);

											that._initTreeValueHelpDialog(input, oModel.ConcatinatedCategorizationSchemaTreeTableData);
										}
									});
									//  var TreeTable = that.getView().byId("idTreeTable");
									// TreeTable.addEventDelegate({
									// 	onAfterRendering: function (oEvent) {
									// 		this.getRows().forEach(function (r) {
									// 			if (r.getBindingContext()) {
									// 				var obj = r.getBindingContext("undefined").getObject();
									// 				var oStatus = obj.children && obj.children.length > 0;
									// 				var sRow = r.sId.split("-")[r.sId.split("-").length - 1];
									// 				var rowInd = sRow.substring(3, sRow.length);
									// 				var columId = TreeTable.getId() + "-rowsel" + rowInd; //"#" + 
									// 				if (oStatus) {
									// 					$(document.getElementById(columId)).addClass("disabledbutton");
									// 				} else {
									// 					$(document.getElementById(columId)).removeClass("disabledbutton");
									// 				}
									// 			}
									// 		});

									// 	}
									// }, TreeTable);
									// // var funTableRerender = function () {
									// // 	TreeTable.rerender();
									// // };
									// // TreeTable.attachModelContextChange(funTableRerender);
									// // TreeTable.attachToggleOpenState(funTableRerender);
									// // TreeTable.attachBusyStateChanged(funTableRerender);
									// // TreeTable.attachFirstVisibleRowChanged(funTableRerender);

								}
							},
							error: function (oError) {
								that.getView().byId("idTreeTable").setBusy(false);

							}

						});

					} else {
						sap.m.MessageToast.show(that.getView().getModel("i18n").getResourceBundle().getText("Categorizheavailable"));
						that.getView().byId("idTreeTable").setBusy(false);

					}

				},
				error: function (oError) {
					that.getView().byId("idTreeTable").setBusy(false);

				}
			});

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
		convertFlatToTree: function (flat, id, parentId, SchemaID) {
			var MainRoot = [];
			var root = [];
			var map = {};
			flat.forEach(function (node) {
				if (!node[parentId]) {
					root.push(node);
					return;
				}
				var parentIndex = map[node[parentId]];
				if (typeof parentIndex !== "string") {
					parentIndex = flat.findIndex(function (el) {
						return el[id] === node[parentId];
					});
					map[node[parentId]] = parentIndex;
				}
				if (!flat[parentIndex].children) {
					flat[parentIndex].children = [node];
					return;
				}
				/*	if (parentIndex < 0) {
						root.push(node);
						return;
					}*/
				flat[parentIndex].children.push(node);
			});
			// return root;
			MainRoot.push({
				cat_id: SchemaID,
				cat_label: SchemaID,
				children: root
			});
			return MainRoot;
		},

		_initTreeValueHelpDialog: function (input, FilteredTreeTableData) {
			var TreeTable = this.getView().byId("idTreeTable");
			var oJsonModel = new sap.ui.model.json.JSONModel();
			oJsonModel.setData(FilteredTreeTableData);
			TreeTable.setModel(oJsonModel);
			TreeTable.bindRows({
				path: '/',
				parameters: {
					arrayNames: ['children']
				}
			});
			// var TreeTable = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeTable");
			TreeTable.addEventDelegate({
				onAfterRendering: function (oEvent) {
					this.getRows().forEach(function (r) {
						if (r.getBindingContext()) {
							var obj = r.getBindingContext("undefined").getObject();
							var oStatus = obj.children && obj.children.length > 0;
							var sRow = r.sId.split("-")[r.sId.split("-").length - 1];
							var rowInd = sRow.substring(3, sRow.length);
							var columId = TreeTable.getId() + "-rowsel" + rowInd; //"#" + 
							if (oStatus) {
								$(document.getElementById(columId)).addClass("disabledbutton");
							} else {
								$(document.getElementById(columId)).removeClass("disabledbutton");
							}
						}
					});

				}
			}, TreeTable);
			var funTableRerender = function () {
				TreeTable.rerender();
			};
			TreeTable.attachModelContextChange(funTableRerender);
			TreeTable.attachToggleOpenState(funTableRerender);
			TreeTable.attachBusyStateChanged(funTableRerender);
			TreeTable.attachFirstVisibleRowChanged(funTableRerender);
		},

		filterTreeData: function (data, SchemaID, aHideContractStatusCode, Material) {
			var tData = data;
			if (tData && tData.length > 0) {

				var matFilter = function (d) {
					return d.filter(function (o) {
						var tO = o;
						return tO.Material === Material;
					});
				};

				var filterFunc = function (d) {
					return d.filter(function (o) {
						var tO = o;
						if (tO.children) {
							tO.children = filterFunc(tO.children);
						}
						if (Material && tO.CatIDType === "CTIN" && (tO.CatIDCategory === "01" || tO.CatIDCategory === "02") && tO.children) { //material filter
							tO.children = matFilter(tO.children);
						}

						var showNode = true;
						for (var i = 0; i < aHideContractStatusCode.length; i++) {
							if (aHideContractStatusCode[i].CatIDCategory === "" && aHideContractStatusCode[i].SrviceSchemaQualifier === tO.CatIDType) {
								showNode = false;
							} else if (aHideContractStatusCode[i].CatIDCategory === tO.CatIDCategory && aHideContractStatusCode[i].SrviceSchemaQualifier ===
								tO.CatIDType) {
								showNode = false;
							}
						}

						return (
							tO.parentId !== SchemaID || tO.SrviceSchemaQualifier === '' || showNode
						);
					});
				};

				tData = filterFunc(tData);
			}
			return tData;
		},

		filterTreeData_old: function (data, SchemaID, ContractStatusCode, Material) {
			var tData = data;
			if (tData && tData.length > 0) {

				var matFilter = function (d) {
					return d.filter(function (o) {
						var tO = o;
						return tO.Material === Material;
					});
				};

				var filterFunc = function (d) {
					return d.filter(function (o) {
						var tO = o;
						if (tO.children) {
							tO.children = filterFunc(tO.children);
						}
						if (Material && tO.cat_desc === "CTIN" && tO.children) {
							tO.children = matFilter(tO.children);
						}

						return (
							tO.parentId !== SchemaID || tO.cat_desc === '' || ContractStatusCode.includes(tO.cat_desc)
						);
					});
				};

				tData = filterFunc(tData);
			}
			return tData;
		},

		fnProcessCatSchema: function (input, FilteredTreeTableData) {
			var that = this;
			input.setBusy(false);

			var keyCol = "cat_id";
			var valueCol = "cat_label";
			var fragName = this.getView().byId("idV2");
			var checkFucc = function (oRow) {
				if (oRow.heir_level === 3 || oRow.heir_level === 4) {

					if (oRow.isServiced) {
						return {
							pass: false,
							msg: that.aeUI5Util.geti18nText(that, "TREE_TABLE_SELECTION_CMP"),
							type: "Success"
						};
					}
					// if (oRow.KMReadingValidationRequired && !oRow.KMReadingValidationPass) {
					// 	return {
					// 		pass: false,
					// 		msg: that.aeUI5Util.geti18nText(that, "TREE_TABLE_SELECTION_KMR"),
					// 		type: "Warning"
					// 	};
					// } else {
					// 	return {
					// 		pass: true
					// 	};
					// }

				} else {
					return {
						pass: false,
						msg: that.aeUI5Util.geti18nText(that, "TREE_TABLE_SELECTION"),
						type: "Error"
					};
				}
			}.bind(this);
			that.handleTreeValueHelp(that, input, fragName, keyCol, valueCol, FilteredTreeTableData,
				checkFucc);
		},

		// 	handleTreeValueHelp: function (that, input, fragName, keyCol, valueCol, tableData, checkFucc) {
		// 	var self = this;
		// 	var inputId = input.getId();
		// 	if (!self._valueHelpDialogs[inputId]) {
		// 		Fragment.load({
		// 			id: inputId + "TreeVHFragment",
		// 			name: fragName,
		// 			controller: {
		// 				onTreeRowSelect: function (oEvent) {
		// 					var oSelRow = oEvent.getParameter("rowContext").getModel().getProperty(oEvent.getParameter("rowContext").sPath);
		// 					var checkObj = checkFucc(oSelRow);
		// 					if (checkObj.pass) {
		// 						input.setSelectedKey(oSelRow[keyCol]);
		// 						input.setValue(oSelRow[valueCol] + " (" + oSelRow[keyCol] + ")");
		// 						self._valueHelpDialogs[inputId].close();
		// 					} else {
		// 						var oMessageStrip = Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip");
		// 						oMessageStrip.setVisible(true);
		// 						oMessageStrip.setText(checkObj.msg);
		// 						oMessageStrip.setType(checkObj.type);
		// 					}
		// 				},
		// 				afterClose: function () {
		// 					Fragment.byId(inputId + "TreeVHFragment", "CategoryTreeVHMessageStrip").setVisible(false);
		// 				},
		// 				onCancelPressed: function () {
		// 					self._valueHelpDialogs[inputId].close();
		// 				}
		// 			}
		// 		}).then(function (oValueHelpDialogContent) {
		// 			self._valueHelpDialogs[inputId] = oValueHelpDialogContent;
		// 			that.getView().addDependent(self._valueHelpDialogs[inputId]);
		// 			self._initTreeValueHelpDialog(inputId, tableData);
		// 		});
		// 	} else {
		// 		self._initTreeValueHelpDialog(inputId, tableData);
		// 	}
		// },
		onSearchTreeTable: function (oEvent) {
			var oTable = oEvent.getSource().getParent().getParent().getParent();
			if (oEvent.getParameters().refreshButtonPressed) {
				this.onRefresh(oTable);
				oTable.collapseAll();
				return;
			}
			var sQuery = oEvent.getParameter("query");
			var aFilters = [];
			if (sQuery) {
				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "cat_id",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						}),
						new Filter({
							path: "cat_label",
							operator: sap.ui.model.FilterOperator.Contains,
							value1: sQuery
						})

					],
					and: false
				}));
			}
			oTable.getBinding("rows").filter(aFilters);
			if (aFilters.length > 0) {
				oTable.expandToLevel(3);
			} else {
				oTable.collapseAll();
			}
		},
		onRefresh: function (oTable) {
			oTable.getBinding("rows").refresh();
		},
		onSelectTreeTableRow: function (oEvent) {
			if (!oEvent.getParameter("rowContext")) {
				return;
			}
			var vDate = this.getView().byId("DP2").getValue();
			var selectedData = [];
			var oTable = oEvent.getSource();
			var SelectedIndices = oEvent.getSource().getSelectedIndices();
			var oSelectedObjCheck = oEvent.getSource().isIndexSelected(oEvent.getParameter('rowIndex'));
			var SelectedObj = oEvent.getParameter("rowContext").getObject();
			var BoolCheckSbt = true;
			for (var i = 0; i < SelectedIndices.length; i++) {
				var tableContext = oTable.getContextByIndex(SelectedIndices[i]);
				var data = oTable.getModel().getProperty(tableContext.getPath());
				selectedData.push(data);
				if (oSelectedObjCheck) {
					if (selectedData[i].children) {
						var oMessageStrip = this.getView().byId("CategoryTreeVHMessageStrip");
						oMessageStrip.setVisible(true);
						oMessageStrip.setText("Selection Not Allowed For This Level");
						oMessageStrip.setType("Error");
						BoolCheckSbt = false;
					}
				} else if (!oSelectedObjCheck) {
					if (selectedData[i].children) {
						oMessageStrip = this.getView().byId("CategoryTreeVHMessageStrip");
						oMessageStrip.setVisible(true);
						oMessageStrip.setText("Selection Not Allowed For This Level");
						oMessageStrip.setType("Error");
						BoolCheckSbt = false;

					}
				}
			}
			if (!BoolCheckSbt) {
				this.onSubmitButtonCheck();
			} else {
				oMessageStrip = this.getView().byId("CategoryTreeVHMessageStrip");
				oMessageStrip.setVisible(false);
				//	this.onSubmitButtonCheck();
			}
			var mDetailView = this.getView().getModel()
			var vTreetable = this.getView().byId("idTreeTable");
			var SelectedContexts = vTreetable.getBinding().getSelectedContexts();
			var SelectedObj = vTreetable.isIndexSelected(oEvent.getParameter('rowIndex'));
			var UnCheckedID = oEvent.getParameter("rowContext").getObject().cat_id;

			var SummarylistData = this.getView().getModel("detailView").getData().SummaryList;
			if (SelectedObj) {
				SelectedContexts.forEach(function (selObj) {
					var selModel = selObj.getModel();
					var selPath = selObj.getPath();
					var obj = selModel.getProperty(selPath);
					var index = SummarylistData.findIndex(function (Summaryobj) {
						return Summaryobj.cat_id === obj.cat_id;
					});
					if (index === -1) {
						SummarylistData.push(obj);
					}

				});
			} else {
				for (var i = 0; i < SummarylistData.length; i++) {
					if (SummarylistData[i].cat_id === UnCheckedID) {
						SummarylistData.splice(i, 1);
					}
				}
			}

			this.getModel("detailView").updateBindings(true);
			var DateValue = this.getView().byId("DP2").getValue();
			var vTableValidation = true;
			var mWorkEstimateItem = this.getView().getModel("detailView").getData();
			mWorkEstimateItem.vComplaints.forEach(function (oItem, i) {
				if (mWorkEstimateItem.VisibleData.ChkCompCode === "3") {
					if ((oItem.Complaint === "" || oItem.ComplaintDescription === "" || (oItem.ComplainType === "R" &&
							oItem.Material === "") || (oItem.ComplainType === "R" && oItem.Quantity === "")) && oItem.Enabled === true) {
						vTableValidation = false;
					}
				}
			});

			if (SummarylistData.length === 0 || BoolCheckSbt === false || vTableValidation === false) {
				this.onSubmitButtonCheck();
				// this.getModel("detailView").setProperty("/IsSubmitenabled", false);
			} else {
				//	this.getModel("detailView").setProperty("/IsSubmitenabled", true);
				this.onSubmitButtonCheck();
			}
			this.getView().byId("btnSubmit").setVisible(true);
			this.getView().byId("btnYrdOpr").setVisible(false);
			this.getModel("detailView").refresh(true);
		},

		// onSelectTreeTableRow_old: function (oEvent) {
		// 	var vTreetable = this.getView().byId("idTreeTable");
		// 	var SelectedContexts = vTreetable.getBinding().getSelectedContexts();
		// 	var SummaryListData = [];
		// 	SelectedContexts.forEach(function (selObj) {
		// 		var selModel = selObj.getModel();
		// 		var selPath = selObj.getPath();
		// 		var obj = selModel.getProperty(selPath);
		// 		SummaryListData.push(obj);
		// 	});

		// 	this.getModel("detailView").setProperty("/SummaryList", SummaryListData);
		// 	var DateValue = this.getView().byId("DP2").getValue();

		// 	if (SummaryListData.length === 0 || DateValue === "") {
		// 		this.getView().byId("btnSubmit").setEnabled(false);
		// 	} else {
		// 		this.getView().byId("btnSubmit").setEnabled(true);
		// 	}
		// 	this.getView().byId("btnSubmit").setVisible(true);
		// 	this.getView().byId("btnYrdOpr").setVisible(false);
		// 	this.getModel("detailView").refresh(true);
		// },

		onLivechageOdometerValidation: function () {
			var odometerValue = this.getView().byId("idOdometer").getValue();
			if (odometerValue > 100000000 || odometerValue < 0) {
				this.getView().byId("idOdometer").setValueState("Error");
			} else {
				this.getView().byId("idOdometer").setValueState("None");
			}
			this.onNextButtoncheck();
		},

		//post 1
		onClickNxt: function () {
			var that = this;
			var oReadings = this.getView().byId("idOdometer").getValue();
			var oPrevMeasuringReading = this.getView().byId("idPreviousmesauringKMS").getText();
			var oMeasuringReadingUnit = "";
			if (oPrevMeasuringReading) {
				oMeasuringReadingUnit = oPrevMeasuringReading.split(" ")[1];
			} else {
				oPrevMeasuringReading = this.getView().byId("idPreviousmesauringHRS").getText();
				oMeasuringReadingUnit = oPrevMeasuringReading.split(" ")[1];
			}
			oReadings = oReadings + " " + oMeasuringReadingUnit;
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			sap.m.MessageBox.confirm(oResourceBundle.getText("kmsconfirmationmsg", [oPrevMeasuringReading, oReadings]), {
				styleClass: "twentysixpoint",
				actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
				emphasizedAction: sap.m.MessageBox.Action.OK,
				onClose: function (sAction) {
					if (sAction === "OK") {
						that._fnNextClicked();
					}
				}
			});
		},
		_fnNextClicked: function () {
			var that = this;
			var mDetailView = that.getView().getModel("detailView").getData().VisibleData;
			var vOdometer = this.getView().byId("idOdometer").getValue();
			if (mDetailView.CaptOdomenter === "3" || vOdometer !== "") {
				var oModel = this.getView().getModel();
				var oEntity = "ZAE_FM_SMSA_EQU_ADD_MEA_DOC_SRSet";
				var vSerRequest = this.getView().getBindingContext().getObject().ServiceRequest;
				var vEquip = this.getView().getBindingContext().getObject().Equipment;
				//	var vOdometer = this.getView().byId("idOdometer").getValue();
				var vHRS = this.getView().byId("idHRS").getValue();
				var data = [{
					callProperty: "ServiceRequest",
					value: vSerRequest
				}, {
					callProperty: "Equnr",
					value: vEquip
				}, {
					callProperty: "RecordedValue",
					value: vHRS
				}, {
					callProperty: "RecordedValueKm",
					value: vOdometer
				}];

				var succFunc = function (oData) {
					that._fnEnabledSubmit();
				};
				var errFunc = function (oData) {
					//oModel.refresh();
				};
				this.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
			} else {
				that._fnEnabledSubmit();
			}
		},

		_fnEnabledSubmit: function () {
			var that = this;
			that.treeStructure();
			var mDetailView = that.getView().getModel("detailView").getData().VisibleData;
			if (mDetailView.ChkWrkReqSc !== "1") {
				that.getView().byId("idV2").setVisible(true);
				that.getView().byId("idV4").setVisible(true);
			}
			if (mDetailView.ChkDelivDate !== "1") {
				that.getView().byId("idV3").setVisible(true);
			}
			that.getView().byId("btnYrdOpr").setVisible(false);
			that.getView().byId("btnSubmit").setVisible(true);
			var Role = that.getView().getModel("appView").getData().Role;
			if (Role === "1") {
				that.getView().byId("btnSubmit").setEnabled(true);
				return;
			}
			that.onSubmitButtonCheck();
			var mWorkEstimateItem = that.getView().getModel("detailViewEdit");
			mWorkEstimateItem.setProperty("/editable", true);
			that.getView().byId("idAddComplaint").setEnabled(true);
		},

		onProductValueHelpRequested: function (oEvent1) {
			var that = this;

			var pageData = that.getView().getBindingContext().getObject();
			var oRow = oEvent1.getSource().getParent(); //Get Row
			var oTable = oRow.getParent(); // Get Table
			var iRowIndex = oTable.indexOfItem(oRow); //Get Row index
			var ItemListTable = that.getView().byId("idItemListListTable");
			var oItems = ItemListTable.getAggregation("items");
			var oMaterial = oItems[iRowIndex].getAggregation("cells")[3].setBusy(true);
			var CompCode = oTable.getItems();
			for (var i = 0; i < CompCode.length; i++) {
				if (iRowIndex === i) {
					var Complaint = CompCode[i].getParent().getBinding("items").oList[i].Complaint;
				}
			}

			var SelectedCompliant = [];
			if (Complaint) {
				SelectedCompliant.push({
					key: Complaint
				});
			}

			/* eslint-disable */
			var UniqueCompliant = Array.from(new Set(SelectedCompliant.map(JSON.stringify))).map(JSON.parse);
			var input = oEvent1.getSource();
			input.setTokens([]);
			var configObject = {
				entitySet: "ZAE_I_MaterialChar_LAB",
				initiallyVisibleFields: "Material,MaterialType,Characteristic,CharacteristicValue,MaterialBaseUnit",
				selectionMode: "Single",

				tokenObject: {
					key: "Material",
					Description: "MaterialName"
				},
				controlConfiguration: [{
					index: 0,
					key: "CharacteristicValue",
					filterType: "auto",
					label: "{i18n>ComplaintCode}",
					mandatory: "mandatory",
					visible: true
				}, {
					index: 2,
					key: "Material",
					filterType: "auto",
					label: "{i18n>Material}",
					mandatory: "auto",
					visible: true
				}, {
					index: 3,
					key: "MaterialName",
					filterType: "auto",
					label: "{/#ZAE_I_MaterialChar_LABType/MaterialName/@sap:label}",
					mandatory: "auto",
					visible: true
				}],
				defaultFilter: {
					// CharacteristicValue: {
					// 	"items": [{
					// 		"key": Complaint
					// 	}]
					// }
				},
				onBeforeRebindSmartTable: function (oEvent) {
					var aFilterArray = oEvent.getParameter("bindingParams").filters;
					// aFilterArray.push(new sap.ui.model.Filter({
					// 	path: "CharacteristicValue",
					// 	operator: sap.ui.model.FilterOperator.EQ,
					// 	value1: Complaint
					// }));
					oEvent.getParameter("bindingParams").filters = aFilterArray;
				}
			};

			if (UniqueCompliant.length > 0) {
				configObject.defaultFilter = {
					CharacteristicValue: {
						"items": [{
							"key": Complaint
						}]
					}
				};
			}
			that.aeUtil.handleSmartDialogValueHelp(that, input, configObject);
			oMaterial.setBusy(false);
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
		onSelectMaterial: function (oEvent) {
			var that = this;
			if (oEvent.getParameter("selectedRow") !== null) {
				var oTableItems = this.getView().byId("idItemListListTable").getItems();
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
				var oBindingContexts = oEvent.getSource().getParent().oBindingContexts;
				var path = oBindingContexts["detailView"].getPath();
				var oModel = oBindingContexts["detailView"].getModel();
				oEvent.getSource().setSelectedKey(oSelectedData.Material);
				// var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
				oModel.setProperty(path + that.constant.MaterialPath, [oSelectedData]);
				//	oModel.setProperty(path + that.constant.MaterialPath, [oSelRowData]);
				oModel.setProperty(path + "/Material", oSelectedData.Material);
				oModel.setProperty(path + "/QuantityUnit", oSelectedData.MaterialBaseUnit);
				var MainItem = Number(path.split("/")[2]);
				oTableItems[MainItem].getCells()[3].setValueState("None");
				oTableItems[MainItem].getCells()[4].setEnabled(true);
				//	oModel.setProperty(path + "/Quantity", oSelectedData.MaterialAvlQty);
				oModel.updateBindings(true);
				this.fnLoadQuantity(oBindingContexts);
				this.fnTotalPrice(oBindingContexts);
			}
		},
		handleMaterialSuggest: function (oEvent) {
			var that = this;
			var pageData = that.getView().getBindingContext().getObject();
			var oRow = oEvent.getSource().getParent(); //Get Row
			var oTable = oRow.getParent(); // Get Table
			var iRowIndex = oTable.indexOfItem(oRow); //Get Row index
			var CompCode = oTable.getItems();
			for (var i = 0; i < CompCode.length; i++) {
				if (iRowIndex === i) {
					var Complaint = CompCode[i].getParent().getBinding("items").oList[i].Complaint;
				}
			}
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new sap.ui.model.Filter({
					path: "CharacteristicValue",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: Complaint
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

		onMaterailTokenUpdate: function (oEvent) {
			var that = this;
			var oTableItems = that.getView().byId("idItemListListTable").getItems();
			var aTokens = oEvent.getSource().getTokens();
			var oBindingContexts = oEvent.getSource().getParent().oBindingContexts;
			var path = oBindingContexts["detailView"].getPath();
			var oModel = oBindingContexts["detailView"].getModel();
			var MainItem = Number(path.split("/")[2]);
			if (aTokens.length === 0 || oEvent.getParameters().type === "removed") {
				oEvent.getSource().setSelectedKey("");
				oModel.setProperty(path + that.constant.MaterialPath, []);
				oModel.setProperty(path + "/Material", "");
				if (oModel.getData().vComplaints[MainItem].ComplainType === "R") {
					oTableItems[MainItem].getCells()[3].setValueState("Error")
					oTableItems[MainItem].getCells()[3].setValueStateText("Select Material");
				}
			} else {
				oEvent.getSource().setSelectedKey(aTokens[0].getProperty("key"));
				var oSelRowData = aTokens[0].mAggregations.customData[0].getProperty("value");
				oModel.setProperty(path + that.constant.MaterialPath, [oSelRowData]);
				oModel.setProperty(path + "/Material", oSelRowData.Material);
				oModel.setProperty(path + "/QuantityUnit", oSelRowData.MaterialBaseUnit);
				oTableItems[MainItem].getCells()[3].setValueState("None");
				oTableItems[MainItem].getCells()[4].setEnabled(true);
				//	oModel.setProperty(path + "/Quantity", oSelRowData.MaterialAvlQty);
				if (aTokens.length > 1) {
					var MainItem = Number(path.split("/")[2]);
					aTokens.forEach(function (oToken, i) {
						if (!oTableItems[MainItem]) {
							this.onAddNewRow();
							oTableItems = that.getView().byId("idItemListListTable").getItems();
						}
						oTableItems[MainItem].getCells()[2].setTokens([aTokens[i]]);
						oTableItems[MainItem].getCells()[2].fireTokenUpdate();
						MainItem = MainItem + 1;
					}.bind(this));
				}

			}
			if (oEvent.getParameters().type !== "removed") {
				that.fnLoadQuantity(oBindingContexts);
				that.fnTotalPrice(oBindingContexts);
			}
			oModel.updateBindings(true);
			that.onNextButtoncheck();
		},

		fnTotalPrice: function (oBindingContexts) {

			var that = this;
			// var self = that;
			var pageData = that.getView().getBindingContext().getObject();
			var path = oBindingContexts["detailView"].getPath();
			var oWEModel = oBindingContexts["detailView"].getModel();
			var oWEModelData = oWEModel.getData();
			var rowData = oWEModel.getProperty(path);
			var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
			//	var actId = "Add Complaint";
			//	var actLabel = that.aeUtil.geti18nText(that, actId);
			var DistrbutionChannel = pageData.DistributionChannel;
			var Customer = pageData.SoldToParty;
			var DocType = pageData.process_type;
			var Plant = pageData.ServiceOrganization;
			var Divison = pageData.Division;
			var SalesOffice = pageData.SalesOffice;
			var SalesGroup = pageData.SalesGroup;
			var SalesOrg = pageData.SalesOrganization;
			var Material = rowData.Material;
			// var keyString = "(Customer='" + Customer + "',DistrChan='" + DistrbutionChannel + "',Division='" + Divison + "',DocType='" +
			// 	DocType + "',Material='" + Material + "',Plant='" + Plant + "',SalesGrp='" + SalesGroup + "',SalesOff='" + SalesOffice +
			// 	"',SalesOrg='" + SalesOrg + "')";

			// var keyString = "(Customer='" + "10050" + "',DistrChan='" + "10" + "',Division='" + "10" + "',DocType='" +
			// 	"ZORP" + "',Material='" + "2143" + "',Plant='" + "3011" + "',SalesGrp='" + "028" + "',SalesOff='" + "W311" +
			// 	"',SalesOrg='" + "3000" + "')";

			var ItemListTable = that.getView().byId("idItemListListTable");
			var oItems = ItemListTable.getAggregation("items");
			var Qty = oItems[currentIndex].getAggregation("cells")[4];
			var oPrice = oItems[currentIndex].getAggregation("cells")[5];
			var oTax = oItems[currentIndex].getAggregation("cells")[6];
			var oTotalPrice = oItems[currentIndex].getAggregation("cells")[7];
			var oCurrency = oItems[currentIndex].getAggregation("cells")[8];
			oPrice.setBusy(true);
			oTax.setBusy(true);
			oTotalPrice.setBusy(true);
			oCurrency.setBusy(true);
			var oModel = that.getView().getModel();
			var oEntity = "ZAE_FM_SINGLE_SIM_GET_PRICESet";
			var data = [{
				callProperty: "Customer",
				value: Customer
			}, {
				callProperty: "DistrChan",
				value: DistrbutionChannel
			}, {
				callProperty: "Division",
				value: Divison
			}, {
				callProperty: "DocType",
				value: "ZORP"
			}, {
				callProperty: "SalesOff",
				value: SalesOffice
			}, {
				callProperty: "Material",
				value: Material
			}, {
				callProperty: "Plant",
				value: Plant
			}, {
				callProperty: "SalesGrp",
				value: SalesGroup
			}, {
				callProperty: "SalesOrg",
				value: SalesOrg
			}];
			var succFunc = function (oData, response) {
				//	that.getView().getModel().refresh(true);
				that._NetPrice = oData;
				this.oResponse = false;
				if (oData) {
					var NetPrice = oData.NetPrice === "" ? 0 : oData.NetPrice;
					oWEModel.setProperty(path + "/UnitNetPrice", parseFloat(NetPrice));
					var Tax = oData.Tax === "" ? 0 : oData.Tax;
					oWEModel.setProperty(path + "/UnitTax", parseFloat(Tax));
					var TotalPrice = oData.TotalPrice === "" ? 0 : oData.TotalPrice;
					oWEModel.setProperty(path + "/UnitTotalPrice", parseFloat(TotalPrice));
					oWEModel.setProperty(path + "/Currency", oData.Currency);
				} else {
					oWEModel.setProperty(path + "/NetPrice", 0);
					oWEModel.setProperty(path + "/Tax", 0);
					oWEModel.setProperty(path + "/TotalPrice", 0);
					oWEModel.setProperty(path + "/Currency", 0);
				}
				oPrice.setBusy(false);
				oTax.setBusy(false);
				oTotalPrice.setBusy(false);
				oCurrency.setBusy(false);
			}.bind(this);
			var errFunc = function (oData) {
				Qty.setEnabled(false);
				this.oResponse = JSON.parse(oData.responseText);
				sap.m.MessageBox.error(this.oResponse.error.message.value, {
					actions: [sap.m.MessageBox.Action.CLOSE],
				});

				//	that.getView().getModel().refresh(true);
				oPrice.setBusy(false);
				oTax.setBusy(false);
				oTotalPrice.setBusy(false);
				oCurrency.setBusy(false);
			}.bind(this);

			this.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
		},

		fnLoadQuantity: function (oBindingContexts) {
			var that = this;
			// var self = that;
			var pageData = that.getView().getBindingContext().getObject();
			var path = oBindingContexts["detailView"].getPath();
			var oWEModel = oBindingContexts["detailView"].getModel();
			var oWEModelData = oWEModel.getData();
			var rowData = oWEModel.getProperty(path);
			var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
			var aFilter = [];
			aFilter.push(new sap.ui.model.Filter({
				path: "Equipment",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pageData.Equipment
			}));
			if (!rowData.Material) {
				oWEModel.setProperty(path + "/Quantity", "");
				that.onNextButtoncheck();
				return;
			}

			var ItemListTable = that.getView().byId("idItemListListTable");
			var oItems = ItemListTable.getAggregation("items");
			var oQty = oItems[currentIndex].getAggregation("cells")[4];
			oQty.setBusy(true);
			that.getView().getModel().read("/ZAE_I_EquipmentModelCode(P_Material='" + rowData.Material + "')/Set", {
				filters: aFilter,
				success: function (oData, response) {
					oQty.setBusy(false);
					if (oData.results.length > 0 && !(that.oResponse)) {
						oWEModel.setProperty(path + "/Quantity", parseFloat(oData.results[0].MaterialAvlQty).toString());
						// if (parseFloat(oData.results[0].MaterialAvlQty).toString() !== "0") {
						oQty.fireLiveChange();
						// }
						oQty.setValueState("None");
					} else {
						oWEModel.setProperty(path + "/Quantity", "");
						oQty.setValueState("Error");
						oWEModel.setProperty(path + "/NetPrice", "-");
						oWEModel.setProperty(path + "/Tax", "-");
						oWEModel.setProperty(path + "/TotalPrice", "-");
						//		oQty.fireLiveChange();

						oQty.setValueStateText("Enter Quantity");
					}
					that.onNextButtoncheck();
				},
				error: function (error) {
					oQty.setBusy(false);
				}
			});

		},

		checkNotes: function (s) {
			var oModeldata = this.getView().getModel("detailView").getData();
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

		//Post 2
		btnSubmitPress: function () {

			var that = this;
			var oEntity = "HEADER_DATASet";
			var oModel = this.getView().getModel();
			var oModel1 = this.getView().getModel("UpdateServiceRequestItem");

			//N_Main
			var oItemEntry1 = {};
			var oItemEntry2 = {};
			var arr1 = [];

			//N_Catalogues
			var arr2 = [];

			//N_SR_ITEMS
			var arr3 = [];

			//N_SR_COMP
			var arr4 = [];
			var arr5 = [];
			var obj = {};
			var oRouter = this.getOwnerComponent().getRouter();
			var oItems = this.getView().byId("idVBoxCheckList").getItems();
			var mWorkEstimateItem = this.getView().getModel("detailView").getData();
			var CheckData = mWorkEstimateItem.VisibleData
			if (CheckData.ChkNote === "3") {
				var vNotes = this.getView().byId("idnotes").getValue(); // notes
				that.checkNotes(vNotes);
			}
			if (CheckData.ChkPicNote === "3") {
				var PickUpNotes = this.getView().byId("idPickNote").getValue();
				that.checkNotes(PickUpNotes);
			}
			var vSerRequest = this.getView().getBindingContext().getObject().ServiceRequest;
			var vFuel = this.getView().byId("idFuelSelect").getSelectedKey();
			var vVehicleCond = this.getView().byId("idvehiclecondition").getSelectedKey();

			var Role = this.getView().getModel("appView").getProperty("/Role");
			/*	var vPaymentTerms = this.getView().byId("idpaymentterms").getSelectedKey();*/
			var vDate = this.getView().byId("DP2").getDateValue();
			var epoch = new Date(vDate);
			var IDate = "\/Date(" + epoch.getTime() + ")\/";
			var reqTime = "PT" +
				("00" + epoch.getHours()).slice(-2) +
				"H" +
				("00" + epoch.getMinutes()).slice(-2) +
				"M" +
				("00" + epoch.getSeconds()).slice(-2) +
				"S";

			var selcteddata = this.getModel("detailView").getData().SummaryList;

			oItemEntry1.ServiceRequest = vSerRequest;
			if (CheckData.ChkFuelgauge === "3") {
				oItemEntry1.FuelLevel = vFuel;
			} else {
				if (vFuel !== "") {
					oItemEntry1.FuelLevel = vFuel;
				}
			}
			if (CheckData.ChkVehCond === "3") {
				oItemEntry1.VehicleCond = vVehicleCond;
			} else {
				if (vVehicleCond !== "") {
					oItemEntry1.VehicleCond = vVehicleCond;
				}
			}
			if (CheckData.ChkDelivDate === "3") {
				oItemEntry1.ReqDate = IDate;
				oItemEntry1.ReqTime = reqTime;
			} else {
				if (IDate !== "") {
					oItemEntry1.ReqDate = IDate;
					oItemEntry1.ReqTime = reqTime;
				}
			}
			oItemEntry1.MsaRole = Role;

			arr1.push(oItemEntry1);

			for (var i = 0; i < selcteddata.length; i++) {
				arr2.push({

					ProcessType: selcteddata[i].cat_desc,
					Dbmtr: selcteddata[i].net_value_h,
					Waers: selcteddata[i].currency,
					Stat: 'E0002',
					CatId: selcteddata[i].cat_id
				});
				oItemEntry1.Description = selcteddata[i].cat_label.substring(0, 39);
			}
			for (var i = 0; i < oItems.length; i++) {
				if (oItems[i].getSelected()) {
					arr3.push({
						NumberInt: oItems[i].getBindingContext().getObject().ServiceRequestItem,
						CheckListId: "YES"
					});
				}
			}

			mWorkEstimateItem.vComplaints.forEach(function (oItem, i) {
				if (oItem.Enabled) {
					// arr4.push({
					// 	StepId: "",
					// 	CompCode: oItem.ComplaintKey,
					// 	CheckListId: "ZC000001",
					// 	ItemCatUsage: oItem.ItemCatUsage,
					// 	Text0003: oItem.ComplaintDescription,
					// 	Materail: oItem.Material,
					// 	Quantity: oItem.Quantity !== "" ? oItem.Quantity.toString() : "0",
					// 	ProcessQtyUnit: oItem.QuantityUnit,
					// 	Currency: oItem.Currency
					// });

					obj = {
						StepId: "",
						CompCode: oItem.ComplaintKey,
						CheckListId: "ZC000001",
						ItemCatUsage: oItem.ItemCatUsage,
						Text0003: oItem.ComplaintDescription,
						Materail: oItem.Material,
						Quantity: oItem.Quantity !== "" ? oItem.Quantity.toString() : "0",
						ProcessQtyUnit: oItem.QuantityUnit,
						Currency: oItem.Currency
					};
					if (oItem.Quantity === "0" || oItem.Quantity === "") {
						obj["Price"] = "0",
							obj["Tax"] = "0",
							obj["TotalPrice"] = "0"
					} else {
						obj["TotalPrice"] = (oItem.TotalPrice).toString(),
							obj["Tax"] = (oItem.Tax).toString(),
							obj["Price"] = (oItem.NetPrice).toString()
					}
					arr4.push(obj);
				}
			});

			// Notes
			var Itemsdata = that.getView().getModel("detailView").getData();
			var arr5 = Itemsdata.nItemData;

			var data = [{
				callProperty: "N_HEADER_DATA",
				value: arr1
			}, {
				callProperty: "N_CATALOGUES",
				value: arr2
			}, {
				callProperty: "N_SR_COMP",
				value: arr4
			}];
			if (CheckData.ChkAccAvl === "3" || CheckData.ChkAccAvl === "2") {
				data.push({
					callProperty: "N_SR_ITEMS",
					value: arr3
				});
			}
			// if (CheckData.ChkCompCode === "3") {
			// 	data.push({
			// 		callProperty: "N_SR_COMP",
			// 		value: arr4
			// 	});
			// } 
			if (CheckData.ChkPicNote === "3" || CheckData.ChkNote === "2") {
				data.push({
					callProperty: "N_SR_TEXTS",
					value: arr5
				});
			}

			var succFunc = function (oData) {
				oRouter.getView("com.globalintelli.ZAE_MMSA.view.Master").byId("list").getBinding("items").refresh(true);
				that.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
				// No item should be selected on master after detail page is closed
				that.getOwnerComponent().oListSelector.clearMasterListSelection();
				that.getRouter().navTo("master");

			};
			var errFunc = function (oData) {
				oRouter.getView("com.globalintelli.ZAE_MMSA.view.Master").byId("list").getBinding("items").refresh(true);
				//	oModel.refresh();
			};
			this.aeUI5Util.createCall(that, oModel1, oEntity, data, succFunc, errFunc);
		},
		onMessagePopoverPress: function (oEvent) {
			this.aeUI5Util.handleMessagePopoverPress(this, oEvent);
		},

		onSubmitButtonCheck: function () {
			var MsgStrip = this.getView().byId("CategoryTreeVHMessageStrip").getVisible();
			var mWorkEstimateItem = this.getView().getModel("detailView").getData();
			var mVisibleData = mWorkEstimateItem.VisibleData;
			var SummarylistData = mWorkEstimateItem.SummaryList;
			// var CatID = this.getView().byId("idTreeTable").getBinding("rows");
			var vDate = this.getView().byId("DP2");
			var vDateValue = vDate.getValue();
			vDate.setMinDate(new Date());
			var vTableValidation = true;
			var mComplaints = mWorkEstimateItem.vComplaints;
			var CheckBoxSelected = this.getView().byId("fcSelect").getFormElements()[7];

			if ((mVisibleData.ChkDelivDate === "3" && vDateValue === '') || MsgStrip === true) {
				//	this.getView().byId("btnSubmit").setEnabled(false);
				this.getModel("detailView").setProperty("/IsSubmitenabled", false);

			} else if (mVisibleData.ChkWrkReqSc === "3" && SummarylistData.length <= 0) {
				this.getModel("detailView").setProperty("/IsSubmitenabled", false);
			} else {
				this.getView().byId("btnSubmit").setVisible(true);
				this.getModel("detailView").setProperty("/IsSubmitenabled", true);
				this.getView().byId("btnYrdOpr").setVisible(false);
			}
		},

		onNextButtoncheck: function (oEvent) {
			if (oEvent !== undefined) {
				// this._NetPrice;
				var TotalPrice = "0";
				var Tax = "0";
				var NetPrice = "0";
				var oModel = this.getView().getModel("detailView");
				if (oEvent.getSource().getParent().getParent().getId().includes("idItemListListTable")) {
					var path = oEvent.getSource().mBindingInfos.value.binding.oContext.sPath;
					var path2 = oEvent.getSource().mBindingInfos.value.binding.sPath;
					oModel.setProperty(path + "/" + path2, oEvent.getSource().getValue());
					var ItemListTable = this.getView().byId("idItemListListTable");
					var oItems = ItemListTable.getAggregation("items");
					var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
					var CurrentRowData = this.getView().getModel("detailView").getData().vComplaints[currentIndex];
					var ComplainType = CurrentRowData.ComplainType;
					var oQuantity = oItems[currentIndex].getAggregation("cells")[4];
					if (oQuantity.getValue() !== "0" && oQuantity.getValue() !== "") {
						NetPrice = CurrentRowData.UnitNetPrice * oQuantity.getValue();
						Tax = CurrentRowData.UnitTax * oQuantity.getValue();
						TotalPrice = CurrentRowData.UnitTotalPrice * oQuantity.getValue();

					} else {
						TotalPrice = CurrentRowData.UnitTotalPrice === undefined ? 0 : CurrentRowData.UnitTotalPrice;
						NetPrice = CurrentRowData.UnitNetPrice === undefined ? 0 : CurrentRowData.UnitNetPrice;
						Tax = CurrentRowData.UnitTax === undefined ? 0 : CurrentRowData.UnitTax;
					}

					oModel.setProperty(path + "/TotalPrice", parseFloat(TotalPrice));
					oModel.setProperty(path + "/Tax", parseFloat(Tax));
					oModel.setProperty(path + "/NetPrice", parseFloat(NetPrice));
					if (oEvent.getParameter("value") === "" && ComplainType === "R") {
						oQuantity.setValueState("Error");
						oQuantity.setValueStateText("Enter Quantity");
					} else {
						oQuantity.setValueState("None");
						oQuantity.setValueStateText("");
					}
				}
			}

			var mWorkEstimateItem = this.getView().getModel("detailView").getData();
			var mVisibleData = mWorkEstimateItem.VisibleData;
			var odometerValue = this.getView().byId("idOdometer").getValue();
			var odometerValueState = this.getView().byId("idOdometer").getValueState();
			var vFuel = this.getView().byId("idFuelSelect").getSelectedKey();
			var vVehicleCond = this.getView().byId("idvehiclecondition").getSelectedKey();
			var Notes = this.getView().byId("idnotes").getValue();
			var PickupNote = this.getView().byId("idPickNote").getValue();
			var AccCheckBox = this.getView().byId("idservicerequest").getSelected();
			var mComplaints = mWorkEstimateItem.vComplaints;
			var vTableValidation = true;
			var vFieldValidation = true;
			var vNextButtonCheck = true;
			var PageData = this.getView().getBindingContext();
			var Role = this.getView().getModel("appView").getData().Role;

			// if (this.getView().byId("complaintsId").getVisible()) {
			// 	mComplaints.forEach(function (oItem, i) {
			// 		if (mVisibleData.ChkCompCode === "3") {
			// 			if ((oItem.Complaint === "" || oItem.ComplaintDescription === "" || (oItem.ComplainType === "R" &&
			// 					oItem.Material === "") || (oItem.ComplainType === "R" && oItem.Quantity === "")) && oItem.Enabled === true) {
			// 				vTableValidation = false;
			// 			}
			// 		}
			// 	});

			// 	if (mComplaints.length < 1 && mVisibleData.ChkCompCode === "3") {
			// 		vTableValidation = false;
			// 	}
			// }
			var FormElement = this.getView().byId("fcSelect").getFormElements();
			var that = this;
			that.getModel("detailView").setProperty("/IsNextenabled", true);
			that.getModel("detailView").setProperty("/IsSubmitenabled", true);
			FormElement.forEach(function (oItem, i) {
				if (oItem.getFields()[0].getMetadata()._sClassName == "sap.m.Input" && oItem.getFields()[0].getRequired() && oItem.getFields()[
						0]
					.getValue() === "") {
					this.getModel("detailView").setProperty("/IsNextenabled", false);
					this.getModel("detailView").setProperty("/IsSubmitenabled", false);
					return;
				} else if (oItem.getFields()[0].getMetadata()._sClassName == "sap.m.Select" && oItem.getFields()[0].getRequired() && oItem.getFields()[
						0].getSelectedKey() === "") {
					this.getModel("detailView").setProperty("/IsNextenabled", false);
					this.getModel("detailView").setProperty("/IsSubmitenabled", false);
					return;
				} else if (oItem.getFields()[0].getMetadata()._sClassName == "sap.m.TextArea" && oItem.getFields()[0].getRequired() && oItem.getFields()[
						0].getValue() === "") {
					this.getModel("detailView").setProperty("/IsNextenabled", false);
					this.getModel("detailView").setProperty("/IsSubmitenabled", false);
					return;
				}

				if (this.getModel("detailView").getProperty("/IsNextenabled") && oItem.getFields()[0].getMetadata()._sClassName == "sap.m.VBox" &&
					mVisibleData.ChkAccAvl === "3" && oItem.getFields()[
						0].getItems()) {

					for (var i = 0; i < oItem.getFields()[0].getItems().length; i++) {
						if (oItem.getFields()[0].getItems()[i].getSelected()) {
							this.getModel("detailView").setProperty("/IsNextenabled", true);
							this.getModel("detailView").setProperty("/IsSubmitenabled", false);
							this.onSubmitButtonCheck();
							return;
						} else {
							if (oItem.getFields()[0].getItems()[i].getMetadata()._sClassName === "sap.m.CheckBox") {
								this.getModel("detailView").setProperty("/IsNextenabled", false);
								this.getModel("detailView").setProperty("/IsSubmitenabled", false);
							}
						}

					}

				}

			}.bind(this));

			if (this.getView().byId("complaintsId").getVisible() && this.getModel("detailView").getProperty("/IsNextenabled")) {
				mComplaints.forEach(function (oItem, i) {
					if (mVisibleData.ChkCompCode === "3") {
						if (oItem.Complaint === "" || oItem.ComplaintDescription === "" || (oItem.ComplainType === "R" &&
								oItem.Material === "" && oItem.Quantity === "") && oItem.Enabled === true) {
							this.getModel("detailView").setProperty("/IsNextenabled", true);
							this.getModel("detailView").setProperty("/IsSubmitenabled", true);
							this.onSubmitButtonCheck();

						} else {
							this.getModel("detailView").setProperty("/IsNextenabled", false);
							this.getModel("detailView").setProperty("/IsSubmitenabled", false);
						}
					} else if (oItem.Complaint !== "" && oItem.ComplaintDescription !== "" && (oItem.ComplainType === "R" &&
							oItem.Material === "") && (oItem.ComplainType === "R" && oItem.Quantity !== "" && oItem.Enabled === true) || (oItem.ComplainType ===
							"R" && oItem.Quantity === "")) {
						this.getModel("detailView").setProperty("/IsNextenabled", false);
						this.getModel("detailView").setProperty("/IsSubmitenabled", false);
					} else {
						this.getModel("detailView").setProperty("/IsNextenabled", true);
						//	this.getModel("detailView").setProperty("/IsSubmitenabled", true);
						//	this.onSubmitButtonCheck();
					}
				}.bind(this));

				if (mComplaints.length < 1 && mVisibleData.ChkCompCode === "3") {
					this.getModel("detailView").setProperty("/IsNextenabled", false);
					this.getModel("detailView").setProperty("/IsSubmitenabled", false);
				}
			}

			if (Role === "1") {
				if ((mVisibleData.ChkFuelgauge === "3" && vFuel !== "") && (mVisibleData.ChkVehCond === "3" &&
						vVehicleCond !== "")) {
					this.getModel("detailView").setProperty("/IsNextenabled", true);
					this.getModel("detailView").setProperty("/IsSubmitenabled", true);
				}
			}

		},

		// Statusformat: function (WarrantyClaim, ServiceOrder) {

		// 	var recallCrit = "";
		// 	if (WarrantyClaim !== "" && ServiceOrder !== "") {
		// 		recallCrit = "In Warranty";

		// 	} else if (WarrantyClaim !== "") {
		// 		recallCrit = "Out of Warranty";

		// 	}
		// 	return recallCrit;
		// },
		Statuscolorformat: function (sValue) {

			var result = "None";
			if (sValue === "Out of Warranty" || sValue === "Out of Contract") {
				result = "Error";
			} else if (sValue === "" || sValue === "") {
				result = "None";
			} else if (sValue === "In Warranty" || sValue === "In Contract") {
				result = "Success";
			}
			return result;

		},
		// StatusRecallstateformat: function (WarrantyClaim, ServiceOrder) {

		// 	var recallCrit = "None";
		// 	if (WarrantyClaim !== "" && ServiceOrder !== "") {
		// 		recallCrit = "Success";

		// 	} else if (WarrantyClaim !== "") {
		// 		recallCrit = "Error";

		// 	}
		// 	return recallCrit;
		// },
		filterTreeRecallData_old: function (data, oRecallList) {
			var tData = data;
			if (tData && tData.length > 0) {

				var RecallFilter = function (d) {
					var boolRecallFound = 0;
					return d.forEach(function (o) {
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
					});
					return boolRecallFound > 0;
				};

				var filterFunc = function (d) {
					return d.filter(function (o) {
						var tO = o;
						if (tO.children) {
							tO.children = filterFunc(tO.children);
						}
						if (tO.cat_id.slice(-4) === "S_RC") {
							return RecallFilter(tO.children);
						}
						return d;
					});

				};

				tData = filterFunc(tData);
			}
			return tData;
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

		addRecallToSummary: function (data, oRecallList) {
			var tData = data;
			var mdetailView = this.getModel("detailView");
			if (tData && tData.length > 0) {
				var recallCheckoutData = {};
				var findFunc = (d) => {
					d.forEach((o) => {
						const tO = o;
						if (tO.children) {
							findFunc(tO.children);
						}
						if (tO.cat_id.slice(-4) === 'S_RC') {
							recallCheckoutData = tO;
						}
					});
				};

				findFunc(tData);

				var SummarylistData = this.getView().getModel("detailView").getData().SummaryList;
				if (recallCheckoutData && recallCheckoutData.children && recallCheckoutData.children.length > 0) {
					if (oRecallList.length > 0) {
						for (var i = 0; i < oRecallList.length; i++) {
							var oEquipmentRecall = oRecallList[i];
							if (oEquipmentRecall.ServiceOrder === '') {
								// vRecallPendingCount = vRecallPendingCount + 1;
								var rData = recallCheckoutData.children.find((re) => re.cat_id == oEquipmentRecall.ExtRecallNo);
								var isRecallAdded = SummarylistData.every((s) => s.cat_id != rData.cat_id);
								if (rData && isRecallAdded) {
									var obj = {
										cat_label: rData.cat_label,
										cat_id: rData.cat_id,
										cat_desc: rData.cat_desc,
										net_value_h: rData.net_value_h,
										currency: rData.currency
									}
									SummarylistData.push(obj);
								}
							}
						}
					}
				}
				mdetailView.setProperty("/SummaryList", SummarylistData);
			}
		},

		handleValueHelp: function (oEvent) {
			this._oComplaintInput = oEvent.getSource();
			var that = this;
			if (!this._valueHelpDialog2) {
				Fragment.load({
						id: "valueHelpDialogFragment",
						name: "com.globalintelli.ZAE_MMSA.fragment.ComplaintsVH",
						controller: this
					})
					.then(function (oValueHelpDialogContent) {
						that._valueHelpDialog2 = oValueHelpDialogContent;
						that._valueHelpDialog2.setModel(that.getView().getModel());
						that.getView().addDependent(that._valueHelpDialog2);
						var pageData = that.getView().getBindingContext().getObject();
						var mdetailView = that.getModel("detailView");
						var _ServiceComplaint = mdetailView.getProperty("/_ServiceComplaint");
						var arrayFilter = [];
						arrayFilter.push(new Filter("Make", FilterOperator.EQ, pageData.Make));
						_ServiceComplaint.forEach(function (oItem) {
							arrayFilter.push(new Filter("ComplainCode", FilterOperator.NE, oItem.ComplaintCode));
						});
						var bAnd = true;
						var filter = new sap.ui.model.Filter(arrayFilter, bAnd);
						that._valueHelpDialog2.getBinding("items").filter([filter]);
						that._valueHelpDialog2.open();
					});
			} else {
				var mdetailView = that.getModel("detailView");
				var pageData = that.getView().getBindingContext().getObject();
				var _ServiceComplaint = mdetailView.getProperty("/_ServiceComplaint");
				var arrayFilter = [];
				arrayFilter.push(new Filter("Make", FilterOperator.EQ, pageData.Make));
				_ServiceComplaint.forEach(function (oItem) {
					arrayFilter.push(new Filter("ComplainCode", FilterOperator.NE, oItem.ComplaintCode));
				});
				var bAnd = true;
				var filter = new sap.ui.model.Filter(arrayFilter, bAnd);
				that._valueHelpDialog2.getBinding("items").filter([filter]);
				that._valueHelpDialog2.open();
			}
		},
		onSearchValueHelp: function (oEvent) {
			var mdetailView = this.getModel("detailView");
			var _ServiceComplaint = mdetailView.getProperty("/vComplaints");
			var sValue = oEvent.getParameter("value");
			var aFilters = [];
			if (sValue) {
				aFilters.push(new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("ComplainCode", sap.ui.model.FilterOperator.Contains, sValue),
						new sap.ui.model.Filter("ComplainCodeDesc", sap.ui.model.FilterOperator.Contains, sValue)
					],
					and: false
				}));
			}

			var tempFilters = [];
			var pageData = this.getView().getBindingContext().getObject();
			tempFilters.push(new Filter("Make", FilterOperator.EQ, pageData.Make));
			if (_ServiceComplaint.length > 0) {
				for (var i = 0; i < _ServiceComplaint.length; i++) {
					tempFilters.push(new sap.ui.model.Filter("ComplainCode", sap.ui.model.FilterOperator.NE, _ServiceComplaint[i].ComplaintCode));
				}
			}
			aFilters.push(new sap.ui.model.Filter({
				filters: tempFilters,
				and: true
			}));

			/*var oFilter = new sap.ui.model.Filter({
				filters: aFilters,
				and: true
			});*/
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter(aFilters);
		},
		onComplanitRefValueHelpDialogClose: function (oEvent) {
			var mWorkEstimateItem = this.getView().getModel("detailView");
			var path = this._oComplaintInput.mBindingInfos.value.binding.oContext.sPath
			var ComplaintClose = oEvent.getParameter("selectedItem").getBindingContext();
			var oComplainCode = ComplaintClose.getObject("ComplainCode");
			var oComplainCodeDesc = ComplaintClose.getObject("ComplainCodeDesc");
			var vItemCatUsage = ComplaintClose.getObject("ItemCatUsage");
			var ComplainType = ComplaintClose.getObject("ComplainType");
			mWorkEstimateItem.setProperty(path + "/ComplainType", ComplainType);
			mWorkEstimateItem.setProperty(path + "/ComplaintKey", oComplainCode);
			mWorkEstimateItem.setProperty(path + "/ItemCatUsage", vItemCatUsage);
			this._oComplaintInput.setValue(oComplainCode);
			var vComDesc = mWorkEstimateItem.getData().vComplaints;
			mWorkEstimateItem.setProperty(path + "/ComplaintDescription", oComplainCodeDesc);
			var ItemListTable = this.getView().byId("idItemListListTable");
			var oItems = ItemListTable.getAggregation("items");
			var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
			var oMaterial = oItems[currentIndex].getAggregation("cells")[3];
			var oQuantity = oItems[currentIndex].getAggregation("cells")[4];
			oMaterial.setEnabled(true);
			if (ComplainType === "R") {
				oMaterial.setValueState("Error");
				oQuantity.setValueState("Error");
				oMaterial.setValueStateText("Select Material");
				oQuantity.setValueStateText("Enter Quantity");
			} else {
				oMaterial.setValueState("None");
				oQuantity.setValueState("None");
			}
			//	var oCompalint = oItems[currentIndex].getAggregation("cells")[1].setEnabled(false);
			//	var oCompalintDesc = oItems[currentIndex].getAggregation("cells")[2].setEnabled(true);
			this.onNextButtoncheck();
		},

		onAddNewRow: function () {
			var mWorkEstimateItem = this.getView().getModel("detailView").getData().vComplaints;
			var currentItemNo = (mWorkEstimateItem.length + 1) * 10;
			//var oWorkEstimateItemData = mWorkEstimateItem.getData();
			mWorkEstimateItem.push({
				ItemNumber: mWorkEstimateItem.length === 1 ? 20 : currentItemNo,
				Complaint: "",
				ComplaintDescription: "",
				Material: "",
				MaterialVHData: [],
				Quantity: "",
				QuantityUnit: "",
				NetPrice: 0,
				Tax: 0,
				TotalPrice: 0,
				Currency: "",
				Enabled: true

			});
			this.getModel("detailView").refresh(true);

			this.onNextButtoncheck();

		},
		onDeletePress: function (oEvent5) {
			var oSource = oEvent5.getSource();
			var oBindingContexts = oSource.getParent().oBindingContexts;
			var path = oBindingContexts["detailView"].getPath();
			var oWEModel = oBindingContexts["detailView"].getModel();
			var OEModelData = oWEModel.getData().vComplaints;
			var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
			OEModelData.splice(currentIndex, 1);

			oWEModel.refresh(true);

			this.onNextButtoncheck();

		},

		_fnEnableKMReading: function (EquipmentMeasuringPoint, CaptOdomenter) {
			var boolReturn = false;
			if (EquipmentMeasuringPoint && EquipmentMeasuringPoint.length > 0 || CaptOdomenter !== "1") {
				for (var i = 0; i < EquipmentMeasuringPoint.length; i++) {
					if (EquipmentMeasuringPoint[i].MeasuringPointPositionNumber === "KILOMETER") {
						boolReturn = true;
					}

				}
			}
			return boolReturn;
		},

		_fnEnableHRSReading: function (EquipmentMeasuringPoint) {
			var boolReturn = false;
			if (EquipmentMeasuringPoint && EquipmentMeasuringPoint.length > 0) {
				for (var i = 0; i < EquipmentMeasuringPoint.length; i++) {
					if (EquipmentMeasuringPoint[i].MeasuringPointPositionNumber === "HRS") {
						boolReturn = true;
					}

				}
			}
			return boolReturn;
		},
		handleComplaintSuggest: function (oEvent) {
			var that = this;
			var sTerm = oEvent.getParameter("suggestValue");
			var pageData = that.getView().getBindingContext().getObject();
			var mdetailView = that.getModel("detailView");
			var _ServiceComplaint = mdetailView.getProperty("/_ServiceComplaint");
			var arrayFilter = [];
			arrayFilter.push(new Filter("Make", FilterOperator.EQ, pageData.Make));
			_ServiceComplaint.forEach(function (oItem) {
				arrayFilter.push(new Filter("ComplainCode", FilterOperator.NE, oItem.ComplaintCode));
			});
			var bAnd = true;
			var filter = new sap.ui.model.Filter(arrayFilter, bAnd);
			var aFilters = [];
			if (sTerm) {
				arrayFilter.push(new Filter({
					filters: [
						new Filter({
							path: "ComplainCode",
							operator: sap.ui.model.FilterOperator.StartsWith,
							value1: sTerm
						}),
						new Filter({
							path: "ComplainCodeDesc",
							operator: sap.ui.model.FilterOperator.StartsWith,
							value1: sTerm
						})

					],
					and: false
				}));
			}

			var filter = new sap.ui.model.Filter(arrayFilter, bAnd);
			oEvent.getSource().getBinding("suggestionRows").filter(filter);
			oEvent.getSource().getBinding("suggestionRows").resume();
		},
		onSelectComplaint: function (oEvent) {
			if (oEvent.getParameter("selectedRow") !== null) {
				var oSource = oEvent.getSource();
				oSource.setValue("");
				var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext();
				var mWorkEstimateItem = this.getView().getModel("detailView");
				var path = oSource.mBindingInfos.value.binding.oContext.sPath
				var oComplainCode = oSelectedData.getObject("ComplainCode");
				var oComplainCodeDesc = oSelectedData.getObject("ComplainCodeDesc");
				var vItemCatUsage = oSelectedData.getObject("ItemCatUsage");
				var ComplainType = ComplaintClose.getObject("ComplainType");
				mWorkEstimateItem.setProperty(path + "/ComplainType", ComplainType);
				mWorkEstimateItem.setProperty(path + "/ComplaintKey", oComplainCode);
				mWorkEstimateItem.setProperty(path + "/ItemCatUsage", vItemCatUsage);
				oSource.setValue(oComplainCode);
				var vComDesc = mWorkEstimateItem.getData().vComplaints;
				mWorkEstimateItem.setProperty(path + "/ComplaintDescription", oComplainCodeDesc);
				var ItemListTable = this.getView().byId("idItemListListTable");
				var oItems = ItemListTable.getAggregation("items");
				var currentIndex = Number(path.split("/")[path.split("/").length - 1]);
				var oMaterial = oItems[currentIndex].getAggregation("cells")[3];
				var oQuantity = oItems[currentIndex].getAggregation("cells")[4];
				oMaterial.setEnabled(true);
				if (ComplainType === "R") {
					oMaterial.setValueState("Error");
					oQuantity.setValueState("Error");
					oMaterial.setValueStateText("Select Material");
					oQuantity.setValueStateText("Enter Quantity");

				} else {

					oMaterial.setValueState("None");
					oQuantity.setValueState("None");
				}
				//	var oCompalint = oItems[currentIndex].getAggregation("cells")[1].setEnabled(false);
				//	var oCompalintDesc = oItems[currentIndex].getAggregation("cells")[2].setEnabled(true);
				this.onNextButtoncheck();
			}
		},
		onClickMMSA_B01: function (oEvent) {
			var that = this;
			if (!this._oWorkshopRoasterDialog) {
				Fragment.load({
						id: "fragWorkshopLoad",
						name: "com.globalintelli.ZAE_MMSA.fragment.WorkshopLoad",
						controller: {
							onSubmitPressed: function (oEvent) {
								Fragment.byId("fragWorkshopLoad", "idDate").getDateValue().setHours(6);
								var oDate = Fragment.byId("fragWorkshopLoad", "idDate").getDateValue().toISOString().slice(0, 10);
								var pageData = that.getView().getBindingContext().getObject();
								var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
								var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
									target: {
										semanticObject: "WorkshopRoaster",
										action: "aeAnalyze"
									},
									params: {
										"Plant": pageData.ServiceOrganization,
										"WorkCenter": pageData.WorkCenter,
										"Date": oDate
									}
								})) || "";
								var url = window.location.href.split('#')[0] + hash;
								sap.m.URLHelper.redirect(url, true);
								// oCrossAppNavigator.toExternal({
								// 	target: {
								// 		shellHash: hash
								// 	}
								// });
							},
							onCancelPressed: function (oEvent) {
								oEvent.getSource().getParent().close();
							},
							handleDateChange: function (oEvent) {
								var oSource = oEvent.getSource();
								var bEnabled = oEvent.getSource().getDateValue() !== null;
								that._oWorkshopRoasterDialog.getBeginButton().setEnabled(bEnabled);
							}
						},
					})
					.then(function (oDialogContent) {
						this._oWorkshopRoasterDialog = oDialogContent;
						this.getView().addDependent(this._oWorkshopRoasterDialog);
						this._setWorkshopRoasterDialogInitialState();
					}.bind(this));
			} else {
				this._setWorkshopRoasterDialogInitialState();
			}
		},
		_setWorkshopRoasterDialogInitialState: function () {
			Fragment.byId("fragWorkshopLoad", "idDate").setDateValue(new Date());
			//this._oWorkshopRoasterDialog.getBeginButton().setEnabled(false);
			this._oWorkshopRoasterDialog.open();
		}

	});

});