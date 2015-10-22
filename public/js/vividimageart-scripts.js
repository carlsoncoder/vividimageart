var shouldLogToConsole = false;
var currentlySelectedSection = '';

var currentSlideShowIndex = -1;
var maxSlideShowIndex = -1;

// TODO: JUSTIN: We shouldn't hard code the image locations in an array (imageSelection local variable in vividimageart-scripts.js)- this should be dynamically determined
var imageSelection = [
    { url: 'https://s3.amazonaws.com/vividimageart/026eb40d-24f9-4fe4-844a-21444195cfb2__Blue Dragon.jpeg', width: 936, height: 720 },
    { url: 'https://s3.amazonaws.com/vividimageart/05f82988-e311-45cb-82f4-a68cdf1adb2c__Shark Racer.png', width: 1050, height: 825 },
    { url: 'https://s3.amazonaws.com/vividimageart/0c9788b3-5fa6-4ca3-9c17-0464be58b7c5__Off-World Astrolabe.png', width: 750, height: 600 },
    { url: 'https://s3.amazonaws.com/vividimageart/1d604a0c-fce1-4e66-a89b-bf8f0f8a1532__Alien Pets with Orb.png', width: 750, height: 600 },
    { url: 'https://s3.amazonaws.com/vividimageart/21ca58bb-5546-467a-aff4-428f75feae98__Captured Sphere.jpeg', width: 849, height: 1068 },
    { url: 'https://s3.amazonaws.com/vividimageart/280ad7d1-ee90-4023-a602-6a701840cfd3__The First Wave.jpeg', width: 936, height: 720 },
    { url: 'https://s3.amazonaws.com/vividimageart/450e49d1-0dd1-465b-879c-8a76e4aff217__Blue Planet Maker.jpeg', width: 1152, height: 1440 },
    { url: 'https://s3.amazonaws.com/vividimageart/58a112a5-573c-445c-a00b-e6e31cb48e3d__Red Dancer.jpeg', width: 631, height: 576 },
    { url: 'https://s3.amazonaws.com/vividimageart/64119e34-b4e0-4008-8a5a-52383aa3820d__Celestial Crocodile.jpeg', width: 1440, height: 1152 },
    { url: 'https://s3.amazonaws.com/vividimageart/6712aa53-d1f0-48de-a852-c8fed87e2cc2__Tangerine Nebula.jpeg', width: 720, height: 576 },
    { url: 'https://s3.amazonaws.com/vividimageart/684546d6-83a0-4eed-bf93-a552e89688e4__Plastic Quasar.png', width: 1500, height: 1200 },
    { url: 'https://s3.amazonaws.com/vividimageart/6ebf47f4-f9aa-4116-8978-fa5697afa98e__Graceful Dance.jpeg', width: 936, height: 720 },
    { url: 'https://s3.amazonaws.com/vividimageart/7077cd93-2606-4034-a4ba-90cbc5256fe1__Bluefish.jpeg', width: 576, height: 576 },
    { url: 'https://s3.amazonaws.com/vividimageart/73541c68-7b46-40d6-a8cc-01d11e9f0373__Flight of the Phoenix.jpeg', width: 1440, height: 1152 },
    { url: 'https://s3.amazonaws.com/vividimageart/7b5c6448-3e6b-4169-9bf5-5f9cc97aa4ae__The Last Wave.jpeg', width: 738, height: 638 },
    { url: 'https://s3.amazonaws.com/vividimageart/8fb053be-7438-4cb0-9234-589d8b7fd568__Space Shark.png', width: 1500, height: 1200 },
    { url: 'https://s3.amazonaws.com/vividimageart/90b0507c-3c80-416b-979c-aed4b7984117__Vulcan\'s Wave.jpeg', width: 698, height: 895 },
    { url: 'https://s3.amazonaws.com/vividimageart/afc95648-a33c-4ff8-89ed-441627e2ffe2__Helmet Galaxy.jpeg', width: 1440, height: 1152 },
    { url: 'https://s3.amazonaws.com/vividimageart/b73fbdff-dea4-4fcc-9ed7-138a5369c55e__Heart of Gold.png', width: 750, height: 600 },
    { url: 'https://s3.amazonaws.com/vividimageart/bbf8c545-86f4-4acd-aa71-c2eeb3968568__Feathering Escape.jpeg', width: 720, height: 576 },
    { url: 'https://s3.amazonaws.com/vividimageart/d4ae8bb8-71f1-4c87-809a-83d0f29c3526__Poseidon\'s Refuge.jpeg', width: 720, height: 576 },
    { url: 'https://s3.amazonaws.com/vividimageart/ee524bca-17c7-4cf7-a262-6dd5468fd4ab__Nature - Someplace Else.png', width: 1500, height: 1200 }
];

