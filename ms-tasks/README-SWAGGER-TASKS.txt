==========================================================================
   MANUAL DE USUARIO Y PRUEBAS: MS-TASKS + SWAGGER UI
==========================================================================
Este microservicio cuenta con documentación interactiva bajo el estándar 
OpenAPI 3.0. Siga estos pasos para iniciar, documentar y probar.

1. INICIO RÁPIDO (SETUP)
------------------------
Si es la primera vez que descarga el proyecto:
1. Instale dependencias: 'npm install'
2. Levante la DB: 'docker-compose up -d'
3. Sincronice tablas: 'npx prisma migrate dev --name init'
4. Inicie el servidor: 'npm run dev'

2. ACCESO A LA DOCUMENTACIÓN (SWAGGER)
--------------------------------------
Una vez el servidor esté corriendo, abra su navegador en:
URL: http://localhost:3001/api-docs

Verá una interfaz gráfica con la lista de todos los endpoints disponibles 
(POST, GET, PATCH, DELETE).

3. CÓMO REALIZAR PRUEBAS CON SWAGGER (PASO A PASO)
--------------------------------------------------

A) CREAR UNA TAREA (POST /tasks):
   1. Haga clic en el botón azul 'POST /tasks'.
   2. Haga clic en el botón 'Try it out' (arriba a la derecha del panel).
   3. En el cuadro 'Request body', edite el JSON. Ejemplo:
      {
        "name": "Tarea desde Swagger",
        "projectId": "PROY-99",
        "description": "Probando la interfaz interactiva"
      }
   4. Haga clic en el botón azul grande 'Execute'.
   5. Revise la respuesta en 'Server response'. Debería ver un código 201 
      y el ID generado por la base de datos.

B) CONSULTAR TAREAS (GET /tasks/project/{projectId}):
   1. Haga clic en 'GET /tasks/project/{projectId}'.
   2. Haga clic en 'Try it out'.
   3. Ingrese el ID del proyecto (ej: PROY-99) en el campo 'projectId'.
   4. Presione 'Execute'. Verá la lista de tareas asociadas en formato JSON.

C) ACTUALIZAR O ELIMINAR:
   - Siga la misma lógica: 'Try it out' -> Ingrese el ID de la tarea -> 'Execute'.

4. VENTAJAS DE USAR SWAGGER EN ESTE PROYECTO
--------------------------------------------
- No requiere Postman: Cualquier miembro del equipo puede probar la API 
  solo con tener el navegador.
- Documentación viva: Si se cambia un campo en el código, la página de 
  Swagger se actualiza automáticamente (siempre que se actualice el 
  archivo swagger.ts).
- Validación Visual: Permite ver qué campos son obligatorios y el tipo 
  de dato (String, Number, etc.) antes de enviar la petición.

5. SOLUCIÓN DE PROBLEMAS
------------------------
- Si la página no carga: Verifique que la consola diga "Swagger Docs: http://localhost:3001/api-docs".
- Error 500: Verifique que el contenedor de Docker esté encendido ('docker ps').
==========================================================================