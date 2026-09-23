sap.ui.define(["com/globalintelli/ZAE_SCIN_NEW/controller/BaseController", "sap/ui/core/Fragment", "sap/m/Button", "sap/m/Dialog", "sap/ui/model/Filter", "com/globalintelli/zae_flib/controller/aeFormatter", "com/globalintelli/zae_flib/controller/aeUI5Utility", "com/globalintelli/zae_flib/controller/aeUtility/"], function (e, t, a, r, i, s, l, n) {
    "use strict";
    return e.extend("com.globalintelli.ZAE_SCIN_NEW.controller.ServiceRequest", {
        _planningCalendar: null,
        i18nPath: "i18n",
        aeFormatter: new s,
        aeUI5Util: new l,
        aeUtil: new n,
        onInit: function () {
            this.aeUI5Util.setupMessageManager(this);
            this.aeUtil.resetLibrary();
            this._planningCalendar = this.getView().byId("SCIN_SRPlanCal");
            this._planningCalendar.setStartDate(new Date);
            var e = {};
            var t = new sap.ui.model.json.JSONModel;
            t.setData(e);
            this.getView().setModel(t, "mServiceRequest");
            var a = this.getRouter().getRoute("ServiceRequestView");
            a.attachPatternMatched(this._onObjectMatched, this);
            setTimeout(function () {
                var e = sap.ui.getCore().getEventBus();
                e.publish("MainView", "fnAfterNavigate", {});
            }, 100);
        },
        // onAfterRendering: function () {
        //     var e = sap.ui.getCore().getEventBus();
        //     e.publish("MainView", "fnAfterNavigate", {})
        // },
        _onObjectMatched: function (e) {
            this._planningCalendar.unbindAggregation("rows");
            this._planningCalendar.rerender();
            var t = decodeURIComponent(e.getParameter("arguments").param1).replace(/\\/g, "");
            var a = JSON.parse(t);
            sap.ui.getCore().getMessageManager().removeAllMessages();
            this.getView().byId("SCIN_B21").setEnabled(true);
            this.fnLoadCalenderData(a);
            this.handleServiceRequestCreate();
            this.getView().setBusy(false)
        },
        fnLoadCalenderData: function (e) {
            var t = this;
            var a = new sap.ui.model.json.JSONModel;
            var r = {
                filters: e,
                UIOnly: {
                    visible: {
                        ServiceEmpGrp: false,
                        SkipMsaFields: false
                    },
                    text: {
                        Plant: e.Plant,
                        CRMSalesOffice: "",
                        SalesGroup: e.SalesGroup,
                        Employee: ""
                    },
                    Clocation: [],
                    TransitTime: []
                }
            };
            a.setData(r);
            this.getView().setModel(a, "mServiceRequest");
            var s = new sap.m.PlanningCalendarRow({
                title: "{EmployeeFullName}",
                text: "{Employee}",
                key: "{Employee}",
                enableAppointmentsDragAndDrop: true,
                appointmentDrop: function (e) {
                    t.handleAppointmentDrop(e)
                },
                appointmentDragEnter: function (e) {
                    if (t.isAppointmentOverlap(e, e.getParameter("calendarRow"))) {
                        e.preventDefault()
                    }
                }
            });
            var l = new sap.ui.model.Sorter({
                path: "Appointment",
                descending: true
            });
            s.bindAggregation("appointments", {
                path: "to_Appointment",
                sorter: l,
                template: new sap.ui.unified.CalendarAppointment({
                    title: "{description}",
                    text: "{stat_open_desc}",
                    key: "{Appointment}",
                    type: "{type}",
                    startDate: {
                        parts: ["fromdate", "from_time"],
                        formatter: this.aeFormatter.dateTimeToDate
                    },
                    endDate: {
                        parts: ["todate", "to_time"],
                        formatter: this.aeFormatter.dateTimeToDate
                    }
                }),
                templateShareable: true
            });
            this._planningCalendar.bindAggregation("rows", {
                path: "/ZAE_I_Employee_02",
                template: s,
                templateShareable: true
            });
            var n, o, g = [];
            n = this._planningCalendar.getBinding("rows");
            o = [];
            if (r.filters.Plant) {
                o.push(new i("Plant", "EQ", r.filters.Plant));
                g.push(new i("Plant", "EQ", r.filters.Plant))
            }
            if (r.filters.SalesOffice) {
                o.push(new i("SalesOffice", "EQ", r.filters.SalesOffice))
            }
            if (r.filters.SalesGroup) {
                o.push(new i("SalesGroup", "EQ", r.filters.SalesGroup))
            }
            n.filter(o, "Application");
            var u = this.getView().getModel("mServiceRequest");
            this.getView().getModel().read("/ZAE_I_TC_SCIN_03", {
                filters: g,
                success: function (e, t) {
                    if (e.results.length > 0) {
                        u.setProperty("/UIOnly/visible/ServiceEmpGrp", e.results[0].ServiceEmpGrp)
                    }
                },
                error: function (e) { }
            });
            this.getView().getModel().read("/ZAE_I_TC_SCIN_02", {
                urlParameters: {
                    $filter: "Plant  eq '" + r.filters.Plant + "'"
                },
                success: function (e, t) {
                    if (e.results.length > 0) {
                        u.setProperty("/UIOnly/text/CRMSalesOffice", e.results[0].CRMSalesOffice)
                    }
                },
                error: function (e) { }
            })
        },
        handleServiceRequestCreate: function (e) {
            var t = this.getView().byId("SCIN_SRPlanCal").getSelectedRows()[0];
            if (t) {
                this._oSelRowKey = t
            } else {
                this._oSelRowKey = null
            }
            this._loadDialogFragment()
        },
        _loadDialogFragment: function () {
            if (this._oNewSRDialog) {
                this._oNewSRDialog.destroy();
                this._oNewSRDialog = null;
            }

            // Destroy any existing fragment
            var sFragmentId = "fragServiceRequestCreate";
            var oFragment = sap.ui.getCore().byId(sFragmentId);
            if (oFragment) {
                oFragment.destroy();
            }
            if (!this._oNewSRDialog) {
                t.load({
                    id: "fragServiceRequestCreate",
                    name: "com.globalintelli.ZAE_SCIN_NEW.fragment.CreateServiceRequest",
                    controller: this
                }).then(function (e) {
                    this._createDialog(e);
                    this._setDialogInitialState();
                    t.byId("fragServiceRequestCreate", "IDSREmployee").getBinding("items").attachDataReceived(function (e) {
                        var a = e.getParameter("data").results;
                        var r = this.getView().getModel("mServiceRequest");
                        var i = a[0].CourtsyCarValidation;
                        t.byId("fragServiceRequestCreate", "CourtesyCar").setVisible(i);
                        if (!this._oSelRowKey) {
                            if (a.length > 0) {
                                r.setProperty("/UIOnly/text/Employee", a[0].SelectedEmployee);
                                this.handleCreateButtonEnabled()
                            }
                        }
                    }.bind(this))
                }.bind(this))
            } else {
                this._setDialogInitialState()
            }
        },
        _createDialog: function (e) {

            if (this._oNewSRDialog) {
                this._oNewSRDialog.destroy();
                this._oNewSRDialog = null;
            }
            var i;
            var s;
            var l;
            var n;
            var o;
            var g = this;
            var u;
            var d;
            var f;
            var c;
            var p;
            var S;
            var v;
            var m;
            this._oNewSRDialog = new r({
                title: "{i18n>CreateServiceRequest}",
                content: [e],
                beginButton: new a({
                    text: "{i18n>Create}",
                    enabled: false,
                    press: function () {
                        var bSkipMsaChecked = t.byId("fragServiceRequestCreate", "SkipMsaCheckbox").getSelected();
                        if (bSkipMsaChecked) {
                            if (!this.validateSkipMsaFields()) {
                                sap.m.MessageToast.show("Please fill all required Skip MSA fields correctly");
                                return;
                            }

                        }
                        var e = g.getView().getModel("i18n").getResourceBundle();
                        l = g.getView().getModel("mServiceRequest").getData();
                        i = t.byId("fragServiceRequestCreate", "IDSRDescription").getValue();
                        if (i.length > 38) {
                            var a = i.substring(0, 38);
                            i = a
                        }
                        var r;
                        // if (t.byId("fragServiceRequestCreate", "CampaignID").getTokens().length > 0) {
                        //     r = t.byId("fragServiceRequestCreate", "CampaignID").getTokens()[0].getKey()
                        // }
                        // s = t.byId("fragServiceRequestCreate", "IDSREmployee").getSelectedKey();
                        s = t.byId("fragServiceRequestCreate", "IDSREmployee").getSelectedItem().mProperties.key;
                        o = l.UIOnly.visible.ServiceEmpGrp;
                        n = o ? t.byId("fragServiceRequestCreate", "idSEmpGrp").getSelectedKey() : " ";
                        u = t.byId("fragServiceRequestCreate", "CourtesyCar").getSelectedKey();
                        f = t.byId("fragServiceRequestCreate", "idAddress").getValue();
                        c = t.byId("fragServiceRequestCreate", "Location").getSelectedKey();
                        p = t.byId("fragServiceRequestCreate", "TransitTime").getValue();
                        // m = t.byId("fragServiceRequestCreate", "IdDomainValue").getSelectedKey();
                        d = t.byId("fragServiceRequestCreate", "IdSalesgroup").getSelectedItem() !== null ? t.byId("fragServiceRequestCreate", "IdSalesgroup").getSelectedItem().getBindingContext().getModel().getProperty(t.byId("fragServiceRequestCreate", "IdSalesgroup").getSelectedItem().getBindingContext().sPath).CRMSalesGroup : "";
                        S = t.byId("fragServiceRequestCreate", "IdSalesoffice").getSelectedItem() !== null ? t.byId("fragServiceRequestCreate", "IdSalesoffice").getSelectedItem().getBindingContext().getModel().getProperty(t.byId("fragServiceRequestCreate", "IdSalesoffice").getSelectedItem().getBindingContext().sPath).CRMSalesOffice : "";
                        var deliveryDate = t.byId("fragServiceRequestCreate", "DeliveryDate").getDateValue();
                        var a = new Date(deliveryDate);
                        var IDate = "/Date(" + a.getTime() + ")/";
                        var ITime = "PT" + ("00" + a.getHours()).slice(-2) + "H" + ("00" + a.getMinutes()).slice(-2) + "M" + ("00" + a.getSeconds()).slice(-2) + "S";

                        var skipMsaChecked = t.byId("fragServiceRequestCreate", "SkipMsaCheckbox").getSelected();
                        var previousOdometer = "";
                        var odometerReading = "";
                        var fuelGauge = "";
                        var notes = "";
                        if (skipMsaChecked) {
                            previousOdometer = t.byId("fragServiceRequestCreate", "PreviousOdometer").getValue();
                            odometerReading = t.byId("fragServiceRequestCreate", "OdometerReading").getValue();
                            fuelGauge = t.byId("fragServiceRequestCreate", "FuelGauge").getSelectedKey();
                            notes = t.byId("fragServiceRequestCreate", "Notes").getValue();
                        }

                        if (i && s) {
                            var v = "ZOTE_FM_SRV_QRC_CRT_SERREQSet";
                            var C = this.getView().getModel("ZOTE_FM_SRV_QRC_CRT_SERREQ_SRV");
                            var I = [{
                                ISrDescription: i,
                                IEquipNo: l.filters.Equipment,
                                IPartner: l.filters.Customer,
                                IContact: l.filters.CPerson,
                                IEmpResp: s,
                                IPlant: l.filters.Plant,
                                ISalesOrg: l.filters.SalesOrganization,
                                IDisChannel: l.filters.DistrChannel,
                                IDivision: l.filters.Division,
                                // ISerEmpGrp: n,
                                // ProgNo: u,
                                ISalesOffice: S,
                                // NoOfMinutes: p,
                                // Location: c,
                                // Address: f,
                                ISalesGroup: d,
                                // CmpgnId: r,
                                // IInsurer: l.filters.Insurer ? l.filters.Insurer : "",
                                // Dataprivacyclause: m,
                                ISkipMSA: skipMsaChecked,
                                IRecordedValueKm: odometerReading,
                                IFuelLevel: fuelGauge,
                                IReqDate: IDate,
                                IReqTime: ITime
                            }];
                            var y = [];
                            for (var h = 0; h < l.filters.Category.length; h++) {
                                y.push({
                                    CatId: l.filters.Category[h].key
                                })
                            }
                            var R = [{
                                callProperty: "N_Main",
                                value: I
                            }, {
                                callProperty: "N_CatID",
                                value: y
                            }];

                            if (notes && notes !== "") {

                                var aNotesLines = notes.split('\n');
                                var aSrTexts = [];

                                for (var i = 0; i < aNotesLines.length; i++) {
                                    var sLine = aNotesLines[i].trim();
                                    if (sLine !== "") {
                                        aSrTexts.push({
                                            Tdformat: " ",
                                            Tdline: sLine
                                        });
                                    }
                                }

                                if (aSrTexts.length > 0) {
                                    R.push({
                                        callProperty: "N_SR_Texts",
                                        value: aSrTexts
                                    });
                                }
                            }

                            var b = function (e) {
                                var oMessageManager = sap.ui.getCore().getMessageManager();

                                // Get Service Request number
                                var r = "";
                                if (e.N_Main.results.length > 0 && e.N_Main.results[0].EJobNo) {
                                    r = e.N_Main.results[0].EJobNo;
                                } else {
                                    return;
                                }

                                // Create Service Request message with hyperlink
                                var t = g.getView().getModel("i18n").getResourceBundle().getText("Created");
                                var a = g.getView().getModel("i18n").getResourceBundle().getText("Successfully");
                                var i = new sap.ui.core.message.Message({
                                    persistent: true,
                                    code: r,  // This creates the hyperlink for Service Request
                                    type: sap.ui.core.MessageType.Success,
                                    message: t + r + " " + a,
                                    additionalText: "",
                                    description: "Service Request"
                                });
                                oMessageManager.addMessages(i);

                                // Check if Service Order number exists and create message with hyperlink
                                if (e.N_Main.results.length > 0 && e.N_Main.results[0].EOrderNo) {
                                    var sOrderNo = e.N_Main.results[0].EOrderNo;
                                    var oOrderMessage = new sap.ui.core.message.Message({
                                        persistent: true,
                                        code: sOrderNo,  // This creates the hyperlink for Service Order
                                        type: sap.ui.core.MessageType.Success,
                                        message: "Order " + sOrderNo + " has been created successfully",
                                        additionalText: "",
                                        description: "Service Order"
                                    });
                                    oMessageManager.addMessages(oOrderMessage);
                                }

                                g.getView().byId("SCIN_B21").setEnabled(false);
                            };
                            var D = function (e) {
                                g.getView().byId("SCIN_B21").setEnabled(false)
                            };
                            this.aeUI5Util.createCall(g, C, v, R, b, D);
                            this._oNewSRDialog.close()
                        }
                    }.bind(this)
                }),
                endButton: new a({
                    text: "{i18n>Close}",
                    press: function () {
                        this._oNewSRDialog.close()
                    }.bind(this)
                })
            });
            var C = t.byId("fragServiceRequestCreate", "IDSREmployee");
            this._oNewSRDialog.addEventDelegate({
                onBeforeRendering: function (e) {
                    var t = C.getBinding("items");
                    this.setBindingFilter(t)
                }
            }, this);
            C.addEventDelegate({
                onBeforeRendering: function (e) {
                    var t = this.getView().getModel("mServiceRequest").getData();
                    if (this._oSelRowKey !== null) {
                        C.setSelectedKey(this._oSelRowKey.getKey())
                    } else if (t.UIOnly.text.Employee !== "") {
                        C.setSelectedKey(t.UIOnly.text.Employee);
                        this.handleCreateButtonEnabled()
                    } else {
                        C.setSelectedKey(null)
                    }
                }
            }, this);
            this._oNewSRDialog.addStyleClass("sapUiContentPadding");
            this.getView().addDependent(this._oNewSRDialog)
        },

        onSkipMsaCheckboxSelect: function (e) {
            var bChecked = e.getParameter("selected");
            var oModel = this.getView().getModel("mServiceRequest");
            oModel.setProperty("/UIOnly/visible/SkipMsaFields", bChecked);

            // Load previous odometer reading if checkbox is checked
            if (bChecked) {
                this._loadPreviousOdometerReading();

                // Set minimum date for delivery date to today
                var oDeliveryDate = t.byId("fragServiceRequestCreate", "DeliveryDate");
                if (oDeliveryDate) {
                    oDeliveryDate.setMinDate(new Date());
                }

                // Clear any previous validation states
                var oOdometerReading = t.byId("fragServiceRequestCreate", "OdometerReading");
                if (oOdometerReading) {
                    oOdometerReading.setValueState("None");
                    oOdometerReading.setValueStateText("");
                }
            } else {
                // Clear Skip MSA fields
                t.byId("fragServiceRequestCreate", "PreviousOdometer").setValue("");
                t.byId("fragServiceRequestCreate", "OdometerReading").setValue("");
                t.byId("fragServiceRequestCreate", "OdometerReading").setValueState("None");
                t.byId("fragServiceRequestCreate", "OdometerReading").setValueStateText("");
                t.byId("fragServiceRequestCreate", "FuelGauge").setSelectedKey(null);
                t.byId("fragServiceRequestCreate", "FuelGauge").setValueState("None");
                t.byId("fragServiceRequestCreate", "DeliveryDate").setDateValue(null);
                t.byId("fragServiceRequestCreate", "DeliveryDate").setValueState("None");
                t.byId("fragServiceRequestCreate", "Notes").setValue("");
            }

            this.handleCreateButtonEnabled();
        },

        _loadPreviousOdometerReading: function () {
            var oModel = this.getView().getModel("mServiceRequest");
            var oData = oModel.getData();
            var sEquipment = oData.filters.Equipment;

            if (!sEquipment) {
                return;
            }

            var oView = this.getView();
            oView.setBusy(true);

            var aFilters = [];
            aFilters.push(new sap.ui.model.Filter("Equipment", sap.ui.model.FilterOperator.EQ, sEquipment));

            this.getView().getModel().read("/ZOTE_I_LASTMEASURINGVALUE", {
                filters: aFilters,
                success: function (oResponse) {
                    oView.setBusy(false);
                    if (oResponse.results && oResponse.results.length > 0) {
                        var sPreviousOdometer = oResponse.results[0].CurrentKms || "";
                        t.byId("fragServiceRequestCreate", "PreviousOdometer").setValue(sPreviousOdometer);
                    } else {
                        t.byId("fragServiceRequestCreate", "PreviousOdometer").setValue("");
                    }
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    t.byId("fragServiceRequestCreate", "PreviousOdometer").setValue("");
                }.bind(this)
            });
        },

        validateOdometerReading: function (oEvent) {
            var oInput = oEvent.getSource();
            var sCurrentValue = oInput.getValue();
            var oPreviousOdometerField = t.byId("fragServiceRequestCreate", "PreviousOdometer");
            var sPreviousValue = oPreviousOdometerField.getValue();

            // Clear previous validation state
            oInput.setValueState("None");
            oInput.setValueStateText("");

            // Check if value is empty
            if (!sCurrentValue || sCurrentValue.trim() === "") {
                oInput.setValueState("Error");
                oInput.setValueStateText("Odometer reading is required");
                this.handleCreateButtonEnabled();
                return false;
            }

            // Check if value is numeric
            var nCurrent = parseFloat(sCurrentValue);
            if (isNaN(nCurrent) || nCurrent < 0) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Please enter a valid positive number");
                this.handleCreateButtonEnabled();
                return false;
            }

            // Check if previous value exists and compare
            if (sPreviousValue && sPreviousValue.trim() !== "") {
                var nPrevious = parseFloat(sPreviousValue);
                if (!isNaN(nPrevious) && nCurrent <= nPrevious) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Odometer reading must be greater than previous reading (" + nPrevious + ")");
                    this.handleCreateButtonEnabled();
                    return false;
                }
            }

            this.handleCreateButtonEnabled();
            return true;
        },

        validateSkipMsaFields: function () {
            var oOdometerReading = t.byId("fragServiceRequestCreate", "OdometerReading");
            var oFuelGauge = t.byId("fragServiceRequestCreate", "FuelGauge");
            var oDeliveryDate = t.byId("fragServiceRequestCreate", "DeliveryDate");
            var bValid = true;

            // Validate Odometer Reading
            if (oOdometerReading) {
                var sValue = oOdometerReading.getValue();
                if (!sValue || sValue.trim() === "") {
                    oOdometerReading.setValueState("Error");
                    oOdometerReading.setValueStateText("Odometer reading is required");
                    bValid = false;
                } else if (oOdometerReading.getValueState() === "Error") {
                    bValid = false;
                }
            }

            // Validate Fuel Gauge
            if (oFuelGauge) {
                var sFuelGauge = oFuelGauge.getSelectedKey();
                if (!sFuelGauge || sFuelGauge === "") {
                    oFuelGauge.setValueState("Error");
                    bValid = false;
                } else {
                    oFuelGauge.setValueState("None");
                }
            }

            // Validate Delivery Date
            if (oDeliveryDate) {
                var oDate = oDeliveryDate.getDateValue();
                if (!oDate) {
                    oDeliveryDate.setValueState("Error");
                    bValid = false;
                } else {
                    oDeliveryDate.setValueState("None");
                }
            }

            return bValid;
        },

        onOdometerLiveChange: function (oEvent) {
            var oInput = oEvent.getSource();
            var sValue = oInput.getValue();

            // Allow only numbers and decimal point
            var sCleanValue = sValue.replace(/[^0-9.]/g, '');
            if (sCleanValue !== sValue) {
                oInput.setValue(sCleanValue);
            }

            // Validate
            this.validateOdometerReading(oEvent);
        },

        // onCampaignValueHelpRequested: function(e) {
        //     var t = e.getSource();
        //     var a = this.getView().getModel("mServiceRequest");
        //     var r = a.getData();
        //     var i = r.filters.SalesOrganization;
        //     t.setTokens([]);
        //     var s = {
        //         entitySet: "ZAE_VH_CampaignData",
        //         initiallyVisibleFields: "CampaignID,CampaignExternalID,SalesOrganization,CampaignType,CampaignTypeDescription,StartDate,EndDate",
        //         selectionMode: "Single",
        //         tokenObject: {
        //             key: "CampaignID",
        //             Description: "CampaignExternalID"
        //         },
        //         controlConfiguration: [{
        //             index: 0,
        //             key: "SalesOrganization",
        //             filterType: "auto",
        //             label: "{/#ZAE_VH_CampaignData/SalesOrganization/@sap:label}",
        //             mandatory: "auto",
        //             visible: false
        //         }, {
        //             index: 1,
        //             key: "CampaignID",
        //             filterType: "auto",
        //             label: "{/#ZAE_VH_CampaignData/CampaignID/@sap:label}",
        //             mandatory: "auto",
        //             visible: true
        //         }, {
        //             index: 2,
        //             key: "CampaignExternalID",
        //             filterType: "auto",
        //             label: "{/#ZAE_VH_CampaignData/CampaignExternalID/@sap:label}",
        //             mandatory: "auto",
        //             visible: true
        //         }, {
        //             index: 3,
        //             key: "CampaignType",
        //             filterType: "auto",
        //             label: "{/#ZAE_VH_CampaignData/CampaignType/@sap:label}",
        //             mandatory: "auto",
        //             visible: false
        //         }],
        //         defaultFilter: {
        //             CampaignType: {
        //                 items: [{
        //                     key: "SERVICE"
        //                 }]
        //             },
        //             SalesOrganization: {
        //                 items: [{
        //                     key: i
        //                 }]
        //             }
        //         },
        //         onBeforeRebindSmartTable: function(e) {
        //             var t = e.getParameter("bindingParams").filters;
        //             t.push(new sap.ui.model.Filter({
        //                 path: "SalesOrganization",
        //                 operator: sap.ui.model.FilterOperator.EQ,
        //                 value1: i
        //             }));
        //             t.push(new sap.ui.model.Filter({
        //                 path: "CampaignType",
        //                 operator: sap.ui.model.FilterOperator.EQ,
        //                 value1: "SERVICE"
        //             }));
        //             e.getParameter("bindingParams").filters = t
        //         }
        //     };
        //     this.aeUtil.handleSmartDialogValueHelp(this, t, s)
        // },
        // onCampaignIDTokenUpdate: function(e) {
        //     var t = e.getSource().getTokens()
        // },
        // onSelectCampaignID: function(e) {
        //     if (e.getParameter("selectedRow") !== null) {
        //         var t = e.getSource();
        //         t.setTokens([]);
        //         var a = e.getParameter("selectedRow").getBindingContext().getObject();
        //         var r = this.formatNameAndValuePair(a.CampaignID, a.CampaignExternalID);
        //         var i = new sap.m.Token({
        //             key: a.CampaignID,
        //             text: r
        //         });
        //         t.setTokens([i]);
        //         t.fireTokenUpdate()
        //     }
        // },
        formatNameAndValuePair: function (e, t) {
            if (!e && !t) {
                return ""
            } else if (t && !e) {
                return t.replace(/^0+/, "")
            } else if (!t && e) {
                return e
            } else {
                return e + " (" + t.replace(/^0+/, "") + ")"
            }
        },
        // handleCampaignSuggest: function(e) {
        //     var t = this.getView().getModel("mServiceRequest");
        //     var a = t.getData();
        //     var r = a.filters.SalesOrganization;
        //     var s = e.getParameter("suggestValue");
        //     var l = [];
        //     if (s) {
        //         l.push(new i({
        //             filters: [new i({
        //                 path: "CampaignID",
        //                 operator: sap.ui.model.FilterOperator.StartsWith,
        //                 value1: s
        //             }), new i({
        //                 path: "CampaignExternalID",
        //                 operator: sap.ui.model.FilterOperator.StartsWith,
        //                 value1: s
        //             })],
        //             and: false
        //         }));
        //         l.push(new sap.ui.model.Filter({
        //             path: "SalesOrganization",
        //             operator: sap.ui.model.FilterOperator.EQ,
        //             value1: r
        //         }));
        //         l.push(new sap.ui.model.Filter({
        //             path: "CampaignType",
        //             operator: sap.ui.model.FilterOperator.EQ,
        //             value1: "SERVICE"
        //         }))
        //     }
        //     e.getSource().getBinding("suggestionRows").filter(l);
        //     e.getSource().getBinding("suggestionRows").resume()
        // },
        fnAddLocZoneTime: function () {
            var e = this;
            var a = t.byId("fragServiceRequestCreate", "CourtesyCar").getSelectedItem().getBindingContext().getObject().CaptureAdrs;
            t.byId("fragServiceRequestCreate", "idAddress").setVisible(a);
            t.byId("fragServiceRequestCreate", "Location").setVisible(a);
            t.byId("fragServiceRequestCreate", "TransitTime").setVisible(a);
            var r = this.getView().getModel("mServiceRequest");
            var s = r.getData();
            var l = [];
            if (s.filters.Plant) {
                l.push(new i("Plant", "EQ", s.filters.Plant))
            }
            this.getView().getModel().read("/ZAE_I_TC_CUPG_03", {
                filters: l,
                success: function (t, a) {
                    e._fnLocation(t.results)
                },
                error: function (e) { }
            })
        },
        _fnLocation: function (e) {
            var t = this.getView().getModel("mServiceRequest");
            var a = t.getData();
            a.Clocation = e;
            t.updateBindings(true);
            this.fnChangeLocation()
        },
        fnChangeLocation: function () {
            var e = this.getView().getModel("mServiceRequest");
            var a = e.getData();
            var r = a.Clocation;
            var i = t.byId("fragServiceRequestCreate", "Location").getSelectedKey();
            if (i && a.filters.Plant) {
                var s = r.filter(function (e) {
                    return e.Location === i && e.Plant === a.filters.Plant
                });
                a.TransitTime = s
            }
            if (s && s.length === 1) {
                t.byId("fragServiceRequestCreate", "TransitTime").setValue(s[0].NoOfMinutes)
            }
            e.updateBindings(true);
            if (i) {
                t.byId("fragServiceRequestCreate", "TransitTime").setEnabled(true)
            }
        },
        _setDialogInitialState: function () {
            var e = this.getView().getModel("mServiceRequest").getData();
            var a;
            var r;
            if (e.filters.Customer && e.filters.CustomerName) {
                a = e.filters.CustomerName + " (" + e.filters.Customer + ")"
            } else {
                a = e.filters.Customer
            }
            if (e.filters.CPerson && e.filters.CPersonName) {
                r = e.filters.CPersonName + " (" + e.filters.CPerson + ")"
            } else {
                r = e.filters.CPerson
            }
            if (e.filters.Plant) {
                var s = e.filters.Plant;
                var l = [];
                var n = [];
                var o = [];
                l.push(new i("Plant", sap.ui.model.FilterOperator.EQ, s));
                n.push(new i("MaintPlanPlant", sap.ui.model.FilterOperator.EQ, s));
                o.push(new i("SalesOffice", sap.ui.model.FilterOperator.EQ, e.filters.SalesOffice));
                o.push(new i("SalesGroup", sap.ui.model.FilterOperator.EQ, e.filters.SalesGroup));
                o.push(new i("Process_Type", sap.ui.model.FilterOperator.EQ, e.filters.TransactionType));
                t.byId("fragServiceRequestCreate", "idSEmpGrp").getBinding("items").filter(l);
                t.byId("fragServiceRequestCreate", "CourtesyCar").getBinding("items").filter(o);
                t.byId("fragServiceRequestCreate", "IdSalesoffice").getBinding("items").filter(l);
                var g = [];
                g.push(new i("Plant", sap.ui.model.FilterOperator.EQ, s));
                if (e.filters.SalesOffice) {
                    g.push(new i("SalesOffice", sap.ui.model.FilterOperator.EQ, e.filters.SalesOffice));
                    t.byId("fragServiceRequestCreate", "IdSalesoffice").setSelectedKey(e.filters.SalesOffice)
                }
                t.byId("fragServiceRequestCreate", "IdSalesgroup").getBinding("items").filter(g)
            }
            t.byId("fragServiceRequestCreate", "idAddress").setVisible(false);
            t.byId("fragServiceRequestCreate", "Location").setVisible(false);
            t.byId("fragServiceRequestCreate", "TransitTime").setVisible(false);
            t.byId("fragServiceRequestCreate", "idAddress").setValue("");
            t.byId("fragServiceRequestCreate", "Location").setSelectedKey();

            // Reset Skip MSA fields
            this.getView().getModel("mServiceRequest").setProperty("/UIOnly/visible/SkipMsaFields", false);
            t.byId("fragServiceRequestCreate", "SkipMsaCheckbox").setSelected(false);
            t.byId("fragServiceRequestCreate", "PreviousOdometer").setValue("");
            t.byId("fragServiceRequestCreate", "PreviousOdometer").setValueState("None");
            t.byId("fragServiceRequestCreate", "OdometerReading").setValue("");
            t.byId("fragServiceRequestCreate", "OdometerReading").setValueState("None");
            t.byId("fragServiceRequestCreate", "OdometerReading").setValueStateText("");
            t.byId("fragServiceRequestCreate", "FuelGauge").setSelectedKey(null);
            t.byId("fragServiceRequestCreate", "FuelGauge").setValueState("None");
            t.byId("fragServiceRequestCreate", "DeliveryDate").setDateValue(null);
            t.byId("fragServiceRequestCreate", "DeliveryDate").setValueState("None");
            t.byId("fragServiceRequestCreate", "Notes").setValue("");

            t.byId("fragServiceRequestCreate", "TransitTime").setValue("");
            t.byId("fragServiceRequestCreate", "TransitTime").setEnabled(false);
            t.byId("fragServiceRequestCreate", "IdSalesgroup").setSelectedKey(e.UIOnly.text.SalesGroup);
            t.byId("fragServiceRequestCreate", "Customer").setValue(a);
            t.byId("fragServiceRequestCreate", "CPerson").setValue(r);
            t.byId("fragServiceRequestCreate", "IDSRDescription").setValue(e.filters.Description);
            t.byId("fragServiceRequestCreate", "CourtesyCar").setSelectedKey();
            t.byId("fragServiceRequestCreate", "idSEmpGrp").setSelectedKey();
            this._oNewSRDialog.open();
            this.handleCreateButtonEnabled()
        },
        handleCreateButtonEnabled: function () {
            var e = this.getView().getModel("mServiceRequest");
            var a = t.byId("fragServiceRequestCreate", "IdSalesoffice").getSelectedItem();
            var r = t.byId("fragServiceRequestCreate", "IdSalesgroup").getSelectedItem();
            var i = t.byId("fragServiceRequestCreate", "IDSREmployee").getSelectedItem();
            var s = t.byId("fragServiceRequestCreate", "IDSRDescription").getValue();

            var o = e.getData();

            var bSkipMsaChecked = t.byId("fragServiceRequestCreate", "SkipMsaCheckbox").getSelected();
            var bSkipMsaValid = true;
            if (bSkipMsaChecked) {
                var oOdometerReading = t.byId("fragServiceRequestCreate", "OdometerReading");
                var sOdometerReading = oOdometerReading.getValue();
                var sFuelGauge = t.byId("fragServiceRequestCreate", "FuelGauge").getSelectedKey();
                var oDeliveryDate = t.byId("fragServiceRequestCreate", "DeliveryDate");
                var z = oDeliveryDate.getDateValue();
                var sOdometerState = oOdometerReading.getValueState();

                bSkipMsaValid = sOdometerReading !== "" &&
                    sFuelGauge !== null &&
                    sFuelGauge !== "" &&
                    z !== null &&
                    sOdometerState !== "Error";
            }

            var d = s !== "" && (r !== null) && (a !== null) && i !== null && bSkipMsaValid;
            this._oNewSRDialog.getButtons()[0].setEnabled(d);
        },
        setBindingFilter: function (e) {
            var t = [];
            var a = this.getView().getModel("mServiceRequest").getData();
            if (a.filters.Plant) {
                t.push(new i("Plant", "EQ", a.filters.Plant))
            }
            if (a.filters.SalesOffice) {
                t.push(new i("SalesOffice", "EQ", a.filters.SalesOffice))
            }
            if (a.filters.SalesGroup) {
                t.push(new i("SalesGroup", "EQ", a.filters.SalesGroup))
            }
            e.filter(t, "Application")
        },
        onMessagePopoverPress: function (e) {
            var t = this;
            var oCrossNav = sap.ushell.Container.getService("CrossApplicationNavigation");

            // This function is called when a message in the popover is clicked
            var fnNavigate = function (sCode, oItem) {
                console.log("=== Message Clicked ===");
                console.log("Code:", sCode);
                console.log("Item:", oItem);

                // Get the message text from the item
                var sMessageText = "";
                if (oItem) {
                    sMessageText = oItem.getProperty("title") || oItem.getText() || "";
                    console.log("Message Text:", sMessageText);
                }

                var sHash = "";

                // Check if it's a Service Order message
                if (sMessageText && (sMessageText.indexOf("Order") !== -1 ||
                    sMessageText.indexOf("order") !== -1 ||
                    sMessageText.indexOf("Follow On Document") !== -1)) {

                    console.log("Navigating to Service Order:", sCode);

                    // Use direct semantic object for ServiceOrder
                    sHash = oCrossNav && oCrossNav.hrefForExternal({
                        target: {
                            semanticObject: "ServiceOrder",
                            action: "aesDisplay"
                        },
                        params: {
                            ServiceOrder: sCode
                        }
                    }) || "";

                    console.log("Service Order URL:", sHash);

                } else {
                    console.log("Navigating to Service Request:", sCode);

                    // Service Request
                    sHash = oCrossNav && oCrossNav.hrefForExternal({
                        target: {
                            semanticObject: "ServiceRequest",
                            action: "aesDisplay"
                        },
                        params: {
                            ServiceRequest: sCode
                        }
                    }) || "";

                    console.log("Service Request URL:", sHash);
                }

                if (sHash) {
                    console.log("Final Navigation URL:", sHash);
                    oCrossNav.toExternal({
                        target: {
                            shellHash: sHash
                        }
                    });
                } else {
                    console.error("No navigation URL generated for:", sCode);
                }
            };

            // Call the utility with our navigation function
            this.aeUI5Util.handleMessagePopoverPress(this, e, fnNavigate);
        },
        handleServiceRequestCreateSlotSelect: function (e) {
            var t = e.getParameter("row");
            if (t) {
                this._oSelRowKey = t
            } else {
                this._oSelRowKey = null
            }
            this._loadDialogFragment(t)
        },
        handleChangeTime: function () {
            var e = t.byId("fragServiceRequestCreate", "TransitTime");
            e.setValue(e.getValue().replace(/[^0-9+()]+/g, "").slice(0, 4))
        }
    })
});