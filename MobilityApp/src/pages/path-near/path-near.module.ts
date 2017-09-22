import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PathNearPage } from './path-near';

@NgModule({
  declarations: [
    PathNearPage,
  ],
  imports: [
    IonicPageModule.forChild(PathNearPage),
  ],
  exports: [
    PathNearPage
  ]
})
export class PathNearPageModule {}
