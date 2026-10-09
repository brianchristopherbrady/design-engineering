import type { Article } from '../wiki/types';
import { composites } from './composites';
import { designLanguage } from './designLanguage';
import { documentation } from './documentation';
import { frameworks } from './frameworks';
import { governance } from './governance';
import { measure } from './measure';
import { migration } from './migration';
import { patterns } from './patterns';
import { primitives } from './primitives';
import { principlesArticle } from './principles';
import { sharing } from './sharing';
import { start } from './start';
import { tokens } from './tokens';

export const articles: readonly Article[] = [start, principlesArticle, designLanguage, tokens, primitives, composites, patterns, documentation, governance, migration, measure, sharing, frameworks];
