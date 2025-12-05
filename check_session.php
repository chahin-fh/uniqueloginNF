<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['user_id'])) {
    // Get user info from database
    $servername = "localhost";
    $db_username = "root";
    $db_password = "";
    $database = "login_system";

    $conn = new mysqli($servername, $db_username, $db_password, $database);

    if ($conn->connect_error) {
        echo json_encode([
            'logged_in' => false,
            'message' => 'Database connection failed'
        ]);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $query = $conn->prepare("SELECT username, email, created_at FROM users WHERE id = ?");
    $query->bind_param("i", $user_id);
    $query->execute();
    $result = $query->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        echo json_encode([
            'logged_in' => true,
            'username' => $user['username'],
            'email' => $user['email'],
            'created_at' => $user['created_at']
        ]);
    } else {
        echo json_encode(['logged_in' => false]);
    }

    $query->close();
    $conn->close();
} else {
    echo json_encode(['logged_in' => false]);
}
?>
