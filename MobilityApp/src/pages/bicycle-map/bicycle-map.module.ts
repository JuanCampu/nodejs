import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BicycleMapPage } from './bicycle-map';

@NgModule({
  declarations: [
    BicycleMapPage,
  ],
  imports: [
    IonicPageModule.forChild(BicycleMapPage),
  ],
  exports: [
    BicycleMapPage
  ]
})
export class BicycleMapPageModule {}
