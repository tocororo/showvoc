import { ConfigurationObject } from '../models/Configuration';

export abstract class AbstractContributionComponent {

    abstract storedConfigurationTypeId: string;

    constructor() {}
    
    /**
     * Returns the configuration of the contribution component implementation (after an integrity check on the fields)
     * Returns null if any missing field
     */
    abstract getConfiguration(): ConfigurationObject;
}