export default function bindMultipleEventListener(element, eventNames, f) {
  eventNames.forEach((eventName) => {
    element.addEventListener(eventName, f);
  });
}

/**
 * TODO: Tratar de agregar aquí la función registerMouseListeners.
 * TODO: Modificar el html para que el usuario ingrese la probabilidad de vivir de cada celda.
 */
