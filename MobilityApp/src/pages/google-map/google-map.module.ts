import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GoogleMapPage } from './google-map';

@NgModule({
  declarations: [
    GoogleMapPage,
  ],
  imports: [
    IonicPageModule.forChild(GoogleMapPage),
  ],
  exports: [
    GoogleMapPage
  ]
})
export class GoogleMapPageModule {}
