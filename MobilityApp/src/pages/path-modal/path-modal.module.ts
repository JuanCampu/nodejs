import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PathModalPage } from './path-modal';

@NgModule({
  declarations: [
    PathModalPage,
  ],
  imports: [
    IonicPageModule.forChild(PathModalPage),
  ],
  exports: [
    PathModalPage
  ]
})
export class PathModalPageModule {}
