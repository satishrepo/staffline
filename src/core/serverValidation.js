import ProxyClass from './proxyClass';

function inputValidate(classObj,inputData) {
  console.log('inputData ' , inputData);
  let inputDetails = inputData;
      let errArry=[];
      if (JSON.stringify(inputDetails) != '{}') {
        var data=new ProxyClass(classObj,inputDetails)
        let objKeys=Object.keys(JSON.parse(JSON.stringify(data)));
        let obj=JSON.parse(JSON.stringify(data));
        console.log("obj :",obj);
        console.log("objKeys :",objKeys);
        for(let i=0;i <objKeys.length;i++){
          let errobj={};

          // Required Field validation //
          if(obj[objKeys[i]].required && ( obj[objKeys[i]].value==undefined ||  obj[objKeys[i]].value===null || obj[objKeys[i]].value==='')){
            errobj={
              field:objKeys[i],
              errMsg: ` This field is empty.`
            }
            errArry.push(errobj)
          }

          let reg= obj[objKeys[i]].regEx ? new RegExp(obj[objKeys[i]].regEx) :"";
          console.log('reg ' , reg.toString());
          console.log('value ' , obj[objKeys[i]].value);
          console.log('valid ' , reg.test(obj[objKeys[i]].value));

          // Regular expression validation //
          if(reg.toString() && ( obj[objKeys[i]].value!==undefined && obj[objKeys[i]].value!==null && obj[objKeys[i]].value.toString()!=="")){
            if(reg.test(obj[objKeys[i]].value.toString())==false){
              errobj={
                field:objKeys[i],
                errMsg:` This field is not in correct format.`
              }
              errArry.push(errobj)
            }
          }

          // max length validation //
          if(obj[objKeys[i]].length && obj[objKeys[i]].length > 0 ){
            if(obj[objKeys[i]].value!==undefined && obj[objKeys[i]].value!==null && obj[objKeys[i]].value.toString()!=="") {
              if (obj[objKeys[i]].value.length > obj[objKeys[i]].length) {
                errobj = {
                  field: objKeys[i],
                  errMsg: `Length should not exceed ${obj[objKeys[i]].length} characters.`
                }
                errArry.push(errobj)
              }
            }
          }
        }

        if(errArry.length > 0){
          return {
            msg:"error",
            records: errArry
          };
        } else {
          return {
            msg:"success",
            records: []
          };
        }
      } else {
        return {
          msg:"error",
          records: 'Invalid Object'
        };
      }

}

module.exports=inputValidate;