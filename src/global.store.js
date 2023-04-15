"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.GlobalStore = void 0;
var console_logger_1 = require("./common/console.logger");
var action_logger_1 = require("./middlewares/action.logger");
var redux_devtools_extension_1 = require("redux-devtools-extension");
var redux_1 = require("redux");
/**
 * Summary Global store for all Apps and container shell (Platform) in Micro-Frontend application.
 * Description Singleton class to be used all all Apps for registering the isolated App States. The platform-level and global-level store can be accessed from this class.
 */
var GlobalStore = /** @class */ (function () {
    function GlobalStore(_logger) {
        if (_logger === void 0) { _logger = null; }
        this._logger = _logger;
        this._actionLogger = null;
        this._stores = {};
        this._globalActions = {};
        this._globalListeners = [];
        this._eagerPartnerStoreSubscribers = {};
        this._eagerUnsubscribers = {};
        this._actionLogger = new action_logger_1.ActionLogger(_logger);
        this._selectors = {};
    }
    /**
     * Summary Gets the singleton instance of the Global Store.
     *
     * @param {ILogger} logger Logger service.
     */
    GlobalStore.Get = function (debugMode, logger) {
        if (debugMode === void 0) { debugMode = false; }
        if (logger === void 0) { logger = null; }
        if (debugMode) {
            this.DebugMode = debugMode;
        }
        if (debugMode && (logger === undefined || logger === null)) {
            logger = new console_logger_1.ConsoleLogger(debugMode);
        }
        var globalGlobalStoreInstance = window[GlobalStore.InstanceName] || null;
        if (globalGlobalStoreInstance === undefined || globalGlobalStoreInstance === null) {
            globalGlobalStoreInstance = new GlobalStore(logger);
            window[GlobalStore.InstanceName] = globalGlobalStoreInstance;
        }
        return globalGlobalStoreInstance;
    };
    /**
     * Summary: Creates and registers a new store
     *
     * @access public
     *
     * @param {string} appName Name of the App for whom the store is getting creating.
     * @param {Reducer} appReducer The root reducer of the App. If partner app is using multiple reducers, then partner App must use combineReducer and pass the root reducer
     * @param {Array<Middleware>} middlewares List of redux middlewares that the partner app needs.
     * @param {boolean} shouldReplaceStore Flag to indicate if the Partner App wants to replace an already created/registered store with the new store.
     * @param {boolean} shouldReplaceReducer Flag to indicate if the Partner App wants to replace the existing root Reducer with the given reducer. Note, that the previous root Reducer will be replaced and not updated. If the existing Reducer needs to be used, then partner app must do the append the new reducer and pass the combined root reducer.
     *
     * @returns {Store<any, any>} The new Store
     */
    GlobalStore.prototype.CreateStore = function (appName, appReducer, middlewares, globalActions, shouldReplaceStore, shouldReplaceReducer) {
        if (shouldReplaceStore === void 0) { shouldReplaceStore = false; }
        if (shouldReplaceReducer === void 0) { shouldReplaceReducer = false; }
        var existingStore = this._stores[appName];
        if (existingStore === null || existingStore === undefined || shouldReplaceStore) {
            if (middlewares === undefined || middlewares === null)
                middlewares = [];
            var appStore = redux_1.createStore(appReducer, GlobalStore.DebugMode ? redux_devtools_extension_1.composeWithDevTools(redux_1.applyMiddleware.apply(void 0, middlewares)) : redux_1.applyMiddleware.apply(void 0, middlewares));
            this.RegisterStore(appName, appStore, globalActions, shouldReplaceStore);
            return appStore;
        }
        if (shouldReplaceReducer) {
            console.warn("The reducer for " + appName + " is getting replaced");
            existingStore.replaceReducer(appReducer);
            this.RegisterStore(appName, existingStore, globalActions, true);
        }
        return existingStore;
    };
    /**
     * Summary: Registers an isolated app store
     *
     * @access public
     *
     * @param {string} appName Name of the App.
     * @param {Store} store Instance of the store.
     * @param {boolean} shouldReplace Flag to indicate if the an already registered store needs to be replaced.
     */
    GlobalStore.prototype.RegisterStore = function (appName, store, globalActions, shouldReplaceExistingStore) {
        if (shouldReplaceExistingStore === void 0) { shouldReplaceExistingStore = false; }
        var existingStore = this._stores[appName];
        if (existingStore !== undefined && existingStore !== null && shouldReplaceExistingStore === false)
            return;
        this._stores[appName] = store;
        store.subscribe(this.InvokeGlobalListeners.bind(this));
        this.RegisterGlobalActions(appName, globalActions);
        this.RegisterEagerSubscriptions(appName);
        this.LogRegistration(appName, (existingStore !== undefined && existingStore !== null));
    };
    /**
     * Summary: Registers a list of actions for an App that will be made Global.
     * Description: Global actions can be dispatched on the App Store by any Partner Apps. If partner needs to make all actions as Global, then pass "*" in the list. If no global actions are registered then other partners won't be able to dispatch any action on the App Store.
     *
     * @access public
     *
     * @param {string} appName Name of the app.
     * @param {Array<string>} actions List of global action names.
     */
    GlobalStore.prototype.RegisterGlobalActions = function (appName, actions) {
        if (actions === undefined || actions === null || actions.length === 0) {
            return;
        }
        var registeredActions = this._globalActions[appName];
        if (registeredActions === undefined || registeredActions === null) {
            registeredActions = [];
            this._globalActions[appName] = [];
        }
        var uniqueActions = actions.filter(function (action) { return registeredActions.find(function (registeredAction) { return action === registeredAction; }) === undefined; });
        uniqueActions = __spreadArrays(new Set(uniqueActions)); // Removing any duplicates
        this._globalActions[appName] = __spreadArrays(this._globalActions[appName], uniqueActions);
    };
    /**
     * Summary: Gets the current state of the Platform
     *
     * @access public
     *
     * @returns Current Platform State (App with name Platform)
     */
    GlobalStore.prototype.GetPlatformState = function () {
        var platformStore = this.GetPlatformStore();
        if (platformStore === undefined || platformStore === null)
            return null;
        return this.CopyState(platformStore.getState());
    };
    /**
     * Summary: Gets the current state of the given Partner.
     * Description: A read-only copy of the Partner state is returned. The state cannot be mutated using this method. For mutation dispatch actions. In case the partner hasn't been registered or the partner code hasn't loaded, the method will return null.
     *
     * @param partnerName Name of the partner whose state is needed
     *
     * @returns {any} Current partner state.
     */
    GlobalStore.prototype.GetPartnerState = function (partnerName) {
        var partnerStore = this.GetPartnerStore(partnerName);
        if (partnerStore === undefined || partnerStore === null)
            return null;
        var partnerState = partnerStore.getState();
        return this.CopyState(partnerState);
    };
    /**
     * Summary: Gets the global store.
     * Description: The global store comprises of the states of all registered partner's state.
     * Format
     * {
     *      Platform: { ...Platform_State },
     *      Partner_Name_1: { ...Partner_1_State },
     *      Partner_Name_2: { ...Partner_2_State }
     * }
     *
     * @access public
     *
     * @returns {any} Global State.
     */
    GlobalStore.prototype.GetGlobalState = function () {
        var globalState = {};
        for (var partner in this._stores) {
            var state = this._stores[partner].getState();
            globalState[partner] = state;
        }
        ;
        return this.CopyState(globalState);
    };
    /**
     * Summary: Dispatches an action on all the Registered Store (including Platform level store).
     * Description: The action will be dispatched only if the Partner App has declated the action to be global at it's store level.
     *
     * @access public
     *
     * @param {string} source Name of app dispatching the Actions
     * @param {IAction<any>} action Action to be dispatched
     */
    GlobalStore.prototype.DispatchGlobalAction = function (source, action) {
        for (var partner in this._stores) {
            var isActionRegisteredByPartner = this.IsActionRegisteredAsGlobal(partner, action);
            if (isActionRegisteredByPartner) {
                this._stores[partner].dispatch(action);
            }
        }
    };
    /**
     * Summary: Dispatched an action of the local store
     *
     * @access public
     *
     * @param {string} source Name of app dispatching the Actions
     * @param {IAction<any>} action Action to be dispatched
     */
    GlobalStore.prototype.DispatchLocalAction = function (source, action) {
        var localStore = this._stores[source];
        if (localStore === undefined || localStore === null) {
            var error = new Error("Store is not registered");
            if (this._logger !== undefined && this._logger !== null)
                this._logger.LogException(source, error, {});
            throw error;
        }
        localStore.dispatch(action);
    };
    /**
     * Summary: Dispatches an action at a local as well global level
     *
     * @access public
     *
     * @param {string} source Name of app dispatching the Actions
     * @param {IAction<any>} action Action to be dispatched
     */
    GlobalStore.prototype.DispatchAction = function (source, action) {
        this.DispatchGlobalAction(source, action);
        var isActionGlobal = this.IsActionRegisteredAsGlobal(source, action);
        if (!isActionGlobal)
            this.DispatchLocalAction(source, action);
    };
    /**
     * Summary: Subscribe to current store's state changes
     *
     * @param {string} source Name of the application
     * @param {(state: any) => void} callback Callback method to be invoked when state changes
     */
    GlobalStore.prototype.Subscribe = function (source, callback) {
        var store = this.GetPartnerStore(source);
        if (store === undefined || store === null) {
            throw new Error("ERROR: Store for " + source + " hasn't been registered");
        }
        return store.subscribe(function () { return callback(store.getState()); });
    };
    /**
     * Summary: Subscribe to any change in the Platform's state.
     *
     * @param {string} source Name of application subscribing to the state changes.
     * @param {(state: any) => void} callback Callback method to be called for every platform's state change.
     *
     * @returns {() => void} Unsubscribe method. Call this method to unsubscribe to the changes.
     */
    GlobalStore.prototype.SubscribeToPlatformState = function (source, callback) {
        var platformStore = this.GetPlatformStore();
        return platformStore.subscribe(function () { return callback(platformStore.getState()); });
    };
    /**
     * Summary: Subscribe to any change in the Partner App's state.
     *
     * @access public
     *
     *
     * @param {string} source Name of the application subscribing to the state changes.
     * @param {string} partner Name of the Partner application to whose store is getting subscribed to.
     * @param {(state: any) => void} callback Callback method to be called for every partner's state change.
     * @param {boolean} eager Allows subscription to store that's yet to registered
     *
     * @throws Error when the partner is yet to be registered/loaded or partner doesn't exist.
     *
     * @returns {() => void} Unsubscribe method. Call this method to unsubscribe to the changes.
     */
    GlobalStore.prototype.SubscribeToPartnerState = function (source, partner, callback, eager) {
        var _this = this;
        if (eager === void 0) { eager = true; }
        var partnerStore = this.GetPartnerStore(partner);
        if (partnerStore === undefined || partnerStore === null) {
            if (!eager) {
                throw new Error("ERROR: " + source + " is trying to subscribe to partner " + partner + ". Either " + partner + " doesn't exist or hasn't been loaded yet");
            }
            if (this._eagerPartnerStoreSubscribers[partner]) {
                this._eagerPartnerStoreSubscribers[partner].source = callback;
            }
            else {
                this._eagerPartnerStoreSubscribers[partner] = {
                    source: callback
                };
            }
            return function () {
                _this.UnsubscribeEagerSubscription(source, partner);
            };
        }
        return partnerStore.subscribe(function () { return callback(partnerStore.getState()); });
    };
    /**
     * Summary: Subscribe to any change in the Global State, including Platform-level and Partner-level changes.
     *
     * @access public
     *
     * @param {string} source Name of the application subscribing to the state change.
     * @param {(state: any) => void} callback Callback method to be called for every any change in the global state.
     *
     * @returns {() => void} Unsubscribe method. Call this method to unsubscribe to the changes.
     */
    GlobalStore.prototype.SubscribeToGlobalState = function (source, callback) {
        var _this = this;
        this._globalListeners.push(callback);
        return function () {
            _this._globalListeners = _this._globalListeners.filter(function (globalListener) { return globalListener !== callback; });
        };
    };
    GlobalStore.prototype.UnsubscribeEagerSubscription = function (source, partnerName) {
        if (!partnerName || !source)
            return;
        if (!this._eagerUnsubscribers[partnerName])
            return;
        var unsubscriber = this._eagerUnsubscribers[partnerName].source;
        if (unsubscriber)
            unsubscriber();
    };
    GlobalStore.prototype.SetLogger = function (logger) {
        if (this._logger === undefined || this._logger === null)
            this._logger = logger;
        else
            this._logger.SetNextLogger(logger);
        this._actionLogger.SetLogger(logger);
    };
    /**
     * Summary: Expose a collection of Selecotrs from a Partner-level that other partners can later consume. This allows partners to derive data without forcing partners to know the state structure.
     *
     * @access public
     *
     * @param {string} source Name of the application exposing an derived state API
     * @param {Record<string, any>} selectors The collection of APIs of derived state selectors.
     * @param {boolean} mergeSelectors If the source application already exposed an API set, merge the new API being passed in.
     *
     */
    GlobalStore.prototype.AddSelectors = function (source, selectors, mergeSelectors) {
        if (mergeSelectors === void 0) { mergeSelectors = false; }
        if (this._selectors[source] == undefined) {
            this._selectors[source] = selectors;
        }
        if (this._selectors[source] != undefined && mergeSelectors) {
            this._selectors[source] = Object.assign({}, this._selectors[source], selectors);
        }
    };
    /**
     * Summary: Select derived state from a partner app using the selector name
     *
     * @access public
     *
     * @param {string} partner Name of the partner application to select derived data from
     * @param {string} selector The name of the API to select
     * @param {any} defaultReturn If the partner app does not have that API exposed, return this default value instead of undefined.
     *
     */
    GlobalStore.prototype.SelectPartnerState = function (partner, selector, defaultReturn) {
        if (this._selectors[partner] == undefined) {
            throw new Error("ERROR: " + partner + " not exposed any selectors.");
        }
        if (this._selectors[partner][selector] == undefined) {
            console.warn(partner + " has not exposed a selector with the name: " + selector);
            return defaultReturn;
        }
        return this._selectors[partner][selector]();
    };
    GlobalStore.prototype.RegisterEagerSubscriptions = function (appName) {
        var _this = this;
        var eagerCallbacksRegistrations = this._eagerPartnerStoreSubscribers[appName];
        if (eagerCallbacksRegistrations === undefined || eagerCallbacksRegistrations === undefined)
            return;
        var registeredApps = Object.keys(eagerCallbacksRegistrations);
        registeredApps.forEach(function (sourceApp) {
            var callback = eagerCallbacksRegistrations[sourceApp];
            if (callback) {
                var unregistrationCallback = _this.SubscribeToPartnerState(sourceApp, appName, callback, false);
                if (_this._eagerPartnerStoreSubscribers[appName]) {
                    _this._eagerPartnerStoreSubscribers[appName].sourceApp = unregistrationCallback;
                }
                else {
                    _this._eagerPartnerStoreSubscribers[appName] = {
                        sourceApp: unregistrationCallback
                    };
                }
            }
        });
    };
    GlobalStore.prototype.InvokeGlobalListeners = function () {
        var globalState = this.GetGlobalState();
        this._globalListeners.forEach(function (globalListener) {
            globalListener(globalState);
        });
    };
    GlobalStore.prototype.GetPlatformStore = function () {
        return this.GetPartnerStore(GlobalStore.Platform);
    };
    GlobalStore.prototype.GetPartnerStore = function (partnerName) {
        return this._stores[partnerName];
    };
    GlobalStore.prototype.GetGlobalMiddlewares = function () {
        var actionLoggerMiddleware = this._actionLogger.CreateMiddleware();
        return [actionLoggerMiddleware];
    };
    GlobalStore.prototype.IsActionRegisteredAsGlobal = function (appName, action) {
        var registeredGlobalActions = this._globalActions[appName];
        if (registeredGlobalActions === undefined || registeredGlobalActions === null) {
            return false;
        }
        return registeredGlobalActions.some(function (registeredAction) { return registeredAction === action.type || registeredAction === GlobalStore.AllowAll; });
    };
    GlobalStore.prototype.LogRegistration = function (appName, isReplaced) {
        try {
            var properties = {
                "AppName": appName,
                "IsReplaced": isReplaced.toString()
            };
            if (this._logger)
                this._logger.LogEvent("Store.GlobalStore", "StoreRegistered", properties);
        }
        catch (error) {
            // Gulp the error
            console.error("ERROR: There was an error while logging registration for " + appName);
            console.error(error);
        }
    };
    GlobalStore.prototype.CopyState = function (state) {
        if (state === undefined || state === null || typeof state !== 'object') {
            return state;
        }
        else {
            return __assign({}, state);
        }
    };
    GlobalStore.Platform = "Platform";
    GlobalStore.AllowAll = "*";
    GlobalStore.InstanceName = "GlobalStoreInstance";
    GlobalStore.DebugMode = false;
    return GlobalStore;
}());
exports.GlobalStore = GlobalStore;