// NOTE: Bootstrap has been modified to have the @grid-float-breakpoint value be 1200px - if that is changed, change this as well
var bootstrap_grid_float_breakpoint_pixel_value = 1200;

var homeSectionLinkId = '#homeSectionLink';
var gallerySectionLinkId = '#gallerySectionLink';
var artistBioSectionLinkId = '#artistBioSectionLink';
var contactUsSectionLinkId = '#contactUsSectionLink';
var eventsSectionLinkId = '#eventsSectionLink';
var aboutUsSectionLinkId = '#aboutUsSectionLink';
var adminSectionLinkId = '#adminSectionLink';

/// <summary>
/// Handles JavaScript code that must run when a given Angular controller is initialized.
/// </summary>
/// <param name="sectionLinkID">The ID of the main section of the application we have loaded.</param>
function initializeOnControllerLoad(sectionLinkID) {
    currentlySelectedSection = sectionLinkID;

    // set the active menu item in the navbar
    $('.sectionLink').removeClass('active');
    $(sectionLinkID).addClass('active');

    // we need to scroll to the top when a user navigates to a new page
    $("html, body").animate({ scrollTop: 0 }, "slow");

    if (sectionLinkID === homeSectionLinkId) {
        // initialize the slideshow for the home page
        setTimeout(function() {
            initSlideShow();
        }, 750);
    }
    else if (sectionLinkID === gallerySectionLinkId || sectionLinkID === artistBioSectionLinkId || sectionLinkID === eventsSectionLinkId || sectionLinkID === adminSectionLinkId) {
        // initializes iLightBox plug-in
        // This is important to do this in a setTimeout call.  If we don't wrap this in a setTimeout callback, it will execute from the calling function,
        // which in this case is an AngularJS controller...and it will execute prior to the DOM being loaded and the actual
        // <pre /> tags existing on the page.  Wait a second, then try to work with iLightBox and the images
        setTimeout(function() {
            initILightBox();
            onWindowResizeCompleted();
        }, 750);
    }
}

/// <summary>
/// Initializes the slide show on the home page.
/// </summary>
function initSlideShow() {
    var firstNewImage = imageSelection[0];
    var secondNewImage = imageSelection[1];

    var firstImageElement = $('#slideshow_img_1');
    var secondImageElement = $('#slideshow_img_2');

    firstImageElement.attr('src', firstNewImage.url);
    firstImageElement.attr('data-thumb-width', firstNewImage.width);
    firstImageElement.attr('data-thumb-height', firstNewImage.height);

    secondImageElement.attr('src', secondNewImage.url);
    secondImageElement.attr('data-thumb-width', secondNewImage.width);
    secondImageElement.attr('data-thumb-height', secondNewImage.height);

    currentSlideShowIndex = 1;
    maxSlideShowIndex = imageSelection.length - 1;

    onWindowResizeCompleted();

    if (this.slideshowInterval) {
        clearInterval(this.slideshowInterval);
    }

    this.slideshowInterval = setInterval(function(){updateSlideShow();}, 10000);
}

