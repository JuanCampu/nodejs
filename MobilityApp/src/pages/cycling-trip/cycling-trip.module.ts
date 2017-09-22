import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CyclingTripPage } from './cycling-trip';

@NgModule({
  declarations: [
    CyclingTripPage,
  ],
  imports: [
    IonicPageModule.forChild(CyclingTripPage),
  ],
  exports: [
    CyclingTripPage
  ]
})
export class CyclingTripPageModule {}
