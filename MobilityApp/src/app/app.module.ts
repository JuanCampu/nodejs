import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';

import { File } from '@ionic-native/file';
import { Transfer } from '@ionic-native/transfer';
import { FilePath } from '@ionic-native/file-path';
import { Camera } from '@ionic-native/camera';
import { Geolocation } from '@ionic-native/geolocation';
import { Push } from '@ionic-native/push';
import { LocalNotifications } from '@ionic-native/local-notifications';


import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SplashPage} from '../pages/splash/splash';
import { TutorialPageModule } from '../pages/tutorial/tutorial.module';
import { ProfilePageModule } from '../pages/profile/profile.module';
import { PathNearPageModule } from '../pages/path-near/path-near.module';

import { StartPageModule } from '../pages/start/start.module';
import { SearchPathPageModule } from '../pages/search-path/search-path.module';
import { SearchNamePageModule } from '../pages/search-name/search-name.module';
import { NearModalPageModule } from '../pages/near-modal/near-modal.module';
import { SearchGpsPageModule } from '../pages/search-gps/search-gps.module';
import { ListPathPageModule } from '../pages/list-path/list-path.module';

import { RudVehiclePageModule } from '../pages/rud-vehicle/rud-vehicle.module';
import { NewFavoriteSitePageModule } from '../pages/new-favorite-site/new-favorite-site.module';
import { GoogleMapPageModule } from '../pages/google-map/google-map.module';
import { PathModalPageModule } from '../pages/path-modal/path-modal.module';
import { FavoriteModalPageModule } from '../pages/favorite-modal/favorite-modal.module';
import { VehicleModalPageModule } from '../pages/vehicle-modal/vehicle-modal.module';
import { RudFavoriteSitePageModule } from '../pages/rud-favorite-site/rud-favorite-site.module';
import { NewVehiclePageModule} from '../pages/new-vehicle/new-vehicle.module';
import { NewPathPageModule} from '../pages/new-path/new-path.module';
import { PathPageModule} from '../pages/path/path.module';
import { TravelPageModule} from '../pages/travel/travel.module';
import { JoinPointPageModule} from '../pages/join-point/join-point.module';
import { ShowProfilePageModule } from '../pages/show-profile/show-profile.module';
import { TravelModalPageModule } from '../pages/travel-modal/travel-modal.module';
import { CyclingTripPageModule } from '../pages/cycling-trip/cycling-trip.module';
import { BicycleHistoryPageModule } from '../pages/bicycle-history/bicycle-history.module';
import { BicyclePageModule } from '../pages/bicycle/bicycle.module';


import { ReactiveFormsModule } from '@angular/forms';
import { WebApiProvider } from '../providers/web-api/web-api';
import { PhotoProvider } from '../providers/photo/photo';
import { Network } from '@ionic-native/network';
import { NotificationProvider } from '../providers/notification/notification';
import { CacheModule } from "ionic-cache";
import { Calendar } from '@ionic-native/calendar';
import { NetworkServiceProvider } from '../providers/network-service/network-service';
import { TextToSpeech } from '@ionic-native/text-to-speech';
import { TravelHistoryPageModule } from '../pages/travel-history/travel-history.module';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    SplashPage
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpModule,
    StartPageModule,
    ProfilePageModule,
    SearchPathPageModule,
    SearchGpsPageModule,
    ListPathPageModule,
    PathPageModule,
    TutorialPageModule,
    NearModalPageModule,
    TravelHistoryPageModule,
    TravelModalPageModule,
    RudVehiclePageModule,
    SearchNamePageModule,
    PathNearPageModule,
    GoogleMapPageModule,
    PathModalPageModule,
    VehicleModalPageModule,
    FavoriteModalPageModule,
    RudFavoriteSitePageModule,
    NewFavoriteSitePageModule,
    NewVehiclePageModule,
    NewPathPageModule,
    TravelPageModule,
    JoinPointPageModule,
    ShowProfilePageModule,
    CyclingTripPageModule,
    BicycleHistoryPageModule,
    BicyclePageModule,
    IonicModule.forRoot(MyApp,{
      menuType: 'push',
      platform: {
        ios:{
          menuType: 'overlay'
        }          
      }
    }),
    CacheModule.forRoot(),  
    IonicStorageModule.forRoot({
      name: '__MoviAppCache76',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SplashPage
  ],
  providers: [
    Geolocation,
    StatusBar,
    SplashScreen,
    TextToSpeech,
    File,
    Transfer,
    Camera,
    FilePath,
    {provide: ErrorHandler, useClass: IonicErrorHandler}, WebApiProvider,
    PhotoProvider,
    Network,
    Push,
    NotificationProvider,
    LocalNotifications,
    Calendar,
    NetworkServiceProvider
  ]
})
export class AppModule {}
