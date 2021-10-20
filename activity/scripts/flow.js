let data, userData, queryData = [];
let categories, posts   = [];
let loading = false, editing = false;
let post                = { categories: [], longitude: -1, latitude: -1, title: "",  description: "", images: [], mapLink: undefined, activityId: undefined };
let currUid             = "1";
let postStage           = -1;
let filesToAdd          = [];
let myPostsActive       = false;
let categoriesStates    = [];
let postCount           = 0;
let postOpen            = -1;
let mod                 = parser.isMod();
let postImageNames = [], imagesToRemove = [];
let activityId;

const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const dataInit = async (pid) => {
    userData = await network.getUserPosts(currUid);
    data = await network.getPosts();
    data = data.data.data; userData = userData.data.data;

    let publishedData = [];
    let underModeration = [];
    for (let i = data.length - 1; i >= 0; i--) {

        if (data[i].status === "published") {
            publishedData.push(data[i]);

            
        } else if (data[i].status === "moderation") {
            underModeration.push(data[i]);
            if (data[i].post.activityId === activityId){
                view.disableApproveBtn();
            }
        }
    }
    
    if (pid) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].pid === pid) {
                data = [data[i]];

                if (mod) view.setupModView();
                for (let i = 0; i < data.length; i++)       { data[i].imageNames        = data[i].post.images;      }
                for (let i = 0; i < userData.length; i++)   { userData[i].imageNames    = userData[i].post.images;  }
                return;
            }
        }
    }

    if (!mod) {
        data = publishedData;
    } else {
        data = underModeration;
        view.setupModView();
    }

    for (let i = 0; i < data.length; i++)       { data[i].imageNames        = data[i].post.images;      }
    for (let i = 0; i < userData.length; i++)   { userData[i].imageNames    = userData[i].post.images;  }
}

const onLoad = async (isMod, uid, pid, actvtId) => {
    mod     = isMod;
    currUid = uid;
    activityId = actvtId;
    await dataInit(pid);
    
    network.getNewToken();
    await addPosts("all");

    for (let i = 0; i < categories.length; i++) {
        view.addCategory(i, categories[i]);
        categoriesStates.push(false);
    }
    
    await handleInitialEvents();

    view.scrollToMiddle("#categories");
    await timeout(100);
    view.toggleLoader();
}

const handleInitialEvents = async () => {
    $(".popupContainer").click(function (e) {
        if (e.target !== this) return;
        view.closePopupContainer()
    });
    $("#search").keyup(function(event) {
        if (event.key === "Enter") {
            document.getElementById("searchBtn").click();
        }
    });
    $('#postsView').on('scroll', async function(e) {
        if($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight && postOpen == -1) {
            let length = myPostsActive === true ? userData.length : data.length;
            if (queryData.length > 0) {
                length = queryData.length;
            }

            if ($(".stage").length == 0 && $(".post").length > 0 && !loading && postCount < length) {
                loading = true;
                $("#postsView").append(`
                    <div class="stage">
                        <div class="dot-bricks"></div>
                    </div>`
                );

                await addPosts(myPostsActive ? "user" : "all");
                loading = false;
                $(".stage").remove();
            }
        }
    });
}

const resetPosts = async () => {
    posts       = []; queryData = [];
    postCount   = 0;
    $(".post").remove();
}

const addPosts = async (type) => {
    let dat     = type === "user" ? userData : data;
    if (queryData.length > 0) dat = queryData;
    let length  = 10;
    
    for (let p = postCount; p < postCount + length; p++) {
        if (dat[p] === undefined) break;
        posts[p]        = dat[p].post;
        posts[p].date   = dat[p].date.substring(dat[p].date.indexOf(" ") + 1);               // cut weekday from date
        let images      = await network.getImages(dat[p].pid, dat[p].imageNames, "small");
        posts[p].images = images;
    }

    for (let i = postCount; i < posts.length; i++) {
        view.addPost(i, posts[i].title, posts[i].date, posts[i].categories, posts[i].description, posts[i].images[0], dat[i].status);
        view.makePostAppear(i);
    }

    postCount = $(".post").length;
}

