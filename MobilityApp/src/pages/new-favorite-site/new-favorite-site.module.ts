import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewFavoriteSitePage } from './new-favorite-site';

import { SharedModule } from '../../app/shared/shared.module';

@NgModule({
  declarations: [
    NewFavoriteSitePage,
  ],
  imports: [
    IonicPageModule.forChild(NewFavoriteSitePage),
    SharedModule
  ],
  exports: [
    NewFavoriteSitePage
  ]
})
export class NewFavoriteSitePageModule {}
