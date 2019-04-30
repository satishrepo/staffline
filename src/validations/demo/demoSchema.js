import regex from '../../core/regex';

export default class DemoSchema{
  constructor(inputs){
    this.contactNumber={
      value: inputs.contactNumber,
      required:true,
      regEx:regex.email,
      length:50
    };

    this.address={
      value: inputs.address,
      required:false,
      regEx:regex.dateTime,
    };

    this.cityId={
      value: inputs.cityId,
      required:true,
      regEx:regex.int,
    };

    this.countryId={
      value: inputs.countryId,
      required:false,
      regEx:regex.int
    }
  }
}