const toggleCategory = async (index) => {
    let dat = myPostsActive ? userData : data;
    view.toggleCategory(index, categoriesStates[index]);
    categoriesStates[index] = !categoriesStates[index];
    postCount = 0; postOpen = -1; queryData = [];

    let queries = [], matches = [];
    for (let i = 0; i < categoriesStates.length; i++) {
        if (categoriesStates[i] === true) {
            queries.push(categories[i]);
        }
    }
    view.hidePosts();
    setTimeout(async () => {
        resetPosts();
        for (let i = 0; i < matches.length; i++) {
            queryData.push(dat[matches[i]]);
        }

        if (queryData.length > 0)
            await addPosts(myPostsActive ? "user" : "all");
    }, 500);

    if (!categoriesStates.includes(true)) {
        for (let i = 0; i < dat.length; i++) { matches[i] = i;}
        return;
    }
    for (let q = 0; q < queries.length; q++) {
        for (let p = 0; p < dat.length; p++) {
            let regexp = new RegExp(`${queries[q]}`, "i");
            
            for (let c = 0; c < dat[p].post.categories.length; c++) {
                if (regexp.test(dat[p].post.categories[c]) && !matches.includes(p)) {
                    matches.push(p);
                    continue;
                }
            }
        }
    }
}

const login = async () => {
    let id = $("#id").val();

    if (id === "" || !network.idExists(id)) {
        // warning
        view.toggleLoader();
        return;
    }

    if ($("#token").val() === await network.getNewToken(id)) {
        
    }

    view.toggleLoader();
}

const addPost = async (dir) => {
    if (postStage == -1) {
        await postView.firstSetup();
        resetPosts();
    }
    else {
        await postView.closeStage(postStage);
    }

    postStage += dir;
    $("#currentStage").text(postStage + 1);

    switch (postStage) {
        case 0:
            await postHandlers.handleTitle();
            break;
        case 1:
            await postHandlers.handleCategories();
            break;
        case 2:
            await postHandlers.handleMap();
            break;
        case 3:
            await postHandlers.handleDescription();
            break;
        case 4:
            await postHandlers.handleImages();
            break;
        case 5:
            await postHandlers.handleFinalView();
            break;
        default:
            break;
    }
}

const changeStatus = async (status) => {
    data[postOpen].post.images = data[postOpen].imageNames;
    await network.changeStatus(data[postOpen].uid, data[postOpen].pid, data[postOpen].post, data[postOpen].imageNames, status);
    await postView.postComplete(status === "published" ? "Ce post a été accepté" : "Ce post a été rejeté");
    closePost(postOpen);
    view.hidePosts(postOpen);
    data.splice(postOpen, 1);
}

const publishPost = async () => {
    post.activityId = activityId;
    await network.createPost(post, filesToAdd, 'moderation');
    await postView.postComplete("Ta publication est envoyée à l'approbation.");
    await discardPost();
}

const saveDraft = async () => {
    post.activityId = activityId;
    await network.createPost(post, filesToAdd, 'draft');
    await postView.postComplete("Ton brouillon a été enregistré");
    await discardPost();
}

const updatePost = async (status) => {
    await network.updatePost(userData[postOpen].pid, post, filesToAdd, imagesToRemove, status);
    let msg;
    if (status === "draft" || status === "rejected") msg = "Ton brouillon a été enregistré";
    else                                             msg = "Ta publication est envoyée à l'approbation.";
    await postView.postComplete(msg);
    await discardPost();
}

const deletePost = async () => {
    imagesToRemove = userData[postOpen].imageNames;
    await network.deletePost(userData[postOpen].pid, imagesToRemove);
    await postView.postComplete("Ton brouillon a été supprimé.");
    await discardPost();
}

