

// Fonction pour empêcher la propagation de l'événement lors du chargement de la page
function stopPropagationOnLoad(event) {
    event.stopPropagation();
  }
  
  window.addEventListener('load', stopPropagationOnLoad);
  
  // Fonction pour fermer la modal
  function closeModal1() {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none'; // Masquer l'overlay
  
    const modal1 = document.getElementById('modal1');
    modal1.style.display = 'none';
  }
  
  // Gestion de l'événement click sur le bouton de fermeture de la modal
  const closeModalButton = document.querySelector('.modal-close');
  if (closeModalButton) {
    closeModalButton.addEventListener('click', closeModal1);
  }
  
  // Gestion de l'événement click sur l'overlay pour fermer la modal
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
    // Affichage ou masquage de la section "Mode édition"
    let modeEditionSection = document.querySelector(".mode-edition-section");
    if (modeEditionSection !== null) {
        modeEditionSection.style.display = isConnected ? "block" : "none";
    }
  
    // Affichage ou masquage du bouton pour ouvrir la fenêtre modale
    let openModalButton = document.getElementById("open-modal-button");
    if (openModalButton !== null) {
        openModalButton.style.display = isConnected ? "block" : "none";
    }
  }
  
  // Vérification de si l'utilisateur est connecté ou non
  let isUserConnected = localStorage.getItem("connected") === "true";
  let userToken = localStorage.getItem("token");
  console.log(userToken);
  console.log(`connected = ${isUserConnected}`);
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
  let works = []; // Tableau pour stocker les travaux
  let filterButtons = []; // Tableau pour stocker les boutons filtres
  let categoriesSet = new Set(); // Ensemble pour stocker les catégories uniques
  
  // Fonction pour ouvrir la fenêtre modale1
  function openModal1() {
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block'; // Afficher l'overlay
  
    const modal1 = document.getElementById('modal1');
    modal1.style.display = 'block';
  
    // Afficher les travaux dans la modal
    displayWorksInModal();
  }
  
  // Fonction pour afficher les travaux en miniature dans la galerie de la modal1
  function displayWorksInModal() {
    const modalGallery = document.getElementById('gallery-modal');
  
    // Supprimer les travaux existants dans la galerie de la modal
    modalGallery.innerHTML = '';
  
    // Parcourir la liste des travaux et afficher les miniatures dans la galerie
    let row = document.createElement('div');
    row.classList.add('modal1-gallery'); // Ajouter une classe pour la gestion de la mise en page
  
    works.forEach((work, index) => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const deleteIcon = document.createElement('i');
  
        img.src = work.imageUrl;
        img.alt = work.title;
  
        deleteIcon.classList.add('far', 'fa-trash-alt', 'delete-icon');
        deleteIcon.addEventListener('click', (event) => {
            // Gérer la suppression du travail associé
            deleteWork(work, event);
        });
  
        figure.appendChild(img);
        figure.appendChild(deleteIcon);
        figure.dataset.id = work.id; // Ajouter l'ID du travail comme attribut de données
        row.appendChild(figure);
  
        // Afficher les travaux en ligne avec un retour à la ligne si nécessaire
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
  
            getElements(); // Mettre à jour les travaux dans les galeries
        } else {
            console.error('La suppression de l\'image a échoué.');
            // Afficher un message d'erreur à l'utilisateur
            alert('La suppression de l\'image a échoué. Veuillez réessayer.');
        }
    })
    .catch(error => {
        console.error('Une erreur s\'est produite lors de la suppression de l\'image :', error);
        // Afficher un message d'erreur à l'utilisateur
        alert('Une erreur s\'est produite lors de la suppression de l\'image. Veuillez réessayer.');
    });
  }
  
 
  // Fonction pour activer un bouton et désactiver les autres
  function activateButton(clickedButton) {
    filterButtons.forEach(button => {
        if (button === clickedButton) {
            button.classList.add('active'); // Ajouter la classe active au bouton cliqué
        } else {
            button.classList.remove('active'); // Supprimer la classe active des autres boutons
        }
    });
  }
  
  // Fonction pour afficher les travaux
  function displayWorks(filteredWorks = works) {
    console.log("Travaux à afficher :", filteredWorks); // Vérification des travaux à afficher dans la console
    workContainer.innerHTML = ''; // Supprimer les travaux existants
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
    allButton.classList.add('active'); // Ajouter la classe active au bouton "Tous"
    allButton.addEventListener('click', () => {
        displayWorks(); // Afficher tous les travaux
        activateButton(allButton); // Activer le bouton "Tous"
    });
    filterButtons.push(allButton);
    filterButtonsContainer.appendChild(allButton);
  
    // Créer les boutons de filtres pour chaque catégorie
    categoriesSet.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.addEventListener('click', () => {
            // Filtrer les travaux en fonction de la catégorie sélectionnée
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
        works = await worksResponse.json(); // Stockage des travaux récupérés dans le tableau works
        console.log("Travaux récupérés :", works); // Vérification des travaux récupérés dans la console
  
        // Récupérer les catégories de travaux depuis l'API
        const categoriesResponse = await fetch('http://localhost:5678/api/categories');
        const categories = await categoriesResponse.json(); // Stockage des catégories récupérées dans le tableau categories
        console.log("Catégories récupérées :", categories); // Vérification des catégories récupérées dans la console
  
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
    event.preventDefault(); // Empêcher le comportement par défaut du formulaire
  
    const modal2 = document.getElementById('modal2');
    modal2.style.display = 'block';
  }
  
  // Sélectionner l'élément input de type fichier à l'intérieur du conteneur .file-input-container
  const fileInput = document.querySelector(".file-input-container > input");
  
  // Ajouter un écouteur d'événements 'change' pour détecter quand l'utilisateur sélectionne un fichier
  fileInput.addEventListener("change", (e) => {
  // Vérifier si un fichier a été sélectionné
  if (e.target.files && e.target.files[0]) {
    // Sélectionner le conteneur de l'input fichier et le cacher après la sélection d'un fichier
    const fileInputContainer = document.querySelector(".file-input-container");
    fileInputContainer.style.display = "none";
  
    // Sélectionner le conteneur destiné à afficher l'image chargée et le rendre visible
    const imgLoadedContainer = document.querySelector(".img-loaded-container");
    imgLoadedContainer.style.display = "block";
  
    // Créer une URL temporaire pour le fichier sélectionné
    const imgURL = URL.createObjectURL(e.target.files[0]);
  
    // Sélectionner l'élément img dans lequel afficher l'image chargée et définir son attribut src à l'URL créée
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
        const categories = await response.json(); // Convertir la réponse en JSON
        console.log("Catégories récupérées :", categories); // Vérification dans la console
  
        // Sélectionner l'élément select pour les catégories dans la modal2
        const selectElement = document.getElementById('categorie');
        // Réinitialiser le contenu du select pour éviter les doublons en cas de rappel de la fonction
        selectElement.innerHTML = '';
  
        // Créer une option vide avec seulement le chevron vers le bas
        const defaultOption = document.createElement('option');
        defaultOption.disabled = true; // Désactiver l'option pour qu'elle ne soit pas sélectionnable
        defaultOption.selected = true; // Sélectionner l'option par défaut
        defaultOption.hidden = true; // Cacher l'option pour qu'elle n'apparaisse pas dans la liste
        defaultOption.textContent = ''; // Laisser le texte vide
        defaultOption.value = ''; // Laisser la valeur vide
        selectElement.appendChild(defaultOption);
  
        // Créer une option pour chaque catégorie et l'ajouter au select
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id; // Valeur de l'option est l'ID de la catégorie
            option.textContent = category.name; // Texte de l'option est le nom de la catégorie
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
        fetchAndDisplayCategories(); // Appeler la fonction pour récupérer et afficher les catégories
    });
  }
  
  // Appeler la fonction pour récupérer et afficher les catégories au chargement de la page
  fetchAndDisplayCategories();
  
  // Fonction pour rafraîchir la galerie dans la modal1
  async function refreshModalGallery() {
    try {
        // Récupérer à nouveau les travaux depuis l'API
        const worksResponse = await fetch('http://localhost:5678/api/works');
        const updatedWorks = await worksResponse.json(); // Stockage des travaux récupérés dans le tableau updatedWorks
  
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
    titreInput.value = ''; // Réinitialiser la valeur du champ "Titre"
    categorieSelect.selectedIndex = 0; // Sélectionner la première option du champ "Catégorie"
  }
  
  // Gérer l'événement click sur le bouton "Valider" dans la modal2
  const modal2Button = document.getElementById('modal2-button');
  if (modal2Button) {
    modal2Button.addEventListener('click', async function(event) {
        event.preventDefault(); // Empêcher le comportement par défaut du bouton (soumission du formulaire)
    
        // Collecter les données du formulaire
        const fileInput = document.getElementById('file-input');
        const titreInput = document.getElementById('titre');
        const categorieSelect = document.getElementById('categorie');
    
        // Créer un objet représentant le nouveau travail
        const newWork = {
            imageUrl: '', // Remplacez par l'URL de l'image une fois qu'elle est téléchargée
            title: titreInput.value,
            categoryId: categorieSelect.value
        };
    
        // Créer un objet FormData pour envoyer les données au serveur
        const formData = new FormData();
        formData.append('image', fileInput.files[0]); // Ajouter le fichier image
        formData.append('title', newWork.title); // Ajouter le titre du travail
        formData.append('category', newWork.categoryId); // Ajouter l'ID de la catégorie
    
        try {
            // Effectuer une requête POST à l'API pour ajouter le nouveau travail
            const response = await fetch('http://localhost:5678/api/works', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${userToken}` // Ajouter le token d'authentification si nécessaire
                }
            });
    
            if (response.ok) {
                
  
                 // Après avoir ajouté avec succès le nouveau travail, mettre à jour les galeries
                await updateGalleries();
  
                // Réinitialiser les champs de saisie après l'ajout réussi
                resetInputFields();
  
                 // Afficher le message de succès
             const successMessage = document.getElementById('success-message');
             successMessage.textContent = "Nouveau travail ajouté avec succès !";
              successMessage.style.display = 'block';
  
               // Masquer le message après quelques secondes 
            setTimeout(function() {
            successMessage.style.display = 'none';
            }, 3000);
  
                // Vider le contenu de la modal2 après l'envoi réussi du nouveau travail
                resetModalContent();
   
                // Mettre à jour les travaux dans la galerie principale
                refreshModalGallery();
  
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
    // Réinitialiser le formulaire
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
    // Sélectionner les champs de saisie
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
            modal2Button.style.backgroundColor = '#1D6154'; // Fond vert si tous les champs sont remplis
        } else {
            modal2Button.style.backgroundColor = 'gray'; // Fond gris si au moins un champ est vide
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
        const updatedWorks = await worksResponse.json(); // Stockage des travaux récupérés dans le tableau updatedWorks
  
        // Mettre à jour la galerie principale
        displayWorks(updatedWorks);
  
        // Mettre à jour la galerie dans la modal1
        displayWorksInModal(updatedWorks);

         // Ajout de la console pour vérifier les travaux
         console.log('Travaux mis à jour dans la galerie modal1 :', updatedWorks);
    } catch (error) {
        console.error('Une erreur s\'est produite lors de la mise à jour des galeries :', error);
    }
  }
  
  // Gestion de l'événement click sur la flèche retour pour revenir à modal1 et cacher modal2
  const backToModal1Button = document.getElementById('back-to-modal1');
  if (backToModal1Button) {
    backToModal1Button.addEventListener('click', () => {
        const modal1 = document.getElementById('modal1');
        const modal2 = document.getElementById('modal2');
  
        // Masquer modal2
        modal2.style.display = 'none';
  
        // Afficher modal1
        modal1.style.display = 'block';
    });
  }
  
  
  // Fonction pour fermer la modal2 et la modal1
  function closeModal2() {
    const modal2 = document.getElementById('modal2');
    modal2.style.display = 'none';
    console.log('Modal2 fermée');
  
    const modal1 = document.getElementById('modal1');
    modal1.style.display = 'none';
    console.log('Modal1 fermée');
  
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'none'; // Masquer l'overlay
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
  
  