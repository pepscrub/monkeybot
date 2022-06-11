"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
const monkey_1 = require("./monkey");
const invite_1 = require("./invite");
const report_1 = require("./report");
const leaderboard_1 = require("./leaderboard");
const dev_1 = require("./dev");
const donate_1 = require("./donate");
exports.Commands = [invite_1.Invite, dev_1.Dev, donate_1.Donate, monkey_1.Monkey, report_1.Report, leaderboard_1.leaderBoard];