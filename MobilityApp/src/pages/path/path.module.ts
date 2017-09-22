import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PathPage } from './path';

@NgModule({
  declarations: [
    PathPage,
  ],
  imports: [
    IonicPageModule.forChild(PathPage),
  ],
  exports: [
    PathPage
  ]
})
export class PathPageModule {}
