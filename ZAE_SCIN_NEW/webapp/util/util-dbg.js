sap.ui.define([
		"jquery.sap.global",
		"sap/ui/base/Object",
		"sap/ui/model/Filter",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/resource/ResourceModel"
	],
	function (jQuery, Object, Filter, JSONModel, ResourceModel) {
		return { 
			
			formatLeaveStart: function (startDate, endDate) {
				return new Date(startDate.setHours(0, 0, 0, 0));
			},
			formatLeaveEnd: function (startDate, endDate) {
				if (startDate === endDate) {
					return;
				}
				return new Date(endDate.setHours(23, 59, 59, 0));
			}

		}

	});