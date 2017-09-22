import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RudVehiclePage } from './rud-vehicle';

@NgModule({
  declarations: [
    RudVehiclePage,
  ],
  imports: [
    IonicPageModule.forChild(RudVehiclePage),
  ],
  exports: [
    RudVehiclePage
  ]
})
export class RudVehiclePageModule {}
