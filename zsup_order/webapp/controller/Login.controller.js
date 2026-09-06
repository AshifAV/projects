sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, MessageBox, Filter, FilterOperator) {

    "use strict";

    return Controller.extend("zsuporder.controller.Login", {

        onInit: function () {
            // Ensure model is loaded
            var oModel = this.getOwnerComponent().getModel();
            if (oModel) {
                // Pre-load metadata
                oModel.metadataLoaded().then(function () {
                    console.log("Metadata ready");
                }).catch(function (err) {
                    console.warn("Metadata not ready, will retry on login");
                });
            }
        },

        onLogin: function () {
            var oView = this.getView();
            var oEmployeeCodeInput = oView.byId("employeeCode");
            var oPasswordInput = oView.byId("password");
            var sEmployeeCode = oEmployeeCodeInput.getValue().trim();
            var sPassword = oPasswordInput.getValue();

            // Validation code...
            if (!sEmployeeCode) {
                MessageBox.warning("Please enter Employee Code.");
                oEmployeeCodeInput.focus();
                return;
            }

            if (!/^\d{5}$/.test(sEmployeeCode)) {
                MessageBox.warning("Employee Code must be exactly 5 digits.");
                oEmployeeCodeInput.focus();
                return;
            }

            if (!sPassword) {
                MessageBox.warning("Please enter Password.");
                oPasswordInput.focus();
                return;
            }

            var oButton = oView.byId("loginButton");
            oButton.setBusy(true);
            oButton.setEnabled(false);

            var oModel = this.getOwnerComponent().getModel();

            // Check if model exists
            if (!oModel) {
                MessageBox.error("Application not ready. Please refresh the page.");
                oButton.setBusy(false);
                oButton.setEnabled(true);
                return;
            }

            var sPaddedEmployeeCode = ("00000000" + sEmployeeCode).slice(-8);

            // Try to ensure connection
            this._performAuthentication(oModel, sPaddedEmployeeCode, sPassword, oButton);
        },

        _performAuthentication: function (oModel, sEmployeeCode, sPassword, oButton) {
            var aFilters = [];

            aFilters.push(new Filter("EmployeeCode", FilterOperator.EQ, sEmployeeCode));
            aFilters.push(new Filter("Password", FilterOperator.EQ, sPassword));

            // Add timeout and retry
            var that = this;
            var bRetried = false;

            function doRead() {
                oModel.read("/AuthenticationSet", {
                    filters: aFilters,
                    success: function (oData) {
                        oButton.setBusy(false);
                        oButton.setEnabled(true);
                        that._handleLoginSuccess(oData);
                    }.bind(this),
                    error: function (oError) {
                        // If first error and not retried, try refreshing and read again
                        if (!bRetried) {
                            bRetried = true;
                            try {
                                oModel.refreshSecurityToken();
                                setTimeout(doRead, 500);
                            } catch (e) {
                                that._handleLoginError(oError, oButton);
                            }
                        } else {
                            that._handleLoginError(oError, oButton);
                        }
                    }.bind(this)
                });
            }

            doRead.call(this);
        },

        _handleLoginSuccess: function (oData) {
            if (oData && oData.results && oData.results.length > 0) {
                var oAuth = oData.results[0];
                if (oAuth.Active === "X") {
                    var oLoginModel = new sap.ui.model.json.JSONModel({
                        EmployeeCode: oAuth.EmployeeCode,
                        LoggedIn: true
                    });
                    this.getOwnerComponent().setModel(oLoginModel, "login");
                    this.getOwnerComponent().getRouter().navTo("orderList", {}, true);
                } else {
                    MessageBox.error(oAuth.Message || "Invalid Employee Code or Password.");
                }
            } else {
                MessageBox.error("Invalid Employee Code or Password.");
            }
        },

        _handleLoginError: function (oError, oButton) {
            oButton.setBusy(false);
            oButton.setEnabled(true);
            console.error("Authentication error:", oError);
            MessageBox.error("Unable to authenticate. Please try again.");
        },

        onAfterInit: function () {
            // Ensure DOM is ready and model is loaded
            var oModel = this.getOwnerComponent().getModel();
            if (oModel) {
                oModel.metadataLoaded().then(function () {
                    console.log("Model ready");
                });
            }
        }
    });
});