import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FavoriteModalPage } from './favorite-modal';

@NgModule({
  declarations: [
    FavoriteModalPage,
  ],
  imports: [
    IonicPageModule.forChild(FavoriteModalPage),
  ],
  exports: [
    FavoriteModalPage
  ]
})
export class FavoriteModalPageModule {}
