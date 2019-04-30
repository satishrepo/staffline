export function ObjectMapper(input,target){
  let returnObj={};
  return new Promise((resolve,reject)=>{
     if(input && target){
       let objKeys=Object.keys(input);

       for(let i=0;i <objKeys.length;i++){

         if(input[objKeys[i]]==null || input[objKeys[i]]==undefined){

           returnObj[objKeys[i]]=target[objKeys[i]];

         } else {

           returnObj[objKeys[i]]=input[objKeys[i]];
         }
       }
       resolve(returnObj);

     } else {
       reject('Unsupported object');
     }
  })

}