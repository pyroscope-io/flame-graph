"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.parseFlamebearerFormat = exports.deltaDiffWrapper = exports.deltaDiff = void 0;
var jsx_runtime_1 = require("react/jsx-runtime");
//@ts-nocheck
var react_1 = __importDefault(require("react"));
var format_1 = require("./format");
var color_1 = require("./color");
require("./styles.css");
var formatSingle = {
    format: "single",
    jStep: 4,
    jName: 3,
    getBarOffset: function (level, j) { return level[j]; },
    getBarTotal: function (level, j) { return level[j + 1]; },
    getBarTotalDiff: function (level, j) { return 0; },
    getBarSelf: function (level, j) { return level[j + 2]; },
    getBarSelfDiff: function (level, j) { return 0; },
    getBarName: function (level, j) { return level[j + 3]; }
};
var formatDouble = {
    format: "double",
    jStep: 7,
    jName: 6,
    getBarOffset: function (level, j) { return (level[j] + level[j + 3]); },
    getBarTotal: function (level, j) { return (level[j + 4] + level[j + 1]); },
    getBarTotalLeft: function (level, j) { return level[j + 1]; },
    getBarTotalRght: function (level, j) { return level[j + 4]; },
    getBarTotalDiff: function (level, j) { return (level[j + 4] - level[j + 1]); },
    getBarSelf: function (level, j) { return (level[j + 5] + level[j + 2]); },
    getBarSelfLeft: function (level, j) { return level[j + 2]; },
    getBarSelfRght: function (level, j) { return level[j + 5]; },
    getBarSelfDiff: function (level, j) { return (level[j + 5] - level[j + 2]); },
    getBarName: function (level, j) { return level[j + 6]; }
};
function deltaDiff(levels, start, step) {
    for (var _i = 0, levels_1 = levels; _i < levels_1.length; _i++) {
        var level = levels_1[_i];
        var prev = 0;
        for (var i = start; i < level.length; i += step) {
            level[i] += prev;
            prev = level[i] + level[i + 1];
        }
    }
}
exports.deltaDiff = deltaDiff;
function deltaDiffWrapper(format, levels) {
    if (format === "double") {
        deltaDiff(levels, 0, 7);
        deltaDiff(levels, 3, 7);
    }
    else {
        deltaDiff(levels, 0, 4);
    }
}
exports.deltaDiffWrapper = deltaDiffWrapper;
function parseFlamebearerFormat(format) {
    var isSingle = format !== "double";
    if (isSingle)
        return formatSingle;
    else
        return formatDouble;
}
exports.parseFlamebearerFormat = parseFlamebearerFormat;
var PX_PER_LEVEL = 18;
var COLLAPSE_THRESHOLD = 5;
var LABEL_THRESHOLD = 20;
var HIGHLIGHT_NODE_COLOR = "#48CE73"; // green
var GAP = 0.5;
var unitsToFlamegraphTitle = {
    objects: "amount of objects in RAM per function",
    bytes: "amount of RAM per function",
    samples: "CPU time per function"
};
var diffLegend = [
    100,
    50,
    20,
    10,
    5,
    3,
    2,
    1,
    0,
    -1,
    -2,
    -3,
    -5,
    -10,
    -20,
    -50,
    -100,
];
var rect = function (ctx, x, y, w, h) { return ctx.rect(x, y, w, h); };
var FlameGraph = /** @class */ (function (_super) {
    __extends(FlameGraph, _super);
    function FlameGraph(props) {
        var _this = _super.call(this) || this;
        _this.updateData = function () {
            var _a = _this.props.flamebearer, names = _a.names, levels = _a.levels, numTicks = _a.numTicks, sampleRate = _a.sampleRate, units = _a.units, format = _a.format;
            _this.setState({
                names: names,
                levels: levels,
                numTicks: numTicks,
                sampleRate: sampleRate,
                units: units,
                format: format
            }, function () {
                _this.renderCanvas();
            });
        };
        // format=single
        //   j = 0: x start of bar
        //   j = 1: width of bar
        //   j = 3: position in the main index (jStep)
        //
        // format=double
        //   j = 0,3: x start of bar =>     x = (level[0] + level[3]) / 2
        //   j = 1,4: width of bar   => width = (level[1] + level[4]) / 2
        //                           =>  diff = (level[4] - level[1]) / (level[1] + level[4])
        //   j = 6  : position in the main index (jStep)
        _this.updateResetStyle = function () {
            // const emptyQuery = this.query === "";
            var topLevelSelected = _this.selectedLevel === 0;
            _this.setState({
                resetStyle: { visibility: topLevelSelected ? "hidden" : "visible" }
            });
        };
        _this.reset = function () {
            _this.updateZoom(0, 0);
            _this.renderCanvas();
        };
        _this.xyToBar = function (x, y) {
            var i = Math.floor(y / PX_PER_LEVEL) + _this.topLevel;
            if (i >= 0 && i < _this.state.levels.length) {
                var j = _this.binarySearchLevel(x, _this.state.levels[i], _this.tickToX);
                return { i: i, j: j };
            }
            return { i: 0, j: 0 };
        };
        _this.clickHandler = function (e) {
            var _a = _this.xyToBar(e.nativeEvent.offsetX, e.nativeEvent.offsetY), i = _a.i, j = _a.j;
            if (j === -1)
                return;
            _this.updateZoom(i, j);
            _this.renderCanvas();
            _this.mouseOutHandler();
        };
        _this.resizeHandler = function () {
            // this is here to debounce resize events (see: https://css-tricks.com/debouncing-throttling-explained-examples/)
            //   because rendering is expensive
            clearTimeout(_this.resizeFinish);
            _this.resizeFinish = setTimeout(_this.renderCanvas, 100);
        };
        _this.focusHandler = function () {
            _this.renderCanvas();
        };
        _this.tickToX = function (i) { return (i - _this.state.numTicks * _this.rangeMin) * _this.pxPerTick; };
        _this.createFormatter = function () {
            return format_1.getFormatter(_this.state.numTicks, _this.state.sampleRate, _this.state.units);
        };
        _this.renderCanvas = function () {
            if (!_this.props.flamebearer || !_this.props.flamebearer.names) {
                return;
            }
            var _a = _this.props.flamebearer, names = _a.names, levels = _a.levels, numTicks = _a.numTicks, sampleRate = _a.sampleRate;
            var ff = _this.props.format;
            var isDiff = _this.props.viewType === "diff";
            _this.canvas.width = _this.props.width || _this.canvas.clientWidth;
            _this.graphWidth = _this.canvas.width;
            _this.pxPerTick =
                _this.graphWidth / numTicks / (_this.rangeMax - _this.rangeMin);
            _this.canvas.height = _this.props.height ? _this.props.height - 20 : PX_PER_LEVEL * (levels.length - _this.topLevel);
            _this.canvas.style.height = _this.canvas.height + "px";
            _this.canvas.style.cursor = "pointer";
            if (devicePixelRatio > 1) {
                _this.canvas.width *= 2;
                _this.canvas.height *= 2;
                _this.ctx.scale(2, 2);
            }
            _this.ctx.textBaseline = "middle";
            _this.ctx.font =
                '400 12px system-ui, -apple-system, "Segoe UI", "Roboto", "Ubuntu", "Cantarell", "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
            _this.formatter = _this.createFormatter();
            // i = level
            for (var i = 0; i < levels.length - _this.topLevel; i += 1) {
                var level = levels[_this.topLevel + i];
                for (var j = 0; j < level.length; j += ff.jStep) {
                    var barIndex = ff.getBarOffset(level, j);
                    var x = _this.tickToX(barIndex);
                    var y = i * PX_PER_LEVEL;
                    var numBarTicks = ff.getBarTotal(level, j);
                    // For this particular bar, there is a match
                    var queryExists = _this.query.length > 0;
                    var nodeIsInQuery = (_this.query && names[level[j + ff.jName]].indexOf(_this.query) >= 0) ||
                        false;
                    // merge very small blocks into big "collapsed" ones for performance
                    var collapsed = numBarTicks * _this.pxPerTick <= COLLAPSE_THRESHOLD;
                    var numBarDiff = collapsed ? 0 : ff.getBarTotalDiff(level, j);
                    // const collapsed = false;
                    if (collapsed) {
                        // TODO: fix collapsed code
                        while (j < level.length - ff.jStep &&
                            barIndex + numBarTicks === ff.getBarOffset(level, j + ff.jStep) &&
                            ff.getBarTotal(level, j + ff.jStep) * _this.pxPerTick <=
                                COLLAPSE_THRESHOLD &&
                            nodeIsInQuery ===
                                ((_this.query &&
                                    names[level[j + ff.jStep + ff.jName]].indexOf(_this.query) >=
                                        0) ||
                                    false)) {
                            j += ff.jStep;
                            numBarTicks += ff.getBarTotal(level, j);
                        }
                    }
                    // ticks are samples
                    var sw = numBarTicks * _this.pxPerTick - (collapsed ? 0 : GAP);
                    var sh = PX_PER_LEVEL - GAP;
                    // if (x < -1 || x + sw > this.graphWidth + 1 || sw < HIDE_THRESHOLD) continue;
                    _this.ctx.beginPath();
                    rect(_this.ctx, x, y, sw, sh, 3);
                    var ratio = numBarTicks / numTicks;
                    var a = _this.selectedLevel > i ? 0.33 : 1;
                    var spyName = _this.props.flamebearer.spyName;
                    var nodeColor = void 0;
                    if (isDiff && collapsed) {
                        nodeColor = color_1.colorGreyscale(200, 0.66);
                    }
                    else if (isDiff) {
                        nodeColor = color_1.colorBasedOnDiff(numBarDiff, ff.getBarTotalLeft(level, j), a);
                    }
                    else if (collapsed) {
                        nodeColor = color_1.colorGreyscale(200, 0.66);
                    }
                    else if (queryExists && nodeIsInQuery) {
                        nodeColor = HIGHLIGHT_NODE_COLOR;
                    }
                    else if (queryExists && !nodeIsInQuery) {
                        nodeColor = color_1.colorGreyscale(200, 0.66);
                    }
                    else {
                        nodeColor = color_1.colorBasedOnPackageName(format_1.getPackageNameFromStackTrace(spyName, names[level[j + ff.jName]]), a);
                    }
                    _this.ctx.fillStyle = nodeColor;
                    _this.ctx.fill();
                    if (!collapsed && sw >= LABEL_THRESHOLD) {
                        var percent = format_1.formatPercent(ratio);
                        var name_1 = names[level[j + ff.jName]] + " (" + percent + ", " + _this.formatter.format(numBarTicks, sampleRate) + ")";
                        _this.ctx.save();
                        _this.ctx.clip();
                        _this.ctx.fillStyle = "black";
                        _this.ctx.fillText(name_1, Math.round(Math.max(x, 0) + 3), y + sh / 2);
                        _this.ctx.restore();
                    }
                }
            }
        };
        _this.mouseMoveHandler = function (e) {
            var ff = _this.props.format;
            var _a = _this.xyToBar(e.nativeEvent.offsetX, e.nativeEvent.offsetY), i = _a.i, j = _a.j;
            if (j === -1 ||
                e.nativeEvent.offsetX < 0 ||
                e.nativeEvent.offsetX > _this.graphWidth) {
                _this.mouseOutHandler();
                return;
            }
            var level = _this.state.levels[i];
            var x = Math.max(_this.tickToX(ff.getBarOffset(level, j)), 0);
            var y = (i - _this.topLevel) * PX_PER_LEVEL;
            var sw = Math.min(_this.tickToX(ff.getBarOffset(level, j) + ff.getBarTotal(level, j)) - x, _this.graphWidth);
            var highlightEl = _this.highlightRef.current;
            var tooltipEl = _this.tooltipRef.current;
            var numBarTicks = ff.getBarTotal(level, j);
            var percent = format_1.formatPercent(numBarTicks / _this.state.numTicks);
            var tooltipTitle = _this.state.names[level[j + ff.jName]];
            var tooltipText;
            var tooltipDiffText = "";
            var tooltipDiffColor = "";
            if (ff.format !== "double") {
                tooltipText = percent + ", " + format_1.numberWithCommas(numBarTicks) + " samples, " + _this.formatter.format(numBarTicks, _this.state.sampleRate);
            }
            else {
                var totalLeft = ff.getBarTotalLeft(level, j);
                var totalRght = ff.getBarTotalRght(level, j);
                var totalDiff = ff.getBarTotalDiff(level, j);
                tooltipText = "Left: " + format_1.numberWithCommas(totalLeft) + " samples, " + _this.formatter.format(totalLeft, _this.state.sampleRate);
                tooltipText += "\nRight: " + format_1.numberWithCommas(totalRght) + " samples, " + _this.formatter.format(totalRght, _this.state.sampleRate);
                tooltipDiffColor =
                    totalDiff === 0 ? "" : totalDiff > 0 ? color_1.diffColorRed : color_1.diffColorGreen;
                tooltipDiffText = !totalLeft
                    ? " (new)"
                    : !totalRght
                        ? " (removed)"
                        : " (" + (totalDiff > 0 ? "+" : "") + format_1.formatPercent(totalDiff / totalLeft) + ")";
            }
            // Before you change all of this to React consider performance implications.
            // Doing this with setState leads to significant lag.
            // See this issue https://github.com/pyroscope-io/pyroscope/issues/205
            //   and this PR https://github.com/pyroscope-io/pyroscope/pull/266 for more info.
            highlightEl.style.opacity = 1;
            highlightEl.style.left = _this.canvas.offsetLeft + x + "px";
            highlightEl.style.top = _this.canvas.offsetTop + y + "px";
            highlightEl.style.width = sw + "px";
            highlightEl.style.height = PX_PER_LEVEL + "px";
            tooltipEl.style.opacity = 1;
            tooltipEl.style.left = e.clientX + 12 + "px";
            tooltipEl.style.top = e.clientY + 12 + "px";
            tooltipEl.children[0].innerText = tooltipTitle;
            tooltipEl.children[1].children[0].innerText = tooltipText;
            tooltipEl.children[1].children[1].innerText = tooltipDiffText;
            tooltipEl.children[1].children[1].style.color = tooltipDiffColor;
        };
        _this.mouseOutHandler = function () {
            _this.highlightRef.current.style.opacity = "0";
            _this.tooltipRef.current.style.opacity = "0";
        };
        _this.render = function () {
            var ExportData = _this.props.ExportData;
            return (jsx_runtime_1.jsxs("div", __assign({ className: "flamegraph-pane" }, { children: [jsx_runtime_1.jsxs("div", __assign({ className: "flamegraph-header" }, { children: [!_this.state.viewDiff ? (jsx_runtime_1.jsx("div", { children: jsx_runtime_1.jsxs("div", __assign({ className: "row flamegraph-title" }, { children: ["Frame width represents", " ", unitsToFlamegraphTitle[_this.state.units]] }), void 0) }, void 0)) : (jsx_runtime_1.jsxs("div", { children: [jsx_runtime_1.jsx("div", __assign({ className: "row" }, { children: "Base graph: left - Comparison graph: right" }), void 0), jsx_runtime_1.jsx("div", __assign({ className: "row flamegraph-legend" }, { children: jsx_runtime_1.jsx("div", __assign({ className: "flamegraph-legend-list" }, { children: diffLegend.map(function (v) { return (jsx_runtime_1.jsxs("div", __assign({ className: "flamegraph-legend-item", style: { backgroundColor: color_1.colorBasedOnDiff(v, 100, 0.8) } }, { children: [v > 0 ? "+" : "", v, "%"] }), v)); }) }), void 0) }), void 0)] }, void 0)), ExportData && jsx_runtime_1.jsx(ExportData, { flameCanvas: _this.canvasRef, label: _this.props.label || "" }, void 0)] }), void 0), (!_this.props.flamebearer || _this.props.flamebearer.names.length <= 1)
                        ? (jsx_runtime_1.jsx("div", __assign({ className: "error-message" }, { children: jsx_runtime_1.jsx("span", { children: "No profiling data available for this application / time range." }, void 0) }), void 0))
                        : (jsx_runtime_1.jsxs(jsx_runtime_1.Fragment, { children: [jsx_runtime_1.jsx("canvas", { className: "flamegraph-canvas", height: "0", ref: _this.canvasRef, onClick: _this.clickHandler, onMouseMove: _this.mouseMoveHandler, onMouseOut: _this.mouseOutHandler, onBlur: function () { } }, void 0), jsx_runtime_1.jsx("div", { className: "flamegraph-highlight", ref: _this.highlightRef }, void 0), jsx_runtime_1.jsxs("div", __assign({ className: "flamegraph-tooltip", ref: _this.tooltipRef }, { children: [jsx_runtime_1.jsx("div", { className: "flamegraph-tooltip-name" }, void 0), jsx_runtime_1.jsxs("div", { children: [jsx_runtime_1.jsx("span", {}, void 0), jsx_runtime_1.jsx("span", {}, void 0)] }, void 0)] }), void 0)] }, void 0))] }), "flamegraph-pane"));
        };
        _this.state = {
            highlightStyle: { display: "none" },
            tooltipStyle: { display: "none" },
            resetStyle: { visibility: "hidden" },
            sortBy: "self",
            sortByDirection: "desc",
            viewDiff: props.viewType === "diff" ? "diff" : undefined,
            flamebearer: null
        };
        _this.canvasRef = react_1["default"].createRef();
        _this.highlightRef = react_1["default"].createRef();
        _this.tooltipRef = react_1["default"].createRef();
        _this.currentJSONController = null;
        return _this;
    }
    FlameGraph.prototype.componentDidMount = function () {
        this.canvas = this.canvasRef.current;
        this.ctx = this.canvas.getContext("2d");
        this.topLevel = 0; // Todo: could be a constant
        this.selectedLevel = 0;
        this.rangeMin = 0;
        this.rangeMax = 1;
        this.query = "";
        window.addEventListener("resize", this.resizeHandler);
        window.addEventListener("focus", this.focusHandler);
        if (this.props.shortcut) {
            this.props.shortcut.registerShortcut(this.reset, ["escape"], "Reset", "Reset Flamegraph View");
        }
        this.updateData();
    };
    FlameGraph.prototype.componentDidUpdate = function (prevProps) {
        if (this.props.flamebearer &&
            prevProps.flamebearer !== this.props.flamebearer
            || this.props.width !== prevProps.width
            || this.props.height !== prevProps.height
            || this.props.view !== prevProps.view) {
            this.updateData();
        }
    };
    FlameGraph.prototype.updateZoom = function (i, j) {
        var ff = this.props.format;
        if (!Number.isNaN(i) && !Number.isNaN(j)) {
            this.selectedLevel = i;
            this.topLevel = 0;
            this.rangeMin =
                ff.getBarOffset(this.state.levels[i], j) / this.state.numTicks;
            this.rangeMax =
                (ff.getBarOffset(this.state.levels[i], j) +
                    ff.getBarTotal(this.state.levels[i], j)) /
                    this.state.numTicks;
        }
        else {
            this.selectedLevel = 0;
            this.topLevel = 0;
            this.rangeMin = 0;
            this.rangeMax = 1;
        }
        this.updateResetStyle();
    };
    // binary search of a block in a stack level
    FlameGraph.prototype.binarySearchLevel = function (x, level, tickToX) {
        var ff = this.props.format;
        var i = 0;
        var j = level.length - ff.jStep;
        while (i <= j) {
            var m = ff.jStep * ((i / ff.jStep + j / ff.jStep) >> 1);
            var x0 = tickToX(ff.getBarOffset(level, m));
            var x1 = tickToX(ff.getBarOffset(level, m) + ff.getBarTotal(level, m));
            if (x0 <= x && x1 >= x) {
                return x1 - x0 > COLLAPSE_THRESHOLD ? m : -1;
            }
            if (x0 > x) {
                j = m - ff.jStep;
            }
            else {
                i = m + ff.jStep;
            }
        }
        return -1;
    };
    return FlameGraph;
}(react_1["default"].Component));
exports["default"] = FlameGraph;
