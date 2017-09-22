import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListPathPage } from './list-path';

@NgModule({
  declarations: [
    ListPathPage,
  ],
  imports: [
    IonicPageModule.forChild(ListPathPage),
  ],
  exports: [
    ListPathPage
  ]
})
export class ListPathPageModule {}
