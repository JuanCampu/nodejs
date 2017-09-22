import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TravelHistoryPage } from './travel-history';

@NgModule({
  declarations: [
    TravelHistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(TravelHistoryPage),
  ],
  exports: [
    TravelHistoryPage
  ]
})
export class TravelHistoryPageModule {}
