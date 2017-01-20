import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { ApiSampleService } from '../core/services/api-sample.service';
import { ApiHits } from '../shared/api-types/api-hits';

let sampleHomeStyles: string = `

div.table-container {
  padding-right: 90px;
  position: relative;
  overflow-y: auto;
}

@media (max-width: 991px) {
  div.table-container {
    width: 100%;
    overflow-x: scroll;
    -ms-overflow-style: -ms-autohiding-scrollbar;
    -webkit-overflow-scrolling: touch;
    padding-right: 0px;
  }
}
div.table-buttons {
  position: absolute;
  top: 0;
}
div.table-buttons h4 {
  margin: 10px 0px;
}

button.page-button {
  border: 1px solid #ddd;
  border-radius: 15px;
  margin: 0px 0px 10px;
}
`;

@Component({
    templateUrl: './sample-home.component.html',
    styles: [ sampleHomeStyles ],
})
export class SampleHomeComponent implements OnInit, OnDestroy {
  public constructor(
    private titleService: Title,
    private apiSampleService: ApiSampleService,
  ) { }

  public apiHits: ApiHits;
  public totalHits: number = -1;
  public displayStart: number = -1;
  public displayStop: number = -1;
  public offset: number = 0;
  public viewOption: number = 1;

  public popFilterVisible: boolean = true;
  public popFilters: {[code: string]: boolean} = {};
  
  private apiHitsSource: Subject<Observable<ApiHits>>;
  private apiHitsSubscription: Subscription = null;
  private hitsPerPage: number = 50;

  ngOnInit() {
    this.titleService.setTitle('IGSR | samples');
    this.apiHitsSource = new Subject<Observable<ApiHits>>();
    this.apiHitsSubscription = this.apiHitsSource
      .switchMap((o: Observable<ApiHits>): Observable<ApiHits> => o)
      .subscribe((h: ApiHits) => {
          this.apiHits = h;
          if (h) {
            this.totalHits = h.total;
            this.displayStart = h.hits ? this.offset + 1 : 0;
            this.displayStop = h.hits ? this.offset + h.hits.length : 0;
          }
        })
    this.apiHitsSource.next( this.apiSampleService.getAll(this.hitsPerPage, this.offset));
  }
  ngOnDestroy() {
    if (this.apiHitsSubscription) {
      this.apiHitsSubscription.unsubscribe();
    }
  }

  hasMore(): boolean {
    if (this.totalHits > this.offset + this.hitsPerPage) {
      return true;
    }
    return false;
  }

  tableNext() {
    if (this.hasMore()) {
      this.offset += this.hitsPerPage;
      this.apiHitsSource.next( this.apiSampleService.getAll(this.hitsPerPage, this.offset));
    }
  }

  tablePrevious() {
    if (this.offset > 1) {
      this.offset -= this.hitsPerPage;
      this.apiHitsSource.next( this.apiSampleService.getAll(this.hitsPerPage, this.offset));
    }
  }

  toggleView() {
    this.viewOption = this.viewOption == 1 ? 2 : 1;
  }

  onPopFiltersChange(popFilters: {[code: string]: boolean}) {
    console.log(popFilters);
  }
};
