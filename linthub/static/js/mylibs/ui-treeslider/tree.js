(function(L, $){
  
  L.TreeSlider = function() {
      if (window.history && window.history.pushState) {
        var self = this,
        slider = this.el =  $("#slider"),
        transitionEnd = function transitionEnd() {
          if (self.sliding) {
            self.sliding = false;
            $(".frame-right").hide();
            $(".frame-loading:visible").removeClass("frame-loading")
          }
        };
          
        if (slider.length) {
          window.history.replaceState({
              path: this.pathFromURL(location.pathname)
          }, "");

          $(".frames a.js-slide-to, .breadcrumb a").live("click", function(e) {
              if (e.which == 2 || e.metaKey || e.ctrlKey) return true;
              else {
                  self.clickHandler(e);
                  return false
              }
          });
          
          $(window).bind("popstate", function(e) {
              self.popStateHandler(e.originalEvent)
          });
          
          $(".frames .frame").live("webkitTransitionEnd", transitionEnd).live("transitionend", transitionEnd);
        }
      }
  };
  L.TreeSlider.prototype = {
      sliding: false,
      frameForPath: function(a) {
          return $(".frame[data-path=" + a + "]")
      },
      frameForURL: function(a) {
          return this.frameForPath(this.pathFromURL(a))
      },
      pathFromURL: function(a) {
          var e = new RegExp("/(tree|blob)/");
          a = a.split(e)[2] || "/";
          if (a.slice(a.length - 1, a.length) != "/") a += "/";
          return a
      },
      clickHandler: function(e) {
          if (this.sliding) return false;
          var target = $(e.currentTarget).attr('href');
          var path = this.pathFromURL(target);
          window.history.pushState({
              path: path
          }, "", target);
          this.slideTo(target)
      },
      popStateHandler: function(a) {
        a.state && this.slideTo(location.pathname)
      },
      slideTo: function(a) {
          var e = this.pathFromURL(a),
          b = this.frameForPath(e),
          c = $(".frame-center").attr("data-path") || "";
          b.is(".frame-center") || (c == "/" || e.split("/").length > c.split("/").length ? this.slideForwardTo(a) : this.slideBackTo(a))
      },
      slideForwardTo: function(a) {
          if (!this.sliding) {
              this.sliding = true;
              debug("Sliding forward to %s", a);
              var e = this.frameForURL(a);
              $(".frames .frame-center").addClass("frame-left").removeClass("frame-center");
              if (e.length == 0) {
                  var b = $(".frame-loading").clone();
                  $(".frame-left:last").after(b);
                  this.makeCenterFrame(b);
                  this.loadFrame(a, function(c) {
                    b.replaceWith($(c).find(".frame-center"))
                  })
              } else {
                  this.makeCenterFrame(e);
              }
          }
      },
      slideBackTo: function(a) {
          if (!this.sliding) {
              this.sliding = true;
              debug("Sliding back to %s", a);
              var e = $(".frames .frame-center"),
              b = this.frameForURL(a),
              c = this.pathFromURL(a);
              if (b.length == 0) {
                  var f = this,
                  h = $(".frame-loading").clone();
                  $(".frames").prepend(h.show().addClass("frame-left"));
                  setTimeout(function() {
                      e.addClass("frame-right").removeClass("frame-center");
                      f.makeCenterFrame(h);
                      f.loadFrame(a, function(d) {
                        h.empty().append($(d).find(".frame-center").contents()).attr("data-path", c)
                      })
                  }, 50)
              } else {
                  e.addClass("frame-right").removeClass("frame-center");
                  this.makeCenterFrame(b);
              }
          }
      },
      makeCenterFrame: function(a) {
          a.show().removeClass("frame-left").removeClass("frame-right").addClass("frame-center");
          //this.scrollToBreadcrumb();
          a.nextAll(".frame-left").hide().removeClass("frame-left").addClass("frame-right").show();
          a.prevAll(".frame-right").hide().removeClass("frame-right").addClass("frame-left").show();
          var e = $(".breadcrumb[data-path=" + a.attr("data-path") + "]");
          if (e.length) {
              $(".breadcrumb:visible").hide();
              e.show();
          }
          a = $(".announce[data-path=" + a.attr("data-path") + "]");
          $(".announce").fadeOut();
          a.length > 0 && a.fadeIn();
          L.currentPath = this.pathFromURL(location.pathname).replace(/\/$/, "")
      },
      loadFrame: function(a, e) {
          debug("Loading " + a + "?slide=1");
          var b = this;
          $.ajax({
              url: a + "?slide=1",
              cache: false,
              success: function(c) {
                  e.call(this, c);
                  $("#slider .breadcrumb").hide().last().after($(c).find(".breadcrumb"));
                  $("#slider").after($(c).find(".announce").hide().fadeIn());
              },
              error: function() {
                  $(".frame-center").html("<h3>Something went wrong.</h3>")
              }
          })
      }
  };
  
  function debug(){
    console.debug(arguments);
  }
  
})((LintHub = {}), this.jQuery);