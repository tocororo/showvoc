import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PredicateObjects, IRI, AnnotatedValue } from 'src/app/models/Resources';
import { ResViewPartition, ResViewUtils } from 'src/app/models/ResourceView';

@Component({
    selector: "links-filter-modal",
    templateUrl: "./links-filter-modal.html"
})
export class LinksFilterModal {
    
    @Input() predObjListMap: { [partition: string]: PredicateObjects[] };

    filters: LinkFilter[];
    totalObjCount: number = 0;

    constructor(public activeModal: NgbActiveModal) { }
	
    ngOnInit() {
        this.filters = [];
        for (let p in this.predObjListMap) {
            let polList: PredicateObjects[] = this.predObjListMap[p];
            let predicates: { res: AnnotatedValue<IRI>, checked: boolean, count: number }[] = [];
            polList.forEach(pol => {
                predicates.push({ res: pol.getPredicate(), checked: true, count: pol.getObjects().length });
                this.totalObjCount += pol.getObjects().length;
            });
            if (predicates.length > 0) {
                this.filters.push({
                    partition: { id: <ResViewPartition>p, showTranslationKey: ResViewUtils.getResourceViewPartitionLabelTranslationKey(<ResViewPartition>p) },
                    predicates: predicates }
                );
            }
        }
    }

    private checkAll(filter: LinkFilter, check: boolean) {
        filter.predicates.forEach(p => {
            p.checked = check;
        })
    }

    private getPartitionCount(filter: LinkFilter): number {
        let count = 0;
        filter.predicates.forEach(p => {
            if (p.checked) count += p.count;
        })
        return count;
    }

    getVisibleCount(): number {
        let count = 0;
        this.filters.forEach(f => {
            f.predicates.forEach(p => {
                if (p.checked) count += p.count;
            });
        });
        return count;
    }

    ok() {
        let predicatesToHide: IRI[] = [];
        this.filters.forEach(f => {
            f.predicates.forEach(p => {
                if (!p.checked) predicatesToHide.push(p.res.getValue());
            });
        });
        this.activeModal.close(predicatesToHide);
    }

	close() {
		this.activeModal.dismiss();
	}

}

class LinkFilter {
    partition: { id: ResViewPartition, showTranslationKey: string };
    predicates: { res: AnnotatedValue<IRI>, checked: boolean, count: number }[];
}