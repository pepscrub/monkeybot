import { Command } from './../types/command';
import { Monkey } from './monkey';
import { Invite } from './invite';
import { Report } from './report';
import { leaderBoard } from './leaderboard';
import { Dev } from './dev';
import { Donate } from './donate';
import { Changes } from './changes';

export const Commands: Command[] = [Dev, Donate, Changes, Invite, leaderBoard, Monkey, Report];