function stopPropagationOnLoad(event) {
  event.stopPropagation();
}
window.addEventListener('load', stopPropagationOnLoad);

// Fonction pour fermer la modal
function closeModal1() {
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'none';

  const modal1 = document.getElementById('modal1');
  modal1.style.display = 'none';
}

// Gestion de l'événement click sur le bouton de fermeture de la modal et sur l'overlay 
const closeModalButton = document.querySelector('.modal-close');
if (closeModalButton) {
  closeModalButton.addEventListener('click', closeModal1);
}

const overlay = document.getElementById('overlay');
if (overlay) {
  overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
          closeModal1();
      }
  });
}

// Fonction pour gérer l'affichage des éléments en fonction de l'état de connexion de l'utilisateur
function handleUserConnection(isConnected) {
  let modeEditionSection = document.querySelector(".mode-edition-section");
  if (modeEditionSection !== null) {
      modeEditionSection.style.display = isConnected ? "block" : "none";
  }

  let openModalButton = document.getElementById("open-modal-button");
  if (openModalButton !== null) {
      openModalButton.style.display = isConnected ? "block" : "none";
  }
}

// Vérification de si l'utilisateur est connecté ou non
let isUserConnected = localStorage.getItem("connected") === "true";
let userToken = localStorage.getItem("token");
if (isUserConnected) {
  let loginButton = document.getElementById("login-button");
  document.getElementById("filtres").style.display = "none";
  loginButton.innerText = "Logout";
  loginButton.href = "#";
  loginButton.addEventListener("click", () => {
      localStorage.removeItem("connected");
      localStorage.removeItem("token");
      location.reload();
  });

console.log('Utilisateur connecté :', isUserConnected);
console.log('Token de l\'utilisateur :', userToken);

  // Affichage de la section "Mode édition" et du bouton pour ouvrir la fenêtre modale
  handleUserConnection(true);

  // Gestion de l'événement click sur le bouton pour ouvrir la fenêtre modale
  let openModalButton = document.getElementById("open-modal-button");
  if (openModalButton !== null) {
      openModalButton.addEventListener("click", openModal1);
  }
} else { 
  // Masquage de la section "Mode édition" et du bouton pour ouvrir la fenêtre modale
  handleUserConnection(false);
}

// Déclaration des variables globales
const workContainer = document.getElementById("gallery");
const filterButtonsContainer = document.getElementById("filtres");
let works = []; 
let filterButtons = []; 
let categoriesSet = new Set(); 

// Fonction pour ouvrir la fenêtre modale1
function openModal1() {
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'block'; 

  const modal1 = document.getElementById('modal1');
  modal1.style.display = 'block';

  displayWorksInModal();
}

// Fonction pour afficher les travaux en miniature dans la galerie de la modal1
function displayWorksInModal(updatedWorks) {
  const modalGallery = document.getElementById('gallery-modal');

  // Supprimer les travaux existants dans la galerie de la modal
  modalGallery.innerHTML = '';

  // Parcourir la liste des travaux et afficher les miniatures dans la galerie
  let row = document.createElement('div');
  row.classList.add('modal1-gallery'); 

  works = updatedWorks ? updatedWorks : works;

  works.forEach((work) => {
      const figure = document.createElement('figure');
      const img = document.createElement('img');
      const deleteIcon = document.createElement('i');

      img.src = work.imageUrl;
      img.alt = work.title;

      deleteIcon.classList.add('far', 'fa-trash-alt', 'delete-icon');
      deleteIcon.addEventListener('click', (event) => {
          deleteWork(work, event);
      });

      figure.appendChild(img);
      figure.appendChild(deleteIcon);
      figure.dataset.id = work.id; 
      row.appendChild(figure);

      modalGallery.appendChild(row);
  });
}

// Fonction pour gérer la suppression d'un travail
function deleteWork(work, event) {
  event.stopPropagation();

  const imageId = work.id;

  fetch(`http://localhost:5678/api/works/${imageId}`, {
      method: 'DELETE',
      headers: {
          'Authorization': `Bearer ${userToken}`
      }
  })
  .then(response => {
      if (response.ok) {
          const modalGallery = document.getElementById('gallery-modal');
          const figureToDelete = modalGallery.querySelector(`[data-id="${work.id}"]`);
          if (figureToDelete) {
              figureToDelete.remove();
          }

          const mainGallery = document.getElementById('gallery');
          const mainFigureToDelete = mainGallery.querySelector(`[data-id="${work.id}"]`);
          if (mainFigureToDelete) {
              mainFigureToDelete.remove();
          }

          getElements(); 
      } else {
          console.error('La suppression de l\'image a échoué.');

          alert('La suppression de l\'image a échoué. Veuillez réessayer.');
      }
  })
  .catch(error => {
      console.error('Une erreur s\'est produite lors de la suppression de l\'image :', error);
     
      alert('Une erreur s\'est produite lors de la suppression de l\'image. Veuillez réessayer.');
  });
}

