"use strict";
exports.__esModule = true;
exports.ActionLogger = void 0;
var flatted_1 = require("flatted");
/**
 * Summary Logs action and its impact on the state
 */
var ActionLogger = /** @class */ (function () {
    function ActionLogger(_logger) {
        this._logger = _logger;
    }
    /**
     * Summary Creates as Redux middleware for logging the actions and its impact on the State
     */
    ActionLogger.prototype.CreateMiddleware = function () {
        var _this = this;
        return function (store) { return function (next) { return function (action) {
            if (!_this.IsLoggingAllowed(action)) {
                return next(action);
            }
            var dispatchedAt = new Date();
            var state = store.getState();
            _this.LogActionDispatchStart(state, action);
            var dispatchResult = null;
            try {
                dispatchResult = next(action);
            }
            catch (error) {
                _this.LogActionDispatchFailure(action, dispatchedAt, error);
                throw error;
            }
            state = store.getState();
            _this.LogActionDispatchComplete(state, action, dispatchedAt);
            return dispatchResult;
        }; }; };
    };
    ActionLogger.prototype.SetLogger = function (logger) {
        if (this._logger === undefined || this._logger === null)
            this._logger = logger;
        else
            this._logger.SetNextLogger(logger);
    };
    ActionLogger.prototype.IsLoggingAllowed = function (action) {
        return action.logEnabled !== undefined
            && action.logEnabled !== null
            && action.logEnabled === true
            && this._logger !== undefined
            && this._logger !== null;
    };
    ActionLogger.prototype.LogActionDispatchStart = function (state, action) {
        try {
            var properties = {
                "OldState": flatted_1.stringify(state),
                "ActionName": action.type,
                "DispatchStatus": "Dispatched",
                "DispatchedOn": new Date().toISOString(),
                "Payload": flatted_1.stringify(action.payload)
            };
            this._logger.LogEvent("Fxp.Store.ActionLogger", action.type + " :: DISPATCHED", properties);
        }
        catch (error) {
            // Gulp the error
            console.error("ERROR: There was an error while trying to log the Dispatch Complete event");
            console.error(error);
        }
    };
    ActionLogger.prototype.LogActionDispatchComplete = function (state, action, dispatchedAt) {
        try {
            var currentTime = new Date();
            var timeTaken = currentTime.getTime() - dispatchedAt.getTime();
            var properties = {
                "NewState": flatted_1.stringify(state),
                "ActionName": action.type,
                "DispatchStatus": "Completed",
                "DispatchedOn": new Date().toISOString(),
                "Payload": flatted_1.stringify(action.payload),
                "TimeTaken": timeTaken.toString()
            };
            this._logger.LogEvent("Fxp.Store.ActionLogger", action.type + " :: COMPLETED", properties);
        }
        catch (error) {
            // Gulp the error
            console.error("ERROR: There was an error while trying to log the Dispatch Complete event");
            console.error(error);
        }
    };
    ActionLogger.prototype.LogActionDispatchFailure = function (action, dispatchedAt, exception) {
        try {
            var currentTime = new Date();
            var timeTaken = currentTime.getTime() - dispatchedAt.getTime();
            var properties = {
                "ActionName": action.type,
                "DispatchStatus": "Failed",
                "DispatchedOn": new Date().toISOString(),
                "Payload": flatted_1.stringify(action.payload),
                "TimeTaken": timeTaken.toString()
            };
            this._logger.LogEvent("Fxp.Store.ActionLogger", action.type + " :: FAILED", properties);
            this._logger.LogException("Fxp.Store.ActionLogger", exception, properties);
            console.error(exception);
        }
        catch (error) {
            // Gulp the error
            console.error("ERROR: There was an error while trying to log the Dispatch Failure event");
            console.error(error);
        }
    };
    return ActionLogger;
}());
exports.ActionLogger = ActionLogger;
