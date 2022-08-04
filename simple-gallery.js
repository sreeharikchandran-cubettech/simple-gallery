jQuery.browser = {};
(function () {
  jQuery.browser.msie = false;
  jQuery.browser.version = 0;
  if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
    jQuery.browser.msie = true;
    jQuery.browser.version = RegExp.$1;
  }
})();
jQuery.noConflict();
jQuery(document).ready(function ($) {
  var galleries = $("div.simplegallery");
  var numGalleries = galleries.size();
  for (i = 0; i < numGalleries; i++) {
    simplegallery($(galleries[i]).attr("id"));
  }
  function simplegallery(id) {
    var selector = "#" + id;
    var index = 0;
    var thumbs = $(selector + " .thumbnails dt a");
    var thumbnailcontainer = $(selector + " .thumbnails");
    var largeimagecontainer = $(selector + " .largeimage");
    var large = $(largeimagecontainer).children("a").children("img");
    var caption = $(largeimagecontainer).children("h3");
    var numThumbs = thumbs.size();
    var current = thumbs[index];
    $(thumbs).attr("class", "");
    debug(selector + ": thumbnail classes removed");
    $(largeimagecontainer).children("a").attr("class", "");
    debug(
      selector +
        ": large image classes removed: " +
        $(largeimagecontainer).children("a").attr("class")
    );
    function showImg(img) {
      debug(
        selector +
          ": img showImg() called for thumbnail <a> with href " +
          $(img).attr("href")
      );
      if ($(img).attr("href") == $(large).attr("src")) {
        return;
      }
      if (
        gallerySettings[id]["fade"] == "out-in" ||
        gallerySettings[id]["fade"] == "over"
      ) {
        $(large).hide();
        $(largeimagecontainer).addClass("loading");
      }
      $(large)
        .attr("src", $(img).attr("href"))
        .attr("title", $(img).attr("title"))
        .attr("alt", $(img).attr("title"));
      var captionHTML = $.trim($(img).parent().parent().children("dd").html());
      var resize = null;
      $(caption).html(captionHTML);
      $(large).parent().attr("href", $(img).attr("href"));
      if ("object" == typeof shutterReloaded) {
        $(large)
          .parent()
          .click(function () {
            shutterLinks["simpleviewer"] = null;
            shutterLinks["simpleviewer"] = {
              link: $(img).attr("href"),
              num: -1,
              set: 0,
              title: captionHTML,
            };
            shutterReloaded.make("simpleviewer");
            $(window).attr("onresize", "");
            return false;
          });
      }
      $(thumbs).removeClass("current");
      $(img).addClass("current");
      updateNavigation();
    }
    $(thumbs).click(function () {
      for (i = 0; i < numThumbs; i++) {
        if (thumbs[i] == this) {
          index = i;
          break;
        }
      }
      showImg($(this));
      return false;
    });
    $(large).load(function () {
      debug(selector + ": img load() called for img " + $(this).attr("src"));
      var resize = false;
      if ($.browser.msie && $.browser.version.indexOf("6.0") == 0) {
        resize = true;
      }
      if (resize) {
        $(large).width("");
        $(large).height("");
        var src = $(large).attr("src");
        var constraint = "width";
        var size = parseInt($(large).width());
        var cssMaxSize = $(large).css("max-" + constraint);
        var cssRatio =
          parseInt(cssMaxSize) / parseInt($(large).css("max-height"));
        var imageRatio = size / parseInt($(large).height());
        debug(
          selector +
            ": " +
            src +
            ": css ratio " +
            cssRatio +
            " img ratio " +
            imageRatio
        );
        if (parseInt($(large).height()) > size) {
          constraint = "height";
          size = parseInt($(large).height());
          cssMaxSize = $(large).css("max-height");
        }
        debug(selector + ": " + src + ": constraint is " + constraint);
        if (cssMaxSize != "" && cssMaxSize.indexOf("px") > -1) {
          cssMaxSize = parseInt(cssMaxSize);
          if (size > cssMaxSize) {
            if (constraint == "height") {
              $(large).height(cssMaxSize);
            } else if (constraint == "width") {
              $(large).width(cssMaxSize);
            }
            debug(
              selector +
                ": " +
                src +
                ": " +
                constraint +
                " of changed from " +
                size +
                " down to " +
                cssMaxSize
            );
          } else {
            debug(
              selector +
                ": " +
                src +
                ": no need to shrink. " +
                constraint +
                " already " +
                size
            );
          }
        }
      }
      debug(
        selector +
          ": image W x H:  " +
          $(large).width() +
          " x " +
          $(large).height()
      );
      if (
        gallerySettings[id]["fade"] == "out-in" ||
        gallerySettings[id]["fade"] == "over"
      ) {
        $(large).fadeIn(gallerySettings[id]["fadespeed"], function () {
          $(largeimagecontainer).removeClass("loading");
          setBgImage();
        });
      }
    });
    function setBgImage() {
      if (gallerySettings[id]["fade"] != "over") return;
      debug(selector + ": set background image to " + $(large).attr("src"));
      $(largeimagecontainer).css(
        "background-image",
        "url(" + $(large).attr("src") + ")"
      );
    }
    function checkKey(e) {
      switch (e.keyCode) {
        case 40:
        case 39:
          showNext();
          break;
        case 38:
        case 37:
          showPrevious();
          break;
      }
    }
    function showNext() {
      if (hasNext()) {
        index++;
        showImg(thumbs[index]);
      }
    }
    function showPrevious() {
      if (hasPrevious()) {
        index--;
        showImg(thumbs[index]);
      }
    }
    function hasNext() {
      return index < numThumbs - 1;
    }
    function hasPrevious() {
      return index > 0;
    }
    function updateNavigation() {
      if (hasPrevious()) {
        $(selector + " .simplegalleryprev").addClass("enabled");
        $(selector + " .simplegalleryprev").removeClass("disabled");
      } else {
        $(selector + " .simplegalleryprev").addClass("disabled");
        $(selector + " .simplegalleryprev").removeClass("enabled");
      }
      if (hasNext()) {
        $(selector + " .simplegallerynext").addClass("enabled");
        $(selector + " .simplegallerynext").removeClass("disabled");
      } else {
        $(selector + " .simplegallerynext").addClass("disabled");
        $(selector + " .simplegallerynext").removeClass("enabled");
      }
      $(selector + " .simplegalleryimagenumber").html(index + 1);
    }
    showImg(thumbs[0]);
    $(selector + " .simplegallerynavbar").append("<ul>");
    $(selector + " .simplegallerynavbar ul")
      .append(
        '<li class="simplegalleryprev disabled"><a href="javascript:void();" title="Previous"><span>&larr;</span></a></li>'
      )
      .append(
        '<li class="simplegalleryimagenumbers"><span class="simplegalleryimagenumber">1</span> / <span class="simplegallerytotalimages">' +
          numThumbs +
          "</span></li>"
      )
      .append(
        '<li class="simplegallerynext enabled"><a href="javascript:void();" title="Next"><span>&rarr;</span></a></li>'
      )
      .append("</ul>");
    $(selector + " .simplegalleryprev").click(function () {
      if ($(this).hasClass("disabled")) return false;
      showPrevious();
      return false;
    });
    $(selector + " .simplegallerynext").click(function () {
      if ($(this).hasClass("disabled")) return false;
      showNext();
      return false;
    });
    if ($.browser.mozilla) {
      $(document).keypress(checkKey);
    } else {
      $(document).keydown(checkKey);
    }
    if (gallerySettings[id]["thumbnailscroll"] == 1) {
      var $item = $(thumbnailcontainer).find(".gallery dl.gallery-item"),
        scrollingIndex = 0,
        displayWidth = $(thumbnailcontainer).find("div.gallerywrapper").width();
      (totalWidth = 0), (scrollingIndexEnd = 0);
      $item.each(function () {
        totalWidth += parseInt($(this).outerWidth(true));
      });
      scrollingIndexEnd = totalWidth / displayWidth - 1;
      if (scrollingIndexEnd < 0) {
        scrollingIndexEnd = 0;
      }
      $(thumbnailcontainer)
        .find("div.gallerywrapper div.gallery")
        .css("min-width", totalWidth + "px");
      $(thumbnailcontainer)
        .find(".thumbnailscroll")
        .height($(thumbnailcontainer).height());
      if (scrollingIndexEnd > 0) {
        $(thumbnailcontainer)
          .find(".thumbnailscroll.thumbnailscroll-prev")
          .click(function () {
            if (scrollingIndex > 0) {
              scrollingIndex--;
              simplegallery_thumbnail_navigation_arrows(
                thumbnailcontainer,
                scrollingIndex,
                scrollingIndexEnd
              );
              $item.animate({ left: "+=" + displayWidth + "px" }, "slow");
            }
          });
        $(thumbnailcontainer)
          .find(".thumbnailscroll.thumbnailscroll-next")
          .click(function () {
            if (scrollingIndex < scrollingIndexEnd) {
              scrollingIndex++;
              simplegallery_thumbnail_navigation_arrows(
                thumbnailcontainer,
                scrollingIndex,
                scrollingIndexEnd
              );
              $item.animate({ left: "-=" + displayWidth + "px" }, "slow");
            }
          });
      }
      simplegallery_thumbnail_navigation_arrows(
        thumbnailcontainer,
        scrollingIndex,
        scrollingIndexEnd
      );
    }
  }
  function simplegallery_thumbnail_navigation_arrows(container, idx, endIdx) {
    if (idx == 0 && endIdx > 0) {
      $(container)
        .find(".thumbnailscroll.thumbnailscroll-prev")
        .css("visibility", "hidden");
      $(container)
        .find(".thumbnailscroll.thumbnailscroll-next")
        .css("visibility", "visible");
    } else if (idx == 0 && endIdx == 0) {
      $(container)
        .find(".thumbnailscroll.thumbnailscroll-prev")
        .css("visibility", "hidden");
      $(container)
        .find(".thumbnailscroll.thumbnailscroll-next")
        .css("visibility", "hidden");
    } else if (idx > 0 && idx < endIdx) {
      $(container)
        .find(".thumbnailscroll.thumbnailscroll-prev")
        .css("visibility", "visible");
      $(container)
        .find(".thumbnailscroll.thumbnailscroll-next")
        .css("visibility", "visible");
    } else if (idx > 0 && idx >= endIdx) {
      $(container)
        .find(".thumbnailscroll.thumbnailscroll-prev")
        .css("visibility", "visible");
      $(container)
        .find(".thumbnailscroll.thumbnailscroll-next")
        .css("visibility", "hidden");
    }
  }
});
function debug(message) {
  if (window.console) {
    console.log(message);
  }
}