// Fonction pour activer un bouton et désactiver les autres
function activateButton(clickedButton) {
  filterButtons.forEach(button => {
      if (button === clickedButton) {
          button.classList.add('active'); 
      } else {
          button.classList.remove('active'); 
      }
  });
}

// Fonction pour afficher les travaux
function displayWorks(filteredWorks = works) {
  workContainer.innerHTML = ''; 
  filteredWorks.forEach(project => {
      const figure = document.createElement('figure');
      const img = document.createElement('img');
      const figcaption = document.createElement('figcaption');

      img.src = project.imageUrl;
      img.alt = project.title;
      figcaption.textContent = project.title;

      figure.appendChild(img);
      figure.appendChild(figcaption);
      workContainer.appendChild(figure);
  });
}

// Fonction pour créer les boutons de filtres
function createFilterButtons() {
  // Créer le bouton "Tous"
  const allButton = document.createElement('button');
  allButton.textContent = 'Tous';
  allButton.classList.add('active'); 
  allButton.addEventListener('click', () => {
      displayWorks(); 
      activateButton(allButton); 
  });
  filterButtons.push(allButton);
  filterButtonsContainer.appendChild(allButton);

  // Créer les boutons de filtres pour chaque catégorie
  categoriesSet.forEach(category => {
      const button = document.createElement('button');
      button.textContent = category;
      button.addEventListener('click', () => {
          const filteredWorks = works.filter(work => work.category.name === category);
          displayWorks(filteredWorks);

          // Activer le bouton cliqué et désactiver les autres
          activateButton(button);
      });
      filterButtons.push(button);
      filterButtonsContainer.appendChild(button);
  });
} 

// Fonction pour récupérer les éléments au chargement de la page
async function getElements() {
  try {
      // Récupérer les travaux depuis l'API
      const worksResponse = await fetch('http://localhost:5678/api/works');
      works = await worksResponse.json(); 
      console.log('Travaux récupérés :', works);

      // Récupérer les catégories de travaux depuis l'API
      const categoriesResponse = await fetch('http://localhost:5678/api/categories');
      const categories = await categoriesResponse.json(); 
      console.log('Catégories de filtres récupérées :', categories);

      // Ajouter les catégories à l'ensemble categoriesSet
      categories.forEach(category => {
          categoriesSet.add(category.name);
      });

      // Créer les boutons de filtres
      createFilterButtons(); 

      // Afficher les travaux par défaut
      displayWorks(); 
  } catch (error) {
      console.error('Une erreur s\'est produite :', error);
  }
}

// Appel de la fonction pour récupérer les éléments au chargement de la page
document.addEventListener('DOMContentLoaded', getElements);

// Gestion de l'événement submit sur le formulaire pour ajouter une photo
const addPhotoForm = document.getElementById('add-project-form-modal');
if (addPhotoForm) {
  addPhotoForm.addEventListener('submit', openModal2);
}

// Fonction pour ouvrir la modal2
function openModal2(event) {
  event.preventDefault(); 

  const modal2 = document.getElementById('modal2');
  modal2.style.display = 'block';
}

// Sélectionner l'élément input de type fichier à l'intérieur du conteneur .file-input-container
const fileInput = document.querySelector(".file-input-container > input");

// Ajouter un écouteur d'événements 'change' pour détecter quand l'utilisateur sélectionne un fichier
fileInput.addEventListener("change", (e) => {
if (e.target.files && e.target.files[0]) {
  const fileInputContainer = document.querySelector(".file-input-container");
  fileInputContainer.style.display = "none";

  const imgLoadedContainer = document.querySelector(".img-loaded-container");
  imgLoadedContainer.style.display = "block";

  const imgURL = URL.createObjectURL(e.target.files[0]);

  const imgLoaded = document.querySelector(".img-loaded");
  imgLoaded.src = imgURL;
}
});

const addWorkForm = document.querySelector(".addWorkForm");
addWorkForm.addEventListener("submit", (e) => {
e.preventDefault();
// Sélectionner le conteneur de l'input fichier et l'afficher
const fileInputContainer = document.querySelector(".file-input-container");
fileInputContainer.style.display = "block";

// Sélectionner le conteneur destiné à afficher l'image chargée et le rendre invisible
const imgLoadedContainer = document.querySelector(".img-loaded-container");
imgLoadedContainer.style.display = "none";
e.target.reset();
});

