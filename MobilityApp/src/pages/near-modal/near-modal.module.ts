import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NearModalPage } from './near-modal';

@NgModule({
  declarations: [
    NearModalPage,
  ],
  imports: [
    IonicPageModule.forChild(NearModalPage),
  ],
  exports: [
    NearModalPage
  ]
})
export class NearModalPageModule {}
