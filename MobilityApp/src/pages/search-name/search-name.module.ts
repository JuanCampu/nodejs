import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchNamePage } from './search-name';

@NgModule({
  declarations: [
    SearchNamePage,
  ],
  imports: [
    IonicPageModule.forChild(SearchNamePage),
  ],
  exports: [
    SearchNamePage
  ]
})
export class SearchNamePageModule {}