// Fonction pour récupérer et afficher les catégories dans le menu déroulant de la modal2
async function fetchAndDisplayCategories() {
  try {
      // Récupérer les catégories depuis l'API
      const response = await fetch('http://localhost:5678/api/categories');
      const categories = await response.json(); 

      // Sélectionner l'élément select pour les catégories dans la modal2
      const selectElement = document.getElementById('categorie');

      selectElement.innerHTML = '';

      // Créer une option vide avec seulement le chevron vers le bas
      const defaultOption = document.createElement('option');
      defaultOption.disabled = true; 
      defaultOption.selected = true; 
      defaultOption.hidden = true; 
      defaultOption.textContent = ''; 
      defaultOption.value = ''; 
      selectElement.appendChild(defaultOption);

      // Créer une option pour chaque catégorie et l'ajouter au select
      categories.forEach(category => {
          const option = document.createElement('option');
          option.value = category.id; 
          option.textContent = category.name; 
          selectElement.appendChild(option);
      });
  } catch (error) {
      console.error('Une erreur s\'est produite lors de la récupération des catégories :', error);
  }
}

// Gérer l'événement click sur la section catégorie dans modal2 pour afficher les catégories
const categorieSection = document.getElementById('section-categorie');
if (categorieSection) {
  categorieSection.addEventListener('click', function() {
      fetchAndDisplayCategories(); 
  });
}

// Appeler la fonction pour récupérer et afficher les catégories au chargement de la page
fetchAndDisplayCategories();

// Fonction pour rafraîchir la galerie dans la modal1
async function refreshModalGallery() {
  try {
      // Récupérer à nouveau les travaux depuis l'API
      const worksResponse = await fetch('http://localhost:5678/api/works');
      const updatedWorks = await worksResponse.json(); 

      // Afficher les travaux dans la galerie présente dans la modal1
      displayWorksInModal(updatedWorks);
  } catch (error) {
      console.error('Une erreur s\'est produite lors du rafraîchissement de la galerie dans la modal1 :', error);
  }
}

// Fonction pour réinitialiser les champs de saisie
function resetInputFields() {
  const titreInput = document.getElementById('titre');
  const categorieSelect = document.getElementById('categorie');
  titreInput.value = ''; 
  categorieSelect.selectedIndex = 0; 
}

function resetSubmitButton() {
  const modal2Button = document.getElementById('modal2-button');
  modal2Button.disabled = false;
  modal2Button.style.backgroundColor = 'gray';
}


// Gérer l'événement click sur le bouton "Valider" dans la modal2
const modal2Button = document.getElementById('modal2-button');
if (modal2Button) {
  modal2Button.addEventListener('click', async function(event) {
      event.preventDefault(); 
  
      // Collecter les données du formulaire
      const fileInput = document.getElementById('file-input');
      const titreInput = document.getElementById('titre');
      const categorieSelect = document.getElementById('categorie');
  
      // Créer un objet représentant le nouveau travail
      const newWork = {
          imageUrl: '', 
          title: titreInput.value,
          categoryId: categorieSelect.value
      };
  
      // Créer un objet FormData pour envoyer les données au serveur
      const formData = new FormData();
      formData.append('image', fileInput.files[0]); 
      formData.append('title', newWork.title); 
      formData.append('category', newWork.categoryId); 
  
      try {
          // Effectuer une requête POST à l'API pour ajouter le nouveau travail
          const response = await fetch('http://localhost:5678/api/works', {
              method: 'POST',
              body: formData,
              headers: {
                  'Authorization': `Bearer ${userToken}` 
              }
          });
  
          if (response.ok) {
              
               // Après avoir ajouté avec succès le nouveau travail, mettre à jour les galeries
              await updateGalleries();

              // Réinitialiser les champs de saisie après l'ajout réussi
              resetInputFields();

           const successMessage = document.getElementById('success-message');
           successMessage.textContent = "Nouveau travail ajouté avec succès !";
            successMessage.style.display = 'block';

          setTimeout(function() {
          successMessage.style.display = 'none';
          }, 3000);

              resetModalContent();
 
              refreshModalGallery();

              resetSubmitButton();

          } else {
              console.error('Échec de l\'ajout du nouveau travail.');
          }
      } catch (error) {
          console.error('Une erreur s\'est produite lors de l\'ajout du nouveau travail :', error);
      }
  });
}