/// <summary>
/// Handles updating the slide show on the main home page.
/// </summary>
function updateSlideShow() {
    // figure out our two new indexers
    currentSlideShowIndex++;
    if (currentSlideShowIndex > maxSlideShowIndex) {
        currentSlideShowIndex = 0;
    }

    var firstNewImage = imageSelection[currentSlideShowIndex];

    currentSlideShowIndex++;
    if (currentSlideShowIndex > maxSlideShowIndex) {
        currentSlideShowIndex = 0;
    }

    var secondNewImage = imageSelection[currentSlideShowIndex];

    var firstImageElement = $('#slideshow_img_1');
    firstImageElement.fadeOut('slow', function () {
        firstImageElement.attr('src', firstNewImage.url);
        firstImageElement.attr('data-thumb-width', firstNewImage.width);
        firstImageElement.attr('data-thumb-height', firstNewImage.height);
        firstImageElement.fadeIn('slow');
    });

    var secondImageElement = $('#slideshow_img_2');
    secondImageElement.fadeOut('slow', function () {
        secondImageElement.attr('src', secondNewImage.url);
        secondImageElement.attr('data-thumb-width', secondNewImage.width);
        secondImageElement.attr('data-thumb-height', secondNewImage.height);
        secondImageElement.fadeIn('slow');

        resizeSlideShowImages();
    });
}

/// <summary>
/// Initializes the iLightBox plugin.
/// </summary>
function initILightBox() {
    var isMobile = IsMobileViewPort();

    $('.ilightbox').iLightBox({
        skin: 'dark',
        infinite: true,
        fullViewPort: 'fit',
        innerToolbar: !isMobile,
        controls: {
            arrows: true,
            slideshow: true
        },
        social: {
            buttons: {
                facebook: true,
                twitter: true,
                googleplus: true
            }
        }
    });
}

/// <summary>
/// Handles updating all relevant image resizing when the window completes a resize event.
/// </summary>
function onWindowResizeCompleted() {
    resizeHeaderImage();

    if (currentlySelectedSection === homeSectionLinkId) {
        setMaxHeightForSlideShow();
        resizeSlideShowImages();
    }
    else if (currentlySelectedSection === gallerySectionLinkId || currentlySelectedSection === adminSectionLinkId) {
        scaleImagesForGallery();
    }
    else {
        resizeImages();
    }
}

/// <summary>
/// Handles resizing the vivid image art header image.
/// </summary>
function resizeHeaderImage() {
    var logoImageHolder = $('#logoImageHolder');
    var currentHeight = logoImageHolder.attr('height');
    var currentWidth = logoImageHolder.attr('width');
    var desiredWidth = GetViewPortWidth() * 0.75;

    // we don't care about height - we are scaling to fit width, so set this to a stupidly high number
    var maximumHeight = 100000;
    var newSizes = DetermineScaledDimensions(currentHeight, currentWidth, maximumHeight, desiredWidth);
    var newHeight = newSizes[0];
    var newWidth = newSizes[1];

    logoImageHolder.width(newWidth);
    logoImageHolder.height(newHeight);

    var mainTitleHolder = $('#mainTitleLogo');
    var mainWidth = mainTitleHolder.width();

    // figure out the main dimensions of the image, as we want the pic to be in the middle of the page
    var widthDiff = mainWidth - newWidth;
    var leftMargin = widthDiff / 2;

    // set the style
    logoImageHolder.css('margin-left', leftMargin);
}

/// <summary>
/// Resizes all images for the slide show on the home page.
/// </summary>
function resizeSlideShowImages() {
    var widthDivisor = 2;
    var contentWidth = $('#contentBox').width();
    var desiredPhotoWidth = (contentWidth * 0.95) / widthDivisor;

    // size and scale the images to fit
    $('.scalableThumbnail').each(function () {
        var currentHeight = $(this).attr('data-thumb-height');
        var currentWidth = $(this).attr('data-thumb-width');

        // determine maximum height
        var maximumHeight = getMaxHeightForSlideShow();

        var newSizes = DetermineScaledDimensions(currentHeight, currentWidth, maximumHeight, desiredPhotoWidth);
        var newHeight = newSizes[0];
        var newWidth = newSizes[1];

        $(this).width(newWidth);
        $(this).height(newHeight);
    });
}

/// <summary>
/// Determines the maximum height for the slideshow div.
/// </summary>
/// <returns>The maximum height for the slideshow div.</returns>
function getMaxHeightForSlideShow() {
    var screenHeight = GetViewPortHeight();
    var startOfSlideShowDiv = $('#slideshowDiv').offset().top;
    var maximumHeight = (screenHeight - startOfSlideShowDiv) * 0.75;

    return maximumHeight;
}

