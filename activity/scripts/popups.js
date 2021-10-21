const popups = {
    createPopup: (type) => {
        $(".popupContainer").append(`
            <div class="popup">
                <div class="minimize" onclick="view.closePopupContainer()">
                    <div class="inside"></div><img src="icons/X.png">
                </div>
            </div>
        `);

        if (type == "complete") {
            $(".popup").append(`
                <p class="mainMsg">Veux-tu publier ta publication ou bien le sauvegarder comme brouillon ?</p>
                <button onclick="saveDraft()" id="draftButton" class="wideBtn">
                    <div class="inside"></div>
                    <p>Enregistrer le brouillon</p>
                </button>
                <button onclick="publishPost()" id="publishButton" class="wideBtn">
                    <div class="inside"></div>
                    <p class="confirm">Publie</p>
                </button>
            `);
        } else if (type == "draft") {
            $(".popup").append(`
                <p class="mainMsg">Es-tu sûr·e d'enregistrer cette publication en tant que brouillon ?</p>
                <button onclick="discardPost()" id="draftButton" class="wideBtn">
                    <div class="inside"></div>
                    <p>Annule</p>
                </button>
                <button onclick="saveDraft()" id="publishButton" class="wideBtn">
                    <div class="inside"></div>
                    <p>Enregistrer le brouillon</p>
                </button>
            `);
        } else if (type == "edit") {
            $(".popup").append(`
                <p class="mainMsg">Veux-tu sauvegarder ta publication ou bien continuer à la modifier ?</p>
                <button onclick="view.closePopupContainer()" id="draftButton" class="wideBtn">
                    <div class="inside"></div>
                    <p>Modifie</p>
                </button>
                <button onclick="updatePost('draft')" id="publishButton" class="wideBtn">
                    <div class="inside"></div>
                    <p>Enregistrer</p>
                </button>
            `);
        } else if (type == "publishDraft") {
            $(".popup").append(`
                <p class="mainMsg">Es-tu sûr·e de vouloir publier ton brouillon ?</p>
                <button onclick="deletePost()" id="draftButton" class="wideBtn">
                    <div class="inside"></div>
                    <p>Supprime</p>
                </button>
                <button onclick="updatePost('moderation')" id="publishButton" class="wideBtn">
                    <div class="inside"></div>
                    <p class="confirm">Publie</p>
                </button>
            `);
        } else if (type == "discard") {
            $(".popup").append(`
                <p class="mainMsg">Veux-tu annuler ta publication ou bien la supprimer ?</p>
                <button onclick="deletePost()" id="draftButton" class="wideBtn">
                    <div class="inside"></div>
                    <p>Supprime</p>
                </button>
                <button onclick="discardPost()" id="publishButton" class="wideBtn">
                    <div class="inside"></div>
                    <p>Annule</p>
                </button>
            `);
        } else if (type == "approve") {
            $(".popup").append(`
                <p class="mainMsg">Évaluez le travail de l'étudiant·e </p>
                <button onclick="changeStatus('rejected')" id="draftButton" class="wideBtn">
                    <div class="inside"></div>
                    <p>Rejeté</p>
                </button>
                <button onclick="changeStatus('published')" id="publishButton" class="wideBtn">
                    <div class="inside"></div>
                    <p>Acquis</p>
                </button>
            `);
        }

        $(".popupContainer").css({"opacity": 1, "pointer-events": "all"});
    }
}