// Fonction pour réinitialiser le contenu de la modal
function resetModalContent() {
  const addWorkForm = document.querySelector(".addWorkForm");
  addWorkForm.reset();

  // Masquer l'image chargée
  const imgLoadedContainer = document.querySelector(".img-loaded-container");
  imgLoadedContainer.style.display = "none";

  // Afficher à nouveau le champ de sélection de fichier
  const fileInputContainer = document.querySelector(".file-input-container");
  fileInputContainer.style.display = "block";

  // Effacer l'image chargée
  const imgLoaded = document.querySelector(".img-loaded");
  imgLoaded.src = "";
}

// Fonction pour vérifier si tous les champs sont remplis
function checkAllFieldsFilled() {
  const titreInput = document.getElementById('titre');
  const categorieSelect = document.getElementById('categorie');
  const fileInput = document.getElementById('file-input');

  // Vérifier si les champs sont remplis
  const titreFilled = titreInput.value.trim() !== '';
  const categorieFilled = categorieSelect.value !== '';
  const fileFilled = fileInput.files.length > 0;

  // Retourner true si tous les champs sont remplis, sinon false
  return titreFilled && categorieFilled && fileFilled;
}

// Fonction pour activer ou désactiver le bouton "Valider" en fonction du résultat de la vérification
function toggleSubmitButton() {
  const modal2Button = document.getElementById('modal2-button');
  const allFieldsFilled = checkAllFieldsFilled();

  if (modal2Button) {
      modal2Button.disabled = !allFieldsFilled;

      // Changer la couleur de fond du bouton en fonction de son état
      if (allFieldsFilled) {
          modal2Button.style.backgroundColor = '#1D6154'; 
      } else {
          modal2Button.style.backgroundColor = 'gray'; 
      }
  }
}

// Gérer l'événement "input" pour surveiller les changements dans les champs de saisie
const inputFields = document.querySelectorAll('#titre, #categorie, #file-input');
inputFields.forEach(input => {
  input.addEventListener('input', toggleSubmitButton);
});

// Fonction pour mettre à jour les deux galeries après l'ajout réussi d'un nouveau travail
async function updateGalleries() {
  try {
      // Récupérer à nouveau les travaux depuis l'API
      const worksResponse = await fetch('http://localhost:5678/api/works');
      const updatedWorks = await worksResponse.json(); 

      displayWorks(updatedWorks);
      displayWorksInModal(updatedWorks);

  } catch (error) {
      console.error('Une erreur s\'est produite lors de la mise à jour des galeries :', error);
  }
}

// Gestion de l'événement click sur la flèche retour pour revenir à modal1 
const backToModal1Button = document.getElementById('back-to-modal1');
if (backToModal1Button) {
  backToModal1Button.addEventListener('click', () => {
      const modal1 = document.getElementById('modal1');
      const modal2 = document.getElementById('modal2');

      // Masquer modal2 et Afficher modal1
      modal2.style.display = 'none';
      modal1.style.display = 'block';
  });
}

// Fonction pour fermer la modal2 et la modal1
function closeModal2() {
  const modal2 = document.getElementById('modal2');
  modal2.style.display = 'none';

  const modal1 = document.getElementById('modal1');
  modal1.style.display = 'none';

  const overlay = document.getElementById('overlay');
  overlay.style.display = 'none'; 
}

// Gestion de l'événement click sur le bouton de fermeture de la modal2
const closeModalButtonModal2 = document.querySelector('.modal2-close');
if (closeModalButtonModal2) {
  closeModalButtonModal2.addEventListener('click', closeModal2);
}

// Gestion de l'événement click sur l'overlay pour fermer la modal2
const overlayModal2 = document.getElementById('overlay');
if (overlay) {
  overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
          closeModal2();
      }
  });
}

// Sélectionner le bouton "+ Ajouter photo"
const addPhotoButton = document.getElementById('modal2-photo-add-button');

addPhotoButton.addEventListener('click', function() {
  fileInput.click(); 
});

// Ajouter un écouteur d'événements 'change' à l'élément input de type fichier
fileInput.addEventListener('change', function(e) {
  if (e.target.files && e.target.files[0]) {
      const imgLoaded = document.querySelector(".img-loaded");
      imgLoaded.src = URL.createObjectURL(e.target.files[0]);

      // Afficher le conteneur d'image
      const imgLoadedContainer = document.querySelector(".img-loaded-container");
      imgLoadedContainer.style.display = "block";

      // Masquer le conteneur de l'input fichier
      const fileInputContainer = document.querySelector(".file-input-container");
      fileInputContainer.style.display = "none";
  }
});

