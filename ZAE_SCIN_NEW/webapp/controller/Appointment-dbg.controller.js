sap.ui.define([
	"com/globalintelli/ZAE_SCIN_NEW/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/ui/model/Filter",
	"com/globalintelli/zae_flib/controller/aeFormatter",
	"com/globalintelli/zae_flib/controller/aeUI5Utility",
	"com/globalintelli/ZAE_SCIN_NEW/util/util",
	'sap/viz/ui5/controls/common/feeds/AnalysisObject',
	'sap/suite/ui/commons/ChartContainerContent', 'sap/viz/ui5/controls/VizFrame', 'sap/ui/model/json/JSONModel',
	'sap/viz/ui5/data/FlattenedDataset', 'sap/viz/ui5/controls/common/feeds/FeedItem', 'sap/m/Label',
	"com/globalintelli/zae_flib/controller/aeUtility/"
], function (BaseController, Fragment, Button, Dialog, Filter, aeFormatter, aeUI5Utility, util, AnalysisObject, ChartContainerContent,
	VizFrame, JSONModel,
	FlattenedDataset, FeedItem, Label, aeUtility) {
	"use strict";

	return BaseController.extend("com.globalintelli.ZAE_SCIN_NEW.controller.Appointment", {

		_planningCalendar: null,

		i18nPath: "i18n",

		aeFormatter: new aeFormatter(),

		aeUI5Util: new aeUI5Utility(),
		aeUtil: new aeUtility(),

		RecentAppointment: undefined,

		onInit: function () {
			this.aeUI5Util.setupMessageManager(this);
			this.aeUtil.resetLibrary();
			this._planningCalendar = this.getView().byId("SCIN_SAPlanCal");
			this._planningCalendar.setStartDate(new Date());
			var oMinDate = new Date();
			oMinDate.setFullYear(oMinDate.getFullYear() - 1);
			var oMaxDate = new Date();
			oMaxDate.setFullYear(oMaxDate.getFullYear() + 1);
			this._planningCalendar.setMinDate(oMinDate);
			this._planningCalendar.setMaxDate(oMaxDate);
			var oModelData = {};
			var oJsonModel = new sap.ui.model.json.JSONModel();
			oJsonModel.setData(oModelData);
			this.getView().setModel(oJsonModel, "mAppointment");
			var oJsonModel1 = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oJsonModel1, "mCustIdentification");
			var that = this;
			var vRouter = this.getRouter().getRoute("AppointmentView");
			vRouter.attachPatternMatched(this._onObjectMatched, this);

			/*	this._planningCalendar.onAfterRendering = function (oEvent) {
					if (that._planningCalendar.getRows().length > 0) {
						that.fnCustomRowChartSetBusy(true);

					}

				};*/

			var oModelChartData = {
				CapacityUtilizationbyHours: {
					chartContainerId: "CapacityUtilizationbyHours",
					title: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("CapacityUtilization"),
					config: {
						height: "100%",
						width: "100%",
						uiConfig: {
							applicationSet: "fiori"
						}
					},
					dataset: {
						dimensions: [{
							name: "CapacityUtilizationbyHours",
							value: "{CapacityUtilizationbyHours}"
						}],
						measures: [{
							name: "TotalAvailableHours",
							value: "{TotalAvailableHours}"
						}, {
							name: "TotalBookedHours",
							value: "{TotalBookedHours}"
						}, {
							name: "TotalRemainingHours",
							value: "{TotalRemainingHours}"
						}],
						data: {
							path: "/CapacityUtilizationbyHours/Data"
						}
					},
					feedItems: [{
						uid: "primaryValues",
						type: "Measure",
						values: ["TotalAvailableHours"]
					}, {
						uid: "axisLabels",
						type: "Dimension",
						values: ["CapacityUtilizationbyHours"]
					}, {
						uid: "primaryValues",
						type: "Measure",
						values: ["TotalBookedHours"]
					}, {
						uid: "primaryValues",
						type: "Measure",
						values: ["TotalRemainingHours"]
					}],
					colorPalette: d3.scale.category20().range(), //["#00ff00", "#0000ff", "#ffff00"],
					vizType: "column",
					Data: [{
						CapacityUtilizationbyHours: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("CapacityUtilization"),
						TotalAvailableHours: 10,
						TotalBookedHours: 20,
						TotalRemainingHours: 30,
					}]
				},

				AppointmentTypeByBookedHours: {
					chartContainerId: "AppointmentTypeByBookedHours",
					title: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("AppintmnetinHRS"),
					config: {
						height: "100%",
						width: "100%",
						uiConfig: {
							applicationSet: "fiori"
						}
					},
					dataset: {
						dimensions: [{
							name: "AppointmentTypeByBookedHours",
							value: "{AppointmentTypeByBookedHours}"
						}],
						measures: [],
						data: {
							path: "/AppointmentTypeByBookedHours/Data"
						}
					},
					feedItems: [{
						uid: "axisLabels",
						type: "Dimension",
						values: ["AppointmentTypeByBookedHours"]
					}],
					colorPalette: [], //["#00ff00", "#0000ff", "#ffff00"],
					vizType: "column",
					Data: [{
						AppointmentTypeByBookedHours: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("AppintmnetinHRS")
					}]
				},

				AppointmentTypeByNumberOfAppointments: {
					chartContainerId: "AppointmentTypeByNumberOfAppointments",
					title: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("AppoitnmentReason"),
					config: {
						height: "100%",
						width: "100%",
						uiConfig: {
							applicationSet: "fiori"
						}
					},
					dataset: {
						dimensions: [{
							name: "AppointmentTypeByNumberOfAppointments",
							value: "{AppointmentTypeByNumberOfAppointments}"
						}],
						measures: [],
						data: {
							path: "/AppointmentTypeByNumberOfAppointments/Data"
						}
					},
					feedItems: [{
						uid: "axisLabels",
						type: "Dimension",
						values: ["AppointmentTypeByNumberOfAppointments"]
					}],
					colorPalette: [], //["#00ff00", "#0000ff", "#ffff00"],
					vizType: "column",
					Data: [{
						AppointmentTypeByNumberOfAppointments: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
							"AppoitnmentReason")
					}]
				},
				WorkshopCapacityUtilizationbyHours: {
					chartContainerId: "WorkshopCapacityUtilizationbyHours",
					title: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("WorkshopCapacityUtilization"),
					config: {
						height: "100%",
						width: "100%",
						uiConfig: {
							applicationSet: "fiori"
						}
					},
					dataset: {
						dimensions: [{
							name: "appointmentType",
							value: "{appointmentType}"
						}],
						measures: [{
							name: "TotalBooked",
							value: "{TotalBooked}"
						}, {
							name: "TotalAvailable",
							value: "{TotalAvailable}"
						}],
						data: {
							path: "/WorkshopCapacityUtilizationbyHours/Data/items"
						}
					},
					feedItems: [{
						uid: "categoryAxis",
						type: "Dimension",
						values: ["appointmentType"]
					}, {
						uid: "valueAxis",
						type: "Measure",
						values: ["TotalBooked"]
					}, {
						uid: "valueAxis",
						type: "Measure",
						values: ["TotalAvailable"]
					}],
					colorPalette: d3.scale.category20().range(),
					vizType: "stacked_column",
					Data: [{
						WorkshopCapacityUtilizationbyHours: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
							"WorkshopCapacityUtilization"),
						TotalBooked: 20,
						TotalAvailable: 30,
					}]
				},
				mAppointmentChartRefreshRequired: true

			};
			var oJsonChartModel = new sap.ui.model.json.JSONModel();
			oJsonChartModel.setData(oModelChartData);
			this.getView().setModel(oJsonChartModel, "mAppointmentChart");

		},

		onBeforeRendering: function () {
			var oModel = this.getView().getModel();
			var mAppointmentChart = this.getView().getModel("mAppointmentChart");
			var that = this;
			if (oModel) {
				oModel.attachRequestSent(function (oEvent) {
					that._planningCalendar.setBusy(true);
					if (Fragment.byId("AppointmentMonthView", "idSinglePlanningCalendar")) {
						Fragment.byId("AppointmentMonthView", "idSinglePlanningCalendar").setBusy(true);
					}
				});

				oModel.attachRequestCompleted(function (oEvent) {
					that._planningCalendar.setBusy(false);
					if (Fragment.byId("AppointmentMonthView", "idSinglePlanningCalendar")) {
						Fragment.byId("AppointmentMonthView", "idSinglePlanningCalendar").setBusy(false);
					}
					if (oEvent.getParameter("url").includes("ZAE_I_Employee_02") && oEvent.getParameter("url").includes("to_Appointment_01")) {
						if (that._planningCalendar.getBinding("rows").aKeys[0]) {
							var oSplitter = that.getView().byId("idSplitterMain");
							var RowData = that.getView().getModel().getProperty("/" + that._planningCalendar.getBinding("rows").aKeys[0]);
							//this._planningCalendar.getParent().getParent().getParent().removeContentArea(2);
							if (!(RowData.HideGraph)) {
								if (mAppointmentChart.getData().mAppointmentChartRefreshRequired) {
									that.fnCustomRowChartSetBusy(true);
									setTimeout(function () {
										that.fnClculateBookedTime();
									}, 2000);
									mAppointmentChart.getData().mAppointmentChartRefreshRequired = false;
								}

							} else {
								if (oSplitter.getAggregation("contentAreas").length > 2) {
									oSplitter.removeContentArea(2);
								}
							}
						}
					}
				});
			}
			this.changeStandardItemsPerView();

		},

		onMessagePopoverPress: function (oEvent) {
			var custFunction = function (data) {

				var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
				var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: "Appointment",
						action: "aeDisplay"
					},
					params: {
						"object_type": "BUS2000126",
						"Appointment": data
					}
				})) || "";
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: hash
					}
				});
			};
			this.aeUI5Util.handleMessagePopoverPress(this, oEvent, custFunction);
		},

		_onObjectMatched: function (oEvent) {
			this._planningCalendar.rerender();
			var DecodedData = decodeURIComponent(oEvent.getParameter("arguments").param1).replace(/\\/g, "");
			var oParsedObject = JSON.parse(DecodedData);
			this.Lead = oParsedObject.LeadId;
			var that = this;
			var ServiceEmpGrp;
			var oJsonModel = new sap.ui.model.json.JSONModel();
			var oModelData = {
				filters: oParsedObject,
				pickdropDD: [{
					title: that.getView().getModel("i18n").getResourceBundle().getText("CourtesyCarwithoutDriver"),
					key: "01"
				}, {
					title: that.getView().getModel("i18n").getResourceBundle().getText("CourtesyCarwithDriver"),
					key: "02"
				}],
				UIOnly: {
					visible: {
						PlateNo: false,
						Customer: false,
						ServiceEmpGrp: false
					},
					enable: {
						CreateAppointment: false
					},
					text: {
						PlateNo: "",
						Customer: "",
						Plant: oParsedObject.Plant,
						CRMSalesOffice: "",
						SalesGroup: oParsedObject.SalesGroup
					}
				},
				EmployeeAppointments: [],
				ActivityReasonData: [],
				Clocation: [],
				//	zZone: [],
				TransitTime: [],
				legendItems: [{
					text: that.getView().getModel("i18n").getResourceBundle().getText("Leaves"),
					type: "Type02"
				}, {
					text: that.getView().getModel("i18n").getResourceBundle().getText("Appointments"),
					type: "Type09"
				}],
				legendShown: false,
				hideGraph: false,
			};
			oJsonModel.setData(oModelData);
			this.getView().setModel(oJsonModel, "mAppointment");
			var aFilter = [];
			var oModeldata = this.getView().getModel("mAppointment");
			aFilter.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oParsedObject.Plant));
			this.getView().getModel().read("/ZAE_I_TC_SCIN_03", {
				filters: aFilter,
				success: function (oData, response) {
					if (oData.results.length > 0) {
						oModeldata.setProperty("/UIOnly/visible/ServiceEmpGrp", oData.results[0].ServiceEmpGrp);
					}
				},
				error: function (oError) {}

			});
			this.getView().getModel().read("/ZAE_I_TC_SCIN_02", {
				// filters: aFilter,
				urlParameters: {
					"$filter": "Plant  eq \'" + oParsedObject.Plant + "\'"
				},
				success: function (oData, response) {
					if (oData.results.length > 0) {
						oModeldata.setProperty("/UIOnly/text/CRMSalesOffice", oData.results[0].CRMSalesOffice);
					}
				},
				error: function (oError) {}

			});
			this.getView().getModel().read("/ZAE_I_TC_RUA_01", {
				success: function (oData, response) {
					if (oData.results.length > 0) {
						oModeldata.setProperty("/ActivityReasonData", oData.results);
					}
				},
				error: function (oError) {}

			});

			// this.fnLoadCalenderData();
			var aFilters;
			aFilters = [];
			if (oParsedObject.Plant) {
				aFilters.push(new Filter("Plant", "EQ", oParsedObject.Plant));
			}
			if (oParsedObject.SalesOffice) {
				aFilters.push(new Filter("SalesOffice", "EQ", oParsedObject.SalesOffice));
			}
			if (oParsedObject.SalesGroup) {
				aFilters.push(new Filter("SalesGroup", "EQ", oParsedObject.SalesGroup));
			}
			this._planningCalendar.getBinding("rows").filter(aFilters, sap.ui.model.FilterType.Application);
			this._planningCalendar.setViewKey("A");

		},

		handleAppointmentSelect: function (oEvent) {
			var oAppointment = oEvent.getParameter("appointment");
			if (!oAppointment) {
				sap.m.MessageToast.show("Multiple Appointments on this Point");
				return;
			}
			/*else {
				var selectedAppointment = oAppointment.getBindingContext().getModel().getProperty(oAppointment.getBindingContext().getPath());
				if (selectedAppointment.Type === "LEAVE") {
					sap.m.MessageToast.show("Employee " + selectedAppointment.EmployeeNo + " is in Leave");
					return;
				}

			}*/
			if (!this._oDetailsPopover) {
				Fragment.load({
						id: "fragDetails",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.Details",
						controller: this
					})
					.then(function (oPopoverContent) {
						this._oDetailsPopover = oPopoverContent;
						this.getView().addDependent(this._oDetailsPopover);
						this._setfragDetailsInitialState(oAppointment);
					}.bind(this));
			} else {
				this._setfragDetailsInitialState(oAppointment);
			}
		},

		_setfragDetailsInitialState: function (oAppointment) {
			var formDetail = Fragment.byId("fragDetails", "apptForm");
			/*  var Appointment = oAppointment.getProperty("key");
			    var objectType = "BUS2000126";*/
			formDetail.bindElement(oAppointment.getBindingContext().getPath());
			this._oDetailsPopover.openBy(oAppointment);
		},

		/*	_setfragDetailsInitialState_old: function (oAppointment) {
				var oAppBC = oAppointment.getBindingContext();
				var that = this;
				var objectType = oAppBC.getObject("object_type"),
					Appointment = oAppBC.getObject("Appointment");
				var vURL = "ZAE_F_Appointment(object_type='" + objectType + "',Appointment='" + Appointment + "')";
				if (that.getView().getModel().oData[vURL]) {
					oAppBC.sPath = "/" + vURL;
					that._oDetailsPopover.setBindingContext(oAppBC);
					that._oDetailsPopover.openBy(oAppointment);
					return;
				}
				vURL = "/" + vURL;
				that.getView().setBusy(true);
				this.getView().getModel().read(vURL, {

					success: function (oData, response) {
						that.getView().setBusy(false);
						oAppBC.sPath = vURL;
						that._oDetailsPopover.setBindingContext(oAppBC);
						that._oDetailsPopover.openBy(oAppointment);
					},
					error: function (oError) {
						that.getView().setBusy(false);
					}

				});
			},*/

		handleCancelButton: function () {
			this._oDetailsPopover.close();
		},

		handleAppointmentCreate: function () {
			this._oSelRowKey = null;
			var that = this;
			var oStartDate = new Date(this._planningCalendar.getStartDate());
			var oEndDate = new Date(oStartDate);
			oEndDate.setMinutes(oStartDate.getMinutes() + 30);
			this.fnCheckOpenAppointmentExistForEqui().done(function (bool) {
				if (bool) {
					//if (true) {
					that.fnExistingAppointments();
				} else {
					that._loadDialogFragment(oStartDate, oEndDate);
				}
			});
			// that._loadDialogFragment(oStartDate, oEndDate);

		},

		handleAppointmentCreateSlotSelect: function (oEvent) {
			var oModelData = this.getView().getModel("mAppointment").getData();
			var that = this;
			var currentRow = oEvent.getParameter("row");
			var oStartDate = new Date(oEvent.getParameter("startDate"));
			var oEndDate = new Date(oEvent.getParameter("startDate"));
			if (!oModelData.filters.Customer) {
				var msg = that.getView().getModel("i18n").getResourceBundle().getText("CustomerNoExist");
				sap.m.MessageToast.show(msg);
				return;
			}
			var DefaultTimeSlot = 30;
			if (currentRow.getBindingContext() && currentRow.getBindingContext().getObject().DefaultTimeSlot) {
				DefaultTimeSlot = Number(currentRow.getBindingContext().getObject().DefaultTimeSlot);
			}
			oStartDate.setSeconds("01");
			oEndDate.setMinutes(oStartDate.getMinutes() + DefaultTimeSlot);

			if (this.fnCheckEmployeeInLeave(currentRow.getKey(), oStartDate, oEndDate)) {
				// var msg1 = that.getView().getModel("i18n").getResourceBundle().getText("Employee");
				// var msg2 = that.getView().getModel("i18n").getResourceBundle().getText("isinLeave");
				// var messageShow = msg1 +" " currentRow.getKey() + msg2;
				// sap.m.MessageToast.show(messageShow);
				sap.m.MessageToast.show("Non Working Hour");
				return;
			}

			this._oSelRowKey = currentRow.getKey();
			that._loadDialogFragment(oStartDate, oEndDate);

			this.fnCheckOpenAppointmentExistForEqui().done(function (bool) {
				if (bool) {
					//if (true) {
					that.fnExistingAppointments();
				} else {
					that._loadDialogFragment(oStartDate, oEndDate);
				}
			});
			// this._loadDialogFragment(oStartDate, oEndDate);
		},

		fnCheckEmployeeInLeave: function (empID, appStartDate, appEndDate) {
			var empOnLeave = false;
			this._planningCalendar.getRows().forEach(function (rowItem, index, rowArr) {
				if (rowItem.getProperty("key") === empID) {
					rowItem.getIntervalHeaders().forEach(function (SpecialDate, index2, SpecialDateArr) {
						var empLeaveStartDate = SpecialDate.getProperty("startDate");
						var empLeaveEndDate = SpecialDate.getProperty("endDate");
						if ((appStartDate >= empLeaveStartDate && appStartDate <= empLeaveEndDate) || (appEndDate >= empLeaveStartDate && appEndDate <=
								empLeaveEndDate)) {
							empOnLeave = true;
						}

					}, this);
				}
			}, this);
			return empOnLeave;
		},

		_loadDialogFragment: function (oStartDate, oEndDate) {
			if (!this._oNewAppointmentDialog) {
				Fragment.load({
						id: "fragCreate",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.Create",
						controller: this

					})
					.then(function (oDialogContent) {
						this._createDialog(oDialogContent);
						this._setDialogInitialState(oStartDate, oEndDate);
						Fragment.byId("fragCreate", "idEmployee").getBinding("items").attachDataReceived(function (oEvent) {
							var oResults = oEvent.getParameter("data").results;
							var oModel = this.getView().getModel("mAppointment");
							var CheckCourtsyCar = oResults[0].CourtsyCarValidation;
							Fragment.byId("fragCreate", "CourtesyCar").setVisible(CheckCourtsyCar);
						}.bind(this));
					}.bind(this));
			} else {
				this._setDialogInitialState(oStartDate, oEndDate);
			}
		},

		onCampaignValueHelpRequested: function (oEvent1) {
			var input = oEvent1.getSource();
			var oModel = this.getView().getModel("mAppointment");
			var oModelData = oModel.getData();
			var SalesOrganization = oModelData.filters.SalesOrganization;
			input.setTokens([]);
			var configObject = {
				entitySet: "ZAE_VH_CampaignData",
				initiallyVisibleFields: "CampaignID,CampaignExternalID,SalesOrganization,CampaignType,CampaignTypeDescription,StartDate,EndDate ",

				selectionMode: "Single",
				tokenObject: {
					key: "CampaignID",
					Description: "CampaignExternalID"
				},
				controlConfiguration: [{
					index: 0,
					key: "SalesOrganization",
					filterType: "auto",
					label: "{/#ZAE_VH_CampaignData/SalesOrganization/@sap:label}",
					mandatory: "auto",
					visible: false
				}, {
					index: 1,
					key: "CampaignID",
					filterType: "auto",
					label: "{/#ZAE_VH_CampaignData/CampaignID/@sap:label}",
					mandatory: "auto",
					visible: true
				}, {
					index: 2,
					key: "CampaignExternalID",
					filterType: "auto",
					label: "{/#ZAE_VH_CampaignData/CampaignExternalID/@sap:label}",
					mandatory: "auto",
					visible: true
				}, {
					index: 3,
					key: "CampaignType",
					filterType: "auto",
					label: "{/#ZAE_VH_CampaignData/CampaignType/@sap:label}",
					mandatory: "auto",
					visible: false,

				}],
				defaultFilter: {
					CampaignType: {
						"items": [{
							"key": "SERVICE"
						}]
					},
					SalesOrganization: {
						"items": [{
							"key": SalesOrganization
						}]
					}
				},
				onBeforeRebindSmartTable: function (oEvent) {
					var aFilterArray = oEvent.getParameter("bindingParams").filters;
					aFilterArray.push(new sap.ui.model.Filter({
						path: "SalesOrganization",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: SalesOrganization
					}));
					aFilterArray.push(new sap.ui.model.Filter({
						path: "CampaignType",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: "SERVICE"
					}));
					oEvent.getParameter("bindingParams").filters = aFilterArray;
				}

			};

			this.aeUtil.handleSmartDialogValueHelp(this, input, configObject);
		},
		onCampaignIDTokenUpdate: function (oEvent) {
			var aTokens = oEvent.getSource().getTokens();
		},
		onSelectCampaignID: function (oEvent) {
			if (oEvent.getParameter("selectedRow") !== null) {
				var oSource = oEvent.getSource();
				oSource.setTokens([]);
				var oSelectedData = oEvent.getParameter("selectedRow").getBindingContext().getObject();
				var oText = this.formatNameAndValuePair(oSelectedData.CampaignID, oSelectedData.CampaignExternalID);
				var oToken = new sap.m.Token({
					key: oSelectedData.CampaignID,
					text: oText
				});
				oSource.setTokens([oToken]);
				oSource.fireTokenUpdate();
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
		handleCampaignSuggest: function (oEvent) {
			var oModel = this.getView().getModel("mAppointment");
			var oModelData = oModel.getData();
			var SalesOrganization = oModelData.filters.SalesOrganization;
			var sTerm = oEvent.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter({
					filters: [
						new Filter({
							path: "CampaignID",
							operator: sap.ui.model.FilterOperator.StartsWith,
							value1: sTerm
						}),
						new Filter({
							path: "CampaignExternalID",
							operator: sap.ui.model.FilterOperator.StartsWith,
							value1: sTerm
						})

					],
					and: false
				}));
				aFilters.push(new sap.ui.model.Filter({
					path: "SalesOrganization",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: SalesOrganization
				}));
				aFilters.push(new sap.ui.model.Filter({
					path: "CampaignType",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: "SERVICE"
				}));
			}
			oEvent.getSource().getBinding("suggestionRows").filter(aFilters);
			oEvent.getSource().getBinding("suggestionRows").resume();
		},

		handleStartDateChange: function () {
			var oDateTimePickerStart = Fragment.byId("fragCreate", "startDate").getDateValue();
			var oDateTimePickerEnd = Fragment.byId("fragCreate", "endDate").getDateValue();
			var oCurrentData = new Date();
			if ((oDateTimePickerStart < oCurrentData) || (oDateTimePickerStart >= oDateTimePickerEnd)) {
				Fragment.byId("fragCreate", "startDate").setValueState("Error");
			} else {
				Fragment.byId("fragCreate", "startDate").setValueState("None");
				Fragment.byId("fragCreate", "endDate").setValueState("None");
			}
			this.updateButtonEnabledState();
		},

		handleEndDateChange: function () {
			var oDateTimePickerStart = Fragment.byId("fragCreate", "startDate").getDateValue();
			var oDateTimePickerEnd = Fragment.byId("fragCreate", "endDate").getDateValue();
			var oCurrentData = new Date();
			if ((oDateTimePickerEnd < oCurrentData) || (oDateTimePickerStart >= oDateTimePickerEnd)) {
				Fragment.byId("fragCreate", "endDate").setValueState("Error");
			} else {
				Fragment.byId("fragCreate", "endDate").setValueState("None");
				Fragment.byId("fragCreate", "startDate").setValueState("None");
			}
			this.updateButtonEnabledState();
		},

		_createDialog: function (oDialogContent) {
			var oDateTimePickerStart;
			var oDateTimePickerEnd;
			var oInputTitle;
			var oInputEmployee;
			var oInputEmployeeResp;
			var sPickUpChk;
			var oModelData;
			var Note;
			var oServiceEmpGrp;
			var oSrvEmpGrpCheck;
			var oCourtesyCar;
			var that = this;
			var ReasonObj;
			var Address;
			var Location;
			//	var Zone;
			var TransitTime;
			var oSalesgroup;
			var oSalesoffice;
			var oDomain

			this._oNewAppointmentDialog = new Dialog({
				title: "{i18n>Addappointment}",
				width: "640px",
				content: [
					oDialogContent
				],
				buttons: [

					new Button({
						text: "{i18n>Create}",
						enabled: "{mAppointment>/UIOnly/enable/CreateAppointment}",
						press: function () {
							var oResourceBundle = that.getView().getModel("i18n").getResourceBundle();
							Fragment.byId("fragCreate", "SCINCreateMessageStrip").setType("Error");
							oSrvEmpGrpCheck = this.getView().getModel("mAppointment").getData().UIOnly.visible.ServiceEmpGrp;
							oDateTimePickerStart = Fragment.byId("fragCreate", "startDate").getDateValue();
							oDateTimePickerEnd = Fragment.byId("fragCreate", "endDate").getDateValue();
							oInputTitle = Fragment.byId("fragCreate", "appTitle").getValue();
							oDateTimePickerStart.setSeconds(oDateTimePickerStart.getSeconds() + 1);
							if (oInputTitle.length > 38) {
								var TrimmedoInputTitle = oInputTitle.substring(0, 38);
								oInputTitle = TrimmedoInputTitle;
							}
							oServiceEmpGrp = oSrvEmpGrpCheck ? Fragment.byId("fragCreate", "idSEmpGrp").getSelectedKey() : " ";
							oInputEmployeeResp = Fragment.byId("fragCreate", "idEmployee").getSelectedKey();
							//sPickUpChk = Fragment.byId("fragCreate", "pickUpDD").getSelectedKey();
							oModelData = this.getView().getModel("mAppointment").getData();
							Note = Fragment.byId("fragCreate", "Note").getValue();
							oCourtesyCar = Fragment.byId("fragCreate", "CourtesyCar").getSelectedKey();
							Address = Fragment.byId("fragCreate", "idAddress").getValue();
							Location = Fragment.byId("fragCreate", "Location").getSelectedKey();
							//	Zone = Fragment.byId("fragCreate", "Zone").getSelectedKey();
							TransitTime = Fragment.byId("fragCreate", "TransitTime").getValue();
							oDomain = Fragment.byId("fragCreate", "IdDomainValue").getSelectedKey();
							var CampaignID;
							if (Fragment.byId("fragCreate", "CampaignID").getTokens().length > 0) {
								CampaignID = Fragment.byId("fragCreate", "CampaignID").getTokens()[0].getKey();
							}

							oSalesgroup = Fragment.byId("fragCreate", "IdSalesgroup").getSelectedItem() !== null ? Fragment.byId("fragCreate",
								"IdSalesgroup").getSelectedItem().getBindingContext().getModel().getProperty(Fragment.byId("fragCreate", "IdSalesgroup")
								.getSelectedItem().getBindingContext().sPath).CRMSalesGroup : "";

							oSalesoffice = Fragment.byId("fragCreate", "IdSalesoffice").getSelectedItem() !== null ? Fragment.byId("fragCreate",
								"IdSalesoffice").getSelectedItem().getBindingContext().getModel().getProperty(Fragment.byId("fragCreate",
								"IdSalesoffice").getSelectedItem().getBindingContext().sPath).CRMSalesOffice : "";

							ReasonObj = that.getView().getModel().getProperty(Fragment.byId("fragCreate", "reasonInput").getSelectedItem().getBindingContext()
								.sPath);

							if (this.fnCheckEmployeeInLeave(oInputEmployeeResp, oDateTimePickerStart, oDateTimePickerEnd)) {
								var msg1 = this.getView().getModel("i18n").getResourceBundle().getText("Employee");
								var msg2 = this.getView().getModel("i18n").getResourceBundle().getText("isinLeave");
								var msg = msg1 + oInputEmployeeResp + msg2;
								sap.m.MessageToast.show(msg);
								return;
							}

							if (this.fnCheckAppointmentExists(oInputEmployeeResp, oDateTimePickerStart, oDateTimePickerEnd)) {
								var MessageStrip = Fragment.byId("fragCreate", "SCINCreateMessageStrip");
								MessageStrip.setVisible(true).setText(this.getView().getModel("i18n").getResourceBundle().getText("AppoitnmentExits"));
								return;
							}

							if (Fragment.byId("fragCreate", "startDate").getValueState() !== "Error" && Fragment.byId("fragCreate", "endDate").getValueState() !==
								"Error") {

								var epoch = null;
								epoch = new Date(oDateTimePickerStart);
								epoch.setHours(epoch.getHours());
								var IStartDate = "\/Date(" + epoch.getTime() + ")\/";
								var IStartTime = "PT" +
									("00" + epoch.getHours()).slice(-2) +
									"H" +
									("00" + epoch.getMinutes()).slice(-2) +
									"M" +
									("00" + epoch.getSeconds()).slice(-2) +
									"S";

								epoch = new Date(oDateTimePickerEnd);
								epoch.setHours(epoch.getHours());
								var IEndDate = "\/Date(" + epoch.getTime() + ")\/";
								var IEndTime = "PT" +
									("00" + epoch.getHours()).slice(-2) +
									"H" +
									("00" + epoch.getMinutes()).slice(-2) +
									"M" +
									("00" + epoch.getSeconds()).slice(-2) +
									"S";

								var oEntity = "ZAE_FM_SCIN_CREAAPP_FROM_CI_03Set"; // "ZAE_FM_SCIN_CREAAPP_FROM_CI_02Set"; //"ZAE_FM_SCIN_CREAAPP_FROM_CIAPPSet";
								var oModel = this.getView().getModel("ZAE_FM_SCIN_CREAAPP_FROM_CI_03_SRV");
								var N_CI03 = [{
									"IDescription": oInputTitle,
									"IEquipNo": oModelData.filters.Equipment,
									"IPartner": oModelData.filters.Customer,
									"CPerson": oModelData.filters.CPerson,
									"IEmpResp": oInputEmployeeResp,
									"IStartDate": IStartDate,
									"IStartTime": IStartTime,
									"IEndDate": IEndDate,
									"IEndTime": IEndTime,
									// "ICatId01": oModelData.filters.Category,
									"IPlant": oModelData.filters.Plant,
									"A002Text": Note,
									"SalesOrg": oModelData.filters.SalesOrganization,
									"DisChannel": oModelData.filters.DistrChannel,
									"Division": oModelData.filters.Division,
									"ISerEmpGrp": oServiceEmpGrp,
									"ProgNo": oCourtesyCar,
									"SubjectProfile": ReasonObj.SubjectProfile,
									"CatType": ReasonObj.Catlog,
									"CodeGroup": ReasonObj.CodeGroup,
									"Code": ReasonObj.Code,
									//"Zzone": Zone,
									"NoOfMinutes": TransitTime,
									"Location": Location,
									"Address": Address,
									"SalesOffice": oSalesoffice,
									"SalesGroup": oSalesgroup,
									"CmpgnId": CampaignID,
									"IInsurer": oModelData.filters.Insurer ? oModelData.filters.Insurer : "",
									"Dataprivacyclause": oDomain
								}];
								if (this.Lead !== "") {
									N_CI03[0]["LeadId"] = this.Lead;
								}

								var N_CATID = [];
								for (var i = 0; i < oModelData.filters.Category.length; i++) {
									N_CATID.push({
										"CatId": oModelData.filters.Category[i].key
									});
								}

								var data = [{
									callProperty: "N_CI03",
									value: N_CI03
								}, {
									callProperty: "N_CATID",
									value: N_CATID
								}];
								var succFunc = function (oData) {
									var message1 = that.getView().getModel("i18n").getResourceBundle().getText("Created");
									var message2 = that.getView().getModel("i18n").getResourceBundle().getText("Successfully");
									var EActivityNo = "";
									if (oData.N_CI03.results.length > 0 && oData.N_CI03.results[0].EActivityNo) {
										EActivityNo = oData.N_CI03.results[0].EActivityNo;
									} else {
										return;
									}
									var addmsg = new sap.ui.core.message.Message({
										persistent: true,
										code: EActivityNo,
										type: sap.ui.core.MessageType.Success,
										// message: "{i18n>Created} " + oData.EActivityNo + " {i18n>Successfully}",
										message: message1 + EActivityNo + " " + message2,
										additionalText: "",
										description: ""
									});
									sap.ui.getCore().getMessageManager().addMessages(addmsg);
									that.RecentAppointment = EActivityNo;
									var mAppointmentChart = that.getView().getModel("mAppointmentChart");
									mAppointmentChart.getData().mAppointmentChartRefreshRequired = true;
									that.getView().getModel().refresh();
								};

								var errFunc = function (oData) {
									that.RecentAppointment = undefined;
									// that.fnLoadCalenderData();
									var mAppointmentChart = that.getView().getModel("mAppointmentChart");
									mAppointmentChart.getData().mAppointmentChartRefreshRequired = true;
									that.getView().getModel().refresh();
								};

								this.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
								this._oNewAppointmentDialog.close();

							}

						}.bind(this)
					}),
					new Button({
						text: "Close",
						press: function () {
							this._oNewAppointmentDialog.close();
						}.bind(this)
					})
				]

			});

			oInputEmployee = Fragment.byId("fragCreate", "idEmployee");
			this._oNewAppointmentDialog.addEventDelegate({
				onBeforeRendering: function (oEvent) {
					var oBinding = oInputEmployee.getBinding("items");

					this.setBindingFilter(oBinding);
				}
			}, this);

			oInputEmployee.addEventDelegate({
				onBeforeRendering: function (oEvent) {
					if (this._oSelRowKey !== null) {
						var oSelectedItem = oInputEmployee.getItems().filter(function (oItem) {
							return oItem.getKey() === this._oSelRowKey;
						}.bind(this))[0];
						oInputEmployee.setSelectedItem(oSelectedItem);
					} else {
						oInputEmployee.setSelectedItem(null);
					}
				}
			}, this);
			this._oNewAppointmentDialog.addStyleClass("sapUiContentPadding");
			this.getView().addDependent(this._oNewAppointmentDialog);
			Fragment.byId("fragCreate", "IdSalesoffice").getBinding("items").attachDataReceived(function (oEvent) {
				this.updateButtonEnabledState();
			}, this);
			Fragment.byId("fragCreate", "IdSalesgroup").getBinding("items").attachDataReceived(function (oEvent) {
				this.updateButtonEnabledState();
			}, this);
			// this.fnCheckAppointmentExists();
		},

		setBindingFilter: function (oBinding) {
			var aFilters = [];
			var oModelData = this.getView().getModel("mAppointment").getData();

			if (oModelData.filters.Plant) {
				aFilters.push(new Filter("Plant", "EQ", oModelData.filters.Plant));
			}
			if (oModelData.filters.SalesOffice) {
				aFilters.push(new Filter("SalesOffice", "EQ", oModelData.filters.SalesOffice));
			}
			if (oModelData.filters.SalesGroup) {
				aFilters.push(new Filter("SalesGroup", "EQ", oModelData.filters.SalesGroup));
			}
			oBinding.filter(aFilters, "Application");

		},

		fnAddLocZoneTime: function () {
			var that = this;
			var CheckCaptureAdrs = Fragment.byId("fragCreate", "CourtesyCar").getSelectedItem().getBindingContext().getObject().CaptureAdrs;
			Fragment.byId("fragCreate", "idAddress").setVisible(CheckCaptureAdrs);
			Fragment.byId("fragCreate", "Location").setVisible(CheckCaptureAdrs);
			//Fragment.byId("fragCreate", "Zone").setVisible(CheckCaptureAdrs);
			Fragment.byId("fragCreate", "TransitTime").setVisible(CheckCaptureAdrs);
			var mAppointment = this.getView().getModel("mAppointment");
			var mAppointmentData = mAppointment.getData();

			var aFilter = [];
			if (mAppointmentData.filters.Plant) {
				aFilter.push(new Filter("Plant", "EQ", mAppointmentData.filters.Plant));
			}
			//	this.getView().setBusy(true);
			this.getView().getModel().read("/ZAE_I_TC_CUPG_03", {
				filters: aFilter,
				success: function (oData, response) {

					that._fnLocation(oData.results);
				},
				error: function (oError) {
					// that.getView().setBusy(false);
				}

			});
		},

		_fnLocation: function (results) {
			var mAppointment = this.getView().getModel("mAppointment");
			var mLocation = mAppointment.getData();
			mLocation.Clocation = results;
			mAppointment.updateBindings(true);
			this.fnChangeLocation();
		},

		handleChangeTime: function () {
			var TransitTime = Fragment.byId("fragCreate", "TransitTime");
			TransitTime.setValue(TransitTime.getValue().replace(/[^0-9+()]+/g, "").slice(0, 4));
		},

		fnChangeLocation: function () {
			var mAppointment = this.getView().getModel("mAppointment");
			var mAppointmentData = mAppointment.getData();
			var TransitTime = mAppointmentData.Clocation;
			//	var Zone = mAppointmentData.Clocation;
			var oLocation = Fragment.byId("fragCreate", "Location").getSelectedKey();
			// if (oLocation && mAppointmentData.filters.Plant) {
			// 	var zZoneData = Zone.filter(function (ele) {
			// 		return ele.Location === oLocation && ele.Plant === mAppointmentData.filters.Plant;
			// 	});
			// 	mAppointmentData.zZone = zZoneData;
			// }
			// mAppointment.updateBindings(true);
			// if (oLocation) {
			// 	Fragment.byId("fragCreate", "Zone").setEnabled(true);
			// }

			if (oLocation && mAppointmentData.filters.Plant) {
				var TransitTimeData = TransitTime.filter(function (ele) {
					return ele.Location === oLocation && ele.Plant === mAppointmentData.filters.Plant;
				});
				mAppointmentData.TransitTime = TransitTimeData;
			}
			if (TransitTimeData && TransitTimeData.length === 1) {
				Fragment.byId("fragCreate", "TransitTime").setValue(TransitTimeData[0].NoOfMinutes);
			}
			mAppointment.updateBindings(true);
			if (oLocation) {
				Fragment.byId("fragCreate", "TransitTime").setEnabled(true);
			}
		},
		// fnChangeZone: function () {
		// 	var mAppointment = this.getView().getModel("mAppointment");
		// 	var mAppointmentData = mAppointment.getData();
		// 	var TransitTime = mAppointmentData.Clocation;
		// 	var oLocation = Fragment.byId("fragCreate", "Location").getSelectedKey();
		// 	var Zone = Fragment.byId("fragCreate", "Zone").getSelectedKey();
		// 	if (oLocation && mAppointmentData.filters.Plant && Zone) {
		// 		var TransitTimeData = TransitTime.filter(function (ele) {
		// 			return ele.Location === oLocation && ele.Plant === mAppointmentData.filters.Plant && ele.Zzone === Zone;
		// 		});
		// 		mAppointmentData.TransitTime = TransitTimeData;
		// 	}
		// 	if (TransitTimeData.length === 1) {
		// 		Fragment.byId("fragCreate", "TransitTime").setValue(TransitTimeData[0].NoOfMinutes);
		// 	}
		// 	mAppointment.updateBindings(true);
		// 	Fragment.byId("fragCreate", "TransitTime").setEnabled(true);
		// },

		_setDialogInitialState: function (oStartDate, oEndDate) {
			var oModelData = this.getView().getModel("mAppointment").getData();
			var oDateTimePickerStart = Fragment.byId("fragCreate", "startDate");
			var oDateTimePickerEnd = Fragment.byId("fragCreate", "endDate");

			oDateTimePickerStart.setDateValue(oStartDate);
			oDateTimePickerEnd.setDateValue(oEndDate);
			this.handleStartDateChange();
			this.handleEndDateChange();

			var concatCustomer;
			var concatCPerson;
			var aFilters = [];
			aFilters.push(new Filter("TransactionType", "EQ", oModelData.filters.TransactionType));
			Fragment.byId("fragCreate", "reasonInput").getBinding("items").filter(aFilters);
			if (!Fragment.byId("fragCreate", "reasonInput").getBinding("items").sFilterParams.includes("%27")) {
				aFilters[0].oValue1 = "'" + oModelData.filters.TransactionType + "'";
				Fragment.byId("fragCreate", "reasonInput").getBinding("items").filter(aFilters);
			}
			if (oModelData.filters.Customer && oModelData.filters.CustomerName) {
				concatCustomer = oModelData.filters.CustomerName + " (" + oModelData.filters.Customer + ")";
			} else {
				concatCustomer = oModelData.filters.Customer;
			}

			if (oModelData.filters.CPerson && oModelData.filters.CPersonName) {
				concatCPerson = oModelData.filters.CPersonName + " (" + oModelData.filters.CPerson + ")";
			} else {
				concatCPerson = oModelData.filters.CPerson;
			}
			if (oModelData.UIOnly.text.Plant) {
				var plant = oModelData.UIOnly.text.Plant;
				// var aPlantFilter1 = [];
				var aPlantFilter = [];
				aPlantFilter.push(new Filter("Plant", sap.ui.model.FilterOperator.EQ, plant));
				// aPlantFilter1.push(new Filter("MaintPlanPlant", sap.ui.model.FilterOperator.EQ, plant));
				// if (oModelData.UIOnly.text.CRMSalesOffice !== "") {
				// 	aPlantFilter1.push(new Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, oModelData.UIOnly.text.CRMSalesOffice));
				// }
				var SalesOffice = oModelData.UIOnly.text.CRMSalesOffice;
				var SalesGroup = oModelData.UIOnly.text.SalesGroup;
				var SalesOffOrg = [];
				SalesOffOrg.push(new Filter("Vkbur", sap.ui.model.FilterOperator.EQ, SalesOffice));
				SalesOffOrg.push(new Filter("SalesGroup", sap.ui.model.FilterOperator.EQ, SalesGroup));
				SalesOffOrg.push(new Filter("Process_Type", sap.ui.model.FilterOperator.EQ, oModelData.filters.TransactionType));
				Fragment.byId("fragCreate", "idSEmpGrp").getBinding("items").filter(aPlantFilter);
				//	Fragment.byId("fragCreate", "CourtesyCar").getBinding("items").filter(aPlantFilter);
				Fragment.byId("fragCreate", "CourtesyCar").getBinding("items").filter(SalesOffOrg);
				Fragment.byId("fragCreate", "IdSalesoffice").getBinding("items").filter(aPlantFilter);
				var aSalesgroupFilter = [];
				aSalesgroupFilter.push(new Filter("Plant", sap.ui.model.FilterOperator.EQ, plant));
				if (oModelData.filters.SalesOffice) {
					aSalesgroupFilter.push(new Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, oModelData.filters.SalesOffice));
					Fragment.byId("fragCreate", "IdSalesoffice").setSelectedKey(oModelData.filters.SalesOffice);
				}
				Fragment.byId("fragCreate", "IdSalesgroup").getBinding("items").filter(aSalesgroupFilter);
			}
			Fragment.byId("fragCreate", "idAddress").setVisible(false);
			Fragment.byId("fragCreate", "Location").setVisible(false);
			//	Fragment.byId("fragCreate", "Zone").setVisible(false);
			Fragment.byId("fragCreate", "TransitTime").setVisible(false);
			Fragment.byId("fragCreate", "idAddress").setValue("");
			Fragment.byId("fragCreate", "Location").setSelectedKey();
			if (oModelData.filters.CampaignID) {
				var oText = this.formatNameAndValuePair(oModelData.filters.Cmpgn_extid, oModelData.filters.CampaignID);
				var oToken = new sap.m.Token({
					key: oModelData.filters.CampaignID,
					text: oText
				});
				Fragment.byId("fragCreate", "CampaignID").setTokens([oToken]);
			} else {
				Fragment.byId("fragCreate", "CampaignID").setTokens([]);
			}

			var Domain = Fragment.byId("fragCreate", "IdDomainValue");
			var oMake = oModelData.filters.Make;
			var oSalesgroup = oModelData.filters.SalesGroup;
			if (!oSalesgroup.startsWith('B')) {
				if (oMake === "CAD" || oMake === "CHV") {
					// if (oMake === "MCLAREN") {
					Fragment.byId("fragCreate", "IdDomainValue").setSelectedKey("2");
					Fragment.byId("fragCreate", "IdDomainValue").setEnabled(true);
				} else {
					Fragment.byId("fragCreate", "IdDomainValue").setSelectedKey();
					Fragment.byId("fragCreate", "IdDomainValue").setEnabled(false);
				}
			} else {
				Fragment.byId("fragCreate", "IdDomainValue").setSelectedKey();
				Fragment.byId("fragCreate", "IdDomainValue").setEnabled(false);
			}
			Domain.addEventDelegate({
				onAfterRendering: function (oEvent1) {
					this.updateButtonEnabledState();
				}
			}, this);

			//	Fragment.byId("fragCreate", "Zone").setSelectedKey();
			Fragment.byId("fragCreate", "TransitTime").setValue("");
			//	Fragment.byId("fragCreate", "Zone").setEnabled(false);
			Fragment.byId("fragCreate", "TransitTime").setEnabled(false);
			Fragment.byId("fragCreate", "IdSalesgroup").setSelectedKey(oModelData.UIOnly.text.SalesGroup);
			Fragment.byId("fragCreate", "Customer").setValue(concatCustomer);
			Fragment.byId("fragCreate", "CPerson").setValue(concatCPerson);
			Fragment.byId("fragCreate", "CourtesyCar").setSelectedKey();
			Fragment.byId("fragCreate", "Note").setValue("");
			Fragment.byId("fragCreate", "appTitle").setValue(oModelData.filters.Description);
			//Fragment.byId("fragCreate", "pickUpDD").setSelectedKey(null);
			Fragment.byId("fragCreate", "SCINCreateMessageStrip").setVisible(false);
			Fragment.byId("fragCreate", "SCINCreateMessageStrip").setText("");
			// Fragment.byId("fragCreate", "IdDomainValue").setSelectedKey(null);

			oModelData.UIOnly.visible.PlateNo = false;
			oModelData.UIOnly.visible.Customer = false;

			this.fnCheckOpenAppointmentExistForEqui();
			this.updateButtonEnabledState();
			// this._oNewAppointmentDialog.open();
		},

		updateButtonEnabledState: function () {
			var oModel = this.getView().getModel("mAppointment");
			var oDateTimePickerStart = Fragment.byId("fragCreate", "startDate");
			var Salesoffice = Fragment.byId("fragCreate", "IdSalesoffice").getSelectedItem();
			var Salesgroup = Fragment.byId("fragCreate", "IdSalesgroup").getSelectedItem();
			var oDateTimePickerEnd = Fragment.byId("fragCreate", "endDate");
			var MessageStrip = Fragment.byId("fragCreate", "SCINCreateMessageStrip");
			var oInputTitle = Fragment.byId("fragCreate", "appTitle").getValue();
			var oDomain = Fragment.byId("fragCreate", "IdDomainValue").getSelectedKey();
			var oDomainCheck;
			var oModelData = oModel.getData();
			var oMake = oModelData.filters.Make;
			var oSalesgroup = oModelData.filters.SalesGroup;
			if (!oSalesgroup.startsWith('B')) {
				if (oMake === "CAD" || oMake === "CHV") {
					oDomainCheck = (oDomain ===
						"2" || oDomain ===
						"3"
					) ? true : false;

				} else {
					// Fragment.byId("fragCreate", "IdDomainValue").setSelectedKey();
					oDomainCheck = oDomain === "1" ? true : false;
				}
			} else {
				// Fragment.byId("fragCreate", "IdDomainValue").setSelectedKey();
				oDomainCheck = oDomain === "1" ? true : false;
			}
			var bEnabled = oInputTitle !== "" && oDateTimePickerStart.getValueState() !== "Error" && oDateTimePickerStart.getDateValue() !== "" &&
				oDateTimePickerEnd
				.getDateValue() !==
				"" && oDateTimePickerEnd.getValueState() !== "Error" && !MessageStrip.getProperty("visible") && Salesgroup !== null && Salesoffice !==
				null && oDomainCheck;

			oModelData.UIOnly.enable.CreateAppointment = bEnabled;
			oModel.updateBindings(true);
		},

		fnLoadCalenderData: function () {
			var mAppointment = this.getView().getModel("mAppointment");
			var mAppointmentData = mAppointment.getData();
			var that = this;
			var aFilters;
			aFilters = [];
			if (mAppointmentData.filters.Plant) {
				aFilters.push(new Filter("Plant", "EQ", mAppointmentData.filters.Plant));
			}
			if (mAppointmentData.filters.SalesOffice) {
				aFilters.push(new Filter("SalesOffice", "EQ", mAppointmentData.filters.SalesOffice));
			}
			if (mAppointmentData.filters.SalesGroup) {
				aFilters.push(new Filter("SalesGroup", "EQ", mAppointmentData.filters.SalesGroup));
			}

			this.getView().setBusy(true);
			this.getView().getModel().read("/ZAE_I_Employee_02", {
				filters: aFilters,
				urlParameters: {
					$expand: ["to_Appointment_01", "to_EMPL_LEAVES_03"]
				},
				success: function (oDataResult, response) {
					mAppointmentData.EmployeeAppointments = oDataResult.results;
					if (that.RecentAppointment) {
						mAppointmentData.EmployeeAppointments.forEach(function (EmployeeItem, EmployeeIndex, EmployeeArr) {
							EmployeeItem.to_Appointment_01.results.forEach(function (AppointmentItem, AppointmentIndex, AppointmentIArr) {
								if (AppointmentItem.Appointment === that.RecentAppointment) {
									AppointmentItem.icon = "sap-icon://activate";
								}

							});

						});

					}
					console.log(mAppointmentData.EmployeeAppointments);
					that.getView().setBusy(false);
					mAppointment.updateBindings(true);

				},
				error: function (oError) {
					console.log(oError);
					that.getView().setBusy(false);
				}

			});

		},

		isAppointmentOverlap: function (oEvent, oCalendarRow) {
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate"),
				bAppointmentOverlapped;
			var sDateTime = oStartDate;
			sDateTime.setHours(sDateTime.getHours());
			var eDateTime = oEndDate;
			eDateTime.setHours(eDateTime.getHours());
			var msg = this.getView().getModel("i18n").getResourceBundle().getText("OVER_LAP");

			bAppointmentOverlapped = oCalendarRow.getAppointments().some(function (oCurrentAppointment) {
				if (oCurrentAppointment === oAppointment) {
					return;
				}

				var oAppStartTime = oCurrentAppointment.getStartDate().getTime(),
					oAppEndTime = oCurrentAppointment.getEndDate().getTime();

				if (oAppStartTime <= sDateTime && sDateTime < oAppEndTime) {
					sap.m.MessageToast.show(msg);
					return true;
				}

				if (oAppStartTime < eDateTime && eDateTime <= oAppEndTime) {
					sap.m.MessageToast.show(msg);
					return true;
				}

				if (sDateTime <= oAppStartTime && oAppStartTime < eDateTime) {
					return true;
				}
			});

			return bAppointmentOverlapped;
		},

		handleAppointmentDrop: function (oEvent) {
			var that = this;
			if (this.isAppointmentOverlap(oEvent, oEvent.getParameter("calendarRow"))) {
				oEvent.preventDefault();
				return;
			}
			var AppointmentRow = oEvent.getParameter("appointment").getBindingContext().getObject();
			var vStartingPointAdvisor = oEvent.getParameter("appointment").getParent().getTitle();
			var vEndingPointAdvisor = oEvent.getSource().getKey();
			if (vEndingPointAdvisor.replace(/^0+/, "") !== AppointmentRow.person_resp) {
				oEvent.preventDefault();
				return;
			}
			// if (vStartingPointAdvisor.toUpperCase() !== vEndingPointAdvisor.toUpperCase()) {
			// 	var oMessageManager = sap.ui.getCore().getMessageManager();
			// 	var oMessages = [];
			// 	var oMessage = new sap.ui.core.message.Message({
			// 		message: "Not Possible for Other Advisor.",
			// 		persistent: true, // make message transient
			// 		type: sap.ui.core.MessageType.Warning
			// 	});
			// 	oMessages.push(oMessage);
			// 	oMessageManager.addMessages(oMessages);
			// 	return;
			// }
			var oAppointment = oEvent.getParameter("appointment"),
				oStartDate = oEvent.getParameter("startDate"),
				oEndDate = oEvent.getParameter("endDate");

			var IActivityNo = oAppointment.getKey();
			var epoch = null;
			epoch = new Date(oStartDate);
			epoch.setHours(epoch.getHours());
			var IStartDate = "\/Date(" + epoch.getTime() + ")\/";
			var IStartTime = "PT" +
				("00" + epoch.getHours()).slice(-2) +
				"H" +
				("00" + epoch.getMinutes()).slice(-2) +
				"M" +
				("00" + epoch.getSeconds()).slice(-2) +
				"S";

			epoch = new Date(oEndDate);
			epoch.setHours(epoch.getHours());
			var IEndDate = "\/Date(" + epoch.getTime() + ")\/";
			var IEndTime = "PT" +
				("00" + epoch.getHours()).slice(-2) +
				"H" +
				("00" + epoch.getMinutes()).slice(-2) +
				"M" +
				("00" + epoch.getSeconds()).slice(-2) +
				"S";

			var oEntity = "ZAE_FM_SC_ACTIVITY_CHANGESet";
			var oModel = this.getView().getModel();
			var data = [{
				callProperty: "IActivityNo",
				value: IActivityNo
			}, {
				callProperty: "IStartTime",
				value: IStartTime
			}, {
				callProperty: "IStartDate",
				value: IStartDate
			}, {
				callProperty: "IEndTime",
				value: IEndTime
			}, {
				callProperty: "IEndDate",
				value: IEndDate
			}, {
				callProperty: "IEmpResp",
				value: vEndingPointAdvisor
			}];

			var succFunc = function (oData) {
				var message1 = that.getView().getModel("i18n").getResourceBundle().getText("Created");
				var message2 = that.getView().getModel("i18n").getResourceBundle().getText("Successfully");
				var msg = new sap.ui.core.message.Message({
					persistent: true,
					code: oData.EActivityNo,
					type: sap.ui.core.MessageType.Success,
					message: message1 + oData.EActivityNo + message2,
					additionalText: "",
					description: ""
				});
				sap.ui.getCore().getMessageManager().addMessages(msg);
				that.RecentAppointment = oData.EActivityNo;
				that.fnLoadCalenderData();
			};

			var errFunc = function (oData) {
				that.getView().getModel().refresh();
				that.fnLoadCalenderData();
			};
			this.aeUI5Util.createCall(that, oModel, oEntity, data, succFunc, errFunc);
		},

		fnNavigationToAppointment: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var oBindingContextsModel = oEvent.getSource().oPropagatedProperties.oBindingContexts.undefined.getModel();
			var sPath = oEvent.getSource().oPropagatedProperties.oBindingContexts.undefined.sPath;
			var oData = oBindingContextsModel.getProperty(sPath);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Appointment",
					action: "aeDisplay&//ZAE_C_Appointment_01(object_type='" + oData.ObjectType + "',Appointment='" + oData.Appointment +
						"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)"
				}
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});
		},

		fnCheckOpenAppointmentExistForEqui: function () {
			// var oDeffred = new jQuery.Deferred();
			// var that = this;
			// var existOpenAppt = false;
			// var ExistingAppointments = [];
			var oModelData = this.getView().getModel("mAppointment").getData();
			// var aFilters = [];
			// aFilters.push(new sap.ui.model.Filter("UserStatus", sap.ui.model.FilterOperator.EQ, "E0001"));
			// // aFilters.push(new sap.ui.model.Filter("UserStatus", sap.ui.model.FilterOperator.EQ, "E0002"));
			// // aFilters.push(new sap.ui.model.Filter("UserStatus", sap.ui.model.FilterOperator.EQ, "E0008"));
			// aFilters.push(new sap.ui.model.Filter("Equipment_disp", sap.ui.model.FilterOperator.EQ, oModelData.filters.Equipment));
			// this.getView().getModel().read("/ZAE_I_Appointment_03", {
			// 	filters: aFilters,
			// 	success: function (oData, response) {
			// 		if (oData.results.length > 0) {
			// 			existOpenAppt = true;
			// 			for (var i = 0; i < oData.results.length; i++) {
			// 				ExistingAppointments.push(oData.results[i]);
			// 			}
			// 			that.getView().getModel("mAppointment").setProperty("/OpenAppointments", ExistingAppointments);
			// 		}
			// 		oDeffred.resolve(existOpenAppt);
			// 	},
			// 	error: function (oError) {
			// 		oDeffred.resolve(true);
			// 	}
			// });
			// return oDeffred;

			var oDeffred = new jQuery.Deferred();
			var that = this;
			var existOpenAppt = false;
			var ExistingAppointments = [];
			// var PageData = that.getView().byId("SCIN_BoxSearchResults").getBindingContext().getObject();
			// var oSelectedItemData = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedItem().getBindingContext().getObject();
			// var SalesOffice = Fragment.byId("fragSelectSOSG", "IdSalesoffice").getSelectedKey();
			// var SalesGroup = Fragment.byId("fragSelectSOSG", "IdSalesgroup").getSelectedKey();
			// var oContext = this.byId("SmartTableSalesArea").getTable().getSelectedItem().getBindingContext();
			// var oSelectedItem = oContext.getModel().getProperty(oContext.getPath());
			// var CurrentDate = new Date();
			var AppointmentSelectDate = new Date(this.getView().byId("SCIN_SAPlanCal").getStartDate());
			var aFilters = [];
			aFilters.push(new sap.ui.model.Filter("UserStatus", sap.ui.model.FilterOperator.EQ, "E0001"));
			aFilters.push(new sap.ui.model.Filter("fromdate", sap.ui.model.FilterOperator.EQ, AppointmentSelectDate));
			if (oModelData.filters.AppointmentRule === "3") {
				aFilters.push(new sap.ui.model.Filter("SalesOrgSd", sap.ui.model.FilterOperator.EQ, oModelData.filters.SalesOrganization));
			} else {
				// aFilters.push(new sap.ui.model.Filter("s4_sales_grp", sap.ui.model.FilterOperator.EQ, SalesGroup));
				aFilters.push(new sap.ui.model.Filter("SalesOfficeSd", sap.ui.model.FilterOperator.EQ, oModelData.filters.SalesOffice));
			}
			aFilters.push(new sap.ui.model.Filter("Equipment_disp", sap.ui.model.FilterOperator.EQ, oModelData.filters.Equipment));
			this.getView().setBusy(true);
			this.getView().getModel().read("/ZAE_I_Appointment_22", {
				filters: aFilters,
				success: function (oData, response) {
					that.getView().setBusy(false);
					if (oData.results.length > 0) {
						existOpenAppt = true;
						for (var i = 0; i < oData.results.length; i++) {
							ExistingAppointments.push(oData.results[i]);
						}
						that.getView().getModel("mCustIdentification").setProperty("/OpenAppointments", ExistingAppointments);
					} else {
						that._oNewAppointmentDialog.open();
					}
					oDeffred.resolve(existOpenAppt);
				},
				error: function (oError) {
					that.getView().setBusy(false);
					oDeffred.resolve(true);
				}
			});
			return oDeffred;
		},

		fnCourtesyCarSelect: function (oEvent) {
			var oModel = this.getView().getModel("mAppointment");
			var oModelData = this.getView().getModel("mAppointment").getData();
			var PickUpChk = Fragment.byId("fragCreate", "pickUpDD").getSelectedKey();
			var MessageStrip = Fragment.byId("fragCreate", "SCINCreateMessageStrip");

			switch (PickUpChk) {
			case "01":
				oModelData.UIOnly.visible.PlateNo = true;
				oModelData.UIOnly.visible.Customer = false;
				this.fnCallCourtesyCar({
					withDrive: false
				});
				break;
			case "02":
				oModelData.UIOnly.visible.PlateNo = true;
				oModelData.UIOnly.visible.Customer = true;
				this.fnCallCourtesyCar({
					withDrive: true
				});
				break;
			default:
				oModelData.UIOnly.visible.PlateNo = false;
				oModelData.UIOnly.visible.Customer = false;
				MessageStrip.setText();
				MessageStrip.setVisible(false);
				this.updateButtonEnabledState();
				break;
			}

		},
		fnCallCourtesyCar: function (obj) {
			var oModel = this.getView().getModel("mAppointment");
			var oModelData = this.getView().getModel("mAppointment").getData();
			var MessageStrip = Fragment.byId("fragCreate", "SCINCreateMessageStrip");
			var oDateTimePickerStart = Fragment.byId("fragCreate", "startDate").getDateValue();
			var oEntry = {};
			var epoch = null;
			var obj2 = obj;
			var that = this;
			epoch = new Date(oDateTimePickerStart);
			epoch.setHours(epoch.getHours());
			var IStartDate = "\/Date(" + epoch.getTime() + ")\/";
			var IStartTime = "PT" +
				("00" + epoch.getHours()).slice(-2) +
				"H" +
				("00" + epoch.getMinutes()).slice(-2) +
				"M" +
				("00" + epoch.getSeconds()).slice(-2) +
				"S";

			if (obj.withDrive) {
				oEntry.CcarWithDriver = "Y";
			} else {
				oEntry.CcarWithDriver = "N";
			}

			oEntry.Date = IStartDate;
			oEntry.Time = IStartTime;
			oEntry.FleetUse = "D";
			oEntry.Swerk = oModelData.filters.Plant;

			this.getView().getModel().create("/ZAE_FM_SCIN_CC_01Set", oEntry, {
				success: function (oData, response) {
					if (obj2.withDrive) {
						if (oData.LicenseNum && oData.Pernr !== "00000000") {
							MessageStrip.setText();
							MessageStrip.setVisible(false);
						} else if (!oData.LicenseNum && oData.Pernr === "00000000") {
							var message1 = that.getView().getModel("i18n").getResourceBundle().getText("Caranddrivernotavailable");
							MessageStrip.setText(message1);
							MessageStrip.setVisible(true);
						} else if (!oData.LicenseNum) {
							var message2 = that.getView().getModel("i18n").getResourceBundle().getText("Carisnotavilable");
							MessageStrip.setText(message2);
							MessageStrip.setVisible(true);
						} else if (!oData.Pernr || oData.Pernr === "00000000") {
							var message3 = that.getView().getModel("i18n").getResourceBundle().getText("Driverisnotavilable");
							MessageStrip.setText(message3);
							MessageStrip.setVisible(true);
						}

					} else {
						if (oData.LicenseNum) {
							MessageStrip.setText();
							MessageStrip.setVisible(false);
						} else {
							MessageStrip.setText(that.getView().getModel("i18n").getResourceBundle().getText("Carisnotavilable"));
							MessageStrip.setVisible(true);
						}

					}
					oModelData.UIOnly.text.vin = oData.Equnr;
					oModelData.UIOnly.text.PlateNo = oData.LicenseNum;
					oModelData.UIOnly.text.Pernr = oData.Pernr;
					that.updateButtonEnabledState();

				},
				error: function (oError) {

				}
			});
		},

		formatLeaveStart: function (startDate, endDate) {
			return new Date(startDate.setHours(0, 0, 0, 0));
		},
		formatLeaveEnd: function (startDate, endDate) {

			return new Date(endDate.setHours(23, 59, 59, 0));
		},
		handleAppointmentDragEnter: function (oEvent) {
			if (this.isAppointmentOverlap(oEvent, oEvent.getParameter("calendarRow"))) {
				oEvent.preventDefault();
			}
		},
		fnCheckAppointmentExists: function (oInputEmployeeResp, oDateTimePickerStart, oDateTimePickerEnd) {
			var appointmentAlredayExist = false;
			this._planningCalendar.getRows().forEach(function (rowItem, index, rowArr) {
				if (rowItem.getProperty("key") === oInputEmployeeResp) {
					rowItem.getAppointments().forEach(function (Appointment, index2, SpecialDateArr) {
						var AppointmentStartDate = Appointment.getProperty("startDate");
						var AppointmentEndDate = Appointment.getProperty("endDate");
						if ((oDateTimePickerStart >= AppointmentStartDate && oDateTimePickerStart <= AppointmentEndDate) ||
							(oDateTimePickerEnd >= AppointmentStartDate && oDateTimePickerEnd <= AppointmentEndDate)) {
							appointmentAlredayExist = true;
						}

					}, this);
				}
			}, this);
			return appointmentAlredayExist;
		},
		fnExistingAppointments: function (oEvent) {
			if (!this._oExistingAppointmentDialog) {
				Fragment.load({
						id: "fragExistingAppointments",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.ExistingAppointments",
						controller: this

					})
					.then(function (oDialogContent) {
						this._createExistingAppointmentDialog(oDialogContent);
						this._oExistingAppointmentDialog.open();
					}.bind(this));
			} else {
				this._oExistingAppointmentDialog.open();
			}

		},
		_createExistingAppointmentDialog: function (oDialogContent) {
			var that = this;
			this._oExistingAppointmentDialog = new Dialog({
				title: "{i18n>ExistingAppointments}",
				content: [
					oDialogContent
				],
				buttons: [
					new Button({
						text: "{i18n>Close}",
						press: function () {
							this._oExistingAppointmentDialog.close();
						}.bind(this)
					})
				]

			});
			this.getView().addDependent(this._oExistingAppointmentDialog);
		},
		AppointmentSelected: function (oEvent) {
			var oItem = oEvent.getSource();
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var sPath = oItem.getBindingContextPath();
			var AppointmentData = this.getView().getModel("mAppointment").getProperty(sPath);
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "Appointment",
					action: "aeDisplay&//ZAE_C_Appointment_01(object_type='" + "BUS2000126" + "',Appointment='" + AppointmentData.Appointment +
						"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)"
				}
			})) || "";
			var url = window.location.href.split('#')[0] + hash;
			sap.m.URLHelper.redirect(url, true);
		},

		_fnCheckNewAppointment: function (Appointment) {
			var icon;
			if (Appointment === this.RecentAppointment) {
				icon = "sap-icon://activate";
			}
			return icon;
		},

		_fnALType: function (type) {
			if (type === "LEAVE") {
				return sap.ui.unified.CalendarDayType.Type02;
			} else {
				return sap.ui.unified.CalendarDayType.Type09;
			}
		},

		changeStandardItemsPerView: function () {
			var sViewKey = this.byId('SCIN_SAPlanCal').getViewKey(),
				oLegend = this.byId("PlanningCalendarLegend");

			if (sViewKey !== sap.m.PlanningCalendarBuiltInView.OneMonth) {
				oLegend.setStandardItems([
					sap.ui.unified.StandardCalendarLegendItem.Today,
					sap.ui.unified.StandardCalendarLegendItem.WorkingDay,
					sap.ui.unified.StandardCalendarLegendItem.NonWorkingDay
				]);
			} else {
				oLegend.setStandardItems(); //return defaults
			}
		},

		handleViewChange: function (oEvent) {
			if (oEvent.getSource().getViewKey() === "D") {
				this._fnAppointmentMonthView();
				oEvent.getSource().setViewKey("A");
			}
			this.changeStandardItemsPerView();
			var that = this;
			if (that._planningCalendar.getBinding("rows").aKeys[0]) {
				var RowData = that.getView().getModel().getProperty("/" + that._planningCalendar.getBinding("rows").aKeys[0]);
				if (!(RowData.HideGraph)) {
					that.fnCustomRowChartSetBusy(true);
					setTimeout(function () {
						that.fnClculateBookedTime();
					}, 500);
				}
			}
		},

		onstartDateChange: function () {
			var that = this;
			if (that._planningCalendar.getBinding("rows").aKeys[0]) {
				var RowData = that.getView().getModel().getProperty("/" + that._planningCalendar.getBinding("rows").aKeys[0]);
				if (!(RowData.HideGraph)) {
					that.fnCustomRowChartSetBusy(true);
					setTimeout(function () {
						that.fnClculateBookedTime();
					}, 500);
				}
			}
		},

		onAfterRendering: function () {
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("MainView", "fnAfterNavigate", {});

		},

		fnClculateBookedTime: function () {
			var that = this;
			var Model = this.getView().getModel("mAppointmentChart");
			var ActivityReasonData = this.getView().getModel("mAppointment").getData().ActivityReasonData;
			var WorkWorkshopCapacityData = JSON.parse(JSON.stringify(ActivityReasonData));
			var sViewID = this.getView().sId;
			var ModelData = Model.getData();
			var TotalAvailableHours = 0,
				TotalBookedHours = 0,
				TotalRemainingHours = 0;
			var AppointmentTypeByBookedHours = {};
			this._planningCalendar.getRows().forEach(function (rowItem, index, rowArr) {
				var totalBTSeconds = 0;
				var appointmentLength = $("#" + rowItem.sId + "-CLI .sapUiCalendarApp").length;
				var BookedTime = 0;
				var finalRemainingTime = 0;
				var AvailableTime = rowItem.getAvailableTime();
				TotalAvailableHours = Number(TotalAvailableHours + Number(AvailableTime)).toFixed(2);
				if (appointmentLength > 1) {
					var appointment;
					for (var i = 0; i < appointmentLength - 1; i++) {
						appointment = sap.ui.getCore().getElementById($("#" + rowItem.sId + "-CLI .sapUiCalendarApp")[i].id);
						if (appointment.sParentAggregationName === "groupAppointments") {
							var appLength = appointment._aAppointments.length;
							for (var j = 0; j < appLength; j++) {
								var appointment1 = appointment._aAppointments[j];
								var startDate = appointment1.getStartDate();
								var endDate = appointment1.getEndDate();
								var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
								totalBTSeconds = totalBTSeconds + seconds;
								var appointmentObj = appointment1.getModel().getProperty(appointment1._getBindingContext().sPath);
							}
						} else {
							var startDate = appointment.getStartDate();
							var endDate = appointment.getEndDate();
							var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
							totalBTSeconds = totalBTSeconds + seconds;
							var appointmentObj = appointment.getModel().getProperty(appointment._getBindingContext().sPath);
						}
						var ActivityReason;
						if (appointmentObj.ActivityReason) {
							ActivityReason = that.formatNameAndValuePair(appointmentObj.ActivityReasonText, appointmentObj.ActivityReason); // appointmentObj.StatusReason;  StatusReasonText
						} else {
							ActivityReason = "Other"
						}
						if (AppointmentTypeByBookedHours[ActivityReason]) {
							AppointmentTypeByBookedHours[ActivityReason].totalBTSeconds = AppointmentTypeByBookedHours[ActivityReason]
								.totalBTSeconds + seconds;
							AppointmentTypeByBookedHours[ActivityReason].TotalBooked = AppointmentTypeByBookedHours[ActivityReason].totalBTSeconds / (60 *
								60);
							AppointmentTypeByBookedHours[ActivityReason].AppointmentType = appointmentObj.ActivityReason
							AppointmentTypeByBookedHours[ActivityReason].NumberOfAppointments = AppointmentTypeByBookedHours[ActivityReason]
								.NumberOfAppointments + 1;

						} else {
							AppointmentTypeByBookedHours[ActivityReason] = {
								appointmentType: ActivityReason,
								totalBTSeconds: seconds,
								NumberOfAppointments: 1,
								Bookedhours: 0,
								AppointmentColor: appointmentObj.AppointmentColor,
								AppointmentType: appointmentObj.ActivityReason,
								TotalBooked: seconds / (60 * 60),
								NoofBays: rowItem.getBindingContext().getObject().NoOfBays
							};

						}

					}
				} //
				BookedTime = totalBTSeconds / (60 * 60);

				var arrayAT = AvailableTime.split(".");
				var ATToSec1 = Number(arrayAT[0]) * 60 * 60;
				var ATToSec2 = 0;
				if (arrayAT.length > 1) {
					ATToSec2 = (Number(arrayAT[1]) * 60 * 60) / 100;
				}
				var TotalATToSec = ATToSec1 + ATToSec2;

				var RemainingTimeSec = TotalATToSec - totalBTSeconds;

				finalRemainingTime = RemainingTimeSec / (60 * 60);

				// }
				TotalBookedHours = Number(parseFloat(TotalBookedHours) + parseFloat(BookedTime)).toFixed(2);
				TotalRemainingHours = Number(parseFloat(TotalRemainingHours) + parseFloat(finalRemainingTime)).toFixed(2);
				rowItem.setBookedTime(parseFloat(BookedTime).toFixed(2));
				rowItem.setRemainingTime(parseFloat(finalRemainingTime).toFixed(2));

			}, this);

			ModelData.CapacityUtilizationbyHours.Data[0].TotalAvailableHours = Number(TotalAvailableHours).toFixed(2);
			ModelData.CapacityUtilizationbyHours.Data[0].TotalBookedHours = Number(TotalBookedHours).toFixed(2);
			ModelData.CapacityUtilizationbyHours.Data[0].TotalRemainingHours = Number(TotalRemainingHours).toFixed(2);
			// ModelData.WorkshopCapacityUtilizationbyHours.Data[0].TotalAvailableHours = TotalAvailableHours;
			// ModelData.WorkshopCapacityUtilizationbyHours.Data[0].TotalBookedHours = TotalBookedHours;

			var measures = [],
				dimensions = [],
				feedItems = [{
					uid: "axisLabels",
					type: "Dimension",
					values: ["AppointmentTypeByBookedHours"]
				}],
				feedItems2 = [{
					uid: "axisLabels",
					type: "Dimension",
					values: ["AppointmentTypeByNumberOfAppointments"]
				}],
				colorPalette = [],
				Data = [{
					AppointmentTypeByBookedHours: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("AppintmnetinHRS")
				}],
				Data2 = [{
					AppointmentTypeByNumberOfAppointments: this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(
						"AppoitnmentReason")
				}],
				Data3 = {
					"items": []
				};

			Object.keys(AppointmentTypeByBookedHours).forEach(function (key, index) {
				measures.push({
					name: AppointmentTypeByBookedHours[key].appointmentType,
					value: "{" + AppointmentTypeByBookedHours[key].appointmentType + "}"
				});
				feedItems.push({
					uid: "primaryValues",
					type: "Measure",
					values: [AppointmentTypeByBookedHours[key].appointmentType]
				});

				feedItems2.push({
					uid: "primaryValues",
					type: "Measure",
					values: [AppointmentTypeByBookedHours[key].appointmentType]
				});

				colorPalette.push(AppointmentTypeByBookedHours[key].AppointmentColor);
				Data[0][AppointmentTypeByBookedHours[key].appointmentType] = Number(AppointmentTypeByBookedHours[key].totalBTSeconds / (60 *
					60)).toFixed(2);
				Data2[0][AppointmentTypeByBookedHours[key].appointmentType] = Number(AppointmentTypeByBookedHours[key].NumberOfAppointments).toFixed(
					2);
				var Activityindex = WorkWorkshopCapacityData.findIndex(function (obj) {
					return obj.Zcode === AppointmentTypeByBookedHours[key].AppointmentType;
				}.bind(this));
				if (Activityindex !== -1) {
					WorkWorkshopCapacityData[Activityindex].TotalBooked = Number(AppointmentTypeByBookedHours[key].TotalBooked).toFixed(2);
					WorkWorkshopCapacityData[Activityindex].TotalAvailable = ((AppointmentTypeByBookedHours[key].NoofBays *
						WorkWorkshopCapacityData[
							index].TimeInMins) / 60).toFixed(2);
					WorkWorkshopCapacityData[Activityindex].appointmentType = AppointmentTypeByBookedHours[key].appointmentType;
				}
			});
			WorkWorkshopCapacityData.forEach(function (row, ind) {
				if (row.TotalBooked === undefined) {
					row.TotalBooked = 0;
				}
				if (row.TotalAvailable === undefined) {
					row.TotalAvailable = ((that._planningCalendar.getRows()[0].getBindingContext().getObject().NoOfBays * row.TimeInMins) / 60).toFixed(
						2);
				}
				if (row.appointmentType === undefined) {
					row.appointmentType = that.formatNameAndValuePair(row.CodeText, row.Zcode);
				}
			}.bind(this));
			Data3["items"] = WorkWorkshopCapacityData;
			ModelData.AppointmentTypeByBookedHours.dataset.measures = measures;
			ModelData.AppointmentTypeByBookedHours.feedItems = feedItems;
			ModelData.AppointmentTypeByBookedHours.colorPalette = colorPalette;
			ModelData.AppointmentTypeByBookedHours.Data = Data;

			ModelData.AppointmentTypeByNumberOfAppointments.dataset.measures = measures;
			ModelData.AppointmentTypeByNumberOfAppointments.feedItems = feedItems2;
			ModelData.AppointmentTypeByNumberOfAppointments.colorPalette = colorPalette;
			ModelData.AppointmentTypeByNumberOfAppointments.Data = Data2;

			// ModelData.WorkshopCapacityUtilizationbyHours.dataset.dimensions = dimensions;
			// ModelData.WorkshopCapacityUtilizationbyHours.feedItems = feedItems3;
			// ModelData.WorkshopCapacityUtilizationbyHours.colorPalette = d3.scale.category20().range();
			ModelData.WorkshopCapacityUtilizationbyHours.Data = Data3;

			// Model.updateBindings(true);
			// this._planningCalendar.rerender();

			// this.fnCalculateAppointmentTypeByBookedHours();

			this.fnCustomRowChartSetBusy(false);
			this.fnChartData();

		},

		fnCustomRowChartSetBusy: function (Bool) {
			this._planningCalendar.getRows().forEach(function (rowItem, index, rowArr) {
				sap.ui.getCore().getElementById(rowItem._getPlanningCalendarCustomRowID() + "CustomHeadFlexBox").setBusy(Bool);

			});

		},

		fnChartData: function () {
			var Model = this.getView().getModel("mAppointmentChart");
			var oModelChartData = Model.getData();

			this.fnCapacityUtilizationbyHoursChart(oModelChartData.CapacityUtilizationbyHours);
			this.fnCapacityUtilizationbyHoursChart(oModelChartData.AppointmentTypeByBookedHours);
			// this.fnCapacityUtilizationbyHoursChart(oModelChartData.AppointmentTypeByNumberOfAppointments); //naveen
			this.fnCapacityUtilizationbyHoursChart(oModelChartData.WorkshopCapacityUtilizationbyHours);
		},

		fnCapacityUtilizationbyHoursChart: function (oCountryVizFrame) {
			var oContent = new ChartContainerContent();
			oContent.setContent(this._createVizFrame(oCountryVizFrame));
			var oChartContainer = this.getView().byId(oCountryVizFrame.chartContainerId);
			oChartContainer.removeAllContent();
			oChartContainer.addContent(oContent);

			// ChartContainerSelectionDetails._initializeSelectionDetails(oContent);
			oChartContainer.updateChartContainer();
		},

		/**
		 * Creates a Viz Frame based on the passed config.
		 *
		 * @param {object} vizFrameConfig Viz Frame config
		 * @returns {sap.viz.ui5.controls.VizFrame} Created Viz Frame
		 */
		_createVizFrame: function (vizFrameConfig) {
			var oVizFrame = new VizFrame(vizFrameConfig.config);
			var oModel = this.getView().getModel("mAppointmentChart");
			var oDataSet = new FlattenedDataset(vizFrameConfig.dataset);
			oVizFrame.removeAllFeeds();
			oVizFrame.setDataset(oDataSet);
			oVizFrame.setModel(oModel);
			oVizFrame.getDataset();
			this._addFeedItems(oVizFrame, vizFrameConfig.feedItems);
			oVizFrame.setVizType(vizFrameConfig.vizType);
			oVizFrame.setVizProperties({
				plotArea: {
					colorPalette: vizFrameConfig.colorPalette, //["#9467bd"], //d3.scale.category20().range(),
					dataLabel: {
						showTotal: true,
						visible: true
					},
					dataPointStyle: {},
					// drawingEffect: "glossy"
				},
				valueAxis: {
					label: {
						formatString: ""
					},
					title: {
						visible: false
					}
				},
				categoryAxis: {
					title: {
						visible: false
					}
				},
				title: {
					visible: true,
					text: vizFrameConfig.title
				}
			});

			return oVizFrame;
		},

		/**
		 * Adds the passed feed items to the passed Viz Frame.
		 *
		 * @private
		 * @param {sap.viz.ui5.controls.VizFrame} vizFrame Viz Frame to add feed items to
		 * @param {object[]} feedItems Feed items to add
		 */
		_addFeedItems: function (vizFrame, feedItems) {
			for (var i = 0; i < feedItems.length; i++) {
				vizFrame.addFeed(new FeedItem(feedItems[i]));
			}
		},

		/**
		 * Creates label control array with the specified texts.
		 *
		 * @private
		 * @param {string[]} labelTexts Text array
		 * @returns {sap.m.Label[]} Array of labels
		 */
		_createLabels: function (labelTexts) {
			return this._createControls(Label, "text", labelTexts);
		},

		/**
		 * Creates an array of controls with the specified control type, property name and value.
		 *
		 * @private
		 * @param {function} constructor Contructor function of the control to be created.
		 * @param {string} prop Property name
		 * @param {Array} propValues Value of the control's property
		 * @returns {sap.ui.core.control[]} Array of the new controls
		 */
		_createControls: function (constructor, prop, propValues) {
			var aControls = [];
			var oProps = {};

			for (var i = 0; i < propValues.length; i++) {
				oProps[prop] = propValues[i];
				aControls.push(new constructor(oProps));
			}

			return aControls;
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

		_fnSplitterLayoutDataHight: function (height) {
			return ((screen.height / 2) + 30) + "px";
		},
		onExpandEVHC: function (oEvent) {
			if (oEvent.getParameter('expand')) {
				this.EVHCexpanded = true;
				this.byId("openEVHC").rebindTable();
			} else {
				this.EVHCexpanded = false;
			}
		},
		onExpandvehiclehistory: function (oEvent) {
			if (oEvent.getParameter('expand')) {
				this.serviceHistory = true;
				this.byId("vehiclehistory").rebindTable();
			} else {
				this.serviceHistory = false;
			}
		},
		onBeforeRebindopenEVHCTable: function (oEvent) {
			var oModel = this.getView().getModel("mAppointment");
			// if (!oModel) {
			// 	return;
			// }
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			if (oModelData.filters.Equipment) {
				var Equipment = oModelData.filters.Equipment.padStart(18, 0);
				newFilter = new sap.ui.model.Filter("Equipment",
					sap.ui.model.FilterOperator.EQ,
					Equipment);
				aFilters.push(newFilter);
			}
			// else {
			// 	newFilter = new sap.ui.model.Filter("Equipment",
			// 		sap.ui.model.FilterOperator.EQ,
			// 		"");
			// 	aFilters.push(newFilter);
			// }
			var binding = oEvent.getParameter("bindingParams");
			if (this.EVHCexpanded) {
				binding.filters = aFilters;
			} else {
				binding.preventTableBind = true;
			}
		},
		onBeforeRebindOpenServiceRequests: function (oEvent) {
			var oModel = this.getView().getModel("mAppointment");
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			if (oModelData.filters.Equipment) {
				var Equipment = oModelData.filters.Equipment.padStart(18, 0);
				newFilter = new sap.ui.model.Filter("Equipment",
					sap.ui.model.FilterOperator.EQ,
					Equipment);
				aFilters.push(newFilter);
			} else {
				newFilter = new sap.ui.model.Filter("Equipment",
					sap.ui.model.FilterOperator.EQ,
					"");
				aFilters.push(newFilter);
			}
			var binding = oEvent.getParameter("bindingParams");
			if (binding) {
				binding.filters = aFilters;
				binding.parameters.select = binding.parameters.select + ",ServiceRequest"
			}
		},
		onBeforeRebindHistoryTable: function (oEvent) {
			var oModel = this.getView().getModel("mAppointment");
			if (!oModel) {
				return;
			}
			var oModelData = oModel.getData();
			var aFilters = [];
			var newFilter;
			var mBindingParams = oEvent.getParameter("bindingParams");
			if (this.serviceHistory) {
				newFilter = new sap.ui.model.Filter("Equipment",
					sap.ui.model.FilterOperator.EQ,
					oModelData.filters.Equipment);
				aFilters.push(newFilter);
				if (oModelData.filters.SalesOrganization) {
					newFilter = new sap.ui.model.Filter("SalesOrganization",
						sap.ui.model.FilterOperator.EQ,
						oModelData.filters.SalesOrganization);
					aFilters.push(newFilter);
				}
				mBindingParams.filters = aFilters;
				var sorter = [];
				sorter.push(new sap.ui.model.Sorter({
					path: 'PostingDate',
					descending: true
				}));
				mBindingParams.sorter = sorter;
			} else {
				mBindingParams.preventTableBind = true;
			}

		},
		fnHandelServiceOrderLinkPress: function (oEvent) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
				target: {
					semanticObject: "ServiceOrder",
					// action: "aesDisplay"
					action: "aesDisplay&//ZAE_C_ServiceOrder_01(ServiceObjectType='BUS2000116',ServiceOrder='" + oEvent.getSource().getText() +
						"',DraftUUID=guid'00000000-0000-0000-0000-000000000000',IsActiveEntity=true)"
				}
				/*,
				                params: {
				                    "ServiceOrder": oEvent.getSource().getText()
				                }*/
			})) || "";
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: hash
				}
			});

		},
		formatAbsenceTypeText: function (oAbsenceText) {
			var oText = "";
			if (oAbsenceText) {
				oText = oAbsenceText;
			} else {
				oText = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText("NonWorkingHours");
			}
			return oText;
		},
		_fnAppointmentMonthView: function () {
			var that = this;
			if (!that._AppointmentMonthView) {
				Fragment.load({
						id: "AppointmentMonthView",
						name: "com.globalintelli.ZAE_SCIN_NEW.fragment.AppointmentMonth",
						controller: {
							dateTimeToDate: function (date, time) {
								var oDate = new Date(date);
								var oTime = new Date(time.ms);
								oDate.setHours(oTime.getUTCHours(), oTime.getUTCMinutes(), oTime.getUTCSeconds(), oTime.getUTCMilliseconds());
								return oDate;
							},
							onChangeSelectedDate: function (oEvent) {
								var oStartDate = new Date(oEvent.getParameter("startDate"));
								oStartDate.setHours(8);
								oStartDate.setMinutes(0);
								// var oAppointemnts = oEvent.getSource().getAppointments();
								// var selectedAppointment = oAppointemnts.find(function (obj) {
								// 	return obj.getBindingContext().getObject().fromdate.getTime() === oStartDate.getTime();
								// });
								// if (selectedAppointment) {
								// 	var oDate = this.dateTimeToDate(selectedAppointment.getBindingContext().getObject().fromdate,
								// 		selectedAppointment.getBindingContext().getObject().fromtime);
								// 	oStartDate = oDate;
								// }
								if (oStartDate) {
									that._planningCalendar.setStartDate(oStartDate);
									that._AppointmentMonthView.close();
								}
							},
							onClose: function () {
								that._AppointmentMonthView.close();
							}
						}
					}, this)
					.then(function (oPopoverContent) {
						that._AppointmentMonthView = oPopoverContent;
						that.getView().addDependent(that._AppointmentMonthView);
						that._AppointmentMonthViewsetInitialState();
						var oDatePicker = Fragment.byId("AppointmentMonthView", "idSinglePlanningCalendar-Header-NavToolbar-PickerBtn");
						// oDatePicker.detachPress(oDatePicker.mEventRegistry.press[0].fFunction);
						oDatePicker.setEnabled(false);
					}.bind(this));

			} else {
				that._AppointmentMonthViewsetInitialState();
			}
		},
		_AppointmentMonthViewsetInitialState: function (oEvent) {
			var oModelData = this.getView().getModel("mAppointment").getData();
			var aFilters = [];
			var oDate = this._planningCalendar.getStartDate();
			oDate.setDate(1);

			aFilters.push(new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oModelData.filters.Plant));
			aFilters.push(new sap.ui.model.Filter("SalesOffice", sap.ui.model.FilterOperator.EQ, oModelData.filters.SalesOffice));
			aFilters.push(new sap.ui.model.Filter("SalesGroup", sap.ui.model.FilterOperator.EQ, oModelData.filters.SalesGroup));
			Fragment.byId("AppointmentMonthView", "idSinglePlanningCalendar").getBinding("appointments").filter(aFilters);
			// Fragment.byId("AppointmentMonthView", "idSinglePlanningCalendar").setStartDate(new Date());
			Fragment.byId("AppointmentMonthView", "idSinglePlanningCalendar").setStartDate(oDate);
			this._AppointmentMonthView.open();
		}

	});
});