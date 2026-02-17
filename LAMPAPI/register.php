<?php

    $inData = getRequestInfo();

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");
    if ($conn->connect_error) 
    {
        returnWithError( $conn->connect_error );
    } 
    else
    {
        $checkStmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
        $checkStmt->bind_param("s", $inData["login"]);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        
        if ($checkResult->num_rows > 0)
        {
            returnWithError("Username already exists. Please choose a different username.");
            $checkStmt->close();
            $conn->close();
            return;
        }
        
        $checkStmt->close();
        
        $md5pswd = md5($inData["password"]);

        $stmt = $conn->prepare("INSERT into Users (FirstName, LastName, Login, Password) VALUES(?,?,?,?)");
        $stmt->bind_param("ssss", $inData["firstName"], $inData["lastName"], $inData["login"], $md5pswd);
        
        if( $stmt->execute() )
        {
            returnWithError("");
        }
        else
        {
            returnWithError("Registration Failed. Please try again.");
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson( $obj )
    {
        header('Content-type: application/json');
        echo $obj;
    }
    
    function returnWithError( $err )
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson( $retValue );
    }
    
?>
