const view      = {
    loaderOpen  : true,
    currPopupImg: 0,
    maxSize     : {width: 900, height: 684},
    window      : {width: 0, height: 0},
    offset      : -1,

    toggleLoader    : () => {
        view.loaderOpen = !view.loaderOpen;

        if (view.loaderOpen)    $("#loadingScreen").show();
        else                    $("#loadingScreen").hide();
    },
    makeMap         : (src, parent) => {
        $(parent).append(`<div class="mapCrop"><iframe class="map" src="${src}"></iframe></div>`);
    },
    addCategory     : (index, text) => {
        $("#categories").append(`
        <button id="c_${index}" class="category insetShadow" onclick="toggleCategory(${index})">
            <p>#${text}</p><div class="inside"></div>
        </button>`);
    },
    addPost         : (index, title, date, categories, description, images, videoLink, status) => {
        if (title === "") title = "N/A";
        if (categories.length === 0) categories = ["N/A"];
        if (description === "") description = "No description added";

        let msg = "";
        if (status === "draft") msg = "Brouillon";
        else if (status === "rejected") msg = "Rejeté";
        else if (status === "moderation") msg = "En cours d'examen";

        $("#postsView").append(`
        <div id="p_${index}" class="post ${status} openedPost">
            <div class="imgMapView">
                <div class="imageView"></div>
                <div class="mapContainer"><div class="mapCrop">${videoLink}</div></div>
            </div>
            <div class="content">
                <p class="title">${title}</p>
                <div class="spanDiv openCategories"></div>
                <span class="date">${date}</span>
                <p class="statusText">${msg}</p>
                <p class="description">${description}</p>
            </div>
        </div>`);
        $(`#p_${index} .mapContainer`).click(() => { openVideo(videoLink); });

        for (let i = 0; i < categories.length; i++) {
            $(`#p_${index} .spanDiv`).append(`<span class="card">${categories[i]}</span>`);
        }

        if (categories.length === 0) categories = ["N/A"];
        let titleFontSize = parser.getCorrectFontSize($(`#p_${index} .title`).text().length);
        $(`#p_${index} .title`).css({"font-size": `${titleFontSize}vh`});

        if (description === "No description added") {
            $(`#p_${index} .description`).addClass("openedDraftDescription");
        } else {
            $(`#p_${index} .description`).addClass("openedDescription");
        }

        if (images.length > 0 && videoLink === undefined) $(`#p_${index} .mapContainer`).remove();
        else if (images.length === 0 && videoLink === undefined) {
            $(`#p_${index} .mapCrop`).empty();
            $(`#p_${index} .mapCrop`).append(`<div><p>N/A</p></div>`);
            $(`#p_${index} .mapContainer`).css("pointer-events", "none");
        }

        if (images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                $(`#p_${index} .imageView`).append(`
                <div id="img_${i}" onclick="openImage(${index}, ${i})" class="image smooth"><img src="${images[i]}"></div>`);

                $(`#p_${index} .imageView`).append(`<div id="circle_${i}"" class="circle"></div>`);
                if (i != 0) {
                    $(`#p_${index} #img_${i}`).css({"pointer-events": "none", "opacity": "0"});
                    $(`#p_${index} #circle_${i}`).addClass("deactivated");
                }
            }

            if (videoLink === undefined) {
                $(`#p_${index} .imageView`).addClass("bigImgView");
            }
        } else {
            if (videoLink !== undefined) {
                $(`#p_${index} .mapContainer`).addClass("bigMapView");
                $(`#p_${index} .imageView`).remove();
            }

            $(`#p_${index} .imageView`).append(`
            <div id="img_${0}" onclick="openImage(${index}, 0)" class="image">
                <div><p>N/A</p></div>
            </div>`);

            $(`#p_${index} .imageView`).children().css("pointer-events", "none");
        }
    },

    openLoading     : async () => {
        $(".popup").hide();

        $(".popupContainer").append(`
            <div class="stage">
                <div class="dot-bricks"></div>
            </div>
        `);
        $(".popupContainer").css({"opacity": 1, "pointer-events": "all"});
        $(".popupContainer").addClass("loading");
    },

    openVideo       : async (video) => {
        $(".popupContainer").append(`
            <div class="card imagePopup" style="display: none">
                ${video}
            </div>
        `);

        $(".imagePopup iframe").attr("id", "popupVideo");

        document.getElementById("popupVideo").onload = async () => {
            $(".popupContainer .stage").remove(); await timeout(50);
            $(".popupContainer").removeClass("loading");
            $("#popupVideo").parent().show();
        }
    },

    openImage       : async (images, imgIndex) => {
        $(".popupContainer").empty(); await timeout(50);
        $(".popupContainer").removeClass("loading");
        
        $(".popupContainer").append(`
            <img class="bigArrow" id="rightBigArrow" onclick="view.scrollPopupImages(1)" src="icons/bigArrow.png">
            <img class="bigArrow" id="leftBigArrow"  onclick="view.scrollPopupImages(-1)" src="icons/bigArrow.png">
        `);
        
        for (let i = 0; i < images.length; i++) {
            $(".popupContainer").append(`
                <div class="card imagePopup" id="bigImg_${i}">
                    <img src="${images[i]}">
                </div>
            `);
        }

        $(".imagePopup").each(function(i) {
            $(this).css("pointer-events", "none");
            
            if (i < imgIndex) {
                $(this).addClass("left");
            } else if (i > imgIndex) {
                $(this).addClass("right");
            } else {
                $(this).css({opacity: 0});
            }
        })
        view.currPopupImg = imgIndex; await timeout(50);
        $(`#bigImg_${imgIndex}`).css("opacity", 1);
    },

    scrollImages        : async (postIndex) => {
        if ($(`#p_${postIndex} .circle`).length === 0) {
            return;
        }

        let post = $(`p_${postIndex}`);
        let imgIndex = 0;

        $(`#p_${postIndex} .circle`).each(function(i) {
            if (!$(this).hasClass("deactivated")) {
                imgIndex = i + 1;
            }
        });

        if (imgIndex === $(`#p_${postIndex} .circle`).length) imgIndex = 0;

        $(`#p_${postIndex} .circle`).addClass("deactivated");
        $(`#p_${postIndex} #circle_${imgIndex}`).removeClass("deactivated");

        $(`#p_${postIndex} .image`).css({"pointer-events": "none", "opacity": "0"});
        $(`#p_${postIndex} #img_${imgIndex}`).css({"pointer-events": "all", "opacity": "1"});
    },

    scrollPopupImages    : async (dir) => {
        let oldImgIndex = view.currPopupImg;
        if (oldImgIndex + dir < 0 || oldImgIndex + dir == $(".imagePopup").length) return;
        view.currPopupImg += dir;

        if (dir > 0) {
            $(`#bigImg_${oldImgIndex}`).addClass("left");
            $(`#bigImg_${view.currPopupImg}`).removeClass("right");
        } else {
            $(`#bigImg_${oldImgIndex}`).addClass("right");
            $(`#bigImg_${view.currPopupImg}`).removeClass("left");
        }
    },

    closePopupContainer      : async () => {
        $(".popupContainer").css({"opacity": 0, "pointer-events": "none"}); await timeout(100);
        $(".popupContainer").empty();
        view.currPopupImg = 0;
    },

    openPost        : async (index, categories, images, videoLink) => {
        postOpen = index;
        if (categories.length === 0) categories = ["N/A"];
        $(`#p_${index}`).attr("onclick", "");
        
        let marginTop   = parseFloat($(`#p_${index}`).css("margin-top"));
        let postHeight  = parseFloat($(`#p_${index}`).height());
        let scrollPos   = postHeight * index;
        scrollPos += index * marginTop;

        $(`#p_${index} .picture`).css("height", $(`#p_${index} .picture`).height());
        $("#postsView").css("overflow", "hidden");
        $(`#p_${index}`).addClass("openedPost");
        if ($(`#p_${index}`).index() != 0) {
            $("#postsView").animate({scrollTop: scrollPos}, 500);
        }
        let titleFontSize = parser.getCorrectFontSize($(`#p_${index} .title`).text().length);
        $(`#p_${index} .title`).animate({"font-size": `${titleFontSize}vh`}, 500);

        if ($(`#p_${index} .description`).text() == "No description added") {
            $(`#p_${index} .description`).addClass("openedDraftDescription");
        } else {
            $(`#p_${index} .description`).addClass("openedDescription");
        }
        $(`#p_${index} .description`).css("opacity", 0);
        $(`#p_${index} .statusText`).css("opacity", 0);
        await timeout(300);
        $(`#p_${index} .description`).before(`
            <div class="imgMapView">
                <img onclick="view.scrollPhoto(-1)" class="leftImgBtn"    src="icons/thin_arrow.svg">
                <div class="imageView"></div>
                <img onclick="view.scrollPhoto(1)" class="rightImgBtn"   src="icons/thin_arrow.svg">
                <div class="mapContainer"><div class="mapCrop">${videoLink}</div></div>
            </div>
        `);
        $(".mapContainer").click(() => { openVideo(videoLink); });
        if (images.length === 0 && videoLink === undefined) $(".mapContainer").remove();
        else {
            if (videoLink === undefined) $(".mapContainer").remove();
            if (images.length === 0) {
                $(".leftImgBtn").remove();
                $(".rightImgBtn").remove();
                $(".imageView").remove();
            }
        }

        $(`#p_${index} .date`).clone().prependTo(`#p_${index}`);
        $(`#p_${index} .spanDiv`).empty();
        $(`#p_${index} .date`).addClass("openedDate");

        $(`#p_${index} .spanDiv`).addClass("openCategories");
        for (let i = 0; i < categories.length; i++) {
            $(`#p_${index} .spanDiv`).append(`<span class="card">${categories[i]}</span>`);
        }

        if (images.length != 0) {
            $(`#p_${index} .imageView`).append(`<div id="img_${0}" onclick="openImage(${index}, 0)" class="image"><img src="${images[0]}"></div>`);
        } else {
            $(`#p_${index} .imageView`).append(`<div id="img_${0}" onclick="openImage(${index}, 0)" class="image">
                <div><p>N/A<p></div>
            </div>`);
        }
        await timeout(700);
        $(`#p_${index} .description`).css("opacity", 1);
        $(`#p_${index} .statusText`).css("opacity", 1);

        if (images.length != 0) {
            view.offset = parseFloat($(`#img_${0}`).css("width")) / window.innerHeight * 100;

            for (let i = 1; i < images.length; i++) {
                $(`#p_${index} .imageView`).append(`<div id="img_${i}" onclick="openImage(${index}, ${i})" class="image"><img src="${images[i]}"></div>`);
                $(`#img_${i}`).css("left", `${view.offset * i}vh`);
            }
        }

        await timeout(100);
        $(".image").addClass("smooth");
        $(`#p_${index}`).append(`<div class="minimize" onclick="closePost(${index})">
            <div class="inside"></div><img src="icons/minimize.png">
        </div>`);
        await timeout(100);
        $(".minimize").css("opacity", 1);
    },
    hidePosts       : async (i) => {
        if (i !== undefined) {
            setTimeout(() => {
                $(`#p_${i}`).remove();
            }, 500);
            $(`#p_${i}`).css({transform: "scale(0)", opacity: 0, height: 0, margin: 0});
            return;
        }
        $(`.post`).css({transform: "scale(0)", opacity: 0});
    },
    makePostAppear  : async (i) => {
        $(`#p_${i}`).css({transform: "scale(0)", opacity: 0});
        await timeout(50);
        $(`#p_${i}`).css({transform: "scale(1)", opacity: 1});
    },
    toggleCategory  : (index, enable) => {
        $(`#c_${index}`).removeClass(enable ? "outsideShadow"   : "insetShadow");
        $(`#c_${index}`).addClass   (enable ? "insetShadow"     : "outsideShadow");
    },
    scrollToMiddle  : (elem) => {
        $(elem).scrollTop($(elem).width() / 2);
    },
    closePostsView  : async () => {
        $("#postsView").css( {marginTop: "50%", height: 0} );
        await timeout(500);
    },
    openPostsView   : async () => {
        $("#postsView").css( {marginTop: "3.1%", height: "100%"} );
        await timeout(500);
    },
    disableCategories   : async () => {
        $(".category").attr("disabled", true);
        $(".category").addClass("disabledCategory");
        $(".category p").animate({fontSize: "1.77vh"}, 200);
    },
    enableCategories    : async () => {
        $(".category").attr("disabled", false);
        $(".category").removeClass("disabledCategory");
        $(".category p").animate({fontSize: "1.55vh"}, 200);
    },

    disableApproveBtn   : async () => {
        $("#addBtn").attr("disabled", "true");
        $("#addBtn").addClass("disableApproveBtn");
    },

    enableApproveBtn    : async () => {
        $("#addBtn").removeAttr("disabled");
        $("#addBtn").removeClass("disableApproveBtn");
    },

    disableEditBtn   : async () => {
        $("#postButton").attr("disabled", "true");
        $("#postButton").addClass("disableEditBtn");
    },

    enableEditBtn    : async () => {
        $("#postButton").removeAttr("disabled");
        $("#postButton").removeClass("disableEditBtn");
    },

    enableEditButton: (func) => {
        $("#postButton p").text("Modifie");
        $("#postButton").attr("onclick", func);
    },

    setupModView        : async () => {
        $("#postButton").remove();
        $("#addBtn img").attr("src", "icons/checkmark.svg");
        $("#addBtn").attr("onclick", "popups.createPopup('approve')");
        view.disableApproveBtn();
    }
}