const discardPost = async () => {
    $("#addBtn").attr("onclick", "addPost(1)");
    $("#postsView").css("overflow", "auto");
    postView.enableDraftBtn();
    view.closePopupContainer();
    await postView.discardPost();
    location.reload();
}

const openImage = async (i, imgIndex) => {
    let dat = myPostsActive ? userData : data;
    let pid = dat[i].pid;
    view.openLoading();
    let images  = await network.getImages(pid, dat[i].imageNames, "standard");
    view.openImage(images, imgIndex);
}

const postHandlers = {
    handleTitle:  async () => {
        postView.disableBtn("left");
        let titleInput = await postView.setupTitleView(post.title);
    
        titleInput.on('input', function() {
            if (parser.isTitleCorrect($(this).val())) {
                postView.enableBtn("right");
                post.title = $(this).val();
                postView.enableDraftBtn();
            } else {
                postView.disableBtn("right");
                postView.disableDraftBtn();
            }
        });

        if (parser.isTitleCorrect(post.title)) {
            postView.enableDraftBtn();
        }
    },
    addCategory : async (i) => {
        post.categories.push(categories[i]);
        if (post.categories.length > 0) {
            postView.disablePlusIcons();
        }
        postView.addCategory(i);
    },
    removeCategory : async (i) => {
        post.categories.splice(post.categories.indexOf(categories[i]), 1);
        if (post.categories.length < 1) {
            postView.enablePlusIcons();
        }
        postView.removeCategory(i);
    },
    handleCategories : async() => {
        postView.enableBtn("left");
        await postView.setupCategoryView(post.categories);
    },
    handleMap: async () => {
        $(".categoriesInPost").children().each(function() {
            post.categories.push($(this).find("p").text());
        });

        let mapInput = await postView.setupMapView();
        mapInput.on("input", async function() {
            if (parser.isURLValid($(this).val())) {
                postView.enableBtn("right");

                post.mapLink    = $(this).val();
                let mapCoords   = parser.getCoords(post.mapLink);
                let mapEmbed    = parser.getMapLink(mapCoords.longitude, mapCoords.latitude);
                post.longitude  = mapCoords.longitude;
                post.latitude   = mapCoords.latitude;
                await postView.addPostMap(mapEmbed);
            } else {
                post.mapLink    = undefined;
                postView.disableBtn("right");
                await postView.removePostMap();
            }
        });

        if (post.mapLink !== undefined) {
            mapInput.val(post.mapLink);
            let mapCoords = parser.getCoords(post.mapLink);
            let mapEmbed  = parser.getMapLink(mapCoords.longitude, mapCoords.latitude);
            await postView.addPostMap(mapEmbed);
            postView.enableBtn("right");
        }
    },
    handleDescription: async () => {
        let description = await postView.setupDescriptionView(post.description, 600);
        
        description.on("input", async function() {
            $("#charCount").text($(this).val().length);

            if (parser.isDescriptionCorrect($(this).val())) {
                postView.enableBtn("right");
                post.description = $(this).val();
            } else {
                postView.disableBtn("right");
            }
        });
    },
    handleImages: async () => {
        if (post.images.length == 6) return;
        let downloadInput = await postView.setupImageView(post.images);
        if (postOpen != -1 && editing && userData) {
            if (userData[postOpen].imageNames.length > 0) {
                postImageNames = userData[postOpen].imageNames;
            }
        }

        downloadInput.on({      // Drag and drop images.
            'dragover dragenter': function (e) {
                e.preventDefault();
                e.stopPropagation();
            },
            'drop': async function (e) {
                let dataTransfer = e.originalEvent.dataTransfer;

                if (dataTransfer && dataTransfer.files.length) {
                    e.preventDefault();
                    e.stopPropagation();
                    let files = dataTransfer.files;
                    if(files[0] === undefined) { return; }
                    for (let i = 0; i < files.length; i++) {
                        if (!files[i].type.includes("image")) { files = []; break; }
                    }
                    
                    addImage(files);
                }
            }
        });
    },
    handleFinalView : async () => {
        let mapEmbed  = parser.getMapLink(post.longitude, post.latitude);
        await postView.setupPreview(post, mapEmbed);
    }
}

