sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"../model/formatter"
], function (BaseController, JSONModel, History, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, Fragment, formatter) {
	"use strict";

	return BaseController.extend("com.globalintelli.ZAE_MMSA.controller.Master", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
		 * @public
		 */
		onInit: function () {
			// Control state model

			var oList = this.byId("list"),

				oViewModel = this._createViewModel(),
				// Put down master list's original value for busy indicator delay,
				// so it can be restored later on. Busy handling on the master list is
				// taken care of by the master list itself.
				iOriginalBusyDelay = oList.getBusyIndicatorDelay();

			this._oList = oList;
			// keeps the filter and search state
			this._oListFilterState = {
				aFilter: [],
				aSearch: []
			};

			this.setModel(oViewModel, "masterView");
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oList.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for the list
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});

			this.getView().addEventDelegate({
				onBeforeFirstShow: function () {
					this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
				}.bind(this)
			});

			var otitleModel = new JSONModel({
				width: "100%"
			});
			this.getOwnerComponent().setModel(otitleModel, "otitleModel");

			this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this);
			this.fngetFilters();

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * After list data is available, this handler method updates the
		 * master list counter
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			var that = this;
			// update the master list object counter after new data is loaded
			that._updateListItemCount(oEvent.getParameter("total"));

		},
		onUpdateStarted: function (oEvent) {
			oEvent.getSource().removeAllItems();
			this._applyFilterSearch();
		},

		/**
		 * Event handler for the master search field. Applies current
		 * filter value and triggers a new search. If the search field's
		 * 'refresh' button has been pressed, no new search is triggered
		 * and the list binding is refresh instead.
		 * @param {sap.ui.base.Event} oEvent the search event
		 * @public
		 */
		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
				return;
			}

			var sQuery = oEvent.getParameter("query");

			if (sQuery) {
				this._oListFilterState.aSearch = [new Filter("ServiceRequest", FilterOperator.Contains, sQuery)];

				/* this._oListFilterState.aSearch =   new Filter({
    filters: 
    [new Filter("ServiceRequest", FilterOperator.Contains, sQuery),new Filter("ServiceDocumentDescription", FilterOperator.Contains, sQuery)],
    and: false
  });
*/

				// this._oListFilterState.aSearch = new sap.ui.model.Filter({
				// 	filters: [new Filter("ServiceDocumentDescription", FilterOperator.Contains, sQuery),
				// 		new Filter("ServiceRequest", FilterOperator.Contains, sQuery)
				// 	],
				// 	and: false
				// });
			} else {
				this._oListFilterState.aSearch = [];
			}
			this._applyFilterSearch();

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			this._oList.getBinding("items").refresh();
		},

		/**
		 * Event handler for the filter, sort and group buttons to open the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the button press event
		 * @public
		 */
		onOpenViewSettings: function (oEvent) {
			var sDialogTab = "filter";
			if (oEvent.getSource() instanceof sap.m.Button) {
				var sButtonId = oEvent.getSource().getId();
				if (sButtonId.match("sort")) {
					sDialogTab = "sort";
				} else if (sButtonId.match("group")) {
					sDialogTab = "group";
				}
			}
			// load asynchronous XML fragment
			if (!this.byId("viewSettingsDialog")) {
				Fragment.load({
					id: this.getView().getId(),
					name: "com.globalintelli.ZAE_MMSA.view.ViewSettingsDialog",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					this.getView().addDependent(oDialog);
					oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
					oDialog.open(sDialogTab);
				}.bind(this));
			} else {
				this.byId("viewSettingsDialog").open(sDialogTab);
			}
		},

		/**
		 * Event handler called when ViewSettingsDialog has been confirmed, i.e.
		 * has been closed with 'OK'. In the case, the currently chosen filters, sorters or groupers
		 * are applied to the master list, which can also mean that they
		 * are removed from the master list, in case they are
		 * removed in the ViewSettingsDialog.
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @public
		 */
		onConfirmViewSettingsDialog: function (oEvent) {

			this._applySortGroup(oEvent);
		},

		/**
		 * Apply the chosen sorter and grouper to the master list
		 * @param {sap.ui.base.Event} oEvent the confirm event
		 * @private
		 */
		_applySortGroup: function (oEvent) {
			var mParams = oEvent.getParameters(),
				sPath,
				bDescending,
				aSorters = [];
			sPath = mParams.sortItem.getKey();
			bDescending = mParams.sortDescending;
			aSorters.push(new Sorter(sPath, bDescending));
			this._oList.getBinding("items").sort(aSorters);
		},

		/**
		 * Event handler for the list selection event
		 * @param {sap.ui.base.Event} oEvent the list selectionChange event
		 * @public
		 */
		onSelectionChange: function (oEvent) {
			var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected");

			// skip navigation when deselecting an item in multi selection mode
			if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
			}
		},

		/**
		 * Event handler for the bypassed event, which is fired when no routing pattern matched.
		 * If there was an object selected in the master list, that selection is removed.
		 * @public
		 */
		onBypassed: function () {
			this._oList.removeSelections(true);
		},

		/**
		 * Used to create GroupHeaders with non-capitalized caption.
		 * These headers are inserted into the master list to
		 * group the master list's items.
		 * @param {Object} oGroup group whose text is to be displayed
		 * @public
		 * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
		 */
		createGroupHeader: function (oGroup) {
			return new GroupHeaderListItem({
				title: oGroup.text,
				upperCase: false
			});
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will navigate to the shell home
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				// eslint-disable-next-line sap-no-history-manipulation
				history.go(-1);
			} else {
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		_createViewModel: function () {
			return new JSONModel({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: this.getResourceBundle().getText("masterTitleCount", [0]),
				noDataText: this.getResourceBundle().getText("masterListNoDataText"),
				sortBy: "ServiceDocumentDescription",
				groupBy: "None"
			});
		},

		_onMasterMatched: function () {
			//Set the layout property of the FCL control to 'OneColumn'
			this.getModel("appView").setProperty("/layout", "OneColumn");
			this.getOwnerComponent().getModel("otitleModel").setProperty("/width", "100%");

		},

		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail: function (oItem) {
			var bReplace = !Device.system.phone;
			// set the layout property of FCL control to show two columns
			this.getOwnerComponent().getModel("otitleModel").setProperty("/width", "80%");
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("ServiceRequest"),
				objectType: oItem.getBindingContext().getProperty("ServiceObjectType"),
				ProcessType: oItem.getBindingContext().getProperty("ServiceDocumentType"),
				VehicleStatus: oItem.getBindingContext().getProperty("StatusForVehicle"),
				SalesGroup: oItem.getBindingContext().getProperty("SalesGroup"),
				SalesOffice: oItem.getBindingContext().getProperty("SalesOffice"),
				SalesOrg: oItem.getBindingContext().getProperty("SalesOrganization")

			}, bReplace);

		},

		/**
		 * Sets the item count on the master list header
		 * @param {integer} iTotalItems the total number of items in the list
		 * @private
		 */
		_updateListItemCount: function (iTotalItems) {
			var sTitle;
			// only update the counter if the length is final
			if (this._oList.getBinding("items").isLengthFinal()) {
				if (this._oList.getBinding("items").getLength() === 1) {
					sTitle = this.getResourceBundle().getText("masterTitleCount1", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
				}

				this.getModel("masterView").setProperty("/title", sTitle);
			}
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @private
		 */
		fngetFilters: function () {
			var that = this;
			var oUserID = new sap.ushell.services.UserInfo().getId();
			this.getView().setBusy(true);
			this.getOwnerComponent().getModel().read("/ZAE_I_TC_MOB_AUTH", {
				urlParameters: {
					"$filter": "UserID  eq \'" + oUserID + "\'"
				},
				success: function (oData) {
					that.getView().setBusy(false);
					if (oData.results.length > 0) {
						var Result = oData.results[0];
						that.Filters = Result;
						that.getView().getModel("appView").setProperty("/Role", Result["MSARole"]);
					}
					that._applyFilterSearch();
				},
				error: function (oError) {
					that.getView().setBusy(false);
					sap.m.MessageBox.error("Faild to load the data")
				}
			});
		},
		_applyFilterSearch: function () {
			var that = this;
			var aFilters = that._oListFilterState.aSearch.concat(that._oListFilterState.aFilter);
			var oUserID = new sap.ushell.services.UserInfo().getId(),
				oViewModel = that.getModel("masterView");
	
			if (that.Filters && that.Filters["MSARole"] === "1") {
				aFilters.push(new sap.ui.model.Filter("Driver", sap.ui.model.FilterOperator.EQ, that.Filters["Empid"]));
				aFilters.push(new sap.ui.model.Filter("StatusForVehicle", sap.ui.model.FilterOperator.EQ, "E0001"));
			} else {
				aFilters.push(new sap.ui.model.Filter("UserID", sap.ui.model.FilterOperator.EQ, oUserID));
			}
			this._oList.getBinding("items").filter(aFilters, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aFilters.length !== 0) {
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
			} else if (this._oListFilterState.aSearch.length > 0) {
				// only reset the no data text to default when no new search was triggered
				oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
			}
		},

		/**
		 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
		 * @param {string} sFilterBarText the selected filter value
		 * @private
		 */
		_updateFilterBar: function (sFilterBarText) {
			var oViewModel = this.getModel("masterView");
			oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
			oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
		},

		// onSelectTab: function (oEvent) {
		// 	var upcomingList = this.getView().byId("list");
		// 	upcomingList.setMode("SingleSelectMaster");
		// 	//var key = oEvent.getSource().getSelectedKey();

		// 	var oFilter = new sap.ui.model.Filter("SystemStatus", sap.ui.model.FilterOperator.EQ, "I1002");
		//           upcomingList.setMode("None");
		// 	// if (key === "past") {
		// 	// 	oFilter = new sap.ui.model.Filter("SystemStatus", sap.ui.model.FilterOperator.NE, "I1002");
		// 	// 	upcomingList.setMode("None");
		// 	// }

		// 	upcomingList.getBinding("items").filter(oFilter);
		// 	this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
		// 	// No item should be selected on master after detail page is closed
		// 	this.getOwnerComponent().oListSelector.clearMasterListSelection();
		// 	this.getRouter().navTo("master");

		// },

		warrantyStatusformat: function (sValue) {

			var result = "None";
			if (sValue === 1) {
				result = "Error";
			} else if (sValue === 2) {
				result = "Warning";
			} else if (sValue === 3) {
				result = "Success";
			}
			return result;

		},

		Statusformat: function (WarrantyClaim, ServiceOrder) {

			var recallCrit = "None";
			if (WarrantyClaim !== "" && ServiceOrder !== "") {
				recallCrit = "Success";
			} else if (WarrantyClaim !== "") {
				recallCrit = "Error";
			}
			return recallCrit;

		}

	});

});