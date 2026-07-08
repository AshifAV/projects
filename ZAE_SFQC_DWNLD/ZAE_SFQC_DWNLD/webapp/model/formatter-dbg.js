sap.ui.define(["sap/ui/core/format/NumberFormat"], function (NumberFormat) {
	"use strict";

	var oCurrencyFormat = NumberFormat.getCurrencyInstance();

	return {
		// isNextEnabled: function () {
		// 	var mApp = this.getView().getModel("app");
		// 	var isOpportunityDataLoaded = mApp.getProperty("/pages/Opportunity/isOpportunityDataLoaded");
		// 	return isOpportunityDataLoaded;
		// },

		// isNextVisible: function (step) {
		// 	debugger;
		// 	var nextId = this.getId();
		// },

		currencyFormat: function (price, currency) {
			return oCurrencyFormat.format(parseFloat(price), currency);
		},

		configCBMPriceText: function (price, currency, qty, ogQty) {
			if (qty === "1") {
				return oCurrencyFormat.format(parseFloat(price), currency);
			} else {
				return oCurrencyFormat.format(parseFloat(price * parseInt(qty, 10)), currency) + " (" + oCurrencyFormat.format(parseFloat(price),
					currency) + " ✕ " + qty + ")";
			}
		},

		configSELPriceText: function (label, price, currency) {
			if (currency !== "") {
				return label + " (" + oCurrencyFormat.format(parseFloat(price), currency) + ")";
			} else {
				return label;
			}
		},

		configSELPriceAdditionalText: function (price, currency) {
			if (currency !== "") {
				return oCurrencyFormat.format(parseFloat(price), currency);
			} else {
				return "";
			}
		},

		materialLabel: function (text1, text2) {
			if ((text1 && text1 !== "") && (text2 && text2 !== "")) {
				return text1 + " · " + text2;
			} else if (text1 && text1 !== "") {
				return text1;
			} else if (text2 && text2 !== "") {
				return text2;
			}
			return "-";
		},

		sumPrice: function (price, currency, qty) {
			var oCurrency = new sap.ui.model.type.Currency({
				showMeasure: false
			});
			return oCurrency.formatValue([price * parseInt(qty, 10), currency], "string");
		},

		sumPriceCurr: function (price, currency, qty) {
			var oCurrency = new sap.ui.model.type.Currency();
			return oCurrency.formatValue([price * parseInt(qty, 10), currency], "string");
		},

		dateToStr: function (date) {
			try {
				// TODO: Better logic
				var offset = date.getTimezoneOffset();
				var yourDate = new Date(date.getTime() - (offset * 60 * 1000));
				return yourDate.toISOString().split('T')[0];
				// return date.toString();
			} catch (e) {
				return "";
			}
		}

		// listItemType: function (id) {
		// 	return id ? "Inactive" : "Navigation";
		// }
	};
});