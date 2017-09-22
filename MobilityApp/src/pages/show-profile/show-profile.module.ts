import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShowProfilePage } from './show-profile';

@NgModule({
  declarations: [
    ShowProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(ShowProfilePage),
  ],
  exports: [
    ShowProfilePage
  ]
})
export class ShowProfilePageModule {}
