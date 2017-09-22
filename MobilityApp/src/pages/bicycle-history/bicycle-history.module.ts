import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BicycleHistoryPage } from './bicycle-history';

@NgModule({
  declarations: [
    BicycleHistoryPage,
  ],
  imports: [
    IonicPageModule.forChild(BicycleHistoryPage),
  ],
  exports: [
    BicycleHistoryPage
  ]
})
export class BicycleHistoryPageModule {}
