import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchPathPage } from './search-path';

@NgModule({
  declarations: [
    SearchPathPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchPathPage),
  ],
  exports: [
    SearchPathPage
  ]
})
export class SearchPathPageModule {}
