window.ChaiBioTech.ngApp.directive('scrollOnTop', [
  'scrollService',
  function(scrollService) {
    return {
      restric: 'EA',
      replace: true,
      templateUrl: 'app/views/directives/scroll-on-top.html',

      scope: {
        width: "@width"
      },

      link: function(scope, elem, attr) {
        scrollService.move = 0;
        scope.element = $(".canvas-containing");
        scope.scrollDiff = 0;
        scope.position = 0;
        var bar = $(elem).find(".foreground-bar");

        scope.$watch("width", function(newVal, oldVal) {

          var ratio = (newVal / 1024);
          var width = 300 / ratio;
          var canvasDiff = newVal - 1024;
          scope.scrollDiff = 300 - width;

          scrollService.move = canvasDiff / scope.scrollDiff;
          // Automatically update
          if(scope.position !== 0) { // make this a new service , so these numbers can be used in events..
              var oldWidth = 300 / (oldVal / 1024);
              var moveLeft = Math.abs(oldWidth - width);
              scope.position = Math.abs(scope.position - moveLeft);
              bar.css("left", scope.position + "px");
              bar.css("width", width + "px");
          }

          bar.css("width", width + "px");
        });

        scope.dragElem = $(elem).find(".foreground-bar").draggable({
          refreshPositions: true,
          containment: "parent",
          axis: "x",

          drag: function(event, ui) {

            if(ui.position.left > 0 && ui.position.left <= scope.scrollDiff) {
              scope.element.scrollLeft(ui.position.left * scrollService.move);
            }

          },

          stop: function(event, ui) {
            scope.position = ui.position.left;
          }
        });
      }
    };
  }
]);
