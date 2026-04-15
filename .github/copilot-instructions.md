# Copilot workspace instructions

## Proyecto
Este repositorio es una aplicación SAPUI5 / Fiori construida con UI5 Tooling y SAP Fiori tools.
La aplicación está pensada para ejecutarse dentro de SAP Fiori Launchpad, por lo que las rutas y bindings deben ser compatibles con ese entorno.

## Estructura clave
- `webapp/Component.js` — componente principal de la app.
- `webapp/manifest.json` — descriptor de la aplicación y modelos.
- `webapp/view/` — vistas XML principales.
- `webapp/controller/` — controladores asociados a las vistas.
- `webapp/fragments/` — fragmentos reutilizables.
- `webapp/i18n/i18n.properties` — textos traducibles.
- `webapp/model/` — modelos y datos locales / mock.
- `webapp/test/` — entornos de sandbox y pruebas locales.

## Comandos importantes
Utilizar siempre los scripts ya definidos en `package.json`:
- `npm start` — arranca la app en sandbox FLP.
- `npm run start-local` — arranca con `ui5-local.yaml` y mock server.
- `npm run start-noflp` — arranca la app sin FLP.
- `npm run build` — construye la aplicación.
- `npm run deploy` — verifica la configuración de despliegue.

## Principios de modificación
- Priorizar cambios en `manifest.json` en lugar de `index.html` cuando se trata de configuración de la app.
- Mantener la separación de responsabilidades: lógica en controladores, UI en vistas XML, fragmentos para partes reutilizables.
- Respetar los IDs y las convenciones de nomenclatura SAPUI5 existentes.
- Usar `i18n.properties` para textos visibles al usuario.
- Evitar modificaciones innecesarias a `webapp/index.html` y `webapp/index_mig.html`.
- Documentar claramente todos los cambios: dejar el código modificado como comentado, con fecha y hora de la modificación.

## Buenas prácticas SAPUI5
- Crear controles y bindings declarativos en XML siempre que sea posible.
- Usar `manifest.json` para definir modelos, rutas, targets y navegación.
- Trabajar con modelos JSON y `this.getView().getModel()` en controladores.
- Usar `formatter`s desde `webapp/model` si se necesita formateo de datos.
- Para nuevos diálogos o popovers, usar fragmentos XML y `sap.ui.xmlfragment`.

## Qué evitar
- No generar código JS inline dentro de las vistas XML.
- No mezclar demasiada lógica de negocio en los controladores de vista.
- No añadir dependencias externas sin verificar compatibilidad con SAPUI5.
- No modificar rutas o configuraciones de build sin confirmar el impacto en `ui5.yaml` y `ui5-local.yaml`.

## Uso del agente
Cuando el usuario pide ayuda con este repositorio:
- Identificar primero si el cambio es de UI, navegación, modelo o configuración build/deploy.
- Buscar en `package.json`, `manifest.json` y las vistas/fragmentos relevantes.
- Sugerir y aplicar cambios alineados con SAPUI5 y Fiori tools.
- Si se necesita más contexto, pedir aclaración antes de reestructurar la app.
