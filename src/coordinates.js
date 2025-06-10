"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIRECTION_DELTAS = exports.Direction = void 0;
exports.coordinatesEqual = coordinatesEqual;
exports.coordinatesToString = coordinatesToString;
exports.addCoordinates = addCoordinates;
var Direction;
(function (Direction) {
    Direction["North"] = "north";
    Direction["South"] = "south";
    Direction["East"] = "east";
    Direction["West"] = "west";
})(Direction || (exports.Direction = Direction = {}));
exports.DIRECTION_DELTAS = {
    [Direction.North]: { row: -1, col: 0 },
    [Direction.South]: { row: 1, col: 0 },
    [Direction.East]: { row: 0, col: 1 },
    [Direction.West]: { row: 0, col: -1 }
};
function coordinatesEqual(a, b) {
    return a.row === b.row && a.col === b.col;
}
function coordinatesToString(coords) {
    return `${coords.row},${coords.col}`;
}
function addCoordinates(a, b) {
    return { row: a.row + b.row, col: a.col + b.col };
}
