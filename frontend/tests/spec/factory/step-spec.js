describe("Testing functionalities of step", function() {

  /*beforeEach(module('ChaiBioTech', function ($provide) {
    mockCommonServices($provide);
  }));

  beforeEach(module('canvasApp'));

  var _step;

  beforeEach(inject(function(step) {
    _step = step;
  }));


  it("should test step", function() {
    expect("a").toEqual("a");
  });*/
  
  var step, _step,  _circle, _previouslySelected, _stepGraphics, _constants;

  beforeEach(function() {

    module('ChaiBioTech', function($provide) {

      $provide.value('IsTouchScreen', function () {});
      $provide.value('circle', function() {
        return {
          name: "circle",
          getLeft: function() {},
          getTop: function() {},
          getUniqueId: function() {},
          addImages: function() {},
          render: function() {}
        };
      });
    });

    inject(function($injector) {
      _circle = $injector.get('circle');
      _previouslySelected = $injector.get('previouslySelected');
      _stepGraphics = $injector.get('stepGraphics');
      _constants = $injector.get('constants');
      _step = $injector.get('step');
    });

    var model = {
      collect_data: true,
      ramp: {
        collect_data: true,
      }
    };

    parentStage = {
      name: "stage",
      canvas: {
        name: "canvas",
        remove: function() {},
        renderAll: function() {},
        add: function() {},
      }
    };

    var index = 1;

    $scope = {
      name: "$scope"
    };

    step = new _step(model, parentStage, index, $scope);

  });

  it("It should test initial state of step", function() {

    //expect(2).toEqual(1);
    expect(step.stepMovedDirection).toEqual(null);
    expect(step.model.collect_data).toEqual(true);
    expect(step.parentStage.name).toEqual("stage");
    expect(step.index).toEqual(1);
    expect(step.canvas.name).toEqual("canvas");
    expect(step.myWidth).toEqual(_constants.stepWidth);
    expect(step.$scope.name).toEqual("$scope");
    expect(step.nextIsMoving).toEqual(null);
    expect(step.previousIsMoving).toEqual(null);
    expect(step.nextStep).toEqual(null);
    expect(step.previousStep).toEqual(null);
    expect(step.gatherDataDuringStep).toEqual(true);
    expect(step.gatherDataDuringRamp).toEqual(true);
    expect(step.shrinked).toEqual(false);
    expect(step.shadowText).toEqual("0px 1px 2px rgba(0, 0, 0, 0.5)");
    expect(step.visualComponents).toEqual(jasmine.any(Object));
  });

  it("It should test setLeft method", function() {
    
    step.parentStage = {
      left: 100,
    };

    step.index = 2;

    step.myWidth = 150;

    step.setLeft();

    expect(step.left).toEqual(step.parentStage.left + 3 + (step.index * step.myWidth));
  });

  it("It should test toggleComponents method", function() {

    var state = true;

    step.circle = {
      stepDataGroup: {
        setVisible: function() {}
      },
      gatherDataOnScroll: {
        setVisible: function() {}
      },
      circleGroup: {
        setVisible: function() {}
      },
      gatherDataDuringRampGroup: {
        setVisible: function() {}
      },
    };

    step.closeImage = {
      setVisible: function() {}
    };

    step.stepName = {
      setVisible: function() {}
    };

    step.numberingTextCurrent = {
      setVisible: function() {}
    };

    step.numberingTextTotal = {
      setVisible: function() {}
    };

    spyOn(step.circle.stepDataGroup, "setVisible");
    spyOn(step.circle.gatherDataOnScroll, "setVisible");
    spyOn(step.circle.circleGroup, "setVisible");
    spyOn(step.circle.gatherDataDuringRampGroup, "setVisible");

    spyOn(step.closeImage, "setVisible");
    spyOn(step.stepName, "setVisible");
    spyOn(step.numberingTextCurrent, "setVisible");
    spyOn(step.numberingTextTotal, "setVisible");

    step.toggleComponents(state);

    expect(step.circle.stepDataGroup.setVisible).toHaveBeenCalled();
    expect(step.circle.gatherDataOnScroll.setVisible).toHaveBeenCalled();
    expect(step.circle.circleGroup.setVisible).toHaveBeenCalled();
    expect(step.circle.gatherDataDuringRampGroup.setVisible).toHaveBeenCalled();

    expect(step.closeImage.setVisible).toHaveBeenCalled();
    expect(step.stepName.setVisible).toHaveBeenCalled();
    expect(step.numberingTextCurrent.setVisible).toHaveBeenCalled();
    expect(step.numberingTextTotal.setVisible).toHaveBeenCalled();
    
  });

  it("It should test moveStep method", function() {

    var action = 1;
    var callSetLeft = true;

    step.stepGroup = {
      set: function() {},
      setCoords: function() {}
    };

    step.closeImage = {
      set: function() {},
      setCoords: function() {}
    };

    step.dots = {
      set: function() {},
      setCoords: function() {}
    };

    step.rampSpeedGroup = {
      set: function() {},
      setCoords: function() {}
    };

    step.circle = {
      getUniqueId: function() {}
    };

    spyOn(step, "setLeft");
    spyOn(step, "getUniqueName");
    
    spyOn(step.stepGroup, "set");
    spyOn(step.stepGroup, "setCoords");

    spyOn(step.closeImage, "set");
    spyOn(step.closeImage, "setCoords");

    spyOn(step.dots, "set");
    spyOn(step.dots, "setCoords");

    spyOn(step.rampSpeedGroup, "set");
    spyOn(step.rampSpeedGroup, "setCoords");

    spyOn(step.circle, "getUniqueId");

    step.moveStep(action, callSetLeft);

    expect(step.setLeft).toHaveBeenCalled();
    expect(step.getUniqueName).toHaveBeenCalled();

    expect(step.closeImage.set).toHaveBeenCalled();
    expect(step.closeImage.setCoords).toHaveBeenCalled();

    expect(step.dots.set).toHaveBeenCalled();
    expect(step.dots.setCoords).toHaveBeenCalled();

    expect(step.rampSpeedGroup.set).toHaveBeenCalled();
    expect(step.rampSpeedGroup.setCoords).toHaveBeenCalled();

    expect(step.circle.getUniqueId).toHaveBeenCalled();
  });

  it("It should test moveStep method, when callSetLeft = false", function() {

    var action = 1;
    var callSetLeft = false;

    step.stepGroup = {
      set: function() {},
      setCoords: function() {}
    };

    step.closeImage = {
      set: function() {},
      setCoords: function() {}
    };

    step.dots = {
      set: function() {},
      setCoords: function() {}
    };

    step.rampSpeedGroup = {
      set: function() {},
      setCoords: function() {}
    };

    step.circle = {
      getUniqueId: function() {}
    };

    spyOn(step, "setLeft");
    spyOn(step, "getUniqueName");
    
    spyOn(step.stepGroup, "set");
    spyOn(step.stepGroup, "setCoords");

    spyOn(step.closeImage, "set");
    spyOn(step.closeImage, "setCoords");

    spyOn(step.dots, "set");
    spyOn(step.dots, "setCoords");

    spyOn(step.rampSpeedGroup, "set");
    spyOn(step.rampSpeedGroup, "setCoords");

    spyOn(step.circle, "getUniqueId");

    step.moveStep(action, callSetLeft);

    expect(step.setLeft).not.toHaveBeenCalled();
    expect(step.getUniqueName).toHaveBeenCalled();

    expect(step.closeImage.set).toHaveBeenCalled();
    expect(step.closeImage.setCoords).toHaveBeenCalled();

    expect(step.dots.set).toHaveBeenCalled();
    expect(step.dots.setCoords).toHaveBeenCalled();

    expect(step.rampSpeedGroup.set).toHaveBeenCalled();
    expect(step.rampSpeedGroup.setCoords).toHaveBeenCalled();

    expect(step.circle.getUniqueId).toHaveBeenCalled();
  });

  it("It should test deleteAllStepContents method", function() {

    step.visualComponents = {
      circle: {

      },
      dots: {

      }
    };

    step.circle = {
      removeContents: function() {}
    };

    spyOn(step.canvas, "remove");
    spyOn(step.circle, "removeContents");

    step.deleteAllStepContents();

    expect(step.canvas.remove).toHaveBeenCalled();
    expect(step.circle.removeContents).toHaveBeenCalled();

  });

  describe("Testing wireNextAndPreviousStep method in different scenarios", function() {

    it("It should test wireNextAndPreviousStep method when step has nextStep or when the step is very first one", function() {

      step.nextStep  = {
        name: "nextStep"
      };

      var selected = step.wireNextAndPreviousStep({}, {});

      expect(selected.name).toEqual("nextStep");
      expect(step.nextStep.previousStep).toEqual(null);
    });

    it("it should test wireNextAndPreviousStep method, when the step is the last one", function() {

      step.previousStep = {
        name: "previousStep"
      };

      var selected = step.wireNextAndPreviousStep({}, {});

      expect(selected.name).toEqual("previousStep");
      expect(step.previousStep.nextStep).toEqual(null);
    });

    it("It should test wireNextAndPreviousStep method, when step has next and previous", function() {

      step.previousStep = {
        name: "previousStep"
      };

      step.nextStep = {
        name: "nextStep"
      };

      var selected = step.wireNextAndPreviousStep({}, {});

      expect(selected.name).toEqual("nextStep");
      expect(step.previousStep.nextStep.name).toEqual("nextStep");
      expect(step.nextStep.previousStep.name).toEqual("previousStep");
    });
  });

  it("It should test configureStepName method", function() {

    step.stepName = {};
    
    step.model = {
      name: "step1"
    };

    spyOn(step, "numberingValue").and.returnValue();

    step.configureStepName();

    expect(step.stepName.text).toEqual("step1");
    expect(step.numberingValue).toHaveBeenCalled();
  });

  it("It should test configureStepName method, when model.name = null", function() {

    step.stepName = {};
    
    step.model = {
      name: null,
      index: 2,
    };

    spyOn(step, "numberingValue").and.returnValue();

    step.configureStepName();

    expect(step.numberingValue).toHaveBeenCalled();
    expect(step.stepNameText).toEqual('Step ' + (step.index + 1));
    expect(step.stepName.text).toEqual('Step ' + (step.index + 1));
  });

  it("It should test addCircle method", function() {

    step.addCircle();

    expect(step.circle.name).toEqual("circle");
  });

  it("It should test getUniqueName method", function() {

    step.model = {
      id: 1000
    };

    step.parentStage = {
      index: 100
    };

    step.getUniqueName();

    expect(step.uniqueName).toEqual(step.model.id + step.parentStage.index + "step");
  });

  it("It should test showHideRamp method", function() {

    step.model = {
      ramp: {
        rate: "2"
      }
    };

    step.rampSpeedGroup = {
      setVisible: function() {},

    };
    step.rampSpeedText = {
      width: 100,
    };

    step.underLine = {
      setWidth: function() {}
    };

    spyOn(step.canvas, "renderAll");
    spyOn(step.rampSpeedGroup, "setVisible");
    spyOn(step.underLine, "setWidth");

    step.showHideRamp();

    expect(step.rampSpeedText.text).toEqual("2º C/s");
    expect(step.rampSpeedGroup.setVisible).toHaveBeenCalledWith(true);
    expect(step.underLine.setWidth).toHaveBeenCalled();
  });

  it("It should test showHideRamp method when ramp text to be hide", function() {

    step.model = {
      ramp: {
        rate: "10"
      }
    };

    step.rampSpeedGroup = {
      setVisible: function() {},

    };
    step.rampSpeedText = {
      width: 100,
    };

    step.underLine = {
      setWidth: function() {}
    };

    spyOn(step.canvas, "renderAll");
    spyOn(step.rampSpeedGroup, "setVisible");
    spyOn(step.underLine, "setWidth");

    step.showHideRamp();

    expect(step.rampSpeedText.text).toEqual("10º C/s");
    expect(step.rampSpeedGroup.setVisible).toHaveBeenCalledWith(false);
    expect(step.underLine.setWidth).not.toHaveBeenCalled();
  });

  it("It should test adjustRampSpeedPlacing method", function() {

    step.circle = {
      top: 12
    };

    step.rampSpeedGroup = {
      setTop: function() {},
    };

    spyOn(step.rampSpeedGroup, "setTop");
    step.adjustRampSpeedPlacing();
    expect(step.rampSpeedGroup.setTop).toHaveBeenCalledWith(step.circle.top + 20);
  });

  it("It should test adjustRampSpeedLeft method", function() {

    step.circle = {
      runAlongCircle: function() {}
    };

    spyOn(step.circle, "runAlongCircle");

    step.adjustRampSpeedLeft();
    
    expect(step.circle.runAlongCircle).toHaveBeenCalled();
  });

  it("It should test manageBorder method, when step has no previousStep", function() {

    var color = "white";

    step.borderRight = {
      setStroke: function() {},
      setStrokeWidth: function() {}
    };

    step.parentStage = {
      border: {
        setStroke: function() {}
      }
    };

    spyOn(step.borderRight, "setStroke");
    spyOn(step.borderRight, "setStrokeWidth");
    spyOn(step.parentStage.border, "setStroke");

    step.manageBorder(color);

    expect(step.borderRight.setStroke).toHaveBeenCalledWith(color);
    expect(step.borderRight.setStrokeWidth).toHaveBeenCalledWith(2);
    expect(step.parentStage.border.setStroke).toHaveBeenCalledWith(color);

  });

  it("It should test manageBorder method, when step has previous step", function() {

    var color = "white";


    step.borderRight = {
      setStroke: function() {},
      setStrokeWidth: function() {}
    };

    step.previousStep = {
      borderRight: {
        setStroke: function() {},
        setStrokeWidth: function() {}
      }
    };

    step.parentStage = {
      border: {
        setStroke: function() {}
      }
    };

    spyOn(step.borderRight, "setStroke");
    spyOn(step.borderRight, "setStrokeWidth");
    spyOn(step.parentStage.border, "setStroke");

    spyOn(step.previousStep.borderRight, "setStroke");
    spyOn(step.previousStep.borderRight, "setStrokeWidth");

    step.manageBorder(color);

    expect(step.previousStep.borderRight.setStroke).toHaveBeenCalledWith(color);
    expect(step.previousStep.borderRight.setStrokeWidth).toHaveBeenCalledWith(2);
    expect(step.borderRight.setStroke).toHaveBeenCalledWith(color);
    expect(step.borderRight.setStrokeWidth).toHaveBeenCalledWith(2);
    expect(step.parentStage.border.setStroke).not.toHaveBeenCalledWith(color);

  });

  describe("Testing manageBorderPrevious method over different conditions", function() {

    it("It should test manageBorderPrevious method, when the selected step is the laste in the stage", function() {

      var color = "white";
      var currentStep = {
        parentStage: {
          index: 1
        }
      };

      step.index = 1;
      
      step.parentStage = {
        index: 1,
        childSteps: [
          { index: 1},
          { index: 2},
        ]
      };

      step.borderRight = {

        setStroke: function() {},
        setStrokeWidth: function() {},
      };

      spyOn(step.borderRight, "setStroke");
      spyOn(step.borderRight, "setStrokeWidth");

      step.manageBorderPrevious(color, currentStep);

      expect(step.borderRight.setStroke).toHaveBeenCalledWith('#cc6c00');
      expect(step.borderRight.setStrokeWidth).toHaveBeenCalledWith(2);
    });

    it("It should test manageBorderPrevious method, when selected step is not the last in the stage", function() {

      var color = "white";
      var currentStep = {
        parentStage: {
          index: 1
        }
      };

      step.index = 1;
      
      step.parentStage = {
        index: 1,
        childSteps: [
          { index: 1},
          { index: 2},
          { index: 3}
        ]
      };

      step.borderRight = {
        setStroke: function() {},
        setStrokeWidth: function() {},
      };

      spyOn(step.borderRight, "setStroke");
      spyOn(step.borderRight, "setStrokeWidth");

      step.manageBorderPrevious(color, currentStep);

      expect(step.borderRight.setStroke).toHaveBeenCalledWith(color);
      expect(step.borderRight.setStrokeWidth).toHaveBeenCalledWith(1);

    });

    it("It should test manageBorderPrevious method, when selected step has previous step", function() {

      var color = "white";
      var currentStep = {
        parentStage: {
          index: 1
        }
      };

      step.index = 1;
      
      step.parentStage = {
        index: 1,
        childSteps: [
          { index: 1},
          { index: 2},
          { index: 3}
        ]
      };

      step.previousStep = {
        borderRight: {
          setStroke: function() {},
          setStrokeWidth: function() {},
        }
      };

      step.borderRight = {
        setStroke: function() {},
        setStrokeWidth: function() {},
      };

      spyOn(step.borderRight, "setStroke");
      spyOn(step.borderRight, "setStrokeWidth");

      spyOn(step.previousStep.borderRight, "setStroke");
      spyOn(step.previousStep.borderRight, "setStrokeWidth");

      step.manageBorderPrevious(color, currentStep);

      expect(step.borderRight.setStroke).toHaveBeenCalledWith(color);
      expect(step.borderRight.setStrokeWidth).toHaveBeenCalledWith(1);

      expect(step.previousStep.borderRight.setStroke).toHaveBeenCalledWith(color);
      expect(step.previousStep.borderRight.setStrokeWidth).toHaveBeenCalledWith(1);
    });

  });

  it("It should test addName method", function() {

    step.index = 10;

    spyOn(_stepGraphics, "addName");

    step.addName();

    expect(step.stepNameText).toEqual('Step 11');
    expect(_stepGraphics.addName).toHaveBeenCalled();
  });
  
  it("It should test addName method when step has model", function() {

    step.model = {
      name: "lazarus"
    };

    spyOn(_stepGraphics, "addName");

    step.addName();

    expect(step.stepNameText).toEqual("Lazarus");
    expect(_stepGraphics.addName).toHaveBeenCalled();
  });

  it("It should test numberingValue method", function() {

    step.numberingTextCurrent = {
      left: 100,
      width: 100,
      setText: function() {},
    };

    step.numberingTextTotal = {
      setText: function() {},
      setLeft: function() {},
    };

    step.index = 5;

    step.parentStage = {
      model: {
        steps: [
          { index: 1 },
          { index: 2 } 
        ]
      }
    };

    spyOn(step.numberingTextCurrent, "setText");
    spyOn(step.numberingTextTotal, "setText");
    spyOn(step.numberingTextTotal, "setLeft");

    step.numberingValue();

    expect(step.numberingTextCurrent.setText).toHaveBeenCalledWith("06");
    expect(step.numberingTextTotal.setText).toHaveBeenCalledWith("/02");
    expect(step.numberingTextTotal.setLeft).toHaveBeenCalledWith(200);

  });

  it("It should test numberingValue method, when index is larger than 9", function() {

    step.numberingTextCurrent = {
      left: 100,
      width: 100,
      setText: function() {},
    };

    step.numberingTextTotal = {
      setText: function() {},
      setLeft: function() {},
    };

    step.index = 10;

    step.parentStage = {
      model: {
        steps: [
          { index: 1 },
          { index: 2 },
          { index: 3 },
          { index: 4 },
          { index: 5 },
          { index: 6 },
          { index: 7 },
          { index: 8 },
          { index: 9 },
          { index: 10 },
          { index: 11 },
          { index: 12 }
        ]
      }
    };

    spyOn(step.numberingTextCurrent, "setText");
    spyOn(step.numberingTextTotal, "setText");
    spyOn(step.numberingTextTotal, "setLeft");

    step.numberingValue();

    expect(step.numberingTextCurrent.setText).toHaveBeenCalledWith("11");
    expect(step.numberingTextTotal.setText).toHaveBeenCalledWith("/12");
    expect(step.numberingTextTotal.setLeft).toHaveBeenCalledWith(200);
  });

  it("It should test rampSpeedGraphics method", function() {

    step.rampSpeedNumber = 6;
    step.rampSpeedGroup = {
      setVisible: function() {}
    };

    spyOn(_stepGraphics, "rampSpeed");
    spyOn(step.rampSpeedGroup, "setVisible");

    step.rampSpeedGraphics();

    expect(_stepGraphics.rampSpeed).toHaveBeenCalled();
    expect(step.rampSpeedGroup.setVisible).toHaveBeenCalledWith(false);

  });

  it("It should test rampSpeedGraphics method, when rampSpeed is less than 5", function() {

    step.rampSpeedNumber = 3;
    step.rampSpeedGroup = {
      setVisible: function() {}
    };

    spyOn(_stepGraphics, "rampSpeed");
    spyOn(step.rampSpeedGroup, "setVisible");

    step.rampSpeedGraphics();

    expect(_stepGraphics.rampSpeed).toHaveBeenCalled();
    expect(step.rampSpeedGroup.setVisible).not.toHaveBeenCalled();
    
  });

  it("It should test swapMoveStepStatus method", function() {

    var status  = true;
    step.dots = {
      setVisible: function() {}
    };

    spyOn(step.dots, "setVisible");

    step.swapMoveStepStatus(status);

    expect(step.dots.setVisible).toHaveBeenCalledWith(status);
  });

  it("It should test render method", function() {

    spyOn(step, "setLeft").and.returnValue(true);
    spyOn(step, "addName").and.returnValue(true);

    spyOn(_stepGraphics, "addBorderRight").and.returnValue(true);
    spyOn(_stepGraphics, "addBorderLeft").and.returnValue(true);
    
    spyOn(step, "getUniqueName").and.returnValue(true);
    spyOn(step, "rampSpeedGraphics").and.returnValue(true);

    spyOn(_stepGraphics, "initNumberText").and.returnValue(true);
    spyOn(_stepGraphics, "initAutoDelta").and.returnValue(true);
    spyOn(_stepGraphics, "autoDeltaDetails").and.returnValue(true);
    
    spyOn(step, "numberingValue").and.returnValue(true);

    spyOn(_stepGraphics, "deleteButton").and.returnValue(true);
    spyOn(_stepGraphics, "stepFooter").and.returnValue(true);
    spyOn(_stepGraphics, "stepComponents").and.returnValue(true);

    step.stepGroup = {};
    step.rampSpeedGroup = {};
    step.closeImage = {};
    step.dots = {};

    spyOn(step.canvas, "add");
    spyOn(step, "setShadows").and.returnValue(true);
    spyOn(step, "addCircle").and.returnValue(true);

    step.render();

    expect(step.setLeft).toHaveBeenCalled();
    expect(step.addName).toHaveBeenCalled();
    expect(_stepGraphics.addBorderRight).toHaveBeenCalled();
    expect(_stepGraphics.addBorderLeft).toHaveBeenCalled();
    expect(step.getUniqueName).toHaveBeenCalled();
    expect(step.rampSpeedGraphics).toHaveBeenCalled();
    expect(_stepGraphics.initNumberText).toHaveBeenCalled();
    expect(_stepGraphics.initAutoDelta).toHaveBeenCalled();
    expect(_stepGraphics.autoDeltaDetails).toHaveBeenCalled();
    expect(step.numberingValue).toHaveBeenCalled();
    expect(_stepGraphics.deleteButton).toHaveBeenCalled();
    expect(_stepGraphics.stepFooter).toHaveBeenCalled();
    expect(_stepGraphics.stepComponents).toHaveBeenCalled();

    expect(step.canvas.add).toHaveBeenCalledTimes(4);

    expect(step.setShadows).toHaveBeenCalled();
    expect(step.addCircle).toHaveBeenCalled();

    expect(step.visualComponents.stepGroup).toEqual(jasmine.any(Object));
  });

  it("It should test setShadows method", function() {

    step.stepName = {
      setShadow: function() {}
    };
    step.deltaSymbol = {
      setShadow: function() {}
    };
    step.autoDeltaTempTime = {
      setShadow: function() {}
    };
    step.autoDeltaStartCycle = {
      setShadow: function() {}
    };
    step.numberingTextCurrent = {
      setShadow: function() {}
    };
    step.numberingTextTotal = {
      setShadow: function() {}
    };

    step.shadowText = "Shadows";
    
    spyOn(step.stepName, "setShadow");
    spyOn(step.deltaSymbol, "setShadow");
    spyOn(step.autoDeltaTempTime, "setShadow");
    spyOn(step.autoDeltaStartCycle, "setShadow");
    spyOn(step.numberingTextCurrent, "setShadow");
    spyOn(step.numberingTextTotal, "setShadow");

    step.setShadows();

    expect(step.stepName.setShadow).toHaveBeenCalled();
    expect(step.deltaSymbol.setShadow).toHaveBeenCalled();
    expect(step.autoDeltaTempTime.setShadow).toHaveBeenCalled();
    expect(step.autoDeltaStartCycle.setShadow).toHaveBeenCalled();
    expect(step.numberingTextCurrent.setShadow).toHaveBeenCalled();
    expect(step.numberingTextTotal.setShadow).toHaveBeenCalled();

  });

  it("It should test manageFooter method", function() {

    var color = "red";
    var obj = {
      name: "ChaiBio",
      setFill: function() {}
    };

    step.dots = {
      forEachObject: function(func) {
        func(obj);
      }
    };

    spyOn(obj, "setFill");

    step.manageFooter(color);

    expect(obj.setFill).toHaveBeenCalled();
  });

  it("It should test manageFooter method when name !== backgroundRect ", function() {

    var color = "red";
    var obj = {
      name: "backgroundRect",
      setFill: function() {}
    };

    step.dots = {
      forEachObject: function(func) {
        func(obj);
      }
    };

    spyOn(obj, "setFill");

    step.manageFooter(color);

    expect(obj.setFill).not.toHaveBeenCalled();
  });

  describe("Testing different scenarios in selectStep method", function() {
    
    it("It should test selectStep method, when no condition is satisfied", function() {

      step.parentStage = {
        parent: {
          editStageStatus: false
        }
      };

      step.stepName = {
        setFill: function() {}
      };

      step.numberingTextCurrent = {
        setFill: function() {}
      };

      step.numberingTextTotal = {
        setFill: function() {}
      };

      spyOn(step, "manageBorder").and.returnValue(true);
      spyOn(step.stepName, "setFill").and.returnValue(true);
      spyOn(step.numberingTextCurrent, "setFill").and.returnValue(true);
      spyOn(step.numberingTextTotal, "setFill").and.returnValue(true);

      step.selectStep();

      expect(step.manageBorder).toHaveBeenCalledWith('black');
      expect(step.stepName.setFill).toHaveBeenCalledWith('black');
      expect(step.numberingTextCurrent.setFill).toHaveBeenCalledWith('black');
      expect(step.numberingTextTotal.setFill).toHaveBeenCalledWith('black');

    });

    it("It should test selectStep method when editStageStatus is true", function() {

      step.parentStage = {
        parent: {
          editStageStatus: true
        }
      };

      step.stepName = {
        setFill: function() {}
      };

      step.numberingTextCurrent = {
        setFill: function() {}
      };

      step.numberingTextTotal = {
        setFill: function() {}
      };

      spyOn(step, "manageBorder").and.returnValue(true);
      spyOn(step.stepName, "setFill").and.returnValue(true);
      spyOn(step.numberingTextCurrent, "setFill").and.returnValue(true);
      spyOn(step.numberingTextTotal, "setFill").and.returnValue(true);
      spyOn(step, "manageFooter").and.returnValue(true);

      step.selectStep();

      expect(step.manageBorder).toHaveBeenCalledWith('black');
      expect(step.stepName.setFill).toHaveBeenCalledWith('black');
      expect(step.numberingTextCurrent.setFill).toHaveBeenCalledWith('black');
      expect(step.numberingTextTotal.setFill).toHaveBeenCalledWith('black');
      expect(step.manageFooter).toHaveBeenCalledWith('black');

    });

    it("It should test selectStep method when editStageStatus is true and has previouslySelected", function() {
      
      _previouslySelected.circle = {

      };

      step.parentStage = {
        parent: {
          editStageStatus: true
        }
      };

      step.stepName = {
        setFill: function() {}
      };

      step.numberingTextCurrent = {
        setFill: function() {}
      };

      step.numberingTextTotal = {
        setFill: function() {}
      };

      spyOn(step, "unSelectStep").and.returnValue(true);
      spyOn(step, "manageBorder").and.returnValue(true);
      spyOn(step.stepName, "setFill").and.returnValue(true);
      spyOn(step.numberingTextCurrent, "setFill").and.returnValue(true);
      spyOn(step.numberingTextTotal, "setFill").and.returnValue(true);
      spyOn(step, "manageFooter").and.returnValue(true);

      step.selectStep();

      expect(step.unSelectStep).toHaveBeenCalled();
      expect(step.manageBorder).toHaveBeenCalledWith('black');
      expect(step.stepName.setFill).toHaveBeenCalledWith('black');
      expect(step.numberingTextCurrent.setFill).toHaveBeenCalledWith('black');
      expect(step.numberingTextTotal.setFill).toHaveBeenCalledWith('black');
      expect(step.manageFooter).toHaveBeenCalledWith('black');

    });

  });

  it("It should test unSelectedStep method", function() {

    step.parentStage = {
      parent: {
        editStageStatus: false
      }
    };

    _previouslySelected.circle = {
      parent: {
        manageBorderPrevious: function() {},
        stepName: {
          setFill: function() {}
        },
        numberingTextCurrent: {
          setFill: function() {}
        },
        numberingTextTotal: {
          setFill: function() {}
        }

      }
    };   

    var prevStep = _previouslySelected.circle.parent;

    spyOn(prevStep, "manageBorderPrevious");
    spyOn(prevStep.stepName, "setFill");
    spyOn(prevStep.numberingTextCurrent, "setFill");
    spyOn(prevStep.numberingTextTotal, "setFill");

    step.unSelectStep();

    expect(prevStep.manageBorderPrevious).toHaveBeenCalled();
    expect(prevStep.stepName.setFill).toHaveBeenCalled();
    expect(prevStep.numberingTextCurrent.setFill).toHaveBeenCalled();
    expect(prevStep.numberingTextTotal.setFill).toHaveBeenCalled();

  });

  it("It should test unSelectedStep method when editStageStatus is true", function() {

    step.parentStage = {
      parent: {
        editStageStatus: true
      }
    };

    _previouslySelected.circle = {
      parent: {
        manageBorderPrevious: function() {},
        stepName: {
          setFill: function() {}
        },
        numberingTextCurrent: {
          setFill: function() {}
        },
        numberingTextTotal: {
          setFill: function() {}
        },
        manageFooter: function() {}
      }
    };   

    var prevStep = _previouslySelected.circle.parent;

    spyOn(prevStep, "manageBorderPrevious");
    spyOn(prevStep.stepName, "setFill");
    spyOn(prevStep.numberingTextCurrent, "setFill");
    spyOn(prevStep.numberingTextTotal, "setFill");
    spyOn(prevStep, "manageFooter");

    step.unSelectStep();

    expect(prevStep.manageBorderPrevious).toHaveBeenCalled();
    expect(prevStep.stepName.setFill).toHaveBeenCalled();
    expect(prevStep.numberingTextCurrent.setFill).toHaveBeenCalled();
    expect(prevStep.numberingTextTotal.setFill).toHaveBeenCalled();
    expect(prevStep.manageFooter).toHaveBeenCalled();
  });

});
