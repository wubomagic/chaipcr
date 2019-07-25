#===============================================================================

    macros.jl

    container for data associated with a field in an Input struct

    Author: Tom Price
    Date:   July 2019

===============================================================================#



"Make a struct from predefined collection of Fields"
macro make_struct_from_SCHEMA(structname, super = Any, mutable = false)
    fields = SCHEMA |> mold(var_arg)
    esc(
        Expr(:type,
            mutable,
            Expr(:(<:), structname, super),
            Expr(:block, fields...)))
end ## macro


"Make a constructor method with default values from predefined collection of Fields"
macro make_constructor_from_SCHEMA(structname)
    no_constructor = SCHEMA |> mold(no_default) |> all
    if !no_constructor
        kw_args  = SCHEMA |> sift(!no_default) |> mold(kw_arg)
        var_args = SCHEMA |> sift( no_default) |> mold(var_arg)
        varnames = SCHEMA |> mold(field(:name))
        esc(
            Expr(:(=),
                Expr(:call,
                    structname,
                    Expr(:parameters, kw_args...),
                    var_args...),
                Expr(:block,
                    Expr(:call, structname, varnames...))))
    end
end ## macro

"Parse raw data data from `req_dict`"
macro parse_raw_data_from_req_dict(action)
    esc( :(
        begin
            req_key(RAW_DATA_KEY) ||
                return ArgumentError(
                    "no raw data for " * string($action) * " analysis in request")
            const parsed_raw_data = try
                parse_raw_data(Val{$action}, req_dict[RAW_DATA_KEY])
            catch()
                ArgumentError(
                    "cannot parse raw data for " * string($action) * " analysis")
            end ## try
            isa(parsed_raw_data, ArgumentError) &&
                return fail(logger, parsed_raw_data)
        end ) )
end ## macro

"Get calibration data from `req_dict`"
macro get_calibration_data_from_req_dict(action)
    esc( :(
        begin
            req_key = curry(haskey)(req_dict)
            req_key(CALIBRATION_INFO_KEY) ||
                return ArgumentError(
                    "no calibration data for " * string($action) * " analysis in request")
            const calibration_data = try
                CalibrationData(req_dict[CALIBRATION_INFO_KEY])
            catch()
                ArgumentError(
                    "cannot parse calibration data for " * string($action) * " analysis")
            end ## try
            isa(calibration_data, ArgumentError) &&
                return fail(logger, calibration_data)
        end ) )
end ## macro

## usage:
# println(@expand @make_struct MyStruct (a, Int) (b, Float64) )
# @makestruct MyStruct (a, Int) (b, Float64)
# macro make_struct(name, schema...)
#     fields = [  :( $(entry.args[1])::$(entry.args[2]) )
#                 for entry in schema ]
#     esc(:(
#         struct $name
#             $(fields...)
#         end ## end of struct
#         ) )
# end ## end of macro
