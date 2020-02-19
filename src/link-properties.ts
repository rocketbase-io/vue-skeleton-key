import { JwtBundle } from "@rocketbase/skeleton-key";

/**
 * Links all properties of the prototype of an instance to the properties of another.
 * Creates getters on the target parameter that trigger the respective actions on the source.
 * @internal
 * @param source The object to link to
 * @param target The object to create links to source on
 */
export function linkProperties(source: any, target: any) {
  Object.entries(Object.getOwnPropertyDescriptors(source.constructor.prototype)).forEach(([key, desc]) =>
    Object.defineProperty(target, key, {
      get() {
        if (desc.get) return (source as any)[key];
        if (desc.value) return desc.value.bind(source);
      }
    })
  );
  Object.defineProperty(target, "client", {
    get: () => source.client
  });
  Object.defineProperty(target, "jwtBundle", {
    get: () => source.jwtBundle,
    set: (val: JwtBundle) => (source.jwtBundle = val)
  });
}
