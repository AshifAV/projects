sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, History) {
    "use strict";

    return Controller.extend("zsuporder.controller.SupervisorOrder", {

        _sStatusCode: null,
        _sStatusName: null,

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("orderDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var oArguments = oEvent.getParameter("arguments");
            var sOrderId = oArguments.orderId || '';

            // Parse query string
            var sQuery = oArguments.query || '';
            var oQueryParams = this._parseQueryString(sQuery);

            var sStatusCode = oQueryParams.statusCode || '';
            var sStatusName = oQueryParams.statusName || '';
            var sOrderDate = oQueryParams.orderDate || '';
            var sCustomerName = oQueryParams.customerName || '';
            var sMobileNumber = oQueryParams.mobileNumber || '';
            var sMobileNumber1 = oQueryParams.mobileNumber1 || '';
            var sLocation = oQueryParams.location || '';
            var sInvoiceNo = oQueryParams.invoiceNo || '';
            var sInvoiceDate = oQueryParams.invoiceDate || '';

            sStatusCode = decodeURIComponent(sStatusCode);
            sStatusName = decodeURIComponent(sStatusName);
            sOrderDate = decodeURIComponent(sOrderDate);
            sCustomerName = decodeURIComponent(sCustomerName);
            sMobileNumber = decodeURIComponent(sMobileNumber);
            sMobileNumber1 = decodeURIComponent(sMobileNumber1);
            sLocation = decodeURIComponent(sLocation);
            sInvoiceNo = decodeURIComponent(sInvoiceNo);
            sInvoiceDate = decodeURIComponent(sInvoiceDate);

            this._sStatusCode = sStatusCode;
            this._sStatusName = sStatusName;

            console.log("Route arguments:", {
                orderId: sOrderId,
                statusCode: sStatusCode,
                statusName: sStatusName,
                orderDate: sOrderDate,
                customerName: sCustomerName,
                mobileNumber: sMobileNumber,
                mobileNumber1: sMobileNumber1,
                location: sLocation,
                invoiceNo: sInvoiceNo,
                invoiceDate: sInvoiceDate,
                fullArguments: oArguments
            });

            this._populateForm(sOrderId, sOrderDate, sCustomerName, sMobileNumber, sMobileNumber1, sLocation, sInvoiceNo, sInvoiceDate);

            if (sStatusCode) {
                this._setUserStatus(sStatusCode, sStatusName);
            }
        },

        _parseQueryString: function (sQuery) {
            var oParams = {};
            if (!sQuery) return oParams;

            var aPairs = sQuery.split('&');
            for (var i = 0; i < aPairs.length; i++) {
                var aPair = aPairs[i].split('=');
                if (aPair.length === 2) {
                    oParams[aPair[0]] = aPair[1];
                }
            }
            return oParams;
        },

        _setUserStatus: function (sStatusCode, sStatusName) {
            var oSelect = this.byId("idUserStatus");
            if (!oSelect) {
                return;
            }

            var oModel = this.getView().getModel("mainService");
            if (!oModel) {
                oSelect.setSelectedKey(sStatusCode);
                this.handleSaveButtonEnabled();
                return;
            }

            var sPath = "/ZAE_VH_UserStatus_09?$filter=UserStatus eq '" + sStatusCode + "'";

            oModel.read(sPath, {
                success: function (oData) {
                    if (oData && oData.results && oData.results.length > 0) {
                        oSelect.setSelectedKey(sStatusCode);
                    } else {
                    }
                    this.handleSaveButtonEnabled();
                }.bind(this),
                error: function () {
                    this.handleSaveButtonEnabled();
                }.bind(this)
            });
        },

        _populateForm: function (sOrderId, sOrderDate, sCustomerName, sMobileNumber, sMobileNumber1, sLocation, sInvoiceNo, sInvoiceDate) {
            var oView = this.getView();
            oView.byId("idOrderNo").setValue(sOrderId || "");
            oView.byId("orderDate").setValue(sOrderDate || "");
            oView.byId("customerName").setValue(sCustomerName || "");
            oView.byId("mobileNo").setValue(sMobileNumber || "");
            oView.byId("landLineNo").setValue(sMobileNumber1 || "");
            oView.byId("location").setValue(sLocation || "");
            oView.byId("invoiceDetails").setValue(sInvoiceNo || "");
            oView.byId("invoiceDate").setValue(sInvoiceDate || "");

            this.handleSaveButtonEnabled();
        },

        _clearForm: function () {
            var oView = this.getView();
            oView.byId("idOrderNo").setValue("");
            oView.byId("customerName").setValue("");
            oView.byId("mobileNo").setValue("");
            oView.byId("location").setValue("");
            oView.byId("landLineNo").setValue("");
            oView.byId("invoiceDetails").setValue("");
            oView.byId("jobRef").setValue("");
            oView.byId("modelNo").setValue("");
            oView.byId("serialNo").setValue("");
            oView.byId("empName").setValue("");
            oView.byId("empCode").setValue("");
            oView.byId("techName").setValue("");
            oView.byId("vendorCode").setValue("");
            oView.byId("partsEHA").setValue("");
            oView.byId("damageEHA").setValue("");
            oView.byId("causeEHA").setValue("");
            oView.byId("orderDate").setValue("");
            oView.byId("invoiceDate").setValue("");
            oView.byId("repairDate").setValue("");
            oView.byId("idUserStatus").setSelectedKey(null);

            var oFileUploader = oView.byId("fileUploader");
            if (oFileUploader) {
                oFileUploader.clear();
            }
            this.handleSaveButtonEnabled();
        },

        handleSaveButtonEnabled: function () {
            var oView = this.getView();
            var oSaveButton = oView.byId("idSaveButton");

            if (oSaveButton) {
                var oSelect = oView.byId("idUserStatus");
                var bEnabled = oSelect && oSelect.getSelectedKey() !== null &&
                    oSelect.getSelectedKey() !== "";
                oSaveButton.setEnabled(bEnabled);
            }
        },

        onClearSignature: function () {
            MessageBox.information("Signature cleared");
        },

        onCancel: function () {
            this.onNavBack();
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("orderList", {}, true);
            }
        }
    });
});