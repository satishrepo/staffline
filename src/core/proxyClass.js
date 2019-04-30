import DemoSchema from '../validations/demo/demoSchema';

const classes = {
  DemoSchema
};

class ProxyClass {
  constructor (className, opts) {
    return new classes[className](opts);
  }
}

export default ProxyClass;