/// <summary>
/// Sets the maximum height for the slideshow div.
/// </summary>
function setMaxHeightForSlideShow() {
    var maxHeight = getMaxHeightForSlideShow();
    $('#slideshowDiv').attr('max-height', maxHeight);
    $('#slideshowDiv').attr('min-height', maxHeight);

    $('#hiddenTableColumn').attr('height', maxHeight * 1.02);
}

/// <summary>
/// Resizes any and all images on the page to fit.
/// </summary>
function resizeImages() {
    var contentWidth = $('#contentBox').width();
    var desiredPhotoWidth = contentWidth * 0.95;

    // size and scale the images to fit
    $('.scalableThumbnail').each(function () {
        var currentHeight = $(this).attr('data-thumb-height');
        var currentWidth = $(this).attr('data-thumb-width');

        // we don't care about height - we are scaling to fit width, so set this to a stupidly high number
        var maximumHeight = 100000;
        var newSizes = DetermineScaledDimensions(currentHeight, currentWidth, maximumHeight, desiredPhotoWidth);
        var newHeight = newSizes[0];
        var newWidth = newSizes[1];

        $(this).width(newWidth);
        $(this).height(newHeight);
    });
}

/// <summary>
/// Handles JavaScript code that must run when a given Angular controller is initialized.
/// </summary>
function scaleImagesForGallery() {
    var desiredHeight = 100;
    var galleryWrapper = $('#gallery-wrapper');
    if (galleryWrapper) {
        desiredHeight = parseInt(galleryWrapper.attr('data-max-thumb-height'));
    }

    // size and scale the images to fit
    $('.scalableThumbnail').each(function () {
        var currentHeight = $(this).attr('data-thumb-height');
        var currentWidth = $(this).attr('data-thumb-width');

        var newWidth = currentWidth;
        var newHeight = currentHeight;

        if (currentHeight < desiredHeight) {
            newHeight = desiredHeight;
            var factor = desiredHeight / currentHeight;
            newWidth = currentWidth * factor;
        }

        $(this).width(newWidth);
        $(this).height(newHeight);
    });
}

/// <summary>
/// Logs a message to the console if the 'shouldLogToConsole' local variable is equal to true.
/// </summary>
/// <param name="message">The message to be logged.</param>
function LogToConsole(message) {
    if (shouldLogToConsole === true) {
        console.log(message);
    }
}

