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
exports.__esModule = true;
exports.AbstractLogger = void 0;
/**
 * Summary Logs data from application. Follows a Chain of Responsibility pattern where multiple loggers can be chained.
 */
var AbstractLogger = /** @class */ (function () {
    function AbstractLogger(id) {
        this.LoggerIdentity = id;
    }
    /**
     * Summary Logs an event
     * @param source Location from where the log is sent
     * @param eventName Name of the event that has occurred
     * @param properties Properties (KV pair) associated with the event
     */
    AbstractLogger.prototype.LogEvent = function (source, eventName, properties) {
        try {
            this.processEvent(source, eventName, properties);
            if (this.NextLogger !== undefined && this.NextLogger !== null) {
                this.NextLogger.LogEvent(source, eventName, properties);
            }
        }
        catch (_a) {
            // DO NOT THROW AN EXCEPTION WHEN LOGGING FAILS
        }
    };
    /**
     * Summary Logs an error in the system
     * @param source Location where the error has occurred
     * @param error Error
     * @param properties Custom properties (KV pair)
     */
    AbstractLogger.prototype.LogException = function (source, error, properties) {
        try {
            this.processException(source, error, properties);
            if (this.NextLogger !== undefined && this.NextLogger !== null) {
                this.NextLogger.LogException(source, error, properties);
            }
        }
        catch (_a) {
            // DO NOT THROW AN EXCEPTION WHEN LOGGING FAILS
        }
    };
    /**
     * Summary Sets the next logger in the chain. If the next logger is already filled then its chained to the last logger of the chain
     * @param nextLogger Next Logger to be set in the chain
     */
    AbstractLogger.prototype.SetNextLogger = function (nextLogger) {
        if (nextLogger === undefined || nextLogger === null)
            return;
        if (!this.isLoggerLoopCreated(nextLogger)) {
            if (this.NextLogger === undefined || this.NextLogger === null) {
                this.NextLogger = nextLogger;
            }
            else {
                this.NextLogger.SetNextLogger(nextLogger);
            }
        }
    };
    AbstractLogger.prototype.isLoggerLoopCreated = function (nextLogger) {
        var tmpLogger = __assign({}, nextLogger);
        do {
            if (tmpLogger.LoggerIdentity === this.LoggerIdentity)
                return true;
            tmpLogger = tmpLogger.NextLogger;
        } while (tmpLogger !== null && tmpLogger !== undefined);
        return false;
    };
    return AbstractLogger;
}());
exports.AbstractLogger = AbstractLogger;
