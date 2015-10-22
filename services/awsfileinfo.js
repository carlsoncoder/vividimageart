'use strict';

function AWSFileInfo(key, url, lastModified) {
    this.key = key;
    this.url = url;
    this.lastModified = Date.parse(lastModified);

    this.thumbnailUrl = '';
    this.thumbnailHeight = '';
    this.thumbnailWidth = '';

    this.name = '';
    this.paintingName = '';
    this.mediaType = '';
    this.mediaSize = '';
    this.price = '';
    this.category = '';
    this.height = '';
    this.width = '';
}

AWSFileInfo.prototype.setMetadata = function(metadata) {
    // NOTE:  All metadata properties come from AWS in complete lowercase...even if you save it as "paintingName", it comes back as "paintingname"
    this.name = metadata.filename;
    this.paintingName = metadata.paintingname;
    this.mediaType = metadata.mediatype;
    this.mediaSize = metadata.mediasize;
    this.price = metadata.price;
    this.category = metadata.category;
    this.height = metadata.height;
    this.width = metadata.width;
};

module.exports = AWSFileInfo;