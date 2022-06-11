"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intwithcommas = void 0;
const intwithcommas = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
exports.intwithcommas = intwithcommas;
