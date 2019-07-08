import { Project } from './Project';

export enum AlignmentContext {
    local = "local", //(in tabset) source project is the one in used, target project must be selected
    global = "global" //(dedicated page from navbar) both source and target projects must be selected
}

export class AlignmentOverview {
    project: Project;
    size: number;
}