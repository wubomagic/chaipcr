require 'zip'
require 'rserve'

class ExperimentsController < ApplicationController
  include ParamsHelper
  
  #before_filter :ensure_authenticated_user
  before_filter :get_experiment, :except => [:index, :create, :copy]
  
  respond_to :json

  resource_description { 
    formats ['json']
  }
  
  RSERVE_TIMEOUT  = 90
  
  def_param_group :experiment do
    param :experiment, Hash, :desc => "Experiment Info", :required => true do
      param :name, String, :desc => "Name of the experiment", :required => false
      param :guid, String, :desc => "GUID used for diagnostic or calibration", :required => false
    end
  end
  
  api :GET, "/experiments", "List all the experiments"
  example "[{'experiment':{'id':1,'name':'test1','type':'user','started_at':null,'completed_at':null,'completed_status':null}},{'experiment':{'id':2,'name':'test2','type':'user','started_at':null,'completed_at':null,'completed_status':null}}]"
  def index
    @experiments = Experiment.includes(:experiment_definition).where("experiment_definitions.experiment_type"=>"user").load
    respond_to do |format|
      format.json { render "index", :status => :ok }
    end
  end
  
  api :POST, "/experiments", "Create an experiment"
  param_group :experiment
  description "when experiment is created, default protocol will be created"
  example "{'experiment':{'id':1,'name':'test','type':'user','started_at':null,'completed_at':null,'completed_status':null,'protocol':{'id':1,'lid_temperature':'110.0','stages':[{'stage':{'id':1,'stage_type':'holding','name':'Holding Stage','num_cycles':1,'steps':[{'step':{'id':1,'name':'Step 1','temperature':'95.0','hold_time':180,'ramp':{'id':1,'rate':'100.0','max':true}}}]}},{'stage':{'id':2,'stage_type':'cycling','name':'Cycling Stage','num_cycles':40,'steps':[{'step':{'id':2,'name':'Step 2','temperature':'95.0','hold_time':30,'ramp':{'id':2,'rate':'100.0','max':true}}},{'step':{'id':3,'name':'Step 2','temperature':'60.0','hold_time':30,'ramp':{'id':3,'rate':'100.0','max':true}}}]}},{'stage':{'id':3,'stage_type':'holding','name':'Holding Stage','num_cycles':1,'steps':[{'step':{'id':4,'name':'Step 1','temperature':'4.0','hold_time':0,'ramp':{'id':4,'rate':'100.0','max':true}}}]}}]}}}"
  def create
    if params[:experiment][:guid].nil?
      experiment_definition = ExperimentDefinition.new(:name=>params[:experiment][:name], :experiment_type=>ExperimentDefinition::TYPE_USER_DEFINED)
      experiment_definition.protocol_params = params[:experiment][:protocol]
    else
      experiment_definition = ExperimentDefinition.where("guid=?", params[:experiment][:guid]).first
    end
    @experiment = Experiment.new
    @experiment.experiment_definition = experiment_definition
    ret = @experiment.save
    respond_to do |format|
      format.json { render "fullshow", :status => (ret)? :ok : :unprocessable_entity}
    end
  end
  
  api :PUT, "/experiments/:id", "Update an experiment"
  param_group :experiment
  example "{'experiment':{'id':1,'name':'test','type':'user','started_at':null,'completed_at':null,'completed_status':null}}"
  def update
    if @experiment == nil || !@experiment.experiment_definition.editable? #if experiment has been run, the name is still editable
      render json: {errors: "The experiment is not editable"}, status: :unprocessable_entity
      return
    end
    ret = @experiment.experiment_definition.update_attributes(experiment_params)
    respond_to do |format|
      format.json { render "show", :status => (ret)? :ok :  :unprocessable_entity}
    end
  end
  
  api :POST, "/experiments/:id/copy", "Copy an experiment"
  see "experiments#create", "json response"
  def copy
    old_experiment = Experiment.includes(:experiment_definition).find_by_id(params[:id])
    experiment_definition = old_experiment.experiment_definition.copy(params[:experiment]? experiment_params : nil)
    @experiment = Experiment.new
    @experiment.experiment_definition = experiment_definition
    ret = @experiment.save
    respond_to do |format|
      format.json { render "fullshow", :status => (ret)? :ok :  :unprocessable_entity}
    end
  end
  
  api :GET, "/experiments/:id", "Show an experiment"
  see "experiments#create", "json response"
  def show
    @experiment.experiment_definition.protocol.stages.load
    respond_to do |format|
      format.json { render "fullshow", :status => (@experiment)? :ok :  :unprocessable_entity}
    end
  end
  
  api :DELETE, "/experiments/:id", "Destroy an experiment"
  def destroy
    ret = @experiment.destroy
    respond_to do |format|
      format.json { render "destroy", :status => (ret)? :ok :  :unprocessable_entity}
    end
  end
  
  api :GET, "/experiments/:id/temperature_data?starttime=xx&endtime=xx&resolution=xx", "Retrieve temperature data"
  param :starttime, Integer, :desc => "0 means start of the experiment, in ms", :required => true
  param :endtime, Integer, :desc => "if not specified, it returns everything to the end of the experiment, in ms"
  param :resolution, Integer, :desc => "Include data points for every x milliseconds. Must be a multiple of 1000 ms"
  def temperature_data
    @temperatures =  @experiment.temperature_logs.with_range(params[:starttime], params[:endtime], params[:resolution])
    respond_to do |format|
      format.json { render "temperature_data", :status => :ok}
    end
  end

  api :GET, "/experiments/:id/fluorescence_data", "Retrieve fluorescence data"
  example "{'total_cycles':40,'ct':['1.0',null,'1.28','20.19','1.0','20.83','20.21','19.23','21.02','15.33','15.11','15.14','15.21','14.67','14.97',null],
  'fluorescence_data':[{'baseline_subtracted_value':1.4299,'background_subtracted_value':1.234,'well_num':1,'cycle_num':1},
                        {'baseline_subtracted_value':1.4299,'background_subtracted_value':1.234,'well_num':2,'cycle_num':1}]}"
  def fluorescence_data
    if @experiment
      if @experiment.ran?
        if params[:step_id] == nil && params[:ramp_id] == nil
          @first_stage_collect_data = Stage.collect_data.where(["experiment_definition_id=?",@experiment.experiment_definition_id]).first
          if !@first_stage_collect_data.blank?
            if FluorescenceDatum.new_data_generated?(@experiment.id, @first_stage_collect_data.id)
              begin
                 @amplification_data, @ct = retrieve_amplification_data(@experiment.id, @first_stage_collect_data.id, @experiment.calibration_id)
              rescue => e
                 render :json=>{:errors=>e.to_s}, :status => 500
                 return
              end
              #update cache
              AmplificationDatum.import @amplification_data, :on_duplicate_key_update => [:background_subtracted_value,:baseline_subtracted_value]
              AmplificationCurve.import @ct.each_with_index.map {|ct,well_num| AmplificationCurve.new(:experiment_id=>@experiment.id, :stage_id=>@first_stage_collect_data.id, :well_num=>well_num, :ct=>ct)}, :on_duplicate_key_update => [:ct]
            else #cached
              @amplification_data = AmplificationDatum.where(:experiment_id=>@experiment.id, :stage_id=>@first_stage_collect_data.id)
              @ct = AmplificationCurve.where(:experiment_id=>@experiment.id, :stage_id=>@first_stage_collect_data.id).order(:well_num).select(:ct).map{|r| r.ct}
            end
          end
        else
          #construct OR clause
          conditions = String.new
          wheres = Array.new
          if params[:step_id]
            conditions << " OR " unless conditions.length == 0
            conditions << "step_id IN (?)"
            wheres << params[:step_id].map(&:to_i)
          end
          if params[:ramp_id]
            conditions << " OR " unless conditions.length == 0
            conditions << "ramp_id IN (?)"
            wheres << params[:ramp_id].map(&:to_i)
          end
          wheres.insert(0, conditions)
          #query to database
          @fluorescence_data = FluorescenceDatum.where("experiment_id=?",@experiment.id).where(wheres).order("step_id, ramp_id, cycle_num, well_num")
          #group data
          keyname = nil
          key = nil
          datalist = nil
          @amplification_data_group = Array.new
          @fluorescence_data.each do |data|
            if data.step_id != nil && data.step_id != key
              @amplification_data_group << OpenStruct.new(keyname=>key, :data=>datalist) if key != nil
              key = data.step_id
              keyname = :step_id
              datalist = [data]
            elsif data.ramp_id != nil && data.ramp_id != key
              @amplification_data_group << OpenStruct.new(keyname=>key, :data=>datalist) if key != nil
              key = data.ramp_id
              keyname = :ramp_id
              datalist = [data]
            else
              datalist << data
            end
          end
          @amplification_data_group << OpenStruct.new(keyname=>key, :data=>datalist) if key != nil
          respond_to do |format|
            format.json { render "amplification_data_group", :status => :ok}
          end
          return
        end
      else
        @amplification_data = []
        @ct = []
      end
      respond_to do |format|
        format.json { render "amplification_data", :status => :ok}
      end
    else
      render :json=>{:errors=>"experiment not found"}, :status => :not_found
    end
  end
  
  api :GET, "/experiments/:id/melt_curve_data", "Retrieve melt curve data"
  example "{'melt_curve_data':[{'well_num':0, 'temperature':[0,1,2,3,4,5], 'fluorescence_data':[0,1,2,3,4,5], 'derivative':[0,1,2,3,4,5], 'tm':[1,2,3], 'area':[2,4,5]},
                               {'well_num':1, 'temperature':[0,1,2,3,4,5], 'fluorescence_data':[0,1,2,3,4,5], 'derivative':[0,1,2,3,4,5], 'tm':[1,2,3], 'area':[2,4,5]}]}"
  def melt_curve_data
    if @experiment
      if @experiment.ran?
        @first_stage_meltcurve_data = Stage.joins(:protocol).where(["experiment_definition_id=? and stage_type='meltcurve'", @experiment.experiment_definition_id]).first
        if !@first_stage_meltcurve_data.blank?
          begin
            @melt_curve_data = retrieve_melt_curve_data(@experiment.id, @first_stage_meltcurve_data.id, @experiment.calibration_id)
          rescue => e
            render :json=>{:errors=>e.to_s}, :status => 500
            return
          end
        end
      else
        @melt_curve_data = []
      end
      respond_to do |format|
        format.json { render "melt_curve_data", :status => :ok}
      end
    else
      render :json=>{:errors=>"experiment not found"}, :status => :not_found
    end
  end
    
  api :GET, "/experiments/:id/export.zip", "zip temperature, amplification and meltcurv csv files"
  def export
    respond_to do |format|
      format.zip {
        buffer = Zip::OutputStream.write_buffer do |out|
          out.put_next_entry("qpcr_experiment_#{(@experiment)? @experiment.name : "null"}/temperature_log.csv")
          out.write TemperatureLog.as_csv(params[:id])
          
          first_stage_collect_data = Stage.collect_data.where(["experiment_definition_id=?",@experiment.experiment_definition_id]).first
          if first_stage_collect_data
            begin
              amplification_data, ct = retrieve_amplification_data(@experiment.id, first_stage_collect_data.id, @experiment.calibration_id)
            rescue => e
              logger.error("export amplification data failed: #{e}")
            end
          end
          
          out.put_next_entry("qpcr_experiment_#{(@experiment)? @experiment.name : "null"}/amplification.csv")
          columns = ["well_num", "cycle_num"]
          csv_string = CSV.generate do |csv|
            csv << ["baseline_subtracted_value", "background_subtracted_value"]+columns
            if amplification_data
              amplification_data.each do |data|
                csv << [data.baseline_subtracted_value, data.background_subtracted_value]+data.attributes.values_at(*columns)
              end
            end
          end
          out.write csv_string
          
          out.put_next_entry("qpcr_experiment_#{(@experiment)? @experiment.name : "null"}/ct.csv")
          csv_string = CSV.generate do |csv|
            csv << ["well_num", "ct"];
            if ct
              i = 0
              ct.each do |e|
                csv << [i, e]
                i += 1
              end
            end
          end
          out.write csv_string
          
          first_stage_meltcurve_data = Stage.joins(:protocol).where(["experiment_definition_id=? and stage_type='meltcurve'", @experiment.experiment_definition_id]).first
          if first_stage_meltcurve_data
            begin
              melt_curve_data = retrieve_melt_curve_data(@experiment.id, first_stage_meltcurve_data.id, @experiment.calibration_id)
            rescue => e
              logger.error("export melt curve data failed: #{e}")
            end
          end
          
          out.put_next_entry("qpcr_experiment_#{(@experiment)? @experiment.name : "null"}/melt_curve_data.csv")
          columns = ["well_num", "temperature", "fluorescence_data", "derivative"]
          csv_string = CSV.generate do |csv|
            csv << columns
            if melt_curve_data
              melt_curve_data.each do |data|
                data.temperature.each_index do |index|
                  csv << [data.well_num, data.temperature[index], data.fluorescence_data[index], data.derivative[index]]
                end
              end
            end
          end
          out.write csv_string
          
          out.put_next_entry("qpcr_experiment_#{(@experiment)? @experiment.name : "null"}/melt_curve_analysis.csv")
          columns = ["well_num", "Tm1", "Tm2", "Tm3", "Tm4", "area1", "area2", "area3", "area4"]
          csv_string = CSV.generate do |csv|
            csv << columns
            if melt_curve_data
              melt_curve_data.each do |data|
                tm_arr = (data.tm.is_a?Array)? [data.tm[0], data.tm[1], data.tm[2], data.tm[3]] : [data.tm, nil, nil, nil]
                area_arr = (data.area.is_a?Array)? [data.area[0], data.area[1], data.area[2], data.area[3]] : [data.area, nil, nil, nil]
                csv << [data.well_num]+tm_arr+area_arr
              end
            end
          end
          out.write csv_string
          
        end
        buffer.rewind
        send_data buffer.sysread
      }
    end
  end
  
  def analyze
    if @experiment && !@experiment.experiment_definition.guid.blank?
      config   = Rails.configuration.database_configuration
      connection = Rserve::Connection.new(:timeout=>RSERVE_TIMEOUT)
      begin
        connection.eval("source(\"#{Rails.configuration.dynamic_file_path}/#{@experiment.experiment_definition.guid}/analyze.R\")")
        response = connection.eval("tryCatchError(analyze, '#{config[Rails.env]["username"]}', '#{(config[Rails.env]["password"])? config[Rails.env]["password"] : ""}', '#{(config[Rails.env]["host"])? config[Rails.env]["host"] : "localhost"}', #{(config[Rails.env]["port"])? config[Rails.env]["port"] : 3306}, '#{config[Rails.env]["database"]}', #{@experiment.id}, #{@experiment.calibration_id})").to_ruby
      rescue  => e
        logger.error("Rserve error: #{e}")
        kill_process("Rserve") if e.is_a? Rserve::Talk::SocketTimeoutError
        render :json=>{:errors=>"Internal Server Error (#{e})"}, :status => 500
        return
      ensure
        connection.close
      end
      if response.is_a? String
        render :json=>response
      elsif response && !response["message"].blank?
        render :json=>{:errors=>response["message"]}, :status => 500
      else
        render :json=>{:errors=>"R code response is not json: #{response}"}, :status => 500
      end
      return
    else
      render :json=>{:errors=>"experiment not found"}, :status => :not_found
    end
  end
  
  protected
  
  def get_experiment
    @experiment = Experiment.find_by_id(params[:id]) if @experiment.nil?
  end
  
  def retrieve_amplification_data(experiment_id, stage_id, calibration_id)
    config   = Rails.configuration.database_configuration
    connection = Rserve::Connection.new(:timeout=>RSERVE_TIMEOUT)
    start_time = Time.now
    begin
      results = connection.eval("tryCatchError(get_amplification_data, '#{config[Rails.env]["username"]}', '#{(config[Rails.env]["password"])? config[Rails.env]["password"] : ""}', '#{(config[Rails.env]["host"])? config[Rails.env]["host"] : "localhost"}', #{(config[Rails.env]["port"])? config[Rails.env]["port"] : 3306}, '#{config[Rails.env]["database"]}', #{experiment_id}, #{stage_id}, #{calibration_id})")
    rescue  => e
      logger.error("Rserve error: #{e}")
      kill_process("Rserve") if e.is_a? Rserve::Talk::SocketTimeoutError
      raise e
    ensure
      connection.close
    end
    logger.info("R code time #{Time.now-start_time}")
    start_time = Time.now
    results = results.to_ruby
    amplification_data = []
    if !results.blank?
      raise results["message"] if !results["message"].blank? #catched error
      background_subtracted_results = results[0]
      baseline_subtracted_results = results[1][0]
      (1...background_subtracted_results.length).each do |well_num|
        if background_subtracted_results[well_num].is_a? Array
          (0...background_subtracted_results[well_num].length).each do |cycle_num|
            amplification_data << AmplificationDatum.new(:experiment_id=>experiment_id, :stage_id=>stage_id, :well_num=>well_num-1, :cycle_num=>cycle_num+1, :background_subtracted_value=>background_subtracted_results[well_num][cycle_num], :baseline_subtracted_value=>(baseline_subtracted_results.is_a? Array)? baseline_subtracted_results[well_num-1][cycle_num] : baseline_subtracted_results[cycle_num, well_num-1])
          end
        else
          amplification_data << AmplificationDatum.new(:experiment_id=>experiment_id, :stage_id=>stage_id, :well_num=>well_num-1, :cycle_num=>1, :background_subtracted_value=>background_subtracted_results[well_num], :baseline_subtracted_value=>baseline_subtracted_results[well_num-1])
        end
      end
      ct = results[2][0].row(0)
    end 
    logger.info("Rails code time #{Time.now-start_time}")
    return amplification_data, ct
  end
  
  def retrieve_melt_curve_data(experiment_id, stage_id, calibration_id)
    config   = Rails.configuration.database_configuration
    connection = Rserve::Connection.new(:timeout=>RSERVE_TIMEOUT)
    start_time = Time.now
    begin
      results = connection.eval("tryCatchError(process_mc, '#{config[Rails.env]["username"]}', '#{(config[Rails.env]["password"])? config[Rails.env]["password"] : ""}', '#{(config[Rails.env]["host"])? config[Rails.env]["host"] : "localhost"}', #{(config[Rails.env]["port"])? config[Rails.env]["port"] : 3306}, '#{config[Rails.env]["database"]}', #{experiment_id}, #{stage_id}, #{calibration_id})")
    rescue  => e
      logger.error("Rserve error: #{e}")
      kill_process("Rserve") if e.is_a? Rserve::Talk::SocketTimeoutError
      raise e
    ensure
      connection.close
    end
    logger.info("R code time #{Time.now-start_time}")
    start_time = Time.now
    results = results.to_ruby
    melt_curve_data = []
    if !results.blank?
      raise results["message"] if !results["message"].blank? #catched error
      results.each_index do |i|
        results_per_well = results[i]
        hash = OpenStruct.new({:well_num=>i, :temperature=>results_per_well[0][0], :fluorescence_data=>results_per_well[0][1], :derivative=>results_per_well[0][2], :tm=>results_per_well[1][0], :area=>results_per_well[1][1]})
        melt_curve_data << hash
      end
    end 
    logger.info("Rails code time #{Time.now-start_time}")
    return melt_curve_data
  end
  
end