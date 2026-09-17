# Visor 3D Interactivo con Información de Objetos
**Proyecto:** Simulación Educativa del Sistema Solar  
**Desarrolladores:** Victoria Angélica Galarza Pérez, Fernando José Alexander Cruz Castro  

---

### 1. Descripción del Proyecto
Este proyecto consiste en un visor 3D interactivo desarrollado con Three.js que simula una sección de nuestro Sistema Solar. Su objetivo es permitir a usuarios o estudiantes explorar cuerpos celestes, activar o pausar animaciones, modificar parámetros de luz y consultar información científica al seleccionar cada objeto.

---

### 2. Cuestionario de Evaluación del Proyecto

**¿Qué tema representa tu visor 3D?**  
Representa una **simulación educativa del Sistema Solar** enfocada en la astronomía y la exploración espacial.

**¿Qué objetos agregaste a la escena?**  
* **Sol:** Esfera central emisora de luz (`SphereGeometry`).
* **Tierra:** Esfera en órbita con material de albedo terrestre (`SphereGeometry`).
* **Saturno:** Esfera representativa de un gigante gaseoso (`SphereGeometry`).
* **Anillos de Saturno:** Anillo tridimensional alrededor del planeta (`TorusGeometry`).
* **Órbita Especial:** Cubo metálico que simula una zona de monitoreo sintética (`BoxGeometry`).
* **Satélite Artificial:** Sonda espacial cargada desde un archivo tridimensional externo.

**¿Qué información aparece cuando seleccionas un objeto?**  
Al hacer clic sobre cualquier cuerpo tridimensional, el panel desplegable muestra:
* **Nombre del objeto:** Identificador principal (ej. *Tierra*, *Saturno*).
* **Tipo de objeto:** Clasificación astronómica o técnica (ej. *Planeta Rocoso*, *Gigante Gaseoso*, *Modelo 3D Externo*).
* **Descripción:** Resumen con las características físicas e históricas principales del elemento.
* **Dato Adicional:** Datos cuantitativos relevantes como temperaturas, distancias o períodos orbitales cargados dinámicamente desde un archivo `data.json`.

**¿Cómo implementaste el raycasting?**  
Se configuró una instancia de `THREE.Raycaster()` que captura la posición bidimensional del cursor (`mouse.x`, `mouse.y`) convertida a coordenadas normalizadas NDC (de -1 a +1). Al registrar el evento `click` o `mousemove`, el raycaster proyecta un rayo invisible desde la cámara en esa dirección calculando la intersección con los objetos almacenados en el arreglo `selectableObjects`. Si existe una colisión (`intersects.length > 0`), extrae el objeto para actualizar la interfaz.

**¿Qué controles agregaste para modificar la escena?**  
* **Botón de Animación:** Detiene o reanuda la rotación y traslación orbital de los planetas.
* **Botón de Cámara:** Reinicia la posición y la vista del visor a la coordenada inicial.
* **Botón de Visibilidad:** Muestra u oculta el modelo del satélite en la escena.
* **Botón de Color:** Cambia aleatoriamente el color del material de los anillos de Saturno.
* **Control Deslizante (Range):** Ajusta la intensidad de la luz puntual que emite el Sol.

**¿Qué modelo .glb o .gltf utilizaste?**  
Se integró una sonda/satélite espacial de exploración en formato **`.glb`** cargado mediante la librería oficial `GLTFLoader`.

**¿Qué parte del proyecto fue la más difícil?**  
La gestión de los eventos de **Raycasting e intersección de subobjetos en el modelo cargado**: al importar un modelo `.glb`, este se compone de múltiples nodos hijos (*meshes* agregadas), por lo que fue necesario recorrer su jerarquía con el método `.traverse()` para asignar los nombres adecuados a cada sub-malla e incluirlas en el arreglo de objetos seleccionables sin romper el comportamiento de la interfaz visual.

**¿Cómo podrías mejorar este visor si lo conectaras después con PHP, FlightPHP y SQLite?**  
* **Persistencia de Datos en SQLite:** Almacenar los datos astronómicos en una base de datos real para gestionar planetas, lunas y misiones espaciales mediante tablas relacionales.
* **API RESTful con FlightPHP:** Crear un *backend* ligero que sirva como API (por ejemplo, endpoints como `GET /api/planetas` o `GET /api/planeta/:id`) para responder la información en formato JSON hacia el archivo `main.js` mediante peticiones `fetch()`.
* **Panel de Administración en PHP:** Desarrollar un módulo CRUD administrativo donde un profesor o usuario pueda agregar nuevos cuerpos celestes, actualizar descripciones o cambiar parámetros en la base de datos de SQLite en tiempo real sin necesidad de tocar el código de Three.js.