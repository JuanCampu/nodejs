import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TravelPage } from './travel';

@NgModule({
  declarations: [
    TravelPage,
  ],
  imports: [
    IonicPageModule.forChild(TravelPage),
  ],
  exports: [
    TravelPage
  ]
})
export class TravelPageModule {}
