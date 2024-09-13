type ChangeFunction = (object: any, name: string | symbol, old: any, value: any) => void;

class Util {
  public static proxify(object: any, change: ChangeFunction) {
    // If object is already a proxy
    if (object && object.__proxy) {
      return object;
    }
  
    const proxy = new Proxy(object, {
      get(object, name) {
        if (name === '__proxy__') {
          return true;
        }
        return object[name];
      },
      set(object, name, value) {
        const old = object[name];
        if (value && typeof value === 'object') {
          value = Util.proxify(value, change);
        }
        object[name] = value;
        change(object, name, old, value);
        return true;
      }
    });
  
    for (const property in object) {
      // eslint-disable-next-line no-prototype-builtins
      if (object.hasOwnProperty(property) && object[property] && typeof object[property] === 'object') {
        object[property] = Util.proxify(object[property], change);
      }
    }
  
    return proxy;
  }

  public static getFormattedDate(date: Date): string {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  }
}

export default Util;
