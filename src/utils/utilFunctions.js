// util.js
const getPublicIdFromUrl = (url) => {
    
    const urlParts = url.split('/');
    const filenameWithExtension = urlParts[urlParts.length - 2] + "/" + urlParts[urlParts.length - 1];
    console.log(filenameWithExtension)
    const [publicId, _] = filenameWithExtension.split(".");
    return publicId;
}

module.exports = { getPublicIdFromUrl };
