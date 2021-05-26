import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { IRI } from '../models/Resources';

/**
 * This class need to be injected in constructor of every Component that throws or subscribes to an event.
 * To throw an event just call the emit() method of the EventEmitter instance, to subscribes add something like
 * eventHandler.<eventEmitterInstanceName>.subscribe(data => this.<callback>(data));
 * in the constructor of the Component
 */

@Injectable()
export class SVEventHandler {

    public lexiconChangedEvent: EventEmitter<IRI> = new SVEventEmitter("lexiconChangedEvent");
    public schemeChangedEvent: EventEmitter<IRI[]> = new SVEventEmitter("schemeChangedEvent");

    //PREFERENCES
    public showDeprecatedChangedEvent: EventEmitter<boolean> = new SVEventEmitter("showDeprecatedChangedEvent");
    public searchPrefsUpdatedEvent: EventEmitter<any> = new SVEventEmitter("searchPrefsUpdatedEvent");
    public showFlagChangedEvent: EventEmitter<boolean> = new SVEventEmitter("showFlagChangedEvent");
    public classFilterChangedEvent: EventEmitter<any> = new SVEventEmitter("classFilterChangedEvent");

    //when a project is created/deleted/open/closed/status-changed => trigger the update of projects in dataset page
    public projectUpdatedEvent: EventEmitter<any> = new SVEventEmitter("projectUpdatedEvent");

    constructor() { }

    /**
     * utility method to make a component unsubscribe from all the event to which has subscribed
     */
    public unsubscribeAll(subscriptions: Subscription[]) {
        for (var i = 0; i < subscriptions.length; i++) {
            subscriptions[i].unsubscribe();
        }
    }

}

class SVEventEmitter<T> extends EventEmitter<T> {
    private eventName: string

    /**
     * @param eventName 
     * @param isAsync 
     */
    constructor(eventName: string, isAsync?: boolean) {
        super(isAsync);
        this.eventName = eventName;
    }

    emit(value?: T): void {
        console.log("[", this.eventName, "]", value);
        super.emit(value);
    }

}