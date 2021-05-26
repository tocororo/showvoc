import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle, OutletContext } from '@angular/router';
import { SVContext } from './utils/SVContext';
import { ComponentRef } from '@angular/core';

// https://stackoverflow.com/questions/41280471/how-to-implement-routereusestrategy-shoulddetach-for-specific-routes-in-angular

/**
 * https://github.com/angular/angular/issues/16713#issuecomment-322113987
 * - shouldDetach: Asks if the snapshot should be detached from the router. 
 *   That means that the router will no longer handle this snapshot after it has been stored by calling the store-method.
 * 
 * - store: After the router has asked by using the shouldDetach-method and it returned true, the store-method is called (not immediately but some time later).
 *   If the router sends you a null-value, you can delete this entry from your storage. No need to take care about the memory. Angular should handle this.
 * 
 * - shouldAttach: Asks if a snapshot for the current route already has been stored. 
 *   Return true, if your storage contains the right snapshot and the router should re-attach this snapshot to the routing.
 * 
 * - retrieve: load the snapshot from your storage. It's only called, if the shouldAttach-method returned true.
 * 
 * - shouldReuseRoute: Asks if a snapshot from the current routing can be used for the future routing.
 * 
 * If a snapshot is detached from the routing and re-attached later, there should be no memory leak.
 * But if a snapshot is detached from the routing and never re-attached to the router, the developer has to take care about the memory management.
 * 
 * 
 * Also this comment seems to be useful in order to understand the steps of RouteRuseStrategy
 * https://github.com/angular/angular/issues/18622#issuecomment-371082879
 */

/**
 * Documentation about RouteReuseStrategy is missing, moreover the documentation found on the web are not so accurate nor correct
 * (e.g. someone states that retrieve is called only if shouldAttach it's true, while this isn't true, apparently it is called also before)
 * What I'm sure about:
 * - shouldReuseRoute is the first to be called. It returns false if the user is leaving the current route, then the other methods are called
 * - store is called only for storing a detached route.
 * - shouldDetach determines the invokation of store. If shouldDetach returns true, store is called, otherwise store is not called.
 * 
 * What it's not clear:
 * order of invokation of the methods: shouldReuseRoute is the first one, but then? if I add log prints in the methods, 
 * it shows not always the same order, moreover in case of children route, the order seems to be more messed up
 */

export class CustomReuseStrategy implements RouteReuseStrategy {

    private log: boolean = false; //set to true in order to read prints in the browser logger

    private stickyRoutes: string[] = ["search", "datasets", "datasets/:id", "data", "sparql"]
    private projectDependantRoutes: string[] = ["datasets/:id", "data", "sparql"];

	/** 
     * Object which will store DetachedRouteHandle indexed by keys
     * The keys will all be a path (as in route.routeConfig.path)
     * This allows us to see if we've got a route stored for the requested path
     */
	storedRoutes: { [key: string]: DetachedRouteHandle } = {};

	/**
     * Determines if this route (and its subtree) should be detached to be reused later.
     * @param is the route that is going to leave
     * @returns true if the route should be stored via store(), 
     *  false otherwise (the route is lost/destroyed and then, when requested again, the route (and its subtree) is reinitialized)
     */
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        if (this.log) console.log('CustomReuseStrategy.shouldDetach', route.routeConfig.path, (this.stickyRoutes.indexOf(route.routeConfig.path) != -1));
        return this.stickyRoutes.indexOf(route.routeConfig.path) != -1;
	}
	
	/**
     * Stores the detached route.
     * This method is called only if shouldDetach return true.
     * Add the handle of the route to the storedRoutes map.
     */
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        if (this.log) console.log('CustomReuseStrategy.store', route.routeConfig.path);
        this.storedRoutes[route.routeConfig.path] = handle;
	}
	
	/**
     * Determines if this route (and its subtree) should be reattached
     * @returns true if it should reattach a route previously stored.
     */
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        if (this.log) console.log('CustomReuseStrategy.shouldAttach', route.routeConfig.path, (!!route.routeConfig && !!this.storedRoutes[route.routeConfig.path]));
        //true if there is a route stored
        return !!route.routeConfig && !!this.storedRoutes[route.routeConfig.path];
	}
	
	/** 
     * Retrieves the previously stored route
     * @param route New route the user has requested
     * @returns DetachedRouteHandle object which can be used to render the component
     */
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        // return null if the path does not have a routerConfig or a route for the given path was not previously stored
        if (!route.routeConfig || !this.storedRoutes[route.routeConfig.path]) {
            if (this.log) console.log('CustomReuseStrategy.retrieve', route.routeConfig.path, 'null');
            return null;
        }
        /**
         * if the route to retireve is a sticky one
         * - if the project was changed and the route to retrieve is project-dependant, do not retrieve the route and destroy it.
         * - otherwise returns the stored route
         */
        if (this.stickyRoutes.indexOf(route.routeConfig.path) != -1 && SVContext.isProjectChanged()) {
            SVContext.setProjectChanged(false); //reset projectChanged
            //destroy the routes project-dependant
            this.projectDependantRoutes.forEach(projDependantRoute => {
                this.destroyRouteHandle(projDependantRoute);
            })
            //return null, so a new route it will be created
            if (this.log) console.log('CustomReuseStrategy.retrieve', route.routeConfig.path, 'null');
            return null;
        }
        // returns handle when the route.routeConfig.path is already stored
        if (this.log) console.log('CustomReuseStrategy.retrieve', route.routeConfig.path, (!!route.routeConfig && !!this.storedRoutes[route.routeConfig.path]));
        return this.storedRoutes[route.routeConfig.path];
	}
	
	/** 
     * Determines whether or not the current route should be reused.
     * In case it returns false (the routing should happen), the rest of the methods are called
     * @param future The route the user is going to, as triggered by the router
     * @param curr The route the user is currently on
     * @returns true if the routing should not happen (routing not changed), flase if the routing should happen
     */
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        if (this.log) console.log('CustomReuseStrategy.shouldReuseRoute', (future.routeConfig === curr.routeConfig));
        return future.routeConfig === curr.routeConfig;
    }
    
    
    /**
     * destroy the previously stored Component of the given route and remove the related DetachedRouteHandle from the storedRoutes map
     * @param routePath 
     */
    private destroyRouteHandle(routePath: string): void {
        if (this.log) console.log("CustomReuseStrategy.destroyRouteHandle", routePath);
        let detachedRouteHandle: DetachedRouteHandle = this.storedRoutes[routePath];
        if (detachedRouteHandle) {
            let contexts: Map<string, OutletContext> = detachedRouteHandle['contexts'];
            contexts.forEach((context: OutletContext, key: string) => {
                if (context.outlet) {
                    //deactivate the outlet
                    context.outlet.deactivate();
                    //destroy the contexts for all the outlets that were in the component
                    context.children.onOutletDeactivated();
                }
            });
            let componentRef: ComponentRef<any> = detachedRouteHandle['componentRef'];
            if (componentRef) {
                componentRef.destroy();
            }
            delete this.storedRoutes[routePath];
        }
    }

}