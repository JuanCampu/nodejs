import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RudFavoriteSitePage } from './rud-favorite-site';

import { SharedModule } from '../../app/shared/shared.module';
@NgModule({
  declarations: [
    RudFavoriteSitePage,
  ],
  imports: [
    IonicPageModule.forChild(RudFavoriteSitePage),
    SharedModule
  ],
  exports: [
    RudFavoriteSitePage
  ]
})
export class RudFavoriteSitePageModule {}
