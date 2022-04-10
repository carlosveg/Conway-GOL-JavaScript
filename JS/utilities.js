export function bindMultipleEventListener(element, eventNames, callback) {
  eventNames.forEach((eventName) => {
    element.addEventListener(eventName, callback);
  });
}

/**
 * TODO: Tratar de agregar aquí la función registerMouseListeners.
 * TODO: Modificar el html para que el usuario ingrese la probabilidad de vivir de cada celda.
 */
