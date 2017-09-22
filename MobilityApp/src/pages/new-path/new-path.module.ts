import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewPathPage } from './new-path';

import { SharedModule } from '../../app/shared/shared.module';

@NgModule({
  declarations: [
    NewPathPage,
  ],
  imports: [
    IonicPageModule.forChild(NewPathPage),
    SharedModule
  ],
  exports: [
    NewPathPage,
  ]
})
export class NewPathPageModule {}
