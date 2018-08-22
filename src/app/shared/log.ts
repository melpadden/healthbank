import {Injectable} from '@angular/core';


@Injectable()
export class Log{
  private static Levels = {
    DEBUG : true,
    ERROR : true,
    INFO: true,
    WARNING : true
  };

  constructor(){

  }

  static Info(...args) {
    if (Log.Levels.INFO) {
      console.info(args);
    }
  }
  static Warning(...args){
    if(Log.Levels.WARNING){
      console.warn(args);
    }
  }
  static Debug(...args){
    if(Log.Levels.DEBUG){
      console.info(args);
    }
  }
  static Error(...args){
    console.error(args);
  }
}