const addImage = async (dragFiles) => {
    if (post.images.length == 6) return;
    let basedat;

    let input   = document.getElementById("downloadInput");
    let files   = input.files;
    if (dragFiles !== undefined) files = dragFiles;

    if(files[0] === undefined) { return; }

    for (let i = 0; i < files.length; i++) {
        if (!files[i].type.includes("image")) continue;

        let fr  = new FileReader();
        basedat = await (new Promise((resolve)=>{
            fr.readAsDataURL(files[i]);
            fr.onloadend = () => { resolve(fr.result); }
        }));

        post.images.push(basedat);
        filesToAdd.push(files[i]);
        postView.addImage(filesToAdd.length - 1, basedat, "new");
    }

    if (post.images.length > 0) postView.enableBtn("right");
    else postView.disableBtn("right");
}

const removeImage = async (i, type) => {
    if (type == "new") {
        post.images.splice(($(".existing").length - 1) + i, 1);
        filesToAdd.splice(i, 1);
    } else if (postImageNames[i] !== undefined) {
        post.images.splice(i, 1);
        imagesToRemove.push(postImageNames[i]);
        postImageNames.splice(i, 1);
    }

    postView.removeImage(i, type);
    if (post.images.length > 0) postView.enableBtn("right");
    else                        postView.disableBtn("right");
}

const openPost = async (i) => {
    let mapSrc = parser.getMapLink(posts[i].longitude, posts[i].latitude);
    if (userData.length > 0) {
        if (userData[i].status === "draft" || userData[i].status === "rejected" && myPostsActive) {
            view.enableEditButton("editPost()");
        }
    }
    await view.openPost(i, posts[i].categories, posts[i].images, mapSrc, posts[i].mapLink);
    if (mod) view.enableApproveBtn();
}

const closePost = async (i) => {
    view.disableEditButton();
    view.closePost(i, posts[i].categories);
    if (mod) view.disableApproveBtn();
}

const editPost = async () => {
    editing = true;
    post    = posts[postOpen];
    await addPost(1);
    resetPosts();
}

const toggleMyPosts = async () => {
    queryData = [];
    $("#postsView").css("overflow", "auto"); postOpen = 1;
    if (!myPostsActive) {
        $("#postButton p").text("Toutes les publications");
        await view.closePostsView();
        view.disableCategories();
        resetPosts();
        await addPosts("user");
        await view.openPostsView();
    } else {
        $("#postButton p").text("Mes publications");
        await view.closePostsView();
        view.enableCategories();
        resetPosts();
        await addPosts("all");
        await view.openPostsView();
    }

    postOpen = -1;
    myPostsActive = !myPostsActive;
}

const search = async () => {
    let query = $("#search").val();
    let matches = [];
    let dat = myPostsActive ? userData : data;
    postCount = 0; postOpen = -1; queryData = [];

    view.hidePosts();
    setTimeout(async () => {
        resetPosts();
        $("#postsView").scrollTop(0).css("overflow", "auto");
        for (let i = 0; i < matches.length; i++) {
            queryData.push(dat[matches[i]]);
        }
        if (queryData.length > 0)
            await addPosts(myPostsActive ? "user" : "all");
    }, 500);

    for (let i = 0; i < dat.length; i++) {
        let regexp = new RegExp(`${query}`, "i");
        if (regexp.test(dat[i].post.title)) {
            matches.push(i);
            continue;
        } else if (regexp.test(dat[i].post.description)) {
            matches.push(i);
            continue;
        } else {
            for (let c = 0; c < dat[i].post.categories.length; c++) {
                if (regexp.test(dat[i].post.categories[c])) {
                    matches.push(i);
                    continue;
                }
            }
        }
    }
}

// $(onLoad());