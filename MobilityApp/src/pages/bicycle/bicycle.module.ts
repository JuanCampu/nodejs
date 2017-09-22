import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BicyclePage } from './bicycle';

@NgModule({
  declarations: [
    BicyclePage,
  ],
  imports: [
    IonicPageModule.forChild(BicyclePage),
  ],
  exports: [
    BicyclePage
  ]
})
export class BicyclePageModule {}
