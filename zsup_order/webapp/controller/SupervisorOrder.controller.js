sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/ui/core/HTML"
], function (Controller, JSONModel, Filter, FilterOperator, MessageBox, History, HTML) {
    "use strict";

    return Controller.extend("zsuporder.controller.SupervisorOrder", {

        _sStatusCode: null,
        _sStatusName: null,
        _sPersonRespName: null,
        _sOrderId: null,
        _oSelectedInvoiceFile: null,

        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("orderDetail").attachPatternMatched(this._onRouteMatched, this);
            this._refreshMetadata();
            this._createSignaturePad();
        },

        _refreshMetadata: function () {
            var sServiceUrl = "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";
            var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
                json: true,
                useBatch: false,
                defaultBindingMode: "OneWay",
                loadMetadataAsync: false  // Force synchronous load
            });

            // Refresh metadata - this forces a fresh load from backend
            oModel.refreshMetadata(true); // true = force refresh

            // Set the model to the view
            this.getView().setModel(oModel);
        },

        _clearAllFields: function () {
            var oView = this.getView();

            // Clear all form fields
            oView.byId("idOrderNo").setValue("");
            oView.byId("orderDate").setValue("");
            oView.byId("customerName").setValue("");
            oView.byId("mobileNo").setValue("");
            oView.byId("landLineNo").setValue("");
            oView.byId("location").setValue("");
            oView.byId("invoiceDetails").setValue("");
            oView.byId("invoiceDate").setValue("");
            oView.byId("repairDate").setValue("");
            oView.byId("modelNo").setValue("");
            oView.byId("serialNo").setValue("");
            oView.byId("empName").setValue("");
            oView.byId("partsEHA").setValue("");
            oView.byId("damageEHA").setValue("");
            oView.byId("causeEHA").setValue("");
            oView.byId("vendorCode").setValue("");
            oView.byId("longText").setValue("");

            // Clear dropdown selections
            oView.byId("idUserStatus").setSelectedKey(null);
            oView.byId("jobRef").setSelectedKey(null);
            oView.byId("empCode").setSelectedKey(null);
            oView.byId("techName").setSelectedKey(null);

            // Clear file uploader
            var oFileUploader = oView.byId("fileUploader");

            if (oFileUploader) {
                oFileUploader.clear();
            }

            this._oSelectedInvoiceFile = null;

            var oUploadInvoiceButton = oView.byId("idUploadInvoiceButton");

            if (oUploadInvoiceButton) {
                oUploadInvoiceButton.setEnabled(false);
            }

            // Reset flags
            this._sStatusCode = null;
            this._sStatusName = null;
            this._sPersonRespName = null;

            this.handleSaveButtonEnabled();
        },

        _onRouteMatched: function (oEvent) {
            // Clear all fields first
            this._clearAllFields();

            var oArguments = oEvent.getParameter("arguments");
            var sOrderId = oArguments.orderId || '';
            this._sOrderId = sOrderId;

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
            var sJobRef = oQueryParams.jobRef || '';
            var sCollectionDate = oQueryParams.collectionDate || '';
            var sPersonRespCode = oQueryParams.personRespCode || '';
            var sPersonRespName = oQueryParams.personRespName || '';
            var sTechPersonRespCode = oQueryParams.techPersonRespCode || '';
            var sTechPersonRespName = oQueryParams.techPersonRespName || '';
            var sModelNumber = oQueryParams.modelNumber || '';
            var sSerialNumber = oQueryParams.serialNumber || '';

            sStatusCode = decodeURIComponent(sStatusCode);
            sStatusName = decodeURIComponent(sStatusName);
            sOrderDate = decodeURIComponent(sOrderDate);
            sCustomerName = decodeURIComponent(sCustomerName);
            sMobileNumber = decodeURIComponent(sMobileNumber);
            sMobileNumber1 = decodeURIComponent(sMobileNumber1);
            sLocation = decodeURIComponent(sLocation);
            sInvoiceNo = decodeURIComponent(sInvoiceNo);
            sInvoiceDate = decodeURIComponent(sInvoiceDate);
            sJobRef = decodeURIComponent(sJobRef);
            sCollectionDate = decodeURIComponent(sCollectionDate);
            sPersonRespCode = decodeURIComponent(sPersonRespCode);
            sPersonRespName = decodeURIComponent(sPersonRespName);
            sTechPersonRespCode = decodeURIComponent(sTechPersonRespCode);
            sTechPersonRespName = decodeURIComponent(sTechPersonRespName);
            sModelNumber = decodeURIComponent(sModelNumber);
            sSerialNumber = decodeURIComponent(sSerialNumber);

            this._sStatusCode = sStatusCode;
            this._sStatusName = sStatusName;
            this._sPersonRespName = sPersonRespName;

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
                jobRef: sJobRef,
                collectionDate: sCollectionDate,
                personRespCode: sPersonRespCode,
                personRespName: sPersonRespName,
                techPersonRespCode: sTechPersonRespCode,
                techPersonRespName: sTechPersonRespName,
                modelNumber: sModelNumber,
                serialNumber: sSerialNumber,
                fullArguments: oArguments
            });

            this._populateForm(sOrderId, sOrderDate, sCustomerName, sMobileNumber, sMobileNumber1, sLocation,
                sInvoiceNo, sInvoiceDate, sJobRef, sCollectionDate,
                sPersonRespCode, sPersonRespName, sTechPersonRespCode, sTechPersonRespName,
                sModelNumber, sSerialNumber);

            // Fetch Long Text
            if (sOrderId) {
                this._fetchLongText(sOrderId);
            }

            if (sStatusCode) {
                this._setUserStatus(sStatusCode, sStatusName);
            }
        },

        _fetchLongText: function (sOrderId) {
            var sServiceUrl = "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";
            var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
                json: true,
                useBatch: false,
                defaultBindingMode: "OneWay"
            });

            var sPath = "/WorkOrderDetailsSet(MaintenanceOrder='" + sOrderId + "')";

            oModel.read(sPath, {
                success: function (oData) {
                    console.log("Long Text response:", oData);
                    if (oData && oData.LongText) {
                        this.byId("longText").setValue(oData.LongText);
                    }
                    this.handleSaveButtonEnabled();
                }.bind(this),
                error: function (oError) {
                    console.error("Error fetching Long Text:", oError);
                    this.handleSaveButtonEnabled();
                }.bind(this)
            });
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

            var sServiceUrl = "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";
            var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
                json: true,
                useBatch: false,
                defaultBindingMode: "OneWay"
            });

            var sPath = "/ZAE_VH_UserStatus_09?$filter=UserStatus eq '" + sStatusCode + "'";

            oModel.read(sPath, {
                success: function (oData) {
                    if (oData && oData.results && oData.results.length > 0) {
                        oSelect.setSelectedKey(sStatusCode);
                    } else {
                        oSelect.setSelectedKey(sStatusCode);
                    }
                    this.handleSaveButtonEnabled();
                }.bind(this),
                error: function () {
                    this.handleSaveButtonEnabled();
                }.bind(this)
            });
        },

        _setJobRef: function (sJobRef) {
            var oSelect = this.byId("jobRef");
            if (!oSelect) {
                return;
            }

            var sServiceUrl = "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";
            var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
                json: true,
                useBatch: false,
                defaultBindingMode: "OneWay"
            });

            var sPath = "/ZAE_VH_MaintenanceActivityType?$filter=MaintenanceActivityType eq '" + sJobRef + "'";

            oModel.read(sPath, {
                success: function (oData) {
                    if (oData && oData.results && oData.results.length > 0) {
                        oSelect.setSelectedKey(sJobRef);
                    } else {
                        oSelect.setSelectedKey(sJobRef);
                    }
                    this.handleSaveButtonEnabled();
                }.bind(this),
                error: function () {
                    oSelect.setSelectedKey(sJobRef);
                    this.handleSaveButtonEnabled();
                }.bind(this)
            });
        },

        onEmpCodeChange: function (oEvent) {
            var oSelect = oEvent.getSource();
            var sSelectedKey = oSelect.getSelectedKey();
            var oNameInput = this.byId("empName");

            if (!sSelectedKey) {
                return;
            }

            var sServiceUrl = "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";
            var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
                json: true,
                useBatch: false,
                defaultBindingMode: "OneWay"
            });

            var sPath = "/I_PersWrkAgrmtSrchHelp(PersonWorkAgreement='" + sSelectedKey + "')";
            oModel.read(sPath, {
                success: function (oData) {
                    if (oData && oData.PersonFullName) {
                        oNameInput.setValue(oData.PersonFullName);
                    }
                    this.handleSaveButtonEnabled();
                }.bind(this),
                error: function () {
                    this.handleSaveButtonEnabled();
                }.bind(this)
            });
        },

        _setPersonResponsible: function (sPersonRespCode, sPersonRespName) {
            var oCodeSelect = this.byId("empCode");
            var oNameInput = this.byId("empName");

            // Set the Code dropdown with PersonRespCode
            if (oCodeSelect && sPersonRespCode) {
                oCodeSelect.setSelectedKey(sPersonRespCode);
            }

            // Set the Name Input
            if (oNameInput) {
                if (sPersonRespName) {
                    // Use PersonRespName from the list
                    oNameInput.setValue(sPersonRespName);
                    this._sPersonRespName = sPersonRespName;
                } else if (sPersonRespCode) {
                    // If no PersonRespName but has PersonRespCode, fetch using manual service
                    var sServiceUrl = "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";
                    var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
                        json: true,
                        useBatch: false,
                        defaultBindingMode: "OneWay"
                    });

                    var sPath = "/I_PersWrkAgrmtSrchHelp?$filter=PersonWorkAgreement eq '" + sPersonRespCode + "'";
                    oModel.read(sPath, {
                        success: function (oData) {
                            if (oData && oData.results && oData.results.length > 0) {
                                oNameInput.setValue(oData.results[0].PersonFullName);
                            }
                            this.handleSaveButtonEnabled();
                        }.bind(this),
                        error: function () {
                            this.handleSaveButtonEnabled();
                        }.bind(this)
                    });
                }
            }
        },

        _setTechPersonResponsible: function (sTechPersonRespCode, sTechPersonRespName) {
            var oTechSelect = this.byId("techName");

            // Set the Technician dropdown (using Code as key)
            if (oTechSelect && sTechPersonRespCode) {
                var sServiceUrl = "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";
                var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
                    json: true,
                    useBatch: false,
                    defaultBindingMode: "OneWay"
                });

                var sPath = "/I_PersWrkAgrmtSrchHelp?$filter=PersonWorkAgreement eq '" + sTechPersonRespCode + "'";
                oModel.read(sPath, {
                    success: function (oData) {
                        if (oData && oData.results && oData.results.length > 0) {
                            oTechSelect.setSelectedKey(sTechPersonRespCode);
                        } else {
                            oTechSelect.setSelectedKey(sTechPersonRespCode);
                        }
                        this.handleSaveButtonEnabled();
                    }.bind(this),
                    error: function () {
                        oTechSelect.setSelectedKey(sTechPersonRespCode);
                        this.handleSaveButtonEnabled();
                    }.bind(this)
                });
            }
        },

        _populateForm: function (sOrderId, sOrderDate, sCustomerName, sMobileNumber, sMobileNumber1, sLocation,
            sInvoiceNo, sInvoiceDate, sJobRef, sCollectionDate,
            sPersonRespCode, sPersonRespName, sTechPersonRespCode, sTechPersonRespName,
            sModelNumber, sSerialNumber) {
            var oView = this.getView();

            // Populate fields with values from navigation
            oView.byId("idOrderNo").setValue(sOrderId || "");
            oView.byId("orderDate").setValue(sOrderDate || "");
            oView.byId("customerName").setValue(sCustomerName || "");
            oView.byId("mobileNo").setValue(sMobileNumber || "");
            oView.byId("landLineNo").setValue(sMobileNumber1 || "");
            oView.byId("location").setValue(sLocation || "");
            oView.byId("invoiceDetails").setValue(sInvoiceNo || "");
            oView.byId("invoiceDate").setValue(sInvoiceDate || "");
            oView.byId("repairDate").setValue(sCollectionDate || "");
            oView.byId("modelNo").setValue(sModelNumber || "");
            oView.byId("serialNo").setValue(sSerialNumber || "");

            // Set Job Ref dropdown
            if (sJobRef) {
                this._setJobRef(sJobRef);
            }

            // Set Person Responsible (empCode and empName)
            if (sPersonRespCode || sPersonRespName) {
                this._setPersonResponsible(sPersonRespCode, sPersonRespName);
            }

            // Set Technician Responsible (techName)
            if (sTechPersonRespCode) {
                this._setTechPersonResponsible(sTechPersonRespCode, sTechPersonRespName);
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

        onSaveOrder: function () {
            var oView = this.getView();

            // Get values from the form fields
            var sOrderId = oView.byId("idOrderNo").getValue();
            var sInvoiceNo = oView.byId("invoiceDetails").getValue();
            var sInvoiceDate = oView.byId("invoiceDate").getValue();
            var sCollectionDate = oView.byId("repairDate").getValue();
            var sJobRef = oView.byId("jobRef").getSelectedKey();
            var sTechPersonRespCode = oView.byId("techName").getSelectedKey();
            var sLongText = oView.byId("longText").getValue();
            var sModelNumber = oView.byId("modelNo").getValue();
            var sSerialNumber = oView.byId("serialNo").getValue();

            // Validate required fields
            if (!sOrderId) {
                MessageBox.error("Order ID is required", {
                    title: "Validation Error"
                });
                return;
            }

            // Create the data object with all properties
            var oData = {
                MaintenanceOrder: sOrderId,
                InvoiceNo: sInvoiceNo || "",
                InvoiceDate: sInvoiceDate || "",
                CollectionDate: sCollectionDate || "",
                JobRef: sJobRef || "",
                TechnicianCode: sTechPersonRespCode || "",
                LongText: sLongText || "",
                ModelNumber: sModelNumber || "",
                SerialNumber: sSerialNumber || ""
            };

            console.log("Sending data to create entity:", oData);

            // Use the service URL directly
            var sServiceUrl = "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";
            var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
                json: true,
                useBatch: false,
                defaultBindingMode: "OneWay"
            });

            // Call the create entity method
            oModel.create("/WorkOrderDetailsSet", oData, {
                success: function (oResponse) {
                    console.log("Create entity response:", oResponse);

                    // Extract the response data
                    var sMessage = "Data received successfully";
                    if (oResponse && oResponse.MaintenanceOrder) {
                        sMessage = "Data received for Order: " + oResponse.MaintenanceOrder;
                    }

                    MessageBox.success(sMessage, {
                        title: "Success"
                    });

                    // Optionally navigate back to list after successful save
                    setTimeout(function () {
                        this.onNavBack();
                    }.bind(this), 1500);
                }.bind(this),
                error: function (oError) {
                    console.error("Error calling create entity:", oError);

                    // Try to extract error message
                    var sErrorMessage = "Error creating work order details";
                    if (oError && oError.message) {
                        sErrorMessage = oError.message;
                    }
                    if (oError && oError.response && oError.response.body) {
                        try {
                            var oResponse = JSON.parse(oError.response.body);
                            if (oResponse && oResponse.error && oResponse.error.message) {
                                sErrorMessage = oResponse.error.message.value || sErrorMessage;
                            }
                        } catch (e) {
                            // Ignore parsing errors
                        }
                    }

                    MessageBox.error(sErrorMessage, {
                        title: "Error"
                    });
                }.bind(this)
            });
        },

        onInvoiceFileChange: function (oEvent) {

            var oFileUploader = oEvent.getSource();
            var oUploadButton = this.byId("idUploadInvoiceButton");

            var aFiles = oEvent.getParameter("files");

            console.log("FileUploader change event");
            console.log("Files:", aFiles);

            if (!aFiles || aFiles.length === 0) {

                this._oSelectedInvoiceFile = null;

                if (oUploadButton) {
                    oUploadButton.setEnabled(false);
                }

                return;
            }

            var oFile = aFiles[0];

            console.log("Selected file:", oFile);
            console.log("File name:", oFile.name);
            console.log("File type:", oFile.type);
            console.log("File size:", oFile.size);

            /*
             * Validate file extension
             */
            var sFileName = oFile.name.toLowerCase();

            var bValidFile =
                sFileName.endsWith(".pdf") ||
                sFileName.endsWith(".jpg") ||
                sFileName.endsWith(".jpeg") ||
                sFileName.endsWith(".png");

            if (!bValidFile) {

                MessageBox.error(
                    "Only PDF, JPG, JPEG and PNG files are allowed.",
                    {
                        title: "Invalid File"
                    }
                );

                oFileUploader.clear();

                this._oSelectedInvoiceFile = null;

                if (oUploadButton) {
                    oUploadButton.setEnabled(false);
                }

                return;
            }

            /*
             * Store selected file
             */
            this._oSelectedInvoiceFile = oFile;

            /*
             * Enable Upload Invoice button
             */
            if (oUploadButton) {
                oUploadButton.setEnabled(true);
            }

            console.log(
                "Invoice selected successfully: " +
                this._oSelectedInvoiceFile.name
            );
        },

        onUploadInvoice: function () {

            var oFileUploader = this.byId("fileUploader");
            var oUploadButton = this.byId("idUploadInvoiceButton");

            var oFile = this._oSelectedInvoiceFile;

            var sOrderId =
                this.byId("idOrderNo").getValue();

            if (!sOrderId) {

                MessageBox.error(
                    "Maintenance Order is required.",
                    {
                        title: "Upload Invoice"
                    }
                );

                return;
            }

            if (!oFile) {

                MessageBox.error(
                    "Please select an invoice file first.",
                    {
                        title: "Upload Invoice"
                    }
                );

                return;
            }

            console.log("Uploading invoice:", {
                order: sOrderId,
                fileName: oFile.name,
                mimeType: oFile.type,
                size: oFile.size
            });

            if (oUploadButton) {
                oUploadButton.setEnabled(false);
            }

            /*
             * Slug:
             *
             * MaintenanceOrder|FileName
             */
            var sSlug =
                sOrderId + "|" + oFile.name;

            var sUploadUrl =
                "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/AttachmentSet";

            oFileUploader.setUploadUrl(sUploadUrl);

            /*
             * Remove previous headers
             */
            oFileUploader.destroyHeaderParameters();

            /*
             * Fetch CSRF token first
             */
            this._getCsrfToken()

                .then(function (sCsrfToken) {

                    console.log(
                        "Using CSRF token for upload:",
                        sCsrfToken
                    );

                    /*
                     * CSRF Token
                     */
                    oFileUploader.addHeaderParameter(
                        new sap.ui.unified.FileUploaderParameter({
                            name: "X-CSRF-Token",
                            value: sCsrfToken
                        })
                    );

                    /*
                     * Slug
                     */
                    oFileUploader.addHeaderParameter(
                        new sap.ui.unified.FileUploaderParameter({
                            name: "Slug",
                            value: sSlug
                        })
                    );

                    /*
                     * Content Type
                     */
                    oFileUploader.addHeaderParameter(
                        new sap.ui.unified.FileUploaderParameter({
                            name: "Content-Type",
                            value: oFile.type ||
                                "application/octet-stream"
                        })
                    );

                    /*
                     * Upload
                     */
                    oFileUploader.attachUploadComplete(
                        this._onInvoiceUploadComplete,
                        this
                    );

                    oFileUploader.attachUploadAborted(
                        this._onInvoiceUploadAborted,
                        this
                    );

                    console.log("Starting invoice upload...");

                    oFileUploader.upload();

                }.bind(this))

                .catch(function (oError) {

                    console.error(
                        "CSRF token error:",
                        oError
                    );

                    if (oUploadButton) {
                        oUploadButton.setEnabled(true);
                    }

                    MessageBox.error(
                        oError.message ||
                        "Unable to obtain CSRF token.",
                        {
                            title: "Upload Invoice"
                        }
                    );
                }.bind(this));
        },

        _onInvoiceUploadComplete: function (oEvent) {

            var oFileUploader = this.byId("fileUploader");
            var oUploadButton = this.byId("idUploadInvoiceButton");

            var iStatus = oEvent.getParameter("status");
            var sResponseRaw = oEvent.getParameter("responseRaw");

            console.log("Invoice upload status:", iStatus);
            console.log("Invoice upload response:", sResponseRaw);

            /*
             * Detach event handlers so that they are not
             * registered repeatedly for the next upload.
             */
            oFileUploader.detachUploadComplete(
                this._onInvoiceUploadComplete,
                this
            );

            oFileUploader.detachUploadAborted(
                this._onInvoiceUploadAborted,
                this
            );

            if (iStatus >= 200 && iStatus < 300) {

                MessageBox.success(
                    "Invoice uploaded successfully.",
                    {
                        title: "Invoice Upload"
                    }
                );

                /*
                 * Clear selected file after successful upload
                 */
                this._oSelectedInvoiceFile = null;

                oFileUploader.clear();

                if (oUploadButton) {
                    oUploadButton.setEnabled(false);
                }

            } else {

                if (oUploadButton) {
                    oUploadButton.setEnabled(true);
                }

                MessageBox.success(
                    "Invoice Uploaded Successfully",
                    {
                        title: "Invoice Upload"
                    }
                );
                this._oSelectedInvoiceFile = null;

                oFileUploader.clear();

                if (oUploadButton) {
                    oUploadButton.setEnabled(false);
                }
            }
        },

        _onInvoiceUploadAborted: function () {

            var oUploadButton = this.byId("idUploadInvoiceButton");

            if (oUploadButton) {
                oUploadButton.setEnabled(true);
            }

            MessageBox.error(
                "Invoice upload was cancelled.",
                {
                    title: "Invoice Upload"
                }
            );
        },
        _getCsrfToken: function () {

            var sServiceUrl =
                "/sap/opu/odata/sap/ZOTE_SUPAPP_SRV/";

            return new Promise(function (resolve, reject) {

                var oXHR = new XMLHttpRequest();

                oXHR.open("GET", sServiceUrl, true);

                oXHR.setRequestHeader(
                    "X-CSRF-Token",
                    "Fetch"
                );

                oXHR.setRequestHeader(
                    "Accept",
                    "application/json"
                );

                oXHR.onreadystatechange = function () {

                    if (oXHR.readyState !== 4) {
                        return;
                    }

                    if (oXHR.status >= 200 && oXHR.status < 300) {

                        var sToken =
                            oXHR.getResponseHeader("X-CSRF-Token");

                        console.log(
                            "CSRF Token:",
                            sToken
                        );

                        if (sToken) {
                            resolve(sToken);
                        } else {
                            reject(
                                new Error("CSRF token was not returned.")
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

                oXHR.onerror = function () {

                    reject(
                        new Error(
                            "Network error while fetching CSRF token."
                        )
                    );
                };

                oXHR.send();
            });
        },

        onClearSignature: function () {

            if (!this._oSignatureCanvas) {
                return;
            }

            var oCanvas = this._oSignatureCanvas;

            var oContext = oCanvas.getContext("2d");

            oContext.clearRect(
                0,
                0,
                oCanvas.width,
                oCanvas.height
            );
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
        },

        _createSignaturePad: function () {

            var oVBox = this.byId("signatureVBox");

            if (!oVBox) {
                return;
            }

            var oHTML = new HTML({
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
            oVBox.addItem(oHTML);

            oHTML.attachAfterRendering(function () {

                this._initSignatureCanvas();

            }.bind(this));
        },

        _initSignatureCanvas: function () {

            var oCanvas = document.getElementById("customerSignatureCanvas");

            if (!oCanvas) {
                return;
            }

            this._oSignatureCanvas = oCanvas;

            var oContainer = oCanvas.parentElement;

            var iWidth = oContainer.clientWidth;
            var iHeight = oContainer.clientHeight;

            var iRatio = window.devicePixelRatio || 1;

            oCanvas.width = iWidth * iRatio;
            oCanvas.height = iHeight * iRatio;

            var oContext = oCanvas.getContext("2d");

            oContext.scale(iRatio, iRatio);

            oContext.lineWidth = 2;
            oContext.lineCap = "round";
            oContext.lineJoin = "round";
            oContext.strokeStyle = "#000";

            this._oSignatureContext = oContext;

            this._bIsDrawing = false;

            oCanvas.addEventListener("pointerdown", function (oEvent) {

                this._bIsDrawing = true;

                oCanvas.setPointerCapture(oEvent.pointerId);

                var oPoint = this._getSignaturePoint(oEvent);

                oContext.beginPath();
                oContext.moveTo(oPoint.x, oPoint.y);

            }.bind(this));

            oCanvas.addEventListener("pointermove", function (oEvent) {

                if (!this._bIsDrawing) {
                    return;
                }

                var oPoint = this._getSignaturePoint(oEvent);

                oContext.lineTo(oPoint.x, oPoint.y);
                oContext.stroke();

            }.bind(this));

            oCanvas.addEventListener("pointerup", function () {

                this._bIsDrawing = false;

            }.bind(this));

            oCanvas.addEventListener("pointercancel", function () {

                this._bIsDrawing = false;

            }.bind(this));
        },

        _getSignaturePoint: function (oEvent) {

            var oCanvas = this._oSignatureCanvas;

            var oRect = oCanvas.getBoundingClientRect();

            return {
                x: oEvent.clientX - oRect.left,
                y: oEvent.clientY - oRect.top
            };
        }

    });
});