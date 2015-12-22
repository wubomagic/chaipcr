#include "datahandler.h"

#include <iostream>

#include <Poco/Net/HTTPServerRequest.h>
#include <Poco/Net/HTTPServerResponse.h>
#include <Poco/Net/MultipartReader.h>
#include <Poco/Net/MessageHeader.h>

DataHandler::DataHandler()
    :DataHandler(Poco::Net::HTTPResponse::HTTP_OK)
{

}

DataHandler::DataHandler(Poco::Net::HTTPResponse::HTTPStatus status)
{
    setStatus(status);
}

void DataHandler::handleRequest(Poco::Net::HTTPServerRequest &request, Poco::Net::HTTPServerResponse &response)
{
    try
    {
        processRequest(request);

        response.setStatusAndReason(getStatus(), Poco::Net::HTTPServerResponse::getReasonForStatus(getStatus()));

        //CORS
        response.add("Access-Control-Allow-Origin", "*");
        response.add("Access-Control-Allow-Headers", "X-Requested-With, X-Prototype-Version, X-CSRF-Token, Authorization");

        processResponse(response);
    }
    catch (const std::exception &ex)
    {
        std::cout << "DataHandler::handleRequest - " << ex.what() << '\n';
    }
    catch (...)
    {
        std::cout << "DataHandler::handleRequest - unknown error\n";
    }
}

void DataHandler::processResponse(Poco::Net::HTTPServerResponse &response)
{
    response.send().flush();
}
