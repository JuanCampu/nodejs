import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TravelModalPage } from './travel-modal';

@NgModule({
  declarations: [
    TravelModalPage,
  ],
  imports: [
    IonicPageModule.forChild(TravelModalPage),
  ],
  exports: [
    TravelModalPage
  ]
})
export class TravelModalPageModule {}
