export function bindMultipleEventListener(element, eventNames, callback) {
  eventNames.forEach((eventName) => {
    element.addEventListener(eventName, callback);
  });
}
