import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { JoinPointPage } from './join-point';

@NgModule({
  declarations: [
    JoinPointPage,
  ],
  imports: [
    IonicPageModule.forChild(JoinPointPage),
  ],
  exports: [
    JoinPointPage
  ]
})
export class JoinPointPageModule {}
