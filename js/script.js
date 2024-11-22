const gridContainer = document.querySelector(".grid-container");

// https://carontestudio.com/blog/como-capturar-parametros-url-javascript/
const fetchDog = async (numImages) => {
  try {
    // Obtener el parámetro de la URL para la raza
    const url = new URLSearchParams(window.location.search);
    let raza = url.get("razas");
    const inputElem = document.querySelector("input");

    let apiUrl;
    let imageUrls = [];

    // Si hay una raza, obtenemos las imágenes solo de esa raza
    if (raza) {
      raza = raza.toLowerCase();
      // Si no hay raza, obtenemos imágenes aleatoria de todas las raza (posibilidad de que de error)
      apiUrl = `https://dog.ceo/api/breed/${raza}/images/random/${numImages}`; // Resulta que la api tiene para devolver un número de imagenes concreto
      const response = await fetch(apiUrl);
      const data = await response.json();
      imageUrls = data.message;
    } else {
      // Lo primero es el localStorage, luego lo demás si este no existe
      const imagenesGuardadas = localStorage.getItem("perroImagenesLocal");
      if (imagenesGuardadas) {
        imageUrls = JSON.parse(imagenesGuardadas);
      } else {
        apiUrl = `https://dog.ceo/api/breeds/image/random/${numImages}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        imageUrls = data.message;
        // Guardamos las imágenes en el localStorage para consultar aquí y no saturar a la api
        localStorage.setItem("perroImagenesLocal", JSON.stringify(imageUrls));
      }
    }

    inputElem.addEventListener("input", (event) => {
      autocomplete(event);
    });

    return imageUrls; // Retorna las URLs de las imágenes
  } catch (error) {
    console.error("Error al conectar:", error);
  }
};

const generarPerroCards = async (numeroCards) => {
  const imageUrls = await fetchDog(numeroCards);

  // Parámetros para crear la card
  imageUrls.forEach((imageUrl) => {
    const card = crearPerroCards(imageUrl, extraerRaza(imageUrl));
    gridContainer.appendChild(card);
  });
};

// Generar 9 tarjetas al cargar la página (realmente se pueden generar más pero tampoco quiero saturar la página)
generarPerroCards(9); // ni con 1000 se ralentiza

const crearPerroCards = (imageUrl, name) => {
  const card = document.createElement("div");
  card.classList.add("card");

  // Ya se puede filtrar dando clic en la card
  const link = document.createElement("a");
  const razaPrincipal = name.toLowerCase().split(" ")[0];
  link.href = `?razas=${razaPrincipal}`;

  link.classList.add("card-link");

  link.innerHTML = `
    <img src="${imageUrl}" alt="Avatar" style="width:100%">
    <div class="container">
      <h4><b>${name}</b></h4>
    </div>
  `;

  card.appendChild(link);

  return card;
};

function extraerRaza(url) {
  const partesURL = url.split("/");
  const parteRaza = partesURL[partesURL.indexOf("breeds") + 1]; // Obtenemos solo el segmento después de breeds
  const razaPrincipal = parteRaza.split("-")[0];

  return razaPrincipal.charAt(0).toUpperCase() + razaPrincipal.slice(1);
}

const fetchSoloRazas = async () => {
  try {
    const response = await fetch("https://dog.ceo/api/breeds/list/all"); // Usado para el autocomplete
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Object.keys(data.message);
  } catch (error) {
    console.error("Error al conectar:", error);
    return [];
  }
};

const cargarOpciones = async () => {
  const breeds = await fetchSoloRazas(); // Obtiene todas las razas para el datalist
  const elementoDatalist = document.getElementById("razas-datalist");
  elementoDatalist.innerHTML = "";

  // Crea y añade las opciones al datalist
  breeds.forEach((breed) => {
    const option = document.createElement("option");
    option.value = breed.charAt(0).toUpperCase() + breed.slice(1);
    elementoDatalist.appendChild(option);
  });
};

document.addEventListener("DOMContentLoaded", cargarOpciones);

// localStorage.clear(); // Se queda para pruebas