/// <summary>
/// Determines the available viewport width.
/// </summary>
/// <returns>The available width of the viewport.</returns>
function GetViewPortWidth() {
    return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

/// <summary>
/// Determines the available viewport height.
/// </summary>
/// <returns>The available height of the viewport.</returns>
function GetViewPortHeight() {
    return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}

/// <summary>
/// Determines if the object value is null or undefined.
/// </summary>
/// <param name="obj">The object to be evaluated.</param>
/// <returns>True if the object is null or undefined, otherwise false.</returns>
function IsNullOrUndefined(obj) {
    return typeof (obj) === 'undefined' || obj === null;
}

/// <summary>
/// Determines if an object is a number.
/// </summary>
/// <param name="numberToCheck">The object to be evaluated.</param>
/// <returns>True if the object is a number, otherwise false.</returns>
function IsNumber(numberToCheck) {
    return !isNaN(parseFloat(numberToCheck)) && isFinite(numberToCheck);
}

/// <summary>
/// Determines if we are dealing with a mobile viewport.
/// </summary>
/// <returns>True if the viewport is 'mobile' width, otherwise false.</returns>
function IsMobileViewPort() {
    var viewportWidth = GetViewPortWidth();
    return viewportWidth < bootstrap_grid_float_breakpoint_pixel_value;
}

/// <summary>
/// Scales a picture to be shown in a section of a web page.
/// </summary>
/// <param name="imageHeight">The current height of the image.</param>
/// <param name="imageWidth">The current width of the image</param>
/// <param name="maxHeight">The desired maximum allowed height of the image once scaled.</param>
/// <param name="maxWidth">The desired maximum allowed width of the image once scaled.</param>
/// <returns>An array of integers where the first item is the new scaled height, and the second item is the new scaled width.</returns>
function DetermineScaledDimensions(imageHeight, imageWidth, maxHeight, maxWidth) {

    LogToConsole("DetermineScaledDimensions:");
    LogToConsole("DetermineScaledDimensions - imageHeight: " + imageHeight);
    LogToConsole("DetermineScaledDimensions - imageWidth: " + imageWidth);
    LogToConsole("DetermineScaledDimensions - maxHeight: " + maxHeight);
    LogToConsole("DetermineScaledDimensions - maxWidth: " + maxWidth);

    var returnSizes = [];

    // first figure out if we even have to do anything
    if ((imageHeight <= maxHeight) && (imageWidth <= maxWidth)) {
        returnSizes.push(imageHeight);
        returnSizes.push(imageWidth);
        return returnSizes;
    }

    var newHeight;
    var newWidth;
    var percentageDiff;

    // if only ONE size (H or W) is bigger than the max, we use that for the scale
    var isHeightBiggerThanMax = imageHeight > maxHeight;

    if (!isHeightBiggerThanMax) {
        // we need to start with the width instead
        newWidth = DetermineNewSize(imageWidth, maxWidth);
        percentageDiff = (newWidth / imageWidth) * 100;

        // we know the width matches now, we just need to figure out the height
        newHeight = imageHeight * (percentageDiff / 100);
        if (newHeight > maxHeight) {
            var tempNewHeight = DetermineNewSize(newHeight, maxHeight);
            var heightPercentageDiff = (tempNewHeight / newHeight) * 100;

            // assign tempNewHeight to newHeight
            newHeight = tempNewHeight;
            newWidth = newWidth * (heightPercentageDiff / 100);
        }
    }
    else {
        // we know that the height is bigger than the max, so we can just start with that
        newHeight = DetermineNewSize(imageHeight, maxHeight);
        percentageDiff = (newHeight / imageHeight) * 100;

        // we know the height matches now, we just need to figure out the width
        newWidth = imageWidth * (percentageDiff / 100);
        if (newWidth > maxWidth) {
            var tempNewWidth = DetermineNewSize(newWidth, maxWidth);
            var widthPercentageDiff = (tempNewWidth / newWidth) * 100;

            // assign tempNewWidth to newWidth
            newWidth = tempNewWidth;
            newHeight = newHeight * (widthPercentageDiff / 100);
        }
    }

    LogToConsole("DetermineScaledDimensions - newHeight: " + maxHeight);
    LogToConsole("DetermineScaledDimensions - newWidth: " + maxWidth);

    returnSizes.push(newHeight);
    returnSizes.push(newWidth);

    return returnSizes;
}

/// <summary>
/// Determines a new size by shrinking the current size below a given maximum size.
/// </summary>
/// <param name="currentSize">The current size.</param>
/// <param name="maxSize">The maximum size.</param>
/// <returns>The new smaller size.</returns>
function DetermineNewSize(currentSize, maxSize) {
    if (currentSize <= maxSize) {
        return currentSize;
    }

    // the current size is bigger than the max size
    var newSize;
    var counter = 99;
    while (true) {
        if (counter <= 1) {
            break;
        }

        newSize = currentSize * (counter / 100);
        if (newSize <= maxSize) {
            break;
        }

        counter = counter - 1;
    }

    return newSize;
}

/// <summary>
/// Creates a new CacheContainer object used to store simple cache arrays in memory.
/// </summary>
/// <param name="cacheLength">The age of the cache, in milliseconds.</param>
/// <returns>A new CacheContainer object.</returns>
function CacheContainer(cacheLength) {
    this.updatedOn = new Date();
    this.cachedData = [];
    this.cacheLengthInMs = cacheLength;
    this.isValid = function() {
        if (this.cachedData.length === 0) {
            return false;
        }

        var diffInMilliSeconds = Math.floor((new Date() - this.updatedOn));
        if (diffInMilliSeconds > this.cacheLengthInMs) {
            // clear array
            this.cachedData = [];
            return false;
        }

        return true;
    };

    this.assignData = function(newData) {
        this.updatedOn = new Date();
        this.cachedData = newData;
    };

    this.clearCache = function() {
        this.cachedData = [];
    };

    return this;
}