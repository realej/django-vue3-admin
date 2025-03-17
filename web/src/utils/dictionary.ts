import { toRaw } from 'vue';
import { DictionaryStore } from '/@/stores/dictionary';

/**
  * @method Get the specifiednamedictionary
  */
export const dictionary = (name: string,key?:string|number|undefined) => {
  const dict = DictionaryStore()
  const dictionary = toRaw(dict.data)
  if(key!=undefined){
    const obj = dictionary[name].find((item:any) => item.value === key)
    return obj?obj.label:''
  }else{
    return dictionary[name]
  }
}
