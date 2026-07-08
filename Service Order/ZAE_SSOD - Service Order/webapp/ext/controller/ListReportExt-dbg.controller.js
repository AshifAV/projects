sap.ui.controller("com.globalintelli.zae_ssod.ext.controller.ListReportExt", {

	getCustomAppStateDataExtension: function (oCustomAppData) {
	},
	restoreCustomAppStateDataExtension: function (oCustomAppData) {
	},
	
	onInitSmartFilterBarExtension: function (oEvent) {
			var oSmartFilterBar = oEvent.getSource();
			var oCustomControl = oSmartFilterBar.getControlByKey(this.ctrlConfig.keyLE);
			this.util.onInitSetDateDefault(oSmartFilterBar, this.aSmartCtrlConfig);
			this._initi18nReuseLib.call(this);
			return this.util.onInitSmartFilterBarExtensionBase(oCustomControl);
		},
		_initi18nReuseLib: function () {
			this.util.initi18nReuseLib.call(this);
		},
	
		onBeforeRebindTableExtension: function (oEvent) {
					var tableData = oEvent.getParameters().bindingParams;
		var oStartDateControl = this.byId("idCreateddate");

		if (oStartDateControl && oStartDateControl.getFrom() && oStartDateControl.getTo()) {
			var fromDate = oStartDateControl.getFrom();
			var toDate = oStartDateControl.getTo();
			var monthFrom = fromDate.getMonth() + 1;
			var monthTo = toDate.getMonth() + 1;
			monthFrom = monthFrom < 10 ? "0" + monthFrom : monthFrom;
			monthTo = monthTo < 10 ? "0" + monthTo : monthTo;
			var newFilter = new sap.ui.model.Filter("Createddate_main",
				sap.ui.model.FilterOperator.BT,
				monthFrom + "-" + fromDate.getFullYear(), monthTo + "-" + fromDate.getFullYear());
			tableData.filters.push(newFilter);
		}
	},
	onBeforeRebindChartExtension: function (oEvent) {
		var tableData = oEvent.getParameters().bindingParams;
		var oStartDateControl = this.byId("idCreateddate");

		if (oStartDateControl && oStartDateControl.getFrom() && oStartDateControl.getTo()) {
			var fromDate = oStartDateControl.getFrom();
			var toDate = oStartDateControl.getTo();
			var monthFrom = fromDate.getMonth() + 1;
			var monthTo = toDate.getMonth() + 1;
			monthFrom = monthFrom < 10 ? "0" + monthFrom : monthFrom;
			monthTo = monthTo < 10 ? "0" + monthTo : monthTo;
			var newFilter = new sap.ui.model.Filter("Createddate_main",
				sap.ui.model.FilterOperator.BT,
				monthFrom + "-" + fromDate.getFullYear(), monthTo + "-" + fromDate.getFullYear());
			tableData.filters.push(newFilter);
		}
	}


});

