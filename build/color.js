"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.colorGreyscale = exports.colorBasedOnDiff = exports.colorBasedOnPackageName = exports.diffColorGreen = exports.diffColorRed = exports.defaultColor = void 0;
var color_1 = __importDefault(require("color"));
var murmur3_1 = __importDefault(require("./murmur3"));
var colors = [
    color_1["default"].hsl(24, 69, 60),
    color_1["default"].hsl(34, 65, 65),
    color_1["default"].hsl(194, 52, 61),
    color_1["default"].hsl(163, 45, 55),
    color_1["default"].hsl(211, 48, 60),
    color_1["default"].hsl(246, 40, 65),
    color_1["default"].hsl(305, 63, 79),
    color_1["default"].hsl(47, 100, 73),
    color_1["default"].rgb(183, 219, 171),
    color_1["default"].rgb(244, 213, 152),
    color_1["default"].rgb(112, 219, 237),
    color_1["default"].rgb(249, 186, 143),
    color_1["default"].rgb(242, 145, 145),
    color_1["default"].rgb(130, 181, 216),
    color_1["default"].rgb(229, 168, 226),
    color_1["default"].rgb(174, 162, 224),
    color_1["default"].rgb(154, 196, 138),
    color_1["default"].rgb(242, 201, 109),
    color_1["default"].rgb(101, 197, 219),
    color_1["default"].rgb(249, 147, 78),
    color_1["default"].rgb(234, 100, 96),
    color_1["default"].rgb(81, 149, 206),
    color_1["default"].rgb(214, 131, 206),
    color_1["default"].rgb(128, 110, 183),
];
exports.defaultColor = colors[0];
exports.diffColorRed = color_1["default"].rgb(200, 0, 0);
exports.diffColorGreen = color_1["default"].rgb(0, 170, 0);
function colorBasedOnPackageName(name, a) {
    var hash = murmur3_1["default"](name);
    var colorIndex = hash % colors.length;
    var baseClr = colors[colorIndex];
    return baseClr.alpha(a);
}
exports.colorBasedOnPackageName = colorBasedOnPackageName;
// assume: left >= 0 && Math.abs(diff) <= left so diff / left is in [0...1]
// if left == 0 || Math.abs(diff) > left, we use the color of 100%
function colorBasedOnDiff(diff, left, a) {
    var v = !left || Math.abs(diff) > left ? 1
        : 200 * Math.sqrt(Math.abs(diff / left));
    if (diff >= 0)
        return color_1["default"].rgb(200, 200 - v, 200 - v).alpha(a);
    return color_1["default"].rgb(200 - v, 200, 200 - v).alpha(a);
}
exports.colorBasedOnDiff = colorBasedOnDiff;
function colorGreyscale(v, a) {
    return color_1["default"].rgb(v, v, v).alpha(a);
}
exports.colorGreyscale = colorGreyscale;
exports["default"] = (function () { });
