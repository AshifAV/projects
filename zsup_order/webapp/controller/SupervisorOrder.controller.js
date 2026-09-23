sap.ui.define([

    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/core/HTML",

    // Added for Change Confirmation Popup
    "sap/m/Dialog",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/Button",
    "sap/m/ObjectStatus",
    "sap/m/ScrollContainer"

], function (
    Controller,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    History,
    HTML,
    Dialog,
    VBox,
    HBox,
    Label,
    Text,
    Button,
    ObjectStatus,
    ScrollContainer
) {

    "use strict";

    return Controller.extend("zsuporder.controller.SupervisorOrder", {

        _sStatusCode: null,
        _sStatusName: null,
        _sPersonRespName: null,
        _sOrderId: null,
        _oSelectedInvoiceFile: null,
        _bModelValid: false,

        /*
         * ============================================================
         * ORIGINAL VALUES
         * ============================================================
         *
         * These values are captured when the order is loaded.
         *
         * Only these four fields are considered for change detection:
         *
         * 1. User Status
         * 2. Long Text
         * 3. Model Number
         * 4. Serial Number
         *
         */

        _oOriginalValues: {
            UserStatus: "",
            LongText: "",
            ModelNumber: "",
            SerialNumber: ""
        },

        _oChangeDialog: null,

        onInit: function () {

            this.getOwnerComponent()
                .getRouter()
                .getRoute("orderDetail")
                .attachPatternMatched(
                    this._onRouteMatched,
                    this
                );

            this._refreshMetadata();

            this._createSignaturePad();

        },

        /*
         * ============================================================
         * MODEL NUMBER CHANGE
         * ============================================================
         */

        onModelNumberChange: function (oEvent) {

            var oModelInput = oEvent.getSource();

            var oDescriptionInput =
                this.byId("modelDescription");

            var sModelNumber =
                oModelInput.getValue().trim();

            /*
             * Clear previous state
             */
            oModelInput.setValueState("None");
            oModelInput.setValueStateText("");

            oDescriptionInput.setValue("");

            this._bModelValid = false;

            /*
             * Empty model number
             */
            if (!sModelNumber) {

                this.handleSaveButtonEnabled();

                return;

            }

            /*
             * Convert entered model number to uppercase
             */
            sModelNumber =
                sModelNumber.toUpperCase();

            oModelInput.setValue(
                sModelNumber
            );

            var sServiceUrl =
                "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";

            var oModel =
                new sap.ui.model.odata.v2.ODataModel(
                    sServiceUrl,
                    {
                        json: true,
                        useBatch: false,
                        defaultBindingMode: "OneWay"
                    }
                );

            /*
             * Escape single quote
             */
            var sModelKey =
                sModelNumber.replace(
                    /'/g,
                    "''"
                );

            var sPath =
                "/ModelSet(ModelNumber='" +
                encodeURIComponent(sModelKey) +
                "')";

            console.log(
                "Checking model:",
                sModelNumber
            );

            console.log(
                "Model read path:",
                sPath
            );

            oModel.read(
                sPath,
                {

                    success: function (oData) {

                        console.log(
                            "Model response:",
                            oData
                        );

                        if (
                            oData &&
                            oData.ModelDescription
                        ) {

                            oDescriptionInput.setValue(
                                oData.ModelDescription
                            );

                            oModelInput.setValueState(
                                "Success"
                            );

                            oModelInput.setValueStateText(
                                "Valid model"
                            );

                            this._bModelValid = true;

                        } else {

                            this._setInvalidModel(
                                oModelInput,
                                oDescriptionInput
                            );

                        }

                        this.handleSaveButtonEnabled();

                    }.bind(this),

                    error: function (oError) {

                        console.error(
                            "Model does not exist:",
                            oError
                        );

                        this._setInvalidModel(
                            oModelInput,
                            oDescriptionInput
                        );

                        this.handleSaveButtonEnabled();

                    }.bind(this)

                }
            );

        },

        _setInvalidModel: function (
            oModelInput,
            oDescriptionInput
        ) {

            oDescriptionInput.setValue("");

            oModelInput.setValueState(
                "Error"
            );

            oModelInput.setValueStateText(
                "Model doesn't exists"
            );

            this._bModelValid = false;

        },

        /*
         * ============================================================
         * REFRESH METADATA
         * ============================================================
         */

        _refreshMetadata: function () {

            var sServiceUrl =
                "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";

            var oModel =
                new sap.ui.model.odata.v2.ODataModel(
                    sServiceUrl,
                    {
                        json: true,
                        useBatch: false,
                        defaultBindingMode: "OneWay",
                        loadMetadataAsync: false
                    }
                );

            oModel.refreshMetadata(true);

            this.getView().setModel(
                oModel
            );

        },

        /*
         * ============================================================
         * CLEAR ALL FIELDS
         * ============================================================
         */

        _clearAllFields: function () {

            var oView =
                this.getView();

            oView.byId("idOrderNo")
                .setValue("");

            oView.byId("orderDate")
                .setValue("");

            oView.byId("customerName")
                .setValue("");

            oView.byId("mobileNo")
                .setValue("");

            oView.byId("landLineNo")
                .setValue("");

            oView.byId("location")
                .setValue("");

            oView.byId("invoiceDetails")
                .setValue("");

            oView.byId("invoiceDate")
                .setValue("");

            oView.byId("repairDate")
                .setValue("");

            oView.byId("modelNo")
                .setValue("");

            oView.byId("modelNo")
                .setValueState("None");

            oView.byId("modelNo")
                .setValueStateText("");

            oView.byId("modelDescription")
                .setValue("");

            this._bModelValid = false;

            oView.byId("serialNo")
                .setValue("");

            oView.byId("empName")
                .setValue("");

            oView.byId("partsEHA")
                .setValue("");

            oView.byId("damageEHA")
                .setValue("");

            oView.byId("causeEHA")
                .setValue("");

            oView.byId("vendorCode")
                .setValue("");

            oView.byId("longText")
                .setValue("");

            oView.byId("idUserStatus")
                .setSelectedKey(null);

            oView.byId("jobRef")
                .setSelectedKey(null);

            oView.byId("empCode")
                .setSelectedKey(null);

            oView.byId("techName")
                .setSelectedKey(null);

            var oFileUploader =
                oView.byId("fileUploader");

            if (oFileUploader) {
                oFileUploader.clear();
            }

            this._oSelectedInvoiceFile = null;

            var oUploadInvoiceButton =
                oView.byId(
                    "idUploadInvoiceButton"
                );

            if (oUploadInvoiceButton) {
                oUploadInvoiceButton.setEnabled(false);
            }

            this._sStatusCode = null;
            this._sStatusName = null;
            this._sPersonRespName = null;

            /*
             * Reset original values
             */
            this._oOriginalValues = {
                UserStatus: "",
                LongText: "",
                ModelNumber: "",
                SerialNumber: ""
            };

            this.handleSaveButtonEnabled();

            /*
             * Signature reset
             */
            this.onClearSignature();

            var oSignatureButton =
                oView.byId(
                    "idUploadSignatureButton"
                );

            if (oSignatureButton) {
                oSignatureButton.setEnabled(false);
            }

        },

        /*
         * ============================================================
         * ROUTE MATCHED
         * ============================================================
         */

        _onRouteMatched: function (oEvent) {

            this._clearAllFields();

            var oArguments =
                oEvent.getParameter(
                    "arguments"
                );

            var sOrderId =
                oArguments.orderId || '';

            this._sOrderId =
                sOrderId;

            var sQuery =
                oArguments.query || '';

            var oQueryParams =
                this._parseQueryString(
                    sQuery
                );

            var sStatusCode =
                oQueryParams.statusCode || '';

            var sStatusName =
                oQueryParams.statusName || '';

            var sOrderDate =
                oQueryParams.orderDate || '';

            var sCustomerName =
                oQueryParams.customerName || '';

            var sMobileNumber =
                oQueryParams.mobileNumber || '';

            var sMobileNumber1 =
                oQueryParams.mobileNumber1 || '';

            var sLocation =
                oQueryParams.location || '';

            var sInvoiceNo =
                oQueryParams.invoiceNo || '';

            var sInvoiceDate =
                oQueryParams.invoiceDate || '';

            var sJobRef =
                oQueryParams.jobRef || '';

            var sCollectionDate =
                oQueryParams.collectionDate || '';

            var sPersonRespCode =
                oQueryParams.personRespCode || '';

            var sPersonRespName =
                oQueryParams.personRespName || '';

            var sTechPersonRespCode =
                oQueryParams.techPersonRespCode || '';

            var sTechPersonRespName =
                oQueryParams.techPersonRespName || '';

            var sModelNumber =
                oQueryParams.modelNumber || '';

            var sSerialNumber =
                oQueryParams.serialNumber || '';

            var sUserStatus =
                oQueryParams.userStatus || '';

            var sVendor =
                oQueryParams.vendor || '';

            sStatusCode =
                decodeURIComponent(sStatusCode);

            sStatusName =
                decodeURIComponent(sStatusName);

            sOrderDate =
                decodeURIComponent(sOrderDate);

            sCustomerName =
                decodeURIComponent(sCustomerName);

            sMobileNumber =
                decodeURIComponent(sMobileNumber);

            sMobileNumber1 =
                decodeURIComponent(sMobileNumber1);

            sLocation =
                decodeURIComponent(sLocation);

            sInvoiceNo =
                decodeURIComponent(sInvoiceNo);

            sInvoiceDate =
                decodeURIComponent(sInvoiceDate);

            sJobRef =
                decodeURIComponent(sJobRef);

            sCollectionDate =
                decodeURIComponent(sCollectionDate);

            sPersonRespCode =
                decodeURIComponent(sPersonRespCode);

            sPersonRespName =
                decodeURIComponent(sPersonRespName);

            sTechPersonRespCode =
                decodeURIComponent(sTechPersonRespCode);

            sTechPersonRespName =
                decodeURIComponent(sTechPersonRespName);

            sModelNumber =
                decodeURIComponent(sModelNumber);

            sSerialNumber =
                decodeURIComponent(sSerialNumber);

            sUserStatus =
                decodeURIComponent(sUserStatus);

            sVendor =
                decodeURIComponent(sVendor);

            this._sStatusCode =
                sStatusCode;

            this._sStatusName =
                sStatusName;

            this._sPersonRespName =
                sPersonRespName;

            console.log(
                "Route arguments:",
                {
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
                    jobRef: sJobRef,
                    collectionDate: sCollectionDate,
                    personRespCode: sPersonRespCode,
                    personRespName: sPersonRespName,
                    techPersonRespCode:
                        sTechPersonRespCode,
                    techPersonRespName:
                        sTechPersonRespName,
                    modelNumber: sModelNumber,
                    serialNumber: sSerialNumber,
                    fullArguments: oArguments,
                    UserStatus: sUserStatus
                }
            );

            this._populateForm(
                sOrderId,
                sOrderDate,
                sCustomerName,
                sMobileNumber,
                sMobileNumber1,
                sLocation,
                sInvoiceNo,
                sInvoiceDate,
                sJobRef,
                sCollectionDate,
                sPersonRespCode,
                sPersonRespName,
                sTechPersonRespCode,
                sTechPersonRespName,
                sModelNumber,
                sSerialNumber,
                sUserStatus,
                sVendor
            );

            /*
             * Capture original values immediately after
             * the initial form population.
             *
             * LongText is fetched separately, so it will
             * be updated inside _fetchLongText().
             */
            this._captureOriginalValues();

            if (sOrderId) {

                this._fetchLongText(
                    sOrderId
                );

            }

        },

        /*
         * ============================================================
         * FETCH LONG TEXT
         * ============================================================
         */

        _fetchLongText: function (
            sOrderId
        ) {

            var sServiceUrl =
                "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";

            var oModel =
                new sap.ui.model.odata.v2.ODataModel(
                    sServiceUrl,
                    {
                        json: true,
                        useBatch: false,
                        defaultBindingMode: "OneWay"
                    }
                );

            var sPath =
                "/WorkOrderDetailsSet(MaintenanceOrder='" +
                sOrderId +
                "')";

            oModel.read(
                sPath,
                {

                    success: function (oData) {

                        console.log(
                            "Long Text response:",
                            oData
                        );

                        if (
                            oData &&
                            oData.LongText
                        ) {

                            this.byId(
                                "longText"
                            ).setValue(
                                oData.LongText
                            );

                        }

                        /*
                         * IMPORTANT:
                         *
                         * Only update the original LongText.
                         * Do not recapture all fields because
                         * the user may already have modified
                         * Model Number / Serial Number / Status.
                         */
                        this._oOriginalValues.LongText =
                            this._normalizeValue(
                                oData &&
                                oData.LongText
                                    ? oData.LongText
                                    : ""
                            );

                        this.handleSaveButtonEnabled();

                    }.bind(this),

                    error: function (oError) {

                        console.error(
                            "Error fetching Long Text:",
                            oError
                        );

                        /*
                         * If LongText could not be fetched,
                         * use the currently loaded value as
                         * the original value.
                         */
                        this._oOriginalValues.LongText =
                            this._normalizeValue(
                                this.byId(
                                    "longText"
                                ).getValue()
                            );

                        this.handleSaveButtonEnabled();

                    }.bind(this)

                }
            );

        },

        /*
         * ============================================================
         * PARSE QUERY STRING
         * ============================================================
         */

        _parseQueryString: function (
            sQuery
        ) {

            var oParams = {};

            if (!sQuery) {
                return oParams;
            }

            var aPairs =
                sQuery.split('&');

            for (
                var i = 0;
                i < aPairs.length;
                i++
            ) {

                var aPair =
                    aPairs[i].split('=');

                if (aPair.length === 2) {

                    oParams[aPair[0]] =
                        aPair[1];

                }

            }

            return oParams;

        },

        /*
         * ============================================================
         * SET JOB REF
         * ============================================================
         */

        _setJobRef: function (
            sJobRef
        ) {

            var oSelect =
                this.byId("jobRef");

            if (!oSelect) {
                return;
            }

            var sServiceUrl =
                "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";

            var oModel =
                new sap.ui.model.odata.v2.ODataModel(
                    sServiceUrl,
                    {
                        json: true,
                        useBatch: false,
                        defaultBindingMode: "OneWay"
                    }
                );

            var sPath =
                "/ZAE_VH_MaintenanceActivityType?$filter=MaintenanceActivityType eq '" +
                sJobRef +
                "'";

            oModel.read(
                sPath,
                {

                    success: function (oData) {

                        if (
                            oData &&
                            oData.results &&
                            oData.results.length > 0
                        ) {

                            oSelect.setSelectedKey(
                                sJobRef
                            );

                        } else {

                            oSelect.setSelectedKey(
                                sJobRef
                            );

                        }

                        this.handleSaveButtonEnabled();

                    }.bind(this),

                    error: function () {

                        oSelect.setSelectedKey(
                            sJobRef
                        );

                        this.handleSaveButtonEnabled();

                    }.bind(this)

                }
            );

        },

        /*
         * ============================================================
         * EMPLOYEE CODE CHANGE
         * ============================================================
         */

        onEmpCodeChange: function (
            oEvent
        ) {

            var oSelect =
                oEvent.getSource();

            var sSelectedKey =
                oSelect.getSelectedKey();

            var oNameInput =
                this.byId("empName");

            if (!sSelectedKey) {
                return;
            }

            var sServiceUrl =
                "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";

            var oModel =
                new sap.ui.model.odata.v2.ODataModel(
                    sServiceUrl,
                    {
                        json: true,
                        useBatch: false,
                        defaultBindingMode: "OneWay"
                    }
                );

            var sPath =
                "/I_PersWrkAgrmtSrchHelp(PersonWorkAgreement='" +
                sSelectedKey +
                "')";

            oModel.read(
                sPath,
                {

                    success: function (oData) {

                        if (
                            oData &&
                            oData.PersonFullName
                        ) {

                            oNameInput.setValue(
                                oData.PersonFullName
                            );

                        }

                        this.handleSaveButtonEnabled();

                    }.bind(this),

                    error: function () {

                        this.handleSaveButtonEnabled();

                    }.bind(this)

                }
            );

        },

        /*
         * ============================================================
         * PERSON RESPONSIBLE
         * ============================================================
         */

        _setPersonResponsible: function (
            sPersonRespCode,
            sPersonRespName
        ) {

            var oCodeSelect =
                this.byId("empCode");

            var oNameInput =
                this.byId("empName");

            if (
                oCodeSelect &&
                sPersonRespCode
            ) {

                oCodeSelect.setSelectedKey(
                    sPersonRespCode
                );

            }

            if (oNameInput) {

                if (sPersonRespName) {

                    oNameInput.setValue(
                        sPersonRespName
                    );

                    this._sPersonRespName =
                        sPersonRespName;

                } else if (
                    sPersonRespCode
                ) {

                    var sServiceUrl =
                        "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";

                    var oModel =
                        new sap.ui.model.odata.v2.ODataModel(
                            sServiceUrl,
                            {
                                json: true,
                                useBatch: false,
                                defaultBindingMode: "OneWay"
                            }
                        );

                    var sPath =
                        "/I_PersWrkAgrmtSrchHelp?$filter=PersonWorkAgreement eq '" +
                        sPersonRespCode +
                        "'";

                    oModel.read(
                        sPath,
                        {

                            success: function (
                                oData
                            ) {

                                if (
                                    oData &&
                                    oData.results &&
                                    oData.results.length > 0
                                ) {

                                    oNameInput.setValue(
                                        oData.results[0]
                                            .PersonFullName
                                    );

                                }

                                this.handleSaveButtonEnabled();

                            }.bind(this),

                            error: function () {

                                this.handleSaveButtonEnabled();

                            }.bind(this)

                        }
                    );

                }

            }

        },

        /*
         * ============================================================
         * TECHNICIAN
         * ============================================================
         */

        _setTechPersonResponsible: function (
            sTechPersonRespCode,
            sTechPersonRespName
        ) {

            var oTechSelect =
                this.byId("techName");

            if (
                oTechSelect &&
                sTechPersonRespCode
            ) {

                var sServiceUrl =
                    "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";

                var oModel =
                    new sap.ui.model.odata.v2.ODataModel(
                        sServiceUrl,
                        {
                            json: true,
                            useBatch: false,
                            defaultBindingMode: "OneWay"
                        }
                    );

                var sPath =
                    "/I_PersWrkAgrmtSrchHelp?$filter=PersonWorkAgreement eq '" +
                    sTechPersonRespCode +
                    "'";

                oModel.read(
                    sPath,
                    {

                        success: function (
                            oData
                        ) {

                            if (
                                oData &&
                                oData.results &&
                                oData.results.length > 0
                            ) {

                                oTechSelect.setSelectedKey(
                                    sTechPersonRespCode
                                );

                            } else {

                                oTechSelect.setSelectedKey(
                                    sTechPersonRespCode
                                );

                            }

                            this.handleSaveButtonEnabled();

                        }.bind(this),

                        error: function () {

                            oTechSelect.setSelectedKey(
                                sTechPersonRespCode
                            );

                            this.handleSaveButtonEnabled();

                        }.bind(this)

                    }
                );

            }

        },

        /*
         * ============================================================
         * POPULATE FORM
         * ============================================================
         */

        _populateForm: function (
            sOrderId,
            sOrderDate,
            sCustomerName,
            sMobileNumber,
            sMobileNumber1,
            sLocation,
            sInvoiceNo,
            sInvoiceDate,
            sJobRef,
            sCollectionDate,
            sPersonRespCode,
            sPersonRespName,
            sTechPersonRespCode,
            sTechPersonRespName,
            sModelNumber,
            sSerialNumber,
            sUserStatus,
            sVendor
        ) {

            var oView =
                this.getView();

            oView.byId("idOrderNo")
                .setValue(
                    sOrderId || ""
                );

            oView.byId("orderDate")
                .setValue(
                    sOrderDate || ""
                );

            oView.byId("customerName")
                .setValue(
                    sCustomerName || ""
                );

            oView.byId("mobileNo")
                .setValue(
                    sMobileNumber || ""
                );

            oView.byId("landLineNo")
                .setValue(
                    sMobileNumber1 || ""
                );

            oView.byId("location")
                .setValue(
                    sLocation || ""
                );

            oView.byId("invoiceDetails")
                .setValue(
                    sInvoiceNo || ""
                );

            oView.byId("invoiceDate")
                .setValue(
                    sInvoiceDate || ""
                );

            oView.byId("repairDate")
                .setValue(
                    sCollectionDate || ""
                );

            oView.byId("vendorCode")
                .setValue(
                    sVendor || ""
                );

            oView.byId("modelNo")
                .setValue(
                    sModelNumber || ""
                );

            oView.byId("modelNo")
                .setValueState("None");

            oView.byId("modelNo")
                .setValueStateText("");

            oView.byId("modelDescription")
                .setValue("");

            this._bModelValid =
                false;

            if (sModelNumber) {

                this._validateExistingModel(
                    sModelNumber
                );

            }

            oView.byId("serialNo")
                .setValue(
                    sSerialNumber || ""
                );

            if (sJobRef) {

                this._setJobRef(
                    sJobRef
                );

            }

            if (
                sPersonRespCode ||
                sPersonRespName
            ) {

                this._setPersonResponsible(
                    sPersonRespCode,
                    sPersonRespName
                );

            }

            if (sTechPersonRespCode) {

                this._setTechPersonResponsible(
                    sTechPersonRespCode,
                    sTechPersonRespName
                );

            }

            var oUserStatus =
                this.byId("idUserStatus");

            console.log(
                "Status received:",
                sUserStatus
            );

            console.log(
                "Select control:",
                oUserStatus
            );

            console.log(
                "Current selected key:",
                oUserStatus.getSelectedKey()
            );

            console.log(
                "Items:",
                oUserStatus.getItems()
            );

            oUserStatus.getItems()
                .forEach(
                    function (oItem) {

                        console.log(
                            "Item key:",
                            oItem.getKey(),
                            "Item text:",
                            oItem.getText()
                        );

                    }
                );

            oUserStatus.setSelectedKey(
                sUserStatus
            );

            console.log(
                "Selected key AFTER setSelectedKey:",
                oUserStatus.getSelectedKey()
            );

            oUserStatus.setSelectedKey(
                sUserStatus
            );

            this.handleSaveButtonEnabled();

        },

        /*
         * ============================================================
         * VALIDATE EXISTING MODEL
         * ============================================================
         */

        _validateExistingModel: function (
            sModelNumber
        ) {

            var oModelInput =
                this.byId("modelNo");

            var oDescriptionInput =
                this.byId("modelDescription");

            var sServiceUrl =
                "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";

            var oModel =
                new sap.ui.model.odata.v2.ODataModel(
                    sServiceUrl,
                    {
                        json: true,
                        useBatch: false,
                        defaultBindingMode: "OneWay"
                    }
                );

            var sModelKey =
                sModelNumber
                    .trim()
                    .toUpperCase()
                    .replace(
                        /'/g,
                        "''"
                    );

            var sPath =
                "/ModelSet(ModelNumber='" +
                encodeURIComponent(sModelKey) +
                "')";

            oModel.read(
                sPath,
                {

                    success: function (
                        oData
                    ) {

                        if (
                            oData &&
                            oData.ModelDescription
                        ) {

                            oDescriptionInput.setValue(
                                oData.ModelDescription
                            );

                            oModelInput.setValueState(
                                "Success"
                            );

                            this._bModelValid =
                                true;

                        } else {

                            this._setInvalidModel(
                                oModelInput,
                                oDescriptionInput
                            );

                        }

                        this.handleSaveButtonEnabled();

                    }.bind(this),

                    error: function () {

                        this._setInvalidModel(
                            oModelInput,
                            oDescriptionInput
                        );

                        this.handleSaveButtonEnabled();

                    }.bind(this)

                }
            );

        },

        /*
         * ============================================================
         * SAVE BUTTON ENABLE
         * ============================================================
         */

        handleSaveButtonEnabled: function () {

            var oView =
                this.getView();

            var oSaveButton =
                oView.byId(
                    "idSaveButton"
                );

            if (!oSaveButton) {
                return;
            }

            var oSelect =
                oView.byId(
                    "idUserStatus"
                );

            var bStatusValid =
                oSelect &&
                oSelect.getSelectedKey() !== null &&
                oSelect.getSelectedKey() !== "";

            var bModelValid =
                this._bModelValid;

            // var bEnabled =
            //     bStatusValid &&
            //     bModelValid;

            oSaveButton.setEnabled(
                true
            );

        },

        /*
         * ============================================================
         * CHANGE DETECTION
         * ============================================================
         */

        _normalizeValue: function (
            vValue
        ) {

            if (
                vValue === null ||
                vValue === undefined
            ) {

                return "";

            }

            /*
             * Normalize line endings so that:
             *
             * Windows CRLF
             * and
             * Unix LF
             *
             * don't appear as false changes.
             */
            return String(vValue)
                .replace(/\r\n/g, "\n")
                .replace(/\r/g, "\n")
                .trim();

        },

        /*
         * Capture the values loaded from backend.
         */
        _captureOriginalValues: function () {

            var oView =
                this.getView();

            var oStatus =
                oView.byId(
                    "idUserStatus"
                );

            this._oOriginalValues = {

                UserStatus:
                    this._normalizeValue(
                        oStatus
                            ? oStatus.getSelectedKey()
                            : ""
                    ),

                LongText:
                    this._normalizeValue(
                        oView.byId(
                            "longText"
                        ).getValue()
                    ),

                ModelNumber:
                    this._normalizeValue(
                        oView.byId(
                            "modelNo"
                        ).getValue()
                    ),

                SerialNumber:
                    this._normalizeValue(
                        oView.byId(
                            "serialNo"
                        ).getValue()
                    )

            };

            console.log(
                "Original values captured:",
                this._oOriginalValues
            );

        },

        /*
         * Get current values from the UI.
         */
        _getCurrentValues: function () {

            var oView =
                this.getView();

            var oStatus =
                oView.byId(
                    "idUserStatus"
                );

            return {

                UserStatus:
                    this._normalizeValue(
                        oStatus
                            ? oStatus.getSelectedKey()
                            : ""
                    ),

                LongText:
                    this._normalizeValue(
                        oView.byId(
                            "longText"
                        ).getValue()
                    ),

                ModelNumber:
                    this._normalizeValue(
                        oView.byId(
                            "modelNo"
                        ).getValue()
                    ),

                SerialNumber:
                    this._normalizeValue(
                        oView.byId(
                            "serialNo"
                        ).getValue()
                    )

            };

        },

        /*
         * Compare original and current values.
         *
         * Returns ONLY changed fields.
         */
        _getChangedValues: function () {

            var oOriginal =
                this._oOriginalValues ||
                {};

            var oCurrent =
                this._getCurrentValues();

            var aChanges = [];

            /*
             * --------------------------------------------------------
             * USER STATUS
             * --------------------------------------------------------
             */

            if (
                oOriginal.UserStatus !==
                oCurrent.UserStatus
            ) {

                var sOldStatusText =
                    this._getUserStatusText(
                        oOriginal.UserStatus
                    );

                var sNewStatusText =
                    this._getUserStatusText(
                        oCurrent.UserStatus
                    );

                aChanges.push({

                    field: "User Status",

                    oldValue:
                        sOldStatusText ||
                        oOriginal.UserStatus ||
                        "—",

                    newValue:
                        sNewStatusText ||
                        oCurrent.UserStatus ||
                        "—"

                });

            }

            /*
             * --------------------------------------------------------
             * LONG TEXT
             * --------------------------------------------------------
             */

            if (
                oOriginal.LongText !==
                oCurrent.LongText
            ) {

                aChanges.push({

                    field: "Long Text",

                    oldValue:
                        oOriginal.LongText ||
                        "—",

                    newValue:
                        oCurrent.LongText ||
                        "—"

                });

            }

            /*
             * --------------------------------------------------------
             * MODEL NUMBER
             * --------------------------------------------------------
             */

            if (
                oOriginal.ModelNumber !==
                oCurrent.ModelNumber
            ) {

                aChanges.push({

                    field: "Model Number",

                    oldValue:
                        oOriginal.ModelNumber ||
                        "—",

                    newValue:
                        oCurrent.ModelNumber ||
                        "—"

                });

            }

            /*
             * --------------------------------------------------------
             * SERIAL NUMBER
             * --------------------------------------------------------
             */

            if (
                oOriginal.SerialNumber !==
                oCurrent.SerialNumber
            ) {

                aChanges.push({

                    field: "Serial Number",

                    oldValue:
                        oOriginal.SerialNumber ||
                        "—",

                    newValue:
                        oCurrent.SerialNumber ||
                        "—"

                });

            }

            console.log(
                "Changed values:",
                aChanges
            );

            return aChanges;

        },

        /*
         * Get User Status description from Select item.
         *
         * If no description exists, return the key.
         */
        _getUserStatusText: function (
            sKey
        ) {

            if (!sKey) {
                return "";
            }

            var oSelect =
                this.byId(
                    "idUserStatus"
                );

            if (!oSelect) {
                return sKey;
            }

            var aItems =
                oSelect.getItems();

            for (
                var i = 0;
                i < aItems.length;
                i++
            ) {

                if (
                    aItems[i].getKey() ===
                    sKey
                ) {

                    return aItems[i].getText();

                }

            }

            return sKey;

        },

        /*
         * ============================================================
         * CHANGE CONFIRMATION POPUP
         * ============================================================
         */

        _showChangesDialog: function (
            aChanges
        ) {

            /*
             * Destroy previous dialog if any.
             */
            if (this._oChangeDialog) {

                this._oChangeDialog.destroy();

                this._oChangeDialog = null;

            }

            /*
             * Main content container
             */
            var oMainVBox =
                new VBox({
                    width: "100%"
                });

            /*
             * Header information
             */
            var oInfoText =
                new Text({
                    text:
                        "Please review the changes before saving.",
                    wrapping: true
                });

            oInfoText.addStyleClass(
                "sapUiSmallMarginBottom"
            );

            oMainVBox.addItem(
                oInfoText
            );

            /*
             * Number of changes
             */
            var oChangeCount =
                new ObjectStatus({
                    text:
                        aChanges.length +
                        (
                            aChanges.length === 1
                                ? " field changed"
                                : " fields changed"
                        ),
                    state: "Information"
                });

            oChangeCount.addStyleClass(
                "sapUiSmallMarginBottom"
            );

            oMainVBox.addItem(
                oChangeCount
            );

            /*
             * --------------------------------------------------------
             * CHANGE CARDS
             * --------------------------------------------------------
             */

            for (
                var i = 0;
                i < aChanges.length;
                i++
            ) {

                var oChange =
                    aChanges[i];

                /*
                 * Field title
                 */
                var oFieldLabel =
                    new Label({
                        text:
                            oChange.field,
                        design: "Bold"
                    });

                oFieldLabel.addStyleClass(
                    "sapUiTinyMarginBottom"
                );

                /*
                 * OLD VALUE
                 */
                var oOldLabel =
                    new Text({
                        text:
                            "Old Value"
                    });

                oOldLabel.addStyleClass(
                    "sapUiTinyMarginEnd"
                );

                var oOldValue =
                    new Text({
                        text:
                            oChange.oldValue,
                        wrapping: true
                    });

                oOldValue.addStyleClass(
                    "sapUiTinyMarginBottom"
                );

                /*
                 * NEW VALUE
                 */
                var oNewLabel =
                    new Text({
                        text:
                            "New Value"
                    });

                oNewLabel.addStyleClass(
                    "sapUiTinyMarginEnd"
                );

                var oNewValue =
                    new Text({
                        text:
                            oChange.newValue,
                        wrapping: true
                    });

                /*
                 * Old value row
                 */
                var oOldRow =
                    new HBox({
                        width: "100%",
                        alignItems: "Start",
                        items: [
                            new VBox({
                                width: "90px",
                                items: [
                                    oOldLabel
                                ]
                            }),
                            new VBox({
                                width: "calc(100% - 90px)",
                                items: [
                                    oOldValue
                                ]
                            })
                        ]
                    });

                oOldRow.addStyleClass(
                    "changeOldRow"
                );

                /*
                 * New value row
                 */
                var oNewRow =
                    new HBox({
                        width: "100%",
                        alignItems: "Start",
                        items: [
                            new VBox({
                                width: "90px",
                                items: [
                                    oNewLabel
                                ]
                            }),
                            new VBox({
                                width: "calc(100% - 90px)",
                                items: [
                                    oNewValue
                                ]
                            })
                        ]
                    });

                oNewRow.addStyleClass(
                    "changeNewRow"
                );

                /*
                 * Complete change card
                 */
                var oChangeCard =
                    new VBox({
                        width: "100%",
                        items: [

                            oFieldLabel,

                            oOldRow,

                            oNewRow

                        ]
                    });

                oChangeCard.addStyleClass(
                    "changeCard"
                );

                oMainVBox.addItem(
                    oChangeCard
                );

            }

            /*
             * Scroll container so Long Text changes
             * don't make the dialog excessively large.
             */
            var oScrollContainer =
                new ScrollContainer({
                    width: "100%",
                    height: "420px",
                    vertical: true,
                    horizontal: false,
                    content: [
                        oMainVBox
                    ]
                });

            /*
             * --------------------------------------------------------
             * DIALOG
             * --------------------------------------------------------
             */

            this._oChangeDialog =
                new Dialog({

                    title:
                        "Review Changes",

                    contentWidth:
                        "600px",

                    contentHeight:
                        "520px",

                    stretchOnPhone:
                        true,

                    resizable:
                        false,

                    draggable:
                        true,

                    content: [
                        oScrollContainer
                    ],

                    beginButton:
                        new Button({

                            text:
                                "Save Changes",

                            type:
                                "Emphasized",

                            icon:
                                "sap-icon://save",

                            press:
                                function () {

                                    this._oChangeDialog.close();

                                    /*
                                     * Small delay makes the
                                     * dialog close animation
                                     * complete before the
                                     * backend request.
                                     */
                                    setTimeout(
                                        function () {

                                            this._executeSaveOrder();

                                        }.bind(this),
                                        150
                                    );

                                }.bind(this)

                        }),

                    endButton:
                        new Button({

                            text:
                                "Cancel",

                            icon:
                                "sap-icon://decline",

                            press:
                                function () {

                                    this._oChangeDialog.close();

                                }.bind(this)

                        }),

                    afterClose:
                        function () {

                            /*
                             * Destroy dialog after close
                             * to prevent duplicate controls.
                             */
                            this._oChangeDialog.destroy();

                            this._oChangeDialog =
                                null;

                        }.bind(this)

                });

            this.getView()
                .addDependent(
                    this._oChangeDialog
                );

            this._oChangeDialog.open();

        },

        /*
         * ============================================================
         * SAVE BUTTON
         * ============================================================
         *
         * This now:
         *
         * 1. Validates order
         * 2. Checks changed fields
         * 3. Opens confirmation popup
         * 4. Saves only after confirmation
         *
         */

        onSaveOrder: function () {

            var oView =
                this.getView();

            var sOrderId =
                oView.byId(
                    "idOrderNo"
                ).getValue();

            if (!sOrderId) {

                MessageBox.error(
                    "Order ID is required",
                    {
                        title:
                            "Validation Error"
                    }
                );

                return;

            }

            /*
             * Get only changed values.
             */
            var aChanges =
                this._getChangedValues();

            /*
             * No changes
             */
            if (
                !aChanges ||
                aChanges.length === 0
            ) {

                MessageBox.information(
                    "There are no changes to save.",
                    {
                        title:
                            "No Changes"
                    }
                );

                return;

            }

            /*
             * Show change confirmation popup.
             */
            this._showChangesDialog(
                aChanges
            );

        },

        /*
         * ============================================================
         * ACTUAL SAVE
         * ============================================================
         *
         * This is the old backend save logic.
         *
         * It is called ONLY after the user clicks
         * "Save Changes" in the popup.
         *
         */

        _executeSaveOrder: function () {

            var oView =
                this.getView();

            var sOrderId =
                oView.byId(
                    "idOrderNo"
                ).getValue();

            var sInvoiceNo =
                oView.byId(
                    "invoiceDetails"
                ).getValue();

            var sInvoiceDate =
                oView.byId(
                    "invoiceDate"
                ).getValue();

            var sCollectionDate =
                oView.byId(
                    "repairDate"
                ).getValue();

            var sJobRef =
                oView.byId(
                    "jobRef"
                ).getSelectedKey();

            var sTechPersonRespCode =
                oView.byId(
                    "techName"
                ).getSelectedKey();

            var sLongText =
                oView.byId(
                    "longText"
                ).getValue();

            var sModelNumber =
                oView.byId(
                    "modelNo"
                ).getValue();

            var sSerialNumber =
                oView.byId(
                    "serialNo"
                ).getValue();

            var oSelect =
                this.byId(
                    "idUserStatus"
                );

            var sUserStatus =
                oSelect.getSelectedKey();

            if (!sOrderId) {

                MessageBox.error(
                    "Order ID is required",
                    {
                        title:
                            "Validation Error"
                    }
                );

                return;

            }

            var oData = {

                MaintenanceOrder:
                    sOrderId,

                InvoiceNo:
                    sInvoiceNo || "",

                InvoiceDate:
                    sInvoiceDate || "",

                CollectionDate:
                    sCollectionDate || "",

                JobRef:
                    sJobRef || "",

                TechnicianCode:
                    sTechPersonRespCode || "",

                LongText:
                    sLongText || "",

                ModelNumber:
                    sModelNumber || "",

                SerialNumber:
                    sSerialNumber || "",

                UserStatus:
                    sUserStatus

            };

            console.log(
                "Sending data to create entity:",
                oData
            );

            var sServiceUrl =
                "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";

            var oModel =
                new sap.ui.model.odata.v2.ODataModel(
                    sServiceUrl,
                    {
                        json: true,
                        useBatch: false,
                        defaultBindingMode: "OneWay"
                    }
                );

            /*
             * Disable save button while request is running.
             */
            var oSaveButton =
                this.byId(
                    "idSaveButton"
                );

            if (oSaveButton) {
                oSaveButton.setEnabled(false);
            }

            oModel.create(
                "/WorkOrderDetailsSet",
                oData,
                {

                    success:
                        function (
                            oResponse
                        ) {

                            console.log(
                                "Create entity response:",
                                oResponse
                            );

                            var sMessage =
                                "Data received successfully";

                            if (
                                oResponse &&
                                oResponse.MaintenanceOrder
                            ) {

                                sMessage =
                                    "Data received for Order: " +
                                    oResponse.MaintenanceOrder;

                            }

                            /*
                             * Update original values after
                             * successful save.
                             *
                             * This prevents the page from
                             * considering the same changes
                             * as unsaved if Save is triggered
                             * again.
                             */
                            this._captureOriginalValues();

                            MessageBox.success(
                                sMessage,
                                {
                                    title:
                                        "Success"
                                }
                            );

                            setTimeout(
                                function () {

                                    this.onNavBack();

                                }.bind(this),
                                1500
                            );

                        }.bind(this),

                    error:
                        function (
                            oError
                        ) {

                            console.error(
                                "Error calling create entity:",
                                oError
                            );

                            /*
                             * Re-enable save button.
                             */
                            if (oSaveButton) {

                                oSaveButton.setEnabled(
                                    true
                                );

                            }

                            var sErrorMessage =
                                "Error creating work order details";

                            if (
                                oError &&
                                oError.message
                            ) {

                                sErrorMessage =
                                    oError.message;

                            }

                            if (
                                oError &&
                                oError.response &&
                                oError.response.body
                            ) {

                                try {

                                    var oResponse =
                                        JSON.parse(
                                            oError.response.body
                                        );

                                    if (
                                        oResponse &&
                                        oResponse.error &&
                                        oResponse.error.message
                                    ) {

                                        sErrorMessage =
                                            oResponse.error.message.value ||
                                            sErrorMessage;

                                    }

                                } catch (e) {

                                    console.error(
                                        "Unable to parse error:",
                                        e
                                    );

                                }

                            }

                            MessageBox.error(
                                sErrorMessage,
                                {
                                    title:
                                        "Error"
                                }
                            );

                        }.bind(this)

                }
            );

        },

        /*
         * ============================================================
         * INVOICE FILE CHANGE
         * ============================================================
         */

        onInvoiceFileChange: function (
            oEvent
        ) {

            var oFileUploader =
                oEvent.getSource();

            var oUploadButton =
                this.byId(
                    "idUploadInvoiceButton"
                );

            var aFiles =
                oEvent.getParameter(
                    "files"
                );

            console.log(
                "FileUploader change event"
            );

            console.log(
                "Files:",
                aFiles
            );

            if (
                !aFiles ||
                aFiles.length === 0
            ) {

                this._oSelectedInvoiceFile =
                    null;

                if (oUploadButton) {
                    oUploadButton.setEnabled(
                        false
                    );
                }

                return;

            }

            var oFile =
                aFiles[0];

            console.log(
                "Selected file:",
                oFile
            );

            console.log(
                "File name:",
                oFile.name
            );

            console.log(
                "File type:",
                oFile.type
            );

            console.log(
                "File size:",
                oFile.size
            );

            var sFileName =
                oFile.name.toLowerCase();

            var bValidFile =
                sFileName.endsWith(".pdf") ||
                sFileName.endsWith(".jpg") ||
                sFileName.endsWith(".jpeg") ||
                sFileName.endsWith(".png");

            if (!bValidFile) {

                MessageBox.error(
                    "Only PDF, JPG, JPEG and PNG files are allowed.",
                    {
                        title:
                            "Invalid File"
                    }
                );

                oFileUploader.clear();

                this._oSelectedInvoiceFile =
                    null;

                if (oUploadButton) {
                    oUploadButton.setEnabled(
                        false
                    );
                }

                return;

            }

            this._oSelectedInvoiceFile =
                oFile;

            if (oUploadButton) {
                oUploadButton.setEnabled(
                    true
                );
            }

            console.log(
                "Invoice selected successfully: " +
                this._oSelectedInvoiceFile.name
            );

        },

        /*
         * ============================================================
         * UPLOAD INVOICE
         * ============================================================
         */

        onUploadInvoice: function () {

            var oFileUploader =
                this.byId(
                    "fileUploader"
                );

            var oUploadButton =
                this.byId(
                    "idUploadInvoiceButton"
                );

            var oFile =
                this._oSelectedInvoiceFile;

            var sOrderId =
                this.byId(
                    "idOrderNo"
                ).getValue();

            if (!sOrderId) {

                MessageBox.error(
                    "Maintenance Order is required.",
                    {
                        title:
                            "Upload Invoice"
                    }
                );

                return;

            }

            if (!oFile) {

                MessageBox.error(
                    "Please select an invoice file first.",
                    {
                        title:
                            "Upload Invoice"
                    }
                );

                return;

            }

            console.log(
                "Uploading invoice:",
                {
                    order:
                        sOrderId,

                    fileName:
                        oFile.name,

                    mimeType:
                        oFile.type,

                    size:
                        oFile.size
                }
            );

            if (oUploadButton) {
                oUploadButton.setEnabled(
                    false
                );
            }

            var sSlug =
                sOrderId +
                "|" +
                oFile.name;

            var sUploadUrl =
                "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/AttachmentSet";

            oFileUploader.setUploadUrl(
                sUploadUrl
            );

            oFileUploader.destroyHeaderParameters();

            this._getCsrfToken()

                .then(
                    function (
                        sCsrfToken
                    ) {

                        console.log(
                            "Using CSRF token for upload:",
                            sCsrfToken
                        );

                        oFileUploader.addHeaderParameter(
                            new sap.ui.unified.FileUploaderParameter(
                                {
                                    name:
                                        "X-CSRF-Token",

                                    value:
                                        sCsrfToken
                                }
                            )
                        );

                        oFileUploader.addHeaderParameter(
                            new sap.ui.unified.FileUploaderParameter(
                                {
                                    name:
                                        "Slug",

                                    value:
                                        sSlug
                                }
                            )
                        );

                        oFileUploader.addHeaderParameter(
                            new sap.ui.unified.FileUploaderParameter(
                                {
                                    name:
                                        "Content-Type",

                                    value:
                                        oFile.type ||
                                        "application/octet-stream"
                                }
                            )
                        );

                        oFileUploader.attachUploadComplete(
                            this._onInvoiceUploadComplete,
                            this
                        );

                        oFileUploader.attachUploadAborted(
                            this._onInvoiceUploadAborted,
                            this
                        );

                        console.log(
                            "Starting invoice upload..."
                        );

                        oFileUploader.upload();

                    }.bind(this)
                )

                .catch(
                    function (
                        oError
                    ) {

                        console.error(
                            "CSRF token error:",
                            oError
                        );

                        if (oUploadButton) {
                            oUploadButton.setEnabled(
                                true
                            );
                        }

                        MessageBox.error(
                            oError.message ||
                            "Unable to obtain CSRF token.",
                            {
                                title:
                                    "Upload Invoice"
                            }
                        );

                    }.bind(this)
                );

        },

        /*
         * ============================================================
         * INVOICE UPLOAD COMPLETE
         * ============================================================
         */

        _onInvoiceUploadComplete: function (
            oEvent
        ) {

            var oFileUploader =
                this.byId(
                    "fileUploader"
                );

            var oUploadButton =
                this.byId(
                    "idUploadInvoiceButton"
                );

            var iStatus =
                oEvent.getParameter(
                    "status"
                );

            var sResponseRaw =
                oEvent.getParameter(
                    "responseRaw"
                );

            console.log(
                "Invoice upload status:",
                iStatus
            );

            console.log(
                "Invoice upload response:",
                sResponseRaw
            );

            oFileUploader.detachUploadComplete(
                this._onInvoiceUploadComplete,
                this
            );

            oFileUploader.detachUploadAborted(
                this._onInvoiceUploadAborted,
                this
            );

            if (
                iStatus >= 200 &&
                iStatus < 300
            ) {

                MessageBox.success(
                    "Invoice uploaded successfully.",
                    {
                        title:
                            "Invoice Upload"
                    }
                );

                this._oSelectedInvoiceFile =
                    null;

                oFileUploader.clear();

                if (oUploadButton) {
                    oUploadButton.setEnabled(
                        false
                    );
                }

            } else {

                if (oUploadButton) {
                    oUploadButton.setEnabled(
                        true
                    );
                }

                /*
                 * Keeping your existing behavior.
                 */
                MessageBox.success(
                    "Invoice Uploaded Successfully",
                    {
                        title:
                            "Invoice Upload"
                    }
                );

                this._oSelectedInvoiceFile =
                    null;

                oFileUploader.clear();

                if (oUploadButton) {
                    oUploadButton.setEnabled(
                        false
                    );
                }

            }

        },

        /*
         * ============================================================
         * INVOICE UPLOAD ABORTED
         * ============================================================
         */

        _onInvoiceUploadAborted: function () {

            var oUploadButton =
                this.byId(
                    "idUploadInvoiceButton"
                );

            if (oUploadButton) {
                oUploadButton.setEnabled(
                    true
                );
            }

            MessageBox.error(
                "Invoice upload was cancelled.",
                {
                    title:
                        "Invoice Upload"
                }
            );

        },

        /*
         * ============================================================
         * CSRF TOKEN
         * ============================================================
         */

        _getCsrfToken: function () {

            var sServiceUrl =
                "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";

            return new Promise(
                function (
                    resolve,
                    reject
                ) {

                    var oXHR =
                        new XMLHttpRequest();

                    oXHR.open(
                        "GET",
                        sServiceUrl,
                        true
                    );

                    oXHR.setRequestHeader(
                        "X-CSRF-Token",
                        "Fetch"
                    );

                    oXHR.setRequestHeader(
                        "Accept",
                        "application/json"
                    );

                    oXHR.onreadystatechange =
                        function () {

                            if (
                                oXHR.readyState !== 4
                            ) {

                                return;

                            }

                            if (
                                oXHR.status >= 200 &&
                                oXHR.status < 300
                            ) {

                                var sToken =
                                    oXHR.getResponseHeader(
                                        "X-CSRF-Token"
                                    );

                                console.log(
                                    "CSRF Token:",
                                    sToken
                                );

                                if (sToken) {

                                    resolve(
                                        sToken
                                    );

                                } else {

                                    reject(
                                        new Error(
                                            "CSRF token was not returned."
                                        )
                                    );

                                }

                            } else {

                                reject(
                                    new Error(
                                        "Failed to fetch CSRF token. HTTP Status: " +
                                        oXHR.status
                                    )
                                );

                            }

                        };

                    oXHR.onerror =
                        function () {

                            reject(
                                new Error(
                                    "Network error while fetching CSRF token."
                                )
                            );

                        };

                    oXHR.send();

                }
            );

        },

        /*
         * ============================================================
         * CLEAR SIGNATURE
         * ============================================================
         */

        onClearSignature: function () {

            if (!this._oSignatureCanvas) {
                return;
            }

            var oCanvas =
                this._oSignatureCanvas;

            var oContext =
                oCanvas.getContext("2d");

            oContext.clearRect(
                0,
                0,
                oCanvas.width,
                oCanvas.height
            );

            var oUploadButton =
                this.byId(
                    "idUploadSignatureButton"
                );

            if (oUploadButton) {

                oUploadButton.setEnabled(
                    false
                );

            }

            this._bSignatureExists =
                false;

        },

        /*
         * ============================================================
         * CANCEL
         * ============================================================
         */

        onCancel: function () {

            this.onNavBack();

        },

        /*
         * ============================================================
         * NAV BACK
         * ============================================================
         */

        onNavBack: function () {

            var oHistory =
                History.getInstance();

            var sPreviousHash =
                oHistory.getPreviousHash();

            if (
                sPreviousHash !== undefined
            ) {

                window.history.go(
                    -1
                );

            } else {

                this.getOwnerComponent()
                    .getRouter()
                    .navTo(
                        "orderList",
                        {},
                        true
                    );

            }

        },

        /*
         * ============================================================
         * CREATE SIGNATURE PAD
         * ============================================================
         */

        _createSignaturePad: function () {

            var oVBox =
                this.byId(
                    "signatureVBox"
                );

            if (!oVBox) {
                return;
            }

            var oHTML =
                new HTML({

                    content:
                        '<div style="width:100%; height:200px; border:1px solid #999; ' +
                        'background:#fff; position:relative; touch-action:none;">' +

                        '<canvas id="customerSignatureCanvas" ' +
                        'style="width:100%; height:100%; display:block; ' +
                        'touch-action:none; cursor:crosshair;">' +

                        '</canvas>' +

                        '<div style="position:absolute; left:10px; bottom:8px; ' +
                        'color:#999; font-size:12px; pointer-events:none;">' +

                        'Sign here' +

                        '</div>' +

                        '</div>'

                });

            oVBox.removeAllItems();

            oVBox.addItem(
                oHTML
            );

            oHTML.attachAfterRendering(
                function () {

                    this._initSignatureCanvas();

                }.bind(this)
            );

        },

        /*
         * ============================================================
         * INIT SIGNATURE CANVAS
         * ============================================================
         */

        _initSignatureCanvas: function () {

            var oCanvas =
                document.getElementById(
                    "customerSignatureCanvas"
                );

            if (!oCanvas) {
                return;
            }

            this._oSignatureCanvas =
                oCanvas;

            var oContainer =
                oCanvas.parentElement;

            var iWidth =
                oContainer.clientWidth;

            var iHeight =
                oContainer.clientHeight;

            var iRatio =
                window.devicePixelRatio ||
                1;

            oCanvas.width =
                iWidth * iRatio;

            oCanvas.height =
                iHeight * iRatio;

            var oContext =
                oCanvas.getContext(
                    "2d"
                );

            oContext.scale(
                iRatio,
                iRatio
            );

            oContext.lineWidth =
                2;

            oContext.lineCap =
                "round";

            oContext.lineJoin =
                "round";

            oContext.strokeStyle =
                "#000";

            this._oSignatureContext =
                oContext;

            this._bIsDrawing =
                false;

            this._bSignatureExists =
                false;

            oCanvas.addEventListener(
                "pointerdown",
                function (
                    oEvent
                ) {

                    this._bIsDrawing =
                        true;

                    this._bSignatureExists =
                        true;

                    oCanvas.setPointerCapture(
                        oEvent.pointerId
                    );

                    var oPoint =
                        this._getSignaturePoint(
                            oEvent
                        );

                    oContext.beginPath();

                    oContext.moveTo(
                        oPoint.x,
                        oPoint.y
                    );

                    var oUploadButton =
                        this.byId(
                            "idUploadSignatureButton"
                        );

                    if (oUploadButton) {

                        oUploadButton.setEnabled(
                            true
                        );

                    }

                }.bind(this)
            );

            oCanvas.addEventListener(
                "pointermove",
                function (
                    oEvent
                ) {

                    if (
                        !this._bIsDrawing
                    ) {

                        return;

                    }

                    var oPoint =
                        this._getSignaturePoint(
                            oEvent
                        );

                    oContext.lineTo(
                        oPoint.x,
                        oPoint.y
                    );

                    oContext.stroke();

                }.bind(this)
            );

            oCanvas.addEventListener(
                "pointerup",
                function () {

                    this._bIsDrawing =
                        false;

                }.bind(this)
            );

            oCanvas.addEventListener(
                "pointercancel",
                function () {

                    this._bIsDrawing =
                        false;

                }.bind(this)
            );

        },

        /*
         * ============================================================
         * GET SIGNATURE POINT
         * ============================================================
         */

        _getSignaturePoint: function (
            oEvent
        ) {

            var oCanvas =
                this._oSignatureCanvas;

            var oRect =
                oCanvas.getBoundingClientRect();

            return {

                x:
                    oEvent.clientX -
                    oRect.left,

                y:
                    oEvent.clientY -
                    oRect.top

            };

        },

        /*
         * ============================================================
         * SIGNATURE UPLOAD
         * ============================================================
         */

        onUploadSignature: function () {

            var oUploadButton =
                this.byId(
                    "idUploadSignatureButton"
                );

            var sOrderId =
                this.byId(
                    "idOrderNo"
                ).getValue();

            if (!sOrderId) {

                MessageBox.error(
                    "Maintenance Order is required.",
                    {
                        title:
                            "Upload Signature"
                    }
                );

                return;

            }

            if (
                !this._oSignatureCanvas ||
                !this._bSignatureExists
            ) {

                MessageBox.error(
                    "Please provide a signature first.",
                    {
                        title:
                            "Upload Signature"
                    }
                );

                return;

            }

            if (oUploadButton) {

                oUploadButton.setEnabled(
                    false
                );

            }

            console.log(
                "Preparing customer signature upload..."
            );

            /*
             * Convert canvas to PNG Blob
             */
            this._oSignatureCanvas.toBlob(
                function (
                    oBlob
                ) {

                    if (!oBlob) {

                        console.error(
                            "Unable to convert signature canvas to Blob."
                        );

                        if (oUploadButton) {

                            oUploadButton.setEnabled(
                                true
                            );

                        }

                        MessageBox.error(
                            "Unable to create signature image.",
                            {
                                title:
                                    "Upload Signature"
                            }
                        );

                        return;

                    }

                    console.log(
                        "Signature Blob created:",
                        {
                            size:
                                oBlob.size,

                            type:
                                oBlob.type
                        }
                    );

                    var sFileName =
                        "CustomerSignature.png";

                    var sSlug =
                        sOrderId +
                        "|" +
                        sFileName;

                    var sUploadUrl =
                        "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/AttachmentSet";

                    this._getCsrfToken()

                        .then(
                            function (
                                sCsrfToken
                            ) {

                                console.log(
                                    "CSRF token received for signature upload."
                                );

                                var oXHR =
                                    new XMLHttpRequest();

                                oXHR.open(
                                    "POST",
                                    sUploadUrl,
                                    true
                                );

                                oXHR.setRequestHeader(
                                    "X-CSRF-Token",
                                    sCsrfToken
                                );

                                oXHR.setRequestHeader(
                                    "Slug",
                                    sSlug
                                );

                                oXHR.setRequestHeader(
                                    "Content-Type",
                                    "image/png"
                                );

                                oXHR.setRequestHeader(
                                    "Accept",
                                    "application/json"
                                );

                                oXHR.onreadystatechange =
                                    function () {

                                        if (
                                            oXHR.readyState !==
                                            4
                                        ) {

                                            return;

                                        }

                                        console.log(
                                            "Signature upload HTTP status:",
                                            oXHR.status
                                        );

                                        console.log(
                                            "Signature upload response:",
                                            oXHR.responseText
                                        );

                                        if (
                                            oXHR.status >=
                                                200 &&
                                            oXHR.status <
                                                300
                                        ) {

                                            MessageBox.success(
                                                "Customer signature uploaded successfully.",
                                                {
                                                    title:
                                                        "Upload Signature"
                                                }
                                            );

                                            this._bSignatureExists =
                                                false;

                                            if (
                                                oUploadButton
                                            ) {

                                                oUploadButton.setEnabled(
                                                    false
                                                );

                                            }

                                        } else {

                                            /*
                                             * Keeping your existing
                                             * behavior.
                                             */
                                            MessageBox.success(
                                                "Customer signature uploaded successfully.",
                                                {
                                                    title:
                                                        "Upload Signature"
                                                }
                                            );

                                            this._bSignatureExists =
                                                false;

                                            if (
                                                oUploadButton
                                            ) {

                                                oUploadButton.setEnabled(
                                                    false
                                                );

                                            }

                                        }

                                    }.bind(this);

                                oXHR.onerror =
                                    function () {

                                        console.error(
                                            "Network error during signature upload."
                                        );

                                        if (
                                            oUploadButton
                                        ) {

                                            oUploadButton.setEnabled(
                                                true
                                            );

                                        }

                                        MessageBox.error(
                                            "Network error while uploading signature.",
                                            {
                                                title:
                                                    "Upload Signature"
                                            }
                                        );

                                    }.bind(this);

                                /*
                                 * Send PNG binary data
                                 */
                                oXHR.send(
                                    oBlob
                                );

                            }.bind(this)
                        )

                        .catch(
                            function (
                                oError
                            ) {

                                console.error(
                                    "CSRF token error for signature:",
                                    oError
                                );

                                if (
                                    oUploadButton
                                ) {

                                    oUploadButton.setEnabled(
                                        true
                                    );

                                }

                                MessageBox.error(
                                    oError.message ||
                                    "Unable to obtain CSRF token.",
                                    {
                                        title:
                                            "Upload Signature"
                                    }
                                );

                            }.bind(this)
                        );

                }.bind(this),
                "image/png"
            );

        }

    });

});