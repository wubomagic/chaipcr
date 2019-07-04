## optical_cal.jl
#
## uses prep_normalize() to check validity of calibration data

import DataStructures.OrderedDict
import JSON.json
import Memento.debug


## called by dispatch()
function act(
    ::Val{optical_calibration},
    req_dict    ::Associative;
    well_nums   ::AbstractVector =[],
    out_format  ::Symbol = :pre_json,
    ## remove MySql dependency  
    #
    # db_conn::MySQL.MySQLHandle,
    # exp_id::Integer, ## not used for computation
    # calib_info::Union{Integer,OrderedDict}; ## really used
    dye_in      ::Symbol = :FAM, 
    dyes_2bfild ::Vector =[]
)
    debug(logger, "at act(::Val{optical_calibration})")
 
    ## remove MySql dependency
    # calib_info_ori = calib_info
    # calib_info_dict = ensure_ci(db_conn, calib_info_ori)
    # print_v(
    #     println, verbose,
    #     "original: ", calib_info_ori,
    #     "dict: ", calib_info_dict
    # )

    ## calibration data is required
    if !(haskey(req_dict, CALIBRATION_INFO_KEY) &&
        typeof(req_dict[CALIBRATION_INFO_KEY]) <: Associative)
            return fail(logger, ArgumentError(
                "no calibration information found")) |> out(out_format)
    end
    const calib_info_dict = req_dict[CALIBRATION_INFO_KEY]
    const result_aw = try
            prep_normalize(calib_info_dict, well_nums, dye_in, dyes_2bfild)
        catch err
            return fail(logger, err; bt=true) |> out(out_format)
        end
    if (length(calib_info_dict) >= 3)
        ## get_k
        ## if there are 2 or more channels then
        ## the deconvolution matrix K is calculated
        ## otherwise deconvolution is not performed
        const result_k = try
                get_k(calib_info_dict, well_nums)
            catch err
                return fail(logger, err; bt=true) |> out(out_format)
            end
        (length(result_k.inv_note) > 0) &&
            return fail(logger, result_k.inv_note) |> out(out_format)
    end ## if

    return OrderedDict(:valid => true) |> out(out_format)
end ## act(::Val{optical_calibration})