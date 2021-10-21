const parser = {
    getVideoLink          : (longitude, latitude, lang) => {
        if (longitude == undefined || latitude == undefined) {
            return "";
        }

        let language = lang === undefined ? "us" : lang;
        return `https://maps.google.com/maps?q=${longitude},${latitude}&hl=${language}&output=embed`;
    },
    getCoords           : (link) => {
        let substring   = link.substring(link.lastIndexOf("@") + 1, link.lastIndexOf(","));
        let coords      = substring.split(",");
        coords          = { longitude: parseFloat(coords[0]), latitude: parseFloat(coords[1]) };

        return coords;
    },
    isTitleCorrect      : (title) => {
        return !title.includes("   ") && title.length > 5 && title.length <= 50;
    },
    isDescriptionCorrect: (description) => {
        return description.length <= 600 && description.length >= 200;
    },
    isURLValid          : (string) => {
        if (string.includes("<iframe src=") && string.includes(`width="640" height="480" allow="autoplay"></iframe>`)) return true;
        else return false;
    },
    getCorrectFontSize  : (length) => {
        let fontSize = 50 / length * 2.2;
        if (fontSize > 4.44) fontSize = 4.44;
        return fontSize;
    },
    isMod               : () => {
        let url = new URL(document.location.href);
        let isMod = url.searchParams.get("isMod");
        return isMod == "a01acc7c015" ? true : false;
    },
    getParams           : (param) => {
        let url = new URL(document.location.href);
        let uid = url.searchParams.get(param);
        return uid;
    }
}