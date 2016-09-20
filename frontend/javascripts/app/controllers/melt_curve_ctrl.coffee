###
Chai PCR - Software platform for Open qPCR and Chai's Real-Time PCR instruments.
For more information visit http://www.chaibio.com

Copyright 2016 Chai Biotechnologies Inc. <info@chaibio.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
###
App.controller 'MeltCurveChartCtrl', [
  '$scope'
  'Experiment'
  '$stateParams'
  'MeltCurveService'
  '$timeout'
  '$interval'
  '$rootScope'
  ($scope, Experiment, $stateParams, MeltCurveService, $timeout, $interval, $rootScope) ->

    $scope.curve_type = 'derivative'
    $scope.color_by = 'well'
    $scope.config = MeltCurveService.chartConfig()
    # $scope.chartConfigNormalized = MeltCurveService.chartConfig('normalized')
    $scope.data = MeltCurveService.defaultData()
    # has_data = false
    retryInterval = null
    # PARSED_DATA = null
    # OPTIMIZED_DATA = null
    $scope.retrying = false
    $scope.retry = 0
    $scope.fetching = false

    $scope.$on 'status:data:updated', (e, data, oldData) ->
      return if !data
      return if !data.experiment_controller
      $scope.statusData = data
      $scope.state = data.experiment_controller.machine.state
      $scope.thermal_state = data.experiment_controller.machine.thermal_state
      $scope.oldState = oldData?.experiment_controller?.machine?.state || 'NONE'
      $scope.isCurrentExp = parseInt(data.experiment_controller.experiment?.id) is parseInt($stateParams.id)
      if $scope.isCurrentExp is true
        $scope.enterState = $scope.isCurrentExp


    retry = ->
      return if $scope.retrying
      $scope.retrying = true
      $scope.retry = 5
      retryInterval = $interval ->
        $scope.retry = $scope.retry - 1
        if $scope.retry is 0
          $interval.cancel(retryInterval)
          $scope.error = null
          $scope.retrying = false
          getMeltCurveData(getMeltCurveDataCallBack)
      , 1000

    getMeltCurveData = (cb) ->
      gofetch = if !$scope.fetching and
                $scope.RunExperimentCtrl.chart is 'melt-curve' and
                !$scope.retrying then true else false

      if gofetch
        $scope.fetching = true
        # $timeout ->
        Experiment.getMeltCurveData($stateParams.id)
        .then (resp) ->
          if (resp.data?.partial and $scope.enterState) or (!resp.data.partial)
            $scope.has_data = true
          if !resp.data.partial
            $rootScope.$broadcast 'complete'
          if (cb and resp.data.ramps?[0].melt_curve_data and $scope.enterState) or (cb and resp.data.ramps?[0].melt_curve_data and !resp.data.partial )
            cb(resp.data)
          else
            $scope.fetching = false
          if resp.status is 202 or resp.data?.partial
            retry()

        .catch (resp) ->
          $scope.fetching = false
          if resp.status is 500
            $scope.error = if resp.data?.errors then resp.data.errors else 'Unable to retrieve melt curve data due to some error.'
          retry()
        # , 1500

    getExperiment = (cb) ->
      Experiment.get(id: $stateParams.id).then (data) ->
        $scope.experiment = data.experiment
        cb(data.experiment) if !!cb

    # updateConfigs = (opts) ->
    #   $scope.chartConfigDerivative = _.defaultsDeep angular.copy(opts), $scope.chartConfigDerivative
    #   $scope.chartConfigNormalized = _.defaultsDeep angular.copy(opts), $scope.chartConfigNormalized

    # updateResolutionOptions = (data) ->
    #   zoom_calibration = 10
    #   zoom_unit = Math.ceil(data['well_0'].length/zoom_calibration)
    #   $scope.resolutionOptions = []
    #   for i in [zoom_calibration..1] by -1
    #     $scope.resolutionOptions.push(zoom_unit*i)

    #   OPTIMIZED_DATA = MeltCurveService.optimizeForEachResolution(PARSED_DATA, $scope.resolutionOptions)

    updateButtonTms = (data) ->
      for well_data, well_i in data.ramps[0].melt_curve_data by 1
        $scope.wellButtons["well_#{well_i}"].ct = [MeltCurveService.averagedTm(well_data.tm)]


    updateSeries = ->
      buttons = $scope.wellButtons || {}
      # channel_count = if $scope.is_dual_channel then 2 else 1
      # chartConfig = if $scope.curve_type is 'derivative' then 'chartConfigDerivative' else 'chartConfigNormalized'

      $scope.config.series = []

      for i in [0..15] by 1
        if buttons["well_#{i}"]?.selected
          $scope.config.series.push
            y: $scope.curve_type
            x: 'temperature'
            dataset: "well_#{i}"
            color: buttons["well_#{i}"].color

    # changeResolution = ->
    #   updateScrollBarWidth()
    #   moveData()
      # data = MeltCurveService.optimizeForResolution(PARSED_DATA, resolution)
      # console.log data
      # $scope.data = data

    # updateScrollBarWidth = ->
    #   scrollbar_width = $('#melt-curve-scrollbar').width()
    #   new_width = scrollbar_width * ((10 - $scope.mc_zoom)/10)
    #   $('#melt-curve-scrollbar .scrollbar').css('width', "#{new_width}px")

    # moveData = ->
    #   data = OPTIMIZED_DATA[$scope.mc_zoom]
    #   resolution = $scope.resolutionOptions[$scope.mc_zoom]
    #   data_length = PARSED_DATA['well_0'].length
    #   $scope.data = MeltCurveService.moveData(data, data_length, resolution, $scope.mc_scroll)

    getMeltCurveDataCallBack = (data) ->
      updateButtonTms(data)

      MeltCurveService.parseData(data.ramps[0].melt_curve_data).then (data) ->
        $scope.data = data
        console.log data
        y_extrems = MeltCurveService.getYExtrems(data, $scope.curve_type)
        # updateConfigs
        #   axes:
        #     y:
        #       min: y_extrems.min
        #       max: y_extrems.max

        # has_data = true
        # PARSED_DATA = angular.copy(data)
        # updateResolutionOptions(data)
        # changeResolution()

        $scope.fetching = false
        $scope.hasData = true

    $scope.$watch ->
      $scope.RunExperimentCtrl.chart
    , (chart) ->
      if chart is 'melt-curve'
# <<<<<<< HEAD
        if !$scope.hasData
          getMeltCurveData(getMeltCurveDataCallBack)
          $scope.enterState = false
          $scope.data = MeltCurveService.defaultData()
          $scope.has_data = false
# =======
#         #if !has_data
#           getExperiment (exp) ->
#             getMeltCurveData(getMeltCurveDataCallBack)
# >>>>>>> master

        $timeout ->
          $scope.showMeltCurveChart = true
        , 1000
      else
        $scope.showMeltCurveChart = false

    $scope.$watch ->
      $scope.curve_type
    , (type) ->
      return if $scope.RunExperimentCtrl.chart isnt 'melt-curve'
      # y_extrems = MeltCurveService.getYExtrems(PARSED_DATA, type)
      # updateConfigs
      #   axes:
      #     y:
      #       min: y_extrems.min
      #       max: y_extrems.max

      updateSeries()

    $scope.onZoom = (transform, w, h, scale_extent) ->
      # console.log transform, w, h, scale_extent
      $scope.mc_scroll = {
        value: Math.abs(transform.x/(w*transform.k - w))
        width: w/(w*transform.k)
      }
      $scope.mc_zoom = (transform.k - 1)/ (scale_extent-1)

      # $timeout ->
      #   $scope.$broadcast '$reload:n3:charts'
      # , 1000

    $scope.$watchCollection 'wellButtons', (buttons) ->
      return if !buttons
      updateSeries()

    $scope.$on '$destroy', ->
      $interval.cancel(retryInterval) if retryInterval

]
