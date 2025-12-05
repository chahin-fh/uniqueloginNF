<?php
header('Content-Type: application/json');
session_start();

// Database configuration
$servername = "localhost";
$db_username = "root";
$db_password = "";
$database = "login_system";

// Create connection
$conn = new mysqli($servername, $db_username, $db_password, $database);

// Check connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]);
    exit();
}

// Check if request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
    exit();
}

// Get form data
$username = isset($_POST['username']) ? trim($_POST['username']) : '';
$password = isset($_POST['password']) ? $_POST['password'] : '';

// Validate inputs
if (empty($username)) {
    echo json_encode([
        'success' => false,
        'message' => 'Username is required'
    ]);
    exit();
}

if (empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Password is required'
    ]);
    exit();
}

// Find user by username only, then normalize and compare passwords
$find_user = $conn->prepare("SELECT id, username, email, password FROM users WHERE username = ?");
$find_user->bind_param("s", $username);
$find_user->execute();
$result = $find_user->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    $stored = $user['password'];
    $incoming = $password;

    if ($stored === $incoming) {
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'username' => $user['username']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid key file or password'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid key file or password'
    ]);
}

$find_user->close();
$conn->close();
?>
